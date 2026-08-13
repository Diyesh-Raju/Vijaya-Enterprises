import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";

/**
 * Full-width call to action over a photograph. Used to close each page with
 * the relevant next step — the brief asks every message to end with one
 * clear call to action.
 */
export function CtaBand({
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  image: StaticImageData;
  imageAlt: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-navy-950 sm:rounded-[3rem]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 1440px) 100vw, 1440px"
            placeholder="blur"
            className="object-cover"
          />
          {/* Two layers: a flat base so busy photographs never eat the copy,
              plus a directional grade that keeps the image readable at right. */}
          <div aria-hidden="true" className="absolute inset-0 bg-navy-950/45" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-transparent"
          />

          <div className="relative px-7 py-16 sm:px-14 sm:py-20 lg:px-20 lg:py-28">
            <div className="max-w-2xl">
              <Reveal>
                <p className="eyebrow-rule text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400">
                  {eyebrow}
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-balance-head mt-6 text-[clamp(1.875rem,4.2vw,3.25rem)] leading-[1.08] text-white">
                  {title}
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-6 text-[1.0625rem] leading-[1.75] text-navy-100/90">
                  {body}
                </div>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button href={primary.href} variant="light" size="lg" withArrow>
                    {primary.label}
                  </Button>
                  {secondary && (
                    <Button href={secondary.href} variant="ghost" size="lg">
                      {secondary.label}
                    </Button>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
