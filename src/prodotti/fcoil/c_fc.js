// ───────── Ventilconvettore F-COIL AGR 400 · pezzi e scena (motore della UHP, pagina comune) ─────────
// Dal manuale 00340791 (istruzioni F-COIL AGR 200-400-600-800): p.4 componenti A-M (coperchio dei collettori, batteria rame-alluminio con raccordi Eurokonus 3/4
// e sensore dell'acqua, pannello touch, ventilatore tangenziale ad alette sfalsate su supporti in EPDM, motore DC, griglia di mandata reversibile, griglia di
// aspirazione con sgancio rapido e microinterruttore, bacinella della condensa in ABS, schienale insonorizzante, mantello e fianchi in lamiera RAL 9003,
// struttura in lamiera elettrozincata), p.5 misure (897 × 579 × 129 mm per la taglia 400) e dati (0,8 l, 10 bar, 4-80 °C, 15 kg), p.6 distanza minima dal
// pavimento (140 mm), p.8 tubi Ø 14 mm, p.9 scarico condensa. Scheda 05-2025: cover "total metal" da 12,9 cm, motore DC inverter brushless, filtro a nido
// d'ape in polipropilene, batteria trattata idrofilicamente, modalità NIGHT per convezione, pannello radiante (0,27 l per la taglia 400), Modbus.
// RICOSTRUITO: inclinazione e numero di ranghi della batteria, numero di alette, posizione della scheda elettronica, percorso del pannello radiante,
// numero di pale del ventilatore. La taglia (400) è una scelta da confermare con Bore.
const W = .897, HF = .579, D = .129, Y0 = .14, XL = -W / 2, XR = W / 2, XC = XL + .12;          // ingombro; XC: fine del vano attacchi a sinistra
const FY = Y0 + .095, FZ = .068, FR = .043;                                                        // ventilatore tangenziale
const BA = [Y0 + .2, .108], BB = [Y0 + .5, .028], BT = Math.atan2(BB[1] - BA[1], BB[0] - BA[0]);   // batteria inclinata: dal basso davanti all'alto dietro
const bat = f => [lerp(BA[0], BB[0], f), lerp(BA[1], BB[1], f)];
T.pannelloC = cv(256, 96, g => { g.fillStyle = '#e9ecee'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#16191b'; g.font = '700 46px Barlow, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('21', 70, 62);
  g.strokeStyle = '#16191b'; g.lineWidth = 3; [[150, 30], [150, 66]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 13, 0, 7); g.stroke(); }); g.fillRect(143, 29, 14, 3); g.fillRect(143, 65, 14, 3); g.fillRect(148, 24, 3, 14);
  g.beginPath(); g.arc(215, 48, 16, 0, 7); g.stroke(); });
