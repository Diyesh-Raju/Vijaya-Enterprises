"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { onScroll } from "@/lib/scroll";
import { onLanguageChange, translateString } from "@/lib/language";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { img, alt, video } from "@/lib/images";

/**
 * Screens of scroll the walkthrough plays over. Set by the pace, not picked:
 * 2.35 screens for a 6.97s clip is about three seconds of film a screen,
 * which is what the long cut ran at — 10.47s over three and a half. Given the
 * long cut's three and a half, this clip ran at two seconds a screen and
 * dragged.
 */
const SCRUB_SCREENS = 2.35;

/**
 * Screens of scroll the close takes once the film has stopped: the picture
 * softening, the lockup and the line arriving, then a hold on the finished
 * card. Counted separately so it keeps its length whatever the clip's.
 */
const CLOSE_SCREENS = 1.5;

/** Viewport heights the whole hero occupies, counting the one it starts on. */
const TRACK_SCREENS = 1 + SCRUB_SCREENS + CLOSE_SCREENS;

/** A point `screens` of scroll into the track, as a fraction of its travel. */
const at = (screens: number) => screens / (SCRUB_SCREENS + CLOSE_SCREENS);

/**
 * Where the clip reaches its last frame. Everything after this point happens
 * to a still — the walkthrough plays out in full first, and only then does
 * the picture soften and the lockup arrive. Nothing overlaps the film.
 */
const CLIP_END = at(SCRUB_SCREENS);

/**
 * The close, in screens past `CLIP_END`. The picture goes soft and shade
 * pools under the middle of it, then the lockup rises into that, then the
 * line beneath. Each finishes before the track does, so the hero holds the
 * finished card for a quarter of a screen rather than completing on the last
 * pixel before it unpins.
 */
const POOL_START = CLIP_END;
const LOGO_START = at(SCRUB_SCREENS + 0.3);
const FINALE_END = at(SCRUB_SCREENS + 1);
const TAG_START = at(SCRUB_SCREENS + 0.65);
const TAG_END = at(SCRUB_SCREENS + 1.25);

/**
 * The loading cue at the foot of the film stays for most of the walkthrough
 * and gives way near its end — gone before the lockup starts to rise, so the
 * two are never on the screen together.
 */
const CUE_FADE_START = at(SCRUB_SCREENS - 0.6);
const CUE_FADE_END = at(SCRUB_SCREENS + 0.1);

/**
 * How fast the played position converges on the scroll position, per second.
 * 6 is a time constant of about 170ms: quick enough to feel attached to the
 * wheel, slow enough to carry through a flick instead of snapping.
 */
const EASE_RATE = 6;

/** Under a frame at 60fps: closer than this and a seek is pointless. */
const SEEK_EPSILON = 0.01;

/** One frame of the clip. Every file in the ladder is 60fps. */
const FRAME_S = 1 / 60;

/**
 * A seek still outstanding after this long gets nudged; after twice it, the
 * decoder is treated as gone. Generous on purpose: seeking is held inside the
 * buffer, so a slow one means a struggling machine, not a wedged one, and
 * reloading under a machine that is merely slow would make things worse.
 */
const SEEK_TIMEOUT_MS = 1500;

/** Floor between reload attempts, so a genuinely broken file cannot spin. */
const RECOVER_COOLDOWN_MS = 5000;

/** `HTMLMediaElement.HAVE_CURRENT_DATA` — there is a frame to draw. */
const HAVE_CURRENT_DATA = 2;

/**
 * The ladder of encodes the hero climbs, smallest first. Same master, same
 * duration, same frame rate; only the pixels differ. `lib/images.ts` says
 * where each lives and `assets/video-source/README.md` how each is built.
 *
 *  - `bridge` (1280×720, ~9MB) is what the reader scrubs first. It is the
 *    whole reason the ladder exists: the 3200×1800 file is 34MB, and a
 *    visitor on an ordinary connection was looking at a still poster and a
 *    percentage for ten, twenty, forty seconds before anything moved — a
 *    "freeze" before the film had even started. The bridge is on screen in
 *    a few seconds and the upgrades happen behind it.
 *  - `mid` (1920×1080) is the ceiling for a machine decoding in software.
 *    Timed on this site's own files, a software decoder lands a 1080p seek
 *    inside a frame and a 3200×1800 one two to nine frames late; the README
 *    has the table. Sharp enough to pass for the real thing on a laptop.
 *  - `hq` (3200×1800) is for hardware decoders, which is most laptops, and
 *    is what the previous hero always played, for everyone, from the start.
 *
 * Which of the last two a machine gets is decided twice: once by asking
 * the browser (`MediaCapabilities`, see `climbOrder`), and then by trying —
 * the candidate is fetched, attached out of sight, and timed on sixteen
 * seeks before it is allowed on screen. A machine that cannot land those
 * inside a frame never sees the file. That second check is what turns
 * "smooth on most machines" into "never lags on any": the browser's answer
 * is a prediction, the probe is a measurement.
 */
const TIERS = {
  bridge: { src: video.homeScrollTiers.bridge, rank: 0, width: 1280 },
  mid: { src: video.homeScrollTiers.mid, rank: 1, width: 1920 },
  hq: { src: video.homeScrollTiers.hq, rank: 2, width: 3200 },
} as const;
type Tier = (typeof TIERS)[keyof typeof TIERS];

/**
 * A file is only worth climbing to if the screen can show its pixels. The
 * panel is drawn `object-cover` at the window's width, so what it needs
 * from a source is about its width in device pixels, and a little over for
 * the few percent the cover crop trims.
 *
 * "Can show" is read generously, on purpose. A source with more pixels
 * than the screen is not wasted the moment it exceeds the screen: scaled
 * down, its compression artefacts shrink with it, and a 3200 file on a
 * 1650-wide 1× laptop is visibly cleaner on the railings than the 1920 one
 * even though both are sharper than the panel. So a tier is only treated
 * as the ceiling once it carries a third again more pixels than the screen
 * — past that the next file up is a 34MB download for nothing. In practice
 * that stops the climb on 1× laptops up to about 1280 wide and lets every
 * larger or denser screen have the best file the machine can seek.
 */
const DISPLAY_MARGIN = 1.05;
const OVERSAMPLE = 1.35;

