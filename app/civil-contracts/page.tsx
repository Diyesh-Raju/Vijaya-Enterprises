import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/home-hero";
import { TrustedExperts } from "@/components/sections/trusted-experts";
import {
  Undertakings,
  type Undertaking,
} from "@/components/sections/undertakings";
import {
  ContractStages,
  type ContractStage,
} from "@/components/sections/contract-stages";
import { Container, Section, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ScrollLit } from "@/components/ui/scroll-lit";
import { Button } from "@/components/ui/button";
import { img, alt } from "@/lib/images";

export const metadata: Metadata = {
  title: "Civil Contracts & Private Contract Construction",
  description:
    "Residential, commercial, industrial and institutional construction contracts undertaken by Vijaya Enterprises, with more than five decades of in-house construction experience.",
  alternates: { canonical: "/civil-contracts" },
};

const undertakings: Undertaking[] = [
  {
    id: "commercial",
    eyebrow: "01 — Commercial Construction",
    title: "Commercial spaces built around your business.",
    body: "We undertake complete civil construction for offices, commercial buildings and business spaces — from structural work and building services to finishing and final handover. Our focus is on creating durable, functional spaces built for everyday use and long-term performance.",
    points: [
      "Corporate offices and workspaces",
      "Commercial buildings and complexes",
      "Retail and business establishments",
      "Mixed-use developments",
      "Complete civil construction and execution",
      "Renovation, refurbishment and upgrades",
    ],
    image: img.commercialStreetBlock,
    imageAlt: alt.commercialStreetBlock,
    cardImage: img.commercialStreetBlockPortrait,
  },
  {
    id: "industrial",
    eyebrow: "02 — Industrial Construction",
    title: "Industrial structures built for performance.",
    body: "Industrial construction demands more than a strong building. It requires careful planning, structural precision and an understanding of how the facility will operate. We undertake civil and structural works for factories, warehouses, production facilities and other industrial requirements.",
    points: [
      "Factories and manufacturing facilities",
      "PEB (Pre-Engineered Building) structures",
      "Industrial sheds and warehouses",
      "RCC foundations and industrial flooring",
      "Laboratories and engineering facilities",
      "Structural and civil infrastructure",
      "Specialised industrial structures",
    ],
    image: img.industrialShedFloor,
    imageAlt: alt.industrialShedFloor,
  },
  {
    id: "institutional",
    eyebrow: "03 — Institutional Construction",
    title: "Buildings that serve people for generations.",
    body: "Institutional buildings demand reliability, safety and careful execution because they are used by large numbers of people every day. We undertake civil construction and infrastructure works for institutions where quality, durability and dependable project execution are essential.",
    points: [
      "Educational institutions and campuses",
      "Hospitals and healthcare facilities",
      "Banks and financial institutions",
      "Government and public-sector buildings",
      "Temples and community buildings",
      "Institutional renovations and expansions",
      "Complete civil construction and execution",
    ],
    image: img.institutionHospital,
    imageAlt: alt.institutionHospital,
  },
  {
    id: "residential-contracts",
    eyebrow: "04 — Residential Construction",
    title: "Homes built around the way you want to live.",
    body: "We undertake residential construction for individual homeowners, developers and builders — from foundation and structural work to finishing and final handover. Whether it is a private residence or a larger residential development, we bring the same attention to quality, workmanship and execution.",
    points: [
      "Independent homes and villas",
      "Residential buildings and apartments",
      "Builder-contract execution",
      "Structural and civil construction",
      "Renovation and extensions",
      "Turnkey residential construction",
      "External works and site development",
    ],
    image: img.villaStreetDusk,
    imageAlt: alt.villaStreetDusk,
    cardImage: img.villaStreetDuskPortrait,
  },
  {
    id: "renovation",
    eyebrow: "05 — Renovation, Expansion & Redevelopment",
    title: "Upgrade, expand or rebuild — without starting from scratch.",
    body: "Not every project begins construction on an empty site. We undertake additions, extensions, renovations and redevelopment of existing buildings, working around the structure and conditions already on site. Our experience allows us to approach such projects with practical planning, careful execution and minimal disruption.",
    points: [
      "Building extensions and additional floors",
      "Renovation and refurbishment",
      "Structural repairs and strengthening",
      "Building upgrades and modifications",
      "Redevelopment of existing properties",
      "Alterations and additions to existing structures",
    ],
    image: img.siteTeam,
    imageAlt: alt.siteTeam,
  },
  {
    id: "landscaping",
    eyebrow: "06 — Landscaping & Site Development",
    title: "From the building to the landscape — we complete the whole site.",
    body: "We undertake landscaping and external development works to transform unfinished sites into functional, well-planned outdoor environments. Our scope covers both hardscape and softscape works, coordinated with the building and site requirements.",
    points: [
      "Landscape design execution",
      "Gardens and planting",
      "Paving, pathways and driveways",
      "Outdoor spaces and seating areas",
      "Irrigation and drainage",
      "Boundary walls and site features",
      "Complete external site development",
    ],
    image: img.landscapeGardenPath,
    imageAlt: alt.landscapeGardenPath,
  },
];

