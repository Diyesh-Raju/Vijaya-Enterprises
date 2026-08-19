"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "@/components/ui/line-icons";
import { cn } from "@/lib/cn";

/** Fit, then progressively larger. Past ~1.4x the drawing is being upscaled. */
const ZOOM_STEPS = [1, 1.4, 1.8, 2.4] as const;

/**
 * Full-screen look at a single drawing.
 *
 * Built on the native `<dialog>` rather than a positioned overlay: it renders
 * in the browser's top layer, so it is unaffected by the animated `transform`
 * on the `Reveal` wrappers around the plans — a `position: fixed` panel would
 * be trapped inside one of those instead of covering the screen. It also
 * brings the focus trap and Escape handling with it.
 *
 * Zoom changes the drawing's rendered height rather than applying a transform,
 * so the scroll container gains real area to pan around; a scaled transform
 * would leave the overflow unreachable.
 *
 * Closing only dismisses the preview. Nothing navigates, so the reader comes
 * back to the same plan, on the same scroll position.
 */
export function ImagePreview({
  image,
  alt,
  caption,
  open,
  onClose,
}: {
  image: StaticImageData;
  alt: string;
  caption?: string;
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    if (open && !element.open) {
      setZoom(0);
      element.showModal();
    }
    if (!open && element.open) element.close();
  }, [open]);

  // A modal dialog does not stop the page behind it from scrolling.
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [open]);

  const close = () => dialog.current?.close();
  const scale = ZOOM_STEPS[zoom];
  const canZoomIn = zoom < ZOOM_STEPS.length - 1;
  const canZoomOut = zoom > 0;

  return (
    <dialog
      ref={dialog}
      aria-label={alt}
      onClose={onClose}
      // Escape fires `cancel`; let the native close run and report it once.
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      // Anything that is not the drawing or a control is backdrop: clicking it
      // dismisses. Checking the target's ancestry rather than the dialog itself
      // matters, because the panel below covers the whole dialog.
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("[data-keep-open]")) close();
      }}
      className="m-0 h-full max-h-full w-full max-w-full bg-transparent p-0 backdrop:bg-navy-950/85 backdrop:backdrop-blur-sm"
    >
      <div className="relative h-full w-full">
        {/* `m-auto` on the child rather than centring the flex container: with
            justify/align centring, the overflow either side of a zoomed
            drawing cannot be scrolled back to. */}
        <div className="flex h-full w-full overflow-auto p-3 sm:p-5">
          <Image
            src={image}
            alt={alt}
            sizes="100vw"
            data-keep-open
            onClick={() => setZoom((step) => (canZoomIn ? step + 1 : 0))}
            style={{ height: `calc((100svh - 2.5rem) * ${scale})` }}
            className={cn(
              "m-auto w-auto max-w-none rounded-[0.75rem] bg-white",
              canZoomIn ? "cursor-zoom-in" : "cursor-zoom-out",
            )}
          />
        </div>

        <button
          type="button"
          data-keep-open
          onClick={close}
          className="group absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-[0.8125rem] font-semibold text-navy-900 shadow-soft transition-colors duration-300 hover:bg-white sm:left-5 sm:top-5"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1" />
          Back
        </button>

        <div
          data-keep-open
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 p-1 shadow-soft sm:right-5 sm:top-5"
        >
          <button
            type="button"
            onClick={() => setZoom((step) => Math.max(0, step - 1))}
            disabled={!canZoomOut}
            aria-label="Zoom out"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[1.25rem] leading-none text-navy-900 transition-colors duration-200 hover:bg-navy-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            −
          </button>
          <span className="min-w-[3.25rem] text-center text-[0.75rem] font-semibold tabular-nums text-navy-900">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom((step) => Math.min(ZOOM_STEPS.length - 1, step + 1))
            }
            disabled={!canZoomIn}
            aria-label="Zoom in"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[1.25rem] leading-none text-navy-900 transition-colors duration-200 hover:bg-navy-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            +
          </button>
        </div>

        {/* The drawing now reaches the edges, so the caption carries its own
            ground rather than sitting white-on-white. */}
        {caption && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3">
            <span className="rounded-full bg-navy-950/80 px-4 py-1.5 text-center text-[0.8125rem] text-white/90 backdrop-blur-sm">
              {caption}
            </span>
          </p>
        )}
      </div>
    </dialog>
  );
}
