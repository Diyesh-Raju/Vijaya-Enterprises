"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { img, alt, video } from "@/lib/images";

/**
 * Viewport heights the whole hero occupies, counting the one it starts on.
 * Five screens of scrolling: three and a half of walkthrough, then the close.
 */
const TRACK_SCREENS = 6;

/**
 * Where the clip reaches its last frame. Everything after this point happens
 * to a still — the walkthrough plays out in full first, and only then does
 * the picture soften and the lockup arrive. Nothing overlaps the film.
 */
const CLIP_END = 0.7;

/**
 * The close, in fractions of the track, all of it after `CLIP_END`. The
 * picture goes soft and shade pools under the middle of it, then the lockup
 * rises into that, then the line beneath. Each finishes before the track
 * does, so the hero holds the finished card for a quarter of a screen rather
 * than completing on the last pixel before it unpins.
 */
const POOL_START = CLIP_END;
const LOGO_START = 0.76;
const FINALE_END = 0.9;
const TAG_START = 0.83;
const TAG_END = 0.95;

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

const WIDE_QUERY = "(min-width: 768px)";

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
 * The home page hero: one walkthrough — the towers from the air, the living
 * room, the foyer — with the scroll wheel as its transport control, closing
 * on the lockup. Nothing is laid over the film itself and no grade sits on it.
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
 *   • Seeks are held inside what has actually downloaded, so a fast scroll on
 *     a slow line makes the walkthrough lag rather than blank.
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
 * still is 27KB and costs nothing anywhere.
 */
export function ScrollHero() {
  const trackRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const softRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<HTMLHeadingElement | null>(null);
  const tagRef = useRef<HTMLParagraphElement | null>(null);
  const primed = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // `"ssr"` until mounted: the video is never rendered on the server, so a
  // phone never sees the desktop file in the markup.
  const width = useSyncExternalStore(
    subscribeToWidth,
    getWidth,
    () => "ssr" as const,
  );

  // The tall track is added after mount too. A visitor whose JavaScript never
  // arrives would otherwise get four screens of dead scroll past a hero that
  // cannot move. It grows at hydration, below the fold, so nothing shifts.
  const mounted = width !== "ssr";
  const src =
    failed || !mounted
      ? null
      : width === "wide"
        ? video.homeScrollDesktop
        : video.homeScrollMobile;

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

  useEffect(() => {
    const track = trackRef.current;
    // Optional on purpose: if the clip never loads, everything else still
    // runs over the poster rather than leaving five screens of dead scroll.
    const el = videoRef.current;
    const media = mediaRef.current;
    const soft = softRef.current;
    const veil = veilRef.current;
    const mark = markRef.current;
    const tag = tagRef.current;
    if (!track || !media || !soft || !veil || !mark || !tag) return;

    let frame = 0;
    let current = 0;
    let last = 0;
    let painted = -1;
    let seekAt = 0;
    let seekTo = 0;
    let recoveredAt = 0;

    const readProgress = () => {
      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
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

      // A seek into a part of the file that has not arrived yet is fine: the
      // browser range-requests it and keeps the last decoded frame on screen
      // meanwhile, so the walkthrough lags rather than blanking. Stop a frame
      // short of the end, though — the very last one is not always seekable,
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
      return rect.bottom > 0 && rect.top < window.innerHeight;
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

    if (observer) observer.observe(track);
    document.addEventListener("visibilitychange", wake);
    // `focus` covers switching back from another app, which does not change
    // visibility; `pageshow` covers a restore from the back/forward cache,
    // where this effect is never re-run.
    window.addEventListener("focus", wake);
    window.addEventListener("pageshow", wake);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    // Anything the element itself reports as a break in service.
    el?.addEventListener("stalled", wake);
    el?.addEventListener("emptied", wake);

    if (observer) sync();
    else start();

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("pageshow", wake);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      el?.removeEventListener("stalled", wake);
      el?.removeEventListener("emptied", wake);
      for (const node of [media, soft, veil, mark, tag]) {
        node.style.opacity = "";
        node.style.transform = "";
      }
    };
  }, [src]);

  return (
    <section
      ref={trackRef}
      // The bar's height as top padding, so the panel's resting position is
      // already under it and `sticky` has nothing to correct on the first
      // paint. White rather than black: that strip is what the frosted bar
      // has behind it at the top of the page.
      className={cn(
        "relative bg-white pt-[var(--header-h)]",
        mounted && "h-hero-track",
      )}
      style={
        mounted
          ? ({ "--track-screens": TRACK_SCREENS } as React.CSSProperties)
          : undefined
      }
    >
      {/* Pins under the bar rather than behind it, and runs to the bottom of
          the viewport — full width, flush at the sides and the foot. Padding
          and offset are the same height, so the panel is where it pins from
          the first pixel and the scrub still ends exactly as it unpins. */}
      <div className="sticky top-[var(--header-h)] h-hero-panel overflow-hidden bg-black">
        {/* `next/image` with `fill` will not accept a `sticky` parent as its
            containing block, so the media gets a wrapper of its own — which
            is also the thing the close pushes in.

            Everything fills it edge to edge, anchored to the top. The clip is
            cut to 40:21 — the shape this panel actually is, once the bar is
            off the top — so on most screens `cover` has almost nothing to
            trim, and there is never a margin at the sides. What little it does
            trim comes off the bottom, so the sky and the tower tops that meet
            the bar are never the part that goes. Poster, clip and end still
            are all cut from the same windows by `build-hero-video.py`, so the
            two cross-fades land on frames that already line up. */}
        <div ref={mediaRef} className="absolute inset-0">
          <Image
            src={img.homeScrollPoster}
            alt={alt.homeScrollPoster}
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className={cn(
              "object-cover object-top transition-opacity duration-500",
              ready ? "opacity-0" : "opacity-100",
            )}
          />

          {src && (
            <video
              ref={videoRef}
              src={src}
              className={cn(
                "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500",
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
              onError={() => setFailed(true)}
            />
          )}

          {/* The last frame, blurred once at build time. Cross-fading to this
              is what the close does instead of blurring live video. */}
          <div ref={softRef} className="absolute inset-0 opacity-0">
            <Image
              src={img.homeScrollEnd}
              alt=""
              aria-hidden="true"
              fill
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>
        </div>

        {/* Sits outside the media wrapper, so the push-in does not scale it.
            An ellipse rather than a flat wash: it darkens the middle, where
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
            balances on the middle of the screen, which puts the lockup itself
            a little above it. */}
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
      </div>
    </section>
  );
}
