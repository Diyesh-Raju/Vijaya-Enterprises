"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GooeyScene } from "@/lib/gooey-scene";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/line-icons";
import { Container } from "@/components/ui/section";
import { cn } from "@/lib/cn";

/**
 * The Codrops "Gooey Hover" slideshow, carried over as it is.
 *
 * Hovering a tile runs its own fragment shader — five tiles, five shaders —
 * over a WebGL plane laid on top of the picture. That part is the template
 * untouched; `lib/gooey-scene.ts` holds it and notes what had to move.
 *
 * The demo's colour is here too: five dark grounds and five pale inks, one
 * pair to a tile, swapped on hover. Changed from the demo: the strip is walked
 * with the two round arrows instead of the horizontal wheel-scroll the demo
 * binds through `smooth-scrollbar` — which is why that dependency is not here.
 *
 * ⚠️ The tiles are the demo's own travel photography, kept as-is on request:
 * five destinations under "What's your next destination?". On a construction
 * company's home page that is somebody else's content. Replace the pairs in
 * `public/gooey/` — a base and a hover frame each, 1024×1024 — and the copy
 * below, and everything else keeps working.
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
  { key: "snow", lead: "Snow &", offset: "Mountains", alt: "Snow & Mountains" },
];

const COUNT = slides.length;

/** Must match `.gooey__track`'s transition in `globals.css`. */
const SLIDE_MS = 1100;

