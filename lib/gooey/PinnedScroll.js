
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
 * strip, and the track is made exactly as much taller than the screen as the
 * strip has left to travel. Only the layout knows that number, so it is
 * measured here and written back to the track as `--gooey-travel`.
 *
 * What this hands out is the part of `Scrollbar` the demo's `Stage` and `Tile`
 * already read — `offset`, `limit`, `addListener` — so neither has to know
 * where the numbers now come from.
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

const clamp01 = (val) => Math.max(0, Math.min(1, val))

export default class PinnedScroll {

    constructor({ track, content, ease = 0.02 }) {
        this.$track = track
        this.$content = content
        this.ease = ease

        this.offset = { x: 0, y: 0 }
        this.limit = { x: 1, y: 0 }
        this.listeners = []

        this.frame = 0
        this.last = 0
        this.hasWritten = false

        this.onResize = this.onResize.bind(this)
        this.schedule = this.schedule.bind(this)
        this.tick = this.tick.bind(this)

        this.measure()
        this.render()

        this.bindEvents()

        this.schedule()
    }

    bindEvents() {
        window.addEventListener('scroll', this.schedule, { passive: true })
        window.addEventListener('resize', this.onResize)
    }

    addListener(fn) {
        this.listeners.push(fn)
    }

    destroy() {
        cancelAnimationFrame(this.frame)
        this.frame = 0
        window.removeEventListener('scroll', this.schedule)
        window.removeEventListener('resize', this.onResize)
        this.listeners = []
    }

    /* Handlers
    --------------------------------------------------------- */

    onResize() {
        this.measure()
        this.schedule()
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

        this.$track.style.setProperty('--gooey-travel', `${Math.round(travel)}px`)

        // Never zero: the progress everything downstream reads is a division
        // by this.
        this.limit = { x: Math.max(travel, 1), y: 0 }
    }

    schedule() {
        if (!this.frame) this.frame = requestAnimationFrame(this.tick)
    }

    /** Where the page is: how far the track has been scrolled through. */
    read() {
        const distance = this.$track.offsetHeight - window.innerHeight
        const scrolled = -this.$track.getBoundingClientRect().top

        return distance > 0 ? clamp01(scrolled / distance) : 0
    }

    tick(now) {
        this.frame = 0

        const target = this.read() * this.limit.x

        // Capped, so a dropped frame or a tab left in the background does not
        // arrive as one enormous step.
        const elapsed = this.last ? Math.min((now - this.last) / 1000, 0.05) : 0
        this.last = now

        let next = target

        if (this.hasWritten && this.ease > 0) {
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

        if (settled) this.last = 0
        else this.schedule()
    }

    render() {
        this.hasWritten = true
        this.$content.style.transform = `translate3d(${-this.offset.x}px, 0, 0)`
        this.listeners.forEach((fn) => { fn({ offset: this.offset, limit: this.limit }) })
    }

}
