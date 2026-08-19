"use client";

import { useEffect, useRef } from "react";

type CounterProps = {
  to: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  /** Decimal places to hold, for figures like 3.5 acres. */
  decimals?: number;
  className?: string;
  /** Set false to count once and stay put. */
  replay?: boolean;
};

/** Ease-out so the number decelerates into place rather than stopping dead. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts up when scrolled into view, and again each time it is scrolled
 * back to — the count resets once the figure is fully off screen, so
 * returning to the section replays it.
 *
 * The running value is written directly to the DOM node rather than held in
 * state: a count-up changes every frame, and re-rendering React 60 times a
 * second to swap one text node would be pure waste.
 *
 * The final value is rendered on the server, so it is present without
 * JavaScript, correct for screen readers, and never missing from the page if
 * reduced motion is requested or the observer is unavailable.
 */
export function Counter({
  to,
  suffix = "",
  prefix = "",
  durationMs = 1800,
  decimals = 0,
  className = "",
  replay = true,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    const write = (value: number) => {
      el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
    };

    const run = () => {
      cancelAnimationFrame(frame);
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        write(easeOut(progress) * to);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    // Sit at zero until the figure is actually looked at.
    write(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            run();
          } else if (replay && entry.intersectionRatio === 0) {
            // Fully off screen — rewind so the next visit counts again.
            cancelAnimationFrame(frame);
            write(0);
          }
        }
      },
      { threshold: [0, 0.4] },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      // Leave the finished value behind if we unmount mid-count.
      write(to);
    };
  }, [to, durationMs, decimals, prefix, suffix, replay]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${to.toFixed(decimals)}${suffix}`}
    </span>
  );
}