/**
 * The sequence a contract goes through, first call to handover.
 *
 * The page names six kinds of work it takes on but never said how the work
 * is actually run, which is the first thing a contract client asks. Six
 * stages, in the order they happen — and a photograph each, because they
 * are six screens rather than six list items. See `ContractStages`.
 */
const stages: ContractStage[] = [
  {
    step: "01",
    title: "01 — Site & Project Assessment",
    subtitle: "We start by understanding the project.",
    points: [
      "Site inspection and existing-condition assessment",
      "Understanding your requirements and intended use",
      "Site access, levels and surrounding conditions",
      "Initial scope and construction expectations",
      "Preliminary budget discussion",
      "Identifying project constraints",
    ],
    image: img.plotWalkover,
    imageAlt: alt.plotWalkover,
  },
  {
    step: "02",
    title: "02 — Legal & Statutory Verification",
    subtitle: "Before we draw, we make sure the project can proceed.",
    points: [
      "Property and ownership documentation",
      "Khata and relevant property records",
      "Land use and zoning requirements",
      "Setbacks, FAR/FSI and permissible construction",
      "Sanctioned plans and building permissions",
      "BBMP/BDA and other applicable approvals",
      "Required NOCs and statutory clearances",
      "Identification of potential legal or approval issues",
    ],
    note: "We identify requirements early — before they become construction problems.",
    image: img.legalVerificationDesk,
    imageAlt: alt.legalVerificationDesk,
  },
  {
    step: "03",
    title: "03 — Drawings & Detailed Estimate",
    subtitle: "Every part of the project is defined before construction.",
    points: [
      "Architectural and structural drawings",
      "Construction specifications",
      "Material and quality specifications",
      "Detailed quantity estimation",
      "Item-wise costing",
      "Clear scope of work and inclusions",
      "Construction methodology and stages",
      "Preliminary project timeline",
    ],
    image: img.drawingBoard,
    imageAlt: alt.drawingBoard,
  },
  {
    step: "04",
    title: "04 — Agreement & Construction Schedule",
    subtitle: "Scope, cost and timelines — clearly agreed.",
    points: [
      "Final scope of work",
      "Detailed specifications",
      "Contract value",
      "Payment milestones",
      "Construction schedule",
      "Responsibilities of both parties",
      "Material and workmanship standards",
      "Variation and additional-work terms",
      "Completion and handover terms",
    ],
    image: img.agreementSigning,
    imageAlt: alt.agreementSigning,
  },
  {
    step: "05",
    title: "05 — In-House Execution & Site Management",
    subtitle: "Our team takes the project from plans to completion.",
    points: [
      "Civil and structural construction",
      "Plumbing and electrical works",
      "Masonry and plastering",
      "Flooring and finishing works",
      "Carpentry and painting",
      "External works and site development",
      "Landscaping, where included",
      "Dedicated site supervision",
      "Regular progress monitoring",
    ],
    image: img.slabDusk,
    imageAlt: alt.slabDusk,
  },
  {
    step: "06",
    title: "06 — Handover & After Completion",
    subtitle: "We stay involved until the project is properly handed over.",
    points: [
      "Final inspection",
      "Snag identification and closure",
      "Completion of pending works",
      "Finishing and quality checks",
      "Relevant drawings and documentation",
      "Final handover",
      "Post-handover support",
    ],
    image: img.handoverFamilyEngineer,
    imageAlt: alt.handoverFamilyEngineer,
  },
];

