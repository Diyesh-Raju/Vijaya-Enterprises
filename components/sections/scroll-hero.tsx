"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { onScroll } from "@/lib/scroll";
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
 * The home page hero: one walkthrough — the towers from the air, in through
 * a window to the living room — with the scroll wheel as its transport
 * control, closing on the lockup. Nothing is laid over the film itself and
 * no grade sits on it.
 *
 * The section is a tall *track*; the panel inside it is `sticky`, so it pins
 * to the viewport while the track scrolls past underneath. How far the track
 * has travelled is the clip's `currentTime`, so scrolling down runs the
 * walkthrough forward and scrolling back up runs it in reverse, identically.
 *
 * Everything below is about it never getting stuck, on any machine:
 *
 *   • The clip carries a keyframe every sixth frame, so seeking to an
 *     arbitrary time decodes almost nothing. `assets/video-source/README.md`
 *     covers how it is built.
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
 *   • The whole file is read in before the clip is attached, and a cue at
 *     the foot of the screen counts it in — "Loading 42%", then "Scroll to
 *     Discover" once the last byte is here. Every seek after that is to
 *     memory, so nothing waits on a range request halfway down the page.
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const softRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<HTMLHeadingElement | null>(null);
  const tagRef = useRef<HTMLParagraphElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const primed = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  /** The clip once all of it is here, as a blob URL — or its own URL, if reading it in failed. */
  const [downloaded, setDownloaded] = useState<string | null>(null);
  /** How much of it has arrived, 0–100; `null` if the server never said how big it is. */
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
  const src = failed ? null : downloaded;
  /** The cue stops counting when there is a clip to scrub — or none coming. */
  const loaded = ready || failed;

  /** Show the clip, and give iOS the one play it needs to paint a frame. */
  const reveal = (el: HTMLVideoElement) => {
    setReady(true);
    if (primed.current) return;
    primed.current = true;
    void el
      .play()
      .then(() => el.pause())
      .catch(() => {});
  };

  /*
   * Read the whole clip in before handing it to the element.
   *
   * Left to itself, a `<video>` fetches what it needs as it goes, and a
   * reader who scrolls ahead of the download is asking for frames that are
   * not there yet — the walkthrough holds whatever it last drew until the
   * range request comes back. Reading all of it first makes every seek after
   * that a seek into memory, and it is what lets the cue give an honest
   * count: "Scroll to Discover" appears when the last byte has, not when the
   * first frame happens to.
   *
   * `fetch`, so the count comes off the stream as it arrives and a repeat
   * visit is answered from the HTTP cache, counting to a hundred at once.
   * Should reading it in fail for any reason, the element is given the
   * file's own URL instead and streams it the old way.
   *
   * Only for the laptop hero — a phone unmounts this section, and must not
   * pay for a file it will never be shown.
   */
  useEffect(() => {
    if (width !== "wide") return;
    const controller = new AbortController();
    let url: string | null = null;

    const read = async () => {
      const response = await fetch(video.homeScrollDesktop, {
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error(response.statusText);
      const total = Number(response.headers.get("content-length")) || 0;
      if (!total) setPercent(null);

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
        if (total) setPercent(Math.min(99, Math.floor((received / total) * 100)));
      }

      url = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
      setPercent(100);
      setDownloaded(url);
    };

    read().catch(() => {
      if (!controller.signal.aborted) setDownloaded(video.homeScrollDesktop);
    });

    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
      // Back to the start, so a window resized out of the laptop layout and
      // back in counts the clip in again rather than pointing the element at
      // a blob URL that no longer exists.
      setDownloaded(null);
      setPercent(0);
      setReady(false);
      primed.current = false;
    };
  }, [width]);

  useEffect(() => {
    const track = trackRef.current;
    // Optional on purpose: if the clip never loads, everything else still
    // runs over the poster rather than leaving four screens of dead scroll.
    const el = videoRef.current;
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
    let seekAt = 0;
    let seekTo = 0;
    let recoveredAt = 0;

    /** Cached by the shared loop and refreshed on resize — see `lib/scroll.ts`. */
    let viewportHeight = window.innerHeight;

    const readProgress = () => {
      const rect = track.getBoundingClientRect();
      const distance = rect.height - viewportHeight;
      if (distance <= 0) return 0;
      return clamp01(-rect.top / distance);
    };

    /**
     * Reloading is the only way back from a decoder the browser has thrown
     * away. It is cheap — the bytes are in the HTTP cache — but rate-limited
     * anyway, so a file that is genuinely broken cannot spin on it.
     */
    const recover = (now: number) => {
      if (!el || now - recoveredAt < RECOVER_COOLDOWN_MS) return;
      recoveredAt = now;
      seekAt = 0;
      painted = -1;
      primed.current = false;
      el.load();
    };

    const seek = (progress: number, now: number) => {
      if (!el) return;
      const { duration } = el;
      if (!duration || !Number.isFinite(duration)) return;

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
        if (seekAt && now - seekAt > SEEK_TIMEOUT_MS) {
          seekAt = now;
          if (el.readyState === 0) recover(now);
          else el.currentTime = seekTo;
        }
        return;
      }
      seekAt = 0;

      // Only the fallback, which streams the file, can seek into a part that
      // has not arrived yet — and that is fine: the browser range-requests it
      // and keeps the last decoded frame on screen meanwhile, so the
      // walkthrough lags rather than blanking. Stop a frame short of the end,
      // though — the very last one is not always seekable,
      // and asking for it can leave `seeking` true indefinitely.
      const wanted = clamp01(progress / CLIP_END) * (duration - 0.05);
      if (Math.abs(el.currentTime - wanted) < SEEK_EPSILON) return;
      seekAt = now;
      seekTo = wanted;
      el.currentTime = wanted;
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
      current += (target - current) * (1 - Math.exp(-EASE_RATE * elapsed));
      if (Math.abs(target - current) < 0.0004) current = target;

      paint(current);
      seek(current, now);
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
      if (el && !document.hidden && !el.seeking && el.readyState < HAVE_CURRENT_DATA) {
        recover(performance.now());
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
     * painted, and this one is 1920 wide and pinned inside a track several
     * screens tall. Being paused and off screen did not help: the layer was
     * still in the frame the compositor built for every scroll position on
     * the page, and it cost about a frame in eight for the *whole* home page
     * — the one page on the site that scrolled measurably worse than the
     * rest. Nothing was running; there was simply too much to composite.
     *
     * `visibility` rather than `display`, so the element keeps its box and
     * the layout above and below it cannot shift. And a full screen of slack
     * either side, so the clip is always painted long before it could be
     * seen: an observer is delivered at the end of a frame, and a decision
     * taken exactly at the edge could be a frame late, which on the way back
     * up would be a black panel where the film should be.
     */
    const cull =
      el && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              el.style.visibility = entry.isIntersecting ? "" : "hidden";
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
    // Anything the element itself reports as a break in service.
    el?.addEventListener("stalled", wake);
    el?.addEventListener("emptied", wake);

    if (observer) sync();
    else start();

    return () => {
      stop();
      observer?.disconnect();
      cull?.disconnect();
      if (el) el.style.visibility = "";
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("pageshow", wake);
      stopShared();
      el?.removeEventListener("stalled", wake);
      el?.removeEventListener("emptied", wake);
      for (const node of [media, soft, veil, mark, tag, cue]) {
        node.style.opacity = "";
        node.style.transform = "";
      }
    };
  }, [src]);

  /*
   * Phones do not get the walkthrough at all.
   *
   * This is a five-screen track pinning a 1920-wide clip and scrubbing it off
   * the scroll position — an interaction that wants a wheel and a connection,
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

  return (
    <section
      ref={trackRef}
      // The bar's height as top padding, so the panel's resting position is
      // already under it and `sticky` has nothing to correct on the first
      // paint. White rather than black: that strip is what the frosted bar
      // has behind it at the top of the page.
      className={cn(
        // `hidden desk:block` is the pre-hydration half of the split with
        // `HomeHeroPhone`: the server sends both heroes and CSS shows the
        // right one, so neither flashes before the width is known.
        "relative hidden bg-white pt-[var(--header-h)] desk:block",
        mounted && "h-hero-track",
      )}
      style={
        mounted
          ? ({ "--track-screens": TRACK_SCREENS } as React.CSSProperties)
          : undefined
      }
    >
      {/* Pins under the bar rather than behind it, and runs to the bottom of
          the viewport — full width, flush on all four sides. Padding and
          offset are the same height, so the panel is where it pins from the
          first pixel and the scrub still ends exactly as it unpins.

          Nothing shares the panel with the film: it is the whole screen below
          the bar, so the walkthrough is the first and only thing on it.

          The clip is cut at 16:9, which is the tallest shape the render has
          and within a few percent of the panel's own on every screen this is
          read on, so `object-cover` fills the box with no letterbox and trims
          only those few percent. That shape is the whole reason the hero is
          not pushed in: `build-hero-video.py` used to cut a 2.4:1 band out of
          a 3524×2352 render and throw away two fifths of every frame. It cuts
          poster, clip and end still from the same windows, so the two
          cross-fades land on frames that line up.

          No `object-position`: centred, so the few percent comes off evenly.
          See also `h-hero-panel` in `app/globals.css`. */}
      <div className="sticky top-[var(--header-h)] isolate h-hero-panel w-full overflow-hidden bg-black">
        {/* `next/image` with `fill` needs a positioned containing block, so the
            media gets a wrapper of its own — which is also the thing the close
            pushes in. The veil and the lockup are deliberately outside it, so
            the push moves the picture and nothing else. */}
        <div ref={mediaRef} className="absolute inset-0">
          <Image
            src={img.homeScrollPoster}
            alt={alt.homeScrollPoster}
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className={cn(
              "object-cover transition-opacity duration-500",
              ready ? "opacity-0" : "opacity-100",
            )}
          />

          {src && (
            <video
              ref={videoRef}
              src={src}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                ready ? "opacity-100" : "opacity-0",
              )}
              // `muted` + `playsInline` are what make the priming play legal.
              muted
              playsInline
              preload="auto"
              // Decorative: the poster carries the alternative text.
              aria-hidden="true"
              tabIndex={-1}
              disablePictureInPicture
              // Any of these means there is a frame to show. Whichever the
              // browser fires first wins; the rest are no-ops.
              onLoadedData={(event) => reveal(event.currentTarget)}
              onCanPlay={(event) => reveal(event.currentTarget)}
              onSeeked={(event) => reveal(event.currentTarget)}
              // A blob the page refuses to play — a policy that does not
              // allow `blob:` media, say — falls back to streaming the file
              // from its own URL. Only if that fails too is the clip given up.
              onError={() =>
                src === video.homeScrollDesktop
                  ? setFailed(true)
                  : setDownloaded(video.homeScrollDesktop)
              }
            />
          )}

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
            the viewport, so its own foot is the screen's. It counts the clip
            in as it downloads and, once every byte of it is here, tells the
            reader to start scrolling. Nothing stops anyone scrolling sooner:
            the poster and the close still run, the walkthrough is simply
            not there yet.

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
                className="whitespace-nowrap pl-[0.45em] text-base font-light uppercase tabular-nums tracking-[0.45em] text-white sm:pl-[0.55em] sm:text-xl sm:tracking-[0.55em] md:text-2xl"
                style={{
                  textShadow:
                    "0 2px 14px rgba(0,0,0,0.75), 0 0 28px rgba(183,110,121,0.28)",
                }}
              >
                {loaded
                  ? "Scroll to Discover"
                  : percent === null
                    ? "Loading"
                    : `Loading ${percent}%`}
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