/**
 * The top tier, described for `MediaCapabilities.decodingInfo`. `avc1.640034`
 * is High profile, level 5.2, which is what the file is. `powerEfficient` is
 * the browser's word for a hardware decoder — Chrome, Safari and Firefox all
 * answer it — and it is the difference between a seek that costs eight
 * milliseconds and one that costs thirty.
 */
const HQ_DECODING: MediaDecodingConfiguration = {
  type: "file",
  video: {
    contentType: 'video/mp4; codecs="avc1.640034"',
    width: 3200,
    height: 1800,
    bitrate: 40_000_000,
    framerate: 60,
  },
};

/**
 * The probe: how many seeks a candidate is timed on before it may be shown,
 * and what it has to manage. Sixteen is enough for a median that means
 * something and costs under half a second on any machine that will pass.
 *
 * The bar is a 60fps frame. The scrub issues one seek an animation frame; a
 * file whose seeks take longer than a frame presents a new picture every
 * second frame at best, and that is what the reader calls lag — the README
 * records a 19.6ms median as "visibly lagged the wheel". The median has to
 * land inside 16.7ms, and the odd slow one inside two frames.
 *
 * The probe reads a little high: a seek on an element that is not yet
 * shown lands later than the same seek once it is, by about half again
 * (13.5ms against 8.7 for the 3200 file on the machine this was built on).
 * The bar is left where it is regardless — a file that only just passes a
 * pessimistic probe scrubs comfortably, and a machine that misses it gets
 * the next file down, which is still sharper than most screens.
 */
const PROBE_P50_MS = 16;
const PROBE_P95_MS = 33;

/**
 * The probe's route through the clip, in frames from wherever it starts:
 * mostly the small steps forward and back that a scrub makes, and two jumps
 * of the size a flick makes. Sixteen cold jumps to random places would
 * measure a decoder restarting sixteen times, which is not what the reader
 * does — timed both ways on the 3200 file, random seeks cost half again what
 * a scrub's do. Every landing is pushed onto an odd frame, off the keyframe,
 * so the probe never scores the easy case. The first two are a warm-up and
 * are not scored: the first seeks on a freshly attached element carry the
 * decoder's start-up, which the reader pays once and never again.
 */
const PROBE_STEPS = [3, 3, 3, 3, 3, -3, 5, 3, 121, 3, 3, -3, 3, -201, 3, 3, 5, 3];
const PROBE_WARMUP = 2;

/**
 * The probe waits for the reader to be still. A candidate probed *while*
 * the film on screen is being scrubbed is timed against a decoder that is
 * busy with the other file, and reads slow for it: on the machine this was
 * built on, the 3200 file measures 12ms idle and 16ms under a hard scrub —
 * which is the difference between passing and being thrown away. So the
 * probe holds until nothing has moved for a third of a second, and a
 * candidate that still fails is given two more goes, a couple of seconds
 * apart, before it is dropped: what it is measuring is the machine, and a
 * machine does not get slower for being asked again — but the moment it
 * was asked can be a bad one.
 */
const PROBE_IDLE_MS = 300;
const PROBE_ATTEMPTS = 3;
const PROBE_RETRY_MS = 2000;

/**
 * How long a candidate that has passed its probe is given to land on the
 * same frame as the file it is replacing before the swap is called off. It
 * is chasing the same target every frame with a decoder just proven fast
 * enough, and lands within a few frames even under a hard scrub — see
 * `promote`, and the order of things in `tick` — so this is only ever
 * reached by something going wrong. Generous, because what it costs to
 * give up is a download the reader has already paid for.
 */
const PROMOTE_TIMEOUT_MS = 8000;

/**
 * When the walkthrough runs at all: a laptop-shaped window, not merely a
 * wide one. The height is what keeps a phone turned on its side — 932
 * pixels across and 430 down — from being handed a five-screen scrubbed
 * video. Same string as `HomeHeroPhone` and the same pair of dimensions as
 * the `desk:` variant in `globals.css`; all three have to agree.
 */
const WIDE_QUERY = "(min-width: 48rem) and (min-height: 500px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getWidth = () =>
  window.matchMedia(WIDE_QUERY).matches ? ("wide" as const) : ("phone" as const);

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/**
 * 0 before `from`, 1 after `to`, easing out in between — quick off the mark
 * and settling into place, rather than symmetric. The close reads as arriving
 * rather than sliding.
 */
const ramp = (value: number, from: number, to: number) => {
  const t = clamp01((value - from) / (to - from));
  return 1 - (1 - t) * (1 - t);
};

/**
 * The two places a clip can be mounted. One is on screen; the other is where
 * the next file up the ladder is brought up behind it, and the two swap
 * roles on promotion — so a slot is a fixture, and which file it holds
 * changes. See `roles`.
 */
type Slot = "a" | "b";

/**
 * Read a file in whole and hand back a blob URL for it.
 *
 * Left to itself, a `<video>` fetches what it needs as it goes, and a reader
 * who scrolls ahead of the download is asking for frames that are not there
 * yet — the walkthrough holds whatever it last drew until the range request
 * comes back. Reading all of it first makes every seek after that a seek
 * into memory.
 *
 * `fetch`, so the count comes off the stream as it arrives and a repeat
 * visit is answered from the HTTP cache, counting to a hundred at once.
 * `onProgress` is only wired for the bridge — it is the one file the reader
 * is shown waiting for.
 */
async function readIn(
  src: string,
  signal: AbortSignal,
  onProgress?: (percent: number | null) => void,
): Promise<string> {
  const response = await fetch(src, { signal });
  if (!response.ok || !response.body) throw new Error(response.statusText);
  const total = Number(response.headers.get("content-length")) || 0;
  if (!total) onProgress?.(null);

  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    // Held at 99 until the stream actually ends: a server compressing on
    // the way out reports the smaller size, and the count would overrun.
    // Same-number updates are dropped by React, so this is a hundred
    // renders at most, not one per chunk.
    if (total) onProgress?.(Math.min(99, Math.floor((received / total) * 100)));
  }
  return URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
}

/**
 * One timed seek: how long from asking to `seeked`. A seek that never lands
 * is scored as the timeout rather than waited on for ever, which is the
 * right answer for a probe — a file that can hang a seek has failed it.
 */
