"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { onScroll, prefersReducedMotion } from "@/lib/scroll";
import { Eyebrow } from "@/components/ui/section";
import {
  HANDSHAKE_ANCHOR_CLEARANCE,
  HANDSHAKE_ANCHOR_X,
  HANDSHAKE_ANCHOR_Y,
  HANDSHAKE_HANDS,
  HANDSHAKE_SLEEVES,
  HANDSHAKE_WIDTH,
} from "@/lib/handshake-mark";

/** Viewport heights the band occupies, counting the one it is read on. */
const TRACK_SCREENS = 4;

/**
 * The band's three moments, in fractions of the track.
 *
 * The mark opens for the first two thirds, holds the photograph clear for a
 * beat, and the copy arrives after it. Nothing overlaps: the reader is doing
 * one thing at a time.
 *
 * ⚠️ THE COPY HAS TO FINISH ARRIVING WITH SCROLL LEFT TO SPARE. Its whole
 * block — heading and paragraphs together — is faded in on `arrival`, so
 * until that reaches 1 every colour inside it is being multiplied down. At
 * 0.74→0.95 it was fully opaque for the last 189px of a 2700px track and
 * above 95% for the last 324px, which is nowhere near where a reader stops:
 * for practically the whole band the copy was showing at some fraction of
 * itself. It read as dim type, and it could not be fixed by making the type
 * brighter — the ink was never the thing holding it back. Ending at 0.80
 * leaves the last fifth of the track, about 540px of scrolling, with the
 * copy at full strength.
 *
 * If these move again, keep `COPY_FROM` at or after `OPEN_END` — the copy
 * should not start arriving while the photograph is still opening — and keep
 * `COPY_TO` far enough below 1 that the reader gets a stretch of the band
 * with the words at full strength.
 */
const OPEN_END = 0.64;
const CUFF_END = 0.2;
const TINT_END = 0.34;
const COPY_FROM = 0.66;
const COPY_TO = 0.8;

/** How wide the mark stands at rest — a share of the panel, held between. */
const MARK_SHARE = 0.46;
const MARK_MIN = 240;
const MARK_MAX = 560;

/**
 * Slack on the scale that finishes the opening. The mark has to grow until
 * the solid part around its centre covers the panel's far corner; this is how
 * much further it is taken so the last edge is comfortably past it rather
 * than landing on it.
 */
const OPEN_MARGIN = 1.2;

/**
 * The exponent the opening runs on. The mark grows *multiplicatively* — a
 * fixed exponent of 1 would double it in the same length of scroll whether it
 * were 200px wide or 20,000px, which reads as a constant rush. Above 1 the
 * first half is nearly still, so the mark stays a mark for most of the band
 * and only breaks its banks at the end.
 */
const OPEN_CURVE = 1.85;

/** How much too close the photograph starts, as a share of its own size. */
const PHOTO_ZOOM = 0.09;

/** Navy over the photograph while it is still only glimpsed through the mark. */
const TINT_STRENGTH = 0.66;

/**
 * Seconds for the shown progress to catch up with where the page actually
 * is. Written straight off the scroll position the band moved in the same
 * notches the page did — a wheel's clicks, a thumb's stops and starts on a
 * phone — and the mark opened in lurches. Chased instead, every notch is a
 * glide that runs on for a moment after the page has stopped, the same
 * figure `ProcessReveal` uses. Asked for by name (2026-09-16).
 */
const EASE = 0.2;

/** Close enough to count as arrived; see `ProcessReveal`. */
const SETTLED = 0.0005;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** 0 before `from`, 1 after `to`, linear between. */
const ramp = (value: number, from: number, to: number) =>
  clamp01((value - from) / (to - from));

/** Quick off the mark, settling into place — for things that arrive. */
const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

type HandshakeRevealProps = {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  image: StaticImageData;
  imageAlt: string;
};

