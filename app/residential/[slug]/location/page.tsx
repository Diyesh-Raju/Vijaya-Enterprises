import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/section";
import { PanelHeading } from "@/components/ui/panel-heading";
import { Reveal } from "@/components/ui/reveal";
import { LocationMap } from "@/components/sections/location-map";
import { BookVisitButton } from "@/components/sections/book-visit-button";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { locationsBySlug } from "@/lib/locations";
import { projectBySlug, projectParams } from "@/lib/projects";

export function generateStaticParams() {
  return projectParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/residential/[slug]/location">): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};

  const locations = locationsBySlug[project.slug];

  return {
    title: `Location — ${project.name}`,
    description: locations
      ? `${project.name} is at ${locations.project.address}. See the project and our office on the map, and book a site visit.`
      : undefined,
    alternates: { canonical: `/residential/${project.slug}/location` },
  };
}

export default async function LocationPage({
  params,
}: PageProps<"/residential/[slug]/location">) {
  const { slug } = await params;
  if (!projectBySlug(slug)) notFound();

  const locations = locationsBySlug[slug];

  // Nothing mapped yet for this project — keep the page's rhythm rather than
  // collapsing the tabs onto the footer.
  if (!locations) {
    return <section className="bg-white py-24 sm:py-32 lg:py-44" />;
  }

  return (
    <Section tone="white" size="lg">
      <Container>
        <PanelHeading>Location</PanelHeading>

        <div className="mt-12 grid gap-16 lg:mt-14 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <LocationMap location={locations.project} />
          </Reveal>
          <Reveal delay={90}>
            <LocationMap location={locations.office} />
          </Reveal>
        </div>

        <Reveal delay={60} className="mx-auto mt-20 flex max-w-3xl flex-col items-center gap-6 lg:mt-24">
          <BookVisitButton />
          <ButtonWithIcon href="/contact">Contact Us</ButtonWithIcon>
        </Reveal>
      </Container>
    </Section>
  );
}
