"use client";

import { useEffect, useRef } from "react";

/**
 * A field of fine, twinkling dots on a canvas.
 *
 * Drawn rather than laid out: the field is ~1,500 dots, and that many DOM
 * nodes would cost more to style and composite than the whole page. Nothing
 * here is interactive or announced — it is texture.
 *
 * The loop is parked whenever the field is off screen, and a reader who has
 * asked for reduced motion gets one static pass instead of the twinkle.
 */
export function Sparkles({
  className,
  color = "#6366f1",
  /** Square pixels of canvas per dot — smaller means a denser field. */
  density = 110,
  /** Scales every dot's radius. The spread of sizes is kept, only its range
      moves, so the field coarsens rather than turning into uniform blobs. */
  size = 1,
}: {
  className?: string;
  color?: string;
  density?: number;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Dot = {
      x: number;
      y: number;
      r: number;
      /** Alpha it settles around, and how far either side of it it swings. */
      base: number;
      amp: number;
      speed: number;
      phase: number;
    };

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const seed = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;

      // Capped at 2: past that the extra dots are smaller than a retina
      // pixel and cost more than they show.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Setting `width`/`height` clears the context state, so the transform
      // and the fill both have to be re-applied here rather than once above.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = color;

      const count = Math.round((width * height) / density);
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (0.45 + Math.random() * 0.85) * size,
        base: 0.28 + Math.random() * 0.47,
        amp: Math.random() * 0.3,
        speed: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const dot of dots) {
        const alpha = reduced
          ? dot.base
          : dot.base + dot.amp * Math.sin((time / 1000) * dot.speed + dot.phase);
        ctx.globalAlpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    // Held to ~30fps. The twinkle is slow enough that the halved frame rate
    // is invisible, and the field is a few thousand arcs a pass.
    let last = 0;
    const tick = (time: number) => {
      if (time - last > 33) {
        draw(time);
        last = time;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || reduced) return;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    seed();
    draw(0);

    // Only twinkle while the band is actually on screen.
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "100px" },
    );
    observer.observe(canvas);

    const resizer = new ResizeObserver(() => {
      seed();
      draw(0);
    });
    resizer.observe(canvas);

    return () => {
      stop();
      observer.disconnect();
      resizer.disconnect();
    };
  }, [color, density, size]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
