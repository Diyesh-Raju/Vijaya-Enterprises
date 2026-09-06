"use client";

import { useSyncExternalStore } from "react";
import { BookVisitButton } from "@/components/sections/book-visit-button";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

/**
 * How /residential closes on a phone: the two buttons the project pages
 * close on, and nothing else.
 *
 * What stood here was `ApertureCta` — five screens of scrubbed track that
 * closes a photograph to a slit, turns it, and lets two more wipe in behind
 * it. It is the best thing on the page with a scroll wheel under it. On a
 * phone it is five screens of dragging with a thumb, reached by a reader
 * who has already come the whole length of the page, and what it is
 * ultimately for — the two buttons at the end of it — is the part they have
 * to work hardest to reach. So on a phone the buttons come straight out and
 * the track does not: same destination, none of the journey.
 *
 * They are deliberately the same pair, in the same order, as the foot of a
 * project's Location page. A visitor who has been through a project box has
 * already met these two; meeting them again where the page ends is the
 * point, not a repetition to be designed around.
 */

/**
 * Where `ApertureCta` takes over. Laptop-shaped rather than merely wide,
 * since a phone on its side is past the 768 that `md:` asks for. Identical
 * to the query in `aperture-cta.tsx` and to the `desk:` variant in
 * `globals.css`.
 */
const WIDE_QUERY = "(min-width: 48rem) and (min-height: 500px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getWidth = () =>
  window.matchMedia(WIDE_QUERY).matches ? ("wide" as const) : ("phone" as const);

export function ResidentialCtaPhone() {
  const width = useSyncExternalStore(
    subscribeToWidth,
    getWidth,
    () => "ssr" as const,
  );

  // Off a laptop entirely once the width is known, so it carries neither a
  // second copy of the page's call to action nor `BookVisitButton`'s WebGL
  // canvas. `desk:hidden` below covers the frame before that.
  if (width === "wide") return null;

  return (
    <Section tone="white" size="lg" className="desk:hidden">
      <Container>
        {/* The buttons themselves wait for the width rather than riding out
            on the server's markup. `BookVisitButton` starts a WebGL context
            when it mounts, and a laptop should never pay for one it is
            about to throw away — this is the last section on the page, so
            nothing above it moves when they arrive. */}
        {width === "phone" && (
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6">
            <BookVisitButton />
            <ButtonWithIcon href="/contact">Contact Us</ButtonWithIcon>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
