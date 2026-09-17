"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { onScroll } from "@/lib/scroll";
import { onLanguageChange, translateString } from "@/lib/language";
import { Logo } from "@/components/layout/logo";
import { HeroLoader } from "@/components/sections/hero-loader";
import { cn } from "@/lib/cn";
import { img, alt, frames } from "@/lib/images";
import {
  FrameSequence,
  glidePath,
  springStep,
  isDownloaded,
  type DrawableFrame,
  type FrameSetSpec,
} from "@/lib/frame-sequence";

/**
 * Screens of scroll the walkthrough plays over: 1.3, so the 7s film runs at
 * about five and a half seconds a screen. The client has asked for it faster
 * twice: 2.35 (three seconds a screen, the long cut's pace) became 1.6 on
 * 2026-09-16, and 1.6 became this on 2026-09-17.
 */
const SCRUB_SCREENS = 1.3;

/**
 * Screens of scroll the close takes once the film has stopped: the picture
 * softening, the lockup and the line arriving, then a hold on the finished
 * card. Counted separately so it keeps its length whatever the clip's. 1.25
 * since 2026-09-17, when the whole hero was asked to move faster (1.5
 * before); its stages below are fractions of it, so they kept their order
 * and proportions.
 */
const CLOSE_SCREENS = 1.25;

/** Viewport heights the whole hero occupies, counting the one it starts on. */
const TRACK_SCREENS = 1 + SCRUB_SCREENS + CLOSE_SCREENS;

/** A point `screens` of scroll into the track, as a fraction of its travel. */
const at = (screens: number) => screens / (SCRUB_SCREENS + CLOSE_SCREENS);

/**
 * Where the film reaches its last frame. Everything after this point happens
 * to a still — the walkthrough plays out in full first, and only then does
 * the picture soften and the lockup arrive. Nothing overlaps the film.
 */
const CLIP_END = at(SCRUB_SCREENS);

/**
 * The close, as fractions of `CLOSE_SCREENS` past `CLIP_END`. The picture
 * goes soft and shade pools under the middle of it, then the lockup rises
 * into that, then the line beneath. Each finishes before the track does, so
 * the hero holds the finished card for the last sixth of the close rather
 * than completing on the last pixel before it unpins.
 */
const close = (share: number) => at(SCRUB_SCREENS + share * CLOSE_SCREENS);
const POOL_START = CLIP_END;
const LOGO_START = close(0.2);
const FINALE_END = close(2 / 3);
const TAG_START = close(0.43);
const TAG_END = close(5 / 6);

/**
 * The cue at the foot of the film stays for most of the walkthrough and gives
 * way near its end — gone before the lockup starts to rise, so the two are
 * never on the screen together.
 */
const CUE_FADE_START = at(SCRUB_SCREENS - 0.5);
const CUE_FADE_END = at(SCRUB_SCREENS + 0.1);

/**
 * How the drawn position follows the scroll: a critically damped spring at
 * this natural frequency (radians a second) — `springStep` in
 * `lib/frame-sequence.ts`. During a steady scroll the picture trails the
 * scroll position by 2/rate seconds; a step (one notch of a wheel) is 95%
 * arrived in about 4.7/rate.
 *
 * It was a plain exponential ease at 6 a second until 2026-09-17, and that
 * was the one thing about the glide that was not smooth: an exponential
 * starts moving at full speed the instant its target changes, so every notch
 * of a mouse wheel landed as a small kick. The spring's speed changes
 * continuously, so a notch is glided into, and a run of notches is one move.
 *
 * 40, since later the same day. It was 13 — a trail of 150ms, chosen to
 * give the decoders a predictable path — and measured in a real browser
 * window on the M5 this was built on, at a steady 900 pixels a second, the
 * frame on screen was seventeen frames of film behind the one under the
 * finger, and the picture went on moving for two thirds of a second after
 * the scroll stopped. The client called it very laggy, and it was: a film
 * scrubbed by hand has to sit on the hand. At 40 the trail is 50ms, under
 * what anyone reads as lag, and a notch is arrived in 120ms — still a
 * glide over the wheel's steps and a trackpad's jitter, since the browser
 * animates a wheel notch over about 150ms of its own before this sees it.
 * The decoders can follow a path this short because the scrub sets are
 * JPEG now, decoded in a third of the time (see `lib/images.ts`).
 */
const SPRING_RATE = 40;

/** The walkthrough as frames: the render's own 169, in four sizes. See `lib/images.ts`. */
const FILM = frames.homeScroll;
const SETS: readonly FrameSetSpec[] = FILM.sets;
const LAST_FRAME = FILM.count - 1;

/** The set the loader waits for, and the one every machine can fall back to. */
const BASE = 0;

/** The 4K set, drawn only at rest — see `REST_FRAMES_HELD`. */
const REST_SET = SETS.length - 1;

/**
 * How far along the glide the decoders are asked to work, in display frames
 * past the time a decode takes here: a fifth of a second. The plan is made
 * again on every frame the picture moves, so there is nothing to gain from
 * reaching further, and much to lose — every frame asked for is held in
 * memory, and a long reach fills the budget with frames the reader may never
 * scroll to. Past the path, the frames either side of where the glide will
 * settle — `SETTLE_RADIUS` of them — are what is worth having ready: the next
 * scroll in either direction lands on them.
 *
 * Twelve, since 2026-09-17, because of the mouse wheel. A notch is a jump of
 * about a hundred and twenty pixels that nothing can see coming, sixteen
 * frames of film at 1.3 screens, and with the glide as quick as it now is
 * the picture covers four frames a display frame right after one — too
 * fast for frames first asked for on the notch to all land in time (a
 * frame in eight was a stand-in, measured). With the radius at twelve the
 * next notch's frames are decoded before it happens, while the picture is
 * still or nearly so; only its last few are asked for on the day, and
 * those are the ones needed last. Twenty-five frames of the 2560 set is
 * 370 MB, which is why the radius also bows to the budget in `plan`.
 */
const PATH_TICKS = 12;
const SETTLE_RADIUS = 12;

/**
 * How far the decoders are sent past where the scroll is now, while it is
 * still moving. A steady scroll's target keeps going, and the picture chasing
 * it moves faster than a glide towards a target that has stopped — plan for
 * the stopped one, and every frame asked for is one the picture has passed
 * by the time it is decoded. So the path is worked out against a target
 * carried on at the scroll's own speed, up to this many frames on. Capped,
 * so a flick does not send the decoders to the far end of the film.
 */
const LOOKAHEAD_FRAMES = 24;

/**
 * Downloads at once. The base set is what the reader is waiting on, so it
 * asks for more; the browser caps what actually goes out per connection
 * anyway. The larger sets load behind a page that is already usable, and
 * leave room for everything else it fetches.
 */
const BASE_CONCURRENCY = 8;
const UPGRADE_CONCURRENCY = 6;

/**
 * The loader's failsafes. A load where nothing has arrived for twenty
 * seconds is a connection that has gone, not a slow one — the loader lifts,
 * the film scrubs on whatever frames it has (the canvas draws the nearest)
 * and the rest keep coming in behind, counted at the foot of the screen. And
 * a film missing more than one frame in twenty is given up: the poster
 * stands in, and the close still plays over it.
 */
const STALL_MS = 20_000;
const MAX_MISSING = 0.05;

/**
 * Once every frame is in, the loader waits for the one under it — the frame
 * for wherever the page is scrolled to — to be on the canvas before it
 * lifts, so what it uncovers is the finished picture. Bounded, because what
 * it is waiting for is a decode, and a decode that never comes must not keep
 * the page shut.
 */
const FIRST_DRAW_TIMEOUT_MS = 4000;

/** The loader's fade; matches `.hero-loader[data-leaving]` in `globals.css`. */
const LOADER_FADE_MS = 700;

/**
 * The climb to a sharper set, and the test a machine has to pass to be given
 * one. The first `PROBE_FRAMES` of the candidate are downloaded and pushed
 * through every decoder at once; the machine must turn out at least
 * `MIN_DECODES_PER_S` of them a second. That is a 60Hz scrub with a quarter
 * to spare — the most frames a glide can ever put on screen in a second — so
 * a machine that passes never has the picture trail the wheel for want of a
 * decode, and one that fails stays on the smaller set, which it can keep up
 * with. Asked at a still moment (a probe run under a scrub is timed against
 * decoders busy with the scrub) and up to three times, a couple of seconds
 * apart, before a set is given up. The first step up is timed while the
 * loader is still over the page, which is as still as a page gets, so the
 * sharper set can start downloading the moment the page opens.
 */
