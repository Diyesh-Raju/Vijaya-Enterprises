"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Reveal } from "@/components/ui/reveal";
import { BookCover } from "@/components/ui/book-cover";
import { ArrowRightIcon } from "@/components/ui/line-icons";
import { brochures, pagesFor, READER_WIDE_QUERY } from "@/lib/brochures";
import { readAhead, readingOrder, sparing, type Reader } from "@/lib/read-ahead";
import { observeReveal } from "@/lib/scroll";

/**
 * The two printed brochures, standing where the vision and mission cards
 * used to, on the navy band of the legacy page.
 *
 * They are deliberately small. The reference this was drawn from gives one
 * book half a screen and a paragraph beside it; here two of them share the
 * width the two cards had, under a heading that is still the section's own.
 * A book at 19rem is an object on a shelf — big enough to read the cover
 * and the mark on it, small enough that the pair still reads as one row
 * under the heading rather than as two panels of their own.
 *
 * Each is a link and nothing else is: the whole thing — cover, name, cue —
 * is one target, so there is no second, smaller place to aim at. The tilt
 * straightens and the book lifts on hover, which is the only thing that
 * moves. See `.book` in `globals.css`.
 *
 * The shelf also reads both books in. Once it has come into view — the
 * reader is looking at the covers, and about to open one — every page of
 * both is fetched behind the page, a few at a time at the browser's lowest
 * priority, the two books interleaved so that whichever is opened has its
 * first pages first. A book opened from here then has nothing left to
 * fetch: the reader's own read-ahead finds every page in the cache and has
 * the whole book mounted in the time it takes to decode it. Held back
 * until the browser is idle after the reveal, so the band's video, which
 * starts on the same cue, has the connection to itself first.
 *
 * Which set it reads — the 1200px leaves for a laptop's spread, the 840px
 * ones for a phone's strip — is decided by the reader's own query, so the
 * pages that arrive are the pages the book will ask for.
 */
export function BrochureShelf() {
  const shelf = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shelf.current;
    if (!el || sparing()) return;

    // Both books, a page from each in turn.
    const wide = window.matchMedia(READER_WIDE_QUERY).matches;
    const pages: string[] = [];
    const longest = Math.max(...brochures.map((brochure) => brochure.pages.length));
    for (let i = 0; i < longest; i += 1) {
      for (const brochure of brochures) {
        const page = pagesFor(brochure, wide)[i];
        if (page) pages.push(page.src);
      }
    }

    let reader: Reader | null = null;
    let idle: number | undefined;
    let timer: number | undefined;
    let started = false;

    const begin = () => {
      reader = readAhead(pages, undefined, "low");
      reader.focus(readingOrder(0, pages.length));
    };
    const start = () => {
      if (started) return;
      started = true;
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(begin, { timeout: 1500 });
      } else {
        timer = window.setTimeout(begin, 800);
      }
    };

    const off = observeReveal(el, (visible) => {
      if (visible) start();
    });
    if (off === false) start();

    return () => {
      if (off) off();
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      reader?.stop();
    };
  }, []);

  return (
    <div
      ref={shelf}
      className="mx-auto mt-10 grid max-w-5xl gap-12 sm:mt-12 sm:grid-cols-2 sm:gap-10"
    >
      {brochures.map((brochure, index) => (
        <Reveal key={brochure.slug} delay={index * 110} className="flex justify-center">
          <Link href={`/brochures/${brochure.slug}`} className="book-link">
            {/* Drawn 4:5, taller than the square cover it carries: the
                cover stands whole inside it on its own paper rather than
                being cropped to fit. */}
            <BookCover
              cover={brochure.small[0]}
              alt={`The cover of the ${brochure.title} brochure`}
              shape="4 / 5"
              paper={brochure.coverPaper}
              hold={brochure.coverHold}
            />

            <span className="book-link__label">
              <span className="book-link__volume">{brochure.volume}</span>
              <span className="book-link__title">{brochure.title}</span>
              <span className="book-link__place">{brochure.place}</span>
            </span>

            <span className="book-link__cue">
              <span className="book-link__disc" aria-hidden="true">
                <ArrowRightIcon className="h-[1.05rem] w-[1.05rem]" />
              </span>
              Open the book
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
