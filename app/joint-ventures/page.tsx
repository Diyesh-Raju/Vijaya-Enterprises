import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { HandshakeReveal } from "@/components/sections/handshake-reveal";
import { PartnerPanels } from "@/components/sections/partner-panels";
import {
  ProcessReveal,
  type ProcessStep,
} from "@/components/sections/process-reveal";
import {
  ReasonPanels,
  type ReasonPanel,
} from "@/components/sections/reason-panels";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
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
    image: img.partnerLandHolding,
    imageAlt: alt.partnerLandHolding,
  },
  {
    title: "Families With Development Land",
    body: "Family-held land where several members need a fair, clear and workable arrangement.",
    // The family from the Residential hero, so the people a joint venture is
    // finally built for are the same people on both pages.
    image: img.balconyFamily,
    imageAlt: alt.balconyFamily,
    // A narrow panel holds about a third of this photograph's width, and the
    // four of them stand well left of centre in it. Held here the whole
    // group is in frame, from the father to the girl's pointing hand.
    focus: "24% 50%",
  },
  {
    title: "Property Owners",
    body: "Owners of existing property considering redevelopment rather than an outright sale.",
    image: img.partnerBungalow,
    imageAlt: alt.partnerBungalow,
  },
  {
    title: "Development Partners",
    body: "Partners looking for construction capability and delivery they do not have to supervise.",
    image: img.partnerPlansSite,
    imageAlt: alt.partnerPlansSite,
    // Hold the drawing and the men over it, not the plot behind them.
    focus: "38% 60%",
  },
];

/* Six reasons, each on a photograph of the thing it claims. See
   `ReasonPanels` — closed, a panel is a slat about a seventh of its open
   width, so every `focus` below is chosen for that crop rather than the
   open one. */
const whyPartner: ReasonPanel[] = [
  {
    title: "50+ Years of Construction Experience",
    body: "Since 1973, across residential, commercial, industrial and institutional projects.",
    image: img.scaffoldWorker,
    imageAlt: alt.scaffoldWorker,
    // Centres him in the slat, and open leaves the brickwork on the left for
    // the copy to sit on rather than his legs.
    focus: "46% 50%",
  },
  {
    title: "In-House Construction Capability",
    body: "We build what we plan. Execution is not handed to a chain of subcontractors.",
    image: img.masonBrickwork,
    imageAlt: alt.masonBrickwork,
  },
  {
    title: "Residential Development Experience",
    body: "We understand what makes a residential development work for the families who buy into it.",
    image: img.residentialTowers,
    imageAlt: alt.residentialTowers,
    // Centred, the slat lands in the gap between the two blocks and reads as
    // an empty rectangle. Held here it takes the near tower's elevation
    // running up the frame.
    focus: "25% 50%",
  },
  {
    title: "Strong Local Understanding",
    body: "Five decades of building in Karnataka, and of knowing what each locality asks for.",
    image: img.bengaluruMarket,
    imageAlt: alt.bengaluruMarket,
  },
  {
    title: "Long-Term Approach",
    body: "We are not looking for one transaction. Our reputation since 1973 depends on the outcome.",
    image: img.bengaluruDusk,
    imageAlt: alt.bengaluruDusk,
  },
  {
    title: "Trust You Can Check",
    body: "Ask about the organisations and families we have already built for. That is the reference.",
    image: img.familyLivingRoom,
    imageAlt: alt.familyLivingRoom,
    // The three of them sit low in the frame. Held here the mother and the
    // child are in the slat, and open the group stands clear of the copy
    // rather than behind it.
    focus: "46% 62%",
  },
];

/* The four steps, each read on a screen of its own — the title split in two
   so it can be set above and below the photograph. See `ProcessReveal`. */
