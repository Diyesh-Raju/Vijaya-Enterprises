import type { Metadata } from "next";
import Image from "next/image";
import { ResidentialHero } from "@/components/sections/residential-hero";
import { ApartmentProjects } from "@/components/sections/apartment-projects";
import { CtaBand } from "@/components/sections/cta-band";
import { IconCards } from "@/components/sections/icon-cards";
import { Reviews } from "@/components/sections/reviews";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { Counter } from "@/components/ui/counter";
import { AwardsComponent } from "@/components/ui/award";
import {
  BalanceEmblem,
  CompassRoseEmblem,
  CrestEmblem,
  HourglassEmblem,
  MasonryEmblem,
  PlanEmblem,
} from "@/components/ui/emblem-icons";
import { img, alt } from "@/lib/images";

export const metadata: Metadata = {
  title: "Residential Development",
  description:
    "Homes built on trust. Thoughtfully planned apartments, villas and residential developments backed by more than 50 years of construction experience in Karnataka.",
  alternates: { canonical: "/residential" },
};

/**
 * Figures shown under the hero. Each one counts up from zero on scroll.
 *
 * ⚠️ The project and family counts are not in the brand brief — they came
 * from the client directly. Confirm both before launch: the brief's own rule
 * is to support every claim with proof.
 */
const milestones = [
  { value: 50, suffix: "", label: "Years of excellence" },
  { value: 100, suffix: "+", label: "Projects completed" },
  { value: 500, suffix: "+", label: "Happy families" },
];

/**
 * Awards the company has won. Every line here is taken from the award
 * material itself — nothing is embellished.
 */
const awards = [
  {
    year: "2024",
    level: "gold" as const,
    title: "Times Business Award",
    subtitle: "The Most Trusted & Preferred Developers",
    description:
      "Presented in Bengaluru by Anupam Kher, Padma Shri (2004) and Padma Bhushan (2016).",
  },
  {
    year: "2022",
    level: "platinum" as const,
    title: "Icons of Indian Business",
    subtitle: "IIB Best Builders & Land Developers — Engineering Excellence",
    description:
      "Awarded on Engineers' Day, in memory of Bharat Ratna Sir M Vishweshwarayya.",
  },
];

/**
 * `body` is the line on the front of the card, `detail` the fuller answer on
 * the back. Everything in both is stated elsewhere on the site — except the
 * Vastu card, which is new copy and wants confirming against how the layouts
 * are actually planned before it goes public.
 */
const whyForYourHome = [
  {
    icon: <HourglassEmblem />,
    title: "50+ Years of Experience",
    body: "Building homes for families since 1973, through every change in how India builds.",
    detail:
      "Materials, methods and what a family expects of a home have all changed since 1973. The commitment to building with integrity has not.",
  },
  {
    icon: <MasonryEmblem />,
    title: "Quality Construction",
    body: "Materials and workmanship we would accept in a home built for our own family.",
    detail:
      "Specification, supervision and finish held to one standard, whatever the sector. Our greatest strength is simple: we understand construction from the ground up.",
  },
  {
    icon: <BalanceEmblem />,
    title: "Fair & Transparent Pricing",
    body: "Premium quality at a fair price, with no surprises after you commit.",
    detail:
      "What a home costs is explained before you commit, not after. What is included is written down, and what is not is said out loud.",
  },
  {
    icon: <PlanEmblem />,
    title: "Thoughtful Planning",
    body: "Layouts planned around how families actually live, not only around saleable area.",
    detail:
      "Light, ventilation, storage and circulation are settled first. Saleable area follows the layout rather than dictating it.",
  },
  {
    icon: <CrestEmblem />,
    title: "Trusted Legacy",
    body: "A name that families and institutions in Karnataka have relied on for five decades.",
    detail:
      "Bharat Electronics, HAL, ISRO, Indian Oil, Union Bank and Canara Bank are among the organisations that have put their construction in our hands.",
  },
  {
    icon: <CompassRoseEmblem />,
    title: "Vastu Compliant",
    body: "Homes planned to vastu principles, from the entrance through to the pooja room.",
    detail:
      "Orientation, entrances, kitchens, pooja rooms and master bedrooms placed to vastu — without giving up the light, ventilation or usable area that make a plan work.",
  },
];

