"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/cn";
import { img, alt } from "@/lib/images";

/**
 * The home page hero, on a phone: a short band of photographs under the
 * header, cutting one to the next in horizontal blinds, with the section
 * below it already on screen.
 *
 * There is no video here. `ScrollHero` — the scroll-scrubbed walkthrough
 * that opens the page on a laptop — is a six-screen track whose whole
 * premise is that the reader has a scroll wheel and the bandwidth for a
 * film; on a phone it is neither. That component now hides itself below
 * 768px and unmounts once it knows the width, and this one takes the space
 * instead. The two are mutually exclusive at every width: exactly one is on
 * the page after hydration, and until then CSS keeps the other one out of
 * sight rather than letting either flash.
 *
 * The transition is the Residential hero's, on a faster clock: the arriving
 * picture is sliced into bands, each band opens outward from its own centre
 * line, and the bands go one after the next down the strip. Same classes,
 * same keyframes — see `.reshero` in `globals.css`, which is where the
 * mechanism and its two timing properties are written out.
 */

/**
 * The cycle, in order. The first frame is what the page opens on.
 *
 * One per thing the company builds: the finished apartment towers, a
 * development still on the boards, a private residence, a commercial block.
 *
 * `position` is where the crop hangs on to, and it is worth knowing which
 * way the crop cuts before touching one. Held upright the band is very
 * nearly square — around 0.95:1 — and every photograph here is landscape,
 * so the bite comes out of the *width*. Turned on its side it is the other
 * way round and severely so, nearer 3:1, and the bite comes out of the
 * height. Each anchor below has to survive both.
 *
 * Aqua Green is the one that needed choosing rather than centring. Squared
 * off, a centred crop throws away the left-hand block — which is the block
 * carrying the development's name — and leaves an anonymous row of
 * balconies. Pulled to 20% the name is comfortably in frame, the entrance
 * canopy still lands near the middle, and the run of the building sweeps
 * away to the right under the sunset.
 *
 * Vijaya Surya's anchor is the one that looks wrong and is not. The
 * photograph is all but square itself, so upright it loses nothing off the
 * top and the 18% does nothing at all; it is there for the sideways case,
 * where the band is three times as wide as it is tall and a centred crop
 * would take the name clean off the parapet.
 */
const FRAMES = [
  { src: img.towersLawn, alt: alt.towersLawn, position: "50% 50%" },
  { src: img.vijayAquaGreen, alt: alt.vijayAquaGreen, position: "20% 50%" },
  { src: img.courtyardHouse, alt: alt.courtyardHouse, position: "50% 50%" },
  { src: img.vijayaSurya, alt: alt.vijayaSurya, position: "50% 18%" },
];

/**
 * How long each picture holds before the next one starts arriving, and how
 * long the bands take to finish it.
 *
 * 2s is the interval that was asked for. The sweep moves with it rather
 * than staying where it was — the two are a ratio, not two independent
 * numbers, and pinning the sweep while the interval grows would leave the
 * band sitting still in a way that reads as a stall rather than a rest. At
 * 1150ms the last blind lands 850ms before the next picture starts, which
 * is the share of the cycle the Residential hero holds still for.
 */
const INTERVAL_MS = 2000;
const WIPE_MS = 1150;

/**
 * How many bands the arriving picture is cut into, and how much of the
 * sweep goes on handing off from one band to the next rather than on a
 * band's own opening. `HANDOFF` is the knob for how fast the wave travels
 * down the picture; both derived values are spent in `globals.css` and
 * together they fill exactly `WIPE_MS`.
 *
 * Eighteen rather than the Residential hero's thirty. That hero is a whole
 * screen tall and a band of it is around 27px; this strip is around 410px,
 * and thirty bands across it would be 14px each — fine enough that the wave
 * starts reading as noise rather than as blinds. Eighteen puts a band at
 * roughly 23px, which is within a few pixels of what the Residential hero
 * shows.
 */
const BLINDS = 18;
const HANDOFF = 0.65;

const BLIND_OPEN_MS = Math.round(WIPE_MS * (1 - HANDOFF));
const BLIND_STEP_MS = (WIPE_MS - BLIND_OPEN_MS) / (BLINDS - 1);

/**
 * Where `ScrollHero` takes over — a laptop-shaped window rather than a
 * merely wide one, since a phone on its side is wider than the 768 that
 * `md:` asks for. Kept identical to the query in `ScrollHero` and to the
 * `desk:` variant in `globals.css`.
 */
const WIDE_QUERY = "(min-width: 48rem) and (min-height: 500px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getWidth = () =>
  window.matchMedia(WIDE_QUERY).matches ? ("wide" as const) : ("phone" as const);

