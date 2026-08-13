import { cn } from "@/lib/cn";

/** Defined at module scope: a component created during render would be a new
    type on every pass, forcing React to remount the whole track. */
function Track({
  items,
  onNavy,
  ariaHidden,
}: {
  items: readonly string[];
  onNavy: boolean;
  ariaHidden: boolean;
}) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16"
      aria-hidden={ariaHidden || undefined}
    >
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex shrink-0 items-center gap-4 whitespace-nowrap font-display text-[1.125rem] sm:text-[1.375rem]",
            onNavy ? "text-white/70" : "text-navy-800/70",
          )}
        >
          {item}
          <span
            aria-hidden="true"
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              onNavy ? "bg-brass-500/70" : "bg-brass-500",
            )}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Infinite horizontal ticker.
 *
 * The track holds two identical copies of the list and translates by -50%,
 * so the loop is seamless. The duplicate is hidden from assistive tech to
 * avoid reading every item twice.
 */
export function Marquee({
  items,
  className,
  onNavy = false,
}: {
  items: readonly string[];
  className?: string;
  onNavy?: boolean;
}) {
  return (
    <div className={cn("fade-edges group relative overflow-hidden", className)}>
      <div className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        <Track items={items} onNavy={onNavy} ariaHidden={false} />
        <Track items={items} onNavy={onNavy} ariaHidden />
      </div>
    </div>
  );
}
