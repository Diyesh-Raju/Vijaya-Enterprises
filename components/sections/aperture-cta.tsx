import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScrollScrub } from "@/components/ui/scroll-scrub";
import { img, alt } from "@/lib/images";

/**
 * The closing invitation on /residential — the page's last screen, and the
 * only one that takes the whole window and holds it.
 *
 * A tall track with a pinned stage inside it, scrubbed by how far through
 * the track you have scrolled. Five moves, in this order:
 *
 *   1. the photograph closes to a vertical slit down the middle of the
 *      window, going dark as it narrows;
 *   2. the slit turns, off the vertical;
 *   3. it shrinks to nothing — brass for the last of it — and the two
 *      columns of copy standing behind it close in after it;
 *   4. two photographs wipe in over the top, one down from the left, one
 *      up from the right;
 *   5. the closing line rises into place, a line at a time, and the two
 *      buttons follow it.
 *
 * Nothing here runs on its own clock. Every animation is declared in
 * `globals.css` under `.aperture` and left `paused`; `ScrollScrub` writes
 * progress through the track into `--aperture` as a time, and each
 * animation's delay is its own start minus that. One number scrubs the
 * whole sequence, forwards and backwards, at exactly the rate the page is
 * scrolled. See the block in `globals.css` for the geometry.
 *
 * Below the enhancement — anyone who has asked for less motion — the track
 * collapses and the three layers become three ordinary stacked panels in
 * reading order: the photograph and its heading, the two columns, then the
 * closing line and the buttons. Same content, no travel.
 *
 * ⚠️ This is the page's one call to action, which the brief asks every
 * page to end with. If the arrangement is ever cut back, the two buttons
 * are the part that has to survive.
 */
export function ApertureCta() {
  return (
    <ScrollScrub
      as="section"
      // Progress through the track, written as a time in this span. 1000 for
      // no better reason than that the phases below are then readable as
      // percentages of it.
      spanMs={1000}
      variable="--aperture"
      className="aperture relative bg-navy-950"
    >
      <div className="aperture__stage">
        {/*
          Behind the photograph, and only ever seen through it: the two
          halves of how this conversation actually goes. Painted on the
          site's own off-white so the moment the slit closes reads as the
          page coming back, not as another picture.
        */}
        <div className="aperture__back">
          <div className="aperture__col">
            <div className="aperture__copy">
              <h3>What you tell us</h3>
              <p>
                Where you want to live, how much room your family needs, and
                what you are working with.
              </p>
            </div>
          </div>
          <div className="aperture__col">
            <div className="aperture__copy">
              <h3>What we tell you</h3>
              <p>
                Honestly, what is possible on that — and what it takes to build
                it well.
              </p>
            </div>
          </div>
        </div>

        {/*
          The last frame: two photographs closing on the middle of the
          window, with the invitation over them.
        */}
        <div className="aperture__outro">
          {/* Atmosphere, not information — the picture above them is the one
              that carries the description, and three descriptions of "a
              home" in a row is noise to read out. */}
          <div className="aperture__outro-img">
            <Image
              src={img.interiorFamily}
              alt=""
              fill
              sizes="50vw"
              placeholder="blur"
              className="object-cover"
            />
          </div>
          <div className="aperture__outro-img">
            <Image
              src={img.homeDusk}
              alt=""
              fill
              sizes="50vw"
              placeholder="blur"
              className="object-cover"
            />
          </div>

          <div className="aperture__outro-copy">
            {/* The lines are broken by hand rather than measured at runtime:
                the copy is two clauses, and each one wants its own rise. */}
            <h2>
              <span className="aperture__line">
                <span>So let&rsquo;s start</span>
              </span>
              <span className="aperture__line">
                <span>with a conversation.</span>
              </span>
            </h2>

            <div className="aperture__outro-actions">
              <Button href="/contact" variant="light" size="lg" withArrow>
                Talk To Us
              </Button>
              <Button href="/our-legacy" variant="ghost" size="lg">
                Our Legacy
              </Button>
            </div>
          </div>
        </div>

        {/*
          The photograph, over everything, and the thing that moves. Three
          nested elements because three properties are animated at three
          different moments and two of them are transforms: `clip-path`
          innermost so the slit is cut in the picture's own coordinates and
          then carried by the turn, the turn next, the shrink outside it.
        */}
        <div className="aperture__front">
          <div className="aperture__front-scale">
            <div className="aperture__front-clip">
              <Image
                src={img.homeLawn}
                alt={alt.homeLawn}
                fill
                quality={85}
                sizes="100vw"
                placeholder="blur"
                className="object-cover"
              />

              {/* Shade under the heading, always. The two scrubbed layers
                  above it are the ones that take the picture to black and
                  then to brass. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,20,49,0.35)_0%,rgba(6,20,49,0.15)_38%,rgba(6,20,49,0.82)_100%)]"
              />
              <div aria-hidden="true" className="aperture__veil" />
              <div aria-hidden="true" className="aperture__flash" />

              <div className="aperture__front-copy">
                <p className="eyebrow-rule text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400">
                  Find Your Home
                </p>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,5.6vw,4.25rem)] leading-[1.04] text-white">
                  Let&rsquo;s find the right home for your family.
                </h2>
                <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.75] text-navy-100/85">
                  Tell us where you want to live, what you need and what you
                  are working with. We will tell you honestly what is possible
                  — and what it takes to build it well.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollScrub>
  );
}
