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
  accent?: "none" | "rosegold" | "bare";
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

// Half a laurel wreath: broad leaves paired along an elliptical arc.
//
// Four things make this read as laurel rather than as a fern, and each was
// wrong in an earlier pass:
//
//  • The stem is an arc that bends most of the way round, not a shallow curve.
//    A wreath is a ring around the words; the branch has to enclose them.
//  • The arc is an ellipse, taller than it is wide (RX 52, RY 100). A circular
//    branch comes out chunky — about 0.6 wide for its height — and can only
//    bracket the title before it runs out of width. Stretching it vertically
//    puts the branch at 0.42, so it wraps the whole seal at the same width.
//  • The leaves are broad. A quadratic Bézier only reaches half its control
//    offset, so an offset that looks generous in the numbers draws a sliver;
//    `LEAF_FAT` is the width the shape actually reaches and the control point
//    is set to twice it.
//  • Every leaf is outlined in the page colour. Laurel art overlaps its leaves
//    and separates them with a hairline; without that the fill merges into one
//    solid crescent. Override `--wreath-gap` if a seal sits on something other
//    than white.
//
// Geometry is in a space where the wreath's centre is (CX, CY) — the point the
// two branches curve around, which lands in the middle of the text between
// them. Computed once at module load.
const RX = 52;
const RY = 100;
const CX = 120;
const CY = 85;
const PHI_START = 95; // degrees, 0 = right, 90 = down. Lower tip of the branch.
const PHI_END = 265; //                                 Upper tip of the branch.
const LEAF_COUNT = 12;
/** Leaf length scales off the mean radius, so it is not skewed by the stretch. */
const LEAF_LENGTH = 0.58 * ((RX + RY) / 2);
const LEAF_FAT = 0.55; // width as a fraction of length
const LEAF_ANGLE = 48; // degrees off the stem
const LEAF_TAPER_MIN = 0.55;
/** Leaves facing the text run shorter, which keeps the inner edge even. */
const INNER_SCALE = 0.82;

const rad = (deg: number) => (deg * Math.PI) / 180;

const pointAt = (phi: number) => ({
  x: CX + RX * Math.cos(rad(phi)),
  y: CY + RY * Math.sin(rad(phi)),
});

/** Unit tangent, in the direction the branch grows. */
const tangentAt = (phi: number) => {
  const x = -RX * Math.sin(rad(phi));
  const y = RY * Math.cos(rad(phi));
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
};

/**
 * Unit normal pointing away from the centre.
 *
 * For an ellipse this is not the radius direction — it comes off the gradient
 * of x²/RX² + y²/RY², which lands at (RY·cos φ, RX·sin φ) once scaled. Using
 * the radius instead tilts every leaf on the stretched axis.
 */
const normalAt = (phi: number) => {
  const x = RY * Math.cos(rad(phi));
  const y = RX * Math.sin(rad(phi));
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
};

/**
 * One leaf: two quadratic arcs from the stem out to a point and back, so the
 * shape tapers at both ends the way a bay leaf does.
 */
function leafPath(
  x: number,
  y: number,
  dx: number,
  dy: number,
  length: number,
  halfWidth: number,
) {
  const sx = -dy;
  const sy = dx;
  const tipX = x + dx * length;
  const tipY = y + dy * length;
  // The widest point sits a little short of halfway, which gives the leaf a
  // shoulder instead of making it a diamond.
  const belly = 0.44;
  const mx = x + dx * length * belly;
  const my = y + dy * length * belly;
  // Doubled: a quadratic reaches half the offset of its control point.
  const w = halfWidth * 2;

  return (
    `M${x.toFixed(2)} ${y.toFixed(2)}` +
    `Q${(mx + sx * w).toFixed(2)} ${(my + sy * w).toFixed(2)} ${tipX.toFixed(2)} ${tipY.toFixed(2)}` +
    `Q${(mx - sx * w).toFixed(2)} ${(my - sy * w).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}Z`
  );
}

