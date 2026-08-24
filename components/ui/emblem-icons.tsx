import { LineIcon } from "./line-icons";

/**
 * The "Why Vijaya" emblems — a heavier, more ornamented set than the six
 * shapes in `line-icons.tsx`.
 *
 * Drawn on a 48-unit grid rather than 24 for the same reason the amenity set
 * is: these carry detail — double rings, tick marks, inner borders — and
 * detail on a 24-grid means fractional coordinates everywhere. Stroke is 1.8
 * rather than the 2.0 a 48-grid icon would need to match a 24-grid one's
 * weight: these are drawn large and want a finer line than a list glyph.
 *
 * Every icon inherits `currentColor`, so the caller sets the colour.
 */
const grid = { viewBox: "0 0 48 48", strokeWidth: 1.8 };

/** Time served — a framed hourglass, sand running. */
export function HourglassEmblem({ className }: { className?: string }) {
  return (
    <LineIcon className={className} {...grid}>
      <path d="M12 6h24M12 42h24" />
      <path d="M17 6v5c0 5 7 7.5 7 13s-7 8-7 13v5" />
      <path d="M31 6v5c0 5-7 7.5-7 13s7 8 7 13v5" />
      <path d="M19.6 9.5h8.8c-.7 3.3-4.4 5.6-4.4 8.6 0-3-3.7-5.3-4.4-8.6Z" />
      <path d="M19.4 38.5h9.2c-.8-3.7-4.6-6.1-4.6-9.1 0 3-3.8 5.4-4.6 9.1Z" />
      <path d="M24 21.5v5" />
    </LineIcon>
  );
}

/** How the thing is put together — masonry in running bond. */
export function MasonryEmblem({ className }: { className?: string }) {
  return (
    <LineIcon className={className} {...grid}>
      <rect x="6" y="11" width="36" height="26" rx="2" />
      <path d="M6 19.667h36M6 28.333h36" />
      <path d="M18 11v8.667M30 11v8.667" />
      <path d="M12 19.667v8.666M24 19.667v8.666M36 19.667v8.666" />
      <path d="M18 28.333V37M30 28.333V37" />
    </LineIcon>
  );
}

/** What it costs — a balance, both pans hanging level. */
export function BalanceEmblem({ className }: { className?: string }) {
  return (
    <LineIcon className={className} {...grid}>
      <circle cx="24" cy="9.5" r="2.5" />
      <path d="M24 12v28" />
      <path d="M10 15.5h28" />
      <path d="M12 15.5v2.5M36 15.5v2.5" />
      <path d="M5 18h14c0 5-3.1 8.5-7 8.5S5 23 5 18Z" />
      <path d="M29 18h14c0 5-3.1 8.5-7 8.5S29 23 29 18Z" />
      <path d="M17 40h14" />
      <path d="M19.5 40c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4" />
    </LineIcon>
  );
}

/** How the home is laid out — a plan with a door swung open. */
export function PlanEmblem({ className }: { className?: string }) {
  return (
    <LineIcon className={className} {...grid}>
      {/* The outline is drawn as two paths rather than a rect so the bottom
          wall can carry an opening for the door. */}
      <path d="M7 37V11a2 2 0 0 1 2-2h30a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H24" />
      <path d="M14 39H9a2 2 0 0 1-2-2" />
      <path d="M25 9v16.5M25 25.5h16" />
      <path d="M14 39V29" />
      <path d="M14 29a10 10 0 0 1 10 10" />
    </LineIcon>
  );
}

/** What the name is worth — a crest, double-bordered, marked. */
export function CrestEmblem({ className }: { className?: string }) {
  return (
    <LineIcon className={className} {...grid}>
      <path d="M24 4.5 38 10v11.8c0 9.6-5.9 16.7-14 19.3-8.1-2.6-14-9.7-14-19.3V10Z" />
      <path d="M24 9.5 34 13.4v8.9c0 7.2-4.3 12.5-10 14.6-5.7-2.1-10-7.4-10-14.6v-8.9Z" />
      <path d="m18.5 23 4 4.2 8-8.6" />
    </LineIcon>
  );
}

/** Which way the home faces — a bezelled compass rose. */
export function CompassRoseEmblem({ className }: { className?: string }) {
  return (
    <LineIcon className={className} {...grid}>
      <circle cx="24" cy="24" r="20" />
      <circle cx="24" cy="24" r="16" />
      {/* Cardinal ticks, bridging the two rings. */}
      <path d="M24 4v4M44 24h-4M24 44v-4M4 24h4" />
      {/* Ordinal ticks, held shorter so the cardinals still lead. */}
      <path d="m36 12 1.9-1.9M36 36l1.9 1.9M12 36l-1.9 1.9M12 12l-1.9-1.9" />
      {/* The rose itself. */}
      <path d="M24 9.5 27.6 20.4 38.5 24 27.6 27.6 24 38.5 20.4 27.6 9.5 24l10.9-3.6Z" />
      <circle cx="24" cy="24" r="2.2" />
    </LineIcon>
  );
}
