import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { navLinks, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * 404, set as the drawing that isn't in the set.
 *
 * A missing page is the one moment the site has nothing to show, so it shows
 * the thing it is instead: a drawing office. The sheet is the site's deepest
 * navy under a drafting grid, the numerals draft themselves in brass line
 * work before taking a wash of tone, a dimension line is measured out under
 * them, and the title block bottom-right records the sheet as NOT BUILT.
 * All of it is CSS animation (see the `nf-` section of `globals.css`), so
 * this stays a server component and the sequence still plays — or, under
 * reduced motion, still *reads* — with scripting off.
 *
 * The header floats over this transparent, as it does over every dark hero;
 * nothing to add to `LIGHT_FROM_TOP`, because a 404 can be any pathname.
 */

/** The corner table a real drawing sheet carries. */
const TITLE_BLOCK = [
  { label: "Drawn by", value: site.name },
  { label: "First issue", value: String(site.founded) },
  { label: "Sheet", value: "404" },
  { label: "Revision", value: "—" },
  { label: "Status", value: "Not built" },
] as const;

/** Staggered arrival for the written matter. */
const rise = (ms: number) => ({ "--nf-delay": `${ms}ms` }) as React.CSSProperties;

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-hero flex-col justify-center overflow-hidden rounded-b-[2.5rem] bg-navy-950 sm:rounded-b-[4rem]">
      {/* The sheet: grid, then a breath of brass where the work happens. */}
      <div aria-hidden="true" className="nf-grid" />
      <div aria-hidden="true" className="nf-glow" />

      <Container className="relative py-24 text-center sm:py-28">
        <div className="mx-auto max-w-3xl">
          {/* The numerals, drafted. Decorative — the accessible name for the
              state is the heading below, so screen readers hear "404" once,
              not twice. The viewBox is cropped to the glyphs (Manrope's
              digits at 210px reach from y≈50 down to the 204 baseline, plus
              the 0's round overshoot), so the figure carries no dead air of
              its own and the whole sheet seats on a 900px-tall window. */}
          <svg
            aria-hidden="true"
            viewBox="0 42 460 170"
            className="nf-numerals"
          >
            <text x="230" y="204" textAnchor="middle" fontSize="210">
              404
            </text>
          </svg>

          {/* The measurement under them. */}
          <div className="nf-dim mt-6" aria-hidden="true">
            <span className="nf-dim__line nf-dim__line--start" />
            <span className="nf-late text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400">
              Not on the drawings
            </span>
            <span className="nf-dim__line nf-dim__line--end" />
          </div>

          <h1
            className="nf-rise text-balance-head mt-9 text-[clamp(1.875rem,3.6vw,2.875rem)] leading-[1.1] text-white"
            style={rise(500)}
          >
            <span className="sr-only">404 — </span>
            This page was never built.
          </h1>

          <p
            className="nf-rise mx-auto mt-6 max-w-xl text-[1.0625rem] leading-[1.75] text-navy-100/85"
            style={rise(650)}
          >
            The address you followed isn&rsquo;t in our drawings — moved,
            perhaps, or never planned at all. Everything we <em>have</em> built
            since {site.founded} is still exactly where it should be.
          </p>

          <div
            className="nf-rise mt-10 flex flex-wrap justify-center gap-3"
            style={rise(800)}
          >
            <Button href="/" variant="light" size="lg" withArrow>
              Back To Home
            </Button>
            <Button href="/contact" variant="ghost" size="lg">
              Contact Us
            </Button>
          </div>

          <nav
            aria-label="Site sections"
            className="nf-rise mt-10 border-t border-white/15 pt-7"
            style={rise(950)}
          >
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              {[...navLinks, { href: "/faq", label: "FAQ" }].map((link) => (
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

      {/* The title block. Decoration in the drawing-sheet sense: everything
          it records is already on the page, so it is hidden from readers and
          from any window too small to give it a corner of its own — below
          1400px wide its left edge would cross the section-links rule, and
          below ~860px tall the sheet runs past the fold and the block with
          it, half-cut. */}
      <dl
        aria-hidden="true"
        className="nf-late absolute bottom-10 right-10 hidden w-64 border border-white/12 [@media(min-width:1400px)_and_(min-height:860px)]:block"
      >
        {TITLE_BLOCK.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-white/12 px-4 py-2 last:border-b-0"
          >
            <dt className="text-[0.625rem] uppercase tracking-[0.22em] text-white/40">
              {label}
            </dt>
            <dd className="text-[0.6875rem] uppercase tracking-[0.14em] text-white/70">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