const leaves = (() => {
  const out: string[] = [];

  for (let i = 0; i < LEAF_COUNT; i++) {
    const t = i / (LEAF_COUNT - 1);
    const phi = PHI_START + (PHI_END - PHI_START) * t;
    const point = pointAt(phi);
    const tangent = tangentAt(phi);
    const normal = normalAt(phi);

    // Fullest through the middle of the branch, smaller at both tips.
    const taper =
      LEAF_TAPER_MIN +
      (1 - LEAF_TAPER_MIN) * Math.sin(Math.PI * (0.12 + 0.76 * t));

    // side  1 = away from the wreath's centre, -1 = toward the text.
    for (const side of [1, -1]) {
      const a = rad(LEAF_ANGLE);
      let dx = tangent.x * Math.cos(a) + normal.x * Math.sin(a) * side;
      let dy = tangent.y * Math.cos(a) + normal.y * Math.sin(a) * side;
      const m = Math.hypot(dx, dy) || 1;
      dx /= m;
      dy /= m;

      const length = LEAF_LENGTH * taper * (side > 0 ? 1 : INNER_SCALE);
      out.push(leafPath(point.x, point.y, dx, dy, length, (length * LEAF_FAT) / 2));
    }
  }

  return out;
})();

const STEM = (() => {
  const from = pointAt(PHI_START);
  const to = pointAt(PHI_END);
  const large = PHI_END - PHI_START > 180 ? 1 : 0;
  return `M${from.x.toFixed(2)} ${from.y.toFixed(2)}A${RX} ${RY} 0 ${large} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
})();

function LaurelBranch() {
  return (
    <g>
      <path
        d={STEM}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {leaves.map((d) => (
        <path
          key={d}
          d={d}
          fill="currentColor"
          stroke="var(--wreath-gap, #ffffff)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}

function Wreath({ className }: { className?: string }) {
  return (
    // Measured off the drawing above rather than guessed, so the branch sits
    // flush in its box and the two halves meet the text at the same distance.
    <svg
      viewBox="31.3 -46.3 106.9 253.3"
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
      // `--seal-size` is the master scale: every measurement below is in `em`,
      // so one number sets the whole lockup. It is a custom property rather
      // than a `text-[…]` class because `cn` here is a plain join, not
      // tailwind-merge — a caller passing `text-[12px]` did not replace a
      // built-in `text-[14px]`, it just raced it in the stylesheet and lost.
      style={{ fontSize: "var(--seal-size, 14px)" }}
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden rounded-[1.5rem] px-[1.5em] py-[1.75em] sm:rounded-[1.75rem]",
        accent === "bare"
          ? "bg-transparent px-0 py-0"
          : accent === "rosegold"
            ? "border-rosegold"
            : frames[variant],
        className,
      )}
    >
      {/* `items-center`, and the wreaths sized by height: stretching them
          would letterbox the drawing inside a tall box and shrink it.
          The height is in `em`, like every measurement in this component, so
          the branch tracks the text it wraps — both grow and wrap off the same
          font size, and the lockup keeps its proportions. Sizing the wreath
          off the seal's WIDTH instead breaks that: in a wide box the text
          stops wrapping and goes short while the branch keeps growing.
          The row shrink-wraps, so the whole lockup centres in whatever cell it
          lands in; the caller's job is to give it about 26em to sit in. */}
      <div className="flex items-center justify-center gap-[0.35em]">
        <Wreath className={cn("h-[15em] w-auto shrink-0", style.wreath)} />

        {/* Capped, so the headline wraps to the same three lines whether the
            seal sits in a 320px column or a 600px one. Uncapped, a wide cell
            let the title run to one line, the block went short, and the wreath
            stopped matching the thing it wraps. */}
        <div className="flex max-w-[12em] flex-col items-center justify-center text-center">
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
            <span className="mt-[0.6em] max-w-[15em] text-[0.95em] font-medium leading-snug text-navy-900">
              {subtitle}
            </span>
          )}

          {description && (
            <span className="mt-[0.35em] max-w-[16em] text-[0.86em] leading-snug text-slate-body">
              {description}
            </span>
          )}

          {/* The face carries no italic of its own, and a browser-slanted one
              on a grotesk reads as a mistake — the credit is set apart by
              weight instead. */}
          {recipient && (
            <span className="mt-[0.6em] font-display text-[0.95em] font-medium leading-none text-slate-body">
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
          className={cn("h-[15em] w-auto shrink-0 -scale-x-100", style.wreath)}
        />
      </div>
    </div>
  );
}

export default AwardsComponent;
