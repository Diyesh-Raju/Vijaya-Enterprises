import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

/**
 * A near-black card with a wash of light coming in over one corner.
 *
 * Adapted from the 21st.dev "Upload UI" card — the surface treatment only. The
 * original is a transient upload dialog, so its close control, progress bar and
 * action buttons went with it; what is left is the shape, the near-black ground
 * and the corner gradient. The wash is brass rather than the original's
 * status colours: every card here says the same kind of thing, so they carry
 * one light instead of three.
 *
 * The gradient sits on its own layer rather than on the card's background, so
 * the ring stays a clean hairline at the corner the wash is brightest.
 */
export function GradientCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: (props: { className?: string }) => ReactElement;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[1.5rem] bg-navy-1000 p-6 ring-1 ring-white/10 sm:rounded-[1.75rem] sm:p-8",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_115%_at_100%_0%,rgba(216,189,133,0.52),rgba(201,169,110,0.17)_40%,transparent_74%)]"
      />

      <div className="relative flex items-start gap-5">
        <Icon className="mt-0.5 h-7 w-7 shrink-0 text-brass-400" />
        <div>
          <h3 className="font-display text-[1.1875rem] leading-tight text-white sm:text-[1.3125rem]">
            {title}
          </h3>
          <p className="mt-2.5 text-[0.9375rem] leading-[1.65] text-white/65">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
