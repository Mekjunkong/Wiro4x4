/**
 * WIRO relief map — a three.js terrain of the Chiang Mai region with gold
 * route lines from the city to each trail. Ported from the Claude Design
 * prototype (`wiro3d.js`, <wiro-map>) to a plain module so React can own its
 * lifecycle. Loaded lazily by `WiroMap.tsx`, so three.js stays out of the
 * main bundle.
 */
import * as THREE from "three";
import type { MapPlaceKey } from "@/data/wiroTours";
import { clamp, fbm, sstep } from "@/lib/wiroNoise";

type Key = MapPlaceKey | "cm";

const PL: Record<Key, [number, number]> = {
  cm: [18.788, 98.985],
  inthanon: [18.588, 98.487],
  sticky: [19.069, 99.08],
  kampong: [18.865, 99.35],
  phachor: [18.43, 98.62],
  elephant: [18.63, 98.72],
  suthep: [18.805, 98.921],
  samoeng: [18.85, 98.73],
};

const NAMES: Record<Key, [string, string]> = {
  cm: ["Chiang Mai", "צ'יאנג מאי"],
  inthanon: ["Doi Inthanon", "דוי אינתנון"],
  sticky: ["Sticky Waterfalls", "המפלים הדביקים"],
  kampong: ["Mae Kampong", "מאה קמפונג"],
  phachor: ["Pha Chor Canyon", "קניון פה צ'ור"],
  elephant: ["Elephant Sanctuary", "מקלט הפילים"],
  suthep: ["Doi Suthep", "דוי סוטפ"],
  samoeng: ["Samoeng Loop", "לולאת סמואנג"],
};

const ROUTE_KEYS = Object.keys(PL).filter(k => k !== "cm") as MapPlaceKey[];

const P2 = (k: Key) => ({
  x: (PL[k][1] - 98.985) * 105.5,
  z: -(PL[k][0] - 18.788) * 111,
});
const VX = (z: number) => 2 + z * 0.12;
function HM(x: number, z: number) {
  const d = Math.abs(x - VX(z));
  let h =
    Math.pow(fbm((x + 300) * 0.045, (z + 300) * 0.045, 5), 1.5) *
      16 *
      sstep(4, 22, d) +
    0.3;
  h += 12 * Math.exp(-((x + 52.5) ** 2 + (z - 22.2) ** 2) / 160);
  h += 5 * Math.exp(-((x + 6.8) ** 2 + (z + 1.9) ** 2) / 30);
  return h;
}

export interface ReliefMapOptions {
  only: readonly MapPlaceKey[];
  active: MapPlaceKey | null;
  lang: "en" | "he";
}

export interface ReliefMapHandle {
  update(opts: ReliefMapOptions): void;
  dispose(): void;
}

interface RouteItem {
  route: THREE.Mesh;
  rm: THREE.MeshBasicMaterial;
  pin: THREE.Group;
  hm: THREE.MeshBasicMaterial;
  curve: THREE.CatmullRomCurve3;
  tg: THREE.TubeGeometry;
  total: number;
  top: THREE.Vector3;
  p: { x: number; z: number };
  base: THREE.Vector3;
}

const CX = -7.5,
  CZ = 2.5;

