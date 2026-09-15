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

/* Vijaya Luxo, every picture cut from the printed brochure (rendered at
   3600px a page — see `lib/brochures.ts`). The three elevations carry the
   approval seals in their sky on the page; the crops stop just under them.
   The interiors and the amenity views keep the "Artist's Impression"
   mark the brochure prints on each, which is the honest thing to keep. */
import luxoExteriorDay from "@/assets/gallery/vijaya-luxo/exterior-day.jpg";
import luxoExteriorIsometric from "@/assets/gallery/vijaya-luxo/exterior-isometric.jpg";
import luxoExteriorNight from "@/assets/gallery/vijaya-luxo/exterior-night.jpg";
import luxoAmenityGym1 from "@/assets/gallery/vijaya-luxo/amenity-gym-1.jpg";
import luxoAmenityGym2 from "@/assets/gallery/vijaya-luxo/amenity-gym-2.jpg";
import luxoAmenityGym3 from "@/assets/gallery/vijaya-luxo/amenity-gym-3.jpg";
import luxoAmenityPlayArea from "@/assets/gallery/vijaya-luxo/amenity-play-area.jpg";
import luxoAmenityHall from "@/assets/gallery/vijaya-luxo/amenity-hall.jpg";
import luxoInteriorLiving from "@/assets/gallery/vijaya-luxo/interior-living.jpg";
import luxoInteriorBedroom from "@/assets/gallery/vijaya-luxo/interior-bedroom.jpg";
import luxoInteriorKitchen from "@/assets/gallery/vijaya-luxo/interior-kitchen.jpg";
import luxoInteriorDining from "@/assets/gallery/vijaya-luxo/interior-dining.jpg";
import luxoInteriorKids from "@/assets/gallery/vijaya-luxo/interior-kids.jpg";
import luxoInteriorBedroom2 from "@/assets/gallery/vijaya-luxo/interior-bedroom-2.jpg";
import luxoPlanTypicalFloor from "@/assets/gallery/vijaya-luxo/plan-typical-floor.jpg";
import luxoPlanAreaStatement from "@/assets/gallery/vijaya-luxo/plan-area-statement.jpg";
import luxoPlanRouteMap from "@/assets/gallery/vijaya-luxo/plan-route-map.jpg";

/* Vijaya Aquagreen, likewise. The brochure's one photograph of an amenity
   is a stock picture of a pool with the agency's watermark still across
   it, so it is left out; the finished blocks are in `lib/images.ts`. */
import aquaExteriorRender from "@/assets/gallery/vijaya-aquagreen/exterior-render.jpg";
import aquaPlanMaster from "@/assets/gallery/vijaya-aquagreen/plan-master.jpg";
import aquaPlanLocationMap from "@/assets/gallery/vijaya-aquagreen/plan-location-map.jpg";
import { img, alt } from "@/lib/images";

/**
 * The gallery, grouped as the page presents it.
 *
 * Order matters: each section's layout places pictures in the order listed.
 * The layouts live in components/sections/gallery-grid.tsx.
 *
 * ⚠️ Three of these carry text burned into the picture by whoever exported
 * them: "Kids Play Area" in purple, "Cafeteria" in red, and a photographer's
 * watermark across the collage. None of it matches the site's type, and none
 * can be removed without the originals. Ask for clean exports.
 */
export type GalleryImage = {
  image: StaticImageData;
  alt: string;
};

export type GallerySection = {
  title: string;
  layout: "exterior" | "amenities" | "renders" | "interiors" | "plans";
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
      },
      {
        image: exteriorApproach,
        alt: "The towers from the approach road, with the glazed entrance lobby at the base",
      },
      {
        image: exteriorDusk,
        alt: "The development lit at dusk under a violet sky, with residents crossing the lawn",
      },
      {
        image: exteriorGoldenHour,
        alt: "The towers in late afternoon light, with the curved roof terraces catching the sun",
      },
      {
        image: exteriorCollage,
        alt: "Six views of the development: elevations by day and night, the entrance, and the pool courtyard",
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
      },
      {
        image: amenityPoolDay,
        alt: "The swimming pool in daylight, enclosed by the towers on three sides",
      },
      {
        image: amenityPoolNight,
        alt: "The pool lit at night, with the gymnasium glowing above the pool deck",
      },
      {
        image: amenityKidsPlay,
        alt: "The children's play area: climbing frame with a slide, swings, seesaws and a lawn",
      },
      {
        image: amenityCafeteria,
        alt: "The cafeteria and multi-purpose hall laid out for an event, with tables by the windows",
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
      },
      {
        image: renderInteriorsTwo,
        alt: "Further interiors: an open living and dining room, two bedrooms, a bunk room and a fitted kitchen",
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
      },
      {
        image: planTypicalFloor,
        alt: "Typical floor plan showing the 2 BHK at 1,450 sq ft and the 3 BHK units at 1,885 and 2,015 sq ft",
      },
      {
        image: planLocationMap,
        alt: "Location map placing the development on Kanakapura Main Road, with nearby landmarks and travel times",
      },
    ],
  },
];

