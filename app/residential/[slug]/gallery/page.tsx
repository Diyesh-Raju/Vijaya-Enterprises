import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    alternates: { canonical: `/residential/${project.slug}/gallery` },
  };
}

/** Intentionally empty: this section is still being designed. */
export default async function GalleryPage({
  params,
}: PageProps<"/residential/[slug]/gallery">) {
  if (!projectBySlug((await params).slug)) notFound();

  // Matches a large section's vertical rhythm so the tabs above and the
  // footer below keep their spacing until this page is designed.
  return <section className="bg-white py-24 sm:py-32 lg:py-44" />;
}
