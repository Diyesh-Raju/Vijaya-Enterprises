"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { Reveal } from "@/components/ui/reveal";
import { onScroll } from "@/lib/scroll";
import { img } from "@/lib/images";

export type Chapter = {
  marker: string;
  title: string;
  body: string;
  image: StaticImageData;
  imageAlt: string;
};

/* ------------------------------------------------------------------
   The stack
------------------------------------------------------------------- */

/**
 * How far below the last one each picture comes to rest, in pixels.
 *
 * The reference band uses 15 and it is the whole reason the stack reads as a
 * stack: without it every picture lands in exactly the same place and covers
 * the one before it completely, so nothing says there is anything underneath.
 */
const LIP = 15;

/**
 * How much a picture shrinks for every picture that lands on top of it.
 *
 * Taken off the reference, which settles at 0.76 / 0.84 / 0.92 / 1 across its
 * four — a flat 0.08 a step. Ours are larger, so the same fraction is more
 * movement than it should be; this is a little under.
 *
 * The value is applied by CSS, not written here — see `COVER_AT`.
 */
const SCALE_STEP = 0.062;

/**
 * How far the covering picture has to have risen before the one underneath
 * shrinks, as a share of its screen of travel.
 *
 * THIS IS THE FIX FOR THE SHAKE, and it is worth saying why. The shrink used
 * to be scrubbed: a fresh `scale()` written onto every picture on every
 * frame. A `position: sticky` picture is repositioned by the browser itself,
 * before paint; a scale written from a scroll handler lands a frame after
 * that, and the fifteen pixels of the covered picture still showing at the
 * top of the stack jittered between the two. Worse, a scale that changes
 * every frame is a new fractional size every frame, so a 768px photograph
 * was being resampled continuously — which is the shimmer.
 *
 * So the shrink is a step now, taken once, and CSS transitions it. Four
 * class changes over the whole band instead of sixty style writes a second,
 * and nothing at all is written to a picture while it is moving.
 */
const COVER_AT = 0.72;

/**
 * When, within a picture's screen of travel, the words either side change
 * over — as shares of that screen.
 *
 * Late, and quickly. The words belong to whichever picture is on top, so they
 * should turn over as the new one lands rather than half-way up, when the
 * reader is looking at two pictures and would be reading two chapters.
 */
const WORDS_FROM = 0.52;
const WORDS_TO = 0.94;

/** How sharply a chapter's words fade out either side of their own place. */
const WORDS_WINDOW = 2.2;
/** How far below its place a chapter's words start, in pixels. */
const WORDS_RISE = 24;

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

/** Smoothstep: no velocity at either end, so a change-over has no corners. */
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The Vijaya story: four chapters, one picture each, stacking up.
 *
 * Rebuilt on the pattern the Nocturne café band uses, which is worth stating
 * plainly because it is the reason this is smooth: THE PICTURES ARE NOT
 * ANIMATED. Each one is its own `position: sticky` block, a screen tall, laid
 * out one after another in the ordinary flow. Scrolling brings the next block
 * up from below and pins it at the top over the last — the travel is the
 * browser's own sticky positioning, running on the compositor, with no
 * scroll handler in it at all.
 *
 * The earlier pass drove every picture's `translateY` from JavaScript each
 * frame. It worked, but it was a hand-rolled reimplementation of exactly what
 * `position: sticky` already does, and it could only ever be a frame behind
 * the scroll it was reading.
 *
 * What is left for JavaScript is what sticky cannot do:
 *
 *  • the words either side, which cross over as each picture lands, and
 *  • the shrink on the pictures underneath, which is what makes the lip at
 *    the top of the stack read as depth rather than as a misalignment.
 *
 * Both are `opacity` and `transform` on elements that already exist, so the
 * band never lays out again mid-scroll.
 *
 * The layout is the picture, large, in the middle of the screen, with the
 * chapter's marker down its left and what happened in it down its right —
 * held in one sticky layer over the stack, the way the reference holds its
 * headline. All of it stands on one photograph, a house at dusk, which is
 * sticky too and so never moves for the whole four screens; see
 * `StoryGround`. That is why the ink here is the site's on-navy set rather
 * than the dark set the band used when its ground was flat mist.
 */
