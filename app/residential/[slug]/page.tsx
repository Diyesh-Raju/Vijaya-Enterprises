import type { Metadata } from "next";
import Image from "next/image";
import { ImageReveal } from "@/components/ui/image-reveal";
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
                {/* The picture carries its own height here rather than
                    filling a frame, so the wrapper has to as well. */}
                <ImageReveal fill={false}>
                  <Image
                    src={img.haraVijayaConcept}
                    alt={alt.haraVijayaConcept}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-auto w-full"
                  />
                </ImageReveal>
              </div>
            </Reveal>

            <Reveal delay={90}>
              {/* One figure per bubble. The pill is drawn on the `div` rather
                  than on the `dt`, so the number and its label stay a single
                  definition pair for a screen reader. */}
              <dl className="grid grid-cols-2 gap-4 sm:gap-5 lg:pl-6">
                {project.conceptStats?.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-navy-600 bg-white px-5 py-7 text-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-navy-900 hover:shadow-lift sm:rounded-[2.5rem] sm:px-6 sm:py-9"
                  >
                    <dt className="whitespace-nowrap font-display text-[2.25rem] leading-none text-navy-900 sm:text-[2.75rem]">
                      {stat.count === undefined ? (
                        stat.value
                      ) : (
                        <Counter to={stat.count} decimals={stat.decimals} />
                      )}
                    </dt>
                    <dd className="mt-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-slate-muted sm:text-[0.8125rem]">
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

            {/* The picture is 3:2 and the frame is a circle, so `object-cover`
                alone threw away a third of the width. Two layers instead: a
                blurred, over-scaled copy fills the disc edge to edge, and the
                photograph itself sits on top at `object-contain` — so the whole
                frame is covered and none of the image is cropped away. */}
            <Reveal delay={90} className="flex justify-center lg:justify-end">
              <div className="border-rosegold relative h-[20rem] w-[20rem] shrink-0 self-center overflow-hidden rounded-full sm:h-[28rem] sm:w-[28rem] lg:h-[34rem] lg:w-[34rem]">
                <Image
                  src={img.haraVijayaVision}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 640px) 20rem, (max-width: 1024px) 28rem, 34rem"
                  className="scale-125 object-cover blur-2xl saturate-125"
                />
                <Image
                  src={img.haraVijayaVision}
                  alt={alt.haraVijayaVision}
                  fill
                  sizes="(max-width: 640px) 20rem, (max-width: 1024px) 28rem, 34rem"
                  className="object-contain"
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
