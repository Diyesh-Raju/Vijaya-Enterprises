/**
 * The two brochures Vijaya has printed, page by page.
 *
 * Both are real: the PDFs the client supplied are served whole from
 * `public/brochures/`, and every leaf below was rendered off those same
 * files (see the note on `pages`). Nothing here is written copy standing in
 * for artwork — if a brochure is reprinted, re-render its leaves and swap
 * the PDF, and the reader and the shelf both follow.
 *
 * Leaves, not PDF pages. The Hara Vijaya Heights file is imposed as printed
 * spreads — one landscape PDF page carries a left-hand and a right-hand page
 * — so it was cut down the gutter on the way out. Vijaya Luxo is one square
 * page per leaf and came across as it stood. The reader pairs them back up:
 * see `BrochureReader`.
 *
 *   swiftc -O -o pdfleaves pdfleaves.swift   # PDFKit, ~40 lines
 *   ./pdfleaves E-Brochure.pdf leaves 1200 0.8
 *   node -e '
 *     const sharp = require("sharp"), fs = require("fs");
 *     for (const f of fs.readdirSync("leaves"))
 *       sharp("leaves/" + f)
 *         .webp({ quality: 80, effort: 6, smartSubsample: true })
 *         .toFile("assets/brochures/hara-vijaya-heights/" + f.replace(/\.\w+$/, ".webp"));
 *   '
 *
 * Finished WebP, rather than JPEG left for the image optimiser to finish on
 * request. The optimiser is right for the rest of the site's photographs —
 * one picture a page, encoded once on first demand and cached — and wrong
 * for a book: thirty-nine pictures a reader wants one after another within
 * seconds, each of which the first reader at every screen size would have
 * waited on being encoded to AVIF, a quarter-second apiece on a fast machine
 * and longer wherever the site is actually hosted. That wait is what used to
 * land a spread's left-hand page seconds before its right. A page is now one
 * file, served as it is (`unoptimized`, in `BrochureReader`), cached for
 * good under its content hash, and fetched ahead of the reader in order.
 *
 * 1200px on the leaf is twice what the widest spread asks of it, so a retina
 * screen still has pixels in hand. At quality 80 with sharp chroma the pages
 * run 30–200KB and average 80, and the small print on the specification
 * pages survives — which is the whole price of never encoding.
 *
 * A phone does not take that file. Its reading of the book is one page at a
 * time, 88vw wide — under 400 CSS pixels — and 1200px of page for that is
 * three and a half megabytes across the two books on the connection least
 * able to afford it. `small` is the same leaves at 840px (2.1x over a 400px
 * page; a little under on a 3x screen, which a scan at this size does not
 * show), at 57% of the bytes. Cut from the finished 1200px files, so the
 * two sets can never disagree:
 *
 *   node -e '
 *     const sharp = require("sharp"), fs = require("fs");
 *     for (const f of fs.readdirSync("assets/brochures/vijaya-luxo").filter(f => f.endsWith(".webp")))
 *       sharp("assets/brochures/vijaya-luxo/" + f).resize({ width: 840 })
 *         .webp({ quality: 80, effort: 6, smartSubsample: true })
 *         .toFile("assets/brochures/vijaya-luxo/small/" + f);
 *   '
 *
 * The shelf on the legacy page shows the small cover at every width, and
 * reads ahead whichever set the reader here will want — see `pagesFor`.
 */

import type { StaticImageData } from "next/image";

import hara01 from "@/assets/brochures/hara-vijaya-heights/01.webp";
import hara02 from "@/assets/brochures/hara-vijaya-heights/02.webp";
import hara03 from "@/assets/brochures/hara-vijaya-heights/03.webp";
import hara04 from "@/assets/brochures/hara-vijaya-heights/04.webp";
import hara05 from "@/assets/brochures/hara-vijaya-heights/05.webp";
import hara06 from "@/assets/brochures/hara-vijaya-heights/06.webp";
import hara07 from "@/assets/brochures/hara-vijaya-heights/07.webp";
import hara08 from "@/assets/brochures/hara-vijaya-heights/08.webp";
import hara09 from "@/assets/brochures/hara-vijaya-heights/09.webp";
import hara10 from "@/assets/brochures/hara-vijaya-heights/10.webp";
import hara11 from "@/assets/brochures/hara-vijaya-heights/11.webp";
import hara12 from "@/assets/brochures/hara-vijaya-heights/12.webp";
import hara13 from "@/assets/brochures/hara-vijaya-heights/13.webp";
import hara14 from "@/assets/brochures/hara-vijaya-heights/14.webp";
import hara15 from "@/assets/brochures/hara-vijaya-heights/15.webp";
import hara16 from "@/assets/brochures/hara-vijaya-heights/16.webp";
import hara17 from "@/assets/brochures/hara-vijaya-heights/17.webp";
import hara18 from "@/assets/brochures/hara-vijaya-heights/18.webp";
import hara19 from "@/assets/brochures/hara-vijaya-heights/19.webp";
import hara20 from "@/assets/brochures/hara-vijaya-heights/20.webp";
import hara21 from "@/assets/brochures/hara-vijaya-heights/21.webp";
import hara22 from "@/assets/brochures/hara-vijaya-heights/22.webp";
import hara23 from "@/assets/brochures/hara-vijaya-heights/23.webp";
import hara24 from "@/assets/brochures/hara-vijaya-heights/24.webp";

