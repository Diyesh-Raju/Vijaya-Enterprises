import Image from "next/image";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { PlayIcon } from "@/components/ui/line-icons";
import { img } from "@/lib/images";

/**
 * What owners say, over a room they might have said it in.
 *
 * The photograph is held back to a fifth of its strength and washed out from
 * the left, so the card sits on paper rather than on a picture — the image is
 * atmosphere, not content, which is why it carries no alt text.
 *
 * ⚠️ The play mark is decorative. No customer film has been shot, so it is
 * marked `aria-hidden` and announces nothing: a screen reader offering "play
 * testimonial video" for a control that cannot play anything is worse than
 * silence. To make it real, drop the file in `public/video`, add it to
 * `lib/images.ts`, and swap this span for a button that opens the clip —
 * everything visual here stays as it is.
 */
export function Testimonial() {
  return (
    <section className="relative isolate overflow-hidden bg-mist py-24 sm:py-28 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-full w-full lg:w-[60%]">
          <Image
            src={img.interiorLiving}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-mist via-mist/90 to-transparent" />
      </div>

      <Container className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative rounded-[1.75rem] border border-line bg-white p-8 shadow-soft sm:rounded-[2rem] sm:p-12">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-2 -top-4 select-none font-display text-[7rem] leading-none text-navy-100 sm:text-[8.5rem]"
            >
              &ldquo;
            </span>
            <p className="relative text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-rosegold-600">
              Testimonial
            </p>
            <h2 className="relative mt-5 text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.1] text-navy-900">
              In Their Own Words
            </h2>
            <p className="relative mt-6 text-[0.9375rem] leading-relaxed text-slate-body">
              Owners who have lived in a Vijaya building, on what the experience
              was actually like — the quality of the work, a handover that came
              when it was promised, and the people they dealt with along the way.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="flex items-center justify-center">
          <span className="group relative flex items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute h-28 w-28 animate-ping-slow rounded-full border border-rosegold-600/30"
            />
            <span
              aria-hidden="true"
              className="relative flex h-24 w-24 items-center justify-center rounded-full border border-rosegold-600 text-rosegold-600 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-rosegold-600 group-hover:text-white"
            >
              <PlayIcon className="ml-1 h-7 w-7" />
            </span>
          </span>
        </Reveal>
      </Container>
    </section>
  );
}
