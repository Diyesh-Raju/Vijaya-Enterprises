import type { Metadata } from "next";
import { LegacyHero } from "@/components/sections/legacy-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { WhoWeBuildFor } from "@/components/sections/who-we-build-for";
import { Management } from "@/components/sections/management";
import { LegacyChapters, type Chapter } from "@/components/sections/legacy-chapters";
import { BrochureShelf } from "@/components/sections/brochure-shelf";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import Image from "next/image";
import { img, alt } from "@/lib/images";

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

      <Management />

      <WhoWeBuildFor />

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
      {/* The band the philosophy used to hold. It gives the row that carried
          the vision and the mission over to the two brochures Vijaya has
          printed. The anchor is what a reader comes back to from a book.

          The ground is one photograph, and the client's rule for it
          (2026-09-12) is that it is never zoomed and never cropped: the
          whole 16:9 frame is on the page or it is wrong. That rule, not the
          layout, is what sizes this band, and it is worth understanding
          before touching either.

          `object-contain` is what enforces it — the picture fits inside the
          section and stops, where `object-cover` would have filled the box by
          cutting the frame down. The consequence is that the section can no
          longer be any height it likes. At 16/9 of its own width the photo
          fills it exactly, edge to edge; any taller and the picture is
          width-limited and leaves ground showing above and below it.

          So the band is squeezed towards that height rather than given it:
          the paragraphs under the heading are gone, the heading is a size
          down from the page's other two, and the padding is the smallest
          that still reads as a band. What it cannot be squeezed past is the
          shelf — 716px at a laptop, and the brochures are to keep their size
          — which is why a 1440 laptop still runs about 50px over and shows a
          little ground at each edge. The gradient is heaviest exactly there,
          so those two edges read as part of the picture's own dusk rather
          than as bars. A phone, where the photo is 219px tall and the two
          books stacked are over a thousand, shows a lot of it: that is the
          cost of not cropping, and cropping is the thing that was ruled out.

          The video that used to run here is gone with it — a still is what
          the rule leaves room for. */}
      {/* The ground is rgb(33 36 54) — the mean of the photograph's own bottom
          row of pixels, its tarmac — and the picture is hung from the top of
          the band. Between them that is what makes the ground invisible: the
          only ground that can ever show is below the frame, it is the colour
          the frame ends on, and it is under the same overlay at that point, so
          there is no seam to find.

          Centring the picture instead puts half the ground above it, where the
          frame ends on a pale lavender sky and a flat field of it reads as a
          bar over the heading — on a phone, where the picture is 219px in a
          band of 1385, it read as two flat fields with a strip of photograph
          lost between them. Resample the bottom row if the picture is ever
          changed. */}
      <section
        id="brochures"
        className="relative isolate overflow-hidden bg-[rgb(33_36_54)] scroll-mt-[var(--header-h)]"
      >
        <Image
          src={img.airportDusk}
          alt={alt.airportDusk}
          fill
          // The photo is the width of the screen, and the file is 1600 wide,
          // so every screen past that gets the file whole and nothing is
          // gained by asking for more.
          sizes="100vw"
          className="object-contain object-top"
        />
        {/* A gradient, not a wash. The old band sat under a flat 90-97% navy
            because nothing under it had to be seen; this one has to stay a
            photograph, so it is heavy only where the type is and lets the
            middle — where the covers stand — through at a quarter.

            The top stop is set by measurement, not taste. It carries the two
            lines over the brightest part of the picture, and the eyebrow is
            the binding one: 11px of brass, so it wants 4.5:1. Sampling the
            composited ground behind each line at 1440 and taking the worst
            line-sized patch under it:

              top stop   eyebrow   heading
              0.66         3.7       6.7    eyebrow fails
              0.78         4.7       8.5    ← this one
              0.82         5.2       9.4    darker than it needs to be

            Anything under the covers is on the flat ground below the frame
            and measures 8.8:1 or better, so the middle stop is free to be as
            light as the picture wants. Re-measure if the picture, the stops
            or the type over them change. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(2_8_23/0.78)_0%,rgb(2_8_23/0.38)_26%,rgb(2_8_23/0.24)_54%,rgb(2_8_23/0.62)_100%)]"
        />

        <Container className="relative py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <Eyebrow onNavy className="justify-center">
                The Brochures
              </Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-balance-head mt-5 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.06] text-white">
                What we have built, cover to cover.
              </h2>
            </Reveal>
          </div>

          <BrochureShelf />
        </Container>
      </section>

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
