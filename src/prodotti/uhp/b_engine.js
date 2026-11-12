
// ───────── motore del montaggio ─────────
// Ogni pezzo ha una posizione finale, un istante di partenza e uno di arrivo: lo stato della macchina è una funzione
// pura del tempo t e del fattore di esplosione E, quindi si può scorrere avanti e indietro.
const machine = new THREE.Group(); scene.add(machine);
const GROUPS = [], PIECES = [];
let CUR = null;
const BEAT = 0.125;                       // i pezzi vanno in sede su una griglia di sedicesimi a 120 bpm

function group(key, name, spec, t0, t1, o = {}) {
  const node = new THREE.Group(); machine.add(node);
  CUR = { key, name, spec, t0, t1, node, i: GROUPS.length, stage: V(...(o.stage || [0, .3, 1])), ex: V(...(o.ex || [0, 0, 0])), spread: o.spread ?? .9,
    trav: o.trav ?? .45, pieces: [], c: V(), size: .3, az: o.az ?? 30, el: o.el ?? 14, zoom: o.zoom ?? 1, keys: o.keys || null, info: o.info || null };
  GROUPS.push(CUR); return CUR;
}
function piece(o, base) {
  const p = Object.assign({ g: CUR, st: -1, d: o.d ?? 0, dur: o.dur ?? .5, from: o.from ? V(...o.from) : null, spin: o.spin ? V(...o.spin) : null,
    k: o.k ? V(...o.k) : null, ease: o.ease || eob, n: o.n || null, snd: o.snd || 'click' }, base);
  CUR.pieces.push(p); PIECES.push(p); return p;
}
function P(m, o = {}) { (o.parent || CUR.node).add(m); m.userData.g = CUR.i; piece(o, { m, im: null, inst: -1, fp: m.position.clone(), fq: m.quaternion.clone(), fs: m.scale.clone() }); return m; }
// pezzi ripetuti: list = [{p:[x,y,z], r:[rx,ry,rz] | q:Quaternion, s:[sx,sy,sz]}]
function PIN(geo, mat, list, o = {}) {
  const im = new THREE.InstancedMesh(geo, mat, list.length); im.frustumCulled = false; im.userData.g = CUR.i; (o.parent || CUR.node).add(im);
  const n = list.length, e = new THREE.Euler();
  list.forEach((it, i) => {
    const f = n > 1 ? i / (n - 1) : 0, q = it.q ? it.q.clone() : new THREE.Quaternion().setFromEuler(e.set(...(it.r || [0, 0, 0])));
    const pick = v => typeof v === 'function' ? v(i, it, f) : v;
    piece({ d: o.df ? o.df(i, f) : lerp(o.d0 ?? 0, o.d1 ?? (o.d0 ?? 0), f), dur: o.dur, from: pick(o.from), spin: pick(o.spin), k: pick(o.k), ease: o.ease, n: i === 0 ? o.n : null, snd: o.snd || 'tick' },
      { m: null, im, inst: i, fp: V(...it.p), fq: q, fs: V(...(it.s || [1, 1, 1])) });
  });
  return im;
}
// viti: entrano lungo il proprio asse avvitandosi. list = [{p, r}] con l'asse della vite su +Y locale
function screws(list, o = {}) {
  const e = new THREE.Euler();
  return PIN(screwGeo, o.mat || M.steel, list, Object.assign({ dur: .34, ease: eoc, snd: 'screw', spin: [0, 12, 0], from: (i, it) => { const a = V(0, 1, 0).applyEuler(e.set(...(it.r || [0, 0, 0]))).multiplyScalar(.11); return [a.x, a.y, a.z]; } }, o));
}

function finalize() {
  machine.updateMatrixWorld(true);
  const R = rng(7), q = new THREE.Quaternion();
  for (const g of GROUPS) {
    const W = g.t1 - g.t0, box = new THREE.Box3();
    g.ta = g.t0 + W * g.trav; g.tb = g.t1 - .12;
    for (const p of g.pieces) {
      const c = V();
      if (p.im) c.copy(p.fp).applyMatrix4(p.im.parent.matrixWorld);
      else { p.m.geometry.computeBoundingBox(); p.m.geometry.boundingBox.getCenter(c); p.m.updateMatrixWorld(true); c.applyMatrix4(p.m.matrixWorld); }
      p.wc = c; box.expandByPoint(c);
    }
    box.getCenter(g.c); g.size = Math.max(.14, box.getSize(V()).length() / 2); g.box = box;
    for (const p of g.pieces) {
      p.ts = g.t0 + p.d * (W - .95);
      p.te = Math.max(p.ts + .2, Math.round((p.ts + p.dur) / BEAT) * BEAT);
      if (p.te > g.t1 - .1) { p.te = g.t1 - .1; p.ts = Math.min(p.ts, p.te - .2); }
      if (!p.from) p.from = V((R() - .5) * .5, .16 + R() * .4, .12 + R() * .42);
      if (!p.spin) p.spin = V((R() - .5) * 2.2, (R() - .5) * 2.2, (R() - .5) * 2.2);
      if (!p.k) p.k = p.wc.clone().sub(g.c).multiplyScalar(g.spread);
      const par = p.im ? p.im.parent : p.m.parent; par.getWorldQuaternion(q).invert(); p.from.applyQuaternion(q); p.k.applyQuaternion(q);
    }
  }
}

const _v = V(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _m = new THREE.Matrix4(), _s = V(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
let lastE = -1, lastShr = -1, onLand = null, onStart = null, placed = 0;
function apply(t, E = 0, shr = 1, emit = false) {
  for (const g of GROUPS) { g.q = eio(clamp((t - g.ta) / (g.tb - g.ta))); g.node.position.copy(g.stage).multiplyScalar(1 - g.q).addScaledVector(g.ex, E); }
  const same = E === lastE && shr === lastShr, dirty = new Set(); let n = 0;
  for (const p of PIECES) {
    let a = (t - p.ts) / (p.te - p.ts); const st = a <= 0 ? 0 : a >= 1 ? 2 : 1;
    if (st === 2) n++;
    if (st === p.st && st !== 1 && same) continue;
    if (emit && st === 2 && p.st === 1 && onLand) onLand(p);
    if (emit && st >= 1 && p.st === 0 && p.n && onStart) onStart(p);
    p.st = st;
    if (st === 0) { if (p.im) { p.im.setMatrixAt(p.inst, ZERO); dirty.add(p.im); } else p.m.visible = false; continue; }
    a = clamp(a); const r = 1 - p.ease(a), sc = Math.min(1, a * 5) * shr;
    _v.copy(p.fp).addScaledVector(p.from, r).addScaledVector(p.k, E);
    _q.setFromEuler(_e.set(p.spin.x * r, p.spin.y * r, p.spin.z * r)).premultiply(p.fq); _s.copy(p.fs).multiplyScalar(sc);
    if (p.im) { _m.compose(_v, _q, _s); p.im.setMatrixAt(p.inst, _m); dirty.add(p.im); }
    else { p.m.visible = sc > .001; p.m.position.copy(_v); p.m.quaternion.copy(_q); p.m.scale.copy(_s); }
  }
  dirty.forEach(im => { im.instanceMatrix.needsUpdate = true; }); lastE = E; lastShr = shr; placed = n;
}
