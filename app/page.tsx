import Image from "next/image";
import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/home-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { ProofList } from "@/components/sections/proof-list";
import { VerticalCard, type Vertical } from "@/components/sections/vertical-card";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { VideoBackdrop } from "@/components/ui/video-backdrop";
import { img, alt, video } from "@/lib/images";
import { associatedOrganisations, sectors } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vijaya Enterprises — Building Trust Since 1973",
  description:
    "A diversified construction and development company since 1973. Residential, commercial, industrial and institutional projects across Karnataka, built with experience, care and quality.",
  alternates: { canonical: "/" },
};

const verticals: Vertical[] = [
  {
    href: "/residential",
    title: "Residential Development",
    body: "Homes built for families, with quality and value at the heart of every project. Apartments, villas, residential developments and other housing projects.",
    image: img.homeDusk,
    imageAlt: alt.homeDusk,
  },
  {
    href: "/commercial-contracts",
    title: "Commercial Construction",
    body: "Spaces designed and built to support businesses for years to come. Commercial buildings, offices, complexes and other business infrastructure.",
    image: img.officeInterior,
    imageAlt: alt.officeInterior,
  },
  {
    href: "/commercial-contracts#industrial",
    title: "Industrial Construction",
    body: "Strong foundations for industries that demand precision, reliability and performance. Industrial buildings, facilities, warehouses and specialised structures.",
    image: img.warehouseAisle,
    imageAlt: alt.warehouseAisle,
  },
  {
    href: "/commercial-contracts",
    title: "Private Contract Construction",
    body: "Your vision. Our experience. One trusted construction partner. We undertake private construction contracts for residential, commercial and industrial requirements.",
    image: img.rebarWorkers,
    imageAlt: alt.rebarWorkers,
  },
  {
    href: "/joint-ventures",
    title: "Joint Ventures",
    body: "Bringing land, construction expertise and development capability together. We work with landowners and partners to create viable residential and development projects.",
    image: img.aerialLand,
    imageAlt: alt.aerialLand,
  },
];

const whyVijaya = [
  {
    title: "50+ Years of Experience",
    body: "Since 1973, through every change in materials, methods and customer expectations.",
  },
  {
    title: "Construction Expertise",
    body: "We understand construction from the ground up — not only from a drawing.",
  },
  {
    title: "Quality at a Fair Price",
    body: "Premium quality at a fair, reasonable price, with no compromise on workmanship or materials.",
  },
  {
    title: "In-House Capability",
    body: "Disciplined in-house execution keeps quality under our control at every stage.",
  },
  {
    title: "Projects of Every Scale",
    body: "From a single family home to large industrial and institutional facilities.",
  },
  {
    title: "One Trusted Partner",
    body: "Residential, commercial, industrial and institutional work, handled by one team.",
  },
  {
    title: "Built on Relationships",
    body: "Much of our work comes from families and organisations we have already built for.",
  },
];

