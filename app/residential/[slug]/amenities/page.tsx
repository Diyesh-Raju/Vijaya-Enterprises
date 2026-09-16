import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/section";
import { PanelHeading } from "@/components/ui/panel-heading";
import { Reveal } from "@/components/ui/reveal";
import { Amenities } from "@/components/sections/amenities";
import { amenitiesBySlug, amenitiesIntroBySlug } from "@/lib/amenities";
import { img } from "@/lib/images";
import { projectBySlug, projectParams } from "@/lib/projects";

export function generateStaticParams() {
  return projectParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/residential/[slug]/amenities">): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};

  return {
    title: `Amenities, ${project.name}`,
    description: amenitiesIntroBySlug[project.slug],
    alternates: { canonical: `/residential/${project.slug}/amenities` },
  };
}

export default async function AmenitiesPage({
  params,
}: PageProps<"/residential/[slug]/amenities">) {
  const { slug } = await params;
  if (!projectBySlug(slug)) notFound();

  const groups = amenitiesBySlug[slug] ?? [];
  const intro = amenitiesIntroBySlug[slug];

  // Nothing listed yet for this project — keep the page's rhythm rather than
  // collapsing the tabs onto the footer.
  if (groups.length === 0) {
    return <section className="bg-white py-24 sm:py-32 lg:py-44" />;
  }

  return (
    // The garden holds still and the tiles ride up over it.
    //
    // No `overflow-hidden` and no `background-attachment: fixed` anywhere in
    // here. The first would make this section a scroll container, which is
    // what a `sticky` child binds to — it would stop sticking. The second is
    // ignored outright on iOS. Instead the backdrop is an ordinary
    // `next/image` (AVIF/WebP, blurred while it loads, like every other
    // photograph on the site) inside a sticky screen-tall box, which is held
    // at the top of the window for as long as the section is passing it.
    //
    // `min-h-svh` is what keeps the box inside the section: sticky clamps to
    // its containing block, so as long as the section is at least a screen
    // tall the photograph can never spill past its foot. The grid is far
    // taller than that at every breakpoint; the floor is only insurance.
    <section className="relative isolate min-h-svh bg-navy-950 py-24 sm:py-32 lg:py-44">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="sticky top-0 h-svh">
          <Image
            src={img.amenitiesGarden}
            alt=""
            fill
            sizes="100vw"
            placeholder="blur"
            className="object-cover"
          />
          {/* Two layers, as on the CTA band. The flat base is light — the
              garden is the point, and the tiles are white, so it only has to
              settle the photograph, not bury it. The weight that the heading
              and the intro need is in the gradient instead, which is heavy
              over the top of the frame where they sit and lets the middle of
              the picture, where the tiles cover it anyway, come through.
              Tuned to this photograph: a darker one wants both taken back. */}
          <div className="absolute inset-0 bg-navy-950/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/50 via-navy-950/20 to-navy-950/45" />
        </div>
      </div>

      <Container className="relative">
        <PanelHeading onNavy>Amenities</PanelHeading>

        {intro && (
          <Reveal>
            <p className="mt-8 max-w-3xl text-[1.0625rem] leading-relaxed text-navy-100/90 sm:text-[1.125rem]">
              {intro}
            </p>
          </Reveal>
        )}

        <Reveal delay={90} className="mt-14 lg:mt-16">
          <Amenities groups={groups} />
        </Reveal>
      </Container>
    </section>
  );
}
