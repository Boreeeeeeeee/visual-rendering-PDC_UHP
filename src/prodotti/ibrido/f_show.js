
// ───────── Ibrido HYBREER 3 · scena, particelle, filmato ─────────
// Logica dal manuale HYBREER 00339200 p.19 (HP_QOR): sopra T4_AHS_ON riscalda solo la pompa di calore; tra T4HMIN e T4_AHS_ON pompa di calore e caldaia insieme;
// sotto T4HMIN solo la caldaia. T4_AHS_ON consigliata: 5 °C (pavimento, mandata 35 °C), 7 °C (pavimento 40/45 °C), 10 °C (fan coil 55 °C e radiatori 70 °C).
// T4HMIN di fabbrica: −15 °C. La caldaia è impostata solo in riscaldamento (7.8 FUNZIONE AHS = 1): d'estate raffresca solo la pompa di calore.
const T_ASM = 3.5, T_RUN = 45.5, T_END = 59.5, MC = V(-.03, 1.02, 0), BW = 3.15, BH = 2.5, T4HMIN = -15;
const AMB_B = .3, AMB_M = .42;
const IMPIANTI = [{ n: 'Pavimento 35 °C', t: 35, s: 5 }, { n: 'Pavimento 40/45 °C', t: 45, s: 7 }, { n: 'Fan coil 55 °C', t: 55, s: 10 }, { n: 'Radiatori 70 °C', t: 70, s: 10 }];
scene.fog.near = 9; scene.fog.far = 30;
// Le superfici bianche e i metalli chiari qui sono grandi: con l'ambiente della scena sfonderebbero nel bagliore. L'intensità dell'ambiente si regola per materiale
// solo se il materiale ha la sua mappa: gliela do io, più bassa.
const ambiente = (keys, k) => { for (const n of keys) { const m = M[n]; m.envMap = scene.environment; m.envMapIntensity = k; } };
ambiente(['sClear', 'sWhite', 'sWhite2', 'sQFront', 'sGrid', 'sKPanel', 'sCof', 'sPP', 'white', 'vesQ', 'vesQ2', 'vesK', 'gauge', 'sQLabel', 'sKLabel', 'sIn', 'sOut', 'grey', 'term'], AMB_B);
ambiente(['galv', 'steel', 'inox', 'alu', 'fin', 'zinc', 'sBugne', 'backK', 'lam'], AMB_M); ambiente(['copper', 'brass'], .6);
// nel Giro dell'acqua restano accesi solo l'acqua e la sua scia: rame, ottone e muri si fanno da parte
let soloNow = 0; const SOLO = [];
function soloAcqua(x) { if (x === soloNow) return; soloNow = x; for (const [m, o] of SOLO) { m.opacity = lerp(1, o, x); const tr = x > .004; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.depthWrite = x < .5; } }
const ground = mesh(new THREE.CircleGeometry(11, 64), new THREE.MeshBasicMaterial({ map: T.ground }), 0, 0, 0, -PI / 2); scene.add(ground);
const shadow = mesh(G.plane(2.1, 1.2), new THREE.MeshBasicMaterial({ map: T.shadow, transparent: true, depthWrite: false }), QX, .004, QZ, -PI / 2); scene.add(shadow);
// scenografia, non pezzi: fuori il basamento in calcestruzzo della pompa di calore, in mezzo il muro esterno della casa tagliato in sezione,
// dentro la parete della lavanderia con caldaia e kit. Ogni faccia è un piano con un lato solo: da dietro non si vede, così la camera può girare intorno alle macchine.
const WX0 = -.06, WX1 = .14, WZ1 = .25, WH = 2.62;
const mMuro = std({ color: 0x9aa0a4, roughness: .95, map: T.muro, bumpMap: T.noise, bumpScale: 1.5 }), mFuori = std({ color: 0xa8a297, roughness: .97, bumpMap: T.noise, bumpScale: 2.2 });
T.sezione = cv(128, 128, (g, w, h) => { g.fillStyle = '#a5a297'; g.fillRect(0, 0, w * .3, h); g.fillStyle = '#6f6660'; g.fillRect(w * .3, 0, w * .62, h); g.fillStyle = '#b3b3ae'; g.fillRect(w * .92, 0, w * .08, h); g.strokeStyle = 'rgba(30,24,20,.32)'; g.lineWidth = 2; for (let i = -h; i < w; i += 14) { g.beginPath(); g.moveTo(w * .3 + Math.max(0, i), Math.max(0, -i)); g.lineTo(Math.min(w * .92, w * .3 + i + h), Math.min(h, h - Math.max(0, i + h - w * .62))); g.stroke(); } g.fillStyle = 'rgba(60,56,40,.35)'; for (let i = 0; i < 70; i++) g.fillRect((i * 37 % 100) / 100 * w * .28, (i * 53 % 100) / 100 * h, 2, 2); });
T.sezione.wrapT = THREE.RepeatWrapping; T.sezione.repeat.set(1, 9);
const mSez = std({ color: 0x9c9c9c, roughness: .95, map: T.sezione });     // sezione del muro più quieta: era una striscia rosso mattone in ogni inquadratura
const muro = mesh(G.plane(1.28, WH), mMuro, WX1 + .64, WH / 2, ZW); scene.add(muro);
scene.add(mesh(G.plane(WZ1 - ZW, WH), mMuro, WX1, WH / 2, (WZ1 + ZW) / 2, 0, PI / 2, 0), mesh(G.plane(WZ1 - ZW, WH), mFuori, WX0, WH / 2, (WZ1 + ZW) / 2, 0, -PI / 2, 0), mesh(G.plane(WX1 - WX0, WH), mSez, (WX0 + WX1) / 2, WH / 2, WZ1));
{ const cap = mesh(G.plane(WX1 - WX0, WZ1 - ZW), std({ color: 0x8c8c88, roughness: .95 }), (WX0 + WX1) / 2, WH, (WZ1 + ZW) / 2, -PI / 2); scene.add(cap);
  SOLO.push([M.copper, .2], [M.brass, .25], [mMuro, .35], [mFuori, .18], [mSez, .18], [cap.material, .18]);
  const pad = mesh(G.rbox(1.34, .004, .7, .002), std({ color: 0x3f4244, roughness: .96, bumpMap: T.noise, bumpScale: 2, envMapIntensity: .2 }), QX, 0, QZ); scene.add(pad);
  const mm = std({ color: 0x3a3d40, roughness: .8 }); for (const [y, z] of [[.368, ZW + HZ], [.533, ZW + HZ + .06]]) for (const x of [WX0 - .003, WX1 + .003]) scene.add(mesh(annulus(.034, .017, .006), mm, x, y, z, 0, 0, PI / 2)); }

