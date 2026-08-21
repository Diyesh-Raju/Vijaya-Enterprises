import type { StaticImageData } from "next/image";

import twoBhkType1 from "@/assets/floor-plans/2bhk-type-1.jpg";
import twoBhkType2 from "@/assets/floor-plans/2bhk-type-2.jpg";
import threeBhkType1 from "@/assets/floor-plans/3bhk-type-1.jpg";
import threeBhkType2 from "@/assets/floor-plans/3bhk-type-2.jpg";
import threeBhkType3 from "@/assets/floor-plans/3bhk-type-3.jpg";
import penthouseType1 from "@/assets/floor-plans/penthouse-type-1.jpg";
import penthouseType2 from "@/assets/floor-plans/penthouse-type-2.jpg";
import penthouseType3 from "@/assets/floor-plans/penthouse-type-3.jpg";

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

/** Keyed by project slug, so a project page can look up its own plans. */
export const floorPlansBySlug: Record<string, readonly FloorPlanGroup[]> = {
  "hara-vijaya-heights": haraVijayaHeights,
};
