import type { ReactNode } from "react";

/**
 * Thin line icons, drawn rather than pulled from an icon package — six shapes
 * is not worth a dependency, and hand-drawing keeps the weight consistent with
 * the hairline rules and arrows used elsewhere on the site.
 *
 * Every icon inherits `currentColor`, so the caller sets the colour.
 * `LineIcon` is exported so other icon sets share one stroke definition.
 *
 * `viewBox` and `strokeWidth` are overridable together: the amenity set is
 * drawn on a 48-unit grid because those icons carry far more detail than the
 * six shapes here, and detail on a 24-unit grid means fractional coordinates
 * everywhere. A 48-grid icon needs double the stroke width to keep the same
 * apparent weight as a 24-grid one, so the two always move together.
 */
export function LineIcon({
  children,
  className = "h-7 w-7",
  viewBox = "0 0 24 24",
  strokeWidth = 1.5,
}: {
  children: ReactNode;
  className?: string;
  viewBox?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Looking something up. */
export function SearchIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </LineIcon>
  );
}

/** Narrowing a list down — the three-slider mark, read as "filters". */
export function SlidersIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4 7h11M18.5 7H20M4 12h3M10.5 12H20M4 17h9M16.5 17H20" />
      <circle cx="16.75" cy="7" r="1.75" />
      <circle cx="8.75" cy="12" r="1.75" />
      <circle cx="14.75" cy="17" r="1.75" />
    </LineIcon>
  );
}

/** Shutting a panel. */
export function CloseIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </LineIcon>
  );
}

/** Time served. */
export function HourglassIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M7 3h10M7 21h10" />
      <path d="M8.5 3v2.6c0 1.9 3.5 3.6 3.5 6.4s-3.5 4.5-3.5 6.4V21" />
      <path d="M15.5 3v2.6c0 1.9-3.5 3.6-3.5 6.4s3.5 4.5 3.5 6.4V21" />
    </LineIcon>
  );
}

/** Built fabric — how the thing is actually put together. */
export function BrickWallIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 9.7h18M3 14.3h18" />
      <path d="M9 5v4.7M15 5v4.7" />
      <path d="M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6" />
      <path d="M9 14.3V19M15 14.3V19" />
    </LineIcon>
  );
}

/** Even-handed pricing. */
export function ScaleIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M12 4.5v15.5M8.5 20h7M4 9h16" />
      <path d="M3.5 9a2.5 2.5 0 0 0 5 0" />
      <path d="M15.5 9a2.5 2.5 0 0 0 5 0" />
    </LineIcon>
  );
}

/** A plan drawn around how the rooms will be lived in. */
export function FloorPlanIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M11 4v7M11 11h9" />
      <path d="M4 15h4" />
    </LineIcon>
  );
}

/** A name that has held up. */
export function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M12 3l7 3v5.5c0 4.2-2.9 7.5-7 8.5-4.1-1-7-4.3-7-8.5V6z" />
      <path d="M9 12l2 2 4-4" />
    </LineIcon>
  );
}

/**
 * A hard hat — the company's own crew on site, for the in-house execution
 * card on /civil-contracts.
 *
 * Four parts, and the raised crown is the one that matters: without it a
 * dome over a brim is a bowl, or a mushroom. The two shoulder arcs stop
 * short of the middle and the crown block stands between them, which is how
 * a hard hat is actually made and how the eye reads one at 18px.
 */
export function HardHatIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4.6 14.6v-2.4a5.6 5.6 0 0 1 5.4-5.6" />
      <path d="M14 6.6a5.6 5.6 0 0 1 5.4 5.6v2.4" />
      <path d="M10 10.6V5.8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4.8" />
      <rect x="2.2" y="14.6" width="19.6" height="3.8" rx="1.1" />
    </LineIcon>
  );
}

/** Treating the customer like family. */
export function HeartIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M19 13.9c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.4c0 2.3 1.5 4 3 5.5l7 7z" />
    </LineIcon>
  );
}

/** Where a project sits. */
export function MapPinIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </LineIcon>
  );
}

/** What kind of development it is. */
export function BuildingIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16" />
      <path d="M12 21V10h7a1 1 0 0 1 1 1v10" />
      <path d="M7 8h2M7 12h2M7 16h2M15.5 14H17M15.5 17.5H17" />
      <path d="M2.5 21h19" />
    </LineIcon>
  );
}

