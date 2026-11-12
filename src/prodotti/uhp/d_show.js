
// ───────── scena, particelle, filmato ─────────
const T_ASM = 3.5, T_RUN = 36, T_END = 49, MC = V(0, .56, 0);
const ground = mesh(new THREE.CircleGeometry(7, 64), new THREE.MeshBasicMaterial({ map: T.ground }), 0, 0, 0, -PI / 2); scene.add(ground);
const shadow = mesh(G.plane(2.5, 1.4), new THREE.MeshBasicMaterial({ map: T.shadow, transparent: true, depthWrite: false }), 0, .003, 0, -PI / 2); scene.add(shadow);

function points(n, size, add = true) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size, map: T.glow, vertexColors: true, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending }));
  p.frustumCulled = false; p.userData.size = size; PTS.push(p); return p;
}
// Three.js non tiene conto dell'angolo di campo nella grandezza dei punti: la correggo qui a ogni cambio di inquadratura
const PTS = [];
function ptSizes() { const k = 1 / Math.tan(rad(camera.fov / 2)); for (const p of PTS) p.material.size = p.userData.size * k; }
// i flussi corrono dentro i tubi: li disegno 2 cm più vicini alla camera, così non restano nascosti dalla parete del tubo
function pushed(p, d = .022) { p.material.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <project_vertex>', `vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\n\tmvPosition.xyz -= normalize( mvPosition.xyz ) * ${d.toFixed(3)};\n\tgl_Position = projectionMatrix * mvPosition;`); }; return p; }
const R0 = rng(99);
// neve
const NS = 1500, snow = points(NS, .013), snowB = new Float32Array(NS * 4); scene.add(snow);
for (let i = 0; i < NS; i++) { snowB[i * 4] = (R0() - .5) * 7; snowB[i * 4 + 1] = R0() * 3.4; snowB[i * 4 + 2] = (R0() - .5) * 6; snowB[i * 4 + 3] = .45 + R0() * .7; }
function updSnow(now, amt) {
  snow.visible = amt > .01; if (!snow.visible) return; const p = snow.geometry.attributes.position, c = snow.geometry.attributes.color;
  for (let i = 0; i < NS; i++) { const v = snowB[i * 4 + 3], y = ((snowB[i * 4 + 1] - v * now) % 3.4 + 3.4) % 3.4, x = ((snowB[i * 4] + now * .5 * v + Math.sin(now * .7 + i) * .12 + 3.5) % 7 + 7) % 7 - 3.5;
    p.setXYZ(i, x, y, snowB[i * 4 + 2]); const k = amt * (.5 + .5 * v) * sm(0, .25, y); c.setXYZ(i, k, k, k * 1.05); }
  p.needsUpdate = c.needsUpdate = true;
}
// aria attraverso batteria e ventilatore
const NA = 650, air = points(NA, .017), airB = new Float32Array(NA * 5); machine.add(air);
for (let i = 0; i < NA; i++) { airB[i * 5] = R0(); airB[i * 5 + 1] = R0(); airB[i * 5 + 2] = Math.sqrt(R0()); airB[i * 5 + 3] = R0() * PI * 2; airB[i * 5 + 4] = R0(); }
function updAir(now, amt, spd, warmOut) {
  air.visible = amt > .01; if (!air.visible) return; const p = air.geometry.attributes.position, c = air.geometry.attributes.color;
  for (let i = 0; i < NA; i++) {
    const u = (airB[i * 5 + 4] + now * .16 * spd) % 1, z = lerp(-.8, 1.25, u), fr = airB[i * 5 + 2] * .285, fa = airB[i * 5 + 3];
    let x = lerp(-.62, .16, airB[i * 5]), y = lerp(.13, .97, airB[i * 5 + 1]);
    if (z < -.2) { x += (x + .23) * .5 * (-.2 - z); y += (y - .55) * .5 * (-.2 - z); }
    else { const a = fa + Math.max(0, z - .09) * 2.4, r = fr * (1 + Math.max(0, z - .2) * .35), t = sm(-.2, .09, z); x = lerp(x, FAN.x + Math.cos(a) * r, t); y = lerp(y, FAN.y + Math.sin(a) * r, t); }
    p.setXYZ(i, x, y, z); const f = amt * sm(0, .12, u) * (1 - sm(.8, 1, u)) * .55, o = sm(-.25, -.1, z);
    if (warmOut) c.setXYZ(i, lerp(.45, 1.1, o) * f, lerp(.7, .5, o) * f, lerp(1, .2, o) * f); else c.setXYZ(i, lerp(.6, .18, o) * f, lerp(.8, .5, o) * f, f * 1.1);
  }
  p.needsUpdate = c.needsUpdate = true;
}
// flussi lungo i tubi: campioni di posizione e colore per ogni tratto
class Flow {
  constructor(parent, n, size) { this.pts = pushed(points(n, size)); this.n = n; parent.add(this.pts); this.ph = new Float32Array(n); this.jit = new Float32Array(n * 3); for (let i = 0; i < n; i++) { this.ph[i] = (i + R0() * .6) / n; for (let k = 0; k < 3; k++) this.jit[i * 3 + k] = (R0() - .5) * .008; } }
  // segs = [{pts:[[x,y,z]…], rev:bool, c0:[r,g,b], c1:[r,g,b]}]
  path(segs) {
    const S = 420, cs = segs.map(s => { const c = curveOf(s.rev ? s.pts.slice().reverse() : s.pts); return { c, L: c.getLength(), s }; }), tot = cs.reduce((a, b) => a + b.L, 0);
    const P = new Float32Array(S * 3), C = new Float32Array(S * 3); let k = 0; this.marks = [];
    for (const o of cs) { const m = Math.max(2, Math.round(S * o.L / tot)); this.marks.push(k / S); for (let i = 0; i < m && k < S; i++, k++) { const f = i / (m - 1), v = o.c.getPointAt(f); P[k * 3] = v.x; P[k * 3 + 1] = v.y; P[k * 3 + 2] = v.z; for (let j = 0; j < 3; j++) C[k * 3 + j] = lerp(o.s.c0[j], o.s.c1[j], f); } }
    for (; k < S; k++) for (let j = 0; j < 3; j++) { P[k * 3 + j] = P[(k - 1) * 3 + j]; C[k * 3 + j] = C[(k - 1) * 3 + j]; }
    return { P, C, S, marks: this.marks, curve: new THREE.CatmullRomCurve3(Array.from({ length: 90 }, (_, i) => { const q = Math.round(i / 89 * (S - 1)); return V(P[q * 3], P[q * 3 + 1], P[q * 3 + 2]); }), true, 'centripetal') };
  }
  upd(now, amt, spd, pa) {
    this.pts.visible = amt > .01; if (!this.pts.visible) return; const p = this.pts.geometry.attributes.position, c = this.pts.geometry.attributes.color, S = pa.S;
    for (let i = 0; i < this.n; i++) { const u = (this.ph[i] + now * spd) % 1, f = u * (S - 1), a = f | 0, b = Math.min(S - 1, a + 1), t = f - a;
      p.setXYZ(i, lerp(pa.P[a * 3], pa.P[b * 3], t) + this.jit[i * 3], lerp(pa.P[a * 3 + 1], pa.P[b * 3 + 1], t) + this.jit[i * 3 + 1], lerp(pa.P[a * 3 + 2], pa.P[b * 3 + 2], t) + this.jit[i * 3 + 2]);
      c.setXYZ(i, pa.C[a * 3] * amt, pa.C[a * 3 + 1] * amt, pa.C[a * 3 + 2] * amt); }
    p.needsUpdate = c.needsUpdate = true;
  }
}
const HOT = [1.7, .26, .06], WARM = [1.5, .7, .12], COLD = [.1, .5, 1.8], COOL = [.3, .9, 1.6], PALE = [.45, .8, 1.3];
const compW = PIPE.comp.map(p => [p[0] + cmp.position.x, p[1] + cmp.position.y, p[2] + cmp.position.z]);
const fRef = new Flow(machine, 430, .022), fWat = new Flow(machine, 250, .032), fCmp = new Flow(cmp, 70, .014);
const seg = (k, c0, c1, rev) => ({ pts: Array.isArray(k) ? k : PIPE[k], c0, c1, rev: !!rev });
const PATH = {
  heat: fRef.path([seg('a', HOT, HOT), seg('b', HOT, HOT), seg('rHx', HOT, WARM), seg('c', WARM, WARM), seg('d', WARM, COLD), seg('coil', COLD, COOL), seg('e', COOL, PALE), seg('f', PALE, PALE), seg(compW, PALE, HOT)]),
  cool: fRef.path([seg('a', HOT, HOT), seg('e', HOT, HOT, 1), seg('coil', HOT, WARM, 1), seg('d', WARM, COLD, 1), seg('c', COLD, COLD, 1), seg('rHx', COLD, COOL, 1), seg('b', COOL, PALE, 1), seg('f', PALE, PALE), seg(compW, PALE, HOT)]),
  wHeat: null, wCool: null, cmp: fCmp.path([seg(PIPE.comp, COLD, HOT)]),
};
{ const w = (c0, c1) => fWat.path([seg('wIn', c0, c0), seg('wHx', c0, c1), seg('wA', c1, c1), seg([[.488, .78, -.105], [.455, .8, -.12], [.455, .875, -.1]], c1, c1), seg('wB', c1, c1), seg('wC', c1, c1), seg([[.5, .262, .03], [.5, .138, .03]], c1, c1), seg('wOut', c1, c1)]);
  PATH.wHeat = w([.12, .45, 1.6], [1.7, .5, .08]); PATH.wCool = w([.4, .8, 1.2], [.06, .3, 1.8]); }
// scintille all'arrivo dei pezzi
const NK = 240, spark = points(NK, .009), spV = new Float32Array(NK * 4); scene.add(spark); let spI = 0;
function emitSpark(pos, n) { const p = spark.geometry.attributes.position; for (let k = 0; k < n; k++) { const i = spI = (spI + 1) % NK; p.setXYZ(i, pos.x, pos.y, pos.z); spV[i * 4] = (Math.random() - .5) * 1.1; spV[i * 4 + 1] = Math.random() * 1.0 + .2; spV[i * 4 + 2] = (Math.random() - .5) * 1.1; spV[i * 4 + 3] = 1; } }
function updSparks(dt) { const p = spark.geometry.attributes.position, c = spark.geometry.attributes.color; for (let i = 0; i < NK; i++) { let l = spV[i * 4 + 3]; if (l <= 0) { c.setXYZ(i, 0, 0, 0); continue; } l -= dt * 2.2; spV[i * 4 + 3] = l; spV[i * 4 + 1] -= dt * 3; p.setXYZ(i, p.getX(i) + spV[i * 4] * dt, Math.max(.005, p.getY(i) + spV[i * 4 + 1] * dt), p.getZ(i) + spV[i * 4 + 2] * dt); const k = Math.max(0, l); c.setXYZ(i, 3.2 * k, 1.5 * k * k, .4 * k * k); } p.needsUpdate = c.needsUpdate = true; }
const ring = mesh(new THREE.RingGeometry(.93, 1, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(.7, 1.4, 1.1), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 0, .01, 0, -PI / 2); scene.add(ring); let ringT = 9;

// ───────── stato della macchina in funzione ─────────
const S = { ghost: 0, cold: 0, snow: 0, xray: 0, fan: 0, comp: 0, air: 0, ref: 0, wat: 0, frost: 0, E: 0, shr: 1, outT: 7, watT: 35, read: 0, cool: false, demo: 0 };
let fanA = 0, crankA = 0;
const C_GOLD = new THREE.Color(0xc9a44c), C_FROST = new THREE.Color(0xeaf6ff), C_SLAT = new THREE.Color(0x546941), _c = new THREE.Color();
function applyLook(now, dt) {
  scene.background.lerpColors(C_STUDIO, C_COLD, S.cold); scene.fog.color.copy(scene.background);
  ground.material.color.setRGB(1 + S.cold * .5, 1 + S.cold * 1.1, 1 + S.cold * 1.9); rimL.intensity = 1.5 + S.cold * 1.6; keyL.intensity = 2.3 - S.cold * .7;
  M.gold.color.lerpColors(C_GOLD, C_FROST, S.frost); M.gold.metalness = lerp(.9, .15, S.frost); M.gold.roughness = lerp(.42, .9, S.frost);
  M.sSlat.color.lerpColors(C_SLAT, C_FROST, S.frost * .16);
  M.heater.emissiveIntensity = Math.max(S.cold, S.frost) * 1.6;
  setXray(S.xray); setGhost(S.ghost < .003 ? 0 : S.ghost);
  fanA += dt * S.fan * PI * 2; fanRot.rotation.z = -fanA; crankA += dt * S.comp * PI * 2; crank.rotation.y = crankA;
  updSnow(now, S.snow); updAir(now, S.air, .35 + S.fan * .13, S.cool);
  fRef.upd(now, S.ref, .055 + S.comp * .006, S.cool ? PATH.cool : PATH.heat); fWat.upd(now, S.wat, .1, S.cool ? PATH.wCool : PATH.wHeat); fCmp.upd(now, S.demo * .55, .55, PATH.cmp);
  shadow.material.opacity = .9 * (1 - clamp(S.E * 1.5)) * S.shr;
  updSparks(dt);
  if (ringT < 1) { ringT += dt * 1.6; const k = eoc(clamp(ringT)); ring.scale.setScalar(.3 + k * 1.5); ring.material.opacity = (1 - k) * .8; } else ring.material.opacity = 0;
}

// ───────── camera ─────────
const KEYS = [], rig = { t: V(), az: 0, el: 0, w: 2, h: 1.5 }, _a = V(), _b = V(), _o = V();
const K = (t, g, az, el, w, h, off) => KEYS.push({ t, g, az: rad(az), el: rad(el), w, h, off: off || [0, 0, 0] });
K(0, -1, 27, 5, 2.2, 1.9, [0, .24, 0]); K(2.3, -1, 34, 7, 1.9, 1.7, [0, .2, 0]); K(3.25, -1, 40, 13, 3.8, 3.0);
for (const g of GROUPS) {
  const W = g.t1 - g.t0, z = g.size * 2.3 * g.zoom;
  if (g.key === 'shell') { K(31.5, -1, 385, 12, 1.95, 1.5); K(33.6, -1, 345, 9, 1.5, 1.35, [-.12, 0, 0]); K(35.4, -1, 392, 9, 1.8, 1.42); continue; }
  if (g.keys) for (const [f, az, el, zm, oy] of g.keys) K(g.t0 + f * W, g.i, az, el, z * zm, z * zm, [0, oy, 0]);
  else { K(g.t0 + .45, g.i, g.az, g.el, z, z); K(g.t0 + .58 * W, g.i, g.az + 16, g.el, z * 1.05, z * 1.05); }
  K(g.t1 - .6, -1, (g.keys ? g.keys[g.keys.length - 1][1] : g.az) + 14, 13, 1.8, 1.4);
}
K(36.3, -1, 392, 9, 1.8, 1.45); K(38.4, -1, 418, 11, 1.2, 1.05, [.2, 0, 0]); K(40.6, -1, 428, 8, .8, .82, [.34, -.06, 0]); K(42.8, -1, 332, 9, 2.1, 1.6); K(44.6, -1, 298, 10, 1.25, 1.12, [-.35, 0, -.05]); K(47.3, -1, 392, 8, 1.8, 1.45); K(49.5, -1, 398, 8, 1.8, 1.45);
function keyTarget(k, out) { if (k.g < 0) out.copy(MC); else { const g = GROUPS[k.g]; out.copy(g.node.position).add(g.c); } return out.add(_o.set(k.off[0], k.off[1], k.off[2])); }
function camFilm(t) {
  let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1].t <= t) i++;
  const a = KEYS[i], b = KEYS[i + 1], u = sm(a.t, b.t, t);
  keyTarget(a, _a); keyTarget(b, _b); rig.t.lerpVectors(_a, _b, u); rig.az = lerp(a.az, b.az, u) + Math.sin(t * .6) * .02; rig.el = lerp(a.el, b.el, u); rig.w = lerp(a.w, b.w, u); rig.h = lerp(a.h, b.h, u);
  let sh = 0; for (const g of GROUPS) if (t > g.tb && g.stage.lengthSq() > 0) sh = Math.max(sh, Math.exp(-(t - g.tb) * 9));
  if (t > 2.35 && t < T_ASM) sh = Math.max(sh, Math.exp(-(t - 2.35) * 5));
  rig.t.x += Math.sin(t * 97) * .007 * sh; rig.t.y += Math.cos(t * 83) * .007 * sh;
}
function placeCam(r) {
  const f = Math.tan(rad(camera.fov / 2)), d = Math.max(r.h / 2 / f, r.w / 2 / (f * camera.aspect)) * 1.1;
  camera.position.set(r.t.x + d * Math.sin(r.az) * Math.cos(r.el), r.t.y + d * Math.sin(r.el), r.t.z + d * Math.cos(r.az) * Math.cos(r.el)); camera.lookAt(r.t);
  return d;
}

