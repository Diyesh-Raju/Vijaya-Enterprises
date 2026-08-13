import Link from "next/link";
import type { StaticImageData } from "next/image";
import { Frame, type Ratio } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";

export type Vertical = {
  href: string;
  title: string;
  body: string;
  image: StaticImageData;
  imageAlt: string;
};

/**
 * One construction vertical. The whole card is a single link (the heading
 * carries the accessible name via `after:inset-0`, so there is one tab stop
 * and one announced link rather than three).
 */
export function VerticalCard({
  vertical,
  index,
  ratio = "landscape",
  sizes,
}: {
  vertical: Vertical;
  index: number;
  ratio?: Ratio;
  sizes?: string;
}) {
  return (
    <Reveal delay={(index % 3) * 90} className="group relative flex flex-col">
      <Frame
        src={vertical.image}
        alt={vertical.imageAlt}
        ratio={ratio}
        sizes={sizes}
        rounded="rounded-[1.75rem] sm:rounded-[2rem]"
      />

      <div className="flex flex-1 flex-col pt-7">
        <span
          aria-hidden="true"
          className="font-display text-[0.875rem] tabular-nums text-brass-600"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <h3 className="mt-3 font-display text-[1.5rem] leading-tight text-navy-900 sm:text-[1.75rem]">
          <Link
            href={vertical.href}
            className="after:absolute after:inset-0 after:rounded-[2rem] after:content-['']"
          >
            {vertical.title}
          </Link>
        </h3>

        <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-slate-body">
          {vertical.body}
        </p>

        <span
          aria-hidden="true"
          className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-semibold tracking-wide text-navy-800 transition-colors duration-300 group-hover:text-brass-600"
        >
          Explore
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
            <path
              d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Reveal>
  );
}
