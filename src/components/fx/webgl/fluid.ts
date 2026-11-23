import { Renderer, Program, Mesh, Triangle } from "ogl";

/**
 * Flowing domain-warped noise field: near-black base, warm ember filaments,
 * and an accent-orange light that follows the cursor and bends the field.
 * Framework-agnostic; the React wrapper lives in ShaderField.tsx.
 */

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uVel;
uniform float uScroll;
uniform float uIntro;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = r * p * 2.02 + 3.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  // Scroll: zoom into the field as the hero leaves.
  p *= 1.0 - uScroll * 0.35;

  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
  vec2 dm = p - m;
  float d = length(dm);

  // Cursor lens: push the field away from the pointer, more when moving fast.
  p += normalize(dm + 1e-4) * exp(-d * d * 7.0) * (0.06 + uVel * 0.22);

  float t = uTime * 0.045;
  vec2 sp = p * 1.5;
  vec2 q = vec2(fbm(sp + vec2(0.0, t)), fbm(sp + vec2(5.2, 1.3) - t));
  vec2 r = vec2(
    fbm(sp + 3.2 * q + vec2(1.7, 9.2) + t * 1.4),
    fbm(sp + 3.2 * q + vec2(8.3, 2.8) - t * 1.1)
  );
  float f = fbm(sp + 3.0 * r);

  vec3 base = vec3(0.043, 0.043, 0.039);
  vec3 ember = vec3(0.17, 0.065, 0.028);
  vec3 accent = vec3(1.0, 0.353, 0.122);

  vec3 col = mix(base, ember, smoothstep(0.35, 0.95, f));

  // Thin bright filaments where the warp folds.
  float fil = smoothstep(0.62, 0.98, f) * smoothstep(0.35, 0.9, length(r));
  col += accent * fil * 0.28;

  // Light that follows the cursor.
  float glow = exp(-d * d * 4.0);
  col += accent * glow * (0.05 + 0.32 * f * f);

  // Low horizon heat at the bottom edge.
  col += accent * 0.09 * smoothstep(0.15, -0.65, p.y) * f;

  // Vignette + intro / scroll fade.
  vec2 vp = vUv - 0.5;
  col *= 1.0 - 0.9 * dot(vp, vp);
  col = mix(base, col, uIntro * (1.0 - uScroll * 0.75));

  // Dither to kill banding in the dark gradients.
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

export type FluidOptions = {
  /** Render a single frame and stop (reduced motion). */
  still?: boolean;
  /** Drive the light on a slow drift instead of following the pointer (touch). */
  autoDrift?: boolean;
};

export function createFluid(container: HTMLElement, opts: FluidOptions = {}) {
  // Rendered at reduced resolution: the field is low-frequency, so this is
  // visually lossless and cheap. Never above DPR 2.
  const dpr = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
  const renderer = new Renderer({ dpr, alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
  const gl = renderer.gl;
  gl.clearColor(0.043, 0.043, 0.039, 1);
  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 1.6s cubic-bezier(0.16,1,0.3,1);";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const uniforms = {
    uTime: { value: Math.random() * 100 },
    uRes: { value: [1, 1] },
    uMouse: { value: [0.72, 0.38] },
    uVel: { value: 0 },
    uScroll: { value: 0 },
    uIntro: { value: 1 },
  };
  const program = new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    uniforms.uRes.value = [w, h];
    if (opts.still) requestAnimationFrame((t) => frame(t));
  };

  // Pointer target (normalised, y up) and smoothed state.
  const target = { x: 0.72, y: 0.38 };
  const cur = { x: 0.72, y: 0.38 };
  let vel = 0;
  const onPointer = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width;
    target.y = 1 - (e.clientY - r.top) / r.height;
  };
  if (!opts.autoDrift && !opts.still) window.addEventListener("pointermove", onPointer, { passive: true });

  let raf = 0;
  let last = performance.now();
  let visible = true;
  let running = false;

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    uniforms.uTime.value += dt;

    if (opts.autoDrift) {
      const t = uniforms.uTime.value * 0.12;
      target.x = 0.5 + Math.cos(t) * 0.28;
      target.y = 0.45 + Math.sin(t * 1.3) * 0.18;
    }
    const k = 1 - Math.pow(0.0015, dt);
    const dx = (target.x - cur.x) * k;
    const dy = (target.y - cur.y) * k;
    cur.x += dx;
    cur.y += dy;
    vel += (Math.min(Math.hypot(dx, dy) / Math.max(dt, 1e-3), 2.5) - vel) * Math.min(dt * 4, 1);
    uniforms.uMouse.value = [cur.x, cur.y];
    uniforms.uVel.value = vel;

    // Scroll progress of the hero (0 at rest, 1 once fully scrolled past).
    const rect = container.getBoundingClientRect();
    uniforms.uScroll.value = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
    renderer.render({ scene: mesh });
    if (canvas.style.opacity !== "1") canvas.style.opacity = "1";
    if (running) raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || opts.still) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
  const sync = () => (visible && !document.hidden ? start() : stop());

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  io.observe(container);
  document.addEventListener("visibilitychange", sync);

  if (!opts.still) start();

  return {
    canvas,
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointer);
      program.remove();
      mesh.geometry.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}