// ───────── didascalie ─────────
const CAPS = [];
GROUPS.forEach(g => CAPS.push({ t: g.t0, n: String(g.i + 1).padStart(2, '0'), a: g.name, b: g.spec }));
CAPS.push({ t: 36, n: '09', a: 'In funzione', b: 'Il ventilatore aspira l\'aria esterna attraverso la batteria: è da lì che arriva il calore.' },
  { t: 38.6, n: '09', a: 'Il giro del propano', b: 'Il compressore scalda il gas, lo scambiatore a piastre passa quel calore all\'acqua di casa.' },
  { t: 41.2, n: '09', a: 'Fino a −25 °C', b: 'Anche con il gelo fuori l\'acqua di mandata può arrivare a 80 °C.' },
  { t: 43.6, n: '09', a: 'Sbrinamento automatico', b: 'Quando la batteria si copre di brina la macchina la scioglie da sola.' },
  { t: 46.2, n: '', a: 'Unical UHP 120', b: '12 kW · classe A+++ · COP 4,90 con aria a 7 °C e acqua a 35 °C · propano R290' });
const el = { cap: $('cap'), num: $('num'), name: $('name'), spec: $('spec'), tick: $('tick'), count: $('count').firstElementChild, hook: $('hook'), hk1: $('hk1'), hk2: $('hk2'), read: $('read'), rOut: $('rOut').lastElementChild, rWat: $('rWat').lastElementChild, flash: $('flash'), bottom: $('bottom'), segs: $('segs') };
const SEGS = GROUPS.map(g => [g.t0, g.t1]).concat([[T_RUN, T_END]]);
SEGS.forEach(s => { const i = document.createElement('i'); i.style.flex = String(s[1] - s[0]); i.appendChild(document.createElement('b')); el.segs.appendChild(i); });
let capI = -2, lastCount = -1, lastOut = null, lastWat = null, hookK = -1;
const fmtT = v => (v < 0 ? '−' : '') + Math.abs(Math.round(v)) + ' °C';
function setCap(n, a, b) { el.num.textContent = n; el.name.textContent = a; el.spec.textContent = b; el.tick.textContent = ''; el.cap.classList.remove('in'); void el.cap.offsetWidth; el.cap.classList.add('in'); }
function hud(t) {
  let i = -1; for (let k = 0; k < CAPS.length; k++) if (CAPS[k].t <= t) i = k;
  if (i !== capI) { capI = i; if (i >= 0) setCap(CAPS[i].n, CAPS[i].a, CAPS[i].b); }
  el.cap.style.opacity = t < T_ASM ? 0 : 1;
  const hk = t < 1.55 ? 0 : t < T_ASM - .25 ? 1 : 2;
  if (hk !== hookK) { hookK = hk; el.hk1.textContent = hk === 0 ? '−25 °C' : '80 °C'; el.hk1.style.color = hk === 0 ? 'var(--ice)' : 'var(--heat)'; el.hk2.textContent = hk === 0 ? 'fuori' : 'l\'acqua per la casa'; }
  el.hook.style.opacity = hk === 2 ? 0 : hk === 0 ? sm(.1, .5, t) * (1 - sm(1.35, 1.55, t)) : sm(1.55, 1.85, t) * (1 - sm(2.9, 3.2, t));
  el.flash.style.opacity = Math.max(0, 1 - Math.abs(t - T_ASM) / .22) * .9;
  const n = t < T_ASM ? PIECES.length : placed; if (n !== lastCount) { lastCount = n; el.count.textContent = n; }
  SEGS.forEach((s, k) => { el.segs.children[k].firstChild.style.transform = `scaleX(${clamp((t - s[0]) / (s[1] - s[0]))})`; });
  readout();
}
function readout() { el.read.classList.toggle('on', S.read > .5); const o = fmtT(S.outT), w = fmtT(S.watT); if (o !== lastOut) el.rOut.textContent = lastOut = o; if (w !== lastWat) el.rWat.textContent = lastWat = w; }
onStart = p => { el.tick.textContent = p.n; el.tick.classList.remove('in'); void el.tick.offsetWidth; el.tick.classList.add('in'); };
let sfx = null;                       // riempito dal modulo dei comandi quando l'audio è attivo
const _w = V();
onLand = p => { _w.copy(p.wc).add(p.g.node.position); if (p.im) { if (Math.random() < .22) emitSpark(_w, 1); } else emitSpark(_w, 4); if (sfx) sfx(p.snd); };

