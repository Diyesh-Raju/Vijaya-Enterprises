import Image from "next/image";
import type { CSSProperties } from "react";
import { img, alt } from "@/lib/images";

/**
 * The name in the capsule, one word to a mask so they can be dealt in one
 * after another. Written as words rather than characters: the template
 * staggers per character over seven of them, and twenty-six characters at
 * the same step reads as a wipe rather than as words arriving.
 */
const LOADING_WORDS = ["Vijaya", "Enterprises’", "Legacy"] as const;

/**
 * The Our Legacy hero: a load on white paper, then the photograph opening
 * out of the middle of it, then the title from above and the date from
 * below.
 *
 * Built on the Capsule preloader in `Legacy 1.2/`: the name dealt into a
 * filling capsule at that template's own size, and then the picture easing
 * out of a zoom as it arrives. What it does not keep is the template's
 * shape wipe — the white simply goes, and the photograph is behind it at
 * full size already — nor the palette, since that page is dark and this one
 * opens on white with the company's own blue in the bar.
 *
 * THERE IS NO JAVASCRIPT IN IT. The template is a GSAP timeline of some
 * thirty tweens. This is a server component with no client bundle at all:
 * CSS animations on one clock, `transform` and `opacity` only, every one of
 * them on the compositor. Nothing measures the window and nothing runs on a
 * frame callback, so there is no hydration step that could arrive after the
 * first paint and restart the sequence — which for a load, of all things,
 * would be the one visible bug.
 *
 * ONE CLOCK. Every animation below is a share of `--reveal` on
 * `.legacy-intro`, and the phases are laid out in the note over
 * `.legacy-load` in `globals.css`. The tail of it — the grade, the title,
 * the date — is the sequence this hero already ended on, at the same
 * fractions it already used, because those were measured against this
 * photograph's brightest patch and the numbers have not changed.
 *
 * The load is a sibling of the section rather than a child of it. The
 * section isolates, so a layer inside it cannot come out over the header;
 * a preloader that leaves the bar sitting on top of it is not a preloader.
 */
export function LegacyHero() {
  return (
    /* The clock both halves run on lives here, because the load is a
       sibling of the section rather than a child of it and a custom
       property only reaches descendants. The holder carries nothing else —
       no z-index, no transform, no isolation — so the fixed load inside it
       still comes out over the header. */
    <div className="legacy-intro">
      {/* Over everything, including the header, and deaf to the pointer:
          the words in it are decoration, and the page's own title is the
          `h1` below. */}
      <div aria-hidden="true" className="legacy-load">
        <div className="legacy-load__pill">
          {/* The fill, under the words. Scaled from its left edge rather
              than grown, so the whole load costs one composited property. */}
          <span className="legacy-load__bar" />

          <span className="legacy-load__word">
            {LOADING_WORDS.map((word, index) => (
              <span
                key={word}
                className="legacy-load__word-mask"
                style={{ "--i": index } as CSSProperties}
              >
                <span className="legacy-load__word-run">{word}</span>
              </span>
            ))}
          </span>
        </div>

        {/* The white the capsule stands on. The picture is behind it at
            full size the whole time, so this simply goes and the photograph
            is there — nothing opens, and nothing grows. */}
        <div className="legacy-load__sheet" />
      </div>

      <section className="legacy-hero" aria-label="Our Legacy">
        {/* The photograph, easing out of the zoom it is uncovered on. Two
            boxes because the picture is drawn to the section and the zoom is
            a transform on what is inside it. */}
        <div className="legacy-hero__frame">
          <div className="legacy-hero__zoom">
            <Image
              src={img.legacyModelCity}
              alt={alt.legacyModelCity}
              fill
              quality={85}
              sizes="100vw"
              placeholder="blur"
              // It is the first thing on the page and it is behind a hole
              // that opens on it two and a half seconds in. A picture that
              // has not decoded by then is a white screen with a title on
              // it. Eager, so the server writes its preload into the head,
              // and fetched high, so that preload goes to the front of the
              // queue — `priority` used to mean both and in Next 16 means
              // only the first.
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </div>
        </div>

        {/* The grade the words stand on. Not there while the load is: the
            picture is uncovered ungraded, and this only arrives once the
            hole has finished opening. */}
        <div aria-hidden="true" className="legacy-hero__scrim" />

        <div className="legacy-hero__copy">
          {/* Each line travels inside its own clip, so it is uncovered
              rather than seen sliding in over the picture. */}
          <span className="legacy-hero__mask">
            <h1 className="legacy-hero__title">Our Legacy</h1>
          </span>
          <span className="legacy-hero__mask">
            <p className="legacy-hero__since">Since 1973</p>
          </span>
        </div>
      </section>
    </div>
  );
}
