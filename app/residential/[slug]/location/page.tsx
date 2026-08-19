import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectBySlug, projectParams } from "@/lib/projects";

export function generateStaticParams() {
  return projectParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/residential/[slug]/location">): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};

  return {
    title: `Location — ${project.name}`,
    alternates: { canonical: `/residential/${project.slug}/location` },
  };
}

/** Intentionally empty: this section is still being designed. */
export default async function LocationPage({
  params,
}: PageProps<"/residential/[slug]/location">) {
  if (!projectBySlug((await params).slug)) notFound();

  // Matches a large section's vertical rhythm so the tabs above and the
  // footer below keep their spacing until this page is designed.
  return <section className="bg-white py-24 sm:py-32 lg:py-44" />;
}
