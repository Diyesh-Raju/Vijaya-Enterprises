"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { img, alt } from "@/lib/images";
import { navLinks, site } from "@/lib/site";
import {
  ArrowUpRightIcon,
  CalendarCheckIcon,
  HelpCircleIcon,
} from "@/components/ui/line-icons";
import type { ReactNode } from "react";

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

/**
 * Everything the header used to hold, plus Home — the logo alone was it.
 *
 * Privacy Policy is deliberately not on this list. The page is still there
 * and still reachable — the footer links it on every page, the cookie policy
 * links it in its own text, and it is in the sitemap — it is just not one of
 * the places this menu offers to take you. A menu is the handful of places a
 * visitor came for; the policy is something they go looking for when they
 * want it, which is what the footer is for.
 */
const MENU_LINKS = [
  { href: "/", label: "Home" },
  ...navLinks.map(({ href, label }) => ({ href, label })),
  { href: "/contact", label: "Contact Us" },
];

/**
 * The two that are not places on the site so much as things to do on it, set
 * apart at the foot of the panel as a pair of cards.
 *
 * They were the last two rows of the list above, and they read badly there:
 * a menu is a set of destinations and these are a booking form and a
 * reference page, so six equal rows ended on two that were not the same kind
 * of thing. Given their own shape they stop competing with the list, and the
 * list gets to be the six places the site goes.
 *
 * The second line is the whole reason they can be cards rather than more
 * rows — a destination needs no explanation, an action does. Keep it to
 * three or four words: the pair sit side by side from `sm` up, which leaves
 * each about 160px of text column between the mark and the arrow.
 */
