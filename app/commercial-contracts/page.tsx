import type { Metadata } from "next";
import type { StaticImageData } from "next/image";
import { HomeHero } from "@/components/sections/home-hero";
import { TrustedExperts } from "@/components/sections/trusted-experts";
import { CtaBand } from "@/components/sections/cta-band";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { img, alt } from "@/lib/images";
import { associatedOrganisations } from "@/lib/site";

export const metadata: Metadata = {
  title: "Commercial Contracts & Private Contract Construction",
  description:
    "Residential, commercial, industrial and institutional construction contracts undertaken by Vijaya Enterprises, with more than five decades of in-house construction experience.",
  alternates: { canonical: "/commercial-contracts" },
};

type Undertaking = {
  id?: string;
  eyebrow: string;
  title: string;
  message: string;
  body: string;
  points: string[];
  image: StaticImageData;
  imageAlt: string;
};

const undertakings: Undertaking[] = [
  {
    id: "commercial",
    eyebrow: "01 — Commercial Construction",
    title: "Reliable spaces for growing businesses.",
    message: "Offices, commercial buildings and business spaces.",
    body: "Spaces designed and built to support businesses for years to come — planned around how your organisation actually works, and built to stay serviceable long after handover.",
    points: [
      "Corporate offices and workspaces",
      "Commercial buildings and complexes",
      "Mixed-use developments",
      "Business infrastructure",
    ],
    image: img.officeInterior,
    imageAlt: alt.officeInterior,
  },
  {
    id: "industrial",
    eyebrow: "02 — Industrial Construction",
    title: "Engineering precision for mission-critical facilities.",
    message: "Industrial buildings, facilities and warehouses.",
    body: "Strong foundations for industries that demand precision, reliability and performance. We have built for manufacturing, engineering and public-sector organisations where tolerances and timelines are not negotiable.",
    points: [
      "Factories and production facilities",
      "Laboratories and engineering facilities",
      "Warehouses and storage",
      "Specialised industrial structures",
    ],
    image: img.warehouseAisle,
    imageAlt: alt.warehouseAisle,
  },
  {
    id: "institutional",
    eyebrow: "03 — Institutional Construction",
    title: "Trusted construction for organisations that serve society.",
    message: "Educational, healthcare and other institutional projects.",
    body: "Buildings for institutions carry a different kind of responsibility — they are used by the public every day, for decades. We have built for educational institutions, hospitals, banks, temples and government organisations.",
    points: [
      "Educational institutions",
      "Hospitals and healthcare facilities",
      "Banks and public sector buildings",
      "Temples and community buildings",
    ],
    image: img.institutionHospital,
    imageAlt: alt.institutionHospital,
  },
  {
    id: "residential-contracts",
    eyebrow: "04 — Residential Construction",
    title: "A home built with care for your family.",
    message: "Individual homes and residential buildings.",
    body: "Private residential contracts, built with the same discipline we bring to a large industrial facility. Your drawings or ours, your plot, our execution.",
    points: [
      "Individual and independent homes",
      "Residential buildings and apartments",
      "Builder-contract execution",
      "Turnkey residential delivery",
    ],
    image: img.homeDusk,
    imageAlt: alt.homeDusk,
  },
  {
    id: "renovation",
    eyebrow: "05 — Renovation & Expansion",
    title: "Upgrades, extensions and redevelopment.",
    message: "Upgrades, extensions and redevelopment requirements.",
    body: "Not every project starts from open ground. We take on additions, upgrades and redevelopment of existing structures — work that needs judgement about what is already standing.",
    points: [
      "Extensions and additional floors",
      "Renovation and refurbishment",
      "Structural upgrades",
      "Redevelopment requirements",
    ],
    image: img.siteTeam,
    imageAlt: alt.siteTeam,
  },
];

