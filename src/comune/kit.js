import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ───────── base comune alle pagine dei prodotti (non della UHP, che ha il suo motore) ─────────
// Resa, scena da studio, materiali, piano di sezione e motore del montaggio: gruppo() apre un gruppo, P() gli aggiunge un pezzo che arriva in volo.
const $ = id => document.getElementById(id), PI = Math.PI, rad = d => d * PI / 180;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }, eoc = t => 1 - Math.pow(1 - t, 3);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
try { await Promise.race([document.fonts.load('700 40px "Barlow Condensed"'), new Promise(r => setTimeout(r, 1200))]); } catch (e) {}

const canvas = $('gl'), stage = $('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const COARSE = matchMedia('(pointer: coarse)').matches; let PR = Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 2); renderer.setPixelRatio(PR);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; renderer.localClippingEnabled = true;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0f13); scene.fog = new THREE.Fog(0x0b0f13, 7, 20);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture; scene.environmentIntensity = .85;
const camera = new THREE.PerspectiveCamera(30, 1, .03, 60);
const keyL = new THREE.DirectionalLight(0xffffff, 2.2); keyL.position.set(2.5, 4, 3.5); const rimL = new THREE.DirectionalLight(0x9fd0ff, 1.3); rimL.position.set(-3, 2.5, -3.5);
scene.add(keyL, rimL, new THREE.HemisphereLight(0xcfe3ff, 0x1c2026, .45));
function cv(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const tGrid = cv(256, 256, (g, w, h) => { g.fillStyle = '#0c1115'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,190,220,.20)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); }); tGrid.wrapS = tGrid.wrapT = THREE.RepeatWrapping; tGrid.repeat.set(40, 40);
const pav = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ map: tGrid, roughness: .7, metalness: .2, envMapIntensity: .15 })); pav.rotation.x = -PI / 2; scene.add(pav);

// materiali; quelli "tagliabili" ricevono il piano di sezione, quelli "raggi X" diventano trasparenti in funzione
const TAGLIO = new THREE.Plane(V(0, 0, -1), 0), std = o => new THREE.MeshStandardMaterial(o), TAGLIABILI = [], RAGGI = [];
const tagl = (m, x = false) => { m.side = THREE.DoubleSide; TAGLIABILI.push(m); if (x) { m.userData.o = m.opacity; RAGGI.push(m); } return m; };
const M = {
  inox: tagl(std({ color: 0xc9cdd1, roughness: .28, metalness: .9, transparent: true, opacity: 1 })), inox2: std({ color: 0xc9cdd1, roughness: .3, metalness: .9 }),
  allu: tagl(std({ color: 0xaeb4b8, roughness: .45, metalness: .8, emissive: 0xff5a1c, emissiveIntensity: 0 })), schiuma: tagl(std({ color: 0xe6d9a8, roughness: .95, transparent: true, opacity: 1 }), true),
  argento: tagl(std({ color: 0xb4b8bb, roughness: .38, metalness: .75, transparent: true, opacity: 1 }), true), nero: tagl(std({ color: 0x1b1d20, roughness: .45, metalness: .1, transparent: true, opacity: 1 }), true),
  gomma: std({ color: 0x0c0c0d, roughness: .95 }), ottone: std({ color: 0xb08a3c, roughness: .35, metalness: .8 }), rame: std({ color: 0xc47a45, roughness: .35, metalness: .9 }),
  acciaio: std({ color: 0x7d858c, roughness: .5, metalness: .7 }), scuro: std({ color: 0x15171a, roughness: .5, metalness: .4 }), plast: std({ color: 0x3b4046, roughness: .6 }),
  magnesio: std({ color: 0x8f9499, roughness: .7, metalness: .4 }), res: std({ color: 0x6b5a4a, roughness: .5, metalness: .6, emissive: 0xff3a10, emissiveIntensity: 0 }),
};
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const cyl = (r, h, n = 24, open = false) => new THREE.CylinderGeometry(r, r, h, n, 1, open), box = (w, h, d) => new THREE.BoxGeometry(w, h, d), rbox = (w, h, d, r = .01) => new RoundedBoxGeometry(w, h, d, 2, r);
const tubo = (pts, r, n = 6) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .3), Math.max(12, pts.length * 6), r, n);
const elica = (r, y0, y1, giri, k = 14) => { const p = []; for (let i = 0; i <= giri * k; i++) { const a = i / k * PI * 2; p.push(V(Math.sin(a) * r, lerp(y0, y1, i / (giri * k)), Math.cos(a) * r)); } return p; };
const radiale = (o, az) => { o.rotation.order = 'YXZ'; o.rotation.set(PI / 2, az, 0); return o; };   // asse del cilindro verso l'esterno all'azimut dato

// ───────── motore del montaggio ─────────
const root = new THREE.Group(); scene.add(root);
const G = []; let cur;
function gruppo(nome, facile, tecnico, t0, t1, vista, esp) { cur = { nome, facile, tecnico, t0, t1, vista, esp: V(...esp), pezzi: [] }; G.push(cur); }
// liv = quanto si allontana il pezzo nello strumento Smonta (0 resta vicino, 1 va lontano); se manca vale l'ordine di arrivo
function P(o, da = [0, .7, 0], rit = 0, liv = rit) { cur.pezzi.push({ o, home: o.position.clone(), da: V(...da), dir: V(...da).normalize(), rit, liv }); o.traverse(c => { c.userData.g = G.length - 1; }); root.add(o); return o; }

