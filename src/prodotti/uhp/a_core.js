import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ───────── base: utilità, renderer, scena ─────────
const $ = id => document.getElementById(id);
const PI = Math.PI, rad = d => d * PI / 180;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eoc = t => 1 - Math.pow(1 - t, 3), eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eob = t => { const c = 1.25; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const eoe = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

try { await Promise.race([Promise.all([document.fonts.load('800 60px Barlow'), document.fonts.load('700 60px "Barlow Condensed"')]), new Promise(r => setTimeout(r, 1200))]); } catch (e) {}

const canvas = $('gl'), stage = $('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const COARSE = matchMedia('(pointer: coarse)').matches;   // telefono o tablet: tengo più bassa la risoluzione di resa
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
const scene = new THREE.Scene();
const C_STUDIO = new THREE.Color(0x0b0f13), C_COLD = new THREE.Color(0x0b2038);
scene.background = C_STUDIO.clone(); scene.fog = new THREE.Fog(0x0b0f13, 5, 16);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
scene.environmentIntensity = 0.85;
const camera = new THREE.PerspectiveCamera(30, 1, 0.03, 60);
const keyL = new THREE.DirectionalLight(0xffffff, 2.3); keyL.position.set(2.5, 4, 3.5); scene.add(keyL);
const rimL = new THREE.DirectionalLight(0x9fd0ff, 1.5); rimL.position.set(-3, 2.5, -3.5); scene.add(rimL);
scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1c2026, 0.45));

let composer = null, bloom = null, HQ = true;
function mkComposer() {
  const s = renderer.getDrawingBufferSize(new THREE.Vector2());
  composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(s.x, s.y, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(s.x / 2, s.y / 2), 0.5, 0.55, 0.92); composer.addPass(bloom);
  composer.addPass(new OutputPass());
}
function resize() {
  const w = Math.max(2, stage.clientWidth), h = Math.max(2, stage.clientHeight);
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 36 : 30; camera.updateProjectionMatrix();
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
}

