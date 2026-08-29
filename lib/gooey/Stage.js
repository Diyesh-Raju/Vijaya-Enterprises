import { map } from './utils'

import Scene from './Scene'
import PinnedScroll from './PinnedScroll'

const offsetTitle = 100

// How far the ground swings under the band, either way of centre. The
// photograph is laid wider than the band by more than this (see
// `.gooey-backdrop::before`), so its own edge is never walked into view.
const driftTitle = 10


export default class Stage {

    constructor($root, { webgl = true } = {}) {
        this.progress = 0
        this.$root = $root
        this.webgl = webgl

        this.$els = {
            track    : $root.closest('.gooey-track'),
            title    : $root.querySelector('.page-title'),
            progress : $root.querySelector('.slideshow__progress'),
            scene    : $root.querySelector('.js-scene'),
            strip    : $root.querySelector('.slideshow-list'),
            backdrop : $root.querySelector('.gooey-backdrop'),
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
        // scroll through the pinned band — see `PinnedScroll`. It is set up
        // whether or not there is a scene to draw: the strip has to be
        // walkable even where the photographs are all there is.
        this.Scroll = new PinnedScroll({
            track: this.$els.track,
            content: this.$els.strip,
            // Reduced motion is put exactly where the page says it is, with no
            // tail left to settle through.
            ease: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.02,
        })

        if (this.webgl) this.scene = new Scene(this.$els.scene, this.$root, this.Scroll)
    }


    destroy() {
        this.Scroll.destroy()
        if (this.scene) this.scene.destroy()
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
        this.$els.title.style.transform = `translate3d(${-this.progress * offsetTitle}px, 0, 0)`

        this.updateScrollBar()
        this.updateBackdrop()
    }

    /* Actions
    --------------------------------------------------------- */

    updateScrollBar() {
        // The bar sits a full width to the left and is walked back to nothing,
        // which is the demo's own 5-to-100 read against its `translateX(-100%)`
        // resting place.
        this.$els.progress.style.transform = `translateX(${map(this.progress * 100, 0, 100, -95, 0)}%)`
    }

    updateBackdrop() {
        if (!this.$els.backdrop) return

        this.$els.backdrop.style.setProperty(
            '--gooey-drift',
            `${map(this.progress, 0, 1, driftTitle, -driftTitle)}%`,
        )
    }

    /* Values
    --------------------------------------------------------- */


}
