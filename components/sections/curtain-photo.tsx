"use client";

import Image, { type StaticImageData } from "next/image";
import { useSyncExternalStore } from "react";

/**
 * The photograph at the head of `PlannedForLiving` — which is not the same
 * photograph on a phone as it is on a laptop.
 *
 * A laptop gets the Hara Vijaya concept view, which is what has always been
 * there. A phone gets Vijay Aqua Green: the concept render is a night shot
 * of two towers, and cropped to the near-square band a phone gives this
 * section it reduces to a wall of lit balconies with no development around
 * it. Aqua Green is low, wide and daylit, and it survives that crop with
 * the entrance, the name and the planting all still in frame.
 *
 * This is a client component for one reason, and it is the reason
 * `home-hero-phone.tsx` is one too: **a hidden `<img>` is still downloaded**.
 * `display: none` — from `desk:hidden`, or from a parent that is hidden —
 * does not stop the fetch, and neither does `loading="lazy"`; Chrome loads a
 * lazy image with no layout box rather than deferring it forever. So the
 * two-`<Image>`-and-let-CSS-choose version of this would have had every
 * device pull down both photographs. Only one `<Image>` is ever rendered
 * here, and not until the width is actually known.
 *
 * What fills the frame in the meantime is each photograph's own blur
 * placeholder, as a CSS background rather than an image. Next generates
 * those at build time and inlines them as base64, so they cost no request —
 * which is what lets them be CSS-gated in the server's markup, painting the
 * right blur on the first frame, and lets the pair of them sit in every
 * device's DOM without either one costing a download.
 */

/**
 * Where the laptop photograph takes over. Laptop-shaped rather than merely
 * wide, since a phone on its side is past the 768 that `md:` asks for.
 * Identical to the `desk:` variant in `globals.css`, and to `WIDE_QUERY` in
 * the two hero components.
 */
const WIDE_QUERY = "(min-width: 48rem) and (min-height: 500px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getWidth = () =>
  window.matchMedia(WIDE_QUERY).matches ? ("wide" as const) : ("phone" as const);

type Photo = {
  src: StaticImageData;
  alt: string;
  /**
   * `object-position`. Picked per photograph for the crop it has to survive,
   * which is not the same crop on each branch: the laptop frame is wider
   * than the source and trims top and bottom, the phone frame is close to
   * square and takes its bite out of the width.
   */
  position: string;
};

export function CurtainPhoto({ wide, phone }: { wide: Photo; phone: Photo }) {
  // `"ssr"` until mounted. Neither photograph is requested in that state —
  // see the note above on why choosing in CSS would not have been enough.
  const width = useSyncExternalStore(
    subscribeToWidth,
    getWidth,
    () => "ssr" as const,
  );

  const photo = width === "wide" ? wide : phone;

  return (
    <>
      {[
        { photo: phone, visibility: "desk:hidden" },
        { photo: wide, visibility: "hidden desk:block" },
      ].map(({ photo: blur, visibility }) => (
        <div
          key={blur.src.src}
          aria-hidden="true"
          className={`absolute inset-0 bg-cover ${visibility}`}
          style={{
            backgroundImage: `url(${blur.src.blurDataURL})`,
            backgroundPosition: blur.position,
          }}
        />
      ))}

      {width !== "ssr" && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          quality={85}
          placeholder="blur"
          style={{ objectPosition: photo.position }}
          className="object-cover"
        />
      )}
    </>
  );
}
