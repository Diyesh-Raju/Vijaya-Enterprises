"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitBooking } from "./actions";
import {
  OTHER_PROJECT,
  PROJECT_CHOICES,
  TIME_SLOTS,
  addDays,
  formatVisitDate,
  MAX_DAYS_AHEAD,
  todayInIndia,
} from "./booking";
import { initialEnquiryState } from "@/app/contact/enquiry";
import { contact } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * The booking form, drawn as a visit pass.
 *
 * The enquiry form is a white card of fields; this is deliberately not that.
 * It is a ticket: the questions run down the long side in three numbered
 * steps — the project, the day, who is coming — and a navy stub on the short
 * side fills itself in as they are answered, so what will be sent is visible
 * before it is sent. A dashed perforation with a notch at either end joins
 * the two, which is what makes it read as one slip and not a form beside a
 * summary.
 *
 * Underneath, it is the enquiry form: same honeypot, same timing stamp, same
 * `useActionState` loop, same shape of answer back. Only the fields differ.
 *
 * `project` is either a real project — the pass came from that project's own
 * page, and the choice is printed rather than offered — or absent, in which
 * case the first step is a row of choices.
 */
export type LockedProject = {
  name: string;
  slug: string;
  locality: string;
  image?: StaticImageData;
  imageAlt?: string;
};

const fieldBase =
  "w-full rounded-2xl border bg-white px-5 py-4 text-[1rem] text-navy-900 " +
  "transition-colors duration-300 placeholder:text-slate-muted/70 " +
  "focus:border-navy-400 focus:outline-none focus-visible:outline-none";

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 text-[0.8125rem] text-red-700">
      {children}
    </p>
  );
}

/** A step's heading: a brass numeral, then the question. */
function Step({ number, children }: { number: string; children: string }) {
  return (
    <h3 className="flex items-baseline gap-4 font-display text-[1.25rem] leading-snug text-navy-900 sm:text-[1.375rem]">
      <span
        aria-hidden="true"
        className="font-display text-[0.875rem] tabular-nums tracking-[0.1em] text-brass-600"
      >
        {number}
      </span>
      {children}
    </h3>
  );
}

/** A choice drawn as a pill. The input is real and the label is the pill. */
function Pill({
  name,
  value,
  checked,
  onChange,
  hint,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  hint?: string;
  children: string;
}) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer flex-col items-start rounded-[1.25rem] border px-5 py-3.5",
        "transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brass-500",
        checked
          ? "border-navy-900 bg-navy-900 text-white shadow-soft"
          : "border-line-strong bg-white text-navy-900 hover:-translate-y-0.5 hover:border-navy-300 hover:bg-navy-50",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span className="text-[0.9375rem] font-semibold leading-snug">{children}</span>
      {hint && (
        <span
          className={cn(
            "mt-1 text-[0.75rem] leading-none",
            checked ? "text-navy-100/80" : "text-slate-muted",
          )}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

/** One line on the stub: a small label over the value, or a dash until chosen. */
function StubRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-brass-400">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1.5 text-[1rem] leading-snug transition-colors duration-300",
          value ? "font-semibold text-white" : "text-white/35",
        )}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

