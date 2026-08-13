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

    let onScreen = true;

    const sync = () => {
      const shouldPlay = onScreen && !document.hidden;
      if (shouldPlay) {
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
      <Image
        src={poster}
        alt={posterAlt}
        fill
        priority={priority}
        sizes="100vw"
        placeholder="blur"
        className={cn(
          "object-cover transition-opacity duration-1000",
          ready ? "opacity-0" : "opacity-100",
          kenBurns && !ready && "animate-ken-burns motion-reduce:animate-none",
        )}
      />

      {src && (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
            ready ? "opacity-100" : "opacity-0",
          )}
          // `muted` + `playsInline` are what make autoplay legal on iOS.
          muted
          loop
          playsInline
          preload="auto"
          // Decorative: the poster carries the alternative text.
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onCanPlay={() => setReady(true)}
          onError={() => setFailed(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
