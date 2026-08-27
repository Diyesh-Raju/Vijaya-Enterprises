import type { ReactElement } from "react";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { GradientCard, type CardStat } from "@/components/ui/gradient-card";
import {
  AreaIcon,
  BuildingIcon,
  HeartIcon,
} from "@/components/ui/line-icons";

/**
 * The band directly under the hero: the headline figure on the left, three
 * dark cards stacked on the right.
 *
 * The cards carry the numbers rather than prose — what has been built, how
 * much of it, and for how many families. The heading carries the whole left
 * column on its own, so it is set very large and given nothing to compete
 * with.
 *
 * From `lg` up the band pins and the enquiry panel rides up over it — see
 * `pin` in `components/ui/section.tsx` for how that works and what it asks of
 * the section that follows.
 */
const points: {
  icon: (props: { className?: string }) => ReactElement;
  title: string;
  stats: CardStat[];
}[] = [
  {
    icon: AreaIcon,
    title: "Sq. Ft. Delivered",
    stats: [{ value: "+5,00,000" }],
  },
  {
    icon: BuildingIcon,
    title: "Residential Portfolio Scale",
    stats: [
      { label: "Apartment projects", value: "30" },
      { label: "No. of flats constructed", value: "1,200" },
    ],
  },
  {
    icon: HeartIcon,
    title: "Trusted by Families",
    stats: [{ value: "+1,500", label: "happy families" }],
  },
];

export function FiftyYears() {
  return (
    <Section tone="white" size="md" pin>
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="text-navy-900">
                <span className="block font-display text-[clamp(5rem,14vw,11rem)] leading-[0.8]">
                  50
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
