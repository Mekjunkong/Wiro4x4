/** Deterministic value noise shared by the WIRO three.js relief maps. */

export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));

export const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function hash(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function vn(x: number, y: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi),
    b = hash(xi + 1, yi),
    c = hash(xi, yi + 1),
    d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, y: number, o = 5) {
  let t = 0,
    a = 1,
    f = 1,
    n = 0;
  for (let i = 0; i < o; i++) {
    t += a * vn(x * f, y * f);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return t / n;
}
