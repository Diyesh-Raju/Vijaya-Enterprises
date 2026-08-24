import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { GradientCard } from "@/components/ui/gradient-card";
import {
  BuildingIcon,
  HeartIcon,
  HourglassIcon,
} from "@/components/ui/line-icons";

/**
 * The band directly under the hero: the headline figure on the left, three
 * dark cards stacked on the right.
 *
 * Everything in the cards is stated elsewhere on the site in longer form —
 * this is the short version, put where a visitor lands rather than where they
 * scroll to. The heading carries the whole left column on its own, so it is
 * set very large and given nothing to compete with.
 */
const points = [
  {
    icon: HourglassIcon,
    title: "Since 1973",
    description:
      "Five decades of building, through every change in materials, technology and what customers expect of a home.",
  },
  {
    icon: BuildingIcon,
    title: "Four Verticals",
    description:
      "Residential, commercial, industrial and institutional. One construction partner, whatever the sector asks for.",
  },
  {
    icon: HeartIcon,
    title: "Like Family",
    description:
      "Every project, every customer. The promise Vijaya was built on, and the reason its reputation has lasted generations.",
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
                    description={point.description}
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
