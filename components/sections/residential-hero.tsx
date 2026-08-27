"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { img, alt } from "@/lib/images";

/**
 * The Residential hero: one full-bleed photograph at a time, cut to the next
 * in horizontal blinds — the arriving picture is sliced into bands, each band
 * opens outward from its own centre line, and the bands go one after the next
 * down the frame until the photograph is whole.
 *
 * The transition is the one from the `Scroll-Transition-main` template
 * (`index.html`, Horizontal Blinds), on this hero's own clock rather than on
 * scroll. The template drives its bands from a GSAP timeline scrubbed by
 * ScrollTrigger; here the same shape is a CSS animation per band with a
 * staggered `animation-delay`, started by the interval below. That keeps the
 * two runtime dependencies the template needs — GSAP and Lenis — off the
 * page, and it is why nothing here reads the scroll position.
 *
 * See `.reshero` in `globals.css` for how a band composes its slice of the
 * picture and why the clip, rather than the height, is what moves.
 */

/**
 * The cycle, in order. The first frame is what the page opens on.
 *
 * `position` is where the crop hangs on to. All three photographs are
 * landscape and all three put the family off to one side, so a phone —
 * cropping a 3:2 frame down to something like 3:6.5 — keeps barely a third
 * of the width. Left at the default centre it throws the family away
 * entirely on the evening frame and cuts it in half on the other two, and
 * the hero becomes a wall of balconies. These anchors are picked per
 * picture so the family survives the portrait crop. They do nothing at
 * ordinary desktop widths, where the frame is wider than the source and it
 * is the top and bottom that get trimmed instead.
 */
const FRAMES = [
  { src: img.balconyFamily, alt: alt.balconyFamily, position: "22% 50%" },
  { src: img.balconyFamilyTower, alt: alt.balconyFamilyTower, position: "72% 50%" },
  { src: img.balconyFamilyEvening, alt: alt.balconyFamilyEvening, position: "83% 50%" },
];

/**
 * How long each picture holds before the next one starts arriving, and how
 * long the bands take to finish it. The gap between them is the still moment,
 * so the sweep has to stay comfortably under the interval — at 2600/1500 a
 * frame sits untouched for a full second after the last band lands.
 *
 * These two are what set the pace of the wave down the picture, since the
 * hand-off below is a fraction of the sweep. The interval has to move with
 * the sweep rather than stay where it was: hold it at 1800 against a 1500ms
 * sweep and the still moment collapses to a blink, leaving a hero that is
 * never once at rest.
 */
const INTERVAL_MS = 2600;
const WIPE_MS = 1500;

/**
 * How many bands the arriving picture is cut into, and how much of the sweep
 * goes on handing off from one band to the next rather than on a band's own
 * opening.
 *
 * `HANDOFF` is the knob for how fast the wave travels from the top of the
 * picture to the bottom: it is the share of the sweep between the first band
 * starting and the last one starting, so raising it slows the travel and
 * quickens each band, and lowering it does the reverse. Past about 0.75 the
 * bands snap rather than open and the set reads as a shutter closing; below
 * about 0.4 they move nearly as one and the wave stops reading at all.
 *
 * Both derived values are spent in `globals.css`, and together they fill
 * exactly `WIPE_MS` — the last band lands on the same tick that promotes the
 * frame, so the picture is whole at the instant it is called settled.
 */
const BLINDS = 30;
const HANDOFF = 0.65;

const BLIND_OPEN_MS = Math.round(WIPE_MS * (1 - HANDOFF));
const BLIND_STEP_MS = (WIPE_MS - BLIND_OPEN_MS) / (BLINDS - 1);

