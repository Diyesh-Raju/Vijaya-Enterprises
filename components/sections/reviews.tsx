import Image from "next/image";
import { Container, SectionHeading } from "@/components/ui/section";
import { img } from "@/lib/images";
import { reviews, type Review } from "@/lib/reviews";
import { cn } from "@/lib/cn";

function ReviewCard({ review }: { review: Review }) {
  return (
    <li className="flex w-[18.5rem] shrink-0 flex-col rounded-[1.5rem] border border-rosegold-200 bg-white p-7 sm:w-[22rem] sm:rounded-[1.75rem] sm:p-8">
      <div className="flex items-center gap-3.5">
        {/* Initial rather than a photo: Google's avatars are not ours to host. */}
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rosegold-200 font-display text-[1.125rem] text-navy-900"
        >
          {review.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[0.9375rem] font-semibold text-navy-900">
            {review.name}
          </span>
          <span className="mt-1 text-[0.75rem] text-navy-800/55">
            {review.when}
          </span>
        </span>
      </div>

      {review.rating && (
        <span
          className="mt-4 flex gap-1 text-brass-500"
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

      <p className="mt-5 text-[0.9375rem] leading-relaxed text-navy-900">
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
    // below the strip above it.
    <section className="relative isolate overflow-hidden pb-24 pt-14 sm:pb-32 sm:pt-16 lg:pb-40 lg:pt-20">
      <Image
        src={img.backdropInterior}
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* A navy scrim rather than a white one: it keeps the room clearly
          visible while giving the light type above enough to sit on, and the
          white cards read as lit against it. */}
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
      <div className="fade-edges relative mt-14 overflow-hidden lg:mt-16 motion-reduce:overflow-x-auto">
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
