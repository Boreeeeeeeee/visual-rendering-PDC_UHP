// ───────── Pagine prodotto · parte libera: gli strumenti, uno alla volta (come nella UHP) ─────────
// Dal prodotto (CFG): short { chiave del gruppo: nome corto }, gusci [chiavi degli involucri], aperti [gruppi che non serve rendere trasparenti],
//   strumenti [...]: 'touch', 'expl', { k: 'xray', nota }, { k: 'ride', titolo, path(), vel, frasi [[tratto, testo]], fine, inizio },
//                    oppure uno suo { k, nome, icona (path SVG), html, init(), entra(), esce() },
//   tick(dt, { U, ease, inner, inside, calm }) lo stato dell'impianto nella parte libera, entra(U) all'ingresso, ronzio(S) per l'audio.
const U = { tool: 'touch', E: 0, Ecur: 0, lens: false, lensAuto: true, lx: -1, ly: -1, ride: false, ru: 0, rinit: true, sel: -1, selK: 0, snd: false, vkey: '' };
const IMS = []; machine.traverse(o => { if (o.isInstancedMesh) IMS.push(o); });
const comet = pushed(points(40, .03), .04); comet.visible = false; machine.add(comet); const camP = V(), camL = V();
const ray = new THREE.Raycaster(), ptr = new Map(), _n = new THREE.Vector2(), _t = V(), _d = V();
const TOOLS = CFG.strumenti.map(t => typeof t === 'string' ? { k: t } : t), RIDE = TOOLS.find(t => t.k === 'ride') || null;
const ICONE = {
  touch: ['Tocca', '<circle cx="12" cy="14" r="2.6"/><path d="M7.5 9.5a6.4 6.4 0 0 1 9 0M4.6 6.6a10.5 10.5 0 0 1 14.8 0"/>'],
  expl: ['Smonta', '<rect x="9" y="9" width="6" height="6" rx="1"/><path d="M8 8 3.5 3.5M16 8l4.5-4.5M8 16l-4.5 4.5M16 16l4.5 4.5M3.5 3.5h3M3.5 3.5v3M20.5 3.5h-3M20.5 3.5v3M3.5 20.5h3M3.5 20.5v-3M20.5 20.5h-3M20.5 20.5v-3"/>'],
  xray: ['Raggi X', '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M7.5 10.5h6M10.5 7.5v6"/>'],
  ride: ['Giro', '<path d="M5 8c0-3.4 14-3.4 14 0S5 12.6 5 16s14 3.4 14 0"/><circle cx="19" cy="16" r="1.8" fill="currentColor"/>'],
};
const press = (b, v) => b.setAttribute('aria-pressed', v ? 'true' : 'false');
const fill = i => i.style.setProperty('--p', ((i.value - i.min) / (i.max - i.min) * 100) + '%');
const setE = v => { U.E = v / 100; $('sE').value = v; $('oE').textContent = Math.round(v) + '%'; fill($('sE')); };

