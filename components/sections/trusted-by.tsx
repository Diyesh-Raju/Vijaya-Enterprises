import type { CSSProperties } from "react";
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
      <span className="trusted-caption mt-4 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-slate-muted">
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
        // The per-entry height, handed to the stylesheet rather than set
        // here. Drawn from it, a wide wordmark and a square crest each keep
        // their own proportions and `--logo-scale` pulls the row down
        // together on narrow screens — which is what `.trusted-row img` does
        // with it. It is a property rather than a `height` because an inline
        // height cannot be overridden by a media query, and on a phone the
        // mark is contained in a box instead of drawn at a fixed height.
        style={{ "--mark-h": `${org.height}px` } as CSSProperties}
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

/** One pass of the strip. Two of these make a `Marquee`'s seamless loop. */
function Row({ orgs }: { orgs: readonly TrustedOrg[] }) {
  return (
    <ul className="flex shrink-0 items-end">
      {orgs.map((org) =>
        org.logo ? (
          <Logo key={org.mark} org={org} src={org.logo} />
        ) : (
          <Wordmark key={org.mark} org={org} />
        ),
      )}
    </ul>
  );
}

/** The roster started from its middle — see the note on the phone rows. */
const ROTATED = [
  ...trustedBy.slice(Math.ceil(trustedBy.length / 2)),
  ...trustedBy.slice(0, Math.ceil(trustedBy.length / 2)),
];

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

      {/* One row, running right to left. The laptop's, unchanged — the
          wrapper is the whole of the difference, and it only ever takes
          this branch off a phone. */}
      <div className="hidden desk:block">
        <Reveal delay={160}>
          <Marquee speed={72} className="trusted-row mt-12 sm:mt-16">
            <Row orgs={trustedBy} />
          </Marquee>
        </Reveal>
      </div>

      {/* Two rows on a phone, pulling against each other.

          A single strip at this size is a slow drift in one direction and
          reads as a static picture that happens to be sliding; two rows
          going opposite ways read as motion, and they do it without either
          row going any faster. The band also gets twice the marks on screen
          at once, which is the point of a client list.

          The lower row is the same roster started halfway down it, not a
          second set and not the first one reversed. Reversed, the two rows
          would show the same neighbours in the same order and the eye would
          catch it; rotated, every logo has a different logo beside it in the
          other row, and the roster is still read in one order by anyone
          following a single strip. */}
      <div className="desk:hidden">
        <Reveal delay={160}>
          <Marquee speed={72} className="trusted-row mt-12">
            <Row orgs={trustedBy} />
          </Marquee>

          {/* The gutter between the rows is the gutter between the boxes —
              12px, set as `mt-3` here and as the `padding-inline` on
              `.trusted-row li` in the phone block of `globals.css`. Two
              rows of squares in a regular grid is what the spacing is
              drawing; a different vertical gap would break it. */}
          <Marquee reverse speed={72} className="trusted-row mt-3">
            <Row orgs={ROTATED} />
          </Marquee>
        </Reveal>
      </div>
    </section>
  );
}
