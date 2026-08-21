import type { ReactNode } from "react";
import { LineIcon } from "@/components/ui/line-icons";

/**
 * One icon per amenity.
 *
 * Drawn as literal objects — a pool with its ladder, a bar over its bench, a
 * table with its pockets — rather than as the abstract glyphs the rest of the
 * site uses. At the size these run on the Amenities page an
 * abstract mark just reads as texture; a drawing of the thing itself is what
 * makes a wall of sixteen tiles scannable.
 *
 * All of them sit on a 48-unit grid at stroke 1.6, which is the 24-grid's 0.8
 * — deliberately finer than the site's other line icons, because these carry
 * more lines in the same box and a 1.5 weight at this density fills in.
 *
 * Keyed by slug at the bottom so `lib/amenities.ts` can name an icon as data.
 */

function Amenity({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <LineIcon className={className} viewBox="0 0 48 48" strokeWidth={1.6}>
      {children}
    </LineIcon>
  );
}

/** Multi-purpose hall: pitched roof, two windows, an arched door. */
function Clubhouse({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <path d="M5 22 24 8l19 14" />
      <path d="M10 22v18M38 22v18" />
      <path d="M4 40h40" />
      <path d="M21 40v-8a3 3 0 0 1 6 0v8" />
      <rect x="13" y="26" width="6" height="6" rx="0.8" />
      <rect x="29" y="26" width="6" height="6" rx="0.8" />
    </Amenity>
  );
}

/** Pool basin in section, with the ladder over the near rim. */
function SwimmingPool({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <path d="M5 16h38" />
      <path d="M9 16v16a5 5 0 0 0 5 5h20a5 5 0 0 0 5-5V16" />
      <path d="M13 16v12M21 16v12" />
      <path d="M13 16v-4.5a4 4 0 0 1 8 0V16" />
      <path d="M13 20.5h8M13 25h8" />
      <path d="M12 32.5c2.7 0 2.7 2 5.4 2s2.7-2 5.4-2 2.7 2 5.4 2 2.7-2 5.4-2" />
    </Amenity>
  );
}

/** Weight bench under a loaded bar. */
function Gym({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <path d="M6 12h36" />
      <path d="M9 8v8M12.5 5.5v13M35.5 5.5v13M39 8v8" />
      <path d="M10 23h28v3.5H10z" />
      <path d="M14 26.5V37M34 26.5V37" />
      <path d="M8 37h12M28 37h12" />
    </Amenity>
  );
}

/** Slide: ladder, platform, chute with a kick at the bottom. */
function KidsPlay({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <path d="M11 40V17M17 40V17" />
      <path d="M11 22h6M11 28h6M11 34h6" />
      <path d="M8 17h13" />
      <path d="M17 20c5.5 5.5 9.5 11 12.5 16 1.6 2.7 4.2 3.1 6.3 1.6" />
      <path d="M21 18c5.5 5.5 9.5 11.5 12.5 16.5" />
      <path d="M5 41h38" />
    </Amenity>
  );
}

/** Aroma garden: a leafed sprig, with scent marks around it. */
function Garden({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <path d="M24 41V19" />
      <path d="M24 27c-5.5 0-9-3.4-9-8 4.6 0 9 2.6 9 8Z" />
      <path d="M24 27c5.5 0 9-3.4 9-8-4.6 0-9 2.6-9 8Z" />
      <path d="M24 36c-4.4 0-7.6-2.8-7.6-6.6 3.8 0 7.6 2 7.6 6.6Z" />
      <path d="M24 36c4.4 0 7.6-2.8 7.6-6.6-3.8 0-7.6 2-7.6 6.6Z" />
      <path d="M15 41h18" />
      <path d="M9 13v4M7 15h4" />
      <path d="M39 10v4M37 12h4" />
      <path d="M41 23v3M39.5 24.5h3" />
    </Amenity>
  );
}

/** Volleyball, with its three-panel seams. */
function VolleyBall({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <circle cx="24" cy="24" r="17" />
      <path d="M24 7c-5 6-7 12-6 18s3 10 8 13" />
      <path d="M8 17c7 0 13 3 17 8s5 10 4 15" />
      <path d="M10 34c5-5 9-8 15-9s12-1 15-3" />
    </Amenity>
  );
}

/** Running track from above: three lanes, and the line they start on. */
function JoggersTrack({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <path d="M16 10h16a14 14 0 0 1 0 28H16a14 14 0 0 1 0-28Z" />
      <path d="M16 16h16a8 8 0 0 1 0 16H16a8 8 0 0 1 0-16Z" />
      <path d="M16 22h16a2 2 0 0 1 0 4H16a2 2 0 0 1 0-4Z" />
      <path d="M24 10v6M24 32v6" />
    </Amenity>
  );
}

/** Table tennis: a pair of bats leaning apart, and the ball. */
function TableTennis({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <g transform="rotate(20 15 18)">
        <ellipse cx="15" cy="13" rx="6.6" ry="7.3" />
        <rect x="13.3" y="20.2" width="3.4" height="11" rx="1.7" />
      </g>
      <g transform="rotate(-20 33 18)">
        <ellipse cx="33" cy="13" rx="6.6" ry="7.3" />
        <rect x="31.3" y="20.2" width="3.4" height="11" rx="1.7" />
      </g>
      <circle cx="24" cy="31" r="3.4" />
    </Amenity>
  );
}

