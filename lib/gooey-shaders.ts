/**
 * The GLSL from the Codrops "Gooey Hover" demo, carried across verbatim.
 *
 * Two things had to change to get it here, neither of them to the maths:
 *
 * 1. The originals are `.glsl` files pulled in by webpack's `glslify-loader`.
 *    Turbopack has no such loader, so they are template strings instead.
 * 2. Each one opened with `#pragma glslify: snoise3 = require('glsl-noise/simplex/3d')`,
 *    which glslify resolved at build time. `SIMPLEX_NOISE` below is that
 *    module inlined — Ashima Arts / Stefan Gustavson's 3D simplex noise,
 *    MIT — and it is prepended to every fragment shader that asked for it.
 *
 * `PR` and `PI` are `#define`s supplied by the material, as in the original.
 */

/** Ashima Arts / Stefan Gustavson, MIT. What `glsl-noise/simplex/3d` exports. */
const SIMPLEX_NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise3(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const vertexShader = /* glsl */ `
varying vec2 v_uv;

void main() {
    v_uv = uv;
    vec3 pos = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const COMMON_UNIFORMS = /* glsl */ `
uniform sampler2D u_map;
uniform sampler2D u_hovermap;
uniform sampler2D u_shape;

uniform float u_alpha;
uniform float u_time;
uniform float u_progressHover;
uniform float u_progressClick;

uniform vec2 u_res;
uniform vec2 u_mouse;
uniform vec2 u_ratio;
uniform vec2 u_hoverratio;

varying vec2 v_uv;

float circle(in vec2 _st, in float _radius, in float blurriness) {
  vec2 dist = _st;
  return 1. - smoothstep(_radius - (_radius * blurriness), _radius + (_radius * blurriness), dot(dist, dist) * 4.0);
}

float circleCentred(in vec2 _st, in float _radius, in float blurriness) {
  vec2 dist = _st - vec2(0.5);
  return 1. - smoothstep(_radius - (_radius * blurriness), _radius + (_radius * blurriness), dot(dist, dist) * 4.0);
}
`;

const head = SIMPLEX_NOISE + COMMON_UNIFORMS;

export const trippyShader = head + /* glsl */ `
void main() {
  vec2 resolution = u_res * PR;
  float time = u_time * 0.05;
  float progress = u_progressClick;

  float progressHover = u_progressHover;
  vec2 uv = v_uv;
  vec2 uv_h = v_uv;

  vec2 st = gl_FragCoord.xy / resolution.xy - vec2(.5);
  st.y *= resolution.y / resolution.x;

  vec2 mouse = vec2((u_mouse.x / u_res.x) * 2. - 1., -(u_mouse.y / u_res.y) * 2. + 1.) * -.5;
  mouse.y *= resolution.y / resolution.x;

  vec2 cpos = st + mouse;

  float c = circle(cpos, .02 * progressHover + progress * 0.8, 2.);

  float offX = uv.x + sin(uv.y + time * 2.);
  float offY = uv.y - time * .2 - cos(time * 2.) * 0.1;
  float nc = (snoise3(vec3(offX, offY, time * .5) * 8.)) * progressHover;
  float nh = (snoise3(vec3(offX, offY, time * .5) * 2.)) * .03;

  uv_h -= vec2(0.5);
  uv_h *= 1. - u_progressHover * 0.1;
  uv_h += vec2(0.5);

  uv_h *= u_hoverratio;

  uv -= vec2(0.5);
  uv *= 1. - u_progressHover * 0.2;
  uv *= u_ratio;
  uv += vec2(0.5);

  vec4 image = texture2D(u_hovermap, uv_h);
  vec4 imageDistorted = texture2D(u_map, uv + vec2(nh) * progressHover);

  float finalMask = smoothstep(.99, 1., pow(c, 2.) * 4. + nc * (1. - progress));

  vec4 finalImage = mix(imageDistorted, image, clamp(finalMask + progress, 0., 1.));

  gl_FragColor = vec4(finalImage.rgb, u_alpha);
}
`;

export const shapeShader = head + /* glsl */ `
void main() {
  vec2 resolution = u_res * PR;
  vec2 uv = v_uv;
  vec2 uv_h = v_uv;
  float time = u_time * 0.05;
  float progress = u_progressClick;
  float progressHover = u_progressHover;

  vec2 st = gl_FragCoord.xy / resolution.xy - vec2(.5);
  st.y *= resolution.y / resolution.x;

  vec2 mouse = vec2((u_mouse.x / u_res.x) * 2. - 1., -(u_mouse.y / u_res.y) * 2. + 1.) * -.5;
  mouse.y *= resolution.y / resolution.x;

  uv -= vec2(0.5);
  uv *= 1. - u_progressHover * 0.03;
  uv *= u_ratio;
  uv += vec2(0.5);

  vec2 shapeUv = (st + mouse) * 4.;
  shapeUv *= 1.5 - (progressHover + progress) * 0.8;
  shapeUv /= progressHover;
  shapeUv += vec2(.5);

  vec4 shape = texture2D(u_shape, shapeUv);

  float s = (shape.r) * 3. * (1. - progress);
  float offX = uv.x + time;
  float offY = uv.y + time * .2 + cos(time * 2.);
  float n = snoise3(vec3(offX, offY, time) * 5.) + 2.;

  uv_h -= vec2(0.5);
  uv_h *= 1. - progressHover * 0.05;
  uv_h *= u_hoverratio;
  uv_h += vec2(0.5);

  vec4 image = texture2D(u_map, uv + mouse * 0.05 * progressHover * (1. - progress));
  vec4 hover = texture2D(u_hovermap, uv_h + mouse * 0.5 * progressHover * (1. - progress));

  float pct = smoothstep(.99, 1., clamp(n - s, 0., 1.) + progress);

  vec4 finalImage = mix(image, hover, pct);

  gl_FragColor = vec4(finalImage.rgb, u_alpha);
}
`;

export const gooeyShader = head + /* glsl */ `
void main() {
  vec2 resolution = u_res * PR;
  float time = u_time * 0.05;
  float progress = u_progressClick;

  float progressHover = u_progressHover;
  vec2 uv = v_uv;
  vec2 uv_h = v_uv;

  vec2 st = gl_FragCoord.xy / resolution.xy - vec2(.5);
  st.y *= resolution.y / resolution.x;

  vec2 mouse = vec2((u_mouse.x / u_res.x) * 2. - 1., -(u_mouse.y / u_res.y) * 2. + 1.) * -.5;
  mouse.y *= resolution.y / resolution.x;

  vec2 cpos = st + mouse;

  float grd = 0.1 * progressHover;

  float sqr = 100. * ((smoothstep(0., grd, uv.x) - smoothstep(1. - grd, 1., uv.x)) * (smoothstep(0., grd, uv.y) - smoothstep(1. - grd, 1., uv.y))) - 10.;

  float c = circle(cpos, .04 * progressHover + progress * 0.8, 2.) * 50.;
  float c2 = circle(cpos, .01 * progressHover + progress * 0.5, 2.);

  float offX = uv.x + sin(uv.y + time * 2.);
  float offY = uv.y - time * .2 - cos(time * 2.) * 0.1;
  float nc = (snoise3(vec3(offX, offY, time * .5) * 8.)) * progressHover;
  float nh = (snoise3(vec3(offX, offY, time * .5) * 2.)) * .1;

  c2 = smoothstep(.1, .8, c2 * 5. + nc * 3. - 1.);

  uv_h -= vec2(0.5);
  uv_h *= 1. - u_progressHover * 0.1;
  uv_h += vec2(0.5);

  uv_h *= u_hoverratio;

  uv -= vec2(0.5);
  uv *= 1. - u_progressHover * 0.2;
  uv += mouse * 0.1 * u_progressHover;
  uv *= u_ratio;
  uv += vec2(0.5);

  vec4 color = vec4(0.0314, 0.0314, 0.2235, 1.);

  vec4 image = texture2D(u_map, uv);
  vec4 hover = texture2D(u_hovermap, uv_h + vec2(nh) * progressHover * (1. - progress));
  hover = mix(hover, color * hover, .8 * (1. - progress));

  float finalMask = smoothstep(.0, .1, sqr - c);

  image = mix(image, hover, clamp(c2 + progress, 0., 1.));

  gl_FragColor = vec4(image.rgb, u_alpha * finalMask);
}
`;

export const waveShader = head + /* glsl */ `
void main() {
  vec2 resolution = u_res * PR;
  float time = u_time * 0.05;
  float progress = u_progressClick;
  float progressHover = u_progressHover;
  vec2 uv = v_uv;
  vec2 uv_h = v_uv;

  vec2 st = gl_FragCoord.xy / resolution.xy - vec2(.5);
  st.y *= resolution.y / resolution.x;

  vec2 mouse = vec2((u_mouse.x / u_res.x) * 2. - 1., -(u_mouse.y / u_res.y) * 2. + 1.) * -.5;
  mouse.y *= resolution.y / resolution.x;

  float offX = uv.x * .3 - time * 0.3;
  float offY = uv.y + sin(uv.x * 5.) * .1 - sin(time * 0.5) + snoise3(vec3(uv.x, uv.y, time) * 0.5);
  offX += snoise3(vec3(offX, offY, time) * 5.) * .3;
  offY += snoise3(vec3(offX, offX, time * 0.3)) * .1;
  float nc = (snoise3(vec3(offX, offY, time * .5) * 8.)) * progressHover;
  float nh = (snoise3(vec3(offX, offY, time * .5) * 2.)) * .03;

  nh *= smoothstep(nh, 0.5, 0.6);

  uv_h -= vec2(0.5);
  uv_h *= u_hoverratio;
  uv_h += vec2(0.5);

  uv -= vec2(0.5);
  uv *= u_ratio;
  uv += vec2(0.5);

  vec4 image = texture2D(u_map, uv_h + vec2(nc + nh) * progressHover);
  vec4 hover = texture2D(u_hovermap, uv + vec2(nc + nh) * progressHover * (1. - progress));

  vec4 finalImage = mix(image, hover, clamp(nh * (1. - progress) + progressHover, 0., 1.));

  gl_FragColor = vec4(finalImage.rgb, u_alpha);
}
`;

export const revealShader = head + /* glsl */ `
void main() {
  vec2 resolution = u_res * PR;
  vec2 uv = v_uv;
  vec2 uv_h = v_uv;
  float time = u_time * 0.05;
  float progress = u_progressClick;
  float progressHover = u_progressHover;

  vec2 st = gl_FragCoord.xy / resolution.xy - vec2(.5);
  st.y *= resolution.y / resolution.x;

  vec2 mouse = vec2((u_mouse.x / u_res.x) * 2. - 1., -(u_mouse.y / u_res.y) * 2. + 1.) * -.5;
  mouse.y *= resolution.y / resolution.x;

  float shape = (uv.x + uv.y - 2. + progressHover * 2.7 + progress * 2.7) * 2.;
  float offX = uv.x + uv.y;
  float offY = uv.y - uv.x;
  float n = snoise3(vec3(offX, offY, time) * 8.) * .5;

  float grd = 0.1 * progressHover;

  float sqr = 100. * ((smoothstep(0., grd, uv.x) - smoothstep(1. - grd, 1., uv.x)) * (smoothstep(0., grd, uv.y) - smoothstep(1. - grd, 1., uv.y))) - 10.;

  uv_h -= vec2(0.5);
  uv_h *= 1. - progressHover * 0.1;
  uv_h += vec2(0.5);

  uv_h *= u_hoverratio;

  uv -= vec2(0.5);
  uv *= 1. - progressHover * 0.2;
  uv *= u_ratio;
  uv += vec2(0.5);

  vec2 cpos = st + mouse;

  float c = circle(cpos, .04 * progressHover + progress * 0.8, 2.) * 50.;

  vec4 image = texture2D(u_map, uv);
  vec4 hover = texture2D(u_hovermap, uv_h + mouse * 0.1 * progressHover);

  float pct = smoothstep(.99, 1., n + shape);

  float finalMask = smoothstep(.0, .1, sqr - c);

  vec4 finalImage = mix(image, hover, pct);

  gl_FragColor = vec4(finalImage.rgb, u_alpha * finalMask);
}
`;

/** The order the demo assigns them, tile by tile, with their hover durations. */
export const tileShaders = [
  { shader: trippyShader, duration: 0.5 },
  { shader: shapeShader, duration: 0.5 },
  { shader: gooeyShader, duration: 0.5 },
  { shader: waveShader, duration: 0.8 },
  { shader: revealShader, duration: 0.8 },
] as const;
