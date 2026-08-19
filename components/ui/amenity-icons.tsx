import { LineIcon } from "@/components/ui/line-icons";

/**
 * One icon per amenity, drawn in the same thin line style as the rest of the
 * site. Keyed by slug so `lib/amenities.ts` can name an icon as data.
 */

function Clubhouse({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M3 10.5L12 4l9 6.5" />
      <path d="M5 10v10h14V10" />
      <path d="M9.5 20v-5.5h5V20" />
      <path d="M8 13h.01M16 13h.01" />
    </LineIcon>
  );
}

function SwimmingPool({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <circle cx="16" cy="6.5" r="1.6" />
      <path d="M6 13l4-3.5 3.5 3 3 1.5" />
      <path d="M2.5 18c1.6 0 1.6 1.4 3.2 1.4S7.3 18 8.9 18s1.6 1.4 3.2 1.4S13.7 18 15.3 18s1.6 1.4 3.2 1.4S20.1 18 21.5 18" />
    </LineIcon>
  );
}

function Gym({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4 9v6M7 7.5v9M17 7.5v9M20 9v6" />
      <path d="M7 12h10" />
    </LineIcon>
  );
}

function KidsPlay({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4 19v-3.5a3 3 0 0 1 3-3h3" />
      <path d="M20 19V8.5" />
      <path d="M10 12.5L20 8.5" />
      <circle cx="8" cy="6.5" r="2" />
      <path d="M2.5 19h19" />
    </LineIcon>
  );
}

function Garden({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <circle cx="12" cy="8" r="2.2" />
      <path d="M12 5.8c0-1.6 1.2-2.8 2.6-2.3 1.3.5 1.5 2.2.4 3.1" />
      <path d="M12 5.8c0-1.6-1.2-2.8-2.6-2.3-1.3.5-1.5 2.2-.4 3.1" />
      <path d="M14.2 8c1.5-.5 3 .3 3 1.8s-1.7 2.3-3 1.6" />
      <path d="M9.8 8c-1.5-.5-3 .3-3 1.8s1.7 2.3 3 1.6" />
      <path d="M12 10.5V21" />
      <path d="M12 16c1.8 0 3.2-1.2 3.6-3" />
    </LineIcon>
  );
}

function VolleyBall({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <circle cx="12" cy="12" r="8.5" />
      {/* Three seams meeting off-centre, the way a volleyball's panels run. */}
      <path d="M12 3.5c2.6 2.9 3.8 6.6 3.4 10.4" />
      <path d="M3.7 10.2c3.8.6 7 2.8 9 6.1" />
      <path d="M8.3 20.1c1.2-3.7 4-6.4 7.9-7.4" />
    </LineIcon>
  );
}

function JoggersTrack({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <circle cx="15" cy="4.8" r="1.7" />
      <path d="M9 21l2.4-4.6 2.1-1.9-.8-3.9" />
      <path d="M12.7 10.6L9.4 12l-1.2 2.6" />
      <path d="M12.7 10.6l3.4 1.2 1.5 3.1 2.4.9" />
      <path d="M13.5 14.5l2.2 2.3.8 4.2" />
    </LineIcon>
  );
}

function TableTennis({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M14.4 4.2a5.4 5.4 0 0 0-7.6 7.6l1.9 1.9 7.6-7.6z" />
      <path d="M8.7 13.7l5.2 5.2a2.1 2.1 0 0 0 3-3l-5.2-5.2" />
      <circle cx="18" cy="7.5" r="1.4" />
    </LineIcon>
  );
}

function Billiards({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <circle cx="8" cy="15.5" r="3" />
      <circle cx="14.5" cy="15.5" r="3" />
      <circle cx="11.2" cy="9.8" r="3" />
      <path d="M17 4.5l4 4" />
    </LineIcon>
  );
}

function Cafe({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4 9.5h12v5a4.5 4.5 0 0 1-4.5 4.5H8.5A4.5 4.5 0 0 1 4 14.5z" />
      <path d="M16 11h1.8a2.4 2.4 0 0 1 0 4.8H16" />
      <path d="M8 6.5V4.2M12 6.5V4.2" />
      <path d="M3 21.5h14" />
    </LineIcon>
  );
}

function IndoorGames({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <circle cx="12" cy="5" r="2" />
      <path d="M9.5 8.2h5l-1 2.3h-3z" />
      <path d="M8.6 10.5h6.8l-1.2 5.2H9.8z" />
      <path d="M8 18.8h8" />
      <path d="M9.8 15.7h4.4l.6 3.1H9.2z" />
    </LineIcon>
  );
}

function Intercom({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="M9 7h6" />
      <path d="M9 10.5h2M13 10.5h2M9 14h2M13 14h2M9 17.5h2M13 17.5h2" />
    </LineIcon>
  );
}

function SeniorCitizen({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <circle cx="11" cy="4.8" r="1.8" />
      <path d="M11 8v6l-1.6 7" />
      <path d="M11 14l2.4 2.2.6 4.8" />
      <path d="M11 9.5l3 1.6" />
      <path d="M17 11v10" />
    </LineIcon>
  );
}

function GoodsLift({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
      <path d="M12 3.5v17" />
      <path d="M8 11.5L8 8m0 0l-1.4 1.6M8 8l1.4 1.6" />
      <path d="M16 12.5V16m0 0l1.4-1.6M16 16l-1.4-1.6" />
    </LineIcon>
  );
}

function PowerBackup({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <rect x="4" y="7" width="16" height="12" rx="1.5" />
      <path d="M9 7V4.5h6V7" />
      <path d="M12.8 10.2l-2.4 3.4h3l-2.2 3.2" />
    </LineIcon>
  );
}

function Security({ className }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M12 3l7.5 3v5.6c0 4.4-3.1 8-7.5 9.4-4.4-1.4-7.5-5-7.5-9.4V6z" />
      <circle cx="12" cy="10.5" r="2" />
      <path d="M8.4 16.6a4 4 0 0 1 7.2 0" />
    </LineIcon>
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
