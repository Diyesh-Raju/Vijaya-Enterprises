import Image from "next/image";
import Link from "next/link";
import { Logo } from "./logo";
import { Reveal } from "@/components/ui/reveal";
import { socialIcons } from "@/components/ui/social-icons";
import { img } from "@/lib/images";
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
 * A room, behind a scrim, with light type over it.
 *
 * This footer used to lay its copy straight on a photograph with nothing in
 * between, which meant the ink had to be re-decided every time the picture
 * changed — light room, dark room, sky. The scrim below is what makes the
 * picture swappable: it flattens whatever is behind it to a dark, warm
 * ground, and the ink is then decided once and stays decided.
 *
 * The whole column is reversed for it — white and navy-100 rather than navy,
 * the lockup swapped for its reversed artwork, rules and buttons drawn in
 * white alphas. That is the site's own dark-ground palette, the one the hero
 * and the navy bands already use; nothing here is a colour of its own.
 *
 * ⚠️ The scrim is tuned to the range of the photograph named in
 * `lib/images.ts` — not to photographs in general. That picture has a sunlit
 * window and a pale stone floor in it, and the type has to hold over the
 * brightest thing in the frame rather than over the average, which is what
 * puts the scrim as high as it is.
 *
 * It was set by measuring, not by eye: with the copy hidden, the single
 * brightest pixel of ground under each block of small type clears 4.5:1
 * against the ink that sits on it, at 1440 and at 390 wide, and the page
 * names (large text, so 3:1) clear it with room to spare. At 0.50 through
 * the middle the bright patches fell to about 4.0 and at 0.64 the room went
 * flat, so this is close to the light end of what holds. The two quietest
 * lines in the contact column are a step stronger than they would otherwise
 * be for the same reason: on a narrow screen they cross a highlight on the
 * sofa. Swap the photograph and all of that moves — re-measure rather than
 * assume, because the failure mode is a contact column nobody can read.
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
    // `isolate` so the backdrop's negative z-index stays inside the footer
    // and cannot slide under the page above it. The base colour is the
    // wood's own average, so the moment before the image decodes is the
    // same dark ground rather than a flash of white under white type.
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-[#241a13] text-white">
      {/* Decorative: behind two thirds of a scrim the room is a ground, not
          a subject, and every word in the footer is already in the markup.
          Alt text is kept beside it in `lib/images.ts` all the same, for
          wherever the picture is used with a voice. */}
      <Image
        src={img.backdropFooter}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        quality={85}
        placeholder="blur"
        className="-z-10 object-cover"
      />
      {/* The scrim. Warm near-black rather than pure black, so the room
          keeps its temperature instead of going grey, and close to flat
          rather than a steep gradient: a photograph's bright and dark
          passages fall wherever the crop puts them, so there is no one end
          to protect the way there is with a lit wall. It lifts at the two
          ends, where the small type sits, and thins through the middle,
          where the page names are large enough to look after themselves.
          See the warning above before changing these numbers. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(18,12,8,0.66)_0%,rgba(18,12,8,0.58)_42%,rgba(18,12,8,0.76)_100%)]"
      />

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
              <Logo reversed className="h-20 sm:h-24 lg:h-28" />
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
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10"
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
                      className="inline-block font-sans text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.3] tracking-[-0.02em] text-white transition-colors duration-300 hover:text-brass-300"
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
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-navy-100/85">
              Contact
            </h3>
            <ul className="mt-5 space-y-3 text-[0.9375rem] text-navy-100/90">
              <li>
                <a href={contact.phoneHref} className="link-underline hover:text-white">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={contact.emailHref} className="link-underline hover:text-white">
                  {contact.emailDisplay}
                </a>
              </li>
              <li className="text-navy-100/85">{contact.hours}</li>
            </ul>

            {offices.map((office) => (
              <address
                key={office.label}
                className="mt-6 not-italic text-[0.9375rem] leading-relaxed text-navy-100/85"
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
        <Reveal className="mt-16 flex flex-col gap-3 border-t border-white/12 pt-8 text-[0.8125rem] text-navy-100/85 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="text-navy-100/75">{site.promise}</p>
      </Reveal>
      </div>
    </footer>
  );
}
