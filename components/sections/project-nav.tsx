"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/line-icons";
import { cn } from "@/lib/cn";

/** About is the project's index route; the rest are pages beneath it. */
const sections = [
  { segment: "", label: "About" },
  { segment: "floor-plans", label: "Floor Plans" },
  { segment: "amenities", label: "Amenities" },
  { segment: "location", label: "Location" },
  { segment: "gallery", label: "Gallery" },
] as const;

/**
 * The tab strip under a project hero.
 *
 * Each tab is a route of its own, so a section can be linked to and shared,
 * and the hero above stays put while only the panel below changes.
 */
export function ProjectNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/residential/${slug}`;

  return (
    <div className="sticky top-20 z-30 border-y border-line bg-white/85 backdrop-blur-md sm:top-24">
      <div className="container-page">
        {/* Three columns from `sm` up so the tabs stay centred on the page
            rather than being pushed along by the back link beside them. */}
        <div className="flex items-center gap-3 py-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
          <Link
            href="/residential#residential-projects"
            className="group inline-flex shrink-0 items-center gap-2 text-[0.8125rem] font-semibold text-navy-800 transition-colors duration-300 hover:text-navy-900 sm:justify-self-start"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1" />
            {/* Two labels rather than one plus a nested span: a bare text node
                would become its own flex item and pick up the row's gap. */}
            <span className="sm:hidden">Back</span>
            <span className="hidden whitespace-nowrap sm:inline">
              Back to Projects
            </span>
          </Link>

          <nav
            aria-label="Project sections"
            className="-mx-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto sm:flex-none sm:gap-3"
          >
            {sections.map(({ segment, label }) => {
              const href = segment ? `${base}/${segment}` : base;
              const active = pathname === href;

              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-5 py-2.5 text-[0.8125rem] font-semibold transition-colors duration-300",
                    active
                      ? "bg-navy-900 text-white"
                      : "border border-line-strong text-navy-800 hover:border-navy-300 hover:bg-navy-50",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Balances the back link so the tab group sits on the page centre. */}
          <span aria-hidden="true" className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
