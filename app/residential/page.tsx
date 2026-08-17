import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ApartmentProjects } from "@/components/sections/apartment-projects";
import { CtaBand } from "@/components/sections/cta-band";
import { ProofList } from "@/components/sections/proof-list";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { AwardsComponent } from "@/components/ui/award";
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
    title: "50+ Years of Experience",
    body: "Building homes for families since 1973, through every change in how India builds.",
  },
  {
    title: "Quality Construction",
    body: "Materials and workmanship we would accept in a home built for our own family.",
  },
  {
    title: "Fair & Transparent Pricing",
    body: "Premium quality at a fair price, with no surprises after you commit.",
  },
  {
    title: "Thoughtful Planning",
    body: "Layouts planned around how families actually live, not only around saleable area.",
  },
  {
    title: "Trusted Legacy",
    body: "A name that families and institutions in Karnataka have relied on for five decades.",
  },
  {
    title: "Customer-Focused Approach",
    body: "One point of responsibility, from first enquiry through to handover.",
  },
];

const homeTypes = [
  {
    title: "Apartments",
    body: "Thoughtfully planned apartments in locations chosen for everyday convenience.",
  },
  {
    title: "Villas",
    body: "Independent homes built with the space, privacy and finish a family expects.",
  },
  {
    title: "Residential Developments",
    body: "Larger developments planned as complete places to live, not just buildings.",
  },
  {
    title: "Other Housing Projects",
    body: "Housing built for specific requirements, scales and communities.",
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
        cta={{ href: "#our-homes", label: "Explore Our Residential Work" }}
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

      {/* ------------------------------------------------------- What we build */}
      <Section tone="white" size="lg" id="our-homes">
        <Container>
          <SectionHeading
            eyebrow="What We Build"
            title="Homes that feel like home."
            lead="From thoughtfully planned apartments to larger residential developments, we aim to create homes where families can live comfortably and confidently."
          />

          <div className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-16">
            {homeTypes.map((type, index) => (
              <Reveal
                key={type.title}
                delay={(index % 2) * 80}
                className="group rounded-[1.5rem] border border-line bg-white p-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-navy-200 hover:shadow-lift sm:rounded-[1.75rem] sm:p-9"
              >
                <h3 className="font-display text-[1.375rem] leading-snug text-navy-900 sm:text-[1.5rem]">
                  {type.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-body">
                  {type.body}
                </p>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-5">
            <Reveal>
              <Frame
                src={img.homeDusk}
                alt={alt.homeDusk}
                ratio="tall"
                sizes="(max-width: 640px) 100vw, 30vw"
                rounded="rounded-[1.5rem] sm:rounded-[2rem]"
              />
            </Reveal>
            <Reveal delay={90}>
              <Frame
                src={img.interiorFamily}
                alt={alt.interiorFamily}
                ratio="tall"
                sizes="(max-width: 640px) 100vw, 30vw"
                rounded="rounded-[1.5rem] sm:rounded-[2rem]"
              />
            </Reveal>
            <Reveal delay={180}>
              <Frame
                src={img.homeLawn}
                alt={alt.homeLawn}
                ratio="tall"
                sizes="(max-width: 640px) 100vw, 30vw"
                rounded="rounded-[1.5rem] sm:rounded-[2rem]"
              />
            </Reveal>
          </div>

          {/* Honest about what is not on the site yet */}
          <Reveal delay={120}>
            <div className="mt-12 flex flex-col gap-6 rounded-[1.75rem] border border-line bg-white p-8 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:rounded-[2rem] sm:p-10">
              <p className="max-w-xl text-[1rem] leading-relaxed text-slate-body">
                Details of current and completed residential developments —
                locations, plans, availability and pricing — are shared directly
                with families who are looking. Tell us what you need and we will
                send what is relevant.
              </p>
              <Button href="/contact" withArrow className="shrink-0">
                Enquire About A Home
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Why us */}
      <Section tone="mist" size="lg">
        <Container>
          <SectionHeading
            eyebrow="Why Vijaya"
            title="Why choose Vijaya for your home?"
            lead="Because a home should be built by people who take the responsibility personally."
          />
          <div className="mt-14 lg:mt-16">
            <ProofList items={whyForYourHome} columns={3} />
          </div>
        </Container>
      </Section>

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
