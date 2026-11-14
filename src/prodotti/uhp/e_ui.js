
// ───────── modalità libera: sei strumenti, uno alla volta ─────────
const U = { tool: 'touch', E: 0, Ecur: 0, lens: false, lensAuto: true, lx: -1, ly: -1, ride: false, ru: 0, rinit: true, on: true, silent: false, power: false, outT: 7, sel: -1, selK: 0, frostT: 0, defrost: false, snd: false };
const IMS = []; machine.traverse(o => { if (o.isInstancedMesh) IMS.push(o); });
const comet = pushed(points(36, .04), .03); comet.visible = false; machine.add(comet); const camP = V(), camL = V();
const ray = new THREE.Raycaster(), ptr = new Map(), _n = new THREE.Vector2(), _t = V(), _d = V();
const RIDE = [[0, 'Dal compressore esce gas caldo, ad alta pressione'], [2, 'Scambiatore a piastre: il calore passa all\'acqua di casa'], [3, 'Il gas, ceduto il calore, è diventato liquido'], [4, 'Valvola di espansione: si raffredda di colpo'], [5, 'Batteria: riprende calore dall\'aria esterna'], [6, 'Torna al compressore'], [8, 'Compressore: le due camere lo schiacciano di nuovo']];
const SHORT = { base: 'Basamento', comp: 'Compressore', coil: 'Batteria', fan: 'Ventilatore', hyd: 'Scambiatore', ref: 'Circuito del gas', el: 'Quadri elettrici', shell: 'Involucro' };
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
function audioTick() { if (!AC || !U.snd) return; const t = AC.currentTime, vis = mode === 'film' ? (!started ? 0 : Tm < T_ASM ? .5 : Tm > T_RUN ? 1 : 0) : 1; humF.gain.setTargetAtTime(Math.min(.2, S.fan * .028) * vis, t, .15); humF.bp.frequency.setTargetAtTime(240 + S.fan * 60, t, .2); humC.gain.setTargetAtTime(Math.min(.09, S.comp * .025) * vis, t, .15); humC.os.frequency.setTargetAtTime(38 + S.comp * 9, t, .2); }

// scheda del pezzo
function closeCard() { U.sel = -1; $('cardIn').hidden = true; $('howTouchRow').hidden = false; for (const c of $('chips').children) press(c, false); }
function openCard(i) {
  const g = GROUPS[i]; U.sel = i; free.auto = false;
  $('cK').textContent = `Gruppo ${i + 1} di ${GROUPS.length} · ${g.pieces.length} pezzi`; $('cT').textContent = g.name; $('cE').textContent = g.info.e; $('cS').textContent = g.info.s;
  $('cardIn').hidden = false; $('howTouchRow').hidden = true; [...$('chips').children].forEach((c, k) => { press(c, k === i); if (k === i) c.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); });
}
function pick(x, y) {
  const r = canvas.getBoundingClientRect(); _n.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(_n, camera);
  for (const im of IMS) im.boundingSphere = null;
  for (const h of ray.intersectObject(machine, true)) { const o = h.object; if (o.isPoints || o.userData.g === undefined || !o.visible) continue; if (S.xray > .5 && XRM.includes(o.material)) continue; return o.userData.g; }
  return -1;
}
function setLens(on) { U.lens = on; $('lens').style.display = on ? 'block' : 'none'; if (on) { U.lensAuto = true; } else LENS.value.z = 0; }
function setRide(on) {
  U.ride = on; GROUPS.find(g => g.key === 'el').node.visible = !on; for (const m of RIDE_HIDE) m.visible = !on;
  if (on) { U.ru = 0; U.rinit = true; camera.fov = 44; camera.updateProjectionMatrix(); ptSizes(); $('bRideGo').textContent = 'Ferma'; }
  else { comet.visible = false; resize(); ptSizes(); $('bRideGo').textContent = 'Rifai il giro'; }
}
function remoteLcd() {
  press($('kPw'), U.on); $('kPw').textContent = U.on ? 'Accesa' : 'Spenta'; press($('kHeat'), !S.cool); press($('kCool'), S.cool); press($('kSil'), U.silent); press($('kPow'), U.power);
  $('lState').textContent = !U.on ? 'Spenta: ventilatore e compressore si fermano.'
    : (S.cool ? 'Raffrescamento: il giro del gas si inverte e l\'acqua esce fredda, a 18 °C.' : 'Riscaldamento: acqua per la casa a 35 °C.') + (U.defrost ? ' Sta sbrinando la batteria.' : U.silent ? ' Silent: gira più piano e fa meno rumore.' : U.power ? ' Powerful: massima potenza.' : '');
}
function meteoHint() {
  const v = U.outT;
  $('mHint').textContent = v <= -20 ? 'La UHP lavora fino a −25 °C di aria esterna.' : v < 2 && !S.cool ? 'Sotto zero la batteria si copre di brina: la macchina la scioglie da sola, a intervalli.'
    : Math.abs(v - 7) <= 1 && !S.cool ? 'Dato di scheda: con aria a 7 °C e acqua a 35 °C rende 4,90 volte la corrente che consuma (COP, UHP 120).' : Math.abs(v - 35) <= 1 && S.cool ? 'Dato di scheda: con aria a 35 °C e acqua a 18 °C l\'EER è 4,50 (UHP 120).' : v >= 28 && !S.cool ? 'Fa caldo: con lo strumento Accendi puoi passarla a Freddo.' : v >= 28 ? 'In estate la stessa macchina raffresca la casa.' : 'Prova a scendere sotto zero.';
}
function setTool(t) {
  if (U.tool === 'expl' && t !== 'expl') setE(0);
  if (U.tool === 'xray' && t !== 'xray') setLens(false);
  if (U.ride && t !== 'ride') setRide(false);
  if (t !== 'touch') closeCard();
  U.tool = t; free.auto = false;
  for (const b of $('tabs').children) b.setAttribute('aria-selected', b.dataset.tool === t ? 'true' : 'false');
  for (const [k, id] of [['touch', 'pTouch'], ['expl', 'pExpl'], ['xray', 'pXray'], ['ride', 'pRide'], ['rem', 'pRem'], ['meteo', 'pMeteo']]) $(id).hidden = k !== t;
  if (t === 'expl') setE(55);                                   // ogni strumento si mostra da solo appena scelto
  if (t === 'xray') setLens(true);
  if (t === 'ride') setRide(true);
  if (t === 'rem') remoteLcd();
  if (t === 'meteo') meteoHint();
}

