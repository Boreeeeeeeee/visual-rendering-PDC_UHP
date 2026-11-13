// ───────── Pagine prodotto · camera, didascalie e film (dopo i pezzi del prodotto) ─────────
// Il prodotto, nei suoi file, ha già costruito i pezzi (group, P, PIN, screws, finalize) e ha definito CFG:
//   id, nome, modello, sub, start { k, p, dur }           testi della pagina
//   T_ASM, T_RUN, T_END, MC, BW, BH                       tempi del film (aggancio, montaggio, funzionamento) e inquadratura d'insieme
//   ganci [[t0, t1, grande, colore, piccolo], ...]        le scritte dell'aggancio iniziale
//   letture [[etichetta, S => testo, colore, classe], ...] i numeri in alto a sinistra
//   caps [[dt, titolo, testo], ...]                       didascalie della parte in funzione (dt dopo T_RUN); l'ultima senza numero è la firma
//   S                                                     stato visivo (deve avere xray, ghost, E, shr, read)
//   film(t, fase)                                         riempie S: fase 0 aggancio, 1 montaggio, 2 in funzione
//   look(now, dt)                                         applica S alla scena (rotazioni, flussi, luci)
//   libero()                                              stato all'ingresso nella parte libera
//   scossa(t), dx(g), stato()                             facoltativi
const { T_ASM, T_RUN, T_END, MC, BW, BH } = CFG, S = CFG.S;
$('bN').innerHTML = CFG.nome + ' <span>' + CFG.modello + '</span>'; $('bSub').textContent = CFG.sub; $('sK').textContent = CFG.start.k; $('sP').textContent = CFG.start.p; $('sDur').textContent = CFG.start.dur;
CFG.letture.forEach(([l, , col, cls]) => { const d = document.createElement('div'); if (cls) d.className = cls; const s = document.createElement('small'), b = document.createElement('b'); s.textContent = l; if (col) b.style.color = col; d.append(s, b); $('read').appendChild(d); });

