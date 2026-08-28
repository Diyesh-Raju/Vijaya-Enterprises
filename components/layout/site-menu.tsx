"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { img, alt } from "@/lib/images";
import { navLinks, site } from "@/lib/site";

/**
 * The full-screen menu: photograph down the left, links down the right.
 *
 * It no longer descends as a flat blind. The sheet is *cut* into the window
 * by a clip-path whose bottom edge is slanted, so the right side of the dark
 * plane arrives ahead of the left and the opening reads as a sweep rather
 * than a drop. Under it the page itself is shoved away — see `.page-shell`
 * in `globals.css` — and the menu's own contents come the other way, from
 * up and to the left, rotated and oversized, settling square as the cut
 * finishes. Three movements on one curve, which is what makes them read as
 * one gesture with depth to it instead of three panels animating.
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

/**
 * The length of the whole gesture: the cut, the page behind it and the
 * contents all run for exactly this long and start together. Exported
 * because the header holds the scroll lock for the same span — the page is
 * still travelling back after `open` has already gone false.
 */
export const MENU_MS = 1250;

/** The links, once the cut is most of the way down. */
const LINK_DELAY_MS = 750;
const LINK_STAGGER_MS = 100;
const LINK_MS = 1000;

/** The last link to arrive is what the tail of the panel waits behind. */
const LINKS_DONE_MS =
  LINK_DELAY_MS + (MENU_LINKS.length - 1) * LINK_STAGGER_MS + LINK_MS;

/**
 * Slow at both ends, quick through the middle. This is the curve the sheet,
 * the page under it and the contents all share; it holds still for a beat,
 * commits, and lands without a bounce, which is what stops a 1.25s move from
 * reading as a lazy one.
 */
const SHEET_EASE = "ease-[cubic-bezier(0.86,0,0.07,1)]";

/** The links, by contrast, leave immediately and decelerate the whole way. */
const LINK_EASE = "ease-[cubic-bezier(0.165,0.84,0.44,1)]";

/** Shut: a zero-height slit along the top edge. */
const CUT_CLOSED = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
/**
 * Open: past the bottom on the right, level with it on the left. The right
 * corner overshoots to 175% so the slant is still steep at the moment the
 * left corner lands — an edge that finished square would spend its last
 * frames as a plain horizontal line.
 */
