"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { img, alt } from "@/lib/images";
import { navLinks, site } from "@/lib/site";

/**
 * The full-screen menu: photograph down the left, links down the right,
 * drawn down over the page from the top like a blind.
 *
 * It stays mounted and is driven by transitions rather than being mounted on
 * open and animated with keyframes. Keyframes only ever play forwards, so
 * closing would either snap or need a second "closing" state to sequence the
 * unmount; transitions run both ways off one boolean for free. What that
 * costs is a panel permanently in the DOM, so it is held out of the document
 * properly while shut — `inert` takes it out of the tab order and off the
 * accessibility tree, and `visibility: hidden` stops it swallowing clicks.
 *
 * The visibility flip is delayed on the way out, and only on the way out, so
 * the sheet is still painted while it lifts away. `visibility` is not
 * interpolable but it is transitionable, which is exactly what is wanted: it
 * holds its old value for the delay and then switches in one step.
 */

/** Everything the header used to hold, plus Home — the logo alone was it. */
const MENU_LINKS = [
  { href: "/", label: "Home" },
  ...navLinks.map(({ href, label }) => ({ href, label })),
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQ" },
];

/** Slow enough to watch. The blind is the whole gesture, so it gets the time. */
const SHEET_MS = 1000;
const LINK_STAGGER_MS = 60;

/**
 * The sheet gets its own curve rather than the site's usual `expo.out`.
 * That curve is over 90% of the way home a third of the way through its
 * duration — lovely on a button, wrong here, where it makes a one-second
 * descent look like a fast one followed by a long creep. This one keeps
 * moving through the middle and only settles at the end, so the blind reads
 * as being drawn down at a steady hand.
 */
const SHEET_EASE = "ease-[cubic-bezier(0.45,0.05,0.2,1)]";

