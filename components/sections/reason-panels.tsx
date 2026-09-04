"use client";

import Image, { type StaticImageData } from "next/image";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type ReasonPanel = {
  title: string;
  body: string;
  image: StaticImageData;
  imageAlt: string;
  /**
   * Where to hold the photograph. Closed, a panel is about a fifth of its open
   * width, so a landscape original loses nearly all of it and `object-position`
   * decides which part survives. Unset, the crop is centred.
   */
  focus?: string;
  /**
   * Where to hold it while the panel is a slat, when the open hold will not do.
   * A photograph rarely needs this — any crop of one is still a photograph. A
   * picture carrying type does: the hold that frames a lockup in the open panel
   * saws it in half at a fifth of the width, and the slat wants aiming at a
   * clear part of the ground instead. Unset, the slat keeps `focus`.
   */
  focusClosed?: string;
};

/**
 * The reasons to partner with us, as one photographic accordion: one panel
 * open and the rest standing beside it as narrow slats, each named down its
 * own edge. Clicking a slat opens it and closes the one that was open.
 *
 * ## The movement
 *
 * Three transitions run against each other, and the whole thing is tuned so
 * they land together on 900ms:
 *
 * - **The panel** takes 900ms on `--ease-out-soft`. That curve is heavily
 *   front-loaded — about three-quarters of the width is travelled in the
 *   first quarter of a second — so the panel appears to spring open and then
 *   glide the last stretch into place. It is the glide, not the spring, that
 *   reads as "smooth", and shortening the 900ms to meet the eye loses it.
 * - **The name down the edge** leaves the opening panel at once (200ms) and
 *   arrives on the closing one late (500ms, held back 400ms).
 * - **The copy** arrives on the opening panel late (700ms, held back 200ms)
 *   and leaves the closing one at once (300ms).
 *
 * Both pairs are deliberately asymmetric, and that is the whole trick: at
 * every moment exactly one of the two labels is legible. Whichever word is
 * leaving goes immediately and the word replacing it waits for the space to
 * be empty, so the two never cross-fade through each other. CSS gives this
 * for free — a transition is read off the state being moved *to*, so the
 * open and closed class sets can each carry their own duration and delay.
 *
 * A panel carrying `focusClosed` pans between its two holds instead of cutting
 * between them, on the panel's own 900ms and curve, so the crop travels with
 * the width rather than jumping at the moment the class changes.
 *
 * The copy block is set to a fixed width rather than to the panel's. A block
 * sized to the panel re-wraps on every frame as the panel narrows, and the
 * paragraph collapses into a tall ladder of single words on its way out.
 * Fixed, it is simply clipped by the panel's edge while it fades — the words
 * hold their lines the whole way.
 *
 * The two grades are two layers crossfading, not one layer changing colour:
 * a flat wash to hold the name on a closed slat, and a ramp up from the foot
 * to hold the copy on an open one. `background-image` cannot be transitioned,
 * so a single layer swapping between them would snap.
 */
