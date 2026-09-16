"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { submitEnquiry } from "./actions";
import { initialEnquiryState, PROJECT_TYPES } from "./enquiry";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-2xl border bg-white px-5 py-4 text-[1rem] text-navy-900 " +
  "transition-colors duration-300 placeholder:text-slate-muted/70 " +
  "focus:border-navy-400 focus:outline-none focus-visible:outline-none";

/**
 * The questions, in the order they are asked.
 *
 * The form used to put all five on the page at once. Asked to change
 * (2026-09-16): five questions in one view read as a wall, and the ask was
 * one at a time with a count of how far along you are. Nothing about what is
 * sent changed. Every field is still in the DOM under its own `name`, so the
 * single submit at the end posts exactly the `FormData` the server action
 * already reads, and `lib/leads.ts` and the CRM webhook are untouched.
 *
 * `check` repeats the rule the server applies, so a question cannot be left
 * on a value that would only be refused three screens later. The server
 * still validates everything itself; this copy is a courtesy, not the gate.
 */
type Step = {
  name: string;
  /** Asked as a question, because it is now the only thing on the screen. */
  question: string;
  /** A line under the question, where one earns its place. */
  hint?: string;
  optional?: boolean;
  check?: (value: string) => string | undefined;
};

/** Kept in step with `LIMITS` and the two regexes in `lib/leads.ts`. */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const PHONE_RE = /^[+()\d][\d\s\-()]{5,19}$/;

const STEPS: readonly Step[] = [
  {
    name: "name",
    question: "What is your name?",
    check: (value) =>
      value.length < 2 || value.length > 100
        ? "Please enter your name."
        : undefined,
  },
  {
    name: "email",
    question: "What is your email address?",
    hint: "This is where we reply first.",
    check: (value) =>
      !value || value.length > 254 || !EMAIL_RE.test(value)
        ? "Please enter a valid email address."
        : undefined,
  },
  {
    name: "phone",
    question: "What number can we reach you on?",
    check: (value) => {
      if (!value) return "Please enter a phone number so we can reach you.";
      if (!PHONE_RE.test(value)) return "Please enter a valid phone number.";
      return undefined;
    },
  },
  {
    name: "projectType",
    question: "What is this about?",
    hint: "If none of these fit, choose Something else and tell us in the next question.",
    optional: true,
  },
  {
    name: "message",
    question: "Tell us about your project",
    hint: "Where is the site, what would you like to build, and what stage are you at?",
    check: (value) =>
      value.length < 10
        ? "Please tell us a little about your project (at least 10 characters)."
        : undefined,
  },
];

const LAST = STEPS.length - 1;

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-3 text-[0.8125rem] text-red-200">
      {children}
    </p>
  );
}

