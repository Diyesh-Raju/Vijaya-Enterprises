"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Container, Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SelectMenu } from "@/components/ui/select-menu";
import { StepRange } from "@/components/ui/step-range";
import { projects } from "@/lib/projects";
import { img } from "@/lib/images";
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
 * intent lives on. Everything else on the panel reads the same across all
 * three, the way the tabs on the reference layout do.
 *
 * ⚠️ Nothing on this site lists rentals, so Rent hands the visitor to the
 * enquiry form rather than to a page that would come up empty. Point it
 * somewhere better the moment there is a lettings page to point it at.
 */
const tabs = [
  {
    label: "Buy",
    href: "/residential",
    projectTypes: ["Apartment", "Villa", "Plotted Development"],
  },
  {
    label: "Rent",
    href: "/contact",
    projectTypes: ["Apartment", "Villa", "Office Space", "Commercial Building"],
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

/**
 * Which status the panel opens on, named rather than taken off the top of the
 * list. The list is in file order, so the opening preference used to be
 * whichever project happened to sit first in `lib/projects.ts` — and the day
 * that project sold out, the panel opened on "Sold Out", the one status
 * nobody is shopping for. Falls back to the first if the data stops carrying
 * this one.
 */
const OPENING_STATUS = "Ongoing";
const openingStatus = statuses.includes(OPENING_STATUS)
  ? OPENING_STATUS
  : firstOf(statuses);

export function FindResidences() {
  const [tab, setTab] = useState(0);
  const [projectType, setProjectType] = useState(firstOf(tabs[0].projectTypes));
  const [status, setStatus] = useState(openingStatus);
  const [location, setLocation] = useState(firstOf(locations));
  const [area, setArea] = useState<[number, number]>(FULL_RANGE);
  const [budget, setBudget] = useState<[number, number]>(FULL_RANGE);

  const active = tabs[tab];

  return (
    <Section tone="mist" size="sm" className="overflow-hidden">
      {/* Cloth, not colour. The controls on this panel are all transparent
          now, so what they are cut out of has to be worth looking at — and a
          soft, evenly lit drape gives them something to sit on without
          competing with the type. `-z-10` inside the section's own stacking
          context, so nothing here can climb over the page.

          Decorative, so it carries no alt text: the panel says what it is in
          the heading beside it. */}
      <Image
        src={img.backdropFabric}
        alt=""
        fill
        sizes="100vw"
        quality={85}
        placeholder="blur"
        className="-z-10 object-cover"
      />
      {/* A veil to lift the fabric back off the type. Warm rather than white,
          so the cloth keeps its colour instead of reading as a grey wash. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,252,248,0.62)_0%,rgba(255,252,248,0.5)_50%,rgba(255,252,248,0.66)_100%)]"
      />

      <Container>
        <div className="flex flex-col items-start gap-8 sm:gap-10 lg:flex-row lg:gap-16">
          {/* The claim, held beside the controls while they are worked through. */}
          <div className="w-full lg:sticky lg:top-32 lg:w-[46%]">
            <Reveal>
              {/* Sentence case, not the caps this panel opened with: a
                  sentence with a full stop set in tracked capitals reads as
                  shouting rather than as an invitation. */}
              <h2 className="text-balance-head font-sans text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.12] tracking-[-0.015em] text-navy-950">
                Let&rsquo;s find the right home for your family.
              </h2>
            </Reveal>
          </div>

          <div className="w-full lg:w-[54%]">
            <Reveal delay={80}>
              {/* Discipline tabs, drawn as one segmented pill: a rounded
                  track, hairline dividers between the choices, and the
                  selected one filled. The underline they used to carry said
                  "tab"; a track with one lit segment says "this many options,
                  and you are on this one" without having to be read.

                  The pill is cut out of the panel rather than laid on it:
                  there is a photograph behind it now, and the track is the
                  hairline plus whatever the cloth is doing underneath. Only
                  the selected segment takes a fill. */}
              <div className="hide-scrollbar mb-7 -mx-1 overflow-x-auto px-1 pb-1 sm:mb-9">
                <div className="inline-flex items-center rounded-full border border-navy-900/25 bg-transparent p-1.5">
                  {tabs.map((entry, index) => {
                    const selected = index === tab;
                    // A divider beside the filled segment would sit against
                    // its edge and read as a seam, so the two either side of
                    // the selection stand down.
                    const touchesSelected = index === tab || index - 1 === tab;

                    return (
                      <Fragment key={entry.label}>
                        {index > 0 && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "h-4 w-px shrink-0 transition-colors duration-300",
                              touchesSelected ? "bg-transparent" : "bg-navy-900/20",
                            )}
                          />
                        )}

                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            setTab(index);
                            // The types on offer change with the tab, so a
                            // choice made under the old one would no longer be
                            // selectable.
                            setProjectType(firstOf(entry.projectTypes));
                          }}
                          className={cn(
                            "flex-shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-[0.875rem] font-medium",
                            "transition-[background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                            selected
                              ? "bg-navy-950 text-white"
                              : "text-slate-muted hover:bg-navy-50 hover:text-navy-900",
                          )}
                        >
                          {entry.label}
                        </button>
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                  <span className="mb-2 block text-[0.625rem] font-bold uppercase tracking-[0.18em] text-navy-800">
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
                  <div className="w-full sm:w-[calc(50%-0.625rem)]">
                    <span className="mb-2 block text-[0.625rem] font-bold uppercase tracking-[0.18em] text-navy-800">
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
                  "mt-8 block w-full rounded-full border border-white/25 py-3.5 text-center",
                  "text-[0.75rem] font-bold uppercase tracking-[0.2em] text-white",
                  "bg-[linear-gradient(135deg,rgba(22,48,95,0.94)_0%,#0a1f44_100%)]",
                  "shadow-[0_8px_24px_0_rgba(10,31,68,0.24),inset_0_1px_0_0_rgba(255,255,255,0.28)]",
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