/** Pool table from above: cushions, six pockets, three balls. */
function Billiards({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <rect x="7" y="9" width="34" height="30" rx="3.5" />
      <rect x="11.5" y="13.5" width="25" height="21" rx="1.5" />
      <circle cx="11.5" cy="13.5" r="2" />
      <circle cx="36.5" cy="13.5" r="2" />
      <circle cx="11.5" cy="34.5" r="2" />
      <circle cx="36.5" cy="34.5" r="2" />
      <circle cx="24" cy="12.4" r="2" />
      <circle cx="24" cy="35.6" r="2" />
      <circle cx="19.5" cy="25" r="2.4" />
      <circle cx="27" cy="20.8" r="2.4" />
      <circle cx="30" cy="28" r="2.4" />
    </Amenity>
  );
}

/** Cup and saucer, steaming. */
function Cafe({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <path d="M9 17h24v12a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z" />
      <path d="M33 21h3.5a5 5 0 0 1 0 10H33" />
      <path d="M5 43h32" />
      <path d="M18 13c-2.2-2.2 2.2-3.6 0-5.8" />
      <path d="M26 13c-2.2-2.2 2.2-3.6 0-5.8" />
    </Amenity>
  );
}

/** A board and two pieces — chess, carrom, whatever is out that evening. */
function IndoorGames({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <rect x="8" y="8" width="32" height="32" rx="2.5" />
      <path d="M16 8v32M24 8v32M32 8v32" />
      <path d="M8 16h32M8 24h32M8 32h32" />
      <circle cx="20" cy="20" r="2.6" />
      <circle cx="28" cy="28" r="2.6" />
    </Amenity>
  );
}

/** Door panel: screen, call buttons, speaker grille. */
function Intercom({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <rect x="12" y="5" width="24" height="38" rx="3.5" />
      <rect x="16" y="10" width="16" height="9" rx="1.5" />
      <circle cx="19" cy="25" r="1.6" />
      <circle cx="24" cy="25" r="1.6" />
      <circle cx="29" cy="25" r="1.6" />
      <circle cx="19" cy="31" r="1.6" />
      <circle cx="24" cy="31" r="1.6" />
      <circle cx="29" cy="31" r="1.6" />
      <path d="M18 37h12" />
    </Amenity>
  );
}

/** A bench in the grounds — the quiet corner, not the person in it. */
function SeniorCitizen({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <path d="M11 14v15M37 14v15" />
      <path d="M11 18h26M11 24h26" />
      <path d="M5 29h38v3.5H5z" />
      <path d="M9 32.5V40M39 32.5V40" />
      <path d="M4 40h40" />
    </Amenity>
  );
}

/** Lift car, doors parted, one arrow up and one down. */
function GoodsLift({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <rect x="9" y="5" width="30" height="38" rx="3.5" />
      <rect x="13" y="10" width="22" height="28" rx="1.2" />
      <path d="M24 10v28" />
      <path d="M18.5 27v-9m0 0-3 3.4m3-3.4 3 3.4" />
      <path d="M29.5 21v9m0 0 3-3.4m-3 3.4-3-3.4" />
    </Amenity>
  );
}

/** Standby generator: filler cap, vents, and the current it carries. */
function PowerBackup({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <rect x="6" y="14" width="36" height="22" rx="3" />
      <path d="M14 14v-4h8v4" />
      <path d="M12 36v5M36 36v5" />
      <path d="M24 18.5l-6 9h6l-5 8.5" />
      <path d="M32 21h6M32 25h6M32 29h6" />
    </Amenity>
  );
}

/** Shield, checked — the gate is covered. */
function Security({ className }: { className?: string }) {
  return (
    <Amenity className={className}>
      <path d="M24 4 41 10.5v12.2C41 32.9 33.9 41.6 24 44 14.1 41.6 7 32.9 7 22.7V10.5z" />
      <path d="M24 9.5 36 14v8.7c0 7.4-5 14.2-12 16.4-7-2.2-12-9-12-16.4V14z" />
      <path d="M18.5 24.5 22.5 28.5 30 20.5" />
    </Amenity>
  );
}

export const amenityIcons = {
  clubhouse: Clubhouse,
  "swimming-pool": SwimmingPool,
  gym: Gym,
  "kids-play-area": KidsPlay,
  garden: Garden,
  "volley-ball": VolleyBall,
  "joggers-track": JoggersTrack,
  "tt-table": TableTennis,
  billiards: Billiards,
  cafe: Cafe,
  "indoor-games": IndoorGames,
  intercom: Intercom,
  "senior-citizen-area": SeniorCitizen,
  "goods-stretcher-lift": GoodsLift,
  "power-backup": PowerBackup,
  security: Security,
} as const;

export type AmenityIconName = keyof typeof amenityIcons;
