/**
 * Single source of truth for brand, navigation and contact details.
 *
 * ⚠️ PLACEHOLDER CONTACT DETAILS — replace the `contact` and `offices`
 * blocks below with Vijaya Enterprises' real phone, email and address
 * before this site goes live. Everything else on the site reads from
 * here, so this is the only file that needs editing.
 */

export const site = {
  name: "Vijaya Enterprises",
  legalName: "Vijaya Enterprises",
  founded: 1973,
  tagline: "Building Trust Since 1973",
  promise: "Every Project. Every Customer. Like Family.",
  description:
    "Vijaya Enterprises is a diversified construction and development company working across residential, commercial, industrial and institutional projects in Karnataka since 1973.",
  /** Used for canonical URLs, sitemap and JSON-LD. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vijayaenterprises.in",
} as const;

export const contact = {
  phoneDisplay: "+91 80 2345 6789",
  phoneHref: "tel:+918023456789",
  mobileDisplay: "+91 98450 00000",
  mobileHref: "tel:+919845000000",
  whatsappHref: "https://wa.me/919845000000",
  emailDisplay: "enquiry@vijayaenterprises.in",
  emailHref: "mailto:enquiry@vijayaenterprises.in",
  hours: "Monday – Saturday, 9:30 am – 6:30 pm",
} as const;

export const offices = [
  {
    label: "Head Office",
    lines: ["Vijaya Enterprises", "Basavanagudi, Bengaluru", "Karnataka, India"],
    mapHref: "https://maps.app.goo.gl/16Vp8ebWMc7ECVRN7",
  },
] as const;

export type NavLink = {
  href: string;
  label: string;
  /** Short line used in the mobile menu. */
  hint: string;
};

/** Centre links of the header, in order. */
export const navLinks: NavLink[] = [
  {
    href: "/residential",
    label: "Residential",
    hint: "Homes built on trust",
  },
  {
    href: "/commercial-contracts",
    label: "Commercial Contracts",
    hint: "Build with experience you can trust",
  },
  {
    href: "/joint-ventures",
    label: "Joint Ventures",
    hint: "Your land. Our experience.",
  },
  {
    href: "/our-legacy",
    label: "Our Legacy",
    hint: "Five decades. One name to trust.",
  },
];

/** Every route, used for the sitemap. */
export const allRoutes = [
  "/",
  ...navLinks.map((l) => l.href),
  "/contact",
] as const;

/**
 * Organisations associated with Vijaya's construction experience.
 * Rendered as typeset names, not logos — we do not hold logo usage
 * rights, and the brief asks for proof stated plainly.
 */
export const associatedOrganisations = [
  "Bharat Electronics Ltd.",
  "HAL",
  "Indian Oil",
  "Union Bank",
  "CSIR",
  "BARC",
  "National Aerospace Laboratories",
  "Mysore Minerals",
  "KHT Motors",
] as const;

export const sectors = [
  "Defence & Aerospace",
  "Banking & Finance",
  "Education",
  "Healthcare",
  "Industrial & Manufacturing",
  "Government & Public Sector",
  "Commercial",
  "Residential",
  "Hospitality",
] as const;
