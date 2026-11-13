// ───────── Tubi a tratti dritti con curve vere, che nel film crescono lungo il loro percorso ─────────
// Va dopo il motore della UHP (a_core.js, b_engine.js) e prima dei pezzi del prodotto. Lo usano le pagine comuni e l'ibrido; la UHP no.

// ───────── tubi: tratti dritti e curve vere ─────────
// Un tubo è la spezzata dei suoi punti con, in ogni angolo, una curva ad arco come quella di un tubo di rame piegato (raggio 35 mm, uguale per
// il tubo e la sua coibentazione così restano uno dentro l'altra; più largo solo per i tubi grossi, più stretto solo se i tratti sono corti). I campioni sono fitti nelle curve e radi nei tratti dritti, così gli angoli non si schiacciano.
// Sostituisce tubeGeo e curveOf del motore della UHP: i pezzi e i flussi delle pagine comuni seguono lo stesso percorso.
class Arco extends THREE.Curve {
  constructor(o, e1, e2, rc, th) { super(); this.o = o; this.e1 = e1; this.e2 = e2; this.rc = rc; this.th = th; }
  getPoint(t, out = V()) { const a = this.th * t; return out.copy(this.o).addScaledVector(this.e1, this.rc * Math.cos(a)).addScaledVector(this.e2, this.rc * Math.sin(a)); }
  getPointAt(u, out) { return this.getPoint(u, out); }
  getTangent(t, out = V()) { const a = this.th * t; return out.copy(this.e1).multiplyScalar(-Math.sin(a)).addScaledVector(this.e2, Math.cos(a)).normalize(); }
  getTangentAt(u, out) { return this.getTangent(u, out); }
  getLength() { return this.rc * this.th; }
}
function percorso(pts, rc0 = .035) {
  const Q = []; for (const p of pts) { const v = V(p[0], p[1], p[2]); if (!Q.length || v.distanceTo(Q[Q.length - 1]) > 1e-5) Q.push(v); }
  if (Q.length < 2) Q.push((Q[0] || V()).clone().add(V(0, 1e-4, 0)));
  const path = new THREE.CurvePath(); let cur = Q[0].clone();
  for (let i = 1; i < Q.length - 1; i++) {
    const a = Q[i - 1], c = Q[i], b = Q[i + 1], d1 = c.clone().sub(a), d2 = b.clone().sub(c), l1 = d1.length(), l2 = d2.length(); d1.divideScalar(l1); d2.divideScalar(l2);
    const cs = clamp(d1.dot(d2), -1, 1), th = Math.acos(cs);
    if (th < .004) continue;                                                              // dritto: nessuna curva
    if (th > PI - .03) { if (c.distanceTo(cur) > 1e-6) path.add(new THREE.LineCurve3(cur.clone(), c.clone())); cur = c.clone(); continue; }   // inversione: spigolo
    let rc = rc0, t = rc * Math.tan(th / 2); const lim = Math.min(i === 1 ? l1 : l1 / 2, i === Q.length - 2 ? l2 : l2 / 2) * .98;
    if (t > lim) { t = lim; rc = t / Math.tan(th / 2); }
    const T1 = c.clone().addScaledVector(d1, -t), T2 = c.clone().addScaledVector(d2, t), n = d2.clone().addScaledVector(d1, -cs).normalize();
    if (T1.distanceTo(cur) > 1e-6) path.add(new THREE.LineCurve3(cur.clone(), T1));
    path.add(new Arco(T1.clone().addScaledVector(n, rc), n.clone().negate(), d1.clone(), rc, th)); cur = T2;
  }
  const end = Q[Q.length - 1]; if (end.distanceTo(cur) > 1e-6 || !path.curves.length) path.add(new THREE.LineCurve3(cur, end.clone()));
  return path;
}
function tuboGeo(pts, r, _seg, radial = 10) {
  const path = percorso(pts, Math.max(r * 2.5, .035)), S = [], Tg = [], L = [0]; let acc = 0;
  for (const c of path.curves) {
    const len = c.getLength(), n = c.isLineCurve3 ? Math.max(1, Math.ceil(len / .03)) : Math.max(3, Math.ceil(c.th / (PI / 14)));
    for (let k = S.length ? 1 : 0; k <= n; k++) { const p = c.getPoint(k / n, V()); if (S.length) { acc += p.distanceTo(S[S.length - 1]); L.push(acc); } S.push(p); Tg.push(c.getTangent(k / n, V()).normalize()); }
  }
  // riferimento che scorre lungo il tubo senza girare su sé stesso
  const N = [], B = [], q = new THREE.Quaternion(), t0 = Tg[0], ax = Math.abs(t0.x) < .9 ? V(1, 0, 0) : V(0, 1, 0);
  N.push(ax.sub(t0.clone().multiplyScalar(ax.dot(t0))).normalize());
  for (let i = 1; i < S.length; i++) { const v = N[i - 1].clone().applyQuaternion(q.setFromUnitVectors(Tg[i - 1], Tg[i])); N.push(v.addScaledVector(Tg[i], -v.dot(Tg[i])).normalize()); }
  for (let i = 0; i < S.length; i++) B.push(V().crossVectors(Tg[i], N[i]));
  const pos = [], nor = [], uv = [], idx = [], nm = V();
  for (let i = 0; i < S.length; i++) for (let j = 0; j <= radial; j++) {
    const v = j / radial * PI * 2, sn = Math.sin(v), cs = -Math.cos(v);
    nm.set(cs * N[i].x + sn * B[i].x, cs * N[i].y + sn * B[i].y, cs * N[i].z + sn * B[i].z).normalize();
    nor.push(nm.x, nm.y, nm.z); pos.push(S[i].x + r * nm.x, S[i].y + r * nm.y, S[i].z + r * nm.z); uv.push(acc ? L[i] / acc : 0, j / radial);
  }
  for (let i = 1; i < S.length; i++) for (let j = 1; j <= radial; j++) {
    const a = (radial + 1) * (i - 1) + (j - 1), b = (radial + 1) * i + (j - 1), c = (radial + 1) * i + j, d = (radial + 1) * (i - 1) + j; idx.push(a, b, d, b, c, d);
  }
  const g = new THREE.BufferGeometry(); g.setIndex(idx); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.userData = { tubo: true, len: Float32Array.from(L), tot: acc, n: S.length - 1, rad: radial, testa: S[0].clone(), punta: S[S.length - 1].clone() };
  return g;
}
tubeGeo = tuboGeo; curveOf = pts => percorso(pts);

