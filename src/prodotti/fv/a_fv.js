// ───────── Fotovoltaico Unical · pagina completa: film di installazione e strumenti ─────────
// Dai documenti (vedi src/dati/fv-*.json):
//  MULTIVOLT 460 BF, scheda 00341524: 1762 x 1134 x 30 mm, 96 mezze celle 6 x 16, 460 W; manuale 00340211SS p.12-14: almeno quattro morsetti per modulo
//  sul lato lungo, lunghi almeno 50 mm, a S = 400 ± 50 mm dai lati corti (metodo C).
//  ZOE1-6000, manuale 00341435: 540 x 450 x 185 mm, staffa a parete con fori a 400 mm, terminali sul lato inferiore nell'ordine di p.22, modalità Autoconsumo di p.14.
//  SUM BL15P, manuale 00341436: tre moduli da 650 x 360 x 180 mm su una base, fissati a parete con staffe a L, porte sul fianco, 4 tacche di carica.
// Qui si mostra l'installazione, che i manuali descrivono; l'interno di inverter e batteria non è documentato e non viene inventato.
// RICOSTRUITO o generico: ganci, profili e morsetti (accessori per tetti residenziali, senza un modello preciso), tegole, parete, percorso dei cavi,
// forma delle staffe, altezza della base della batteria (50 mm), le due scatole "Casa" e "Rete". In questa pagina i moduli sono due, per mostrare il fissaggio da vicino.
const AL = std({ color: 0xb9bec2, roughness: .4, metalness: .8 }), BI = std({ color: 0xe9ebec, roughness: .45, metalness: .05 }), GR = std({ color: 0x8f969b, roughness: .5, metalness: .4 });
const tCel = cv(128, 256, (c, w, h) => { c.fillStyle = '#07090c'; c.fillRect(0, 0, w, h); const cw = (w - 8) / 6, ch = (h - 12) / 16; for (let i = 0; i < 6; i++) for (let j = 0; j < 16; j++) { c.fillStyle = (i + j) % 2 ? '#10161f' : '#0e141c'; c.fillRect(4 + i * cw + .6, 4 + j * ch + (j > 7 ? 4 : 0) + .6, cw - 1.2, ch - 1.2); } });
const tTeg = cv(64, 64, (c) => { c.fillStyle = '#7a4a38'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#5e3628'; for (let x = 0; x < 64; x += 16) c.fillRect(x, 0, 2, 64); c.fillRect(0, 0, 64, 4); }); tTeg.wrapS = tTeg.wrapT = THREE.RepeatWrapping; tTeg.repeat.set(9, 7);
const tFlow = cv(64, 8, (c) => { const g = c.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, '#777'); g.addColorStop(.5, '#fff'); g.addColorStop(.62, '#777'); g.addColorStop(1, '#777'); c.fillStyle = g; c.fillRect(0, 0, 64, 8); });
const CAVI = {};
function cavo(nome, pts, col) { const c = new THREE.CurvePath(); for (let i = 1; i < pts.length; i++) c.add(new THREE.LineCurve3(pts[i - 1], pts[i])); const tx = tFlow.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(Math.max(1, c.getLength() / .25), 1); tx.needsUpdate = true;
  const m = new THREE.MeshBasicMaterial({ map: tx, color: 0x6a7076 }); (CAVI[nome] = CAVI[nome] || []).push({ m, tx, col: new THREE.Color(col) }); return mesh(new THREE.TubeGeometry(c, Math.round(c.getLength() * 14), .012, 6), m); }

// il tetto: una falda di tegole inclinata di 27°, con i pezzi nel suo sistema di riferimento (y sopra le tegole, z verso la gronda)
const tetto = new THREE.Group(); tetto.position.set(-1.5, .85, .1); tetto.rotation.x = rad(27); root.add(tetto);
tetto.add(mesh(box(2.8, .08, 3.0), std({ map: tTeg, roughness: .9 }), 0, -.04, 0));
const sulTetto = o => { tetto.add(o); const w = o.getWorldPosition(V()), q = tetto.quaternion.clone(); tetto.remove(o); o.position.copy(w); o.quaternion.premultiply(q); return o; };   // porta un pezzo dal tetto alla scena, per il montaggio
const N = V(0, 1, 0).applyQuaternion(tetto.quaternion).toArray().map(x => x * .9);   // i pezzi del tetto arrivano dall'alto, perpendicolari alla falda
const ZP = [-.481, .481];                                                            // i due profili: a 400 mm dai lati corti del modulo (881 - 400)
// 1 ─ ganci e profili
gruppo('Ganci e profili', 'Prima i ganci, fissati alla struttura del tetto sotto le tegole. Poi due profili di alluminio per ogni fila di moduli.', 'Accessori per tetti residenziali · due profili per fila, a 400 mm dai lati corti dei moduli: è lì che il manuale vuole i morsetti (S = 400 ± 50 mm)', 2, 7, { az: -38, el: 26, d: 5.2, x: -1.5, y: 1.0 }, [0, .5, .35]);
for (const z of ZP) for (const [i, x] of [-.95, 0, .95].entries()) P(sulTetto(mesh(box(.05, .07, .16), GR, x, .035, z)), N, i * .12 + (z > 0 ? .3 : 0));
for (const z of ZP) P(sulTetto(mesh(box(2.6, .04, .04), AL, 0, .09, z)), N, z > 0 ? .85 : .7);
// 2 ─ moduli e morsetti
gruppo('Moduli', 'I moduli si appoggiano sui profili e si bloccano con i morsetti. Sono bifacciali: prendono luce anche da dietro.', 'MULTIVOLT 460 BF · 460 W · 1762 × 1134 × 30 mm · 24,5 kg · doppio vetro · almeno quattro morsetti per modulo, lunghi almeno 50 mm · nella casa sono 14: 6,44 kWp', 7, 13, { az: -30, el: 30, d: 5.0, x: -1.5, y: 1.1 }, [0, 1.05, .7]);
const telaio = std({ color: 0x15171a, roughness: .5, metalness: .6 }), celle = std({ map: tCel, roughness: .18, metalness: .35 });
for (const [i, x] of [-.577, .577].entries()) P(sulTetto(mesh(box(1.134, .03, 1.762), [telaio, telaio, celle, telaio, telaio, telaio], x, .125, 0)), N, i * .25);
for (const z of ZP) for (const [i, x] of [-1.159, 0, 1.159].entries()) P(sulTetto(mesh(box(x ? .03 : .04, .04, .06), AL, x, .13, z)), N, .6 + i * .1);     // morsetti terminali e intermedi
// la parete in muratura con inverter e batteria
const ZW = -.55, parete = mesh(box(2.5, 2.6, .1), std({ color: 0xcfc9bb, roughness: .95 }), 1.45, 1.3, ZW - .05); root.add(parete);
// 3 ─ inverter
gruppo('Inverter', 'Trasforma la corrente dei moduli in quella di casa e decide dove mandarla: casa, batteria o rete. Si appende a una staffa.', 'ZOE1-6000 · 6 kW · due MPPT, una stringa ciascuno · fino a 9 kW di moduli · IP66 · rendimento massimo 97,8 % · 540 × 450 × 185 mm · 27,5 kg', 13, 19, { az: 12, el: 8, d: 3.4, x: 1.9, y: 1.5 }, [0, 0, .7]);
const IX = 1.95, IY = 1.55;
P(mesh(box(.46, .1, .012), GR, IX, IY + .12, ZW + .006), [0, 0, 1], 0);                                                    // staffa, fori a 400 mm
for (const x of [-.2, .2]) { const v = mesh(cyl(.008, .02, 8), M.scuro, IX + x, IY + .12, ZW + .016); v.rotation.x = PI / 2; P(v, [0, 0, .8], .2); }
{ const g = new THREE.Group(); g.add(mesh(box(.46, .40, .045), GR, 0, 0, .0225 + .012)); for (let i = -5; i <= 5; i++) g.add(mesh(box(.006, .38, .03), GR, i * .04, 0, .02));       // radiatore alettato sul retro
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(.54, .45, .14), BI); corpo.position.z = .057 + .07; g.add(corpo);
  const tL = cv(256, 80, c => drawUnicalLogo(c, 8, 6, 230)); g.add(mesh(new THREE.PlaneGeometry(.15, .047), std({ map: tL, transparent: true, roughness: .5 }), 0, .15, .198));
  const tD = cv(64, 48, c => { c.fillStyle = '#0d1114'; c.fillRect(0, 0, 64, 48); c.fillStyle = '#7fd0ff'; c.fillRect(8, 8, 48, 18); c.fillStyle = '#3a4046'; for (let i = 0; i < 4; i++) c.fillRect(8 + i * 13, 32, 9, 9); });
  g.add(mesh(new THREE.PlaneGeometry(.1, .075), new THREE.MeshBasicMaterial({ map: tD }), 0, -.13, .198));
  // terminali sul lato inferiore, da sinistra: batteria +/-, interruttore CC, FV1 e FV2, COM, WiFi, rete, BACK-UP (manuale p.22)
  [[-.22, 0x1b1d20], [-.18, 0xc0392b], [-.12, 0x30353a], [-.06, 0x1b1d20], [-.02, 0x1b1d20], [.05, 0x30353a], [.1, 0xdfe3e6], [.16, 0x30353a], [.22, 0x30353a]].forEach(([x, c]) => g.add(mesh(cyl(.012, .03, 10), std({ color: c, roughness: .5 }), x, -.24, .12)));
  g.position.set(IX, IY, ZW); P(g, [0, .5, 1.1], .4); }
