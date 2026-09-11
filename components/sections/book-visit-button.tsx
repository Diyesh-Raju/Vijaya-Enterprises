"use client";

import { useRouter } from "next/navigation";
import { SmokyButton } from "@/components/ui/smoky-button";

/**
 * The page's main call to action.
 *
 * It goes to the site-booking page — to the project's own copy of it when
 * the button sits on a project's pages, so the pass arrives with the project
 * already written on it, and to the general one otherwise. `SmokyButton` is
 * a `<button>` rather than a link, so the navigation is by the router.
 */
export function BookVisitButton({ slug }: { slug?: string }) {
  const router = useRouter();
  const href = slug ? `/site-booking/${slug}` : "/site-booking";

  return (
    <SmokyButton onClick={() => router.push(href)}>
      Book a Site Visit
    </SmokyButton>
  );
}