const PROBE_FRAMES = 14;
const PROBE_WARMUP = 2;
const MIN_DECODES_PER_S = 75;
const PROBE_IDLE_MS = 300;
const PROBE_ATTEMPTS = 3;
const PROBE_RETRY_MS = 2000;

/**
 * A set that has passed and arrived in full is swapped in on the frame it has
 * the picture on screen decoded — the same frame, sharper, so nothing blinks.
 * That can be mid-scrub: the decoders are asked for the new set's frames a
 * little way along the glide, and the swap lands as soon as one is under the
 * picture. Only stillness counts against this timeout — a reader who keeps
 * scrolling is not a reason to throw away a download — and after this long
 * of it without landing, the swap is called off.
 */
const PROMOTE_TIMEOUT_MS = 8000;

/** How many display frames along the glide the waiting set is decoded for. */
const PENDING_PATH_STEPS = 4;

/**
 * Cross-fading between neighbouring frames, and when to stop.
 *
 * The film is the render's own 24 frames a second, so a slow scroll can sit
 * between two frames for several display frames. Drawing the next one over the last at
 * the fraction between them turns those steps into a continuous move; at
 * speed (a frame or more per display frame) there is nothing between to
 * show, and the nearest frame is drawn alone.
 *
 * It is a second full-screen draw, which is nothing to a GPU and something
 * to a canvas the browser has had to put on the CPU. So it is watched: while
 * the picture is moving, a display frame that arrives more than 1.7× the
 * screen's own interval late counts against it, an on-time one counts back a
 * quarter, and a dozen net late frames turn the cross-fade off for the rest
 * of the visit. A machine that can afford it never notices; one that cannot
 * gets back the frame it was spending.
 */
const BLEND_LATE_FACTOR = 1.7;
const BLEND_GIVE_UP = 12;

/** The largest canvas every browser here is sure to allocate (Safari's cap). */
const MAX_CANVAS_PIXELS = 16_777_216;

const MB = 1024 * 1024;

/**
 * How many decoded frames of a set the cache must be able to hold for that
 * set to be scrubbed on: the pair on screen, a stretch of path ahead, and a
 * few either side of where the glide will settle. A set whose frames are too
 * big to hold this many in the memory this machine can spare is never
 * climbed to — which keeps the 2560 set off a 4 GB laptop.
 */
const MIN_FRAMES_HELD = 16;

/**
 * The 4K set is never scrubbed on. Measured on the M5 this was built on, a
 * 4K frame takes about 40ms to decode in Chrome, and with the film at 1.6
 * screens a steady scroll asks for ninety-odd frames a second: scrubbed on
 * the 4K set, only every second display frame showed a new picture, where
 * the 1920 and 2560 sets kept up with every one.
 *
 * So the 2560 set carries the motion, and the 4K set is the picture at
 * rest: when the glide settles on a frame, that frame is decoded in 4K and
 * faded in over the 2560 one in `REST_FADE_MS` — the same picture, sharper —
 * and the moment the page moves again the 2560 set takes it back. One 4K
 * decode per stop, which any machine that passes `REST_MIN_DECODES_PER_S`
 * turns out in well under a tenth of a second, and a handful of 4K frames in
 * memory rather than a scrub's worth.
 *
 * It needs no complete download to be useful — a frame not yet arrived just
 * leaves the 2560 one standing — so 4K frames are used as they come in.
 */
const REST_FRAMES_HELD = 3;
const REST_MIN_DECODES_PER_S = 20;
const REST_FADE_MS = 180;

/**
 * Once a sharper set has taken over, the smaller one stays this long as a
 * stand-in for any frame of the new one not decoded yet, and then goes.
 */
const DROP_AFTER_MS = 1500;

/**
 * When the walkthrough runs at all: a laptop-shaped window, not merely a
 * wide one. The height is what keeps a phone turned on its side — 932
 * pixels across and 430 down — from being handed a five-screen scrubbed
 * film. Same string as `HomeHeroPhone`, the `desk:` variant in
 * `globals.css` and the loader's line in `app/layout.tsx`; all four have to
 * agree.
 */
const WIDE_QUERY = "(min-width: 48rem) and (min-height: 500px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getWidth = () =>
  window.matchMedia(WIDE_QUERY).matches ? ("wide" as const) : ("phone" as const);

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/**
 * 0 before `from`, 1 after `to`, easing out in between — quick off the mark
 * and settling into place, rather than symmetric. The close reads as arriving
 * rather than sliding.
 */
const ramp = (value: number, from: number, to: number) => {
  const t = clamp01((value - from) / (to - from));
  return 1 - (1 - t) * (1 - t);
};

/**
 * How much decoded film this machine may hold. `deviceMemory` is Chrome's
 * rounded guess at the RAM in GB, capped at 8; 48 MB a GB of it, between 160
 * and 384 MB. Without it (Safari, Firefox) 320 MB. At the top set's 14 MB a
 * frame, 384 MB is 26 frames — the two on screen, the handful either side of
 * where the glide will settle, and a stretch of the path ahead, which is
 * what a scrub draws from.
 */
function decodeBudget() {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (!memory) return 320 * MB;
  return Math.min(384, Math.max(160, memory * 48)) * MB;
}

/**
 * The most the cache may be raised to for the sets on screen — 640 MB on a
 * machine Chrome rounds to 8 GB or more, and where the browser does not say
 * (Safari, Firefox; in practice laptops that have it). The 2560 set scrubbed
 * with 4K frames at rest needs about 340 MB; a 4 GB machine gets neither.
 */
function decodeCeiling() {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return !memory || memory >= 8 ? 640 * MB : decodeBudget();
}

/**
 * Decoders: half the cores, between one and four. The other half are the
 * page's, the compositor's and the GPU process's, which is where a smooth
 * scroll actually happens.
 */
function decoderCount() {
  const cores = navigator.hardwareConcurrency || 4;
  return Math.min(4, Math.max(1, Math.floor(cores / 2)));
}

/**
 * Where the film is, as far as the reader is concerned.
 *
 *  - `loading`: the loader is up, and the base set is coming in under it.
 *  - `partial`: the load stalled; the loader has lifted anyway and the film
 *    scrubs on what it has while the rest arrives.
 *  - `ready`: every frame of the base set is in and on offer.
 *  - `failed`: too much of the film is missing; the poster stands in.
 */
type Phase = "loading" | "partial" | "ready" | "failed";

/**
 * The best set already downloaded in this tab, if any — the home page
 * reached again by a link, or the window brought back to a laptop's shape.
 * That film opens at once, with no loader. Never anything on the server, or
 * on the first load of a tab, so hydration always starts from the loader.
 */
function warmSet() {
  if (typeof window === "undefined") return null;
  // The rest set is never one the page scrubs on — see `REST_FRAMES_HELD`.
  for (let set = REST_SET - 1; set >= BASE; set--) {
    if (isDownloaded(SETS[set], FILM.count)) return set;
  }
  return null;
}

