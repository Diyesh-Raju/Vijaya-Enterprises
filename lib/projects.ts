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
 * ⚠️ Entries 2-8 are placeholders. Replace them as each project's photography
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
  projectType?: string;
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
};

export const projects: readonly Project[] = [
  {
    // Named as the project's own logo sets it: HARA / VIJAYA / HEIGHTS.
    name: "Hara Vijaya Heights",
    slug: "hara-vijaya-heights",
    projectType: "Premium Residences",
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
  },
  { name: "Project 2", bhk: ["3 BHK"], locality: "Bengaluru", status: "Completed", possession: "Ready to move" },
  { name: "Project 3", bhk: ["2 BHK"], locality: "Bengaluru", status: "Ongoing", possession: "One to three years" },
  { name: "Project 4", bhk: ["4 BHK"], locality: "Bengaluru", status: "Upcoming", possession: "One to three years" },
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
