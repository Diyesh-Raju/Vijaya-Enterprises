import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { HandshakeReveal } from "@/components/sections/handshake-reveal";
import {
  ProjectCarousel,
  type CarouselProject,
} from "@/components/sections/project-carousel";
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

/* The five projects in the carousel, in the order the client gave them
   (2026-09-12). The label under each is a description of the picture rather
   than a project name: only the second names itself — the name is on the
   building — and inventing names for the other four would put words on a real
   builder's page that nothing supports. Ask the client for them, and swap
   them in here; nothing else has to change. Three words is the ceiling, and
   the caption is one line at every width. */
const projects: CarouselProject[] = [
  {
    image: img.projectTudorCourt,
    alt: alt.projectTudorCourt,
    label: "Tudor-framed apartments",
  },
  {
    image: img.projectVijayaLuxo,
    alt: alt.projectVijayaLuxo,
    label: "Vijaya Luxo",
  },
  {
    image: img.projectStonePlinth,
    alt: alt.projectStonePlinth,
    label: "Stone-plinth apartments",
  },
  {
    image: img.projectTimberCorner,
    alt: alt.projectTimberCorner,
    label: "Timber-clad corner block",
  },
  {
    image: img.projectLawnTowers,
    alt: alt.projectLawnTowers,
    label: "Lawn-facing towers",
  },
];

/* Six reasons, each on a picture of the thing it claims. See
   `ReasonPanels` — closed, a panel is a slat about a sixth of its open
   width, so every `focus` below is chosen for that crop rather than the
   open one. */
const whyPartner: ReasonPanel[] = [
  {
    title: "50+ Years of Construction Experience",
    body: "Since 1973, across residential, commercial, industrial and institutional projects.",
    image: img.fiftyYearsLegacy,
    imageAlt: alt.fiftyYearsLegacy,
    imageClosed: img.fiftyYearsLegacySlat,
    // The one panel carrying a picture with type in it rather than a
    // photograph, and every line of that type has to survive. It used to be
    // handled by the asset: the banner was padded out onto its own cream to
    // roughly a square, so the crop that fills this panel only ever ate the
    // padding. The client reshaped it to 3:2 on 2026-09-12, which takes that
    // away — cropped to the panel, a third of the width goes and the tagline
    // beside the lockup is cut in half.
    //
    // So the panel shows it whole instead. `ground` is the mean of the file's
    // own four edges, which is what lets the strip under the picture read as
    // more of the banner's cream rather than as a panel behind it; resample it
    // if the banner is ever replaced again. See `whole` in `ReasonPanels`.
    whole: true,
    ground: "rgb(218 202 189)",
    focus: "50% 0%",
    // From `lg` the slat carries `imageClosed` and this hold is under it. It
    // is for the bar below `lg`, where holding the top would put a band of
    // sliced lettering across it: centred, the bar is the plate's own cream.
    focusClosed: "50% 50%",
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
    image: img.siteHandshakePlans,
    imageAlt: alt.siteHandshakePlans,
    // Open, the panel keeps the photograph's full width and two-thirds of
    // its height: held here the faces and the handshake are in the upper
    // half and the copy reads over the drawings. Closed, the slat is the
    // handshake itself.
    focus: "55% 45%",
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

      {/* --------------------------------------------------------- Projects */}
      {/* The heading sits in the page's column; the ring below it runs wider
          than the column and is clipped to the viewport instead.

          This replaced the four partner panels — landowners, families,
          property owners, development partners — on 2026-09-12, at the
          client's asking and against a reference page of their own. The
          panels named who a joint venture is *with*; the ring shows what one
          ends up as, which is the better argument to put after the handshake
          the section above opens on. `PartnerPanels` is still in the tree and
          takes its items as a prop, so nothing about it was lost.

          The section keeps its bottom padding, unlike the band it replaces:
          the arrows are the last thing in it and need air under them before
          the process section starts. */}
      <Section tone="mist" size="lg">
        <Container>
          <SectionHeading
            eyebrow="Our Projects"
            title="Completed projects"
            lead="Residential buildings Vijaya has designed and built in and around Bengaluru. Step through them with the arrows."
          />
        </Container>
        <div className="mt-12 lg:mt-16">
          <ProjectCarousel items={projects} />
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
    </>
  );
}