// ───────── tubi e cavi che crescono lungo il loro percorso ─────────
// Un tubo non arriva volando attraverso la macchina: compare dal suo primo punto e si allunga fino all'ultimo, già al suo posto.
// Vale per ogni pezzo fatto con tubeGeo; un prodotto che vuole un tubo in volo mette m.userData.vola = true.
const CRESCE = [];
const _finalize = finalize;
finalize = function () {
  for (const p of PIECES) { const g = p.m && p.m.geometry; if (g && g.userData.tubo && !p.m.userData.vola) { p.cresce = true; p.dur = Math.max(p.dur, .8); CRESCE.push(p); } }
  _finalize();
  for (const p of CRESCE) { p.from.set(0, 0, 0); p.spin.set(0, 0, 0); p.punta = p.m.geometry.userData.punta.clone().applyMatrix4(p.m.matrixWorld); }
};
const _apply = apply;
apply = function (t, E = 0, shr = 1, emit = false) {
  _apply(t, E, shr, emit);
  for (const p of CRESCE) {
    if (p.st === 0) continue;
    const g = p.m.geometry, u = g.userData, a = clamp((t - p.ts) / (p.te - p.ts));
    p.m.scale.copy(p.fs).multiplyScalar(shr); p.m.visible = shr > .001;
    let s = u.n; if (a < 1) { const d = eio(a) * u.tot; let lo = 0, hi = u.n; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (u.len[m] <= d) lo = m; else hi = m - 1; } s = lo; }
    if (g.drawRange.count !== s * u.rad * 6) g.setDrawRange(0, s * u.rad * 6);
  }
};
