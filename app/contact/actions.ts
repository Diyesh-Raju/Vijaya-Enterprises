"use server";

import { headers } from "next/headers";
import { contact } from "@/lib/site";
import {
  PROJECT_TYPES,
  type EnquiryState,
  type ProjectType,
} from "./enquiry";

const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  phone: { min: 7, max: 20 },
  message: { min: 10, max: 4000 },
} as const;

/** Deliberately permissive but bounded — real addresses vary more than regexes. */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const PHONE_RE = /^[+()\d][\d\s\-()]{5,19}$/;

/**
 * Fixed-window rate limit, per client address.
 *
 * NOTE: this Map lives in one server process. It stops casual flooding of a
 * single instance, which is what it is for. It is not a distributed limit —
 * behind several instances or on serverless, put a real limiter (or your
 * CDN/WAF's rate limiting) in front of this route as well.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
/**
 * When no client address is available — a standalone server with no proxy
 * setting `x-forwarded-for` — every visitor collapses into one bucket. Using
 * the per-person limit there would cap the whole site at five enquiries per
 * ten minutes, so that shared bucket gets a much larger allowance. It still
 * bounds flooding, and the honeypot and timing checks apply regardless.
 */
const MAX_PER_WINDOW_SHARED = 60;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, max: number) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  entry.count += 1;
  if (entry.count > max) return { ok: false };
  return { ok: true };
}

/** Keep the Map from growing without bound on a long-lived process. */
function sweep() {
  if (hits.size < 5000) return;
  const now = Date.now();
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
}

function readString(data: FormData, field: string) {
  const raw = data.get(field);
  return typeof raw === "string" ? raw.trim() : "";
}

async function deliver(enquiry: Record<string, string>) {
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(enquiry),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
    return "delivered" as const;
  }

  if (resendKey && to && from) {
    const lines = Object.entries(enquiry)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: enquiry.email,
        subject: `Website enquiry — ${enquiry.name} (${enquiry.projectType})`,
        text: lines,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Resend responded ${response.status}`);
    return "delivered" as const;
  }

  return "unconfigured" as const;
}

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

  // --- Bot traps ------------------------------------------------------
  // A field no human sees. Anything in it is automation.
  if (readString(formData, "company")) {
    return { status: "success", message: "Thank you — we will be in touch." };
  }

  // Submitted implausibly fast after the form rendered.
  const startedAt = Number(readString(formData, "startedAt"));
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 2000) {
    return {
      status: "error",
      message: "That was too quick — please try again.",
      values,
    };
  }

  // --- Rate limit -----------------------------------------------------
  const headerList = await headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "";
  const clientKey = clientIp || "shared";
  const max = clientIp ? MAX_PER_WINDOW : MAX_PER_WINDOW_SHARED;

  sweep();
  if (!rateLimit(clientKey, max).ok) {
    return {
      status: "error",
      message: `Too many enquiries from this connection. Please call us on ${contact.phoneDisplay}.`,
      values,
    };
  }

  // --- Validation -----------------------------------------------------
  const errors: Record<string, string> = {};

  if (values.name.length < LIMITS.name.min || values.name.length > LIMITS.name.max) {
    errors.name = "Please enter your name.";
  }
  if (!values.email || values.email.length > LIMITS.email.max || !EMAIL_RE.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (values.phone && !PHONE_RE.test(values.phone)) {
    errors.phone = "Please enter a valid phone number, or leave this blank.";
  }
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
  const enquiry = {
    name: values.name,
    email: values.email,
    phone: values.phone || "not provided",
    projectType: values.projectType || "not specified",
    message: values.message,
    receivedAt: new Date().toISOString(),
  };

  try {
    const outcome = await deliver(enquiry);

    if (outcome === "unconfigured") {
      // Never silently swallow a real enquiry: record it, and tell the
      // visitor plainly rather than showing a success screen that lied.
      console.warn(
        "[contact] No delivery channel configured (set CONTACT_WEBHOOK_URL, or RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL). Enquiry received:",
        enquiry,
      );

      if (process.env.NODE_ENV !== "production") {
        return {
          status: "success",
          message:
            "Thank you. (Development mode: the enquiry was logged to the server console — no delivery channel is configured yet.)",
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
