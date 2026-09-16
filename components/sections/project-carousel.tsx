"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/line-icons";

/**
 * A carousel of projects, turned by two arrows and by nothing else.
 *
 * Drawn from the reference the client sent (obsidian-blade.vercel.app), whose
 * cards stand on a ring in 3D: the one at the front square on, its neighbours
 * turned away and faded, the rest behind. That page drives its ring off the
 * wheel. This one must not — the brief was explicit — so the turn is a step,
 * taken on a press and eased over three quarters of a second. Nothing here
 * reads the scroll position, and the section is a normal height in ordinary
 * flow, unlike the pinned bands elsewhere on the site.
 *
 * Two things about the geometry are worth not undoing:
 *
 *  • Every card is cut to its own photograph's shape, not to a shared one.
 *    The five pictures run from 1.5:1 to 2.04:1, and the brief was that the
 *    whole of each one is on the page. A common frame can only honour that by
 *    letterboxing the widest against the narrowest — 22% of the card's height
 *    in bars for the pair at the ends. Sharing a *height* instead costs
 *    nothing: the cards vary in width by a sixth, which on a ring where the
 *    neighbours are turned 26° away and scaled down is not a difference the
 *    eye can find. `ratio` is read off the imported file, so a picture
 *    swapped for one of another shape needs no arithmetic here.
 *
 *  • The step between cards is a fixed length rather than a share of a card,
 *    for the same reason: the cards are not all one width, and spacing them
 *    by their own widths would make the gaps uneven as the ring turns.
 *
 * The offset each card is placed at is the *shortest way round* — with five
 * cards, card 0 sits one step to the right of card 4, not four steps to the
 * left — so the ring turns the short way whichever arrow is pressed and never
 * unwinds across the whole set. Anything more than two steps out is a card
 * the reader cannot see: it keeps its place in the DOM and the reading order
 * but is taken out of the tab order and hidden from the screen reader, so the
 * only things reachable are the arrows and the card at the front.
 */

export type CarouselProject = {
  image: StaticImageData;
  alt: string;
  /** The card's caption. Three words at most — it sits under the picture. */
  label: string;
};

/** How far out a card is still drawn. Past this it is behind the front card. */
const VISIBLE = 2;

export function ProjectCarousel({ items }: { items: readonly CarouselProject[] }) {
  const [active, setActive] = useState(0);
  const count = items.length;
  const headingId = useId();
  const liveRef = useRef<HTMLParagraphElement>(null);

  const step = useCallback(
    (delta: number) => setActive((i) => (i + delta + count) % count),
    [count],
  );

  /* The arrows are buttons and already take Enter and Space. Left and right
     are what a reader tries on a carousel, though, and they cost one listener
     on the stage rather than one per card. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  };

  /* Say which one is in front, for a reader who cannot see it turn. The card
     itself is not announced on the change — it is a picture and a caption,
     and both are in the live line below. */
  useEffect(() => {
    const el = liveRef.current;
    if (el) el.textContent = `${items[active].label}, ${active + 1} of ${count}`;
  }, [active, count, items]);

  /* The widest picture in the set decides how tall every card can be on a
     narrow screen — see `--card-h` in `globals.css`. Worked out here rather
     than written into the stylesheet so the two cannot drift apart. */
  const maxRatio = Math.max(...items.map((i) => i.image.width / i.image.height));

  return (
    <div className="projects" style={{ "--max-ratio": maxRatio } as CSSProperties}>
      {/* The stage. `perspective` lives here rather than on each card so the
          five share one vanishing point and the ring reads as one object;
          set per card it would give every one its own, and the turned cards
          would splay rather than curve. */}
      <div
        className="projects__stage"
        onKeyDown={onKeyDown}
        role="group"
        aria-roledescription="carousel"
        aria-labelledby={headingId}
        tabIndex={-1}
      >
        <h3 id={headingId} className="sr-only">
          Projects
        </h3>
        {items.map((item, index) => {
          /* The shortest way round: for five cards this maps 0…4 onto
             −2…2 rather than letting card 4 sit four steps from card 0. */
          let offset = index - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const away = Math.abs(offset);
          const hidden = away > VISIBLE;

          return (
            <figure
              key={item.label}
              className="projects__card"
              data-active={offset === 0 ? "" : undefined}
              aria-hidden={hidden || offset !== 0 ? true : undefined}
              style={
                {
                  "--o": offset,
                  "--away": away,
                  // The card is the picture's own shape, so `object-cover`
                  // crops nothing — see the note at the top.
                  "--ratio": `${item.image.width} / ${item.image.height}`,
                  zIndex: 10 - away,
                  opacity: hidden ? 0 : undefined,
                  pointerEvents: offset === 0 ? undefined : "none",
                } as CSSProperties
              }
            >
              <div className="projects__frame">
                <Image
                  src={item.image}
                  alt={offset === 0 ? item.alt : ""}
                  fill
                  // The front card is drawn about 60rem wide at the widest
                  // laptop and the neighbours smaller, so one stop covers
                  // every card at every width.
                  sizes="(max-width: 640px) 92vw, (max-width: 1280px) 70vw, 60rem"
                  className="object-cover"
                  preload={index === 0}
                />
              </div>
              <figcaption className="projects__label">{item.label}</figcaption>
            </figure>
          );
        })}
      </div>

      {/* The controls. Below the ring, and the only way it turns. */}
      <div className="projects__controls">
        <button
          type="button"
          className="projects__arrow"
          onClick={() => step(-1)}
          aria-label="Previous project"
        >
          <ArrowLeftIcon className="projects__arrow-glyph" />
        </button>

        {/* Where the reader is in the set. The current number is set at the
            size of the type around it and the total a step down, so the pair
            reads as one figure rather than as two. */}
        <p className="projects__count" aria-hidden="true">
          <span className="projects__count-now">
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className="projects__count-rule" />
          <span className="projects__count-all">
            {String(count).padStart(2, "0")}
          </span>
        </p>

        <button
          type="button"
          className="projects__arrow"
          onClick={() => step(1)}
          aria-label="Next project"
        >
          <ArrowRightIcon className="projects__arrow-glyph" />
        </button>
      </div>

      <p ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
