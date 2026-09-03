"use client";

import type { StaticImageData } from "next/image";
import { useEffect, useId, useRef, type CSSProperties } from "react";
import {
  onScroll,
  prefersReducedMotion,
  refreshScroll,
  type Viewport,
} from "@/lib/scroll";

export type ProcessStep = {
  step: string;
  /**
   * The step's title in two halves — the first is set above the photograph
   * and the second below it, so the title reads across the frame rather than
   * sitting on one side of it. Together they are the whole title, unchanged.
   */
  title: readonly [string, string];
  body: string;
  image: StaticImageData;
  imageAlt: string;
};

/* ------------------------------------------------------------------
   The scroll
------------------------------------------------------------------- */

/**
 * Where a step's screen is when its cut starts opening: this far down the
 * window, as a share of it. The pair of words sits a little below the
 * screen's middle (the bar takes the top of it), so at this point they have
 * just come up over the bottom edge — the reveal starts the moment they are
 * seen, while the screen is still sliding up to its pin.
 */
const START = 0.38;

/**
 * How much of the pinned hold is kept back after the cut is fully open, as a
 * share of a screen. The finished step stands still for this much scroll
 * before it lets go — long enough to be read as a composition, and long
 * enough for the tail below to have caught up.
 */
const REST = 0.1;

/**
 * Seconds for the open value to catch up with where the page actually is.
 *
 * A mouse wheel moves the page in notches, and a value that simply *is* the
 * scroll position moves in the same notches — the photograph arrives in four
 * lurches. Chased instead, every notch becomes a glide that carries on for a
 * moment after the wheel has stopped, and a trackpad flick reads as weight
 * rather than drag. Short enough that on a phone the picture still follows
 * the thumb; the same figure `ScrollScrub` calls a tail rather than a lag.
 */
const EASE = 0.2;

/**
 * Close enough to count as arrived: a thousandth of the open is about one
 * unit of the largest cut's radius and a third of a pixel of a word's travel,
 * neither of which can be seen — and stopping there is what keeps the loop
 * from repainting the band for another half second of nothing.
 */
const SETTLED = 0.001;

/** How much the photograph grows behind its own cut-out, over the whole open. */
const ZOOM = 0.12;

/**
 * Navy over the photograph while the cut is still opening — a veil that is
 * lifted as it goes. Written as the opacity of a rect inside the same mask,
 * rather than as a `brightness()` filter on the image: the filter cost a
 * full-size offscreen pass of the picture on every frame, and it also left
 * the finished frame six percent brighter with JavaScript than without.
 */
const VEIL = 0.14;

/**
 * When the step's number and description arrive, in shares of the open.
 * They come up last, once the photograph has all but filled its frame and
 * the title is landing — the composition completes rather than being there,
 * finished, under a title still on its way. Late enough, too, that on the
 * panels whose title crosses the description's column on its way to its
 * own, the two are not seen laid over each other for long.
 */
const TEXT_FROM = 0.62;
const TEXT_TO = 0.96;
/** How far below its place the description starts, in pixels. */
const TEXT_RISE = 28;

/* ------------------------------------------------------------------
   The four frames
------------------------------------------------------------------- */

type Frame = {
  /** The box the photograph is cut to, in the panel's own units. */
  readonly box: readonly [number, number];
  /**
   * How the cut opens. `circle` grows from the middle of the frame; `lens`
   * splits a flat line open into an eye and keeps going until it has swallowed
   * the frame — the one panel where the photograph arrives sideways rather
   * than from the centre.
   */
  readonly shape: "circle" | "lens";
  /**
   * The turbulence the cut's edge is displaced by. A low frequency with a
   * large scale gives long, slow tongues of photograph; a high frequency with
   * a small one gives a fine, sandy edge. This is the whole character of each
   * reveal, so no two panels share a set.
   */
  readonly noise: {
    readonly frequency: number;
    readonly octaves: number;
    readonly scale: number;
    /** Softens the displaced edge, for a cut that seeps rather than tears. */
    readonly blur?: number;
  };
};

