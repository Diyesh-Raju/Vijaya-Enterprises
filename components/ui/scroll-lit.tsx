"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

type ScrollLitProps = {
  /** Plain text — it is split on whitespace, one span per word. */
  children: string;
  className?: string;
  /**
   * How many words the leading edge is spread over. One would be a switch
   * flicking down the paragraph; a couple of words makes it a sweep.
   */
  feather?: number;
  /** Where the paragraph's top edge starts lighting, as a share of the screen. */
  from?: number;
  /** Where its bottom edge finishes, as a share of the screen. */
  to?: number;
};

/**
 * A paragraph that lights word by word as the page is scrolled through it.
 *
 * One number does the whole sweep. This writes progress into `--lit` on the
 * paragraph and each word works out its own share of it in CSS, from its
 * index and the count — see `.scroll-lit` in `globals.css`. So a frame of
 * scrolling is one custom property write, not a pass over fifty spans, and
 * nothing here re-renders: the value goes straight onto the node.
 *
 * The run is deliberately longer than the paragraph. It opens when the first
 * line is still low on the screen and closes only once the whole block has
 * climbed past `to`, which on this page is a screen after the section below
 * has come into frame — the sweep finishes under the next section rather
 * than racing ahead of the reader.
 *
 * Undimmed unless this says otherwise: the stylesheet's default is the
 * finished paragraph, and `data-lit` is only set once the effect runs and
 * only for a reader who has not asked for less motion. No JavaScript, no
 * observer, reduced motion — every one of those paths gets plain dark text
 * rather than a paragraph stuck pale.
 */
export function ScrollLit({
  children,
  className,
  feather = 2.5,
  from = 0.82,
  to = 0.3,
}: ScrollLitProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const words = children.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.lit = "on";

    let frame = 0;

    const tick = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * from;
      // The whole paragraph has to clear the finish mark, not just its top
      // edge, so its own height is part of the distance to be travelled.
      const run = start - vh * to + box.height;
      const progress = run > 0 ? (start - box.top) / run : 1;
      el.style.setProperty("--lit", `${Math.min(Math.max(progress, 0), 1)}`);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      delete el.dataset.lit;
    };
  }, [from, to]);

  return (
    <p
      ref={ref}
      className={cn("scroll-lit", className)}
      style={
        {
          "--words": words.length,
          "--feather": feather,
        } as CSSProperties
      }
    >
      {words.map((word, index) => (
        // The space rides inside the span rather than between them, so the
        // paragraph wraps and reads exactly as it would unsplit.
        <span key={`${index}-${word}`} style={{ "--i": index } as CSSProperties}>
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
