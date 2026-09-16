"use client";

/**
 * The language the site is read in, and the machinery that swaps it.
 *
 * Every visitor is met by a chooser before the site itself
 * (`LanguageGate`), and whichever of the two they pick holds for as long as
 * that tab is open.
 *
 * Asked once per tab, not once per visitor — see `STORAGE_KEY`.
 *
 * It was a phone-only feature when it was built, on 2026-09-14, and stopped
 * being one the next day. Nothing here asks how wide the window is any more:
 * there is no width at which the site is only offered in English, and the
 * chooser, the toggle in the menu and the translation itself all behave the
 * same on a handset and on a desktop. If it is ever narrowed again, the line
 * would want drawing in one place — not the four it used to be spread over.
 *
 * ── Why the swap happens in the DOM ──────────────────────────────────────
 *
 * The obvious way to translate a site is to route every string through a
 * `t()` and let each component render the language it is handed. That is the
 * right shape for a site written with it from the start. It is the wrong
 * trade here: the copy on this one lives inline in something like 120
 * hand-set components, most of it inside typography that has been tuned
 * around the exact words — clamped sizes, height budgets, line counts. Piping
 * all of it through a lookup would mean touching every one of those files to
 * add a feature that, by the brief, a laptop never even switches on.
 *
 * So the English the server already renders is treated as the source text,
 * and the translation is applied over it in the browser: walk the text nodes,
 * look each one up, write the Kannada back. What that buys is that nothing
 * else on the site has to know this feature exists. What it costs is spelled
 * out in the three notes below — the observer, the original-text bookkeeping,
 * and the veil — and those costs are contained in this one file.
 *
 * The dictionary itself is keyed on the English, whitespace-normalised, and
 * is loaded on demand (`lib/kannada.ts`) so an English reader — which is
 * every laptop — never downloads it.
 */

/** The two the site is offered in. */
export type Language = "en" | "kn";

/**
 * Where the choice is kept, and for how long.
 *
 * `sessionStorage`, deliberately, which is the whole of the policy: it is
 * scoped to the one tab and the browser empties it when that tab is closed.
 * So every new tab is met by the chooser, and so is the same tab reopened
 * after being closed — asked for by name (2026-09-15).
 *
 * It is not `localStorage`, which is what this was until that date. That
 * survives the tab, the window and the browser restart, so a visitor was
 * asked exactly once and never again — and there was no way back to the
 * chooser except the toggle in the menu or clearing site data.
 *
 * What `sessionStorage` still holds on to is the rest of the tab: a reload,
 * a back button, and every click through to another page keep the answer.
 * That part matters as much as the forgetting. Per page load — no storage
 * at all — would put the chooser in front of someone who has already
 * answered it, on every link they follow.
 *
 * Two places will not re-ask, and both are the browser's own doing rather
 * than something this can reach: duplicating a tab copies its
 * `sessionStorage`, and so does restoring a session after a crash or a
 * "reopen closed tab". Both are the same tab continuing, which is arguably
 * the right answer anyway.
 *
 * ⚠️ Keep the inline script in `app/layout.tsx` in step with this. It reads
 * the same key, by hand, before React exists — the key and the storage it
 * reads are written out twice and there is no import between them.
 */
const STORAGE_KEY = "ve-language";

/**
 * What the page is doing about language, as an attribute on `<html>`.
 *
 * It is an attribute rather than React state because the first two states
 * have to be settled *before* React runs — the inline script in `app/layout`
 * sets it from `sessionStorage` while the document is still parsing, and CSS
 * takes it from there. React cannot help with that: the server has no idea
 * which language this reader chose, so anything keyed off it in a render
 * would have to hydrate one way and then flip.
 *
 *  - `gate`  — a first visit: the chooser is up and the page is locked.
 *  - `veil`  — a return visit in Kannada: brand splash while the dictionary
 *              loads and the first pass runs, so no English is ever painted.
 *  - `ready` — the site, in whichever language. Also what a laptop gets
 *              immediately, and what a failure of any kind falls back to.
 */
export type LanguageState = "gate" | "veil" | "ready";

export function setLanguageState(state: LanguageState) {
  document.documentElement.setAttribute("data-lang-state", state);
}

// ── The choice ────────────────────────────────────────────────────────────

let current: Language = "en";
const listeners = new Set<(language: Language) => void>();

export const getLanguage = () => current;

export function onLanguageChange(listener: (language: Language) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * What was chosen in this tab, if anything. `null` means "not asked yet in
 * this tab", which is a fresh tab, a reopened one, or storage being
 * unavailable — all three get the chooser.
 */
export function storedLanguage(): Language | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value === "kn" || value === "en" ? value : null;
  } catch {
    // Private mode, or storage disabled. The reader gets asked again.
    return null;
  }
}

