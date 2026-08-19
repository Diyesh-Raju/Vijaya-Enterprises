import type { AmenityIconName } from "@/components/ui/amenity-icons";

/**
 * Amenities, grouped into the segments the Amenities page tabs between.
 *
 * Names are exactly as the project brochure lists them. The `description` on
 * each is the line revealed on hover.
 *
 * ⚠️ The descriptions are ours, not the brochure's — it supplies only names.
 * They are written to describe the amenity without claiming sizes, counts or
 * specifications nobody has confirmed. Replace them with the client's own copy
 * as it arrives; nothing else needs editing.
 */
export type Amenity = {
  name: string;
  icon: AmenityIconName;
  description: string;
};

export type AmenityGroup = {
  title: string;
  amenities: readonly Amenity[];
};

const haraVijayaHeights: readonly AmenityGroup[] = [
  {
    title: "Recreation",
    amenities: [
      {
        name: "Clubhouse",
        icon: "clubhouse",
        description:
          "A state-of-the-art clubhouse and multi-purpose hall, for getting together with loved ones.",
      },
      {
        name: "Swimming Pool",
        icon: "swimming-pool",
        description:
          "A pool inside the development, for laps in the morning or a swim after the working day.",
      },
      {
        name: "Garden",
        icon: "garden",
        description:
          "A landscaped garden and park area, laid out for a stroll rather than just for looking at.",
      },
      {
        name: "Cafe",
        icon: "cafe",
        description:
          "A cafe on the premises, for a coffee without leaving the development.",
      },
    ],
  },
  {
    title: "Sport & Fitness",
    amenities: [
      {
        name: "Gym",
        icon: "gym",
        description:
          "A fitness room on site, so a workout never depends on the traffic.",
      },
      {
        name: "Jogger's Track",
        icon: "joggers-track",
        description:
          "A track running through the development, for a run that starts at your door.",
      },
      {
        name: "Volley Ball",
        icon: "volley-ball",
        description: "An outdoor court, for a game with the neighbours.",
      },
      {
        name: "TT Table",
        icon: "tt-table",
        description: "Table tennis indoors, for a quick game whatever the weather.",
      },
    ],
  },
  {
    title: "Family & Games",
    amenities: [
      {
        name: "Kid's Play Area",
        icon: "kids-play-area",
        description:
          "A play area set aside for children, within sight of the homes around it.",
      },
      {
        name: "Senior Citizen Area",
        icon: "senior-citizen-area",
        description:
          "A quieter corner of the grounds, kept for older residents to sit and talk.",
      },
      {
        name: "Billiards",
        icon: "billiards",
        description: "A billiards table in the clubhouse, for a slower evening.",
      },
      {
        name: "Indoor Games",
        icon: "indoor-games",
        description:
          "Chess, carrom and board games, for the evenings nobody wants to go out.",
      },
    ],
  },
  {
    title: "Essentials",
    amenities: [
      {
        name: "24 Hours Security",
        icon: "security",
        description:
          "Security on the gate around the clock, every day of the year.",
      },
      {
        name: "24 Hours Power Backup",
        icon: "power-backup",
        description:
          "Backup power around the clock, so a cut outside does not stop the day inside.",
      },
      {
        name: "Intercom",
        icon: "intercom",
        description:
          "Intercom connecting every home to the security desk and to each other.",
      },
      {
        name: "Goods / Stretcher Lift",
        icon: "goods-stretcher-lift",
        description:
          "A lift sized for furniture on moving day, and for a stretcher when it matters.",
      },
    ],
  },
];

/** Keyed by project slug, so a project page can look up its own amenities. */
export const amenitiesBySlug: Record<string, readonly AmenityGroup[]> = {
  "hara-vijaya-heights": haraVijayaHeights,
};

/** The brochure's own introduction to the amenities, shown above the tabs. */
export const amenitiesIntroBySlug: Record<string, string> = {
  "hara-vijaya-heights":
    "Hara Vijaya Heights offers a host of neat spaces for recreation and relaxation alike. A state-of-the-art clubhouse and a multi-purpose hall provide an ideal place to get together with loved ones. The landscaped garden and park area are perfect for a stroll by yourself.",
};