// ───────── linea del tempo del filmato ─────────
function filmState(t, emit) {
  if (t < T_ASM) {
    const E = t < 2.35 ? 0 : 1.25 * eoc(clamp((t - 2.35) / 1.05));
    Object.assign(S, { cold: 1, snow: 1, xray: 0, fan: 3, comp: 0, air: 0, ref: 0, wat: 0, frost: .5, E, shr: 1 - sm(3.18, 3.47, t), read: 0, outT: -25, watT: 80, demo: 0 });
    apply(T_RUN, S.E, S.shr, false);
  } else if (t < T_RUN) {
    const c = 1 - sm(T_ASM, 4.7, t);
    Object.assign(S, { cold: c, snow: c, xray: 0, fan: 0, comp: t > 8 && t < 12.8 ? 2.2 * sm(8, 8.8, t) * (1 - sm(12, 12.8, t)) : 0, air: 0, ref: 0, wat: 0, frost: 0, E: 0, shr: 1, read: 0, outT: 7, watT: 35, demo: sm(9.9, 10.3, t) * (1 - sm(11.3, 11.6, t)) });
    apply(t, 0, 1, emit);
    if (emit) for (const g of GROUPS) if (g.stage.lengthSq() > 0 && t >= g.tb && t - g.tb < .05 && ringT > .5) { ringT = 0; ring.position.set(g.c.x, .012, g.c.z); if (sfx) sfx('dock'); }
  } else {
    const r = t - T_RUN, x = sm(.3, 1.5, r) * (1 - sm(9.7, 10.9, r)), cold = sm(4.6, 6.4, r);
    Object.assign(S, { cold, snow: cold, xray: x, fan: 6 * sm(.2, 2, r), comp: 3 * sm(.6, 2.2, r), air: sm(.8, 2, r), ref: sm(1.6, 2.6, r) * x, wat: sm(2, 3, r) * x, frost: sm(5.6, 7.4, r) * (1 - sm(7.9, 9.5, r)), E: 0, shr: 1, read: r > 1 ? 1 : 0,
      outT: lerp(7, -25, sm(4.8, 7.4, r)), watT: lerp(35, 80, sm(2.6, 7.4, r)), demo: 0 });
    apply(T_RUN, 0, 1, false);
  }
}