export function BookingForm({ project }: { project?: LockedProject }) {
  const [state, formAction, pending] = useActionState(
    submitBooking,
    initialEnquiryState,
  );
  const uid = useId();
  const statusRef = useRef<HTMLDivElement | null>(null);
  const startedAtRef = useRef<HTMLInputElement | null>(null);
  const dateRef = useRef<HTMLInputElement | null>(null);

  const errors = state.errors ?? {};
  const values = state.values ?? {};

  // The three choices the stub echoes. Held in state because the stub has to
  // move as they change; the name, phone and email stay uncontrolled like
  // the enquiry form's, with the server echoing them back on an error.
  const [chosenProject, setChosenProject] = useState(
    project?.name ?? values.project ?? "",
  );
  const [date, setDate] = useState(values.preferredDate ?? "");
  const [slot, setSlot] = useState(values.timeSlot ?? "");

  // Stamped on the client after mount, so the timing trap measures how long
  // a real person spent on the form — see the note in the enquiry form.
  // The date field's bounds are set the same way and for a related reason:
  // "today" baked into the server's markup would be stale by the time a
  // statically cached page was served.
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
    if (dateRef.current) {
      const today = todayInIndia();
      dateRef.current.min = today;
      dateRef.current.max = addDays(today, MAX_DAYS_AHEAD);
    }
  }, []);

  // Move attention to the result once the server answers.
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const dateLabel = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? formatVisitDate(date) : undefined;

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="pass overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0 bg-white p-8 sm:p-11 lg:p-12">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-brass-600">
              Request received
            </p>
            <h3 className="mt-6 font-display text-[1.75rem] leading-snug text-navy-900 sm:text-[2rem]">
              Your visit is pencilled in.
            </h3>
            <p className="mt-5 text-[1rem] leading-relaxed text-slate-body">
              {state.message}
            </p>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-slate-muted">
              If the day changes for you before we call, simply reply to our
              call or message us on WhatsApp and we will move it.
            </p>
          </div>
          <div className="pass__stub relative min-w-0 bg-navy-950 p-8 text-white sm:p-10 lg:p-9">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-brass-400">
              Visit pass
            </p>
            <dl className="mt-7 space-y-6">
              <StubRow label="Project" value={chosenProject || undefined} />
              <StubRow label="Day" value={dateLabel} />
              <StubRow label="Time" value={slot || undefined} />
            </dl>
            <p className="mt-9 inline-flex items-center gap-2 rounded-full border border-brass-400/50 px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-brass-300">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brass-400" />
              Awaiting our call
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="pass relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_19rem]">
        {/* ------------------------------------------------- The questions */}
        <div className="min-w-0 bg-white p-7 sm:p-10 lg:p-12">
          {state.status === "error" && state.message && (
            <div
              ref={statusRef}
              tabIndex={-1}
              role="alert"
              className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[0.9375rem] text-red-800"
            >
              {state.message}
            </div>
          )}

          {/* ---- 01 The project ---------------------------------------- */}
          {/* `min-w-0` on every fieldset: a fieldset defaults to
              `min-inline-size: min-content`, so the non-wrapping project
              name in the locked row would otherwise push it past the panel
              on a phone. */}
          <fieldset className="min-w-0">
            <legend className="sr-only">Which project would you like to visit?</legend>
            <Step number="01">
              {project ? "You are booking a visit to" : "Which project would you like to see?"}
            </Step>

            {project ? (
              <div className="mt-6 flex items-center gap-4 rounded-[1.25rem] border border-navy-900 bg-navy-900 p-2.5 pr-5 text-white sm:gap-5">
                <input type="hidden" name="project" value={project.name} />
                <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-[0.9rem] bg-navy-800 sm:h-20 sm:w-32">
                  {project.image && (
                    <Image
                      src={project.image}
                      alt={project.imageAlt ?? ""}
                      fill
                      sizes="8rem"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[1.0625rem] leading-snug [overflow-wrap:anywhere] sm:text-[1.1875rem]">
                    {project.name}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] text-navy-100/75">
                    {project.locality}
                  </span>
                </span>
                <Link
                  href="/site-booking"
                  className="link-underline shrink-0 text-[0.8125rem] font-semibold text-white"
                >
                  Change
                </Link>
              </div>
            ) : (
              <div
                className="mt-6 flex flex-wrap gap-3"
                aria-describedby={errors.project ? `${uid}-project-error` : undefined}
              >
                {PROJECT_CHOICES.map((choice) => (
                  <Pill
                    key={choice}
                    name="project"
                    value={choice}
                    checked={chosenProject === choice}
                    onChange={setChosenProject}
                    hint={choice === OTHER_PROJECT ? undefined : "Has its own page"}
                  >
                    {choice}
                  </Pill>
                ))}
              </div>
            )}
            <FieldError id={`${uid}-project-error`}>{errors.project}</FieldError>
          </fieldset>

          {/* ---- 02 The day ----------------------------------------------- */}
          <fieldset className="mt-12 min-w-0 border-t border-line pt-10">
            <legend className="sr-only">When would you like to visit?</legend>
            <Step number="02">When suits you?</Step>

            <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-8">
              <div>
                <label
                  htmlFor={`${uid}-date`}
                  className="mb-2.5 block text-[0.8125rem] font-semibold text-navy-900"
                >
                  Preferred day <span className="text-brass-600">*</span>
                </label>
                <input
                  ref={dateRef}
                  id={`${uid}-date`}
                  name="preferredDate"
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  aria-invalid={Boolean(errors.preferredDate)}
                  aria-describedby={errors.preferredDate ? `${uid}-date-error` : undefined}
                  className={cn(
                    fieldBase,
                    "appearance-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60",
                    errors.preferredDate ? "border-red-300" : "border-line-strong",
                  )}
                />
                <FieldError id={`${uid}-date-error`}>{errors.preferredDate}</FieldError>
              </div>

              <div>
                <p className="mb-2.5 block text-[0.8125rem] font-semibold text-navy-900">
                  Time of day <span className="text-brass-600">*</span>
                </p>
                <div
                  className="flex flex-wrap gap-3"
                  role="radiogroup"
                  aria-label="Time of day"
                  aria-describedby={errors.timeSlot ? `${uid}-slot-error` : undefined}
                >
                  {TIME_SLOTS.map((option) => (
                    <Pill
                      key={option.value}
                      name="timeSlot"
                      value={option.value}
                      checked={slot === option.value}
                      onChange={setSlot}
                      hint={option.hint}
                    >
                      {option.value}
                    </Pill>
                  ))}
                </div>
                <FieldError id={`${uid}-slot-error`}>{errors.timeSlot}</FieldError>
              </div>
            </div>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-slate-muted">
              {contact.hours}. We confirm the exact time with you by phone.
            </p>
          </fieldset>

          {/* ---- 03 Who is coming --------------------------------------- */}
          <fieldset className="mt-12 min-w-0 border-t border-line pt-10">
            <legend className="sr-only">Your details</legend>
            <Step number="03">Who should we expect?</Step>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${uid}-name`}
                  className="mb-2.5 block text-[0.8125rem] font-semibold text-navy-900"
                >
                  Your name <span className="text-brass-600">*</span>
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
                  className={cn(fieldBase, errors.name ? "border-red-300" : "border-line-strong")}
                  placeholder="Full name"
                />
                <FieldError id={`${uid}-name-error`}>{errors.name}</FieldError>
              </div>

              <div>
                <label
                  htmlFor={`${uid}-phone`}
                  className="mb-2.5 block text-[0.8125rem] font-semibold text-navy-900"
                >
                  Phone <span className="text-brass-600">*</span>
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
                  className={cn(fieldBase, errors.phone ? "border-red-300" : "border-line-strong")}
                  placeholder="+91"
                />
                <FieldError id={`${uid}-phone-error`}>{errors.phone}</FieldError>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor={`${uid}-email`}
                  className="mb-2.5 block text-[0.8125rem] font-semibold text-navy-900"
                >
                  Email <span className="text-brass-600">*</span>
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
                  className={cn(fieldBase, errors.email ? "border-red-300" : "border-line-strong")}
                  placeholder="you@example.com"
                />
                <FieldError id={`${uid}-email-error`}>{errors.email}</FieldError>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor={`${uid}-message`}
                  className="mb-2.5 block text-[0.8125rem] font-semibold text-navy-900"
                >
                  Anything we should know?{" "}
                  <span className="font-normal text-slate-muted">(optional)</span>
                </label>
                <textarea
                  id={`${uid}-message`}
                  name="message"
                  rows={3}
                  maxLength={2000}
                  defaultValue={values.message}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? `${uid}-message-error` : undefined}
                  className={cn(
                    fieldBase,
                    "resize-y",
                    errors.message ? "border-red-300" : "border-line-strong",
                  )}
                  placeholder="The layout you have in mind, how many are coming, or a question for the site team."
                />
                <FieldError id={`${uid}-message-error`}>{errors.message}</FieldError>
              </div>
            </div>
          </fieldset>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.8125rem] leading-relaxed text-slate-muted">
              We use your details only to arrange this visit.
            </p>
            <button
              type="submit"
              disabled={pending}
              className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-navy-900 px-9 py-4 text-[0.9375rem] font-semibold text-white shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-navy-800 hover:shadow-lift active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Sending…" : "Request This Visit"}
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
        </div>

        {/* ------------------------------------------------------- The stub */}
        <aside
          aria-label="Your visit pass"
          className="pass__stub relative flex min-w-0 flex-col bg-navy-950 p-8 text-white sm:p-10 lg:p-9"
        >
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-brass-400">
            Visit pass
          </p>
          <p className="mt-3 font-display text-[1.375rem] leading-snug text-white">
            {chosenProject && chosenProject !== OTHER_PROJECT
              ? "See it in person."
              : "Fills in as you go."}
          </p>

          <dl className="mt-8 space-y-6">
            <StubRow label="Project" value={chosenProject || undefined} />
            <StubRow label="Day" value={dateLabel} />
            <StubRow label="Time" value={slot || undefined} />
          </dl>

          <div className="mt-auto border-t border-white/10 pt-7">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-brass-400">
              Rather talk?
            </p>
            <a
              href={contact.mobileHref}
              className="link-underline mt-2 inline-block text-[1rem] font-semibold text-white"
            >
              {contact.mobileDisplay}
            </a>
            <p className="mt-1.5 text-[0.8125rem] text-white/55">{contact.hours}</p>
          </div>
        </aside>
      </div>
    </form>
  );
}
