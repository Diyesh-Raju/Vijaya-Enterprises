"use client";

import Link from "next/link";
import { useState } from "react";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SelectMenu } from "@/components/ui/select-menu";
import { StepRange } from "@/components/ui/step-range";
import { projects } from "@/lib/projects";
import { cn } from "@/lib/cn";

/**
 * The enquiry panel that sits directly under the hero: a headline on the left,
 * a set of preference controls on the right.
 *
 * It states an interest rather than querying an index — Vijaya's listing pages
 * carry their own filters, so "Search" hands the visitor to the page for the
 * discipline they picked with their preferences in mind, instead of pretending
 * to run a search across stock that is not there yet.
 */

/**
 * Each tab re-scopes the project types and points the button at the page that
 * discipline lives on. Everything else on the panel reads the same across all
 * three, the way the tabs on the reference layout do.
 */
const tabs = [
  {
    label: "Residential",
    href: "/residential",
    projectTypes: ["Apartment", "Villa", "Plotted Development"],
  },
  {
    label: "Commercial",
    href: "/commercial-contracts",
    projectTypes: [
      "Commercial Building",
      "Office Space",
      "Industrial Facility",
      "Warehouse",
      "Institutional Building",
    ],
  },
  {
    label: "Joint Ventures",
    href: "/joint-ventures",
    projectTypes: [
      "Residential Development",
      "Commercial Development",
      "Mixed Use Development",
    ],
  },
] as const;

/** Taken from the project records, so adding a project cannot desync it. */
const statuses = [...new Set(projects.map((project) => project.status))];

/**
 * Where the visitor is looking, not where we hold stock — Vijaya works across
 * Karnataka, and every project on file today is in Bengaluru.
 */
const locations = ["Bengaluru", "Elsewhere in Karnataka"];

/** Benchmarks, not a continuous scale: three bands apiece. See `StepRange`. */
const areaStops = [1_500, 2_500, 5_000, 10_000];
const budgetStops = [75_00_000, 1_50_00_000, 3_00_00_000, 6_00_00_000];

/** Grouped by hand: `toLocaleString` depends on the runtime's ICU data, which
 *  is not guaranteed to agree between the server render and the browser. */
const formatArea = (squareFeet: number) =>
  String(squareFeet).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const formatBudget = (rupees: number) =>
  rupees >= 1_00_00_000
    ? `₹${(rupees / 1_00_00_000).toFixed(1)} Cr`
    : `₹${(rupees / 1_00_000).toFixed(1)} L`;

const FULL_RANGE: [number, number] = [0, 3];

/**
 * The controls open on a real preference rather than on "Any".
 *
 * A row of "Any" reads as an empty form waiting to be filled in; a row of
 * plausible values reads as a starting point to adjust. Every option, "Any"
 * included, is still one press away in the menu.
 */
const firstOf = (options: readonly string[]) => options[0];

export function FindResidences() {
  const [tab, setTab] = useState(0);
  const [projectType, setProjectType] = useState(firstOf(tabs[0].projectTypes));
  const [status, setStatus] = useState(firstOf(statuses));
  const [location, setLocation] = useState(firstOf(locations));
  const [area, setArea] = useState<[number, number]>(FULL_RANGE);
  const [budget, setBudget] = useState<[number, number]>(FULL_RANGE);

  const active = tabs[tab];

  return (
    <Section tone="mist" size="md">
      <Container>
        <div className="flex flex-col items-start gap-10 sm:gap-14 lg:flex-row lg:gap-24">
          {/* The claim, held beside the controls while they are worked through. */}
          <div className="w-full lg:sticky lg:top-32 lg:w-[55%]">
            <Reveal>
              <h2 className="font-sans text-[clamp(1.5rem,3.4vw,2.5rem)] font-semibold uppercase leading-[1.2] tracking-[0.06em] text-navy-900">
                <span className="block sm:whitespace-nowrap">
                  Find <span className="text-rosegold-600">Residences</span>
                </span>
                <span className="block sm:whitespace-nowrap">Built For</span>
                <span className="block sm:whitespace-nowrap">
                  Luxury And <span className="text-rosegold-600">Legacy.</span>
                </span>
              </h2>
            </Reveal>
          </div>

          <div className="w-full lg:w-[60%]">
            <Reveal delay={80}>
              {/* Discipline tabs */}
              <div className="hide-scrollbar mb-8 flex items-center gap-5 overflow-x-auto border-b border-line pb-4 sm:mb-12 sm:gap-8">
                {tabs.map((entry, index) => {
                  const selected = index === tab;

                  return (
                    <button
                      key={entry.label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setTab(index);
                        // The types on offer change with the tab, so a choice
                        // made under the old one would no longer be selectable.
                        setProjectType(firstOf(entry.projectTypes));
                      }}
                      className={cn(
                        "relative flex-shrink-0 whitespace-nowrap pb-1 text-[0.75rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-300",
                        selected
                          ? "text-rosegold-600"
                          : "text-slate-muted hover:text-navy-800",
                      )}
                    >
                      {entry.label}
                      {selected && (
                        <span
                          aria-hidden="true"
                          className="absolute -bottom-[17px] left-0 h-[2px] w-full rounded-full bg-rosegold-600"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <SelectMenu
                  layout="stacked"
                  label="Project Type"
                  value={projectType}
                  options={active.projectTypes}
                  onChange={setProjectType}
                />
                <SelectMenu
                  layout="stacked"
                  label="Status"
                  value={status}
                  options={statuses}
                  onChange={setStatus}
                />
                <SelectMenu
                  layout="stacked"
                  label="Location"
                  value={location}
                  options={locations}
                  onChange={setLocation}
                />

                <div>
                  <span className="mb-2 block text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-rosegold-600">
                    Area (Sq.Ft)
                  </span>
                  <StepRange
                    label="Area in square feet"
                    stops={areaStops}
                    value={area}
                    onChange={setArea}
                    format={formatArea}
                  />
                </div>

                {/* Budget sits on its own row, centred under the pair above. */}
                <div className="flex justify-center sm:col-span-2">
                  <div className="w-full sm:w-[calc(50%-0.875rem)]">
                    <span className="mb-2 block text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-rosegold-600">
                      Budget
                    </span>
                    <StepRange
                      label="Budget"
                      stops={budgetStops}
                      value={budget}
                      onChange={setBudget}
                      format={formatBudget}
                    />
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <Link
                href={active.href}
                className={cn(
                  "mt-10 block w-full rounded-full border border-white/50 py-4 text-center",
                  "text-[0.75rem] font-bold uppercase tracking-[0.2em] text-white",
                  "bg-[linear-gradient(135deg,rgba(164,119,116,0.9)_0%,#b76e79_100%)]",
                  "shadow-[0_8px_24px_0_rgba(183,110,121,0.2),inset_0_1px_0_0_rgba(255,255,255,0.4)]",
                  "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.99]",
                )}
              >
                Search Properties
              </Link>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
