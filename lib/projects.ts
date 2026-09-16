import type { StaticImageData } from "next/image";
import { img, alt } from "@/lib/images";

/**
 * Residential projects, shared by the listing grid and the project pages.
 *
 * A project graduates in two steps. Give it `image` + the four headline facts
 * and it renders as a full card in the listing; give it a `slug` as well and
 * the card becomes a link to its own page at /residential/<slug>. Entries with
 * neither still list and still filter, they just show as a placeholder card.
 *
 * ⚠️ Entries 5-8 are placeholders. Replace them as each project's photography
 * and details come in — nothing else needs editing.
 */
export type Project = {
  name: string;
  /** Every layout offered, which is what the BHK filter matches against. */
  bhk: readonly string[];
  locality: string;
  status: string;
  possession: string;

  /** Set once the project has real details. */
  slug?: string;
  /**
   * How the project reads on its own card — "Luxury Apartments", "Premium
   * Residences". Prose, and deliberately not what anything filters on: three
   * projects here are apartment developments and all three word it
   * differently. `category` is the filterable half.
   */
  projectType?: string;
  /**
   * The kind of development, in the words the home page's search panel
   * offers. Matched against that panel's Project Type menu, so it has to be
   * one of those strings exactly — see `tabs` in `find-residences.tsx`.
   */
  category?: "Apartment" | "Villa" | "Plotted Development";
  /** How the layouts read on the card, e.g. "2, 3 & 4 BHK". */
  layout?: string;
  devSize?: string;
  totalUnits?: string;
  /**
   * The four figures the About page's concept panel leads with. Kept separate
   * from `devSize` / `totalUnits` because those read as phrases on the listing
   * card ("3.5 Acres"), while this panel sets the number and its label apart.
   */
  conceptStats?: readonly {
    label: string;
    /** Counts up from zero when scrolled to. */
    count?: number;
    /** Decimal places to hold while counting, e.g. 1 for 3.5 acres. */
    decimals?: number;
    /** Used instead of `count` when the figure is not a single number. */
    value?: string;
  }[];
  image?: StaticImageData;
  imageAlt?: string;
  heroImage?: StaticImageData;
  heroAlt?: string;
  /** The picture beside the concept figures on the About page. */
  conceptImage?: StaticImageData;
  conceptAlt?: string;
  /**
   * Who the project is promoted by, where that is not Vijaya Enterprises
   * itself — the About page says so under the concept.
   */
  promoter?: string;
};

