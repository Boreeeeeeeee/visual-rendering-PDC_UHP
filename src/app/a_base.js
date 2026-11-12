import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ───────── base del sito: utilità, resa, registro dei prodotti ─────────
const $ = id => document.getElementById(id);
const PI = Math.PI, rad = d => d * PI / 180;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

try { await Promise.race([Promise.all([document.fonts.load('700 40px "Barlow Condensed"'), document.fonts.load('600 20px Barlow')]), new Promise(r => setTimeout(r, 1200))]); } catch (e) {}

const canvas = $('gl'), stage = $('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const COARSE = matchMedia('(pointer: coarse)').matches;      // telefono o tablet
let PR = Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 2);   // rapporto pixel: scende da solo se la resa è lenta
renderer.setPixelRatio(PR);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const ENV = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
const ANTEPRIMA = /\/anteprima\//.test(location.pathname) || /[?&]segnaposti/.test(location.search);   // i segnaposti compaiono solo qui

// texture disegnate su canvas
function cv(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const rep = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };
const std = o => new THREE.MeshStandardMaterial(o);
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), rbox = (w, h, d, r = .01) => new RoundedBoxGeometry(w, h, d, 2, r);
const cyl = (r, h, n = 24) => new THREE.CylinderGeometry(r, r, h, n);

// pavimento da studio con griglia, come nella pagina della UHP
const T_GRID = rep(cv(256, 256, (g, w, h) => { g.fillStyle = '#0c1115'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,190,220,.20)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); }), 40, 40);

// ───────── registro dei prodotti ─────────
// Ogni prodotto si registra con: id, nome, riga (una frase), pagina (cartella della pagina completa, o null se non è ancora fatto),
// costruisci() -> { group, tick(dt, carico, freddo) } per il livello leggero, e i dati per il suo posto nella casa.
const PRODOTTI = [];
const registra = def => PRODOTTI.push(def);
