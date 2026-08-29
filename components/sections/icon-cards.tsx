import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

export type IconCardItem = {
  title: string;
  body?: string;
  /**
   * The longer version, shown on the back of the card. Omit it and the card
   * simply does not flip — there is nothing behind it to turn to.
   */
  detail?: string;
  icon: ReactNode;
};

/**
 * Cards that turn over: an emblem, a title and a line on the front; the
 * fuller answer on the navy back.
 *
 * The flip mechanics live in `globals.css` under `.flip-card`, including the
 * part that matters most — on a device that cannot hover, the two faces stop
 * sharing a cell and stack instead, so nothing is hidden. Each card carries
 * `tabIndex` so a keyboard can turn it too; that is what `:focus-within` in
 * the stylesheet is for.
 *
 * Written as a list rather than the definition list this used to be: a `dl`
 * may only nest one `div` between itself and its `dt`, and a flip needs two —
 * one for the perspective, one for the thing being rotated.
 */
export function IconCards({
  items,
  columns = 3,
  className,
}: {
  items: readonly IconCardItem[];
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid gap-4 sm:gap-5",
        columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
        className,
      )}
    >
      {items.map((item, index) => {
        const flips = Boolean(item.detail);

        return (
          <Reveal key={item.title} as="li" delay={(index % 3) * 70}>
            <div
              className={cn(
                "h-full rounded-[1.375rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass-500 sm:rounded-[1.625rem]",
                flips && "flip-card",
              )}
              tabIndex={flips ? 0 : undefined}
            >
              <div className="flip-card-inner">
                {/* Front */}
                <div className="flex h-full flex-col items-center rounded-[1.375rem] border-2 border-navy-600 bg-white/90 p-6 text-center sm:rounded-[1.625rem] sm:p-7">
                  {/* The emblem stands on its own — no frame, no medallion.
                      Drawn a little larger than it was inside one, so losing
                      the ring does not cost it its presence on the card. */}
                  <span className="shrink-0 text-navy-800 [&>svg]:h-14 [&>svg]:w-14">
                    {item.icon}
                  </span>

                  <h3 className="mt-5 font-display text-[1.0625rem] leading-snug text-navy-900 sm:text-[1.1875rem]">
                    {item.title}
                  </h3>
                  {item.body && (
                    <p className="mt-2.5 text-[0.875rem] leading-relaxed text-slate-body">
                      {item.body}
                    </p>
                  )}
                </div>

                {/* Back */}
                {item.detail && (
                  <div className="flip-card-back flex h-full flex-col items-center justify-center rounded-[1.375rem] border-2 border-navy-900 bg-navy-900 p-6 text-center sm:rounded-[1.625rem] sm:p-7">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-brass-400">
                      {item.title}
                    </p>
                    <span
                      aria-hidden="true"
                      className="mt-4 block h-px w-10 bg-brass-500/70"
                    />
                    <p className="mt-4 text-[0.875rem] leading-relaxed text-navy-100/85">
                      {item.detail}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}
