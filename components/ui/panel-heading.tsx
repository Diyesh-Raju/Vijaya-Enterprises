import { cn } from "@/lib/cn";

/**
 * A section heading marked by a rose-gold upright, used on the project pages.
 *
 * Quieter than `SectionHeading` — these panels sit inside a project rather
 * than opening a page, so they carry no eyebrow and no lead. An optional
 * `subtitle` sits under the heading, indented past the upright so it lines up
 * with the word above it.
 */
export function PanelHeading({
  children,
  subtitle,
  className,
}: {
  children: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="flex items-center gap-4 font-display text-[1.75rem] leading-tight text-navy-900 sm:text-[2.125rem]">
        {/* Sized in `em` so the upright tracks the heading at every breakpoint. */}
        <span
          aria-hidden="true"
          className="h-[1.1em] w-1 shrink-0 rounded-full bg-rosegold-500"
        />
        {children}
      </h2>
      {subtitle && (
        <p
          className={cn(
            // 20px clears the 4px upright plus its 16px gap.
            "mt-2 pl-5 text-[0.875rem] font-semibold uppercase tracking-[0.2em]",
            "text-slate-muted",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