/* ------------------------------------------------------------------
   Who the company builds for — the six glyphs beside the arch on
   /our-legacy. Same 24-unit grid and the same 1.5 stroke as the rest of the
   set, so they sit in their tiles at the weight of every other line icon on
   the site.

   Four of the six are buildings, which is the honest answer for a builder:
   what changes between a client and the next one is the building, not the
   subject. So each carries one mark that is its own and nothing else's — a
   pitched roof and an arched door, a curtain wall of floor bands, a saw-tooth
   shed under a stack, a pediment on columns — and no two of them are read
   apart by their outline alone.

   `HouseIcon`, `BuildingIcon` and `ShieldCheckIcon` used to do three of these
   jobs and are left exactly as they were: the first two are shared with the
   booking prompt and the project cards, and a shield with a tick reads as
   "verified", which is not what a government client is. Redrawing any of them
   would have moved pages this section has nothing to do with.
------------------------------------------------------------------- */

/**
 * A home with a chimney and an arched door — for the individuals and
 * families. The arch is the section's own shape, borrowed at glyph size.
 */
export function FamilyHomeIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M3.3 10.7 12 4l8.7 6.7" />
      <path d="M5.6 9.1v10.9a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V9.1" />
      <path d="M9.9 21v-4.3a2.1 2.1 0 0 1 4.2 0V21" />
      <path d="M16.4 7.3V4.9h2.2v4.2" />
    </LineIcon>
  );
}

/**
 * An office tower banded floor by floor — for the businesses. The bands are
 * a curtain wall rather than punched windows, which is what keeps it from
 * reading as `BuildingIcon` at 22px.
 */
export function OfficeTowerIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M5.9 21V5a1 1 0 0 1 1-1h10.2a1 1 0 0 1 1 1v16" />
      <path d="M5.9 8.2h12.2M5.9 11.8h12.2M5.9 15.4h12.2" />
      <path d="M12 4.6v12.4" />
      <path d="M10.4 21v-3.4h3.2V21" />
      <path d="M3.2 21h17.6" />
    </LineIcon>
  );
}

/**
 * A pediment on three columns — for the government and public sector work.
 * Courts, banks and public offices are built this way here, which is why the
 * shape says "civic" on its own.
 */
export function CivicBuildingIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M2.9 10 12 4.6 21.1 10" />
      <path d="M2.9 10h18.2" />
      <path d="M6.1 10v7.4M12 10v7.4M17.9 10v7.4" />
      <path d="M4.6 17.4h14.8" />
      <path d="M2.6 20.8h18.8" />
    </LineIcon>
  );
}

/** A private home — for the individuals and families. */
export function HouseIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M3.2 10.4 12 3.5l8.8 6.9V20a1 1 0 0 1-1 1H4.2a1 1 0 0 1-1-1Z" />
      <path d="M9.5 21v-6h5v6" />
    </LineIcon>
  );
}

/**
 * A plant — a tall block with two saw-tooth bays running off it.
 *
 * Drawn as one outline on one baseline, which is the whole trick. An earlier
 * pass made the stack a thin pipe and hung a shallow zig-zag beside it: a tall
 * bar, two short bars and a descending line, which read as a falling chart
 * rather than as a factory. Widening the block to a quarter of the grid and
 * running the roof out of it as notches of the same mass fixes that — the
 * silhouette is a building before it is anything else.
 */
export function FactoryIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M3 21V4.9a.9.9 0 0 1 .9-.9h4.2a.9.9 0 0 1 .9.9v8.2l6-4.1v4.1l6-4.1V21" />
      <path d="M2 21h20" />
      <path d="M5.1 21v-3.4h2.4V21" />
      <path d="M12.2 17.4h1.7M17.4 17.4h1.7" />
    </LineIcon>
  );
}

/**
 * A mortarboard — for the schools and colleges. The cord now ends in its
 * knot: without one it read as a stray rule down the right of the tile.
 */
export function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M12 4.2 2.8 8.3 12 12.4l9.2-4.1Z" />
      <path d="M6.9 10.2v4.7c0 1.5 2.3 2.7 5.1 2.7s5.1-1.2 5.1-2.7v-4.7" />
      <path d="M21.2 8.6v4.4" />
      <circle cx="21.2" cy="14.2" r="1.1" />
    </LineIcon>
  );
}

/**
 * A cross over a doorway — for the hospitals.
 *
 * No canopy over the block, which is what the first two passes tried: a rule
 * drawn across the top and oversailing the walls reads as a roof slab on
 * posts, and the glyph came out a carport. The block closes itself instead,
 * and the cross — set large, because it is the only mark saying which kind of
 * building this is — does the rest.
 */
