import * as THREE from "three";
import { tileShaders, vertexShader } from "./gooey-shaders";

/**
 * The WebGL half of the Codrops "Gooey Hover" demo.
 *
 * Each tile in the DOM is a plain `<img>`; this measures it and puts a
 * textured plane over the top of it in a single canvas, then runs the tile's
 * fragment shader as the pointer moves across it. The DOM stays the source of
 * truth for layout — nothing here decides where anything goes.
 *
 * Two departures from the original, both forced:
 *
 * 1. **Section-scoped, not viewport-scoped.** The demo is a whole page: a
 *    fixed, full-screen canvas, a camera whose field of view comes from
 *    `window.innerHeight`, and plane offsets measured from the middle of the
 *    window. This one lives in the middle of a page that scrolls, so every one
 *    of those is measured from the canvas's own box instead.
 *
 * 2. **No GSAP.** The demo tweens three things — the hover progress, the
 *    pointer position and the plane's scale. The first is a real tween and is
 *    implemented as one below; the other two are followers, and are damped
 *    per frame, which is what the overwritten 0.5s and 0.3s tweens amounted
 *    to. That leaves `three` as the only dependency this adds.
 */

const PERSPECTIVE = 800;

/** GSAP's Power2, which is cubic. */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

/** How fast the pointer and the plane's scale chase their targets, per frame. */
const POINTER_DAMPING = 0.14;
const SCALE_DAMPING = 0.2;

type Tween = {
  from: number;
  to: number;
  elapsed: number;
  duration: number;
};

/**
 * `getRatio` from the demo's utils: how far the texture has to be scaled to
 * cover the plane without distorting it.
 */
const coverRatio = (
  planeWidth: number,
  planeHeight: number,
  image: { width: number; height: number },
) => {
  const original = {
    w: planeWidth / image.width,
    h: planeHeight / image.height,
  };
  const cover = 1 / Math.max(original.w, original.h);
  return new THREE.Vector2(original.w * cover, original.h * cover);
};

class GooeyTile {
  private readonly image: HTMLImageElement;
  private readonly link: HTMLElement;
  private readonly duration: number;
  private readonly fragmentShader: string;

  private mesh: THREE.Mesh | null = null;
  private uniforms: Record<string, THREE.IUniform> | null = null;
  private textures: THREE.Texture[] = [];

  private readonly sizes = new THREE.Vector2(0, 0);
  private readonly offset = new THREE.Vector2(0, 0);
  private readonly scale = new THREE.Vector2(0, 0);

  private hoverTween: Tween | null = null;
  private hovering = false;
  private clock = new THREE.Clock();

  constructor(
    private readonly el: HTMLElement,
    index: number,
    private readonly scene: GooeyScene,
  ) {
    const entry = tileShaders[index % tileShaders.length];
    this.duration = entry.duration;
    this.fragmentShader = entry.shader;

    this.image = el.querySelector("img") as HTMLImageElement;
    this.link = el.querySelector("a") ?? el;

    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.link.addEventListener("mouseenter", this.onEnter);
    this.link.addEventListener("mouseleave", this.onLeave);

    this.load();
  }

  private load() {
    const sources = [
      this.image.src,
      this.image.dataset.hover as string,
      "/gooey/shape.jpg",
    ];

    let loaded = 0;
    sources.forEach((src, i) => {
      this.textures[i] = this.scene.texture(src, () => {
        loaded += 1;
        if (loaded === sources.length) this.build();
      });
    });
  }

  private build() {
    if (this.scene.disposed) return;

    const [map, hovermap, shape] = this.textures;
    // `Texture.image` is typed `any`/unknown; for a TextureLoader result it is
    // always the decoded HTMLImageElement, which is what the ratio needs.
    const mapImage = map.image as HTMLImageElement;
    const hoverImage = hovermap.image as HTMLImageElement;
    this.measure();
    this.scale.copy(this.sizes);

    this.uniforms = {
      u_alpha: { value: 1 },
      u_map: { value: map },
      u_ratio: {
        value: coverRatio(this.sizes.x, this.sizes.y, mapImage),
      },
      u_hovermap: { value: hovermap },
      u_hoverratio: {
        value: coverRatio(this.sizes.x, this.sizes.y, hoverImage),
      },
      u_shape: { value: shape },
      u_mouse: { value: this.scene.mouse },
      u_progressHover: { value: 0 },
      u_progressClick: { value: 0 },
      u_time: { value: 0 },
      u_res: { value: this.scene.resolution },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: true,
      defines: {
        PI: Math.PI,
        PR: window.devicePixelRatio.toFixed(1),
      },
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), material);
    this.mesh.position.set(this.offset.x, this.offset.y, 0);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
    this.scene.mainScene.add(this.mesh);

