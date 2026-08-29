import * as THREE from 'three'
import Tile from './Tile'
import { tileShaders } from '../gooey-shaders'

const perspective = 800

const shaders = tileShaders.map((t) => t.shader)

const durations = tileShaders.map((t) => t.duration)

export default class Scene {

    constructor($scene, $root, Scroll) {
        this.container = $scene
        this.$root = $root
        this.$tiles = $root.querySelectorAll('.slideshow-list__el')

        // Handed down rather than looked up: the tiles take their squash from
        // the strip's own velocity, and the strip's scroll is the `Stage`'s.
        this.Scroll = Scroll

        this.W = window.innerWidth
        this.H = window.innerHeight

        this.mouse = new THREE.Vector2(0, 0)
        this.activeTile = null
        this.isMobile = window.matchMedia('(max-width: 767px)').matches

        this.frame = 0
        this.isVisible = true
        this.onResize = this.onResize.bind(this)
        this.onContextLost = this.onContextLost.bind(this)
        this.onContextRestored = this.onContextRestored.bind(this)

        this.build()

        this.bindEvent()
    }

    bindEvent() {
        window.addEventListener('resize', this.onResize)

        // A lost context is not hypothetical — a GPU reset, a laptop handing
        // over from one graphics chip to the other, a machine under load with
        // too many canvases open. By the time it happens every tile has
        // already stepped its photograph back behind a plane, so losing the
        // planes without saying so leaves captions floating over nothing.
        this.container.addEventListener('webglcontextlost', this.onContextLost)
        this.container.addEventListener('webglcontextrestored', this.onContextRestored)

        // The demo owns the whole page and draws the whole time. Here the band
        // is one stop on a long one, and a scene rendering every frame while
        // it is nowhere near the screen is just heat — the kind of load that
        // costs a context in the first place.
        this.observer = new IntersectionObserver(([entry]) => {
            this.isVisible = entry.isIntersecting
            if (this.isVisible) this.start()
        }, { rootMargin: '10%' })
        this.observer.observe(this.$root)
    }

    // Not the demo's: it never has to take the scene down again. This page
    // does — a client-side navigation away unmounts the section, and a render
    // loop left running would go on drawing every frame, for the rest of the
    // session, onto a canvas nobody can see.
    destroy() {
        cancelAnimationFrame(this.frame)
        this.frame = 0
        this.isVisible = false

        window.removeEventListener('resize', this.onResize)

        this.container.removeEventListener('webglcontextlost', this.onContextLost)
        this.container.removeEventListener('webglcontextrestored', this.onContextRestored)

        this.observer.disconnect()

        this.tiles.forEach((tile) => { tile.destroy() })

        this.renderer.dispose()
    }


    build() {
        this.mainScene = new THREE.Scene()
        this.initCamera()
        this.initLights()

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            alpha: true,
        })
        this.renderer.setSize(this.W, this.H)
        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.tiles = Array.from(this.$tiles).map(($el, i) => new Tile($el, this, durations[i % durations.length], shaders[i % shaders.length]))

        this.update()
    }

    initCamera() {
        const fov = (180 * (2 * Math.atan(this.H / 2 / perspective))) / Math.PI

        this.camera = new THREE.PerspectiveCamera(fov, this.W / this.H, 1, 10000)
        this.camera.position.set(0, 0, perspective)
    }

    initLights() {
        const ambientlight = new THREE.AmbientLight(0xffffff, 2)
        this.mainScene.add(ambientlight)
    }




    /* Handlers
    --------------------------------------------------------- */

    // Preventing the default is what makes a restore possible at all; without
    // it the browser writes the context off for good.
    onContextLost(event) {
        event.preventDefault()

        cancelAnimationFrame(this.frame)
        this.frame = 0

        this.tiles.forEach((tile) => { tile.showPhotograph() })
    }

    onContextRestored() {
        // `three` re-initialises the renderer off its own listener. If that
        // does not take, the context is lost again and the photographs come
        // straight back — the section degrades to what it looks like on a
        // machine with no WebGL at all, which is a working section.
        this.tiles.forEach((tile) => { tile.hidePhotograph() })

        this.start()
    }

    onResize() {
        this.W = window.innerWidth
        this.H = window.innerHeight

        this.camera.aspect = this.W / this.H

        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.W, this.H)
    }

    /* Actions
    --------------------------------------------------------- */

    /** Runs the loop, unless it is already running or there is nothing to draw. */
    start() {
        if (!this.frame && this.isVisible) this.update()
    }

    update() {
        this.frame = this.isVisible ? requestAnimationFrame(this.update.bind(this)) : 0

        this.tiles.forEach((tile) => {
            tile.update()
        })

        this.renderer.render(this.mainScene, this.camera)
    }

}