// ───────── camera ─────────
const KEYS = [], rig = { t: V(), az: 0, el: 0, w: 2, h: 1.5 }, _a = V(), _b = V(), _o = V();
const K = (t, g, az, el, w, h, off) => KEYS.push({ t, g, az: rad(az), el: rad(el), w, h, off: off || [0, 0, 0] });
const H = (t, hm, az, el, k = 1) => K(t, -1, az, el, hm.w * k, hm.h * k, [hm.off[0] - MC.x, hm.off[1] - MC.y, hm.off[2] - MC.z]);
const TUTTO = { off: MC.toArray(), w: BW, h: BH };
K(0, -1, 10, 6, BW * .92, BH * .9); K(T_ASM - 1.2, -1, 16, 8, BW * .84, BH * .82); K(T_ASM - .25, -1, 22, 13, BW * 1.55, BH * 1.45);
for (const g of GROUPS) {
  const W = g.t1 - g.t0, z = g.size * 2.3 * g.zoom, dx = CFG.dx ? CFG.dx(g) * z : 0, hm = g.home || TUTTO;
  if (g.keys) for (const [f, az, el, zm, oy] of g.keys) K(g.t0 + f * W, g.i, az, el, z * zm, z * zm, [dx * zm, oy, 0]);
  else { K(g.t0 + .45, g.i, g.az, g.el, z, z, [dx, 0, 0]); K(g.t0 + .58 * W, g.i, g.az + 14, g.el, z * 1.05, z * 1.05, [dx, 0, 0]); }
  H(g.t1 - .6, hm, (g.keys ? g.keys[g.keys.length - 1][1] : g.az + 14) + 8, 12);
}
if (CFG.camRun) CFG.camRun(H, TUTTO); else { H(T_RUN + .9, TUTTO, 8, 10); H((T_RUN + T_END) / 2, TUTTO, -6, 10, .9); }
H(T_END + .5, TUTTO, 10, 9);
function keyTarget(k, out) { if (k.g < 0) out.copy(MC); else { const g = GROUPS[k.g]; out.copy(g.node.position).add(g.c); } return out.add(_o.set(k.off[0], k.off[1], k.off[2])); }
function camFilm(t) {
  let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1].t <= t) i++;
  const a = KEYS[i], b = KEYS[i + 1], u = sm(a.t, b.t, t);
  keyTarget(a, _a); keyTarget(b, _b); rig.t.lerpVectors(_a, _b, u); rig.az = lerp(a.az, b.az, u) + Math.sin(t * .6) * .02; rig.el = lerp(a.el, b.el, u); rig.w = lerp(a.w, b.w, u); rig.h = lerp(a.h, b.h, u);
  let sh = 0; for (const g of GROUPS) if (t > g.tb && g.stage.lengthSq() > 0) sh = Math.max(sh, Math.exp(-(t - g.tb) * 9));
  if (t > T_ASM - 1.15 && t < T_ASM) sh = Math.max(sh, Math.exp(-(t - T_ASM + 1.15) * 5));
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
CFG.caps.forEach(([dt, a, b], i) => CAPS.push({ t: T_RUN + dt, n: i === CFG.caps.length - 1 ? '' : NR, a, b }));
const el = { cap: $('cap'), num: $('num'), name: $('name'), spec: $('spec'), tick: $('tick'), count: $('count').firstElementChild, hook: $('hook'), hk1: $('hk1'), hk2: $('hk2'), read: $('read'), flash: $('flash'), segs: $('segs') };
const SEGS = GROUPS.map(g => [g.t0, g.t1]).concat([[T_RUN, T_END]]);
SEGS.forEach(s => { const i = document.createElement('i'); i.style.flex = String(s[1] - s[0]); i.appendChild(document.createElement('b')); el.segs.appendChild(i); });
let capI = -2, lastCount = -1, hookK = -2; const lastR = [];
const fmtT = v => (v < 0 ? '−' : '') + Math.abs(Math.round(v)) + ' °C';
function setCap(n, a, b) { el.num.textContent = n; el.name.textContent = a; el.spec.textContent = b; el.tick.textContent = ''; el.cap.classList.remove('in'); void el.cap.offsetWidth; el.cap.classList.add('in'); }
function hud(t) {
  let i = -1; for (let k = 0; k < CAPS.length; k++) if (CAPS[k].t <= t) i = k;
  if (i !== capI) { capI = i; if (i >= 0) setCap(CAPS[i].n, CAPS[i].a, CAPS[i].b); }
  el.cap.style.opacity = t < T_ASM ? 0 : 1;
  let hk = -1; CFG.ganci.forEach((h, k) => { if (t >= h[0] && t < h[1]) hk = k; });
  if (hk !== hookK) { hookK = hk; if (hk >= 0) { const h = CFG.ganci[hk]; el.hk1.textContent = h[2]; el.hk1.style.color = h[3]; el.hk2.textContent = h[4]; } }
  el.hook.style.opacity = hk < 0 ? 0 : sm(CFG.ganci[hk][0], CFG.ganci[hk][0] + .35, t) * (1 - sm(CFG.ganci[hk][1] - .25, CFG.ganci[hk][1], t));
  el.flash.style.opacity = Math.max(0, 1 - Math.abs(t - T_ASM) / .22) * .9;
  const n = t < T_ASM ? PIECES.length : placed; if (n !== lastCount) { lastCount = n; el.count.textContent = n; }
  SEGS.forEach((s, k) => { el.segs.children[k].firstChild.style.transform = `scaleX(${clamp((t - s[0]) / (s[1] - s[0]))})`; });
  readout();
}
function readout() { el.read.classList.toggle('on', S.read > .5); CFG.letture.forEach(([, f], i) => { const v = f(S); if (v !== lastR[i]) { lastR[i] = v; el.read.children[i].lastChild.textContent = v; } }); }
onStart = p => { el.tick.textContent = p.n; el.tick.classList.remove('in'); void el.tick.offsetWidth; el.tick.classList.add('in'); };
let sfx = null;                       // riempito dal modulo dei comandi quando l'audio è attivo
const _w = V();
onLand = p => { _w.copy(p.wc).add(p.g.node.position); if (p.im) { if (Math.random() < .22) emitSpark(_w, 1); } else emitSpark(_w, 4); if (sfx) sfx(p.snd); };

