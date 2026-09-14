import { getImageProps } from "next/image";
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
 * Where the upright photograph gives way to the landscape one. The same
 * query `desk:` is, and the same one the two home heroes branch on — a
 * phone on its side is past the 768 that `md:` alone would ask for, and it
 * wants the landscape crop.
 */
const WIDE_QUERY = "(min-width: 48rem) and (min-height: 500px)";

const HERO_COMMON = { alt: alt.legacyHeroOffice, quality: 85 };

const { props: wide } = getImageProps({
  ...HERO_COMMON,
  src: img.legacyHeroOffice,
  fill: true,
  sizes: "100vw",
});

/* The upright one is the `<img>` itself rather than a second `<source>`, so
   that a browser too old for `<picture>` — and any crawler reading the
   markup flat — gets the photograph rather than nothing. */
const { props: phone } = getImageProps({
  ...HERO_COMMON,
  src: img.legacyHeroOfficePhone,
  fill: true,
  /* Not 100vw. The frame is taller than 9:16 on most phones, so `cover`
     fits this one by its height and overflows the width — a 390px-wide
     frame 844 tall draws the 900 × 1600 source about 475px across and
     crops the rest. Asking for 100vw serves 390 of those 475 and the
     picture is soft; 125vw asks for the width it is actually drawn at. */
  sizes: "125vw",
});

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
          {/* Two photographs of the same two men in the same room, one
              landscape and one upright, and the browser picks. A `<picture>`
              rather than two `<Image>`s gated by CSS, because a hidden
              `<img>` is still downloaded — the note at the top of
              `curtain-photo.tsx` is the long version — and rather than the
              client-side branch that file uses, because this is the page's
              LCP and choosing it in JavaScript would not let the preload
              scanner start the fetch until React had mounted. `<picture>`
              gets both: one download, chosen in markup the scanner can read.

              `getImageProps` is what makes the optimiser available to a
              `<source>`; it is Next 16's documented route to art direction.
              What it costs is `placeholder="blur"`, which it cannot be used
              with — so the blur is painted by `.legacy-hero__frame` as a
              background instead, which is the same trick `CurtainPhoto`
              uses and costs no request either way. */}
          <div
            className="legacy-hero__zoom"
            style={
              {
                "--blur-wide": `url("${img.legacyHeroOffice.blurDataURL}")`,
                "--blur-phone": `url("${img.legacyHeroOfficePhone.blurDataURL}")`,
              } as CSSProperties
            }
          >
            <picture>
              <source media={WIDE_QUERY} srcSet={wide.srcSet} />
              <img
                {...phone}
                // It is the first thing on the page and it is behind a hole
                // that opens on it two and a half seconds in. A picture that
                // has not decoded by then is a white screen with a title on
                // it.
                loading="eager"
                fetchPriority="high"
                className="legacy-hero__photo"
                alt={alt.legacyHeroOffice}
              />
            </picture>
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