/**
 * Switch the site into a language and remember it for the rest of the tab.
 *
 * Resolves once the page is actually in that language, so a caller can wait
 * before lifting a veil over it.
 */
export async function setLanguage(language: Language, { remember = true } = {}) {
  if (remember) {
    try {
      sessionStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Private mode, or storage disabled. Nothing to do: the choice holds
      // for this page and the chooser comes back on the next one.
    }
  }

  current = language;

  const root = document.documentElement;
  root.setAttribute("data-lang", language);
  // The document's own language, for anything reading the page rather than
  // looking at it. Set here rather than in the inline script so React has
  // already hydrated the `lang` the server sent and will not warn about it.
  root.setAttribute("lang", language === "kn" ? "kn-IN" : "en-IN");

  await apply(language);

  for (const listener of listeners) listener(language);
}

// ── The dictionary ────────────────────────────────────────────────────────

type Dictionary = Readonly<Record<string, string>>;

let dictionary: Dictionary | null = null;
let loading: Promise<Dictionary> | null = null;

/**
 * Fetch the Kannada, once.
 *
 * Deliberately a dynamic import: the dictionary is the single largest string
 * asset on the site, and a reader who picks English must never pay for it.
 * Split out this way it is a chunk of its own that is only ever requested by
 * someone reading Kannada.
 */
export function loadDictionary(): Promise<Dictionary> {
  if (dictionary) return Promise.resolve(dictionary);
  if (!loading) {
    loading = import("@/lib/kannada").then((module) => {
      dictionary = module.kannada;
      return dictionary;
    });
  }
  return loading;
}

/** Warm the chunk without committing to it — used while the chooser is up. */
export const prefetchDictionary = () => {
  void loadDictionary();
};

// ── Walking the page ──────────────────────────────────────────────────────

/** Never look inside these. */
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "SVG",
  "CODE",
  "PRE",
]);

/**
 * Attributes that hold reader-facing text.
 *
 * `alt` is in the list and matters more than it looks: several sections here
 * carry their photograph's description as the only text in the block, and a
 * screen reader in Kannada reading English alt text would be the one place
 * the translation visibly stopped.
 */
const TEXT_ATTRIBUTES = ["aria-label", "placeholder", "title", "alt"] as const;

/** Opt out — put it on anything whose words must stay as written. */
const OPT_OUT = "[data-no-translate]";

/**
 * What we last wrote, and the English it came from.
 *
 * Both halves are needed. Without the English there is nothing to switch
 * back to; without a record of what we wrote there is no way to tell our own
 * Kannada from text the app has since re-rendered, and a second pass would
 * take the Kannada as the new source and look *that* up — translating a
 * translation, and losing the English for good. A `WeakMap` so a node that
 * React drops takes its entry with it.
 */
type Written = { en: string; out: string };
const writtenText = new WeakMap<Text, Written>();
const writtenAttr = new WeakMap<Element, Map<string, Written>>();

/** Strings with no letters in them — figures, rules, punctuation. */
const hasLetters = /[A-Za-z]/;

/**
 * Misses, in development only, so gaps in the dictionary can be listed from
 * the console rather than found by reading every page. See
 * `window.__missingTranslations()`.
 */
const missing = new Set<string>();

function lookup(dict: Dictionary, raw: string): string | null {
  const core = raw.replace(/\s+/g, " ").trim();
  if (!core || !hasLetters.test(core)) return null;

  const hit = dict[core];
  if (hit === undefined) {
    if (process.env.NODE_ENV !== "production") missing.add(core);
    return null;
  }

  // Put back whatever spacing sat either side of it. JSX splits a sentence
  // across nodes at every interpolation, and those fragments carry the
  // spaces that hold the sentence together.
  const lead = /^\s*/.exec(raw)![0];
  const tail = /\s*$/.exec(raw)![0];
  return lead + hit + tail;
}

/**
 * Translate one string outright, for the rare component that cannot be left
 * to the walker.
 *
 * `ScrollLit` is the only caller. It takes a sentence and renders one span
 * per word so each can light in turn, and a per-word dictionary is not a
 * thing that can exist — Kannada does not put the words of an English
 * sentence in the same order, or in the same number. So that component asks
 * for the sentence, splits the answer, and marks its paragraph
 * `data-no-translate` so the walker leaves the spans alone.
 *
 * Returns the English unchanged when the site is in English, when the
 * dictionary has not loaded, or when there is no entry — the same three
 * fallbacks as everywhere else here.
 */
export function translateString(en: string): string {
  if (current !== "kn" || !dictionary) return en;
  return lookup(dictionary, en) ?? en;
}