    // The plane is now standing in for the picture, so the picture steps back.
    this.image.classList.add("is-loaded");
  }

  private onEnter() {
    this.hovering = true;
    if (!this.uniforms) return;
    this.startHover(1);
  }

  private onLeave() {
    if (!this.uniforms) return;
    this.startHover(0);
  }

  private startHover(to: number) {
    const from = this.uniforms?.u_progressHover.value ?? 0;
    this.hoverTween = { from, to, elapsed: 0, duration: this.duration };
  }

  /** Where the picture sits, measured from the middle of the canvas. */
  private measure() {
    const box = this.image.getBoundingClientRect();
    const stage = this.scene.box;

    this.sizes.set(box.width, box.height);
    this.offset.set(
      box.left - stage.left - stage.width / 2 + box.width / 2,
      -(box.top - stage.top) + stage.height / 2 - box.height / 2,
    );
  }

  update(delta: number, squash: number) {
    if (!this.mesh || !this.uniforms) return;

    this.measure();
    this.mesh.position.set(this.offset.x, this.offset.y, 0);

    // The demo squashes the plane by how fast the strip is travelling.
    const targetX = this.sizes.x - squash;
    const targetY = this.sizes.y - squash;
    this.scale.x += (targetX - this.scale.x) * SCALE_DAMPING;
    this.scale.y += (targetY - this.scale.y) * SCALE_DAMPING;
    this.mesh.scale.set(this.scale.x, this.scale.y, 1);

    if (this.hoverTween) {
      const tween = this.hoverTween;
      tween.elapsed = Math.min(tween.elapsed + delta, tween.duration);
      const t = tween.duration > 0 ? tween.elapsed / tween.duration : 1;
      this.uniforms.u_progressHover.value =
        tween.from + (tween.to - tween.from) * easeInOutCubic(t);

      if (tween.elapsed >= tween.duration) {
        this.hoverTween = null;
        if (tween.to === 0) this.hovering = false;
      }
    }

    if (this.hovering) this.uniforms.u_time.value += this.clock.getDelta();
    else this.clock.getDelta();
  }

  resize() {
    if (!this.uniforms) return;
    this.measure();
    this.scale.copy(this.sizes);
  }

  destroy() {
    this.link.removeEventListener("mouseenter", this.onEnter);
    this.link.removeEventListener("mouseleave", this.onLeave);

    if (this.mesh) {
      this.scene.mainScene.remove(this.mesh);
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
    // Textures are shared with this tile's duplicate; the scene owns them.
  }
}

export class GooeyScene {
  readonly mainScene = new THREE.Scene();
  private readonly loader = new THREE.TextureLoader();

  /**
   * One texture per URL.
   *
   * The strip carries every slide twice so it can loop without ever running
   * out of track, which means each picture is on screen under two different
   * tiles. Loading it once and handing both the same texture keeps that from
   * doubling the GPU memory — and the shape map, which every tile shares, is
   * now uploaded once instead of ten times.
   */
  private readonly textures = new Map<string, THREE.Texture>();
  private readonly pending = new Map<string, Array<() => void>>();

  texture(src: string, onLoad: () => void) {
    const existing = this.textures.get(src);
    if (existing) {
      // A texture handed back before its image has decoded still has no
      // `image.width`, and the cover ratio needs one. So a caller that
      // arrives mid-flight waits in the queue rather than being told it is
      // ready; only a texture with nothing pending is finished.
      const queue = this.pending.get(src);
      if (queue) queue.push(onLoad);
      else onLoad();
      return existing;
    }

    this.pending.set(src, [onLoad]);
    const texture = this.loader.load(src, () => {
      const queue = this.pending.get(src) ?? [];
      this.pending.delete(src);
      queue.forEach((done) => done());
    });
    texture.center.set(0.5, 0.5);
    this.textures.set(src, texture);
    return texture;
  }
  readonly mouse = new THREE.Vector2(0, 0);
  readonly resolution = new THREE.Vector2(0, 0);

  box = { left: 0, top: 0, width: 0, height: 0 };
  disposed = false;

  /** See `onContextLost`. Nothing is drawn while this is true. */
  private contextLost = false;

