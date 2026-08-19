import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/section";
import { ProjectNav } from "@/components/sections/project-nav";
import { projectBySlug, projectParams } from "@/lib/projects";

export function generateStaticParams() {
  return projectParams();
}

/**
 * Shared chrome for a project: the hero photograph and the section tabs.
 *
 * Living in the layout means the hero is painted once and stays put as you
 * move between About, Floor Plans and the rest — only the panel below swaps.
 */
export default async function ProjectLayout({
  children,
  params,
}: LayoutProps<"/residential/[slug]">) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      {/* Same construction as PageHero: image, scrim, then the content in a
          positioned container. No negative z-index — that had the browser
          preloading one size of the photograph and painting another. */}
      <section className="relative isolate overflow-hidden bg-navy-950">
        {project.heroImage && (
          <Image
            src={project.heroImage}
            alt={project.heroAlt ?? ""}
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className="object-cover"
          />
        )}
        {/* Weighted to the foot of the frame, where the type sits. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/45 to-navy-950/20"
        />

        <Container className="relative flex min-h-[70svh] flex-col justify-end pb-16 pt-32 sm:min-h-[78svh] sm:pb-20">
          <div className="max-w-3xl">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-brass-300">
              {project.status} · {project.locality}
            </p>
            <h1 className="text-balance-head mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] text-white">
              {project.name}
            </h1>
            {project.projectType && (
              <p className="mt-4 text-[1.0625rem] text-navy-100/80">
                {project.projectType} · {project.layout}
              </p>
            )}
          </div>
        </Container>
      </section>

      <ProjectNav slug={slug} />

      {children}
    </>
  );
}
