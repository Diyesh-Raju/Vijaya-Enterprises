"use client";

import { useEffect } from "react";
import { glideTo, landingFor } from "@/lib/glide";

/** `/residential/` and `/residential` are the same page. */
const trim = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

/**
 * A link that moves you within the page you are on glides there.
 *
 * Two kinds. A link to the page itself — the logo, Home in the menu and the
 * footer, any page's own name in either — goes back to the top of it.
 * `next/link` treats that click as a navigation to where you already are,
 * finds nothing new to bring into view, and leaves the reader exactly where
 * they were: two screens from the foot of the home page, the logo did
 * nothing at all. And a link to a section of this page — "Explore Our
 * Residential Work", the policy's contents — goes down to it.
 *
 * Both travel by `glideTo` rather than the stylesheet's `scroll-behavior`,
 * which crosses a whole page in about half a second; see `lib/glide.ts`.
 *
 * One listener for every such link on the site rather than a handler on
 * each: the header, the menu and the footer are three components, the
 * footer is rendered on the server, and a link added to any page later is
 * covered without anyone having to remember to.
 *
 * It listens on the window, in the capture phase, so it runs before React
 * does. Preventing the click's default there is what `next/link` checks for
 * before navigating — it still runs its own `onClick` prop first, which is
 * how the menu gets to close itself — so the router is never asked to go
 * anywhere and the glide is the only thing that moves the page.
 *
 * Left alone: new-tab and download clicks, other origins, other pages, and
 * links that change the query, which are a different view of the page and
 * should load as one. A section link pressed from the keyboard is left to
 * the browser too — the skip link is one — because the browser's own jump
 * also moves focus to the section, and that is the part that matters there.
 */
export function SamePageLinks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor =
        event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href);
      const here = window.location;
      if (url.origin !== here.origin || url.search !== here.search) return;
      if (trim(url.pathname) !== trim(here.pathname)) return;

      const keyboard = event.detail === 0;

      // ---- A section of this page.
      if (url.hash) {
        if (keyboard) return;
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!target) return;
        event.preventDefault();
        // What the browser's own jump would have left in the address bar,
        // and in the history — so Back returns to where the reader was.
        // `pushState` is wired into the App Router.
        if (url.hash !== here.hash) window.history.pushState(null, "", url.hash);
        glideTo(landingFor(target));
        return;
      }

      // ---- The top of this page.
      event.preventDefault();

      // Standing on `/our-legacy#brochures` and pressing Our Legacy: the
      // address should end up as the link reads, not keep a section the
      // page is no longer at.
      if (here.hash) window.history.replaceState(null, "", url.pathname + url.search);

      glideTo(0);

      // Pressed from the keyboard, focus would otherwise stay on a link that
      // is gliding away, and the next Tab would drag the page straight back
      // down to it. Start the reader again from the top, where a fresh page
      // would, on the logo. A ring there is right: they are tabbing. (The
      // menu hands focus back to its own trigger as it closes.)
      if (keyboard && !anchor.closest("#site-menu")) {
        document
          .querySelector<HTMLElement>("header a[href]")
          ?.focus({ preventScroll: true });
      }
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
