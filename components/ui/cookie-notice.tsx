"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The cookie notice — mounted on the contact page only, on purpose.
 *
 * Most sites put a consent bar on every page because most sites set cookies
 * on every page. This one sets none anywhere, so a site-wide banner would be
 * noise about nothing. The contact page is the one place a visitor actually
 * hands us anything, and the one place people have been trained to expect
 * the question — so that is where the answer appears, once, and the answer
 * is that there is nothing to accept.
 *
 * Dismissing it is remembered in `localStorage` — deliberately not a cookie,
 * which would make the notice its own counter-example. The value stays on
 * the visitor's device and is never sent anywhere; the cookie policy says
 * so, so if this mechanism changes, that page must change with it. Storage
 * can be unavailable (private windows, hard privacy settings) — then the
 * dismissal simply lasts until the page is left, which errs the right way:
 * the notice reappears rather than a preference being lost silently.
 */

const STORAGE_KEY = "vijaya-cookie-notice";

/** How long the page gets to itself before the card slides up. */
const ENTRANCE_DELAY_MS = 1200;

/** Matches the card's leave transition, so unmount waits for it. */
const LEAVE_MS = 400;

const readDismissed = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
};

const writeDismissed = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, "dismissed");
  } catch {
    // Nowhere to remember it — the session-long dismissal still stands.
  }
};

export function CookieNotice() {
  // `null` = not decided yet (server, and first client paint — so the markup
  // matches across hydration); then either mounted-and-showing or gone.
  const [state, setState] = useState<"hidden" | "entering" | "shown" | "leaving">(
    "hidden",
  );

  useEffect(() => {
    if (readDismissed()) return;

    // Enter on a timer: the card is part of the page settling, not a trap
    // sprung on arrival. `entering` mounts it one frame before `shown` so
    // the transition has a starting state to leave from.
    const enter = window.setTimeout(() => {
      setState("entering");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setState("shown")),
      );
    }, ENTRANCE_DELAY_MS);

    return () => window.clearTimeout(enter);
  }, []);

  const dismiss = () => {
    writeDismissed();
    setState("leaving");
    window.setTimeout(() => setState("hidden"), LEAVE_MS);
  };

  if (state === "hidden") return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      // Under the menu sheet (z-60) and clear of the header (z-50, top of
      // page) — the wrapper spans the page bottom but only the card is real.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40"
    >
      <div className="container-page pb-5 sm:pb-8">
        <div
          className={cn(
            "pointer-events-auto ml-auto max-w-md rounded-[1.5rem] border border-line bg-white p-6 shadow-lift sm:rounded-[1.75rem] sm:p-7",
            "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none",
            state === "shown"
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0",
          )}
        >
          <p className="eyebrow-rule text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-600">
            Cookies
          </p>
          <h2 className="mt-4 font-display text-[1.1875rem] leading-snug text-navy-900">
            Nothing to accept.
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-[1.7] text-slate-body">
            This site sets no cookies — no trackers, no analytics. The form
            sends us only what you type, and dismissing this note is
            remembered on your device, not on ours.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center justify-center rounded-full bg-navy-900 px-6 py-2.5 text-[0.8125rem] font-semibold tracking-wide text-white transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-navy-800 active:scale-[0.98]"
            >
              Understood
            </button>
            <Link
              href="/cookie-policy"
              className="link-underline text-[0.8125rem] font-semibold text-navy-900"
            >
              Read The Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
