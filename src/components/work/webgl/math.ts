/**
 * Tiny column-major mat4 helpers that mirror CSS transform semantics
 * (y down, z toward the viewer) so WebGL geometry can sit exactly on a
 * DOM layer that is transformed with CSS.
 */
export type M4 = Float32Array;

export const ident = (): M4 => {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
};

/** out = a × b (column-major). */
export const mul = (a: M4, b: M4): M4 => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] =
        a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
};

export const translate = (x: number, y: number, z = 0): M4 => {
  const m = ident();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
};

/** CSS rotateX(deg). */
export const rotX = (deg: number): M4 => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const m = ident();
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
};

/** CSS rotateY(deg). */
export const rotY = (deg: number): M4 => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const m = ident();
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
};

/** Multiply a chain left → right, like a CSS transform list. */
export const chain = (...ms: M4[]) => ms.reduce((acc, m) => mul(acc, m), ident());

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
