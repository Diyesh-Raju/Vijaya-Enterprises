"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Reveal } from "@/components/ui/reveal";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { CloseIcon } from "@/components/ui/line-icons";
import { img, alt } from "@/lib/images";

/**
 * Management — the founder and the managing director, a card each.
 *
 * Pressing a card opens the note about that person full screen, over the page.
 *
 * Built on the native `<dialog>` and `showModal()`, like `ImagePreview`, and
 * for the same reason: it renders in the browser's top layer, so it is
 * unaffected by the animated `transform` on the `Reveal` wrapper around each
 * card — a `position: fixed` panel would be trapped inside one of those rather
 * than covering the screen. It also brings the focus trap and Escape handling
 * with it, which a hand-rolled overlay would have to reimplement.
 *
 * One dialog serves both cards. Two would mean two focus traps and two copies
 * of the same markup for a panel that can only ever show one person.
 */

type Leader = {
  name: string;
  role: string;
  /** Everything in these is sourced — see the note below. */
  bio: readonly string[];
  photo: StaticImageData;
  photoAlt: string;
  /** Where the face sits in the card's 4:5 crop. */
  objectPosition: string;
};

/**
 * ⚠️ SOURCING. These notes are written only from what could actually be
 * verified, and nothing about either man has been inferred or filled in:
 *
 *  • Founded 1973, Basavanagudi, and the four kinds of work — the company's
 *    own profile (`vijaya.in`, `Vijaya-Profile-2020.pdf`).
 *  • H. B. Shivakumar as owner of Vijaya Enterprises — his LinkedIn.
 *  • "a committed philanthropist and Chairman of the trust", and Mahantesh B.
 *    Nelavagi as Managing Director of IAME — theacademicinsights.com's piece
 *    on the academy.
 *  • BCN Vijaya, founded 2002 as an associate company and conceptualised by
 *    Nelavagi — `vijaya.in/group-of-companies`.
 *
 * Dates of birth, education, titles held before these, and anything else a
 * leadership page usually carries were not published anywhere findable. Ask
 * the client for them rather than writing something that reads plausible.
 * The panel is built to take another paragraph each without changing.
 */
const leaders: readonly Leader[] = [
  {
    name: "Sri H. B. Shivakumar",
    role: "Founder",
    bio: [
      "Sri H. B. Shivakumar founded Vijaya Enterprises in 1973 and built it from a single construction business in Basavanagudi into a group working across residential, commercial, industrial and institutional projects in and around Bengaluru.",
      "A committed philanthropist, he also chairs the trust behind the group's educational institutions, among them the International Academy of Management & Entrepreneurship.",
    ],
    photo: img.hbShivakumar,
    photoAlt: alt.hbShivakumar,
    objectPosition: "50% 22%",
  },
  {
    name: "Mahantesh B. Nelavagi",
    role: "Managing Director & CEO",
    bio: [
      "Mahantesh B. Nelavagi leads Vijaya Enterprises as Managing Director, carrying the standards set in 1973 into the residential, commercial and institutional work the company takes on today.",
      "He conceived BCN Vijaya, the group's associate company founded in 2002, and is Managing Director of the International Academy of Management & Entrepreneurship in Bengaluru.",
    ],
    photo: img.mahanteshNelavagi,
    photoAlt: alt.mahanteshNelavagi,
    objectPosition: "50% 18%",
  },
];

export function Management() {
  /**
   * Two pieces of state for one panel, and the split is the animation's
   * doing. `open` drives the dialog; `shown` is whose note is in it, and it
   * deliberately does NOT clear on close — the panel takes half a second to
   * travel off to the left, and clearing it would empty the panel on the
   * first frame of that. It is replaced on the next open instead, which is
   * the one moment nothing is on screen to see it happen.
   */
  const [shown, setShown] = useState<Leader | null>(null);
  const [open, setOpen] = useState(false);

  const openLeader = (leader: Leader) => {
    setShown(leader);
    setOpen(true);
  };

  return (
    <Section tone="white" size="lg">
      <Container>
        <SectionHeading
          eyebrow="Management"
          title="The people behind the name."
          lead="Two generations of the same standard — the man who started the company in 1973, and the one running it now. Press a portrait to read about them."
          align="center"
          className="mx-auto"
        />

        {/* Two portraits, and only ever two: a leadership pair reads as a
            pair. Circles, held to the same measure the cards were — about
            26rem across at desktop — so they stay the size of a portrait
            rather than growing into a pair of discs that fill the screen. */}
        <ul className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2 sm:gap-10 lg:mt-20">
          {leaders.map((leader, index) => (
            <Reveal as="li" key={leader.name} delay={index * 90}>
              <LeaderCard leader={leader} onOpen={() => openLeader(leader)} />
            </Reveal>
          ))}
        </ul>
      </Container>

      <LeaderDialog leader={shown} open={open} onClose={() => setOpen(false)} />
    </Section>
  );
}

/**
 * The portrait on the page: a photograph in a circle, the name on it, and a
 * way in. Pressing it opens the same note as it always has — only the shape
 * of the thing pressed changed.
 */
