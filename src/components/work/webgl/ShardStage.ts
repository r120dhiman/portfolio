import { Geometry, Mesh, Program, Renderer, Texture, Transform } from "ogl";
import type { M4 } from "./math";

/**
 * WebGL "shard" layer for the exploded project wheel.
 *
 * Each project cover is drawn as a grid of instanced tiles living in CSS pixel
 * space (y down, z toward viewer) and projected with the same perspective the
 * DOM uses, so at rest the tiles land pixel-exact on the DOM cover. Driving
 * `explode` 0 → 1 bursts the tiles into depth with tumbling rotation and an
 * accent edge glow; 1 → 0 reassembles them.
 */

const COLS = 12;
const ROWS = 8;

const vertex = /* glsl */ `
attribute vec2 position;   // 0..1 within a tile
attribute vec2 aCell;      // tile column,row
attribute vec4 aRand;

uniform mat4 uModel;       // CSS-space matrix, origin = cover centre
uniform vec2 uRes;         // stage size (css px)
uniform float uPersp;      // CSS perspective distance
uniform vec2 uSize;        // cover size (css px)
uniform vec2 uGrid;
uniform float uExplode;
uniform float uDir;
uniform vec4 uCrop;        // uv scale.xy, offset.xy (object-fit: cover)

varying vec2 vUv;
varying vec2 vLocal;
varying float vT;
varying float vShade;

mat3 rotAxis(vec3 axis, float a) {
  axis = normalize(axis);
  float s = sin(a);
  float c = cos(a);
  float oc = 1.0 - c;
  return mat3(
    oc * axis.x * axis.x + c,          oc * axis.x * axis.y + axis.z * s, oc * axis.z * axis.x - axis.y * s,
    oc * axis.x * axis.y - axis.z * s, oc * axis.y * axis.y + c,          oc * axis.y * axis.z + axis.x * s,
    oc * axis.z * axis.x + axis.y * s, oc * axis.y * axis.z - axis.x * s, oc * axis.z * axis.z + c
  );
}

void main() {
  vec2 uv = (aCell + position) / uGrid;
  vec2 cuv = (aCell + 0.5) / uGrid;
  vec2 centre = (cuv - 0.5) * uSize;
  vec2 rel = (uv - cuv) * uSize;

  // Sweep: leaving covers break from the trailing edge, arriving ones settle from the leading edge.
  float sweep = uDir > 0.0 ? cuv.x : 1.0 - cuv.x;
  float stag = sweep * 0.55 + aRand.w * 0.25;
  float t = clamp(uExplode * 1.8 - stag, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  vec2 fromC = cuv - 0.5;
  // Tiles lift onto four discrete planes (a sliced, engineered stack) and only
  // start to tumble late in the burst.
  float level = floor(aRand.z * 4.0);
  vec3 axis = vec3(aRand.x - 0.5, aRand.y - 0.5, (aRand.w - 0.5) * 0.3) + vec3(0.001);
  float spin = t * t * (0.12 + aRand.x * 0.6);
  mat3 R = rotAxis(axis, spin);
  vec3 p = R * vec3(rel * (1.0 - t * 0.16), 0.0);

  vec3 disp = vec3(
    fromC.x * uSize.x * 0.16 * t - uDir * t * (20.0 + aRand.y * 70.0),
    fromC.y * uSize.y * 0.2 * t,
    t * (50.0 + level * 105.0 + aRand.y * 30.0)
  );

  vec4 world = uModel * vec4(vec3(centre, 0.0) + disp + p, 1.0);
  vec2 ndc = (world.xy - uRes * 0.5) / (uRes * 0.5);
  float w = (uPersp - world.z) / uPersp;
  gl_Position = vec4(ndc.x, -ndc.y, -world.z / 4000.0 * w, w);

  vUv = vec2(uv.x * uCrop.x + uCrop.z, 1.0 - (uv.y * uCrop.y + uCrop.w));
  vLocal = position;
  vT = t;
  vShade = abs((R * vec3(0.0, 0.0, 1.0)).z);
}
`;

