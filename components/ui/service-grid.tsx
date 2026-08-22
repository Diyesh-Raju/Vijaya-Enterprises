import Link from "next/link";
import type { ComponentType } from "react";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

/**
 * A row of illustrated tiles, each naming one thing we do and linking to it.
 *
 * The tiles stagger in and lift on hover, the way the layout this follows
 * does — but through `Reveal` and a CSS transform rather than a motion
 * library. The reference build reaches for framer-motion to stagger children
 * and spring a hover; `Reveal` already staggers by `delay`, and a lift is one
 * `transition-transform`. That is the whole animation budget of this section,
 * and it is not worth a runtime dependency (see `components/ui/reveal.tsx`).
 *
 * Icons arrive as components rather than image URLs so the set ships in the
 * bundle, inherits the site's palette, and needs no remote host allow-listed.
 */
export type Service = {
  name: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
};

export function ServiceGrid({
  eyebrow,
  title,
  subtitle,
  services,
  tone = "mist",
  id,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  services: readonly Service[];
  tone?: "white" | "mist";
  id?: string;
  className?: string;
}) {
  return (
    <Section tone={tone} size="lg" id={id} className={className}>
      <Container>
        <SectionHeading
          align="center"
          eyebrow={eyebrow}
          title={title}
          lead={subtitle}
        />

        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 lg:mt-20 lg:grid-cols-5">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <Reveal
                key={service.name}
                delay={index * 100}
                className="flex justify-center"
              >
                <Link
                  href={service.href}
                  className="group flex w-full flex-col items-center justify-start gap-4 rounded-[1.5rem] px-2 py-4 text-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5"
                >
                  <span className="flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
                    <Icon className="h-full w-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" />
                  </span>
                  <span
                    className={cn(
                      "text-[0.9375rem] font-semibold leading-snug text-navy-900",
                      "transition-colors duration-300 group-hover:text-rosegold-600",
                    )}
                  >
                    {service.name}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