export const projects: readonly Project[] = [
  {
    // Named as the project's own logo sets it: HARA / VIJAYA / HEIGHTS.
    name: "Hara Vijaya Heights",
    slug: "hara-vijaya-heights",
    projectType: "Premium Residences",
    category: "Apartment",
    layout: "2, 3 & 4 BHK",
    devSize: "3.5 Acres",
    totalUnits: "242 Units",
    conceptStats: [
      { count: 3, label: "Towers" },
      { count: 3.5, decimals: 1, label: "Acres" },
      { count: 242, label: "Flats" },
      { value: "2, 3 & 4", label: "BHK" },
    ],
    bhk: ["2 BHK", "3 BHK", "4 BHK"],
    // Locality stays as the plain city until the area is confirmed — no
    // direction is claimed anywhere on the site.
    // ⚠️ UNCONFIRMED — `possession` carried over from the placeholder that
    // used to sit in this slot; it was not part of the supplied project
    // details, and it drives the possession filter. Confirm it before this
    // goes public. `status` is the client's own: the project is sold out.
    locality: "Bengaluru",
    status: "Sold Out",
    possession: "Within a year",
    image: img.haraVijayaHeights,
    imageAlt: alt.haraVijayaHeights,
    heroImage: img.haraVijayaHeightsHero,
    heroAlt: alt.haraVijayaHeightsHero,
    conceptImage: img.haraVijayaConcept,
    conceptAlt: alt.haraVijayaConcept,
  },
  {
    // Everything here is off the printed brochure (`lib/brochures.ts`,
    // Volume II): 1, 2 & 3 BHK at Rajarajeshwari Nagar, BBMP approved, CC
    // and OC issued, RERA PRM/KA/RERA/1251/310/PR/041122/005393.
    //
    // ⚠️ The unit count is counted off the area statement — six units to a
    // floor, floors one to three — rather than printed as a total, and
    // "Single Block" reads the drawings the same way. Confirm both. `status`
    // follows the CC & OC seal on the cover: the building is complete.
    name: "Vijaya Luxo",
    slug: "vijaya-luxo",
    projectType: "Luxury Apartments",
    category: "Apartment",
    layout: "1, 2 & 3 BHK",
    devSize: "Single Block",
    totalUnits: "18 Units",
    conceptStats: [
      { value: "1, 2 & 3", label: "BHK" },
      { count: 18, label: "Flats" },
      { value: "510–1,550", label: "Sq ft" },
      { value: "CC & OC", label: "Approved" },
    ],
    bhk: ["1 BHK", "2 BHK", "3 BHK"],
    locality: "Rajarajeshwari Nagar",
    status: "Completed",
    possession: "Ready to move",
    image: img.vijayaLuxoDusk,
    imageAlt: alt.vijayaLuxoDusk,
    heroImage: img.vijayaLuxoDusk,
    heroAlt: alt.vijayaLuxoDusk,
    conceptImage: img.vijayaLuxoNight,
    conceptAlt: alt.vijayaLuxoNight,
  },
  {
    // Off the printed brochure (`lib/brochures.ts`, Volume III): two acres
    // at Somshettyhalli in North Bengaluru, 196 one- and two-bedroom homes
    // across six blocks, BDA approved and vastu compliant. Promoted by
    // Digvijaya Shelters LLP, the sister concern of Vijaya Enterprises.
    //
    // ⚠️ `status` and `possession` are not on the brochure, which went to
    // press before the build. They follow the site's own photograph of the
    // finished blocks (`vijayAquaGreen`) and a resident's review — confirm
    // before this goes public.
    name: "Vijaya Aquagreen",
    slug: "vijaya-aquagreen",
    projectType: "Garden Apartments",
    category: "Apartment",
    layout: "1 & 2 BHK",
    devSize: "2 Acres",
    totalUnits: "196 Units",
    conceptStats: [
      { count: 6, label: "Blocks" },
      { count: 2, label: "Acres" },
      { count: 196, label: "Flats" },
      { value: "1 & 2", label: "BHK" },
    ],
    bhk: ["1 BHK", "2 BHK"],
    locality: "Somshettyhalli",
    status: "Completed",
    possession: "Ready to move",
    image: img.vijayAquaGreen,
    imageAlt: alt.vijayAquaGreen,
    heroImage: img.vijayAquaGreen,
    heroAlt: alt.vijayAquaGreen,
    conceptImage: img.vijayaAquagreenRender,
    conceptAlt: alt.vijayaAquagreenRender,
    promoter: "Digvijaya Shelters LLP",
  },
  {
    // Off the printed brochure (`lib/brochures.ts`, Volume IV): 2 & 3 BHK
    // at Singasandra, off Hosur Road at Begur, BBMP approved, 53% of the
    // site open space and landscaping, and no common walls between homes.
    //
    // ⚠️ The brochure prints no unit count. Twenty flats to a floor are
    // drawn on the master plan — ten 3 BHK along one side of the drive and
    // ten 2 BHK along the other — and that per-floor count is what the card
    // carries; the render shows four residential floors over the ground
    // but does not state it, so no total is claimed. `status` and
    // `possession` are not on the brochure either, which went to press
    // before the build — confirm both.
    name: "Vijaya Springwoods",
    slug: "vijaya-springwoods",
    projectType: "Independent-Style Apartments",
    category: "Apartment",
    layout: "2 & 3 BHK",
    devSize: "53% Open Space",
    totalUnits: "20 a Floor",
    conceptStats: [
      { value: "2 & 3", label: "BHK" },
      { value: "53%", label: "Open Space" },
      { value: "1,040+", label: "Sq ft" },
      { value: "BBMP", label: "Approved" },
    ],
    bhk: ["2 BHK", "3 BHK"],
    locality: "Singasandra",
    status: "Completed",
    possession: "Ready to move",
    image: img.vijayaSpringwoodsRender,
    imageAlt: alt.vijayaSpringwoodsRender,
    heroImage: img.vijayaSpringwoodsRender,
    heroAlt: alt.vijayaSpringwoodsRender,
    conceptImage: img.vijayaSpringwoodsCorner,
    conceptAlt: alt.vijayaSpringwoodsCorner,
  },
  { name: "Project 5", bhk: ["3 BHK"], locality: "Bengaluru", status: "Completed", possession: "Ready to move" },
  { name: "Project 6", bhk: ["2 BHK"], locality: "Bengaluru", status: "Ongoing", possession: "Within a year" },
  { name: "Project 7", bhk: ["3 BHK"], locality: "Bengaluru", status: "Ongoing", possession: "Within a year" },
  { name: "Project 8", bhk: ["4 BHK"], locality: "Bengaluru", status: "Upcoming", possession: "One to three years" },
];

/** Only projects with a slug have a page of their own. */
export const projectsWithPages = projects.filter(
  (project): project is Project & { slug: string } => Boolean(project.slug),
);

/** Every project page and section page prerenders from this. */
export const projectParams = () =>
  projectsWithPages.map((project) => ({ slug: project.slug }));

export const projectBySlug = (slug: string) =>
  projectsWithPages.find((project) => project.slug === slug);