  private readonly renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private readonly tiles: GooeyTile[];
  private frame = 0;
  private last = 0;

  private readonly pointer = new THREE.Vector2(0, 0);
  private previousTrack = 0;
  private squash = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly root: HTMLElement,
    private readonly track: HTMLElement,
  ) {
    this.measureStage();

    this.camera = new THREE.PerspectiveCamera(1, 1, 1, 10000);
    this.updateCamera();

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.box.width, this.box.height, false);

    // A WebGL context is not forever. The browser keeps a small, fixed number
    // of them alive per page and quietly takes the oldest back when something
    // else asks for one; a driver reset takes the lot. `render` used to be
    // called regardless of whether there was still anything to draw on, and
    // three only skips a frame once it has been *told* the context has gone —
    // which arrives as an event, a frame or more later. The frame in between
    // asked three to compile a shader against a dead context, three handed
    // `createShader`'s null straight to `shaderSource`, and the page came
    // down with `shader must be an instance of WebGLShader`.
    this.onContextLost = this.onContextLost.bind(this);
    this.onContextRestored = this.onContextRestored.bind(this);
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);
    // It can already be gone before the first frame: React mounts this twice
    // in development, and the second scene is handed back whatever state the
    // canvas was left in.
    this.contextLost = this.renderer.getContext().isContextLost();

    this.mainScene.add(new THREE.AmbientLight(0xffffff, 2));

    this.tiles = Array.from(
      root.querySelectorAll<HTMLElement>("[data-gooey-tile]"),
    ).map((el, i) => new GooeyTile(el, i, this));

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener("mousemove", this.onMouseMove, { passive: true });
    window.addEventListener("resize", this.onResize);

    this.last = performance.now();
    this.tick = this.tick.bind(this);
    this.frame = requestAnimationFrame(this.tick);
  }

  private measureStage() {
    const rect = this.canvas.getBoundingClientRect();
    this.box = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    this.resolution.set(rect.width, rect.height);
  }

  private updateCamera() {
    const { width, height } = this.box;
    const fov = (180 * (2 * Math.atan(height / 2 / PERSPECTIVE))) / Math.PI;

    this.camera.fov = fov;
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.position.set(0, 0, PERSPECTIVE);
    this.camera.updateProjectionMatrix();
  }

  private onMouseMove(event: MouseEvent) {
    this.pointer.set(event.clientX - this.box.left, event.clientY - this.box.top);
  }

  /**
   * `preventDefault` is what makes the loss recoverable: without it the
   * browser never bothers to fire `webglcontextrestored`. three registers a
   * handler of its own that does the same — but it removes that handler again
   * on `dispose()`, so the scene keeps its own rather than borrowing one with
   * a shorter life than itself.
   */
  private onContextLost(event: Event) {
    event.preventDefault();
    this.contextLost = true;
  }

  /**
   * three rebuilds its GL state from the same event, and re-uploads every
   * texture and program on the next frame it draws. All this has to do is let
   * that frame happen.
   */
  private onContextRestored() {
    this.contextLost = false;
  }

  private onResize() {
    this.measureStage();
    this.updateCamera();
    this.renderer.setSize(this.box.width, this.box.height, false);
    this.tiles.forEach((tile) => tile.resize());
  }

  private tick(now: number) {
    this.frame = requestAnimationFrame(this.tick);

    const delta = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;

    // The canvas moves with the page, so its box is only good for one frame.
    this.measureStage();

    this.mouse.x += (this.pointer.x - this.mouse.x) * POINTER_DAMPING;
    this.mouse.y += (this.pointer.y - this.mouse.y) * POINTER_DAMPING;

    // What the demo took from the scrollbar's velocity, taken from the strip's.
    const trackX = this.track.getBoundingClientRect().left;
    this.squash = Math.min(Math.abs(trackX - this.previousTrack) * 1.2, 120);
    this.previousTrack = trackX;

    this.tiles.forEach((tile) => tile.update(delta, this.squash));

    // Nothing to draw on. The loop stays scheduled — it was re-armed at the
    // top of the frame — so the scene picks itself up again the moment the
    // browser hands a context back, and simply idles if it never does.
    if (this.contextLost || this.renderer.getContext().isContextLost()) return;

    this.renderer.render(this.mainScene, this.camera);
  }

  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("resize", this.onResize);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
    this.tiles.forEach((tile) => tile.destroy());
    this.textures.forEach((texture) => texture.dispose());
    this.textures.clear();
    this.renderer.dispose();
  }
}
