import Image from "next/image";
import { Container, SectionHeading } from "@/components/ui/section";
import { img } from "@/lib/images";
import { reviews, type Review } from "@/lib/reviews";
import { cn } from "@/lib/cn";

function ReviewCard({ review }: { review: Review }) {
  return (
    <li
      className={cn(
        // Same box as before — width, padding and radius are untouched. Only
        // what it is made of has changed: a pane of glass over the room
        // rather than a card laid on top of it.
        "flex w-[18.5rem] shrink-0 flex-col rounded-[1.5rem] p-7 sm:w-[22rem] sm:rounded-[1.75rem] sm:p-8",
        // Two layers, and both are load-bearing. The white frost is the
        // reference's look; the navy under it is what makes the type legible,
        // because this photograph has bright windows in it and a purely light
        // frost over those left the quote at 3.9:1 — under the 4.5:1 body text
        // needs. Together they measure 5.1:1 at the worst card on the strip
        // while the room still reads clearly through the glass.
        "border border-white/25 backdrop-blur-md",
        "bg-navy-950/22 bg-[linear-gradient(rgba(255,255,255,0.08),rgba(255,255,255,0.08))]",
        // The lit top edge is what sells glass. Without it a translucent
        // rectangle reads as a hole in the image rather than a surface over it.
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22)]",
      )}
    >
      <div className="flex items-center gap-3.5">
        {/* Initial rather than a photo: Google's avatars are not ours to host. */}
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/15 font-display text-[1.125rem] text-white"
        >
          {review.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[0.9375rem] font-semibold text-white">
            {review.name}
          </span>
          <span className="mt-1 text-[0.75rem] text-white/65">
            {review.when}
          </span>
        </span>
      </div>

      {review.rating && (
        <span
          className="mt-4 flex gap-1 text-brass-400"
          aria-label={`${review.rating} out of 5`}
        >
          {Array.from({ length: review.rating }, (_, star) => (
            <svg
              key={star}
              viewBox="0 0 20 20"
              aria-hidden="true"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9z" />
            </svg>
          ))}
        </span>
      )}

      <p className="mt-5 text-[0.9375rem] leading-relaxed text-white/85">
        {review.quote}
      </p>
    </li>
  );
}

/** Defined at module scope so React does not remount the track every render. */
function Track({
  ariaHidden,
  className,
}: {
  ariaHidden: boolean;
  className?: string;
}) {
  return (
    <ul
      // `items-stretch` keeps every card the height of the tallest, so the row
      // reads as one band rather than a ragged edge.
      className={cn(
        "flex shrink-0 items-stretch gap-5 pr-5 sm:gap-6 sm:pr-6",
        className,
      )}
      aria-hidden={ariaHidden || undefined}
    >
      {reviews.map((review) => (
        <ReviewCard key={review.name} review={review} />
      ))}
    </ul>
  );
}

/**
 * Google reviews as a right-to-left ticker.
 *
 * Same seamless trick as the text `Marquee`: two identical tracks translated
 * by -50%, with the copy hidden from assistive tech so nothing is read twice.
 *
 * The pause is keyed to `has-[li:hover]` rather than hovering the strip, so it
 * only stops while the pointer is actually on a card — moving through the space
 * around them leaves it running.
 *
 * With reduced motion the animation is off, the duplicate track is dropped, and
 * the strip becomes a normal horizontal scroller — otherwise `overflow-hidden`
 * would leave those readers unable to reach the later reviews.
 */
export function Reviews() {
  return (
    // A shallower top than a full section: the heading was sitting a long way
    // below the strip above it. The bottom is pulled in too — the band is one
    // heading and one row of cards, and it does not need a full screen.
    <section className="relative isolate overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
      <Image
        src={img.backdropInterior}
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* A navy scrim rather than a white one: it keeps the room clearly
          visible while giving the light type enough to sit on — which now
          includes the type inside the cards, since they are glass and the
          room reads straight through them. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/70 via-navy-950/55 to-navy-950/70"
      />
      <Container>
        <SectionHeading
          onNavy
          eyebrow="Reviewed on Google"
          title="In their words."
          lead="Reviews families and clients have left on our Google listing."
        />
      </Container>

      {/* Outside the container so the cards run to both edges of the screen. */}
      <div className="fade-edges relative mt-10 overflow-hidden lg:mt-12 motion-reduce:overflow-x-auto">
        <div className="flex w-max animate-marquee has-[li:hover]:[animation-play-state:paused] motion-reduce:animate-none">
          {/* Both tracks must stay identical: the -50% translate only lands
              seamlessly if the copy is exactly as wide as the original. */}
          <Track ariaHidden={false} />
          <Track ariaHidden className="motion-reduce:hidden" />
        </div>
      </div>
    </section>
  );
}