/**
 * The joint-venture mark, opened out until the photograph inside it is the
 * whole screen.
 *
 * The band starts as the same clasped hands that stand for joint ventures on
 * the home page, sized to about half the screen — except the mark is not
 * inked, it is cut out. Behind it is the photograph, held back under navy so
 * only glimpses of it come through the silhouette and the thing still reads
 * as the icon. Scrolling opens the cut-out: the navy lifts, the cuffs go, the hands grow past the edges of the screen, and what is left is
 * the photograph full-bleed. The last of the scroll brings the copy up onto
 * it.
 *
 * How it is built:
 *
 *   • The section is a tall *track* and the panel inside it is `sticky`, so
 *     the panel holds the screen while the track scrolls past underneath —
 *     the same arrangement as `ScrollHero`. How far the track has travelled
 *     is the whole of the state.
 *   • The white is an SVG rectangle over the photograph with the mark masked
 *     out of it, and opening the mark is one `transform` on the masked shape.
 *     So it stays vector at every size: the shape ends up tens of thousands
 *     of pixels across, which no rasterised mask would survive.
 *   • That transform grows the mark about its own centre, which is the
 *     deepest point of solid mark near the middle of it — see
 *     `HANDSHAKE_ANCHOR_CLEARANCE`. Growing it about a thinner point would
 *     leave a white splinter sitting in the middle of the screen long after
 *     the rest had gone.
 *   • Nothing here re-renders. Every frame writes attributes and styles
 *     straight onto the nodes, the way `ScrollScrub` and `ScrollZoom` do,
 *     and writes are coalesced to one per frame.
 *
 * Settled unless this says otherwise. The track is only made tall, and the
 * white only painted, under `data-keyhole="on"` — set once the effect runs,
 * and only for a reader who has not asked for less motion. So no JavaScript
 * and reduced motion both land on the finished frame: the photograph
 * full-bleed with the copy on it, one screen tall, rather than three screens
 * of dead scroll past a mark that cannot open.
 */
