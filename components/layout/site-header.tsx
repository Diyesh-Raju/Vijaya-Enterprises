"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Logo } from "./logo";
import { MENU_MS, SiteMenu } from "./site-menu";
import { cn } from "@/lib/cn";

const SCROLL_THRESHOLD = 24;

/**
 * Pages that do not open on a dark hero.
 *
 * The bar is transparent with white type until the hero has scrolled away,
 * which is right for every page that opens on a photograph and wrong for one
 * that opens on a pale section — there the lockup and the word "Menu" would
 * be white on near-white. These get the frosted bar from the first pixel.
 *
 * The home page is on the list because its walkthrough now starts *below*
 * the bar rather than running behind it: there is white paper up there, not
 * film, so a transparent bar would leave the lockup on nothing.
 */
const LIGHT_FROM_TOP = ["/", "/faq"];

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

const isScrolled = () => window.scrollY > SCROLL_THRESHOLD;

/**
 * Header: the lockup on the left, and everything else behind one word.
 *
 * The bar carries no navigation of its own any more — the five sections and
 * Contact all live in `SiteMenu`, a full-screen panel. What is left is the
 * logo, which goes home, and the trigger, which is the word "Menu" beside a
 * ringed set of three lines.
 *
 * Most pages open on a dark hero, so the bar starts transparent with white
 * type and swaps to a frosted white bar — with a hairline under it — once you
 * scroll past the fold. `LIGHT_FROM_TOP` names the pages that skip the
 * transparent state and are frosted from the first pixel.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Solid bar as soon as the hero starts moving away. Subscribing to scroll
  // through the store keeps the server snapshot (`false`, i.e. transparent
  // over the hero) honest and avoids a setState-on-mount round trip.
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    isScrolled,
    () => false,
  );

  /**
   * The route this component last reacted to. Compared against `pathname`
   * inside the effect below, which is how it tells a panel the reader shut
   * from one a link shut under them. It is deliberately not written during
   * render: a navigation renders inside a transition, which React is free
   * to throw away and retry, and a ref set on a discarded attempt does not
   * survive. Only the effect writes it, and effects run once per commit.
   */
  const reactedPath = useRef(pathname);

  // Close the panel whenever the route changes. Adjusting state during render
  // (rather than in an effect) is React's documented pattern for resetting
  // state when a value changes: it happens before paint, so the panel never
  // flashes on the new page. Covers link clicks and back/forward alike.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  /**
   * Hand focus back to the trigger on close — without ringing it.
   *
   * Closing with the mouse never draws a ring: the browser knows the last
   * interaction was a pointer. Escape is a keypress, so the same
   * `focus()` afterwards counts as keyboard focus and the site's brass
   * `:focus-visible` outline lands on the button, even though nobody tabbed
   * there. The attribute suppresses it for exactly that moment (see
   * `globals.css`) and comes off the instant focus leaves, so tabbing to the
   * button later rings it normally.
   */
  const restoreFocus = useCallback(() => {
    const trigger = toggleRef.current;
    if (!trigger) return;

    trigger.dataset.returningFocus = "";
    trigger.focus();
    trigger.addEventListener(
      "blur",
      () => {
        delete trigger.dataset.returningFocus;
      },
      { once: true },
    );
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  /**
   * While the panel is open: shove the page away behind it, lock the scroll
   * and trap Escape.
   *
   * The push itself is one rule in `globals.css` hanging off `data-menu` on
   * the root — the shell it moves is rendered by the server layout, well out
   * of this component's reach, and an attribute on `<html>` is the cheapest
   * wire between the two.
   *
   * `--menu-origin-y` is what makes the push land the same way wherever you
   * happen to be on the page. The shell is the whole document tall, so
   * pivoting it about its own top-right corner would fling the middle of a
   * long page clean off the screen; the corner that matters is the top-right
   * of the *window*, which is exactly `scrollY` down from the top of the
   * shell. Scroll is frozen for the length of the gesture, so the figure
   * taken here stays true for as long as it is used.
   *
   * The lock outlasts `open`. The page is still travelling back for a full
   * `MENU_MS` after the close begins, and it is translated down the screen
   * the whole time — hand the scrollbar back any earlier and the page grows
   * a second one for a second and jumps.
   *
   * `data-menu-snap` is the one exception to any of it. When a *link* is
   * what closed the panel, the thing under the sheet is no longer the page
   * that was pushed away — it is a new one, mounting, which has never been
   * anywhere but square. Easing it "back" therefore returns it from a
   * position it was never in: the wrong gesture, however smoothly it runs.
   * So on a navigation the push is dropped rather than played. Nothing is
   * lost by it, because the sheet still covers the window at the moment it
   * would have begun.
   *
   * It also takes the most expensive thing in that window off the table.
   * Animating a `scale(1.5)` means the whole page is rastered afresh at a
   * scale that changes every frame, on the one frame that page is also
   * taking its first layout, paint and image decodes — and the sheet
   * leaves on a `clip-path`, which no engine composites, so it is the
   * first thing to stall when anything else wants the main thread. That
   * cost is a GPU one and does not show up in layout or script timings;
   * what does show up is the reverse, a per-frame layout pass that fixed
   * descendants need once their transformed ancestor lets them anchor to
   * the window again. It is about 10ms spread across the second and a
   * quarter, which is far too little to see and worth paying for the
   * raster it removes.
   *
   * The attribute is left on until the next open rather than cleared here.
   * Clearing it would have to wait for a style flush, or the restored
   * transition would catch the very change it was suppressing; the open
   * branch takes it off in the same breath as it sets `data-menu`, so both
   * land in one recalculation and the sheet opens on its curve as usual.
   */
  useEffect(() => {
    const root = document.documentElement;
    const { body } = document;

    const navigated = reactedPath.current !== pathname;
    reactedPath.current = pathname;

    if (!open) {
      if (navigated) root.setAttribute("data-menu-snap", "");
      root.removeAttribute("data-menu");
      const id = window.setTimeout(() => {
        body.style.overflow = "";
      }, MENU_MS);
      return () => window.clearTimeout(id);
    }

    root.style.setProperty("--menu-origin-y", `${window.scrollY}px`);
    root.removeAttribute("data-menu-snap");
    root.setAttribute("data-menu", "open");
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close, pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Over a hero, before the panel is up: white type on nothing.
  const solid = scrolled || LIGHT_FROM_TOP.includes(pathname);
  const light = !solid && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          solid && !open
            ? "glass border-line shadow-soft"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="container-page">
          {/* The row takes its height from `--header-h` less the hairline, so
              the bar is exactly `--header-h` tall and whatever starts below
              it — the home page's hero — cannot drift out of register with
              it at any breakpoint or root font size. */}
          <div className="flex h-[calc(var(--header-h)-1px)] items-center justify-between gap-4">
            {/* Left — the lockup, unchanged, and it still goes home */}
            <Link
              href="/"
              aria-label="Vijaya Enterprises — home"
              className="inline-flex shrink-0 rounded-2xl"
            >
              {/* Keyed to `scrolled` rather than `light`: while the panel is
                  sliding in the strip behind the logo is still the dark hero,
                  and the dark-purple wordmark would disappear into it. */}
              <Logo reversed={!solid} priority className="h-16 sm:h-20" />
            </Link>

            {/* Right — the only control on the bar */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className={cn(
                "group inline-flex shrink-0 items-center gap-3 rounded-full transition-colors duration-300 sm:gap-4",
                light ? "text-white" : "text-navy-900",
              )}
            >
              <span className="text-[0.75rem] font-semibold uppercase tracking-[0.22em]">
                Menu
              </span>

              <span
                aria-hidden="true"
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300 sm:h-[3.25rem] sm:w-[3.25rem]",
                  light
                    ? "border-white/40 group-hover:bg-white/10"
                    : "border-line-strong group-hover:bg-navy-50",
                )}
              >
                {/* Three rules, the middle one short. On hover they even up —
                    a small tell that the control does something, without the
                    bars pretending to be an X they never become. */}
                <span className="flex w-[1.125rem] flex-col items-start gap-[0.3125rem]">
                  <span className="h-px w-full bg-current" />
                  <span className="h-px w-2/3 bg-current transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
                  <span className="h-px w-full bg-current" />
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <SiteMenu open={open} onClose={close} isActive={isActive} />
    </>
  );
}