export function HomeHeroPhone() {
  /** `rising` is the frame the blinds are currently drawing in, if any. */
  const [frame, setFrame] = useState<{ settled: number; rising: number | null }>({
    settled: 0,
    rising: null,
  });

  // `"ssr"` until mounted, so the markup the server sends is the phone's and
  // a phone paints the band on the first frame rather than after hydration.
  const width = useSyncExternalStore(
    subscribeToWidth,
    getWidth,
    () => "ssr" as const,
  );

  useEffect(() => {
    if (FRAMES.length < 2) return;

    const wide = window.matchMedia(WIDE_QUERY);
    // Nothing should move on its own for someone who has asked it not to.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let cycle: number | undefined;
    let settle: number | undefined;

    const stop = () => {
      window.clearInterval(cycle);
      window.clearTimeout(settle);
      cycle = undefined;
      settle = undefined;
      // Leave whatever was arriving fully arrived rather than half cut in.
      setFrame((current) =>
        current.rising === null
          ? current
          : { settled: current.rising, rising: null },
      );
    };

    const start = () => {
      if (cycle) return;
      cycle = window.setInterval(() => {
        setFrame((current) => ({
          ...current,
          rising: (current.settled + 1) % FRAMES.length,
        }));

        // Promote on the same clock that drives the animation rather than on
        // `animationend`: a backgrounded tab stops firing the event but not
        // the timers, and the two would drift apart. The swap is invisible
        // either way — the rising frame covers the whole band by then.
        settle = window.setTimeout(() => {
          setFrame((current) =>
            current.rising === null
              ? current
              : { settled: current.rising, rising: null },
          );
        }, WIPE_MS);
      }, INTERVAL_MS);
    };

    // Re-run on every change rather than once on mount, so rotating a tablet
    // across the breakpoint — or turning reduced motion on from Settings
    // while the page is open — is honoured immediately.
    const sync = () => {
      if (wide.matches || still.matches) stop();
      else start();
    };

    sync();
    wide.addEventListener("change", sync);
    still.addEventListener("change", sync);

    return () => {
      stop();
      wide.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  /*
   * The white strip above the band is the header's own: the bar is frosted
   * white from the first pixel on this page (see `LIGHT_FROM_TOP` in
   * `site-header.tsx`), so the hero starts below it rather than running
   * behind it — which is exactly what the walkthrough does at wider
   * widths, and why the padding is the same variable.
   *
   * `desk:hidden` is the pre-hydration half of the split with `ScrollHero`.
   * After hydration the wide branch of this component unmounts outright, so
   * a laptop does not carry a second hero — or a second `h1` — in its DOM.
   */
  // Off a laptop entirely once the width is known — see the note above.
  if (width === "wide") return null;

  return (
    <section className="reshero relative bg-white pt-[var(--header-h)] desk:hidden">
      {/* The page's heading. The walkthrough keeps its own inside the lockup
          it closes on; there is no lockup here and nothing is laid over the
          pictures, so this one is read rather than seen. */}
      <h1 className="sr-only">
        Vijaya Enterprises — building trust since 1973
      </h1>

      {/* The opening frame's own blur placeholder, as a background rather
          than an image: it is a base64 string a few hundred bytes long that
          Next generated at build time from the photograph itself, so it
          costs no request and is on screen in the first paint. It is what
          fills the band for the tick between paint and hydration, when the
          pictures below have deliberately not been rendered yet — without
          it that tick is a black bar. */}
      <div
        className="relative isolate h-hero-phone w-full overflow-hidden bg-[#0b0c0f] bg-cover"
        style={{
          backgroundImage: `url(${FRAMES[0].src.blurDataURL})`,
          backgroundPosition: FRAMES[0].position,
        }}
      >
        {/* Not until the width is settled.

            Every frame here is `loading="lazy"`, and the obvious reading is
            that a laptop — where this whole section is `display: none` and
            then unmounted — would therefore never fetch one. It is wrong:
            Chrome loads a lazy image that has no layout box at all rather
            than deferring it forever, so rendering these in the markup the
            server sends had a laptop pulling down all four photographs it
            was never going to show. Holding them back until `width` says
            `phone` is what keeps the desktop page exactly as it was. */}
        {width === "phone" &&
          FRAMES.map((photo, index) => {
          const isSettled = index === frame.settled;
          const isRising = index === frame.rising;

          return (
            <div
              key={photo.src.src}
              // One hero, described once. A description that churned every
              // 1.5s as the cycle turned over would be worse for a screen
              // reader than a single stable one.
              aria-hidden={index === 0 ? undefined : "true"}
              className={cn(
                "reshero__frame",
                isSettled && "is--settled",
                isRising && "is--rising",
              )}
              style={
                isRising
                  ? ({
                      "--reshero-blinds": BLINDS,
                      "--reshero-blind-open": `${BLIND_OPEN_MS}ms`,
                      "--reshero-blind-step": `${BLIND_STEP_MS}ms`,
                    } as CSSProperties)
                  : undefined
              }
            >
              <div className="reshero__photo">
                <Image
                  src={photo.src}
                  alt={index === 0 ? photo.alt : ""}
                  fill
                  quality={85}
                  sizes="100vw"
                  placeholder="blur"
                  // Lazy, all four, and deliberately so — including the one
                  // the page opens on. On a phone the band is at the top of
                  // the document, so the browser fetches every frame in it
                  // during the first layout and lazy costs nothing; on a
                  // laptop the section is `display: none` before hydration
                  // and gone after it, and a lazy image in a box that never
                  // existed is never fetched. `priority` or `eager` would
                  // pull all four down on a machine that will not show one.
                  loading="lazy"
                  style={{ objectPosition: photo.position }}
                  className="object-cover"
                />
              </div>

              {/* The bands, mounted only for the sweep that needs them. They
                  are the same picture over again — same `src`, same `sizes`,
                  same crop — so they cost one download and one decode
                  between them, and the copy underneath has already made both
                  by the time a frame rises. */}
              {isRising && (
                <div className="reshero__blinds" aria-hidden="true">
                  {Array.from({ length: BLINDS }, (_, band) => (
                    <div
                      key={band}
                      className="reshero__blind"
                      style={{ "--i": band } as CSSProperties}
                    >
                      <div className="reshero__blind-photo">
                        <Image
                          src={photo.src}
                          alt=""
                          fill
                          quality={85}
                          sizes="100vw"
                          loading="eager"
                          style={{ objectPosition: photo.position }}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
          })}
      </div>
    </section>
  );
}
