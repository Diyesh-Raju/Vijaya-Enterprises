"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/layout/logo";
import {
  isPhone,
  prefetchDictionary,
  restoreLanguage,
  setLanguage,
  setLanguageState,
  type Language,
} from "@/lib/language";

/**
 * The chooser a phone meets before the site, and the splash it gets instead
 * on every visit after that.
 *
 * Both are in the served HTML and both are shown or hidden by CSS, off the
 * `data-lang-state` attribute the inline script in `app/layout` sets while
 * the document is still parsing. That is the whole trick: the server cannot
 * know which of the three states this reader is in, so nothing here may
 * depend on it at render time — React renders the same markup for everybody
 * and the attribute decides what is on screen. Anything keyed off the stored
 * choice in a render would paint one answer and then flip to the other.
 *
 * Once the effect below has run, the real answer is known and whichever of
 * the two is not needed — usually both — is unmounted for good.
 */

/** Long enough to read as a lift rather than a cut. Matches `globals.css`. */
const FADE_MS = 620;

export function LanguageGate() {
  /** Set once the language question is answered, one way or another. */
  const [settled, setSettled] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState<Language | null>(null);
  const gateRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;

    restoreLanguage().then((stored) => {
      if (!alive) return;

      // A laptop, or a phone that has chosen before: there is no question to
      // ask. `restoreLanguage` has already put the page into the stored
      // language and cleared the veil, so this is only the tidy-up.
      if (stored !== null || !isPhone()) {
        setLanguageState("ready");
        setSettled(true);
        return;
      }

      setLanguageState("gate");
      gateRef.current?.focus();
      // Warm the Kannada while the reader is deciding, so choosing it is a
      // fade rather than a fade and then a wait.
      prefetchDictionary();
    });

    return () => {
      alive = false;
    };
  }, []);

  if (settled) return null;

  const choose = async (language: Language) => {
    if (busy) return;
    setBusy(language);

    // Translate under the cover, not after lifting it — the whole point of
    // the gate standing there is that the page behind it is never seen in
    // the language the reader just turned down.
    await setLanguage(language);
    setLanguageState("ready");

    setLeaving(true);
    window.setTimeout(() => setSettled(true), FADE_MS);
  };

  return (
    <>
      {/* ------------------------------------------------- The chooser */}
      <div
        ref={gateRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-gate-lede"
        // Its own words are the one place on the site where both languages
        // are on screen at once, and neither may be swapped for the other.
        data-no-translate
        data-leaving={leaving ? "" : undefined}
        className="lang-gate"
      >
        <div className="lang-gate__inner">
          {/* Big, and at the top of the stack — this screen is the mark and
              one question, and the mark is what says whose site this is
              before a word of either language has been read. */}
          {/* On a first visit this is the largest thing on the screen and
              therefore the page's LCP, so it is fetched with the document
              rather than after it. `priority` follows `reversed` inside
              `Logo`, so it lands on the artwork actually on show. */}
          <Logo reversed priority className="lang-gate__logo" width={560} />

          <span aria-hidden="true" className="lang-gate__rule" />

          <p id="lang-gate-lede" className="lang-gate__lede">
            Choose your language to continue
          </p>

          {/* Each one set in its own script. A reader who wants Kannada is
              looking for ಕನ್ನಡ, not for the word "Kannada" — and the pair
              carry no order of preference: same size, same fill, same
              width. */}
          <div className="lang-gate__choices">
            <button
              type="button"
              lang="kn"
              onClick={() => choose("kn")}
              disabled={busy !== null}
              className="lang-gate__choice lang-gate__choice--kn"
            >
              ಕನ್ನಡ
            </button>
            <button
              type="button"
              onClick={() => choose("en")}
              disabled={busy !== null}
              className="lang-gate__choice"
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- The splash */}
      {/* Every visit after the first, when the stored language is Kannada:
          the served HTML is English and there is a beat between it painting
          and the dictionary arriving. This covers that beat. The inline
          script drops it after two and a half seconds come what may, so a
          dictionary that never loads costs a pause, not the site. */}
      <div aria-hidden="true" data-no-translate className="lang-veil">
        <Logo reversed className="lang-veil__logo" width={400} />
      </div>
    </>
  );
}
