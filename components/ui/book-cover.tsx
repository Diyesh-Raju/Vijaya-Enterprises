import Image, { type StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * A printed brochure, closed, lying at an angle with a second copy under it.
 *
 * Two layers of the same cover rather than one: a single tilted rectangle
 * reads as a photograph that has been rotated, and the copy showing behind
 * it is what makes the eye read the thing as an object with thickness. The
 * page block down the right-hand edge is drawn in `box-shadow` — three
 * hairlines of paper outside the box — because the layer clips its own
 * artwork and anything inside it would sit on top of the cover design.
 *
 * The cover art is the brochure's real front page, which already carries the
 * project's name and mark, so nothing is captioned over it. The name is set
 * under the book instead, where it can be read.
 *
 * Size and angle come from the caller: `--book-w` is the width the cover is
 * drawn at and the rest is proportional to it, so one book can be a shelf
 * item at 12rem and a hero at 22rem without a second set of rules. The
 * aspect ratio is the file's own — these two brochures are square, and a
 * portrait one would come through as portrait without an edit here.
 */
export function BookCover({
  cover,
  alt,
  className,
  style,
}: {
  cover: StaticImageData;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn("book", className)}
      style={{ aspectRatio: `${cover.width} / ${cover.height}`, ...style }}
    >
      <span className="book__leaf book__leaf--under" aria-hidden="true">
        <Image src={cover} alt="" fill sizes="320px" className="book__art" />
      </span>
      <span className="book__leaf book__leaf--over">
        <Image
          src={cover}
          alt={alt}
          fill
          sizes="320px"
          placeholder="blur"
          className="book__art"
        />
        <span className="book__sheen" aria-hidden="true" />
      </span>
    </span>
  );
}