import luxo01 from "@/assets/brochures/vijaya-luxo/01.webp";
import luxo02 from "@/assets/brochures/vijaya-luxo/02.webp";
import luxo03 from "@/assets/brochures/vijaya-luxo/03.webp";
import luxo04 from "@/assets/brochures/vijaya-luxo/04.webp";
import luxo05 from "@/assets/brochures/vijaya-luxo/05.webp";
import luxo06 from "@/assets/brochures/vijaya-luxo/06.webp";
import luxo07 from "@/assets/brochures/vijaya-luxo/07.webp";
import luxo08 from "@/assets/brochures/vijaya-luxo/08.webp";
import luxo09 from "@/assets/brochures/vijaya-luxo/09.webp";
import luxo10 from "@/assets/brochures/vijaya-luxo/10.webp";
import luxo11 from "@/assets/brochures/vijaya-luxo/11.webp";
import luxo12 from "@/assets/brochures/vijaya-luxo/12.webp";
import luxo13 from "@/assets/brochures/vijaya-luxo/13.webp";
import luxo14 from "@/assets/brochures/vijaya-luxo/14.webp";
import luxo15 from "@/assets/brochures/vijaya-luxo/15.webp";

import haraS01 from "@/assets/brochures/hara-vijaya-heights/small/01.webp";
import haraS02 from "@/assets/brochures/hara-vijaya-heights/small/02.webp";
import haraS03 from "@/assets/brochures/hara-vijaya-heights/small/03.webp";
import haraS04 from "@/assets/brochures/hara-vijaya-heights/small/04.webp";
import haraS05 from "@/assets/brochures/hara-vijaya-heights/small/05.webp";
import haraS06 from "@/assets/brochures/hara-vijaya-heights/small/06.webp";
import haraS07 from "@/assets/brochures/hara-vijaya-heights/small/07.webp";
import haraS08 from "@/assets/brochures/hara-vijaya-heights/small/08.webp";
import haraS09 from "@/assets/brochures/hara-vijaya-heights/small/09.webp";
import haraS10 from "@/assets/brochures/hara-vijaya-heights/small/10.webp";
import haraS11 from "@/assets/brochures/hara-vijaya-heights/small/11.webp";
import haraS12 from "@/assets/brochures/hara-vijaya-heights/small/12.webp";
import haraS13 from "@/assets/brochures/hara-vijaya-heights/small/13.webp";
import haraS14 from "@/assets/brochures/hara-vijaya-heights/small/14.webp";
import haraS15 from "@/assets/brochures/hara-vijaya-heights/small/15.webp";
import haraS16 from "@/assets/brochures/hara-vijaya-heights/small/16.webp";
import haraS17 from "@/assets/brochures/hara-vijaya-heights/small/17.webp";
import haraS18 from "@/assets/brochures/hara-vijaya-heights/small/18.webp";
import haraS19 from "@/assets/brochures/hara-vijaya-heights/small/19.webp";
import haraS20 from "@/assets/brochures/hara-vijaya-heights/small/20.webp";
import haraS21 from "@/assets/brochures/hara-vijaya-heights/small/21.webp";
import haraS22 from "@/assets/brochures/hara-vijaya-heights/small/22.webp";
import haraS23 from "@/assets/brochures/hara-vijaya-heights/small/23.webp";
import haraS24 from "@/assets/brochures/hara-vijaya-heights/small/24.webp";

