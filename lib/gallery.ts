import type { StaticImageData } from "next/image";

import exteriorFrontage from "@/assets/gallery/exterior-frontage.jpg";
import exteriorApproach from "@/assets/gallery/exterior-approach.jpg";
import exteriorGoldenHour from "@/assets/gallery/exterior-golden-hour.jpg";
import exteriorDusk from "@/assets/gallery/exterior-dusk.jpg";
import exteriorCollage from "@/assets/gallery/exterior-collage.jpg";
import amenityKidsPlay from "@/assets/gallery/amenity-kids-play.jpg";
import amenityGym from "@/assets/gallery/amenity-gym.jpg";
import amenityPoolDay from "@/assets/gallery/amenity-pool-day.jpg";
import amenityPoolNight from "@/assets/gallery/amenity-pool-night.jpg";
import amenityCafeteria from "@/assets/gallery/amenity-cafeteria.jpg";
import renderInteriorsOne from "@/assets/gallery/render-interiors-one.jpg";
import renderInteriorsTwo from "@/assets/gallery/render-interiors-two.jpg";
import planSite from "@/assets/gallery/plan-site.jpg";
import planTypicalFloor from "@/assets/gallery/plan-typical-floor.jpg";
import planLocationMap from "@/assets/gallery/plan-location-map.jpg";

/**
 * The gallery, grouped as the page presents it.
 *
 * `span` picks a shape from the section's layout. The three layouts are
 * described where they are used, in components/sections/gallery-grid.tsx.
 *
 * ⚠️ Three of these carry text burned into the picture by whoever exported
 * them: "Kids Play Area" in purple, "Cafeteria" in red, and a photographer's
 * watermark across the collage. None of it matches the site's type, and none
 * can be removed without the originals. Ask for clean exports.
 */
export type GalleryImage = {
  image: StaticImageData;
  alt: string;
  /** Which cell of the section's layout this takes. */
  span: "wide" | "medium" | "tall" | "square" | "full";
};

export type GallerySection = {
  title: string;
  layout: "exterior" | "amenities" | "renders" | "plans";
  images: readonly GalleryImage[];
};

const haraVijayaHeights: readonly GallerySection[] = [
  {
    title: "Exterior",
    layout: "exterior",
    images: [
      {
        image: exteriorFrontage,
        alt: "The full frontage of Hara Vijaya Heights seen across the lawn on a clear day",
        span: "wide",
      },
      {
        image: exteriorApproach,
        alt: "The towers from the approach road, with the glazed entrance lobby at the base",
        span: "medium",
      },
      {
        image: exteriorDusk,
        alt: "The development lit at dusk under a violet sky, with residents crossing the lawn",
        span: "tall",
      },
      {
        image: exteriorGoldenHour,
        alt: "The towers in late afternoon light, with the curved roof terraces catching the sun",
        span: "wide",
      },
      {
        image: exteriorCollage,
        alt: "Six views of the development: elevations by day and night, the entrance, and the pool courtyard",
        // Square: it is a six-up collage, and a landscape crop would cut a
        // whole row of it away.
        span: "square",
      },
    ],
  },
  {
    title: "Amenities",
    layout: "amenities",
    images: [
      {
        image: amenityGym,
        alt: "The gymnasium, glazed on two sides, with free weights, benches and cardio machines",
        span: "wide",
      },
      {
        image: amenityPoolDay,
        alt: "The swimming pool in daylight, enclosed by the towers on three sides",
        span: "medium",
      },
      {
        image: amenityPoolNight,
        alt: "The pool lit at night, with the gymnasium glowing above the pool deck",
        span: "medium",
      },
      {
        image: amenityKidsPlay,
        alt: "The children's play area: climbing frame with a slide, swings, seesaws and a lawn",
        span: "medium",
      },
      {
        image: amenityCafeteria,
        alt: "The cafeteria and multi-purpose hall laid out for an event, with tables by the windows",
        span: "medium",
      },
    ],
  },
  {
    title: "Apartment Renders",
    layout: "renders",
    images: [
      {
        image: renderInteriorsOne,
        alt: "Interiors: living room with panelled feature wall, a bedroom, a children's room with bunk beds, and the kitchen",
        span: "full",
      },
      {
        image: renderInteriorsTwo,
        alt: "Further interiors: an open living and dining room, two bedrooms, a bunk room and a fitted kitchen",
        span: "full",
      },
    ],
  },
  {
    title: "Floor Plans",
    layout: "plans",
    images: [
      {
        image: planSite,
        alt: "Site plan: three towers around the clubhouse, pool and gymnasium, with driveways and parking",
        span: "medium",
      },
      {
        image: planTypicalFloor,
        alt: "Typical floor plan showing the 2 BHK at 1,450 sq ft and the 3 BHK units at 1,885 and 2,015 sq ft",
        span: "medium",
      },
      {
        image: planLocationMap,
        alt: "Location map placing the development on Kanakapura Main Road, with nearby landmarks and travel times",
        span: "medium",
      },
    ],
  },
];

/** Keyed by project slug, so a project page can look up its own gallery. */
export const galleryBySlug: Record<string, readonly GallerySection[]> = {
  "hara-vijaya-heights": haraVijayaHeights,
};
