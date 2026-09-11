import { projectsWithPages } from "@/lib/projects";

/**
 * Shared shapes and constants for the site-booking form.
 *
 * Outside `actions.ts` for the same reason the enquiry form keeps its own
 * `enquiry.ts`: a `"use server"` module may only export async functions, so
 * the lists and the date arithmetic live here where both the action and the
 * client form can import them.
 *
 * The result state is the enquiry form's own `EnquiryState` — the two forms
 * answer in the same shape on purpose, so anything that reads one reads the
 * other.
 */

/**
 * The three windows a visit can be arranged in. Kept as plain phrases rather
 * than clock times so the CRM entry and the email read the way the office
 * talks about a day — and so the hours can change without the data changing.
 */
export const TIME_SLOTS = [
  { value: "Morning", hint: "10 am – 12 pm" },
  { value: "Afternoon", hint: "12 pm – 3 pm" },
  { value: "Evening", hint: "3 pm – 6 pm" },
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number]["value"];

export const TIME_SLOT_VALUES = TIME_SLOTS.map((slot) => slot.value) as TimeSlot[];

/**
 * The choice for a visitor who has not settled on a project, or wants one
 * the site has no page for yet. Named so it reads sensibly in the CRM's
 * Lead Details panel on its own.
 */
export const OTHER_PROJECT = "Not sure yet — help me choose";

/**
 * What the project picker offers: every project with a page of its own, then
 * the open choice. Placeholder projects are deliberately not listed — a
 * booking for "Project 4" is a booking nobody could honour.
 */
export const PROJECT_CHOICES = [
  ...projectsWithPages.map((project) => project.name),
  OTHER_PROJECT,
] as const;

/** How far ahead a visit can be asked for. */
export const MAX_DAYS_AHEAD = 365;

/** Today, in the office's own time zone, as the `YYYY-MM-DD` a date input speaks. */
export function todayInIndia(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** `days` after `iso`, as another `YYYY-MM-DD`. */
export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar date in `YYYY-MM-DD`, not merely something shaped like one. */
export function isIsoDate(value: string) {
  if (!ISO_DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * "Saturday, 20 September 2026" — how the date reads on the visit pass, in
 * the email, and in the CRM. The pass is for a person, so it gets the day of
 * the week; nobody plans a site visit by ISO string.
 */
export function formatVisitDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`));
}