function uiTick(dt) {
  U.Ecur += (U.E - U.Ecur) * Math.min(1, dt * 4.5); if (Math.abs(U.E - U.Ecur) < .0005) U.Ecur = U.E;
  U.selK += ((U.sel >= 0 ? 1 : 0) - U.selK) * Math.min(1, dt * 5);
  apply(T_RUN, U.Ecur, 1, false);
  if (U.sel >= 0 && U.selK > .001) { const g = GROUPS[U.sel]; _d.copy(g.ex); if (_d.lengthSq() < .01) _d.set(0, 0, 0); else _d.normalize(); g.node.position.addScaledVector(_d, .22 * U.selK * (1 - U.Ecur)); }
  // macchina: comando e meteo
  const run = U.on ? 1 : 0, k = U.silent ? .55 : U.power ? 1.4 : 1, cold = sm(5, -8, U.outT), wasDef = U.defrost;
  if (!S.cool && U.on && U.outT < 2) { U.frostT += dt; const c = U.frostT % 15; U.defrost = c > 10.5; S.frost += ((U.defrost ? 0 : clamp(c / 9) * (.45 + .55 * cold)) - S.frost) * Math.min(1, dt * (U.defrost ? 1.1 : 2)); }
  else { U.frostT = 0; U.defrost = false; S.frost += (0 - S.frost) * Math.min(1, dt * 1.5); }
  if (wasDef !== U.defrost && U.tool === 'rem') remoteLcd();
  const ease = (key, v, r = 1.6) => { S[key] += (v - S[key]) * Math.min(1, dt * r); };
  ease('fan', run * (U.defrost ? 0 : 6 * k * (1 + .2 * cold))); ease('comp', run * 3 * k); ease('cold', cold); ease('snow', sm(2, -6, U.outT));
  const inner = U.sel >= 0 && GROUPS[U.sel].key !== 'shell', inside = U.lens || U.ride || inner;
  ease('xray', U.ride ? 1 : inner ? .92 : 0, 4); ease('ghost', U.ride ? 1 : 0, 3);
  const calm = 1 - clamp(U.Ecur * 4);
  ease('air', run * calm * (U.defrost || U.ride ? 0 : 1)); ease('ref', run * calm * (inside ? 1 : 0), 3); ease('wat', run * calm * (inside && !U.ride ? 1 : 0), 3);   // nel giro si segue solo il gas
  S.outT = U.outT; S.watT = S.cool ? 18 : 35; S.read = 1; readout();
  const r = stage.getBoundingClientRect(), dockH = $('dock').offsetHeight, fr = Math.min(.46, dockH / Math.max(1, r.height));
  // camera
  if (U.ride) {
    const pa = S.cool ? PATH.cool : PATH.heat; { const q = pa.curve.getPointAt(Math.min(.999, U.ru)); U.ru += dt * (.04 + .075 * sm(.2, .05, q.x)); }   // nella batteria il percorso è lungo e ripetitivo: lì corre di più
    if (U.ru >= 1) { setRide(false); $('rT').textContent = 'Giro finito: è sempre lo stesso gas, non si consuma.'; $('rP').style.width = '100%'; }
    else {
      // camera da inseguimento: sta mezzo metro davanti al punto che corre nei tubi e lo segue con un po' di ritardo
      // nel vano tecnico la camera sta dallo stesso lato del punto rispetto al compressore, così il compressore non lo copre
      const p = pa.curve.getPointAt(U.ru), inFan = sm(.2, .05, p.x); _d.set(lerp(p.x - .265, (p.x - .1) * .2, inFan), 0, lerp(p.z + .155, p.z + .7, inFan)).normalize(); _t.copy(p).addScaledVector(_d, .64 + .5 * inFan); _t.y = lerp(p.y, .56, .4) + .05 + .14 * inFan;
      if (U.rinit) { camP.copy(_t); camL.copy(p); U.rinit = false; } else { camP.lerp(_t, Math.min(1, dt * 2)); camL.lerp(p, Math.min(1, dt * 5)); }
      camera.position.copy(camP); camera.lookAt(camL.x, camL.y - fr * .3, camL.z);
      const cp = comet.geometry.attributes.position, cc = comet.geometry.attributes.color; comet.visible = true;
      for (let i = 0; i < 36; i++) { const u = (U.ru - i * .0011 + 1) % 1, f = u * (pa.S - 1), a = f | 0, b2 = Math.min(pa.S - 1, a + 1), t = f - a, kk = (1 - i / 36) * 1.6;
        cp.setXYZ(i, lerp(pa.P[a * 3], pa.P[b2 * 3], t), lerp(pa.P[a * 3 + 1], pa.P[b2 * 3 + 1], t), lerp(pa.P[a * 3 + 2], pa.P[b2 * 3 + 2], t)); cc.setXYZ(i, (pa.C[a * 3] + .5) * kk, (pa.C[a * 3 + 1] + .5) * kk, (pa.C[a * 3 + 2] + .5) * kk); }
      cp.needsUpdate = cc.needsUpdate = true;
      let s = 0; for (let i = 0; i < pa.marks.length; i++) if (pa.marks[i] <= U.ru) s = i; let txt = RIDE[0][1]; for (const [m, tx] of RIDE) if (m <= s) txt = tx;
      txt = S.cool ? 'In raffrescamento il giro si inverte: il calore esce dalla batteria.' : txt; if ($('rT').textContent !== txt) $('rT').textContent = txt; $('rP').style.width = (U.ru * 100).toFixed(1) + '%';
    }
  }
  if (!U.ride) {
    if (free.auto) free.az += dt * .1;
    const g = U.sel >= 0 ? GROUPS[U.sel] : null; _t.copy(g ? _d.copy(g.node.position).add(g.c) : MC); free.t.lerp(_t, Math.min(1, dt * 4));
    const zs = g && g.key !== 'shell' && g.key !== 'base' ? Math.max(.42, g.size * 1.6) : 1 + U.Ecur * .75;
    // la barra degli strumenti copre il fondo: alzo il modello di conseguenza
    rig.az = free.az; rig.el = free.el; rig.w += (1.8 * zs * free.zoom - rig.w) * Math.min(1, dt * 4); rig.h += (1.45 * zs * free.zoom / (1 - fr) - rig.h) * Math.min(1, dt * 4); rig.t.copy(free.t); rig.t.y -= fr * rig.h * .5; placeCam(rig);
  }
  // lente: finché nessuno la tocca passa da sola sulla macchina, per far capire cosa fa
  if (U.lens) {
    const R = Math.min(r.width, r.height - dockH) * .2, pr = renderer.getPixelRatio(), L = $('lens'), cy = (r.height - dockH) * .52;
    if (U.lensAuto) { U.lx = r.width * (.5 + .2 * Math.sin(now * .8)); U.ly = cy + (r.height - dockH) * .1 * Math.sin(now * 1.3); }
    LENS.value.set(U.lx * pr, (r.height - U.ly) * pr, R * pr); L.style.width = L.style.height = R * 2 + 'px'; L.style.transform = `translate(${U.lx - R}px, ${U.ly - R}px)`;
  }
  audioTick();
}
function uiEnter() {
  freeTick = uiTick; U.Ecur = 0; setE(0); U.outT = 7; U.on = true; U.silent = U.power = false; S.cool = false; $('sT').value = 7; fill($('sT')); $('oT').textContent = fmtT(7); rig.w = 1.8; rig.h = 1.45;
  setTool('touch'); free.auto = true;
  [...$('tabs').children].forEach((b, i) => { b.classList.remove('pulse'); setTimeout(() => { b.classList.add('pulse'); }, 1500 + i * 130); });
}
function uiLeave() { if (U.lens) setLens(false); if (U.ride) setRide(false); closeCard(); setE(0); S.cool = false; S.ghost = 0; resize(); ptSizes(); freeTick = null; }

