"use client";

import { useMemo, useState } from "react";
import { Container, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { ProjectCard } from "@/components/sections/project-card";
import { SelectMenu } from "@/components/ui/select-menu";
import { projects } from "@/lib/projects";

/**
 * Residential projects: a preference filter, a grid of project cards, and
 * progressive paging.
 *
 * Paging is cumulative rather than page-by-page — page 1 shows the first four,
 * page 2 shows those four plus two more, page 3 those six plus the last two.
 * "Next" is the same action as pressing the following number, so the two
 * controls stay in step.
 *
 * The list itself lives in `lib/projects.ts` so the project pages can read the
 * same records. Filter options are derived from it, so adding a project cannot
 * desync the controls.
 */

const FIRST_PAGE = 4;
const PER_ADDITIONAL_PAGE = 2;

/** The four preference filters, in the order they appear. */
const filters = [
  { key: "bhk", label: "BHK" },
  { key: "locality", label: "Locality" },
  { key: "status", label: "Status" },
  { key: "possession", label: "Possession" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

/** Options come from the data, so adding a project cannot desync the filters. */
const optionsFor = (key: FilterKey) =>
  [...new Set(projects.flatMap((project) => project[key]))].sort();

/**
 * Filters worth showing.
 *
 * A control offering one value cannot narrow anything — while every project
 * reads simply "Bengaluru", the locality filter would just be noise. It comes
 * back on its own as soon as the data holds a second value.
 */
const usefulFilters = filters.filter(({ key }) => optionsFor(key).length > 1);

const ANY = "";

export function ApartmentProjects() {
  const [selected, setSelected] = useState<Record<FilterKey, string>>({
    bhk: ANY,
    locality: ANY,
    status: ANY,
    possession: ANY,
  });
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      projects.filter((project) =>
        filters.every(({ key }) => {
          if (selected[key] === ANY) return true;
          const value = project[key];
          // `bhk` holds every layout the project offers; the rest are single.
          return Array.isArray(value)
            ? value.includes(selected[key])
            : value === selected[key];
        }),
      ),
    [selected],
  );

  const totalPages =
    filtered.length <= FIRST_PAGE
      ? 1
      : 1 + Math.ceil((filtered.length - FIRST_PAGE) / PER_ADDITIONAL_PAGE);

  // Clamp during render rather than correcting state in an effect: filtering
  // can shrink the list under the current page.
  const currentPage = Math.min(page, totalPages);
  const visibleCount = Math.min(
    FIRST_PAGE + (currentPage - 1) * PER_ADDITIONAL_PAGE,
    filtered.length,
  );
  const visible = filtered.slice(0, visibleCount);
  const hasMore = currentPage < totalPages;
  const isFiltered = filters.some(({ key }) => selected[key] !== ANY);

  const choose = (key: FilterKey, value: string) => {
    setSelected((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  };

  const clear = () => {
    setSelected({ bhk: ANY, locality: ANY, status: ANY, possession: ANY });
    setPage(1);
  };

  return (
    <section
      id="residential-projects"
      className="relative isolate bg-mist py-20 sm:py-28 lg:py-36"
    >
      <Container>
        {/* Heading */}
        <Reveal>
          <Eyebrow>Residential Portfolio</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-balance-head mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
            Residential Projects
            <svg
              viewBox="0 0 44 16"
              aria-hidden="true"
              className="h-[0.5em] w-auto shrink-0 text-rosegold-600"
            >
              <path
                d="M1 8h40M34 2l7 6-7 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </h2>
        </Reveal>

        {/* Preference filters. The wrapper is lifted because each `Reveal`
            animates a transform and so opens its own stacking context — an
            open menu could not otherwise paint over the cards below it. */}
        <Reveal delay={140} className="relative z-20">
          <div className="mt-10 flex flex-wrap items-center gap-3 sm:mt-12">
            {usefulFilters.map(({ key, label }) => (
              <SelectMenu
                key={key}
                label={label}
                value={selected[key]}
                options={optionsFor(key)}
                onChange={(value) => choose(key, value)}
              />
            ))}

            {isFiltered && (
              <button
                type="button"
                onClick={clear}
                className="link-underline ml-1 text-[0.8125rem] font-semibold text-slate-muted transition-colors hover:text-navy-900"
              >
                Clear all
              </button>
            )}
          </div>
        </Reveal>

        {/* Count, announced when the filters change */}
        <p aria-live="polite" className="mt-6 text-[0.875rem] text-slate-muted">
          {filtered.length === 0
            ? "No projects match these preferences."
            : `Showing ${visible.length} of ${filtered.length} project${filtered.length === 1 ? "" : "s"}.`}
        </p>

        {/* Project grid */}
        {filtered.length > 0 ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-10 lg:gap-7">
            {visible.map((project, index) => (
              <Reveal
                key={project.name}
                as="li"
                delay={(index % 2) * 80}
                className="group"
              >
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[1.75rem] border border-line bg-white p-12 text-center">
            <p className="font-display text-[1.375rem] text-navy-900">
              Nothing matches that combination yet.
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-6 inline-flex rounded-full bg-navy-900 px-7 py-3 text-[0.875rem] font-semibold text-white transition-colors duration-300 hover:bg-navy-800"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Numbered pages. "Next" advances one page, exactly as the numbers do. */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center sm:mt-14">
            <nav aria-label="Projects pagination">
              <ul className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (number) => (
                    <li key={number}>
                      <button
                        type="button"
                        onClick={() => setPage(number)}
                        aria-current={number === currentPage ? "page" : undefined}
                        aria-label={`Page ${number}`}
                        className={cn(
                          "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[0.875rem] font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          number === currentPage
                            ? "bg-navy-900 text-white"
                            : "border border-line-strong bg-white text-navy-800 hover:border-navy-300 hover:bg-white hover:shadow-soft",
                        )}
                      >
                        {number}
                      </button>
                    </li>
                  ),
                )}

                {hasMore && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setPage(currentPage + 1)}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-line-strong bg-white px-5 text-[0.875rem] font-semibold text-navy-800 transition-all duration-300 hover:border-navy-300 hover:shadow-soft"
                    >
                      Next
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </Container>
    </section>
  );
}