import luxoS01 from "@/assets/brochures/vijaya-luxo/small/01.webp";
import luxoS02 from "@/assets/brochures/vijaya-luxo/small/02.webp";
import luxoS03 from "@/assets/brochures/vijaya-luxo/small/03.webp";
import luxoS04 from "@/assets/brochures/vijaya-luxo/small/04.webp";
import luxoS05 from "@/assets/brochures/vijaya-luxo/small/05.webp";
import luxoS06 from "@/assets/brochures/vijaya-luxo/small/06.webp";
import luxoS07 from "@/assets/brochures/vijaya-luxo/small/07.webp";
import luxoS08 from "@/assets/brochures/vijaya-luxo/small/08.webp";
import luxoS09 from "@/assets/brochures/vijaya-luxo/small/09.webp";
import luxoS10 from "@/assets/brochures/vijaya-luxo/small/10.webp";
import luxoS11 from "@/assets/brochures/vijaya-luxo/small/11.webp";
import luxoS12 from "@/assets/brochures/vijaya-luxo/small/12.webp";
import luxoS13 from "@/assets/brochures/vijaya-luxo/small/13.webp";
import luxoS14 from "@/assets/brochures/vijaya-luxo/small/14.webp";
import luxoS15 from "@/assets/brochures/vijaya-luxo/small/15.webp";

export type Brochure = {
  slug: string;
  /** Roman numeral over the title, as the reference books number themselves. */
  volume: string;
  title: string;
  /** Where it stands, set under the title. */
  place: string;
  /** One line off the book's own pages, for the shelf. */
  quote: string;
  /** The paragraph that introduces the book above the reader. */
  blurb: string;
  /** What the file is and how heavy, so a download is never a surprise. */
  pdf: string;
  pdfSize: string;
  /**
   * Every leaf in reading order — front cover first, back cover last. The
   * first is the cover the shelf shows; the reader pairs the rest into
   * spreads.
   */
  pages: readonly StaticImageData[];
  /** The same leaves at 840px, for a phone's one-page-at-a-time reading. */
  small: readonly StaticImageData[];
};

/**
 * Where the reader's spread takes over from its strip — a laptop-shaped
 * window rather than a merely wide one. Identical to the `desk:` variant in
 * `globals.css`; the two must stay in step. Here rather than in the reader
 * because the shelf asks the same question, to read ahead the right set.
 */
export const READER_WIDE_QUERY = "(min-width: 48rem) and (min-height: 500px)";

/** The set of pages the reader will show on a window of this shape. */
export const pagesFor = (brochure: Brochure, wide: boolean) =>
  wide ? brochure.pages : brochure.small;

export const brochures: readonly Brochure[] = [
  {
    slug: "hara-vijaya-heights",
    volume: "Volume I",
    title: "Hara Vijaya Heights",
    place: "Kanakapura Road, Talaghattapura",
    quote: "Calm, connected, and green.",
    blurb:
      "Three towers on three and a half acres, set out the way the book was printed: the master plan, the specifications line by line, the amenities, the location map, and the projects Vijaya finished before this one.",
    pdf: "/brochures/hara-vijaya-heights.pdf",
    pdfSize: "5.4 MB",
    pages: [
      hara01, hara02, hara03, hara04, hara05, hara06,
      hara07, hara08, hara09, hara10, hara11, hara12,
      hara13, hara14, hara15, hara16, hara17, hara18,
      hara19, hara20, hara21, hara22, hara23, hara24,
    ],
    small: [
      haraS01, haraS02, haraS03, haraS04, haraS05, haraS06,
      haraS07, haraS08, haraS09, haraS10, haraS11, haraS12,
      haraS13, haraS14, haraS15, haraS16, haraS17, haraS18,
      haraS19, haraS20, haraS21, haraS22, haraS23, haraS24,
    ],
  },
  {
    slug: "vijaya-luxo",
    volume: "Volume II",
    title: "Vijaya Luxo",
    place: "Rajarajeshwari Nagar",
    quote: "One, two and three bedrooms, in the middle of RR Nagar.",
    blurb:
      "The elevation, the typical floor plan for every unit on the site, the amenities and the roads that reach it. RERA PRM/KA/RERA/1251/310/PR/041122/005393.",
    pdf: "/brochures/vijaya-luxo.pdf",
    pdfSize: "14.9 MB",
    pages: [
      luxo01, luxo02, luxo03, luxo04, luxo05,
      luxo06, luxo07, luxo08, luxo09, luxo10,
      luxo11, luxo12, luxo13, luxo14, luxo15,
    ],
    small: [
      luxoS01, luxoS02, luxoS03, luxoS04, luxoS05,
      luxoS06, luxoS07, luxoS08, luxoS09, luxoS10,
      luxoS11, luxoS12, luxoS13, luxoS14, luxoS15,
    ],
  },
];

export const brochureBySlug = (slug: string) =>
  brochures.find((brochure) => brochure.slug === slug);

/** Every brochure prerenders a reader of its own. */
export const brochureParams = () =>
  brochures.map((brochure) => ({ slug: brochure.slug }));
