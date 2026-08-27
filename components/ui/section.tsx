import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

type Tone = "white" | "mist" | "navy" | "navy-deep";

const tones: Record<Tone, string> = {
  white: "bg-white",
  mist: "bg-mist",
  navy: "bg-navy-900 text-white",
  "navy-deep": "bg-navy-deep text-white",
};

/** Vertical rhythm below `lg`, where a pinned section is an ordinary one. */
const padding: Record<"sm" | "md" | "lg", string> = {
  sm: "py-16 sm:py-20",
  md: "py-20 sm:py-28",
  lg: "py-24 sm:py-32",
};

/** …and from `lg` up, unless the section pins (see `pin` below). */
const paddingLg: Record<"sm" | "md" | "lg", string> = {
  sm: "lg:py-24",
  md: "lg:py-36",
  lg: "lg:py-44",
};

/**
 * A pinned section holds still while the page keeps scrolling and lets what
 * follows ride up over it. It sticks one screen tall under the header, so its
 * own `lg` padding is replaced by a floor — the content is centred in the
 * screen it holds, and the padding only comes into play on a window too short
 * to seat it.
 *
 * Nothing here manages z-index: every section is opaque, so a later one in the
 * DOM paints over a pinned earlier one on its way up. The pin therefore only
 * works while what follows it is opaque too.
 *
 * Below `lg` the pin is dropped. Layouts stack there into something taller
 * than a screen, and a sticky band taller than the screen it sticks to can
 * only ever show its top.
 */
const pinned =
  "lg:sticky lg:top-[var(--header-h)] lg:flex lg:min-h-[calc(100svh-var(--header-h))] lg:items-center lg:py-16";

export function Section({
  children,
  tone = "white",
  className,
  id,
  size = "md",
  pin = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  size?: "sm" | "md" | "lg";
  pin?: boolean;
}) {
  return (
    <section
      id={id}
      // `isolate` keeps decorative absolutely-positioned children from
      // escaping their section and overlapping the next one.
      className={cn(
        "relative isolate",
        tones[tone],
        padding[size],
        pin ? pinned : paddingLg[size],
        className,
      )}
    >
      {/* Pinned, the section is a centring flex box, so its content needs one
          full-width child to lay out inside rather than shrink to fit. */}
      {pin ? <div className="w-full">{children}</div> : children}
    </section>
  );
}

export function Eyebrow({
  children,
  className,
  onNavy = false,
}: {
  children: ReactNode;
  className?: string;
  onNavy?: boolean;
}) {
  return (
    <p
      className={cn(
        "eyebrow-rule text-[0.6875rem] font-semibold uppercase tracking-[0.3em]",
        onNavy ? "text-brass-400" : "text-brass-600",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  onNavy = false,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  onNavy?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <Eyebrow
            onNavy={onNavy}
            className={align === "center" ? "justify-center" : undefined}
          >
            {eyebrow}
          </Eyebrow>
        </Reveal>
      )}
      <Reveal delay={80}>
        <Tag
          className={cn(
            "text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.08]",
            onNavy && "text-white",
          )}
        >
          {title}
        </Tag>
      </Reveal>
      {lead && (
        <Reveal delay={160}>
          <div
            className={cn(
              "mt-6 text-[1.0625rem] leading-[1.75] sm:text-[1.125rem]",
              onNavy ? "text-navy-100/85" : "text-slate-body",
            )}
          >
            {lead}
          </div>
        </Reveal>
      )}
    </div>
  );
}
