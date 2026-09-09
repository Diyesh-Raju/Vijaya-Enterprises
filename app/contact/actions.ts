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

type Enquiry = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  receivedAt: string;
};

/**
 * Identifies this form inside the client's CRM. If another form is ever added
 * — a callback button, a brochure download — give it its own source string so
 * their team can tell the two apart.
 */
const LEAD_SOURCE = "Website - Contact Page";

/**
 * The CRM treats the phone number as a lead's primary key, so the *same*
 * person must always produce the *same* string or they are filed twice. We
 * accept "+91 98765 43210" and "9876543210" from the form; the CRM must see
 * one of them. Its guide specifies a bare ten-digit mobile number, so that is
 * what we send.
 *
 * Deliberately conservative: only the two prefixes that mean "India" here are
 * stripped, and anything that does not end up looking like a ten-digit mobile
 * is passed through as digits rather than mangled into something wrong.
 */
function normalisePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/**
 * The CRM has no column for the things we actually ask about, so our enquiry
 * has to be reshaped on the way out: anything without a home there goes into
 * `customFields`, which their Lead Details panel renders as-is.
 */
function toCrmLead(enquiry: Enquiry) {
  return {
    name: enquiry.name,
    phone: normalisePhone(enquiry.phone),
    email: enquiry.email,
    source: LEAD_SOURCE,
    // Fields the CRM offers but this form does not collect. Sent empty rather
    // than guessed at by reading the message.
    preferredLocation: "",
    requiredSqft: "",
    customFields: {
      projectType: enquiry.projectType,
      message: enquiry.message,
      receivedAt: enquiry.receivedAt,
    },
  };
}

/** Returns false when no CRM is configured; throws when one is and it refused. */
async function sendToCrm(enquiry: Enquiry) {
  const endpoint = process.env.CRM_WEBHOOK_URL;
  if (!endpoint) return false;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(toCrmLead(enquiry)),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`CRM responded ${response.status}`);
  return true;
}

/**
 * Who receives the email copy. A comma-separated list, so more of the team can
 * be added by editing the environment rather than the code.
 *
 * NOTE: until a sending domain is verified with Resend, mail may only be
 * addressed to the Resend account holder's own address. Adding colleagues here
 * before then makes Resend refuse the whole send.
 */
function readRecipients() {
  return (process.env.CONTACT_TO_EMAIL ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

/**
 * The CRM stores the ISO timestamp, which is right for a machine. Whoever opens
 * this email is in India and about to return a call, so they get the local
 * time, spelled out.
 */
function formatReceived(iso: string) {
  const stamp = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
  return `${stamp} IST`;
}

/**
 * A plain-text enquiry someone can actually read on a phone. The number is
 * shown exactly as the visitor typed it — this copy is for a human about to
 * dial it, not for the CRM's matching, which gets the normalised form.
 */
function formatEnquiryEmail(enquiry: Enquiry) {
  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Phone", enquiry.phone],
    ["Email", enquiry.email],
    ["About", enquiry.projectType],
    ["Received", formatReceived(enquiry.receivedAt)],
  ];

  return [
    "A new enquiry came in through the website contact form.",
    "",
    ...rows.map(([label, value]) => `${label.padEnd(10)}${value}`),
    "",
    "Message",
    "-------",
    enquiry.message,
    "",
    `Reply to this email to answer ${enquiry.name} directly.`,
  ].join("\n");
}

/** Returns false when no mail credentials are configured. */
async function sendEmailCopy(enquiry: Enquiry) {
  const resendKey = process.env.RESEND_API_KEY;
  const to = readRecipients();
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!resendKey || to.length === 0 || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${resendKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: enquiry.email,
      subject: `Website enquiry — ${enquiry.name} (${enquiry.projectType})`,
      text: formatEnquiryEmail(enquiry),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  // Resend explains refusals in the body — an unverified sender, or a
  // recipient it will not deliver to yet. Surface it; a bare status code is a
  // guessing game.
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend responded ${response.status} ${detail}`.trim());
  }
  return true;
}

/**
 * Send to every configured channel, independently.
 *
 * The two are deliberately not chained. An enquiry that reached either the CRM
 * or somebody's inbox is not lost, so one channel being down must not fail the
 * submission or suppress the other — a dead CRM webhook should not also cost us
 * the email. The visitor is only told something went wrong when nothing got
 * through at all.
 *
 * A channel that is merely unconfigured resolves false and is not a failure;
 * one that is configured and refused rejects, and is logged by name so a
 * half-working setup is visible in the log rather than silent.
 */
async function deliver(enquiry: Enquiry) {
  const attempts = [
    ["CRM", sendToCrm(enquiry)],
    ["email", sendEmailCopy(enquiry)],
  ] as const;

  const results = await Promise.allSettled(attempts.map(([, promise]) => promise));

  let delivered = false;
  let failures = 0;

  results.forEach((result, index) => {
    const channel = attempts[index][0];
    if (result.status === "fulfilled") {
      if (result.value) delivered = true;
      return;
    }
    failures += 1;
    console.error(`[contact] ${channel} delivery failed:`, result.reason);
  });

  if (delivered) return "delivered" as const;
  if (failures > 0) throw new Error("every configured delivery channel failed");
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
  if (!values.phone) {
    errors.phone = "Please enter a phone number so we can reach you.";
  } else if (!PHONE_RE.test(values.phone)) {
    errors.phone = "Please enter a valid phone number.";
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
    phone: values.phone,
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
        "[contact] No delivery channel configured (set CRM_WEBHOOK_URL, or RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL). Enquiry received:",
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
