import type { Metadata } from "next";
import { LegacyHero } from "@/components/sections/legacy-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { WhoWeBuildFor } from "@/components/sections/who-we-build-for";
import { Management } from "@/components/sections/management";
import { LegacyChapters, type Chapter } from "@/components/sections/legacy-chapters";
import { BrochureShelf } from "@/components/sections/brochure-shelf";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { Marquee } from "@/components/ui/marquee";
import { VideoBackdrop } from "@/components/ui/video-backdrop";
import { img, alt, video } from "@/lib/images";
import { associatedOrganisations, sectors } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Legacy",
  description:
    "Building trust since 1973. Five decades of residential, commercial, industrial and institutional construction in Karnataka — and the values that have not changed.",
  alternates: { canonical: "/our-legacy" },
};

/**
 * The four chapters, and the photograph each is told against.
 *
 * All four photographs were brought in for this section and appear nowhere
 * else on the site; nothing already in `lib/images.ts` was reused, because
 * everything already there has been on the site at some point.
 *
 * The pictures are an arc, and it opens out: a crane and two men against a
 * burning sky, then a welder on the steel at dusk, then the whole city lit
 * from the air, then one finished room with the light coming through it. The
 * first three are the work and the last is what it was for.
 *
 * SIX candidates were rejected at full size along the way, all of them for
 * carrying somebody else's name where a contact sheet showed nothing: a "KRA"
 * polo shirt, a Chinese contractor's board on a crane jib, a bank's mark on a
 * glass tower, "INFINITY" on two different hard hats, and the UB and
 * Kingfisher lettering on a Bengaluru skyline. Check the full-size file
 * before adding a fifth.
 */
const story: readonly Chapter[] = [
  {
    marker: "1973",
    title: "The beginning of our journey.",
    body: "Vijaya Enterprises begins work as a construction company, with a simple commitment: build properly, and stand behind the work.",
    image: img.storyCraneDawn,
    imageAlt: alt.storyCraneDawn,
  },
  {
    marker: "Growing",
    title: "Years of construction experience.",
    body: "Growing through projects, partnerships and relationships — and through every change in materials, methods and technology the industry went through.",
    image: img.storySteelWelder,
    imageAlt: alt.storySteelWelder,
  },
  {
    marker: "Expanding",
    title: "Multiple sectors.",
    body: "Residential. Commercial. Industrial. Institutional. Work for individuals and families, and for organisations across defence, banking, education, healthcare and the public sector.",
    image: img.storyCityNight,
    imageAlt: alt.storyCityNight,
  },
  {
    marker: "Today",
    title: "The next generation of spaces.",
    body: "Building for a new generation of customers with the same values that built our reputation in the first place.",
    image: img.storyLivingRoom,
    imageAlt: alt.storyLivingRoom,
  },
];

const values = [
  { title: "Trust", body: "The foundation of every relationship." },
  { title: "Quality", body: "Never compromise on workmanship or materials." },
  { title: "Integrity", body: "Be transparent, and keep our promises." },
  { title: "Care", body: "Treat customers, partners and employees like family." },
  { title: "Reliability", body: "Deliver consistently and stand behind our work." },
  { title: "Value", body: "Offer premium quality at a fair price." },
  { title: "Responsibility", body: "Own every stage from planning to handover." },
  {
    title: "Continuous Improvement",
    body: "Adopt better methods, technology and ideas.",
  },
  {
    title: "Legacy",
    body: "Protect and strengthen the reputation built since 1973.",
  },
];