const CUT_OPEN = "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)";

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
   * True once the links have finished rising, false again the moment the
   * sheet has finished leaving.
   *
   * It exists for one reason: the links rise a full body-height from below,
   * which needs their row to be clipped or each one would be visible sliding
   * up across its neighbour. But a clipped row also cuts the glow off the
   * links on hover, and hovering only ever happens once everything has
   * landed. So the clip is worn for the entrance and taken off after it.
   */
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(
      () => setSettled(open),
      open ? LINKS_DONE_MS : MENU_MS,
    );
    return () => window.clearTimeout(id);
  }, [open]);

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
    const id = window.setTimeout(() => sheetRef.current?.focus(), MENU_MS / 3);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <div
      id="site-menu"
      inert={!open}
      /* The dark plane is on this element, not on the halves inside it. The
         contents are offset and oversized while the cut is running, so they
         do not cover the shape being cut — without a colour here you would
         be cutting a hole through to the page rather than laying a sheet
         over it. */
      className={cn(
        "fixed inset-0 z-[60] overflow-hidden bg-navy-950",
        SHEET_EASE,
        open ? "visible" : "invisible",
      )}
      style={{
        clipPath: open ? CUT_OPEN : CUT_CLOSED,
        // Two properties on two clocks: the cut runs for the full gesture,
        // while visibility is a single step held back until the cut has
        // closed, so the sheet is still painted the whole way out.
        transitionProperty: "clip-path, visibility",
        transitionDuration: `${MENU_MS}ms, 0ms`,
        transitionDelay: open ? "0ms, 0ms" : `0ms, ${MENU_MS}ms`,
      }}
    >
      {/* The whole sheet travels as one opaque surface. Moving the halves
          separately left a seam: whichever arrived first sat there while the
          page showed through the gap beside it.

          It comes in from up and to the left, half again too big and canted
          over, pivoting about its own bottom-left corner — the opposite
          corner to the one the page behind it pivots about, which is what
          gives the two planes their sense of passing each other. */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={cn(
          "grid h-full grid-cols-1 outline-none transition-[transform,opacity] lg:grid-cols-[58fr_42fr]",
          SHEET_EASE,
        )}
        style={{
          transformOrigin: "left bottom",
          transform: open
            ? "translate(0px, 0px) rotate(0deg) scale(1)"
            : "translate(-100px, -100px) rotate(-15deg) scale(1.5)",
          // Never all the way out. A quarter-lit sheet sliding away still
          // reads as a solid thing leaving; a transparent one reads as a
          // fade, and the cut is already doing the disappearing.
          opacity: open ? 1 : 0.25,
          transitionDuration: `${MENU_MS}ms`,
        }}
      >
        {/* ------------------------------------------------ The photograph */}
        {/* Held back below lg. At phone widths the panel is the whole screen,
            and an interior squeezed into a band above the links reads as a
            stray picture rather than as the other half of a spread.

            Full-bleed, top to bottom — and already as far zoomed out as a
            covering image can be. `object-cover` scales by whichever axis
            needs more, which for a 3:2 photograph in this column is the
            height, so it is drawn at exactly the size that fills the column
            and not a pixel larger. Any less and there would be a gap. The
            only lever left on how much of the balcony reads is the width of
            this column, which is why it takes 58 of the 100 — as much as the
            longest link opposite can spare. */}
        <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
          <Image
            src={img.menuInterior}
            alt={alt.menuInterior}
            fill
            // Which axis `cover` binds to decides this. Against a column
            // roughly as wide as it is tall, a 3:2 photograph is bound by
            // *height*, so it is painted about half again as wide as the
            // column itself — wider than the 58 the column takes. 85 covers
            // that, and the source caps what actually gets requested.
            sizes="(max-width: 1024px) 1px, 85vw"
            quality={85}
            placeholder="blur"
            // Centred. Bound by height, the whole frame top to bottom is
            // already in view and only the sides are trimmed — evenly, which
            // leaves the shrine on its axis with the lantern still in at one
            // edge and the sunset at the other.
            //
            // It no longer eases out of a slight zoom of its own. The sheet
            // it sits on now arrives at scale 1.5, so the photograph is
            // already coming down out of an oversize — a second, private
            // zoom underneath that only fought it.
            style={{ objectPosition: "50% 50%" }}
            className="object-cover"
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
                <li
                  key={link.href}
                  // Worn only for the entrance — see `settled`.
                  className={settled ? undefined : "overflow-hidden"}
                >
                  {/* Two elements, one job each, and that separation is the
                      whole point. Both used to live on the anchor, which meant
                      hovering inherited the entrance's one-second duration and
                      its stagger delay — so the glow did not begin until the
                      cursor had sat still for the better part of a second, and
                      a quick pass down the list lit nothing at all. The
                      wrapper arrives; the anchor responds. */}
                  <span
                    className={cn("block transition-[transform,opacity]", LINK_EASE)}
                    style={
                      {
                        // A whole line-height below the row it belongs to, so
                        // it climbs the full depth of its own slot rather
                        // than nudging into place.
                        transform: open
                          ? "translateY(0%)"
                          : "translateY(120%)",
                        opacity: open ? 1 : 0.25,
                        // Staggered in; on the way out they do not travel at
                        // all. The sheet carrying them is already leaving,
                        // and links sliding down inside a panel that is
                        // itself sliding away just look like they are lagging
                        // behind it. Instead they hold, and are set back
                        // under the closed cut once it has gone —
                        // zero-duration, at the far end of the gesture.
                        transitionDuration: open ? `${LINK_MS}ms` : "0ms",
                        transitionDelay: open
                          ? `${LINK_DELAY_MS + index * LINK_STAGGER_MS}ms`
                          : `${MENU_MS}ms`,
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
          <div className="mt-auto overflow-hidden pt-[clamp(2rem,6vh,3.5rem)]">
            <div
              className={cn("transition-[transform,opacity]", LINK_EASE)}
              style={{
                // Last up the list, on the same terms as the links above it.
                transform: open ? "translateY(0%)" : "translateY(120%)",
                opacity: open ? 1 : 0.25,
                transitionDuration: open ? `${LINK_MS}ms` : "0ms",
                transitionDelay: open
                  ? `${LINK_DELAY_MS + MENU_LINKS.length * LINK_STAGGER_MS}ms`
                  : `${MENU_MS}ms`,
              }}
            >
              <p className="border-t border-white/10 pt-5 text-[0.8125rem] text-white/40">
                © {new Date().getFullYear()} {site.legalName}. {site.tagline}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