function LeaderCard({
  leader,
  onOpen,
}: {
  leader: Leader;
  onOpen: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`Read about ${leader.name}, ${leader.role}`}
        className="group block w-full cursor-pointer overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass-500"
      >
        <figure className="relative isolate aspect-square overflow-hidden rounded-full bg-navy-100">
          <Image
            src={leader.photo}
            alt=""
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 420px"
            placeholder="blur"
            style={{ objectPosition: leader.objectPosition }}
            // The same slow settle every other photograph on the site has on
            // hover. `alt=""` because the button already carries the name: read
            // out, the portrait would otherwise announce it twice.
            className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* The name sits on the photograph, so it needs a ground. Both
              portraits are lit from above against a pale backdrop and go dark at
              the shoulders, which is where this lands. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent"
          />
          {/* Centred, and lifted off the foot: a circle is narrowest at the
              bottom, so a line set in the corner the card had would be cut by
              the curve. At 12% up the chord is still two-thirds of the
              diameter, which is room for the longer of the two names on a
              phone. The role used to sit under the name here and now stands
              below the circle instead — see the note on it. */}
          <figcaption className="absolute inset-x-0 bottom-[12%] px-[14%] text-center">
            <h3 className="font-display text-[1.25rem] leading-snug text-white sm:text-[1.4375rem]">
              {leader.name}
            </h3>
          </figcaption>

          {/* The cue that the card opens. `aria-hidden` because it describes a
              gesture, not content, and the button's own label already says what
              pressing does. */}
          {/* Where the card had it in the corner, the circle has no corner:
              22% in from the top and the right puts it on the diagonal, well
              inside the curve. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[22%] top-[22%] inline-flex h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white/15 text-[1.125rem] leading-none text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/25"
          >
            +
          </span>
        </figure>
      </button>

      {/* The role, under the circle rather than inside it (2026-09-12).
          Set in Cinzel, which the head of "Who we build for" further down
          this page already loads — it has no true lowercase, so "Founder"
          comes out as a capital F over small capitals without anything here
          having to uppercase it. That is also why there is no
          `text-transform`: forcing caps would flatten the two sizes into one
          and throw away the reason for using the face.

          It is outside the `<button>` on purpose. The button is round and
          clips to its own circle, so a line inside it would be cut off at
          the bottom; and its focus ring is `rounded-full`, which would have
          to become a stadium around a caption to keep it. The role is still
          announced with the portrait — the button's `aria-label` carries
          it — so nothing is lost by it not being pressable. */}
      {/* Bigger and heavier, asked for on 2026-09-14: 22px to 32px against
          the 18 to 26 it was, at 700 rather than the 500 `.inscribed` sets.

          The 700 is a real cut. Cinzel is a static face and only 500 was
          loaded, so `font-bold` on its own would have had the browser draw a
          fake bold — which is the one thing the `.inscribed` class exists to
          prevent, and it fails silently. `app/layout.tsx` now loads the
          weight this asks for.

          The tracking opens with the size rather than staying put. These are
          capitals, and the larger they are set the less air between them
          they need — 0.04em reads tight on a 32px line where it was right at
          18. */}
      <p className="inscribed mt-6 text-center text-[clamp(1.375rem,2.6vw,2rem)] font-bold leading-[1.15] tracking-[0.025em] text-navy-900">
        {leader.role}
      </p>
    </div>
  );
}

/**
 * How long the panel takes to cross the screen, in milliseconds.
 *
 * The single source of truth for it: CSS reads it from `--mgmt-travel`,
 * which is set on the element below, and the timer that finishes the exit
 * reads the same constant. Change it here and the two cannot drift.
 */
const TRAVEL_MS = 900;

/**
 * The note, full screen.
 *
 * `open` and `leader` are separate on purpose — see the note in `Management`.
 * `leader` outlives the closing so the panel has something in it on the way
 * out; `open` is what the travel keys off.
 *
 * THE DIALOG IS NOT CLOSED WHEN THE READER PRESSES CLOSE. It is sent left
 * first, and `close()` runs when it gets there. Every dismissal — the button,
 * the backdrop, Escape — therefore goes through the parent's state rather
 * than calling `close()` itself, or the panel would vanish instead of
 * leaving.
 *
 * That indirection is the whole fix for the exit coming apart. The
 * alternative, `@starting-style` with `transition-behavior: allow-discrete`,
 * closes the dialog first and asks the browser to keep painting it through
 * held `display` and `overlay` — an element that is no longer an open dialog,
 * mid-teardown, which is what was breaking up on the way out. Here `[open]`
 * stays on and the element stays `:modal` for the entire journey, so nothing
 * about how it renders changes while it is moving.
 *
 * The `<dialog>` element itself stays mounted either way, so React is not
 * building and tearing down a focus trap on every press.
 */