function points(n, size, add = true) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size, map: T.glow, vertexColors: true, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending }));
  p.material.onBeforeCompile = sh => { sh.uniforms.uPtMax = PT_MAX; sh.vertexShader = 'uniform float uPtMax;\n' + sh.vertexShader.replace('#include <fog_vertex>', 'gl_PointSize = min( gl_PointSize, uPtMax );\n#include <fog_vertex>'); };
  p.frustumCulled = false; p.userData.size = size; PTS.push(p); return p;
}
// una particella vicinissima alla camera non deve diventare una macchia: grandezza massima in pixel, il 3,5 % dell'altezza dell'immagine
const PTS = [], PT_MAX = { value: 40 }, V2 = new THREE.Vector2();
function ptSizes() { const k = 1 / Math.tan(rad(camera.fov / 2)); for (const p of PTS) p.material.size = p.userData.size * k; PT_MAX.value = Math.max(8, renderer.getDrawingBufferSize(V2).y * .035); }
// i flussi corrono dentro i tubi: li disegno un po' più vicini alla camera, così non restano nascosti dalla parete del tubo
function pushed(p, d = .022) { const prima = p.material.onBeforeCompile; p.material.onBeforeCompile = s => { prima(s); s.vertexShader = s.vertexShader.replace('#include <project_vertex>', `vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\n\tmvPosition.xyz -= normalize( mvPosition.xyz ) * ${d.toFixed(3)};\n\tgl_Position = projectionMatrix * mvPosition;`); }; return p; }
const R0 = rng(99);
// neve
const NS = 1500, snow = points(NS, .015), snowB = new Float32Array(NS * 4); scene.add(snow);
for (let i = 0; i < NS; i++) { snowB[i * 4] = (R0() - .5) * 8; snowB[i * 4 + 1] = R0() * 3.8; snowB[i * 4 + 2] = (R0() - .5) * 6 + 1; snowB[i * 4 + 3] = .45 + R0() * .7; }
function updSnow(now, amt) {
  snow.visible = amt > .01; if (!snow.visible) return; const p = snow.geometry.attributes.position, c = snow.geometry.attributes.color;
  for (let i = 0; i < NS; i++) { const v = snowB[i * 4 + 3], y = ((snowB[i * 4 + 1] - v * now) % 3.8 + 3.8) % 3.8, x = ((snowB[i * 4] + now * .5 * v + Math.sin(now * .7 + i) * .12 + 4) % 8 + 8) % 8 - 4;
    p.setXYZ(i, x, y, snowB[i * 4 + 2]); const k = amt * (.5 + .5 * v) * sm(0, .25, y); c.setXYZ(i, k, k, k * 1.05); }
  p.needsUpdate = c.needsUpdate = true;
}
// aria attraverso batteria e ventilatore della pompa di calore
const airN = new THREE.Group(); airN.position.set(QX, 0, QZ); machine.add(airN);
const NA = 560, air = points(NA, .018), airB = new Float32Array(NA * 5); airN.add(air);
for (let i = 0; i < NA; i++) { airB[i * 5] = R0(); airB[i * 5 + 1] = R0(); airB[i * 5 + 2] = Math.sqrt(R0()); airB[i * 5 + 3] = R0() * PI * 2; airB[i * 5 + 4] = R0(); }
function updAir(now, amt, spd, warmOut) {
  air.visible = amt > .01; if (!air.visible) return; const p = air.geometry.attributes.position, c = air.geometry.attributes.color;
  for (let i = 0; i < NA; i++) {
    const u = (airB[i * 5 + 4] + now * .16 * spd) % 1, z = lerp(-.75, 1.15, u), fr = airB[i * 5 + 2] * .255, fa = airB[i * 5 + 3];
    let x = lerp(-.5, .16, airB[i * 5]), y = lerp(.11, .8, airB[i * 5 + 1]);
    if (z < -.2) { x += (x + .17) * .5 * (-.2 - z); y += (y - .45) * .5 * (-.2 - z); }
    else { const a = fa + Math.max(0, z - .09) * 2.4, r = fr * (1 + Math.max(0, z - .2) * .35), t = sm(-.2, .09, z); x = lerp(x, QFAN.x + Math.cos(a) * r, t); y = lerp(y, QFAN.y + Math.sin(a) * r, t); }
    p.setXYZ(i, x, y, z); const f = amt * sm(0, .12, u) * (1 - sm(.8, 1, u)) * .55, o = sm(-.25, -.1, z);
    if (warmOut) c.setXYZ(i, lerp(.45, 1.1, o) * f, lerp(.7, .5, o) * f, lerp(1, .2, o) * f); else c.setXYZ(i, lerp(.6, .18, o) * f, lerp(.8, .5, o) * f, f * 1.1);
  }
  p.needsUpdate = c.needsUpdate = true;
}
// flussi lungo i tubi: campioni di posizione e colore per ogni tratto
class Flow {
  constructor(parent, n, size, push) { this.pts = pushed(points(n, size), push); this.n = n; parent.add(this.pts); this.ph = new Float32Array(n); this.jit = new Float32Array(n * 3); for (let i = 0; i < n; i++) { this.ph[i] = (i + R0() * .6) / n; for (let k = 0; k < 3; k++) this.jit[i * 3 + k] = (R0() - .5) * .008; } }
  path(segs, S = 420) {
    const cs = segs.map(s => { const c = curveOf(s.rev ? s.pts.slice().reverse() : s.pts); return { c, L: c.getLength(), s }; }), tot = cs.reduce((a, b) => a + b.L, 0);
    const P = new Float32Array(S * 3), C = new Float32Array(S * 3); let k = 0; const marks = [];
    for (const o of cs) { const m = Math.max(2, Math.round(S * o.L / tot)); marks.push(k / S); for (let i = 0; i < m && k < S; i++, k++) { const f = i / (m - 1), v = o.c.getPointAt(f); P[k * 3] = v.x; P[k * 3 + 1] = v.y; P[k * 3 + 2] = v.z; for (let j = 0; j < 3; j++) C[k * 3 + j] = lerp(o.s.c0[j], o.s.c1[j], f); } }
    for (; k < S; k++) for (let j = 0; j < 3; j++) { P[k * 3 + j] = P[(k - 1) * 3 + j]; C[k * 3 + j] = C[(k - 1) * 3 + j]; }
    return { P, C, S, marks, tot };
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
const W0 = [.12, .45, 1.6], W1 = [1.7, .5, .08], WB = [1.9, .22, .04], F0 = [.4, .8, 1.2], F1 = [.06, .3, 1.8], GASC = [1.5, 1.15, .12];
const fRef = new Flow(machine, 430, .02), fCmp = new Flow(cmp, 70, .014), fP = new Flow(machine, 260, .034), fB = new Flow(machine, 150, .03), fI = new Flow(machine, 300, .022), fG = new Flow(machine, 90, .022), fF = new Flow(machine, 130, .04, .045);
const seg = (k, c0, c1, rev) => ({ pts: Array.isArray(k) ? k : PIPE[k], c0, c1, rev: !!rev });
const compW = PIPE.comp.map(qcw);
const hK = (x, y) => [KX + x, HY + y, ZT];          // un punto dentro il kit, alla profondità degli attacchi
const PATH = {
  heat: fRef.path([seg('qa', HOT, HOT), seg('qb', HOT, HOT), seg('qrHx', HOT, WARM), seg('qc', WARM, WARM), seg('qd', WARM, COLD), seg('qcoil', COLD, COOL), seg('qe', COOL, PALE), seg('qf', PALE, PALE), seg(compW, PALE, HOT)]),
  cool: fRef.path([seg('qa', HOT, HOT), seg('qe', HOT, HOT, 1), seg('qcoil', HOT, WARM, 1), seg('qd', WARM, COLD, 1), seg('qc', COLD, COLD, 1), seg('qrHx', COLD, COOL, 1), seg('qb', COOL, PALE, 1), seg('qf', PALE, PALE), seg(compW, PALE, HOT)]),
  cmp: fCmp.path([seg(PIPE.comp, COLD, HOT)]),
  gas: fG.path([seg('lgas', GASC, GASC), seg('kgas', GASC, GASC), seg('kmix', GASC, [.5, .9, 1.9])]),
  fumi: fF.path([seg('kfumi', [1.0, .7, .45], [.75, .75, .8]), seg('fumiExt', [.75, .75, .8], [.4, .4, .45])]),
};
{ const p = (a, b) => fP.path([seg('lRp', a, a, 1), seg('qwIn', a, a), seg('qwHx', a, b), seg('qwA', b, b), seg('qwB', b, b), seg('lMp', b, b)]), i = (a, b) => fI.path([seg('lMi', b, b), seg('lfloor', b, a), seg('lRi', a, a, 1)]);
  PATH.pH = p(W0, W1); PATH.pC = p(F0, F1); PATH.iH = i(W0, W1); PATH.iC = i(F0, F1);
  PATH.b = fB.path([seg('lRc', W0, W0, 1), seg('kret1', W0, W0), seg('kret2', W0, W0), seg('khx', W0, WB), seg('kflow', WB, WB), seg('kmOut', WB, WB), seg('lMc', WB, WB)]);
  // il giro dell'acqua: dal pavimento al kit, nella pompa di calore, di nuovo al kit, nella caldaia, e giù verso il pavimento
  const r = fP.path([seg('lRi', W0, W0, 1), seg([hK(-.1182, .1), hK(-.1182, .19), hK(HK.Rpdc, .29)], W0, W0), seg('lRp', W0, W0, 1), seg('qwIn', W0, W0), seg('qwHx', W0, W1), seg('qwA', W1, W1), seg('qwB', W1, W1), seg('lMp', W1, W1),
    seg([hK(HK.Mpdc, .3), hK(HK.Mpdc, .19), hK(HK.RCal, .19), hK(HK.RCal, .29)], W1, W0), seg('lRc', W0, W0, 1), seg('kret1', W0, W0), seg('kret2', W0, W0), seg('khx', W0, WB), seg('kflow', WB, WB), seg('kmOut', WB, WB), seg('lMc', WB, WB),
    seg([hK(HK.MCal, .3), hK(HK.MCal, .19), hK(.1182, .19), hK(.1182, .1)], WB, W1), seg('lMi', W1, W1), seg([[1.17, .05, -.25], [.22, .05, -.25]], W1, W0)], 900);
  r.curve = new THREE.CatmullRomCurve3(Array.from({ length: 300 }, (_, i) => { const q = Math.round(i / 299 * (r.S - 1)); return V(r.P[q * 3], r.P[q * 3 + 1], r.P[q * 3 + 2]); }), false, 'centripetal'); PATH.ride = r; }
// scintille all'arrivo dei pezzi
const NK = 240, spark = points(NK, .009), spV = new Float32Array(NK * 4); scene.add(spark); let spI = 0;
function emitSpark(pos, n) { const p = spark.geometry.attributes.position; for (let k = 0; k < n; k++) { const i = spI = (spI + 1) % NK; p.setXYZ(i, pos.x, pos.y, pos.z); spV[i * 4] = (Math.random() - .5) * 1.1; spV[i * 4 + 1] = Math.random() * 1.0 + .2; spV[i * 4 + 2] = (Math.random() - .5) * 1.1; spV[i * 4 + 3] = 1; } }
function updSparks(dt) { const p = spark.geometry.attributes.position, c = spark.geometry.attributes.color; for (let i = 0; i < NK; i++) { let l = spV[i * 4 + 3]; if (l <= 0) { c.setXYZ(i, 0, 0, 0); continue; } l -= dt * 2.2; spV[i * 4 + 3] = l; spV[i * 4 + 1] -= dt * 3; p.setXYZ(i, p.getX(i) + spV[i * 4] * dt, Math.max(.005, p.getY(i) + spV[i * 4 + 1] * dt), p.getZ(i) + spV[i * 4 + 2] * dt); const k = Math.max(0, l); c.setXYZ(i, 2.1 * k, 1.0 * k * k, .28 * k * k); } p.needsUpdate = c.needsUpdate = true; }
const ring = mesh(new THREE.RingGeometry(.93, 1, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(.7, 1.4, 1.1), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 0, .01, 0, -PI / 2); scene.add(ring); let ringT = 9;

// ───────── stato dell'impianto in funzione ─────────
// who: 0 fermo · 1 solo pompa di calore · 2 pompa di calore e caldaia · 3 solo caldaia
const S = { ghost: 0, cold: 0, snow: 0, xray: 0, fan: 0, comp: 0, air: 0, ref: 0, watP: 0, watB: 0, watI: 0, boil: 0, E: 0, shr: 1, outT: 10, watT: 35, read: 0, cool: false, demo: 0, who: 1 };
const chi = (outT, cool, on = true, soglia = 5) => !on ? 0 : cool ? 1 : outT < T4HMIN ? 3 : outT < soglia ? 2 : 1;
let fanA = 0, crankA = 0, bfA = 0, lcdK = '';
function applyLook(now, dt) {
  scene.background.lerpColors(C_STUDIO, C_COLD, S.cold); scene.fog.color.copy(scene.background);
  ground.material.color.setRGB(1 + S.cold * .5, 1 + S.cold * 1.1, 1 + S.cold * 1.9); rimL.intensity = 1.5 + S.cold * 1.6; keyL.intensity = 2.3 - S.cold * .7;
  M.heater.emissiveIntensity = S.cold * 1.5;
  setXray(S.xray); setGhost(S.ghost < .003 ? 0 : S.ghost); soloAcqua(S.ghost < .003 ? 0 : S.ghost);
  fanA += dt * S.fan * PI * 2; fanRot.rotation.z = -fanA; crankA += dt * S.comp * PI * 2; crank.rotation.y = crankA; bfA += dt * S.boil * 9 * PI * 2; bFan.rotation.x = bfA;
  const fl = S.boil * (1 - clamp(S.E * 4)); FIAMMA.opacity = fl * (.72 + .28 * Math.sin(now * 31) * Math.sin(now * 13)); fiamma.visible = fl > .01; fiamma.scale.set(1, 1 + .14 * Math.sin(now * 23), 1); M.fibra.emissiveIntensity = fl * 1.4;
  const lk = (S.boil > .5 ? 1 : 0) + '|' + S.watT; if (lk !== lcdK) { lcdK = lk; lcdCaldaia(S.watT, S.boil > .5); }
  updSnow(now, S.snow); updAir(now, S.air, .35 + S.fan * .13, S.cool);
  fRef.upd(now, S.ref, .05 + S.comp * .006, S.cool ? PATH.cool : PATH.heat); fCmp.upd(now, S.demo * .55, .55, PATH.cmp);
  fP.upd(now, S.watP, .07, S.cool ? PATH.pC : PATH.pH); fB.upd(now, S.watB, .13, PATH.b); fI.upd(now, S.watI * .7, .024, S.cool ? PATH.iC : PATH.iH);
  fG.upd(now, S.watB, .2, PATH.gas); fF.upd(now, S.watB * .8, .16, PATH.fumi);
  shadow.material.opacity = .9 * (1 - clamp(S.E * 1.5)) * S.shr;
  updSparks(dt);
  if (ringT < 1) { ringT += dt * 1.6; const k = eoc(clamp(ringT)); ring.scale.setScalar((.3 + k * 1.5) * (ring.userData.k || 1)); ring.material.opacity = (1 - k) * .5; } else ring.material.opacity = 0;
}

// ───────── camera ─────────
const KEYS = [], rig = { t: V(), az: 0, el: 0, w: 2, h: 1.5 }, _a = V(), _b = V(), _o = V();
const K = (t, g, az, el, w, h, off) => KEYS.push({ t, g, az: rad(az), el: rad(el), w, h, off: off || [0, 0, 0] });
const H = (t, hm, az, el, k = 1) => K(t, -1, az, el, hm.w * k, hm.h * k, [hm.off[0] - MC.x, hm.off[1] - MC.y, hm.off[2] - MC.z]);
const TUTTO = { off: MC.toArray(), w: BW, h: BH };
K(0, -1, 10, 6, BW * .92, BH * .9); K(2.3, -1, 16, 8, BW * .84, BH * .82); K(3.25, -1, 22, 13, BW * 1.55, BH * 1.45);
for (const g of GROUPS) {
  const W = g.t1 - g.t0, z = g.size * 2.3 * g.zoom;
  const dx = g.key[0] === 'k' ? .13 * z : 0;      // caldaia e kit un po' a destra: a sinistra restano le didascalie e la pompa di calore esce dal quadro
  if (g.keys) for (const [f, az, el, zm, oy] of g.keys) K(g.t0 + f * W, g.i, az, el, z * zm, z * zm, [dx * zm, oy, 0]);
  else { K(g.t0 + .45, g.i, g.az, g.el, z, z, [dx, 0, 0]); K(g.t0 + .58 * W, g.i, g.az + 14, g.el, z * 1.05, z * 1.05, [dx, 0, 0]); }
  // ritorno alla vista di casa a fine gruppo, ma solo se c'è tempo: con l'ultima chiave a meno di 1,4 s la camera scattava, e allora si va dritti al gruppo dopo
  if (!g.keys || g.t0 + g.keys[g.keys.length - 1][0] * W < g.t1 - 2) H(g.t1 - .6, g.home, (g.keys ? g.keys[g.keys.length - 1][1] : g.az + 14) + 8, 12);
}
H(T_RUN + .9, TUTTO, 8, 10); H(T_RUN + 2.9, qHome, -18, 9, .8); H(T_RUN + 5.0, hHome, 12, 10, .95); H(T_RUN + 7.6, kHome, 16, 6, .8); H(T_RUN + 10.3, TUTTO, -4, 10, .92); H(T_RUN + 12.4, TUTTO, 6, 9); H(T_END + .5, TUTTO, 10, 9);
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
const NR = String(GROUPS.length + 1).padStart(2, '0');
CAPS.push({ t: T_RUN, n: NR, a: 'In funzione', b: 'Fuori ci sono 10 °C: lavora solo la pompa di calore. Prende il calore dall\'aria e scalda l\'acqua del pavimento.' },
  { t: T_RUN + 4.2, n: NR, a: 'Il kit HYBREER', b: 'Qui si incontrano i due generatori. Le valvole di non ritorno impediscono all\'acqua di uno di tornare nell\'altro.' },
  { t: T_RUN + 7.0, n: NR, a: 'Sotto i 5 °C', b: 'Fuori gela: si accende anche la caldaia e lavora insieme alla pompa di calore.' },
  { t: T_RUN + 9.9, n: NR, a: 'Sotto i −15 °C', b: 'La pompa di calore si ferma: la caldaia scalda la casa da sola.' },
  { t: T_RUN + 11.9, n: '', a: 'Unical HYBREER 3', b: 'HP_QOR 70 + KONm C 24 + kit HYBREER · due generatori, un solo impianto, sempre quello che conviene.' });
const el = { cap: $('cap'), num: $('num'), name: $('name'), spec: $('spec'), tick: $('tick'), count: $('count').firstElementChild, hook: $('hook'), hk1: $('hk1'), hk2: $('hk2'), read: $('read'), rOut: $('rOut').lastElementChild, rWat: $('rWat').lastElementChild, rGen: $('rGen').lastElementChild, flash: $('flash'), bottom: $('bottom'), segs: $('segs') };
const SEGS = GROUPS.map(g => [g.t0, g.t1]).concat([[T_RUN, T_END]]);
SEGS.forEach(s => { const i = document.createElement('i'); i.style.flex = String(s[1] - s[0]); i.appendChild(document.createElement('b')); el.segs.appendChild(i); });
let capI = -2, lastCount = -1, lastOut = null, lastWat = null, lastGen = null, hookK = -1;
const fmtT = v => (v < 0 ? '−' : '') + Math.abs(Math.round(v)) + ' °C';
const CHI = ['Tutto fermo', 'Pompa di calore', 'Pompa di calore + caldaia', 'Caldaia'];
function setCap(n, a, b) { el.num.textContent = n; el.name.textContent = a; el.spec.textContent = b; el.tick.textContent = ''; el.cap.classList.remove('in'); void el.cap.offsetWidth; el.cap.classList.add('in'); }
function hud(t) {
  let i = -1; for (let k = 0; k < CAPS.length; k++) if (CAPS[k].t <= t) i = k;
  if (i !== capI) { capI = i; if (i >= 0) setCap(CAPS[i].n, CAPS[i].a, CAPS[i].b); }
  el.cap.style.opacity = t < T_ASM ? 0 : 1;
  const hk = t < 1.55 ? 0 : t < T_ASM - .25 ? 1 : 2;
  if (hk !== hookK) { hookK = hk; el.hk1.textContent = hk === 0 ? '10 °C' : '−5 °C'; el.hk1.style.color = hk === 0 ? 'var(--heat)' : 'var(--ice)'; el.hk2.textContent = hk === 0 ? 'fuori: basta la pompa di calore' : 'fuori: si accende anche la caldaia'; }
  el.hook.style.opacity = hk === 2 ? 0 : hk === 0 ? sm(.1, .5, t) * (1 - sm(1.35, 1.55, t)) : sm(1.55, 1.85, t) * (1 - sm(2.9, 3.2, t));
  el.flash.style.opacity = Math.max(0, 1 - Math.abs(t - T_ASM) / .22) * .9;
  const n = t < T_ASM ? PIECES.length : placed; if (n !== lastCount) { lastCount = n; el.count.textContent = n; }
  SEGS.forEach((s, k) => { el.segs.children[k].firstChild.style.transform = `scaleX(${clamp((t - s[0]) / (s[1] - s[0]))})`; });
  readout();
}
function readout() { el.read.classList.toggle('on', S.read > .5); const o = fmtT(S.outT), w = S.who ? fmtT(S.watT) : '—', g = CHI[S.who]; if (o !== lastOut) el.rOut.textContent = lastOut = o; if (w !== lastWat) el.rWat.textContent = lastWat = w; if (g !== lastGen) { el.rGen.textContent = lastGen = g; el.rGen.dataset.w = S.who; } }
onStart = p => { el.tick.textContent = p.n; el.tick.classList.remove('in'); void el.tick.offsetWidth; el.tick.classList.add('in'); };
let sfx = null;                       // riempito dal modulo dei comandi quando l'audio è attivo
const _w = V();
onLand = p => { _w.copy(p.cresce ? p.punta : p.wc).add(p.g.node.position); if (p.im) { if (Math.random() < .22) emitSpark(_w, 1); } else emitSpark(_w, 4); if (sfx) sfx(p.snd); };

// ───────── linea del tempo del filmato ─────────
const gCmp = GROUPS.find(g => g.key === 'qcomp'), gBru = GROUPS.find(g => g.key === 'kcomb');
function filmState(t, emit) {
  if (t < T_ASM) {
    const E = t < 2.35 ? 0 : 1.25 * eoc(clamp((t - 2.35) / 1.05)), c = sm(1.4, 1.9, t);
    Object.assign(S, { cold: c, snow: c, xray: 0, fan: 3, comp: 0, air: 0, ref: 0, watP: 0, watB: 0, watI: 0, boil: c, E, shr: 1 - sm(3.18, 3.47, t), read: 0, outT: lerp(10, -5, c), watT: 35, demo: 0, who: c > .5 ? 2 : 1, cool: false });
    apply(T_RUN, S.E, S.shr, false);
  } else if (t < T_RUN) {
    const c = 1 - sm(T_ASM, 4.7, t), a = gCmp.t0, b = gBru.t0;
    Object.assign(S, { cold: c, snow: c, xray: 0, fan: 0, comp: 2.2 * sm(a + 1.9, a + 2.7, t) * (1 - sm(a + 4.0, a + 4.7, t)), air: 0, ref: 0, watP: 0, watB: 0, watI: 0, boil: sm(b + 2.4, b + 2.8, t) * (1 - sm(b + 3.5, b + 3.85, t)), E: 0, shr: 1, read: 0, outT: 10, watT: 35,
      demo: sm(a + 2.7, a + 3.1, t) * (1 - sm(a + 3.7, a + 4.0, t)), who: 1, cool: false });
    apply(t, 0, 1, emit);
    if (emit) for (const g of GROUPS) if (g.stage.lengthSq() > 0 && t >= g.tb && t - g.tb < .05 && ringT > .5) { ringT = 0; ring.position.set(g.c.x, .012, Math.max(g.c.z, -.2)); ring.userData.k = clamp(g.size * 1.4, .2, 1); if (sfx) sfx('dock'); }
  } else {
    const r = t - T_RUN, x = sm(.3, 1.5, r) * (1 - sm(11.4, 12.6, r)), cold = sm(6.2, 7.6, r), outT = r < 8.8 ? lerp(10, -3, sm(6.0, 7.4, r)) : lerp(-3, -18, sm(8.9, 10.0, r)), who = chi(Math.round(outT), false), pdc = 1 - sm(9.8, 10.6, r), cal = sm(6.8, 7.6, r);
    Object.assign(S, { cold, snow: cold, xray: x, fan: 6 * sm(.2, 2, r) * pdc, comp: 3 * sm(.6, 2.2, r) * pdc, air: sm(.8, 2, r) * pdc, ref: sm(1.6, 2.6, r) * x * pdc, watP: sm(1.6, 2.6, r) * pdc, watB: cal, watI: sm(2, 3, r), boil: cal, E: 0, shr: 1, read: r > 1 ? 1 : 0,
      outT, watT: 35, demo: 0, who, cool: false });
    apply(T_RUN, 0, 1, false);
  }
}

// ───────── ciclo di disegno ─────────
// Si parte da una schermata d'inizio: il film comincia solo quando chi guarda lo chiede.
const setBody = c => { document.body.className = c; };
let vistaProva = null;       // solo per le prove: inquadratura fissa decisa da fuori
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
  if (vistaProva) { rig.t.set(...vistaProva.t); rig.az = rad(vistaProva.az); rig.el = rad(vistaProva.el); rig.w = vistaProva.w; rig.h = vistaProva.h; placeCam(rig); }
  applyLook(now, playing || mode === 'free' || !started ? dt : 0); draw();
  if (++frames > 20 && frames < 140) { if (dt > .04) slow++; if (frames === 139) { if (slow > 70 && HQ) { HQ = false; renderer.setPixelRatio(1); resize(); ptSizes(); } else if (slow > 24) { renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1.25)); resize(); ptSizes(); } } }
}
// modalità libera: senza il modulo dei comandi resta un modello che gira piano
const free = { az: rad(10), el: rad(9), zoom: 1, t: MC.clone(), auto: true };
function enterFree() {
  const wasFree = mode === 'free'; mode = 'free'; started = true; playing = false; Tm = T_END; filmState(T_END - .001, false); hud(T_END - .001);
  Object.assign(S, { xray: 0, air: 1, fan: 6, comp: 3, ref: 0, watP: 1, watB: 0, watI: 1, boil: 0, cold: 0, snow: 0, outT: 7, watT: 35, read: 1, who: 1 });
  free.az = rig.az % (PI * 2); free.el = rig.el; free.zoom = 1; free.t.copy(MC); free.auto = true;
  setBody('free'); if (!wasFree) { const t = $('toast'); t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); }
  if (typeof uiEnter === 'function') uiEnter(); else freeTick = dt => { free.az += dt * .12; rig.t.copy(free.t); rig.az = free.az; rig.el = free.el; rig.w = BW; rig.h = BH; placeCam(rig); };
}
function startFilm(t = 0) { const wasFree = mode === 'free'; mode = 'film'; started = true; playing = true; Tm = t; capI = -2; for (const p of PIECES) p.st = -1; lastE = -1; setBody('film'); $('bPlay').textContent = 'Pausa'; if (wasFree && typeof uiLeave === 'function') uiLeave(); }
$('bPlay').onclick = () => { playing = !playing; $('bPlay').textContent = playing ? 'Pausa' : 'Riprendi'; };
$('bSkip').onclick = () => enterFree(); $('bGo').onclick = () => startFilm(0); $('bExplore').onclick = () => enterFree();

