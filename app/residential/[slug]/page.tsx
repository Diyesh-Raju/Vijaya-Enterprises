import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/section";
import { PanelHeading } from "@/components/ui/panel-heading";
import { Reveal } from "@/components/ui/reveal";
import { Counter } from "@/components/ui/counter";
import { projectBySlug, projectParams } from "@/lib/projects";
import { img, alt } from "@/lib/images";

export function generateStaticParams() {
  return projectParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/residential/[slug]">): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};

  return {
    title: project.name,
    description: `${project.name} — ${project.projectType}, ${project.layout}, ${project.totalUnits} across ${project.devSize} in ${project.locality}.`,
    alternates: { canonical: `/residential/${project.slug}` },
  };
}

export default async function ProjectAboutPage({
  params,
}: PageProps<"/residential/[slug]">) {
  const project = projectBySlug((await params).slug);
  if (!project) notFound();

  return (
    <>
      {/* ------------------------------------------------------ The concept */}
      <Section tone="white" size="lg">
        <Container>
          <PanelHeading>The Concept</PanelHeading>

          <div className="mt-12 grid items-center gap-10 lg:mt-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
            <Reveal>
              <div className="border-rosegold overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
                <Image
                  src={img.haraVijayaConcept}
                  alt={alt.haraVijayaConcept}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-auto w-full"
                />
              </div>
            </Reveal>

            <Reveal delay={90}>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-12 lg:pl-6">
                {project.conceptStats?.map((stat) => (
                  <div key={stat.label}>
                    <dt className="whitespace-nowrap font-display text-[2.5rem] leading-none text-navy-900 sm:text-[3rem]">
                      {stat.count === undefined ? (
                        stat.value
                      ) : (
                        <Counter to={stat.count} decimals={stat.decimals} />
                      )}
                    </dt>
                    <dd className="mt-2 text-[0.8125rem] font-semibold uppercase tracking-[0.2em] text-slate-muted">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------------- Vision */}
      <Section tone="mist" size="lg">
        <Container>
          <PanelHeading>Vision</PanelHeading>

          <div className="mt-12 grid items-center gap-12 lg:mt-14 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <Reveal>
              <p className="text-[1.1875rem] leading-relaxed text-slate-body sm:text-[1.25rem]">
                To be South Bangalore&rsquo;s most trusted name in real estate,
                building on five decades of integrity and on-time delivery.
                Vijaya creates homes and spaces that blend modern design and
                technology with vastu and eco-conscious living. Premium quality
                at fair pricing — never one at the cost of the other. The measure
                of this vision remains the thousands of families who continue to
                stand by the Vijaya promise.
              </p>
            </Reveal>

            <Reveal delay={90} className="flex justify-center lg:justify-end">
              <div className="border-rosegold relative h-[20rem] w-[20rem] shrink-0 self-center overflow-hidden rounded-full sm:h-[28rem] sm:w-[28rem] lg:h-[34rem] lg:w-[34rem]">
                <Image
                  src={img.haraVijayaVision}
                  alt={alt.haraVijayaVision}
                  fill
                  sizes="(max-width: 640px) 20rem, (max-width: 1024px) 28rem, 34rem"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------------- Video box */}
      <Section tone="white" size="lg">
        <Container>
          <Reveal>
            <div className="border-rosegold flex aspect-video w-full items-center justify-center rounded-[2rem] bg-white sm:rounded-[3rem]">
              <span className="font-display text-[1.5rem] text-navy-900/60 sm:text-[2rem]">
                Video Box
              </span>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
