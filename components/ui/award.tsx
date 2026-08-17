import type React from "react";
import { cn } from "@/lib/cn";

/**
 * Award / trust seal — a laurel-wreath lockup.
 *
 * Implements the 21st.dev `AwardsComponentProps` API. Two deliberate
 * departures from the published source:
 *
 *  • Icons are inline SVG rather than `lucide-react`. The wreath is custom
 *    artwork either way, and the rest of this site ships no runtime
 *    dependencies beyond React — one package for two glyphs is not worth it.
 *  • `cn` comes from `@/lib/cn` (this project's helper) rather than the
 *    shadcn `@/lib/utils` path, which does not exist here.
 *
 * Sizing: every dimension inside is expressed in `em`, so the whole lockup
 * scales from a single font-size on the root. Pass e.g. `className="text-[11px]"`
 * to compress it into a small box, or `text-[16px]` to let it breathe.
 */

export interface AwardsComponentProps {
  variant?: "stamp" | "award" | "certificate" | "badge" | "sticker" | "id-card";
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  recipient?: string;
  level?: "bronze" | "silver" | "gold" | "platinum";
  className?: string;
  showIcon?: boolean;
  customIcon?: React.ReactNode;
  /**
   * Text inside the top chip. Defaults to the level name, which is right for
   * a competition result — override it when the seal states something else.
   */
  badgeLabel?: string;
  /**
   * Frame treatment. `rosegold` swaps the plain hairline for the metallic
   * gradient border. A prop rather than a class so it replaces the default
   * border outright, instead of relying on which utility Tailwind emits last.
   */
  accent?: "none" | "rosegold";
}

const levelStyles: Record<
  NonNullable<AwardsComponentProps["level"]>,
  { chip: string; text: string; wreath: string }
> = {
  bronze: {
    chip: "bg-gradient-to-b from-[#c08b52] to-[#8a6033]",
    text: "text-white",
    wreath: "text-[#8a6033]",
  },
  silver: {
    chip: "bg-gradient-to-b from-[#d7dce3] to-[#9aa3ae]",
    text: "text-navy-950",
    wreath: "text-navy-700",
  },
  gold: {
    chip: "bg-gradient-to-b from-brass-400 to-brass-600",
    text: "text-navy-950",
    wreath: "text-navy-900",
  },
  platinum: {
    chip: "bg-gradient-to-b from-navy-100 to-navy-300",
    text: "text-navy-950",
    wreath: "text-navy-800",
  },
};

const frames: Record<NonNullable<AwardsComponentProps["variant"]>, string> = {
  award: "border border-line bg-white",
  badge: "border border-line bg-white",
  stamp: "border border-dashed border-brass-500/60 bg-mist",
  certificate: "border-2 border-double border-brass-500/70 bg-white",
  sticker: "border border-line bg-mist",
  "id-card": "border border-line-strong bg-white",
};

/* ------------------------------------------------------------------ wreath */

// A laurel branch traced along a quadratic Bézier, with leaves set on the
// curve's normal and tapering toward the tip. Computed once at module load.
// Tuned so the branch fills its viewBox: a wide outward sweep, leaves large
// relative to the stem, and only a gentle taper so the frond reads as full.
const P0 = { x: 56, y: 126 };
const P1 = { x: 0, y: 88 };
const P2 = { x: 30, y: 5 };

const pointAt = (t: number) => {
  const m = 1 - t;
  return {
    x: m * m * P0.x + 2 * m * t * P1.x + t * t * P2.x,
    y: m * m * P0.y + 2 * m * t * P1.y + t * t * P2.y,
  };
};

const tangentAt = (t: number) => {
  const m = 1 - t;
  return {
    x: 2 * m * (P1.x - P0.x) + 2 * t * (P2.x - P1.x),
    y: 2 * m * (P1.y - P0.y) + 2 * t * (P2.y - P1.y),
  };
};

