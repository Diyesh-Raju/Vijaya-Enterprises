import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

export type CardStat = {
  /** The figure itself, already formatted — "+5,00,000", "1,200". */
  value: string;
  /** What the figure counts. Omit on a single stat the title already names. */
  label?: string;
};

/**
 * A near-black card with a wash of light coming in over one corner.
 *
 * Adapted from the 21st.dev "Upload UI" card — the surface treatment only. The
 * original is a transient upload dialog, so its close control, progress bar and
 * action buttons went with it; what is left is the shape, the near-black ground
 * and the corner gradient. The wash is brass rather than the original's
 * status colours: every card here says the same kind of thing, so they carry
 * one light instead of three. It is pitched at the original's strength, which
 * reaches the far corner rather than stopping short of it.
 *
 * The gradient sits on its own layer rather than on the card's background, so
 * the ring stays a clean hairline at the corner the wash is brightest.
 *
 * A single unlabelled stat is set as one large figure — the title has already
 * named it. Two or more are set as rows, since each then needs saying what it
 * counts. Those rows lead with the figure and let the label follow it, so the
 * numbers read down one column at the left edge; the figure column is held to
 * a fixed width to keep the labels aligned with each other.
 */
export function GradientCard({
  icon: Icon,
  title,
  stats,
  className,
}: {
  icon: (props: { className?: string }) => ReactElement;
  title: string;
  stats: CardStat[];
  className?: string;
}) {
  const single = stats.length === 1 ? stats[0] : null;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[1.5rem] bg-navy-1000 p-6 ring-1 ring-white/10 sm:rounded-[1.75rem] sm:p-8",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(145%_165%_at_100%_0%,rgba(228,201,146,0.72),rgba(207,176,117,0.40)_32%,rgba(190,160,105,0.17)_56%,transparent_86%)]"
      />

      <div className="relative flex items-start gap-5">
        <Icon className="mt-0.5 h-7 w-7 shrink-0 text-brass-400" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.1875rem] leading-tight text-white sm:text-[1.3125rem]">
            {title}
          </h3>

          {single ? (
            <p className="mt-3">
              <span className="block font-display text-[clamp(2rem,5vw,2.75rem)] leading-[1] text-brass-300">
                {single.value}
              </span>
              {single.label ? (
                <span className="mt-1.5 block text-[0.9375rem] leading-[1.5] text-white/65">
                  {single.label}
                </span>
              ) : null}
            </p>
          ) : (
            <dl className="mt-4 divide-y divide-white/10 border-t border-white/10">
              {stats.map((stat) => (
                <div
                  key={stat.label ?? stat.value}
                  className="flex items-baseline gap-4 py-2.5"
                >
                  <dd className="order-first w-[4.25rem] shrink-0 font-display text-[1.375rem] leading-none text-white sm:w-[4.75rem] sm:text-[1.5rem]">
                    {stat.value}
                  </dd>
                  <dt className="min-w-0 text-[0.9375rem] leading-[1.5] text-white/65">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
