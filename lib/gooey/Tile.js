import * as THREE from 'three'
import { TweenMax as TM, Power2 } from 'gsap/all'
import { vertexShader } from '../gooey-shaders'

import { clamp, getRatio } from './utils'

export default class Tile {

    constructor($el, scene, duration, fragmentShader) {
        this.scene = scene
        this.$els = {
            body: document.body,
            el: $el,
            link: $el.querySelector('a'),
            text: $el.querySelectorAll('.tile__title, .tile__cta'),
            title: $el.querySelector('.tile__title').innerText,
        }

        this.duration = duration

        this.mainImage = this.$els.el.querySelector('img')
        this.images = []
        this.sizes = new THREE.Vector2(0, 0)
        this.offset = new THREE.Vector2(0, 0)

        this.vertexShader = vertexShader
        this.fragmentShader = fragmentShader

        this.clock = new THREE.Clock()

        this.mouse = new THREE.Vector2(0, 0)

        this.scroll = 0
        this.prevScroll = 0
        this.delta = 0
        this.hasClicked = false
        this.isZoomed = false
        this.isDestroyed = false

        this.loader = new THREE.TextureLoader()
        this.preload([this.mainImage.src, this.mainImage.dataset.hover, '/gooey/shape.jpg'], () => { this.initTile() })

        this.$root = scene.$root
        this.Scroll = scene.Scroll

        this.bindEvent()
    }

    bindEvent() {
        // Bound and kept, where the demo used throwaway closures: these have
        // to come off again when the section unmounts.
        this.onResize = this.onResize.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onPointerEnter = this.onPointerEnter.bind(this)
        this.onPointerLeave = this.onPointerLeave.bind(this)

        window.addEventListener('resize', this.onResize)
        window.addEventListener('mousemove', this.onMouseMove)

        this.$els.link.addEventListener('mouseenter', this.onPointerEnter)
        this.$els.link.addEventListener('mouseleave', this.onPointerLeave)

        // The scroll drops every listener it has when it is destroyed, so
        // there is nothing to take off it here.
        this.Scroll.addListener((s) => { this.onScroll(s) })
    }

    destroy() {
        this.isDestroyed = true

        window.removeEventListener('resize', this.onResize)
        window.removeEventListener('mousemove', this.onMouseMove)

        this.$els.link.removeEventListener('mouseenter', this.onPointerEnter)
        this.$els.link.removeEventListener('mouseleave', this.onPointerLeave)

        if (this.mesh) {
            this.scene.mainScene.remove(this.mesh)
            this.geometry.dispose()
            this.material.dispose()
        }

        this.images.forEach((texture) => { texture.dispose() })
    }

    /* Handlers
    --------------------------------------------------------- */

    onPointerEnter() {
        this.isHovering = true

        if (this.isZoomed || this.hasClicked || window.APP.Layout.isMobile) return

        const $siblings = [...this.$els.el.parentElement.children]
        const idx = clamp($siblings.indexOf(this.$els.el) + 1, 1, $siblings.length)

        this.$root.style.setProperty('--color-bg', `var(--color-bg${idx})`)
        this.$root.style.setProperty('--color-text', `var(--color-text${idx})`)

        if (!this.mesh) return

        TM.to(this.uniforms.u_progressHover, this.duration, {
            value: 1,
            ease: Power2.easeInOut,
        })
    }

    onPointerLeave() {
        if (!this.mesh || this.isZoomed || this.hasClicked || window.APP.Layout.isMobile) return

        TM.to(this.uniforms.u_progressHover, this.duration, {
            value: 0,
            ease: Power2.easeInOut,
            onComplete: () => {
                this.isHovering = false
            },
        })
    }

    onResize() {
        this.getBounds()

        if (!this.mesh) return

        this.mesh.scale.set(this.sizes.x, this.sizes.y, 1)
        this.uniforms.u_res.value.set(window.innerWidth, window.innerHeight)
    }

    onScroll({ offset, limit }) {
        this.scroll = offset.x / limit.x
    }

    onMouseMove(event) {
        if (this.isZoomed || this.hasClicked || window.APP.Layout.isMobile) return

        TM.to(this.mouse, 0.5, {
            x: event.clientX,
            y: event.clientY,
        })
    }


    /* Actions
    --------------------------------------------------------- */

    initTile() {
        if (this.isDestroyed) return

        const texture = this.images[0]
        const hoverTexture = this.images[1]

        this.getBounds()

        this.uniforms = {
            u_alpha: { value: 1 },
            u_map: { type: 't', value: texture },
            u_ratio: { value: getRatio(this.sizes, texture.image) },
            u_hovermap: { type: 't', value: hoverTexture },
            u_hoverratio: { value: getRatio(this.sizes, hoverTexture.image) },
            u_shape: { value: this.images[2] },
            u_mouse: { value: this.mouse },
            u_progressHover: { value: 0 },
            u_progressClick: { value: 0 },
            u_time: { value: this.clock.getElapsedTime() },
            u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        }

        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            transparent: true,
            defines: {
                PI: Math.PI,
                PR: window.devicePixelRatio.toFixed(1),
            },
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.mesh.position.x = this.offset.x
        this.mesh.position.y = this.offset.y

        this.mesh.scale.set(this.sizes.x, this.sizes.y, 1)

        this.scene.mainScene.add(this.mesh)

        this.hidePhotograph()
    }

    /* The photograph under the plane. It is the fallback the whole section
       rests on: it steps back only while something is actually drawn over it,
       and it comes back the moment that stops being true. */

    hidePhotograph() {
        if (this.mesh) this.mainImage.classList.add('is-loaded')
    }

    showPhotograph() {
        this.mainImage.classList.remove('is-loaded')
    }

    move() {
        if (!this.mesh || this.isZoomed || this.hasClicked) return
        this.getBounds()

        TM.set(this.mesh.position, {
            x: this.offset.x,
            y: this.offset.y,
        })

        TM.to(this.mesh.scale, 0.3, {
            x: this.sizes.x - this.delta,
            y: this.sizes.y - this.delta,
            z: 1,
        })
    }

    update() {
        this.delta = Math.abs((this.scroll - this.prevScroll) * 2000)

        if (!this.mesh) return

        this.move()

        this.prevScroll = this.scroll

        if (!this.isHovering) return
        this.uniforms.u_time.value += this.clock.getDelta()
    }

    /* Values
    --------------------------------------------------------- */

    getBounds() {
        const { width, height, left, top } = this.mainImage.getBoundingClientRect()

        if (!this.sizes.equals(new THREE.Vector2(width, height))) {
            this.sizes.set(width, height)
        }

        if (!this.offset.equals(new THREE.Vector2(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2))) {
            this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2)
        }
    }

    preload($els, allImagesLoadedCallback) {
        let loadedCounter = 0
        const toBeLoadedNumber = $els.length
        const preloadImage = ($el, anImageLoadedCallback) => {
            const image = this.loader.load($el, anImageLoadedCallback)
            image.center.set(0.5, 0.5)
            this.images.push(image)
        }

        $els.forEach(($el) => {
            preloadImage($el, () => {
                loadedCounter += 1
                if (loadedCounter === toBeLoadedNumber) {
                    allImagesLoadedCallback()
                }
            })
        })
    }

}

