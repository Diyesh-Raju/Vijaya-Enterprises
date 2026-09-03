"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { observeReveal, prefersReducedMotion } from "@/lib/scroll";

/** How the block arrives. `up` is the default: it rises into place. */
export type RevealVariant = "up" | "fade" | "left" | "right" | "scale";

type RevealProps = {
  children: ReactNode;
  /** Stagger in milliseconds. */
  delay?: number;
  className?: string;
  as?: ElementType;
  variant?: RevealVariant;
  /** Set false to animate once and stay put. */
  replay?: boolean;
};

/**
 * Scroll-in animation, driven by the site's one shared observer.
 *
 * This used to build an `IntersectionObserver` per element. On the longer
 * pages that is a hundred of them, each with its own callback and its own
 * threshold list, all watching the same scroll — and every one of them a
 * separate piece of bookkeeping for the browser to carry on every frame.
 * They are all one observer now (`lib/scroll.ts`), which is what the
 * reference layout does and the single biggest reason its scrolling stays
 * smooth with the same number of reveals on the page. Where the fold is, and
 * how much of a block has to have crossed it, are decided there — so every
 * reveal on the site fires on the same rule.
 *
 * The visible state is written straight to the element's `data-reveal`
 * attribute rather than held in React state. Revealing is a switch on an
 * external system (the DOM), so a re-render buys nothing — and this way a
 * page with a hundred reveals does zero extra React work. Only `opacity` and
 * `transform` animate, so every reveal stays on the compositor and never
 * triggers layout.
 *
 * By default the animation replays: the element re-arms once it is *fully*
 * off screen, so scrolling back up and down plays it again.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  variant = "up",
  replay = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      el.dataset.reveal = "on";
    };

    // Reduced motion: show immediately, and never move.
    if (prefersReducedMotion()) {
      show();
      return;
    }

    const stop = observeReveal(el, (visible) => {
      if (visible) show();
      else if (replay) el.dataset.reveal = "off";
    });

    // No observer at all: content is never worth hiding for an effect.
    if (!stop) {
      show();
      return;
    }
    return stop;
  }, [replay]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-reveal="off"
      data-reveal-variant={variant === "up" ? undefined : variant}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