function translateNode(node: Text, dict: Dictionary | null) {
  const value = node.nodeValue;
  if (!value || !value.trim()) return;

  const record = writtenText.get(node);
  // Ours if it still reads as what we wrote; otherwise the app has re-rendered
  // it and this new value is the English to work from.
  const en = record && value === record.out ? record.en : value;

  const target = dict ? (lookup(dict, en) ?? en) : en;
  if (value === target) return;

  node.nodeValue = target;
  writtenText.set(node, { en, out: target });

  /*
   * Flag the element the Kannada landed in, for the typography rules at the
   * foot of `globals.css`. It is put on and taken off here rather than
   * inferred from `html[data-lang]` because a translated page still holds a
   * good deal of Latin — the company name, every figure, the client list —
   * and those must keep the tracking they were set with.
   *
   * Set only on a hit, cleared only on the way back to English: an element
   * with two text children, one of them translated, must not have its flag
   * torn off by the other.
   */
  const parent = node.parentElement;
  if (!parent) return;
  if (!dict) parent.removeAttribute("data-kn");
  else if (target !== en) parent.setAttribute("data-kn", "");
}

function translateAttributes(el: Element, dict: Dictionary | null) {
  let records: Map<string, Written> | undefined;

  for (const name of TEXT_ATTRIBUTES) {
    const value = el.getAttribute(name);
    if (!value || !value.trim()) continue;

    records ??= writtenAttr.get(el);
    const record = records?.get(name);
    const en = record && value === record.out ? record.en : value;

    const target = dict ? (lookup(dict, en) ?? en) : en;
    if (value === target) continue;

    el.setAttribute(name, target);
    if (!records) {
      records = new Map();
      writtenAttr.set(el, records);
    }
    records.set(name, { en, out: target });
  }
}

/** Walk one subtree, translating the text and the attributes in it. */
function walk(root: Node, dict: Dictionary | null) {
  if (root.nodeType === Node.TEXT_NODE) {
    const parent = (root as Text).parentElement;
    if (parent && !SKIP_TAGS.has(parent.tagName) && !parent.closest(OPT_OUT)) {
      translateNode(root as Text, dict);
    }
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return;

  const el = root as Element;
  if (SKIP_TAGS.has(el.tagName) || el.closest(OPT_OUT)) return;

  translateAttributes(el, dict);

  const walker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = (node as Element).tagName;
          if (SKIP_TAGS.has(tag)) return NodeFilter.FILTER_REJECT;
          if ((node as Element).hasAttribute("data-no-translate")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        return node.nodeValue?.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    },
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) translateNode(node as Text, dict);
    else translateAttributes(node as Element, dict);
  }
}

// ── Keeping up with React ─────────────────────────────────────────────────

/**
 * Everything on this site that mounts on scroll, counts up, opens, filters or
 * navigates puts fresh English into the page after the first pass has run. An
 * observer is what catches all of it without any of those components knowing.
 *
 * The one trap is that writing a translation is itself a mutation, so the
 * observer would hear its own work and run forever. `takeRecords()` at the
 * end of every pass throws away the records that pass generated — the queue
 * is drained before the callback is ever scheduled — which is both cheaper
 * and more certain than trying to recognise our own writes after the fact.
 */
let observer: MutationObserver | null = null;

function flush(records: MutationRecord[], dict: Dictionary | null) {
  for (const record of records) {
    if (record.type === "characterData") {
      walk(record.target, dict);
    } else if (record.type === "attributes") {
      walk(record.target, dict);
    } else {
      for (const added of record.addedNodes) walk(added, dict);
    }
  }
}

function pass(dict: Dictionary | null) {
  walk(document.body, dict);
  observer?.takeRecords();
}

async function apply(language: Language) {
  const dict = language === "kn" ? await loadDictionary() : null;

  if (!observer) {
    observer = new MutationObserver((records) => {
      const active = getLanguage() === "kn" ? dictionary : null;
      // Same guard as `pass`: drain whatever our own writes queue up.
      flush(records, active);
      observer?.takeRecords();
    });
  }

  pass(dict);

  if (language === "kn") {
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TEXT_ATTRIBUTES],
    });
  } else {
    // English is what the app renders anyway, so once the page has been put
    // back there is nothing left to watch for.
    observer.disconnect();
  }

  if (process.env.NODE_ENV !== "production") {
    (window as unknown as Record<string, unknown>).__missingTranslations = () =>
      [...missing].sort();
  }
}

/**
 * Bring the page into whatever language was chosen last time, and clear the
 * veil when it is there.
 *
 * Called once, on mount, from `LanguageGate`.
 */
export async function restoreLanguage() {
  const stored = storedLanguage();

  if (stored === null) {
    // Never asked. The page is the English it was served as, and the gate
    // takes it from here.
    return stored;
  }

  try {
    await setLanguage(stored, { remember: false });
  } finally {
    setLanguageState("ready");
  }

  return stored;
}