export default function CivilContractsPage() {
  return (
    <>
      <HomeHero />

      {/* ------------------------------------------------------- Trusted by */}
      <TrustedExperts />

      {/* ---------------------------------------------------------- Opening */}
      {/* PINNED from `lg` up: this holds still under the header while "What
          we undertake" climbs over it from below, rather than being pushed
          up the screen by it. It asks only that what follows be opaque and
          later in the DOM, which the track below is — see `pin` in
          `components/ui/section.tsx`. */}
      {/* A shallower hold than the default full screen. Centred in the whole
          window, this section's copy sat about 240px below the band above it,
          and with the band's arc reaching almost to its own bottom edge that
          read as a long empty white drop between the curve and the heading.
          The hold is cut to the copy plus air instead. */}
      <Section
        tone="white"
        size="lg"
        pin
        style={{ "--pin-h": "34rem" } as CSSProperties}
      >
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
      {/* No heading, and no padding: the six screens are the section. Each
          one names itself in its own eyebrow, and anything set above them
          would be counted as travel by the scrub — see `Undertakings`. */}
      <section id="we-undertake" className="relative isolate">
        <Undertakings items={undertakings} />
      </section>

      {/* ------------------------------------------------- What a contract is */}
      {/* A short breather between the six photo screens and the stages, and
          the one place on the site that draws the line between contract work
          and the two arrangements where we take a share of what is built. */}
      <Section tone="white" size="sm">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <Eyebrow>Contract Construction</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-balance-head mt-6 text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.12]">
                You own the project. We build it.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              {/* Lights word by word on the scroll, and is not finished until
                  the stages below are in frame — set larger than body copy
                  for it, but held under the heading it sits beneath. */}
              <ScrollLit className="mt-7 text-[clamp(1.1875rem,2.1vw,1.5rem)] leading-[1.7]">
                {`A contract with Vijaya covers the building itself — foundation
                  to finishes, on your land, to your drawings or ours. No share
                  and no stake: what is built stays entirely yours, and we are
                  paid to construct it properly. Any size, anywhere in and
                  around Bengaluru.`}
              </ScrollLit>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Process */}
      {/* This replaces a second "trusted by" block that said what the client
          band under the hero already says.

          The lead-in only, now: the six stages that used to run down the
          right of it are six screens of their own below. Nothing is held
          under the header any more — there is nothing left beside this to
          hold it against. */}
      <Section tone="mist" size="lg">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-20">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow>How A Contract Runs</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
                  What happens after you call us.
                </h2>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={160}>
                <p className="text-[1.0625rem] leading-[1.8] text-slate-body">
                  A contract should be predictable long before it is signed.
                  These are the six stages every project goes through with
                  us, whether it is a single house or a factory floor.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-9">
                  <Button href="/our-legacy" variant="outline" withArrow>
                    See Our Legacy
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------- The six stages */}
      {/* No heading and no padding, like the six screens above it: each
          stage names itself, and the lead-in has just been read. */}
      <section id="how-a-contract-runs" className="relative isolate">
        {/* The badge is constant across the six, as the reference's
            "Featured" is. It does not repeat the eyebrow on the lead-in
            immediately above, which is read a second before it. */}
        <ContractStages items={stages} badge="Contract stage" />
      </section>

      {/* ------------------------------------------------ After the handover */}
      {/* The close of the page, on white between the last stage and the
          footer. Six dark screens run one into the next above it and the
          footer is a seventh, so this is both the breath between them and the
          one thing the page has left to ask for. Heading, a line of prose and
          a single action, centred — the shape of the reference this section
          was set from. */}
      <Section tone="white" size="lg">
        <Container>
          <div className="mx-auto max-w-[46rem] text-center">
            <Reveal>
              <h2 className="text-balance-head text-[clamp(1.875rem,4vw,3rem)] leading-[1.12]">
                The project is complete when you are satisfied with the
                handover.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mx-auto mt-6 max-w-[38rem] text-[1.0625rem] leading-[1.8] text-slate-body">
                Bring us the plot, the drawings and a budget. We will tell you
                plainly what it will take to build — item by item, before
                anything is signed.
              </p>
            </Reveal>
            <Reveal delay={160}>
              {/* `primary` is the navy pill rather than the brass one: on a
                  white ground this is the page's one action, and it is the
                  same button the home page closes on. */}
              <div className="mt-10">
                <Button href="/contact" variant="primary" size="lg" withArrow>
                  Start A Conversation
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