const FRAMES: readonly Frame[] = [
  {
    box: [1500, 1000],
    shape: "circle",
    noise: { frequency: 0.03, octaves: 3, scale: 50 },
  },
  {
    box: [1200, 900],
    shape: "circle",
    noise: { frequency: 0.01, octaves: 3, scale: 150, blur: 10 },
  },
  {
    box: [1400, 800],
    shape: "lens",
    noise: { frequency: 0.02, octaves: 3, scale: 80 },
  },
  {
    box: [1400, 900],
    shape: "circle",
    noise: { frequency: 0.5, octaves: 1, scale: 50 },
  },
];

/**
 * How far past the frame the mask and its filter are allowed to work. The
 * displacement can throw an edge this far outside the shape it was cut from,
 * and the blur reaches a little further still — so the region is the frame
 * plus this on every side, and nothing is clipped off short.
 */
const BLEED = 200;

/**
 * How far a circle has to grow to have swallowed its own frame: the half
 * diagonal, and a little more so the displaced edge is past the corners
 * rather than landing on them.
 */
const radiusOf = ([w, h]: readonly [number, number]) => Math.hypot(w, h) * 0.525;

/**
 * The lens, part way open. Two quadratics off the same flat line, one bowing
 * down and one up; a quadratic reaches half its control offset, so the offset
 * is taken well past the frame's own height to be sure the middle of it is
 * covered before the ends are.
 */
function lensPath([w, h]: readonly [number, number], open: number) {
  const mid = h / 2;
  const reach = (h * 1.3 + 120) * open;
  // A lens pinches to a point at either end, which would leave the corners of
  // the frame uncovered however far it is opened. So the points travel out
  // past the sides as it goes, and by the end they are off the frame
  // altogether — an open lens, and a covered rectangle.
  const from = -w * 0.5 * open;
  const to = w * (1 + 0.5 * open);
  return (
    `M ${from} ${mid} Q ${w / 2} ${mid + reach} ${to} ${mid} ` +
    `Q ${w / 2} ${mid - reach} ${from} ${mid}`
  );
}

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** 0 before `from`, 1 after `to`, linear between. */
const ramp = (value: number, from: number, to: number) =>
  clamp01((value - from) / (to - from));

/** Quick off the mark, settling into place — for things that arrive. */
const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

/**
 * The two halves take their travel at different rates, and this is why.
 *
 * They start side by side and end one above the other, so a pair moved
 * straight from one to the other has to pass through itself on the way — two
 * long words crossing over at exactly the moment the reader is looking at
 * them. Sending them apart *vertically* first and only then sideways keeps
 * them clear of each other for the whole of it: by the time either has
 * travelled far across the panel, they are already on separate lines.
 */
const upright = (open: number) => 1 - Math.pow(1 - open, 2.4);
const across = (open: number) => Math.pow(open, 1.7);

/* ------------------------------------------------------------------
   The band
------------------------------------------------------------------- */

/** Everything one panel's frame writes to, found once and kept. */
type Panel = {
  track: HTMLLIElement;
  screen: HTMLElement;
  ghostUp: HTMLElement;
  ghostDown: HTMLElement;
  up: HTMLElement;
  down: HTMLElement;
  mask: SVGElement;
  photo: SVGImageElement;
  veil: SVGElement;
  text: HTMLElement;
  frame: Frame;
  radius: number;
  /** The track's top edge, in document pixels, and the screen's height. */
  top: number;
  unit: number;
  /** How far the screen is held before the track lets it go. */
  hold: number;
  /** Where each word starts, relative to where it ends. */
  flight: readonly [number, number, number, number];
  /** What is on the nodes now. Below zero until the first write. */
  shown: number;
  /** Whether the words are currently promoted for their flight. */
  live: boolean;
};

