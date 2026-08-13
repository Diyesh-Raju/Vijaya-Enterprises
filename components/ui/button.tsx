import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "light" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2.5 rounded-full font-semibold " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-300 " +
  "ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-navy-900 text-white shadow-soft hover:bg-navy-800 hover:shadow-lift",
  outline:
    "border border-line-strong bg-white text-navy-900 hover:border-navy-300 hover:bg-navy-50",
  light: "bg-white text-navy-900 shadow-soft hover:bg-navy-50 hover:shadow-lift",
  ghost:
    "border border-white/30 text-white hover:border-white/60 hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "px-5 py-2.5 text-[0.8rem] tracking-wide",
  md: "px-7 py-3.5 text-[0.875rem] tracking-wide",
  lg: "px-9 py-4.5 text-[0.9375rem] tracking-wide",
};

/** Small chevron that slides on hover — the only motion the button needs. */
function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
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
  );
}

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  className?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const {
    children,
    variant = "primary",
    size = "md",
    withArrow = false,
    className,
    ...rest
  } = props;

  const classes = cn(base, variants[variant], sizes[size], className);

  if (typeof props.href === "string") {
    const { href, ...linkRest } = rest as ButtonAsLink;
    const external = /^(https?:|mailto:|tel:)/.test(href);

    if (external) {
      return (
        <a
          href={href}
          className={classes}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
          {withArrow && <Arrow />}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
        {withArrow && <Arrow />}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {children}
      {withArrow && <Arrow />}
    </button>
  );
}