/** The rules over the question: filled behind you, open ahead. */
function Progress({ at }: { at: number }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div aria-hidden="true" className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <span
            key={step.name}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              index === at
                ? "w-7 bg-white"
                : index < at
                  ? "w-3 bg-white/55"
                  : "w-3 bg-white/25",
            )}
          />
        ))}
      </div>
      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.24em] text-white/65">
        <span className="sr-only">Question </span>
        {at + 1} / {STEPS.length}
      </p>
    </div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitEnquiry,
    initialEnquiryState,
  );
  const uid = useId();
  const statusRef = useRef<HTMLDivElement | null>(null);
  const startedAtRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [at, setAt] = useState(0);
  /** Client-side complaints, cleared as soon as the answer changes. */
  const [said, setSaid] = useState<Record<string, string>>({});
  /** Whether a question has been walked to, and so should take focus. False
      on the first paint, where focus belongs wherever the reader put it. */
  const [walked, setWalked] = useState(false);

  const step = STEPS[at];

  // Stamped on the client after mount, so the timing trap measures how long a
  // real person spent on the form. Rendering it on the server would bake a
  // stale time into the statically cached page.
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  // Move attention to the result once the server answers.
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const serverErrors = useMemo(() => state.errors ?? {}, [state.errors]);
  const values = state.values ?? {};

  // If the server sends anything back, walk to the first question it objected
  // to, otherwise its message would point at a field the visitor cannot see.
  //
  // Adjusted during render rather than in an effect, which is React's own
  // pattern for resetting state on a changed value: it happens before paint,
  // so the wrong question is never shown for a frame. `answer` is the state
  // object the action returned, and a new one arrives only when the server
  // has answered, so this runs once per reply.
  const [answer, setAnswer] = useState(state);
  if (answer !== state) {
    setAnswer(state);
    const first = STEPS.findIndex((one) => serverErrors[one.name]);
    if (first >= 0) {
      setWalked(true);
      setAt(first);
    }
  }

  // The question showing takes focus, so a keyboard or a screen reader lands
  // on it rather than back at the top of the page.
  useEffect(() => {
    if (!walked) return;
    formRef.current
      ?.querySelector<HTMLElement>(
        `[data-step="${at}"] input, [data-step="${at}"] select, [data-step="${at}"] textarea`,
      )
      ?.focus();
  }, [at, walked]);

  const forward = useCallback(() => {
    const field = formRef.current?.elements.namedItem(step.name);
    const answered =
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
        ? field
        : null;
    const complaint = step.check?.(answered?.value.trim() ?? "");
    if (complaint) {
      setSaid((was) => ({ ...was, [step.name]: complaint }));
      answered?.focus();
      return;
    }
    setWalked(true);
    setAt((was) => Math.min(was + 1, LAST));
  }, [step]);

  // Enter moves on rather than submitting, for every question but the last.
  // Without this, one press of Enter would post a form with four questions
  // still unanswered.
  const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLTextAreaElement) return;
    if (at === LAST) return;
    event.preventDefault();
    forward();
  };

  const clear = (name: string) =>
    setSaid((was) => (was[name] ? { ...was, [name]: "" } : was));

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="rounded-[1.75rem] border border-line bg-mist p-9 sm:rounded-[2rem] sm:p-12"
      >
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-brass-600">
          Enquiry received
        </p>
        <h3 className="mt-6 font-display text-[1.75rem] leading-snug text-navy-900 sm:text-[2rem]">
          Thank you. We will be in touch.
        </h3>
        <p className="mt-5 text-[1rem] leading-relaxed text-slate-body">
          {state.message}
        </p>
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-slate-muted">
          If your requirement is urgent, please call us directly, and you will
          reach someone who can help.
        </p>
      </div>
    );
  }

  /** The server first: it is the one that stopped the submit. */
  const complaintFor = (name: string) => serverErrors[name] || said[name] || "";

  return (
    <form
      ref={formRef}
      action={formAction}
      onKeyDown={onKeyDown}
      noValidate
    >
      {/* Bot trap: still rendered and still filled in by naive bots, but
          clipped to a 1px box so it cannot affect layout width. */}
      <div
        aria-hidden="true"
        className="absolute h-px w-px overflow-hidden [clip-path:inset(50%)]"
      >
        <label htmlFor={`${uid}-company`}>Company (leave blank)</label>
        <input
          id={`${uid}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />

      <Progress at={at} />

      {state.status === "error" && state.message && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[0.9375rem] text-red-800"
        >
          {state.message}
        </div>
      )}

      {/* Every question stays mounted and only the one showing is visible, so
          the answers behind you are still in the `FormData` the last press
          posts. `hidden` rather than unmounting, which also keeps the fields
          off-screen out of the tab order. A floor under the height, so the
          buttons do not jump as the questions change length. */}
      <div className="mt-7 min-h-[12rem] sm:min-h-[13rem]">
        {STEPS.map((one, index) => (
          <div key={one.name} data-step={index} hidden={index !== at}>
            <label
              htmlFor={`${uid}-${one.name}`}
              className="block font-display text-[1.375rem] leading-snug text-white sm:text-[1.625rem]"
            >
              {one.question}
              {one.optional && (
                <span className="ml-2 align-middle text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-white/60">
                  Optional
                </span>
              )}
            </label>
            {one.hint && (
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-white/70">
                {one.hint}
              </p>
            )}

            <div className="mt-6">
              {one.name === "projectType" ? (
                <select
                  id={`${uid}-projectType`}
                  name="projectType"
                  defaultValue={values.projectType ?? ""}
                  onChange={() => clear("projectType")}
                  aria-invalid={Boolean(complaintFor("projectType"))}
                  aria-describedby={
                    complaintFor("projectType")
                      ? `${uid}-projectType-error`
                      : undefined
                  }
                  className={cn(
                    fieldBase,
                    "appearance-none bg-[length:1rem] bg-[right_1.25rem_center] bg-no-repeat pr-12",
                    complaintFor("projectType")
                      ? "border-red-300"
                      : "border-line-strong",
                  )}
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%234d5f7a' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
                  }}
                >
                  <option value="">Please choose…</option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              ) : one.name === "message" ? (
                <textarea
                  id={`${uid}-message`}
                  name="message"
                  rows={5}
                  maxLength={4000}
                  defaultValue={values.message}
                  onChange={() => clear("message")}
                  aria-invalid={Boolean(complaintFor("message"))}
                  aria-describedby={
                    complaintFor("message") ? `${uid}-message-error` : undefined
                  }
                  className={cn(
                    fieldBase,
                    "resize-y",
                    complaintFor("message")
                      ? "border-red-300"
                      : "border-line-strong",
                  )}
                  placeholder="A few lines is plenty."
                />
              ) : (
                <input
                  id={`${uid}-${one.name}`}
                  name={one.name}
                  type={
                    one.name === "email"
                      ? "email"
                      : one.name === "phone"
                        ? "tel"
                        : "text"
                  }
                  autoComplete={
                    one.name === "email"
                      ? "email"
                      : one.name === "phone"
                        ? "tel"
                        : "name"
                  }
                  inputMode={one.name === "phone" ? "tel" : undefined}
                  maxLength={
                    one.name === "email" ? 254 : one.name === "phone" ? 20 : 100
                  }
                  defaultValue={values[one.name]}
                  onChange={() => clear(one.name)}
                  aria-invalid={Boolean(complaintFor(one.name))}
                  aria-describedby={
                    complaintFor(one.name)
                      ? `${uid}-${one.name}-error`
                      : undefined
                  }
                  className={cn(
                    fieldBase,
                    complaintFor(one.name)
                      ? "border-red-300"
                      : "border-line-strong",
                  )}
                  placeholder={
                    one.name === "email"
                      ? "you@example.com"
                      : one.name === "phone"
                        ? "+91"
                        : "Full name"
                  }
                />
              )}
              <FieldError id={`${uid}-${one.name}-error`}>
                {complaintFor(one.name)}
              </FieldError>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-5 border-t border-white/20 pt-6 sm:flex-row-reverse sm:items-center sm:justify-between">
        {at === LAST ? (
          <button
            type="submit"
            disabled={pending}
            className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-navy-900 px-9 py-4 text-[0.9375rem] font-semibold text-white shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-navy-800 hover:shadow-lift active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send Enquiry"}
            {!pending && (
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={forward}
            className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-navy-900 px-9 py-4 text-[0.9375rem] font-semibold text-white shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-navy-800 hover:shadow-lift active:scale-[0.98]"
          >
            {step.optional ? "Skip" : "Next"}
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {at > 0 ? (
          <button
            type="button"
            onClick={() => {
              setWalked(true);
              setAt((was) => Math.max(was - 1, 0));
            }}
            className="inline-flex items-center gap-2 self-start text-[0.9375rem] font-semibold text-white/75 transition-colors duration-300 hover:text-white"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
              <path
                d="M13 8H3.5M7 4.5 3.5 8 7 11.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        ) : (
          <p className="text-[0.8125rem] leading-relaxed text-white/65">
            We use your details only to respond to this enquiry.
          </p>
        )}
      </div>
    </form>
  );
}
