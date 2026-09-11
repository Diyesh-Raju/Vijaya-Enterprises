import { headers } from "next/headers";

/**
 * Everything the site's forms share on the way out: the bot traps, the rate
 * limit, the field rules, the CRM webhook and the email copy.
 *
 * It began life inside `app/contact/actions.ts`, when the enquiry form was
 * the only form on the site. The site-booking form is a second one, and the
 * brief for it was exact: *fundamentally the same as the contact form, and
 * connected to the CRM in exactly the same way*. The surest way to make two
 * forms deliver identically is for them to run the same code — so the
 * delivery moved here and both actions call it. A form contributes only what
 * differs: which fields it collects, and the `source` string the CRM files
 * it under.
 *
 * Server-only. `headers()` comes from `next/headers`, so this module cannot
 * be imported into a client component — which is also the point: the CRM
 * endpoint and the mail key never leave the server.
 */

/* ------------------------------------------------------------------
   Field rules
------------------------------------------------------------------- */

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  phone: { min: 7, max: 20 },
  message: { min: 10, max: 4000 },
} as const;

/** Deliberately permissive but bounded — real addresses vary more than regexes. */
export const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
export const PHONE_RE = /^[+()\d][\d\s\-()]{5,19}$/;

export function readString(data: FormData, field: string) {
  const raw = data.get(field);
  return typeof raw === "string" ? raw.trim() : "";
}

/**
 * The three fields every form on the site asks for, checked the one way.
 * Returns only the fields that failed, so a caller can fold the result into
 * its own error map beside whatever else it validates.
 */
export function validateContactFields(values: {
  name: string;
  email: string;
  phone: string;
}) {
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

  return errors;
}

/* ------------------------------------------------------------------
   Bot traps and the rate limit
------------------------------------------------------------------- */

/**
 * Fixed-window rate limit, per client address.
 *
 * NOTE: this Map lives in one server process. It stops casual flooding of a
 * single instance, which is what it is for. It is not a distributed limit —
 * behind several instances or on serverless, put a real limiter (or your
 * CDN/WAF's rate limiting) in front of this route as well.
 *
 * One bucket for the whole site rather than one per form: a visitor who has
 * sent five enquiries in ten minutes does not get five more by switching to
 * the booking form.
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

export type Gate =
  | { ok: true }
  /** A field no human sees was filled in. Answer with a quiet "thank you". */
  | { ok: false; reason: "honeypot" }
  /** Submitted implausibly fast after the form rendered. */
  | { ok: false; reason: "too-fast" }
  | { ok: false; reason: "rate-limited" };

/**
 * The checks that run before any field is looked at, in the order the
 * contact form has always run them: the honeypot, the timing trap, then the
 * per-connection rate limit. Every form on the site passes through this one
 * gate so a bot cannot pick the form with the weakest door.
 */
export async function gateSubmission(formData: FormData): Promise<Gate> {
  if (readString(formData, "company")) return { ok: false, reason: "honeypot" };

  const startedAt = Number(readString(formData, "startedAt"));
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 2000) {
    return { ok: false, reason: "too-fast" };
  }

  const headerList = await headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "";
  const clientKey = clientIp || "shared";
  const max = clientIp ? MAX_PER_WINDOW : MAX_PER_WINDOW_SHARED;

  sweep();
  if (!rateLimit(clientKey, max).ok) return { ok: false, reason: "rate-limited" };

  return { ok: true };
}

/* ------------------------------------------------------------------
   The lead
------------------------------------------------------------------- */

/**
 * One submission, in the shape the channels consume.
 *
 * `source` identifies the form inside the client's CRM, so their team can
 * tell one from another at a glance — "Website - Contact Page" is the
 * enquiry form, "Website - Site Booking" the booking form. Any further form
 * gets its own string, never a reuse of these.
 *
 * `details` is whatever the form asked beyond name, phone and email, in the
 * order it should be read. The CRM has no column for any of it, so it goes
 * into `customFields` as-is; the email prints it as labelled rows.
 */
export type Lead = {
  name: string;
  email: string;
  phone: string;
  source: string;
  /** The email subject line, complete. */
  subject: string;
  details: readonly { key: string; label: string; value: string }[];
  message: string;
  receivedAt: string;
  /** First line of the email — what kind of thing this is. */
  intro: string;
  /** Prefix for the server log, e.g. `contact` or `booking`. */
  logTag: string;
};

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
export function normalisePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/**
 * The CRM has no column for the things we actually ask about, so a lead has
 * to be reshaped on the way out: anything without a home there goes into
 * `customFields`, which their Lead Details panel renders as-is.
 *
 * The top-level shape is fixed and identical for every form on the site —
 * name, phone, email, source, the two fields the CRM offers that no form
 * collects, and the custom block. Only the keys inside `customFields` vary.
 */
export function toCrmLead(lead: Lead) {
  const customFields: Record<string, string> = {};
  for (const { key, value } of lead.details) customFields[key] = value;
  customFields.message = lead.message;
  customFields.receivedAt = lead.receivedAt;

  return {
    name: lead.name,
    phone: normalisePhone(lead.phone),
    email: lead.email,
    source: lead.source,
    // Fields the CRM offers but no form collects. Sent empty rather than
    // guessed at by reading the message.
    preferredLocation: "",
    requiredSqft: "",
    customFields,
  };
}

/** Returns false when no CRM is configured; throws when one is and it refused. */
async function sendToCrm(lead: Lead) {
  const endpoint = process.env.CRM_WEBHOOK_URL;
  if (!endpoint) return false;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(toCrmLead(lead)),
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
 * A plain-text lead someone can actually read on a phone. The number is
 * shown exactly as the visitor typed it — this copy is for a human about to
 * dial it, not for the CRM's matching, which gets the normalised form.
 */
function formatLeadEmail(lead: Lead) {
  const rows: [string, string][] = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ...lead.details.map(({ label, value }): [string, string] => [label, value]),
    ["Received", formatReceived(lead.receivedAt)],
  ];
  const width = Math.max(10, ...rows.map(([label]) => label.length + 2));

  return [
    lead.intro,
    "",
    ...rows.map(([label, value]) => `${label.padEnd(width)}${value}`),
    "",
    "Message",
    "-------",
    lead.message || "(none)",
    "",
    `Reply to this email to answer ${lead.name} directly.`,
  ].join("\n");
}

/** Returns false when no mail credentials are configured. */
async function sendEmailCopy(lead: Lead) {
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
      reply_to: lead.email,
      subject: lead.subject,
      text: formatLeadEmail(lead),
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
 * The two are deliberately not chained. A lead that reached either the CRM
 * or somebody's inbox is not lost, so one channel being down must not fail the
 * submission or suppress the other — a dead CRM webhook should not also cost us
 * the email. The visitor is only told something went wrong when nothing got
 * through at all.
 *
 * A channel that is merely unconfigured resolves false and is not a failure;
 * one that is configured and refused rejects, and is logged by name so a
 * half-working setup is visible in the log rather than silent.
 */
export async function deliverLead(lead: Lead) {
  const attempts = [
    ["CRM", sendToCrm(lead)],
    ["email", sendEmailCopy(lead)],
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
    console.error(`[${lead.logTag}] ${channel} delivery failed:`, result.reason);
  });

  if (delivered) return "delivered" as const;
  if (failures > 0) throw new Error("every configured delivery channel failed");
  return "unconfigured" as const;
}

/** The environment variables a deployment needs before either form can send. */
export const DELIVERY_SETUP_HINT =
  "set CRM_WEBHOOK_URL, or RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL";