// 4 ─ batteria
gruppo('Batteria', 'Tiene da parte l\'energia del giorno per la sera. Tre moduli uno sull\'altro, appoggiati a terra e fermati alla parete.', 'SUM BL15P · tre moduli al litio-ferro-fosfato (LFP) da 51,2 V · IP66 · a pavimento con staffe a parete · ambiente asciutto, lontano dall\'acqua', 19, 26, { az: -14, el: 8, d: 3.6, x: .95, y: .75 }, [-.25, 0, .8]);
const BX = .95, BZ = ZW + .02 + .09, tLed = cv(32, 96, () => {}), ledM = new THREE.MeshBasicMaterial({ map: tLed });
function tacche(soc) { const k = Math.round(clamp(soc) * 4), c = tLed.image.getContext('2d'); c.fillStyle = '#0d1114'; c.fillRect(0, 0, 32, 96); for (let i = 0; i < 4; i++) { c.fillStyle = i < k ? '#7dff9a' : '#27302b'; c.fillRect(8, 74 - i * 20, 16, 12); } tLed.needsUpdate = true; }
P(mesh(box(.65, .05, .18), GR, BX, .025, BZ), [0, 0, 1], 0);
for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.add(mesh(box(.65, .355, .18), BI)); g.add(mesh(new THREE.PlaneGeometry(.025, .075), ledM, 0, 0, .0905)); g.add(mesh(box(.012, .3, .14), std({ color: 0xd3d6d8, roughness: .6 }), .331, 0, 0));   // pannello laterale sopra le porte
  g.position.set(BX, .05 + .18 + i * .36, BZ); P(g, [0, .6, 1.2], .15 + i * .2); }