export default function OurLegacyPage() {
  return (
    <>
      <LegacyHero />

      <WhoWeBuildFor />

      <Management />

      <LegacyChapters chapters={story} />

      {/* ------------------------------------------------------------ Values */}
      {/* Straight off the back of the story, and before the brochures. The
          four chapters are what Vijaya did; these are what it held to while
          doing it, which is the sentence the story has just finished making.
          The books then follow as the thing a reader can open and check it
          against — the claim, then the evidence.

          It is also the one light band in the run: the chapters, the
          brochures and the credibility band are all dark, so wherever this
          sits, two dark bands meet somewhere. Here the seam falls between
          the brochures and the credibility band, both of which are flat
          navy behind their content, rather than between two bands carrying
          photographs. */}
      <Section tone="white" size="lg">
        <Container>
          <SectionHeading
            eyebrow="Core Values"
            title="What has not changed since 1973."
            lead="Materials have evolved. Technology has changed. Customer expectations have changed. These have not."
          />

          <dl className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-3">
            {values.map((value, index) => (
              <Reveal
                key={value.title}
                delay={(index % 3) * 70}
                className="group rounded-[1.5rem] border border-line bg-white p-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-navy-200 hover:shadow-lift sm:rounded-[1.75rem]"
              >
                <dt className="font-display text-[1.375rem] leading-snug text-navy-900">
                  {value.title}
                </dt>
                <dd className="mt-3 text-[0.9375rem] leading-relaxed text-slate-body">
                  {value.body}
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>

      {/* --------------------------------------------------------- Brochures */}
      {/* The band the philosophy used to hold. It keeps its ground — the
          same footage under the same gradient — and gives the row that
          carried the vision and the mission over to the two brochures
          Vijaya has printed. The anchor is what a reader comes back to
          from a book. */}
      <section
        id="brochures"
        className="relative isolate overflow-hidden bg-navy-950 scroll-mt-[var(--header-h)]"
      >
        <VideoBackdrop
          poster={img.legacyPoster}
          posterAlt={alt.legacyPoster}
          srcDesktop={video.legacyDesktop}
          srcMobile={video.legacyMobile}
          kenBurns={false}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-navy-950/94 via-navy-950/90 to-navy-950/97"
        />

        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <Eyebrow onNavy className="justify-center">
                The Brochures
              </Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-balance-head mt-7 text-[clamp(2rem,5vw,3.75rem)] leading-[1.06] text-white">
                What we have built, cover to cover.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-8 text-[1.0625rem] leading-[1.8] text-navy-100/85">
                Two of our residential projects were printed as books — the
                master plan, the specifications, the floor plans unit by unit
                and the roads that reach them, set out page by page the way
                they went to press.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-8 text-[1.0625rem] leading-[1.8] text-navy-100/85">
                Both are here whole, with nothing left out. Open one and turn
                it a spread at a time, or take the PDF with you.
              </p>
            </Reveal>
          </div>

          <BrochureShelf />
        </Container>
      </section>

      {/* ------------------------------------------------------- Credibility */}
      <Section tone="navy" size="lg">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow onNavy>Institutional Credibility</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08] text-white">
                  Trusted across generations.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-7 text-[1.0625rem] leading-[1.8] text-navy-100/80">
                  Selected organisations associated with our construction
                  experience include Bharat Electronics Ltd., HAL, Indian Oil, Union
                  Bank, CSIR, BARC and National Aerospace Laboratories, alongside
                  educational institutions, hospitals, temples and private
                  industrial clients.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <p className="mt-6 text-[0.875rem] leading-relaxed text-navy-100/55">
                  Projects associated with these organisations reflect the range of
                  our construction experience across sectors.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <ul className="flex flex-wrap gap-2.5">
                  {associatedOrganisations.map((organisation) => (
                    <li
                      key={organisation}
                      className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[0.875rem] text-navy-100/85"
                    >
                      {organisation}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={200}>
                <Frame
                  src={img.institutionCampus}
                  alt={alt.institutionCampus}
                  ratio="wide"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  rounded="rounded-[1.75rem] sm:rounded-[2.5rem]"
                  className="mt-8"
                />
              </Reveal>
            </div>
          </div>
        </Container>

        <Reveal className="mt-16 border-y border-white/10 py-8 sm:mt-20">
          <Marquee items={sectors} onNavy />
        </Reveal>
      </Section>

      <CtaBand
        eyebrow="Since 1973"
        title="50+ years of trust, and counting."
        body={
          <p>
            If customers remember one thing about Vijaya Enterprises, we would like
            it to be this: trust. Quality, value, care and legacy are the reasons
            customers trust us. Trust is the reason they choose us.
          </p>
        }
        image={img.cityNight}
        imageAlt={alt.cityNight}
        primary={{ href: "/contact", label: "Talk To Us" }}
        secondary={{ href: "/residential", label: "Find Your Home" }}
      />
    </>
  );
}
