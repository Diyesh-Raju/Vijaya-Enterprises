import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { navLinks } from "@/lib/site";
import { img, alt } from "@/lib/images";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-hero flex-col justify-center overflow-hidden rounded-b-[2.5rem] bg-navy-950 sm:rounded-b-[4rem]">
      <Image
        src={img.cranesSkyline}
        alt={alt.cranesSkyline}
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy-950/90 via-navy-950/85 to-navy-950/95"
      />

      <Container className="relative py-32">
        <div className="max-w-2xl">
          <p className="eyebrow-rule text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400">
            404 — Page not found
          </p>
          <h1 className="text-balance-head mt-7 text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.04] text-white">
            This one isn&rsquo;t built yet.
          </h1>
          <p className="mt-7 text-[1.0625rem] leading-[1.75] text-navy-100/85">
            The page you were looking for has moved or never existed. Everything
            else is exactly where it should be.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/" variant="light" size="lg" withArrow>
              Back To Home
            </Button>
            <Button href="/contact" variant="ghost" size="lg">
              Contact Us
            </Button>
          </div>

          <nav aria-label="Site sections" className="mt-14 border-t border-white/15 pt-8">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-underline text-[0.9375rem] text-navy-100/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </section>
  );
}
