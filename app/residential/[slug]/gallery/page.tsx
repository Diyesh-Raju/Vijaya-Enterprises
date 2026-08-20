import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/section";
import { PanelHeading } from "@/components/ui/panel-heading";
import { Reveal } from "@/components/ui/reveal";
import { GalleryBackdrop } from "@/components/sections/gallery-backdrop";
import { GalleryGrid } from "@/components/sections/gallery-grid";
import { Faqs } from "@/components/sections/faqs";
import { galleryBySlug } from "@/lib/gallery";
import { faqsBySlug } from "@/lib/faqs";
import { projectBySlug, projectParams } from "@/lib/projects";

export function generateStaticParams() {
  return projectParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/residential/[slug]/gallery">): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};

  return {
    title: `Gallery — ${project.name}`,
    description: `Photographs and drawings of ${project.name}: the elevations, the amenities, the interiors and the plans.`,
    alternates: { canonical: `/residential/${project.slug}/gallery` },
  };
}

export default async function GalleryPage({
  params,
}: PageProps<"/residential/[slug]/gallery">) {
  const { slug } = await params;
  if (!projectBySlug(slug)) notFound();

  const sections = galleryBySlug[slug] ?? [];
  const faqs = faqsBySlug[slug] ?? [];

  // Nothing photographed yet for this project — keep the page's rhythm rather
  // than collapsing the tabs onto the footer.
  if (sections.length === 0) {
    return <section className="bg-white py-24 sm:py-32 lg:py-44" />;
  }

  return (
    // `isolate` keeps the backdrop's stacking context to this section, so it
    // cannot slip above the sticky tab strip overhead.
    <section className="relative isolate overflow-hidden py-24 sm:py-32 lg:py-40">
      <GalleryBackdrop />

      <Container>
        {sections.map((section, index) => (
          <div key={section.title} className={index === 0 ? "" : "mt-24 lg:mt-32"}>
            <PanelHeading>{section.title}</PanelHeading>
            <Reveal delay={60} className="mt-10 block lg:mt-12">
              <GalleryGrid section={section} />
            </Reveal>
          </div>
        ))}

        {faqs.length > 0 && (
          <div className="mt-28 lg:mt-36">
            <Faqs faqs={faqs} />
          </div>
        )}
      </Container>
    </section>
  );
}