T.alveare = rep(cv(64, 64, g => { g.fillStyle = '#d7dadc'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#a9aeb2'; g.lineWidth = 2; for (let y = 0; y < 72; y += 14) for (let x = 0; x < 72; x += 16) { const ox = (y / 14) % 2 ? 8 : 0; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k * PI / 3; g.lineTo(x + ox + Math.cos(a) * 7, y + Math.sin(a) * 7); } g.closePath(); g.stroke(); } }), 12, 2);
T.muroF = rep(cv(256, 256, g => { const r = rng(17); g.fillStyle = '#4a4e52'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 4000; i++) { const v = 62 + r() * 34 | 0; g.fillStyle = `rgba(${v},${v + 3},${v + 6},.5)`; g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); } }), 3, 3);
T.parquet = rep(cv(256, 256, g => { const r = rng(4); for (let i = 0; i < 8; i++) { const v = 120 + r() * 30 | 0; g.fillStyle = `rgb(${v},${v * .72 | 0},${v * .48 | 0})`; g.fillRect(0, i * 32, 256, 32); g.fillStyle = 'rgba(40,24,12,.4)'; g.fillRect(0, i * 32, 256, 1); g.fillRect((r() * 256) | 0, i * 32, 1, 32); } }), 4, 3);
Object.assign(M, {
  fcPan: new THREE.MeshBasicMaterial({ map: T.pannelloC }),
  filtro: xr(std({ color: 0xffffff, roughness: .8, map: T.alveare, transparent: true, opacity: .9, side: THREE.DoubleSide })),
  isol: std({ color: 0x1b1d20, roughness: 1, bumpMap: T.noise, bumpScale: 2.5 }),
  epdm: std({ color: 0x111214, roughness: .9 }),
  abs: std({ color: 0x3a3e42, roughness: .6 }),
  rotore: std({ color: 0x2b2f33, roughness: .55, metalness: .1 }),
  radiante: xr(std({ color: C_BIANCO, roughness: .8, metalness: .1, emissive: 0xff6a2a, emissiveIntensity: 0 })),
  alettaF: std({ color: 0x9aa3a8, roughness: .4, metalness: .8, emissive: 0x2a8cff, emissiveIntensity: 0 }),
  muroF: std({ color: 0x9aa0a4, roughness: .95, map: T.muroF, bumpMap: T.noise, bumpScale: 1.5 }), parquet: std({ color: 0x6e6a66, roughness: .75, map: T.parquet }),
});
ambienteBase(); ambiente(['alettaF', 'epdm', 'abs', 'rotore'], AMB_M); ambiente(['radiante', 'filtro'], AMB_B);
SOLO.push([M.muroF, .3], [M.parquet, .3]);
scene.add(mesh(G.plane(2.4, 2.2), M.muroF, 0, 1.1, -.002), mesh(G.box(2.4, .01, 1.6), M.parquet, 0, -.005, .78));
const ombraF = mesh(G.plane(1.3, .5), new THREE.MeshBasicMaterial({ map: T.shadow, transparent: true, depthWrite: false }), 0, .003, .12, -PI / 2); scene.add(ombraF);

// 1 ─ Struttura e schienale
group('strut', 'Struttura e schienale', 'La struttura in lamiera elettrozincata si appende al muro con due staffe. Dietro, lo schienale insonorizzato e isolato.', 3.5, 7.5, { stage: [0, 0, .5], ex: [0, 0, -.0], az: 26, el: 12, zoom: .9,
  info: { e: 'Lo scheletro: regge tutto e tiene il rumore e il freddo lontani dal muro.', s: 'Struttura in lamiera elettrozincata ad alta resistenza · schienale strutturale insonorizzante · a parete, a 140 mm minimo dal pavimento · manuale 00340791 p.4, 6-7' } });
{
  PIN(G.box(.12, .03, .012), M.zinc, [-.25, .25].map(x => ({ p: [x, Y0 + .53, .006] })), { d0: 0, d1: .06, from: [0, 0, .5], spin: [0, 0, 0], n: 'Staffe di fissaggio a muro' });
  screws([-.25, .25].flatMap(x => [-.04, .04].map(dx => ({ p: [x + dx, Y0 + .53, .012], r: [PI / 2, 0, 0] }))), { d0: .08, d1: .16, n: 'Tasselli' });
  P(mesh(G.box(W - .006, HF - .02, .006), M.zinc, 0, Y0 + HF / 2, .015), { d: .2, from: [0, 0, .6], spin: [0, 0, 0], ease: eoc, n: 'Schienale strutturale' });
  P(mesh(G.box(W - .14, HF - .12, .012), M.isol, .06, Y0 + HF / 2 + .02, .024), { d: .28, from: [0, 0, .5], spin: [0, 0, 0], ease: eoc, n: 'Isolamento insonorizzante' });
  [[XL + .003, 'Fianco sinistro della struttura'], [XR - .003, null]].forEach(([x, n], i) => P(mesh(G.box(.006, HF - .01, D - .03), M.zinc, x, Y0 + HF / 2, D / 2), { d: .34 + i * .04, from: [Math.sign(x) * .4, 0, 0], spin: [0, 0, 0], n }));
  P(mesh(G.box(.006, HF - .08, D - .03), M.zinc, XC, Y0 + HF / 2 + .02, D / 2), { d: .42, from: [0, .4, 0], spin: [0, 0, 0], n: 'Paratia del vano attacchi' });
  P(mesh(G.box(W - .01, .006, D - .02), M.zinc, 0, Y0 + .003, D / 2), { d: .48, from: [0, -.3, 0], spin: [0, 0, 0], n: 'Fondo' });
  P(mesh(G.box(.11, .1, .1), M.zinc, XL + .06, Y0 + .05, .06), { d: .55, from: [-.3, -.2, .2], spin: [0, 0, 0], n: 'Base del vano attacchi' });
  PIN(G.box(W - .14, .01, .012), M.zinc, [Y0 + .19, Y0 + .53].map(y => ({ p: [.06, y, .04] })), { d0: .62, d1: .7, n: 'Traverse' });
  screws([XL + .003, XR - .003].flatMap(x => [Y0 + .05, Y0 + .53].map(y => ({ p: [x, y, .1], r: [0, 0, x < 0 ? PI / 2 : -PI / 2] }))), { d0: .78, d1: .9 });
}

// 2 ─ Gruppo ventilante (tangenziale, in vista mentre gira)
const rotor = new THREE.Group();
group('vent', 'Ventilatore tangenziale', 'Un rullo lungo con le alette sfalsate: muove tanta aria senza vortici e senza fischi. Lo fa girare un motore DC inverter brushless.', 7.5, 13.0, { stage: [0, .1, .6], ex: [0, -.25, .45], az: 30, el: 16, trav: .6,
  keys: [[.03, 36, 18, 1.1, 0], [.3, 18, 8, .55, 0], [.55, 48, 14, .6, 0], [.8, 24, 10, .8, 0], [.95, 30, 14, 1.1, 0]],
  info: { e: 'Il polmone del ventilconvettore: aspira l\'aria della stanza dal basso e la spinge attraverso la batteria. Il motore modula la velocità senza scatti.', s: 'Ventilatore tangenziale in materiale sintetico ad alette sfalsate, bilanciato staticamente e dinamicamente, calettato sull\'albero del motore · motore DC brushless a pacco resinato · supporti antivibranti in EPDM · manuale 00340791 p.4, scheda 05-2025' } });
{
  const x0 = XC + .015, x1 = XR - .085, L = x1 - x0, NS = 8, NB = 28;
  P(mesh(new THREE.CylinderGeometry(FR + .022, FR + .022, L + .01, 40, 1, true, rad(150), rad(220)).rotateZ(PI / 2), M.abs, (x0 + x1) / 2, FY, FZ), { d: 0, from: [0, -.3, .3], spin: [0, 0, 0], n: 'Chiocciola' });
  P(mesh(G.box(L, .006, .05), M.abs, (x0 + x1) / 2, FY + FR + .025, FZ - .03, rad(-20), 0, 0), { d: .05, from: [0, .3, 0], spin: [0, 0, 0], n: 'Lingua del convogliatore' });
  rotor.position.set((x0 + x1) / 2, FY, FZ); CUR.node.add(rotor);
  PIN(G.cylX(FR, .003, 32), M.rotore, Array.from({ length: NS + 1 }, (_, i) => ({ p: [-L / 2 + i * L / NS, 0, 0] })), { parent: rotor, d0: .1, d1: .22, from: [0, .3, 0], spin: [3, 0, 0], ease: eoc, n: 'Dischi di separazione', snd: 'tick' });
  const bl = []; for (let s = 0; s < NS; s++) for (let b = 0; b < NB; b++) { const a = (b + (s % 2) * .5) / NB * PI * 2; bl.push({ p: [-L / 2 + (s + .5) * L / NS, Math.cos(a) * (FR - .006), Math.sin(a) * (FR - .006)], r: [a + .5, 0, 0] }); }
  PIN(G.box(L / NS - .004, .012, .0018), M.rotore, bl, { parent: rotor, df: (k, f) => .24 + (k / NB | 0) * .045 + (k % NB) * .0008, dur: .3, from: [0, .2, .25], spin: [2, 0, 0], ease: eoc, n: 'Alette sfalsate', snd: 'fin' });
  P(mesh(G.cylX(.005, L + .06, 12), M.steel, 0, 0, 0), { parent: rotor, d: .66, from: [.4, 0, 0], spin: [6, 0, 0], n: 'Albero' });
  P(mesh(G.cylX(.03, .065, 28), M.black, x1 + .045, FY, FZ), { d: .72, from: [.4, 0, 0], spin: [4, 0, 0], n: 'Motore DC inverter brushless' });
  PIN(G.cylX(.018, .012, 16), M.epdm, [[x1 + .006, FY, FZ], [x0 - .006, FY, FZ]].map(p => ({ p })), { d0: .78, d1: .82, n: 'Supporti antivibranti in EPDM' });
  P(mesh(G.box(.006, .1, .1), M.zinc, x1 + .08, FY, FZ), { d: .86, from: [.3, 0, 0], spin: [0, 0, 0], n: 'Staffa del motore' });
  P(mesh(tubeGeo([[x1 + .05, FY + .03, FZ - .02], [x1 + .06, Y0 + .3, .04], [XR - .05, Y0 + .45, .05]], .003, 20), M.plastic), { d: .92, n: 'Cavo del motore' });
}

// 3 ─ Batteria di scambio e collettori
const FCP = {};
group('batt', 'Batteria e collettori', 'Tubi di rame e alette d\'alluminio trattate contro muffe e odori: l\'acqua calda o fredda della casa cede o prende il calore dell\'aria.', 13.0, 18.5, { stage: [0, .25, .6], ex: [0, .3, .4], az: 22, el: 22, zoom: .95,
  info: { e: 'Qui l\'acqua che arriva dalla pompa di calore scalda o raffresca l\'aria che il ventilatore ci spinge attraverso.', s: 'Tubi di rame, alettatura a pacco d\'alluminio con turbolenziatura, trattata idrofilicamente · raccordi Eurokonus 3/4, reversibili · sensore della temperatura dell\'acqua · 0,8 l · 10 bar · ingresso acqua da 4 a 80 °C · manuale 00340791 p.4-5' } });
{
  const x0 = XC + .006, x1 = XR - .03, L = x1 - x0, NF = 150, rows = [.012, -.012], TB = 4;
  const fin = []; for (let i = 0; i < NF; i++) { const [y, z] = bat(.5); fin.push({ p: [x0 + .004 + i * (L - .008) / (NF - 1), y, z], r: [BT, 0, 0] }); }
  const Lb = Math.hypot(BB[0] - BA[0], BB[1] - BA[1]);
  PIN(G.box(.0007, Lb, .045), M.alettaF, fin, { d0: .04, d1: .4, dur: .3, from: [0, .45, .2], spin: [0, 0, 0], ease: eoc, n: 'Alette d\'alluminio', snd: 'fin' });
  const nrm = [Math.cos(BT) * 0, -Math.cos(BT), -Math.sin(BT)];     // fuori dal piano della batteria (y, z)
  const tubi = []; for (let k = 0; k < TB; k++) for (const r of rows) { const [y, z] = bat((k + .5) / TB); tubi.push({ p: [(x0 + x1) / 2, y + Math.sin(BT) * r, z - Math.cos(BT) * r] }); }
  PIN(G.cylX(.0048, L + .02, 12), M.copper, tubi, { d0: .42, d1: .55, from: [.6, 0, 0], spin: [0, 0, 0], ease: eoc, n: 'Tubi in rame' });
  const curve = []; for (let k = 0; k < TB * 2 - 1; k++) { const a = tubi[k], b = tubi[k + 1]; const ps = k % 2 ? [x0 - .01] : [x1 + .01]; curve.push({ a, b, x: ps[0] }); }
  curve.forEach(({ a, b, x }, i) => P(mesh(tubeGeo([[x, a.p[1], a.p[2]], [x + Math.sign(x) * .018, (a.p[1] + b.p[1]) / 2, (a.p[2] + b.p[2]) / 2], [x, b.p[1], b.p[2]]], .0048, 12), M.copper), { d: .57 + i * .012, n: i ? null : 'Curve di ritorno' }));
  [[x0 - .004, 'Fianchetto della batteria'], [x1 + .004, null]].forEach(([x, n], i) => { const [y, z] = bat(.5); P(mesh(G.box(.003, Lb + .02, .05), M.zinc, x, y, z, BT, 0, 0), { d: .68 + i * .02, n }); });
  // collettori nel vano attacchi, raccordi Eurokonus, valvole di sfiato e sensore dell'acqua
  const cx = XL + .06, cz = [.05, .085];
  cz.forEach((z, i) => P(mesh(G.cyl(.009, .3, 14), M.copper, cx, Y0 + .33, z), { d: .72 + i * .03, from: [-.3, 0, 0], n: i ? null : 'Collettori di mandata e ritorno' }));
  cz.forEach((z, i) => P(mesh(tubeGeo([[cx, Y0 + (i ? .44 : .22), z], [x0 - .03, Y0 + (i ? .45 : .24), z], [x0 - .012, tubi[i ? 7 : 0].p[1], tubi[i ? 7 : 0].p[2]]], .006, 16), M.copper), { d: .76 + i * .02 }));
  cz.forEach((z, i) => { P(mesh(G.cyl(.012, .03, 6), M.brass, cx, Y0 + .165, z), { d: .8 + i * .02, from: [0, -.3, 0], spin: [0, 6, 0], snd: 'screw', n: i ? null : 'Raccordi Eurokonus 3/4' }); P(mesh(G.cyl(.008, .03, 12), M.brass, cx, Y0 + .495, z), { d: .84 + i * .02, n: i ? null : 'Valvole di sfiato dell\'aria' }); });
  P(mesh(G.rbox(.012, .022, .012, .003), M.plastic, x0 - .02, Y0 + .3, .07), { d: .9, n: 'Sensore della temperatura dell\'acqua' });
  FCP.wIn = [[cx, Y0 + .165, cz[0]], [cx, Y0 + .22, cz[0]], [x0 - .03, Y0 + .24, cz[0]], tubi[0].p];
  FCP.wBat = (() => { const a = []; for (let k = 0; k < tubi.length; k++) { const t = tubi[k].p, s = k % 2 ? -1 : 1; a.push([s > 0 ? x0 : x1, t[1], t[2]], [s > 0 ? x1 : x0, t[1], t[2]]); } return a; })();
  FCP.wOut = [tubi[7].p, [x0 - .012, tubi[7].p[1], tubi[7].p[2]], [x0 - .03, Y0 + .45, cz[1]], [cx, Y0 + .44, cz[1]], [cx, Y0 + .165, cz[1]]];
}

// 4 ─ Bacinella della condensa
group('cond', 'Bacinella della condensa', 'D\'estate la batteria fredda fa condensare l\'umidità dell\'aria: le gocce scendono nella bacinella e escono dallo scarico.', 18.5, 21.0, { stage: [0, -.1, .4], ex: [-.3, -.2, .2], az: 34, el: 22, zoom: .9,
  info: { e: 'Raffrescando, il ventilconvettore toglie anche l\'umidità: l\'acqua che si forma sulla batteria finisce qui e va allo scarico.', s: 'Bacinella in ABS, smontabile per la pulizia · prolunga rompigoccia · scarico con pendenza, tubo Ø interno minimo 16 mm · manuale 00340791 p.4, 9' } });
{
  P(mesh(G.box(W - .03, .008, .05), M.abs, .0, Y0 + .175, .11), { d: 0, from: [0, -.2, .2], spin: [0, 0, 0], n: 'Gocciolatoio sotto la batteria' });
  P(mesh(G.box(.1, .03, .1), M.abs, XL + .065, Y0 + .115, .06), { d: .3, from: [-.3, 0, .2], spin: [0, 0, 0], n: 'Bacinella in ABS' });
  P(mesh(G.cyl(.009, .04, 14), M.abs, XL + .05, Y0 + .085, .06), { d: .55, from: [0, -.2, 0], n: 'Prolunga rompigoccia' });
  P(mesh(tubeGeo([[XL + .05, Y0 + .065, .06], [XL + .05, Y0 + .02, .06], [XL + .03, Y0 - .03, .02], [XL - .05, Y0 - .05, .012], [XL - .2, Y0 - .07, .012]], .009, 30), M.grey), { d: .7, n: 'Scarico della condensa' });
  FCP.gocce = [[0, Y0 + .21, .1], [0, Y0 + .18, .11], [-.2, Y0 + .178, .11], [XL + .07, Y0 + .14, .07], [XL + .05, Y0 + .08, .06], [XL + .03, Y0 - .03, .02], [XL - .2, Y0 - .07, .012]];
}

// 5 ─ Pannello radiante, elettronica e pannello touch
group('rad', 'Pannello radiante ed elettronica', 'Dietro il frontale scorre l\'acqua calda anche a ventilatore spento: in modalità NIGHT la stanza si scalda per convezione, in silenzio.', 21.0, 25.0, { stage: [0, 0, .5], ex: [0, 0, .25], az: 18, el: 14, zoom: .95,
  info: { e: 'Il frontale stesso scalda: di notte il ventilatore si ferma e la stanza resta calda senza rumore. La scheda legge la temperatura e decide la velocità.', s: 'Modalità NIGHT: riscaldamento per semplice convezione · pannello radiante 0,27 l · resa statica 0,42 kW a 50 °C, 0,71 kW a 70 °C · pannello touch e telecomando IR · contatto on/off, Modbus · scheda 05-2025, manuale p.4' } });
{
  P(mesh(G.box(W - .16, HF - .23, .004), M.zinc, .06, Y0 + .38, D - .016), { d: 0, from: [0, 0, .4], spin: [0, 0, 0], n: 'Piastra del pannello radiante' });
  const serp = []; for (let i = 0; i < 6; i++) { const y = Y0 + .2 + i * .065, L = i % 2 === 0; serp.push([L ? XC + .03 : XR - .04, y, D - .02], [L ? XR - .04 : XC + .03, y, D - .02]); }
  P(mesh(tubeGeo(serp, .004, 160), M.copper), { d: .2, dur: .6, n: 'Serpentina del pannello radiante' }); FCP.rad = serp;
  P(mesh(G.box(.006, .14, .09), M.pcb, XR - .02, Y0 + .4, .07), { d: .45, from: [.3, 0, 0], spin: [0, 0, 0], n: 'Scheda elettronica' });
  PIN(G.cyl(.006, .014, 10), M.cap, [Y0 + .36, Y0 + .4, Y0 + .44].map(y => ({ p: [XR - .027, y, .07], r: [0, 0, PI / 2] })), { d0: .52, d1: .56 });
  PIN(G.box(.008, .012, .016), M.white, [-.03, 0, .03].map(dz => ({ p: [XR - .027, Y0 + .33, .07 + dz] })), { d0: .58, d1: .6, n: 'Morsetti: alimentazione, contatto presenza, Modbus' });
  P(mesh(G.box(.11, .004, .045), M.black, XR - .1, Y0 + HF - .004, .085), { d: .7, from: [0, .3, 0], spin: [0, 0, 0], n: 'Pannello di comando touch' });
  P(mesh(G.plane(.105, .04), M.fcPan, XR - .1, Y0 + HF - .0015, .085, -PI / 2, 0, 0), { d: .78, from: [0, .2, 0], spin: [0, 0, 0] });
}

// 6 ─ Mantello e griglie
group('mant', 'Mantello e griglie', 'Lamiera bianca RAL 9003, spessa in tutto 12,9 cm. Sotto la griglia che aspira con il filtro a nido d\'ape, sopra quella che soffia.', 25.0, 28.5, { stage: [0, 0, 0], ex: [0, 0, .5], az: 22, el: 10, zoom: 1.0,
  info: { e: 'La faccia che si vede in casa: si smonta per la pulizia, e il filtro si lava sotto l\'acqua o si soffia.', s: 'Mantello frontale e fianchi in lamiera elettrozincata, RAL 9003 · griglia di mandata reversibile · griglia di aspirazione in alluminio con sgancio rapido e microinterruttore · filtro a nido d\'ape in polipropilene · 897 × 579 × 129 mm · 15 kg · manuale p.4-5' } });
{
  P(mesh(G.box(W - .08, .13, .004), M.filtro, .02, Y0 + .09, D - .012), { d: 0, from: [0, -.2, .4], spin: [0, 0, 0], n: 'Filtro a nido d\'ape' });
  PIN(G.box(W - .1, .004, .016), M.sGrid, Array.from({ length: 9 }, (_, i) => ({ p: [.02, Y0 + .03 + i * .015, D - .004], r: [-.5, 0, 0] })), { d0: .12, d1: .3, from: [0, 0, .4], spin: [0, 0, 0], ease: eoc, n: 'Griglia di aspirazione', snd: 'tick' });
  P(mesh(G.box(.008, .004, .006), M.black, XR - .06, Y0 + .17, D - .006), { d: .32, n: 'Microinterruttore di sicurezza' });
  P(mesh(G.rbox(W, HF - .17, .012, .004), M.radiante, 0, Y0 + .17 + (HF - .17) / 2, D - .006), { d: .4, from: [0, .1, .6], spin: [0, 0, 0], ease: eoc, dur: .6, n: 'Mantello frontale, pannello radiante' });
  [XL + .004, XR - .004].forEach((x, i) => P(mesh(G.rbox(.008, HF, D, .003), M.sWhite, x, Y0 + HF / 2, D / 2), { d: .5 + i * .05, from: [Math.sign(x) * .5, 0, 0], spin: [0, 0, 0], ease: eoc, n: i ? null : 'Fianchi' }));
  PIN(G.box(W - .14, .003, .09), M.sGrid, Array.from({ length: 10 }, (_, i) => ({ p: [.04, Y0 + HF - .002, .015 + i * .01], r: [.6, 0, 0] })), { d0: .62, d1: .76, from: [0, .3, 0], spin: [0, 0, 0], ease: eoc, n: 'Griglia di mandata reversibile', snd: 'tick' });
  P(mesh(G.box(.11, .006, D - .01), M.sWhite, XL + .065, Y0 + HF - .003, D / 2), { d: .8, from: [0, .3, 0], spin: [0, 0, 0], n: 'Coperchio dei collettori' });
  P(mesh(G.box(.12, .004, D - .01), M.sWhite, XR - .1, Y0 + HF - .007, D / 2), { d: .84, from: [0, .3, 0], spin: [0, 0, 0] });
  screws([XL + .004, XR - .004].flatMap(x => [Y0 + .2, Y0 + .5].map(y => ({ p: [x, y, D - .03], r: [0, 0, x < 0 ? PI / 2 : -PI / 2] }))), { d0: .88, d1: .96, mat: M.sScrew, n: 'Viti dei fianchi' });
}

// 7 ─ Collegamenti
group('link', 'Collegamenti', 'Mandata e ritorno dall\'impianto, coibentati fino all\'imbocco; lo scarico della condensa in pendenza; il cavo di alimentazione.', 28.5, 30.5, { stage: [0, 0, 0], ex: [-.2, 0, .2], az: 40, el: 14, zoom: .9,
  info: { e: 'Il ventilconvettore si collega all\'impianto come un radiatore: due tubi d\'acqua, uno scarico e una presa elettrica.', s: 'Tubi Ø 14 mm per la taglia 400 · coibentati fino all\'imbocco della macchina · alimentazione 230 V · manuale 00340791 p.8-9, 13 · percorso nel muro: indicativo' } });
{
  const cx = XL + .06;
  [.05, .085].forEach((z, i) => { const p = [[cx, Y0 + .15, z], [cx, Y0 + .05, z], [cx, .02, z], [cx - .25, .02, z * .2], [cx - .5, .02, .004]];
    P(mesh(tubeGeo(p, .007, 40), M.copper), { d: i * .1, dur: .5, n: i ? 'Ritorno all\'impianto' : 'Mandata dall\'impianto' });
    P(mesh(tubeGeo(p.slice(1), .014, 40), M.sFoam), { d: .3 + i * .1, n: i ? null : 'Coibentazione' }); FCP['l' + i] = p; });
  P(mesh(tubeGeo([[XR - .03, Y0 + .3, .02], [XR + .06, Y0 + .25, .01], [XR + .12, Y0 + .1, .004], [XR + .12, .3, .004]], .004, 24), M.plastic), { d: .7, n: 'Cavo di alimentazione' });
  P(mesh(G.rbox(.07, .07, .012, .004), M.white, XR + .12, .3, .006), { d: .8, n: 'Presa' });
}
for (const k in FCP) PIPE[k] = FCP[k];
finalize();
