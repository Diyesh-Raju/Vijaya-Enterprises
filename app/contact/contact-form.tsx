"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { submitEnquiry } from "./actions";
import { initialEnquiryState, PROJECT_TYPES } from "./enquiry";
import { cn } from "@/lib/cn";

/**
 * The form sits on frosted glass over a photograph, so every field is a pane
 * of the same glass rather than a white box on it — a solid white input would
 * punch a hole in the frost and the panel would stop reading as one surface.
 *
 * The fill is deliberately heavier than the panel's own (18% against 12%):
 * a field has to look like somewhere to type, which means it has to sit
 * slightly forward of the thing it is set into, and on glass the only way
 * forward is lighter.
 */
const fieldBase =
  "w-full rounded-2xl border bg-white/[0.18] px-5 py-4 text-[1rem] text-white " +
  "transition-colors duration-300 placeholder:text-white/55 " +
  "focus:border-white/75 focus:bg-white/[0.24] focus:outline-none focus-visible:outline-none";

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 text-[0.8125rem] text-red-200">
      {children}
    </p>
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

  // Stamped on the client after mount, so the timing trap measures how long a
  // real person spent on the form. Rendering it on the server would bake a
  // stale time into the statically cached page. Written straight to the input
  // because nothing about this value needs to re-render the form.
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  // Move attention to the result once the server answers.
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const errors = state.errors ?? {};
  const values = state.values ?? {};

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        // Glass too. This replaces the form inside the frosted panel, so a
        // mist card here would drop an opaque light box into the middle of it.
        className="rounded-[1.75rem] border border-white/25 bg-white/[0.1] p-9 backdrop-blur-[18px] sm:rounded-[2rem] sm:p-12"
      >
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-brass-400">
          Enquiry received
        </p>
        <h3 className="mt-6 font-display text-[1.75rem] leading-snug text-white sm:text-[2rem]">
          Thank you. We will be in touch.
        </h3>
        <p className="mt-5 text-[1rem] leading-relaxed text-white/85">
          {state.message}
        </p>
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-white/60">
          If your requirement is urgent, please call us directly — you will reach
          someone who can help.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-6">
      {/* Bot trap: still rendered and still filled in by naive bots, but
          clipped to a 1px box so it cannot affect layout width (an
          off-screen `left:-9999px` version widened the page's scroll area). */}
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

      {state.status === "error" && state.message && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="rounded-2xl border border-red-300/60 bg-red-950/40 px-5 py-4 text-[0.9375rem] text-red-100 backdrop-blur-[12px]"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${uid}-name`}
            className="mb-2.5 block text-[0.8125rem] font-semibold text-white"
          >
            Your name <span className="text-brass-400">*</span>
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={100}
            defaultValue={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            className={cn(fieldBase, errors.name ? "border-red-300" : "border-white/30")}
            placeholder="Full name"
          />
          <FieldError id={`${uid}-name-error`}>{errors.name}</FieldError>
        </div>

        <div>
          <label
            htmlFor={`${uid}-email`}
            className="mb-2.5 block text-[0.8125rem] font-semibold text-white"
          >
            Email <span className="text-brass-400">*</span>
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
            defaultValue={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${uid}-email-error` : undefined}
            className={cn(fieldBase, errors.email ? "border-red-300" : "border-white/30")}
            placeholder="you@example.com"
          />
          <FieldError id={`${uid}-email-error`}>{errors.email}</FieldError>
        </div>

        <div>
          <label
            htmlFor={`${uid}-phone`}
            className="mb-2.5 block text-[0.8125rem] font-semibold text-white"
          >
            Phone <span className="text-brass-400">*</span>
          </label>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            defaultValue={values.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
            className={cn(fieldBase, errors.phone ? "border-red-300" : "border-white/30")}
            placeholder="+91"
          />
          <FieldError id={`${uid}-phone-error`}>{errors.phone}</FieldError>
        </div>

        <div>
          <label
            htmlFor={`${uid}-projectType`}
            className="mb-2.5 block text-[0.8125rem] font-semibold text-white"
          >
            What is this about?
          </label>
          <select
            id={`${uid}-projectType`}
            name="projectType"
            defaultValue={values.projectType ?? ""}
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={
              errors.projectType ? `${uid}-projectType-error` : undefined
            }
            className={cn(
              fieldBase,
              "appearance-none bg-[length:1rem] bg-[right_1.25rem_center] bg-no-repeat pr-12",
              // The closed control is glass with white type; the open list is
              // drawn by the browser and inherits none of that, so each option
              // is given the panel's colours explicitly. Without it the list
              // comes up white-on-white in most browsers.
              "[&>option]:bg-navy-950 [&>option]:text-white",
              errors.projectType ? "border-red-300" : "border-white/30",
            )}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23ffffff' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">Please choose…</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <FieldError id={`${uid}-projectType-error`}>
            {errors.projectType}
          </FieldError>
        </div>
      </div>

      <div>
        <label
          htmlFor={`${uid}-message`}
          className="mb-2.5 block text-[0.8125rem] font-semibold text-white"
        >
          Tell us about your project <span className="text-brass-400">*</span>
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          required
          rows={6}
          maxLength={4000}
          defaultValue={values.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${uid}-message-error` : undefined}
          className={cn(
            fieldBase,
            "resize-y",
            errors.message ? "border-red-300" : "border-white/30",
          )}
          placeholder="Where is the site, what would you like to build, and what stage are you at?"
        />
        <FieldError id={`${uid}-message-error`}>{errors.message}</FieldError>
      </div>

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.8125rem] leading-relaxed text-white/60">
          We use your details only to respond to this enquiry.
        </p>
        <button
          type="submit"
          disabled={pending}
          // White, inverting to black — not the site's navy pill. On glass
          // over a photograph the navy read as a third colour competing with
          // the picture; white and black are the two the glass already has.
          className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-white px-9 py-4 text-[0.9375rem] font-semibold text-black shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-black hover:text-white hover:shadow-lift active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send Enquiry"}
          {!pending && (
            <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1">
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
      </div>
    </form>
  );
}