export function ResidentialHero() {
  /** `rising` is the frame the line is currently drawing in, if any. */
  const [frame, setFrame] = useState<{ settled: number; rising: number | null }>({
    settled: 0,
    rising: null,
  });

  useEffect(() => {
    if (FRAMES.length < 2) return;
    // Nothing should move on its own for someone who has asked it not to.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let settle: number | undefined;

    const cycle = window.setInterval(() => {
      setFrame((current) => ({
        ...current,
        rising: (current.settled + 1) % FRAMES.length,
      }));

      // Promote on the same clock that drives the animation rather than on
      // `animationend`: a backgrounded tab stops firing the event but not the
      // timers, and the two would drift apart. The swap is invisible either
      // way — the rising frame is already covering the whole stage by then.
      settle = window.setTimeout(() => {
        setFrame((current) =>
          current.rising === null
            ? current
            : { settled: current.rising, rising: null },
        );
      }, WIPE_MS);
    }, INTERVAL_MS);

    return () => {
      window.clearInterval(cycle);
      window.clearTimeout(settle);
    };
  }, []);

  /*
   * Square-cornered, unlike the other heroes on the site. Those round off
   * at the base so the page appears to slide underneath them; this one is
   * a full-bleed photograph edge to edge, and rounding would cut the
   * corners off the picture itself.
   *
   * `overflow-hidden` stays regardless: a band is laid out at the full
   * height of the stage and pulled up into place, so every band but the
   * first hangs over the edge until its own window cuts it back.
   *
   * PINNED. `sticky top-0` holds the hero against the top of the window
   * while the page below rises over it — the photograph never moves, the
   * rest of the page arrives on top of it. The rest of the arrangement
   * lives in `app/residential/page.tsx`: everything after the hero is
   * wrapped in one element, that element is given a higher `z-index`, and
   * it is given an opaque background. Without the background you would read
   * the hero straight through it. That file also holds this section and
   * that sheet inside one static wrapper — which is what keeps a
   * navigation to /residential landing at the top of the page, for the
   * reason written out there.
   *
   * The height has to be exact rather than a minimum. A sticky element
   * taller than the window pins its top and hangs the rest below the fold,
   * where nobody can reach it.
   */
  return (
    <section className="reshero sticky top-0 z-0 isolate h-svh overflow-hidden bg-[#0b0c0f]">
      {FRAMES.map((photo, index) => {
        const isSettled = index === frame.settled;
        const isRising = index === frame.rising;

        return (
          <div
            key={photo.src.src}
            // One hero, described once. The frames after the first are the
            // same subject in a different light, and a rotating description
            // — or one that churns every 1.8s as the cycle turns over —
            // would be worse for a screen reader than a single stable one.
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
                priority={index === 0}
                loading={index === 0 ? undefined : "eager"}
                style={{ objectPosition: photo.position }}
                className="object-cover"
              />
            </div>

            {/* The bands, mounted only for the sweep that needs them. They
                are the same picture over again — same `src`, same `sizes`,
                same crop — so they cost one download and one decode between
                them, and the copy underneath has already made both by the
                time a frame rises. */}
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

      {/* Shade, not colour. The other heroes on the site grade in navy, but
          over these three photographs — a pink dusk, a pale sky, a warm
          sunset — navy reads as a blue cast laid over the picture rather
          than as shadow. So this one grades in neutral black, and only
          where type actually sits: enough at the very top for the header's
          white to hold, almost nothing across the middle where the
          photograph should simply be the photograph, and the weight down at
          the bottom under the heading. Above the pictures, so the wipe runs
          underneath it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.34)_9%,rgba(0,0,0,0.05)_27%,rgba(0,0,0,0.10)_57%,rgba(0,0,0,0.72)_100%)]"
      />
      {/* Weighted into the corner the copy lands in, so the heading is not
          asked to hold its own against a sky. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[radial-gradient(64%_54%_at_13%_86%,rgba(0,0,0,0.58),transparent_70%)]"
      />

      <div className="container-page relative z-20 flex h-full flex-col justify-end pb-16 pt-40 sm:pb-20 sm:pt-44">
        <div className="max-w-4xl">
          <p
            className="eyebrow-rule animate-rise text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400"
            style={{ animationDelay: "100ms" }}
          >
            Residential Development
          </p>

          <h1
            className="text-balance-head animate-rise mt-7 text-[clamp(2.375rem,6.4vw,5rem)] leading-[1.02] text-white"
            style={{ animationDelay: "220ms" }}
          >
            Residential
          </h1>

          <p
            className="animate-rise mt-7 max-w-2xl text-[1.0625rem] leading-[1.75] text-navy-100/85 sm:text-[1.125rem]"
            style={{ animationDelay: "340ms" }}
          >
            Thoughtfully planned homes backed by more than 50 years of
            construction experience.
          </p>

          <div className="animate-rise mt-10" style={{ animationDelay: "460ms" }}>
            <Button href="#residential-projects" variant="light" size="lg" withArrow>
              Explore Our Residential Work
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
