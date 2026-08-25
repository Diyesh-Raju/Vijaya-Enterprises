import type { Metadata } from "next";
import Link from "next/link";
import { DisclosureList, type DisclosureItem } from "@/components/ui/disclosure-list";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the questions people ask before they build with us: what we build, where we work, how a project starts, and what our standard actually means.",
  alternates: { canonical: "/faq" },
};

/**
 * The questions, and answers that only say what the rest of the site already
 * says.
 *
 * That constraint is the point of this page rather than a limitation of it: an
 * FAQ is where a claim gets made casually and then has to be lived up to, so
 * every answer here is a restatement of copy from Residential, Commercial
 * Contracts, Joint Ventures, Our Legacy or Contact — with nothing added.
 *
 * ⚠️ Two answers depend on facts that are still placeholders elsewhere: the
 * hours in "How do I start" come from `contact` in `lib/site.ts`, and what
 * "available" means in the third answer depends on the project records in
 * `lib/projects.ts`. Both follow their source automatically; it is the source
 * that needs confirming before launch.
 */
const faqs: readonly DisclosureItem[] = [
  {
    title: "What does Vijaya Enterprises build?",
    body: "Residential, commercial, industrial and institutional work — apartments, villas and plotted developments, offices and commercial buildings, warehouses and factories, and institutional buildings. We also develop land jointly with the people who own it. It has been all of those since 1973, which is why the standard is one standard rather than one per sector.",
  },
  {
    title: "Where do you build?",
    body: "Karnataka, and Bengaluru in particular — every project on our books today is in and around the city. Five decades of building here is also five decades of knowing what each locality asks for.",
  },
  {
    title: "Do you have homes available right now?",
    body: "Availability moves. The Residential page lists our projects with each one's standing marked — ongoing, completed or sold out — so it is the honest answer at any given moment. Tell us what you are looking for and we will tell you plainly what is available and what is coming.",
  },
  {
    title: "How does a project start?",
    body: `Start with a conversation. Call, write or send the enquiry form and we listen first — what you want to build, or what you want in a home. Then we give you an honest view of what is possible, what it involves and roughly what it costs. If it goes ahead, one team is responsible from planning through to handover. We are reachable ${contact.hours.toLowerCase()}.`,
  },
  {
    title: "I own land. What is a joint venture, in practice?",
    body: "You bring the land; we bring the planning, the approvals, the construction capability and the delivery. We look at what the site can realistically support and share what we find, then the terms, responsibilities and shares are set out plainly so every party understands the arrangement before anyone commits. We would rather explain the process honestly than push an agreement.",
  },
  {
    title: "Are your homes planned to vastu?",
    body: "Yes. Orientation, entrances, kitchens, pooja rooms and master bedrooms are placed to vastu — without giving up the light, ventilation or usable area that make a plan work. Vastu is settled inside the layout rather than applied on top of it.",
  },
  {
    title: "What does your standard of quality actually mean?",
    body: "Specification, supervision and finish held to one standard, whatever the sector — materials and workmanship we would accept in a home built for our own family. We build what we plan: execution is not handed down a chain of subcontractors.",
  },
  {
    title: "Who have you built for?",
    body: "Bharat Electronics, HAL, ISRO, Indian Oil, Union Bank and Canara Bank are among the organisations that have put their construction in our hands, alongside the families who have bought homes from us since 1973. Ask us for the reference — that is what it is for.",
  },
];

/**
 * Search engines show an FAQ page's own answers in the result. The schema is
 * generated from the same array the page renders, so what Google is told and
 * what a visitor reads cannot drift apart.
 */
function FaqJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.title,
      acceptedAnswer: { "@type": "Answer", text: faq.body },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Our own copy, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function FaqPage() {
  return (
    <>
      {/* No hero above this, so the section carries the clearance the header
          would otherwise have had a photograph to sit on. The header knows to
          go solid here — see `LIGHT_FROM_TOP` in `site-header.tsx`. */}
      <Section tone="mist" size="lg" className="pt-32 sm:pt-40">
        <Container>
          {/* The heading holds its own column and stays put while the answers
              are worked through, which is what keeps a long list of questions
              from reading as a page with no subject. */}
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                {/* Where you are, said in one line — the page opens straight
                    onto the question list now, with no hero to place it. */}
                <Reveal>
                  <p className="flex items-center gap-2.5 text-[0.875rem] font-semibold uppercase tracking-[0.06em] text-navy-900/55">
                    <Link href="/" className="transition-colors hover:text-navy-900">
                      Home
                    </Link>
                    <span aria-hidden="true">&bull;</span>
                    <span className="text-navy-900 underline underline-offset-4">
                      FAQ
                    </span>
                  </p>
                </Reveal>
                <Reveal delay={80}>
                  {/* The page's own heading, and set the way the reference
                      sets it: the sans rather than the display serif, close
                      to seventy pixels, leading under one so three lines
                      stack as a block. */}
                  <h1 className="text-balance-head mt-6 font-sans text-[clamp(2.5rem,4.6vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-navy-950">
                    Frequently asked questions.
                  </h1>
                </Reveal>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Reveal>
                {/* Roomier rows than the same list carries inside a panel:
                    this one is the page, not a footnote to it. */}
                <DisclosureList
                  items={faqs}
                  marker="chevron"
                  initial={-1}
                  className="[--disclosure-row-py:1.25rem] sm:[--disclosure-row-py:1.5rem]"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <FaqJsonLd />
    </>
  );
}
