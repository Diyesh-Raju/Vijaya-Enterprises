import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

export type ProofItem = {
  title: string;
  body?: string;
};

/**
 * Numbered proof list — the "why choose Vijaya" pattern used on several
 * pages.
 *
 * Each reason is a discrete rounded card rather than a cell in a hairline
 * grid: a divided grid would leave sharp inner corners and, with a count
 * that does not fill the last row, visible empty cells.
 *
 * Rendered as a definition list so each reason stays associated with its
 * explanation for screen readers.
 */
export function ProofList({
  items,
  onNavy = false,
  columns = 2,
  className,
}: {
  items: readonly ProofItem[];
  onNavy?: boolean;
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-4 sm:gap-5",
        columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
        className,
      )}
    >
      {items.map((item, index) => (
        <Reveal
          key={item.title}
          delay={(index % 3) * 70}
          className={cn(
            "group relative flex flex-col gap-3 overflow-hidden rounded-[1.5rem] border p-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:rounded-[1.75rem] sm:p-9",
            onNavy
              ? "border-white/10 bg-white/[0.04] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08]"
              : "border-line bg-white hover:-translate-y-1 hover:border-navy-200 hover:shadow-lift",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "font-display text-[0.9375rem] tabular-nums",
              onNavy ? "text-brass-400" : "text-brass-600",
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <dt
            className={cn(
              "font-display text-[1.25rem] leading-snug sm:text-[1.375rem]",
              onNavy ? "text-white" : "text-navy-900",
            )}
          >
            {item.title}
          </dt>
          {item.body && (
            <dd
              className={cn(
                "text-[0.9375rem] leading-relaxed",
                onNavy ? "text-navy-100/70" : "text-slate-body",
              )}
            >
              {item.body}
            </dd>
          )}
          {/* Brass rule that draws in on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-x-8 bottom-0 h-px origin-left scale-x-0 bg-brass-500 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 sm:inset-x-9"
          />
        </Reveal>
      ))}
    </dl>
  );
}