// audio sintetizzato: piccoli scatti all'arrivo dei pezzi, ventilatore e compressore in funzione
let AC = null, humF = null, humC = null, lastS = 0;
function audioOn(v) {
  U.snd = v; press($('bSnd'), v); press($('bSnd2'), v);
  if (!v) { sfx = null; if (AC) AC.suspend(); return; }
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)(); const out = AC.createGain(); out.gain.value = .5; out.connect(AC.destination); AC.out = out;
      const nb = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const ns = AC.createBufferSource(); ns.buffer = nb; ns.loop = true; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = .6; humF = AC.createGain(); humF.gain.value = 0; ns.connect(bp).connect(humF).connect(out); ns.start(); humF.bp = bp;
      const os = AC.createOscillator(); os.type = 'sawtooth'; os.frequency.value = 55; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 190; humC = AC.createGain(); humC.gain.value = 0; os.connect(lp).connect(humC).connect(out); os.start(); humC.os = os;
    }
    AC.resume();
    sfx = k => {
      const t = AC.currentTime; if (t - lastS < (k === 'fin' ? .05 : .02)) return; lastS = t;
      const blip = (f, dur, g, type = 'triangle', at = 0) => { const o = AC.createOscillator(), a = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t + at); o.frequency.exponentialRampToValueAtTime(f * .5, t + at + dur); a.gain.setValueAtTime(g, t + at); a.gain.exponentialRampToValueAtTime(.0008, t + at + dur); o.connect(a).connect(AC.out); o.start(t + at); o.stop(t + at + dur + .02); };
      if (k === 'fin' || k === 'tick') blip(2200 + Math.random() * 1600, .03, .05);
      else if (k === 'screw') { blip(1500, .025, .07, 'square'); blip(1700, .025, .06, 'square', .05); blip(1900, .03, .06, 'square', .1); }
      else if (k === 'dock') { blip(90, .35, .5, 'sine'); blip(320, .12, .12, 'triangle'); }
      else { blip(620 + Math.random() * 500, .07, .13); blip(2400, .02, .04, 'square'); }
    };
  } catch (e) { U.snd = false; sfx = null; press($('bSnd'), false); press($('bSnd2'), false); }
}
function audioTick() { if (!AC || !U.snd || !CFG.ronzio) return; const t = AC.currentTime, vis = mode === 'film' ? (!started ? 0 : Tm < T_ASM ? .5 : Tm > T_RUN ? 1 : 0) : 1, [f, c] = CFG.ronzio(S); humF.gain.setTargetAtTime(Math.min(.2, f * .028) * vis, t, .15); humF.bp.frequency.setTargetAtTime(240 + f * 60, t, .2); humC.gain.setTargetAtTime(Math.min(.09, c * .025) * vis, t, .15); humC.os.frequency.setTargetAtTime(38 + c * 9, t, .2); }

// scheda del gruppo
function closeCard() { U.sel = -1; $('cardIn').hidden = true; $('howTouchRow').hidden = false; for (const c of $('chips').children) press(c, false); }
function openCard(i) {
  const g = GROUPS[i]; U.sel = i; free.auto = false;
  $('cK').textContent = `Gruppo ${i + 1} di ${GROUPS.length} · ${g.pieces.length} pezzi`; $('cT').textContent = g.name; $('cE').textContent = g.info.e; $('cS').textContent = g.info.s;
  $('cardIn').hidden = false; $('howTouchRow').hidden = true; [...$('chips').children].forEach((c, k) => { press(c, k === i); if (k === i) c.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); });
}
function pick(x, y) {
  const r = canvas.getBoundingClientRect(); _n.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(_n, camera);
  for (const im of IMS) im.boundingSphere = null;
  for (const h of ray.intersectObject(machine, true)) { const o = h.object; if (o.isPoints || o.userData.g === undefined || !o.visible) continue; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (S.xray > .5 && XRM.includes(m)) continue; return o.userData.g; }
  return -1;
}
function setLens(on) { U.lens = on; $('lens').style.display = on ? 'block' : 'none'; if (on) { U.lensAuto = true; } else LENS.value.z = 0; }
function setRide(on) {
  if (!RIDE) return; U.ride = on;
  if (on) { U.ru = 0; U.rinit = true; camera.fov = 44; camera.updateProjectionMatrix(); ptSizes(); $('bRideGo').textContent = 'Ferma'; $('rT').textContent = RIDE.inizio || ''; }
  else { comet.visible = false; resize(); U.vkey = ''; ptSizes(); $('bRideGo').textContent = 'Rifai il giro'; }
}
function setTool(t) {
  const prima = TOOLS.find(x => x.k === U.tool);
  if (U.tool === 'expl' && t !== 'expl') setE(0);
  if (U.tool === 'xray' && t !== 'xray') setLens(false);
  if (U.ride && t !== 'ride') setRide(false);
  if (prima && prima.esce && t !== U.tool) prima.esce();
  if (t !== 'touch') closeCard();
  U.tool = t; free.auto = false;
  for (const b of $('tabs').children) b.setAttribute('aria-selected', b.dataset.tool === t ? 'true' : 'false');
  for (const x of TOOLS) $('p_' + x.k).hidden = x.k !== t;
  if (t === 'expl') setE(55);                                   // ogni strumento si mostra da solo appena scelto
  if (t === 'xray') setLens(true);
  if (t === 'ride') setRide(true);
  const ora = TOOLS.find(x => x.k === t); if (ora && ora.entra) ora.entra();
}

