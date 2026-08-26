"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { img, alt, video } from "@/lib/images";

/**
 * Viewport heights of scroll the clip is spread across, counting the one the
 * hero already occupies. 3 means two screens of scrolling run the 10.5s clip
 * end to end.
 */
const TRACK_SCREENS = 3;

/** How hard the played position chases the scroll position, per frame. */
const EASE = 0.18;

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
 * The home page hero: one walkthrough — the towers from the air, the living
 * room, the foyer — with the scroll wheel as its transport control. Nothing
 * over it and no grade on it; the clip is the whole hero.
 *
 * The section is a tall *track*; the panel inside it is `sticky`, so it pins
 * to the viewport while the track scrolls past underneath. How far the track
 * has travelled is the clip's `currentTime`, so scrolling down runs the
 * walkthrough forward and scrolling back up runs it in reverse.
 *
 * Three things make that reliable rather than clever:
 *
 *   • The clip is encoded with a keyframe every third frame, so seeking to an
 *     arbitrary time decodes almost nothing. `assets/video-source/README.md`
 *     has the ffmpeg recipe that built it.
 *   • The position is read inside the animation frame rather than from scroll
 *     events, so nothing depends on how a given browser batches or throttles
 *     those. The loop only runs while the hero is on screen and the tab is in
 *     front.
 *   • The played position eases toward the scroll position instead of
 *     tracking it exactly, so a flick of the wheel plays through the frames
 *     in between rather than jumping over them.
 *
 * Nothing here opts a visitor out of the clip — no Data Saver check, no
 * `prefers-reduced-motion` check. Those quietly turned the hero into a still
 * photograph on the machines that set them, which reads as a bug rather than
 * a courtesy, and the motion here is not autonomous: not a frame of it moves
 * that the reader did not scroll themselves.
 *
 * The poster is a real `next/image`, so the hero paints immediately and the
 * LCP never waits on video. The clip fades over it as soon as it can render a
 * frame, and if it never loads the poster is a perfectly good hero on its own.
 */
export function ScrollHero() {
  const trackRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
  // arrives would otherwise get two screens of dead scroll past a hero that
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
    const el = videoRef.current;
    if (!track || !el) return;

    let frame = 0;
    let current = 0;
    let lastSeek = -1;

    const readProgress = () => {
      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      if (distance <= 0) return 0;
      return clamp01(-rect.top / distance);
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);

      const target = readProgress();
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.0004) current = target;

      const { duration } = el;
      if (!duration || !Number.isFinite(duration)) return;

      // Stop a frame short: the very last one is not always seekable.
      const time = current * (duration - 0.05);
      if (Math.abs(time - lastSeek) < 0.008) return;
      lastSeek = time;
      el.currentTime = time;
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
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
      if (!document.hidden && onScreen()) start();
      else stop();
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(sync, { threshold: 0 })
        : null;

    if (observer) observer.observe(track);
    document.addEventListener("visibilitychange", sync);
    // Without an observer there is nothing to wait for; run it regardless.
    if (!observer) start();
    else sync();

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [src]);

  return (
    <section
      ref={trackRef}
      className="relative bg-black"
      style={mounted ? { height: `${TRACK_SCREENS * 100}svh` } : undefined}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* `next/image` with `fill` will not accept a `sticky` parent as its
            containing block, so the media gets a wrapper of its own. */}
        <div className="absolute inset-0">
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
              onError={() => setFailed(true)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