resize(); mkComposer(); bloom.threshold = 1.4; bloom.strength = .5; M.inox.roughness = .55; M.steel.roughness = .58; M.galv.roughness = .62; M.zinc.roughness = .62; M.alu.roughness = .68; M.black.roughness = .42; M.copper.roughness = .36;     // metalli satinati: niente aloni di bagliore resize(); ptSizes(); new ResizeObserver(() => { resize(); ptSizes(); }).observe(stage);
queueMicrotask(() => { if (typeof initUI === 'function') initUI(); });   // dopo che il modulo dei comandi ha inizializzato le sue variabili
// per le prove: tempo, esplosione e vista comandabili da fuori
window.__ibrido = { GROUPS, PIECES, M, PATH, PIPE, vista(v) { vistaProva = v; }, seek(t) { if (t >= T_END) { if (mode !== 'free') enterFree(); if (freeTick) freeTick(0); } else { if (mode !== 'film' || !started) startFilm(t); playing = false; Tm = t; now = t; filmState(t, false); camFilm(t); hud(t); placeCam(rig); } applyLook(now, 0); draw(); },
  setHQ(v) { HQ = v; }, get bloom() { return bloom; }, step(n = 30, dt = .1) { for (let i = 0; i < n; i++) { now += dt; if (mode === 'free' && freeTick) freeTick(dt); applyLook(now, dt); } draw(); }, S, rig, free, placeCam, draw, applyLook, apply, get mode() { return mode; }, pieces: PIECES.length,
  groups: GROUPS.map(g => [g.key, g.pieces.length, +g.size.toFixed(2)]), T_END, T_RUN,
  stato: () => ({ mode: started ? mode : 'start', t: +Tm.toFixed(2), pezzi: PIECES.length, gruppi: GROUPS.length, posati: placed, who: S.who, outT: Math.round(S.outT), watT: S.watT, cool: S.cool, fan: +S.fan.toFixed(2), boil: +S.boil.toFixed(2), xray: +S.xray.toFixed(2), E: +S.E.toFixed(3), calls: renderer.info.render.calls }) };
requestAnimationFrame(frame);
