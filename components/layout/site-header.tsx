"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Logo } from "./logo";
import { navLinks, contact } from "@/lib/site";
import { cn } from "@/lib/cn";

const SCROLL_THRESHOLD = 24;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > SCROLL_THRESHOLD;

/**
 * Header: logo left → home, sections centred, Contact as a pill on the right.
 *
 * Every page opens on a dark hero, so the bar starts transparent with white
 * type and swaps to a frosted white bar once you scroll past the fold.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Solid bar as soon as the hero starts moving away. Subscribing to scroll
  // through the store keeps the server snapshot (`false`, i.e. transparent
  // over the hero) honest and avoids a setState-on-mount round trip.
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    isScrolled,
    () => false,
  );

  // Close the mobile panel whenever the route changes. Adjusting state during
  // render (rather than in an effect) is React's documented pattern for
  // resetting state when a value changes: it happens before paint, so the
  // panel never flashes on the new page. Covers link clicks and back/forward
  // alike.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // While the panel is open: lock the page, trap Escape, restore focus.
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Once the panel is open the bar sits on navy, so it uses the light styling.
  const light = !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled && !open ? "glass shadow-soft" : "bg-transparent",
      )}
    >
      <div className="container-page">
        <div className="flex h-20 items-center justify-between gap-4 sm:h-24">
          {/* Left — logo returns home */}
          <Link
            href="/"
            aria-label={`Vijaya Enterprises — home`}
            className="inline-flex shrink-0 rounded-2xl"
          >
            {/* Keyed to `scrolled` rather than `light`: the mobile panel opens
                below the bar, so the strip behind the logo is still the dark
                hero while the panel is open, and the dark-purple wordmark
                would disappear into it. */}
            <Logo reversed={!scrolled} priority className="h-16 sm:h-20" />
          </Link>

          {/* Centre — sections */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-9 lg:flex xl:gap-11"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "link-underline text-[0.875rem] font-medium transition-colors duration-300",
                  light
                    ? "text-white/85 hover:text-white"
                    : "text-navy-800 hover:text-navy-900",
                  isActive(link.href) && (light ? "text-white" : "text-navy-900"),
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-[0.3em] left-0 h-px w-full bg-brass-500"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right — contact bubble + mobile toggle */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/contact"
              className={cn(
                "hidden rounded-full px-7 py-3.5 text-[0.8125rem] font-semibold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 sm:inline-flex",
                light
                  ? "bg-white/95 text-navy-900 hover:bg-white hover:shadow-lift"
                  : "bg-navy-900 text-white hover:bg-navy-800 hover:shadow-lift",
              )}
            >
              Contact Us
            </Link>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "inline-flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300 lg:hidden",
                open
                  ? "border-white/30 text-white"
                  : light
                    ? "border-white/35 text-white hover:bg-white/10"
                    : "border-line-strong text-navy-900 hover:bg-navy-50",
              )}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden="true" className="relative block h-3 w-5">
                <span
                  className={cn(
                    "absolute left-0 block h-[1.5px] w-5 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    open ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-[1.5px] w-5 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    open ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / tablet panel */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="lg:hidden"
      >
        <div className="glass-navy h-[calc(100dvh-5rem)] overflow-y-auto rounded-b-[2.5rem] border-t border-white/10 sm:h-[calc(100dvh-6rem)]">
          <div className="container-page flex min-h-full flex-col justify-between py-10">
            <nav aria-label="Primary (mobile)">
              <ul className="space-y-1">
                {[{ href: "/", label: "Home", hint: "Building Trust Since 1973" }, ...navLinks].map(
                  (link, index) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        className="group flex items-baseline justify-between gap-4 rounded-3xl px-4 py-4 transition-colors duration-300 hover:bg-white/[0.06]"
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        <span>
                          <span className="block font-display text-[1.75rem] leading-tight text-white">
                            {link.label}
                          </span>
                          <span className="mt-1 block text-[0.8125rem] text-navy-100/60">
                            {link.hint}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-2 h-1.5 w-1.5 shrink-0 rounded-full transition-opacity duration-300",
                            isActive(link.href)
                              ? "bg-brass-500 opacity-100"
                              : "bg-white opacity-0 group-hover:opacity-60",
                          )}
                        />
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <div className="mt-10 space-y-4">
              <Link
                href="/contact"
                className="flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-[0.9375rem] font-semibold text-navy-900"
              >
                Contact Us
              </Link>
              <div className="flex flex-col gap-1 px-4 pb-2 text-[0.875rem] text-navy-100/70">
                <a href={contact.phoneHref} className="link-underline w-fit">
                  {contact.phoneDisplay}
                </a>
                <a href={contact.emailHref} className="link-underline w-fit">
                  {contact.emailDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
