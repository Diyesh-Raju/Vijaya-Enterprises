"use client";

/**
 * A scrubbable film held as still frames: downloaded whole, decoded off the
 * main thread, and kept ready to draw in a cache that knows how much memory it
 * may use. `ScrollHero` is the one caller; nothing here knows about scrolling.
 *
 * ── Why frames and not a `<video>` ───────────────────────────────────────
 *
 * Scrubbing a video asks its decoder for an arbitrary frame on every
 * animation frame. On a machine that decodes H.264 in hardware that is a few
 * milliseconds; on one that decodes it in software — a lot of Windows laptops,
 * and any browser that has been denied the GPU — it is two to five frames a
 * seek, and the walkthrough trails the wheel. The README in
 * `assets/video-source/` has the table.
 *
 * A frame that has already been decoded costs one `drawImage` to show, on any
 * machine. So the work is moved to where it can be scheduled: every frame is
 * downloaded before the scrub starts, decoded in workers ahead of where the
 * reader is heading, and drawn the moment it is wanted. What cannot be done
 * in time is skipped rather than waited for — the canvas shows the nearest
 * frame it has, which at the speeds where that happens is not something an
 * eye can tell apart.
 *
 * ── Memory ───────────────────────────────────────────────────────────────
 *
 * The downloads are small (the whole of the smallest set is about 15 MB) and
 * are all held. The decoded frames are not: a decoded 1920×1080 frame is
 * 8 MB whatever the file was, so 169 of them would be 1.4 GB. Decoded frames
 * live in a cache with a byte budget (`budgetBytes`), and the caller says, on
 * every change, which frames it wants — the ones on screen, the ones the
 * glide is about to pass through, and a few either side of where it will
 * settle. Those are pinned; everything else is evicted oldest first once the
 * budget is reached, and its bitmap is closed so the memory goes back at once
 * rather than whenever the collector gets to it.
 *
 * ── Decoding ─────────────────────────────────────────────────────────────
 *
 * In dedicated workers, one `createImageBitmap` per frame, the bitmap handed
 * back to the page without a copy. Chrome and Firefox decode a blob off the
 * main thread even when asked from it, but Safari does not promise to, and a
 * worker makes the number of decodes running at once something this file
 * decides. The worker is built from a string rather than a module so no
 * bundler has to understand it; the site's CSP already allows `blob:` workers.
 * Where a worker cannot be started at all, the same calls are made from the
 * page, and where `createImageBitmap` itself is missing, an `<img>` is
 * decoded instead — slower, and still correct.
 */

/** One set of frames: the same film at one size. */
export type FrameSetSpec = {
  readonly width: number;
  readonly height: number;
  /** Where frame `index` of this set is served. */
  readonly url: (index: number) => string;
};

/** A decoded frame, ready for `drawImage`. */
export type DrawableFrame = {
  readonly set: number;
  readonly index: number;
  readonly image: CanvasImageSource;
  readonly width: number;
  readonly height: number;
};

type Decoded = DrawableFrame & {
  readonly bytes: number;
  used: number;
  readonly release: () => void;
};

type DecodeOutcome = {
  image: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  release: () => void;
  ms: number;
};

type Decoder = {
  inFlight: number;
  /** Set once the decoder has failed in a way that will not get better. */
  broken: boolean;
  decode(blob: Blob): Promise<DecodeOutcome>;
  dispose(): void;
};

export type SetProgress = { settled: number; failed: number; total: number };

/**
 * How many times a frame that will not download is asked for again, and how
 * long one attempt may take. A request that simply never answers — a
 * connection that has gone quiet rather than failed — would otherwise hold
 * its place in the queue for good, and the load with it.
 */
const FETCH_RETRIES = 2;
const FETCH_RETRY_MS = 600;
const FETCH_TIMEOUT_MS = 20_000;

/** Frame keys pack the set above the index; no set here has 4096 frames. */
const INDEX_BITS = 4096;
const keyOf = (set: number, index: number) => set * INDEX_BITS + index;
const setOfKey = (key: number) => Math.floor(key / INDEX_BITS);
const indexOfKey = (key: number) => key % INDEX_BITS;

