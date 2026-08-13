import { VideoBackdrop } from "@/components/ui/video-backdrop";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { img, alt, video } from "@/lib/images";

const stats = [
  { value: 50, suffix: "+", label: "Years of experience" },
  { value: 4, suffix: "", label: "Construction verticals" },
  { value: 1973, suffix: "", label: "Building since", plain: true },
];

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-b-[2.5rem] bg-navy-950 sm:rounded-b-[4rem]">
      <VideoBackdrop
        poster={img.heroPoster}
        posterAlt={alt.heroPoster}
        srcDesktop={video.heroDesktop}
        srcMobile={video.heroMobile}
        priority
      />

      {/* Navy grade: dark at the base for the type, lighter at the top so the
          cranes stay readable behind the transparent header. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy-950/78 via-navy-950/62 to-navy-950/94"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(75%_60%_at_20%_75%,rgba(6,20,49,0.75),transparent_70%)]"
      />

      <div className="container-page relative flex min-h-hero flex-col justify-end pb-14 pt-36 sm:pb-16 sm:pt-40 lg:pb-20">
        <div className="max-w-4xl">
          {/* Tighter on phones so this stays on one line beside the rule. */}
          <p
            className="eyebrow-rule animate-rise text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-brass-400 sm:text-[0.6875rem] sm:tracking-[0.3em]"
            style={{ animationDelay: "120ms" }}
          >
            Est. 1973 · Bengaluru, Karnataka
          </p>

          <h1
            className="text-balance-head animate-rise mt-7 text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.98] text-white"
            style={{ animationDelay: "240ms" }}
          >
            Building Trust
            <br />
            <span className="text-brass-300">Since 1973</span>
          </h1>

          <p
            className="animate-rise mt-8 max-w-2xl text-[1.0625rem] leading-[1.75] text-navy-100/85 sm:text-[1.1875rem]"
            style={{ animationDelay: "380ms" }}
          >
            From homes to large-scale commercial, industrial and institutional
            projects, Vijaya Enterprises has been building with experience, care
            and quality for more than five decades.
          </p>

          <p
            className="animate-rise mt-5 font-display text-[1.125rem] text-white/80 sm:text-[1.3125rem]"
            style={{ animationDelay: "460ms" }}
          >
            One trusted partner for construction and development.
          </p>

          <div
            className="animate-rise mt-10 flex flex-wrap gap-3"
            style={{ animationDelay: "560ms" }}
          >
            <Button href="/residential" variant="light" size="lg" withArrow>
              Find Your Home
            </Button>
            <Button href="/contact" variant="ghost" size="lg">
              Discuss Your Project
            </Button>
          </div>
        </div>

        {/* Proof strip */}
        <div
          className="animate-rise mt-14 border-t border-white/15 pt-8 sm:mt-16"
          style={{ animationDelay: "700ms" }}
        >
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-[2.25rem] leading-none text-white sm:text-[3rem]">
                    {stat.plain ? (
                      stat.value
                    ) : (
                      <Counter to={stat.value} suffix={stat.suffix} />
                    )}
                  </span>
                  <span className="mt-3 block text-[0.75rem] uppercase tracking-[0.2em] text-navy-100/60">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 right-6 hidden h-12 w-6 items-start justify-center rounded-full border border-white/25 pt-2 lg:flex"
      >
        <span className="animate-scroll-hint block h-1.5 w-1.5 rounded-full bg-white/80" />
      </div>
    </section>
  );
}