const steps: ProcessStep[] = [
  {
    step: "01",
    title: ["A", "conversation"],
    body: "Tell us about the land, the ownership and what you would like to see happen. No obligation, and no pressure.",
    image: img.familyConversation,
    imageAlt: alt.familyConversation,
  },
  {
    step: "02",
    title: ["Feasibility", "and planning"],
    body: "We look at what the site can realistically support — approvals, planning, cost and demand — and share what we find.",
    image: img.designReviewMeeting,
    imageAlt: alt.designReviewMeeting,
  },
  {
    step: "03",
    title: ["A clear", "arrangement"],
    body: "Terms, responsibilities and shares set out plainly, so every party understands the arrangement before anyone commits.",
    image: img.planAndAgreement,
    imageAlt: alt.planAndAgreement,
  },
  {
    step: "04",
    title: ["Execution", "and delivery"],
    body: "Construction handled in-house, with one point of responsibility from foundation to handover.",
    image: img.slabPour,
    imageAlt: alt.slabPour,
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
      {/* The same clasped hands that stand for joint ventures on the home
          page, at half the screen and cut out rather than inked — so the
          photograph behind shows through it. Scrolling opens the cut-out
          until the photograph is the whole screen, and the copy arrives on
          it. See `HandshakeReveal`. */}
      <HandshakeReveal
        eyebrow="Build More Together"
        title="Land is only the beginning."
        image={img.scaleModelHands}
        imageAlt={alt.scaleModelHands}
      >
        <p>
          Vijaya Enterprises brings more than five decades of construction and
          development experience to joint development opportunities. We work
          with landowners and partners to create viable residential and
          development projects.
        </p>
        <p>
          Bringing land, construction expertise and development capability
          together is what makes a joint venture work — and what makes it worth
          doing for everyone involved.
        </p>
      </HandshakeReveal>

      {/* --------------------------------------------------------- Partners */}
      {/* The heading sits in the page's column; the four partners run edge to
          edge beneath it, a photograph apiece. See `PartnerPanels`.

          The section carries no bottom padding at all: the band runs to the
          section's edge, so the process section that follows starts on the
          bottom of the photographs rather than after a strip of empty page.
          The heading above still gives the band its air. */}
      <Section tone="mist" size="lg" className="pb-0 sm:pb-0 lg:pb-0">
        <Container>
          <SectionHeading
            eyebrow="Ideal Partners"
            title="Who we work with."
            lead="If you hold land in or around Bengaluru and are considering what to do with it, there is a conversation worth having."
          />
        </Container>
        <div className="mt-12 lg:mt-14">
          <PartnerPanels items={idealPartners} />
        </div>
      </Section>

      {/* ------------------------------------------------------------ Process */}
      {/* White ground, and every word of it in navy — the brass the eyebrow
          and the step numbers usually carry on a light section is dropped
          here, so the four steps read as one blue block of plain speaking.
          The only brass left is the hairline before the eyebrow, which runs
          above every heading on the site.

          The heading is written out rather than passed to `SectionHeading`
          for that reason alone: `cn` is a plain join, so a colour handed to
          `Eyebrow` would race the one it sets itself.

          Under it the four steps are not four cards but four screens: the
          title of each opens away from the middle of its screen while the
          photograph behind it is cut out of the page and grown until it
          fills the frame. See `ProcessReveal`. */}
      <Section tone="white" size="lg">
        <Container>
          <div className="max-w-3xl">
            <Reveal>
              <p className="eyebrow-rule text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-navy-700">
                How It Works
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.08] text-navy-900">
                Clear from the first conversation.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-[1.0625rem] leading-[1.75] text-navy-700 sm:text-[1.125rem]">
                We would rather explain the process honestly than push an
                agreement. Most of our work has come from people who felt they
                were told the truth early.
              </p>
            </Reveal>
          </div>
        </Container>

        {/* Out of the page's column: the frames are sized against the window
            rather than the text measure, so the band runs full width and
            each step composes inside the screen it is read on. */}
        <ProcessReveal items={steps} />
      </Section>

      {/* ------------------------------------------------------------- Why us */}
      {/* Mist, not white: the process band above turned white, and two white
          sections in a row would run together into one long page with no
          seam between the steps and the reasons. */}
      <Section tone="mist" size="lg">
        <Container>
          <SectionHeading
            eyebrow="Why Vijaya"
            title="Why partner with Vijaya?"
            lead="A joint venture is a long relationship. It is worth knowing who you are entering it with."
          />
          {/* Six cards became one accordion: a panel a reason, open one at a
              time, the other five standing beside it named down their edges.
              See `ReasonPanels` for the movement. */}
          <div className="mt-14 lg:mt-16">
            <ReasonPanels items={whyPartner} />
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
