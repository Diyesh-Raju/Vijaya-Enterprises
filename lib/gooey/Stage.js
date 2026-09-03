import PinnedScroll from './PinnedScroll'

const map = (value, min1, max1, min2, max2) => min2 + (max2 - min2) * (value - min1) / (max1 - min1)

// How far the heading slides against the strip. The demo could throw its
// title a hundred pixels — it was a watermark at a tenth opacity, and where
// it ended up hardly mattered. This one is the band's own heading, read at
// the top of the section, and a slide that size would walk it out of the
// page's left margin. What is left is enough to keep it alive under the
// scroll.
//
// The margin is `5vw`, so on a phone it is under 20px and 28 would walk the
// first letter off the screen — which it did, and the strip now holds at
// full progress long enough that it was not a moment but a rest. The cap is
// written into the transform as `min()` rather than worked out here, so it
// answers a resize without anyone measuring anything on a scroll frame.
const offsetTitle = 28


export default class Stage {

    constructor($root) {
        this.progress = 0
        this.$root = $root

        // No backdrop here. The ground used to swing sideways against the
        // strip and does not any more — it is one still photograph, hung
        // behind the band and left alone, so nothing has to be written to it
        // on a scroll frame and nothing has to be found for that.
        this.$els = {
            track    : $root.closest('.gooey-track'),
            title    : $root.querySelector('.page-title'),
            progress : $root.querySelector('.slideshow__progress'),
            strip    : $root.querySelector('.slideshow-list'),
        }


        this.init()

        this.bindEvents()
    }

    bindEvents() {
        this.Scroll.addListener((s) => { this.onScroll(s) })

        // The scroll has already placed the strip by the time anything is
        // listening, and nothing else will speak until it next moves — so ask
        // it once for where it already is. Without this the band opens with a
        // ground that has not been walked to its starting point yet.
        this.onScroll(this.Scroll)
    }

    init() {
        // The demo's `Scrollbar.init` on the strip, replaced by the page's own
        // scroll through the pinned band — see `PinnedScroll`. It is the whole
        // of this class's machinery now: the demo's `Scene` drew every
        // photograph again as a WebGL plane so that hovering one could pull it
        // about, and with that effect gone the planes had nothing left to do
        // but redraw the pictures the browser was already drawing.
        this.Scroll = new PinnedScroll({
            track: this.$els.track,
            content: this.$els.strip,
            // Reduced motion is put exactly where the page says it is, with no
            // tail left to settle through.
            ease: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.02,
        })
    }


    destroy() {
        this.Scroll.destroy()
    }

    /* Handlers
    --------------------------------------------------------- */

    onScroll({ limit, offset }) {
        this.progress = offset.x / limit.x

        // Written straight out, where the demo tweened each of these over
        // 0.3s. That tween is a second lag stacked on the strip's own, and it
        // is the one that shows: a progress bar arriving a third of a second
        // after the page has stopped reads as the page being slow. The value
        // being followed is a scroll position the browser has already
        // smoothed, so there is nothing left for a tween to smooth — it only
        // allocated one per element per frame for the privilege.
        this.$els.title.style.transform =
            `translate3d(calc(${-this.progress} * min(${offsetTitle}px, 5vw)), 0, 0)`

        this.updateScrollBar()
    }

    /* Actions
    --------------------------------------------------------- */

    updateScrollBar() {
        // The bar sits a full width to the left and is walked back to nothing,
        // which is the demo's own 5-to-100 read against its `translateX(-100%)`
        // resting place.
        this.$els.progress.style.transform = `translateX(${map(this.progress * 100, 0, 100, -95, 0)}%)`
    }

    /* Values
    --------------------------------------------------------- */


}
