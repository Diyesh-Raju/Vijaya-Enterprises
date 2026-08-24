import { Marquee } from "@/components/ui/marquee";
import { Container, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { trustedBy } from "@/lib/site";

/**
 * The client band under the residence deck.
 *
 * Every name is typeset, not a logo — see the note on `trustedBy` in
 * `lib/site.ts`. Each one is two stacked copies of the same word: an
 * `aria-hidden` copy carrying the extrusion, and the lit face above it.
 * Doing that with real elements rather than a `::before` keeps the word out
 * of the accessibility tree exactly once, which `content: attr()` cannot
 * promise across screen readers.
 *
 * The marquee runs long (72s) because these items are far wider than the
 * plain-name tickers elsewhere; at the default 42s the row would sprint.
 */
function Wordmark({ mark, name }: { mark: string; name: string }) {
  return (
    <li className="group/mark flex shrink-0 flex-col items-center whitespace-nowrap px-10 sm:px-14">
      <span className="relative inline-block font-extrabold uppercase leading-none tracking-[-0.015em] text-[1.75rem] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/mark:-translate-y-1 sm:text-[2.25rem] lg:text-[2.5rem]">
        <span aria-hidden="true" className="wordmark-extrude absolute inset-0">
          {mark}
        </span>
        <span className="wordmark-face relative">{mark}</span>
      </span>
      <span className="mt-4 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-slate-muted">
        {name}
      </span>
    </li>
  );
}

export function TrustedBy() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line bg-white py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow className="justify-center">Trusted By</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-6 text-[1.0625rem] leading-[1.8] text-slate-body">
              Public sector undertakings, banks, laboratories and institutions
              that have put their construction in our hands.
            </p>
          </Reveal>
        </div>
      </Container>

      <Reveal delay={160}>
        <Marquee speed={72} className="mt-12 sm:mt-16">
          <ul className="flex shrink-0 items-start">
            {trustedBy.map((org) => (
              <Wordmark key={org.mark} mark={org.mark} name={org.name} />
            ))}
          </ul>
        </Marquee>
      </Reveal>
    </section>
  );
}
