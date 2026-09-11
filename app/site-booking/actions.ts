"use server";

import { contact } from "@/lib/site";
import {
  DELIVERY_SETUP_HINT,
  deliverLead,
  gateSubmission,
  readString,
  validateContactFields,
  type Lead,
} from "@/lib/leads";
import type { EnquiryState } from "@/app/contact/enquiry";
import {
  MAX_DAYS_AHEAD,
  PROJECT_CHOICES,
  TIME_SLOT_VALUES,
  addDays,
  formatVisitDate,
  isIsoDate,
  todayInIndia,
  type TimeSlot,
} from "./booking";

/**
 * Identifies this form inside the client's CRM, beside the enquiry form's
 * "Website - Contact Page". Their team filters on this string; change it and
 * every saved view of theirs that names it goes blank.
 */
const LEAD_SOURCE = "Website - Site Booking";

/** Notes are optional here, unlike the enquiry's message — but still bounded. */
const NOTES_MAX = 2000;

/**
 * The booking form's action.
 *
 * Deliberately the enquiry action with different fields: the same gate, the
 * same three-field check, the same delivery through `lib/leads.ts`, and the
 * same shape of answer. What is added is the visit itself — the project, the
 * day and the window — each checked against the list the form offered so
 * that nothing reaches the CRM that a person could not have chosen.
 */
export async function submitBooking(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const values = {
    project: readString(formData, "project"),
    preferredDate: readString(formData, "preferredDate"),
    timeSlot: readString(formData, "timeSlot"),
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    message: readString(formData, "message"),
  };

  // --- Bot traps and rate limit ----------------------------------------
  const gate = await gateSubmission(formData);
  if (!gate.ok) {
    switch (gate.reason) {
      case "honeypot":
        return { status: "success", message: "Thank you — we will be in touch." };
      case "too-fast":
        return {
          status: "error",
          message: "That was too quick — please try again.",
          values,
        };
      case "rate-limited":
        return {
          status: "error",
          message: `Too many requests from this connection. Please call us on ${contact.phoneDisplay} to book your visit.`,
          values,
        };
    }
  }

  // --- Validation -----------------------------------------------------
  const errors = validateContactFields(values);

  if (!PROJECT_CHOICES.includes(values.project as (typeof PROJECT_CHOICES)[number])) {
    errors.project = "Please choose the project you would like to visit.";
  }

  const today = todayInIndia();
  if (!values.preferredDate) {
    errors.preferredDate = "Please pick a day for your visit.";
  } else if (!isIsoDate(values.preferredDate)) {
    errors.preferredDate = "Please enter a valid date.";
  } else if (values.preferredDate < today) {
    errors.preferredDate = "That day has passed — please pick a day from today onwards.";
  } else if (values.preferredDate > addDays(today, MAX_DAYS_AHEAD)) {
    errors.preferredDate = "Please pick a day within the next year.";
  }

  if (!TIME_SLOT_VALUES.includes(values.timeSlot as TimeSlot)) {
    errors.timeSlot = "Please choose a time of day.";
  }

  if (values.message.length > NOTES_MAX) {
    errors.message = `Please keep your notes under ${NOTES_MAX} characters.`;
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors,
      values,
    };
  }

  // --- Deliver --------------------------------------------------------
  const visitDate = formatVisitDate(values.preferredDate);
  const lead: Lead = {
    name: values.name,
    email: values.email,
    phone: values.phone,
    source: LEAD_SOURCE,
    subject: `Site visit request — ${values.name} (${values.project})`,
    // `projectType` first, as the enquiry form sends it, so the two kinds
    // of lead sit side by side in the CRM's panel with the same first row.
    details: [
      { key: "projectType", label: "About", value: "Site visit booking" },
      { key: "project", label: "Project", value: values.project },
      { key: "preferredDate", label: "Date", value: visitDate },
      { key: "preferredTime", label: "Time", value: values.timeSlot },
    ],
    message: values.message,
    receivedAt: new Date().toISOString(),
    intro: "A new site visit request came in through the website booking form.",
    logTag: "booking",
  };

  try {
    const outcome = await deliverLead(lead);

    if (outcome === "unconfigured") {
      // Never silently swallow a real request: record it, and tell the
      // visitor plainly rather than showing a success screen that lied.
      console.warn(
        `[booking] No delivery channel configured (${DELIVERY_SETUP_HINT}). Booking received:`,
        lead,
      );

      if (process.env.NODE_ENV !== "production") {
        return {
          status: "success",
          message:
            "Thank you. (Development mode: the booking was logged to the server console — no delivery channel is configured yet.)",
        };
      }

      return {
        status: "error",
        message: `We could not send your request just now. Please call us on ${contact.phoneDisplay} or email ${contact.emailDisplay} and we will arrange your visit.`,
        values,
      };
    }

    return {
      status: "success",
      message: `Your request for ${visitDate}, ${values.timeSlot.toLowerCase()}, has reached us. We will call you to confirm the time and meet you at the site.`,
    };
  } catch (error) {
    console.error("[booking] Delivery failed:", error);
    return {
      status: "error",
      message: `Something went wrong sending your request. Please call us on ${contact.phoneDisplay} or email ${contact.emailDisplay}.`,
      values,
    };
  }
}
