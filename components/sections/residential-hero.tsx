"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { img, alt } from "@/lib/images";

/**
 * The Residential hero: one full-bleed photograph at a time, cut to the next
 * by a black line that rises out of the bottom-right corner, sweeps up the
 * diagonal and leaves at the top-left with the new picture behind it.
 *
 * The line is not an element. The incoming photograph is clipped to the
 * half-plane behind the sweep — a five-point polygon animated in
 * `globals.css` — and its parent carries a hard `drop-shadow` offset up and
 * to the left, so the shadow's leading edge runs a few pixels ahead of the
 * picture's. That is the line. It costs one filter and no extra layout, it
 * lands exactly on the corners at both ends whatever the hero's shape, and
 * there is nothing to keep in sync with the wipe because it *is* the wipe.
 *
 * See `.reshero` in `globals.css` for the geometry and why the polygon needs
 * a keyframe at the halfway mark.
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
 * long the line takes to cross. The gap between them is the still moment, so
 * the wipe has to stay comfortably under the interval — at 1800/950 a frame
 * sits untouched for the better part of a second.
 */
const INTERVAL_MS = 1800;
const WIPE_MS = 950;

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
   * `overflow-hidden` stays regardless: the line is drawn by a drop-shadow
   * that spills past the stage at both ends of the sweep, and something
   * has to clip it.
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
                ? ({ "--reshero-wipe": `${WIPE_MS}ms` } as CSSProperties)
                : undefined
            }
          >
            <div className="reshero__clip">
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