// ───────── linea del tempo del filmato ─────────
function filmState(t, emit) {
  if (t < T_ASM) { CFG.film(t, 0); apply(T_RUN, S.E, S.shr, false); }
  else if (t < T_RUN) {
    CFG.film(t, 1); apply(t, 0, 1, emit);
    if (emit) for (const g of GROUPS) if (g.stage.lengthSq() > 0 && t >= g.tb && t - g.tb < .05 && ringT > .5) { ringT = 0; ring.position.set(g.c.x, .012, g.c.z); if (sfx) sfx('dock'); }
  } else { CFG.film(t, 2); apply(T_RUN, 0, 1, false); }
}
function applyLook(now, dt) {
  setXray(S.xray); setGhost(S.ghost < .003 ? 0 : S.ghost); soloAcqua(S.ghost < .003 ? 0 : S.ghost);
  CFG.look(now, dt); updSparks(dt);
  if (ringT < 1) { ringT += dt * 1.6; const k = eoc(clamp(ringT)); ring.scale.setScalar(.3 + k * 1.5); ring.material.opacity = (1 - k) * .8; } else ring.material.opacity = 0;
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
  S.xray = 0; S.ghost = 0; S.read = 1; CFG.libero();
  free.az = rig.az % (PI * 2); free.el = rig.el; free.zoom = 1; free.t.copy(MC); free.auto = true;
  setBody('free'); if (!wasFree) { const t = $('toast'); t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); }
  if (typeof uiEnter === 'function') uiEnter(); else freeTick = dt => { free.az += dt * .12; rig.t.copy(free.t); rig.az = free.az; rig.el = free.el; rig.w = BW; rig.h = BH; placeCam(rig); };
}
function startFilm(t = 0) { const wasFree = mode === 'free'; mode = 'film'; started = true; playing = true; Tm = t; capI = -2; for (const p of PIECES) p.st = -1; lastE = -1; setBody('film'); $('bPlay').textContent = 'Pausa'; if (wasFree && typeof uiLeave === 'function') uiLeave(); }
$('bPlay').onclick = () => { playing = !playing; $('bPlay').textContent = playing ? 'Pausa' : 'Riprendi'; };
$('bSkip').onclick = () => enterFree(); $('bGo').onclick = () => startFilm(0); $('bExplore').onclick = () => enterFree();

resize(); mkComposer(); bloom.threshold = 1.4; bloom.strength = .5; M.inox.roughness = .38; resize(); ptSizes(); new ResizeObserver(() => { resize(); ptSizes(); }).observe(stage);
queueMicrotask(() => { if (typeof initUI === 'function') initUI(); });   // dopo che il modulo dei comandi ha inizializzato le sue variabili
// per le prove: tempo, esplosione e vista comandabili da fuori
window['__' + CFG.id] = { GROUPS, PIECES, M, PIPE, CFG, vista(v) { vistaProva = v; },
  seek(t) { if (t >= T_END) { if (mode !== 'free') enterFree(); if (freeTick) freeTick(.016); } else { if (mode !== 'film' || !started) startFilm(t); playing = false; Tm = t; now = t; filmState(t, false); camFilm(t); hud(t); placeCam(rig); } applyLook(now, 0); draw(); },
  setHQ(v) { HQ = v; }, step(n = 30, dt = .1) { for (let i = 0; i < n; i++) { now += dt; if (mode === 'free' && freeTick) freeTick(dt); applyLook(now, dt); } draw(); }, S, rig, free, placeCam, draw, applyLook, apply, get mode() { return mode; }, pieces: PIECES.length,
  groups: GROUPS.map(g => [g.key, g.pieces.length, +g.size.toFixed(2)]), T_END, T_RUN,
  stato: () => Object.assign({ mode: started ? mode : 'start', t: +Tm.toFixed(2), pezzi: PIECES.length, gruppi: GROUPS.length, posati: placed, xray: +S.xray.toFixed(2), E: +S.E.toFixed(3), calls: renderer.info.render.calls }, CFG.stato ? CFG.stato() : {}) };
requestAnimationFrame(frame);
