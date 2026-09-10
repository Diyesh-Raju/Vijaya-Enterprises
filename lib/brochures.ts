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
 * screen still has pixels in hand. Smaller screens take the same file — at
 * quality 80 with sharp chroma the pages run 30–200KB and average 80, and
 * the small print on the specification pages survives — which is the whole
 * price of never encoding.
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
};

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
  },
];

export const brochureBySlug = (slug: string) =>
  brochures.find((brochure) => brochure.slug === slug);

/** Every brochure prerenders a reader of its own. */
export const brochureParams = () =>
  brochures.map((brochure) => ({ slug: brochure.slug }));
