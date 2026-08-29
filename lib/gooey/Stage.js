import { TweenMax as TM, CSSPlugin } from 'gsap/all'
import { map } from './utils'

import Scene from './Scene'
import PinnedScroll from './PinnedScroll'

// GSAP 2 registers a plugin by being imported, and a bundler that cannot see
// the plugin used anywhere drops the import: without `CSSPlugin` on the page
// `TM.to($el, 0.3, { x })` quietly sets an `x` property on the element and
// nothing moves. Holding the reference is the whole point of this line — it is
// what keeps the import. The demo never needed it, having no bundler that
// could tell.
const plugins = [CSSPlugin] // eslint-disable-line no-unused-vars

const offsetTitle = 100


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
        }


        this.init()

        this.bindEvents()
    }

    bindEvents() {
        this.Scroll.addListener((s) => { this.onScroll(s) })
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
            ease: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.18,
        })

        this.updateScrollBar()

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

        TM.to(this.$els.title, 0.3, { x: -this.progress * offsetTitle, force3D: true })
        this.updateScrollBar()
    }

    /* Actions
    --------------------------------------------------------- */

    updateScrollBar() {
        const progress = map(this.progress * 100, 0, 100, 5, 100)
        TM.to(this.$els.progress, 0.3, { xPercent: progress, force3D: true })
    }

    /* Values
    --------------------------------------------------------- */


}
