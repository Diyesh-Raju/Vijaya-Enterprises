"use client";

import { CurtainPhoto } from "@/components/sections/curtain-photo";
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
    href: "/civil-contracts",
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

          Two cloths, one per shape of screen, and only ever one of them
          fetched — `CurtainPhoto` is the branch, and the note on it is why
          this cannot be two `<Image>`s and a `desk:hidden`: a hidden image
          is still downloaded.

          The panel is landscape on a laptop and a tall column on a phone,
          and one photograph cannot serve both. The laptop's drape folds
          across the frame, which reads along a wide band and comes out as a
          crop of one fold turned on its side down a phone. The phone's runs
          corner to corner, which is a diagonal in a portrait frame and a
          bar across a wide one.

          Decorative, so neither carries alt text: the panel says what it is
          in the heading beside it.

          The wrapper is what puts them behind the type — `CurtainPhoto`
          draws at its parent's level and has no z-index of its own, and the
          veil below is at `-z-10` too. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <CurtainPhoto
          wide={{ src: img.backdropFabric, alt: "", position: "50% 50%" }}
          phone={{ src: img.backdropFabricPhone, alt: "", position: "50% 50%" }}
        />
      </div>
      {/* A veil to lift the fabric back off the type. Warm rather than white,
          so the cloth keeps its colour instead of reading as a grey wash. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,252,248,0.62)_0%,rgba(255,252,248,0.5)_50%,rgba(255,252,248,0.66)_100%)]"
      />

      <Container>
        <div className="flex flex-col items-start gap-5 desk:gap-10 lg:flex-row lg:gap-16">
          {/* The claim, held beside the controls while they are worked through. */}
          <div className="w-full lg:sticky lg:top-32 lg:w-[46%]">
            <Reveal className="reveal-still">
              {/* Sentence case, not the caps this panel opened with: a
                  sentence with a full stop set in tracked capitals reads as
                  shouting rather than as an invitation. */}
              <h2 className="text-balance-head font-sans text-[clamp(1.5rem,4vw,3rem)] font-semibold leading-[1.12] tracking-[-0.015em] text-navy-950">
                Let&rsquo;s find the right home for your family.
              </h2>
            </Reveal>
          </div>

          <div className="w-full lg:w-[54%]">
            <Reveal className="reveal-still" delay={80}>
              {/* Discipline tabs, drawn as one segmented pill: a rounded
                  track, hairline dividers between the choices, and the
                  selected one filled. The underline they used to carry said
                  "tab"; a track with one lit segment says "this many options,
                  and you are on this one" without having to be read.

                  The pill is cut out of the panel rather than laid on it:
                  there is a photograph behind it now, and the track is the
                  hairline plus whatever the cloth is doing underneath. Only
                  the selected segment takes a fill. */}
              <div className="hide-scrollbar mb-5 -mx-1 overflow-x-auto px-1 pb-1 desk:mb-9">
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
                            "flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[0.8125rem] font-medium",
                            "desk:px-5 desk:py-2.5 desk:text-[0.875rem]",
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

            <Reveal className="reveal-still" delay={160}>
              {/* On a phone: project type beside status, location centred under
                  the pair, then the two ranges at full width one below the
                  other.

                  Five columns rather than two, because none of those rows
                  wants halving. Project type has to hold "Institutional
                  Building" and location "Elsewhere in Karnataka" — both want
                  around 144px for the value, and half a phone's width leaves
                  119px, so both would ellipse. Three fifths gives them 157px
                  and clears it; status is only ever a word ("Ongoing",
                  "Completed", "Sold Out") and is comfortable in the other
                  two. Location takes the same three fifths, started one
                  column in, which is what centres it under the pair.

                  The ranges go the full five. They were paired at one point
                  and the halves worked, but a rail with four stops is easier
                  to place a thumb on across a whole screen than across half
                  of one.

                  From `md` up every span reverts and the grid is the two
                  even columns it always was. */}
              <div className="grid grid-cols-5 gap-x-3 gap-y-4 desk:grid-cols-2 desk:gap-5">
                <SelectMenu
                  className="col-span-3 desk:col-span-1"
                  layout="stacked"
                  label="Project Type"
                  value={projectType}
                  options={active.projectTypes}
                  onChange={setProjectType}
                />
                <SelectMenu
                  className="col-span-2 desk:col-span-1"
                  layout="stacked"
                  label="Status"
                  value={status}
                  options={statuses}
                  onChange={setStatus}
                />
                <SelectMenu
                  className="col-span-3 col-start-2 desk:col-span-1 desk:col-start-auto"
                  layout="stacked"
                  label="Location"
                  value={location}
                  options={locations}
                  onChange={setLocation}
                />

                <div className="col-span-5 desk:col-span-1">
                  <span className="mb-1.5 block text-[0.625rem] font-bold uppercase tracking-[0.16em] text-navy-800 desk:mb-2 desk:tracking-[0.18em]">
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
                <div className="col-span-5 flex justify-center desk:col-span-2">
                  <div className="w-full desk:w-[calc(50%-0.625rem)]">
                    <span className="mb-1.5 block text-[0.625rem] font-bold uppercase tracking-[0.16em] text-navy-800 desk:mb-2 desk:tracking-[0.18em]">
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

            <Reveal className="reveal-still" delay={240}>
              <Link
                href={active.href}
                className={cn(
                  "mt-6 block w-full rounded-full border border-white/25 py-3 text-center",
                  "text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white",
                  "desk:mt-8 desk:py-3.5 desk:text-[0.75rem] desk:tracking-[0.2em]",
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
