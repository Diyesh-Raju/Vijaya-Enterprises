import type { AmenityIconName } from "@/components/ui/amenity-icons";

/**
 * Amenities, grouped into the segments the Amenities page tabs between.
 *
 * Names are exactly as the project brochure lists them. The `description` on
 * each is the line revealed on hover.
 *
 * ⚠️ The descriptions are ours, not the brochure's — it supplies only names.
 * They are written to describe the amenity without claiming sizes, counts or
 * specifications nobody has confirmed (the Aquagreen power backup and STP
 * lines are the two exceptions: both figures are printed on its
 * specifications page). Replace them with the client's own copy
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

/** The ten on the brochure's "plush amenities" page, in its order. */
const vijayaLuxo: readonly AmenityGroup[] = [
  {
    title: "Recreation",
    amenities: [
      {
        name: "Equipped Gym",
        icon: "gym",
        description:
          "A fitted gym in the building, so a workout never depends on the traffic.",
      },
      {
        name: "Party Hall",
        icon: "party-hall",
        description:
          "A hall for the occasions a flat cannot hold, birthdays, pujas, a gathering of the whole family.",
      },
      {
        name: "Indoor Play Area",
        icon: "indoor-games",
        description:
          "A room for table games, whatever the weather is doing outside.",
      },
      {
        name: "Children's Play Area",
        icon: "kids-play-area",
        description:
          "A play area set aside for children, within sight of the homes around it.",
      },
    ],
  },
  {
    title: "Essentials",
    amenities: [
      {
        name: "Car Parking",
        icon: "car-parking",
        description: "Covered parking within the compound.",
      },
      {
        name: "Automatic Lift",
        icon: "lift",
        description: "An automatic lift serving every floor.",
      },
      {
        name: "CCTV Surveillance",
        icon: "cctv",
        description:
          "Cameras over the entrance and the common areas, recording around the clock.",
      },
      {
        name: "Intercom Facility",
        icon: "intercom",
        description:
          "Intercom connecting every home to the gate and to each other.",
      },
      {
        name: "Power Backup 24 hrs",
        icon: "power-backup",
        description:
          "Backup power around the clock, so a cut outside does not stop the day inside.",
      },
      {
        name: "Rain Water Harvesting",
        icon: "rain-water-harvesting",
        description:
          "Rain off the roof collected and put back into the ground rather than the drain.",
      },
    ],
  },
];

/** The twelve on the brochure's "homes that will bring a change" page. */
const vijayaAquagreen: readonly AmenityGroup[] = [
  {
    title: "Recreation",
    amenities: [
      {
        name: "Club House",
        icon: "clubhouse",
        description:
          "A clubhouse beside the pool, for getting together with the neighbours.",
      },
      {
        name: "Swimming Pool",
        icon: "swimming-pool",
        description:
          "A pool inside the development, for laps in the morning or a swim after the working day.",
      },
      {
        name: "Gym",
        icon: "gym",
        description:
          "A fitness room on site, so a workout never depends on the traffic.",
      },
      {
        name: "Indoor Games",
        icon: "indoor-games",
        description:
          "Chess, carrom and board games, for the evenings nobody wants to go out.",
      },
      {
        name: "Children Play Area",
        icon: "kids-play-area",
        description:
          "A play area at the corner of the grounds, within sight of the homes around it.",
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
        name: "CC TV Coverage",
        icon: "cctv",
        description:
          "Cameras over the gate and the common areas, recording around the clock.",
      },
      {
        name: "Intercom",
        icon: "intercom",
        description:
          "Intercom connecting every home to the security desk and to each other.",
      },
      {
        name: "DG Power Backup",
        icon: "power-backup",
        description:
          "Generator backup for the common areas and for every flat, up to 1 KV.",
      },
    ],
  },
  {
    title: "Water & Waste",
    amenities: [
      {
        name: "Rain Water Harvesting",
        icon: "rain-water-harvesting",
        description:
          "Rain off the roofs collected and put back into the ground rather than the drain.",
      },
      {
        name: "STP",
        icon: "stp",
        description:
          "A sewage treatment plant on site; the treated water goes to flushing and to the gardens.",
      },
      {
        name: "Organic Waste Composter",
        icon: "organic-waste-composter",
        description:
          "Kitchen waste composted within the development rather than sent away.",
      },
    ],
  },
];

