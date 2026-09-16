import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectBySlug, projectParams } from "@/lib/projects";
import { SiteBookingPage } from "../site-booking-page";

/**
 * The booking page for one project: `/site-booking/<slug>`.
 *
 * The same page as `/site-booking`, with the project already on the pass.
 * Every project that has a page of its own gets one of these, prerendered
 * from the same list, so a new project needs nothing added here.
 */
export function generateStaticParams() {
  return projectParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/site-booking/[slug]">): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};

  return {
    title: `Book a Site Visit, ${project.name}`,
    description: `Book a site visit to ${project.name} in ${project.locality}. Pick a day and a time of day, and we will meet you at the site.`,
    alternates: { canonical: `/site-booking/${project.slug}` },
  };
}

export default async function Page({ params }: PageProps<"/site-booking/[slug]">) {
  const project = projectBySlug((await params).slug);
  if (!project) notFound();

  return <SiteBookingPage project={project} />;
}
