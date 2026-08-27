import { Marquee } from "@/components/ui/marquee";
import { Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { trustedBy, type TrustedOrg } from "@/lib/site";

/**
 * The client band under the residence deck.
 *
 * Each organisation's own logo, drawn at the per-entry height set in
 * `trustedBy` — see the note there for why the heights differ and where the
 * files came from. An entry with no `logo` falls back to `Wordmark`, the
 * typeset treatment the whole band used before the logos arrived.
 *
 * The marquee runs long (72s) because these items are far wider than the
 * plain-name tickers elsewhere; at the default 42s the row would sprint.
 */
/**
 * One entry: whatever it is drawn with, centred in a well of a fixed height,
 * and the full title under it. The well is what keeps the captions on one
 * line across the row — the logos themselves range from a 7:1 lockup to a
 * square seal, so nothing about their own boxes lines up.
 */
function Item({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <li className="group/mark flex shrink-0 flex-col items-center whitespace-nowrap px-10 sm:px-14">
      <span className="trusted-well flex items-center justify-center">
        {children}
      </span>
      <span className="mt-4 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-slate-muted">
        {name}
      </span>
    </li>
  );
}

function Logo({ org, src }: { org: TrustedOrg; src: string }) {
  return (
    <Item name={org.name}>
      {/* A plain <img>, not next/image: the row holds two copies of every
          logo for the marquee, they are ~40px tall, and half of them are
          SVG — there is nothing for the optimiser to win here, and the
          wrapper it adds fights the flex row. `width`/`height` carry the
          intrinsic size so the row never reflows as the files land. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${org.name} logo`}
        width={org.w}
        height={org.h}
        // Not lazy: the row is a CSS transform, not a scroll, so most of the
        // strip sits outside the viewport with no scroll event to bring it
        // in, and the tiles pop as they arrive. Ten files, ~280KB the lot,
        // dropped to the back of the queue so they yield to the hero.
        loading="eager"
        fetchPriority="low"
        decoding="async"
        // Drawn from the height, so a wide wordmark and a square crest each
        // keep their own proportions; `--logo-scale` pulls the whole row
        // down together on narrow screens.
        style={{ height: `calc(${org.height}px * var(--logo-scale, 1))` }}
        className="w-auto max-w-none object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/mark:-translate-y-1"
      />
    </Item>
  );
}

/** The typeset treatment, kept for any entry that has no logo file yet. */
function Wordmark({ org }: { org: TrustedOrg }) {
  return (
    <Item name={org.name}>
      <span className="relative inline-block font-extrabold uppercase leading-none tracking-[-0.015em] text-[1.75rem] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/mark:-translate-y-1 sm:text-[2.25rem] lg:text-[2.5rem]">
        {/* Two stacked copies of the word: an `aria-hidden` one carrying the
            extrusion, and the lit face above it. Real elements rather than a
            `::before` keep the word out of the accessibility tree exactly
            once, which `content: attr()` cannot promise across readers. */}
        <span aria-hidden="true" className="wordmark-extrude absolute inset-0">
          {org.mark}
        </span>
        <span className="wordmark-face relative">{org.mark}</span>
      </span>
    </Item>
  );
}

export function TrustedBy() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line bg-white py-16 sm:py-20 lg:py-24">
      <Container>
        {/* The band's own heading, at the same display size as every other
            section on the page — it used to be only the brass eyebrow, which
            read as a label on the logos rather than a heading of its own. */}
        <SectionHeading
          align="center"
          title="Trusted by industry leaders"
          lead="Public sector undertakings, banks, laboratories and institutions that have put their construction in our hands."
        />
      </Container>

      <Reveal delay={160}>
        <Marquee speed={72} className="trusted-row mt-12 sm:mt-16">
          <ul className="flex shrink-0 items-end">
            {trustedBy.map((org) =>
              org.logo ? (
                <Logo key={org.mark} org={org} src={org.logo} />
              ) : (
                <Wordmark key={org.mark} org={org} />
              ),
            )}
          </ul>
        </Marquee>
      </Reveal>
    </section>
  );
}
