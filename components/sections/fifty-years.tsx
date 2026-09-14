import type { ReactElement } from "react";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Counter } from "@/components/ui/counter";
import { GradientCard, type CardStat } from "@/components/ui/gradient-card";
import {
  AreaIcon,
  BuildingIcon,
  HeartIcon,
} from "@/components/ui/line-icons";

/** Long enough to watch the lakhs roll over; the same for all five. */
const COUNT_MS = 2200;

/**
 * The band directly under the hero: the headline figure on the left, three
 * dark cards stacked on the right.
 *
 * The cards carry the numbers rather than prose — what has been built, how
 * much of it, and for how many families. The heading carries the whole left
 * column on its own, so it is set very large and given nothing to compete
 * with.
 *
 * The band is flat — no pin, nothing rides up over it, and no snap. It used
 * to carry `snap-start`, paired with the same class on `FindResidences` and
 * `scroll-snap-type` on `html`; that handed the scroll from this band to the
 * next section, and made every gesture on every page of the site a snap
 * negotiation to pay for it. See the note in `globals.css`.
 *
 * Every figure counts up from nothing as it comes into view, and again each
 * time the band is scrolled back to — see `Counter`. All five run for the
 * same time, so they land together however far each has to climb. The
 * finished figure is what the server sends, so it is on the page without
 * JavaScript and read whole by a screen reader.
 *
 * All five on a laptop, that is. The headline 50+ stands still on a phone,
 * where it is set at 11rem and counting it moves the whole screen — the
 * four in the cards still run, and still land together.
 */
const points: {
  icon: (props: { className?: string }) => ReactElement;
  title: string;
  stats: CardStat[];
}[] = [
  {
    icon: AreaIcon,
    title: "Sq. Ft. Delivered",
    stats: [
      {
        value: (
          <Counter to={1000000} prefix="+" grouping durationMs={COUNT_MS} />
        ),
      },
    ],
  },
  {
    icon: BuildingIcon,
    title: "Residential Portfolio Scale",
    stats: [
      {
        label: "Apartment projects",
        value: <Counter to={30} suffix="+" durationMs={COUNT_MS} />,
      },
      {
        label: "No. of flats constructed",
        value: <Counter to={1200} suffix="+" durationMs={COUNT_MS} />,
      },
    ],
  },
  {
    icon: HeartIcon,
    title: "Trusted by Families",
    stats: [
      {
        value: <Counter to={1500} prefix="+" grouping durationMs={COUNT_MS} />,
        label: "happy families",
      },
    ],
  },
];

export function FiftyYears() {
  return (
    <Section tone="white" size="md">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="text-navy-900">
                <span className="block font-display text-[clamp(5rem,14vw,11rem)] leading-[0.8]">
                  {/* Still on a phone, asked for by name (2026-09-14). This
                      is the one figure on the site set at 11rem, and at a
                      phone's width that is most of the page — a number that
                      size rolling through four digit shapes before it
                      settles is not a flourish, it is the whole screen
                      moving. The three cards beside it still count: they are
                      figures inside a card rather than the page's headline.
                      See `countOn` in `Counter`. */}
                  <Counter
                    to={50}
                    suffix="+"
                    durationMs={COUNT_MS}
                    countOn="desk"
                  />
                </span>
                <span
                  aria-hidden="true"
                  className="my-7 block h-px w-24 bg-brass-500"
                />
                <span className="block font-display text-[clamp(2rem,5.2vw,3.5rem)] leading-[1.04]">
                  Years of <span className="text-brass-600">Vijaya</span>
                </span>
              </h2>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="space-y-4 sm:space-y-5">
              {points.map((point, index) => (
                <Reveal key={point.title} delay={index * 90}>
                  <GradientCard
                    icon={point.icon}
                    title={point.title}
                    stats={point.stats}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
