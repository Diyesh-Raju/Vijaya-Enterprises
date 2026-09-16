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
/**
 * `caption` is the line hung in the band's lower right corner, and it turns
 * over with the picture it belongs to. One or two short sentences each, and
 * each about the company rather than about the photograph: the band is the
 * first thing on the phone's home page and there is no other copy on it, so
 * these three lines are where a reader who has arrived from a search result
 * finds out who they are looking at. Written to be read in the two seconds a
 * frame holds — a third sentence does not get read, it gets scrolled past.
 */
/* What has come off this list, and when, because all of it is one line to
   put back and none of it is recoverable from the code:

   - Frames three and four were `courtyardHouse` and `vijayaSurya` until
     2026-09-14. The two that replaced them are also the first two projects
     on /joint-ventures, which is deliberate on the client's part rather
     than an accident to tidy up: they are the pictures they want a phone
     to open on.
   - `towersLawn` led the set until 2026-09-14, when the client asked for it
     out. Its caption went with it — "Building trust since 1973. Over fifty
     years of homes across Karnataka, still run by the family that started
     it." — and it was the only one of the four that said who the company
     is rather than what it builds. What carries that now is the lockup in
     the header, which reads "Since 1973" under the wordmark, and the `h1`
     below, which is read but not seen.

   All three photographs are still in `lib/images.ts` and used nowhere. */
const FRAMES = [
  {
    src: img.vijayAquaGreen,
    alt: alt.vijayAquaGreen,
    position: "20% 50%",
    caption:
      "Apartments planned around light, air and the way a family actually lives in a home.",
  },
  {
    src: img.projectTimberCorner,
    alt: alt.projectTimberCorner,
    // The band is near enough square on a phone and the source is 3:2, so
    // `object-cover` keeps the whole height and takes the crop off the
    // sides — which makes the horizontal figure the only one doing any
    // work here. 50% lands on the building's corner, which is what the
    // photograph is of.
    position: "50% 50%",
    caption:
      "Residential, commercial, industrial and institutional work, one standard of building across all four.",
  },
  {
    src: img.projectTudorCourt,
    alt: alt.projectTudorCourt,
    position: "50% 50%",
    caption:
      "Every project. Every customer. Like family. That is the whole of how we work.",
  },
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
   * The band runs up behind the bar rather than starting under it.
   *
   * It used to start under it: the header is frosted white from the first
   * pixel on this page (see `LIGHT_FROM_TOP` in `site-header.tsx`) and the
   * section reserved its height in top padding. That is still what the
   * walkthrough does at wider widths, and it is right there — a laptop
   * opens on white paper, and a transparent bar over white paper leaves
   * the lockup on nothing.
   *
   * A phone opens on a photograph, and the picture is better for reaching
   * the top of the screen. The bar goes transparent over it — the header's
   * ordinary state over a hero, now that the home page is off its
   * `LIGHT_FROM_TOP` list — and the band takes back the height the padding
   * was holding, so nothing below this section moves by a pixel. The
   * laptop's walkthrough reaches the top of the screen the same way, since
   * 2026-09-16.
   *
   * `desk:hidden` is the pre-hydration half of the split with `ScrollHero`.
   * After hydration the wide branch of this component unmounts outright, so
   * a laptop does not carry a second hero — or a second `h1` — in its DOM.
   */
  // Off a laptop entirely once the width is known — see the note above.
  if (width === "wide") return null;

  /* Which line the corner is showing. `rising` while the blinds are cutting
     one picture in, `settled` the rest of the time — the same expression the
     frames themselves are drawn from, read the other way round. */
  const active = frame.rising ?? frame.settled;

  return (
    <section className="reshero relative bg-white desk:hidden">
      {/* The page's heading. The walkthrough keeps its own inside the lockup
          it closes on; there is no lockup here and nothing is laid over the
          pictures, so this one is read rather than seen. */}
      <h1 className="sr-only">
        Vijaya Enterprises, building trust since 1973
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
            server sends had a laptop pulling down every photograph it
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

        {/* The bar's own ground.

            The four photographs are daylight: blue sky over the towers, a
            sunset over Aqua Green. A white lockup and a white "Menu" laid
            straight onto that do not read — measured bare, the worst
            line-sized patch under the type gives around 1.3:1. So the top
            of the band is darkened under the bar and lets go a little
            below it, which is the one place a scrim can go without
            touching the picture anybody is actually looking at.

            Sized by measurement, not by eye: see the note on
            `.reshero__bar-scrim` in `globals.css` for what it clears. The
            walkthrough lays the same scrim across the top of its panel.

            `z-3` puts it over both photograph layers — a settled frame is
            `z-1` and a rising one `z-2` — and it shares that level with
            the caption slot, which is at the other end of the band. */}
        <div aria-hidden="true" className="reshero__bar-scrim" />

        {/* The caption, hung in the lower right corner.

            One element, not four: it carries whichever line belongs to the
            picture currently arriving, and `key` is that index — so React
            tears the old line down and builds the new one, which is what
            replays the fade rather than cross-dissolving two strings on top
            of each other. It follows `rising` the moment the blinds start,
            so the words change with the picture instead of a beat after it.

            `aria-hidden`, and deliberately. The lines are about the company,
            not about the photograph, and a reader who cannot see the band
            gets no use out of a caption that turns over every two seconds
            while they are still on the first word of it. The `h1` above
            names the company once, which is the version that reads. */}
        {width === "phone" && (
          <div className="reshero__caption-slot" aria-hidden="true">
            <p key={active} className="reshero__caption">
              {FRAMES[active].caption}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