export function SiteMenu({
  open,
  onClose,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
}) {
  const sheetRef = useRef<HTMLDivElement | null>(null);

  /**
   * Move focus into the sheet when it opens, so the keyboard lands inside the
   * menu and not back up the page.
   *
   * It goes to the sheet itself, not to the close button. A programmatic
   * `focus()` on a real control still satisfies `:focus-visible` when the
   * browser thinks the last interaction was keyboard-ish, and the site's
   * global focus style is a 2px brass outline — so opening the menu with the
   * mouse could paint a gold ring around the X for no reason. A container
   * with `tabindex="-1"` is never `:focus-visible`, so focus moves without
   * anything being drawn. The X keeps its own ring for real keyboard users.
   */
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => sheetRef.current?.focus(), SHEET_MS / 3);
    return () => window.clearTimeout(id);
  }, [open]);

  const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <div
      id="site-menu"
      inert={!open}
      className={cn(
        "fixed inset-0 z-[60] overflow-hidden transition-[visibility] duration-0",
        open ? "visible" : "invisible",
      )}
      style={{ transitionDelay: open ? "0ms" : `${SHEET_MS}ms` }}
    >
      {/* The whole sheet travels as one opaque surface. Moving the halves
          separately left a seam: whichever arrived first sat there while the
          page showed through the gap beside it. */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={cn(
          "grid h-full grid-cols-1 outline-none transition-transform lg:grid-cols-[58fr_42fr]",
          SHEET_EASE,
          open ? "translate-y-0" : "-translate-y-full",
        )}
        style={{ transitionDuration: `${SHEET_MS}ms` }}
      >
        {/* ------------------------------------------------ The photograph */}
        {/* Held back below lg. At phone widths the panel is the whole screen,
            and an interior squeezed into a band above the links reads as a
            stray picture rather than as the other half of a spread.

            Full-bleed, top to bottom — and already as far zoomed out as a
            covering image can be. `object-cover` scales by whichever axis
            needs more, and against a column taller than it is wide that is
            always the height, so the photograph is drawn at exactly the size
            that fills the column and not a pixel larger. Any less and there
            would be a gap. The only lever left on how much of the room reads
            is the width of this column, which is why it takes 58 of the 100
            — as much as the longest link opposite can spare. */}
        <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
          <Image
            src={img.menuInterior}
            alt={alt.menuInterior}
            fill
            // Which axis `cover` binds to decides this, and it flipped when
            // the picture became a portrait one: against a column roughly as
            // wide as it is tall, a tall photograph is bound by *width*, so it
            // is painted at about the column's own measure rather than the
            // viewport-and-a-bit a 16:9 frame needed. 65 rather than 58 is
            // headroom for tall windows, where height takes over again.
            sizes="(max-width: 1024px) 1px, 65vw"
            quality={85}
            placeholder="blur"
            // Still easing after the links have finished arriving — that
            // overlap is what makes the two halves read as one movement
            // rather than two.
            // Hung a little high: it keeps the plant and the lit dining room
            // beyond it in frame, and stops the near arm of the sofa taking
            // the bottom third.
            style={{ objectPosition: "50% 35%", transitionDuration: "1600ms" }}
            className={cn(
              "object-cover transition-transform ease-out",
              open ? "scale-100" : "scale-[1.05]",
            )}
          />
        </div>

        {/* ------------------------------------------------------ The panel */}
        <div
          className={cn(
            "relative flex h-full flex-col overflow-y-auto bg-navy-950",
            "px-7 py-7 sm:px-10 sm:py-9 lg:px-11 lg:py-[clamp(1.75rem,4vh,2.5rem)] xl:px-14",
          )}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className={cn(
                "-mr-2 inline-flex h-12 w-12 items-center justify-center rounded-full text-white/70",
                "transition-colors duration-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div aria-hidden="true" className="mt-3 h-px w-full bg-white/15" />

          <nav aria-label="Primary" className="mt-10 lg:mt-[clamp(1.25rem,6vh,4rem)]">
            <ul>
              {MENU_LINKS.map((link, index) => (
                <li key={link.href}>
                  {/* Two elements, one job each, and that separation is the
                      whole point. Both used to live on the anchor, which meant
                      hovering inherited the entrance's one-second duration and
                      its stagger delay — so the glow did not begin until the
                      cursor had sat still for the better part of a second, and
                      a quick pass down the list lit nothing at all. The
                      wrapper arrives; the anchor responds. */}
                  <span
                    className={cn(
                      "block transition-[opacity,transform]",
                      ease,
                      open
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0",
                    )}
                    style={
                      {
                        transitionDuration: `${SHEET_MS}ms`,
                        // Staggered in, but not out: on the way out the whole
                        // sheet is already leaving, and a stagger under that
                        // just looks like the links are lagging behind the
                        // thing carrying them.
                        transitionDelay: open
                          ? `${380 + index * LINK_STAGGER_MS}ms`
                          : "0ms",
                      } as CSSProperties
                    }
                  >
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={cn(
                        "block py-0.5",
                        // The site's own sans, not its display serif. The list
                        // is the whole design here, and a plain grotesque set
                        // large is what makes it read as a menu rather than as
                        // a run of headings.
                        //
                        // `min()` against vh is what keeps the whole list on
                        // a 700px-tall window: the width rule still sets the
                        // size on a normal screen, and height takes over only
                        // when there is not enough of it. Both terms grew when
                        // the contact block came out from under the list and
                        // handed its room back.
                        //
                        // The air between the lines is leading rather than
                        // padding, so it stays in proportion as the type
                        // resizes — padding would read as generous at 3rem and
                        // cramped at 1.75rem.
                        "font-sans font-medium tracking-[-0.015em]",
                        "text-[clamp(1.75rem,min(3.3vw,4.8vh),3.1rem)] leading-[1.4]",
                        // Lights the instant the cursor lands and trails off
                        // after it leaves: `duration-0` under `hover` is the
                        // arriving state, the 260ms on the base is the leaving
                        // one. A symmetrical fade would mean flicking down the
                        // list lit nothing, because every word would still be
                        // ramping up when the cursor had already gone.
                        "transition-[color,text-shadow] duration-[260ms] ease-out hover:duration-0",
                        isActive(link.href)
                          ? "text-white"
                          : "text-white/60 hover:text-white",
                        // Lit from behind, not just brightened. Two layers: a
                        // tight one that thickens the strokes and a wide, faint
                        // one that spills past them, which is what separates a
                        // glow from a blur.
                        "hover:[text-shadow:0_0_18px_rgba(255,255,255,0.45),0_0_46px_rgba(255,255,255,0.18)]",
                      )}
                    >
                      {link.label}
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          {/* All that is left down here is the line of record. The phone,
              the email and the CTA used to sit above it; the list is the menu,
              and three more things under it only competed with it. */}
          <div
            className={cn(
              "mt-auto pt-[clamp(2rem,6vh,3.5rem)] transition-[transform,opacity] duration-700",
              ease,
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
            style={{ transitionDelay: open ? `${SHEET_MS - 160}ms` : "0ms" }}
          >
            <p className="border-t border-white/10 pt-5 text-[0.8125rem] text-white/40">
              © {new Date().getFullYear()} {site.legalName}. {site.tagline}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
