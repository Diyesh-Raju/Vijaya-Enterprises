import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { Counter } from "@/components/ui/counter";
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

const story = [
  {
    marker: "1973",
    title: "The beginning of our journey.",
    body: "Vijaya Enterprises begins work as a construction company, with a simple commitment: build properly, and stand behind the work.",
  },
  {
    marker: "Growing",
    title: "Years of construction experience.",
    body: "Growing through projects, partnerships and relationships — and through every change in materials, methods and technology the industry went through.",
  },
  {
    marker: "Expanding",
    title: "Multiple sectors.",
    body: "Residential. Commercial. Industrial. Institutional. Work for individuals and families, and for organisations across defence, banking, education, healthcare and the public sector.",
  },
  {
    marker: "Today",
    title: "The next generation of spaces.",
    body: "Building for a new generation of customers with the same values that built our reputation in the first place.",
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
      <PageHero
        eyebrow="Our Legacy"
        title="Building trust since 1973."
        lead="For more than five decades, Vijaya Enterprises has been part of the construction landscape. What began in 1973 has grown into a diversified construction and development company working across residential, commercial, industrial and institutional projects."
        image={img.siteTeam}
        imageAlt={alt.siteTeam}
      />

      {/* ---------------------------------------------------------- Opening */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow>Who We Build For</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
                  Individuals, families, businesses, institutions.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-slate-body">
                  <p>
                    We have built for individuals, families, businesses,
                    institutions and large organisations. Our experience ranges from
                    homes and apartments to industrial facilities, educational
                    buildings, hospitals, commercial spaces and specialised
                    infrastructure.
                  </p>
                  <p>
                    Unlike many developers that specialise in a single segment, we
                    have delivered projects for homeowners, industries, government
                    organisations, educational institutions, hospitals, banks and
                    public sector organisations. That breadth is one of the things
                    we are most confident about.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={120}>
                <div className="rounded-[2rem] border border-line bg-mist p-8 sm:p-10">
                  <dl className="space-y-8">
                    <div>
                      <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
                        Years of experience
                      </dt>
                      <dd className="mt-3 font-display text-[3rem] leading-none text-navy-900">
                        <Counter to={50} suffix="+" />
                      </dd>
                    </div>
                    <div className="h-px w-full bg-line-strong" />
                    <div>
                      <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
                        Building since
                      </dt>
                      <dd className="mt-3 font-display text-[3rem] leading-none text-navy-900">
                        1973
                      </dd>
                    </div>
                    <div className="h-px w-full bg-line-strong" />
                    <div>
                      <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
                        Construction verticals
                      </dt>
                      <dd className="mt-3 font-display text-[1.25rem] leading-snug text-navy-900">
                        Residential · Commercial · Industrial · Institutional
                      </dd>
                    </div>
                  </dl>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Story */}
      <Section tone="mist" size="lg">
        <Container>
          <SectionHeading
            eyebrow="The Vijaya Story"
            title="Five decades, in four chapters."
          />

          <ol className="mt-14 lg:mt-20">
            {story.map((chapter, index) => (
              <Reveal
                key={chapter.marker}
                as="li"
                delay={index * 70}
                className="group grid gap-5 border-t border-line-strong py-10 last:border-b sm:grid-cols-12 sm:gap-8 sm:py-12"
              >
                <div className="sm:col-span-3">
                  <span className="font-display text-[1.75rem] leading-none text-brass-600 sm:text-[2rem]">
                    {chapter.marker}
                  </span>
                </div>
                <div className="sm:col-span-9">
                  <h3 className="font-display text-[1.5rem] leading-snug text-navy-900 sm:text-[1.875rem]">
                    {chapter.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-[1rem] leading-[1.8] text-slate-body">
                    {chapter.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ------------------------------------------- Experience & confidence */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="order-2 lg:order-1 lg:col-span-6">
              <Reveal>
                <Frame
                  src={img.blueprintCraft}
                  alt={alt.blueprintCraft}
                  ratio="landscape"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  rounded="rounded-[2rem] sm:rounded-[3rem]"
                />
              </Reveal>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-6">
              <Reveal>
                <Eyebrow>Experience Builds Confidence</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
                  Experience matters when you choose a partner.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-slate-body">
                  <p>
                    Over five decades, Vijaya Enterprises has worked across
                    different project types, budgets, industries and requirements.
                  </p>
                  <p className="font-display text-[1.375rem] leading-snug text-navy-900 sm:text-[1.5rem]">
                    That experience has taught us something simple: every project
                    matters, and every customer matters.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------------- Philosophy */}
      <section className="relative isolate overflow-hidden bg-navy-950">
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
                Our Philosophy
              </Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-balance-head mt-7 text-[clamp(2rem,5vw,3.75rem)] leading-[1.06] text-white">
                Every Project. Every Customer. Like Family.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-8 text-[1.0625rem] leading-[1.8] text-navy-100/85">
                We believe construction should be handled with the same care we
                would expect when building something for our own family. That means
                understanding the requirement, maintaining quality, being
                responsible with resources and delivering value.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-8 text-[1.0625rem] leading-[1.8] text-navy-100/85">
                Customers are not transactions. They are families placing their
                life&rsquo;s savings and dreams in our hands.
              </p>
            </Reveal>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:mt-20 sm:grid-cols-2 sm:gap-5">
            <Reveal className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 text-center sm:p-10">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-brass-400">
                Our Vision
              </p>
              <p className="mt-5 font-display text-[1.5rem] leading-snug text-white sm:text-[1.75rem]">
                Building trust for generations.
              </p>
            </Reveal>
            <Reveal
              delay={90}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 text-center sm:p-10"
            >
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-brass-400">
                Our Mission
              </p>
              <p className="mt-5 font-display text-[1.5rem] leading-snug text-white sm:text-[1.75rem]">
                Building trust through quality construction.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Values */}
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

        <div className="mt-16 border-y border-white/10 py-8 sm:mt-20">
          <Marquee items={sectors} onNavy />
        </div>
      </Section>

      <CtaBand
        eyebrow="Since 1973"
        title="Fifty years of trust, and counting."
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
