"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

// `useLayoutEffect` warns when React runs it on the server, and this band is
// server-rendered like the rest of the page. It is wanted for what it does on
// the client — write the strip's position before the browser paints — so the
// hook is swapped for the one that is legal where there is no layout to read.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? () => {} : useLayoutEffect;

/**
 * "Our Accolades" — a strip of the company's awards, walked by two arrows.
 *
 * The band came from the Codrops "Gooey Hover" demo, and what is left of it is
 * the layout. The demo's own draw — a WebGL plane over every photograph, so
 * that hovering one could pull it about under a blob — has been taken out: the
 * effect is not wanted on these pictures, and without it the planes were
 * redrawing photographs the browser had already drawn, at the cost of `three`,
 * a full-window canvas and a render loop. The photographs are now plain
 * `<img>`, which is what the demo fell back to on a machine with no WebGL
 * anyway. The colour the band swung through as the pointer passed a tile has
 * gone with them: the ground is one graded photograph that holds its colour,
 * and the band one ink on it.
 *
 * The scroll is not the demo's either — there is no scroll here at all. The
 * demo hijacks the wheel while the pointer is over the strip; this band was
 * then pinned to the screen inside a taller track, so the page scroll walked
 * the strip and the reader could not pass the section without passing every
 * award. Both are gone. A reader who wants the awards asks for them: the strip
 * is stepped by the two arrows at the band's lower left, one award to a press,
 * and the page scrolls past the section like any other. So the section is one
 * screen in ordinary flow, and `lib/gooey/Stage` and `lib/gooey/PinnedScroll`
 * — the pin, its measured track and its shared-loop tick — are gone with the
 * pin they existed for.
 *
 * The strip is placed rather than eased: the tile being read is centred in the
 * window, and the transform that puts it there is written once per press and
 * left to a CSS transition. Which tile is centred is measured from the layout
 * (`offsetLeft`, `offsetWidth`), so the frames can be any width they like —
 * the landscapes, in two shapes, and the certificate are all different, and
 * nothing here has to know that.
 *
 * Each award wants a picture in `public/accolades/`, named by its key. Adding
 * or dropping one changes how many presses the strip takes and nothing else.
 *
 * The caption is hung across the picture's lower left, which is the demo's own
 * arrangement: the name centred on the frame's edge, half of it outside and
 * half over the photograph, `See more` under it. Both are set in the band's
 * one light ink. The name is the only part that crosses the picture, and the
 * corner it crosses is darkened under it — see `.tile__link::after` in
 * `globals.css`, which is what lets one ink hold over the night ground and
 * over five photographs that agree on nothing. On a narrow screen there is no
 * room beside the picture for any of it, and the caption goes back under the
 * photograph, where it is over the ground and needs none of that.
 */

type Accolade = {
  key: string;
  /** The award, as it should be read. Set in caps by the stylesheet. */
  title: string;
  /** The citation under `See more`. Empty means no button and no panel. */
  description: string;
  alt: string;
  /** Landscape frame rather than the portrait default. */
  wide?: boolean;
  /**
   * A landscape frame cut to the photograph's own shape — its height over
   * its width, read off the file — so the whole picture shows rather than
   * being trimmed to 4:3. Leave it out for a 4:3 photograph.
   */
  shape?: number;
  /** A certificate rather than a photograph: shown whole, never cropped. */
  doc?: boolean;
};

const accolades: readonly Accolade[] = [
  {
    key: "times",
    title: "The Most Trusted & Preferred Developers 2024",
    description:
      "Vijaya Enterprises received the Times Business Award 2024 from Anupam Kher, Padma Shri (2004) and Padma Bhushan (2016) awardee and renowned Indian film actor.",
    alt: "Vijaya Enterprises receiving the Times Business Award 2024 in Bengaluru",
    // The two ceremony photographs are 3:2 and shown whole: their frames are
    // cut to each file's own shape, not to the 4:3 the society photographs
    // below are.
    wide: true,
    shape: 799 / 1200,
  },
  {
    key: "vijayavani",
    title: "Vijayavani International Award 2025",
    description:
      "Mahantesh B. Nelavagi received the prestigious Vijayavani International Award 2025. The honour was presented by Mr. B. N. Reddy, High Commissioner of India to Malaysia, and Dr. Anand Sankeshwar, MD of VRL Groups.",
    alt: "Mahantesh B. Nelavagi receiving the Vijayavani International Award 2025",
    wide: true,
    shape: 533 / 799,
  },
  // Two honours from the same occasion, which is why they carry the same
  // name: the society gave both at the opening ceremonies for its new school
  // building, and only the citations tell them apart.
  {
    key: "legacy-one",
    title: "Swami Vivekananda Rural Education Society",
    description:
      "Presented to Vijaya Enterprises at the opening ceremonies for the society's new school building.",
    alt: "Vijaya Enterprises being honoured at the opening of the Swami Vivekananda Rural Education Society's new school building",
    wide: true,
  },
  {
    key: "legacy-two",
    title: "Swami Vivekananda Rural Education Society",
    description:
      "A second honour from the same opening ceremonies for the society's new school building, presented by the Governor.",
    alt: "The Governor presenting Vijaya Enterprises with an award at the opening of the Swami Vivekananda Rural Education Society's new school building",
    wide: true,
  },
  // The name below is read off the certificate itself, and shortened to fit
  // the band: the award is given in full there as "IIB Best Builders, Land
  // Developers & Engineering Excellence Award – 2022", which sets nine words
  // across the picture and buries the certificate under its own title. The
  // long form belongs in the citation, which is awaiting its copy — drop the
  // words in and the button, the panel and the space they open into are
  // already here.
  {
    key: "iib-2022",
    title: "IIB Engineering Excellence Award 2022",
    description: "",
    alt: "The Icons of Indian Business certificate of appreciation presented to Mahantesh B. Nelavagi, Managing Director of Vijaya Enterprises, at the 2022 Engineer's Day awards in Bengaluru",
    doc: true,
  },
];

