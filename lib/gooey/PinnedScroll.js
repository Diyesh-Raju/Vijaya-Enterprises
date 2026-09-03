
/**
 * The strip's scroll, taken from the page rather than from the wheel.
 *
 * The demo scrolls its strip with `smooth-scrollbar`: its horizontal plugin
 * turns the wheel's Y into the strip's X for as long as the pointer is over
 * the strip, and the page carries on underneath regardless. Here the band is
 * pinned to the screen instead, and the page scroll through the track that
 * holds it *is* the strip's scroll — so the reader is walked from the first
 * tile to the last on the way down, and the page only moves on once the strip
 * has run out.
 *
 * The distance is one to one: a pixel down the page is a pixel along the
 * strip, and the track is made as much taller than the screen as the strip
 * has left to travel, plus a last stretch with nothing left to walk. Only the
 * layout knows that number, so it is measured here and written back to the
 * track as `--gooey-travel`.
 *
 * That last stretch is `rest`, and it is there because without it the strip
 * ran out on the same pixel the pin let go: the final tile finished arriving
 * and the next section pushed it off the screen in the same motion, so the
 * one award at the end of the wall was the one nobody got to look at. Now the
 * strip finishes early and the band holds still for half a screen — bar full,
 * last tile resting in the middle of the window — before the page moves on.
 *
 * What this hands out is the part of `Scrollbar` the demo's `Stage` and `Tile`
 * already read — `offset`, `limit`, `addListener` — so neither has to know
 * where the numbers now come from.
 *
 * The loop is the site's shared one (`lib/scroll.js`), not a `scroll`
 * listener of its own, and it does nothing at all while the band is off
 * screen. Both matter more here than anywhere else on the site: this is the
 * only section that used to keep a second listener and a second frame loop
 * running for the *whole* page. Every frame of scrolling anywhere below the
 * accolades — half the home page — measured this track, eased the strip
 * towards a position nobody could see and wrote four transforms for it. It
 * was the one thing left that made the home page scroll worse than every
 * other page on the site.
 *
 * `ease` is a time constant, and a strip that eases trails the page by roughly
 * the scroll rate times that constant — so it is kept very small. The demo's
 * own damping is no guide here: it was smoothing raw wheel deltas, where this
 * is following a scroll position the browser has already smoothed, and every
 * millisecond of tail is felt as the strip dragging behind the page. What is
 * left is about a frame of give, enough to round off a wheel notch and to keep
 * the tiles' squash from arriving as a spike — `Tile.update` measures the
 * strip's own velocity, and takes its squash from that.
 */

import { onScroll } from '@/lib/scroll'

const clamp01 = (val) => Math.max(0, Math.min(1, val))

export default class PinnedScroll {

    constructor({ track, content, ease = 0.02, rest = 0.5 }) {
        this.$track = track
        this.$content = content
        this.ease = ease
        this.rest = rest

        this.offset = { x: 0, y: 0 }
        this.limit = { x: 1, y: 0 }
        this.hold = 0
        this.listeners = []

        this.last = 0
        this.hasWritten = false
        // Set while the band is off screen, so the first frame back lands on
        // the true position instead of easing towards it from wherever the
        // strip was parked when it left.
        this.resumed = true
        this.width = window.innerWidth

        this.tick = this.tick.bind(this)

        this.measure()
        this.render()

        // Runs once, synchronously, and then on every frame in which the page
        // has actually moved.
        this.stop = onScroll(this.tick)
    }

    addListener(fn) {
        this.listeners.push(fn)
    }

    destroy() {
        this.stop?.()
        this.stop = null
        this.listeners = []
    }

    /* Actions
    --------------------------------------------------------- */

    /** How far the strip still has to travel — and so how tall the track is. */
    measure() {
        const $els = this.$content.children
        const $last = $els[$els.length - 1]

        // Laid-out numbers, deliberately: `offsetLeft` and `offsetWidth` are
        // the same whatever transform the strip is carrying at the time,
        // where a bounding rect would be measured through it, and
        // `scrollWidth` is not dependable on a box that is overflowing rather
        // than scrolling.
        const strip = $last ? $last.offsetLeft + $last.offsetWidth - this.$content.offsetLeft : 0
        const travel = Math.max(strip - this.$content.clientWidth, 0)

        // The rest at the end, in screens. Nothing to hold on to where the
        // strip fits the window and never moves at all.
        this.hold = travel > 0 ? Math.round(window.innerHeight * this.rest) : 0

        this.$track.style.setProperty('--gooey-travel', `${Math.round(travel) + this.hold}px`)

        // Never zero: the progress everything downstream reads is a division
        // by this.
        this.limit = { x: Math.max(travel, 1), y: 0 }
    }

    /**
     * Where the page is: how far the track has been scrolled through — or
     * `null` if the band is not on screen and there is nothing worth doing.
     *
     * One rect, used for both answers. The cull has to come from the same
     * measurement as the progress or it would be a second forced layout to
     * save the cost of the first.
     */
    read(viewportHeight) {
        const box = this.$track.getBoundingClientRect()
        if (box.bottom <= 0 || box.top >= viewportHeight) return null

        const distance = box.height - viewportHeight

        return distance > 0 ? clamp01(-box.top / distance) : 0
    }

    tick({ width, height }, now) {
        // The strip's travel is a laid-out width, so only a change of window
        // width can invalidate it.
        if (width !== this.width) {
            this.width = width
            this.measure()
        }

        const progress = this.read(height)

        if (progress === null) {
            // Off screen: no easing, no writes, and no frame asked for. The
            // next one that arrives will be a scroll frame like any other.
            this.resumed = true
            this.last = 0
            return
        }

        // `progress` is the whole track, strip and rest together, so it is
        // read back out as pixels down the track and then clamped to what the
        // strip actually has to walk. Everything past that point is the hold:
        // the page keeps scrolling, the strip has arrived.
        const target = Math.min(progress * (this.limit.x + this.hold), this.limit.x)

        // Capped, so a dropped frame or a tab left in the background does not
        // arrive as one enormous step.
        const elapsed = this.last ? Math.min((now - this.last) / 1000, 0.05) : 0
        this.last = now

        let next = target

        if (this.hasWritten && this.ease > 0 && !this.resumed) {
            // Exponential catch-up worked out from the time that actually
            // passed rather than per frame, so the tail is the same length on
            // a 60Hz screen as on a 120Hz one.
            next = this.offset.x + (target - this.offset.x) * (1 - Math.exp(-elapsed / this.ease))
        }

        // A hundredth of a pixel is under a thousandth of one tile: past that
        // the strip has arrived, and it is set to the target exactly so it
        // never rests a fraction short of the last tile.
        const settled = Math.abs(target - next) < 0.01
        const x = settled ? target : next

        if (x !== this.offset.x || !this.hasWritten) {
            this.offset.x = x
            this.render()
        }

        this.resumed = false

        if (settled) {
            this.last = 0
            return
        }

        // Still catching up: ask the shared loop for another frame even if
        // the page itself has stopped moving.
        return true
    }

    render() {
        this.hasWritten = true
        this.$content.style.transform = `translate3d(${-this.offset.x}px, 0, 0)`
        this.listeners.forEach((fn) => { fn({ offset: this.offset, limit: this.limit }) })
    }

}
