import { PhoneAppMark, WhatsAppMark } from "@/components/ui/app-marks";
import { contact } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * The two things a phone is actually holding — the dialer and WhatsApp —
 * parked on the bottom edge of every page.
 *
 * Phone only, and `desk:hidden` rather than a width query, for the reason at
 * the top of `globals.css`: a handset turned sideways is still a handset, and
 * this is the one control on the site that is about what the device *is*
 * rather than how much room the layout has. A laptop has the header, the
 * footer and the contact page, and a bar pinned across the bottom of a wide
 * window reads as an advertisement.
 *
 * It owns the bottom edge. The site-visit bubble used to have it to itself
 * and now clears this by reading `--action-bar-h`, and the page gets the same
 * height back as padding so the footer's last line is not sat on — both are
 * in `globals.css` beside the variable, and the variable is the only place
 * the height is written down.
 *
 * No JavaScript and no state: it is two links. That is deliberate at this
 * position on the page — this is the last thing standing between a visitor
 * and a phone call, and it should not be waiting on hydration to work.
 *
 * ⚠️ The numbers are placeholders. Both come from `contact` in `lib/site.ts`,
 * which carries the warning and is the only file to edit — every other
 * dialer link on the site reads the same two fields.
 */

/** Shared by both halves, so the pair is one object split down the middle. */
const ACTION = cn(
  "flex flex-1 items-center justify-center gap-2.5",
  "text-[0.8125rem] font-semibold tracking-[0.01em] text-navy-900",
  // A press has to register on a surface with no hover to do it — the scale
  // is the whole acknowledgement on a touchscreen.
  "transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  "active:scale-[0.97] active:bg-navy-50",
  // No focus ring of its own: `:focus-visible` in `globals.css` rings every
  // control on the site in brass, and a second ring here would double it.
);

export function MobileActionBar() {
  return (
    <div
      role="complementary"
      aria-label="Call or message us"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 desk:hidden",
        // Under the menu sheet (z-60), the header (z-50) and the language
        // chooser (z-200); level with the site-visit bubble, which sits
        // above it rather than beside it.
        "glass border-t border-navy-900/12",
        "shadow-[0_-6px_24px_-12px_rgba(10,31,68,0.35)]",
      )}
      // The inset is the bar's own business — `--action-bar-h` is the height
      // of the row, and the home indicator's strip is added underneath it.
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-[var(--action-bar-h)] items-stretch">
        <a href={contact.mobileHref} className={ACTION}>
          <PhoneAppMark aria-hidden="true" className="h-[1.375rem] w-[1.375rem]" />
          Call Sales
        </a>

        <span aria-hidden="true" className="my-3 w-px bg-navy-900/12" />

        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={ACTION}
        >
          <WhatsAppMark aria-hidden="true" className="h-[1.375rem] w-[1.375rem]" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