export default function ResidentialPage() {
  return (
    <>
      <ResidentialHero />

      {/* ------------------------------------------------- Built for families */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Box 1 — the room itself. From lg up it drops its 4:5 ratio and
                stretches to the full row height, so its bottom edge lands level
                with the award box opposite. The height has to be handed down
                the whole chain: a percentage height against an auto-height
                parent resolves to nothing, and the ratio would win again. */}
            <div className="h-full lg:col-span-5">
              <Reveal className="h-full">
                <Frame
                  src={img.residentialInterior}
                  alt={alt.residentialInterior}
                  ratio="tall"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  rounded="rounded-[2rem] sm:rounded-[2.5rem]"
                  className="border-rosegold lg:aspect-auto lg:h-full"
                />
              </Reveal>
            </div>

            <div className="flex flex-col lg:col-span-7">
              {/* The three counts, each running up from zero when scrolled to */}
              <dl className="grid grid-cols-3 gap-5 sm:gap-8">
                {milestones.map((milestone, index) => (
                  <Reveal key={milestone.label} delay={index * 90}>
                    <dt className="sr-only">{milestone.label}</dt>
                    <dd>
                      <span className="block font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-none text-navy-900">
                        {/* Slower than the site default (1800ms) so the
                            figures read as they climb. */}
                        <Counter
                          to={milestone.value}
                          suffix={milestone.suffix}
                          durationMs={3200}
                        />
                      </span>
                      <span className="mt-3 block text-[0.6875rem] uppercase tracking-[0.18em] text-slate-muted sm:text-[0.75rem] sm:tracking-[0.2em]">
                        {milestone.label}
                      </span>
                    </dd>
                  </Reveal>
                ))}
              </dl>

              <Reveal delay={120}>
                <div className="mt-6 h-px w-full bg-line" />
              </Reveal>

              <div className="mt-7">
                <Reveal>
                  <Eyebrow>Built For Generations</Eyebrow>
                </Reveal>
                <Reveal delay={80}>
                  <h2 className="text-balance-head mt-6 text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.1]">
                    We don&rsquo;t construct buildings. We build homes.
                  </h2>
                </Reveal>
                <Reveal delay={160}>
                  <div className="mt-6 space-y-5 text-[1.0625rem] leading-[1.8] text-slate-body">
                    <p>
                      A house is finished in months. A home is lived in for
                      generations. That difference is what we have spent five
                      decades learning — how a family actually uses a room, which
                      materials still look right after twenty years, and where the
                      shortcuts show up later.
                    </p>
                    <p>
                      So we build for the long stay: sound structure, honest
                      materials and layouts planned around real life. What we hand
                      over is not a unit. It is where your family grows up.
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* The two awards the company has actually won, unframed — a box
                  around a seal reads as a seal inside a box.

                  Two per row only where a seal has room for its wreath. From
                  `lg` this column is seven of twelve tracks, so a pair would
                  get ~240px each and the branches would be clipped; through
                  that band they stack and take the full width instead. Below
                  `lg` the column is already full-bleed, so a pair fits from
                  `md` up — at `sm` a seal gets only ~276px, which is under the
                  lockup's width. By `xl` there is room for a pair again.

                  Written as `sm:max-lg:` / `xl:` rather than `sm:` + a `lg:`
                  override: two column-count utilities at different breakpoints
                  carry the same specificity, so the override lost on source
                  order and the pair never unstacked. Non-overlapping ranges
                  cannot collide. */}
              <Reveal delay={200} className="mt-10 lg:mt-auto lg:pt-10">
                <div className="grid gap-8 border-t border-line pt-10 md:max-lg:grid-cols-2 md:max-lg:gap-6 xl:grid-cols-2 xl:gap-6">
                  {awards.map((award) => (
                    <AwardsComponent
                      key={award.title}
                      accent="bare"
                      level={award.level}
                      badgeLabel={award.year}
                      title={award.title}
                      subtitle={award.subtitle}
                      description={award.description}
                      className="[--seal-size:11px] sm:[--seal-size:12px]"
                    />
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>


      <ApartmentProjects />

      {/* ------------------------------------------------------------- Why us */}
      <section className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-28">
        {/* The flowers sit at two corners of the frame, so they frame the cards
            rather than compete with them. Held well back, because six cards of
            text have to stay readable over the top. */}
        <Image
          src={img.backdropHibiscus}
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover opacity-[0.85]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-white/25" />
        <Container>
          <SectionHeading
            eyebrow="Why Vijaya"
            title="Why choose Vijaya for your home?"
            lead="Because a home should be built by people who take the responsibility personally."
          />
          <div className="mt-10 lg:mt-12">
            <IconCards items={whyForYourHome} columns={3} />
          </div>
        </Container>
      </section>

      <Reviews />

      <CtaBand
        eyebrow="Find Your Home"
        title={<>Let&rsquo;s find the right home for your family.</>}
        body={
          <p>
            Tell us where you want to live, what you need and what you are working
            with. We will tell you honestly what is possible — and what it takes to
            build it well.
          </p>
        }
        image={img.homeLawn}
        imageAlt={alt.homeLawn}
        primary={{ href: "/contact", label: "Talk To Us" }}
        secondary={{ href: "/our-legacy", label: "Our Legacy" }}
      />
    </>
  );
}