export default function HomePage() {
  return (
    <>
      <HomeHero />

      {/* ---------------------------------------------------------- 50+ years */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow>50+ Years of Trust</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.08]">
                  We have been building more than structures.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-slate-body">
                  <p>
                    Since 1973, Vijaya Enterprises has been building relationships,
                    confidence and a reputation that has lasted for generations.
                    From homes for families to buildings for businesses, industries,
                    institutions and public-sector organisations, our experience
                    spans a wide range of construction requirements.
                  </p>
                  <p>
                    And we bring that experience to every project — large or small.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={240}>
                <blockquote className="mt-10 rounded-3xl border border-line bg-mist p-8 sm:p-10">
                  <p className="font-display text-[1.375rem] leading-snug text-navy-900 sm:text-[1.625rem]">
                    “Our greatest strength is simple: we understand construction
                    from the ground up.”
                  </p>
                </blockquote>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <Frame
                  src={img.blueprintCraft}
                  alt={alt.blueprintCraft}
                  ratio="tall"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  rounded="rounded-[2rem] sm:rounded-[3rem]"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------- The verticals */}
      <Section tone="mist" size="lg" id="what-we-build">
        <Container>
          <SectionHeading
            eyebrow="What We Build"
            title="One Construction Partner. Many Possibilities."
            lead="Vijaya Enterprises is a diversified construction and development company — not only a residential developer. Whatever the sector, the standard is the same."
          />

          <div className="mt-16 grid gap-10 sm:grid-cols-2 sm:gap-x-8 lg:mt-20 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16">
            {verticals.map((vertical, index) => (
              <VerticalCard
                key={vertical.title}
                vertical={vertical}
                index={index}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ))}

            {/* Closing tile keeps the 3-column grid visually complete */}
            <Reveal delay={180} className="flex">
              <div className="flex w-full flex-col justify-between rounded-[1.75rem] border border-line bg-white p-9 sm:rounded-[2rem] sm:p-10">
                <div>
                  <Eyebrow>Not sure where you fit?</Eyebrow>
                  <p className="mt-6 font-display text-[1.5rem] leading-snug text-navy-900 sm:text-[1.75rem]">
                    Tell us what you want to build. We&rsquo;ll help you understand
                    what it takes to build it.
                  </p>
                </div>
                <div className="mt-10">
                  <Button href="/contact" withArrow>
                    Discuss Your Project
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------- Why Vijaya */}
      <Section tone="navy" size="lg">
        <Container>
          <SectionHeading
            eyebrow="Why Vijaya"
            title="Why do people choose Vijaya?"
            lead="Because five decades of experience gives us something no new brand can build overnight: perspective."
            onNavy
          />
          <div className="mt-14 lg:mt-16">
            <ProofList items={whyVijaya} onNavy columns={3} />
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------- Sectors & organisations */}
      <Section tone="white" size="lg">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow>Proof, Not Claims</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
                  Built across industries. Trusted across generations.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-7 text-[1.0625rem] leading-[1.8] text-slate-body">
                  Our experience extends far beyond residential construction. Over
                  the years, Vijaya Enterprises has worked on projects associated
                  with organisations and institutions across defence and aerospace,
                  banking and finance, education, healthcare, industrial and
                  manufacturing, government and public sector, commercial,
                  residential and hospitality.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-9">
                  <Button href="/our-legacy" variant="outline" withArrow>
                    See Our Legacy
                  </Button>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={120}>
                {/* Two independent columns, the right one dropped, so the
                    stagger reads as intentional and leaves no dead space. */}
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-4 sm:gap-5">
                    <Frame
                      src={img.industrialEngineer}
                      alt={alt.industrialEngineer}
                      ratio="tall"
                      sizes="(max-width: 1024px) 45vw, 28vw"
                      rounded="rounded-[1.5rem] sm:rounded-[2rem]"
                    />
                    <Frame
                      src={img.bankReception}
                      alt={alt.bankReception}
                      ratio="landscape"
                      sizes="(max-width: 1024px) 45vw, 28vw"
                      rounded="rounded-[1.5rem] sm:rounded-[2rem]"
                    />
                  </div>
                  <div className="mt-10 flex flex-col gap-4 sm:mt-16 sm:gap-5">
                    <Frame
                      src={img.institutionHospital}
                      alt={alt.institutionHospital}
                      ratio="landscape"
                      sizes="(max-width: 1024px) 45vw, 28vw"
                      rounded="rounded-[1.5rem] sm:rounded-[2rem]"
                    />
                    <Frame
                      src={img.institutionCampus}
                      alt={alt.institutionCampus}
                      ratio="tall"
                      sizes="(max-width: 1024px) 45vw, 28vw"
                      rounded="rounded-[1.5rem] sm:rounded-[2rem]"
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>

        {/* Sector ticker */}
        <div className="mt-20 border-y border-line py-8 sm:mt-24">
          <Marquee items={sectors} />
        </div>

        <Container className="mt-16">
          <Reveal>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
              Selected organisations associated with our construction experience
            </p>
          </Reveal>
          <Reveal delay={80}>
            <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-3">
              {associatedOrganisations.map((organisation) => (
                <li
                  key={organisation}
                  className="rounded-full border border-line bg-mist px-5 py-2.5 text-[0.875rem] text-navy-800"
                >
                  {organisation}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 max-w-2xl text-[0.875rem] leading-relaxed text-slate-muted">
              Projects associated with these organisations reflect the range of our
              construction experience across sectors.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ------------------------------------------------------- Residential */}
      <Section tone="mist" size="lg">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="order-2 lg:order-1 lg:col-span-6">
              <Reveal>
                <Frame
                  src={img.interiorFamily}
                  alt={alt.interiorFamily}
                  ratio="wide"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  rounded="rounded-[2rem] sm:rounded-[3rem]"
                />
              </Reveal>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-6">
              <Reveal>
                <Eyebrow>Residential</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
                  Homes that feel like home.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-slate-body">
                  <p>
                    Buying a home is one of the biggest decisions a family makes.
                    That is why our residential developments focus on what matters
                    beyond the walls — quality, location, functionality, value and
                    peace of mind.
                  </p>
                  <p>
                    From thoughtfully planned apartments to larger residential
                    developments, we aim to create homes where families can live
                    comfortably and confidently.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-9">
                  <Button href="/residential" withArrow>
                    Explore Residential Projects
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------- Contract + JV */}
      <CtaBand
        eyebrow="Have a Project to Build?"
        title="Your project. Our experience."
        body={
          <>
            <p>
              Whether you are planning a private residence, commercial building,
              office, industrial facility, warehouse, institutional building,
              renovation or extension, Vijaya Enterprises can bring decades of
              construction experience to your project.
            </p>
            <p className="mt-4 font-display text-[1.25rem] text-white/90">
              Tell us what you want to build. We&rsquo;ll help you understand what
              it takes to build it.
            </p>
          </>
        }
        image={img.steelRebar}
        imageAlt={alt.steelRebar}
        primary={{ href: "/contact", label: "Discuss Your Project" }}
        secondary={{
          href: "/commercial-contracts",
          label: "What We Undertake",
        }}
      />

      <Section tone="white" size="md" className="pt-0">
        <Container>
          <div className="grid items-center gap-12 rounded-[2rem] border border-line bg-mist px-7 py-14 sm:rounded-[3rem] sm:px-14 sm:py-16 lg:grid-cols-12 lg:gap-16 lg:px-20">
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow>Joint Ventures</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(1.875rem,3.6vw,2.75rem)] leading-[1.1]">
                  Build more together.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-6 text-[1.0625rem] leading-[1.8] text-slate-body">
                  A successful joint venture needs more than land and capital. It
                  needs experience, planning, construction capability, market
                  understanding and trust. Vijaya Enterprises brings more than five
                  decades of construction and development experience to joint
                  development opportunities.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end">
              <Reveal delay={240}>
                <Button href="/joint-ventures" size="lg" withArrow>
                  Explore Joint Venture Opportunities
                </Button>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- Since 1973 */}
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
          className="absolute inset-0 bg-gradient-to-b from-navy-950/94 via-navy-950/88 to-navy-950/97"
        />

        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <Reveal>
              <Eyebrow onNavy>Since 1973</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.08] text-white">
                Five decades. Thousands of stories. One name to trust.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-navy-100/80">
                <p>
                  Vijaya Enterprises began its journey in 1973. Over the decades,
                  the construction industry has changed dramatically. Materials
                  have evolved. Technology has changed. Customer expectations have
                  changed.
                </p>
                <p className="font-display text-[1.375rem] leading-snug text-white sm:text-[1.625rem]">
                  But one thing has remained constant: our commitment to building
                  with integrity.
                </p>
                <p>
                  Today, we bring that experience to a new generation of customers
                  while retaining the values on which Vijaya Enterprises was built.
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-10">
                <Button href="/our-legacy" variant="light" size="lg" withArrow>
                  Read Our Legacy
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Closing */}
      <Section tone="white" size="lg">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <Eyebrow className="justify-center">Our Promise</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-balance-head mt-7 text-[clamp(2rem,5vw,3.75rem)] leading-[1.06]">
                We don&rsquo;t just build buildings.
                <br />
                We build trust.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-8 text-[1.0625rem] leading-[1.8] text-slate-body">
                A building can be completed in months. Trust takes decades. For more
                than 50 years, we have earned that trust by taking responsibility
                for the work we undertake and by building relationships that go
                beyond a project. When you build with Vijaya, you&rsquo;re not just
                choosing a contractor or developer. You&rsquo;re choosing experience
                you can rely on.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-11 flex flex-wrap justify-center gap-3">
                <Button href="/contact" size="lg" withArrow>
                  Talk To Us
                </Button>
                <Button href="/our-legacy" variant="outline" size="lg">
                  Our Legacy
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>

        {/* Quiet full-width image to close the page */}
        <Container className="mt-20 sm:mt-24">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2rem] sm:rounded-[3rem]">
              <Image
                src={img.cranesSkyline}
                alt={alt.cranesSkyline}
                sizes="(max-width: 1440px) 100vw, 1440px"
                placeholder="blur"
                className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[520px]"
              />
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