function uiTick(dt) {
  U.Ecur += (U.E - U.Ecur) * Math.min(1, dt * 4.5); if (Math.abs(U.E - U.Ecur) < .0005) U.Ecur = U.E;
  U.selK += ((U.sel >= 0 ? 1 : 0) - U.selK) * Math.min(1, dt * 5);
  apply(T_RUN, U.Ecur, 1, false); S.E = U.Ecur;
  if (U.sel >= 0 && U.selK > .001) { const g = GROUPS[U.sel]; _d.copy(g.ex); if (_d.lengthSq() < .01) _d.set(0, 0, 0); else _d.normalize(); g.node.position.addScaledVector(_d, .16 * U.selK * (1 - U.Ecur)); }
  const ease = (key, v, r = 1.6) => { S[key] += (v - S[key]) * Math.min(1, dt * r); };
  const g0 = U.sel >= 0 ? GROUPS[U.sel] : null, inner = !!g0 && !CFG.gusci.includes(g0.key) && !(CFG.aperti || []).includes(g0.key), inside = U.lens || U.ride || inner, calm = 1 - clamp(U.Ecur * 4);
  ease('xray', U.ride ? 1 : inner ? .92 : 0, 4); ease('ghost', U.ride ? 1 : 0, 3);
  CFG.tick(dt, { U, ease, inner, inside, calm }); S.read = 1; readout();
  // la barra degli strumenti copre il fondo (o, col telefono in orizzontale, il fianco destro): sposto il modello nella parte libera
  const r = stage.getBoundingClientRect(), dk = $('dock'), side = dk.offsetWidth < r.width - 4, dockH = side ? 0 : dk.offsetHeight, fr = Math.min(.46, dockH / Math.max(1, r.height)), fx = side ? Math.min(.5, dk.offsetWidth / Math.max(1, r.width)) : 0;
  { const key = fx + ':' + r.width + ':' + r.height; if (key !== U.vkey) { U.vkey = key; if (fx) camera.setViewOffset(r.width, r.height, r.width * fx / 2, 0, r.width, r.height); else camera.clearViewOffset(); } }
  if (!U.ride) {
    if (free.auto) free.az = rad(8) + Math.sin(now * .22) * rad(26);
    const g = g0; _t.copy(g ? _d.copy(g.node.position).add(g.c) : MC); free.t.lerp(_t, Math.min(1, dt * 4));
    const zs = g && !(CFG.aperti || []).includes(g.key) ? Math.max(.24, g.size * 2.5 / BW) : 1 + U.Ecur * .55;
    rig.az = free.az; rig.el = free.el; rig.w += (BW * zs * free.zoom / (1 - fx) - rig.w) * Math.min(1, dt * 4); rig.h += (BH * zs * free.zoom / (1 - fr) - rig.h) * Math.min(1, dt * 4); rig.t.copy(free.t); rig.t.y -= fr * rig.h * .5; placeCam(rig);
  } else {
    const pa = RIDE.path(); U.ru += dt * (RIDE.vel || .6) / pa.tot;
    if (U.ru >= 1) { setRide(false); $('rT').textContent = RIDE.fine; $('rP').style.width = '100%'; }
    else {
      // camera da inseguimento: sta davanti al punto che corre nei tubi e lo segue con un po' di ritardo
      const p = pa.curve.getPointAt(U.ru), dd = RIDE.dist || [.95, 1.4]; _d.set(.22, .16, 1).normalize(); _t.copy(p).addScaledVector(_d, camera.aspect < 1 ? dd[1] : dd[0]); _t.y = Math.max(.12, _t.y);
      if (U.rinit) { camP.copy(_t); camL.copy(p); U.rinit = false; } else { camP.lerp(_t, Math.min(1, dt * 2)); camL.lerp(p, Math.min(1, dt * 5)); }
      camera.position.copy(camP); camera.lookAt(camL.x, camL.y - fr * .34, camL.z);
      const cp = comet.geometry.attributes.position, cc = comet.geometry.attributes.color; comet.visible = true;
      for (let i = 0; i < 40; i++) { const u = Math.max(0, U.ru - i * .0007), f = u * (pa.S - 1), a = f | 0, b2 = Math.min(pa.S - 1, a + 1), t = f - a, kk = 1 - i / 40;
        cp.setXYZ(i, lerp(pa.P[a * 3], pa.P[b2 * 3], t), lerp(pa.P[a * 3 + 1], pa.P[b2 * 3 + 1], t), lerp(pa.P[a * 3 + 2], pa.P[b2 * 3 + 2], t)); cc.setXYZ(i, (pa.C[a * 3] + .5) * kk, (pa.C[a * 3 + 1] + .5) * kk, (pa.C[a * 3 + 2] + .5) * kk); }
      cp.needsUpdate = cc.needsUpdate = true;
      let s = 0; for (let i = 0; i < pa.marks.length; i++) if (pa.marks[i] <= U.ru) s = i; let txt = RIDE.frasi[0][1]; for (const [m, tx] of RIDE.frasi) if (m <= s) txt = tx;
      if ($('rT').textContent !== txt) $('rT').textContent = txt; $('rP').style.width = (U.ru * 100).toFixed(1) + '%';
    }
  }
  // lente: finché nessuno la tocca passa da sola sul prodotto, per far capire cosa fa
  if (U.lens) {
    const R = Math.min(r.width * (1 - fx), r.height - dockH) * .2, pr = renderer.getPixelRatio(), L = $('lens'), cy = (r.height - dockH) * .5;
    if (U.lensAuto) { U.lx = r.width * (1 - fx) * (.5 + .24 * Math.sin(now * .7)); U.ly = cy + (r.height - dockH) * .16 * Math.sin(now * 1.1 + 1); }
    LENS.value.set(U.lx * pr, (r.height - U.ly) * pr, R * pr); L.style.width = L.style.height = R * 2 + 'px'; L.style.transform = `translate(${U.lx - R}px, ${U.ly - R}px)`;
  }
  audioTick();
}
function uiEnter() {
  freeTick = uiTick; U.Ecur = 0; setE(0); rig.w = BW; rig.h = BH; if (CFG.entra) CFG.entra(U);
  setTool('touch'); free.auto = true;
  [...$('tabs').children].forEach((b, i) => { b.classList.remove('pulse'); setTimeout(() => { b.classList.add('pulse'); }, 1500 + i * 130); });
}
function uiLeave() { camera.clearViewOffset(); U.vkey = ''; if (U.lens) setLens(false); if (U.ride) setRide(false); const t = TOOLS.find(x => x.k === U.tool); if (t && t.esce) t.esce(); closeCard(); setE(0); S.ghost = 0; resize(); ptSizes(); freeTick = null; }

