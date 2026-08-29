"use client";

import { useRouter } from "next/navigation";
import { SmokyButton } from "@/components/ui/smoky-button";

/**
 * The page's main call to action.
 *
 * It goes to the enquiry form. There is no booking flow of its own yet — the
 * form is where a visit is actually arranged — and a button that did nothing
 * is what stood here until then. `SmokyButton` is a `<button>` rather than a
 * link, so the navigation is by the router; if a dedicated booking page ever
 * arrives, this is the one place to point at it.
 */
export function BookVisitButton() {
  const router = useRouter();

  return (
    <SmokyButton onClick={() => router.push("/contact#enquiry")}>
      Book a Site Visit
    </SmokyButton>
  );
}