export function HospitalIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4.6 21V8.6a1 1 0 0 1 1-1h12.8a1 1 0 0 1 1 1V21" />
      <path d="M12 10.6v5M9.5 13.1h5" />
      <path d="M9.9 21v-3.6h4.2V21" />
      <path d="M2.6 21h18.8" />
    </LineIcon>
  );
}

/** How many bedrooms the layouts offer. */
export function BedIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M2.5 8v9" />
      <path d="M4 17v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M7 11V9h4v2" />
      <path d="M2.5 17.5h19" />
    </LineIcon>
  );
}

/** How much land the development covers. */
export function AreaIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4 9.5V4h5.5M20 14.5V20h-5.5" />
      <path d="M4 4l6 6M20 20l-6-6" />
    </LineIcon>
  );
}

/** How many homes it holds. */
export function UnitsIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </LineIcon>
  );
}

/* ------------------------------------------- unit plan specification rows */

/** Toilets in the unit. */
export function BathIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M3 12.5h18v2.5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
      <path d="M6 12.5V5.8A1.8 1.8 0 0 1 7.8 4c1 0 1.8.8 1.8 1.8" />
      <path d="M8.4 6.6h2.6" />
      <path d="M7 19v1.8M17 19v1.8" />
    </LineIcon>
  );
}

/** Living and dining — the shared rooms. */
export function SofaIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
      <path d="M4 11a2 2 0 0 0-2 2v4h20v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1H6v-1a2 2 0 0 0-2-2z" />
      <path d="M4 17v2M20 17v2" />
    </LineIcon>
  );
}

/** Kitchen and utility. */
export function KitchenIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M5 3.5v7a2.5 2.5 0 0 0 5 0v-7" />
      <path d="M7.5 3.5V13m0 0v7.5" />
      <path d="M17.5 20.5V14" />
      <path d="M17.5 14c2 0 3-1.4 3-4.5S19.2 3.5 17.5 3.5 14.5 6.4 14.5 9.5s1 4.5 3 4.5z" />
    </LineIcon>
  );
}

/** Balconies and sitouts — the outdoor edge of the plan. */
export function BalconyIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M3 11.5h18" />
      <path d="M4.5 11.5V21M19.5 11.5V21" />
      <path d="M4.5 16.5h15" />
      <path d="M9 11.5V21M15 11.5V21" />
      <path d="M6.5 11.5V7a5.5 5.5 0 0 1 11 0v4.5" />
    </LineIcon>
  );
}

/** A home that runs over two floors. */
export function LevelsIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M3 20h5v-4h5v-4h5V8h3" />
      <path d="M3 20v-4" />
      <path d="M8 20v-8M13 20v-4" />
      <path d="M18 20V8" />
    </LineIcon>
  );
}

/** Private terrace. */
export function TerraceIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M2.5 10.5 12 4l9.5 6.5" />
      <path d="M4.5 12.5V20h15v-7.5" />
      <path d="M4.5 20h15" />
      <path d="M8.5 20v-4h7v4" />
    </LineIcon>
  );
}

/** Which way the unit faces. */
export function CompassIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13.6 13.6 8.5 15.5l1.9-5.1z" />
    </LineIcon>
  );
}

/** Onward, in a list. */
export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4 12h15" />
      <path d="M13.5 6l6 6-6 6" />
    </LineIcon>
  );
}

/** Back to where you came from. */
export function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </LineIcon>
  );
}

/** Open something full screen. */
export function ExpandIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M8 3H5.5A2.5 2.5 0 0 0 3 5.5V8" />
      <path d="M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8" />
      <path d="M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16" />
      <path d="M16 21h2.5a2.5 2.5 0 0 0 2.5-2.5V16" />
    </LineIcon>
  );
}

/** Disclosure arrow for menus. */
export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M6 9.5l6 6 6-6" />
    </LineIcon>
  );
}

/** Leaves for somewhere else. */
export function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </LineIcon>
  );
}

/** Solid play mark, for a video control. Filled rather than stroked — a
 *  hairline triangle disappears inside a 96px ring. */
export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className={className}
    >
      <path d="M7.5 4.9a1.4 1.4 0 0 1 2.1-1.2l9 6.9a1.4 1.4 0 0 1 0 2.4l-9 7a1.4 1.4 0 0 1-2.1-1.2Z" />
    </svg>
  );
}

/** Taking a copy away with you. */
export function DownloadIcon({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M12 3.5v11" />
      <path d="m7.5 10 4.5 4.5 4.5-4.5" />
      <path d="M4.5 17.5v1a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1" />
    </LineIcon>
  );
}
