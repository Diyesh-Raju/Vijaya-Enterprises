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
  /**
   * Group the digits the Indian way — 10,00,000, 1,500. Off by default:
   * most figures on the site are small enough not to want a comma, and some
   * are deliberately written without one ("1200+").
   */
  grouping?: boolean;
};

/** Ease-out so the number decelerates into place rather than stopping dead. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * One formatter for the server's render and every frame of the count, so
 * the figure the count lands on is character for character the one that was
 * sent. `en-IN` for the lakh grouping; rounding to `decimals` either way.
 */
const formatter = (decimals: number, grouping: boolean) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  });

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
 * JavaScript, and never missing from the page if reduced motion is requested
 * or the observer is unavailable.
 *
 * A screen reader is given the final value on its own and never the count:
 * the moving figure is hidden from it, and a visually hidden copy of the
 * finished one stands in. Otherwise a figure not yet scrolled to reads as
 * zero — "0+ Years of Vijaya" — to anyone navigating by headings.
 */
export function Counter({
  to,
  suffix = "",
  prefix = "",
  durationMs = 1800,
  decimals = 0,
  className = "",
  replay = true,
  grouping = false,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const final = `${prefix}${formatter(decimals, grouping).format(to)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    const format = formatter(decimals, grouping);
    const write = (value: number) => {
      el.textContent = `${prefix}${format.format(value)}${suffix}`;
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
  }, [to, durationMs, decimals, prefix, suffix, replay, grouping]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
