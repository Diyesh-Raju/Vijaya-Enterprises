import { Reveal } from "@/components/ui/reveal";
import { Container, Section, Eyebrow } from "@/components/ui/section";
import { Frame } from "@/components/ui/media";
import { Counter } from "@/components/ui/counter";
import { CompassRoseEmblem, CrestEmblem } from "@/components/ui/emblem-icons";
import { Button } from "@/components/ui/button";
import {
  BuildingIcon,
  CivicBuildingIcon,
  FactoryIcon,
  FamilyHomeIcon,
  GraduationCapIcon,
  HospitalIcon,
  HourglassIcon,
  OfficeTowerIcon,
  SparkIcon,
} from "@/components/ui/line-icons";
import { img, alt } from "@/lib/images";
import { sectors } from "@/lib/site";
import type { ReactNode } from "react";

/**
 * "Who we build for" — the six kinds of client, flanking an arch.
 *
 * The layout is three columns: a stack of three labelled lines, a tall
 * arch-topped photograph, and three more lines. It replaces the two-column
 * copy-and-stat-card version, and it exists because the point of the section
 * is *breadth* — the company is unusual in having built for all of these —
 * and six named clients say that at a glance in a way two paragraphs cannot.
 *
 * Three things carry the shape and are worth not undoing:
 *
 *  • The middle column is `minmax(280px, min(38vw, 560px))`, not a fraction.
 *    The arch is a fixed 4:5 upright, so what the column does decides how
 *    tall the whole row is. A fraction alone is wrong at both ends: below
 *    1200 the picture has to give way to the six lines, which is what the
 *    `38vw` is for, and past about 1500 it would keep growing while the
 *    columns beside it shrink. The 560 ceiling stops it there.
 *  • The top radius is a clamp that reaches 280px — exactly half the widest
 *    the picture is ever drawn — so the crown reads as a true semicircular arch
 *    at every width rather than as a rounded rectangle. On a square frame that
 *    puts the springing line at the halfway mark: semicircle above, straight
 *    body below. The bottom stays square-ish (`2rem`, the site's
 *    `--radius-xl`), which is what makes it an arch and not a lozenge. The clamp's ceiling is deliberately past half the frame at
 *    the narrower laptop widths: CSS scales every radius down together once
 *    they overrun an edge, which lands the crown on an exact semicircle rather
 *    than short of one.
 *  • The frame is 4:5 — the client asked for a longer arch at the same width
 *    (2026-09-11), and it was square before that. What that ratio does depends
 *    entirely on which way up the photograph is, and the picture in it changed
 *    on 2026-09-12 from a landscape to an upright one. A landscape was cropped
 *    on its width and magnified to fill: 3:4 kept 45% of it, 1:1 kept 60%, 4:5
 *    kept 48%, and the zoom that came with each — 2.2x, 1.7x, 2.1x — was the
 *    real constraint on a 2000px source. The upright one is not magnified at
 *    all: 4:5 is wider than its own 2:3, so it keeps the whole width and is
 *    trimmed on its height instead. Square is still as wide as the frame goes,
 *    whatever is in it — past that the crown eats the top of the picture and
 *    the shape reads as a dome rather than an arch.
 *  • The three columns become one below `xl`, not below `lg`. At 1024 the
 *    split still technically fits, but only by leaving the lines 218px each,
 *    where half the six headings break across three rows. Stacked, the
 *    photograph goes first (`order-1`) — the arch is what introduces the
 *    section, and six lines above it with none below would bury it.
 *
 * The stats underneath are the numbers that used to sit in the panel on the
 * right — nothing was dropped, they moved under the showcase where they read
 * as a footing for all six clients rather than as a fact-box beside two
 * paragraphs. The fourth, sectors served, is counted off `sectors` in
 * `lib/site.ts`; the other three are stated.
 */

type Client = {
  title: string;
  body: string;
  icon: ReactNode;
};

/* Left of the arch, then right of it. Read as one list of six by a screen
   reader, which is the order they are written in here — the split into two
   columns is layout, and the markup keeps them in one flow per side so the
   reading order never depends on where the picture lands. */
const clientsLeft: readonly Client[] = [
  {
    title: "Individuals & Families",
    body: "Homes built for the people who will live in them.",
    icon: <FamilyHomeIcon />,
  },
  {
    title: "Businesses",
    body: "Offices, retail and commercial premises.",
    icon: <OfficeTowerIcon />,
  },
  {
    title: "Industries",
    body: "Factories, plants and industrial facilities.",
    icon: <FactoryIcon />,
  },
];