// ───────── ciclo di disegno ─────────
// Si parte da una schermata d'inizio: il film comincia solo quando chi guarda lo chiede.
const setBody = c => { document.body.className = c; };
let mode = 'film', started = false, playing = false, Tm = 0, now = 0, last = performance.now(), frames = 0, slow = 0, freeTick = null;
function draw() { if (HQ && composer) composer.render(); else renderer.render(scene, camera); }
function frame(ts) {
  requestAnimationFrame(frame);
  let dt = Math.min(.05, (ts - last) / 1000); last = ts; if (document.hidden) return; now += dt;
  if (mode === 'film') {
    if (playing) Tm += dt;
    if (Tm >= T_END) { enterFree(); }
    else { filmState(Tm, playing); camFilm(Tm); if (!started) { rig.az += Math.sin(now * .22) * .12; rig.w *= 1.06; rig.h *= 1.06; } hud(Tm); placeCam(rig); }
  }
  if (mode === 'free' && freeTick) freeTick(dt);
  applyLook(now, playing || mode === 'free' || !started ? dt : 0); draw();
  if (++frames > 20 && frames < 140) { if (dt > .04) slow++; if (frames === 139) { if (slow > 70 && HQ) { HQ = false; renderer.setPixelRatio(1); resize(); ptSizes(); } else if (slow > 24) { renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1.25)); resize(); ptSizes(); } } }
}
// modalità libera: senza il modulo dei comandi resta un modello che gira piano
const free = { az: rad(32), el: rad(9), zoom: 1, t: MC.clone(), auto: true };
function enterFree() {
  const wasFree = mode === 'free'; mode = 'free'; started = true; playing = false; Tm = T_END; filmState(T_END - .001, false); hud(T_END - .001);
  Object.assign(S, { xray: 0, air: 1, fan: 6, comp: 3, ref: 0, wat: 0, cold: 0, snow: 0, frost: 0, outT: 7, watT: 35, read: 1 });
  free.az = rig.az % (PI * 2); free.el = rig.el; free.zoom = 1; free.t.copy(MC); free.auto = true;
  setBody('free'); if (!wasFree) { const t = $('toast'); t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); }
  if (typeof uiEnter === 'function') uiEnter(); else freeTick = dt => { free.az += dt * .12; rig.t.copy(free.t); rig.az = free.az; rig.el = free.el; rig.w = 1.8; rig.h = 1.45; placeCam(rig); };
}
function startFilm(t = 0) { const wasFree = mode === 'free'; mode = 'film'; started = true; playing = true; Tm = t; capI = -2; for (const p of PIECES) p.st = -1; lastE = -1; setBody('film'); $('bPlay').textContent = 'Pausa'; if (wasFree && typeof uiLeave === 'function') uiLeave(); }
$('bPlay').onclick = () => { playing = !playing; $('bPlay').textContent = playing ? 'Pausa' : 'Riprendi'; };
$('bSkip').onclick = () => enterFree(); $('bGo').onclick = () => startFilm(0); $('bExplore').onclick = () => enterFree();

resize(); mkComposer(); resize(); ptSizes(); new ResizeObserver(() => { resize(); ptSizes(); }).observe(stage);
queueMicrotask(() => { if (typeof initUI === 'function') initUI(); });   // dopo che il modulo dei comandi ha inizializzato le sue variabili
// per le prove: tempo, esplosione e vista comandabili da fuori
window.__uhp = { air, fRef, fWat, snow, seek(t) { if (t >= T_END) { if (mode !== 'free') enterFree(); if (freeTick) freeTick(0); } else { if (mode !== 'film' || !started) startFilm(t); playing = false; Tm = t; now = t; filmState(t, false); camFilm(t); hud(t); placeCam(rig); } applyLook(now, 0); draw(); },
  setHQ(v) { HQ = v; }, step(n = 30, dt = .1) { for (let i = 0; i < n; i++) { now += dt; if (mode === 'free' && freeTick) freeTick(dt); applyLook(now, dt); } draw(); }, S, rig, free, placeCam, draw, applyLook, apply, get mode() { return mode; }, pieces: PIECES.length, groups: GROUPS.map(g => [g.key, g.pieces.length, +g.size.toFixed(2)]), T_END };
requestAnimationFrame(frame);
