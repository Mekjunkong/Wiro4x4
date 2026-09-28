/**
 * WIRO multi-day route map — the relief-map look of `wiroReliefMap.ts`
 * (contour terrain, gold route, travelling dot, fireflies) stretched over
 * Northern Thailand, drawing one ordered loop through a list of stops.
 * Loaded lazily by `WiroRouteMap.tsx`, so three.js stays out of the main
 * bundle. The terrain is built once; `update` swaps only the route and pins.
 */
import * as THREE from "three";
import type { RouteStop } from "@/data/motorcycleRoutes";
import { clamp, fbm, sstep } from "@/lib/wiroNoise";

export interface RouteMapOptions {
  stops: readonly RouteStop[];
  /** Draw the line through the stops in order (false = pins only). */
  loop: boolean;
  /** Highlight only the stops between these indices (inclusive). */
  focus?: readonly [from: number, to: number] | null;
  lang: "en" | "he";
}

export interface RouteMapHandle {
  update(opts: RouteMapOptions): void;
  dispose(): void;
}

// One world unit = 2 km, so heights and pin sizes match the day-trip map.
const S = 0.5;
const toXZ = (lat: number, lon: number) => ({
  x: (lon - 98.985) * 105.5 * S,
  z: -(lat - 18.788) * 111 * S,
});

// Terrain covers Mae Hong Son to the Golden Triangle with a margin.
const NW = toXZ(20.6, 97.45);
const SE = toXZ(17.95, 100.4);
const TW = SE.x - NW.x,
  TD = SE.z - NW.z,
  TCX = (NW.x + SE.x) / 2,
  TCZ = (NW.z + SE.z) / 2;

// Flat valley floors around the towns, so the roads run through basins.
const BASINS = [
  { ...toXZ(18.788, 98.985), r: 10 }, // Chiang Mai
  { ...toXZ(19.1, 98.97), r: 7 }, // Mae Taeng
  { ...toXZ(19.91, 99.84), r: 11 }, // Chiang Rai
  { ...toXZ(19.92, 99.21), r: 8 }, // Fang
  { ...toXZ(20.3, 100.05), r: 6 }, // Mekong plain
];
const PEAKS = [
  { ...toXZ(18.588, 98.487), h: 12, s: 60 }, // Doi Inthanon
  { ...toXZ(19.4, 98.93), h: 7, s: 30 }, // Doi Chiang Dao
];
const PING_X = (z: number) => toXZ(18.788, 98.985).x + Math.sin(z * 0.09) * 1.8;

function HM(x: number, z: number) {
  let flat = 1;
  for (const b of BASINS) {
    flat = Math.min(
      flat,
      sstep(b.r * 0.4, b.r * 1.6, Math.hypot(x - b.x, z - b.z))
    );
  }
  // The Ping valley north and south of Chiang Mai.
  if (z > -34 && z < 26)
    flat = Math.min(flat, sstep(3, 11, Math.abs(x - PING_X(z))));
  let h =
    Math.pow(fbm((x + 300) * 0.045, (z + 300) * 0.045, 5), 1.5) * 16 * flat +
    0.3;
  for (const p of PEAKS) {
    h += p.h * Math.exp(-((x - p.x) ** 2 + (z - p.z) ** 2) / p.s);
  }
  return h;
}

interface Built {
  objects: THREE.Object3D[];
  curve: THREE.CatmullRomCurve3 | null;
  tg: THREE.TubeGeometry | null;
  total: number;
  /** Arc-length position of each named stop the dot passes. */
  marks: { u: number; key: string; base: THREE.Vector3 }[];
}