function initUI() {
  // schede e pannelli degli strumenti
  $('pTouch').id = 'p_touch'; $('pExpl').id = 'p_expl'; $('pXray').id = 'p_xray'; $('pRide').id = 'p_ride';
  for (const t of TOOLS) {
    const [nome, ico] = ICONE[t.k] || [t.nome, t.icona.startsWith('<') ? t.icona : `<path d="${t.icona}"/>`], b = document.createElement('button');
    b.className = 'tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.tool = t.k; b.setAttribute('aria-selected', 'false'); b.innerHTML = `<svg viewBox="0 0 24 24">${ico}</svg>${t.nome || nome}`; b.onclick = () => setTool(t.k); $('tabs').appendChild(b);
    if (!ICONE[t.k]) { const s = document.createElement('section'); s.id = 'p_' + t.k; s.hidden = true; s.innerHTML = t.html; $('panel').appendChild(s); }
  }
  for (const k of ['touch', 'expl', 'xray', 'ride']) if (!TOOLS.find(t => t.k === k)) $('p_' + k).remove();
  $('tabs').style.setProperty('--n', TOOLS.length);
  $('nP').textContent = PIECES.length;
  $('howTouch').textContent = COARSE ? 'Trascina per girare, pizzica per avvicinarti. Tocca un pezzo per sapere cos\'è.' : 'Trascina per girare, rotella per avvicinarti. Clicca un pezzo per sapere cos\'è.';
  const tx = TOOLS.find(t => t.k === 'xray'); if (tx) { $('howX').textContent = (COARSE ? 'Muovi il dito' : 'Muovi il mouse') + ': dentro il cerchio lo vedi lavorare.'; $('xNote').textContent = tx.nota || ''; }
  if (RIDE) $('rK').textContent = RIDE.titolo;
  GROUPS.forEach((g, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = CFG.short[g.key] || g.name; b.setAttribute('aria-pressed', 'false'); b.onclick = () => (U.sel === i ? closeCard() : openCard(i)); $('chips').appendChild(b); });
  for (const t of TOOLS) if (t.init) t.init();
  // orbita, zoom, tocco
  let down = null, pinch = 0;
  const lensTo = e => { const r = stage.getBoundingClientRect(); U.lensAuto = false; U.lx = e.clientX - r.left; U.ly = e.clientY - r.top - (e.pointerType === 'mouse' ? 0 : Math.min(r.width, r.height) * .17); };   // col dito la lente sta sopra, per non coprirla
  stage.addEventListener('pointerdown', e => { if (mode !== 'free' || e.target.closest('#dock,#freetop')) return; ptr.set(e.pointerId, [e.clientX, e.clientY]); down = { t: performance.now(), far: 0 }; if (ptr.size === 2) { const a = [...ptr.values()]; pinch = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); } if (U.lens && ptr.size === 1) lensTo(e); try { stage.setPointerCapture(e.pointerId); } catch (err) {} });
  stage.addEventListener('pointermove', e => {
    if (mode !== 'free') return;
    if (U.lens && ptr.size < 2 && (ptr.has(e.pointerId) || (e.pointerType === 'mouse' && !e.target.closest('#dock,#freetop')))) { lensTo(e); if (down) down.far = 99; const p0 = ptr.get(e.pointerId); if (p0) { p0[0] = e.clientX; p0[1] = e.clientY; } return; }
    const p = ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p[0], dy = e.clientY - p[1]; p[0] = e.clientX; p[1] = e.clientY; if (down) down.far += Math.abs(dx) + Math.abs(dy);
    if (U.ride) return;
    if (ptr.size === 2) { const a = [...ptr.values()], d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); if (pinch > 0) free.zoom = clamp(free.zoom * pinch / d, .22, 1.7); pinch = d; free.auto = false; }
    else { free.az -= dx * .007; free.el = clamp(free.el + dy * .005, rad(-2), rad(62)); free.auto = false; }
  });
  const up = e => {
    if (!ptr.has(e.pointerId)) return; ptr.delete(e.pointerId); pinch = 0;
    if (down && down.far < 8 && performance.now() - down.t < 450 && U.tool !== 'expl' && U.tool !== 'xray' && !U.ride) { const g = pick(e.clientX, e.clientY); if (g >= 0 && g !== U.sel) { if (U.tool !== 'touch') setTool('touch'); openCard(g); } else if (U.tool === 'touch') closeCard(); }
    if (ptr.size === 0) down = null;
  };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', e => { if (mode !== 'free' || U.ride || e.target.closest('#dock')) return; e.preventDefault(); free.zoom = clamp(free.zoom * Math.exp(e.deltaY * .0012), .22, 1.7); free.auto = false; }, { passive: false });
  $('sE').addEventListener('input', e => setE(+e.target.value));
  if (RIDE) $('bRideGo').onclick = () => setRide(!U.ride);
  $('bSnd').onclick = $('bSnd2').onclick = () => audioOn(!U.snd); $('bFilm').onclick = () => startFilm(0);
  window.__ui = { U, setTool, openCard, closeCard, pick, uiTick };
}
