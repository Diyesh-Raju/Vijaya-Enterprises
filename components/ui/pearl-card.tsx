import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * A card that is a button — a heading, a line or two under it, and an arrow
 * in the lower right corner, the whole box being the link.
 *
 * Drawn in the "pearl" treatment: a dark chip lit from inside, with a bright
 * rim along its top edge, a soft bloom bleeding down from above it and a lip
 * of light along the bottom. The shape and the shadow recipe come from the
 * 21st.dev Pearl Button (@reuno-ui). What is different, and why:
 *
 *  - It is a `Link`, not a `<button>`. Both of these navigate, and a button
 *    that navigates is a button a reader cannot middle-click, cannot open in
 *    a new tab and cannot see the destination of.
 *  - The CSS is in `globals.css` rather than an inline `<style>` in the
 *    component. The original ships its stylesheet inside its own markup, so
 *    two of them on a page is the same 90 lines of CSS parsed twice, and a
 *    third render inserts it a third time.
 *  - No mask on the text. The original fades its label out towards the
 *    bottom, which is a handsome trick on a single word and unreadable on a
 *    sentence. There is a description here, so it goes.
 *  - No sparkle swapping on hover. The arrow is the affordance instead: it
 *    steps forward under a pointer, and a phone, which has none, still has
 *    the arrow to read.
 *
 * Used at every width: the home page's closing pair is this design on a
 * phone and a laptop alike. Nothing here is width-aware; it draws the same
 * at any size.
 */
export function PearlCard({
  href,
  title,
  description,
  className,
}: {
  href: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("pearl-card", className)}>
      {/* The inner box exists to clip the two gloss layers to the radius.
          They are drawn well outside the card — the bloom starts a full
          card-height above it — and without something to cut them off they
          would simply be a pale rectangle behind it. */}
      <span className="pearl-card__wrap">
        <span className="pearl-card__body">
          {/* An `h2`: each of these two offers is a section of the page
              with its own heading, as the full-height panels before them
              were, and turning them into cards should not quietly take
              both out of the document outline. */}
          <h2 className="pearl-card__title">{title}</h2>
          <p className="pearl-card__desc">{description}</p>
        </span>

        {/* The corner arrow. `aria-hidden`, because the link already reads
            as its heading and its description, and a third element
            announcing "link" after them is noise. */}
        <span className="pearl-card__arrow" aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false">
            <path
              d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    </Link>
  );
}
