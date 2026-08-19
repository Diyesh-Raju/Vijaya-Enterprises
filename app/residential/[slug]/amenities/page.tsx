import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/section";
import { PanelHeading } from "@/components/ui/panel-heading";
import { Reveal } from "@/components/ui/reveal";
import { Amenities } from "@/components/sections/amenities";
import { amenitiesBySlug, amenitiesIntroBySlug } from "@/lib/amenities";
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
    title: `Amenities — ${project.name}`,
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
    <Section tone="white" size="lg">
      <Container>
        <PanelHeading>Amenities</PanelHeading>

        {intro && (
          <Reveal>
            <p className="mt-8 max-w-3xl text-[1.0625rem] leading-relaxed text-slate-body sm:text-[1.125rem]">
              {intro}
            </p>
          </Reveal>
        )}

        <Reveal delay={90} className="mt-14 lg:mt-16">
          <Amenities groups={groups} />
        </Reveal>
      </Container>
    </Section>
  );
}
