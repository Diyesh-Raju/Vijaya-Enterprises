import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
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
  BrickWallIcon,
  FloorPlanIcon,
  HeartIcon,
  HourglassIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from "@/components/ui/line-icons";
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

const whyForYourHome = [
  {
    icon: <HourglassIcon />,
    title: "50+ Years of Experience",
    body: "Building homes for families since 1973, through every change in how India builds.",
  },
  {
    icon: <BrickWallIcon />,
    title: "Quality Construction",
    body: "Materials and workmanship we would accept in a home built for our own family.",
  },
  {
    icon: <ScaleIcon />,
    title: "Fair & Transparent Pricing",
    body: "Premium quality at a fair price, with no surprises after you commit.",
  },
  {
    icon: <FloorPlanIcon />,
    title: "Thoughtful Planning",
    body: "Layouts planned around how families actually live, not only around saleable area.",
  },
  {
    icon: <ShieldCheckIcon />,
    title: "Trusted Legacy",
    body: "A name that families and institutions in Karnataka have relied on for five decades.",
  },
  {
    icon: <HeartIcon />,
    title: "Customer-Focused Approach",
    body: "One point of responsibility, from first enquiry through to handover.",
  },
];

export default function ResidentialPage() {
  return (
    <>
      <PageHero
        eyebrow="Residential Development"
        title="Homes built on trust."
        lead="Thoughtfully planned homes backed by more than 50 years of construction experience."
        image={img.villaPool}
        imageAlt={alt.villaPool}
        cta={{ href: "#apartment-projects", label: "Explore Our Residential Work" }}
      />

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
                <div className="mt-10 h-px w-full bg-line" />
              </Reveal>

              <div className="mt-10">
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

              {/* Box 2 — the trust seal. Runs the full width of this column so
                  its left edge lines up with the paragraph above it. */}
              <Reveal delay={200} className="mt-10 lg:mt-auto lg:pt-12">
                <AwardsComponent
                  variant="award"
                  level="gold"
                  accent="rosegold"
                  badgeLabel="Trusted"
                  title="50+ Years"
                  description="Of building homes families grow up in"
                  recipient="Vijaya Enterprises"
                  date="Since 1973"
                  className="w-full text-[13px] sm:text-[14px]"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>


      <ApartmentProjects />

      {/* ------------------------------------------------------------- Why us */}
      {/* White, so it breaks from the mist Apartment Projects above it. The
          CtaBand below brings its own navy card, so it needs no contrast from
          this section — the same pairing the joint ventures page uses. */}
      <Section tone="white" size="lg">
        <Container>
          <SectionHeading
            eyebrow="Why Vijaya"
            title="Why choose Vijaya for your home?"
            lead="Because a home should be built by people who take the responsibility personally."
          />
          <div className="mt-14 lg:mt-16">
            <IconCards items={whyForYourHome} columns={3} />
          </div>
        </Container>
      </Section>

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