/** Keys the reader could use to move or act on the page behind the loader. */
const HELD_KEYS = new Set([
  "Tab",
  "Enter",
  " ",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

/** Whether the language chooser (or its veil) is over everything, loader included. */
const languageIsAsking = () => {
  const state = document.documentElement.getAttribute("data-lang-state");
  return state === "gate" || state === "veil";
};

/**
 * The home page hero: one walkthrough — the towers from the air, in through
 * a window to the living room — with the scroll wheel as its transport
 * control, closing on the lockup. It starts below the bar, which is frosted
 * white over a white strip at the top of the page, and fills the rest of the
 * screen. Nothing is laid over the film itself and no grade sits on it.
 *
 * The section is a tall *track*; the panel inside it is `sticky`, so it pins
 * to the viewport below the bar while the track scrolls past underneath —
 * fixed for exactly as long as the hero lasts, and in the page's flow either
 * side of it. How far the track has travelled is how far into the film the canvas
 * is, so scrolling down runs the walkthrough forward and scrolling back up
 * runs it in reverse, identically.
 *
 * The film is not a `<video>`. It is 169 still frames — WebP for the
 * smallest and largest sets, baseline JPEG for the two the page scrubs on,
 * which decode three times as fast — drawn onto a `<canvas>`, because
 * seeking a video on every animation frame is only fast on a machine that
 * decodes it in hardware, and a great many Windows laptops do not — the
 * walkthrough trailed the wheel there by two to five frames a seek.
 * `lib/frame-sequence.ts` has the long version. What that buys, and how it
 * is kept that way:
 *
 *   • Every frame is downloaded before the page opens. The loader stands
 *     over the page and counts them in; nothing can be scrolled until the
 *     smallest set is all here. Sharper sets follow behind a page already
 *     in use, and each is taken only if this screen can show it and this
 *     machine can decode it fast enough — measured, not guessed.
 *   • Frames are decoded in workers, ahead of where the glide is heading,
 *     into a cache with a memory budget. Drawing one is a single
 *     `drawImage`; nothing on the main thread ever waits for a decode. A
 *     frame that is not ready is drawn as its nearest neighbour that is.
 *   • The drawn position chases the scroll position, integrated over *time*,
 *     so a 120Hz display and a 60Hz one behave the same, and a mouse wheel's
 *     notches, a trackpad's jitter and a violent flick all come out as one
 *     glide. Between two frames, the second is cross-faded over the first.
 *   • The canvas's backing store matches the screen's device pixels — read
 *     exactly where the browser reports them, so a 125% Windows display is
 *     not rounded — but is never given more pixels than the frame has to
 *     fill it, so a dense screen is not asked to fill four times the pixels
 *     for nothing. Where the frame has fewer pixels than the screen, the
 *     canvas is drawn 1:1 and the compositor does the one upscale. Resizing
 *     the window, or moving it to a screen of a different density, redraws
 *     at the new size in the same frame; the frame is always cropped to
 *     cover, never stretched.
 *   • The position is read inside the animation frame rather than from
 *     scroll events, so nothing depends on how a browser batches those.
 *   • Nothing here opts a visitor out of the film — no Data Saver check, no
 *     `prefers-reduced-motion` check. Those quietly turned the hero into a
 *     still photograph on the machines that set them, which reads as a bug;
 *     and not a frame of this moves that the reader did not scroll themselves.
 *
 * The close cross-fades to a pre-blurred still of the last frame rather than
 * running a CSS `filter: blur()` over the canvas. A full-screen blur on a
 * layer that changes every frame is the most expensive thing this page could
 * ask a GPU to do. The still is a few tens of KB and costs nothing anywhere.
 */
export function ScrollHero() {
  const trackRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const softRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<HTMLHeadingElement | null>(null);
  const tagRef = useRef<HTMLParagraphElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);

  /** The frames, while the laptop hero is mounted. */
  const engineRef = useRef<FrameSequence | null>(null);
  /**
   * Which set the canvas draws from, and which one is waiting to take over.
   * A ref rather than state: the loop reads it every frame, and the swap is
   * made inside the loop, on the frame the new set has the picture ready.
   */
  const setsRef = useRef<{
    active: number | null;
    pending: number | null;
    pendingSince: number;
    /** The 4K set, once this machine may draw it at rest. */
    rest: number | null;
  }>({
    active: null,
    pending: null,
    pendingSince: 0,
    rest: null,
  });
  /** Promises the loading effect waits on and the loop resolves. */
  const waiting = useRef<{ drawn: (() => void) | null; promoted: ((landed: boolean) => void) | null }>({
    drawn: null,
    promoted: null,
  });
  /** Whether the canvas is showing the frame the scroll position asks for. */
  const exact = useRef(false);
  /** Whether the hero is currently culled — see `cull` in the loop. */
  const culled = useRef(false);
  /**
   * When the scroll position last moved, as the loop saw it. The probe reads
   * this to wait for a still moment; a loop that has stopped because the
   * hero is off screen leaves it old, which counts as still.
   */
  const lastMoveAt = useRef(0);

  const [phase, setPhase] = useState<Phase>(() => (warmSet() === null ? "loading" : "ready"));
  /** How much of the base set has arrived, 0–100. */
  const [percent, setPercent] = useState(0);
  /** Whether the canvas has drawn anything yet; until it has, the poster shows. */
  const [drawn, setDrawn] = useState(false);
  /** Set once the loader has finished fading out, to unmount it — or at once, if it was never needed. */
  const [loaderGone, setLoaderGone] = useState(() => warmSet() !== null);

  // `"ssr"` until mounted: the canvas is never rendered on the server, so a
  // phone never sees it in the markup.
  const width = useSyncExternalStore(subscribeToWidth, getWidth, () => "ssr" as const);

  // The tall track is added after mount too. A visitor whose JavaScript never
  // arrives would otherwise get nearly four screens of dead scroll past a hero
  // that cannot move. It grows at hydration, under the loader, so nothing is
  // seen to shift.
  const mounted = width !== "ssr";
  const wide = width === "wide";
  const loaderUp = phase === "loading";
  /** The cue stops counting when there is a film to scrub — or none coming. */
  const complete = phase === "ready" || phase === "failed";

  /**
   * The cue at the foot of the film, in whichever language the site is being
   * read in.
   *
   * It is composed here rather than swapped in the DOM because the counting
   * line is built from a number: "Loading 42%" is one text node, and a
   * dictionary keyed on rendered copy would need a hundred and one entries to
   * cover it. So the *pattern* is the entry — `Loading {percent}%` — and the
   * figure goes in afterwards, which also lets Kannada put the number where
   * Kannada puts it rather than where English does. The paragraph carries
   * `data-no-translate` so the walker leaves all of these alone.
   *
   * It only counts where the loader has lifted without everything in — a
   * stalled connection — since the loader does the counting otherwise.
   *
   * Read through the store, like `ScrollLit`, so the server snapshot is the
   * English the server rendered and hydration cannot mismatch.
   */
  const cue = useSyncExternalStore(
    onLanguageChange,
    () =>
      complete
        ? translateString("Scroll to Discover")
        : translateString("Loading {percent}%").replace("{percent}", String(percent)),
    () => (complete ? "Scroll to Discover" : `Loading ${percent}%`),
  );

  /*
   * Hold the page while the loader is up: the attribute that shows the loader
   * and stops the page scrolling, plus the two things that attribute does not
   * cover everywhere — a touch scroll on an iPad, and the keyboard, which can
   * still reach a link that had focus before the loader came up. All of it
   * stands aside while the language chooser is asking, which sits over the
   * loader and needs both.
   *
   * A layout effect, so on a client-side visit to the home page the loader
   * is there in the same paint as the page.
   */
  useLayoutEffect(() => {
    if (width === "ssr") return;
    const root = document.documentElement;
    if (!wide || !loaderUp) {
      root.removeAttribute("data-hero-loading");
      return;
    }

    root.setAttribute("data-hero-loading", "js");
    if (!languageIsAsking() && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const holdTouch = (event: TouchEvent) => {
      if (!languageIsAsking() && event.cancelable) event.preventDefault();
    };
    const holdKeys = (event: KeyboardEvent) => {
      if (languageIsAsking() || event.metaKey || event.ctrlKey || event.altKey) return;
      if (HELD_KEYS.has(event.key)) event.preventDefault();
    };
    document.addEventListener("touchmove", holdTouch, { passive: false });
    document.addEventListener("keydown", holdKeys, true);

    return () => {
      root.removeAttribute("data-hero-loading");
      document.removeEventListener("touchmove", holdTouch);
      document.removeEventListener("keydown", holdKeys, true);
    };
  }, [width, wide, loaderUp]);

  // Unmount the loader once its fade has run.
  useEffect(() => {
    if (loaderUp) return;
    const timer = window.setTimeout(() => setLoaderGone(true), LOADER_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [loaderUp]);

  /*
   * Load the film: the base set under the loader, then whichever larger set
   * this screen can use and this machine can decode fast enough, brought up
   * behind a page that is already open.
   *
   * Only for the laptop hero — a phone unmounts this section, and must not
   * pay for frames it will never be shown.
   */
  useEffect(() => {
    if (!wide) return;
    const baseBudget = decodeBudget();
    const ceilingBudget = decodeCeiling();
    const engine = new FrameSequence({
      sets: SETS,
      count: FILM.count,
      budgetBytes: baseBudget,
      decoders: decoderCount(),
    });
    engineRef.current = engine;
    // The canvas draws from the base set from its first frame in: the loop
    // is running under the loader, so the picture is ready when it lifts. A
    // set already downloaded this visit is drawn from instead, and there is
    // no loader to lift.
    const warm = warmSet();
    const first = warm ?? BASE;
    setsRef.current = { active: first, pending: null, pendingSince: 0, rest: null };
    engine.budget = Math.max(baseBudget, MIN_FRAMES_HELD * engine.frameBytes(first));
    let cancelled = false;

    // For the headless harness in a dev build: which set is on screen, and
    // how long a decode takes. Never in production.
    const debug = window as Window & { __heroFrames?: unknown };
    if (process.env.NODE_ENV === "development") {
      debug.__heroFrames = { engine, sets: () => ({ ...setsRef.current }) };
    }

    const pause = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

    /** Resolves once nothing has scrolled for `PROBE_IDLE_MS`. */
    const untilStill = async () => {
      while (!cancelled && performance.now() - lastMoveAt.current < PROBE_IDLE_MS) {
        await pause(100);
      }
    };

    /**
     * Resolves once the canvas shows the frame for the current position — at
     * once if the hero is not on screen at all (a reload further down the
     * page), where the loop is not drawing and there is nothing to uncover.
     */
    const untilDrawn = () =>
      new Promise<void>((resolve) => {
        const box = trackRef.current?.getBoundingClientRect();
        const away = !box || box.bottom <= 0 || box.top >= window.innerHeight;
        if (exact.current || away) {
          resolve();
          return;
        }
        const done = () => {
          window.clearTimeout(timer);
          waiting.current.drawn = null;
          resolve();
        };
        const timer = window.setTimeout(done, FIRST_DRAW_TIMEOUT_MS);
        waiting.current.drawn = done;
      });

    /** The film is not going to work here: the poster stands in. */
    const giveUp = () => {
      engine.dispose();
      engineRef.current = null;
      setsRef.current = { active: null, pending: null, pendingSince: 0, rest: null };
      if (canvasRef.current) canvasRef.current.style.opacity = "0";
      setDrawn(false);
      setPhase("failed");
    };

    /**
     * The sets to climb through after the one the page opens on, in order.
     *
     * The panel is drawn cropped to cover, so what it needs from a set is
     * the width of source it shows, in device pixels — its own width, or its
     * height at the film's shape if the window is taller than 16:9. The
     * smallest set with nine tenths of that is the ceiling: a set a tenth
     * short is upscaled by an amount nobody can see in a moving picture, and
     * the next one up would cost half again the memory and the decode for
     * it. So a 1366-wide laptop at 1× stays on the base set, a 1536-wide one
     * at 125% (1920 device pixels) climbs to the 1920 set, a 2560 monitor to
     * the 2560 set, and a Retina MacBook or a 4K monitor to the 4K one — which
     * means the 2560 set to scrub on and the 4K set at rest (see
     * `REST_FRAMES_HELD`). A set this machine could not hold enough of in
     * memory is not a ceiling.
     */
    const climbPlan = () => {
      const panel = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      const w = (panel?.clientWidth || window.innerWidth) * dpr;
      const h = (panel?.clientHeight || window.innerHeight) * dpr;
      const shape = SETS[BASE].width / SETS[BASE].height;
      const needed = Math.max(w, h * shape) * 0.9;
      const holdable = (set: number) =>
        MIN_FRAMES_HELD * engine.frameBytes(set) <= ceilingBudget;
      let ceiling = SETS.findIndex((set) => set.width >= needed);
      if (ceiling === -1) ceiling = REST_SET;
      const motion = Math.min(ceiling, REST_SET - 1);
      let scrub = motion;
      while (scrub > BASE && !holdable(scrub)) scrub--;
      const rest =
        ceiling === REST_SET &&
        scrub === motion &&
        budgetFor(scrub) + REST_FRAMES_HELD * engine.frameBytes(REST_SET) <= ceilingBudget
          ? REST_SET
          : null;
      return { steps: scrub > BASE ? [scrub] : [], rest };
    };

    /** The decode budget for a page scrubbing on `set`, and drawing 4K at rest if it is. */
    const budgetFor = (set: number) =>
      Math.max(baseBudget, MIN_FRAMES_HELD * engine.frameBytes(set)) +
      (setsRef.current.rest !== null ? REST_FRAMES_HELD * engine.frameBytes(REST_SET) : 0);

    /** Set once the base set is in and on offer; past that, nothing is fatal. */
    let usable = false;

    const run = async () => {
      const plan = climbPlan();
      const steps = plan.steps.filter((set) => set > first);
      // Timed now, under the loader, alongside the base set's download.
      const firstProbe = steps.length
        ? probe(steps[0], MIN_DECODES_PER_S)
        : Promise.resolve(false);
      if (warm !== null) {
        await engine.load(warm, { concurrency: BASE_CONCURRENCY, priority: "high" });
        if (cancelled) return;
        usable = true;
        setPercent(100);
        setPhase("ready");
      } else {
        await loadBase();
        if (cancelled || !usable) return;
      }
      await climb(steps, firstProbe);
      if (plan.rest !== null && !cancelled) await restOn(plan.rest);
    };

    const loadBase = async () => {
      // The base set, counted in under the loader.
      let lastArrival = performance.now();
      const stall = window.setInterval(() => {
        if (performance.now() - lastArrival < STALL_MS) return;
        window.clearInterval(stall);
        if (!cancelled) setPhase((p) => (p === "loading" ? "partial" : p));
      }, 1000);
      const base = await engine.load(BASE, {
        concurrency: BASE_CONCURRENCY,
        priority: "high",
        onSettle: () => {
          lastArrival = performance.now();
          const p = engine.progressOf(BASE);
          if (!cancelled) setPercent(Math.floor((p.settled / p.total) * 100));
        },
      });
      window.clearInterval(stall);
      if (cancelled) return;
      if (base.failed > base.total * MAX_MISSING) {
        giveUp();
        return;
      }
      usable = true;
      await untilDrawn();
      if (cancelled) return;
      setPhase("ready");
    };

    /**
     * Whether this machine decodes `set` at `bar` frames a second or better:
     * its first frames are downloaded — two at a time, at low priority, so
     * they cost the base set little — and timed, at a still moment, up to
     * `PROBE_ATTEMPTS` times.
     */
    const probe = async (set: number, bar: number) => {
      try {
        await engine.load(set, { to: PROBE_FRAMES, concurrency: 2, priority: "low" });
        const sample = Array.from({ length: PROBE_FRAMES }, (_, i) => i);
        for (let attempt = 0; attempt < PROBE_ATTEMPTS; attempt++) {
          if (attempt > 0) await pause(PROBE_RETRY_MS);
          await untilStill();
          if (cancelled) return false;
          const rate = await engine.throughput(set, sample, PROBE_WARMUP);
          if (cancelled) return false;
          if (rate >= bar) return true;
        }
      } catch {
        // Counted as a failure below.
      }
      return false;
    };

    /**
     * Download the rest of a set that has passed its probe and swap it in.
     * True once it is on screen. The sets below it stay a moment as
     * stand-ins, then go.
     */
    const takeUp = async (set: number) => {
      await engine.load(set, { concurrency: UPGRADE_CONCURRENCY, priority: "low" });
      if (cancelled) return false;
      // A set with a hole in it is not swapped in: mid-scrub, the hole
      // would be drawn from the smaller set, and the picture would go soft
      // for a frame and come back.
      if (!engine.complete(set)) {
        engine.drop(set);
        return false;
      }

      const before = setsRef.current.active ?? BASE;
      engine.budget = Math.max(budgetFor(before), budgetFor(set));
      const landed = await new Promise<boolean>((resolve) => {
        waiting.current.promoted = resolve;
        setsRef.current.pending = set;
        setsRef.current.pendingSince = performance.now();
      });
      waiting.current.promoted = null;
      if (cancelled) return false;
      if (!landed) {
        engine.drop(set);
        engine.budget = budgetFor(before);
        return false;
      }

      await pause(DROP_AFTER_MS);
      if (cancelled) return true;
      for (let below = BASE; below < set; below++) engine.drop(below);
      engine.budget = budgetFor(set);
      return true;
    };

    /**
     * Up the steps in order. The first failing — its probe, or its download —
     * says nothing about the sets below it, which are tried in turn, best
     * first; a later step failing ends the climb on the step before it.
     */
    const climb = async (steps: readonly number[], firstProbe: Promise<boolean>) => {
      for (const [i, set] of steps.entries()) {
        const passed = i === 0 ? await firstProbe : await probe(set, MIN_DECODES_PER_S);
        if (cancelled) return;
        if (passed && (await takeUp(set))) continue;
        if (cancelled) return;
        engine.drop(set);
        if (i > 0) return;
        for (let lower = set - 1; lower > first; lower--) {
          if ((await probe(lower, MIN_DECODES_PER_S)) && (await takeUp(lower))) return;
          if (cancelled) return;
          engine.drop(lower);
        }
        return;
      }
    };

    /**
     * Turn on the 4K set at rest, if this machine can decode it quickly
     * enough, and bring its frames in behind — each one is usable the
     * moment it arrives.
     */
    const restOn = async (set: number) => {
      if (!(await probe(set, REST_MIN_DECODES_PER_S))) {
        if (!cancelled) engine.drop(set);
        return;
      }
      if (cancelled) return;
      setsRef.current.rest = set;
      engine.budget = budgetFor(setsRef.current.active ?? BASE);
      await engine.load(set, { concurrency: 4, priority: "low" });
    };

    run().catch(() => {
      // Anything thrown past the base set leaves the reader with the base
      // set, which is fine. Anything before it leaves them with nothing.
      if (cancelled) return;
      if (usable) setPhase("ready");
      else giveUp();
    });

    return () => {
      cancelled = true;
      delete debug.__heroFrames;
      waiting.current.promoted?.(false);
      waiting.current.drawn?.();
      waiting.current = { drawn: null, promoted: null };
      engine.dispose();
      engineRef.current = null;
      // Back to the start, so a window resized out of the laptop layout and
      // back in loads again rather than drawing from a disposed cache — or,
      // with the frames still in hand, opens again at once.
      setsRef.current = { active: null, pending: null, pendingSince: 0, rest: null };
      exact.current = false;
      const reopen = warmSet() !== null;
      setPhase(reopen ? "ready" : "loading");
      setPercent(0);
      setDrawn(false);
      setLoaderGone(reopen);
    };
  }, [wide]);

  useEffect(() => {
    if (!wide) return;
    const track = trackRef.current;
    const media = mediaRef.current;
    const canvas = canvasRef.current;
    const soft = softRef.current;
    const veil = veilRef.current;
    const mark = markRef.current;
    const tag = tagRef.current;
    const cue = cueRef.current;
    if (!track || !media || !canvas || !soft || !veil || !mark || !tag || !cue) return;
    // Opaque: the compositor can skip blending the canvas with what is under
    // it. It starts black, which is why it is at opacity 0 until drawn.
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let frame = 0;
    /** The eased progress through the track, 0–1, and its speed — for the close. */
    const progress = { x: 0, v: 0 };
    /**
     * The film's own eased position, in frames, and its speed — chasing the
     * scroll on the same spring as `progress`, but aimed at the nearest whole frame rather than the
     * exact point between two. While the page moves the aim moves on and the
     * glide carries through the frames, cross-fading as it goes; when the
     * page stops, the picture settles *on* a frame. Aimed at the exact point,
     * it would settle between two and hold the cross-fade there — a double
     * exposure of every window frame for as long as the reader looked.
     */
    const film = { x: 0, v: 0 };
    let last = 0;
    let painted = -1;
    let lastTarget = -1;

    /** The drawn position last frame, in frames of film. */
    let lastPosition = -1;
    /** The scroll position last frame, in frames of film, and how fast it has been moving (frames a second). */
    let lastAim = -1;
    let aimVelocity = 0;
    /** What the decoders were last asked for, packed — see `plan`. */
    let plannedFor = -1;
    /** What is on the canvas: two frames and the second's weight, in 64ths. */
    let shownA: DrawableFrame | null = null;
    let shownB: DrawableFrame | null = null;
    let shownWeight = -1;
    let shownSharp: DrawableFrame | null = null;
    let shownSharpWeight = -1;
    /** How far the 4K frame at rest has faded in, 0–1. */
    let restAlpha = 0;
    /** The set the backing store was last sized for. */
    let fittedFor = -1;
    let firstDrawn = false;

    /** The panel in device pixels, and whether the backing store needs fitting to it. */
    let deviceW = 0;
    let deviceH = 0;
    let layoutDirty = true;

    let blendAllowed = true;
    let vsync = Infinity;
    let lateness = 0;

    // The harness's other reading, in a dev build: where the picture should be.
    const hook = (window as Window & { __heroFrames?: Record<string, unknown> }).__heroFrames;
    if (process.env.NODE_ENV === "development" && hook) {
      hook.position = () => lastPosition;
      hook.blend = () => blendAllowed;
    }

    /** Cached by the shared loop and refreshed on resize — see `lib/scroll.ts`. */
    let viewportHeight = window.innerHeight;

    const readProgress = () => {
      const rect = track.getBoundingClientRect();
      const distance = rect.height - viewportHeight;
      if (distance <= 0) return 0;
      return clamp01(-rect.top / distance);
    };

    const paint = (progress: number) => {
      if (Math.abs(progress - painted) < 0.00005) return;
      painted = progress;

      // Shade pools under the middle of the picture, where the lockup lands,
      // and the edges of the shot stay as they were. The soft plate is the
      // same frame the film ends on, so this reads as the picture drifting
      // out of focus rather than as a cut to another image.
      const pool = ramp(progress, POOL_START, FINALE_END);
      veil.style.opacity = String(pool);
      soft.style.opacity = String(pool);
      media.style.transform = pool > 0 ? `scale(${1 + pool * 0.04})` : "";

      // Rises and grows into place rather than simply appearing.
      const arrival = ramp(progress, LOGO_START, FINALE_END);
      mark.style.opacity = String(arrival);
      mark.style.transform = `translate3d(0, ${(1 - arrival) * 30}px, 0) scale(${
        0.96 + arrival * 0.04
      })`;

      const line = ramp(progress, TAG_START, TAG_END);
      tag.style.opacity = String(line);
      tag.style.transform = `translate3d(0, ${(1 - line) * 20}px, 0)`;

      // Sinks a little as it fades, the opposite of the lockup's rise.
      const cueOut = ramp(progress, CUE_FADE_START, CUE_FADE_END);
      cue.style.opacity = String(1 - cueOut);
      cue.style.transform = cueOut > 0 ? `translate3d(0, ${cueOut * 12}px, 0)` : "";
    };

    /**
     * Size the backing store for `spec`'s frames on the panel as it now is.
     *
     * Where the frame has at least the panel's device pixels, the canvas
     * gets exactly the panel's, and the frame is drawn down into them.
     * Where it has fewer, the canvas gets the frame's own pixels in the
     * dimension that decides the crop — and the panel's shape in the other —
     * so the frame is drawn 1:1, unfiltered, and the compositor makes the
     * one upscale to the screen. Either way the canvas is CSS-sized to the
     * panel, so its shape is the panel's and nothing is stretched.
     *
     * Setting a canvas's size clears it and resets its state, so this
     * returns whether it did, and the caller redraws in the same frame.
     */
    const fit = (spec: FrameSetSpec) => {
      if (!deviceW || !deviceH) {
        const dpr = window.devicePixelRatio || 1;
        deviceW = Math.round(canvas.clientWidth * dpr);
        deviceH = Math.round(canvas.clientHeight * dpr);
      }
      if (!deviceW || !deviceH) return;

      const scaleW = deviceW / spec.width;
      const scaleH = deviceH / spec.height;
      const cover = Math.max(scaleW, scaleH);
      let w: number;
      let h: number;
      if (cover <= 1) {
        const room = Math.min(1, Math.sqrt(MAX_CANVAS_PIXELS / (deviceW * deviceH)));
        w = Math.round(deviceW * room);
        h = Math.round(deviceH * room);
      } else if (scaleW >= scaleH) {
        w = spec.width;
        h = Math.min(spec.height, Math.round(deviceH / cover));
      } else {
        h = spec.height;
        w = Math.min(spec.width, Math.round(deviceW / cover));
      }
      w = Math.max(1, w);
      h = Math.max(1, h);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      // Reset with the size, and after a lost context; cheap to say again.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
    };

    /** One frame, cropped to cover the canvas and centred. */
    const place = (item: DrawableFrame, alpha: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      let s = Math.max(cw / item.width, ch / item.height);
      // A frame that covers the canvas at its own size is drawn at it, so
      // its pixels land on pixels and nothing is filtered.
      if (Math.abs(s - 1) < 0.002 && item.width >= cw && item.height >= ch) s = 1;
      const w = item.width * s;
      const h = item.height * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(item.image, Math.round((cw - w) / 2), Math.round((ch - h) / 2), w, h);
    };

    /**
     * What the decoders should be working on, most urgent first.
     *
     * When the picture is moving slowly or not at all, the two frames either
     * side of it come first — they are what is drawn. When it is moving fast,
     * those will be behind it by the time they are decoded, so the glide's
     * own path comes first, starting as far ahead as a decode takes here,
     * and followed on past the scroll position while the page is still
     * moving (`LOOKAHEAD_FRAMES`). Then the frames around where the glide
     * will settle, the side it is heading first. And the same few frames in
     * the set waiting to take over, just behind the ones on screen, so it
     * can take over mid-scrub; and, once the picture is slowing, the frame it
     * will stop on in 4K.
     *
     * `stride` is how many frames apart the path is sampled. On a machine
     * whose decoders cannot keep up with the film at the speed it is being
     * scrubbed, asking for every frame means each one arrives after the
     * picture has passed it, and the canvas trails the wheel; asking for
     * every second or third keeps the picture with the wheel, at a lower
     * frame rate, which is the better of the two to look at.
     */
    const plan = (
      engine: FrameSequence,
      position: number,
      aim: number,
      velocity: number,
      active: number,
      pending: number | null,
      rest: number | null,
      slow: boolean,
      blend: boolean,
      stride: number,
    ) => {
      const pairs: [number, number][] = [];
      const low = Math.floor(position);
      const onScreen: [number, number][] = [
        [active, low],
        [active, low + 1],
        [active, Math.round(position)],
      ];

      if (slow) pairs.push(...onScreen);
      // The frame the glide is settling on, in 4K, so it is ready to fade in
      // as the picture comes to rest.
      if (rest !== null && slow) pairs.push([rest, Math.round(aim)]);
      if (pending !== null && slow) pairs.push([pending, low], [pending, low + 1]);

      // A frame asked for now lands `latencyMs` from now: it is asked for
      // the display frame it can still make, not the one it would just miss
      // — and no further, since a guess at where the glide will be grows
      // less exact with every frame it looks ahead.
      const lead = Math.min(10, Math.ceil(engine.latencyMs / 16.7));
      const path = glidePath({
        from: position,
        speed: film.v,
        to: aim,
        rate: SPRING_RATE,
        hz: 60,
        steps: lead + PATH_TICKS,
        drift: velocity,
        reach: LOOKAHEAD_FRAMES,
      });
      let picked = Number.NaN;
      for (let s = lead; s < path.length; s++) {
        const x = path[s];
        if (blend) {
          pairs.push([active, Math.floor(x)], [active, Math.floor(x) + 1]);
          continue;
        }
        const index = Math.round(x);
        if (Math.abs(index - picked) < stride) continue;
        picked = index;
        pairs.push([active, index]);
      }
      if (pending !== null && !slow) {
        for (let s = lead; s < Math.min(path.length, lead + PENDING_PATH_STEPS); s++) {
          pairs.push([pending, Math.round(path[s])]);
        }
      }

      // Everything between the picture and the end of that path, so a frame
      // decoded for it stays decoded — see `hold` on `FrameSequence.want`.
      const hold: [number, number][] = [];
      if (!slow && path.length) {
        const end = Math.round(path[path.length - 1]);
        const way = end >= low ? 1 : -1;
        for (let i = low; i !== end + way; i += way) hold.push([active, i]);
      }

      // Around where the glide will settle: the full spread once it is
      // slowing — as much of `SETTLE_RADIUS` as leaves the cache two fifths
      // of itself for the frames on screen, the 4K frame at rest and the
      // next path — and just the frame itself while it is still at speed,
      // when the memory is better spent on the path.
      const settle = Math.round(aim);
      const ahead = aim >= position ? 1 : -1;
      const radius = !slow
        ? 1
        : Math.min(SETTLE_RADIUS, Math.floor(engine.budget / engine.frameBytes(active) / 2.5));
      for (let d = 0; d <= radius; d++) {
        pairs.push([active, settle + ahead * d]);
        if (d) pairs.push([active, settle - ahead * d]);
      }
      return { pairs, keep: onScreen, hold };
    };

    const render = (now: number, target: number, elapsed: number, interval: number) => {
      const engine = engineRef.current;
      const sets = setsRef.current;
      if (!engine || sets.active === null) return;

      const position = film.x;
      const aim = clamp01(target / CLIP_END) * LAST_FRAME;
      // Frames of film per 60th of a second, whatever the display's rate.
      const speed =
        lastPosition < 0 || elapsed === 0 ? 0 : Math.abs(position - lastPosition) / (elapsed * 60);
      lastPosition = position;
      // How fast the scroll itself is moving, in frames a second — smoothed,
      // and only believed while it is still moving the same way this frame.
      // A page that jumped and has stopped has a large smoothed speed and
      // none now, and planning past its destination would waste the decodes
      // it needs there.
      const now60 = elapsed > 0 && lastAim >= 0 ? (aim - lastAim) / elapsed : 0;
      aimVelocity += (now60 - aimVelocity) * Math.min(1, elapsed * 10);
      lastAim = aim;
      const velocity =
        Math.sign(now60) === Math.sign(aimVelocity)
          ? Math.sign(aimVelocity) * Math.min(Math.abs(now60), Math.abs(aimVelocity))
          : 0;
      const moving = speed > 0.02;
      const still = speed < 0.25 && Math.abs(aim - position) < 0.5;

      if (blendAllowed && moving && interval > 0) {
        vsync = Math.min(vsync, Math.max(interval, 6.5));
        lateness =
          interval > vsync * BLEND_LATE_FACTOR ? lateness + 1 : Math.max(0, lateness - 0.25);
        if (lateness > BLEND_GIVE_UP) blendAllowed = false;
      }
      // New pictures a second the glide is asking for — one a display frame
      // at most, however many film frames it passes — against what the
      // decoders can make. Short of it, only every `skip`th display frame
      // gets a new picture, and the path is sampled that many frames apart.
      const skip = Math.max(1, Math.ceil((Math.min(speed, 1) * 60) / engine.capacity()));
      const stride = skip === 1 ? 1 : Math.ceil(skip * Math.max(speed, 1));
      const blend = blendAllowed && speed < 1 && stride === 1;

      const low = Math.floor(position);
      const high = Math.min(LAST_FRAME, low + 1);

      // The swap to a sharper set, on the frame it has this picture ready —
      // the frame this tick would draw, and its neighbour if cross-fading.
      if (sets.pending !== null) {
        const shown = blend ? low : Math.round(position);
        if (
          engine.has(sets.pending, shown) &&
          (!blend || high === low || engine.has(sets.pending, high))
        ) {
          sets.active = sets.pending;
          sets.pending = null;
          layoutDirty = true;
          waiting.current.promoted?.(true);
        } else if (!still) {
          sets.pendingSince = now;
        } else if (now - sets.pendingSince > PROMOTE_TIMEOUT_MS) {
          sets.pending = null;
          waiting.current.promoted?.(false);
        }
      }
      const active = sets.active;
      const pending = sets.pending;
      const rest = sets.rest;

      const slow = speed < 1;
      const pace = Math.max(-40, Math.min(40, Math.round(velocity / 8)));
      const key =
        ((((low * 256 + Math.round(aim)) * 4 + active) * 5 + (pending ?? 4)) * 2 + (blend ? 1 : 0)) *
          2 +
        (slow ? 1 : 0) +
        (pace + 40) * 1e9 +
        Math.min(stride, 9) * 1e11 +
        (rest === null ? 0 : 1e12);
      if (key !== plannedFor) {
        plannedFor = key;
        const next = plan(engine, position, aim, velocity, active, pending, rest, slow, blend, stride);
        engine.want(next.pairs, next.keep, next.hold);
      }

      // What to draw: the frame under the position and, between frames, the
      // next one faded over it. Anything not decoded yet is stood in for by
      // the nearest frame that is.
      let a: DrawableFrame | undefined;
      let b: DrawableFrame | undefined;
      let weight = 0;
      if (blend) {
        a = engine.get(active, low);
        if (a && high !== low) {
          weight = Math.round((position - low) * 64);
          if (weight > 0) b = engine.get(active, high);
          if (!b) weight = 0;
          else if (weight >= 64) {
            a = b;
            b = undefined;
            weight = 0;
          }
        }
      } else {
        a = engine.get(active, Math.round(position));
      }
      if (!a) {
        a = engine.nearest(active, position);
        b = undefined;
        weight = 0;
      }
      if (!a) return;

      exact.current = a.set === active && Math.abs(a.index - position) < 1;
      if (exact.current) waiting.current.drawn?.();

      // At rest on a whole frame, the same frame in 4K, faded in over it.
      const resting = rest !== null && still && !b && position === Math.round(position);
      const sharp = resting ? engine.get(rest, position) : undefined;
      restAlpha = sharp ? Math.min(1, restAlpha + (elapsed * 1000) / REST_FADE_MS) : 0;
      const sharpWeight = sharp ? Math.round(restAlpha * 32) : 0;

      // The backing store is sized for the sharpest set that will be drawn.
      const fitFor = rest ?? active;
      if (fitFor !== fittedFor) {
        fittedFor = fitFor;
        layoutDirty = true;
      }
      if (layoutDirty) {
        layoutDirty = false;
        fit(SETS[fitFor]);
      } else if (
        a === shownA &&
        (b ?? null) === shownB &&
        weight === shownWeight &&
        (sharp ?? null) === shownSharp &&
        sharpWeight === shownSharpWeight
      ) {
        return;
      }

      if (sharp && sharpWeight >= 32) {
        place(sharp, 1);
      } else {
        place(a, 1);
        if (b) place(b, weight / 64);
        if (sharp && sharpWeight > 0) place(sharp, sharpWeight / 32);
      }
      ctx.globalAlpha = 1;
      shownA = a;
      shownB = b ?? null;
      shownWeight = weight;
      shownSharp = sharp ?? null;
      shownSharpWeight = sharpWeight;

      if (!firstDrawn) {
        firstDrawn = true;
        canvas.style.opacity = "1";
        setDrawn(true);
      }
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      // Converge over *time*, not per frame: a 120Hz display would otherwise
      // chase twice as hard as a 60Hz one and feel like a different site. The
      // gap is clamped so a loop resuming after a pause eases in rather than
      // integrating however long it was away in a single step.
      const interval = last ? now - last : 0;
      const elapsed = Math.min(interval / 1000, 0.05);
      last = now;

      const target = readProgress();
      if (Math.abs(target - lastTarget) > 0.0002) {
        lastTarget = target;
        lastMoveAt.current = now;
      }
      // Snapped to rest once within a hair of the target and all but stopped.
      // A critically damped spring that close is moving at about `rate`
      // times its offset, so the speed that counts as stopped scales with
      // the rate.
      springStep(progress, target, SPRING_RATE, elapsed);
      if (Math.abs(target - progress.x) < 0.0004 && Math.abs(progress.v) < SPRING_RATE * 0.0004) {
        progress.x = target;
        progress.v = 0;
      }
      const filmAim = Math.round(clamp01(target / CLIP_END) * LAST_FRAME);
      springStep(film, filmAim, SPRING_RATE, elapsed);
      if (Math.abs(filmAim - film.x) < 0.02 && Math.abs(film.v) < SPRING_RATE * 0.05) {
        film.x = filmAim;
        film.v = 0;
      }

      paint(progress.x);
      render(now, target, elapsed, interval);
    };

    const start = () => {
      if (frame) return;
      // Never integrate the time the loop was not running, nor carry a speed
      // from before it stopped.
      last = 0;
      progress.v = 0;
      film.v = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onScreen = () => {
      const rect = track.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < viewportHeight;
    };

    const sync = () => {
      if (document.hidden || !onScreen()) {
        stop();
        return;
      }
      last = 0;
      painted = -1;
      start();
    };

    /** Draw again from scratch on the next frame. */
    const redraw = () => {
      shownA = null;
      shownSharp = null;
      layoutDirty = true;
    };

    /**
     * Coming back from a background tab, another application, or the back
     * button's page cache. A browser may have dropped the canvas's backing
     * store while the page was away; drawing it again costs one frame.
     */
    const wake = () => {
      redraw();
      sync();
    };

    /*
     * The panel's size in device pixels.
     *
     * `devicePixelContentBoxSize` is the exact count the browser will paint —
     * at 125% or 150% a CSS size times the ratio is a fraction, and rounding
     * it can land a pixel off, which softens a 1:1 draw across the whole
     * picture. It is only taken when it agrees with the CSS size times the
     * ratio to within that rounding: Chrome's device emulation (DevTools'
     * device mode, and the headless harness) reports CSS pixels there, which
     * would have a Retina screen drawn at half its resolution. Where it is
     * not offered (Safari), or not believed, the CSS size times the ratio it
     * is.
     *
     * The ratio is watched too. Moving a window to a screen of another
     * density, or zooming the page, changes it without always changing
     * anything a resize observer reports; when it changes, the canvas is
     * observed afresh, which delivers a new reading straight away.
     */
    const measure = (w: number, h: number) => {
      if (w === deviceW && h === deviceH) return;
      deviceW = w;
      deviceH = h;
      redraw();
    };
    const resize =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            const entry = entries[entries.length - 1];
            const dpr = window.devicePixelRatio || 1;
            const box = entry.contentBoxSize?.[0];
            const w = Math.round((box ? box.inlineSize : entry.contentRect.width) * dpr);
            const h = Math.round((box ? box.blockSize : entry.contentRect.height) * dpr);
            const device = entry.devicePixelContentBoxSize?.[0];
            if (
              device &&
              Math.abs(device.inlineSize - w) <= 2 &&
              Math.abs(device.blockSize - h) <= 2
            ) {
              measure(device.inlineSize, device.blockSize);
            } else {
              measure(w, h);
            }
          })
        : null;
    const observeCanvas = () => {
      if (!resize) return;
      try {
        resize.observe(canvas, { box: "device-pixel-content-box" });
      } catch {
        resize.observe(canvas);
      }
    };
    observeCanvas();

    let density: MediaQueryList | null = null;
    const onDensity = () => {
      watchDensity();
      if (resize) {
        resize.unobserve(canvas);
        observeCanvas();
      } else {
        const dpr = window.devicePixelRatio || 1;
        measure(Math.round(canvas.clientWidth * dpr), Math.round(canvas.clientHeight * dpr));
      }
    };
    const watchDensity = () => {
      density?.removeEventListener("change", onDensity);
      density = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      density.addEventListener("change", onDensity);
    };
    watchDensity();

    // Chrome can take a canvas's GPU context away (a driver reset, memory
    // pressure) and give it back blank; everything is drawn again on return.
    canvas.addEventListener("contextrestored", redraw);

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(sync, { threshold: 0 })
        : null;

    /**
     * Take the canvas out of the compositor once the hero is well behind us.
     *
     * A full-screen canvas holds a layer and a texture for as long as it is
     * painted, and this one is pinned inside a track several screens tall.
     * Being idle and off screen does not help: the layer is still in the
     * frame the compositor builds for every scroll position on the page. The
     * `<video>` this replaced cost about a frame in eight for the *whole*
     * home page that way, and a canvas is the same kind of layer.
     *
     * `visibility` rather than `display`, so the element keeps its box and
     * the layout above and below it cannot shift. And a full screen of slack
     * either side, so the canvas is always painted long before it could be
     * seen: an observer is delivered at the end of a frame, and a decision
     * taken exactly at the edge could be a frame late, which on the way back
     * up would be a black panel where the film should be.
     *
     * The *last* entry is the one that counts. An observer can deliver
     * several for one element in a single callback — a flick past the
     * margin and back inside one delivery — and reading only the first
     * would leave the canvas hidden while it is on screen.
     */
    const cull =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[entries.length - 1];
              culled.current = !entry.isIntersecting;
              canvas.style.visibility = culled.current ? "hidden" : "";
            },
            { threshold: 0, rootMargin: "100% 0px 100% 0px" },
          )
        : null;

    if (observer) observer.observe(track);
    cull?.observe(track);
    document.addEventListener("visibilitychange", wake);
    // `focus` covers switching back from another app, which does not change
    // visibility; `pageshow` covers a restore from the back/forward cache,
    // where this effect is never re-run.
    window.addEventListener("focus", wake);
    window.addEventListener("pageshow", wake);
    // The shared loop is what tells this one the window has changed size;
    // the hero's own loop then re-reads the track against it.
    const stopShared = onScroll(({ height }) => {
      if (height === viewportHeight) return;
      viewportHeight = height;
      sync();
    });

    if (observer) sync();
    else start();

    return () => {
      stop();
      observer?.disconnect();
      cull?.disconnect();
      resize?.disconnect();
      density?.removeEventListener("change", onDensity);
      culled.current = false;
      canvas.style.visibility = "";
      canvas.style.opacity = "0";
      canvas.removeEventListener("contextrestored", redraw);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("pageshow", wake);
      stopShared();
      for (const node of [media, soft, veil, mark, tag, cue]) {
        node.style.opacity = "";
        node.style.transform = "";
      }
    };
  }, [wide]);

  /*
   * Phones do not get the walkthrough at all.
   *
   * This is a five-screen track pinning a wide film and scrubbing it off the
   * scroll position — an interaction that wants a wheel and a connection,
   * and on a phone is a long drag through frames that had to be downloaded
   * first. `HomeHeroPhone` opens the page there instead: a short band of
   * photographs under the bar, no film at all.
   *
   * Unmounting rather than merely hiding is what stops the phone paying for
   * this anyway — no frames, no end still, no animation frame loop. It happens
   * the moment the width is known, and `hidden desk:block` below covers the
   * frame before that, so nothing is ever seen to leave.
   */
  if (width === "phone") return null;

  return (
    <section
      ref={trackRef}
      // The bar's height as top padding, so the panel's resting position is
      // already under it and `sticky` has nothing to correct on the first
      // paint. White rather than black: that strip is what the frosted bar
      // has behind it at the top of the page, and why the home page is on
      // the header's `LIGHT_FROM_TOP` list. (For part of 2026-09-16 the film
      // ran up behind a transparent bar instead; the client asked for the
      // white bar back.)
      className={cn(
        // `hidden desk:block` is the pre-hydration half of the split with
        // `HomeHeroPhone`: the server sends both heroes and CSS shows the
        // right one, so neither flashes before the width is known.
        "relative hidden bg-white pt-[var(--header-h)] desk:block",
        mounted && "h-hero-track",
      )}
      style={
        mounted
          ? ({ "--track-screens": TRACK_SCREENS } as React.CSSProperties)
          : undefined
      }
    >
      {/* The loader. Fixed over the whole window, so it sits here rather than
          in the panel — the panel is its own stacking context, and anything
          inside it would be under the bar. In the server's HTML so it can be
          up from the first paint; CSS keeps it hidden unless the page has
          asked for it. */}
      {!loaderGone && (
        <HeroLoader percent={percent} leaving={!loaderUp} ground={wide} />
      )}

      {/* Pins under the bar rather than behind it, and runs to the bottom of
          the viewport — full width, flush on all four sides. Padding and
          offset are the same height, so the panel is where it pins from the
          first pixel and the scrub still ends exactly as it unpins.

          Nothing shares the panel with the film: it is the whole screen below
          the bar, so the walkthrough is the first and only thing on it.

          The frames are 16:9, which is the tallest shape the render has and
          within a few percent of the panel's own on every screen this is
          read on, so drawing them to cover the canvas trims only those few
          percent, evenly, and never letterboxes. The poster and both soft
          plates are cut from the same frames, so the cross-fades land on
          pictures that line up. See also `h-hero-panel` in
          `app/globals.css`. */}
      <div className="sticky top-[var(--header-h)] isolate h-hero-panel w-full overflow-hidden bg-black">
        {/* `next/image` with `fill` needs a positioned containing block, so the
            media gets a wrapper of its own — which is also the thing the close
            pushes in. The veil and the lockup are deliberately outside it, so
            the push moves the picture and nothing else. */}
        <div ref={mediaRef} className="absolute inset-0">
          <Image
            src={img.homeScrollPoster}
            alt={alt.homeScrollPoster}
            fill
            preload
            sizes="100vw"
            placeholder="blur"
            className={cn(
              "object-cover transition-opacity duration-500",
              drawn ? "opacity-0" : "opacity-100",
            )}
          />

          {/* The film. Its opacity is the loop's to set, never React's: it
              goes to 1 on the frame the first picture is drawn, and to 0 if
              the film is given up. Decorative — the poster carries the
              alternative text. */}
          {wide && (
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="absolute inset-0 block h-full w-full"
              style={{ opacity: 0 }}
            />
          )}

          {/* The last frame, blurred once at build time. Cross-fading to this is
              what the close does instead of blurring the canvas live. */}
          {/* The plate itself waits for the width. It is lazy, and a lazy
              image with no layout box is fetched immediately rather than
              deferred — so on a phone, where this section is `display: none`
              and about to be unmounted altogether, it was being downloaded
              for nothing. Nothing is lost by waiting: it is invisible until
              the film has finished, more than two screens below the
              hydration this now happens on. */}
          <div ref={softRef} className="absolute inset-0 opacity-0">
            {mounted && (
              <Image
                src={img.homeScrollEnd}
                alt=""
                aria-hidden="true"
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
          </div>
        </div>

        {/* An ellipse rather than a flat wash: it darkens the middle, where
            the lockup lands, and leaves the edges of the shot alone. */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] opacity-0"
          style={{
            background:
              "radial-gradient(65% 45% at 50% 50%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0) 75%)",
          }}
        />

        {/* The close. This is also where the page keeps its `h1`: the lockup
            is what the home page leads on now that no headline sits over the
            walkthrough, so it carries the name rather than merely repeating
            the header's decorative copy of it.

            The lockup and the line centre together, as one block: the pair
            balances on the middle of the film, which puts the lockup itself a
            little above it. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <h1 ref={markRef} className="m-0 leading-none opacity-0">
            <span className="sr-only">
              Vijaya Enterprises, building trust since 1973
            </span>
            {/* Nudged left of, and up from, the centre its box sits on.
                Percentages of the lockup's own width and height, so both
                shifts stay proportional at every breakpoint instead of
                looking heavy-handed on a phone. */}
            <Logo
              reversed
              width={1000}
              className="h-24 w-auto -translate-x-[7%] -translate-y-[8%] sm:h-36 lg:h-48"
            />
          </h1>
          <p
            ref={tagRef}
            className="mt-6 max-w-3xl text-[0.625rem] uppercase leading-relaxed tracking-[0.3em] text-white/90 opacity-0 sm:mt-8 sm:text-xs sm:tracking-[0.38em] md:text-sm"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.75)" }}
          >
            One trusted partner for construction and development
          </p>
        </div>

        {/* The go-ahead. Two and a half rems off the foot of the screen and
            centred on it — the panel runs to the bottom of the viewport, so
            its own foot is the screen's. Once the loader has lifted it tells
            the reader to start scrolling; if the loader lifted early, on a
            stalled connection, it counts the rest of the frames in first.

            Tracking is added after every letter, the last one included, so
            the line carries the same amount again on its left to sit truly
            centred over the hairline. The count is in tabular figures, so
            the line does not twitch sideways as it climbs.

            The box is always rendered, because the loop takes hold of it on
            its first run; what goes in it waits until mounted. Without
            JavaScript nothing is counting, and a "Loading 0%" that never
            moves would be the one thing on the screen. */}
        <div
          ref={cueRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[max(2.5rem,env(safe-area-inset-bottom))] z-20 flex flex-col items-center gap-3"
        >
          {mounted && (
            <>
              <p
                data-no-translate
                className="whitespace-nowrap pl-[0.45em] text-base font-light uppercase tabular-nums tracking-[0.45em] text-white sm:pl-[0.55em] sm:text-xl sm:tracking-[0.55em] md:text-2xl"
                style={{
                  textShadow:
                    "0 2px 14px rgba(0,0,0,0.75), 0 0 28px rgba(183,110,121,0.28)",
                }}
              >
                {cue}
              </p>
              <span
                className={cn(
                  "block h-10 w-px bg-gradient-to-b from-rosegold-600 to-transparent",
                  complete ? "animate-pulse motion-reduce:animate-none" : "opacity-50",
                )}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
