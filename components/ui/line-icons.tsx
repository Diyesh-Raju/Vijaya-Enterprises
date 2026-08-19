import type { ReactNode } from "react";

/**
 * Thin line icons, drawn rather than pulled from an icon package — six shapes
 * is not worth a dependency, and hand-drawing keeps the weight consistent with
 * the hairline rules and arrows used elsewhere on the site.
 *
 * Every icon inherits `currentColor`, so the caller sets the colour.
 */
function LineIcon({
  children,
  className = "h-7 w-7",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
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
