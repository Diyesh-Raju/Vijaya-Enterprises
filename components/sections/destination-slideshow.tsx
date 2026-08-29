"use client";

import { useEffect, useRef } from "react";

/**
 * The Codrops "Gooey Hover" slideshow, pinned.
 *
 * `lib/gooey/` holds the demo's own `Stage`, `Scene`, `Tile`, `utils` and
 * `Layout`, copied across unchanged apart from what a module boundary forces:
 * the shaders come from `lib/gooey-shaders` (the same GLSL, already in this
 * repo), the tint variables are scoped to this section rather than the
 * document, and two `three` APIs the demo used have since been renamed. The
 * detail view and the licensed `SplitText` plugin are left out — this site has
 * no zoomed detail view for them to drive.
 *
 * The scroll is not the demo's. The demo hijacks the wheel while the pointer
 * is over the strip and lets the page carry on regardless; here the band is
 * pinned to the screen inside a taller track, and the page scroll through that
 * track walks the strip — so the reader passes all four tiles on the way down
 * and the page only moves on once the strip has run out. `lib/gooey/
 * PinnedScroll` is that transport, in place of `smooth-scrollbar` and its
 * horizontal plugin, and it still hands `Stage` and `Tile` the `offset` and
 * `limit` they were reading off the scrollbar — squash included, since the
 * strip is damped and so still has a velocity to squash by.
 *
 * ⚠️ The tiles are still the demo's travel photography, kept as-is on
 * request, now standing under "Our Accolades". On a construction company's
 * home page that is somebody else's content. Replace the pairs in
 * `public/gooey/` — a base and a hover frame each, 1024×1024 — and the copy
 * below, and everything else keeps working: the track measures the strip it is
 * given, so adding or dropping a tile changes how far the pin holds and
 * nothing else. Each tile also wants a `--color-text`/`--color-bg` pair in
 * `globals.css`, numbered by its position.
 */

type Slide = {
  key: string;
  lead: string;
  offset: string;
  alt: string;
};

const slides: readonly Slide[] = [
  { key: "woods", lead: "Woods &", offset: "Forests", alt: "Woods & Forests" },
  { key: "rocks", lead: "Rocks &", offset: "Mountains", alt: "Rocks & Mountains" },
  { key: "cities", lead: "Cities &", offset: "Skylines", alt: "Cities & Skylines" },
  { key: "deserts", lead: "Sand &", offset: "Deserts", alt: "Sand & Deserts" },
];

export function DestinationSlideshow() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // No WebGL, no scene — the photographs underneath are the fallback, and
    // they only step back once a plane is actually covering them. The pin and
    // the strip are set up either way: without them the tiles past the first
    // could not be reached at all.
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    const webgl = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();

    let stage: { destroy?: () => void } | null = null;

    // The demo's modules reach for `window` at import time, so they load in
    // the browser only. `window.APP` is the demo's own handle — its
    // `index.js` sets exactly this, and `Tile` reads `APP.Layout.isMobile`.
    void Promise.all([
      import("@/lib/gooey/Stage"),
      import("@/lib/gooey/Layout"),
    ]).then(([{ default: Stage }, { default: Layout }]) => {
      if (!rootRef.current) return;
      const APP = { Stage: null as unknown, Layout: new Layout() };
      (window as unknown as { APP: typeof APP }).APP = APP;
      stage = new Stage(root, { webgl });
      APP.Stage = stage;
    });

    return () => {
      stage?.destroy?.();
    };
  }, []);

  return (
    // The track is the band's scroll distance: one screen to hold the pin,
    // plus however far the strip has left to run. `PinnedScroll` measures the
    // strip and writes that second part back as `--gooey-travel`.
    <div className="gooey-track">
      <section ref={rootRef} className="gooey-demo">
        <h1 className="page-title | title">
          Our <span className="slideshow__title__offset | title__offset">Accolades</span>
        </h1>

        <canvas className="js-scene" aria-hidden="true" />

        <section className="slideshow-ctn">
          <div className="slideshow">
            <ul className="slideshow-list">
              {slides.map((slide) => (
                <li key={slide.key} className="slideshow-list__el">
                  <article className="tile | js-tile">
                    <a href="#what-we-build">
                      <figure className="tile__fig">
                        {/* A plain <img>, deliberately: it is the layout box the
                            WebGL plane measures itself against, and `three`
                            loads the same file by URL as a texture. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/gooey/${slide.key}-base.jpg`}
                          data-hover={`/gooey/${slide.key}-hover.jpg`}
                          alt={slide.alt}
                          className="tile__img"
                        />
                      </figure>
                      <div className="tile__content">
                        <h2 className="tile__title | title title--medium">
                          {slide.lead}{" "}
                          <span className="title__offset title__offset--medium">
                            {slide.offset}
                          </span>
                        </h2>
                        <div className="tile__cta">
                          <span className="btn-inline">See more</span>
                        </div>
                      </div>
                    </a>
                  </article>
                </li>
              ))}
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
