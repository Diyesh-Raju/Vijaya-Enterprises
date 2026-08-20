import { PanelHeading } from "@/components/ui/panel-heading";
import { Reveal } from "@/components/ui/reveal";
import type { Faq } from "@/lib/faqs";

/**
 * Frequently asked questions.
 *
 * Built on `<details>`, so it opens and closes without JavaScript, the browser
 * handles the keyboard, and find-in-page reaches answers that are shut —
 * which none of the usual hand-rolled accordions manage.
 */
export function Faqs({ faqs }: { faqs: readonly Faq[] }) {
  return (
    <div>
      <PanelHeading>Frequently Asked</PanelHeading>

      <div className="mt-10 space-y-3 lg:mt-12">
        {faqs.map((faq, index) => (
          <Reveal key={faq.question} delay={(index % 3) * 60}>
            <details className="group/faq overflow-hidden rounded-[1.25rem] border border-line bg-white/80 backdrop-blur-sm transition-colors duration-300 hover:border-rosegold-400 sm:rounded-[1.5rem]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 sm:px-8 sm:py-6 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-[1.0625rem] leading-snug text-navy-900 sm:text-[1.1875rem]">
                  {faq.question}
                </span>
                <span
                  aria-hidden="true"
                  className="relative h-4 w-4 shrink-0 text-rosegold-600"
                >
                  <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rounded-full bg-current" />
                  <span className="absolute left-1/2 top-0 h-4 w-[1.5px] -translate-x-1/2 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-open/faq:rotate-90" />
                </span>
              </summary>
              <p className="px-6 pb-6 text-[0.9375rem] leading-relaxed text-slate-body sm:px-8 sm:pb-7 sm:text-[1rem]">
                {faq.answer}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
