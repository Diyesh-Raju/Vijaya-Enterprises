"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Our Accolades" — a pinned strip of the company's awards.
 *
 * The band came from the Codrops "Gooey Hover" demo, and what is left of it is
 * the layout and the pin. The demo's own draw — a WebGL plane over every
 * photograph, so that hovering one could pull it about under a blob — has been
 * taken out: the effect is not wanted on these pictures, and without it the
 * planes were redrawing photographs the browser had already drawn, at the cost
 * of `three`, a full-window canvas and a render loop. The photographs are now
 * plain `<img>`, which is what the demo fell back to on a machine with no
 * WebGL anyway. The colour the band swung through as the pointer passed a
 * tile has gone with them: the ground is one graded photograph that holds its
 * colour, and the band one ink on it.
 *
 * The scroll is not the demo's either. The demo hijacks the wheel while the
 * pointer is over the strip and lets the page carry on regardless; here the
 * band is pinned to the screen inside a taller track, and the page scroll
 * through that track walks the strip — so the reader passes all four tiles on
 * the way down and the page only moves on once the strip has run out.
 * `lib/gooey/PinnedScroll` is that transport, in place of `smooth-scrollbar`
 * and its horizontal plugin, and `lib/gooey/Stage` hangs the progress bar, the
 * heading's drift and the ground's on it.
 *
 * Each award wants a photograph in `public/accolades/`, named by its key. The
 * track measures the strip it is given, so adding or dropping an award changes
 * how far the pin holds and nothing else.
 *
 * The caption is hung across the picture's lower left, which is the demo's own
 * arrangement: the name centred on the frame's edge, half of it outside and
 * half over the photograph, `See more` under it. It is set in cream there
 * rather than the band's navy — half of every line is over an award being
 * handed over on a dark stage, and no one ink reads over both that and a
 * champagne ground. On a narrow screen there is no room beside the picture for
 * any of it, and the caption goes back under the photograph in navy.
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
};

const accolades: readonly Accolade[] = [
  {
    key: "times",
    title: "The Most Trusted & Preferred Developers 2024",
    description:
      "Vijaya Enterprises received the Times Business Award 2024 from Anupam Kher, Padma Shri (2004) and Padma Bhushan (2016) awardee and renowned Indian film actor.",
    alt: "Vijaya Enterprises receiving the Times Business Award 2024 in Bengaluru",
  },
  {
    key: "vijayavani",
    title: "Vijayavani International Award 2025",
    description:
      "Mahantesh B. Nelavagi received the prestigious Vijayavani International Award 2025. The honour was presented by Mr. B. N. Reddy, High Commissioner of India to Malaysia, and Dr. Anand Sankeshwar, MD of VRL Groups.",
    alt: "Mahantesh B. Nelavagi receiving the Vijayavani International Award 2025",
  },
  // The last two are awaiting their copy. The name and the citation are the
  // only things missing — drop the words in and the button, the panel and the
  // space they open into are already here.
  {
    key: "legacy-one",
    title: "Old Prize",
    description: "",
    alt: "An early Vijaya Enterprises award being presented",
    wide: true,
  },
  {
    key: "legacy-two",
    title: "Old Prize",
    description: "",
    alt: "An early Vijaya Enterprises award being presented",
    wide: true,
  },
];

export function DestinationSlideshow() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [opened, setOpened] = useState<readonly string[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let stage: { destroy?: () => void } | null = null;
    // The module arrives on its own clock, and by then this effect may already
    // have been cleaned up — React runs every effect twice in development, and
    // a navigation can unmount the section mid-import. A second Stage would
    // leave a second scroll listening on a strip nobody is showing.
    let cancelled = false;

    // `Stage` reaches for `window` at import time, so it loads in the browser
    // only.
    void import("@/lib/gooey/Stage").then(({ default: Stage }) => {
      if (cancelled || !rootRef.current) return;
      stage = new Stage(root);
    });

    return () => {
      cancelled = true;
      stage?.destroy?.();
    };
  }, []);

  const toggle = (key: string) => {
    setOpened((open) =>
      open.includes(key) ? open.filter((k) => k !== key) : [...open, key],
    );
  };

  return (
    // The track is the band's scroll distance: one screen to hold the pin,
    // plus however far the strip has left to run. `PinnedScroll` measures the
    // strip and writes that second part back as `--gooey-travel`.
    <div className="gooey-track">
      <section ref={rootRef} className="gooey-demo" aria-labelledby="accolades-title">
        {/* The ground: the brushed swirl, laid under the whole band and walked
            sideways by the same scroll that walks the strip, so the band reads
            as one moving thing rather than tiles sliding over a still colour.
            Laid wider than the band it sits in, and the walk is taken out of
            that slack, so its own edge never comes into view. */}
        <div className="gooey-backdrop" aria-hidden="true" />

        <h2 id="accolades-title" className="page-title | title">
          Our <span className="slideshow__title__offset | title__offset">Accolades</span>
        </h2>

        <section className="slideshow-ctn">
          <div className="slideshow">
            <ul className="slideshow-list">
              {accolades.map((award) => {
                const isOpen = opened.includes(award.key);

                return (
                  <li
                    key={award.key}
                    className={`slideshow-list__el${
                      award.wide ? " slideshow-list__el--wide" : ""
                    }`}
                  >
                    <article className="tile | js-tile">
                      {/* The photograph, and the box the band's colour swing
                          asks about — the caption below is deliberately
                          outside it, so reading the citation does not hold the
                          band on that award's colour. */}
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
                            <p
                              id={`accolade-${award.key}`}
                              className="tile__desc"
                              data-open={isOpen ? "" : undefined}
                            >
                              {award.description}
                            </p>
                          </>
                        ) : null}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="slideshow__progress-ctn">
            <span className="slideshow__progress" />
          </div>
        </section>
      </section>
    </div>
  );
}
