import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { ProofList } from "@/components/sections/proof-list";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { Button } from "@/components/ui/button";
import { img, alt } from "@/lib/images";

export const metadata: Metadata = {
  title: "Residential Development",
  description:
    "Homes built on trust. Thoughtfully planned apartments, villas and residential developments backed by more than 50 years of construction experience in Karnataka.",
  alternates: { canonical: "/residential" },
};

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

      {/* ---------------------------------------------------------- Opening */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow>More Than An Investment</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
                  A home is where your family grows.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-slate-body">
                  <p>
                    Buying a home is one of the biggest decisions a family makes.
                    It is where your family grows, celebrates and creates memories.
                  </p>
                  <p>
                    At Vijaya Enterprises, we combine decades of construction
                    experience with thoughtful planning to create residential
                    developments that offer quality, comfort and value.
                  </p>
                  <p>
                    Our residential developments focus on what matters beyond the
                    walls — quality, location, functionality, value and peace of
                    mind.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <Frame
                  src={img.interiorLiving}
                  alt={alt.interiorLiving}
                  ratio="wide"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  rounded="rounded-[2rem] sm:rounded-[3rem]"
                />
              </Reveal>
              <Reveal delay={200}>
                <blockquote className="mt-6 rounded-3xl border border-line bg-mist p-8 sm:p-9">
                  <p className="font-display text-[1.25rem] leading-snug text-navy-900 sm:text-[1.4375rem]">
                    “A home built with care for your family.”
                  </p>
                </blockquote>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------- What we build */}
      <Section tone="mist" size="lg" id="our-homes">
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
      <Section tone="white" size="lg">
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
