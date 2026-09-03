"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { observeReveal, prefersReducedMotion } from "@/lib/scroll";
import { cn } from "@/lib/cn";

/**
 * A photograph that is uncovered rather than faded in.
 *
 * Two things happen at once and neither is an opacity fade. A solid brass
 * panel sits over the frame and wipes off it upwards, and behind it the
 * picture is held a fifth too close and eases back to its true size over
 * rather longer than the wipe takes. So the photograph is revealed by
 * something moving off it, and is still settling once the wipe has gone —
 * which is what stops it reading as an image that simply switched on.
 *
 * Both are `transform` on a layer that is already composited, so the whole
 * effect costs one paint of a flat rectangle and nothing per frame. The
 * choreography is in `globals.css` under `.img-reveal`; this only says when.
 *
 * Uncovered unless this says otherwise: the panel and the crop only apply
 * under `data-img`, which is set once the effect runs and only for a reader
 * who has not asked for less motion. No JavaScript, no observer and reduced
 * motion all land on the plain photograph rather than one left behind a
 * brass rectangle.
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
  fill = true,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger in milliseconds, for a grid that uncovers one tile at a time. */
  delay?: number;
  /**
   * Whether the picture inside is a `next/image` with `fill`. Those are laid
   * out against the nearest positioned ancestor, so the wrapper has to *be*
   * that box exactly. A picture with its own intrinsic size — a floor plan,
   * a drawing — needs the wrapper to take its height from the picture
   * instead, which is what `false` does.
   */
  fill?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) return;

    // The attribute and the first read in one synchronous block, so the
    // browser never paints a frame with the panel down over a picture that
    // is already past the fold.
    el.dataset.img = "off";

    const stop = observeReveal(el, (visible) => {
      el.dataset.img = visible ? "on" : "off";
    });

    if (!stop) {
      delete el.dataset.img;
      return;
    }

    return () => {
      stop();
      delete el.dataset.img;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(fill ? "img-reveal" : "img-reveal img-reveal--block", className)}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