/**
 * The ten on the brochure's amenities list, plus the lift and the rain
 * water harvesting its specifications page adds.
 */
const vijayaSpringwoods: readonly AmenityGroup[] = [
  {
    title: "Recreation",
    amenities: [
      {
        name: "Pool",
        icon: "swimming-pool",
        description:
          "A pool at the end of the drive, beside the clubhouse, for laps in the morning or a swim after the working day.",
      },
      {
        name: "Gymnasium",
        icon: "gym",
        description:
          "A fitness room on site, so a workout never depends on the traffic.",
      },
      {
        name: "Club House",
        icon: "clubhouse",
        description:
          "A clubhouse beside the pool, for getting together with the neighbours.",
      },
      {
        name: "Party Hall",
        icon: "party-hall",
        description:
          "A hall for the occasions a flat cannot hold, birthdays, pujas, a gathering of the whole family.",
      },
      {
        name: "Auditorium",
        icon: "auditorium",
        description:
          "A twenty-seat auditorium, for a film or a talk without leaving the development.",
      },
      {
        name: "Children's Play Area",
        icon: "kids-play-area",
        description:
          "A play area set aside for children, within sight of the homes around it.",
      },
    ],
  },
  {
    title: "Grounds",
    amenities: [
      {
        name: "Landscaping",
        icon: "garden",
        description:
          "More than half the site kept open and planted, with the lawn running the length of the block.",
      },
      {
        name: "Visitors' Car Parking",
        icon: "car-parking",
        description:
          "Parking for visitors along the drive, and covered or surface parking for residents.",
      },
    ],
  },
  {
    title: "Essentials",
    amenities: [
      {
        name: "24 Hrs Security",
        icon: "security",
        description:
          "Security on the gate around the clock, every day of the year.",
      },
      {
        name: "Intercom",
        icon: "intercom",
        description:
          "Intercom connecting every home to the security desk and to each other.",
      },
      {
        name: "Power Backup",
        icon: "power-backup",
        description:
          "Generator backup for the lift and all the common areas.",
      },
      {
        name: "Automatic Lift",
        icon: "lift",
        description: "A Johnson or equivalent automatic lift serving every floor.",
      },
      {
        name: "Rain Water Harvesting",
        icon: "rain-water-harvesting",
        description:
          "Rain off the roof collected and put back into the ground rather than the drain.",
      },
    ],
  },
];

/** Keyed by project slug, so a project page can look up its own amenities. */
export const amenitiesBySlug: Record<string, readonly AmenityGroup[]> = {
  "hara-vijaya-heights": haraVijayaHeights,
  "vijaya-luxo": vijayaLuxo,
  "vijaya-aquagreen": vijayaAquagreen,
  "vijaya-springwoods": vijayaSpringwoods,
};

/** The brochure's own introduction to the amenities, shown above the tabs. */
export const amenitiesIntroBySlug: Record<string, string> = {
  "hara-vijaya-heights":
    "Hara Vijaya Heights offers a host of neat spaces for recreation and relaxation alike. A state-of-the-art clubhouse and a multi-purpose hall provide an ideal place to get together with loved ones. The landscaped garden and park area are perfect for a stroll by yourself.",
  "vijaya-luxo":
    "Surround yourself with plush amenities. We believe there are no boundaries for quality, from the quality of material and of finish to the architectural design and the add-ons, everything at Vijaya Luxo has been given the highest care, including vastu compliance.",
  "vijaya-aquagreen":
    "Vijaya Aquagreen is not only a home, it is a dream with all modern amenities. Planned to make sure there is excellent cross ventilation and comfortable living for the modern family, with a clubhouse and pool at the heart of the grounds.",
  "vijaya-springwoods":
    "Fully loaded amenities and exclusive features give you the comfort and feeling of living in an independent home. The apartments are planned so that there are no common walls between homes, no knocking through from the other side, and three sides of natural light and fresh air for every flat.",
};