const bytesOf = (spec: FrameSetSpec) => spec.width * spec.height * 4;

/**
 * Every frame downloaded in this tab, by URL, kept for as long as the tab is.
 *
 * A reader who leaves the home page by a link and comes back to it gets the
 * film at once, from here, rather than a second wait behind the loader while
 * the same files come back out of the HTTP cache. It holds the set in use
 * and nothing else: a set is taken out again when it is dropped, so the
 * smaller set does not linger once a larger one has taken over. That is
 * 15 MB to 60 MB of compressed frames, which the browser keeps in its blob
 * store rather than in the page's heap.
 */
const downloaded = new Map<string, Blob>();

/** Whether every frame of `spec` is already in hand this visit. */
export function isDownloaded(spec: FrameSetSpec, count: number) {
  for (let index = 0; index < count; index++) {
    if (!downloaded.has(spec.url(index))) return false;
  }
  return true;
}

/**
 * The worker. It does one thing: turn a blob into a bitmap and hand it back,
 * transferred. How long that took comes back with it — the page uses it to
 * judge how far ahead to ask for frames, and whether a set is affordable at
 * all (`FrameSequence.throughput`).
 */
const WORKER_SOURCE = `"use strict";
self.onmessage = function (event) {
  var id = event.data.id;
  var started = performance.now();
  createImageBitmap(event.data.blob).then(
    function (bitmap) {
      self.postMessage({ id: id, bitmap: bitmap, ms: performance.now() - started }, [bitmap]);
    },
    function (error) {
      self.postMessage({ id: id, error: String(error) });
    }
  );
};`;

type WorkerReply = { id: number; bitmap?: ImageBitmap; ms?: number; error?: string };

class WorkerDecoder implements Decoder {
  inFlight = 0;
  broken = false;
  private readonly worker: Worker;
  private nextId = 0;
  private readonly calls = new Map<
    number,
    { resolve: (outcome: DecodeOutcome) => void; reject: (error: Error) => void }
  >();

  constructor(url: string) {
    this.worker = new Worker(url);
    this.worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      const { id, bitmap, ms = 0, error } = event.data;
      const call = this.calls.get(id);
      if (!call) {
        bitmap?.close();
        return;
      }
      this.calls.delete(id);
      if (!bitmap) {
        call.reject(new Error(error ?? "decode failed"));
        return;
      }
      call.resolve({
        image: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
        ms,
      });
    };
    // A worker that fails to start — a policy that refuses `blob:` workers,
    // say — reports it here rather than by throwing. Everything it was asked
    // is failed, and the pool stops using it.
    this.worker.onerror = (event) => {
      event.preventDefault();
      this.broken = true;
      for (const call of this.calls.values()) call.reject(new Error("worker failed"));
      this.calls.clear();
    };
  }

  decode(blob: Blob) {
    if (this.broken) return Promise.reject(new Error("worker failed"));
    return new Promise<DecodeOutcome>((resolve, reject) => {
      const id = this.nextId++;
      this.calls.set(id, { resolve, reject });
      this.worker.postMessage({ id, blob });
    });
  }

  dispose() {
    this.worker.terminate();
    for (const call of this.calls.values()) call.reject(new Error("disposed"));
    this.calls.clear();
  }
}

/** The same work on the page's own thread, for when no worker will start. */
class PageDecoder implements Decoder {
  inFlight = 0;
  broken = false;

  async decode(blob: Blob): Promise<DecodeOutcome> {
    const started = performance.now();
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(blob);
      return {
        image: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
        ms: performance.now() - started,
      };
    }
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    try {
      await image.decode();
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
    return {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => {
        URL.revokeObjectURL(url);
        image.removeAttribute("src");
      },
      ms: performance.now() - started,
    };
  }

  dispose() {}
}

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