const leaves = (() => {
  const out: { x: number; y: number; angle: number; rx: number; ry: number }[] = [];
  const count = 11;

  for (let i = 0; i < count; i++) {
    const t = 0.08 + (i / (count - 1)) * 0.86;
    const point = pointAt(t);
    const tangent = tangentAt(t);
    const length = Math.hypot(tangent.x, tangent.y) || 1;
    const normal = { x: -tangent.y / length, y: tangent.x / length };
    const baseAngle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;

    // Bell-shaped taper: smallest at the base and the tip, fullest through
    // the middle. A linear taper piles overlapping leaves into a solid blob
    // where the curve is steepest near the stem.
    const taper = 0.58 + 0.42 * Math.sin(Math.PI * t);
    const rx = 13 * taper;
    const ry = 5.1 * taper;
    const offset = 7.5 * taper;

    for (const side of [-1, 1]) {
      out.push({
        x: point.x + normal.x * offset * side,
        y: point.y + normal.y * offset * side,
        angle: baseAngle + side * 30,
        rx,
        ry,
      });
    }
  }

  return out;
})();

function LaurelBranch() {
  return (
    <g>
      <path
        d={`M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {leaves.map((leaf, index) => (
        <ellipse
          key={index}
          cx={leaf.x}
          cy={leaf.y}
          rx={leaf.rx}
          ry={leaf.ry}
          fill="currentColor"
          transform={`rotate(${leaf.angle} ${leaf.x} ${leaf.y})`}
        />
      ))}
    </g>
  );
}

function Wreath({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-8 -4 84 138"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <LaurelBranch />
    </svg>
  );
}

/* ------------------------------------------------------------------- icons */

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45L2.6 9.45l6.5-.95L12 2.6z"
        fill="currentColor"
      />
    </svg>
  );
}

/* --------------------------------------------------------------- component */

export function AwardsComponent({
  variant = "award",
  title,
  subtitle,
  description,
  date,
  recipient,
  level = "gold",
  className,
  showIcon = false,
  customIcon,
  badgeLabel,
  accent = "none",
}: AwardsComponentProps) {
  const style = levelStyles[level];
  const chipText = badgeLabel ?? level.toUpperCase();

  return (
    <div
      className={cn(
        // `text-[…]` here is the master scale for everything below.
        "relative isolate flex items-center justify-center overflow-hidden rounded-[1.5rem] px-[1.5em] py-[1.75em] text-[13px] sm:rounded-[1.75rem] sm:text-[14px]",
        accent === "rosegold" ? "border-rosegold" : frames[variant],
        className,
      )}
    >
      {/* `items-center`, and the wreaths sized by height: stretching them
          would letterbox the drawing inside a tall box and shrink it. */}
      <div className="flex items-center justify-center gap-[0.35em]">
        <Wreath className={cn("h-[7.6em] w-auto shrink-0", style.wreath)} />

        <div className="flex flex-col items-center justify-center text-center">
          <span
            className={cn(
              "rounded-full px-[1.1em] py-[0.35em] text-[0.72em] font-bold uppercase tracking-[0.14em]",
              style.chip,
              style.text,
            )}
          >
            {chipText}
          </span>

          <span className="mt-[0.55em] font-sans text-[1.7em] font-extrabold uppercase leading-none tracking-[-0.01em] text-navy-950">
            {title}
          </span>

          <span
            aria-hidden="true"
            className="mt-[0.5em] h-px w-full max-w-[11em] bg-navy-900/25"
          />

          {(showIcon || customIcon) && (
            <span className="mt-[0.6em] inline-flex text-brass-600">
              {customIcon ?? <StarIcon className="h-[1.1em] w-[1.1em]" />}
            </span>
          )}

          {subtitle && (
            <span className="mt-[0.6em] max-w-[13em] text-[0.95em] font-medium leading-snug text-navy-900">
              {subtitle}
            </span>
          )}

          {description && (
            <span className="mt-[0.35em] max-w-[13em] text-[0.86em] leading-snug text-slate-body">
              {description}
            </span>
          )}

          {recipient && (
            <span className="mt-[0.6em] font-display text-[0.95em] italic leading-none text-slate-body">
              {recipient}
            </span>
          )}

          {date && (
            <span className="mt-[0.4em] text-[0.95em] font-bold leading-none text-navy-950">
              {date}
            </span>
          )}
        </div>

        {/* Mirrored so the two branches meet symmetrically. */}
        <Wreath
          className={cn("h-[7.6em] w-auto shrink-0 -scale-x-100", style.wreath)}
        />
      </div>
    </div>
  );
}

export default AwardsComponent;