function initUI() {
  $('nP').textContent = PIECES.length;
  $('howTouch').textContent = COARSE ? 'Trascina per girarla, pizzica per avvicinarti. Tocca un pezzo per sapere cos\'è.' : 'Trascina per girarla, rotella per avvicinarti. Clicca un pezzo per sapere cos\'è.';
  $('howX').textContent = (COARSE ? 'Muovi il dito' : 'Muovi il mouse') + ' sulla macchina: dentro il cerchio la vedi lavorare.';
  GROUPS.forEach((g, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = SHORT[g.key]; b.setAttribute('aria-pressed', 'false'); b.onclick = () => (U.sel === i ? closeCard() : openCard(i)); $('chips').appendChild(b); });
  // orbita, zoom, tocco
  let down = null, pinch = 0;
  const lensTo = e => { const r = stage.getBoundingClientRect(); U.lensAuto = false; U.lx = e.clientX - r.left; U.ly = e.clientY - r.top - (e.pointerType === 'mouse' ? 0 : Math.min(r.width, r.height) * .17); };   // col dito la lente sta sopra, per non coprirla
  stage.addEventListener('pointerdown', e => { if (mode !== 'free' || e.target.closest('#dock,#freetop,a,button')) return; ptr.set(e.pointerId, [e.clientX, e.clientY]); down = { t: performance.now(), far: 0 }; if (ptr.size === 2) { const a = [...ptr.values()]; pinch = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); } if (U.lens && ptr.size === 1) lensTo(e); try { stage.setPointerCapture(e.pointerId); } catch (err) {} });
  stage.addEventListener('pointermove', e => {
    if (mode !== 'free') return;
    if (U.lens && ptr.size < 2 && (ptr.has(e.pointerId) || (e.pointerType === 'mouse' && !e.target.closest('#dock,#freetop,a,button')))) { lensTo(e); if (down) down.far = 99; const p0 = ptr.get(e.pointerId); if (p0) { p0[0] = e.clientX; p0[1] = e.clientY; } return; }
    const p = ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p[0], dy = e.clientY - p[1]; p[0] = e.clientX; p[1] = e.clientY; if (down) down.far += Math.abs(dx) + Math.abs(dy);
    if (U.ride) return;
    if (ptr.size === 2) { const a = [...ptr.values()], d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); if (pinch > 0) free.zoom = clamp(free.zoom * pinch / d, .35, 1.9); pinch = d; free.auto = false; }
    else { free.az -= dx * .007; free.el = clamp(free.el + dy * .005, rad(-4), rad(62)); free.auto = false; }
  });
  const up = e => {
    if (!ptr.has(e.pointerId)) return; ptr.delete(e.pointerId); pinch = 0;
    if (down && down.far < 8 && performance.now() - down.t < 450 && (U.tool === 'touch' || U.tool === 'rem' || U.tool === 'meteo')) { const g = pick(e.clientX, e.clientY); if (g >= 0 && g !== U.sel) { if (U.tool !== 'touch') setTool('touch'); openCard(g); } else if (U.tool === 'touch') closeCard(); }
    if (ptr.size === 0) down = null;
  };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', e => { if (mode !== 'free' || U.ride || e.target.closest('#dock')) return; e.preventDefault(); free.zoom = clamp(free.zoom * Math.exp(e.deltaY * .0012), .35, 1.9); free.auto = false; }, { passive: false });
  // strumenti
  for (const b of $('tabs').children) b.onclick = () => setTool(b.dataset.tool);
  $('sE').addEventListener('input', e => setE(+e.target.value));
  $('sT').addEventListener('input', e => { U.outT = +e.target.value; $('oT').textContent = fmtT(U.outT); fill(e.target); meteoHint(); });
  $('bRideGo').onclick = () => setRide(!U.ride);
  $('bSnd').onclick = $('bSnd2').onclick = () => audioOn(!U.snd); $('bFilm').onclick = () => startFilm(0);
  $('kPw').onclick = () => { U.on = !U.on; remoteLcd(); }; $('kHeat').onclick = () => { S.cool = false; remoteLcd(); }; $('kCool').onclick = () => { S.cool = true; remoteLcd(); };
  $('kSil').onclick = () => { U.silent = !U.silent; if (U.silent) U.power = false; remoteLcd(); }; $('kPow').onclick = () => { U.power = !U.power; if (U.power) U.silent = false; remoteLcd(); };
  window.__ui = { U, setTool, openCard, pick, uiTick };
}
