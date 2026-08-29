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
        this.onResize = this.onResize.bind(this)

        this.start()

        this.bindEvent()
    }

    bindEvent() {
        window.addEventListener('resize', this.onResize)
    }

    // Not the demo's: it never has to take the scene down again. This page
    // does — a client-side navigation away unmounts the section, and a render
    // loop left running would go on drawing every frame, for the rest of the
    // session, onto a canvas nobody can see.
    destroy() {
        cancelAnimationFrame(this.frame)
        this.frame = 0

        window.removeEventListener('resize', this.onResize)

        this.tiles.forEach((tile) => { tile.destroy() })

        this.renderer.dispose()
    }


    start() {
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

    onResize() {
        this.W = window.innerWidth
        this.H = window.innerHeight

        this.camera.aspect = this.W / this.H

        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.W, this.H)
    }

    /* Actions
    --------------------------------------------------------- */

    update() {
        this.frame = requestAnimationFrame(this.update.bind(this))

        this.tiles.forEach((tile) => {
            tile.update()
        })

        this.renderer.render(this.mainScene, this.camera)
    }

}
