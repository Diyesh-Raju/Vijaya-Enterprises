import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ContactForm } from "./contact-form";
import { CookieNotice } from "@/components/ui/cookie-notice";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { img, alt } from "@/lib/images";
import { contact, offices } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to Vijaya Enterprises about a home, a construction contract or a joint venture. Building trust in Karnataka since 1973.",
  alternates: { canonical: "/contact" },
};

const channels = [
  {
    label: "Call us",
    value: contact.phoneDisplay,
    href: contact.phoneHref,
    hint: contact.hours,
  },
  {
    label: "Mobile / WhatsApp",
    value: contact.mobileDisplay,
    href: contact.whatsappHref,
    hint: "Message us with your requirement",
  },
  {
    label: "Email",
    value: contact.emailDisplay,
    href: contact.emailHref,
    hint: "We reply the same working day",
  },
];

const nextSteps = [
  {
    step: "01",
    title: "We listen",
    body: "Tell us what you want to build, or what you are looking for in a home. No obligation.",
  },
  {
    step: "02",
    title: "We tell you what it takes",
    body: "An honest view of what is possible, what it involves and roughly what it costs.",
  },
  {
    step: "03",
    title: "We build it properly",
    body: "If it goes ahead, one team is responsible from planning through to handover.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title={<>Let&rsquo;s talk about what you want to build.</>}
        lead="Whether it is a home for your family, a contract to construct, or land you are considering developing — start with a conversation."
        image={img.meetingHands}
        imageAlt={alt.meetingHands}
      />

      {/* --------------------------------------------------------- Channels */}
      <Section tone="white" size="md">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {channels.map((channel, index) => (
              <Reveal
                key={channel.label}
                delay={index * 80}
                className="group relative rounded-[1.5rem] border border-line bg-white p-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-navy-200 hover:shadow-lift sm:rounded-[1.75rem]"
              >
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
                  {channel.label}
                </p>
                {/* `anywhere` so a long email address wraps inside the card
                    instead of pushing the page wider than the viewport. */}
                <p className="mt-5 font-display text-[1.25rem] leading-snug text-navy-900 [overflow-wrap:anywhere] sm:text-[1.375rem] lg:text-[1.5rem]">
                  <a
                    href={channel.href}
                    className="after:absolute after:inset-0 after:rounded-[1.75rem] after:content-['']"
                    {...(channel.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {channel.value}
                  </a>
                </p>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-slate-body">
                  {channel.hint}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Form */}
      <Section tone="mist" size="lg" id="enquiry">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow>Send An Enquiry</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(1.875rem,4vw,3rem)] leading-[1.08]">
                  Tell us what you want to build.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-6 text-[1.0625rem] leading-[1.8] text-slate-body">
                  We&rsquo;ll help you understand what it takes to build it. Share
                  as much or as little as you like — we will come back to you with
                  the right questions.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <ol className="mt-12 space-y-8">
                  {nextSteps.map((item) => (
                    <li key={item.step} className="flex gap-5">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 font-display text-[0.9375rem] tabular-nums text-brass-600"
                      >
                        {item.step}
                      </span>
                      <span>
                        <span className="block font-display text-[1.125rem] text-navy-900">
                          {item.title}
                        </span>
                        <span className="mt-2 block text-[0.9375rem] leading-relaxed text-slate-body">
                          {item.body}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Reveal>

              <Reveal delay={320}>
                <div className="mt-12 space-y-6">
                  {offices.map((office) => (
                    <address key={office.label} className="not-italic">
                      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
                        {office.label}
                      </span>
                      <span className="mt-3 block text-[1rem] leading-relaxed text-navy-800">
                        {office.lines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </span>
                      <a
                        href={office.mapHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline mt-3 inline-block text-[0.875rem] font-semibold text-navy-900"
                      >
                        Open in Google Maps
                      </a>
                    </address>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={120}>
                <div className="rounded-[1.75rem] border border-line bg-white p-7 sm:rounded-[2.5rem] sm:p-10 lg:p-12">
                  <ContactForm />
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Closing */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="Safe Hands"
                title="You are in safe hands."
                lead="Since 1973, families and organisations have trusted us with work that matters to them. We would like the chance to earn that from you too."
              />
            </div>
            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <Frame
                  src={img.bankReception}
                  alt={alt.bankReception}
                  ratio="wide"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  rounded="rounded-[2rem] sm:rounded-[3rem]"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* The cookie notice lives here and only here — the one page where a
          visitor hands us anything. It says there is nothing to accept; see
          the note on the component. */}
      <CookieNotice />
    </>
  );
}
