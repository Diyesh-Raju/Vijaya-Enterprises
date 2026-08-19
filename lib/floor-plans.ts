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
export type FloorPlanType = {
  label: string;
  facing: string;
  area?: string;
  terrace?: string;
  image: StaticImageData;
  alt: string;
};

export type FloorPlanGroup = {
  title: string;
  /** Sits under the title, for when the name alone does not give the size. */
  subtitle?: string;
  types: readonly FloorPlanType[];
};

const haraVijayaHeights: readonly FloorPlanGroup[] = [
  {
    title: "2 BHK",
    types: [
      {
        label: "Type 1",
        facing: "Typical north facing · Tower 2",
        image: twoBhkType1,
        alt: "2 BHK typical north facing unit plan: master bedroom, bedroom, living and dining, kitchen, two toilets, balcony, sitout and utility",
      },
      {
        label: "Type 2",
        facing: "Typical south / east facing",
        area: "1,100 sq ft",
        image: twoBhkType2,
        alt: "2 BHK typical south and east facing unit plan of 1,100 square feet: master bedroom, bedroom, living and dining, kitchen, two toilets, balcony, sitout and utility",
      },
    ],
  },
  {
    title: "3 BHK",
    types: [
      {
        label: "Type 1",
        facing: "Typical north east · First floor",
        area: "1,420 sq ft",
        image: threeBhkType1,
        alt: "3 BHK typical north east first floor unit plan of 1,420 square feet: master bedroom with dress, two bedrooms, living and dining, kitchen, three toilets, balcony, sitout and utility",
      },
      {
        label: "Type 2",
        facing: "Typical south west · Tower 2",
        area: "1,610 sq ft",
        image: threeBhkType2,
        alt: "3 BHK typical south west unit plan of 1,610 square feet: master bedroom, two bedrooms with dress areas, living and dining, kitchen, three toilets, balcony and two sitouts",
      },
      {
        label: "Type 3",
        facing: "Typical north west · Tower 2",
        area: "1,625 sq ft",
        image: threeBhkType3,
        alt: "3 BHK typical north west unit plan of 1,625 square feet: three bedrooms with dress areas, living and dining, kitchen, three toilets, balcony and two sitouts",
      },
    ],
  },
  {
    title: "Penthouse",
    subtitle: "4 BHK",
    types: [
      {
        label: "Type 1",
        facing: "South west · Tower 2",
        area: "3,200 sq ft",
        terrace: "110 sq ft private terrace",
        image: penthouseType1,
        alt: "South west penthouse plan over two levels: lower level with living, dining, kitchen and two bedrooms; upper level with family room, study and two bedrooms",
      },
      {
        label: "Type 2",
        facing: "North west · Tower 2",
        area: "3,240 sq ft",
        terrace: "110 sq ft private terrace",
        image: penthouseType2,
        alt: "North west penthouse plan over two levels: lower level with living, dining, kitchen, verandah and a bedroom; upper level with family room and three bedrooms",
      },
      {
        label: "Type 3",
        facing: "North east · Tower 2",
        area: "3,340 sq ft",
        terrace: "110 sq ft private terrace",
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