export function createReliefMap(
  host: HTMLElement,
  initial: ReliefMapOptions,
  onPick: (key: MapPlaceKey) => void
): ReliefMapHandle {
  const reduce = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  let seed = 7;
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
  const cam = new THREE.PerspectiveCamera(34, 1, 1, 1200);
  scene.add(new THREE.HemisphereLight("#fffaf0", "#b9ad96", 1.25));
  const sun = new THREE.DirectionalLight("#ffe3b0", 2.1);
  sun.position.set(-70, 90, 40);
  scene.add(sun);

  // Terrain with a contour-line shader.
  const SX = 210,
    SZ = 165;
  const geo = new THREE.PlaneGeometry(140, 110, SX, SZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate(CX, 0, CZ);
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
    },
    vertexShader:
      "varying vec3 vN; varying float vH; varying vec2 vXZ; void main(){ vN = normalize(mat3(modelMatrix) * normal); vH = position.y; vXZ = (modelMatrix * vec4(position,1.0)).xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: [
      "uniform vec3 uLight; uniform float uStep; uniform float uTime; varying vec3 vN; varying float vH; varying vec2 vXZ;",
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
      "  vec2 q = (vXZ - vec2(-7.5, 2.5)) / vec2(66.0, 50.0); float d = length(q);",
      "  col = mix(col, vec3(0.075,0.072,0.065), smoothstep(0.62, 0.98, d));",
      "  if (vH < -0.5) col = vec3(0.075,0.072,0.065);",
      "  gl_FragColor = vec4(col, 1.0);",
      "}",
    ].join("\n"),
  });
  scene.add(new THREE.Mesh(geo, reliefMat));

  // Ping river.
  const rp: THREE.Vector3[] = [];
  for (let z = -48; z <= 54; z += 3) {
    const x = VX(z) + Math.sin(z * 0.18) * 1.6;
    rp.push(new THREE.Vector3(x, HM(x, z) + 0.25, z));
  }
  scene.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp), 200, 0.28, 5),
      new THREE.MeshBasicMaterial({
        color: "#7fb0c2",
        transparent: true,
        opacity: 0.55,
      })
    )
  );

  const additive = {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  } as const;

  // City glow.
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
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), glowMat);
  glow.rotation.x = -Math.PI / 2;
  const cmp = P2("cm");
  const cmy = HM(cmp.x, cmp.z);
  glow.position.set(cmp.x, cmy + 0.3, cmp.z);
  scene.add(glow);

  const stemMat = new THREE.MeshBasicMaterial({ color: "#8a7430" });
  const cmPin = new THREE.Group();
  const st = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 5, 8),
    stemMat
  );
  st.position.y = 2.5;
  cmPin.add(st);
  const dia = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.3),
    new THREE.MeshBasicMaterial({ color: "#fdfbf7" })
  );
  dia.position.y = 5.6;
  cmPin.add(dia);
  cmPin.position.set(cmp.x, cmy, cmp.z);
  scene.add(cmPin);
  const cmTop = new THREE.Vector3(cmp.x, cmy + 7.4, cmp.z);

  const items = {} as Record<MapPlaceKey, RouteItem>;
  ROUTE_KEYS.forEach((k, idx) => {
    const p = P2(k),
      N = 70,
      pts: THREE.Vector3[] = [];
    const dx = p.x - cmp.x,
      dz = p.z - cmp.z,
      len = Math.hypot(dx, dz),
      nx = -dz / len,
      nz = dx / len;
    for (let i = 0; i <= N; i++) {
      const t = i / N,
        w =
          Math.sin(t * Math.PI * (3 + (idx % 3)) + idx) *
          Math.sin(t * Math.PI) *
          len *
          0.05;
      const x = cmp.x + dx * t + nx * w,
        z = cmp.z + dz * t + nz * w;
      pts.push(new THREE.Vector3(x, HM(x, z) + 0.5, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const rm = new THREE.MeshBasicMaterial({
      color: "#d4af37",
      transparent: true,
    });
    const tg = new THREE.TubeGeometry(curve, 160, 0.34, 6);
    const route = new THREE.Mesh(tg, rm);
    const y = HM(p.x, p.z),
      pin = new THREE.Group();
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 5, 8),
      stemMat
    );
    stick.position.y = 2.5;
    pin.add(stick);
    const hm = new THREE.MeshBasicMaterial({ color: "#8a7430" });
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.05, 24, 16), hm);
    head.position.y = 5.6;
    pin.add(head);
    pin.position.set(p.x, y, p.z);
    scene.add(route, pin);
    items[k] = {
      route,
      rm,
      pin,
      hm,
      curve,
      tg,
      total: tg.index ? tg.index.count : 0,
      top: new THREE.Vector3(p.x, y + 7.4, p.z),
      p,
      base: new THREE.Vector3(p.x, y + 0.15, p.z),
    };
  });

  // The "truck" dot that drives the active route, with halo, trail, rings and beam.
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 20, 14),
    new THREE.MeshBasicMaterial({ color: "#fff6dc" })
  );
  scene.add(dot);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 20, 14),
    new THREE.MeshBasicMaterial({
      color: "#d4af37",
      opacity: 0.35,
      ...additive,
    })
  );
  scene.add(halo);
  let trailPts: THREE.Vector3[] = [];
  const tpg = new THREE.BufferGeometry();
  tpg.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(new Float32Array(24 * 3), 3)
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
  scene.add(trailLine);
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
    scene.add(m);
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
  scene.add(beam);

  // Fireflies.
  const NP = 420,
    pp = new Float32Array(NP * 3),
    pSeed: number[] = [];
  for (let i = 0; i < NP; i++) {
    const x = -75 + rnd() * 135,
      z = -50 + rnd() * 105;
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

  // HTML labels (real buttons, so they are keyboard reachable).
  const lab = document.createElement("div");
  lab.style.cssText =
    "position:absolute;inset:0;pointer-events:none;overflow:hidden";
  host.appendChild(lab);
  const labels = {} as Record<Key, HTMLButtonElement>;
  (["cm", ...ROUTE_KEYS] as Key[]).forEach(k => {
    const b = document.createElement("button");
    b.type = "button";
    b.style.cssText =
      "position:absolute;left:0;top:0;transform:translate(-50%,-100%);pointer-events:auto;cursor:pointer;white-space:nowrap;border-radius:3px;padding:6px 10px;min-height:28px;font-weight:600;border:1px solid rgba(212,175,55,0.45);background:rgba(17,17,16,0.8);color:#fbf8f1;box-shadow:0 8px 24px rgba(0,0,0,0.45);transition:background 200ms,color 200ms";
    if (k === "cm") {
      b.style.background = "#fbf8f1";
      b.style.color = "#1c1c1c";
      b.style.cursor = "default";
      b.tabIndex = -1;
    } else {
      b.addEventListener("click", () => onPick(k));
    }
    lab.appendChild(b);
    labels[k] = b;
  });

  const target = new THREE.Vector3(CX, 0, CZ);
  const tgt = target.clone();
  let dist = 170,
    distT = 170,
    ut = 0,
    phi = 0.82;
  const theta = 0.25;
  let act: MapPlaceKey | null = null,
    lastAct: MapPlaceKey | null = null,
    drawT = 1,
    dotT0 = 0;
  const v = new THREE.Vector3();

  // Drag to orbit.
  let down = false,
    lx = 0,
    ly = 0;
  const pd = (e: PointerEvent) => {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    down = true;
    lx = e.clientX;
    ly = e.clientY;
    host.style.cursor = "grabbing";
  };
  const pm = (e: PointerEvent) => {
    if (!down) return;
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

  function update(opts: ReliefMapOptions) {
    const only = opts.only.length ? opts.only : ROUTE_KEYS;
    const he = opts.lang === "he";
    (Object.entries(items) as [MapPlaceKey, RouteItem][]).forEach(([k, it]) => {
      const on = only.includes(k),
        a = k === opts.active;
      it.route.visible = it.pin.visible = on;
      it.rm.opacity = a ? 1 : 0.38;
      it.rm.color.set(a ? "#f2d060" : "#d4af37");
      it.hm.color.set(a ? "#f2d060" : "#8a7430");
      const b = labels[k];
      b.style.display = on ? "block" : "none";
      b.style.background = a ? "#d4af37" : "rgba(17,17,16,0.8)";
      b.style.color = a ? "#1c1c1c" : "#fbf8f1";
      b.setAttribute("aria-pressed", String(a));
    });
    (Object.entries(labels) as [Key, HTMLButtonElement][]).forEach(([k, b]) => {
      b.textContent = NAMES[k][he ? 1 : 0];
      b.style.fontFamily = he
        ? "Heebo, sans-serif"
        : "'Source Sans 3', sans-serif";
      b.style.textTransform = he ? "none" : "uppercase";
      b.style.letterSpacing = he ? "0.02em" : "0.14em";
      b.style.fontSize = he ? "13px" : "11px";
    });
    const cm = P2("cm");
    const focus =
      opts.active && only.includes(opts.active) ? items[opts.active] : null;
    if (focus && only.length > 2) {
      tgt.set(
        (focus.p.x + cm.x) * 0.3 + CX * 0.4,
        0,
        (focus.p.z + cm.z) * 0.3 + CZ * 0.4
      );
      distT = 128;
    } else if (only.length <= 2) {
      const xs = only.map(k => items[k].p.x).concat(cm.x),
        zs = only.map(k => items[k].p.z).concat(cm.z);
      tgt.set(
        (Math.min(...xs) + Math.max(...xs)) / 2,
        0,
        (Math.min(...zs) + Math.max(...zs)) / 2
      );
      distT =
        70 +
        Math.max(
          Math.max(...xs) - Math.min(...xs),
          Math.max(...zs) - Math.min(...zs)
        ) *
          1.4;
    } else {
      tgt.set(CX, 0, CZ);
      distT = 140;
    }
    act = focus ? (opts.active as MapPlaceKey) : (only[0] ?? null);
    if (act !== lastAct) {
      lastAct = act;
      drawT = 0;
      trailPts = [];
    }
  }

  let W = 1,
    H = 1;
  const resize = () => {
    W = host.clientWidth || 1;
    H = host.clientHeight || 1;
    renderer.setSize(W, H, false);
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  let visible = true;
  const io = new IntersectionObserver(es => {
    visible = es[0]?.isIntersecting ?? true;
  });
  io.observe(host);

  function tick(t: number, dt: number) {
    target.lerp(tgt, 0.05);
    dist += (distT - dist) * 0.05;
    const th = theta + ut + (reduce ? 0 : Math.sin(t * 0.12) * 0.22);
    const d = dist / Math.min(1, (cam.aspect || 1) / 1.5);
    cam.position.set(
      target.x + d * Math.sin(phi) * Math.sin(th),
      d * Math.cos(phi),
      target.z + d * Math.sin(phi) * Math.cos(th)
    );
    cam.lookAt(target);
    const it = act ? items[act] : null;
    reliefMat.uniforms.uTime.value = reduce ? 0 : t;
    drawT = clamp(drawT + dt / 1.4, 0, 1);
    const de = 1 - Math.pow(1 - drawT, 3);
    Object.values(items).forEach(o => {
      const c =
        o !== it ? o.total : Math.max(6, Math.floor((o.total * de) / 6) * 6);
      o.tg.setDrawRange(0, c);
    });
    const on = !!it;
    dot.visible = halo.visible = trailLine.visible = beam.visible = on;
    rings.forEach(r => (r.visible = on));
    if (it) {
      if (drawT < 1) dotT0 = t;
      const u = drawT < 1 ? de * 0.999 : ((t - dotT0) * 0.12) % 1;
      it.curve.getPointAt(clamp(u, 0, 0.999), v);
      dot.position.copy(v);
      dot.position.y += 0.6;
      halo.position.copy(dot.position);
      halo.scale.setScalar(1 + Math.sin(t * 6) * 0.12);
      trailPts.unshift(dot.position.clone());
      if (trailPts.length > 24) trailPts.length = 24;
      const ta = trailLine.geometry.attributes.position;
      for (let i = 0; i < 24; i++) {
        const q = trailPts[Math.min(i, trailPts.length - 1)];
        ta.setXYZ(i, q.x, q.y, q.z);
      }
      ta.needsUpdate = true;
      rings.forEach((r, i) => {
        const ph = (t * 0.6 + i / 3) % 1;
        r.position.copy(it.base);
        r.scale.setScalar(1 + ph * 3.5);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.8;
      });
      beam.position.copy(it.base);
      beamMat.opacity = 0.35 + Math.sin(t * 2.2) * 0.12;
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
      b: HTMLButtonElement;
      x: number;
      y: number;
      w: number;
      h: number;
    }[] = [];
    (Object.entries(labels) as [Key, HTMLButtonElement][]).forEach(([k, b]) => {
      if (b.style.display === "none") return;
      v.copy(k === "cm" ? cmTop : items[k].top).project(cam);
      const bw = b.offsetWidth / 2 + 6;
      const x = clamp(((v.x + 1) / 2) * W, bw, W - bw);
      const y = ((1 - v.y) / 2) * H;
      b.style.left = x.toFixed(1) + "px";
      b.style.top = y.toFixed(1) + "px";
      b.style.opacity = v.z < 1 ? "1" : "0";
      placed.push({ b, x, y, w: b.offsetWidth, h: b.offsetHeight });
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
          a.b.style.top = a.y.toFixed(1) + "px";
        }
      }
  }

  update(initial);
  let raf = 0,
    last = performance.now();
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    if (!visible) return;
    tick(now / 1000, dt);
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(loop);

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
      renderer.dispose();
      renderer.domElement.remove();
      lab.remove();
    },
  };
}
