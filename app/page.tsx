import type { Metadata } from "next";
import { ScrollHero } from "@/components/sections/scroll-hero";
import { HomeHeroPhone } from "@/components/sections/home-hero-phone";
import { FindResidences } from "@/components/sections/find-residences";
import { FiftyYears } from "@/components/sections/fifty-years";
import { DestinationSlideshow } from "@/components/sections/destination-slideshow";
import { Testimonial } from "@/components/sections/testimonial";
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
import { PearlCard } from "@/components/ui/pearl-card";
import { VideoBackdrop } from "@/components/ui/video-backdrop";
import { img, alt, video } from "@/lib/images";

export const metadata: Metadata = {
  title: "Vijaya Enterprises, Building Trust Since 1973",
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
    href: "/civil-contracts",
  },
  {
    name: "Warehouses",
    icon: WarehouseIcon,
    href: "/civil-contracts#industrial",
  },
  { name: "Joint Ventures", icon: JointVentureIcon, href: "/joint-ventures" },
];

export default function HomePage() {
  return (
    <>
      {/* One hero, two shapes. The scroll-scrubbed walkthrough from 768px up;
          below it, a short band of photographs cycling under the bar. Each
          component hides itself at the other's widths and unmounts once the
          width is settled, so only one of them is ever really on the page. */}
      <ScrollHero />
      <HomeHeroPhone />

      {/* ----------------------------- 50 years of / Find a residence, and
          on a phone the other way round.

          The walkthrough leads with the fifty years and then offers the
          search. The phone hero is four photographs and no words, so
          leading with the fifty years there means the first thing under an
          unlabelled picture is a number; the search panel says what the
          site is for, and it goes first.

          `flex-col-reverse` rather than two orderings, so neither section
          is mounted twice — `FindResidences` carries state and would come
          up as two independent panels. Below `md` the wrapper is a reversed
          column and the pair swaps; from `md` up it is `display: block`,
          which is what a bare wrapper around two sections already was, and
          `flex-col-reverse` is inert inside it.

          The one cost is that this reverses the *picture*, not the markup:
          on a phone a screen reader still meets the fifty years first,
          because that is where it sits in the DOM. Two adjacent sections
          either way round both make sense read aloud, so this is the
          cheaper trade than duplicating the panel. */}
      <div className="flex flex-col-reverse desk:block">
        <FiftyYears />
        <FindResidences />
      </div>

      {/* ------------------------------------------------------- What we build */}
      <ServiceGrid
        id="what-we-build"
        eyebrow="What We Build"
        title="One Construction Partner. Many Possibilities."
        subtitle="Vijaya Enterprises is a diversified construction and development company, not only a residential developer. Whatever the sector, the standard is the same."
        services={buildTypes}
      />

      {/* --------------------------------------------------- Gooey slideshow */}
      <DestinationSlideshow />

      {/* ------------------------------------------------------- Residential */}
      <Section tone="white" size="lg">
        <Container>
          {/* Three blocks — the name, the picture, the argument — rather
              than a picture beside a column of copy.

              On a phone the picture goes between the heading and the text:
              the heading names the subject, the photograph shows it, and the
              paragraph follows. Stacked with the picture at the foot, as it
              was, the reader met two screens of type before seeing a single
              home.

              Everything wider is exactly as it was, and the spacing is what
              proves it. No row gap anywhere: the vertical rhythm is margins
              on the blocks themselves, so each width can have its own
              without a gap adding to it. From `lg` the three are placed by
              line — copy in columns 7-12 across two rows, the picture
              spanning both in 1-6 — which is the two-column split. Between
              `desk` and `lg` the page is still one column and `desk-stacked:order-*`
              puts the picture back at the foot, where that band has always
              had it. */}
          <div className="grid items-center lg:grid-cols-12 lg:gap-x-20">
            {/* The two halves come in from their own sides rather than both
                rising, which is what stops a split reading as one block that
                happened to be cut down the middle. Below 900px the variants
                fall back to the rise — see `globals.css`. */}
            <div className="desk-stacked:order-1 lg:col-span-6 lg:col-start-7 lg:row-start-1">
              <Reveal className="reveal-still" variant="right">
                <Eyebrow>Residential</Eyebrow>
              </Reveal>
              <Reveal className="reveal-still" variant="right" delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
                  Homes that feel like home.
                </h2>
              </Reveal>
            </div>

            {/* `mt-8` under the heading on a phone; the old `gap-14` again
                where it goes back to the foot; nothing at `lg`, where it
                moves into a column of its own. */}
            <div className="mt-8 desk-stacked:order-3 desk-stacked:mt-14 lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-center">
              <Reveal variant="left">
                <Frame
                  src={img.residentialLivingDusk}
                  alt={alt.residentialLivingDusk}
                  ratio="wide"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  rounded="rounded-[2rem] sm:rounded-[3rem]"
                />
              </Reveal>
            </div>

            <div className="desk-stacked:order-2 lg:col-span-6 lg:col-start-7 lg:row-start-2">
              <Reveal className="reveal-still" delay={160}>
                <div className="mt-7 text-[1.0625rem] leading-[1.8] text-slate-body">
                  {/* Two versions of the same argument, and only ever one of
                      them rendered. A phone gets it in a sentence and a half;
                      anything with room beside a photograph gets it in full.

                      The long pair is wrapped rather than sitting as two
                      siblings of the short one, because `space-y-5` is a
                      `> * + *` rule: a hidden first child would still hand
                      the first *visible* paragraph a top margin it does not
                      have today, and the wrapper keeps that arithmetic off
                      the wider layout entirely. */}
                  <div className="hidden space-y-5 desk:block">
                    <p>
                      Buying a home is one of the biggest decisions a family makes.
                      That is why our residential developments focus on what matters
                      beyond the walls, quality, location, functionality, value and
                      peace of mind.
                    </p>
                    <p>
                      From thoughtfully planned apartments to larger residential
                      developments, we aim to create homes where families can live
                      comfortably and confidently.
                    </p>
                  </div>
                  <p className="desk:hidden">
                    Buying a home is one of the biggest decisions a family makes.
                    Ours are planned around what matters beyond the walls, quality,
                    location, value and peace of mind.
                  </p>
                </div>
              </Reveal>
              <Reveal className="reveal-still" delay={240}>
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

      {/* ---------------------------------------------------------- Trusted by */}
      <TrustedBy />

      {/* ------------------------------------------------------- Testimonial */}
      <Testimonial />

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

      {/* ---------------------------------------- Contract + JV, side by side */}
      {/* The page's two closing offers: one label asking the question, and
          two pearl cards under it that are the links themselves.

          This was the phone's design and is now the laptop's as well. The
          laptop used to get two full-height panels — a heading, three or
          four sentences and a pair of buttons each — and the buttons made
          every panel read as a box that *held* an offer rather than as the
          offer itself. The cards say the same two things in a line apiece,
          and the whole of each one is the thing to press.

          Stacked, as on a phone, until there is room for the pair to stand
          side by side. From `lg` they take a column each, which keeps every
          card near the shape it was drawn at rather than stretching it into
          a bar the width of the page. */}
      <Section tone="white" size="sm">
        <Container>
          <Reveal>
            <Eyebrow>Have a Project to Build?</Eyebrow>
          </Reveal>

          <div className="mt-7 grid gap-4 lg:grid-cols-2 lg:gap-6">
            <Reveal delay={80}>
              <PearlCard
                href="/contact"
                title="Your project. Our experience."
                description="Homes, offices, warehouses, institutional work, and five decades of building behind it."
              />
            </Reveal>
            <Reveal delay={160}>
              <PearlCard
                href="/joint-ventures"
                title="Build more together."
                description="Land and capital are only the start. We bring the planning, the building and the record."
              />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
