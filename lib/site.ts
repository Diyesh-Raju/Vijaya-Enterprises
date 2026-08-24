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

/**
 * The Trusted By band on the home page.
 *
 * `logo` is the file under `public/logos/`, `w`/`h` its intrinsic pixel size
 * (the SVGs' viewBox), and `height` the height it is drawn at in the band.
 * That last one is set per logo by eye rather than shared, because a square
 * crest and a long wordmark cannot carry the same height and still read as
 * the same weight — KNSIT's seal at 50px and MML's full lockup at 28px look
 * like siblings; at a common height one of them always shouts.
 *
 * `mark` stays as the typeset fallback: an entry with no `logo` still renders,
 * and the roster below is not final.
 *
 * ⚠️ These are other organisations' trademarks, taken from their own websites
 * (and, for MML, from the 2018 archive of the since-retired mml.kar.nic.in).
 * They are reproduced here to say who Vijaya has built for, which is what a
 * client list is; that is the only use they are dressed for. Do not carry any
 * of them onto anything that reads as endorsement or joint branding without
 * asking the organisation first.
 *
 * `associatedOrganisations` above is the shorter, plainer list the
 * Commercial Contracts page tickers — the two overlap and should be
 * reconciled once the client roster is confirmed.
 */
export type TrustedOrg = {
  /** Short form, typeset large when there is no logo file. */
  mark: string;
  /** Full title, printed small beneath either treatment. */
  name: string;
  /** File under `public/logos/`. */
  logo?: string;
  /** Intrinsic size of that file — the SVGs' viewBox. */
  w?: number;
  h?: number;
  /** Height it is drawn at in the band, before `--logo-scale`. */
  height?: number;
};

export const trustedBy: readonly TrustedOrg[] = [
  { mark: "BEL", name: "Bharat Electronics Limited", logo: "/logos/bel.png", w: 421, h: 140, height: 36 },
  { mark: "HAL", name: "Hindustan Aeronautics Limited", logo: "/logos/hal.png", w: 257, h: 140, height: 48 },
  { mark: "Union Bank", name: "Union Bank of India", logo: "/logos/union.png", w: 760, h: 113, height: 28 },
  { mark: "ISRO", name: "Indian Space Research Organisation", logo: "/logos/isro.svg", w: 300, h: 290, height: 52 },
  { mark: "NAL", name: "National Aeronautical Laboratories", logo: "/logos/nal.png", w: 144, h: 140, height: 52 },
  { mark: "IOCL", name: "Indian Oil Corporation", logo: "/logos/iocl.svg", w: 200, h: 239, height: 56 },
  { mark: "Canara", name: "Canara Bank", logo: "/logos/canara.png", w: 176, h: 140, height: 50 },
  { mark: "KNSIT", name: "K.N.S. Institute of Technology", logo: "/logos/knsit.png", w: 132, h: 140, height: 54 },
  { mark: "MML", name: "Mysore Minerals Limited", logo: "/logos/mml.png", w: 760, h: 97, height: 28 },
  { mark: "MICO", name: "Motor Industries Co. Ltd.", logo: "/logos/mico.png", w: 617, h: 140, height: 32 },
];

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
