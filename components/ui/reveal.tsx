"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger in milliseconds. */
  delay?: number;
  className?: string;
  as?: ElementType;
  /** How much of the element must be visible before it animates in. */
  amount?: number;
};

/**
 * Scroll-in animation using a single IntersectionObserver per element.
 *
 * Deliberately not a motion library: this is ~40 lines, adds nothing to the
 * bundle worth measuring, and cannot break on a React upgrade.
 *
 * The visible state is written straight to the element's `data-reveal`
 * attribute rather than held in React state. Revealing is a one-way switch
 * on an external system (the DOM), so a re-render buys nothing — and this
 * way a page with a hundred reveals does zero extra React work. The animated
 * properties are `opacity`/`transform`/`filter` only, so every reveal stays
 * on the compositor and never triggers layout.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  amount = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      el.dataset.reveal = "on";
    };

    // No observer (or the user prefers reduced motion): show immediately.
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [amount]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-reveal="off"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
