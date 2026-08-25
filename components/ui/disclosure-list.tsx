"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/line-icons";
import { cn } from "@/lib/cn";

export type DisclosureItem = {
  title: string;
  body: string;
};

/** The ground the list is set on, named the way `Section` names its own. */
type Tone = "light" | "navy";

/**
 * What stands beside a question, and therefore how the row is arranged.
 *
 * `plus` is a bare mark leading the row — quiet enough for a list that sits
 * inside a panel of running copy. `chevron` is a filled disc trailing it,
 * which is the louder of the two: it holds the right-hand edge of a full-width
 * list and points at what pressing it does.
 */
type Marker = "plus" | "chevron";

const tones: Record<
  Tone,
  {
    rule: string;
    mark: string;
    disc: string;
    title: string;
    titleOpen: string;
    body: string;
  }
> = {
  light: {
    rule: "border-navy-900/20",
    mark: "bg-navy-900",
    disc: "bg-navy-900 text-white group-hover:bg-navy-800",
    title: "text-navy-900 group-hover:text-navy-950",
    titleOpen: "text-navy-950",
    body: "text-navy-900/75",
  },
  navy: {
    rule: "border-white/20",
    mark: "bg-white/85",
    disc: "bg-white text-navy-900 group-hover:bg-navy-100",
    title: "text-white/70 group-hover:text-white",
    titleOpen: "text-white",
    body: "text-navy-100/80",
  },
};

/**
 * A list of headings that open one at a time.
 *
 * One open at a time rather than many: the list sits in a fixed panel beside
 * a photograph, and letting every answer open at once would push the last
 * heading off the bottom of it. Opening one closes the one before, so the
 * block's height only ever moves by the difference between two answers.
 *
 * The open one can be closed again, which is why the state is an index and
 * not a "which is open" that must always name something.
 *
 * Heights are animated with a `0fr → 1fr` grid row rather than by measuring
 * the answer and animating `max-height`. A guessed maximum either clips a
 * long answer or spends the first half of the transition on empty space; the
 * grid row animates to whatever the content actually is, with nothing to
 * measure and nothing to keep in sync when the text changes.
 */
export function DisclosureList({
  items,
  className,
  tone = "light",
  marker = "plus",
  /** Which item stands open before anything is clicked. -1 for none. */
  initial = 0,
}: {
  items: readonly DisclosureItem[];
  className?: string;
  tone?: Tone;
  marker?: Marker;
  initial?: number;
}) {
  const [open, setOpen] = useState(initial);
  const id = useId();
  const palette = tones[tone];

  return (
    <ul className={cn("w-full", className)}>
      {items.map((item, index) => {
        const isOpen = index === open;
        const panelId = `${id}-${index}`;

        return (
          <li
            key={item.title}
            className={cn("border-t last:border-b", palette.rule)}
          >
            {/* The heading is the control. A button inside an `h3` keeps the
                list navigable by heading for a screen reader while still
                being one thing to press. */}
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                // The row's height is the list's whole vertical budget, so it
                // is left adjustable: a caller that has to fit the list into
                // a fixed panel sets `--disclosure-row-py` and everything
                // else about the list stays as it is.
                className={cn(
                  "group flex w-full items-center gap-4 py-[var(--disclosure-row-py,1rem)] text-left sm:gap-5 sm:py-[var(--disclosure-row-py,1.125rem)]",
                  marker === "chevron" && "justify-between",
                )}
              >
                {marker === "plus" && (
                  /* A plus whose upright falls to meet its bar, so the mark
                     becomes a minus without a second icon crossfading in. */
                  <span
                    aria-hidden="true"
                    className="relative mt-px h-3.5 w-3.5 shrink-0"
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-px w-full -translate-y-1/2",
                        palette.mark,
                      )}
                    />
                    <span
                      className={cn(
                        "absolute left-1/2 top-0 h-full w-px -translate-x-1/2",
                        palette.mark,
                        "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isOpen ? "rotate-90" : "rotate-0",
                      )}
                    />
                  </span>
                )}

                <span
                  className={cn(
                    "font-sans font-medium leading-snug tracking-[-0.01em] transition-colors duration-300",
                    // The disc variant carries a page; the plus variant is a
                    // list inside a panel of running copy, and has to sit
                    // under it rather than compete with it.
                    marker === "chevron"
                      ? "text-[1.0625rem] sm:text-[1.25rem]"
                      : "text-[1.0625rem] sm:text-[1.1875rem]",
                    isOpen ? palette.titleOpen : palette.title,
                  )}
                >
                  {item.title}
                </span>

                {marker === "chevron" && (
                  /* One arrow that turns over rather than two that swap: the
                     same mark points down at a closed answer and up at an
                     open one, so the control reads as a thing being turned. */
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:h-11 sm:w-11",
                      palette.disc,
                    )}
                  >
                    <ChevronDownIcon
                      className={cn(
                        "h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isOpen ? "-rotate-180" : "rotate-0",
                      )}
                    />
                  </span>
                )}
              </button>
            </h3>

            <div
              id={panelId}
              // Not `hidden` while shut: the row is what animates, and an
              // element that is display:none has no height to animate from.
              // `visibility` is what takes the closed answer out of the tab
              // order and off the accessibility tree instead.
              className={cn(
                "grid transition-[grid-template-rows,opacity,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen
                  ? "visible grid-rows-[1fr] opacity-100"
                  : "invisible grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                {/* Held back from its heading, but in the same colour family
                    — an answer that changes hue reads as a different kind of
                    thing rather than as the quieter half of one. */}
                <p
                  className={cn(
                    "pb-5 text-[0.9375rem] leading-[1.7] sm:text-[1rem]",
                    // Set under the question, wherever the question starts:
                    // indented past a leading mark, or held clear of a
                    // trailing disc.
                    marker === "plus"
                      ? "pl-[1.875rem] pr-2 sm:pl-[2.125rem]"
                      : "pr-14 sm:pr-16",
                    palette.body,
                  )}
                >
                  {item.body}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
