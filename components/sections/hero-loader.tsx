"use client";

import Image from "next/image";
import { Logo } from "@/components/layout/logo";
import { img } from "@/lib/images";

/** There is one loader on the one page that has it, so its ids are fixed. */
const CAPTION_ID = "hero-loader-caption";
const METAL_ID = "hero-loader-metal";

/** The dial's radius in its own 120-unit box, and the length of its rim. */
const RADIUS = 52;
const RIM = 2 * Math.PI * RADIUS;

/**
 * The screen the home page opens on while the walkthrough's frames come in:
 * the film's first frame, frosted, and a glass card counting to a hundred.
 * Nothing behind it can be scrolled or clicked until it lifts.
 *
 * It is in the server's HTML and shown by CSS, off `data-hero-loading` on
 * `<html>` — written by the inline script in `app/layout.tsx` before the
 * first paint, so a laptop never sees the page for a moment and then has it
 * covered. Without that attribute (scripting off, a phone, any other page)
 * it is `display: none` and costs nothing. `ScrollHero` owns it from
 * hydration on: it says when it lifts, and holds the keyboard and touch
 * scrolling while it is up.
 *
 * What is drawn is chosen for what it costs while it spins:
 *
 *  - The frosted ground is a still blurred once at build time, not a
 *    `backdrop-filter` over the poster. A full-screen blur redrawn under an
 *    animation is the most expensive thing a weak GPU can be asked for, and
 *    this screen is shown to exactly the machines this whole pipeline exists
 *    for. Until that still has loaded, the ground is its own blur
 *    placeholder, which is inline in the HTML and looks much the same.
 *  - The spinning arc is an HTML box turning on the compositor, so it keeps
 *    moving while the page's main thread is busy with the frames.
 *  - Only the card itself is frosted live, and it is small.
 */
export function HeroLoader({
  percent,
  leaving,
  ground,
}: {
  percent: number;
  /** Set for the length of the fade out; the caller unmounts it after. */
  leaving: boolean;
  /** Whether to fetch the frosted still. Off until the width is known, so a phone never does. */
  ground: boolean;
}) {
  const blur = img.homeScrollStartSoft.blurDataURL;

  return (
    <div
      className="hero-loader"
      data-leaving={leaving ? "" : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={CAPTION_ID}
      aria-busy={!leaving}
      tabIndex={-1}
      style={blur ? { backgroundImage: `url(${blur})` } : undefined}
    >
      {ground && (
        <Image
          src={img.homeScrollStartSoft}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="hero-loader__ground"
        />
      )}
      <div aria-hidden="true" className="hero-loader__tint" />

      <div className="hero-loader__card">
        {/* The largest thing on the first paint, so fetched with the
            document. Same artwork and width as the language chooser's, so
            the two share one request. */}
        <Logo reversed priority width={560} className="hero-loader__logo" />

        <div
          className="hero-loader__dial"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-labelledby={CAPTION_ID}
        >
          <svg viewBox="0 0 120 120" aria-hidden="true" className="hero-loader__rings">
            <defs>
              <linearGradient id={METAL_ID} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#edc0b0" />
                <stop offset="55%" stopColor="#b76e79" />
                <stop offset="100%" stopColor="#d8bd85" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={RADIUS} className="hero-loader__track" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              className="hero-loader__fill"
              stroke={`url(#${METAL_ID})`}
              strokeDasharray={RIM}
              strokeDashoffset={RIM * (1 - percent / 100)}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <span aria-hidden="true" className="hero-loader__spinner" />
          {/* One figure, left alone by the translation walker: digits are
              the same in both languages, and a "%" on its own would only
              be reported as a missing string. */}
          <span aria-hidden="true" data-no-translate className="hero-loader__count">
            {percent}
            <span className="hero-loader__unit">%</span>
          </span>
        </div>

        <p id={CAPTION_ID} className="hero-loader__caption">
          Loading
        </p>
      </div>
    </div>
  );
}