/**
 * The steps of a joint venture, each one read on a screen of its own.
 *
 * A panel starts as two words in the middle of an empty screen. Scrolling
 * pulls them apart — one going up and one going down, into the places they
 * hold in the finished layout — and in the space they leave a photograph is
 * cut out of the page and opened until it fills the frame. The cut is not a
 * wipe or a fade: it is a circle (or, once, a lens) whose edge is thrown
 * about by a turbulence filter, so the picture arrives in ragged tongues and
 * only resolves into a rectangle at the end.
 *
 * How it is built:
 *
 *   • Each step is a *track* nearly two screens tall with its screen `sticky`
 *     inside it — the same arrangement as `HandshakeReveal`. The cut starts
 *     opening as the screen comes up the window, keeps opening while the
 *     screen is held at the top, and is finished a beat before the track lets
 *     it go. That is what gives the reveal its length: better than a screen
 *     of scroll, where a step that simply slid past had a third of one.
 *   • Both halves of a panel — the screen the words start on and the layout
 *     they end in — are laid in the same grid cell, so they are the same
 *     screen. The words simply travel between two positions the page already
 *     has.
 *   • The travel is measured, not guessed. A hidden copy of the pair sits at
 *     the centre of the screen, and the distance between it and the real
 *     words in the layout is what each frame interpolates — the same trick
 *     GSAP's Flip plays, without the library. Where every track starts in the
 *     document is measured at the same time, so a frame of scrolling reads
 *     nothing from layout at all: the band is one subscriber to the shared
 *     scroll loop, it works every panel out from the one scroll position it
 *     is handed, and it measures again only when something has actually
 *     moved — the window, the fonts, or the height of the page above it.
 *   • The value written is not the scroll position but a chase of it — see
 *     `EASE` — so the loop keeps running for a moment after the page has
 *     stopped, and the picture glides into place rather than stepping.
 *   • The cut is an SVG mask over the photograph, and opening it is one
 *     attribute — the circle's radius, or the lens's path. Vector at every
 *     size, and the turbulence is rendered by the browser rather than
 *     shipped. The mask and its filter are given fixed regions the size of
 *     the frame, so the work they do is the same on every frame of the open
 *     rather than growing with the shape.
 *   • Nothing re-renders. Every frame writes straight onto the nodes, and a
 *     panel whose value has not changed writes nothing at all.
 *
 * Open unless this says otherwise. The tracks are only made tall, and the
 * screens only pinned, under `data-process="on"` — set once the effect runs,
 * and only for a reader who has not asked for less motion. The mask is drawn
 * at its final size in the markup and the words sit where they end up, so no
 * JavaScript and reduced motion both land on the finished band — four
 * photographs with their titles across them, a screen each — rather than on
 * four blank screens whose cut-outs can never open.
 */
