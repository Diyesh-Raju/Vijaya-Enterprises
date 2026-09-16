import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ContactForm } from "./contact-form";
import { CookieNotice } from "@/components/ui/cookie-notice";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import Image from "next/image";
import { Frame } from "@/components/ui/media";
import { img, alt } from "@/lib/images";
import { contact, offices } from "@/lib/site";
import {
  GmailMark,
  PhoneAppMark,
  WhatsAppMark,
} from "@/components/ui/app-marks";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to Vijaya Enterprises about a home, a construction contract or a joint venture. Building trust in Karnataka since 1973.",
  alternates: { canonical: "/contact" },
};

/* The mark on each card is the app the link actually opens — `tel:` the
   dialer, the WhatsApp deep link WhatsApp, `mailto:` whatever is set as the
   mail client, which for most of this site's visitors is Gmail. They are
   there to be recognised before the label is read, so they are the real app
   icons and not a set of matching line drawings. See `app-marks.tsx`. */
const channels = [
  {
    label: "Call us",
    value: contact.phoneDisplay,
    href: contact.phoneHref,
    // The other three lines, then the hours: a caller who gets no answer
    // on the first has the rest in front of them.
    hint: `Also ${contact.otherPhones.map((line) => line.display).join(", ")}. ${contact.hours}.`,
    mark: <PhoneAppMark aria-hidden="true" className="h-full w-full" />,
  },
  {
    label: "Mobile / WhatsApp",
    value: contact.mobileDisplay,
    href: contact.whatsappHref,
    hint: "Message us with your requirement",
    mark: <WhatsAppMark aria-hidden="true" className="h-full w-full" />,
  },
  {
    label: "Email",
    value: contact.emailDisplay,
    href: contact.emailHref,
    hint: "We reply the same working day",
    mark: <GmailMark aria-hidden="true" className="h-full w-full" />,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title={<>Let&rsquo;s talk about what you want to build.</>}
        lead="Whether it is a home for your family, a contract to construct, or land you are considering developing, start with a conversation."
        image={img.meetingHands}
        imageAlt={alt.meetingHands}
      />

      {/* --------------------------------------------------------- Channels */}
      {/* `blush` rather than white: asked for by name (2026-09-14). The cards
          on it stay white, which is what turns them from panels outlined on
          white into cards standing on a ground. */}
      <Section tone="blush" size="md">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {channels.map((channel, index) => (
              <Reveal
                key={channel.label}
                delay={index * 80}
                className="group relative rounded-[1.5rem] border border-line bg-white p-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-navy-200 hover:shadow-lift sm:rounded-[1.75rem]"
              >
                {/* On its own line above the label rather than beside it.
                    The mark is 44px and the label is 11px, so set side by
                    side the mark would dwarf the words it is introducing —
                    and a card has the room to let it be the first thing
                    read. */}
                <span className="block h-11 w-11">{channel.mark}</span>
                <p className="mt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
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
      {/* Set on a photograph rather than on mist, because the panel on the
          right is frosted glass and frost needs something behind it to be
          frosting. On a flat ground a blur has nothing to blur and the panel
          reads as a slightly grey box.

          `navy-deep` for the tone: it is what shows in the moment before the
          photograph decodes, and it is what the scrims are mixed towards, so
          nothing flashes light and then darkens. */}
      <Section
        tone="navy-deep"
        size="lg"
        id="enquiry"
        className="overflow-hidden"
      >
        <Image
          src={img.backdropCourtyard}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          className="-z-10 object-cover"
        />
        {/* Two layers, as the CTA bands use. The flat one is what guarantees
            the copy at left reads whatever the photograph is doing behind it;
            the directional one lifts off towards the right so the glass has
            some picture left to catch.

            Both sit well below the bands' strength. They used to sum to
            nine-tenths navy at the left edge and three quarters at the
            centre, and at that weight the courtyard was a tint, not a
            photograph. About three quarters navy behind the copy column is
            the floor: the paragraph text at 80% white sits over the sky at
            top left, the brightest thing in the picture. The right end is
            clear — 44px of blur is already destroying the picture, and
            scrimming it first as well leaves the panel with nothing behind
            it but grey. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy-950/20" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/72 via-navy-950/42 to-transparent"
        />
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow onNavy>Send An Enquiry</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] text-white">
                  Tell us what you want to build.
                </h2>
              </Reveal>
              {/* Straight from the heading to the addresses. The paragraph
                  and the three numbered steps that used to sit between them
                  were taken out, asked for by name (2026-09-16). */}
              <Reveal delay={160}>
                <div className="mt-10 space-y-6">
                  {offices.map((office) => (
                    <address key={office.label} className="not-italic">
                      {/* The dialer's own icon beside the label, asked for
                          by name (2026-09-16): the office block gives the
                          address and the way to walk there, and this is the
                          way to ring it without scrolling back up to the
                          cards. The same mark as the Call card above, for
                          the reason in the note over `channels`. */}
                      <span className="flex items-center gap-3">
                        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-white/55">
                          {office.label}
                        </span>
                        <a
                          href={contact.phoneHref}
                          aria-label={`Call the ${office.label.toLowerCase()} on ${contact.phoneDisplay}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/20 active:scale-95"
                        >
                          <PhoneAppMark aria-hidden="true" className="h-4 w-4" />
                        </a>
                      </span>
                      <span className="mt-3 block text-[1rem] leading-relaxed text-white/85">
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
                        className="link-underline mt-3 inline-block text-[0.875rem] font-semibold text-white"
                      >
                        Open in Google Maps
                      </a>
                    </address>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={120} variant="glass">
                {/* The glass. It arrives as `glass`, not the default rise,
                    because the default fades and a fade breaks frost: for as
                    long as any ancestor is below full opacity the blur has
                    nothing behind it to blur, so the panel came in as a clear
                    window and only frosted over once the fade had ended. The
                    `glass` variant rises without ever fading, and it is the
                    form inside that fades instead — see `reveal-glass-body`
                    in `globals.css`.

                    Three things make it read as frost rather than as a
                    tinted box, and all three have to be there:

                    `backdrop-blur-[44px]` — far past the `backdrop-blur-xl`
                    Tailwind tops out at, because the reference this was set
                    from is a soft frost and the ask was for a much stronger
                    one. At this radius the courtyard behind is unreadable as
                    a picture and survives only as tone, which is the point.

                    `backdrop-saturate-150` — a heavy blur averages colour
                    towards grey, so the warm light on the stone is put back
                    deliberately. Without it the panel goes cold and looks
                    like a dead spot on the photograph.

                    A white veil at 12%, not more. The veil is what makes it
                    glass rather than a window, but every point of it is a
                    point of the picture lost — the blur is doing the work,
                    and the veil is only there to catch the light. */}
                <div className="rounded-[1.75rem] border border-white/25 bg-white/[0.12] p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] backdrop-blur-[44px] backdrop-saturate-150 sm:rounded-[2.5rem] sm:p-10 lg:p-12">
                  <div className="reveal-glass-body">
                    <ContactForm />
                  </div>
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