const clientsRight: readonly Client[] = [
  {
    title: "Educational Institutions",
    body: "Schools, colleges and campus buildings.",
    icon: <GraduationCapIcon />,
  },
  {
    title: "Hospitals & Healthcare",
    body: "Medical facilities built to demanding standards.",
    icon: <HospitalIcon />,
  },
  {
    title: "Government & Public Sector",
    body: "Defence, banking and public-sector work.",
    icon: <CivicBuildingIcon />,
  },
];

export function WhoWeBuildFor() {
  return (
    <Section tone="white" size="lg">
      <Container>
        {/* ----------------------------------------------------------- Head */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Eyebrow className="justify-center">Who We Build For</Eyebrow>
          </Reveal>
          {/* The head is set the way the reference page the client brought
              sets its own (2026-09-12), and it is the only place on the site
              that departs from Manrope — `--font-serif` and `--font-system`
              in `globals.css` say why, and are used nowhere else.

              Cinzel has no true lowercase: its minuscules are drawn as small
              capitals, so "From Airports to homes" comes out as two sizes of
              capital rather than as caps and lowercase. That is the look
              being matched, and it is also why the tracking is opened a
              little — a line of capitals set solid closes up. */}
          <Reveal delay={80}>
            <h2 className="text-balance-head inscribed mt-6 text-[clamp(1.875rem,4.2vw,3.25rem)] leading-[1.06]">
              From Airports to homes
            </h2>
          </Reveal>
          {/* A rule under the heading rather than in front of it. Every other
              heading on the site is introduced by the brass hairline that
              `Eyebrow` carries, which runs alongside the small caps above;
              this one is answered underneath as well, which is the reference
              the client set this section from. Short and centred, so it reads
              as a stop rather than as a divider across the column. */}
          <Reveal delay={120}>
            <span aria-hidden="true" className="head-rule" />
          </Reveal>
          {/* One paragraph, not two. The six lines below name every kind of
              client in full, so the lead only has to make the claim they are
              evidence for — and at this size two paragraphs of it pushed the
              arch a screen down the page.

              `font-system` is the reference's own choice and is deliberate:
              it names no webfont here, so this paragraph is Segoe UI on
              Windows, SF on a Mac and Roboto on Android. It is the one
              paragraph on the site that is not Manrope. */}
          <Reveal delay={160}>
            <p className="mx-auto mt-7 max-w-[42rem] font-system text-[clamp(1.0625rem,1.5vw,1.375rem)] leading-[1.6] text-slate-body">
              Few builders work across every kind of project. We have handed over
              homes and apartments, factories, campuses, hospitals and public
              buildings — and that breadth is the thing we are most confident
              about.
            </p>
          </Reveal>
        </div>

        {/* ------------------------------------------------------- Showcase */}
        {/* Below `xl` this is the two-column grid the six client lines sit
            in, and the arch spans both of its columns. The lines themselves
            are in two `ul`s — three and three, one for each side of the arch
            at `xl` — so if each of those laid out its own two columns the
            phone would get two rows of two and two rows of one. Set to
            `contents` they hand their items up to this grid instead and the
            six flow as six. See `ClientColumn`. */}
        <div className="mt-14 grid grid-cols-2 items-center gap-x-4 gap-y-8 xl:mt-20 xl:grid-cols-[1fr_minmax(280px,min(38vw,560px))_1fr] xl:gap-[clamp(2rem,5vw,5.5rem)]">
          <ClientColumn items={clientsLeft} className="order-2 xl:order-1" />

          {/* The arch. `relative` on the reveal rather than on a wrapper of
              its own: the seal is positioned against this box, and `Frame`
              clips its own contents, so the seal cannot live inside it. */}
          {/* Capped and centred while the section is one column. Uncapped, a
              tablet draws the arch the full width of the container — a 900px
              picture under a 280px crown, which is a rounded rectangle rather
              than an arch. Held to 520 the two top radii still overrun the
              edge at every stacked width, so CSS scales them to exactly half
              and the crown stays a semicircle from a 390px phone up. */}
          <Reveal
            /* `order-first`, not `order-1`. Below `xl` the two lists are
               `display: contents`, so the `order` on each of them no longer
               applies to anything — their items are grid items here and take
               the default 0. An `order-1` on the arch put it after all six of
               them; `order-first` is the only value that still lands in
               front. */
            className="relative order-first col-span-2 mx-auto w-full max-w-[520px] xl:order-2 xl:col-span-1 xl:max-w-none"
            variant="fade"
          >
            <Frame
              // Whatever goes in the arch has to clear one measured bar. The
              // crown stands on white, so it only reads as an arch if the
              // picture holds tone to its own top edge — a number, not a
              // feeling. Sampling the top 90px of the 4:5 crop each candidate
              // renders at, against the section's white:
              //
              //   garden-shrine-dusk    4.5:1   ← this one, canopy on sunset
              //   villa-pool            4.1:1
              //   tudor-apartments      3.4:1   the one it replaced
              //   cranes-skyline        2.5:1
              //   towers-glass          1.4:1   crown disappears
              //
              // An early pass used `residentialTowers`, which looks straight
              // up at an overcast sky and measures below all of them: the
              // curve — the whole point of the shape — vanished into the page.
              src={img.gardenShrineDusk}
              alt={alt.gardenShrineDusk}
              ratio="tall"
              // This photograph is upright — 848 × 1264, almost 2:3 — where
              // the one before it was a 1.68:1 landscape, and that inverts
              // everything the old note here said. A 4:5 frame is wider than
              // 2:3, so `object-cover` keeps the picture's whole width and
              // trims 8% off the top and the same off the bottom. Nothing is
              // magnified, so `sizes` is simply the width the frame is drawn
              // at — asking for more only downloads more.
              //
              // The ceiling is where it costs something: at 560 CSS px on a
              // 2x screen the browser wants 1120 real pixels and the file has
              // 848, so the widest laptop draws it at about three quarters of
              // native. Every narrower width, and every 1x screen, is served
              // whole. A larger original is the only fix — Next will not
              // invent the pixels, and upscaling the file here would only
              // hide that it cannot.
              sizes="(max-width: 1280px) min(100vw - 3rem, 520px), min(38vw, 560px)"
              // 280 is half of 560, the widest the frame is ever drawn, so the
              // crown is an exact semicircle there. Below that the pair of top
              // radii overrun the edge and CSS scales them down together —
              // which lands on a semicircle at every narrower width too.
              rounded="rounded-t-[clamp(140px,26vw,280px)] rounded-b-[2rem]"
              className="shadow-[0_40px_80px_rgba(11,26,58,0.24)]"
              // Which 8% comes off each end. Centred would cut the path where
              // it leaves the bottom of the frame, which is what leads the eye
              // up to the house; held a little high, the trim comes off the
              // sky instead — and the sky is the half the crown is about to
              // cover anyway.
              imageClassName="object-[50%_38%]"
            />
            <Seal />
          </Reveal>

          <ClientColumn items={clientsRight} className="order-3" />
        </div>

        {/* ---------------------------------------------------------- Stats */}
        <dl className="mt-[clamp(3rem,6vw,5.2rem)] grid grid-cols-2 gap-[clamp(0.6rem,2vw,2rem)] md:grid-cols-4">
          <Stat
            icon={<HourglassIcon className="h-6 w-6" />}
            value={<Counter to={50} suffix="+" />}
            label="Years of experience"
            delay={0}
          />
          <Stat
            icon={<CrestEmblem className="h-6 w-6" />}
            value="1973"
            label="Building since"
            delay={70}
          />
          <Stat
            icon={<BuildingIcon className="h-6 w-6" />}
            value="4"
            label="Construction verticals"
            delay={140}
          />
          {/* Counted from the list itself rather than typed out, so the
              number cannot drift from the sectors named on the rest of the
              page. */}
          <Stat
            icon={<CompassRoseEmblem className="h-6 w-6" />}
            value={<Counter to={sectors.length} />}
            label="Sectors served"
            delay={210}
          />
        </dl>

        {/* ------------------------------------------------------------ Ask */}
        {/* The section names six kinds of client and then leaves them there,
            which is one step short of the thing it is for. The page closes on
            a `CtaBand` of its own further down; this one is smaller, sits
            inside the section rather than under it, and asks about the
            reader's own project rather than about the company — so the two
            are not the same request made twice. */}
        <Reveal delay={120}>
          <div className="mt-[clamp(2.5rem,4vw,3.5rem)] flex flex-col gap-7 rounded-[1.75rem] bg-navy-900 px-[clamp(1.75rem,4vw,3.25rem)] py-[clamp(2rem,3.4vw,2.75rem)] sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <div>
              <p className="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] leading-snug text-white">
                Ready to start your project?
              </p>
              <p className="mt-2 text-[1rem] leading-[1.7] text-navy-100/80">
                Tell us what you are planning and we will tell you plainly what
                it takes to build.
              </p>
            </div>
            <Button
              href="/contact"
              variant="brass"
              size="md"
              withArrow
              className="flex-none self-start sm:self-auto"
            >
              Start A Conversation
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/** One side of the arch: three lines, an icon tile each. */
function ClientColumn({
  items,
  className,
}: {
  items: readonly Client[];
  className?: string;
}) {
  return (
    /* `contents` below `xl`: the list box itself is taken out of the layout
       and its items become items of the showcase grid above, so both lists'
       lines flow together as one run of six two to a row. At `xl` it is a
       real grid again — a column of three beside the arch.

       `role="list"` because `display: contents` removes the element's box,
       and a `ul` with no box loses its list semantics in some screen
       readers. The role puts them back; it is inert wherever they were
       never lost. */
    <ul
      role="list"
      className={`contents xl:grid xl:gap-[clamp(2rem,3.4vw,3.2rem)] ${className ?? ""}`}
    >
      {items.map((item, index) => (
        <Reveal
          as="li"
          key={item.title}
          delay={index * 70}
          /* Icon over the words at two to a row, beside them at one. In a
             half-width cell the tile and the text side by side leave the
             text about 110px, which breaks every title across three lines. */
          className="flex flex-col gap-3 xl:flex-row xl:gap-4"
        >
          {/* The tile is the only thing standing in for the panel the stats
              used to sit in — a soft square rather than a border, so six of
              them read as a set without ruling the section into boxes.

              Brass rather than the navy tint it was: brass is the site's one
              accent and this is the only mark in the section that carries it,
              which is what stops six identical squares from reading as
              furniture. The spark sits off the top-right corner, half on the
              tile and half off it — see `.tile-spark`. */}
          <span className="tile-spark relative grid h-[46px] w-[46px] flex-none place-items-center rounded-[13px] border border-brass-500/25 bg-brass-500/[0.12] text-brass-600 [&>svg]:h-[22px] [&>svg]:w-[22px]">
            {item.icon}
            <SparkIcon className="tile-spark__mark" />
          </span>
          {/* A size down while two share a row, back up at `xl` where each
              has a column to itself. `min-w-0` so a long word wraps inside
              the cell rather than widening the track it is in. */}
          <div className="min-w-0">
            <h3 className="font-display text-[1rem] leading-snug text-navy-900 sm:text-[1.0625rem] xl:text-[1.3125rem]">
              {item.title}
            </h3>
            <p className="mt-1.5 text-[0.8125rem] leading-[1.55] text-slate-body sm:text-[0.875rem] xl:text-[1rem] xl:leading-[1.6]">
              {item.body}
            </p>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

/** One number under the showcase. */
function Stat({
  icon,
  value,
  label,
  delay,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  delay: number;
}) {
  return (
    // The mark and the number are one `dd` and the label is the `dt`, written
    // in that order because a `dl` row may only be a run of `dt` followed by a
    // run of `dd` — the reading the eye gets (mark, number, label) is the
    // grid's `order`, not the markup's. Writing it the way it looks would put
    // a bare `span` between the two and make the list invalid.
    <Reveal
      delay={delay}
      className="grid justify-items-center gap-1.5 rounded-[1.5rem] border border-line bg-mist px-3 py-[clamp(1.4rem,2.2vw,2rem)] text-center"
    >
      {/* The label carries the rule under it rather than the box carrying one
          across its foot: it is the last thing read in the card and the mark
          closes it, which is the same job the rule under the heading does for
          the section. `after` rather than a border, so it is the width of the
          mark and not the width of the label. */}
      <dt className="order-2 text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted after:mx-auto after:mt-3.5 after:block after:h-px after:w-9 after:bg-brass-500 after:content-['']">
        {label}
      </dt>
      <dd className="order-1 grid justify-items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brass-500/[0.14] text-brass-600">
          {icon}
        </span>
        <span className="font-display text-[clamp(2rem,4vw,3rem)] leading-none text-navy-900">
          {value}
        </span>
      </dd>
    </Reveal>
  );
}

/**
 * The seal on the arch — a turning ring of type around the crest.
 *
 * The ring is a `textPath` on a circle rather than letters positioned one by
 * one: the type then follows the curve at whatever size the seal is drawn,
 * and the whole thing scales from the one clamp on the outer span. The spin
 * lives in `globals.css` so it can be switched off under
 * `prefers-reduced-motion` alongside every other loop on the site.
 */
function Seal() {
  return (
    <span aria-hidden="true" className="legacy-seal">
      <svg className="legacy-seal__ring" viewBox="0 0 100 100">
        <defs>
          {/* Two arcs of r=37 rather than a `circle`: a path is what
              `textPath` can be laid along, and starting it at the left of the
              circle puts the first word across the top. */}
          <path
            id="legacy-seal-ring"
            d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
          />
        </defs>
        <text>
          <textPath href="#legacy-seal-ring">
            VIJAYA ENTERPRISES · BUILDING SINCE 1973 ·
          </textPath>
        </text>
      </svg>
      <CrestEmblem className="legacy-seal__mark" />
    </span>
  );
}
