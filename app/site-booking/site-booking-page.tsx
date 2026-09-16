import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { CookieNotice } from "@/components/ui/cookie-notice";
import { Container, Section, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { img, alt } from "@/lib/images";
import { contact } from "@/lib/site";
import { projectsWithPages, type Project } from "@/lib/projects";
import { BookingForm } from "./booking-form";

/**
 * The Site Booking page, in both its shapes.
 *
 * `/site-booking` is the general one: the visitor chooses the project. Each
 * project with a page of its own also gets `/site-booking/<slug>`, which is
 * this same page with the project already written on the pass — that is
 * where the buttons and the prompt on a project's pages lead. One component
 * for both, so the two can never drift apart; what changes is the hero
 * photograph, the words, and whether step one is a choice or a fact.
 *
 * It is the contact page's sibling, not its twin. Same channels underneath
 * (see `lib/leads.ts`), a different page above them: the enquiry page is
 * white cards and a form; this one is a dark band holding a visit pass.
 */

const howItWorks = [
  {
    step: "01",
    title: "Pick a day and a window",
    body: "Choose the project, the day that suits you, and morning, afternoon or evening.",
  },
  {
    step: "02",
    title: "We call to confirm",
    body: "Someone from the project team calls you back the same working day to fix the exact time.",
  },
  {
    step: "03",
    title: "We meet you at the site",
    body: "You walk the project with someone who built it, and you ask everything you want to.",
  },
];

export function SiteBookingPage({ project }: { project?: Project & { slug: string } }) {
  return (
    <>
      <PageHero
        eyebrow="Site Booking"
        title={
          project ? (
            <>Walk through {project.name}.</>
          ) : (
            <>See it before you decide.</>
          )
        }
        lead={
          project
            ? `Book a visit to ${project.name} in ${project.locality}. Pick a day and a time of day, and we will meet you there.`
            : "A home is not chosen from a screen. Book a site visit to any of our projects — pick a day and a time, and we will meet you there."
        }
        image={project?.heroImage ?? img.residentialTowers}
        imageAlt={project?.heroAlt ?? alt.residentialTowers}
      />

      {/* ------------------------------------------------------ How it works */}
      <Section tone="white" size="md">
        <Container>
          {/* Three cards, and a line in each gap between them (2026-09-16),
              so the row reads as one sequence rather than three boxes. The
              line is a pseudo-element on every card after the first, drawn
              backwards into the gap before it: a hairline across the gap at
              half the card's height while the cards sit in a row, and one
              down the gap above it once they stack on a phone. Each is
              exactly the gap's length, so it touches both borders.

              It sits on the `<li>`, and the card's face is a child of it,
              because the face lifts on hover — a line drawn on the face
              would lift with it and come away from its neighbour, where the
              `<li>` never moves. The grid stretches the three to one height,
              so half of each is the same line across all of them. Brass,
              like the step numbers; and since the `<li>` is the reveal, the
              line arrives with the card it leads to. */}
          <ol className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {howItWorks.map((item, index) => (
              <Reveal
                key={item.step}
                as="li"
                delay={index * 80}
                className={cn(
                  "relative",
                  index > 0 &&
                    "before:absolute before:left-1/2 before:top-0 before:h-4 before:w-px before:-translate-y-full before:bg-brass-500 before:content-[''] " +
                      "sm:before:left-0 sm:before:top-1/2 sm:before:h-px sm:before:w-5 sm:before:-translate-x-full sm:before:translate-y-0",
                )}
              >
                <div className="h-full rounded-[1.5rem] border border-line bg-white p-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-navy-200 hover:shadow-lift sm:rounded-[1.75rem]">
                  <span className="font-display text-[0.9375rem] tabular-nums text-brass-600">
                    {item.step}
                  </span>
                  <span className="mt-5 block font-display text-[1.25rem] leading-snug text-navy-900">
                    {item.title}
                  </span>
                  <span className="mt-3 block text-[0.9375rem] leading-relaxed text-slate-body">
                    {item.body}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- The pass */}
      <Section tone="navy-deep" size="lg" id="book" className="overflow-hidden">
        {/* A pool of lighter navy behind the pass, and a faint grid over the
            band — the drawing-board the pass sits on. Both decorative. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(44,82,150,0.35),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:3rem_3rem]"
        />

        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <Eyebrow onNavy className="justify-center">
                Book Your Visit
              </Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-balance-head mt-6 text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] text-white">
                {project ? "Your pass for the day." : "Fill in the pass. We do the rest."}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-[1.0625rem] leading-[1.8] text-navy-100/80">
                Three short steps. Nothing is booked until we have spoken to
                you, so pick the day you would like and we will make it work.
              </p>
            </Reveal>
          </div>

          <Reveal delay={200} className="mt-14 lg:mt-16">
            <BookingForm
              project={
                project
                  ? {
                      name: project.name,
                      slug: project.slug,
                      locality: project.locality,
                      image: project.image,
                      imageAlt: project.imageAlt,
                    }
                  : undefined
              }
            />
          </Reveal>
        </Container>
      </Section>

      {/* -------------------------------------------------------------- Closing */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow>Prefer a conversation first?</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(1.875rem,4vw,3rem)] leading-[1.08]">
                  Ask us anything before you come.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-6 text-[1.0625rem] leading-[1.8] text-slate-body">
                  Pricing, layouts, possession, what is around the site — call
                  or message us and you will reach someone who can answer. Or
                  send an enquiry and we will come back to you the same working
                  day.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button href={contact.whatsappHref} size="lg" withArrow>
                    Message on WhatsApp
                  </Button>
                  <Button href="/contact#enquiry" variant="outline" size="lg">
                    Send an Enquiry
                  </Button>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
                  {project ? "More to see" : "Projects you can visit"}
                </p>
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {projectsWithPages
                    .filter((other) => other.slug !== project?.slug)
                    .map((other) => (
                      <li key={other.slug}>
                        <Link
                          href={`/site-booking/${other.slug}`}
                          className="group flex items-center justify-between gap-6 py-5 transition-colors duration-300 hover:text-navy-900"
                        >
                          <span>
                            <span className="block font-display text-[1.125rem] leading-snug text-navy-900">
                              {other.name}
                            </span>
                            <span className="mt-1 block text-[0.8125rem] text-slate-muted">
                              {other.locality} · {other.status}
                            </span>
                          </span>
                          <span className="shrink-0 text-[0.8125rem] font-semibold text-navy-900">
                            Book a visit
                            <span
                              aria-hidden="true"
                              className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
                            >
                              →
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  {project && (
                    <li>
                      <Link
                        href={`/residential/${project.slug}`}
                        className="group flex items-center justify-between gap-6 py-5"
                      >
                        <span>
                          <span className="block font-display text-[1.125rem] leading-snug text-navy-900">
                            Back to {project.name}
                          </span>
                          <span className="mt-1 block text-[0.8125rem] text-slate-muted">
                            Floor plans, amenities, location and gallery
                          </span>
                        </span>
                        <span className="shrink-0 text-[0.8125rem] font-semibold text-navy-900">
                          View project
                          <span
                            aria-hidden="true"
                            className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
                          >
                            →
                          </span>
                        </span>
                      </Link>
                    </li>
                  )}
                </ul>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* The one other page where a visitor hands us anything — so the notice
          appears here as it does on the contact page. */}
      <CookieNotice />
    </>
  );
}
