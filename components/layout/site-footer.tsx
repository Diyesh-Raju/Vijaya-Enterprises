import Link from "next/link";
import { Logo } from "./logo";
import { Reveal } from "@/components/ui/reveal";
import { socialIcons } from "@/components/ui/social-icons";
import { navLinks, contact, offices, site, social } from "@/lib/site";

/**
 * The footer: the lockup on the left, the pages set large down the middle,
 * how to reach us on the right, over one legal line.
 *
 * The pages are the point of it. Set at heading size rather than as a list of
 * small links, they are legible from across the room and they are what someone
 * who has read to the bottom of a page is actually looking for. Everything
 * else on the row is deliberately quieter than they are.
 *
 * Nothing sells here. The company line, the "Discuss Your Project" button and
 * the list of disciplines all came out: every page above this one already ends
 * on a call to action, and a second one at the bottom of it was asking twice.
 *
 * White ground, navy type. It carried a full-bleed photograph for a while and
 * the copy sat straight on it, which meant the ink had to be re-decided every
 * time the picture changed — light room, dark room, sky. On white it is
 * settled.
 */

/** Every page, in the order the menu lists them. */
const pageLinks = [
  { href: "/", label: "Home" },
  ...navLinks.map(({ href, label }) => ({ href, label })),
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQ" },
].filter(
  (link, index, all) =>
    all.findIndex((other) => other.href === link.href) === index,
);

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    // Navy at a tenth, which over the white page reads as a pale blue wash
    // rather than as a colour of its own — enough to part the footer from
    // whatever the page ended on, light enough that navy type on it keeps
    // the same contrast it had on white. Written as an alpha rather than as
    // a flat tint so it stays honest if anything is ever put behind it.
    <footer className="border-t border-navy-900/10 bg-navy-900/10 text-navy-950">
      <div className="container-page pb-20 pt-[4.5rem] sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* ------------------------------------------------------ Brand */}
          <Reveal className="lg:col-span-4">
            {/* Dropped a little below the line the other two columns start
                on. The lockup is a picture with its own air around it, so
                hanging it level with the first page name left it reading
                high rather than aligned. */}
            <Link
              href="/"
              aria-label="Vijaya Enterprises — home"
              className="mt-3 inline-flex rounded-2xl sm:mt-5 lg:mt-7"
            >
              <Logo className="h-20 sm:h-24 lg:h-28" />
            </Link>

            {/* Marks only, no names: four known glyphs in a row read faster
                than four words, and the label is there for a screen reader.
                Reads off `site.social` — an account we do not have is an
                entry that is not in the list. */}
            {social.length > 0 && (
              <ul className="mt-7 flex items-center gap-3">
                {social.map(({ label, href }) => {
                  const Icon = socialIcons[label];
                  if (!Icon) return null;

                  return (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`${site.name} on ${label}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 text-navy-900 transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-navy-400 hover:bg-navy-50"
                      >
                        <Icon className="h-[1.125rem] w-[1.125rem]" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </Reveal>

          {/* ------------------------------------------------------ Pages */}
          <Reveal delay={80} className="lg:col-span-5">
            <nav aria-label="Pages">
              <ul className="space-y-1">
                {pageLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block font-sans text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.3] tracking-[-0.02em] text-navy-950 transition-colors duration-300 hover:text-navy-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {/* ------------------------------------------------- How to reach us */}
          <Reveal delay={160} className="lg:col-span-3">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-slate-muted">
              Contact
            </h3>
            <ul className="mt-5 space-y-3 text-[0.9375rem] text-navy-900">
              <li>
                <a href={contact.phoneHref} className="link-underline hover:text-navy-950">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={contact.emailHref} className="link-underline hover:text-navy-950">
                  {contact.emailDisplay}
                </a>
              </li>
              <li className="text-slate-muted">{contact.hours}</li>
            </ul>

            {offices.map((office) => (
              <address
                key={office.label}
                className="mt-6 not-italic text-[0.9375rem] leading-relaxed text-navy-900"
              >
                {office.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ))}
          </Reveal>
        </div>

        {/* -------------------------------------------------- Bottom line */}
        <Reveal className="mt-16 flex flex-col gap-3 border-t border-line pt-8 text-[0.8125rem] text-slate-body sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="text-slate-muted">{site.promise}</p>
      </Reveal>
      </div>
    </footer>
  );
}
