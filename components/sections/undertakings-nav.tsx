"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * Where the section stops being scrolled through and starts being stepped:
 * anything that is not a laptop-shaped window, which is `desk:`'s query
 * turned around.
 *
 * On a phone the six panels no longer ride a track. The section is one
 * screen tall, the page scrolls past it like any other, and these two
 * arrows are the only way through the six — asked for by name
 * (2026-09-16). Four screens of pinned track is a long drag with a thumb
 * for someone who only wanted to get to the next section, and it took the
 * arrows' own purpose away: on a phone they were a shortcut through
 * scrolling that the reader was doing anyway.
 *
 * What a press does instead is write the scrub's own clock. Every
 * changeover in `globals.css` is an animation held at
 * `var(--undertake)`, so handing it a new time plays exactly the same
 * move the wheel would have scrubbed — the same wipes, the same pan, the
 * same rules filling along the foot. Nothing about the section's
 * appearance is a second implementation; only what moves the clock is.
 */
const STEPPED_QUERY = "(max-width: 47.9375rem), (max-height: 499px)";

/** How the clock is written when it is not the page writing it. */
const CLOCK_VAR = "--undertake";

/** Eased like everything else that arrives on this site. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

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
  /** Whether this window steps the six rather than scrolling through them. */
  const [stepped, setStepped] = useState(false);
  /** Which panel is up, while stepping. The scroll pass owns it otherwise. */
  const at = useRef(0);
  /** The tween in flight, so a second press takes over rather than fighting. */
  const tween = useRef(0);
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

  /**
   * Writes the clock straight onto the stage, easing from wherever it is
   * to where the asked-for panel rests.
   *
   * On the stage rather than on the track, which is what keeps the two
   * writers apart: `ScrollScrub` owns `--undertake` on the track, and with
   * no travel under it on a phone it writes 0 on every frame. A custom
   * property set on a descendant wins for everything inside it, so the
   * stage's value is the one the panels actually read and neither has to
   * know about the other.
   */
  const glideClock = useCallback(
    (to: number) => {
      const stage = navRef.current?.closest<HTMLElement>(".undertake__stage");
      if (!stage) return;

      const target = to * slot;
      const from =
        parseFloat(stage.style.getPropertyValue(CLOCK_VAR)) || at.current * slot;
      at.current = to;

      cancelAnimationFrame(tween.current);
      if (prefersReducedMotion()) {
        stage.style.setProperty(CLOCK_VAR, `${target}ms`);
        return;
      }

      const started = performance.now();
      const run = (now: number) => {
        const t = Math.min((now - started) / STEP_MS, 1);
        const value = from + (target - from) * easeOut(t);
        stage.style.setProperty(CLOCK_VAR, `${value}ms`);
        if (t < 1) tween.current = requestAnimationFrame(run);
      };
      tween.current = requestAnimationFrame(run);
    },
    [slot],
  );

  const step = (delta: number) => {
    // Stepped: the panel on screen is the one we last moved to, and a press
    // simply asks for its neighbour. No geometry — there is no track under
    // this, and nothing to measure against.
    if (stepped) {
      const to = at.current + delta;
      if (to < 0 || to > count - 1) return;
      glideClock(to);
      setEnds({ first: to === 0, last: to === count - 1 });
      return;
    }

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

  // Which of the two the window is, kept live: a phone turned on its side
  // is a laptop-shaped window by this measure, and the section has to
  // change hands with it.
  useEffect(() => {
    const query = window.matchMedia(STEPPED_QUERY);
    const sync = () => setStepped(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Stepped, the section opens on the first panel — or on the one a deep
  // link asked for, since `#industrial` and its neighbours have no travel
  // to land in here and would otherwise all come out at the first.
  useEffect(() => {
    if (!stepped) return;

    const hash = window.location.hash.slice(1);
    const anchor = hash ? document.getElementById(hash) : null;
    const asked = Number(anchor?.dataset.index);
    const opening = Number.isInteger(asked) ? Math.min(asked, count - 1) : 0;

    at.current = opening;
    glideClock(opening);

    // Which arrow is dimmed follows on the next frame rather than in the
    // body of the effect: the answer is read off the document, and the
    // pair cannot be pressed before it has been painted anyway.
    const settle = requestAnimationFrame(() =>
      setEnds({ first: opening === 0, last: opening === count - 1 }),
    );

    return () => {
      cancelAnimationFrame(settle);
      cancelAnimationFrame(tween.current);
    };
  }, [stepped, count, glideClock]);

  useEffect(() => {
    const track = navRef.current?.closest<HTMLElement>(".undertake");
    if (!track || stepped || prefersReducedMotion()) return;

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
  }, [count, slot, hold, span, stepped]);

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
