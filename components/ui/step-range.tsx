"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * A two-handle range that snaps to named benchmarks rather than sliding freely.
 *
 * The stops are the benchmarks; the gaps between them are the bands a visitor
 * can pick — four stops give three bands. Handles are positioned by their index
 * rather than by value, so every band is the same width on the rail. Placing
 * them by value would squeeze 1,500-2,500 into a sliver next to 5,000-10,000
 * and make the first band nearly unclickable.
 *
 * `value` is a pair of indices into `stops`, held at least one band apart, so
 * the control can never collapse to a single point.
 */
export function StepRange({
  label,
  stops,
  value,
  onChange,
  format,
}: {
  label: string;
  /** Ordered benchmarks. Consecutive pairs are the selectable bands. */
  stops: readonly number[];
  /** `[low, high]` indices into `stops`. */
  value: readonly [number, number];
  onChange: (value: [number, number]) => void;
  /** How a stop reads to a person, e.g. `1500` → "1,500". */
  format: (stop: number) => string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const dragging = useRef<0 | 1 | null>(null);
  const last = stops.length - 1;
  const [low, high] = value;

  const percent = (index: number) => (index / last) * 100;

  /** Which stop the pointer is nearest, clamped to the rail. */
  const stopAt = (clientX: number) => {
    const box = rail.current?.getBoundingClientRect();
    if (!box) return 0;
    const along = (clientX - box.left) / box.width;
    return Math.max(0, Math.min(last, Math.round(along * last)));
  };

  /** Move one handle, keeping the pair at least one band apart. */
  const moveHandle = (handle: 0 | 1, index: number) => {
    if (handle === 0) onChange([Math.min(index, high - 1), high]);
    else onChange([low, Math.max(index, low + 1)]);
  };

  const nearestHandle = (index: number): 0 | 1 =>
    Math.abs(index - low) <= Math.abs(index - high) ? 0 : 1;

  const onArrowKey = (handle: 0 | 1) => (event: React.KeyboardEvent) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? -1
          : 0;

    if (step) {
      event.preventDefault();
      moveHandle(handle, value[handle] + step);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      moveHandle(handle, event.key === "Home" ? 0 : last);
    }
  };

  const handleProps = (handle: 0 | 1) => ({
    type: "button" as const,
    role: "slider",
    "aria-label": `${label}, ${handle === 0 ? "lower" : "upper"} benchmark`,
    "aria-valuemin": 0,
    "aria-valuemax": last,
    "aria-valuenow": value[handle],
    "aria-valuetext": format(stops[value[handle]]),
    onKeyDown: onArrowKey(handle),
    style: { left: `${percent(value[handle])}%` },
    className:
      "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full " +
      "border-2 border-white bg-rosegold-600 shadow-md transition-shadow hover:shadow-lg " +
      "active:cursor-grabbing focus-visible:outline focus-visible:outline-2 " +
      "focus-visible:outline-offset-2 focus-visible:outline-rosegold-600",
  });

  return (
    <div className="rounded-full border border-line bg-white/60 px-5 py-3 shadow-sm backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[0.75rem] font-medium text-navy-900">
          {format(stops[low])}
        </span>
        <span aria-hidden="true" className="text-[0.625rem] text-slate-muted">
          —
        </span>
        <span className="text-[0.75rem] font-medium text-navy-900">
          {format(stops[high])}
        </span>
      </div>

      <div
        ref={rail}
        onPointerDown={(event) => {
          const index = stopAt(event.clientX);
          const handle = nearestHandle(index);
          dragging.current = handle;
          moveHandle(handle, index);
          // A press that lands and lifts in the same frame has no pointer left
          // to capture. The press itself has already been honoured above, so
          // losing the capture costs the drag, not the selection.
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            dragging.current = null;
          }
        }}
        onPointerMove={(event) => {
          if (dragging.current !== null)
            moveHandle(dragging.current, stopAt(event.clientX));
        }}
        onPointerUp={() => {
          dragging.current = null;
        }}
        onPointerCancel={() => {
          dragging.current = null;
        }}
        className="relative h-1.5 cursor-pointer touch-none select-none rounded-full bg-line-strong"
      >
        {/* The benchmarks themselves, so the snapping reads as deliberate. */}
        {stops.map((stop, index) => (
          <span
            key={stop}
            aria-hidden="true"
            style={{ left: `${percent(index)}%` }}
            className={cn(
              "absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full",
              index >= low && index <= high ? "bg-white/70" : "bg-white",
            )}
          />
        ))}

        <span
          aria-hidden="true"
          style={{ left: `${percent(low)}%`, width: `${percent(high) - percent(low)}%` }}
          className="absolute h-full rounded-full bg-rosegold-600/60"
        />

        <button {...handleProps(0)} />
        <button {...handleProps(1)} />
      </div>
    </div>
  );
}
