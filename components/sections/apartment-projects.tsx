"use client";

import { useMemo, useState } from "react";
import { Container, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

/**
 * Apartment projects: a preference filter, a grid of project cards, and
 * progressive paging.
 *
 * Paging is cumulative rather than page-by-page — page 1 shows the first six,
 * page 2 shows those six plus three more. "See more" is the same action as
 * pressing the next number, so the two controls stay in step.
 *
 * ⚠️ The nine entries below are placeholders. Replace `projects` with the real
 * developments (and give each a cover image) when the project list exists —
 * the filters read straight off these fields, so they will keep working.
 */

const FIRST_PAGE = 6;
const PER_ADDITIONAL_PAGE = 3;

type Project = {
  name: string;
  bhk: string;
  locality: string;
  status: string;
  possession: string;
};

const projects: Project[] = [
  { name: "Project 1", bhk: "2 BHK", locality: "North Bengaluru", status: "Ongoing", possession: "Within a year" },
  { name: "Project 2", bhk: "3 BHK", locality: "North Bengaluru", status: "Completed", possession: "Ready to move" },
  { name: "Project 3", bhk: "2 BHK", locality: "East Bengaluru", status: "Ongoing", possession: "One to three years" },
  { name: "Project 4", bhk: "4 BHK", locality: "South Bengaluru", status: "Upcoming", possession: "One to three years" },
  { name: "Project 5", bhk: "3 BHK", locality: "East Bengaluru", status: "Completed", possession: "Ready to move" },
  { name: "Project 6", bhk: "2 BHK", locality: "West Bengaluru", status: "Ongoing", possession: "Within a year" },
  { name: "Project 7", bhk: "3 BHK", locality: "South Bengaluru", status: "Ongoing", possession: "Within a year" },
  { name: "Project 8", bhk: "4 BHK", locality: "North Bengaluru", status: "Upcoming", possession: "One to three years" },
  { name: "Project 9", bhk: "3 BHK", locality: "West Bengaluru", status: "Completed", possession: "Ready to move" },
];

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
  [...new Set(projects.map((project) => project[key]))].sort();

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
        filters.every(
          ({ key }) => selected[key] === ANY || project[key] === selected[key],
        ),
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
    <section className="relative isolate bg-mist py-20 sm:py-28 lg:py-36">
      <Container>
        {/* Heading */}
        <Reveal>
          <Eyebrow>Residential Portfolio</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-balance-head mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
            Apartment Projects
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

        {/* Preference filters */}
        <Reveal delay={140}>
          <div className="mt-10 flex flex-wrap items-center gap-3 sm:mt-12">
            {filters.map(({ key, label }) => (
              <label
                key={key}
                className={cn(
                  "group inline-flex items-center gap-2.5 rounded-full border bg-white py-2.5 pl-5 pr-3 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-soft",
                  selected[key] === ANY
                    ? "border-line-strong"
                    : "border-rosegold-400",
                )}
              >
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-slate-muted">
                  {label}
                </span>
                <select
                  value={selected[key]}
                  onChange={(event) => choose(key, event.target.value)}
                  aria-label={`Filter by ${label}`}
                  className="cursor-pointer appearance-none bg-transparent pr-6 text-[0.875rem] font-semibold text-navy-900 focus:outline-none focus-visible:outline-none"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%230a1f44' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right center",
                    backgroundSize: "1rem",
                  }}
                >
                  <option value={ANY}>Any</option>
                  {optionsFor(key).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
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
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-10 lg:grid-cols-3">
            {visible.map((project, index) => (
              <Reveal
                key={project.name}
                as="li"
                delay={(index % 3) * 80}
                className="group"
              >
                <article className="border-rosegold flex aspect-[4/5] flex-col items-center justify-center rounded-[1.5rem] bg-white p-8 text-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 sm:rounded-[1.75rem]">
                  <h3 className="font-display text-[1.5rem] leading-tight text-navy-900 sm:text-[1.75rem]">
                    {project.name}
                  </h3>
                  <p className="mt-3 text-[0.8125rem] uppercase tracking-[0.16em] text-slate-muted">
                    {project.bhk} · {project.status}
                  </p>
                </article>
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

        {/* See more + numbered pages — two controls, one action */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-7 sm:mt-14">
            {hasMore && (
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                className="group inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-white px-8 py-3.5 text-[0.875rem] font-semibold text-navy-900 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-soft"
              >
                See More
                <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5">
                  <path
                    d="M8 3v9.5M4.5 9 8 12.5 11.5 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

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
