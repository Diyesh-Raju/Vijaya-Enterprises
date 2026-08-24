import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScrollScrub } from "@/components/ui/scroll-scrub";
import { img, alt } from "@/lib/images";

/**
 * The Residential hero: the Animmaster "Hero Animation" loader, set to this
 * page's word and this page's photograph, and wound by the scrollbar.
 *
 * "Residential" is split either side of a box that starts at nothing. The
 * letters rise, the box opens to a sliver of photograph, the two halves part
 * by a hair, and then the picture floods the whole hero — at which point the
 * page's real heading rises out of the bottom over it.
 *
 * None of that plays by itself. The section is a three-screen track with the
 * stage pinned to the top of it, and `ScrollScrub` turns progress down the
 * track into a time on the timeline; scrolling back up runs it backwards. The
 * choreography itself is CSS — see the `.reshero` block in `globals.css` for
 * the timings and for why it is not GSAP.
 *
 * The split word is `aria-hidden`: it is the same word as the `h1` below,
 * drawn twice, and a screen reader reading eleven separate letters and then
 * the heading again would be worse than useless.
 */

/** Where the picture opens. Both halves together spell the heading. */
const WORD_START = "Resid";
const WORD_END = "ential";
const HEADING = "Residential";

/**
 * The GSAP timeline resolved to milliseconds, less the 1250ms its letters
 * spent rising — the word is set before anyone scrolls. See `globals.css`.
 */
const LETTER_STAGGER = 25;
const SCRIM_AT = 2950;
const CONTENT_AT = 3650;
const CONTENT_STAGGER = 100;

/** The last frame: the final letter of the heading finishing its rise. */
const SPAN = CONTENT_AT + (HEADING.length - 1) * LETTER_STAGGER + 1250;

/** A moment on the timeline, expressed the way the stylesheet reads it. */
const at = (ms: number) => ({ "--reshero-at": `${ms}ms` }) as React.CSSProperties;

/**
 * The three frames flicked away before the real photograph lands. Stock, and
 * deliberately so — they are barely on screen. Swap them for Vijaya's own
 * residential work when it arrives; the last one is the only frame anyone
 * actually looks at.
 */
const flickFrames = [
  { src: img.haraVijayaHeights, className: "is--1" },
  { src: img.residentialInterior, className: "is--2" },
  { src: img.homeDusk, className: "is--3" },
];

export function ResidentialHero() {
  return (
    <ScrollScrub as="section" spanMs={SPAN} variable="--reshero-t" className="reshero relative">
      {/* No JavaScript, no scrubbing — so leave the hero at its last frame
          rather than at a first frame nothing can advance. */}
      <noscript>
        <style>{".reshero { --reshero-t: 99999ms !important; min-height: 100svh; } .reshero__stage { position: static; }"}</style>
      </noscript>

      <div className="reshero__stage sticky top-0 h-svh overflow-hidden rounded-b-[2.5rem] bg-mist sm:rounded-b-[4rem]">
        <div className="reshero__loader">
          {/* The header is transparent with white type over every hero on this
              site, and this one opens on paper. So the blue it needs is
              carried here instead: a navy band across the top of the stage,
              deep behind the bar and fading out below it. It sits first in
              the loader with no z-index of its own, so the moment the
              photograph floods it passes over the top — from there the
              picture's own scrim takes the header. Nothing in
              `site-header.tsx` changes. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(to_bottom,var(--color-navy-950)_0%,rgba(6,20,49,0.92)_46%,rgba(6,20,49,0)_100%)]"
          />

          <div className="reshero__word">
            <span aria-hidden="true" className="reshero__half is--start">
              <span>{WORD_START}</span>
            </span>

            <span className="reshero__box">
              <span className="reshero__box-inner">
                <span className="reshero__grow">
                  <span className="reshero__grow-wrap">
                    {flickFrames.map((frame) => (
                      <Image
                        key={frame.className}
                        src={frame.src}
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className={`reshero__cover ${frame.className}`}
                      />
                    ))}
                    <Image
                      src={img.balconyFamily}
                      alt={alt.balconyFamily}
                      fill
                      priority
                      sizes="100vw"
                      placeholder="blur"
                      className="reshero__cover"
                    />
                  </span>
                </span>
              </span>
            </span>

            <span aria-hidden="true" className="reshero__half is--end">
              <span>{WORD_END}</span>
            </span>
          </div>
        </div>

        {/* Once the picture is full-bleed it is a photograph, not a backdrop,
            so it needs the same grade every other hero on the site puts under
            its type — otherwise the sky behind the family eats the heading. */}
        <div
          aria-hidden="true"
          className="reshero__fade pointer-events-none absolute inset-0"
          style={at(SCRIM_AT)}
        >
          {/* Three stops rather than two: a little at the top so the header's
              white type still reads against a pale sky, almost nothing across
              the middle where the photograph should simply be the photograph,
              and the weight at the bottom where the copy sits. */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.04)_26%,rgba(0,0,0,0.08)_58%,rgba(0,0,0,0.74)_100%)]" />
          {/* Weighted into the corner the copy lands in, so the heading is not
              asked to hold its own against a sunset. Neutral black rather
              than the navy the other heroes use: over this photograph a navy
              scrim reads as a blue cast rather than as shade. */}
          <div className="absolute inset-0 bg-[radial-gradient(65%_55%_at_12%_88%,rgba(0,0,0,0.6),transparent_70%)]" />
        </div>

        <div className="container-page relative flex h-full flex-col justify-end pb-16 pt-40 sm:pb-20 sm:pt-44">
          <div className="max-w-4xl">
            <p className="reshero__rise-clip">
              <span className="reshero__rise" style={at(CONTENT_AT)}>
                <span className="eyebrow-rule text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400">
                  Residential Development
                </span>
              </span>
            </p>

            <h1 className="mt-7 flex overflow-hidden font-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.98] text-white">
              {HEADING.split("").map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="reshero__rise"
                  style={at(CONTENT_AT + index * LETTER_STAGGER)}
                >
                  {letter}
                </span>
              ))}
            </h1>

            <p className="reshero__rise-clip mt-7 max-w-2xl">
              <span
                className="reshero__rise text-[1.0625rem] leading-[1.75] text-navy-100/85 sm:text-[1.125rem]"
                style={at(CONTENT_AT + CONTENT_STAGGER)}
              >
                Thoughtfully planned homes backed by more than 50 years of
                construction experience.
              </span>
            </p>

            <div
              className="reshero__fade mt-10"
              style={at(CONTENT_AT + CONTENT_STAGGER * 2)}
            >
              <Button href="#apartment-projects" variant="light" size="lg" withArrow>
                Explore Our Residential Work
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ScrollScrub>
  );
}
