import type { StaticImageData } from "next/image";

import twoBhkType1 from "@/assets/floor-plans/2bhk-type-1.jpg";
import twoBhkType2 from "@/assets/floor-plans/2bhk-type-2.jpg";
import twoBhkType3 from "@/assets/floor-plans/2bhk-type-3.jpg";
import threeBhkType1 from "@/assets/floor-plans/3bhk-type-1.jpg";
import threeBhkType2 from "@/assets/floor-plans/3bhk-type-2.jpg";
import threeBhkType3 from "@/assets/floor-plans/3bhk-type-3.jpg";
import penthouseType1 from "@/assets/floor-plans/penthouse-type-1.jpg";
import penthouseType2 from "@/assets/floor-plans/penthouse-type-2.jpg";
import penthouseType3 from "@/assets/floor-plans/penthouse-type-3.jpg";

/* Vijaya Luxo: the six unit plans off the brochure's typical-plan pages,
   cut from a 3600px render of each page. The red keyplan pointers that sit
   beside three of the drawings on the page were painted out with the
   page's own ground; nothing on the drawings themselves was touched. */
import luxoUnit101 from "@/assets/floor-plans/vijaya-luxo/unit-101.jpg";
import luxoUnit102 from "@/assets/floor-plans/vijaya-luxo/unit-102.jpg";
import luxoUnit103 from "@/assets/floor-plans/vijaya-luxo/unit-103.jpg";
import luxoUnit104 from "@/assets/floor-plans/vijaya-luxo/unit-104.jpg";
import luxoUnit105 from "@/assets/floor-plans/vijaya-luxo/unit-105.jpg";
import luxoUnit106 from "@/assets/floor-plans/vijaya-luxo/unit-106.jpg";

/* Vijaya Aquagreen: the seven types, one drawing to a half-spread, cut the
   same way. */
import aquaType1 from "@/assets/floor-plans/vijaya-aquagreen/type-1.jpg";
import aquaType2 from "@/assets/floor-plans/vijaya-aquagreen/type-2.jpg";
import aquaType3 from "@/assets/floor-plans/vijaya-aquagreen/type-3.jpg";
import aquaType4 from "@/assets/floor-plans/vijaya-aquagreen/type-4.jpg";
import aquaType5 from "@/assets/floor-plans/vijaya-aquagreen/type-5.jpg";
import aquaType6 from "@/assets/floor-plans/vijaya-aquagreen/type-6.jpg";
import aquaType7 from "@/assets/floor-plans/vijaya-aquagreen/type-7.jpg";

/* Vijaya Springwoods: the two typical plans off the brochure's floor-plan
   page, cut from a 4800px render of the scan; the north point on the page
   comes along with the 2 BHK. */
import springTwoBhk from "@/assets/floor-plans/vijaya-springwoods/2bhk.jpg";
import springThreeBhk from "@/assets/floor-plans/vijaya-springwoods/3bhk.jpg";

/**
 * Unit plans, grouped the way the Floor Plans page lists them.
 *
 * `facing` and `area` are transcribed from the title block printed on each
 * drawing — nothing here is inferred. Where a drawing carries no built-up
 * area, the field is left out rather than estimated.
 */

/** Which glyph a specification row is drawn with. */
export type FloorPlanFeatureIcon =
  | "bed"
  | "bath"
  | "living"
  | "kitchen"
  | "balcony"
  | "levels"
  | "terrace";

/**
 * One line in the specification panel beside the drawing.
 *
 * Every one of these is a shorthand for what the drawing itself shows — the
 * same source as `alt`, counted off the plan rather than estimated. If a
 * drawing does not label something, it does not get a row.
 */
export type FloorPlanFeature = {
  icon: FloorPlanFeatureIcon;
  label: string;
};

export type FloorPlanType = {
  label: string;
  facing: string;
  area?: string;
  terrace?: string;
  features: readonly FloorPlanFeature[];
  image: StaticImageData;
  alt: string;
};