const fragment = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform vec3 uAccent;
uniform float uAlpha;
varying vec2 vUv;
varying vec2 vLocal;
varying float vT;
varying float vShade;

void main() {
  vec3 col = texture2D(tMap, vUv).rgb;
  float edge = min(min(vLocal.x, 1.0 - vLocal.x), min(vLocal.y, 1.0 - vLocal.y));
  float rim = 1.0 - smoothstep(0.0, 0.045, edge);
  float glow = rim * smoothstep(0.08, 0.5, vT);
  col *= mix(1.0, 0.62 + 0.38 * vShade, vT);
  col = mix(col, uAccent, glow * 0.6);
  col += uAccent * vT * 0.03;
  float a = uAlpha * (1.0 - smoothstep(0.85, 1.0, vT) * 0.5);
  gl_FragColor = vec4(col * a, a);
}
`;

export type ShardSource = { image?: string; accent: string; name: string; label: string };

type Slot = {
  mesh: Mesh;
  program: Program;
  texture: Texture;
  ready: boolean;
  aspect: number;
};

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export class ShardStage {
  readonly canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private gl: Renderer["gl"];
  private slots: Slot[] = [];
  private scene = new Transform();
  private w = 1;
  private h = 1;
  private coverW = 1;
  private coverH = 1;
  private disposed = false;
  private sources: ShardSource[];
  private images: (HTMLImageElement | null)[] = [];

  constructor(sources: ShardSource[], accent: string) {
    this.sources = sources;
    this.renderer = new Renderer({
      dpr: Math.min(2, window.devicePixelRatio || 1),
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      depth: true,
      powerPreference: "high-performance",
    });
    this.gl = this.renderer.gl;
    this.canvas = this.gl.canvas as HTMLCanvasElement;
    this.gl.clearColor(0, 0, 0, 0);

    const cells: number[] = [];
    const rand: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        cells.push(c, r);
        rand.push(Math.random(), Math.random(), Math.random(), Math.random());
      }
    }
    const geometry = new Geometry(this.gl, {
      position: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) },
      aCell: { size: 2, instanced: 1, data: new Float32Array(cells) },
      aRand: { size: 4, instanced: 1, data: new Float32Array(rand) },
    });

    const acc = hexToRgb(accent);
    sources.forEach((src) => {
      const texture = new Texture(this.gl, { generateMipmaps: false, minFilter: this.gl.LINEAR });
      const program = new Program(this.gl, {
        vertex,
        fragment,
        transparent: true,
        cullFace: false,
        depthTest: true,
        depthWrite: true,
        uniforms: {
          tMap: { value: texture },
          uModel: { value: new Float32Array(16) },
          uRes: { value: [1, 1] },
          uPersp: { value: 1600 },
          uSize: { value: [1, 1] },
          uGrid: { value: [COLS, ROWS] },
          uExplode: { value: 0 },
          uDir: { value: 1 },
          uCrop: { value: [1, 1, 0, 0] },
          uAccent: { value: acc },
          uAlpha: { value: 1 },
        },
      });
      const mesh = new Mesh(this.gl, { geometry, program, frustumCulled: false });
      mesh.setParent(this.scene);
      const slot: Slot = { mesh, program, texture, ready: false, aspect: 1 };
      this.slots.push(slot);

      if (src.image) {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (this.disposed) return;
          texture.image = img;
          slot.aspect = img.naturalWidth / img.naturalHeight;
          slot.ready = true;
          this.updateCrop(slot);
        };
        img.src = src.image;
        this.images.push(img);
      } else {
        this.images.push(null);
      }
    });
  }

  /** Whether slot i has its texture and can stand in for the DOM cover. */
  isReady(i: number) {
    return !!this.slots[i]?.ready;
  }

  resize(w: number, h: number, coverW: number, coverH: number) {
    this.w = w;
    this.h = h;
    this.coverW = coverW;
    this.coverH = coverH;
    this.renderer.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.renderer.setSize(w, h);
    this.slots.forEach((slot, i) => {
      slot.program.uniforms.uRes.value = [w, h];
      slot.program.uniforms.uSize.value = [coverW, coverH];
      if (!this.sources[i].image) this.paintGenerated(slot, this.sources[i]);
      this.updateCrop(slot);
    });
  }

  /** Approximates ProjectCover's generated poster on a 2D canvas. */
  private paintGenerated(slot: Slot, src: ShardSource) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.max(2, Math.round(this.coverW * dpr));
    const ch = Math.max(2, Math.round(this.coverH * dpr));
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0b0b0a";
    ctx.fillRect(0, 0, cw, ch);
    // Elliptical radial gradient: 120% × 90% at 20% 10%.
    ctx.save();
    ctx.translate(cw * 0.2, ch * 0.1);
    ctx.scale(1.2 * cw, 0.9 * ch);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `${src.accent}cc`);
    g.addColorStop(0.38, `${src.accent}33`);
    g.addColorStop(0.75, "#0b0b0a");
    g.addColorStop(1, "#0b0b0a");
    ctx.fillStyle = g;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();

    const family = getComputedStyle(document.body).fontFamily || "sans-serif";
    const vw = window.innerWidth / 100;
    const size = Math.min(Math.max(64, 14 * vw), 192) * dpr;
    ctx.font = `500 ${size}px ${family}`;
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(11,11,10,0.8)";
    ctx.textBaseline = "alphabetic";
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${-0.06 * size}px`;
    ctx.fillText(src.name, -0.04 * size, ch + 0.12 * size - size * 0.2);
    ctx.globalCompositeOperation = "source-over";
    ctx.font = `400 ${12 * dpr}px ${family}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textBaseline = "top";
    ctx.fillText(src.label.toUpperCase(), 16 * dpr, 16 * dpr);

    slot.texture.image = c;
    slot.aspect = cw / ch;
    slot.ready = true;
  }

  private updateCrop(slot: Slot) {
    const ra = this.coverW / this.coverH;
    const ia = slot.aspect;
    let sx = 1;
    let sy = 1;
    if (ia > ra) sx = ra / ia;
    else sy = ia / ra;
    slot.program.uniforms.uCrop.value = [sx, sy, (1 - sx) / 2, (1 - sy) / 2];
  }

  /**
   * Draw the given covers. Each entry: slot index, CSS-space model matrix
   * (origin at cover centre), explode amount, sweep direction and alpha.
   */
  render(items: { i: number; model: M4; explode: number; dir: number; alpha: number }[], persp: number) {
    this.slots.forEach((s) => (s.mesh.visible = false));
    for (const it of items) {
      const slot = this.slots[it.i];
      if (!slot?.ready || it.alpha <= 0.001) continue;
      slot.mesh.visible = true;
      const u = slot.program.uniforms;
      u.uModel.value = it.model;
      u.uExplode.value = it.explode;
      u.uDir.value = it.dir;
      u.uAlpha.value = it.alpha;
      u.uPersp.value = persp;
    }
    this.renderer.render({ scene: this.scene, sort: false, frustumCull: false });
  }

  clear() {
    this.slots.forEach((s) => (s.mesh.visible = false));
    this.renderer.render({ scene: this.scene, sort: false, frustumCull: false });
  }

  destroy() {
    this.disposed = true;
    this.images.forEach((img) => {
      if (img) {
        img.onload = null;
        img.src = "";
      }
    });
    this.slots.forEach((s) => {
      s.mesh.geometry.remove();
      s.program.remove();
      if (s.texture.texture) this.gl.deleteTexture(s.texture.texture);
    });
    this.slots = [];
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.canvas.remove();
  }
}
