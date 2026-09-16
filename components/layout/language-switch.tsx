"use client";

import { useState } from "react";
import { getLanguage, setLanguage, type Language } from "@/lib/language";

/**
 * The toggle at the top of the menu panel, beside the lockup.
 *
 * It offers the language you are *not* reading — "Switch to Kannada" while
 * the site is in English, and the other way round — and both labels are in
 * the markup at once, with CSS showing whichever the `data-lang` attribute on
 * `<html>` calls for. That is not a flourish: this component is server-
 * rendered like everything else, the server has no idea which language this
 * reader chose, and picking a label in a render would mean the wrong one
 * being painted for a moment on every Kannada page load.
 *
 * `data-no-translate` for the obvious reason — a control whose whole job is
 * to name a language cannot have its own words swapped underneath it.
 *
 * No mark beside the label, which every other control in this panel has. It
 * had a globe, and the globe did not fit: the row is the lockup, this, and
 * the close button, and at 360px — the commonest Android width there is —
 * the three of them came to nine pixels more than the row, so the pill ran
 * under the X. Nineteen of those pixels were a decoration on a control whose
 * label already says exactly what it does in five words. Measured at 360,
 * 375 and 390 with both labels; the longer one is the English.
 *
 * It is drawn at one size at every width. A laptop has room to spare here —
 * the pill sits in a menu panel half a screen wide — but the control is the
 * same control, and growing it on a desktop would only make the narrow case
 * look like the compromise it no longer is.
 */
export function LanguageSwitch() {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const next: Language = getLanguage() === "kn" ? "en" : "kn";
    try {
      await setLanguage(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-no-translate
      className="lang-switch"
    >
      {/* Written out rather than composed from a variable so each label can
          be read, and corrected, as the sentence it is. */}
      <span className="lang-switch__label lang-switch__label--kn">
        Switch to Kannada
      </span>
      <span className="lang-switch__label lang-switch__label--en">
        Switch to English
      </span>
    </button>
  );
}