export default function CommercialContractsPage() {
  return (
    <>
      <HomeHero />

      {/* ------------------------------------------------------- Trusted by */}
      <TrustedExperts />

      {/* ---------------------------------------------------------- Opening */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow>Your Project. Our Experience.</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
                  Every construction project is different.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-slate-body">
                  <p>
                    Your requirements, budget, design and timeline are unique. Our
                    role is to understand them and bring the right construction
                    experience to make your project a reality.
                  </p>
                  <p>
                    We invest in better buildings rather than bigger
                    advertisements. Every saving made through efficient in-house
                    execution is passed on to you through better quality and
                    better value.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={120}>
                <div className="rounded-[2rem] border border-line bg-mist p-8 sm:p-10">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
                    In-house execution
                  </p>
                  <p className="mt-6 font-display text-[1.5rem] leading-snug text-navy-900 sm:text-[1.75rem]">
                    Complete in-house execution means quality stays under our
                    control at every stage.
                  </p>
                  <p className="mt-5 text-[0.9375rem] leading-relaxed text-slate-body">
                    One team is responsible from planning to handover. Nothing is
                    handed off to a chain of subcontractors and forgotten.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ We undertake */}
      <Section tone="mist" size="lg" id="we-undertake">
        <Container>
          <SectionHeading
            eyebrow="What We Undertake"
            title="One trusted construction partner."
            lead="We take on private construction contracts across every sector we have built in for the past five decades."
          />
        </Container>

        <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-24">
          {undertakings.map((item, index) => (
            <Container key={item.title}>
              <div
                id={item.id}
                className="grid items-center gap-10 scroll-mt-28 lg:grid-cols-12 lg:gap-16"
              >
                <div
                  className={
                    index % 2 === 0
                      ? "lg:col-span-6"
                      : "lg:order-2 lg:col-span-6"
                  }
                >
                  <Reveal>
                    <Frame
                      src={item.image}
                      alt={item.imageAlt}
                      ratio="wide"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      rounded="rounded-[1.75rem] sm:rounded-[2.5rem]"
                    />
                  </Reveal>
                </div>

                <div
                  className={
                    index % 2 === 0
                      ? "lg:col-span-6"
                      : "lg:order-1 lg:col-span-6"
                  }
                >
                  <Reveal delay={80}>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-brass-600">
                      {item.eyebrow}
                    </p>
                  </Reveal>
                  <Reveal delay={140}>
                    <h3 className="text-balance-head mt-5 font-display text-[clamp(1.5rem,2.8vw,2.25rem)] leading-[1.15] text-navy-900">
                      {item.title}
                    </h3>
                  </Reveal>
                  <Reveal delay={200}>
                    <p className="mt-5 text-[1rem] leading-[1.8] text-slate-body">
                      {item.body}
                    </p>
                  </Reveal>
                  <Reveal delay={260}>
                    <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                      {item.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 text-[0.9375rem] text-navy-800"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>
              </div>
            </Container>
          ))}
        </div>
      </Section>

      {/* --------------------------------------------------------- Credibility */}
      <Section tone="navy" size="lg">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow onNavy>Proof</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08] text-white">
                  Trusted by organisations that cannot afford to get it wrong.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-7 text-[1.0625rem] leading-[1.8] text-navy-100/80">
                  Over five decades we have worked on projects associated with
                  defence and aerospace, banking, education, healthcare, industrial
                  and public-sector organisations. That range is the clearest proof
                  of what our team can take on.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-9">
                  <Button href="/our-legacy" variant="light" withArrow>
                    See Our Legacy
                  </Button>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <Frame
                  src={img.industrialEngineer}
                  alt={alt.industrialEngineer}
                  ratio="landscape"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  rounded="rounded-[1.75rem] sm:rounded-[2.5rem]"
                />
              </Reveal>
            </div>
          </div>
        </Container>

        <Reveal className="mt-16 border-y border-white/10 py-8 sm:mt-20">
          <Marquee items={associatedOrganisations} onNavy />
        </Reveal>
      </Section>

      <CtaBand
        eyebrow="Have A Project To Build?"
        title="Tell us what you want to build."
        body={
          <p>
            Whether you are planning a private residence, commercial building,
            office, industrial facility, warehouse, institutional building,
            renovation or extension — we will help you understand what it takes to
            build it.
          </p>
        }
        image={img.steelRebar}
        imageAlt={alt.steelRebar}
        primary={{ href: "/contact", label: "Discuss Your Construction Project" }}
        secondary={{ href: "/joint-ventures", label: "Joint Ventures" }}
      />
    </>
  );
}