function LeaderDialog({
  leader,
  open,
  onClose,
}: {
  leader: Leader | null;
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    /* ------------------------------------------------------------ in */
    if (open) {
      if (element.open) return;

      // Classes are driven straight on the element rather than through
      // React state: `showModal()` has to happen with the panel already
      // parked off to the right, and a state update would not have been
      // committed by then — the panel would show for a frame in place
      // before jumping right to start its run.
      element.classList.remove("is-leaving");
      element.classList.add("is-entering");
      element.showModal();
      // Force the off-screen position to be computed, so the browser has a
      // start value to transition from when the class comes off.
      void element.offsetWidth;

      const frame = requestAnimationFrame(() =>
        element.classList.remove("is-entering"),
      );
      return () => cancelAnimationFrame(frame);
    }

    /* ----------------------------------------------------------- out */
    if (!element.open) return;

    const settle = () => {
      element.classList.remove("is-leaving");
      element.close();
    };

    // With motion reduced there is no transition, so `transitionend` never
    // arrives and waiting for it would leave the panel sitting on screen.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle();
      return;
    }

    element.classList.add("is-leaving");

    // `transitionend` is the real signal; the timer is the safety net for
    // the cases that never fire one — a background tab, a transition
    // interrupted, a browser that disagrees about the property name.
    const timer = window.setTimeout(settle, TRAVEL_MS + 150);
    const finish = (event: TransitionEvent) => {
      if (event.target !== element || event.propertyName !== "transform") return;
      window.clearTimeout(timer);
      settle();
    };

    element.addEventListener("transitionend", finish);
    return () => {
      window.clearTimeout(timer);
      element.removeEventListener("transitionend", finish);
    };
  }, [open]);

  // A modal dialog does not stop the page behind it from scrolling.
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-label={leader ? `About ${leader.name}` : undefined}
      style={{ "--mgmt-travel": `${TRAVEL_MS}ms` } as CSSProperties}
      // The native close event, which now only fires once the panel has
      // finished leaving. Reported upward in case the browser closed the
      // dialog on its own; the parent's setter is idempotent.
      onClose={onClose}
      // Escape asks to close rather than closing: let it run the journey.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // Anything outside the panel is backdrop, and clicking backdrop
      // dismisses. Tested against the target's ancestry rather than against
      // the dialog itself, because the panel covers the whole dialog.
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("[data-keep-open]")) onClose();
      }}
      className="mgmt-dialog m-0 h-full max-h-full w-full max-w-full overflow-hidden bg-transparent p-0 text-white backdrop:bg-navy-950/80 backdrop:backdrop-blur-sm"
    >
      {leader && (
        <div data-keep-open className="relative h-full w-full bg-navy-950">
          {/* Outside the scroller, not inside it. `absolute` positions against
              a scroll container's padding box, which scrolls away with the
              content — on a phone, where this note runs past the fold, the way
              out would have scrolled off the top with it. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-navy-950/70 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-500 sm:right-7 sm:top-7"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          {/* `min-h-full` with `items-center` rather than a centred flex box
              of fixed height: a note taller than the screen then grows the
              track instead of overflowing it, so its top stays reachable. */}
          <div className="h-full w-full overflow-y-auto overscroll-contain">
            <div className="flex min-h-full w-full items-center px-6 py-20 sm:px-10 sm:py-24">
              <div className="mx-auto grid max-w-5xl items-center gap-10 sm:gap-14 md:grid-cols-[minmax(0,21rem)_1fr]">
                <figure className="relative mx-auto aspect-[4/5] w-full max-w-[12.5rem] overflow-hidden rounded-[1.5rem] bg-navy-900 sm:max-w-[15rem] sm:rounded-[2rem] md:mx-0 md:max-w-none">
                  <Image
                    src={leader.photo}
                    alt={leader.photoAlt}
                    fill
                    sizes="(max-width: 768px) 60vw, 336px"
                    placeholder="blur"
                    style={{ objectPosition: leader.objectPosition }}
                    className="object-cover"
                  />
                </figure>

                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-brass-400">
                    {leader.role}
                  </p>
                  <h2 className="text-balance-head mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] text-white">
                    {leader.name}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="mt-7 block h-px w-12 bg-brass-500/70"
                  />
                  {/* The colour goes on the paragraphs, not on this wrapper.
                      `globals.css` sets `p { color: var(--color-slate-body) }`
                      as a base rule, and a rule that names the element beats
                      a colour inherited from its parent however the parent is
                      styled — so a `text-*` class out here is simply not
                      applied to the text inside. It read as slate on navy,
                      which is about 2.8:1 and the reason the bios looked
                      washed out against the sheet.

                      The weight is 500 rather than the 400 body copy is set
                      at everywhere else, and that is the only lever left for
                      how bright this reads: the colour is already #fff at
                      full opacity, so "brighter" can only mean more ink.
                      White on navy at 400 renders thin — the strokes are what
                      carries the light, not the hue — and Manrope is loaded
                      variable, so 500 costs nothing to reach for. */}
                  <div className="mt-7 space-y-5 text-[1rem] leading-[1.8] sm:text-[1.0625rem]">
                    {leader.bio.map((para) => (
                      <p key={para} className="font-medium text-white">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
