"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/ui/section";
import { contact } from "@/lib/site";

/**
 * Route-level error boundary. Deliberately shows no stack or digest to the
 * visitor — just a way forward and a phone number that always works.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface it where the operator can see it, not in the UI.
    console.error("[route error]", error);
  }, [error]);

  return (
    <section className="flex min-h-hero items-center bg-navy-950">
      <Container className="py-32">
        <div className="max-w-2xl">
          <p className="eyebrow-rule text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-400">
            Something went wrong
          </p>
          <h1 className="text-balance-head mt-7 text-[clamp(2rem,5vw,3.5rem)] leading-[1.06] text-white">
            We couldn&rsquo;t load this page.
          </h1>
          <p className="mt-7 text-[1.0625rem] leading-[1.75] text-navy-100/85">
            Please try again. If it keeps happening, call us on{" "}
            <a href={contact.phoneHref} className="link-underline text-white">
              {contact.phoneDisplay}
            </a>{" "}
            and we will help you directly.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full bg-white px-9 py-4 text-[0.9375rem] font-semibold text-navy-900 transition-all duration-300 hover:-translate-y-0.5"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-9 py-4 text-[0.9375rem] font-semibold text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/10"
            >
              Back To Home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