export function ReasonPanels({ items }: { items: readonly ReasonPanel[] }) {
  const [open, setOpen] = useState(0);
  const panelId = useId();
  const total = String(items.length).padStart(2, "0");

  return (
    <ul
      className={cn(
        "flex flex-col gap-3",
        // From `lg` the row is measured against the window, so the open panel
        // carries the screen. Capped, or it runs away on a tall display.
        "lg:h-[min(78svh,44rem)] lg:flex-row",
      )}
    >
      {items.map((item, index) => {
        const isOpen = index === open;
        const id = `${panelId}-${index}`;

        return (
          <li
            key={item.title}
            className={cn(
              "group relative isolate overflow-hidden rounded-[1.25rem] bg-navy-900 sm:rounded-[1.5rem]",
              "transition-[flex-grow,height] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              // Open: about six and a half times a closed slat, which leaves
              // roughly 44rem of panel at desktop and 7rem of slat.
              isOpen
                ? "h-[24rem] sm:h-[30rem] lg:h-auto lg:flex-[6.5]"
                : "h-[5.5rem] lg:h-auto lg:flex-[1]",
            )}
          >
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              /* Deliberately constant, and sized for the open panel rather
                 than the slat. Sized per state, the browser would pick a new
                 source the moment a panel was clicked and swap the picture
                 mid-movement — the one thing that would show. */
              sizes="(max-width: 1024px) 100vw, 60vw"
              placeholder="blur"
              style={{
                objectPosition:
                  (isOpen ? item.focus : (item.focusClosed ?? item.focus)) ||
                  undefined,
              }}
              className={cn(
                "object-cover group-hover:scale-[1.04] motion-reduce:group-hover:scale-100",
                "transition-[transform,object-position] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                // The pan has to finish with the panel, not 300ms after it.
                item.focusClosed && "duration-[900ms]",
              )}
            />

            {/* Closed: a flat wash, deep enough to carry the name over any
                part of any photograph, lifting a little under the pointer so
                a slat answers when it is pointed at.

                55% is as far as this should go. It was briefly 62%, to fix a
                name crossing a bright patch, and that bought contrast for a
                few letters at the cost of every slat's photograph — the slats
                went to near-black rectangles. The patch was the picture's
                fault, not the wash's, and re-framing that crop fixed it: the
                brightest ground any name now crosses measures 81 of 255,
                about 6:1 under white. */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 bg-black/55 transition-[opacity,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen ? "opacity-0" : "opacity-100 group-hover:bg-black/40",
              )}
            />

            {/* Open: one black ramp, really present only at the foot of the
                panel under the copy, so the top of every photograph keeps its
                own colour. No navy — the site's blue over a photograph turns
                a sunset cold and a brick wall grey. */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 via-55% to-transparent transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen ? "opacity-100" : "opacity-0",
              )}
            />

            {/* The name down the edge. Horizontal below `lg`, where a closed
                panel is a wide bar rather than a slat. */}
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity lg:items-end lg:pb-10",
                isOpen
                  ? "opacity-0 duration-200"
                  : "opacity-100 duration-500 delay-[400ms]",
              )}
            >
              {/* Not load-bearing at these six photographs — it is here for
                  the next ones. The brief is to replace this stock with
                  Vijaya's own project photography, and a brighter frame than
                  any of these would put a name back under 4.5:1. Wide and
                  soft enough to read as the picture darkening beneath the
                  word rather than as a drop shadow. */}
              <span className="font-display text-[0.75rem] uppercase tracking-[0.25em] text-white/95 [text-shadow:0_0_14px_rgba(0,0,0,0.85)] sm:text-[0.8125rem] lg:hidden">
                {item.title}
              </span>
              <span
                className="hidden whitespace-nowrap font-display text-[0.75rem] uppercase tracking-[0.25em] text-white/95 [text-shadow:0_0_14px_rgba(0,0,0,0.85)] [writing-mode:vertical-rl] lg:inline-block"
                style={{ transform: "rotate(180deg)" }}
              >
                {item.title}
              </span>
            </span>

            {/* The copy. `justify-end` sits it on the deepest part of the ramp,
                and the inner block is the fixed-width one that keeps the
                paragraph from re-wrapping as the panel closes. */}
            <div
              id={id}
              className={cn(
                "pointer-events-none absolute inset-0 flex flex-col justify-end p-6 transition-opacity sm:p-8 lg:p-10 xl:p-12",
                isOpen
                  ? "opacity-100 duration-700 delay-200"
                  : "opacity-0 duration-300",
              )}
            >
              <div className="w-full lg:w-[21rem] xl:w-[30rem]">
                <p className="font-display text-[0.6875rem] font-semibold uppercase tabular-nums tracking-[0.35em] text-brass-400">
                  {String(index + 1).padStart(2, "0")}
                  <span className="mx-2 text-brass-400/60">—</span>
                  {total}
                </p>

                <h3 className="mt-4 font-display text-[1.5rem] leading-[1.15] text-white lg:text-[1.75rem] xl:text-[2.25rem]">
                  {item.title}
                </h3>

                {/* Drawn in from the left as the panel opens, on the panel's
                    own 900ms so the rule finishes with it. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-5 block h-px w-[4.5rem] origin-left bg-brass-500 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isOpen ? "scale-x-100" : "scale-x-0",
                  )}
                />

                <p className="mt-6 text-[0.9375rem] leading-relaxed text-navy-100/85 sm:text-[1rem]">
                  {item.body}
                </p>
              </div>
            </div>

            {/* The whole panel is the control, but it is a button laid over
                the panel rather than a button wrapped around it: a heading and
                a paragraph are not phrasing content and cannot legally sit
                inside `<button>`. This way the copy stays a real heading and a
                real paragraph, and the control keeps a name of its own. */}
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={id}
              onClick={() => setOpen(index)}
              className="absolute inset-0 z-10 w-full cursor-pointer rounded-[1.25rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass-500 sm:rounded-[1.5rem]"
            >
              <span className="sr-only">{item.title}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
