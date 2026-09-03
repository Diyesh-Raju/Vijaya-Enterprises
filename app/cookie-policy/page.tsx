import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "This site sets no cookies — none of its own, none from anyone else. One page explains what your browser does remember, and why that is all.",
  alternates: { canonical: "/cookie-policy" },
};

/**
 * The cookie policy, written for a site that sets no cookies.
 *
 * Like the privacy policy, every claim here is checked against the code
 * rather than a template: there is no analytics script, no ad pixel, no
 * third-party embed anywhere on the site, and the one thing the notice on
 * the contact page stores (`components/ui/cookie-notice.tsx`) is a
 * `localStorage` entry, not a cookie. If any of that changes, this page
 * changes in the same commit — the "If this ever changes" section below is
 * a promise to that effect.
 *
 * ⚠️ PLACEHOLDER REVIEW — have this reviewed alongside the privacy policy
 * before launch, and keep `UPDATED` in step with the substance.
 */
const UPDATED = "3 September 2026";

type PolicySection = {
  id: string;
  title: string;
  body: ReactNode;
};

const inlineLink =
  "font-medium text-navy-900 underline decoration-navy-900/30 underline-offset-4 transition-colors hover:decoration-navy-900";

const sections: readonly PolicySection[] = [
  {
    id: "what-a-cookie-is",
    title: "What a cookie is",
    body: (
      <p>
        A cookie is a small piece of text a website asks your browser to keep
        and hand back on later visits. It is how sites remember logins and
        baskets — and how advertising networks recognise you from one site to
        the next. Useful mechanism, widely overused.
      </p>
    ),
  },
  {
    id: "what-this-site-sets",
    title: "What this site sets",
    body: (
      <>
        <p>
          Nothing. As of the date above, no page on this site sets a cookie —
          not a first-party one of ours, not a third-party one on anyone
          else&rsquo;s behalf. There is no analytics script, no advertising
          pixel, and no embedded widget quietly bringing its own.
        </p>
        <p className="mt-4">
          You are welcome to check rather than take our word for it: your
          browser&rsquo;s privacy settings, or its developer tools, will show
          you every cookie a site holds. For this one, the list is empty.
        </p>
      </>
    ),
  },
  {
    id: "what-your-browser-remembers",
    title: "The one thing your browser remembers",
    body: (
      <>
        <p>
          On the{" "}
          <Link href="/contact" className={inlineLink}>
            contact page
          </Link>
          , a small note tells you what you have just read here. Dismiss it
          and your browser makes a note of that — in its own local storage,
          which is not a cookie: it stays on your device, it is never
          attached to anything you send, and it never reaches us or anyone
          else. Its only job is to make sure the note does not greet you
          twice.
        </p>
        <p className="mt-4">
          Clearing your browsing data clears it, and the note will simply
          introduce itself again.
        </p>
      </>
    ),
  },
  {
    id: "cookies-that-are-not-ours",
    title: "Cookies that are not ours",
    body: (
      <p>
        Where the site points elsewhere — WhatsApp for a message, Google Maps
        for directions, our profiles on social networks — you leave this site,
        and those services set cookies by their own policies, which are the
        ones to read there. Nothing on our pages lets them do it here.
      </p>
    ),
  },
  {
    id: "if-this-changes",
    title: "If this ever changes",
    body: (
      <p>
        If the site ever needs a cookie — a measurement tool, say, or a
        feature that cannot work without one — this page will name it, say
        what it is for and how long it lives, <em>before</em> it is set, and
        the date at the top will change. A policy that says
        &ldquo;nothing&rdquo; is only worth having if it stays true the day
        after you read it.
      </p>
    ),
  },
  {
    id: "questions",
    title: "Questions",
    body: (
      <p>
        Anything this page has not answered goes to{" "}
        <a href={contact.emailHref} className={inlineLink}>
          {contact.emailDisplay}
        </a>{" "}
        — and how we handle what you <em>choose</em> to send us is in the{" "}
        <Link href="/privacy-policy" className={inlineLink}>
          privacy policy
        </Link>
        , this page&rsquo;s companion.
      </p>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    // The privacy policy's construction, one column shorter in spirit: no
    // hero, so the section carries the clearance and the header is frosted
    // from the first pixel — this route is in `LIGHT_FROM_TOP`.
    <Section tone="mist" size="lg" className="pt-32 sm:pt-40">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="flex items-center gap-2.5 text-[0.875rem] font-semibold uppercase tracking-[0.06em] text-navy-900/55">
                  <Link href="/" className="transition-colors hover:text-navy-900">
                    Home
                  </Link>
                  <span aria-hidden="true">&bull;</span>
                  <span className="text-navy-900 underline underline-offset-4">
                    Cookie Policy
                  </span>
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="text-balance-head mt-6 font-sans text-[clamp(2.5rem,4.6vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-navy-950">
                  A cookie policy with no cookies in it.
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-6 text-[0.9375rem] text-slate-muted">
                  Last updated {UPDATED}
                </p>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-[1.25rem] leading-[1.65] text-navy-900 sm:text-[1.375rem]">
                This site sets no cookies — none of its own, none from anyone
                else. This page exists so you can hold us to that.
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
