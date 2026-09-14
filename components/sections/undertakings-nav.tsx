"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@/components/ui/line-icons";
import { glideTo } from "@/lib/glide";
import { onScroll, prefersReducedMotion } from "@/lib/scroll";

/**
 * The clock the section is timed on, in scrub units. All four numbers come
 * from `Undertakings`, which is where they are explained.
 */
type Clock = {
  count: number;
  /** A panel's whole turn: the hold on it, plus the move off it. */
  slot: number;
  /** How long a panel is held still before the changeover opens. */
  hold: number;
  /** The length of the whole sequence. */
  span: number;
};

/**
 * How long a press takes to get there.
 *
 * Said outright rather than left to `glideTo`'s own reckoning, which grows
 * with the distance and spends a second and a half on a step — right for a
 * link that takes the reader somewhere else on the page, far too slow for a
 * control they are going to press four times in a row. The changeover is
 * scrubbed by the page moving, so this is also how long the wipe takes; the
 * scrub's own tail carries the last of it (see `EASE` in `Undertakings`).
 */
const STEP_MS = 560;

/**
 * A couple of pixels of slack, and the whole reason the geometry below is
 * worked out in pixels rather than in scrub units.
 *
 * A press lands the page on a resting place worked out in floating point,
 * and it comes to rest a fraction of a pixel short of it as often as not.
 * Asked which panel that is with no slack, the answer is the panel *before*
 * the one on screen — and then the next press asks to be taken where the
 * page already is, which moves nothing. The arrows work once and then look
 * broken, which is exactly what they did.
 */
const SLACK = 2;

/**
 * Where the panels rest, and which one the page is on.
 *
 * `travel` is the track less the one screen the stage is pinned for —
 * exactly the distance `ScrollScrub` divides by, which is the whole point:
 * the two have to agree on where a panel has settled or an arrow would land
 * the section a little short of one every time. Every panel is one `step`
 * further down it, which is the same share of the travel the anchors are
 * dropped at (see `--at`).
 */
function geometry(track: HTMLElement, { count, slot, hold, span }: Clock) {
  const travel = Math.max(track.offsetHeight - window.innerHeight, 0);
  const top = window.scrollY + track.getBoundingClientRect().top;
  const step = (slot / span) * travel;

  /** Where the page has to be for panel `index` to have settled. */
  const rest = (index: number) => top + index * step;

  const y = window.scrollY;
  // The last panel to have settled: the one on screen, whether it is being
  // held or is already changing over to the next.
  let index = 0;
  while (index + 1 < count && y >= rest(index + 1) - SLACK) index += 1;

  return {
    rest,
    index,
    /** Past the hold, so the changeover to the next one has opened. */
    moving: y > rest(index) + (hold / span) * travel + SLACK,
  };
}

/**
 * Two arrows on the right of the pinned screen: one panel back, one panel on.
 *
 * The six panels arrive on the scroll and on nothing else, so the fourth of
 * them is four screens of scrolling away and the second is three screens
 * back — through everything in between, in both directions. A reader who
 * wants the industrial screen has no way to ask for it.
 *
 * A press does not play anything. It works out where the panel it is asking
 * for has settled and glides the page there, and the scrub runs the
 * changeovers on the way at exactly the rate it would under a wheel. There
 * is no second clock and no state the section can be left out of step with:
 * the arrows move the page, and the page moves the section.
 *
 * Everything is measured off the track live rather than kept from mount —
 * the track's height is a multiple of the window's, and a number cached
 * before the window was resized is a press that lands in the wrong place.
 *
 * At either end the arrow with nowhere to go is dimmed rather than taken
 * away, so the pair keeps its shape and says which way there is still to go.
 * Not shown at all for a reader who has asked for less motion: the track
 * collapses there and the six panels are six ordinary screens, which need
 * nothing to step through them.
 */
export function UndertakingsNav(clock: Clock) {
  const { count, slot, hold, span } = clock;
  const navRef = useRef<HTMLDivElement>(null);
  /**
   * Where the last press was headed, and until when that is still the
   * answer. Timed rather than asked: a press cancels the glide already
   * running on `pointerdown`, well before the click it belongs to is
   * delivered, so by the time this runs there is never anything in flight
   * to ask about — see `glideTo`, which hands back how long it will take.
   */
  const headed = useRef<{ index: number; until: number } | null>(null);

  const [ends, setEnds] = useState({ first: true, last: false });
  /** What the buttons are showing, so the scroll pass can leave React alone
   *  on all but the six frames of a section where the answer changes. */
  const shown = useRef(ends);

  const step = (delta: number) => {
    const track = navRef.current?.closest<HTMLElement>(".undertake");
    if (!track) return;

    const { rest, index, moving } = geometry(track, clock);

    /* A press that lands while the last one is still gliding counts from
       where that one was headed, so two quick presses move two panels
       rather than asking twice for the same one.

       Otherwise, from what is on screen — and mid-changeover the picture on
       screen is still `index`, so back means that one rather than the one
       before it: `index + 1` is where the page is going, and one step back
       from it is where it is. */
    const flying = headed.current;
    const from =
      flying && performance.now() < flying.until
        ? flying.index
        : delta < 0 && moving
          ? index + 1
          : index;

    const to = from + delta;
    if (to < 0 || to > count - 1) return;

    const ms = glideTo(rest(to), STEP_MS);
    headed.current = { index: to, until: performance.now() + ms };
  };

  useEffect(() => {
    const track = navRef.current?.closest<HTMLElement>(".undertake");
    if (!track || prefersReducedMotion()) return;

    return onScroll(() => {
      const { index, moving } = geometry(track, { count, slot, hold, span });
      // Against the top only while the first panel is still whole: once the
      // changeover off it has opened there is somewhere to go back to.
      const next = { first: index === 0 && !moving, last: index === count - 1 };
      if (next.first === shown.current.first && next.last === shown.current.last) {
        return;
      }
      shown.current = next;
      setEnds(next);
    });
  }, [count, slot, hold, span]);

  return (
    <div ref={navRef} className="undertake__nav">
      <button
        type="button"
        className="undertake__step undertake__step--up"
        onClick={() => step(-1)}
        disabled={ends.first}
        aria-label="Previous kind of work"
      >
        <ArrowUpIcon className="undertake__step-glyph" />
      </button>

      <button
        type="button"
        className="undertake__step undertake__step--down"
        onClick={() => step(1)}
        disabled={ends.last}
        aria-label="Next kind of work"
      >
        <ArrowDownIcon className="undertake__step-glyph" />
      </button>
    </div>
  );
}
