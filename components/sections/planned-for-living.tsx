import { CurtainPhoto } from "@/components/sections/curtain-photo";
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
                50+ years of building for families in Karnataka decides how a
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
            {/* Two photographs, one per shape of screen, and only ever one of
                them fetched — the picking is in `curtain-photo.tsx`, along
                with why it cannot be done in CSS. */}
            <CurtainPhoto
              wide={{
                src: img.vijayAquaGreen,
                alt: alt.vijayAquaGreen,
                // Centred, and the horizontal half of that is very nearly
                // decorative: a 3:2 photograph is narrower than the stage at
                // any laptop shape, so `object-cover` fills the width and
                // takes its bite out of the height instead. The whole run of
                // the building is in frame at every point of the sweep; what
                // 50% down decides is only how the trim is split between the
                // sunset above and the verge below, and an even split keeps
                // the roofline off the top edge.
                position: "50% 50%",
              }}
              phone={{
                src: img.vijayAquaGreen,
                alt: alt.vijayAquaGreen,
                // The phone frame is close to square and the photograph is
                // landscape, so the bite comes out of the width. Centred, it
                // throws away the left-hand block — the one carrying the
                // development's name — and leaves an anonymous row of
                // balconies. At 20% the name is comfortably in, the entrance
                // canopy lands near the middle, and the run of the building
                // sweeps off to the right under the sunset. Same anchor, and
                // the same reasoning, as this photograph's frame in the
                // phone hero on the home page.
                position: "20% 50%",
              }}
            />
          </div>
        </div>
      </div>
    </ScrollScrub>
  );
}
