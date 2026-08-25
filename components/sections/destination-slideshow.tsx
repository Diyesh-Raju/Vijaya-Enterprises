"use client";

import { useCallback, useEffect, useRef } from "react";
import { GooeyScene } from "@/lib/gooey-scene";
import { Container } from "@/components/ui/section";

/**
 * The Codrops "Gooey Hover" slideshow, carried over as it is.
 *
 * Hovering a tile runs its own fragment shader — five tiles, five shaders —
 * over a WebGL plane laid on top of the picture. That part is the template
 * untouched; `lib/gooey-scene.ts` holds it and notes what had to move.
 *
 * The demo's colour is here too: five dark grounds and five pale inks, one
 * pair to a tile, swapped on hover.
 *
 * THE STRIP IS WALKED BY THE PAGE. The section is a tall track with a pinned
 * stage inside it: while the stage is pinned, scrolling down draws the strip
 * left, and the page only carries on to the next section once the last tile
 * has arrived. Scrolling back up runs the same thing in reverse. That is
 * nearer the demo than the arrows that used to be here were — it drove the
 * strip from a horizontal scroll too, through `smooth-scrollbar`, which this
 * does not need. The scene picks it up for free: it takes its squash from how
 * fast the strip is travelling, whatever is doing the travelling.
 *
 * Not everywhere, though. Pinning is for a wide window and only when motion
 * is welcome — everywhere else the strip is an ordinary horizontal scroller
 * you swipe, which is also what is left if JavaScript never arrives, since
 * the pinning is switched on by an attribute this component sets.
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

/**
 * Where the strip is walked by the page rather than swiped.
 *
 * Both halves of the switch read this one string: the effect asks it whether
 * to drive anything, and the attribute it sets is what turns the CSS on. A
 * breakpoint written twice is a breakpoint that will disagree with itself.
 */
const PINNED = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

/** The bar starts one tile in, so it reads as "one of five" rather than none. */
const BAR_START = 1 / COUNT;
const barTransform = (progress: number) =>
  `translateX(${-100 + (BAR_START + progress * (1 - BAR_START)) * 100}%)`;

export function DestinationSlideshow() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLUListElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);

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

  /**
   * The strip, driven by whatever is doing the scrolling.
   *
   * Two modes, one writer. Pinned, the page's own scroll through the section's
   * runway is the input and the strip is moved by a transform; loose, the
   * viewport is a real scroller and there is nothing to move — the bar just
   * reports where it has been dragged to.
   *
   * Everything is written straight to the nodes rather than through state: the
   * value changes every frame, and re-rendering five tiles to move one number
   * is work with nothing to show for it.
   */
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !stage || !viewport || !track) return;

    const media = window.matchMedia(PINNED);
    let travel = 0;
    let frame = 0;

    const paintBar = (progress: number) => {
      if (barRef.current) barRef.current.style.transform = barTransform(progress);
    };

    /** Pinned: how far through the runway the page is, 0 → 1. */
    const writePinned = () => {
      frame = 0;
      const runway = section.offsetHeight - stage.offsetHeight;
      const scrolled = -section.getBoundingClientRect().top;
      const progress =
        runway > 0 ? Math.min(Math.max(scrolled / runway, 0), 1) : 0;

      track.style.transform = `translate3d(${-(progress * travel)}px, 0, 0)`;
      paintBar(progress);
    };

    /** Loose: the viewport is the scroller, so only the bar has anything to do. */
    const writeLoose = () => {
      frame = 0;
      const reach = viewport.scrollWidth - viewport.clientWidth;
      paintBar(reach > 0 ? viewport.scrollLeft / reach : 0);
    };

    let write = writePinned;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => write());
    };

    /**
     * How much strip there is to walk, and therefore how tall the section has
     * to be: one window to stand the stage in, plus a pixel of runway for
     * every pixel the strip has to travel. One-to-one, so the tiles move at
     * the speed the wheel is turned rather than at some multiple of it.
     *
     * The order matters — the stage is only a window tall once the attribute
     * is on, so it cannot be measured before that.
     */
    const measure = () => {
      if (!media.matches) {
        delete section.dataset.pinned;
        section.style.height = "";
        track.style.transform = "";
        write = writeLoose;
        write();
        return;
      }

      // How far there is to go, asked of the browser rather than worked out
      // from the tiles: with the pinning off for a moment the viewport is a
      // real scroller, and how far it *could* be scrolled is exactly the
      // distance the strip has to travel. Measuring the strip instead gives
      // a number that is too small — the tiles are sized in percentages of a
      // `max-content` parent, so its box does not account for all of them.
      //
      // Both states are set inside one task with no paint between them, so
      // nothing of the loose layout ever reaches the screen.
      delete section.dataset.pinned;
      track.style.transform = "";
      travel = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);

      section.dataset.pinned = "on";
      section.style.height = `${stage.offsetHeight + travel}px`;
      write = writePinned;
      write();
    };

    measure();

    // The tiles are images: the strip's width is not final until they have
    // laid out, and it changes again with the window.
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    viewport.addEventListener("scroll", schedule, { passive: true });
    media.addEventListener("change", measure);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      viewport.removeEventListener("scroll", schedule);
      media.removeEventListener("change", measure);
      delete section.dataset.pinned;
      section.style.height = "";
      track.style.transform = "";
    };
  }, []);

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

  return (
    // `overflow-x: clip` rather than `hidden`: hidden would make this a scroll
    // container, and a sticky child sticks to its nearest scrollport — which
    // would be this box, which never scrolls, so the stage would simply sit
    // there. Clip crops without any of that.
    <section ref={sectionRef} className="gooey relative isolate overflow-x-clip">
      <div ref={stageRef} className="gooey__stage">
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

          <div
            ref={viewportRef}
            className="gooey__viewport hide-scrollbar relative z-10"
          >
            <ul ref={trackRef} className="gooey__track">
              {slides.map((slide, i) => (
                <li
                  key={slide.key}
                  // Every other tile rides high, which is the demo's rhythm.
                  data-lift={i % 2 === 0 ? "up" : "down"}
                  data-tint={i + 1}
                  className="gooey__slide"
                >
                  <article data-gooey-tile className="gooey__tile">
                    <a
                      href="#what-we-build"
                      className="block"
                      onMouseEnter={() => tint(i)}
                    >
                      <figure className="gooey__fig">
                        {/* A plain <img>, deliberately. It is the layout box
                            the WebGL plane measures itself against, and
                            `three` loads the same file by URL as a texture —
                            an optimised, srcset-driven <Image> would hand the
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

        {/* All that is left of the controls: how far through the strip you
            are. It is read, not pressed — the scroll is the control now. */}
        <Container className="relative z-20 mt-10 sm:mt-12">
          <div className="gooey__progress-ctn" role="presentation">
            <span
              ref={barRef}
              className="gooey__progress"
              style={{ transform: barTransform(0) }}
            />
          </div>
        </Container>
      </div>
    </section>
  );
}
