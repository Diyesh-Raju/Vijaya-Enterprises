import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { FloorPlanGroup } from "@/components/sections/floor-plan-group";
import { floorPlansBySlug } from "@/lib/floor-plans";
import { projectBySlug, projectParams } from "@/lib/projects";

export function generateStaticParams() {
  return projectParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/residential/[slug]/floor-plans">): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};

  return {
    title: `Floor Plans — ${project.name}`,
    description: `Unit plans for ${project.name}: ${project.layout} layouts and penthouses, with facing and built-up area for each type.`,
    alternates: { canonical: `/residential/${project.slug}/floor-plans` },
  };
}

export default async function FloorPlansPage({
  params,
}: PageProps<"/residential/[slug]/floor-plans">) {
  const { slug } = await params;
  if (!projectBySlug(slug)) notFound();

  const groups = floorPlansBySlug[slug] ?? [];

  // Nothing drawn up yet for this project — keep the page's rhythm rather than
  // collapsing the tabs onto the footer.
  if (groups.length === 0) {
    return <section className="bg-white py-24 sm:py-32 lg:py-44" />;
  }

  return (
    <>
      {groups.map((group, index) => (
        <Section
          key={group.title}
          tone={index % 2 === 0 ? "white" : "mist"}
          size="lg"
        >
          <Container>
            <Reveal>
              <FloorPlanGroup group={group} />
            </Reveal>
          </Container>
        </Section>
      ))}
    </>
  );
}
