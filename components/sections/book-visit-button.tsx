"use client";

import { SmokyButton } from "@/components/ui/smoky-button";

/**
 * The page's main call to action.
 *
 * ⚠️ INERT ON PURPOSE — what this should do has not been decided yet, so it is
 * rendered complete but wired to nothing. Give it an `onClick` (or swap it for
 * a link) before the site goes live: as it stands, someone who wants a visit
 * will press it and nothing will happen. The Contact Us link below is the only
 * working path from here.
 */
export function BookVisitButton() {
  return <SmokyButton>Book a Site Visit</SmokyButton>;
}
