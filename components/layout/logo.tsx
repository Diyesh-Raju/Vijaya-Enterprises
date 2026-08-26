import Image from "next/image";
import logoFull from "@/assets/brand/vijaya-logo.png";
import logoReversed from "@/assets/brand/vijaya-logo-reversed.png";

/**
 * The Vijaya Enterprises lockup: Ganesha mark, wordmark, and the 1973 date.
 *
 * Two artworks ship rather than one because the artwork is drawn for white
 * paper and half the placements on this site are navy — `reversed` swaps in
 * the version whose wordmark is white and whose Ganesha mark has been relit to
 * hold its light blue against navy (see `assets/brand/README.md`). Both are
 * rendered and cross-faded, so the header can move between its transparent and
 * frosted states in step with the rest of the bar rather than hard-cutting the
 * artwork mid-transition.
 *
 * Height comes from the caller (`className="h-16 sm:h-20"`); the width follows
 * the artwork's aspect ratio. The lockup is decorative here: every placement
 * sits inside a link that already carries the company name as its label.
 */
export function Logo({
  className = "",
  reversed = false,
  priority = false,
  width = 400,
}: {
  className?: string;
  reversed?: boolean;
  priority?: boolean;
  /** Widest the lockup will be drawn, in CSS pixels. See `size` below. */
  width?: number;
}) {
  const fade =
    "transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

  // `priority` goes to whichever lockup is actually on show, so only that one
  // is preloaded ahead of the hero. Its counterpart sits in the viewport as
  // well, so the browser still fetches it up front and the cross-fade has
  // something to fade to.
  //
  // The artwork is 1000px wide, and most placements are nowhere near it: the
  // footer lockup, the largest of them, is 112px tall at around 247px wide.
  // Declaring the display size keeps the optimiser from generating (and the
  // browser from fetching) a 1000px image for those, while still leaving the
  // 2× candidate wide enough to stay sharp; CSS drives the rendered height.
  // The home page's end card is the exception and asks for the full width.
  const size = { width, height: Math.round((width * 181) / 400) };

  return (
    <span className={`relative inline-flex ${className}`}>
      <Image
        src={logoFull}
        alt=""
        {...size}
        priority={priority && !reversed}
        className={`h-full w-auto ${fade} ${reversed ? "opacity-0" : "opacity-100"}`}
      />
      <Image
        src={logoReversed}
        alt=""
        {...size}
        priority={priority && reversed}
        className={`absolute left-0 top-0 h-full w-auto ${fade} ${
          reversed ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}
