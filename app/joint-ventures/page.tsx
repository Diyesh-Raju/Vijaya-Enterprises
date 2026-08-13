import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { ProofList } from "@/components/sections/proof-list";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { img, alt } from "@/lib/images";

export const metadata: Metadata = {
  title: "Joint Ventures & Joint Development",
  description:
    "Your land. Our experience. Vijaya Enterprises partners with landowners and development partners in Karnataka, bringing 50+ years of construction and development capability to joint development opportunities.",
  alternates: { canonical: "/joint-ventures" },
};

const idealPartners = [
  {
    title: "Landowners",
    body: "Owners of land who want it developed well, by a builder who will still be here afterwards.",
  },
  {
    title: "Families With Development Land",
    body: "Family-held land where several members need a fair, clear and workable arrangement.",
  },
  {
    title: "Property Owners",
    body: "Owners of existing property considering redevelopment rather than an outright sale.",
  },
  {
    title: "Development Partners",
    body: "Partners looking for construction capability and delivery they do not have to supervise.",
  },
];

const whyPartner = [
  {
    title: "50+ Years of Construction Experience",
    body: "Since 1973, across residential, commercial, industrial and institutional projects.",
  },
  {
    title: "In-House Construction Capability",
    body: "We build what we plan. Execution is not handed to a chain of subcontractors.",
  },
  {
    title: "Residential Development Experience",
    body: "We understand what makes a residential development work for the families who buy into it.",
  },
  {
    title: "Strong Local Understanding",
    body: "Five decades of building in Karnataka, and of knowing what each locality asks for.",
  },
  {
    title: "Long-Term Approach",
    body: "We are not looking for one transaction. Our reputation since 1973 depends on the outcome.",
  },
  {
    title: "Trust You Can Check",
    body: "Ask about the organisations and families we have already built for. That is the reference.",
  },
];

const steps = [
  {
    step: "01",
    title: "A conversation",
    body: "Tell us about the land, the ownership and what you would like to see happen. No obligation, and no pressure.",
  },
  {
    step: "02",
    title: "Feasibility and planning",
    body: "We look at what the site can realistically support — approvals, planning, cost and demand — and share what we find.",
  },
  {
    step: "03",
    title: "A clear arrangement",
    body: "Terms, responsibilities and shares set out plainly, so every party understands the arrangement before anyone commits.",
  },
  {
    step: "04",
    title: "Execution and delivery",
    body: "Construction handled in-house, with one point of responsibility from foundation to handover.",
  },
];

export default function JointVenturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Joint Ventures"
        title="Your land. Our experience. A shared opportunity."
        lead="A successful joint venture needs more than land and capital. It needs experience, planning, construction capability, market understanding and trust."
        image={img.aerialLand}
        imageAlt={alt.aerialLand}
        cta={{ href: "/contact", label: "Discuss A Joint Venture" }}
      />

      {/* ---------------------------------------------------------- Opening */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow>Build More Together</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
                  Land is only the beginning.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-slate-body">
                  <p>
                    Vijaya Enterprises brings more than five decades of construction
                    and development experience to joint development opportunities.
                    We work with landowners and partners to create viable
                    residential and development projects.
                  </p>
                  <p>
                    Bringing land, construction expertise and development capability
                    together is what makes a joint venture work — and what makes it
                    worth doing for everyone involved.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <Frame
                  src={img.meetingHands}
                  alt={alt.meetingHands}
                  ratio="wide"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  rounded="rounded-[2rem] sm:rounded-[3rem]"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------------- Partners */}
      <Section tone="mist" size="lg">
        <Container>
          <SectionHeading
            eyebrow="Ideal Partners"
            title="Who we work with."
            lead="If you hold land in or around Bengaluru and are considering what to do with it, there is a conversation worth having."
          />
          <div className="mt-14 lg:mt-16">
            <ProofList items={idealPartners} columns={2} />
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Process */}
      <Section tone="navy" size="lg">
        <Container>
          <SectionHeading
            eyebrow="How It Works"
            title="Clear from the first conversation."
            lead="We would rather explain the process honestly than push an agreement. Most of our work has come from people who felt they were told the truth early."
            onNavy
          />

          <ol className="mt-14 grid gap-4 sm:gap-5 lg:mt-16 lg:grid-cols-4">
            {steps.map((item, index) => (
              <Reveal
                key={item.step}
                delay={index * 80}
                as="li"
                className="group relative flex flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] sm:rounded-[1.75rem]"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-[0.9375rem] tabular-nums text-brass-400"
                >
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-[1.25rem] leading-snug text-white sm:text-[1.375rem]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-navy-100/70">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Why us */}
      <Section tone="white" size="lg">
        <Container>
          <SectionHeading
            eyebrow="Why Vijaya"
            title="Why partner with Vijaya?"
            lead="A joint venture is a long relationship. It is worth knowing who you are entering it with."
          />
          <div className="mt-14 lg:mt-16">
            <ProofList items={whyPartner} columns={3} />
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Joint Ventures"
        title="Build more together."
        body={
          <p>
            If you own land and want to understand what it could become, start with
            a conversation. We will tell you what we think is realistic — including
            when we think the answer is no.
          </p>
        }
        image={img.cranesSkyline}
        imageAlt={alt.cranesSkyline}
        primary={{ href: "/contact", label: "Discuss A Joint Venture" }}
        secondary={{ href: "/our-legacy", label: "Our Legacy" }}
      />
    </>
  );
}
