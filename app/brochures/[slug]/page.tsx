import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrochureReader } from "@/components/sections/brochure-reader";
import { Container, Section, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ArrowLeftIcon, DownloadIcon } from "@/components/ui/line-icons";
import { brochureBySlug, brochureParams } from "@/lib/brochures";

export function generateStaticParams() {
  return brochureParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/brochures/[slug]">): Promise<Metadata> {
  const brochure = brochureBySlug((await params).slug);
  if (!brochure) return {};

  return {
    title: `${brochure.title} — Brochure`,
    description: `The printed brochure for ${brochure.title}, ${brochure.place} — all ${brochure.pages.length} pages, and the PDF to keep.`,
    alternates: { canonical: `/brochures/${brochure.slug}` },
  };
}

/**
 * One brochure, opened.
 *
 * The page is the book and nothing else: a way back, the title, the reader,
 * and the file itself for anyone who would rather have it than turn it. The
 * ground is the site's mist rather than white, so the pages — which are
 * mostly white — read as paper lying on something.
 */
export default async function BrochurePage({
  params,
}: PageProps<"/brochures/[slug]">) {
  const brochure = brochureBySlug((await params).slug);
  if (!brochure) notFound();

  return (
    <Section tone="mist" size="md">
      <Container>
        <Reveal>
          <Link href="/our-legacy#brochures" className="back-link">
            <span className="back-link__disc" aria-hidden="true">
              <ArrowLeftIcon className="h-[1.05rem] w-[1.05rem]" />
            </span>
            Back
          </Link>
        </Reveal>

        <div className="mt-10 max-w-2xl sm:mt-12">
          <Reveal>
            <Eyebrow>{brochure.volume}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08] text-navy-900">
              {brochure.title}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-3 text-[0.9375rem] uppercase tracking-[0.18em] text-slate-muted">
              {brochure.place}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-7 text-[1.0625rem] leading-[1.8] text-slate-body">
              {brochure.blurb}
            </p>
          </Reveal>
        </div>
      </Container>

      {/* The book breaks out of the page's column: a spread wants every inch
          of a laptop screen it can have, and the strip wants to run off both
          edges of a phone. */}
      <div className="mt-14 sm:mt-16">
        <BrochureReader brochure={brochure} />
      </div>

      <Container>
        <Reveal className="mt-14 flex justify-center sm:mt-16">
          <a
            href={brochure.pdf}
            download
            className="download-link"
          >
            <DownloadIcon className="h-[1.15rem] w-[1.15rem]" />
            Download the PDF
            <span className="download-link__size">{brochure.pdfSize}</span>
          </a>
        </Reveal>
      </Container>
    </Section>
  );
}
