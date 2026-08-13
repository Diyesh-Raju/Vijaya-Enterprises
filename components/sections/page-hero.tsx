import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Shared hero for every interior page: full-bleed photograph, navy grade,
 * copy anchored to the bottom-left, rounded off at the base so the page
 * below appears to slide underneath it.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  cta,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  image: StaticImageData;
  imageAlt: string;
  cta?: { href: string; label: string };
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-b-[2.5rem] bg-navy-950 sm:rounded-b-[4rem]">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/70 to-navy-950/95"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_80%,rgba(6,20,49,0.7),transparent_72%)]"
      />

      <div className="container-page relative flex min-h-[82svh] flex-col justify-end pb-16 pt-40 sm:pb-20 sm:pt-44 lg:min-h-[86svh]">
        <div className="max-w-4xl">
          <p
            className="eyebrow-rule animate-rise text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400"
            style={{ animationDelay: "100ms" }}
          >
            {eyebrow}
          </p>
          <h1
            className="text-balance-head animate-rise mt-7 text-[clamp(2.375rem,6.4vw,5rem)] leading-[1.02] text-white"
            style={{ animationDelay: "220ms" }}
          >
            {title}
          </h1>
          {lead && (
            <div
              className="animate-rise mt-7 max-w-2xl text-[1.0625rem] leading-[1.75] text-navy-100/85 sm:text-[1.125rem]"
              style={{ animationDelay: "340ms" }}
            >
              {lead}
            </div>
          )}
          {cta && (
            <div
              className="animate-rise mt-10"
              style={{ animationDelay: "460ms" }}
            >
              <Button href={cta.href} variant="light" size="lg" withArrow>
                {cta.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
