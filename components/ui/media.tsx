import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { ImageReveal } from "./image-reveal";
import { cn } from "@/lib/cn";

const ratios = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  tall: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/10]",
  cinema: "aspect-[21/9]",
} as const;

export type Ratio = keyof typeof ratios;

/**
 * Rounded image frame with a slow zoom on hover.
 *
 * The zoom lives on the image while the frame keeps `overflow-hidden`, so the
 * corner radius is never clipped square during the transform — a detail that
 * Safari in particular gets wrong if the transform is on the parent.
 *
 * Every frame is also uncovered rather than faded in as it comes up the page
 * — see `ImageReveal`. A frame that is `priority` skips it: those are the
 * pictures that are already on screen when the page opens, and holding the
 * one the browser measures as the largest paint behind a panel for a second
 * would be paying for the effect with the load.
 *
 * The reveal and the hover use different properties on purpose — `transform`
 * for the settle, `scale` for the hover — so a photograph can be doing both
 * at once without either one clobbering the other.
 */
export function Frame({
  src,
  alt,
  ratio = "landscape",
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw",
  priority = false,
  rounded = "rounded-3xl",
  overlay,
  zoom = true,
  reveal,
  revealDelay,
  children,
}: {
  src: StaticImageData;
  alt: string;
  ratio?: Ratio;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: string;
  /** Navy scrim strength, for frames that carry text. */
  overlay?: "none" | "soft" | "strong";
  zoom?: boolean;
  /** Off for a picture that is already on screen when the page opens. */
  reveal?: boolean;
  /** Stagger in milliseconds, for a grid that uncovers one tile at a time. */
  revealDelay?: number;
  children?: ReactNode;
}) {
  const picture = (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      className={cn(
        "object-cover",
        // `transition-transform` covers `scale` too — in Tailwind v4 it is
        // `transition-property: transform, translate, scale, rotate`. That
        // matters here because the hover moves `scale` while the reveal
        // moves `transform`, and a frame can be doing both at once.
        zoom &&
          "transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
        imageClassName,
      )}
    />
  );

  return (
    <figure
      className={cn(
        "group relative isolate overflow-hidden bg-navy-100",
        rounded,
        ratios[ratio],
        className,
      )}
    >
      {reveal ?? !priority ? (
        <ImageReveal delay={revealDelay}>{picture}</ImageReveal>
      ) : (
        picture
      )}

      {overlay && overlay !== "none" && (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0",
            overlay === "soft"
              ? "bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent"
              : "bg-gradient-to-t from-navy-950/88 via-navy-950/45 to-navy-950/15",
          )}
        />
      )}

      {children}
    </figure>
  );
}

/** Small caption line used under portrait/detail images. */
export function Caption({ children }: { children: ReactNode }) {
  return (
    <figcaption className="mt-4 text-[0.8125rem] leading-relaxed text-slate-muted">
      {children}
    </figcaption>
  );
}