function timedSeek(el: HTMLVideoElement, to: number, timeoutMs: number) {
  return new Promise<number>((resolve) => {
    const started = performance.now();
    let timer = 0;
    const done = () => {
      window.clearTimeout(timer);
      el.removeEventListener("seeked", done);
      resolve(performance.now() - started);
    };
    timer = window.setTimeout(done, timeoutMs);
    el.addEventListener("seeked", done);
    el.currentTime = to;
  });
}

/**
 * The home page hero: one walkthrough — the towers from the air, in through
 * a window to the living room — with the scroll wheel as its transport
 * control, closing on the lockup. It fills the screen and runs up behind the
 * bar, which is transparent over it for as long as the film is pinned.
 * Nothing is laid over the film but a shade across its top for the bar's
 * white to hold on, and no grade sits on it.
 *
 * The section is a tall *track*; the panel inside it is `sticky`, so it pins
 * to the viewport while the track scrolls past underneath. How far the track
 * has travelled is the clip's `currentTime`, so scrolling down runs the
 * walkthrough forward and scrolling back up runs it in reverse, identically.
 *
 * Everything below is about it never getting stuck, on any machine:
 *
 *   • Every file carries a keyframe every second frame and no B-frames, so
 *     seeking to an arbitrary time decodes one frame, or two.
 *     `assets/video-source/README.md` covers how they are built, and why a
 *     wider interval was tried and lagged.
 *   • The reader is given a small file first and a large one later — the
 *     ladder above `TIERS`. Nothing waits on a 34MB download before the
 *     film will move, and no machine is shown a file it cannot seek inside
 *     a frame, because each step up is timed before it is taken.
 *   • Stepping up never blinks. The next file is brought up in a second
 *     element behind the first, both are driven to the same frame, and the
 *     two swap opacity in the same animation frame — the picture on screen
 *     does not change at the moment of the swap, only its sharpness after.
 *   • The position is read inside the animation frame rather than from scroll
 *     events, so nothing depends on how a browser batches or throttles those.
 *   • Convergence is integrated over elapsed *time*, so a 120Hz display and a
 *     60Hz one behave the same, and a loop resuming after a gap eases in
 *     rather than lurching.
 *   • A seek is only issued when the element is not already seeking, and only
 *     when it is measurably away from where it should be — measured against
 *     the element's own `currentTime`, never against what we last asked for.
 *     A request that the browser quietly dropped is therefore reissued on the
 *     next frame instead of being remembered as done.
 *   • Coming back from a background tab, another app, or the bfcache, the
 *     decoder may have been torn down while we were away. The element is
 *     checked on every such wake and reloaded if it has nothing to draw.
 *   • Nothing here opts a visitor out of the clip — no Data Saver check, no
 *     `prefers-reduced-motion` check. Those quietly turned the hero into a
 *     still photograph on the machines that set them, which reads as a bug;
 *     and not a frame of this moves that the reader did not scroll themselves.
 *
 * The close cross-fades to a pre-blurred still of the last frame rather than
 * running a CSS `filter: blur()` over live video. A full-screen blur on a
 * video layer is the most expensive thing this page could ask a GPU to do,
 * and the first thing to drop frames on an integrated graphics laptop. The
 * still is 33KB and costs nothing anywhere.
 */