// ───────── texture disegnate su canvas ─────────
function cv(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const rep = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };
const T = {};
T.noise = rep(cv(256, 256, (g, w, h) => { const r = rng(3); g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = 100 + r() * 56 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); } }, false), 6, 6);
T.brush = rep(cv(256, 256, (g, w, h) => { const r = rng(5); g.fillStyle = '#d9d9d9'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { const v = 170 + r() * 85 | 0; g.fillStyle = `rgba(${v},${v},${v},.5)`; g.fillRect(0, r() * h, w, .6 + r()); } }), 1, 2);
T.lam = rep(cv(64, 256, (g, w, h) => { for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? '#6d7479' : '#3c4146'; g.fillRect(0, y, w, 4); } }), 1, 3);
T.spangle = rep(cv(256, 256, (g, w, h) => { const r = rng(11); g.fillStyle = '#c4c9cc'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const v = 150 + r() * 90 | 0; g.fillStyle = `rgba(${v},${v + 3},${v + 6},.55)`; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) g.lineTo(x + (r() - .5) * 60, y + (r() - .5) * 60); g.fill(); } }), 2, 2);
T.base = cv(1024, 360, (g, w, h) => { // nervature stampate del fondo, come nel disegno del manuale
  g.fillStyle = '#6a6a6a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8c8c8'; g.lineWidth = 9; g.lineJoin = 'round';
  const rr = (x, y, a, b, r) => { g.beginPath(); g.roundRect(x, y, a, b, r); g.stroke(); };
  rr(40, 30, 620, 46, 20); rr(40, 110, 300, 90, 20); rr(380, 110, 280, 60, 20); rr(380, 200, 280, 46, 20); rr(40, 240, 300, 80, 20); rr(700, 30, 280, 130, 24); rr(700, 190, 280, 130, 24); rr(380, 276, 280, 46, 20);
  g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(275, 285, 15, 0, 7); g.fill();
}, false);
T.side = cv(512, 1024, (g, w, h) => { g.fillStyle = '#707070'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d0d0d0'; g.lineWidth = 12; g.beginPath(); g.roundRect(46, 60, w - 92, h - 150, 40); g.stroke(); g.fillStyle = '#383838'; g.beginPath(); g.roundRect(196, 700, 120, 50, 8); g.fill(); }, false);
T.chev = rep(cv(128, 128, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8d8d8'; g.lineWidth = 7; for (let y = -64; y < h + 64; y += 22) { g.beginPath(); g.moveTo(0, y + 40); g.lineTo(64, y); g.lineTo(128, y + 40); g.stroke(); } }, false), 1, 5);
T.pcb = cv(512, 512, (g, w, h) => {
  const r = rng(21); g.fillStyle = '#17503a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2c8660'; g.lineWidth = 2;
  for (let i = 0; i < 70; i++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (r() < .5) x += (r() - .5) * 150; else y += (r() - .5) * 150; g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 26; i++) { const x = 20 + r() * (w - 90), y = 20 + r() * (h - 70), a = 20 + r() * 60, b = 14 + r() * 36; g.fillStyle = ['#15171a', '#22262b', '#0f1113'][i % 3]; g.fillRect(x, y, a, b); g.fillStyle = '#b9bec2'; for (let k = 0; k < a; k += 7) { g.fillRect(x + k, y - 3, 3, 3); g.fillRect(x + k, y + b, 3, 3); } }
  g.fillStyle = '#d9c36a'; for (let i = 0; i < 120; i++) { g.beginPath(); g.arc(r() * w, r() * h, 2.4, 0, 7); g.fill(); }
  g.fillStyle = '#e9efe9'; g.font = '600 13px sans-serif'; ['CN23', 'CN24', 'CN43', 'XT1', 'SW2', 'RS-485', 'DC FAN', 'EXV', 'IPM'].forEach((s, i) => g.fillText(s, 18 + (i % 3) * 170, 30 + (i / 3 | 0) * 160));
});
T.plate = cv(512, 300, (g, w, h) => { // targhetta: solo dati della scheda UHP 120
  g.fillStyle = '#e9ece9'; g.fillRect(0, 0, w, h); g.fillStyle = '#16191b'; g.font = '800 46px Barlow, Arial, sans-serif'; g.fillText('Unical', 22, 56);
  g.font = '700 30px Barlow, Arial, sans-serif'; g.fillText('UHP 120', 330, 54); g.fillRect(22, 72, w - 44, 3); g.font = '500 23px Barlow, Arial, sans-serif';
  [['Refrigerante', 'R290 · 1,35 kg'], ['Alimentazione', '230 V ~ 50 Hz'], ['Potenza max assorbita', '7 kW'], ['Corrente max', '45,15 A'], ['Acqua', 'max 80 °C · 3 bar'], ['Peso', '154 kg']].forEach((r, i) => { g.fillText(r[0], 22, 108 + i * 32); g.fillText(r[1], 300, 108 + i * 32); });
});
T.flame = cv(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#f2c230'; g.strokeStyle = '#141414'; g.lineWidth = 14; g.lineJoin = 'round'; g.beginPath(); g.moveTo(128, 22); g.lineTo(238, 214); g.lineTo(18, 214); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#141414'; g.beginPath(); g.moveTo(128, 78); g.bezierCurveTo(176, 126, 168, 186, 128, 190); g.bezierCurveTo(84, 186, 84, 140, 108, 118); g.bezierCurveTo(112, 138, 124, 132, 128, 78); g.fill(); g.font = '700 26px Barlow, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('R290', 128, 248); });
T.letter = cv(256, 1100, (g, w, h) => { g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(-PI / 2); g.fillStyle = '#33383d'; g.font = '800 250px Barlow, "Helvetica Neue", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Unical', 0, 14, h - 40); g.restore(); });
T.vessel = cv(256, 256, (g, w, h) => { g.fillStyle = '#c9cdcf'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2f2f2'; g.fillRect(40, 60, 176, 120); g.fillStyle = '#1b1e20'; g.font = '700 44px Barlow, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('5 L', 128, 118); g.font = '500 26px Barlow, Arial, sans-serif'; g.fillText('precarica 1 bar', 128, 158); });
T.io = s => cv(128, 64, (g, w, h) => { g.fillStyle = '#e9ece9'; g.fillRect(0, 0, w, h); g.fillStyle = '#16191b'; g.font = '800 44px Barlow, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(s, 64, 48); });
T.glow = cv(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
T.ground = cv(1024, 1024, (g, w, h) => { g.fillStyle = '#0b0f13'; g.fillRect(0, 0, w, h); const r = g.createRadialGradient(512, 512, 0, 512, 512, 512); r.addColorStop(0, 'rgba(120,140,150,.5)'); r.addColorStop(.35, 'rgba(60,72,80,.25)'); r.addColorStop(1, 'rgba(11,15,19,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(190,210,220,.10)'; g.lineWidth = 1; for (let i = 0; i <= 1024; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
  const k = g.createRadialGradient(512, 512, 380, 512, 512, 512); k.addColorStop(0, 'rgba(11,15,19,0)'); k.addColorStop(1, 'rgba(11,15,19,1)'); g.fillStyle = k; g.fillRect(0, 0, w, h); });
T.shadow = cv(256, 128, (g) => { const r = g.createRadialGradient(128, 64, 0, 128, 64, 128); r.addColorStop(0, 'rgba(0,0,0,.8)'); r.addColorStop(.6, 'rgba(0,0,0,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.setTransform(1, 0, 0, .5, 0, 0); g.fillStyle = r; g.fillRect(0, 0, 256, 256); });

// ───────── materiali ─────────
const LENS = { value: new THREE.Vector3(-9999, -9999, 0) };   // lente a raggi X: x, y, raggio in pixel del buffer
const XRM = [];                                              // materiali dell'involucro, che possono diventare trasparenti
const std = o => new THREE.MeshStandardMaterial(o);
function xr(mat) {
  mat.userData.o = mat.opacity;
  mat.onBeforeCompile = s => { s.uniforms.uLens = LENS; s.fragmentShader = 'uniform vec3 uLens;\n' + s.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n\tif (uLens.z > 0.0 && distance(gl_FragCoord.xy, uLens.xy) < uLens.z) discard;'); };
  XRM.push(mat); return mat;
}
const M = {
  dark: std({ color: 0x2a2d31, roughness: .58, metalness: .25, bumpMap: T.noise, bumpScale: .5 }),
  basePlate: std({ color: 0x2c3034, roughness: .5, metalness: .35, bumpMap: T.base, bumpScale: 4 }),
  galv: std({ color: 0xb4bbc0, roughness: .42, metalness: .85, map: T.spangle }),
  steel: std({ color: 0xc3c9cd, roughness: .3, metalness: 1, map: T.brush }),
  inox: std({ color: 0xd3d8dc, roughness: .24, metalness: 1, bumpMap: T.chev, bumpScale: 2.5 }),
  cast: std({ color: 0x55595d, roughness: .7, metalness: .6, bumpMap: T.noise, bumpScale: 1.2 }),
  lam: std({ color: 0x8b9298, roughness: .45, metalness: .8, map: T.lam }),
  black: std({ color: 0x111316, roughness: .32, metalness: .35 }),
  plastic: std({ color: 0x17191c, roughness: .62, metalness: .05 }),
  blade: std({ color: 0x23272b, roughness: .38, metalness: .1, side: THREE.DoubleSide }),
  rubber: std({ color: 0x0c0c0d, roughness: .95, metalness: 0 }),
  foam: std({ color: 0x18191b, roughness: 1, metalness: 0, bumpMap: T.noise, bumpScale: 2 }),
  copper: std({ color: 0xc9743c, roughness: .28, metalness: 1 }),
  brass: std({ color: 0xc9a245, roughness: .32, metalness: 1 }),
  gold: std({ color: 0xc9a44c, roughness: .42, metalness: .9, emissive: 0x000000 }),
  alu: std({ color: 0xcfd4d8, roughness: .35, metalness: .9 }),
  red: std({ color: 0xb3261e, roughness: .45, metalness: .1 }),
  blue: std({ color: 0x1f5fa8, roughness: .5, metalness: .1 }),
  cap: std({ color: 0x20262c, roughness: .35, metalness: .3 }),
  heater: std({ color: 0xb5622a, roughness: .6, metalness: .1, emissive: 0xff5a14, emissiveIntensity: 0 }),
  vessel: std({ color: 0xffffff, roughness: .45, metalness: .3, map: T.vessel }),
  pcb: std({ color: 0xffffff, roughness: .55, metalness: .2, map: T.pcb }),
  plateLab: std({ color: 0xffffff, roughness: .5, metalness: .1, map: T.plate }),
  flame: std({ color: 0xffffff, roughness: .6, map: T.flame, transparent: true }),
  led: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 2.2, 0.9) }),
  term: std({ color: 0x9aa39a, roughness: .6, metalness: .1 }),
  shellC: std({ color: 0x0e1012, roughness: .28, metalness: .5, side: THREE.DoubleSide }),
  // involucro (trasparente a comando)
  sGreen: xr(std({ color: 0x4d613d, roughness: .58, metalness: .02, bumpMap: T.noise, bumpScale: .5 })),
  sSlat: xr(std({ color: 0x546941, roughness: .52, metalness: .02 })),
  sDark: xr(std({ color: 0x2a2d31, roughness: .55, metalness: .25, bumpMap: T.noise, bumpScale: .5 })),
  sSide: xr(std({ color: 0x2c2f33, roughness: .52, metalness: .25, bumpMap: T.side, bumpScale: 5 })),
  sGuard: xr(std({ color: 0x15171a, roughness: .5, metalness: .5 })),
  sLetter: xr(std({ color: 0xffffff, roughness: .6, map: T.letter, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 })),
  sScrew: xr(std({ color: 0xaab0b4, roughness: .35, metalness: 1 })),
  sFelt: xr(std({ color: 0x4b4f55, roughness: 1, metalness: 0, bumpMap: T.noise, bumpScale: 3, side: THREE.DoubleSide })),
  sJacket: xr(std({ color: 0x141517, roughness: .85, metalness: 0, bumpMap: T.noise, bumpScale: 2, side: THREE.DoubleSide })),
  sDoor: xr(std({ color: 0x0e1012, roughness: .28, metalness: .5, side: THREE.DoubleSide })),
  sLid: xr(std({ color: 0x24282c, roughness: .5, metalness: .4 })),
  sLabel: xr(std({ color: 0xffffff, roughness: .5, map: T.plate })),
};
// modalità fantasma per il giro nel circuito: tutto tranne tubi e rame diventa quasi trasparente
let GHM = null, ghostNow = 0;
function setGhost(x) {
  if (!GHM) { const keep = [M.copper, M.brass, M.led]; GHM = Object.values(M).filter(m => !XRM.includes(m) && !keep.includes(m)); for (const m of GHM) { m.userData.o = m.opacity; m.userData.t = m.transparent; } }
  if (x === ghostNow) return; ghostNow = x;
  for (const m of GHM) { m.opacity = lerp(m.userData.o, .07, x); const tr = x > .004 || m.userData.t; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.depthWrite = x < .5; }
}
function setXray(x) { for (const m of XRM) { const o = lerp(m.userData.o, 0.06, x); m.opacity = o; const tr = x > 0.004 || m.map === T.letter || m.map === T.flame; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.depthWrite = x < 0.5; } }

// ───────── geometrie ─────────
const G = {
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  rbox: (w, h, d, r = .005) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.01, h / 2.01, d / 2.01)),
  cyl: (r, h, s = 24, r2 = r) => new THREE.CylinderGeometry(r2, r, h, s),
  cylZ: (r, h, s = 24, r2 = r) => new THREE.CylinderGeometry(r2, r, h, s).rotateX(PI / 2),
  cylX: (r, h, s = 24, r2 = r) => new THREE.CylinderGeometry(r2, r, h, s).rotateZ(PI / 2),
  open: (r, h, a0, al, s = 40) => new THREE.CylinderGeometry(r, r, h, s, 1, true, a0, al),
  dome: (r, k, up = true) => new THREE.SphereGeometry(r, 32, 12, 0, PI * 2, up ? 0 : PI / 2, PI / 2).scale(1, k, 1),
  torus: (R, r, arc = PI * 2, s = 40) => new THREE.TorusGeometry(R, r, 10, s, arc),
  plane: (w, h) => new THREE.PlaneGeometry(w, h),
};
function annulus(ro, ri, h, a0 = 0, a1 = PI * 2, seg = 44) {   // anello con asse Y, centrato
  const s = new THREE.Shape(); s.absarc(0, 0, ro, a0, a1, false);
  if (a1 - a0 >= PI * 2 - 1e-4) { const hl = new THREE.Path(); hl.absarc(0, 0, ri, 0, PI * 2, true); s.holes.push(hl); } else { s.absarc(0, 0, ri, a1, a0, true); s.closePath(); }
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: seg }); g.translate(0, 0, -h / 2); g.rotateX(PI / 2); return g;
}
const curveOf = pts => new THREE.CatmullRomCurve3(pts.map(p => V(p[0], p[1], p[2])), false, 'catmullrom', 0.12);
const tubeGeo = (pts, r, seg) => new THREE.TubeGeometry(curveOf(pts), seg || Math.max(16, pts.length * 12), r, 10, false);
function mesh(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; }
const screwGeo = mergeGeometries([new THREE.CylinderGeometry(.0062, .0062, .0042, 6).translate(0, .0031, 0), new THREE.CylinderGeometry(.0082, .0082, .001, 14).translate(0, .0005, 0), new THREE.CylinderGeometry(.0027, .0027, .014, 8).translate(0, -.007, 0)]);
