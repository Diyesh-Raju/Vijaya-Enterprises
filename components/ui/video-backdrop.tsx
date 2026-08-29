"use client";

import Image, { type StaticImageData } from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/lib/cn";

type VideoBackdropProps = {
  poster: StaticImageData;
  posterAlt: string;
  srcDesktop: string;
  srcMobile: string;
  /** Set on the first hero of a page so the poster is the LCP image. */
  priority?: boolean;
  className?: string;
  /** Slow drift applied to the poster while the video loads. */
  kenBurns?: boolean;
};

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

const WIDE_QUERY = "(min-width: 768px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** Re-read the decision whenever the viewport or motion preference changes. */
function subscribeToMedia(onChange: () => void) {
  const queries = [window.matchMedia(WIDE_QUERY), window.matchMedia(REDUCED_QUERY)];
  for (const query of queries) query.addEventListener("change", onChange);
  return () => {
    for (const query of queries) query.removeEventListener("change", onChange);
  };
}

/**
 * Poster-first background video.
 *
 * The poster is a real `next/image` (AVIF/WebP, responsive, priority) so the
 * hero paints immediately and the LCP never waits on video. The video file is
 * only attached after mount, and only when it is actually a good idea:
 *
 *   • never when the user prefers reduced motion
 *   • never on Data Saver or a 2g-class connection
 *   • the 1280px file on phones, the 1920px file on larger screens
 *   • paused whenever it scrolls out of view or the tab is hidden
 *
 * If autoplay is refused (some iOS low-power states) the poster simply stays,
 * which is a perfectly good hero.
 */
export function VideoBackdrop({
  poster,
  posterAlt,
  srcDesktop,
  srcMobile,
  priority = false,
  className,
  kenBurns = true,
}: VideoBackdropProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // Set once this backdrop has actually been asked to play. See `preload`.
  const [engaged, setEngaged] = useState(false);

  // Which file (if any) this device should load. Derived from live browser
  // state, so it re-evaluates if the viewport or motion preference changes.
  const getSrc = useCallback(() => {
    if (window.matchMedia?.(REDUCED_QUERY).matches) return null;

    const connection = (
      navigator as Navigator & { connection?: NetworkInformation }
    ).connection;
    if (connection?.saveData) return null;
    if (connection?.effectiveType && /^(slow-)?2g$/.test(connection.effectiveType)) {
      return null;
    }

    return window.matchMedia(WIDE_QUERY).matches ? srcDesktop : srcMobile;
  }, [srcDesktop, srcMobile]);

  // Server render (and first client paint) is poster-only.
  const resolvedSrc = useSyncExternalStore(subscribeToMedia, getSrc, () => null);
  const src = failed ? null : resolvedSrc;

  // Only play while on screen and while the tab is visible.
  useEffect(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video || !src) return;

    // Starts closed on purpose. `sync()` runs once immediately below, and
    // `play()` forces a download whatever `preload` says — so assuming the
    // element is on screen before the observer has confirmed it would fetch
    // every backdrop on the page at load, which is the cost `preload="none"`
    // is there to avoid. Without an observer there is nothing to wait for.
    let onScreen = typeof IntersectionObserver === "undefined";

    const sync = () => {
      const shouldPlay = onScreen && !document.hidden;
      if (shouldPlay) {
        setEngaged(true);
        // Autoplay can be refused; the poster remains in that case.
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              onScreen = entries[0]?.isIntersecting ?? true;
              sync();
            },
            { threshold: 0.01 },
          )
        : null;

    observer?.observe(el);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [src]);

  return (
    <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* The poster stays, underneath, for as long as the backdrop lives.
          It used to fade to nothing once the video could play, which left the
          section with nothing to show any moment the video had no frame to
          give — and a looping video has such moments: it seeks back to the
          start each time round, and `readyState` drops with it. What you saw
          was a frame, then bare colour. A painting video covers this
          completely, so it costs nothing to leave it there, and the moment
          the video has nothing, this does. */}
      <Image
        src={poster}
        alt={posterAlt}
        fill
        priority={priority}
        sizes="100vw"
        placeholder="blur"
        className={cn(
          "object-cover",
          kenBurns && !ready && "animate-ken-burns motion-reduce:animate-none",
        )}
      />

      {src && (
        <video
          ref={videoRef}
          // Always visible, never waiting on a state flag. A video with no
          // frame yet paints nothing at all, so the poster behind it simply
          // shows through until there is something to draw — which is the
          // same thing the opacity was trying to arrange, without depending
          // on catching a `canplay` that fires exactly once. Miss that event
          // and the old code left the clip invisible for good, which is a
          // still photograph where a moving one belongs.
          className="absolute inset-0 h-full w-full object-cover"
          // `muted` + `playsInline` are what make autoplay legal on iOS.
          muted
          loop
          playsInline
          // The observer below controls play/pause, not download: with
          // `preload="auto"` a backdrop three screens down still pulls its
          // whole file on load. Only the hero — the one already on screen —
          // earns that. The rest fetch when `play()` first reaches them, and
          // the poster covers the gap.
          //
          // Once one *has* been reached, though, it keeps its buffer. On
          // `none` the browser holds no more than it needs, so every time a
          // looping clip wraps to the start it stalls re-fetching what it
          // just played. That costs nothing at load — this only ever turns on
          // for a backdrop already on screen and playing.
          preload={priority || engaged ? "auto" : "none"}
          // Decorative: the poster carries the alternative text.
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onCanPlay={() => setReady(true)}
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
