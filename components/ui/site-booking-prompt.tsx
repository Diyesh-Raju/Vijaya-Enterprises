"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HouseIcon } from "@/components/ui/line-icons";
import { onScroll, prefersReducedMotion } from "@/lib/scroll";
import { projectBySlug } from "@/lib/projects";
import { cn } from "@/lib/cn";

/**
 * The site-visit prompt: a speech bubble that pops up part-way down a page.
 *
 * Drawn as a comic speech balloon — an ink outline, a tail pointing down to
 * the small navy badge that is "speaking", a hard offset shadow, and three
 * short emphasis strokes off its top corner, the way a balloon in a strip is
 * marked when someone speaks up — but with the site's own palette and
 * radii, so it reads as the same hand that drew the rest of the page rather
 * than as a sticker on it. The pop-in overshoots and settles, and the badge
 * gives one nod once it has landed. All of that is in `globals.css` under
 * `.speech-bubble`.
 *
 * When it appears is decided by scroll, not by a timer: once the reader is
 * about two fifths of the way down the page, and at least most of a screen
 * in. That is "the middle" of a page for the purpose of asking — past the
 * hero, into the substance, and before the closing call to action that every
 * page already ends on. It fires once per page.
 *
 * Where it appears is decided by the route. The main pages get it; the
 * contact and booking pages do not — the bubble would be asking for what
 * the page already is — and neither do the policies, the brochure readers
 * or a page that is not found. A project's pages get the project's own
 * version: its name in the words, and its own booking page behind the
 * button, so the pass arrives already filled in.
 *
 * Dismissing it is remembered for the session, in `sessionStorage`, so a
 * reader who has said "not now" is not asked again on the next page. That
 * is per-tab and gone when the tab closes — the next visit asks once more.
 * Nothing about it is sent anywhere, and no cookie is set; see the note on
 * `CookieNotice`.
 */

const STORAGE_KEY = "vijaya-site-booking-prompt";

/** How far down the page, as a share of what can be scrolled. */
const SHOW_AT = 0.4;
/** …and never before this much of a screen has gone by, on a short page. */
const MIN_SCROLL_SCREENS = 0.8;

/** Matches the leave transition in `globals.css`. */
const LEAVE_MS = 360;

/** Only the main pages. Everything else is opted out by not being here. */
const SHOW_ON = ["/", "/residential", "/civil-contracts", "/joint-ventures", "/our-legacy", "/faq"];

const PROJECT_PATH = /^\/residential\/([^/]+)(?:\/|$)/;

const readDismissed = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
};

const writeDismissed = () => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "dismissed");
  } catch {
    // Nowhere to remember it — the page-long dismissal still stands.
  }
};

type Phase = "armed" | "entering" | "shown" | "leaving" | "done";

export function SiteBookingPrompt() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("armed");

  // A new page re-arms the prompt. Adjusting state during render is React's
  // pattern for resetting on a changed value: it happens before paint, so
  // the old page's bubble is never seen on the new one.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPhase("armed");
  }

  // Which version of the bubble this page gets, if any.
  const projectSlug = pathname.match(PROJECT_PATH)?.[1];
  const project = projectSlug ? projectBySlug(projectSlug) : undefined;
  const eligible = SHOW_ON.includes(pathname) || Boolean(project);
  const href = project ? `/site-booking/${project.slug}` : "/site-booking";

  useEffect(() => {
    if (!eligible || phase !== "armed") return;
    if (readDismissed()) return;

    let fired = false;
    const stop = onScroll(({ y, height }) => {
      if (fired) return;
      const range = document.documentElement.scrollHeight - height;
      if (range <= 0) return;
      if (y / range < SHOW_AT || y < height * MIN_SCROLL_SCREENS) return;

      fired = true;
      // Mount hidden, then show a frame later so the transition has a
      // starting state to leave from — the reduced-motion case skips the
      // overshoot in CSS and simply fades.
      setPhase("entering");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setPhase("shown")),
      );
    });

    return stop;
  }, [eligible, phase, pathname]);

  const dismiss = useCallback(() => {
    writeDismissed();
    setPhase("leaving");
    window.setTimeout(
      () => setPhase("done"),
      prefersReducedMotion() ? 0 : LEAVE_MS,
    );
  }, []);

  // Escape closes it, as it closes everything else on the site.
  useEffect(() => {
    if (phase !== "shown") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [phase, dismiss]);

  if (!eligible || phase === "armed" || phase === "done") return null;

  const visible = phase === "shown";

  return (
    <div
      role="complementary"
      aria-label="Book a site visit"
      // Under the menu sheet (z-60) and the header (z-50); above the page.
      // The wrapper spans the bottom edge but only the bubble is real.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40"
    >
      <div className="container-page flex justify-end pb-5 sm:pb-8">
        <div
          className={cn(
            "speech-bubble pointer-events-auto relative w-full max-w-[22rem] sm:max-w-[23.5rem]",
            visible ? "speech-bubble--in" : "speech-bubble--out",
          )}
        >
          {/* The three emphasis strokes off the top-left corner. */}
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="speech-bubble__burst absolute -left-5 -top-5 h-8 w-8 text-brass-500"
          >
            <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 26 12 20" />
              <path d="M4 14h8" />
              <path d="M14 4v8" />
            </g>
          </svg>

          <div className="speech-bubble__body rounded-[1.75rem] bg-white p-6 sm:p-7">
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute right-3.5 top-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-muted transition-colors duration-300 hover:bg-navy-50 hover:text-navy-900"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <p className="eyebrow-rule pr-10 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-600">
              Site visits
            </p>
            <h2 className="text-balance-head mt-4 pr-6 font-display text-[1.3125rem] leading-[1.2] text-navy-900 sm:text-[1.4375rem]">
              {project
                ? `Want to walk through ${project.name}?`
                : "Want to see it for yourself?"}
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-[1.65] text-slate-body">
              {project
                ? "Pick a day and a time of day, and someone who built it will meet you at the site."
                : "Pick a project, a day and a time of day, and we will meet you at the site."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href={href}
                onClick={writeDismissed}
                className="group inline-flex items-center gap-2.5 rounded-full bg-navy-900 px-6 py-3 text-[0.8125rem] font-semibold tracking-wide text-white shadow-soft transition-[background-color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-navy-800 hover:shadow-lift active:scale-[0.98]"
              >
                Book a Site Visit
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className="link-underline text-[0.8125rem] font-semibold text-navy-900"
              >
                Not now
              </button>
            </div>
          </div>

          {/* The tail, and the badge it points at. */}
          <span aria-hidden="true" className="speech-bubble__tail" />
          <span aria-hidden="true" className="speech-bubble__badge">
            <HouseIcon className="h-5 w-5" />
          </span>
        </div>
      </div>
    </div>
  );
}