/**
 * Where the band is a walked strip rather than a grid. The same pair of
 * dimensions as the `desk:` variant in `globals.css` and as the two heroes'
 * `WIDE_QUERY` — a phone on its side is wider than any width alone can rule
 * out, so the height is what actually decides it.
 */
const DESK_QUERY = "(min-width: 48rem) and (min-height: 500px)";

const last = accolades.length - 1;

export function DestinationSlideshow() {
  const stripRef = useRef<HTMLUListElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [opened, setOpened] = useState<readonly string[]>([]);

  // Placed before the browser paints, so the strip is never seen at the
  // position it held for the tile before this one. The transition on
  // `.slideshow-list` is what makes the move visible; this only ever writes
  // where the move is going.
  useIsomorphicLayoutEffect(() => {
    const place = () => {
      const strip = stripRef.current;
      if (!strip) return;

      // On a phone there is no strip to place. The band is a two-up grid
      // there (see the closing block of the accolades CSS in `globals.css`),
      // and an inline transform left over from a wider window would slide
      // the whole grid sideways off the screen — inline styles outrank the
      // stylesheet, so the CSS cannot undo this one. Clearing it is the
      // component's job, and it has to happen on resize as well as on
      // mount, which is what this being inside `place` gets.
      if (!window.matchMedia(DESK_QUERY).matches) {
        strip.style.transform = "";
        return;
      }

      const tile = strip.children[current] as HTMLElement | undefined;
      const first = strip.children[0] as HTMLElement | undefined;
      if (!tile || !first) return;

      // Every tile is walked to the slot the first one rests in — its left
      // edge a gutter in from the window's edge, which is the room the
      // caption hangs into. Measured against the first tile rather than
      // centred in the window for one reason: at rest the strip then carries
      // no transform at all, so the band the server sends is already in the
      // right place and nothing jumps into position at hydration.
      //
      // Laid-out numbers, deliberately: `offsetLeft` is the same whatever
      // transform the strip is carrying at the time, where a bounding rect
      // would be measured through the one being replaced.
      const x = tile.offsetLeft - first.offsetLeft;

      strip.style.transform = `translate3d(${-Math.round(x)}px, 0, 0)`;
    };

    place();

    // Every length in the band is cut from the viewport, so a resize moves
    // every tile and the one being read has to be found again.
    window.addEventListener("resize", place);
    return () => { window.removeEventListener("resize", place); };
  }, [current]);

  // A citation opening under a tile does not move the strip — it is out of the
  // flow — so nothing has to be re-placed for it.
  const toggle = (key: string) => {
    setOpened((open) =>
      open.includes(key) ? open.filter((k) => k !== key) : [...open, key],
    );
  };

  const step = (by: number) => {
    setCurrent((i) => Math.min(Math.max(i + by, 0), last));
  };

  return (
    <section className="gooey-demo" aria-labelledby="accolades-title">
      {/* The ground is a still photograph on the section's own backdrop
          layer — see `.gooey-demo::before` in `globals.css`. It had an
          element of its own while it was being walked sideways against the
          strip; it does not move any more, so it does not need one. */}

      {/* Except on a phone, where it needs one after all.

          Off a phone the band is exactly one screen tall, so a backdrop
          pinned to the section is a backdrop pinned to the window and
          `::before` is the whole answer. On a phone the band is a wall of
          five awards several screens tall, and the same `::before` would
          be a photograph stretched over all of it and dragged past the
          reader as they scroll — which is the opposite of what a ground
          does.

          So there the ground gets an element: a screen-tall box made
          `sticky` inside a box that spans the section, which holds the
          photograph at the top of the window for exactly as long as the
          awards are going past it and lets it go at the section's floor.
          The same arrangement as the Amenities page's garden, and for the
          same two reasons — `background-attachment: fixed` is ignored
          outright on iOS, and a `sticky` child needs an ancestor that is
          not a scroll container, which is why the band clips on x with
          `clip` rather than `hidden`.

          It is empty and `display: none` above the phone breakpoint, so a
          laptop carries one bare div and downloads nothing for it: the
          picture is a background on a rule inside the phone media query,
          and a background in a rule that does not match is never
          fetched. */}
      <div className="gooey-demo__ground" aria-hidden="true">
        <div className="gooey-demo__ground-still" />
      </div>

      <h2 id="accolades-title" className="page-title | title">
        Our <span className="slideshow__title__offset | title__offset">Accolades</span>
      </h2>

      <section className="slideshow-ctn">
        <div className="slideshow">
          <ul className="slideshow-list" ref={stripRef}>
            {accolades.map((award) => {
              const isOpen = opened.includes(award.key);

              return (
                <li
                  key={award.key}
                  className={`slideshow-list__el${
                    award.wide ? " slideshow-list__el--wide" : ""
                  }${award.doc ? " slideshow-list__el--doc" : ""}`}
                  // Read by the frame's width and its `::before` — see
                  // `.slideshow-list__el--wide` in `globals.css`.
                  style={
                    award.shape
                      ? ({ "--accolade-shape": award.shape } as CSSProperties)
                      : undefined
                  }
                >
                  <article className="tile | js-tile">
                    {/* The photograph. The caption below is deliberately
                        outside this box, so reading the citation does not
                        cover the picture it belongs to. */}
                    <div className="tile__link">
                      <figure className="tile__fig">
                        {/* A plain <img>: the strip is transformed as a
                            whole, and `next/image` would only add a wrapper
                            between the frame and the picture it sizes. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/accolades/${award.key}.jpg`}
                          alt={award.alt}
                          className="tile__img"
                        />
                      </figure>
                    </div>

                    <div className="tile__content">
                      <h3 className="tile__title | title title--medium">
                        {award.title}
                      </h3>

                      {award.description ? (
                        <>
                          <div className="tile__cta">
                            <button
                              type="button"
                              className="btn-inline"
                              aria-expanded={isOpen}
                              aria-controls={`accolade-${award.key}`}
                              onClick={() => toggle(award.key)}
                            >
                              {isOpen ? "See less" : "See more"}
                            </button>
                          </div>
                          {/* The citation, inside a wrapper that exists
                              only to have a height worth animating. On a
                              phone the tile is in a grid and the paragraph
                              is in the flow, so opening one moves every
                              award below it; the wrapper is what makes that
                              a movement rather than a jump. See
                              `.tile__reveal` in `globals.css`.

                              It carries the open flag as well as the
                              paragraph, so the stylesheet can size the
                              wrapper without `:has()`. Off a phone the
                              wrapper is a plain block with one absolutely
                              positioned child, which is to say nothing at
                              all. */}
                          <div
                            className="tile__reveal"
                            data-open={isOpen ? "" : undefined}
                          >
                            <p
                              id={`accolade-${award.key}`}
                              className="tile__desc"
                              data-open={isOpen ? "" : undefined}
                            >
                              {award.description}
                            </p>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>

        {/* The arrows and the bar on one line, and that line is sticky.

            It has to be. The band used to be pinned, so it was on the screen
            whole or not at all; standing in ordinary flow it is exactly one
            screen tall, which means there is a single scroll position where
            all of it shows and every other one cuts something off. What it
            cut off was the controls, sitting on the section's floor — stop
            sixty pixels short of the mark and the circles are under the fold,
            which is what `the circle are dissappearing in the bottom` was.
            Sticky answers it at the root: the line holds a little above the
            window's bottom edge for as long as the band's own bottom is below
            it, and settles onto the band's floor as that floor comes up. So
            the arrows are reachable wherever the reader has stopped, and the
            band gets to keep its full screen. */}
        <div className="slideshow__controls">
          {/* Disabled at the ends rather than wrapped around: five awards are
              a short wall, and a press that jumped from the last back to the
              first would read as the strip having lost its place. The
              disabled pair is what tells the reader the wall has ends. */}
          <div className="slideshow__nav">
            <button
              type="button"
              className="slideshow__arrow"
              onClick={() => step(-1)}
              disabled={current === 0}
              aria-label="Previous accolade"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M14.5 5 7.5 12l7 7" />
              </svg>
            </button>

            <button
              type="button"
              className="slideshow__arrow"
              onClick={() => step(1)}
              disabled={current === last}
              aria-label="Next accolade"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9.5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="slideshow__progress-ctn">
            {/* The bar rests a full width to the left and is walked back to
                nothing, which is the demo's own 5-to-100 read — now against
                the award being shown rather than a scroll position. */}
            <span
              className="slideshow__progress"
              style={{ transform: `translateX(${-95 + (95 * current) / last}%)` }}
            />
          </div>
        </div>
      </section>
    </section>
  );
}
