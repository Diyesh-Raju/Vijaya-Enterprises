"use client";

import { useEffect, useRef } from "react";

type CounterProps = {
  to: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
};

/** Ease-out so the number decelerates into place rather than stopping dead. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts up once, when scrolled into view.
 *
 * The running value is written directly to the DOM node rather than held in
 * state — a count-up updates every frame, and re-rendering React 60 times a
 * second to change one text node would be pure waste.
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
  className = "",
}: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    const write = (value: number) => {
      el.textContent = `${prefix}${value}${suffix}`;
    };

    // Start from zero only once we know we are going to animate.
    write(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();

          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            write(Math.round(easeOut(progress) * to));
            if (progress < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      // Leave the finished value behind if we unmount mid-count.
      write(to);
    };
  }, [to, durationMs, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${to}${suffix}`}
    </span>
  );
}
