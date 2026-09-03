import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { contact, offices, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Vijaya Enterprises collects when you write to us, what we do with it, and what we never do. Plain answers, the way we build.",
  alternates: { canonical: "/privacy-policy" },
};

/**
 * The policy, kept true to the code rather than to a template.
 *
 * Every claim below is checked against what the site actually does:
 * the enquiry form's fields and delivery are in `app/contact/actions.ts`,
 * and the site sets no cookies and runs no analytics — if either of those
 * things changes, this page must change in the same commit.
 *
 * ⚠️ PLACEHOLDER REVIEW — like the contact details in `lib/site.ts` (which
 * this page reads), have this text reviewed by the company's lawyer before
 * launch, and update `UPDATED` whenever the substance changes.
 */
const UPDATED = "3 September 2026";

type PolicySection = {
  id: string;
  title: string;
  body: ReactNode;
};

/** Shared list styling — a quiet brass tick, not a heavy bullet. */
function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-[0.8125rem] h-px w-4 flex-none bg-brass-500"
          />
          <span className="text-[1.0625rem] leading-[1.75] text-slate-body">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

const sections: readonly PolicySection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {site.legalName} is a construction and development company working
          across Karnataka since {site.founded}, with its head office in
          Basavanagudi, Bengaluru. When this policy says &ldquo;we&rdquo;, it
          means {site.name}; when it says &ldquo;you&rdquo;, it means anyone
          reading this website or writing to us through it.
        </p>
        <p className="mt-4">
          We build homes and buildings, not mailing lists. This page exists so
          you know exactly what reaches us when you use the site — and it is a
          short page, because very little does.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>
          The only personal information this site collects is what you choose
          to send us through the{" "}
          <Link
            href="/contact"
            className="font-medium text-navy-900 underline decoration-navy-900/30 underline-offset-4 transition-colors hover:decoration-navy-900"
          >
            enquiry form
          </Link>
          :
        </p>
        <PolicyList
          items={[
            "Your name and email address, so we can reply.",
            "Your phone number, only if you give it — the field is optional.",
            "The kind of project you have in mind, and whatever you write in the message.",
          ]}
        />
        <p className="mt-4">
          If you call, email or message us on WhatsApp directly, we receive
          whatever those conversations contain, the same as any correspondence.
        </p>
        <p className="mt-4">
          Technically, our hosting infrastructure also sees your connection
          address (IP) when a page or form is served, as every website&rsquo;s
          does. We use it only in the moment, to limit repeated form
          submissions from one connection — it is not kept in any register of
          ours, and standard, short-lived server logs are handled by our
          hosting provider.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    body: (
      <>
        <p>An enquiry is used for exactly what you sent it for:</p>
        <PolicyList
          items={[
            "To reply to you, and to discuss the project or home you asked about.",
            "To keep the thread of that conversation if it continues — a joint venture or a home purchase can run for months, and we need to remember what was said.",
          ]}
        />
        <p className="mt-4">
          That is the whole list. We do not add you to a marketing list, send
          newsletters you did not ask for, or contact you about anything other
          than what you raised — if we ever want to, we will ask you first.
        </p>
      </>
    ),
  },
  {
    id: "who-we-share-it-with",
    title: "Who we share it with",
    body: (
      <>
        <p>
          We do not sell, rent or trade your information — to anyone, for
          anything. It is shared only as far as delivering it to us requires:
        </p>
        <PolicyList
          items={[
            "The email delivery service that carries your enquiry from the website to our inbox, the way a postal service carries a letter.",
            "The provider that hosts this website and serves its pages.",
            "Authorities, if the law requires it of us — and only then.",
          ]}
        />
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and tracking",
    body: (
      <>
        <p>
          This site sets no cookies. There is no analytics script, no
          advertising pixel, no tracker of any kind — nothing watching how you
          read it. That is not an oversight; it is how we chose to build it.
        </p>
        <p className="mt-4">
          The one thing your browser keeps for us is a note that you dismissed
          the cookie notice on the contact page — held in your browser&rsquo;s
          own storage, on your device, never sent to anyone. The{" "}
          <Link
            href="/cookie-policy"
            className="font-medium text-navy-900 underline decoration-navy-900/30 underline-offset-4 transition-colors hover:decoration-navy-900"
          >
            cookie policy
          </Link>{" "}
          is the full statement — and if any of this ever changes, both pages
          will say so plainly before it does.
        </p>
      </>
    ),
  },
  {
    id: "how-long-we-keep-it",
    title: "How long we keep it",
    body: (
      <p>
        An enquiry lives in our inbox for as long as the conversation it
        started — and if that conversation becomes a project, for as long as
        the project&rsquo;s records need to exist, including what tax and
        company law require us to hold. An enquiry that goes nowhere is simply
        old mail; write to us and we will delete it.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Under Indian law, including the Digital Personal Data Protection
          Act, 2023, you can ask us at any time:
        </p>
        <PolicyList
          items={[
            "What information of yours we hold.",
            "To correct it, if it is wrong.",
            "To delete it, where the law does not require us to keep it.",
            "To withdraw a consent you gave earlier.",
          ]}
        />
        <p className="mt-4">
          One email to{" "}
          <a
            href={contact.emailHref}
            className="font-medium text-navy-900 underline decoration-navy-900/30 underline-offset-4 transition-colors hover:decoration-navy-900"
          >
            {contact.emailDisplay}
          </a>{" "}
          does any of these. We answer it the way we answer everything — like
          family, without a form to fill in first.
        </p>
      </>
    ),
  },
  {
    id: "other-sites",
    title: "Links to other places",
    body: (
      <p>
        The site links out to services we do not run — WhatsApp, Google Maps,
        and our profiles on social networks. What happens there is governed by
        those services&rsquo; own privacy policies, not this one; from the
        moment you follow such a link, you are in their house.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        This website is meant for people planning homes and buildings, and is
        not directed at children. We do not knowingly collect information from
        anyone under 18 — if you believe a child has sent us theirs, tell us
        and we will delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If what we collect or how we use it changes, this page changes with
        it, and the date at the top changes too. We will not quietly widen
        anything — a policy you read once should stay the policy you agreed
        to, unless we have plainly said otherwise.
      </p>
    ),
  },
  {
    id: "reach-us",
    title: "How to reach us",
    body: (
      <>
        <p>Questions about this policy, or about your information, go to:</p>
        <address className="mt-4 not-italic">
          <p className="font-semibold text-navy-950">{site.legalName}</p>
          {offices[0].lines.slice(1).map((line) => (
            <p key={line} className="mt-1">
              {line}
            </p>
          ))}
          <p className="mt-3">
            <a
              href={contact.emailHref}
              className="font-medium text-navy-900 underline decoration-navy-900/30 underline-offset-4 transition-colors hover:decoration-navy-900"
            >
              {contact.emailDisplay}
            </a>
          </p>
          <p className="mt-1">
            <a
              href={contact.phoneHref}
              className="font-medium text-navy-900 underline decoration-navy-900/30 underline-offset-4 transition-colors hover:decoration-navy-900"
            >
              {contact.phoneDisplay}
            </a>
            <span className="text-slate-muted"> — {contact.hours}</span>
          </p>
        </address>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    // Same construction as the FAQ page: no hero, so the section carries the
    // clearance and the header goes solid from the first pixel — this route
    // is in `LIGHT_FROM_TOP` (see `site-header.tsx`).
    <Section tone="mist" size="lg" className="pt-32 sm:pt-40">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* The heading holds its own column, with the contents under it —
              a policy is the one page people arrive at looking for a single
              clause, so the way to each one stays on screen. */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="flex items-center gap-2.5 text-[0.875rem] font-semibold uppercase tracking-[0.06em] text-navy-900/55">
                  <Link href="/" className="transition-colors hover:text-navy-900">
                    Home
                  </Link>
                  <span aria-hidden="true">&bull;</span>
                  <span className="text-navy-900 underline underline-offset-4">
                    Privacy Policy
                  </span>
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="text-balance-head mt-6 font-sans text-[clamp(2.5rem,4.6vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-navy-950">
                  Private, like everything else we build.
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-6 text-[0.9375rem] text-slate-muted">
                  Last updated {UPDATED}
                </p>
              </Reveal>

              <Reveal delay={220} className="hidden lg:block">
                <nav aria-label="Policy contents" className="mt-10">
                  <ul className="space-y-2.5 border-l border-line-strong pl-6">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="text-[0.9375rem] text-slate-body transition-colors hover:text-navy-900"
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* The promise first, in one breath, before any clause. */}
            <Reveal>
              <p className="text-[1.25rem] leading-[1.65] text-navy-900 sm:text-[1.375rem]">
                We collect what you choose to send us, we use it to reply to
                you, and we sell it to no one. The rest of this page is that
                sentence, spelled out properly.
              </p>
            </Reveal>

            {sections.map((section) => (
              <Reveal key={section.id}>
                <section
                  id={section.id}
                  className="mt-12 border-t border-line-strong pt-10 first-of-type:mt-14"
                >
                  <h2 className="text-[1.375rem] leading-snug text-navy-950 sm:text-[1.5rem]">
                    {section.title}
                  </h2>
                  <div className="mt-4 text-[1.0625rem] leading-[1.75]">
                    {section.body}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