export function LegacyChapters({ chapters }: { chapters: readonly Chapter[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stacked = useStackedLayout();

  useEffect(() => {
    if (!stacked) return;

    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.querySelectorAll<HTMLElement>(".legacy-card"));
    const notes = Array.from(track.querySelectorAll<HTMLElement>(".legacy-note"));
    if (cards.length === 0) return;

    const last = chapters.length - 1;
    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      ) || 0;

    /** Document offset of the track, and the screen one chapter is held on. */
    let top = 0;
    let unit = 1;
    let dirty = true;
    let measuredWidth = -1;
    let measuredHeight = -1;
    /** The last position painted, so an unchanged frame writes nothing. */
    let painted = -1;

    const measure = (y: number) => {
      top = track.getBoundingClientRect().top + y;
      // One slot is one screen, and the slots are what the position counts.
      // Measured rather than assumed: the stylesheet decides how tall a
      // screen is, and on a short window it makes it taller than `svh`.
      const slot = track.querySelector<HTMLElement>(".legacy-slot");
      unit = slot?.offsetHeight || 1;
      dirty = false;
    };

    const paint = (p: number) => {
      for (const [index, card] of cards.entries()) {
        // How many pictures have landed on top of this one — a whole number,
        // and the only thing written to a picture in the whole band. It
        // changes three times over four screens of scroll; CSS does the rest.
        const covered = Math.floor(
          clamp(p - index + (1 - COVER_AT), 0, last - index),
        );
        const depth = `${covered}`;
        if (card.dataset.covered !== depth) card.dataset.covered = depth;
      }

      // The words run on their own clock — see `WORDS_FROM`.
      const whole = Math.floor(p);
      const q =
        whole +
        smooth(clamp((p - whole - WORDS_FROM) / (WORDS_TO - WORDS_FROM), 0, 1));

      for (const note of notes) {
        // The chapter a note belongs to comes off the element, NOT off its
        // place in the list: there are two columns of them, the markers and
        // the descriptions, so the list is twice as long as the chapters.
        const index = Number(note.dataset.chapter);
        const shown = clamp(1 - Math.abs(index - q) * WORDS_WINDOW, 0, 1);
        note.style.opacity = `${shown}`;
        note.style.transform = `translate3d(0, ${(1 - shown) * WORDS_RISE * (index >= q ? 1 : -1)}px, 0)`;
        // Written here rather than derived in CSS from the opacity: only the
        // chapter that is up should be in the tab order or read out, and the
        // others are stacked in the same cell underneath it.
        note.style.visibility = shown > 0 ? "visible" : "hidden";
      }
    };

    return onScroll(({ y, width, height }) => {
      if (width !== measuredWidth || height !== measuredHeight) {
        measuredWidth = width;
        measuredHeight = height;
        dirty = true;
      }
      if (dirty) measure(y);

      // Which picture is on top, and how far the next one has come up. This
      // is not driving the travel — sticky is — it is reading it, which is
      // why there is no easing here: there is nothing to chase.
      const p = clamp((y + headerH - top) / unit, 0, last);
      if (Math.abs(p - painted) < 0.0005) return;
      painted = p;
      paint(p);
    });
  }, [chapters.length, stacked]);

  /* ------------------------------------------------- narrow, or reduced */
  if (!stacked) {
    return (
      <section className="relative isolate bg-navy-950 py-24 sm:py-32">
        <StoryGround />
        <div className="legacy-shell relative">
          <Heading />
          <ol className="mt-12 grid gap-14 sm:mt-16">
            {chapters.map((chapter) => (
              <li key={chapter.marker}>
                <p className="font-display text-[1.75rem] leading-none text-brass-400 sm:text-[2rem]">
                  {chapter.marker}
                </p>
                <figure className="relative mt-5 aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-navy-900 sm:rounded-[1.75rem]">
                  <Image
                    src={chapter.image}
                    alt={chapter.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 92vw, 60vw"
                    placeholder="blur"
                    className="object-cover"
                  />
                </figure>
                <h3 className="mt-6 font-display text-[1.5rem] leading-snug text-white sm:text-[1.75rem]">
                  {chapter.title}
                </h3>
                <p className="mt-4 max-w-xl text-[1rem] leading-[1.8] text-navy-100/85">
                  {chapter.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------- stacked */
  return (
    <section className="legacy-band relative isolate bg-navy-950">
      <StoryGround />

      {/* Above the track, so it reads once on the way in and scrolls away.
          Held inside the stack it would take the top of the window from the
          picture, and it says the same thing whichever chapter is up. */}
      <div className="legacy-shell relative pt-24 sm:pt-32 lg:pt-44">
        <Heading />
      </div>

      <div ref={trackRef} className="legacy-track">
        {/* The words, in one sticky layer over the whole stack — the marker
            down the left of the picture, what happened down its right. */}
        <div className="legacy-words">
          <div className="legacy-words__screen">
            <div className="legacy-shell legacy-words__grid">
              <div className="legacy-notes">
                {chapters.map((chapter, index) => (
                  <div key={chapter.marker} className="legacy-note" data-chapter={index}>
                    <p className="font-display text-[clamp(1.75rem,3.4vw,3rem)] leading-none text-brass-400">
                      {chapter.marker}
                    </p>
                  </div>
                ))}
              </div>

              {/* The middle column is empty: the pictures are behind it. */}
              <div aria-hidden="true" />

              <div className="legacy-notes">
                {chapters.map((chapter, index) => (
                  <div key={chapter.marker} className="legacy-note" data-chapter={index}>
                    <h3 className="font-display text-[1.3125rem] leading-snug text-white sm:text-[1.4375rem]">
                      {chapter.title}
                    </h3>
                    <p className="mt-4 text-[0.9375rem] leading-[1.75] text-navy-100/85">
                      {chapter.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* One sticky slot per chapter, a screen each, in flow. Scrolling
            brings the next up from below and pins it over the last; that is
            the whole animation, and it is the browser's, not ours. */}
        {chapters.map((chapter, index) => (
          <div key={chapter.marker} className="legacy-slot">
            <figure
              className="legacy-card"
              data-covered="0"
              style={
                {
                  // Each lands a little below the one before, so the stack
                  // has a lip. Without it every picture covers its
                  // predecessor exactly and nothing says there is one
                  // underneath.
                  top: `${index * LIP}px`,
                  zIndex: index + 1,
                  // How far this picture shrinks per picture on top of it.
                  // Passed to CSS rather than multiplied out here, so the
                  // step is stated once and the transition owns the value.
                  "--legacy-shrink": SCALE_STEP,
                } as CSSProperties
              }
            >
              <Image
                src={chapter.image}
                alt={chapter.imageAlt}
                fill
                sizes="(max-width: 1024px) 92vw, 60vw"
                placeholder="blur"
                priority={index === 0}
                className="object-cover"
              />
            </figure>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The ground the whole story is told against — a house at dusk over still
 * water, held behind the four chapters while they stack up over it.
 *
 * The same shape the amenities garden uses, and for the same two reasons.
 * No `overflow: hidden` anywhere above it: that would make an ancestor a
 * scroll container, which is what a `sticky` child binds to, and every
 * picture in this band is sticky. No `background-attachment: fixed` either:
 * iOS ignores it outright. What holds the photograph still is an ordinary
 * `next/image` inside a sticky screen-tall box, which the browser pins for
 * as long as the section is passing it — so the dusk stays put and the
 * chapters ride up over it.
 *
 * Two scrim layers over the photograph, tuned by measurement rather than by
 * eye, because the ink on this band is light and the photograph is not: it
 * runs from a near-black roof on the right to a sky at 0.9 luminance on the
 * left, and it is the BRIGHT half that decides the scrim. The flat layer
 * settles the picture; the gradient adds the weight the heading needs at the
 * top of the first screen and takes the foot of the band down into the navy
 * the Philosophy section starts on, so the two do not meet at an edge.
 * A different photograph wants both re-measured — see `app/globals.css`.
 */
function StoryGround() {
  return (
    <div aria-hidden="true" className="legacy-ground">
      <div className="legacy-ground__screen">
        <Image
          src={img.storyGroundDusk}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          className="object-cover"
        />
        <div className="legacy-ground__wash" />
        <div className="legacy-ground__fade" />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="max-w-3xl">
      <Reveal>
        <p className="eyebrow-rule text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400">
          The Vijaya Story
        </p>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.08] text-white">
          Five decades, in four chapters.
        </h2>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------
   Which layout
------------------------------------------------------------------- */

/**
 * The stack needs a window with room for a large picture and a column of
 * words either side of it, and a reader who has not asked for less movement.
 * Anything else gets the four chapters as a plain list.
 *
 * One query for both, and `useSyncExternalStore` rather than an effect that
 * sets state: these are external systems this component reads, and reading
 * them in an effect means rendering one layout and throwing it away. Only the
 * branch that wins is ever mounted, so a phone never downloads the stack's
 * photographs and a laptop never downloads the list's.
 *
 * The server snapshot is the stack, which is what almost every reader gets.
 */
const STACK_QUERY =
  "(min-width: 64rem) and (min-height: 34rem) and (prefers-reduced-motion: no-preference)";

const subscribeToLayout = (notify: () => void) => {
  const query = window.matchMedia(STACK_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

function useStackedLayout() {
  return useSyncExternalStore(
    subscribeToLayout,
    () => window.matchMedia(STACK_QUERY).matches,
    () => true,
  );
}