export function createRouteMap(
  host: HTMLElement,
  initial: RouteMapOptions
): RouteMapHandle {
  const reduce = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y";
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(34, 1, 1, 1600);
  scene.add(new THREE.HemisphereLight("#fffaf0", "#b9ad96", 1.25));
  const sun = new THREE.DirectionalLight("#ffe3b0", 2.1);
  sun.position.set(-70, 90, 40);
  scene.add(sun);

  // Terrain with the same contour-line shader as the day-trip map.
  const SX = 220,
    SZ = 200;
  const geo = new THREE.PlaneGeometry(TW, TD, SX, SZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate(TCX, 0, TCZ);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const ix = i % (SX + 1),
      iy = Math.floor(i / (SX + 1));
    const edge = ix === 0 || ix === SX || iy === 0 || iy === SZ;
    pos.setY(i, edge ? -3 : HM(pos.getX(i), pos.getZ(i)));
  }
  geo.computeVertexNormals();
  const reliefMat = new THREE.ShaderMaterial({
    uniforms: {
      uLight: { value: new THREE.Vector3(-0.6, 0.9, 0.35) },
      uStep: { value: 0.9 },
      uTime: { value: 0 },
      uC: { value: new THREE.Vector2(TCX, TCZ) },
      uR: { value: new THREE.Vector2(TW * 0.47, TD * 0.47) },
    },
    vertexShader:
      "varying vec3 vN; varying float vH; varying vec2 vXZ; void main(){ vN = normalize(mat3(modelMatrix) * normal); vH = position.y; vXZ = (modelMatrix * vec4(position,1.0)).xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: [
      "uniform vec3 uLight; uniform float uStep; uniform float uTime; uniform vec2 uC; uniform vec2 uR; varying vec3 vN; varying float vH; varying vec2 vXZ;",
      "float iso(float v){ float f = abs(fract(v - 0.5) - 0.5) / max(fwidth(v), 1e-4); return 1.0 - min(f, 1.0); }",
      "void main(){",
      "  vec3 n = normalize(vN); float l = clamp(dot(n, normalize(uLight)), 0.0, 1.0);",
      "  float t = clamp(vH / 16.0, 0.0, 1.0);",
      "  vec3 col = mix(vec3(0.045,0.045,0.042), vec3(0.20,0.185,0.16), pow(l, 1.3));",
      "  col = mix(col, col * 1.35 + vec3(0.03,0.022,0.0), t);",
      "  vec3 gold = vec3(0.83,0.686,0.216);",
      "  float minor = iso(vH / uStep) * smoothstep(0.35, 0.9, vH);",
      "  float major = iso(vH / (uStep * 5.0)) * smoothstep(0.35, 0.9, vH);",
      "  col = mix(col, gold * 0.5, minor * 0.45);",
      "  col = mix(col, gold, major * 0.85);",
      "  float sw = fract((vXZ.x * 0.7 + vXZ.y * 0.3) / 170.0 - uTime * 0.07);",
      "  float band = smoothstep(0.0, 0.06, sw) * (1.0 - smoothstep(0.06, 0.16, sw));",
      "  col += gold * band * (minor * 0.9 + major * 1.2 + 0.05);",
      "  float d = length((vXZ - uC) / uR);",
      "  col = mix(col, vec3(0.075,0.072,0.065), smoothstep(0.7, 1.0, d));",
      "  if (vH < -0.5) col = vec3(0.075,0.072,0.065);",
      "  gl_FragColor = vec4(col, 1.0);",
      "}",
    ].join("\n"),
  });
  scene.add(new THREE.Mesh(geo, reliefMat));

  // Ping river through Chiang Mai (rebuilt per update at the marker scale).
  const riverCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 26 }, (_, i) => {
      const z = 16 - i * 2,
        x = PING_X(z);
      return new THREE.Vector3(x, HM(x, z) + 0.25, z);
    })
  );

  const additive = {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  } as const;

  // City glow at Chiang Mai, the start and finish of every loop.
  const gc = document.createElement("canvas");
  gc.width = gc.height = 128;
  const gg = gc.getContext("2d");
  if (gg) {
    const grd = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,220,140,0.9)");
    grd.addColorStop(0.35, "rgba(212,175,55,0.35)");
    grd.addColorStop(1, "rgba(212,175,55,0)");
    gg.fillStyle = grd;
    gg.fillRect(0, 0, 128, 128);
  }
  const glowMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(gc),
    ...additive,
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), glowMat);
  glow.rotation.x = -Math.PI / 2;
  const cmp = toXZ(18.788, 98.985);
  glow.position.set(cmp.x, HM(cmp.x, cmp.z) + 0.3, cmp.z);
  scene.add(glow);

  const stemMat = new THREE.MeshBasicMaterial({ color: "#8a7430" });
  const pinGeo = new THREE.CylinderGeometry(0.12, 0.12, 5, 8);
  const headGeo = new THREE.SphereGeometry(1.05, 24, 16);
  const cmHeadGeo = new THREE.OctahedronGeometry(1.3);
  const headMat = new THREE.MeshBasicMaterial({ color: "#8a7430" });
  const cmMat = new THREE.MeshBasicMaterial({ color: "#fdfbf7" });

  // Travelling dot with halo, trail, rings and a beam on the next stop.
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 20, 14),
    new THREE.MeshBasicMaterial({ color: "#fff6dc" })
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 20, 14),
    new THREE.MeshBasicMaterial({
      color: "#d4af37",
      opacity: 0.35,
      ...additive,
    })
  );
  const TRAIL = 24;
  let trailPts: THREE.Vector3[] = [];
  const tpg = new THREE.BufferGeometry();
  tpg.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(new Float32Array(TRAIL * 3), 3)
  );
  const trailLine = new THREE.Points(
    tpg,
    new THREE.PointsMaterial({
      color: "#f2d060",
      size: 1.1,
      opacity: 0.6,
      ...additive,
    })
  );
  const rings = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.1, 48),
      new THREE.MeshBasicMaterial({
        color: "#d4af37",
        side: THREE.DoubleSide,
        opacity: 0,
        ...additive,
      })
    );
    m.rotation.x = -Math.PI / 2;
    return m;
  });
  const bg2 = new THREE.CylinderGeometry(0.9, 0.9, 38, 24, 1, true);
  bg2.translate(0, 19, 0);
  const bc: number[] = [];
  const bp = bg2.attributes.position;
  for (let i = 0; i < bp.count; i++) {
    const f = 1 - bp.getY(i) / 38;
    bc.push(f, f * 0.8, f * 0.3);
  }
  bg2.setAttribute("color", new THREE.Float32BufferAttribute(bc, 3));
  const beamMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    opacity: 0.55,
    ...additive,
  });
  const beam = new THREE.Mesh(bg2, beamMat);
  scene.add(dot, halo, trailLine, beam, ...rings);

  // Fireflies over the whole terrain.
  const NP = 560,
    pp = new Float32Array(NP * 3),
    pSeed: number[] = [];
  for (let i = 0; i < NP; i++) {
    const x = NW.x + 4 + rnd() * (TW - 8),
      z = NW.z + 4 + rnd() * (TD - 8);
    pp[i * 3] = x;
    pp[i * 3 + 1] = HM(x, z) + 1 + rnd() * 9;
    pp[i * 3 + 2] = z;
    pSeed.push(rnd() * 6.28, pp[i * 3 + 1]);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  const dustMat = new THREE.PointsMaterial({
    color: "#e8c55a",
    size: 0.45,
    opacity: 0.75,
    ...additive,
  });
  const dust = new THREE.Points(pg, dustMat);
  scene.add(dust);

  // Labels are decorative (the stops are listed in the itinerary text).
  const lab = document.createElement("div");
  lab.setAttribute("aria-hidden", "true");
  lab.style.cssText =
    "position:absolute;inset:0;pointer-events:none;overflow:hidden";
  host.appendChild(lab);
  let labelTops: { el: HTMLSpanElement; top: THREE.Vector3 }[] = [];
  const labels = new Map<string, { el: HTMLSpanElement; city: boolean }>();

  let built: Built = {
    objects: [],
    curve: null,
    tg: null,
    total: 0,
    marks: [],
  };

  function clearRoute() {
    // Pins share geometry and materials; only the route mesh owns its own.
    built.objects.forEach(o => {
      scene.remove(o);
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    lab.replaceChildren();
    labelTops = [];
  }

  function styleLabel(
    el: HTMLSpanElement,
    he: boolean,
    hot: boolean,
    city: boolean
  ) {
    el.style.cssText =
      "position:absolute;left:0;top:0;transform:translate(-50%,-100%);white-space:nowrap;border-radius:3px;padding:6px 10px;font-weight:600;border:1px solid rgba(212,175,55,0.45);box-shadow:0 8px 24px rgba(0,0,0,0.45);transition:background 300ms,color 300ms";
    el.style.fontFamily = he
      ? "Heebo, sans-serif"
      : "'Source Sans 3', sans-serif";
    el.style.textTransform = he ? "none" : "uppercase";
    el.style.letterSpacing = he ? "0.02em" : "0.14em";
    el.style.fontSize = he ? "13px" : "11px";
    paintLabel(el, hot, city);
  }
  function paintLabel(el: HTMLSpanElement, hot: boolean, city: boolean) {
    el.style.background = city
      ? "#fbf8f1"
      : hot
        ? "#d4af37"
        : "rgba(17,17,16,0.8)";
    el.style.color = city || hot ? "#1c1c1c" : "#fbf8f1";
  }

  function addPin(p: { x: number; z: number }, city: boolean) {
    const y = HM(p.x, p.z);
    const pin = new THREE.Group();
    const stem = new THREE.Mesh(pinGeo, stemMat);
    stem.position.y = 2.5;
    const head = new THREE.Mesh(
      city ? cmHeadGeo : headGeo,
      city ? cmMat : headMat
    );
    head.position.y = 5.6;
    pin.add(stem, head);
    pin.position.set(p.x, y, p.z);
    pin.scale.setScalar(K);
    scene.add(pin);
    built.objects.push(pin);
    return y;
  }

  // Camera framing.
  const target = new THREE.Vector3(TCX, 0, TCZ);
  const tgt = target.clone();
  let dist = 190,
    distT = 190,
    ut = 0,
    phi = 0.82;
  const theta = 0.25;
  let drawT = 1,
    lapU = 0,
    hotIdx = -1;
  /** Marker scale: pins, line and dot shrink when framing a short loop. */
  let K = 1;
  const v = new THREE.Vector3();

  function tube(
    curve: THREE.CatmullRomCurve3,
    n: number,
    r: number,
    color: string,
    opacity: number
  ) {
    const tg = new THREE.TubeGeometry(curve, n, r, 6);
    const mesh = new THREE.Mesh(
      tg,
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
    );
    scene.add(mesh);
    built.objects.push(mesh);
    return tg;
  }

  function update(opts: RouteMapOptions) {
    clearRoute();
    built = { objects: [], curve: null, tg: null, total: 0, marks: [] };
    const he = opts.lang === "he";
    const xz = opts.stops.map(s => toXZ(s.lat, s.lon));
    const focus = opts.loop && opts.focus ? opts.focus : null;
    const inFocus = (i: number) => !focus || (i >= focus[0] && i <= focus[1]);

    // Frame the focused stage, or every stop.
    const framed = xz.filter((_, i) => inFocus(i));
    const xs = framed.map(p => p.x),
      zs = framed.map(p => p.z);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs),
      minZ = Math.min(...zs),
      maxZ = Math.max(...zs);
    const span = Math.max(maxX - minX, maxZ - minZ, 8);
    K = clamp(span / 110, 0.4, 1);
    tgt.set((minX + maxX) / 2, 0, (minZ + maxZ) / 2 - 3);
    distT = Math.max(span * 1.5 + 45 * K, 52);
    glow.scale.setScalar(K);
    [dot, beam].forEach(o => o.scale.setScalar(K));

    tube(riverCurve, 160, 0.28 * K, "#7fb0c2", 0.55);

    // Road-like line through the stops, sampled every ~0.4 units.
    const pts: THREE.Vector3[] = [];
    const stopIdx: number[] = [];
    if (opts.loop && xz.length > 1) {
      xz.forEach((a, i) => {
        stopIdx.push(pts.length);
        const b = xz[i + 1];
        if (!b) {
          pts.push(new THREE.Vector3(a.x, HM(a.x, a.z) + 0.5, a.z));
          return;
        }
        const dx = b.x - a.x,
          dz = b.z - a.z,
          len = Math.hypot(dx, dz) || 1,
          nx = -dz / len,
          nz = dx / len,
          N = Math.max(4, Math.ceil(len / 0.4));
        for (let j = 0; j < N; j++) {
          const t = j / N,
            w =
              Math.sin(t * Math.PI * (2 + (i % 3)) + i) *
              Math.sin(t * Math.PI) *
              Math.min(len * 0.06, 2.2);
          const x = a.x + dx * t + nx * w,
            z = a.z + dz * t + nz * w;
          pts.push(new THREE.Vector3(x, HM(x, z) + 0.5, z));
        }
      });
      const full = tube(
        new THREE.CatmullRomCurve3(pts),
        pts.length * 2,
        0.34 * K,
        focus ? "#d4af37" : "#f2d060",
        focus ? 0.3 : 0.95
      );
      // The focused stage gets its own bright line that the dot drives.
      const from = focus ? stopIdx[focus[0]] : 0;
      const seg = focus ? pts.slice(from, stopIdx[focus[1]] + 1) : pts;
      const curve = new THREE.CatmullRomCurve3(seg);
      const tg = focus
        ? tube(curve, seg.length * 2, 0.4 * K, "#f2d060", 1)
        : full;
      built.curve = curve;
      built.tg = tg;
      built.total = tg.index ? tg.index.count : 0;

      // Arc-length position of every stop on the driven curve.
      const cum = [0];
      for (let i = 1; i < seg.length; i++)
        cum.push(cum[i - 1] + seg[i].distanceTo(seg[i - 1]));
      const total = cum[cum.length - 1] || 1;
      const uOf = (i: number) => cum[stopIdx[i] - from] / total;

      opts.stops.forEach((s, i) => {
        if (!s.name || !inFocus(i)) return;
        if (focus ? i === focus[0] : i === 0) return;
        built.marks.push({
          u: uOf(i),
          key: s.name[0],
          base: new THREE.Vector3(
            xz[i].x,
            HM(xz[i].x, xz[i].z) + 0.15,
            xz[i].z
          ),
        });
      });
    }

    // One pin and label per named place (loops revisit some of them).
    labels.clear();
    opts.stops.forEach((s, i) => {
      if (!s.name || labels.has(s.name[0])) return;
      const p = xz[i];
      const city = s.name[0] === "Chiang Mai";
      const y = addPin(p, city);
      const el = document.createElement("span");
      el.textContent = s.name[he ? 1 : 0];
      styleLabel(el, he, false, city);
      el.style.opacity = "0";
      lab.appendChild(el);
      labels.set(s.name[0], { el, city });
      labelTops.push({ el, top: new THREE.Vector3(p.x, y + 7.4 * K, p.z) });
    });

    drawT = reduce ? 1 : 0;
    lapU = 0;
    hotIdx = -1;
    trailPts = [];
  }

  // Drag to orbit.
  let dragged = false;
  let down = false,
    lx = 0,
    ly = 0;
  const pd = (e: PointerEvent) => {
    down = true;
    lx = e.clientX;
    ly = e.clientY;
    host.style.cursor = "grabbing";
  };
  const pm = (e: PointerEvent) => {
    if (!down) return;
    dragged = true;
    ut -= (e.clientX - lx) * 0.005;
    phi = clamp(phi - (e.clientY - ly) * 0.004, 0.45, 1.25);
    lx = e.clientX;
    ly = e.clientY;
  };
  const pu = () => {
    down = false;
    host.style.cursor = "grab";
  };
  host.style.cursor = "grab";
  host.addEventListener("pointerdown", pd);
  window.addEventListener("pointermove", pm);
  window.addEventListener("pointerup", pu);
  window.addEventListener("pointercancel", pu);

  let W = 1,
    H = 1;
  const resize = () => {
    W = host.clientWidth || 1;
    H = host.clientHeight || 1;
    renderer.setSize(W, H, false);
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
    // Portrait boxes: look more straight down so the loop fills the height.
    if (!dragged) phi = cam.aspect < 1 ? 0.55 : 0.82;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  let visible = true;
  const io = new IntersectionObserver(es => {
    visible = es[0]?.isIntersecting ?? true;
  });
  io.observe(host);

  // One lap of the loop takes about 16 seconds after the line draws in.
  const LAP = 16,
    DRAW = 2.4;

  function tick(t: number, dt: number) {
    target.lerp(tgt, 0.05);
    dist += (distT - dist) * 0.05;
    const th = theta + ut + (reduce ? 0 : Math.sin(t * 0.12) * 0.22);
    const d = dist / Math.min(1, (cam.aspect || 1) / 1.25);
    cam.position.set(
      target.x + d * Math.sin(phi) * Math.sin(th),
      d * Math.cos(phi),
      target.z + d * Math.sin(phi) * Math.cos(th)
    );
    cam.lookAt(target);
    reliefMat.uniforms.uTime.value = reduce ? 0 : t;

    const { curve, tg, total, marks } = built;
    drawT = clamp(drawT + dt / DRAW, 0, 1);
    const de = 1 - Math.pow(1 - drawT, 3);
    if (tg) tg.setDrawRange(0, Math.max(6, Math.floor((total * de) / 6) * 6));

    const on = !!curve;
    dot.visible = halo.visible = trailLine.visible = beam.visible = on;
    rings.forEach(r => (r.visible = on));
    if (curve) {
      if (drawT < 1) lapU = de * 0.999;
      else if (!reduce) lapU = (lapU + dt / LAP) % 1;
      curve.getPointAt(clamp(lapU, 0, 0.999), v);
      dot.position.copy(v);
      dot.position.y += 0.6 * K;
      halo.position.copy(dot.position);
      halo.scale.setScalar(K * (1 + Math.sin(t * 6) * 0.12));
      trailPts.unshift(dot.position.clone());
      if (trailPts.length > TRAIL) trailPts.length = TRAIL;
      const ta = trailLine.geometry.attributes.position;
      for (let i = 0; i < TRAIL; i++) {
        const q = trailPts[Math.min(i, trailPts.length - 1)];
        ta.setXYZ(i, q.x, q.y, q.z);
      }
      ta.needsUpdate = true;

      // Highlight the next stop the rider is heading to.
      let next = marks.findIndex(m => m.u > lapU + 0.002);
      if (next < 0) next = marks.length ? 0 : -1;
      if (next !== hotIdx) {
        const paint = (i: number, hot: boolean) => {
          const l = marks[i] && labels.get(marks[i].key);
          if (l) paintLabel(l.el, hot, l.city);
        };
        if (hotIdx >= 0) paint(hotIdx, false);
        if (next >= 0) paint(next, true);
        hotIdx = next;
      }
      const hot = marks[hotIdx];
      beam.visible = !!hot;
      rings.forEach(r => (r.visible = !!hot));
      if (hot) {
        rings.forEach((r, i) => {
          const ph = (t * 0.6 + i / 3) % 1;
          r.position.copy(hot.base);
          r.scale.setScalar(K * (1 + ph * 3.5));
          (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.8;
        });
        beam.position.copy(hot.base);
        beamMat.opacity = 0.35 + Math.sin(t * 2.2) * 0.12;
      }
    }

    glowMat.opacity = reduce ? 1 : 0.75 + Math.sin(t * 1.6) * 0.25;
    if (!reduce) {
      const dp = dust.geometry.attributes.position;
      for (let i = 0; i < dp.count; i++) {
        dp.setY(i, pSeed[i * 2 + 1] + Math.sin(t * 0.8 + pSeed[i * 2]) * 1.2);
      }
      dp.needsUpdate = true;
      dustMat.opacity = 0.5 + Math.sin(t * 1.3) * 0.25;
    }

    // Project labels, keep them inside the frame and stop them overlapping.
    const placed: {
      el: HTMLSpanElement;
      x: number;
      y: number;
      w: number;
      h: number;
    }[] = [];
    labelTops.forEach(({ el, top }) => {
      v.copy(top).project(cam);
      const bw = el.offsetWidth / 2 + 6;
      const x = clamp(((v.x + 1) / 2) * W, bw, W - bw);
      const y = ((1 - v.y) / 2) * H;
      el.style.left = x.toFixed(1) + "px";
      el.style.top = y.toFixed(1) + "px";
      el.style.opacity = v.z < 1 ? "1" : "0";
      placed.push({ el, x, y, w: el.offsetWidth, h: el.offsetHeight });
    });
    placed.sort((a, c) => c.y - a.y);
    for (let i = 0; i < placed.length; i++)
      for (let j = 0; j < i; j++) {
        const a = placed[i],
          c = placed[j];
        if (
          Math.abs(a.x - c.x) < (a.w + c.w) / 2 + 4 &&
          Math.abs(a.y - c.y) < a.h + 3
        ) {
          a.y = c.y - a.h - 4;
          a.el.style.top = a.y.toFixed(1) + "px";
        }
      }
  }

  update(initial);
  let raf = 0,
    last = performance.now();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    if (!visible) return;
    tick(now / 1000, dt);
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame);

  return {
    update,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointermove", pm);
      window.removeEventListener("pointerup", pu);
      window.removeEventListener("pointercancel", pu);
      clearRoute();
      scene.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as
          | THREE.Material
          | THREE.Material[]
          | undefined;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat?.dispose?.();
      });
      [pinGeo, headGeo, cmHeadGeo, headMat, cmMat, stemMat].forEach(r =>
        r.dispose()
      );
      renderer.dispose();
      renderer.domElement.remove();
      lab.remove();
    },
  };
}
