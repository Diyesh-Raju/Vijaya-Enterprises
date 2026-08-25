import Image from "next/image";
import { DisclosureList, type DisclosureItem } from "@/components/ui/disclosure-list";
import { Reveal } from "@/components/ui/reveal";
import { ScrollScrub } from "@/components/ui/scroll-scrub";
import { img, alt } from "@/lib/images";

/**
 * How a Vijaya home is planned: a panel of copy beside a photograph, and the
 * photograph takes the whole window as you scroll through it.
 *
 * The section is a tall track with a pinned stage inside it. While the stage
 * is pinned, the photograph's left edge sweeps across the panel until it is
 * full-bleed, so the panel is wiped away to the left rather than scrolled
 * off. See `.curtain` in `globals.css` for the mechanics, and
 * `ScrollScrub` for what drives them.
 *
 * Below `lg` there is no track and no sweep: the photograph and the panel
 * simply stack, in that order.
 *
 * ⚠️ Everything claimed here is a restatement of copy already on the site —
 * the "Built for generations" section above, and the "Why Vijaya" cards
 * below. Keep it that way: nothing on this page should promise something the
 * rest of the site cannot back.
 */

/**
 * Four things about the plan of a home, not four things about the company —
 * the "Why Vijaya" cards further down the page already do that job, and two
 * sets of company promises on one page would read as one set said twice.
 */
const principles: readonly DisclosureItem[] = [
  {
    title: "Light and air in every room",
    body: "Which way a home faces, and how the air moves through it, are settled before the plan is drawn. A room that has to be lit and cooled all day was the wrong room.",
  },
  {
    title: "Storage and circulation, drawn in first",
    body: "Where a family actually walks, and where its things actually go, is planned at the layout stage. Saleable area follows the layout rather than dictating it.",
  },
  {
    title: "Vastu, without giving up the plan",
    body: "Orientation, entrances, kitchens, pooja rooms and master bedrooms are placed to vastu — without losing the light, ventilation or usable area that make a home work.",
  },
  {
    title: "Built for the long stay",
    body: "Sound structure and honest materials, specified and supervised to one standard. What still looks right after twenty years is what decides the specification.",
  },
];

export function PlannedForLiving() {
  return (
    <ScrollScrub
      as="section"
      // The scrub writes progress through the track as a time in this span,
      // and `globals.css` places the sweep inside it. 1000 for no better
      // reason than that percentages of it are then easy to read.
      spanMs={1000}
      variable="--curtain"
      className="curtain relative bg-navy-900"
    >
      <div className="curtain__stage relative flex flex-col overflow-hidden lg:block lg:sticky lg:top-0 lg:h-svh">
        {/* --------------------------------------------------------- Panel */}
        {/* Before the photograph in the DOM so the photograph paints over it
            as the sweep opens; put back on top on phones with `order`, where
            a picture reads better as the section's opening than as its
            footnote. */}
        {/* The pad at the top is the header's own height. The stage is pinned
            against the top of the window, so copy centred in it is centred
            behind the bar as well — on a short laptop screen that put the
            first line of the heading under the frosted strip. */}
        <div className="curtain__panel relative flex w-full items-center bg-navy-900 px-6 py-14 sm:px-10 sm:py-16 lg:absolute lg:inset-y-0 lg:left-0 lg:z-0 lg:pb-0 lg:pt-24">
          {/* Set on the page's own left gutter, not centred in the panel and
              not pushed up against the picture: the heading starts on the
              same line as every other section's, so the panel reads as part
              of the page rather than as a box laid over it. The gap it
              leaves falls on the right, between the copy and the edge of
              the photograph — see `.curtain__panel` in `globals.css`. */}
          <div className="w-full lg:max-w-[30rem]">
            <Reveal>
              <h2 className="text-balance-head text-[clamp(1.75rem,min(2.7vw,4.2vh),2.375rem)] leading-[1.08] text-white">
                Homes planned around how a family actually lives
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.75] text-navy-100/85 lg:mt-[clamp(1rem,2.6vh,1.5rem)]">
                Fifty years of building for families in Karnataka decides how a
                Vijaya home is planned — where the light falls, where the
                storage goes, and what still looks right long after the keys
                have changed hands.
              </p>
            </Reveal>

            <Reveal delay={160}>
              {/* The rows give way on a short window. Everything in the
                  panel has to fit one screen — the stage is pinned, so
                  anything past the bottom is not scrolled to, it is simply
                  never seen — and on a 13-inch laptop four rows at their
                  full height are what tips it over. */}
              <DisclosureList
                items={principles}
                tone="navy"
                className="mt-10 sm:mt-12 lg:mt-[clamp(1.5rem,4.5vh,3rem)] lg:[--disclosure-row-py:clamp(0.5rem,1.5vh,1.125rem)]"
              />
            </Reveal>
          </div>
        </div>

        {/* ---------------------------------------------------- Photograph */}
        {/* Full-bleed from the start and clipped to the half of the stage the
            sweep has reached, rather than a half-width picture that grows.
            A growing frame re-crops its photograph every frame — the house
            slides and scales while the panel leaves, and the eye follows the
            wrong thing. Clipped, the picture is still and only more of it
            arrives. */}
        <div className="curtain__photo relative -order-1 h-[46svh] w-full sm:h-[54svh] lg:absolute lg:inset-0 lg:z-10 lg:h-auto">
          {/* The inner layer is what drifts. It starts pushed left and a
              little over-size, so the part of the picture standing in the
              opening moves against the sweep instead of sitting there. */}
          <div className="curtain__photo-inner absolute inset-0">
            <Image
              src={img.haraVijayaConcept}
              alt={alt.haraVijayaConcept}
              fill
              sizes="100vw"
              quality={85}
              placeholder="blur"
              // Hung right of centre. It does almost nothing on a desktop
              // window, where a 16:9 photograph in a taller frame is trimmed
              // top and bottom rather than at the sides — but on a phone,
              // where the frame is close to square, it is what keeps the
              // towers in the crop instead of the lawn beside them.
              style={{ objectPosition: "62% 50%" }}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </ScrollScrub>
  );
}
