"use server";

import { contact } from "@/lib/site";
import {
  DELIVERY_SETUP_HINT,
  LIMITS,
  deliverLead,
  gateSubmission,
  readString,
  validateContactFields,
  type Lead,
} from "@/lib/leads";
import {
  PROJECT_TYPES,
  type EnquiryState,
  type ProjectType,
} from "./enquiry";

/**
 * Identifies this form inside the client's CRM. The site-booking form has its
 * own string (see `app/site-booking/actions.ts`); any further form gets one
 * too, so their team can tell them apart.
 */
const LEAD_SOURCE = "Website - Contact Page";

/**
 * The enquiry form's action. The traps, the limit, the CRM webhook and the
 * email copy all live in `lib/leads.ts` and are shared with the booking form;
 * what is here is only what this form asks for and how it words its answers.
 */
export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const values = {
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    projectType: readString(formData, "projectType"),
    message: readString(formData, "message"),
  };

  // --- Bot traps and rate limit ----------------------------------------
  const gate = await gateSubmission(formData);
  if (!gate.ok) {
    switch (gate.reason) {
      case "honeypot":
        return { status: "success", message: "Thank you, we will be in touch." };
      case "too-fast":
        return {
          status: "error",
          message: "That was too quick, please try again.",
          values,
        };
      case "rate-limited":
        return {
          status: "error",
          message: `Too many enquiries from this connection. Please call us on ${contact.phoneDisplay}.`,
          values,
        };
    }
  }

  // --- Validation -----------------------------------------------------
  const errors = validateContactFields(values);

  if (values.projectType && !PROJECT_TYPES.includes(values.projectType as ProjectType)) {
    errors.projectType = "Please choose one of the listed options.";
  }
  if (
    values.message.length < LIMITS.message.min ||
    values.message.length > LIMITS.message.max
  ) {
    errors.message = `Please tell us a little about your project (at least ${LIMITS.message.min} characters).`;
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
  const projectType = values.projectType || "not specified";
  const lead: Lead = {
    name: values.name,
    email: values.email,
    phone: values.phone,
    source: LEAD_SOURCE,
    subject: `Website enquiry, ${values.name} (${projectType})`,
    details: [{ key: "projectType", label: "About", value: projectType }],
    message: values.message,
    receivedAt: new Date().toISOString(),
    intro: "A new enquiry came in through the website contact form.",
    logTag: "contact",
  };

  try {
    const outcome = await deliverLead(lead);

    if (outcome === "unconfigured") {
      // Never silently swallow a real enquiry: record it, and tell the
      // visitor plainly rather than showing a success screen that lied.
      console.warn(
        `[contact] No delivery channel configured (${DELIVERY_SETUP_HINT}). Enquiry received:`,
        lead,
      );

      if (process.env.NODE_ENV !== "production") {
        return {
          status: "success",
          message:
            "Thank you. (Development mode: the enquiry was logged to the server console, no delivery channel is configured yet.)",
        };
      }

      return {
        status: "error",
        message: `We could not send your enquiry just now. Please call us on ${contact.phoneDisplay} or email ${contact.emailDisplay} and we will respond the same working day.`,
        values,
      };
    }

    return {
      status: "success",
      message: "Thank you. Your enquiry has reached us, and we will be in touch.",
    };
  } catch (error) {
    console.error("[contact] Delivery failed:", error);
    return {
      status: "error",
      message: `Something went wrong sending your enquiry. Please call us on ${contact.phoneDisplay} or email ${contact.emailDisplay}.`,
      values,
    };
  }
}