const MENU_ACTIONS = [
  {
    href: "/site-booking",
    label: "Site Booking",
    hint: "Book a day to visit",
    icon: <CalendarCheckIcon />,
  },
  {
    href: "/faq",
    label: "FAQ",
    hint: "Questions, answered",
    icon: <HelpCircleIcon />,
  },
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
  const pathname = usePathname();

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
            // Still easing after the links have finished arriving — that
            // overlap is what makes the two halves read as one movement
            // rather than two.
            // Centred. Bound by height, the whole frame top to bottom is
            // already in view and only the sides are trimmed — evenly, which
            // leaves the shrine on its axis with the lantern still in at one
            // edge and the sunset at the other.
            style={{ objectPosition: "50% 50%", transitionDuration: "1600ms" }}
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
          <div className="flex items-center justify-between">
            {/* The lockup, at every width.

                It was on a phone only, the argument being that a laptop
                already has the header's mark on screen behind the sheet, so a
                second one was the same artwork twice in one view. In practice
                the sheet covers the right half of the window and the header
                mark sits in the left, behind the photograph — so the panel
                opened on a bare navy field with an X in the corner and
                nothing at the top of it at all.

                `reversed` is the artwork drawn for a dark ground — white
                wordmark, the Ganesha mark relit to hold its blue against
                navy. See `logo.tsx`.

                Not a link. "Home" is the first row of the list directly
                below it, at four times the size, and a second route to the
                same page — one that would also have to close the sheet on
                the way — is a second thing to get wrong for no gain. */}
            {/* Sized to the header's own lockup rather than to something
                smaller. At the 44px it was, the wordmark's tracking and the
                "Since 1973" line under it are below the size the artwork is
                legible at — the mark read as a smudge of blue. The header
                draws it at 64–80 and this panel stands in for the header
                while it is down, so it is drawn at the same weight.

                No `width` override either. The header asks for the default
                400, so leaving it alone here means both placements resolve
                to the same generated file and the second one costs nothing
                to fetch — a narrower override would have been a second
                download of the same artwork. */}
            {/* The lockup and the toggle travel together, in a box of their
                own, so the row still has the two children `justify-between`
                and the close button's `ml-auto` were written against. Three
                loose children would have spaced themselves out evenly and
                left the toggle stranded in the middle of the row instead of
                beside the mark. */}
            <div className="flex min-w-0 items-center gap-2.5">
              <Logo
                reversed
                className="h-14 shrink-0 sm:h-16 lg:h-[4.5rem]"
              />

              {/* Beside the lockup: the language toggle, on a phone only.

                  Here rather than on the header bar because the bar has no
                  room for it — at 390px the lockup and the word "Menu" with
                  its ring already take all of it — and because this is the
                  one screen on the site that is *about* getting somewhere
                  rather than reading something, which is when a reader who
                  has landed in the wrong language goes looking for the way
                  out of it.

                  It is held back at `desk:` in `globals.css`, along with
                  the rest of the feature. See `language-switch.tsx`. */}
              <LanguageSwitch />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              // `ml-auto` so the laptop, which has no lockup beside it,
              // keeps the button hard right exactly as `justify-end` used
              // to put it.
              className={cn(
                "-mr-2 ml-auto inline-flex h-12 w-12 items-center justify-center rounded-full text-white/70",
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
                      // The header closes the sheet when the route changes,
                      // and a link to this very page changes nothing — the
                      // page glides back to its top as the sheet lifts
                      // (`SamePageLinks`), and the sheet has to be told to.
                      onClick={link.href === pathname ? onClose : undefined}
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
                        // handed its room back. The vh term tracks the number
                        // of rows, and it is left at 4.8 on six rows rather
                        // than raised to the 5.6 the arithmetic alone would
                        // ask for now that Site Booking and FAQ have become
                        // the pair of cards at the foot. The slack that
                        // leaves under the list is the gap between the six
                        // destinations and the two actions, and it is doing
                        // the work of telling them apart.
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

          {/* The two actions and the line of record, arriving together after
              the list has finished. The phone, the email and the CTA used to
              sit here too; the list is the menu, and three more things under
              it only competed with it. */}
          <div
            className={cn(
              "mt-auto pt-[clamp(1.5rem,4vh,2.5rem)] transition-[transform,opacity] duration-700",
              ease,
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
            style={{ transitionDelay: open ? `${SHEET_MS - 160}ms` : "0ms" }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {MENU_ACTIONS.map((action) => (
                <MenuAction
                  key={action.href}
                  {...action}
                  onClick={action.href === pathname ? onClose : undefined}
                  current={isActive(action.href)}
                />
              ))}
            </div>

            <p className="mt-[clamp(1.25rem,3vh,2rem)] border-t border-white/10 pt-5 text-[0.8125rem] text-white/40">
              © {new Date().getFullYear()} {site.legalName}. {site.tagline}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One of the two actions at the foot of the menu.
 *
 * The hover is the menu's own, translated from type to a surface: the links
 * above light from behind on the way in and trail off on the way out, so the
 * card brightens its ground, warms its edge to brass and lifts a millimetre,
 * with the same asymmetry — instant in, 260ms out. A card that faded in over
 * a quarter-second would light nothing when the cursor ran across both.
 *
 * The mark is a `grid` of one cell with the icon and the arrow stacked in it
 * rather than two boxes side by side: the arrow replaces the icon on hover,
 * and anything that changed the width of the row would shift the label
 * under the cursor.
 */
function MenuAction({
  href,
  label,
  hint,
  icon,
  onClick,
  current,
}: {
  href: string;
  label: string;
  hint: string;
  icon: ReactNode;
  onClick?: () => void;
  current: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      className={cn(
        // Both radii are written out rather than taken from the scale:
        // this project overrides Tailwind's, where `rounded-2xl` is 2.5rem
        // and would draw a 78px-tall card as a stadium, and `rounded-xl` is
        // 2rem, which is past half of a 44px mark and draws a circle. 1.25rem
        // here and 13px on the mark are the shapes actually wanted — the
        // second is the radius the client tiles in `who-we-build-for` use.
        "group/act flex items-center gap-4 rounded-[1.25rem] border px-4 py-3.5 sm:px-5 sm:py-4",
        "transition-[background-color,border-color,box-shadow,transform] duration-[260ms]",
        "ease-[cubic-bezier(0.22,1,0.36,1)] hover:duration-0",
        "hover:-translate-y-0.5 hover:border-brass-500/70 hover:bg-white/[0.09]",
        "hover:shadow-[0_0_0_1px_rgba(201,169,110,0.18),0_18px_40px_-18px_rgba(0,0,0,0.9)]",
        current
          ? "border-white/30 bg-white/[0.09]"
          : "border-white/15 bg-white/[0.04]",
      )}
    >
      {/* Blue, where every other accent mark on the site is brass. It is the
          one blue thing in the panel besides the lockup at the top of it, and
          that is the point — the Ganesha mark is lit the same way against the
          same navy, so the two read as belonging to each other down the
          length of the sheet.

          The card's edge and arrow stay brass on hover. Two accents rather
          than one, but they are the brand's two, and a blue mark inside a
          blue-edged card on a blue ground would have nothing to sit against. */}
      <span
        className={cn(
          "grid h-11 w-11 flex-none place-items-center rounded-[13px]",
          "bg-navy-400/[0.32] text-navy-100 transition-colors duration-[260ms]",
          "group-hover/act:bg-navy-300 group-hover/act:text-navy-950 group-hover/act:duration-0",
          "[&>svg]:h-[22px] [&>svg]:w-[22px]",
        )}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-sans text-[1.0625rem] font-semibold leading-tight text-white">
          {label}
        </span>
        <span className="mt-0.5 block text-[0.8125rem] leading-snug text-white/45">
          {hint}
        </span>
      </span>

      <ArrowUpRightIcon
        className={cn(
          "h-4 w-4 flex-none text-white/30 transition-[color,transform] duration-[260ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover/act:translate-x-0.5 group-hover/act:-translate-y-0.5",
          "group-hover/act:text-brass-400 group-hover/act:duration-0",
        )}
      />
    </Link>
  );
}
