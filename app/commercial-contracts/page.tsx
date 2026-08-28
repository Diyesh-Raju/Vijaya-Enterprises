import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/home-hero";
import { TrustedExperts } from "@/components/sections/trusted-experts";
import { CtaBand } from "@/components/sections/cta-band";
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
  title: "Commercial Contracts & Private Contract Construction",
  description:
    "Residential, commercial, industrial and institutional construction contracts undertaken by Vijaya Enterprises, with more than five decades of in-house construction experience.",
  alternates: { canonical: "/commercial-contracts" },
};

const undertakings: Undertaking[] = [
  {
    id: "commercial",
    eyebrow: "01 — Commercial Construction",
    title: "Reliable spaces for growing businesses.",
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

/**
 * The sequence a contract goes through, first call to handover.
 *
 * The page names five kinds of work it takes on but never said how the work
 * is actually run, which is the first thing a contract client asks. Five
 * stages, in the order they happen — and a photograph each, because they
 * are five screens rather than five list items. See `ContractStages`.
 */
const stages: ContractStage[] = [
  {
    step: "01",
    title: "The first conversation",
    body: "You tell us the site, the scope and roughly what you want to spend. We listen first, then say plainly what that plot and that budget will support — before anyone draws anything.",
    image: img.plotWalkover,
    imageAlt: alt.plotWalkover,
  },
  {
    step: "02",
    title: "Drawings and a written estimate",
    body: "Your architect's drawings or ours. Either way the estimate comes back broken down item by item, so you can see what each part of the building costs instead of one lump sum you have to take on faith.",
    image: img.drawingBoard,
    imageAlt: alt.drawingBoard,
  },
  {
    step: "03",
    title: "Agreement and schedule",
    body: "Scope, specification, payment stages and a construction schedule, all set down in writing. Everything is agreed before the first load of material reaches the site.",
    image: img.agreementSigning,
    imageAlt: alt.agreementSigning,
  },
  {
    step: "04",
    title: "Execution, in house",
    body: "The same teams that build our own developments build yours — civil, plumbing, electrical, carpentry, finishing — with one site engineer answerable for the whole job. Come and walk the site whenever you want to see the stage it has reached.",
    image: img.slabDusk,
    imageAlt: alt.slabDusk,
  },
  {
    step: "05",
    title: "Handover, and after",
    body: "Snags closed, drawings and documents handed over, and we stay reachable once the building is in use. A good share of our work comes from people who have built with us before.",
    image: img.towerOccupied,
    imageAlt: alt.towerOccupied,
  },
];

export default function CommercialContractsPage() {
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
      <Section tone="white" size="lg" pin>
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
      {/* No heading, and no padding: the five screens are the section. Each
          one names itself in its own eyebrow, and anything set above them
          would be counted as travel by the scrub — see `Undertakings`. */}
      <section id="we-undertake" className="relative isolate">
        <Undertakings items={undertakings} />
      </section>

      {/* ------------------------------------------------- What a contract is */}
      {/* A short breather between the five photo screens and the stages, and
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

          The lead-in only, now: the five stages that used to run down the
          right of it are five screens of their own below. Nothing is held
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
                  These are the five stages every project goes through with us,
                  whether it is a single house or a factory floor.
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

      {/* ------------------------------------------------- The five stages */}
      {/* No heading and no padding, like the five screens above it: each
          stage names itself, and the lead-in has just been read. */}
      <section id="how-a-contract-runs" className="relative isolate">
        {/* The badge is constant across the five, as the reference's
            "Featured" is. It does not repeat the eyebrow on the lead-in
            immediately above, which is read a second before it. */}
        <ContractStages items={stages} badge="Contract stage" />
      </section>

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
