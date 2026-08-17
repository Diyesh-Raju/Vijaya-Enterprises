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
  /** Set false to animate once and stay put. */
  replay?: boolean;
};

/**
 * Scroll-in animation using a single IntersectionObserver per element.
 *
 * Deliberately not a motion library: this is ~60 lines, adds nothing to the
 * bundle worth measuring, and cannot break on a React upgrade.
 *
 * The visible state is written straight to the element's `data-reveal`
 * attribute rather than held in React state. Revealing is a switch on an
 * external system (the DOM), so a re-render buys nothing — and this way a
 * page with a hundred reveals does zero extra React work. Only `opacity`,
 * `transform` and `filter` animate, so every reveal stays on the compositor
 * and never triggers layout.
 *
 * By default the animation replays: the element re-arms once it is *fully*
 * off screen, so scrolling back up and down plays it again. Re-arming only
 * at ratio 0 is what stops it flickering while it sits half on screen.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  amount = 0.15,
  replay = true,
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
          // A block taller than the viewport can never reach `amount` of
          // itself on screen, so treat "any of it is showing" as enough.
          const viewportHeight =
            entry.rootBounds?.height ?? window.innerHeight ?? 0;
          const tallerThanViewport =
            entry.boundingClientRect.height >= viewportHeight * 0.75;

          if (
            entry.isIntersecting &&
            (entry.intersectionRatio >= amount || tallerThanViewport)
          ) {
            show();
          } else if (replay && entry.intersectionRatio === 0) {
            el.dataset.reveal = "off";
          }
        }
      },
      { threshold: [0, amount], rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [amount, replay]);

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
