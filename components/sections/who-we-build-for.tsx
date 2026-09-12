import { Reveal } from "@/components/ui/reveal";
import { Container, Section, Eyebrow } from "@/components/ui/section";
import { Frame } from "@/components/ui/media";
import { Counter } from "@/components/ui/counter";
import { CompassRoseEmblem, CrestEmblem } from "@/components/ui/emblem-icons";
import {
  BuildingIcon,
  FactoryIcon,
  GraduationCapIcon,
  HospitalIcon,
  HourglassIcon,
  HouseIcon,
  ShieldCheckIcon,
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
 *    (2026-09-11), and it was square before that — and the ratio is the zoom
 *    control. `object-cover` keeps `frameAspect / photoAspect` of a
 *    photograph's width, so the frame's own proportions decide how much of the
 *    building survives: 3:4 kept 45% and cut the elevation off mid-façade,
 *    1:1 kept 60% and held the whole block with its setting, and 4:5 keeps
 *    48%. It is also how far the source is magnified — 2.2x, 1.7x and 2.1x —
 *    which this photograph, 2000px on its long edge and the only one on the
 *    site not available at 4K, has little room for. Taller than 4:5 is back
 *    to the façade cut off. Square is as wide as it goes: past it the crown
 *    eats the roof and the shape reads as a dome rather than an arch.
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
    body: "Homes and apartments built for the people who will live in them.",
    icon: <HouseIcon />,
  },
  {
    title: "Businesses",
    body: "Offices, retail and commercial premises, from a single floor upwards.",
    icon: <BuildingIcon />,
  },
  {
    title: "Industries",
    body: "Factories, plants and specialised industrial facilities.",
    icon: <FactoryIcon />,
  },
];

const clientsRight: readonly Client[] = [
  {
    title: "Educational Institutions",
    body: "Schools, colleges and campus buildings for long working lives.",
    icon: <GraduationCapIcon />,
  },
  {
    title: "Hospitals & Healthcare",
    body: "Medical facilities built to demanding standards of finish and service.",
    icon: <HospitalIcon />,
  },
  {
    title: "Government & Public Sector",
    body: "Defence, banking, public sector organisations and infrastructure.",
    icon: <ShieldCheckIcon />,
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
          <Reveal delay={80}>
            <h2 className="text-balance-head mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.08]">
              From Airports to homes
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-7 space-y-5 text-[1.0625rem] leading-[1.8] text-slate-body">
              <p>
                We have built for individuals, families, businesses, institutions
                and large organisations. Our experience ranges from homes and
                apartments to industrial facilities, educational buildings,
                hospitals, commercial spaces and specialised infrastructure.
              </p>
              <p>
                Unlike many developers that specialise in a single segment, we have
                delivered projects for homeowners, industries, government
                organisations, educational institutions, hospitals, banks and public
                sector organisations. That breadth is one of the things we are most
                confident about.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ------------------------------------------------------- Showcase */}
        <div className="mt-14 grid items-center gap-[clamp(2rem,5vw,5.5rem)] xl:mt-20 xl:grid-cols-[1fr_minmax(280px,min(38vw,560px))_1fr]">
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
            className="relative order-1 mx-auto w-full max-w-[520px] xl:order-2 xl:max-w-none"
            variant="fade"
          >
            <Frame
              // Vijaya's own building, and the reason this section carries a
              // photograph at all.
              //
              // Whatever replaces it has to clear one measured bar. The arch
              // stands on white, so the crown only reads if the picture holds
              // tone to its own top edge — a number, not a feeling. Sampling
              // the top 90px of the 3:4 crop each candidate renders at,
              // against the section's white:
              //
              //   tudor-apartments      3.8:1   ← this one, tiled roof
              //   residence-blue-hour   7.1:1
              //   villa-pool            4.1:1
              //   cranes-skyline        2.5:1
              //   towers-glass          1.4:1   crown disappears
              //
              // An early pass used `residentialTowers`, which looks straight
              // up at an overcast sky and measures below all of them: the
              // curve — the whole point of the shape — vanished into the page.
              src={img.tudorApartments}
              alt={alt.tudorApartments}
              ratio="tall"
              // `sizes` is NOT the width of the frame, and getting that wrong
              // is what made this picture soft. The frame is a portrait window
              // onto a 1.68:1 photograph, so `object-cover` shows only 48% of
              // the image's width and magnifies it to fill — the browser needs
              // a file about 2.1x the frame, not one the frame's own size.
              // Asked for 30vw, Next served a 1080px candidate, 45% of which
              // was 486 real pixels stretched across an 864px retina box.
              //
              // The three stops below are written against Next's own width
              // buckets rather than as tidy round numbers: 750 lands a phone
              // on the 1920 candidate, 1000 lands the stacked tablet on the
              // 2048 bucket, and 70vw asks a laptop for more than the 2000px
              // original has — both of those serve it whole. They went up
              // with the frame: at 4:5 the square's 600 and 780 fell a bucket
              // short. Nudging any of them past a bucket edge doubles the
              // download for no visible gain.
              sizes="(max-width: 640px) 750px, (max-width: 1280px) 1000px, 70vw"
              // 280 is half of 560, the widest the frame is ever drawn, so the
              // crown is an exact semicircle there. Below that the pair of top
              // radii overrun the edge and CSS scales them down together —
              // which lands on a semicircle at every narrower width too.
              rounded="rounded-t-[clamp(140px,26vw,280px)] rounded-b-[2rem]"
              className="shadow-[0_40px_80px_rgba(11,26,58,0.24)]"
              // Which 48% of the width. 48% is a hair left of centre, and
              // centred on the building: the timbered bays, the steps and the
              // two men at the gate, with the yellow car parked at the far
              // right — the one thing in this photograph that pulls the eye
              // off the building — kept out of it. The two end wings no
              // longer fit at 4:5; the square held them.
              imageClassName="object-[48%_50%]"
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
    <ul className={`grid gap-[clamp(2rem,3.4vw,3.2rem)] ${className ?? ""}`}>
      {items.map((item, index) => (
        <Reveal as="li" key={item.title} delay={index * 70} className="flex gap-4">
          {/* The tile is the only thing standing in for the panel the stats
              used to sit in — a soft mist square rather than a border, so six
              of them read as a set without ruling the section into boxes. */}
          <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[13px] bg-navy-900/[0.06] text-navy-800 [&>svg]:h-[22px] [&>svg]:w-[22px]">
            {item.icon}
          </span>
          <div>
            <h3 className="font-display text-[1.1875rem] leading-snug text-navy-900 sm:text-[1.3125rem]">
              {item.title}
            </h3>
            <p className="mt-1.5 text-[0.9375rem] leading-[1.6] text-slate-body sm:text-[1rem]">
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
      className="grid justify-items-center gap-1.5 border-t border-line-strong px-2 py-[clamp(1.2rem,2vw,1.8rem)] text-center"
    >
      <dt className="order-2 text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
        {label}
      </dt>
      <dd className="order-1 grid justify-items-center gap-1.5">
        <span className="text-brass-600">{icon}</span>
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
