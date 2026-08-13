/**
 * Shared shapes and constants for the enquiry form.
 *
 * These live outside `actions.ts` on purpose: a `"use server"` module may
 * only export async functions, so constants and types have to sit in a
 * plain module that both the action and the client form can import.
 */

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field name → error message. */
  errors?: Record<string, string>;
  /** Echoed back so a failed submit does not wipe what was typed. */
  values?: Record<string, string>;
};

export const initialEnquiryState: EnquiryState = { status: "idle" };

export const PROJECT_TYPES = [
  "Buying a home",
  "Private construction contract",
  "Commercial project",
  "Industrial project",
  "Institutional project",
  "Renovation or extension",
  "Joint venture / land development",
  "Something else",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
