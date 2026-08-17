import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { navLinks, contact, offices, site } from "@/lib/site";

const buildLinks = [
  { href: "/residential", label: "Residential Development" },
  { href: "/commercial-contracts", label: "Commercial Contracts" },
  { href: "/commercial-contracts#industrial", label: "Industrial Construction" },
  { href: "/commercial-contracts#institutional", label: "Institutional Construction" },
  { href: "/joint-ventures", label: "Joint Ventures" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white pt-px">
      <div className="rounded-t-[2.5rem] bg-navy-950 text-white sm:rounded-t-[4rem]">
        <div className="container-page py-20 sm:py-24 lg:py-28">
          {/* Closing statement */}
          <Reveal className="max-w-3xl">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400">
              Since 1973
            </p>
            <h2 className="text-balance-head mt-6 text-[clamp(1.875rem,4vw,3.25rem)] leading-[1.1] text-white">
              Every Project. Every Customer.
              <br />
              Like Family.
            </h2>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/contact" variant="light" withArrow>
                Discuss Your Project
              </Button>
              <Button href={contact.phoneHref} variant="ghost">
                {contact.phoneDisplay}
              </Button>
            </div>
          </Reveal>

          <div className="mt-20 h-px w-full bg-white/10" />

          {/* Columns */}
          <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <Reveal className="lg:col-span-4">
              <Link
                href="/"
                aria-label="Vijaya Enterprises — home"
                className="inline-flex rounded-2xl text-white"
              >
                <Logo />
              </Link>
              <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-navy-100/65">
                A diversified construction and development company working across
                residential, commercial, industrial and institutional projects in
                Karnataka since {site.founded}.
              </p>
              <p className="mt-6 font-display text-[1.125rem] text-brass-300">
                {site.tagline}.
              </p>
            </Reveal>

            <Reveal delay={80} className="lg:col-span-3">
              <nav aria-label="What we build">
                <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-white/45">
                  What We Build
                </h3>
                <ul className="mt-6 space-y-3.5">
                  {buildLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="link-underline text-[0.9375rem] text-navy-100/80 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>

            <Reveal delay={160} className="lg:col-span-2">
              <nav aria-label="Company">
                <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-white/45">
                  Company
                </h3>
                <ul className="mt-6 space-y-3.5">
                  {[{ href: "/", label: "Home" }, ...navLinks, { href: "/contact", label: "Contact Us" }]
                    .filter(
                      (link, index, all) =>
                        all.findIndex((other) => other.href === link.href) === index,
                    )
                    .map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="link-underline text-[0.9375rem] text-navy-100/80 transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </nav>
            </Reveal>

            <Reveal delay={240} className="lg:col-span-3">
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-white/45">
                Talk To Us
              </h3>
              <ul className="mt-6 space-y-3.5 text-[0.9375rem] text-navy-100/80">
                <li>
                  <a href={contact.phoneHref} className="link-underline hover:text-white">
                    {contact.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={contact.emailHref} className="link-underline hover:text-white">
                    {contact.emailDisplay}
                  </a>
                </li>
                <li className="pt-2 text-navy-100/60">{contact.hours}</li>
              </ul>

              {offices.map((office) => (
                <address key={office.label} className="mt-8 not-italic">
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-white/45">
                    {office.label}
                  </span>
                  <span className="mt-3 block text-[0.9375rem] leading-relaxed text-navy-100/70">
                    {office.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </address>
              ))}
            </Reveal>
          </div>

          {/* Bottom bar */}
          <Reveal className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-[0.8125rem] text-navy-100/50 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {site.legalName}. {site.tagline}.
            </p>
            <p className="text-navy-100/40">
              Quality without compromise. Built on relationships.
            </p>
          </Reveal>
        </div>
      </div>
    </footer>
  );
}