export function ProcessReveal({ items }: { items: readonly ProcessStep[] }) {
  const bandRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;

    if (prefersReducedMotion()) return;

    const panels: Panel[] = [];
    const tracks = band.querySelectorAll<HTMLLIElement>(".process-panel");
    for (const [index, track] of Array.from(tracks).entries()) {
      const screen = track.querySelector<HTMLElement>(".process-panel__screen");
      const ghostUp = track.querySelector<HTMLElement>(
        ".process-panel__stage .process-word--up",
      );
      const ghostDown = track.querySelector<HTMLElement>(
        ".process-panel__stage .process-word--down",
      );
      const up = track.querySelector<HTMLElement>(
        ".process-panel__layout > .process-word--up",
      );
      const down = track.querySelector<HTMLElement>(
        ".process-panel__layout > .process-word--down",
      );
      const mask = track.querySelector<SVGElement>(".process-frame__cut");
      const photo = track.querySelector<SVGImageElement>(".process-frame__photo");
      const veil = track.querySelector<SVGElement>(".process-frame__veil");
      const text = track.querySelector<HTMLElement>(".process-panel__text");
      if (
        !screen || !ghostUp || !ghostDown || !up || !down ||
        !mask || !photo || !veil || !text
      )
        return;

      const frame = FRAMES[index % FRAMES.length];
      panels.push({
        track, screen, ghostUp, ghostDown, up, down, mask, photo, veil, text,
        frame,
        radius: radiusOf(frame.box),
        top: 0,
        unit: 1,
        hold: 0,
        flight: [0, 0, 0, 0],
        shown: -1,
        live: false,
      });
    }
    if (panels.length === 0) return;

    /** Whether the positions have to be taken again before the next write. */
    let dirty = true;
    /** The window those positions were taken against. */
    let measuredWidth = -1;
    let measuredHeight = -1;
    /** When the last frame ran, for the chase. Zero while the loop is idle. */
    let last = 0;
    /** Whether the photographs have been asked to decode ahead of their cue. */
    let decoded = false;

    const measure = (y: number) => {
      // Every clearing write first, then every read, so the browser lays the
      // band out once for all four panels rather than once per panel. The
      // distance has to be between the two *layout* positions, not between
      // one of them and wherever the last frame left a word standing.
      for (const p of panels) {
        p.up.style.transform = "";
        p.down.style.transform = "";
      }
      for (const p of panels) {
        const startUp = p.ghostUp.getBoundingClientRect();
        const endUp = p.up.getBoundingClientRect();
        const startDown = p.ghostDown.getBoundingClientRect();
        const endDown = p.down.getBoundingClientRect();
        // Both ends scroll together, so the difference between them holds
        // wherever the page happens to be when it is taken.
        p.flight = [
          startUp.left - endUp.left,
          startUp.top - endUp.top,
          startDown.left - endDown.left,
          startDown.top - endDown.top,
        ];
        // The track's place in the document, and how much of it is hold: the
        // stylesheet decides both, and this only reads them back.
        p.top = p.track.getBoundingClientRect().top + y;
        p.unit = p.screen.offsetHeight || 1;
        p.hold = Math.max(p.track.offsetHeight - p.unit, 0);
        // Everything below is written against the new distances.
        p.shown = -1;
      }
      dirty = false;
    };

    const write = (p: Panel, open: number) => {
      const x = 1 - across(open);
      const y = 1 - upright(open);
      const [ux, uy, dx, dy] = p.flight;
      p.up.style.transform = `translate3d(${ux * x}px, ${uy * y}px, 0)`;
      p.down.style.transform = `translate3d(${dx * x}px, ${dy * y}px, 0)`;

      if (p.frame.shape === "circle") {
        p.mask.setAttribute("r", (p.radius * open).toFixed(1));
      } else {
        p.mask.setAttribute("d", lensPath(p.frame.box, open));
      }

      p.photo.style.transform = `scale(${1 + ZOOM * open})`;
      p.veil.style.opacity = `${VEIL * (1 - open)}`;

      const arrival = easeOut(ramp(open, TEXT_FROM, TEXT_TO));
      p.text.style.opacity = `${arrival}`;
      p.text.style.transform = `translate3d(0, ${(1 - arrival) * TEXT_RISE}px, 0)`;

      // The words and the description are given layers of their own only
      // for as long as they are moving. Standing `will-change` on eight
      // display-size words would be eight large layers held for the life of
      // the page; toggled, they exist for the flight and are given back
      // afterwards.
      const live = open > 0 && open < 1;
      if (live !== p.live) {
        p.live = live;
        if (live) p.track.dataset.live = "";
        else delete p.track.dataset.live;
      }
    };

    const tick = ({ y, width, height }: Viewport, now: number) => {
      if (dirty || width !== measuredWidth || height !== measuredHeight) {
        measuredWidth = width;
        measuredHeight = height;
        measure(y);
      }

      // The photographs are decoded once the band is within two screens, so
      // the first frame of a cut is not also the frame that decodes a
      // 1800-pixel JPEG behind it.
      if (!decoded && panels[0].top - y < height * 2) {
        decoded = true;
        for (const p of panels) {
          const image = new Image();
          image.src = p.photo.href.baseVal;
          image.decode?.().catch(() => {});
        }
      }

      // Capped, so a frame dropped or a tab left in the background does not
      // arrive as one enormous step; and worked out from the time that
      // actually passed, so the tail is the same length at 60Hz and at 120Hz.
      // The first frame after the loop has been idle has no last frame to
      // measure from and is taken as an ordinary one, so a gesture moves the
      // picture on the frame it lands rather than the one after.
      const elapsed = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const chase = 1 - Math.exp(-elapsed / EASE);

      let settling = false;
      for (const p of panels) {
        // Where the screen's top edge is, in screens, from the point the cut
        // starts opening to the point the finished frame is left to rest.
        // With no hold to run across — the stylesheet drops it on a window
        // too short to pin, see `globals.css` — the cut has to be open by
        // the time the screen reaches the top of the window, and is.
        const from = p.top - p.unit * START;
        const length =
          p.hold > 0 ? p.hold + p.unit * (START - REST) : p.unit * START;
        const target = clamp01((y - from) / Math.max(length, 1));

        // The first write of all goes straight through, so the band is never
        // seen catching up to where the page already is; after that the
        // value chases the page.
        let shown = p.shown < 0 ? target : p.shown + (target - p.shown) * chase;
        if (Math.abs(target - shown) <= SETTLED) shown = target;
        else settling = true;

        if (shown === p.shown) continue;
        p.shown = shown;
        write(p, shown);
      }

      // Returning `true` asks the shared loop for another frame, which is how
      // the tail keeps gliding after the page itself has stopped. Once every
      // panel has caught up the loop goes quiet until the page moves again.
      if (settling) return true;
      last = 0;
    };

    // The attribute first — it is what makes the tracks tall and pins the
    // screens — and then the first pass, which `onScroll` runs synchronously,
    // measures a band that is already in that shape. The browser never gets a
    // frame where the screens are pinned but the words have not been placed.
    band.dataset.process = "on";
    const stop = onScroll(tick);

    // The words are measured the first time the band is looked at, which can
    // be before Manrope has arrived. The fallback's metrics are close but not
    // the same, so the distances are taken again once the real face is in —
    // otherwise a panel measured against the fallback lands its words a few
    // pixels out for the life of the page.
    let mounted = true;
    document.fonts?.ready.then(() => {
      if (!mounted) return;
      dirty = true;
      refreshScroll();
    });

    // Anything above the band that changes height moves every track's place
    // in the document — the opening band growing its own track once its
    // effect runs, most of all. The page's height is the one thing all of
    // those have in common, so that is what is watched.
    const watcher =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            dirty = true;
            refreshScroll();
          });
    watcher?.observe(document.body);

    return () => {
      mounted = false;
      stop();
      watcher?.disconnect();
      delete band.dataset.process;
      // Back to the open frame the markup describes.
      for (const p of panels) {
        for (const node of [p.up, p.down, p.photo, p.text]) node.style.transform = "";
        p.veil.style.opacity = "";
        p.text.style.opacity = "";
        delete p.track.dataset.live;
        if (p.frame.shape === "circle") p.mask.setAttribute("r", String(p.radius));
        else p.mask.setAttribute("d", lensPath(p.frame.box, 1));
      }
    };
  }, [items]);

  return (
    <ol ref={bandRef} className="process-band">
      {items.map((item, index) => (
        <ProcessPanel key={item.step} item={item} index={index} />
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------
   One panel
------------------------------------------------------------------- */

function ProcessPanel({ item, index }: { item: ProcessStep; index: number }) {
  const frame = FRAMES[index % FRAMES.length];
  const [boxWidth, boxHeight] = frame.box;
  const radius = radiusOf(frame.box);

  const uid = useId().replace(/:/g, "");
  const noiseId = `${uid}-noise`;
  const maskId = `${uid}-mask`;
  const labelId = `${uid}-label`;

  // Both halves are sized off the longer of the two, so a title stays one
  // size across the frame and a long half still fits the column it has. See
  // `.process-word` in `globals.css`.
  const room = {
    "--chars": Math.max(item.title[0].length, item.title[1].length),
  } as CSSProperties;

  return (
    <li
      className={`process-panel process-panel--${(index % FRAMES.length) + 1}`}
      style={room}
    >
      {/* The screen: one window tall, and pinned inside the track once the
          effect is running. Both the stage and the layout are laid in its
          one grid cell. */}
      <div className="process-panel__screen">
        {/* The screen the words start on. Never seen: it is here to be
            measured. */}
        <div className="process-panel__stage">
          <span aria-hidden="true" className="process-word process-word--up">
            {item.title[0]}
          </span>
          <span aria-hidden="true" className="process-word process-word--down">
            {item.title[1]}
          </span>
        </div>

        <div className="process-panel__layout">
          {/* The title itself, for anything that reads rather than looks —
              the two halves above and below the frame are the same words,
              marked decorative so they are not read out twice. */}
          <h3 className="sr-only">{`${item.title[0]} ${item.title[1]}`}</h3>

          <span aria-hidden="true" className="process-word process-word--up">
            {item.title[0]}
          </span>
          <span aria-hidden="true" className="process-word process-word--down">
            {item.title[1]}
          </span>

          <svg
            className="process-frame"
            viewBox={`0 0 ${boxWidth} ${boxHeight}`}
            width={boxWidth}
            height={boxHeight}
            role="img"
            aria-labelledby={labelId}
          >
            <title id={labelId}>{item.imageAlt}</title>
            <defs>
              {/* Both regions are fixed to the frame rather than to the shape
                  being cut, which is the default. Bound to the shape they
                  would grow with it, and the turbulence would be worked out
                  over a different area on every frame; bound to the frame,
                  the work is the same size throughout. `sRGB` because the
                  only colour here is white: the conversions to and from
                  linear light that the default would run change nothing. */}
              <filter
                id={noiseId}
                filterUnits="userSpaceOnUse"
                x={-BLEED}
                y={-BLEED}
                width={boxWidth + BLEED * 2}
                height={boxHeight + BLEED * 2}
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency={frame.noise.frequency}
                  numOctaves={frame.noise.octaves}
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  result="edge"
                  scale={frame.noise.scale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
                {frame.noise.blur ? (
                  <feGaussianBlur in="edge" stdDeviation={frame.noise.blur} />
                ) : null}
              </filter>

              {/* An alpha mask: the shape is white on nothing, so alpha and
                  luminance give the same answer, and alpha is the one that
                  does not need converting first. */}
              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                x={-BLEED}
                y={-BLEED}
                width={boxWidth + BLEED * 2}
                height={boxHeight + BLEED * 2}
                style={{ maskType: "alpha" }}
              >
                {/* The filter is on a group rather than on the shape, and the
                    group holds an unpainted rectangle the size of the frame:
                    so the group's own box never changes as the shape grows,
                    and the browser has no reason to throw the filter away and
                    rebuild it between one frame and the next. */}
                <g filter={`url(#${noiseId})`}>
                  <rect width={boxWidth} height={boxHeight} fill="none" />
                  {frame.shape === "circle" ? (
                    <circle
                      className="process-frame__cut"
                      cx="50%"
                      cy="50%"
                      r={radius}
                      fill="#fff"
                    />
                  ) : (
                    <path
                      className="process-frame__cut"
                      d={lensPath(frame.box, 1)}
                      fill="#fff"
                    />
                  )}
                </g>
              </mask>
            </defs>

            <g mask={`url(#${maskId})`}>
              {/* Not `next/image`: the picture is masked by the SVG around it,
                  and only an SVG `image` can be. It is stored at one sensible
                  size for that reason — see the note in `lib/images.ts`. */}
              <image
                className="process-frame__photo"
                href={item.image.src}
                width={boxWidth}
                height={boxHeight}
                preserveAspectRatio="xMidYMid slice"
              />
              {/* The veil — see `VEIL`. Clear in the markup, so the finished
                  frame is the photograph as it is. */}
              <rect
                className="process-frame__veil fill-navy-900"
                width={boxWidth}
                height={boxHeight}
                opacity="0"
              />
            </g>
          </svg>

          <div className="process-panel__text">
            <span aria-hidden="true" className="process-panel__step">
              {item.step}
            </span>
            <p>{item.body}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