async function fetchBlob(url: string, signal: AbortSignal, priority: "high" | "low") {
  for (let attempt = 0; ; attempt++) {
    // One attempt's own signal: aborted by the caller's, or by the clock.
    const attemptController = new AbortController();
    const abort = () => attemptController.abort(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    const timer = window.setTimeout(() => attemptController.abort(), FETCH_TIMEOUT_MS);
    try {
      // `priority` is Chrome's; everywhere else it is ignored.
      const response = await fetch(url, {
        signal: attemptController.signal,
        priority,
      } as RequestInit);
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return await response.blob();
    } catch (error) {
      if (signal.aborted || attempt >= FETCH_RETRIES) throw error;
      await pause(FETCH_RETRY_MS * (attempt + 1), signal);
    } finally {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", abort);
    }
  }
}

/**
 * One step of a critically damped spring: `state` moved towards `to` over
 * `dt` seconds, exactly — the closed form, so the step is the same whether it
 * is one long frame or several short ones. `rate` is the spring's natural
 * frequency, in radians a second.
 *
 * Critically damped is the fastest a spring can arrive without overshooting,
 * and unlike a plain exponential ease it never changes speed abruptly: a
 * new target changes where the value is *heading*, and its speed follows
 * smoothly from what it was. That is the difference between a wheel notch
 * that kicks the picture and one it glides into.
 */
export function springStep(
  state: { x: number; v: number },
  to: number,
  rate: number,
  dt: number,
) {
  const offset = state.x - to;
  const decay = Math.exp(-rate * dt);
  const push = state.v + rate * offset;
  state.x = to + (offset + push * dt) * decay;
  state.v = (state.v - rate * push * dt) * decay;
}

/**
 * The positions a value on that spring passes through, one per display
 * frame — the same integration `ScrollHero` runs, played forward from where
 * the value is and how fast it is going.
 *
 * The target itself may be moving: `drift` (units a second) carries it on
 * from `to`, up to `reach` away, which is what a steady scroll does — the
 * picture chases a target that keeps going. Stops once the value has all but
 * arrived where the target ends up, or after `steps`.
 */
export function glidePath({
  from,
  speed = 0,
  to,
  rate,
  hz,
  steps,
  drift = 0,
  reach = 0,
}: {
  from: number;
  speed?: number;
  to: number;
  rate: number;
  hz: number;
  steps: number;
  drift?: number;
  reach?: number;
}) {
  const out: number[] = [];
  const end = to + Math.max(-reach, Math.min(reach, drift * (steps / hz)));
  const state = { x: from, v: speed };
  for (let i = 1; i <= steps; i++) {
    if (Math.abs(end - state.x) < 0.5 && Math.abs(state.v) < hz * 0.05) break;
    const target = to + Math.max(-reach, Math.min(reach, drift * (i / hz)));
    springStep(state, target, rate, 1 / hz);
    out.push(state.x);
  }
  return out;
}

export class FrameSequence {
  readonly count: number;
  readonly sets: readonly FrameSetSpec[];
  private budgetBytes: number;
  /** A running mean of how long one decode takes here, in ms. */
  decodeMs = 16;
  /**
   * A running mean of how long a frame takes from being handed to a decoder
   * to being ready to draw, in ms — the decode, plus any wait for the
   * decoder's thread, plus the trip back. This, not `decodeMs`, is how far
   * ahead of the picture a frame has to be asked for.
   */
  latencyMs = 20;
  /** Told whenever a frame finishes decoding. */
  onFrame: ((frame: DrawableFrame) => void) | null = null;

  private readonly blobs: (Blob | null | undefined)[][];
  private readonly progress: SetProgress[];
  private readonly controllers: AbortController[];
  private readonly cache = new Map<number, Decoded>();
  private bytes = 0;
  private clock = 0;
  private readonly decoders: Decoder[] = [];
  private readonly perDecoder: number;
  private readonly inFlight = new Set<number>();
  private queue: number[] = [];
  private pinned = new Set<number>();
  private workerUrl: string | null = null;
  private disposed = false;

  constructor({
    sets,
    count,
    budgetBytes,
    decoders,
  }: {
    sets: readonly FrameSetSpec[];
    count: number;
    budgetBytes: number;
    decoders: number;
  }) {
    this.sets = sets;
    this.count = count;
    this.budgetBytes = budgetBytes;
    this.blobs = sets.map(() => new Array(count));
    this.progress = sets.map(() => ({ settled: 0, failed: 0, total: count }));
    this.controllers = sets.map(() => new AbortController());
    // Two at a time per worker: a browser decodes a blob on a thread pool of
    // its own, so a worker waiting on one decode can usefully start another,
    // and two is still few enough that nothing queues up behind stale asks.
    this.perDecoder = 2;

    try {
      if (typeof Worker === "undefined" || typeof createImageBitmap !== "function") {
        throw new Error("no worker decoding here");
      }
      this.workerUrl = URL.createObjectURL(
        new Blob([WORKER_SOURCE], { type: "text/javascript" }),
      );
      for (let i = 0; i < decoders; i++) this.decoders.push(new WorkerDecoder(this.workerUrl));
    } catch {
      this.decoders.length = 0;
      this.decoders.push(new PageDecoder());
    }
  }

  /**
   * The byte budget for decoded frames. The page raises it for a set whose
   * frames are large (4K) and lowers it again when the set goes; lowering it
   * evicts at once.
   */
  get budget() {
    return this.budgetBytes;
  }

  set budget(bytes: number) {
    this.budgetBytes = bytes;
    this.evict();
  }

  /** How much memory one decoded frame of `set` takes. */
  frameBytes(set: number) {
    return bytesOf(this.sets[set]);
  }

  /**
   * Roughly how many frames a second the decoders can turn out, from the
   * running decode time. Every in-flight slot is counted, then discounted by
   * two fifths: a browser runs the decodes on a thread pool of its own that
   * is usually smaller than the number of slots. A planning figure, not a
   * measurement — `throughput` is the measurement.
   */
  capacity() {
    const live = this.decoders.filter((d) => !d.broken).length;
    return (live * this.perDecoder * 1000 * 0.6) / Math.max(1, this.decodeMs);
  }

  progressOf(set: number): SetProgress {
    return this.progress[set];
  }

  /** Whether every frame of `set` has arrived. */
  complete(set: number) {
    const p = this.progress[set];
    return p.settled === p.total && p.failed === 0;
  }

  /**
   * Download frames `from`–`to` of `set`, in order, `concurrency` at a time.
   * Frames already in hand are skipped. A frame that still fails after its
   * retries is recorded as failed rather than failing the whole load: the
   * caller decides what a missing frame is worth, and the canvas draws its
   * neighbour in the meantime.
   */
  async load(
    set: number,
    {
      from = 0,
      to = this.count,
      concurrency,
      priority,
      onSettle,
    }: {
      from?: number;
      to?: number;
      concurrency: number;
      priority: "high" | "low";
      onSettle?: () => void;
    },
  ) {
    const { signal } = this.controllers[set];
    const blobs = this.blobs[set];
    const progress = this.progress[set];
    let next = from;

    const runner = async () => {
      while (next < to && !signal.aborted && !this.disposed) {
        const index = next++;
        if (blobs[index] !== undefined) continue;
        const url = this.sets[set].url(index);
        try {
          const blob = downloaded.get(url) ?? (await fetchBlob(url, signal, priority));
          if (signal.aborted || this.disposed) return;
          blobs[index] = blob;
          downloaded.set(url, blob);
        } catch {
          if (signal.aborted || this.disposed) return;
          blobs[index] = null;
          progress.failed++;
        }
        progress.settled++;
        // A frame the canvas is already waiting on goes straight to a
        // decoder rather than waiting for the next change of plan.
        const key = keyOf(set, index);
        if (blobs[index] && this.pinned.has(key)) {
          this.queue.unshift(key);
          this.pump();
        }
        onSettle?.();
      }
    };

    await Promise.all(Array.from({ length: concurrency }, runner));
    return progress;
  }

  /** The decoded frame, if it is in the cache. Counts as a use. */
  get(set: number, index: number): DrawableFrame | undefined {
    const entry = this.cache.get(keyOf(set, index));
    if (entry) entry.used = ++this.clock;
    return entry;
  }

  has(set: number, index: number) {
    return this.cache.has(keyOf(set, index));
  }

  /**
   * The decoded frame closest to `position`, preferring `set` and falling back
   * to any other set with the same frame. Only reached when the frame wanted
   * is not ready, so the walk is cheap in practice.
   */
  nearest(set: number, position: number): DrawableFrame | undefined {
    const centre = Math.min(this.count - 1, Math.max(0, Math.round(position)));
    for (let d = 0; d < this.count; d++) {
      const below = this.anyAt(set, centre - d);
      if (below) return below;
      if (d === 0) continue;
      const above = this.anyAt(set, centre + d);
      if (above) return above;
    }
    return undefined;
  }

  private anyAt(set: number, index: number) {
    if (index < 0 || index >= this.count) return undefined;
    const own = this.get(set, index);
    if (own) return own;
    for (let other = 0; other < this.sets.length; other++) {
      if (other === set) continue;
      const found = this.get(other, index);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * The frames wanted now, most urgent first, as `[set, index]` pairs. Replaces
   * whatever was wanted before. They are pinned against eviction — as many as
   * fit inside the budget, in the order given — and the ones not yet decoded
   * are queued for the next free decoder.
   *
   * `keep` is pinned ahead of all of them and queued only if nothing else is:
   * the frames on screen, which must never be evicted from under the canvas,
   * but which a fast scrub has already moved past by the time a decode of
   * them could land.
   *
   * `hold` is pinned after them, if there is room, and never queued: frames
   * worth keeping if they are already decoded, but not worth a decoder's
   * time. A fast glide asks for every second frame or so along its path, and
   * which ones shifts by a frame from one display frame to the next; without
   * this, the frames it asked for a moment ago lose their pin, are evicted,
   * and have to be decoded again just as they are needed.
   */
  want(
    pairs: readonly (readonly [number, number])[],
    keep: readonly (readonly [number, number])[] = [],
    hold: readonly (readonly [number, number])[] = [],
  ) {
    const pinned = new Set<number>();
    const queue: number[] = [];
    const later: number[] = [];
    let room = this.budget * 0.9;
    const take = (list: readonly (readonly [number, number])[], into: number[]) => {
      for (const [set, index] of list) {
        if (index < 0 || index >= this.count) continue;
        const key = keyOf(set, index);
        if (pinned.has(key)) continue;
        const bytes = this.frameBytes(set);
        if (bytes > room) return;
        room -= bytes;
        pinned.add(key);
        if (!this.cache.has(key) && !this.inFlight.has(key) && this.blobs[set][index]) {
          into.push(key);
        }
      }
    };
    take(keep, later);
    take(pairs, queue);
    take(hold, []);
    this.pinned = pinned;
    this.queue = queue.concat(later);
    this.pump();
  }

  /**
   * How many frames of `set` a second this machine decodes, measured: a
   * couple of warm-up decodes, then `sample` frames pushed through every
   * decoder at once, timed from the first ask to the last answer. That is the
   * number that decides whether a set can keep up with a scrub, and it
   * includes whatever this machine's cores and thread pools make of running
   * the decodes side by side, which no single timing would.
   */
  async throughput(set: number, indices: readonly number[], warmup = 2) {
    const blobs = indices.map((i) => this.blobs[set][i]).filter((b): b is Blob => !!b);
    if (blobs.length <= warmup) return 0;
    const live = this.decoders.filter((d) => !d.broken);
    if (live.length === 0) return 0;

    const run = async (decoder: Decoder, blob: Blob) => {
      const outcome = await decoder.decode(blob);
      outcome.release();
    };

    try {
      for (let i = 0; i < warmup; i++) await run(live[i % live.length], blobs[i]);
      const timed = blobs.slice(warmup);
      let next = 0;
      const started = performance.now();
      await Promise.all(
        live.map(async (decoder) => {
          while (next < timed.length && !this.disposed) await run(decoder, timed[next++]);
        }),
      );
      const seconds = (performance.now() - started) / 1000;
      return seconds > 0 ? timed.length / seconds : 0;
    } catch {
      return 0;
    }
  }

  /** Forget a set: its downloads stop, and its frames are released — here and in `downloaded`. */
  drop(set: number) {
    this.controllers[set].abort();
    this.blobs[set].fill(undefined);
    for (let index = 0; index < this.count; index++) downloaded.delete(this.sets[set].url(index));
    for (const [key, entry] of this.cache) {
      if (setOfKey(key) === set) this.remove(key, entry);
    }
    this.queue = this.queue.filter((key) => setOfKey(key) !== set);
    for (const key of [...this.pinned]) if (setOfKey(key) === set) this.pinned.delete(key);
  }

  dispose() {
    this.disposed = true;
    for (const controller of this.controllers) controller.abort();
    for (const [key, entry] of this.cache) this.remove(key, entry);
    for (const decoder of this.decoders) decoder.dispose();
    this.decoders.length = 0;
    if (this.workerUrl) URL.revokeObjectURL(this.workerUrl);
    this.workerUrl = null;
    this.onFrame = null;
    this.queue = [];
    this.pinned.clear();
  }

  private decoder() {
    let best: Decoder | null = null;
    for (const decoder of this.decoders) {
      if (decoder.broken || decoder.inFlight >= this.perDecoder) continue;
      if (!best || decoder.inFlight < best.inFlight) best = decoder;
    }
    // Every worker has failed: carry on in the page rather than stop.
    if (!best && this.decoders.every((d) => d.broken)) {
      for (const decoder of this.decoders) decoder.dispose();
      this.decoders.length = 0;
      best = new PageDecoder();
      this.decoders.push(best);
    }
    return best;
  }

  private pump() {
    while (this.queue.length && !this.disposed) {
      const decoder = this.decoder();
      if (!decoder) return;
      const key = this.queue.shift()!;
      if (this.cache.has(key) || this.inFlight.has(key)) continue;
      const set = setOfKey(key);
      const index = indexOfKey(key);
      const blob = this.blobs[set][index];
      if (!blob) continue;

      this.inFlight.add(key);
      decoder.inFlight++;
      const sent = performance.now();
      decoder
        .decode(blob)
        .then(
          (outcome) => {
            this.latencyMs += (performance.now() - sent - this.latencyMs) * 0.2;
            this.accept(set, index, outcome);
          },
          () => {
            // A worker that broke mid-decode leaves the frame undecoded, not
            // lost: it goes back in the queue for a decoder that works. A
            // frame that failed in a healthy decoder is corrupt, and asking
            // again would only fail again — its neighbours stand in for it.
            if (decoder.broken && this.pinned.has(key)) this.queue.push(key);
          },
        )
        .finally(() => {
          decoder.inFlight--;
          this.inFlight.delete(key);
          this.pump();
        });
    }
  }

  private accept(set: number, index: number, outcome: DecodeOutcome) {
    // The set was dropped, or everything was, while this was decoding.
    if (this.disposed || !this.blobs[set][index]) {
      outcome.release();
      return;
    }
    this.decodeMs += (outcome.ms - this.decodeMs) * 0.2;
    const key = keyOf(set, index);
    const previous = this.cache.get(key);
    if (previous) this.remove(key, previous);

    const entry: Decoded = {
      set,
      index,
      image: outcome.image,
      width: outcome.width,
      height: outcome.height,
      bytes: outcome.width * outcome.height * 4,
      used: ++this.clock,
      release: outcome.release,
    };
    this.cache.set(key, entry);
    this.bytes += entry.bytes;
    this.evict();
    if (this.cache.has(key)) this.onFrame?.(entry);
  }

  private evict() {
    if (this.bytes <= this.budget) return;
    const victims = [...this.cache.entries()]
      .filter(([key]) => !this.pinned.has(key))
      .sort((a, b) => a[1].used - b[1].used);
    for (const [key, entry] of victims) {
      if (this.bytes <= this.budget) break;
      this.remove(key, entry);
    }
  }

  private remove(key: number, entry: Decoded) {
    this.cache.delete(key);
    this.bytes -= entry.bytes;
    entry.release();
  }
}
