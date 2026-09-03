import Image, { type StaticImageData } from "next/image";
import { ImageReveal } from "@/components/ui/image-reveal";
import { Reveal } from "@/components/ui/reveal";

export type PartnerPanel = {
  title: string;
  body: string;
  image: StaticImageData;
  imageAlt: string;
  /**
   * Where to hold the photograph as the frame narrows. These panels are cut
   * to about 2:3 on a desktop, so a landscape original loses most of its
   * width — `object-position` decides which part survives. Left unset the
   * crop is centred, which is right for the pictures that are centred
   * themselves.
   */
  focus?: string;
};

/**
 * The four kinds of partner, one photograph each, run edge to edge across
 * the page.
 *
 * Square-cornered and full-bleed, which nothing else on the site is: the
 * band is a single strip of photography with the page above and below it,
 * and a corner radius on each panel would break the strip back into four
 * cards — the thing this replaced.
 *
 * The description under each title is held back until the panel is hovered,
 * so at rest the row reads as four named pictures rather than four blocks of
 * text. That is a pointer-only trick, so `.partner-blurb` opens the
 * description outright wherever there is no hover to open it with — see
 * `globals.css`. Focus counts as hover too, so a keyboard reaches the copy
 * on any device.
 */
export function PartnerPanels({ items }: { items: readonly PartnerPanel[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <Reveal
          key={item.title}
          as="li"
          /* Left to right, a panel at a time, rather than all four at once. */
          delay={index * 110}
          /* Tall enough from `lg` up that the band carries the screen rather
             than sitting as a strip in the middle of it: most of the window
             below the header, with a ceiling so it cannot run away on a very
             tall display. Below `lg` the row stacks, and a panel measured
             against the window would leave one picture filling the phone. */
          className="group relative isolate flex h-[22rem] overflow-hidden bg-navy-900 sm:h-[30rem] lg:h-[min(86svh,52rem)]"
        >
          <ImageReveal>
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              placeholder="blur"
              style={item.focus ? { objectPosition: item.focus } : undefined}
              className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </ImageReveal>

          {/* One shade, and a neutral one.

              This was a navy wash over the whole frame with a navy gradient
              on top of it, which held the copy well but put the site's blue
              over every photograph — the sunset went cold and the bungalow
              went grey. Both are gone. What is left is a single black ramp
              that is only really present at the foot of the panel, under the
              copy: the top two thirds of every picture is now its own colour,
              untinted. It deepens a little on hover, which is what carries
              the description as it opens. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 via-55% to-transparent transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-90"
          />

          {/* Centred across the panel, but sitting low in it rather than dead
              in the middle: three of these four photographs carry their
              subject at mid-height, and a title laid straight over a face
              reads as a mistake. Down here the copy is on the deepest part of
              the gradient and the picture is still legible above it.

              The description opens beneath the title and lifts the block as
              it goes — the panel is a fixed height, so nothing below it
              moves. */}
          <div className="relative flex w-full flex-col items-center justify-end px-6 pb-10 pt-10 text-center sm:px-7 sm:pb-12 lg:pb-14">
            <span
              aria-hidden="true"
              className="font-display text-[0.8125rem] tabular-nums tracking-[0.2em] text-brass-300"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3 className="mt-4 font-display text-[1.5rem] leading-[1.2] text-white sm:text-[1.625rem]">
              {item.title}
            </h3>

            {/* A brass rule, drawn in as the panel comes forward. */}
            <span
              aria-hidden="true"
              className="mt-5 h-px w-10 origin-center scale-x-50 bg-brass-400/70 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />

            <div className="partner-blurb w-full max-w-[24rem]">
              <div>
                <p className="pt-4 text-[0.9375rem] leading-relaxed text-navy-100/85">
                  {item.body}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