const vijayaLuxo: readonly GallerySection[] = [
  {
    title: "Exterior",
    layout: "exterior",
    images: [
      {
        image: img.vijayaLuxoDusk,
        alt: alt.vijayaLuxoDusk,
      },
      {
        image: luxoExteriorDay,
        alt: "The street elevation by day: white render, timber-clad panels and black stone, glass-railed balconies and the planted compound wall",
      },
      {
        image: luxoExteriorIsometric,
        alt: "The block from the corner, showing both street faces and the balconies stepping along the side elevation",
      },
      {
        image: luxoExteriorNight,
        alt: "The block at night with every window lit and the name on the timber fin",
      },
    ],
  },
  {
    title: "Amenities",
    layout: "amenities",
    images: [
      {
        image: luxoAmenityGym1,
        alt: "The gym, first view: a multi-station machine and racks of free weights under a slatted timber ceiling",
      },
      {
        image: luxoAmenityGym2,
        alt: "The gym, second view: a row of treadmills along a wall of windows",
      },
      {
        image: luxoAmenityGym3,
        alt: "The gym, third view: exercise bikes and balance balls on the timber floor",
      },
      {
        image: luxoAmenityPlayArea,
        alt: "The children's play area: a climbing frame with a slide and a roundabout on a terrace",
      },
      {
        image: luxoAmenityHall,
        alt: "The multi-purpose hall: a pool table and a table tennis table under framed prints",
      },
    ],
  },
  {
    title: "Interiors",
    layout: "interiors",
    images: [
      {
        image: luxoInteriorLiving,
        alt: "A living room with a panelled television wall, sheer curtains and a grey sofa",
      },
      {
        image: luxoInteriorBedroom,
        alt: "A master bedroom with a fluted headboard wall, a tufted bench and a coffered ceiling",
      },
      {
        image: luxoInteriorKitchen,
        alt: "A fitted kitchen in dusty pink with a tall fridge and a window over the counter",
      },
      {
        image: luxoInteriorDining,
        alt: "A dining room with a round mirror over the sideboard and the teal kitchen beyond",
      },
      {
        image: luxoInteriorKids,
        alt: "A children's room with an arched bed niche, a pink chest of drawers and a window over the city",
      },
      {
        image: luxoInteriorBedroom2,
        alt: "A bedroom with a navy channelled headboard, a timber door and a ceiling fan",
      },
    ],
  },
  {
    title: "Floor Plans",
    layout: "plans",
    images: [
      {
        image: luxoPlanTypicalFloor,
        alt: "Typical floor plan: six units around a seven-foot corridor and the lift core, south by the road",
      },
      {
        image: luxoPlanAreaStatement,
        alt: "Area statement in square feet for every unit from 101 to 306",
      },
      {
        image: luxoPlanRouteMap,
        alt: "How to reach the project: the roads in from Nayandahalli Circle, Mysore Road and the NICE Road, with the Metro stations and landmarks around it",
      },
    ],
  },
];

const vijayaAquagreen: readonly GallerySection[] = [
  {
    title: "Exterior",
    layout: "exterior",
    images: [
      {
        image: img.vijayAquaGreen,
        alt: alt.vijayAquaGreen,
      },
      {
        image: aquaExteriorRender,
        alt: "Architectural view of the blocks along the road, the entrance gate and the planted verge in front",
      },
    ],
  },
  {
    title: "Master Plan",
    layout: "plans",
    images: [
      {
        image: aquaPlanMaster,
        alt: "Master plan: blocks A to F in three phases around the internal road, the clubhouse and pool to the east, a children's play area to the west and land kept for future development",
      },
      {
        image: aquaPlanLocationMap,
        alt: "Location map placing the project north of the city, with distances to BEL Circle, Tumkur Road, Chikkabanavara and Yeshwanthpur stations, the Dasarahalli Metro and the airport",
      },
    ],
  },
];

/** Keyed by project slug, so a project page can look up its own gallery. */
export const galleryBySlug: Record<string, readonly GallerySection[]> = {
  "hara-vijaya-heights": haraVijayaHeights,
  "vijaya-luxo": vijayaLuxo,
  "vijaya-aquagreen": vijayaAquagreen,
};