export type FloorPlanGroup = {
  title: string;
  /** Sits under the title, for when the name alone does not give the size. */
  subtitle?: string;
  /**
   * How the panel beside the drawing names this home, e.g. "2 Bedroom
   * Residence". Written out rather than built from `title` so "Penthouse"
   * does not come out as "Penthouse Residence".
   */
  residence: string;
  types: readonly FloorPlanType[];
};

const haraVijayaHeights: readonly FloorPlanGroup[] = [
  {
    title: "2 BHK",
    residence: "2 Bedroom Residence",
    types: [
      {
        label: "Type 1",
        facing: "Typical north facing · Tower 2",
        features: [
          { icon: "bed", label: "2 Bedroom" },
          { icon: "bath", label: "2 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Balcony & Sitout" },
        ],
        image: twoBhkType1,
        alt: "2 BHK typical north facing unit plan: master bedroom, bedroom, living and dining, kitchen, two toilets, balcony, sitout and utility",
      },
      {
        label: "Type 2",
        facing: "Typical south / east facing",
        area: "1,100 sq ft",
        features: [
          { icon: "bed", label: "2 Bedroom" },
          { icon: "bath", label: "2 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Balcony & Sitout" },
        ],
        image: twoBhkType2,
        alt: "2 BHK typical south and east facing unit plan of 1,100 square feet: master bedroom, bedroom, living and dining, kitchen, two toilets, balcony, sitout and utility",
      },
      {
        label: "Type 3",
        facing: "East facing",
        area: "1,180 sq ft",
        features: [
          { icon: "bed", label: "2 Bedroom" },
          { icon: "bath", label: "2 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          // This drawing labels two sitouts and no balcony, unlike Types 1
          // and 2 — the row follows the plan rather than the group.
          { icon: "balcony", label: "Two Sitouts" },
        ],
        image: twoBhkType3,
        alt: "2 BHK east facing unit plan of 1,180 square feet: two bedrooms, living and dining, kitchen, two toilets, utility and two sitouts",
      },
    ],
  },
  {
    title: "3 BHK",
    residence: "3 Bedroom Residence",
    types: [
      {
        label: "Type 1",
        facing: "Typical north east · First floor",
        area: "1,420 sq ft",
        features: [
          { icon: "bed", label: "3 Bedroom" },
          { icon: "bath", label: "3 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Balcony & Sitout" },
        ],
        image: threeBhkType1,
        alt: "3 BHK typical north east first floor unit plan of 1,420 square feet: master bedroom with dress, two bedrooms, living and dining, kitchen, three toilets, balcony, sitout and utility",
      },
      {
        label: "Type 2",
        facing: "Typical south west · Tower 2",
        area: "1,610 sq ft",
        features: [
          { icon: "bed", label: "3 Bedroom" },
          { icon: "bath", label: "3 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen" },
          { icon: "balcony", label: "Balcony & Two Sitouts" },
        ],
        image: threeBhkType2,
        alt: "3 BHK typical south west unit plan of 1,610 square feet: master bedroom, two bedrooms with dress areas, living and dining, kitchen, three toilets, balcony and two sitouts",
      },
      {
        label: "Type 3",
        facing: "Typical north west · Tower 2",
        area: "1,625 sq ft",
        features: [
          { icon: "bed", label: "3 Bedroom" },
          { icon: "bath", label: "3 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen" },
          { icon: "balcony", label: "Balcony & Two Sitouts" },
        ],
        image: threeBhkType3,
        alt: "3 BHK typical north west unit plan of 1,625 square feet: three bedrooms with dress areas, living and dining, kitchen, three toilets, balcony and two sitouts",
      },
    ],
  },
  {
    title: "Penthouse",
    subtitle: "4 BHK",
    residence: "4 Bedroom Penthouse",
    types: [
      {
        label: "Type 1",
        facing: "South west · Tower 2",
        area: "3,200 sq ft",
        terrace: "110 sq ft private terrace",
        features: [
          { icon: "bed", label: "4 Bedroom" },
          { icon: "levels", label: "Two Levels" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen" },
          { icon: "living", label: "Family Room & Study" },
          { icon: "terrace", label: "110 sq ft Private Terrace" },
        ],
        image: penthouseType1,
        alt: "South west penthouse plan over two levels: lower level with living, dining, kitchen and two bedrooms; upper level with family room, study and two bedrooms",
      },
      {
        label: "Type 2",
        facing: "North west · Tower 2",
        area: "3,240 sq ft",
        terrace: "110 sq ft private terrace",
        features: [
          { icon: "bed", label: "4 Bedroom" },
          { icon: "levels", label: "Two Levels" },
          { icon: "living", label: "Living, Dining & Verandah" },
          { icon: "kitchen", label: "Kitchen" },
          { icon: "living", label: "Family Room" },
          { icon: "terrace", label: "110 sq ft Private Terrace" },
        ],
        image: penthouseType2,
        alt: "North west penthouse plan over two levels: lower level with living, dining, kitchen, verandah and a bedroom; upper level with family room and three bedrooms",
      },
      {
        label: "Type 3",
        facing: "North east · Tower 2",
        area: "3,340 sq ft",
        terrace: "110 sq ft private terrace",
        features: [
          // ⚠️ UNCONFIRMED — the drawing shows two bedrooms on the lower level
          // and three on the upper, which is five, while the group this type
          // sits in is labelled 4 BHK. The count below is what the plan draws.
          // Confirm against the brochure before this goes public: either the
          // group label or this row is wrong.
          { icon: "bed", label: "5 Bedroom" },
          { icon: "levels", label: "Two Levels" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen" },
          { icon: "living", label: "Family Room" },
          { icon: "terrace", label: "110 sq ft Private Terrace" },
        ],
        image: penthouseType3,
        alt: "North east penthouse plan over two levels: lower level with living, dining, kitchen and two bedrooms; upper level with family room and three bedrooms",
      },
    ],
  },
];

/**
 * Vijaya Luxo. One block, six units to a floor, three floors of them: the
 * brochure draws each unit once and names the floors it repeats on, which
 * is what `label` carries. Facing and area are the title of each drawing;
 * where a floor differs in area the area statement says so and so does
 * `facing`.
 */
const vijayaLuxo: readonly FloorPlanGroup[] = [
  {
    title: "1 BHK",
    residence: "1 Bedroom Residence",
    types: [
      {
        label: "Unit 105",
        facing: "West facing · Units 105, 205 and 305",
        area: "510 sq ft",
        features: [
          { icon: "bed", label: "1 Bedroom" },
          { icon: "bath", label: "1 Toilet" },
          { icon: "living", label: "Living & Kitchen" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: luxoUnit105,
        alt: "1 BHK west facing unit plan of 510 square feet: a bedroom with a balcony off it, one toilet, and a living room with the kitchen along one wall",
      },
    ],
  },
  {
    title: "2 BHK",
    residence: "2 Bedroom Residence",
    types: [
      {
        label: "Unit 101",
        facing: "East facing · Units 101, 201 and 301",
        area: "1,150 sq ft",
        features: [
          { icon: "bed", label: "2 Bedroom" },
          { icon: "bath", label: "2 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Two Balconies" },
        ],
        image: luxoUnit101,
        alt: "2 BHK east facing unit plan of 1,150 square feet: master bedroom with its own toilet and balcony, a second bedroom, a second toilet, living, dining, kitchen, utility and a balcony off the living room",
      },
      {
        label: "Unit 102",
        facing: "East facing · Units 102, 202 and 302",
        area: "1,125 sq ft",
        features: [
          { icon: "bed", label: "2 Bedroom" },
          { icon: "bath", label: "2 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: luxoUnit102,
        alt: "2 BHK east facing unit plan of 1,125 square feet: master bedroom with a balcony, a second bedroom, two toilets, living, dining, kitchen and utility",
      },
      {
        label: "Unit 103",
        // The second floor's copy of this unit is drawn fifteen square feet
        // smaller on the area statement — 1,250 — and the row says so.
        facing: "East facing · Units 103 and 303 (Unit 203: 1,250 sq ft)",
        area: "1,265 sq ft",
        features: [
          { icon: "bed", label: "2 Bedroom" },
          { icon: "bath", label: "2 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Two Balconies" },
        ],
        image: luxoUnit103,
        alt: "2 BHK east facing unit plan of 1,265 square feet: master bedroom with a balcony and its own toilet, a second bedroom with a balcony, a second toilet, living, dining, kitchen and utility",
      },
    ],
  },
  {
    title: "3 BHK",
    residence: "3 Bedroom Residence",
    types: [
      {
        label: "Unit 104",
        facing: "North facing · Units 104, 204 and 304",
        area: "1,500 sq ft",
        features: [
          { icon: "bed", label: "3 Bedroom" },
          { icon: "bath", label: "3 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Three Balconies" },
        ],
        image: luxoUnit104,
        alt: "3 BHK north facing unit plan of 1,500 square feet: master bedroom with its own toilet, two further bedrooms each opening to a balcony, two more toilets, living, dining with a balcony, kitchen and utility",
      },
      {
        label: "Unit 106",
        facing: "North facing · Units 106 and 306 (Unit 206: 1,550 sq ft)",
        area: "1,525 sq ft",
        features: [
          { icon: "bed", label: "3 Bedroom" },
          { icon: "bath", label: "3 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Three Balconies" },
        ],
        image: luxoUnit106,
        alt: "3 BHK north facing unit plan of 1,525 square feet: master bedroom with a balcony and its own toilet, two further bedrooms, two more toilets, living, dining with a balcony, kitchen and utility",
      },
    ],
  },
];

/**
 * Vijaya Aquagreen. Seven types across the six blocks, drawn one to a page
 * with a north point but no stated facing — so `facing` names the type the
 * drawing is titled with instead, and nothing is read off the compass.
 */
const vijayaAquagreen: readonly FloorPlanGroup[] = [
  {
    title: "1 BHK",
    residence: "1 Bedroom Residence",
    types: [
      {
        label: "Type 3",
        facing: "1 BHK · Type 3",
        area: "615 sq ft",
        features: [
          { icon: "bed", label: "1 Bedroom" },
          { icon: "bath", label: "1 Toilet" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: aquaType3,
        alt: "1 BHK type 3 unit plan of 615 square feet: a bedroom, a common toilet, living and dining with a balcony, kitchen, and an open-to-sky shaft",
      },
      {
        label: "Type 4",
        facing: "1 BHK · Type 4",
        area: "650 sq ft",
        features: [
          { icon: "bed", label: "1 Bedroom" },
          { icon: "bath", label: "1 Toilet" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: aquaType4,
        alt: "1 BHK type 4 unit plan of 650 square feet: master bedroom, a common toilet, living and dining with a balcony, kitchen, utility and an open-to-sky shaft",
      },
      {
        label: "Type 5",
        facing: "1 BHK · Type 5",
        area: "680 sq ft",
        features: [
          { icon: "bed", label: "1 Bedroom" },
          { icon: "bath", label: "1 Toilet" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: aquaType5,
        alt: "1 BHK type 5 unit plan of 680 square feet: a bedroom, a common toilet, a separate living room and dining room, kitchen and a balcony off the dining",
      },
      {
        label: "Type 6",
        facing: "1 BHK · Type 6",
        area: "650 sq ft",
        features: [
          { icon: "bed", label: "1 Bedroom" },
          { icon: "bath", label: "1 Toilet" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: aquaType6,
        alt: "1 BHK type 6 unit plan of 650 square feet: a bedroom, a common toilet, a separate living room and dining room, kitchen and a balcony off the dining",
      },
      {
        label: "Type 7",
        facing: "1 BHK · Type 7",
        area: "650 sq ft",
        features: [
          { icon: "bed", label: "1 Bedroom" },
          { icon: "bath", label: "1 Toilet" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: aquaType7,
        alt: "1 BHK type 7 unit plan of 650 square feet: master bedroom, a common toilet, living and dining with a balcony, kitchen, utility and an open-to-sky shaft",
      },
    ],
  },
  {
    title: "2 BHK",
    residence: "2 Bedroom Residence",
    types: [
      {
        label: "Type 1",
        facing: "2 BHK · Type 1",
        area: "880 sq ft",
        features: [
          { icon: "bed", label: "2 Bedroom" },
          { icon: "bath", label: "2 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: aquaType1,
        alt: "2 BHK type 1 unit plan of 880 square feet: master bedroom with an attached toilet, a second bedroom, a common toilet, living and dining with a balcony, kitchen, utility and an open-to-sky shaft",
      },
      {
        label: "Type 2",
        facing: "2 BHK · Type 2",
        area: "880 sq ft",
        features: [
          { icon: "bed", label: "2 Bedroom" },
          { icon: "bath", label: "2 Toilets" },
          { icon: "living", label: "Living & Dining" },
          { icon: "kitchen", label: "Kitchen & Utility" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: aquaType2,
        alt: "2 BHK type 2 unit plan of 880 square feet: master bedroom with an attached toilet, a second bedroom, a common toilet, living and dining with a balcony, kitchen and utility",
      },
    ],
  },
];

/**
 * Vijaya Springwoods. One typical plan per layout, drawn with a north point
 * and every room dimensioned; the brochure states no facing, so `facing`
 * says what the drawing is instead.
 */
const vijayaSpringwoods: readonly FloorPlanGroup[] = [
  {
    title: "2 BHK",
    residence: "2 Bedroom Residence",
    types: [
      {
        label: "Typical",
        facing: "Typical floor plan · No common walls",
        area: "1,040 sq ft",
        features: [
          { icon: "bed", label: "2 Bedroom, each with Dress" },
          { icon: "bath", label: "2 Toilets" },
          { icon: "living", label: "Living & Dining, 21' 2\" × 11'" },
          { icon: "kitchen", label: "Kitchen, Utility & Foyer" },
          { icon: "balcony", label: "Balcony" },
        ],
        image: springTwoBhk,
        alt: "2 BHK typical plan of 1,040 square feet: foyer, kitchen and utility at the top, a living and dining room of 21 by 11 feet, master bedroom and bedroom each with a dress area and toilet, and a balcony off the master bedroom",
      },
    ],
  },
  {
    title: "3 BHK",
    residence: "3 Bedroom Residence",
    types: [
      {
        label: "Typical",
        facing: "Typical floor plan · No common walls",
        area: "1,370 sq ft",
        features: [
          { icon: "bed", label: "3 Bedroom" },
          { icon: "bath", label: "3 Toilets" },
          { icon: "living", label: "Living & Dining, 11' × 24' 3\"" },
          { icon: "kitchen", label: "Kitchen, Utility & Foyer" },
          { icon: "balcony", label: "Two Sitouts" },
        ],
        image: springThreeBhk,
        alt: "3 BHK typical plan of 1,370 square feet: utility, kitchen and two sitouts along the top, a living and dining room of 11 by 24 feet, master bedroom and two bedrooms, three toilets and a foyer by the duct",
      },
    ],
  },
];

/** Keyed by project slug, so a project page can look up its own plans. */
export const floorPlansBySlug: Record<string, readonly FloorPlanGroup[]> = {
  "hara-vijaya-heights": haraVijayaHeights,
  "vijaya-luxo": vijayaLuxo,
  "vijaya-aquagreen": vijayaAquagreen,
  "vijaya-springwoods": vijayaSpringwoods,
};