export function HandshakeReveal({
  eyebrow,
  title,
  children,
  image,
  imageAlt,
}: HandshakeRevealProps) {
  const trackRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const tintRef = useRef<HTMLDivElement | null>(null);
  const maskRef = useRef<SVGGElement | null>(null);
  const cuffRef = useRef<SVGGElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);

  const maskId = `${useId().replace(/:/g, "")}-keyhole`;

  useEffect(() => {
    const track = trackRef.current;
    const panel = panelRef.current;
    const photo = photoRef.current;
    const tint = tintRef.current;
    const mask = maskRef.current;
    const cuff = cuffRef.current;
    const scrim = scrimRef.current;
    const copy = copyRef.current;
    if (!track || !panel || !photo || !tint || !mask || !cuff || !scrim || !copy)
      return;

    if (prefersReducedMotion()) return;

    /** What the nodes show now; below zero until the first write. */
    let shown = -1;
    /** When the last frame ran, for the chase. Zero while the loop is idle. */
    let last = 0;

    const tick = ({ height: viewportHeight }: { height: number }, now: number) => {
      const box = track.getBoundingClientRect();
      const distance = box.height - viewportHeight;
      const target = distance > 0 ? clamp01(-box.top / distance) : 1;

      // The first write goes straight through, so the band is never seen
      // catching up to where the page already is; after that the value
      // chases the page. Capped and clocked as `ProcessReveal` does it.
      const elapsed = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const chase = 1 - Math.exp(-elapsed / EASE);
      let next = shown < 0 ? target : shown + (target - shown) * chase;
      const settling = Math.abs(target - next) > SETTLED;
      if (!settling) next = target;
      if (next === shown) {
        if (!settling) last = 0;
        return settling;
      }
      shown = next;
      const progress = shown;

      const width = panel.clientWidth;
      const height = panel.clientHeight;

      // Where the mark starts, in panel pixels per grid unit…
      const from =
        Math.min(Math.max(width * MARK_SHARE, MARK_MIN), MARK_MAX) /
        HANDSHAKE_WIDTH;
      // …and where it has to get to: solid mark out to the far corner.
      const to =
        (Math.hypot(width, height) / 2 / HANDSHAKE_ANCHOR_CLEARANCE) *
        OPEN_MARGIN;

      const open = ramp(progress, 0, OPEN_END);
      const scale = from * Math.pow(to / from, Math.pow(open, OPEN_CURVE));

      // Grown about the mark's own centre, which is held at the centre of
      // the panel — so the mark opens where it stands rather than drifting
      // off one side as it goes.
      const shape =
        `translate(${width / 2} ${height / 2}) scale(${scale}) ` +
        `translate(${-HANDSHAKE_ANCHOR_X} ${-HANDSHAKE_ANCHOR_Y})`;
      mask.setAttribute("transform", shape);
      cuff.setAttribute("transform", shape);

      cuff.style.opacity = `${1 - ramp(progress, 0, CUFF_END)}`;
      tint.style.opacity = `${TINT_STRENGTH * (1 - ramp(progress, 0, TINT_END))}`;
      photo.style.transform = `scale(${1 + PHOTO_ZOOM * (1 - open)})`;

      const arrival = easeOut(ramp(progress, COPY_FROM, COPY_TO));
      scrim.style.opacity = `${easeOut(ramp(progress, COPY_FROM - 0.06, COPY_TO - 0.12))}`;
      copy.style.opacity = `${arrival}`;
      copy.style.transform = `translateY(${(1 - arrival) * 32}px)`;

      // `true` asks the shared loop for another frame, which is how the
      // glide carries on after the page has stopped.
      if (settling) return true;
      last = 0;
    };

    // `onScroll` runs its subscriber once, synchronously, before returning —
    // so by the time the attribute goes on, the mask has already been placed.
    // The browser therefore never gets a frame where the white is painted but
    // the mark it is cut with has not been positioned yet.
    const stop = onScroll(tick);
    track.dataset.keyhole = "on";

    return () => {
      stop();
      delete track.dataset.keyhole;
      for (const node of [photo, tint, scrim, copy]) {
        node.style.opacity = "";
        node.style.transform = "";
      }
      cuff.style.opacity = "";
    };
  }, []);

  return (
    <section
      ref={trackRef}
      // The bar's height as top padding, so the panel's resting position is
      // already under it and `sticky` has nothing to correct on the first
      // paint. White, because white is what the band opens out of.
      className="keyhole-track relative bg-white pt-[var(--header-h)]"
      style={{ "--track-screens": TRACK_SCREENS } as React.CSSProperties}
    >
      <div
        ref={panelRef}
        className="sticky top-[var(--header-h)] isolate h-hero-panel w-full overflow-hidden bg-white"
      >
        {/* `next/image` with `fill` needs a positioned containing block, and
            this is also the thing that eases out of its crop — so the
            photograph settles as the mark opens on it, rather than sitting
            dead still behind a moving hole. */}
        <div ref={photoRef} className="absolute inset-0">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="100vw"
            placeholder="blur"
            className="object-cover"
          />
        </div>

        {/* Navy over the photograph, under the white — so it only ever shows
            through the mark, and the mark reads as the inked icon while the
            photograph behind it is still just a glimpse. */}
        <div
          ref={tintRef}
          aria-hidden="true"
          className="keyhole__tint absolute inset-0 bg-navy-900"
        />

        {/* The white ground with the mark cut out of it, and the cuffs laid
            back over their own cut-outs. One `transform` opens both.

            The cuffs were rose gold — the accent the icon set uses — until
            2026-09-12, and at this size that peach read as bare wrists rather
            than as sleeves. Navy-950 rather than black, which was the other
            candidate: rendered side by side at the same scroll position,
            black sat as a flat hole against a photograph that is all
            blue-grey dusk, where the navy belongs to both the picture and the
            palette. Nothing else on the site is pure black either — even the
            shadows are navy-tinted.

            The small handshake in `build-icons.tsx` keeps its rose gold: that
            one is a member of a set where every icon carries the same accent,
            and it is drawn at a size where the cuff is a detail rather than a
            sleeve. */}
        <svg
          aria-hidden="true"
          focusable="false"
          className="keyhole__veil absolute inset-0 h-full w-full"
        >
          <defs>
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="#fff" />
              <g ref={maskRef}>
                <path d={HANDSHAKE_HANDS} fillRule="evenodd" fill="#000" />
                <path d={HANDSHAKE_SLEEVES} fillRule="evenodd" fill="#000" />
              </g>
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            className="fill-white"
            mask={`url(#${maskId})`}
          />
          <g ref={cuffRef} className="keyhole__cuffs">
            <path
              d={HANDSHAKE_SLEEVES}
              fillRule="evenodd"
              className="fill-navy-950"
            />
          </g>
        </svg>

        {/* Shade for the copy to sit on, weighted to the side it sits on. */}
        <div
          ref={scrimRef}
          aria-hidden="true"
          className="keyhole__scrim absolute inset-0"
        />

        <div className="absolute inset-0 flex items-center">
          <div className="container-page">
            <div ref={copyRef} className="keyhole__copy max-w-xl">
              <Eyebrow onNavy>{eyebrow}</Eyebrow>
              <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08] text-white">
                {title}
              </h2>
              {/* ⚠️ `[&_p]:text-inherit` is not decoration — without it the
                  ink on this block never reaches the words. The paragraphs
                  come from the page as bare `<p>`, and `globals.css` sets
                  `p { color: var(--color-slate-body) }` on the base layer for
                  the whole site. A rule on the element beats a colour
                  inherited from its parent, so `text-white` here landed on
                  the `<div>` and stopped: the copy rendered at the page's
                  body slate — `rgb(77 95 122)`, a mid slate meant for white
                  paper — over a night photograph. That is why it read as
                  barely-there grey, and why changing this block's colour did
                  nothing at all until now. Inheriting is the fix rather than
                  a second `text-white`, so the paragraphs follow whatever ink
                  the block is given from here on.

                  This band is the only place on the site where the pattern
                  bites: everywhere else that sets a light ink over a
                  photograph either puts it on the `<p>` itself or wraps type
                  that is not a paragraph. */}
              <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-white [&_p]:text-inherit">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
