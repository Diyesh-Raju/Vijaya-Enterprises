import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { BookCover } from "@/components/ui/book-cover";
import { ArrowRightIcon } from "@/components/ui/line-icons";
import { brochures } from "@/lib/brochures";

/**
 * The two printed brochures, standing where the vision and mission cards
 * used to, on the navy band of the legacy page.
 *
 * They are deliberately small. The reference this was drawn from gives one
 * book half a screen and a paragraph beside it; here two of them share the
 * width the two cards had, under a heading that is still the section's own.
 * A book at 19rem is an object on a shelf — big enough to read the cover
 * and the mark on it, small enough that the pair still reads as one row
 * under the heading rather than as two panels of their own.
 *
 * Each is a link and nothing else is: the whole thing — cover, name, cue —
 * is one target, so there is no second, smaller place to aim at. The tilt
 * straightens and the book lifts on hover, which is the only thing that
 * moves. See `.book` in `globals.css`.
 */
export function BrochureShelf() {
  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-12 sm:mt-12 sm:grid-cols-2 sm:gap-10">
      {brochures.map((brochure, index) => (
        <Reveal key={brochure.slug} delay={index * 110} className="flex justify-center">
          <Link href={`/brochures/${brochure.slug}`} className="book-link">
            <BookCover
              cover={brochure.pages[0]}
              alt={`The cover of the ${brochure.title} brochure`}
            />

            <span className="book-link__label">
              <span className="book-link__volume">{brochure.volume}</span>
              <span className="book-link__title">{brochure.title}</span>
              <span className="book-link__place">{brochure.place}</span>
            </span>

            <span className="book-link__cue">
              <span className="book-link__disc" aria-hidden="true">
                <ArrowRightIcon className="h-[1.05rem] w-[1.05rem]" />
              </span>
              Open the book
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
