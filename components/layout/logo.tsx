/**
 * Wordmark + monogram.
 *
 * Drawn in `currentColor` so the same component works on white and on
 * navy without a second asset. Swap the <svg> for the real Vijaya mark
 * when the artwork is available — the layout around it will not change.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Rounded badge — nothing on this site has a sharp corner */}
      <rect
        x="1.25"
        y="1.25"
        width="45.5"
        height="45.5"
        rx="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        opacity="0.35"
      />
      {/* The V, drawn as a roofline sitting on a foundation line */}
      <path
        d="M13 15.5 L24 33.5 L35 15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 36.5 H30.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function Logo({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <LogoMark className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.25rem] tracking-tight sm:text-[1.4rem]">
          Vijaya
        </span>
        <span
          className={`mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.28em] opacity-70 sm:text-[0.55rem] ${
            compact ? "hidden sm:block" : ""
          }`}
        >
          Enterprises
        </span>
      </span>
    </span>
  );
}