for (const x of [-.25, .25]) P(mesh(box(.04, .05, .11), GR, BX + x, 1.13 + .025, ZW + .055), [0, .4, .5], .85);                // staffe a L in cima
// 5 ─ cavi
gruppo('Cavi', 'Due stringhe di moduli scendono all\'inverter, una per ingresso. Un cavo corto lo unisce alla batteria.', 'Due stringhe, una per MPPT · batteria collegata sul fianco, a meno di 3 m dall\'inverter · uscite verso la casa e verso la rete', 26, 30, { az: -6, el: 16, d: 7.4, x: .1, y: 1.0 }, [0, 0, .25]);
const cI = (dx) => V(IX + dx, IY - .26, ZW + .12), pT = (x, z) => sulTetto(mesh(box(.01, .01, .01), GR, x, .05, z)).position.clone();
// le stringhe corrono sotto i moduli fino al bordo della falda, scendono e raggiungono l'inverter lungo il pavimento (percorso generico: qui tetto e parete sono affiancati)
for (const [i, x] of [-.577, .577].entries()) { const z = .2 + i * .08, b = pT(1.38, z), xi = IX - .06 + i * .04; P(cavo('fv', [pT(x, z), b, V(b.x, .03, b.z), V(xi, .03, b.z), V(xi, .03, ZW + .12), V(xi, IY - .26, ZW + .12)], 0xffd84a), [0, .3, .4], i * .2); }
P(cavo('bat', [cI(-.2), V(IX - .2, .6, ZW + .12), V(BX + .34, .6, ZW + .12)], 0x7dff9a), [0, 0, .5], .45);
P(cavo('casa', [cI(.22), V(IX + .22, .9, ZW + .12), V(IX + .35, .9, ZW + .12)], 0xfff2b0), [0, 0, .5], .6); P(cavo('rete', [cI(.16), V(IX + .16, .5, ZW + .12), V(IX + .35, .5, ZW + .12)], 0xc49bff), [0, 0, .5], .7);
for (const [y, s] of [[.9, 'Casa'], [.5, 'Rete']]) { const t = cv(128, 64, c => { c.fillStyle = '#2a2f34'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#e9ecee'; c.font = '700 30px sans-serif'; c.textAlign = 'center'; c.fillText(s, 64, 42); }); P(mesh(box(.3, .16, .08), [GR, GR, GR, GR, new THREE.MeshBasicMaterial({ map: t }), GR], IX + .5, y, ZW + .12), [.5, 0, .3], .8); }

// ───────── stato e film ─────────
// Flussi secondo la modalità Autoconsumo (manuale ZOE1 p.14): il fotovoltaico alimenta la casa, l'avanzo carica la batteria e poi va in rete;
// senza sole la batteria alimenta la casa fino alla scarica minima del 10%, poi si prende dalla rete. Intensità qualitative, nessun valore a schermo.
const E = { sole: .8, soc: .45, bat: 0, rete: 0 }, CASA = .35, FINE_M = 30, FINE = 37;
const U = { mode: 'start', t: 0, tool: 'tocca', e: 0, eTo: 0, az: rad(-10), el: rad(14), zoom: 1, auto: true };
function energia(dt) { const av = E.sole - CASA; E.bat = av > 0 ? (E.soc < 1 ? Math.min(av, .5) : 0) : (E.soc > .1 ? Math.max(av, -.5) : 0); E.rete = av - E.bat; E.soc = clamp(E.soc + E.bat * dt * .12, .1, 1); }
const VISTA_F = { az: -8, el: 14, d: 7.8, x: 0, y: 1.2 };
function vistaFilm(t) { let v = G[0].vista; for (const g of G) { const k = sm(g.t0 - .5, g.t0 + .7, t), w = g.vista, o = {}; for (const q in w) o[q] = lerp(v[q], w[q], k); v = o; }
  const k = sm(FINE_M - .3, FINE_M + 1.2, t), o = {}; for (const q in v) o[q] = lerp(v[q], VISTA_F[q], k); return o; }
let stretto = false, ultSoc = -1;
function posa(now, dt) {
  const film = U.mode === 'film', t = film ? U.t : FINE;
  for (const g of G) for (const p of g.pezzi) { const dur = (g.t1 - g.t0) * .42, k = film ? Math.max(1 - sm(1.2, 2.0, t), clamp((t - (g.t0 + p.rit * (g.t1 - g.t0 - dur))) / dur)) : 1;
    p.o.visible = k > 0; p.o.position.copy(p.home).addScaledVector(p.da, 1 - eoc(k)).addScaledVector(g.esp, U.e); }
  if (film) { E.sole = t < FINE_M ? 0 : lerp(.95, 0, sm(FINE_M + 3.2, FINE_M + 5.5, t)); if (t < FINE_M) E.soc = .45; }
  const vivo = !film || t > FINE_M ? 1 : 0; energia(dt * vivo);
  const F = { fv: E.sole * vivo, bat: E.bat * vivo, casa: CASA * vivo, rete: E.rete * vivo };
  for (const n in CAVI) for (const c of CAVI[n]) { const a = Math.abs(F[n]); c.m.color.setHex(0x6a7076).lerp(c.col, sm(0, .04, a)); c.tx.offset.x -= dt * (n === 'bat' || n === 'rete' ? Math.sign(F[n]) : 1) * (a > .01 ? .6 + 2 * a : 0); }
  celle.emissive.setHex(0x16324a); celle.emissiveIntensity = .5 * E.sole * vivo;
  if (Math.abs(E.soc - ultSoc) > .01) { ultSoc = E.soc; tacche(E.soc); $('bSoc').style.width = (E.soc * 100).toFixed(0) + '%'; }
  let v; if (film) v = vistaFilm(t); else { if (U.auto) U.az = rad(-10) + Math.sin(now * .25) * rad(14); v = { az: U.az / PI * 180, el: U.el / PI * 180, d: 7.8 * U.zoom, x: 0, y: 1.2 }; }
  const d = v.d * (stretto ? 1.5 : 1), ce = Math.cos(rad(v.el)), yy = v.y - (U.mode === 'free' ? d * (stretto ? .09 : .05) : 0);
  camera.position.set(v.x + Math.sin(rad(v.az)) * ce * d, yy + Math.sin(rad(v.el)) * d, Math.cos(rad(v.az)) * ce * d); camera.lookAt(v.x, yy, 0);
}
// ───────── interfaccia ─────────
function resize() { const w = Math.max(2, stage.clientWidth), h = Math.max(2, stage.clientHeight); renderer.setSize(w, h, false); camera.aspect = w / h; stretto = w < h; camera.fov = stretto ? 38 : 30; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); new ResizeObserver(resize).observe(stage); resize();
const setMode = m => { U.mode = m; document.body.className = m; };
function didascalia(t) { let i = 0; for (let k = 0; k < G.length; k++) if (t >= G[k].t0 - .3) i = k; const run = t >= FINE_M, pre = t < G[0].t0 - .3;
  $('num').textContent = run || pre ? '' : String(i + 1).padStart(2, '0'); $('name').textContent = pre ? 'Fotovoltaico Unical' : run ? 'In funzione' : G[i].nome;
  $('spec').textContent = pre ? 'Moduli MULTIVOLT, inverter ZOE1 e batteria SUM BL' : run ? testoSole() : G[i].facile; }
const testoSole = () => E.sole > CASA + .02 ? (E.soc < .995 ? 'C\'è sole: l\'inverter alimenta la casa e con l\'avanzo carica la batteria.' : 'Batteria piena: il sole alimenta la casa e il resto va in rete.') : (E.soc > .105 ? 'Poco sole o buio: la batteria alimenta la casa.' : 'Batteria alla scarica minima: la casa prende dalla rete.');
function startFilm() { U.t = 0; U.e = U.eTo = 0; setMode('film'); }
function libero(annuncia) { setMode('free'); U.auto = true; U.el = rad(14); U.zoom = 1; E.sole = +$('sS').value; setTool('tocca'); if (annuncia) { const t = $('toast'); t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); } }
function setTool(n) { U.tool = n; for (const b of $('tabs').children) b.setAttribute('aria-pressed', b.dataset.tool === n); for (const s of $('panel').children) s.classList.toggle('on', s.dataset.tool === n); U.eTo = n === 'smonta' ? +$('sE').value : 0; if (n === 'tocca') scheda(-1); }
function scheda(i) { $('pTocca').textContent = i < 0 ? 'Trascina per girare, pizzica per avvicinarti. Tocca un pezzo o un nome.' : ''; if (i >= 0) { const b = document.createElement('b'), s = document.createElement('small'); b.textContent = G[i].nome + '. '; s.textContent = G[i].tecnico; $('pTocca').append(b, G[i].facile, document.createElement('br'), s); }
  for (const b of $('nomi').children) b.setAttribute('aria-pressed', +b.dataset.i === i); }
G.forEach((g, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.dataset.i = i; b.textContent = g.nome; b.onclick = () => scheda(i); $('nomi').appendChild(b); });
for (const b of $('tabs').children) b.onclick = () => setTool(b.dataset.tool);
$('sE').addEventListener('input', e => { U.eTo = +e.target.value; }); $('sS').addEventListener('input', e => { E.sole = +e.target.value; });
$('bGo').onclick = startFilm; $('bExplore').onclick = () => libero(false); $('bFilm').onclick = startFilm;
const dita = new Map(), ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let mosso = 0, pinch = 0;
canvas.addEventListener('pointerdown', e => { if (U.mode !== 'free') return; canvas.setPointerCapture(e.pointerId); dita.set(e.pointerId, [e.clientX, e.clientY]); mosso = 0; pinch = 0; });
canvas.addEventListener('pointermove', e => { const p = dita.get(e.pointerId); if (!p) return;
  if (dita.size === 1) { const dx = e.clientX - p[0], dy = e.clientY - p[1]; mosso += Math.abs(dx) + Math.abs(dy); if (mosso > 6) U.auto = false; U.az = clamp(U.az - dx * .008, rad(-75), rad(75)); U.el = clamp(U.el + dy * .006, rad(2), rad(60)); }
  dita.set(e.pointerId, [e.clientX, e.clientY]);
  if (dita.size === 2) { const [a, b] = [...dita.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) U.zoom = clamp(U.zoom * pinch / d, .3, 1.5); pinch = d; mosso += 20; } });
for (const ev of ['pointerup', 'pointercancel']) canvas.addEventListener(ev, e => { const p = dita.get(e.pointerId); dita.delete(e.pointerId); pinch = 0;
  if (p && mosso < 8 && U.mode === 'free') { const r = canvas.getBoundingClientRect(); ptr.set((p[0] - r.left) / r.width * 2 - 1, -(p[1] - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, camera); const hit = ray.intersectObjects(root.children, true).find(h => h.object.userData.g !== undefined && h.object.visible); if (hit) { if (U.tool !== 'tocca') setTool('tocca'); scheda(hit.object.userData.g); } } });
canvas.addEventListener('wheel', e => { if (U.mode !== 'free') return; e.preventDefault(); U.zoom = clamp(U.zoom * Math.exp(e.deltaY * .0012), .3, 1.5); U.auto = false; }, { passive: false });
let last = 0, lenti = 0, tAgg = 0;
function passo(dt, now) { if (U.mode === 'film') { U.t += dt; didascalia(U.t); if (U.t >= FINE) libero(true); } U.e = lerp(U.e, U.eTo, 1 - Math.exp(-dt * 6)); posa(now, dt); if (U.mode === 'free' && now - tAgg > .25) { tAgg = now; $('pSole').textContent = testoSole(); } }
function frame(ts) { requestAnimationFrame(frame); if (document.hidden) { last = 0; return; } const now = ts / 1000, grezzo = last ? now - last : 0, dt = Math.min(.05, grezzo); last = now; passo(dt, now); renderer.render(scene, camera);
  if (grezzo > .036) { if (++lenti > 45 && PR > .8) { PR = Math.max(.8, PR - .25); renderer.setPixelRatio(PR); resize(); lenti = 0; } } else if (grezzo) lenti = Math.max(0, lenti - 1); }
tacche(E.soc); posa(0, 0);
window.__fv = { U, E, G, setTool, scheda, startFilm, libero, seek(t) { if (U.mode !== 'film') startFilm(); U.t = t; passo(0, t); renderer.render(scene, camera); }, avanti(s) { for (let i = 0; i < s * 20; i++) passo(.05, last + i * .05); renderer.render(scene, camera); },
  stato: () => ({ mode: U.mode, tool: U.tool, t: +U.t.toFixed(2), e: +U.e.toFixed(3), sole: E.sole, soc: +E.soc.toFixed(3), bat: +E.bat.toFixed(3), rete: +E.rete.toFixed(3), pezzi: G.reduce((n, g) => n + g.pezzi.length, 0), calls: renderer.info.render.calls }) };
requestAnimationFrame(frame);
