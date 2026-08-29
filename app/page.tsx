import type { Metadata } from "next";
import { ScrollHero } from "@/components/sections/scroll-hero";
import { FindResidences } from "@/components/sections/find-residences";
import { FiftyYears } from "@/components/sections/fifty-years";
import { DestinationSlideshow } from "@/components/sections/destination-slideshow";
import { Testimonial } from "@/components/sections/testimonial";
import { ResidenceCarousel } from "@/components/sections/residence-carousel";
import { TrustedBy } from "@/components/sections/trusted-by";
import { ServiceGrid, type Service } from "@/components/ui/service-grid";
import {
  ApartmentBuildingIcon,
  CommercialBuildingIcon,
  JointVentureIcon,
  VillaIcon,
  WarehouseIcon,
} from "@/components/ui/build-icons";
import { Container, Section, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Frame } from "@/components/ui/media";
import { Button } from "@/components/ui/button";
import { VideoBackdrop } from "@/components/ui/video-backdrop";
import { img, alt, video } from "@/lib/images";

export const metadata: Metadata = {
  title: "Vijaya Enterprises — Building Trust Since 1973",
  description:
    "A diversified construction and development company since 1973. Residential, commercial, industrial and institutional projects across Karnataka, built with experience, care and quality.",
  alternates: { canonical: "/" },
};

/** The five things we build, in the order the grid reads them. */
const buildTypes: readonly Service[] = [
  {
    name: "Apartment Buildings",
    icon: ApartmentBuildingIcon,
    href: "/residential",
  },
  { name: "Villas", icon: VillaIcon, href: "/residential" },
  {
    name: "Commercial Buildings",
    icon: CommercialBuildingIcon,
    href: "/commercial-contracts",
  },
  {
    name: "Warehouses",
    icon: WarehouseIcon,
    href: "/commercial-contracts#industrial",
  },
  { name: "Joint Ventures", icon: JointVentureIcon, href: "/joint-ventures" },
];

export default function HomePage() {
  return (
    <>
      <ScrollHero />

      {/* ------------------------------------------------------ 50 years of */}
      <FiftyYears />

      {/* ------------------------------------------------- Find a residence */}
      <FindResidences />

      {/* ------------------------------------------------------- What we build */}
      <ServiceGrid
        id="what-we-build"
        eyebrow="What We Build"
        title="One Construction Partner. Many Possibilities."
        subtitle="Vijaya Enterprises is a diversified construction and development company — not only a residential developer. Whatever the sector, the standard is the same."
        services={buildTypes}
        pin
      />

      {/* --------------------------------------------------- Gooey slideshow */}
      <DestinationSlideshow />

      {/* ------------------------------------------------------- Residential */}
      <Section tone="white" size="lg">
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

      {/* -------------------------------------------------- Residence deck */}
      <ResidenceCarousel />

      {/* ---------------------------------------------------------- Trusted by */}
      <TrustedBy />

      {/* ------------------------------------------------------- Testimonial */}
      <Testimonial />

      {/* ---------------------------------------- Contract + JV, side by side */}
      {/* The page's two closing offers sit next to each other rather than
          stacked, as one matched pair: same radius, same padding, buttons
          pinned to a common baseline by `mt-auto`. Both are flat colour —
          no photograph, no texture — so the copy and the button carry the
          card. (The shared `CtaBand`, still used to close the other pages,
          is the photographic version of the left card.) */}
      <Section tone="white" size="sm">
        <Container>
          <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
            <Reveal className="h-full">
              <div className="flex h-full flex-col rounded-[2rem] bg-navy-950 p-8 sm:rounded-[2.5rem] sm:p-12 lg:p-14">
                <Eyebrow onNavy>Have a Project to Build?</Eyebrow>
                <h2 className="text-balance-head mt-6 text-[clamp(1.75rem,2.6vw,2.375rem)] leading-[1.1] text-white">
                  Your project. Our experience.
                </h2>
                <div className="mt-6 text-[1.0625rem] leading-[1.75] text-navy-100/90">
                  <p>
                    Whether you are planning a private residence, commercial
                    building, office, industrial facility, warehouse,
                    institutional building, renovation or extension, Vijaya
                    Enterprises can bring decades of construction experience to
                    your project.
                  </p>
                  <p className="mt-4 font-display text-[1.25rem] leading-snug text-white/90">
                    Tell us what you want to build. We&rsquo;ll help you
                    understand what it takes to build it.
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap gap-3 pt-10">
                  <Button href="/contact" variant="light" size="lg" withArrow>
                    Discuss Your Project
                  </Button>
                  <Button href="/commercial-contracts" variant="ghost" size="lg">
                    What We Undertake
                  </Button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120} className="h-full">
              <div className="flex h-full flex-col rounded-[2rem] border border-line bg-mist p-8 sm:rounded-[2.5rem] sm:p-12 lg:p-14">
                <Eyebrow>Joint Ventures</Eyebrow>
                <h2 className="text-balance-head mt-6 text-[clamp(1.75rem,2.6vw,2.375rem)] leading-[1.1]">
                  Build more together.
                </h2>
                <div className="mt-6 text-[1.0625rem] leading-[1.75] text-slate-body">
                  <p>
                    A successful joint venture needs more than land and capital.
                    It needs experience, planning, construction capability,
                    market understanding and trust.
                  </p>
                  <p className="mt-4 font-display text-[1.25rem] leading-snug text-navy-900">
                    Vijaya Enterprises brings more than five decades of
                    construction and development experience to joint development
                    opportunities.
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap gap-3 pt-10">
                  <Button href="/joint-ventures" size="lg" withArrow>
                    Explore Joint Ventures
                  </Button>
                </div>
              </div>
            </Reveal>
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
        {/* Navy, as it always was — but the grade the home hero uses over its
            own footage rather than the near-solid one that was here, which
            left the clip behind it invisible. Same colour, same character,
            with the sunrise actually coming through it. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/62 to-navy-950/92"
        />
        {/* And a pool of it under the copy, which runs down the left. The hero
            does the same for its lockup. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(80%_75%_at_16%_50%,rgba(6,20,49,0.82),transparent_72%)]"
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
    </>
  );
}
