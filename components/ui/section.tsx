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

export function Section({
  children,
  tone = "white",
  className,
  id,
  size = "md",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  size?: "sm" | "md" | "lg";
}) {
  const padding =
    size === "sm"
      ? "py-16 sm:py-20 lg:py-24"
      : size === "lg"
        ? "py-24 sm:py-32 lg:py-44"
        : "py-20 sm:py-28 lg:py-36";

  return (
    <section
      id={id}
      // `isolate` keeps decorative absolutely-positioned children from
      // escaping their section and overlapping the next one.
      className={cn("relative isolate", tones[tone], padding, className)}
    >
      {children}
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