export function ScrollHero() {
  const trackRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const softRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<HTMLHeadingElement | null>(null);
  const tagRef = useRef<HTMLParagraphElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);

  /** The two slots' elements. Null until that slot has a file. */
  const elA = useRef<HTMLVideoElement | null>(null);
  const elB = useRef<HTMLVideoElement | null>(null);
  /** What each slot is holding, by file URL — the fallback needs to know. */
  const tierOf = useRef<Record<Slot, string | null>>({ a: null, b: null });
  /**
   * Which slot is on screen and which is being brought up behind it. Kept
   * in a ref rather than state because the animation loop reads it every
   * frame and the swap happens inside that loop, on the frame both files
   * land on the same picture.
   */
  const roles = useRef<{ active: Slot | null; pending: Slot | null; pendingSince: number }>({
    active: null,
    pending: null,
    pendingSince: 0,
  });
  /**
   * The ladder's promises, resolved from event handlers and the loop: a slot
   * reaching `canplay`, a slot failing outright, and a promotion landing or
   * being given up on.
   */
  const waiting = useRef<{
    canplay: Partial<Record<Slot, () => void>>;
    failed: Partial<Record<Slot, () => void>>;
    promoted: (() => void) | null;
    abandoned: (() => void) | null;
  }>({ canplay: {}, failed: {}, promoted: null, abandoned: null });
  const primed = useRef<Record<Slot, boolean>>({ a: false, b: false });
  /** Whether the hero is currently culled — applied to a slot the moment it mounts. */
  const culled = useRef(false);
  /**
   * When the scroll position last moved, as the loop saw it. The probe
   * reads this to wait for a still moment; a loop that has stopped because
   * the hero is off screen leaves it old, which counts as still.
   */
  const lastMoveAt = useRef(0);

  /** Each slot's file, as the element's `src`. A blob URL, or the file's own URL when streaming it. */
  const [srcA, setSrcA] = useState<string | null>(null);
  const [srcB, setSrcB] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  /** How much of the bridge has arrived, 0–100; `null` if the server never said how big it is. */
  const [percent, setPercent] = useState<number | null>(0);

  // `"ssr"` until mounted: the video is never rendered on the server, so a
  // phone never sees the desktop file in the markup.
  const width = useSyncExternalStore(
    subscribeToWidth,
    getWidth,
    () => "ssr" as const,
  );

  // The tall track is added after mount too. A visitor whose JavaScript never
  // arrives would otherwise get nearly four screens of dead scroll past a hero
  // that cannot move. It grows at hydration, below the fold, so nothing shifts.
  const mounted = width !== "ssr";
  /** The cue stops counting when there is a clip to scrub — or none coming. */
  const loaded = ready || failed;

  /**
   * The loading cue, in whichever language the site is being read in.
   *
   * It is composed here rather than swapped in the DOM because the counting
   * line is built from a number: "Loading 42%" is one text node, and a
   * dictionary keyed on rendered copy would need a hundred and one entries to
   * cover it. So the *pattern* is the entry — `Loading {percent}%` — and the
   * figure goes in afterwards, which also lets Kannada put the number where
   * Kannada puts it rather than where English does. The paragraph carries
   * `data-no-translate` so the walker leaves all three of these alone.
   *
   * Read through the store, like `ScrollLit`, so the server snapshot is the
   * English the server rendered and hydration cannot mismatch.
   */
  const cue = useSyncExternalStore(
    onLanguageChange,
    () =>
      loaded
        ? translateString("Scroll to Discover")
        : percent === null
          ? translateString("Loading")
          : translateString("Loading {percent}%").replace(
              "{percent}",
              String(percent),
            ),
    () =>
      loaded
        ? "Scroll to Discover"
        : percent === null
          ? "Loading"
          : `Loading ${percent}%`,
  );

  const elOf = (slot: Slot) => (slot === "a" ? elA : elB).current;
  const setSrcOf = (slot: Slot, src: string | null) =>
    (slot === "a" ? setSrcA : setSrcB)(src);

  /**
   * A slot has a frame to show. For the first file that means the hero is
   * live: it goes on screen and the poster fades. For a candidate it only
   * means the ladder may go on to the probe — showing it is the loop's call,
   * on the frame it lands. Either way, iOS gets the one play it needs to
   * paint a frame, once per element.
   */
  const reveal = (slot: Slot, el: HTMLVideoElement) => {
    if (roles.current.active === null) {
      roles.current.active = slot;
      el.style.opacity = "1";
      setReady(true);
    }
    if (!primed.current[slot]) {
      primed.current[slot] = true;
      void el
        .play()
        .then(() => el.pause())
        .catch(() => {});
    }
    const resolve = waiting.current.canplay[slot];
    if (resolve) {
      delete waiting.current.canplay[slot];
      resolve();
    }
  };

  /**
   * A slot the page refuses to play. A blob it will not play — a policy that
   * does not allow `blob:` media, say — is retried as the file's own URL,
   * streamed the old way. If that fails too, the first file gives the clip
   * up altogether and the hero is a poster; a candidate is simply dropped,
   * and the reader goes on with the file they already have.
   */
  const onSlotError = (slot: Slot, el: HTMLVideoElement) => {
    const tier = tierOf.current[slot];
    const src = el.getAttribute("src") ?? "";
    if (tier && src !== tier) {
      setSrcOf(slot, tier);
      return;
    }
    if (roles.current.active === null || roles.current.active === slot) {
      setFailed(true);
    }
    const reject = waiting.current.failed[slot];
    if (reject) {
      delete waiting.current.failed[slot];
      reject();
    }
  };

  /*
   * Climb the ladder: the bridge first, on screen as soon as it is in; then
   * whichever of the larger files this machine can afford, brought up behind
   * it and swapped in when it has proved itself.
   *
   * Only for the laptop hero — a phone unmounts this section, and must not
   * pay for a file it will never be shown.
   */
  useEffect(() => {
    if (width !== "wide") return;
    const controller = new AbortController();
    /** Every blob URL made here, so all are released whatever the path out. */
    const urls = new Set<string>();
    let cancelled = false;

    const read = async (tier: Tier, onProgress?: (p: number | null) => void) => {
      const url = await readIn(tier.src, controller.signal, onProgress);
      urls.add(url);
      return url;
    };

    /** Mount a file in a slot and wait until it has a frame to show. */
    const attach = (slot: Slot, tier: Tier, url: string) =>
      new Promise<HTMLVideoElement>((resolve, reject) => {
        waiting.current.canplay[slot] = () => {
          delete waiting.current.failed[slot];
          const el = elOf(slot);
          if (el) resolve(el);
          else reject(new Error("slot lost"));
        };
        waiting.current.failed[slot] = () => {
          delete waiting.current.canplay[slot];
          reject(new Error("slot failed"));
        };
        tierOf.current[slot] = tier.src;
        setSrcOf(slot, url);
      });

    /** Empty a slot and release what it held. */
    const release = (slot: Slot) => {
      const el = elOf(slot);
      const src = el?.getAttribute("src");
      tierOf.current[slot] = null;
      primed.current[slot] = false;
      delete waiting.current.canplay[slot];
      delete waiting.current.failed[slot];
      setSrcOf(slot, null);
      if (src && urls.has(src)) {
        urls.delete(src);
        URL.revokeObjectURL(src);
      }
    };

    /**
     * Time a candidate on seeks that land off-keyframe — odd frames, plus
     * half a frame so the target is never on a boundary — spread over the
     * clip. Its answer is whether this machine may be shown the file.
     */
    const pause = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

    /** Resolves once nothing has scrolled for `PROBE_IDLE_MS`. */
    const untilStill = async () => {
      while (!cancelled && performance.now() - lastMoveAt.current < PROBE_IDLE_MS) {
        await pause(100);
      }
    };

    const probeOnce = async (el: HTMLVideoElement) => {
      const frames = Math.floor(el.duration / FRAME_S);
      if (!frames) return false;
      const times: number[] = [];
      let frame = 61;
      for (const [i, step] of PROBE_STEPS.entries()) {
        frame = ((((frame + step) % frames) + frames) % frames) | 1;
        const to = Math.min(el.duration - 0.05, frame * FRAME_S + FRAME_S / 2);
        const ms = await timedSeek(el, to, SEEK_TIMEOUT_MS);
        if (cancelled) return false;
        if (i >= PROBE_WARMUP) times.push(ms);
      }
      times.sort((x, y) => x - y);
      const p50 = times[Math.floor(times.length / 2)];
      const p95 = times[Math.floor(times.length * 0.95)];
      return p50 <= PROBE_P50_MS && p95 <= PROBE_P95_MS;
    };

    /** The probe proper: at a still moment, up to `PROBE_ATTEMPTS` times. */
    const probe = async (el: HTMLVideoElement) => {
      for (let attempt = 0; attempt < PROBE_ATTEMPTS; attempt++) {
        if (attempt > 0) await pause(PROBE_RETRY_MS);
        await untilStill();
        if (cancelled) return false;
        if (await probeOnce(el)) return true;
      }
      return false;
    };

    /**
     * Which files to try after the bridge, in order.
     *
     * First the screen: a tier already carrying a third more pixels across
     * than the panel needs is the ceiling, and nothing above it is worth
     * the download or the slower seek — see `OVERSAMPLE`. Then the browser
     * is asked whether it decodes the top tier in hardware:
     *
     *  - yes: try the top; if the probe disagrees, settle for the middle.
     *  - no: the middle, and stop there — a software decoder was never going
     *    to seek 3200×1800 inside a frame, and 34MB is a lot to download to
     *    confirm it.
     *  - no answer (an old browser): the middle, and then the top only if
     *    the middle passed.
     *
     * The rule that walks it: after a failure only step *down*, after a
     * success only step *up*. See `run`.
     */
    const climbOrder = async (): Promise<Tier[]> => {
      const panel = mediaRef.current?.clientWidth || window.innerWidth;
      const needed = panel * (window.devicePixelRatio || 1) * DISPLAY_MARGIN;
      const ceiling = (tier: Tier) => tier.width >= needed * OVERSAMPLE;
      if (ceiling(TIERS.bridge)) return [];
      if (ceiling(TIERS.mid)) return [TIERS.mid];

      try {
        const info = await navigator.mediaCapabilities.decodingInfo(HQ_DECODING);
        return info.supported && info.smooth && info.powerEfficient
          ? [TIERS.hq, TIERS.mid]
          : [TIERS.mid];
      } catch {
        return [TIERS.mid, TIERS.hq];
      }
    };

    const run = async () => {
      // The bridge. Read in and counted; streamed from its own URL if reading
      // it in fails for any reason.
      let url: string;
      try {
        url = await read(TIERS.bridge, setPercent);
      } catch {
        if (cancelled) return;
        url = TIERS.bridge.src;
      }
      if (cancelled) return;
      setPercent(100);
      try {
        await attach("a", TIERS.bridge, url);
      } catch {
        return;
      }
      let held: Tier = TIERS.bridge;

      const order = await climbOrder();
      if (cancelled) return;

      let lastOutcome: "up" | "down" | null = null;
      for (const tier of order) {
        if (lastOutcome === "up" && tier.rank <= held.rank) break;
        if (lastOutcome === "down" && tier.rank >= held.rank) break;

        // A candidate that will not download is not the reader's problem:
        // they have a film already.
        let candidate: string;
        try {
          candidate = await read(tier);
        } catch {
          return;
        }
        if (cancelled) return;

        const slot: Slot = roles.current.active === "a" ? "b" : "a";
        let el: HTMLVideoElement;
        try {
          el = await attach(slot, tier, candidate);
        } catch {
          release(slot);
          lastOutcome = "down";
          continue;
        }
        if (cancelled) return;

        const passed = await probe(el);
        if (cancelled) return;
        if (!passed) {
          release(slot);
          lastOutcome = "down";
          continue;
        }

        // Proven. Hand it to the loop, which drives both files to the same
        // frame and swaps them there.
        const landed = await new Promise<boolean>((resolve) => {
          waiting.current.promoted = () => resolve(true);
          waiting.current.abandoned = () => resolve(false);
          roles.current.pending = slot;
          roles.current.pendingSince = performance.now();
        });
        waiting.current.promoted = null;
        waiting.current.abandoned = null;
        if (cancelled) return;

        if (landed) {
          release(slot === "a" ? "b" : "a");
          held = tier;
          lastOutcome = "up";
        } else {
          release(slot);
          lastOutcome = "down";
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
      // Back to the start, so a window resized out of the laptop layout and
      // back in climbs the ladder again rather than pointing a slot at a
      // blob URL that no longer exists.
      roles.current = { active: null, pending: null, pendingSince: 0 };
      tierOf.current = { a: null, b: null };
      primed.current = { a: false, b: false };
      waiting.current = { canplay: {}, failed: {}, promoted: null, abandoned: null };
      setSrcA(null);
      setSrcB(null);
      setPercent(0);
      setReady(false);
    };
  }, [width]);

  useEffect(() => {
    if (!mounted) return;
    const track = trackRef.current;
    const media = mediaRef.current;
    const soft = softRef.current;
    const veil = veilRef.current;
    const mark = markRef.current;
    const tag = tagRef.current;
    const cue = cueRef.current;
    if (!track || !media || !soft || !veil || !mark || !tag || !cue) return;

    let frame = 0;
    let current = 0;
    let last = 0;
    let painted = -1;
    let lastTarget = -1;

    /**
     * The bar over the film. While the panel is pinned, `<html>` carries
     * `data-hero-film` and the bar stays transparent with white type
     * whatever its own scroll threshold says — the rules are in
     * `globals.css`, the reasoning on `LIGHT_FROM_TOP` in `site-header.tsx`.
     * Written only on change: this runs every frame.
     */
    let filmed: boolean | null = null;
    const film = (on: boolean) => {
      if (on === filmed) return;
      filmed = on;
      if (on) document.documentElement.setAttribute("data-hero-film", "");
      else document.documentElement.removeAttribute("data-hero-film");
    };

    /**
     * Per element, since two can be chasing at once: when its outstanding
     * seek was issued, where to, and when it was last reloaded. Keyed on the
     * element so a slot remounting with a new file starts clean.
     */
    const seeks = new WeakMap<HTMLVideoElement, { seekAt: number; seekTo: number; recoveredAt: number }>();
    const stateOf = (el: HTMLVideoElement) => {
      let s = seeks.get(el);
      if (!s) {
        s = { seekAt: 0, seekTo: 0, recoveredAt: 0 };
        seeks.set(el, s);
      }
      return s;
    };

    /** Cached by the shared loop and refreshed on resize — see `lib/scroll.ts`. */
    let viewportHeight = window.innerHeight;

    const readProgress = () => {
      const rect = track.getBoundingClientRect();
      const distance = rect.height - viewportHeight;
      if (distance <= 0) return 0;
      return clamp01(-rect.top / distance);
    };

    const active = () => (roles.current.active ? elOf(roles.current.active) : null);
    const pending = () => (roles.current.pending ? elOf(roles.current.pending) : null);

    /**
     * Reloading is the only way back from a decoder the browser has thrown
     * away. It is cheap — the bytes are in memory — but rate-limited anyway,
     * so a file that is genuinely broken cannot spin on it. The position is
     * handed straight back after the reload, before the metadata is in:
     * that is the spec's "default playback start position", and it means the
     * element comes back on the frame it left rather than on frame zero and
     * then seeking — one black frame instead of half a dozen.
     */
    const recover = (el: HTMLVideoElement, now: number) => {
      const s = stateOf(el);
      if (now - s.recoveredAt < RECOVER_COOLDOWN_MS) return;
      s.recoveredAt = now;
      s.seekAt = 0;
      painted = -1;
      if (roles.current.active) primed.current[roles.current.active] = false;
      el.load();
      el.currentTime = s.seekTo;
    };

    const seek = (el: HTMLVideoElement, progress: number, now: number) => {
      const { duration } = el;
      if (!duration || !Number.isFinite(duration)) return;
      const s = stateOf(el);

      if (el.seeking) {
        // A seek that never lands would otherwise wedge the clip on one frame
        // for good — the freeze this whole block exists to prevent. Asking
        // again is almost always enough, and is re-armed rather than tried
        // once: a browser can drop several in a row under a hard scroll.
        //
        // Reloading is reserved for `HAVE_NOTHING`, where the decoder really
        // has been taken away. It is not a remedy for a *slow* seek — a
        // reload empties the buffer, and the clip would then crawl forward
        // from the beginning as it refilled, which is worse than waiting.
        if (s.seekAt && now - s.seekAt > SEEK_TIMEOUT_MS) {
          s.seekAt = now;
          if (el.readyState === 0) recover(el, now);
          else el.currentTime = s.seekTo;
        }
        return;
      }
      s.seekAt = 0;

      // Only the fallback, which streams the file, can seek into a part that
      // has not arrived yet — and that is fine: the browser range-requests it
      // and keeps the last decoded frame on screen meanwhile, so the
      // walkthrough lags rather than blanking. Stop a frame short of the end,
      // though — the very last one is not always seekable,
      // and asking for it can leave `seeking` true indefinitely.
      const wanted = clamp01(progress / CLIP_END) * (duration - 0.05);
      if (Math.abs(el.currentTime - wanted) < SEEK_EPSILON) return;
      s.seekAt = now;
      s.seekTo = wanted;
      el.currentTime = wanted;
    };

    /**
     * The swap. Both files have been driven to the same target; the moment
     * neither is mid-seek and both sit on the same frame, the candidate goes
     * to full opacity and the incumbent to none, in this frame — the reader
     * is looking at the same picture before and after, one of them sharper.
     * No transition: a cross-fade between two copies of the same frame at
     * different sharpness is a half-second of the picture going soft and
     * coming back, which is the blink this is arranged to avoid.
     */
    const promote = (now: number) => {
      const from = active();
      const to = pending();
      if (!from || !to || !roles.current.pending) return;
      const settled =
        !from.seeking &&
        !to.seeking &&
        to.readyState >= HAVE_CURRENT_DATA &&
        Math.abs(to.currentTime - from.currentTime) < FRAME_S;
      if (settled) {
        to.style.opacity = "1";
        from.style.opacity = "0";
        roles.current.active = roles.current.pending;
        roles.current.pending = null;
        waiting.current.promoted?.();
        return;
      }
      if (now - roles.current.pendingSince > PROMOTE_TIMEOUT_MS) {
        roles.current.pending = null;
        waiting.current.abandoned?.();
      }
    };

    const paint = (progress: number) => {
      if (Math.abs(progress - painted) < 0.00005) return;
      painted = progress;

      // Shade pools under the middle of the picture, where the lockup lands,
      // and the edges of the shot stay as they were. The soft plate is the
      // same frame the clip ends on, so this reads as the picture drifting
      // out of focus rather than as a cut to another image.
      const pool = ramp(progress, POOL_START, FINALE_END);
      veil.style.opacity = String(pool);
      soft.style.opacity = String(pool);
      media.style.transform = pool > 0 ? `scale(${1 + pool * 0.04})` : "";

      // Rises and grows into place rather than simply appearing.
      const arrival = ramp(progress, LOGO_START, FINALE_END);
      mark.style.opacity = String(arrival);
      mark.style.transform = `translate3d(0, ${(1 - arrival) * 30}px, 0) scale(${
        0.96 + arrival * 0.04
      })`;

      const line = ramp(progress, TAG_START, TAG_END);
      tag.style.opacity = String(line);
      tag.style.transform = `translate3d(0, ${(1 - line) * 20}px, 0)`;

      // Sinks a little as it fades, the opposite of the lockup's rise.
      const cueOut = ramp(progress, CUE_FADE_START, CUE_FADE_END);
      cue.style.opacity = String(1 - cueOut);
      cue.style.transform = cueOut > 0 ? `translate3d(0, ${cueOut * 12}px, 0)` : "";
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      // Converge over *time*, not per frame: a 120Hz display would otherwise
      // chase twice as hard as a 60Hz one and feel like a different site. The
      // gap is clamped so a loop resuming after a pause eases in rather than
      // integrating however long it was away in a single step.
      const elapsed = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      const target = readProgress();
      if (Math.abs(target - lastTarget) > 0.0002) {
        lastTarget = target;
        lastMoveAt.current = now;
      }
      // On the raw position, not the eased one: the bar should frost the
      // frame the panel unpins, not a beat later when the ease catches up.
      film(target < 1);
      current += (target - current) * (1 - Math.exp(-EASE_RATE * elapsed));
      if (Math.abs(target - current) < 0.0004) current = target;

      paint(current);

      // The film on screen, and the one coming up behind it, are driven to
      // the same place, and the swap is taken the frame they meet. The
      // meeting is judged *before* this frame's seeks go out: both files
      // finished last frame's seek to the same target during the frame, so
      // this is the moment they are at rest on the same picture. Judged
      // after, they would both be mid-seek again on every frame the reader
      // was scrolling, and the swap would only ever land in a pause.
      if (active() && pending()) promote(now);
      // Read again: a promotion just now has swapped which is which.
      const shown = active();
      const next = pending();
      if (shown) seek(shown, current, now);
      if (next) seek(next, current, now);
    };

    const start = () => {
      if (frame) return;
      // Never integrate the time the loop was not running.
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onScreen = () => {
      const rect = track.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < viewportHeight;
    };

    const sync = () => {
      if (document.hidden || !onScreen()) {
        stop();
        // Off screen means scrolled past: the bar is over the page now.
        if (!onScreen()) film(false);
        return;
      }
      last = 0;
      painted = -1;
      start();
    };

    /**
     * Coming back from a background tab, another application, or the back
     * button's page cache. Browsers reclaim video decoders from pages that
     * have been idle, and an element that has lost its decoder accepts every
     * `currentTime` you give it and draws none of them.
     */
    const wake = () => {
      // `readyState` dips below `HAVE_CURRENT_DATA` during any ordinary seek,
      // so a wake landing mid-seek must not be read as a lost decoder — that
      // would reload the element in the middle of working correctly.
      const el = active();
      if (el && !document.hidden && !el.seeking && el.readyState < HAVE_CURRENT_DATA) {
        recover(el, performance.now());
      }
      sync();
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(sync, { threshold: 0 })
        : null;

    /**
     * Take the clip out of the compositor once the hero is well behind us.
     *
     * A `<video>` holds a layer and a full-size texture for as long as it is
     * painted, and this one is up to 3200 wide and pinned inside a track
     * several screens tall. Being paused and off screen did not help: the
     * layer was still in the frame the compositor built for every scroll
     * position on the page, and it cost about a frame in eight for the
     * *whole* home page — the one page on the site that scrolled measurably
     * worse than the rest. Nothing was running; there was simply too much to
     * composite.
     *
     * `visibility` rather than `display`, so the element keeps its box and
     * the layout above and below it cannot shift. And a full screen of slack
     * either side, so the clip is always painted long before it could be
     * seen: an observer is delivered at the end of a frame, and a decision
     * taken exactly at the edge could be a frame late, which on the way back
     * up would be a black panel where the film should be.
     *
     * The *last* entry is the one that counts. An observer can deliver
     * several for one element in a single callback — a flick past the
     * margin and back inside one delivery — and reading only the first
     * would leave the clip hidden while it is on screen. A slot that mounts
     * while the hero is culled picks the state up from `culled` as it
     * mounts, in its ref callback below.
     */
    const cull =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[entries.length - 1];
              culled.current = !entry.isIntersecting;
              for (const el of [elA.current, elB.current]) {
                if (el) el.style.visibility = culled.current ? "hidden" : "";
              }
            },
            { threshold: 0, rootMargin: "100% 0px 100% 0px" },
          )
        : null;

    if (observer) observer.observe(track);
    cull?.observe(track);
    document.addEventListener("visibilitychange", wake);
    // `focus` covers switching back from another app, which does not change
    // visibility; `pageshow` covers a restore from the back/forward cache,
    // where this effect is never re-run.
    window.addEventListener("focus", wake);
    window.addEventListener("pageshow", wake);
    // The shared loop is what tells this one the window has changed size;
    // the hero's own loop then re-reads the track against it.
    const stopShared = onScroll(({ height }) => {
      if (height === viewportHeight) return;
      viewportHeight = height;
      sync();
    });

    if (observer) sync();
    else start();

    return () => {
      stop();
      film(false);
      observer?.disconnect();
      cull?.disconnect();
      culled.current = false;
      // Whatever is mounted *now*, not what was when the effect began: the
      // slots come and go over the effect's life, and it is the current pair
      // that may be sitting hidden.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      for (const el of [elA.current, elB.current]) {
        if (el) el.style.visibility = "";
      }
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("pageshow", wake);
      stopShared();
      for (const node of [media, soft, veil, mark, tag, cue]) {
        node.style.opacity = "";
        node.style.transform = "";
      }
    };
  }, [mounted]);

  /*
   * Phones do not get the walkthrough at all.
   *
   * This is a five-screen track pinning a wide clip and scrubbing it off the
   * scroll position — an interaction that wants a wheel and a connection,
   * and on a phone is a long drag through a file that had to be downloaded
   * first. `HomeHeroPhone` opens the page there instead: a short band of
   * photographs under the bar, no video at all.
   *
   * Unmounting rather than merely hiding is what stops the phone paying for
   * this anyway — no clip, no end still, no animation frame loop. It happens
   * the moment the width is known, and `hidden desk:block` below covers the
   * frame before that, so nothing is ever seen to leave.
   */
  if (width === "phone") return null;

  /**
   * One slot. Opacity is the loop's and `reveal`'s to set, never React's:
   * it changes on the frame a promotion lands, and a stylesheet transition
   * would turn that into a cross-fade. `visibility` follows the cull, from
   * the ref callback, so a slot mounting while the hero is far below the
   * fold is not composited for nothing.
   *
   * Anything that says there is a frame to show reaches `reveal`; whichever
   * the browser fires first wins and the rest are no-ops.
   */
  const slot = (
    which: Slot,
    src: string | null,
    ref: React.MutableRefObject<HTMLVideoElement | null>,
  ) =>
    src && (
      <video
        key={src}
        ref={(el) => {
          ref.current = el;
          if (el) el.style.visibility = culled.current ? "hidden" : "";
        }}
        src={src}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0 }}
        // `muted` + `playsInline` are what make the priming play legal.
        muted
        playsInline
        preload="auto"
        // Decorative: the poster carries the alternative text.
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        onLoadedData={(event) => reveal(which, event.currentTarget)}
        onCanPlay={(event) => reveal(which, event.currentTarget)}
        onSeeked={(event) => reveal(which, event.currentTarget)}
        onError={(event) => onSlotError(which, event.currentTarget)}
      />
    );

  return (
    <section
      ref={trackRef}
      // No padding under the bar: the panel pins at the very top of the
      // window and the bar runs over it, transparent — see `film` in the
      // loop. It used to start below the bar, on a white strip the bar sat
      // on; that strip was the whole reason the home page was on the
      // header's `LIGHT_FROM_TOP` list, and both went on 2026-09-16.
      className={cn(
        // `hidden desk:block` is the pre-hydration half of the split with
        // `HomeHeroPhone`: the server sends both heroes and CSS shows the
        // right one, so neither flashes before the width is known.
        "relative hidden bg-black desk:block",
        mounted && "h-hero-track",
      )}
      style={
        mounted
          ? ({ "--track-screens": TRACK_SCREENS } as React.CSSProperties)
          : undefined
      }
    >
      {/* Pins at the top of the window and runs to its foot — the whole
          screen, bar included, full width, flush on all four sides. The
          panel is where it pins from the first pixel, and the scrub still
          ends exactly as it unpins.

          Nothing shares the panel with the film: it is the whole screen, so
          the walkthrough is the first and only thing on it, and the bar is
          over it rather than above it.

          The clip is cut at 16:9, which is the tallest shape the render has
          and within a few percent of the panel's own on every screen this is
          read on, so `object-cover` fills the box with no letterbox and trims
          only those few percent. That shape is the whole reason the hero is
          not pushed in: `build-hero-video.py` used to cut a 2.4:1 band out of
          a 3524×2352 render and throw away two fifths of every frame. It cuts
          poster, clip and end still from the same windows, so the two
          cross-fades land on frames that line up.

          No `object-position`: centred, so the few percent comes off evenly.
          See also `h-hero-screen` in `app/globals.css`. */}
      <div className="sticky top-0 isolate h-hero-screen w-full overflow-hidden bg-black">
        {/* `next/image` with `fill` needs a positioned containing block, so the
            media gets a wrapper of its own — which is also the thing the close
            pushes in. The veil and the lockup are deliberately outside it, so
            the push moves the picture and nothing else. */}
        <div ref={mediaRef} className="absolute inset-0">
          <Image
            src={img.homeScrollPoster}
            alt={alt.homeScrollPoster}
            fill
            preload
            sizes="100vw"
            placeholder="blur"
            className={cn(
              "object-cover transition-opacity duration-500",
              ready ? "opacity-0" : "opacity-100",
            )}
          />

          {/* The two slots. One is the film on screen; the other, when it is
              mounted at all, is the next file up the ladder being brought
              up behind it. Which is which is `roles`, not their order here:
              they trade places on every promotion. */}
          {slot("a", srcA, elA)}
          {slot("b", srcB, elB)}

          {/* The last frame, blurred once at build time. Cross-fading to this is
              what the close does instead of blurring live video. */}
          {/* The plate itself waits for the width. It is lazy, and a lazy
              image with no layout box is fetched immediately rather than
              deferred — so on a phone, where this section is `display: none`
              and about to be unmounted altogether, it was being downloaded
              for nothing. Nothing is lost by waiting: it is invisible until
              the film has finished, more than two screens below the
              hydration this now happens on. */}
          <div ref={softRef} className="absolute inset-0 opacity-0">
            {mounted && (
              <Image
                src={img.homeScrollEnd}
                alt=""
                aria-hidden="true"
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
          </div>

        </div>

        {/* The bar's own ground — the same scrim the phone's band carries, at
            the same measured depth (`.reshero__bar-scrim`, and the note on
            "the bar over the film" in `globals.css` for what it clears). The
            film opens on daylight, and a white lockup and a white "Menu"
            laid straight on a blue sky do not read. So the top of the panel
            is darkened under the bar and lets go a little below it, which is
            the one place a shade can go without touching the picture anybody
            is looking at. Outside the media wrapper, so the close's push
            leaves it where it is. */}
        <div aria-hidden="true" className="reshero__bar-scrim" />

        {/* An ellipse rather than a flat wash: it darkens the middle, where
            the lockup lands, and leaves the edges of the shot alone. */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] opacity-0"
          style={{
            background:
              "radial-gradient(65% 45% at 50% 50%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0) 75%)",
          }}
        />

        {/* The close. This is also where the page keeps its `h1`: the lockup
            is what the home page leads on now that no headline sits over the
            walkthrough, so it carries the name rather than merely repeating
            the header's decorative copy of it.

            The lockup and the line centre together, as one block: the pair
            balances on the middle of the film, which puts the lockup itself a
            little above it. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <h1 ref={markRef} className="m-0 leading-none opacity-0">
            <span className="sr-only">
              Vijaya Enterprises — building trust since 1973
            </span>
            {/* Nudged left of, and up from, the centre its box sits on.
                Percentages of the lockup's own width and height, so both
                shifts stay proportional at every breakpoint instead of
                looking heavy-handed on a phone. */}
            <Logo
              reversed
              width={1000}
              className="h-24 w-auto -translate-x-[7%] -translate-y-[8%] sm:h-36 lg:h-48"
            />
          </h1>
          <p
            ref={tagRef}
            className="mt-6 max-w-3xl text-[0.625rem] uppercase leading-relaxed tracking-[0.3em] text-white/90 opacity-0 sm:mt-8 sm:text-xs sm:tracking-[0.38em] md:text-sm"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.75)" }}
          >
            One trusted partner for construction and development
          </p>
        </div>

        {/* The count, then the go-ahead. Two and a half rems off the foot of
            the screen and centred on it — the panel runs to the bottom of
            the viewport, so its own foot is the screen's. It counts the
            bridge in as it downloads and, once every byte of it is here,
            tells the reader to start scrolling; the larger files arrive
            behind that without a word. Nothing stops anyone scrolling
            sooner: the poster and the close still run, the walkthrough is
            simply not there yet.

            Tracking is added after every letter, the last one included, so
            the line carries the same amount again on its left to sit truly
            centred over the hairline. The count is in tabular figures, so
            the line does not twitch sideways as it climbs.

            The box is always rendered, because the scrub effect takes hold of
            it on its first run; what goes in it waits until mounted. Without
            JavaScript nothing is counting, and a "Loading 0%" that never
            moves would be the one thing on the screen. */}
        <div
          ref={cueRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[max(2.5rem,env(safe-area-inset-bottom))] z-20 flex flex-col items-center gap-3"
        >
          {mounted && (
            <>
              <p
                data-no-translate
                className="whitespace-nowrap pl-[0.45em] text-base font-light uppercase tabular-nums tracking-[0.45em] text-white sm:pl-[0.55em] sm:text-xl sm:tracking-[0.55em] md:text-2xl"
                style={{
                  textShadow:
                    "0 2px 14px rgba(0,0,0,0.75), 0 0 28px rgba(183,110,121,0.28)",
                }}
              >
                {cue}
              </p>
              <span
                className={cn(
                  "block h-10 w-px bg-gradient-to-b from-rosegold-600 to-transparent",
                  loaded ? "animate-pulse motion-reduce:animate-none" : "opacity-50",
                )}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