export function DestinationSlideshow() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackRef = useRef<HTMLUListElement | null>(null);

  /**
   * Where the strip stands, counted in tiles across the doubled list. It is
   * kept in a ref rather than in state because a wrap has to move the strip
   * twice in one gesture — once silently, once animated — and React's batching
   * would collapse those into a single paint, which is exactly the seam the
   * whole arrangement exists to hide. `shown` is only for the progress bar.
   */
  const position = useRef(0);
  const settling = useRef<number | null>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const track = trackRef.current;
    if (!canvas || !root || !track) return;

    // No WebGL, no scene — the pictures underneath are the fallback, and they
    // only step back once a plane is actually covering them.
    const probe = document.createElement("canvas");
    const supported = Boolean(
      probe.getContext("webgl2") ?? probe.getContext("webgl"),
    );
    if (!supported) return;

    const scene = new GooeyScene(canvas, root, track);
    return () => scene.destroy();
  }, []);

  useEffect(
    () => () => {
      if (settling.current !== null) window.clearTimeout(settling.current);
    },
    [],
  );

  /**
   * Where each tile starts, measured inside the strip.
   *
   * Not `offsetLeft`: every other slide carries a `translateY` for the demo's
   * staggered rhythm, and a transformed element becomes the `offsetParent` of
   * everything inside it — so `offsetLeft` reports 0 for every tile. Rects are
   * immune to that, and subtracting the strip's own rect cancels out whatever
   * the strip is currently translated by.
   */
  const offsetsWithin = (track: HTMLElement) => {
    const origin = track.getBoundingClientRect().left;
    return Array.from(
      track.querySelectorAll<HTMLElement>("[data-gooey-tile]"),
    ).map((tile) => tile.getBoundingClientRect().left - origin);
  };

  /**
   * Put tile `to` at the left of the frame.
   *
   * Measured from the first tile rather than from the strip's edge: the
   * opening margin is what gives every title room to hang off to its left,
   * and pulling a tile flush against the frame would shear the first of them.
   */
  const moveTo = useCallback((to: number, animate: boolean) => {
    const track = trackRef.current;
    if (!track) return;

    const offsets = offsetsWithin(track);
    if (offsets[to] === undefined) return;

    track.style.transition = animate ? "" : "none";
    track.style.transform = `translate3d(${-(offsets[to] - offsets[0])}px, 0, 0)`;

    if (!animate) {
      // Read back a layout value so the browser commits this position before
      // the transition is handed back; without it the two writes coalesce and
      // the silent jump animates after all. The flush is also what lets the
      // very next line start an animation *from here* in the same task, with
      // no need to wait a frame for it.
      void track.offsetWidth;
      track.style.transition = "";
    }
  }, []);

  /**
   * One tile in either direction, forever.
   *
   * The strip holds the five slides twice, so there is always another set to
   * walk into. Going forward past the last slide simply carries on into the
   * copy and then rebases by one set once the slide has finished — the tiles
   * either side of that seam are the same pictures in the same places, so the
   * rebase is invisible. Going back from the first does it the other way
   * round: jump a set forward with no transition, then animate back one.
   */
  const step = useCallback(
    (direction: 1 | -1) => {
      if (settling.current !== null) return;

      let from = position.current;

      if (direction === -1 && from === 0) {
        from = COUNT;
        position.current = from;
        moveTo(from, false);
      }

      const to = from + direction;
      position.current = to;
      setShown(((to % COUNT) + COUNT) % COUNT);

      moveTo(to, true);

      if (to >= COUNT) {
        settling.current = window.setTimeout(() => {
          settling.current = null;
          position.current = to - COUNT;
          moveTo(to - COUNT, false);
        }, SLIDE_MS + 60);
      }
    },
    [moveTo],
  );

  /**
   * The ground and the running ink swap to the pair belonging to the tile
   * under the pointer. They stay there once it leaves — the demo never puts
   * them back either, so the band holds the colour of whatever was looked at
   * last. Set on the section rather than on `document.documentElement`, which
   * is where the demo puts it, because here it is one band on a longer page.
   */
  const tint = useCallback((index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const n = index + 1;
    section.style.setProperty("--gooey-bg", `var(--gooey-bg${n})`);
    section.style.setProperty("--gooey-text", `var(--gooey-text${n})`);
  }, []);

  const arrow =
    "flex h-14 w-14 items-center justify-center rounded-full border border-white/30 text-white " +
    "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
    "hover:-translate-y-0.5 hover:border-white hover:bg-white/10 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-500";

  // The strip carries every slide twice so it can loop. The second set is the
  // same content over again, so it is hidden from assistive technology.
  const rendered = [...slides, ...slides];

  return (
    <section
      ref={sectionRef}
      className="gooey relative isolate overflow-hidden py-20 sm:py-24 lg:py-28"
    >
      <Container>
        <h2 className="gooey__title">
          What&rsquo;s your next{" "}
          <span className="gooey__title-offset">destination?</span>
        </h2>
      </Container>

      <div ref={rootRef} className="relative mt-10 sm:mt-12">
        {/* One canvas across the whole strip, *under* the tiles — the demo
            stacks it the same way (scene at z-index 3, content at 5). The
            planes stand in for the photographs, which are transparent by
            then; the titles and links stay in the DOM on top of them, which
            is the only reason they are still selectable and clickable. */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        />

        <div className="gooey__viewport relative z-10">
          <ul ref={trackRef} className="gooey__track">
            {rendered.map((slide, i) => (
              <li
                key={`${slide.key}-${i}`}
                // Keyed off the slide's place in the original five — `i %
                // COUNT`, not `i`, and not `nth-child`. With an odd number of
                // slides a copy would otherwise lift the opposite way to its
                // original, and the seam the loop hides would show up as a
                // jolt every time the strip rebased.
                data-lift={(i % COUNT) % 2 === 0 ? "up" : "down"}
                data-tint={(i % COUNT) + 1}
                className="gooey__slide"
                aria-hidden={i >= COUNT || undefined}
              >
                <article data-gooey-tile className="gooey__tile">
                  <a
                    href="#what-we-build"
                    className="block"
                    tabIndex={i >= COUNT ? -1 : undefined}
                    onMouseEnter={() => tint(i % COUNT)}
                  >
                    <figure className="gooey__fig">
                      {/* A plain <img>, deliberately. It is the layout box the
                          WebGL plane measures itself against, and `three`
                          loads the same file by URL as a texture — an
                          optimised, srcset-driven <Image> would hand the
                          loader a different file than the one on screen. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/gooey/${slide.key}-base.jpg`}
                        data-hover={`/gooey/${slide.key}-hover.jpg`}
                        alt={slide.alt}
                        className="gooey__img"
                        loading="eager"
                        decoding="async"
                      />
                    </figure>
                    <div className="gooey__content">
                      <h3 className="gooey__tile-title">
                        {slide.lead}{" "}
                        <span className="gooey__title-offset gooey__title-offset--medium">
                          {slide.offset}
                        </span>
                      </h3>
                      <div className="gooey__cta">
                        <span className="gooey__btn-inline">See more</span>
                      </div>
                    </div>
                  </a>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Container className="relative z-20 mt-10 flex items-center gap-4 sm:mt-12">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous destination"
          className={cn(arrow)}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next destination"
          className={cn(arrow)}
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>

        <div className="gooey__progress-ctn ml-2">
          <span
            className="gooey__progress"
            style={{ transform: `translateX(${-100 + ((shown + 1) / COUNT) * 100}%)` }}
          />
        </div>
      </Container>
    </section>
  );
}
