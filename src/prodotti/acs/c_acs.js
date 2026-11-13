// ───────── HP 300PSDX · pezzi, scena e film (motore della UHP, pagina comune) ─────────
// Dal manuale installatore 00340944: p.12 (caratteristiche: serbatoio inox Duplex 2205, anodo, condensatore esterno, PU 50 mm, R290), p.13 (vista
// d'insieme con i componenti: coperchio con uscita e ingresso aria, interfaccia, motore ventilatore, piastra, box elettrico, evaporatore, compressore,
// valvola a 2 vie, valvola di espansione elettronica), p.14-15 (quote e attacchi 1-13), p.18 (circuito: valvola di by-pass, pressostato di bassa,
// presa di servizio, sonde T1-T5), p.26 (box elettrico con coperchio a 4 viti), p.30-32 e p.37 (set, antilegionella, contatto fotovoltaico, dati).
// Depliant 00341057: condensatore a flusso parallelo a sezione ovale, evaporatore a microcanali, compressore rotativo, regolatore touch screen.
// RICOSTRUITO (il manuale ha una sola vista d'insieme, p.13): posizione dei componenti sopra la piastra e percorso dei tubi, interno del compressore,
// numero di bande del condensatore e di spire del serpentino, posizione angolare delle coperture posteriori, altezza delle sonde T2 e T3.
const B = .035, R = .30, RT = .25, YC = B + 1.51, Y5 = YC + .012, AT = h => B + h;     // piedini, raggio esterno, raggio del serbatoio, inizio del coperchio, piastra, quota di un attacco
const polare = (az, r, y) => [Math.sin(rad(az)) * r, y, Math.cos(rad(az)) * r];
const radiale = (m, az) => { m.rotation.order = 'YXZ'; m.rotation.set(PI / 2, rad(az), 0); return m; };    // asse Y del pezzo verso l'esterno, all'angolo az
const CX = .18, CZ = -.12, EX = .03, FX = -.15, FY = Y5 + .13, FZ = .066, KS = .6;          // compressore, evaporatore, ventilatore; scala del compressore
// texture e materiali propri
T.evap = cv(64, 256, g => { g.fillStyle = '#7d878d'; g.fillRect(0, 0, 64, 256); for (let y = 0; y < 256; y += 4) { g.fillStyle = y % 8 ? '#a9b1b6' : '#5e676d'; g.fillRect(0, y, 64, 2); } });
T.jack = cv(256, 64, g => { const r = rng(5); g.fillStyle = '#b9bdc0'; g.fillRect(0, 0, 256, 64); for (let i = 0; i < 900; i++) { const v = 170 + r() * 50 | 0; g.fillStyle = `rgba(${v},${v + 2},${v + 4},.35)`; g.fillRect(r() * 256, r() * 64, 1, 4 + r() * 30); } });
T.pu = cv(128, 128, g => { const r = rng(9); g.fillStyle = '#d9c78a'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 700; i++) { const v = r(); g.fillStyle = `rgba(${150 + v * 60 | 0},${130 + v * 50 | 0},${70 + v * 40 | 0},.4)`; g.beginPath(); g.arc(r() * 128, r() * 128, .6 + r() * 1.8, 0, 7); g.fill(); } });
T.targa = cv(512, 300, g => { g.fillStyle = '#e9ece9'; g.fillRect(0, 0, 512, 300); drawUnicalLogo(g, 22, 22, 128); g.fillStyle = '#16191b'; g.font = '700 32px Barlow, Arial, sans-serif'; g.fillText('HP 300PSDX', 250, 56); g.fillRect(22, 74, 468, 3); g.font = '500 24px Barlow, Arial, sans-serif';
  ['Scaldacqua a pompa di calore', 'Bollitore 300 l, inox Duplex 2205', 'Refrigerante R290', 'Resistenza 1500 W'].forEach((s, i) => g.fillText(s, 26, 122 + i * 40)); });
T.logoCop = cv(256, 64, g => { g.clearRect(0, 0, 256, 64); drawUnicalLogo(g, 70, 8, 116); });
T.schermo = cv(256, 256, () => {});
T.muroA = rep(cv(256, 256, g => { const r = rng(31); g.fillStyle = '#4a4e52'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 5000; i++) { const v = 62 + r() * 34 | 0; g.fillStyle = `rgba(${v},${v + 3},${v + 6},.5)`; g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3); } }), 3, 4);
T.piastrelle = rep(cv(256, 256, g => { g.fillStyle = '#3d4246'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#2a2e31'; g.lineWidth = 4; g.strokeRect(2, 2, 252, 252); }), 4, 3);
Object.assign(M, {
  sTank: xr(std({ color: 0xb8bec2, roughness: .55, metalness: .75, side: THREE.DoubleSide })),
  sJack: xr(std({ color: 0xb4b8bb, roughness: .42, metalness: .72, map: T.jack })),
  sPU: xr(std({ color: 0xffffff, roughness: .95, metalness: 0, map: T.pu, bumpMap: T.noise, bumpScale: 2 })),
  sCov: xr(std({ color: 0x2a2d30, roughness: .55, metalness: .1, side: THREE.DoubleSide })),
  sBox: xr(std({ color: 0x9aa1a6, roughness: .45, metalness: .75, map: T.spangle })),
  sTarga: xr(std({ color: 0xc8c8c8, roughness: .55, map: T.targa })),
  logoC: new THREE.MeshBasicMaterial({ map: T.logoCop, transparent: true }),
  evap: std({ color: 0xffffff, roughness: .45, metalness: .7, map: T.evap, emissive: 0x2a8cff, emissiveIntensity: 0 }),
  condA: std({ color: 0xb5bcc1, roughness: .4, metalness: .85, side: THREE.DoubleSide, emissive: 0xff5a1c, emissiveIntensity: 0 }),
  mag: std({ color: 0x7c8086, roughness: .7, metalness: .4 }),
  res: std({ color: 0x55585c, roughness: .5, metalness: .6, emissive: 0xff3a10, emissiveIntensity: 0 }),
  schermo: new THREE.MeshBasicMaterial({ map: T.schermo }),
  muro: std({ color: 0x9aa0a4, roughness: .95, map: T.muroA, bumpMap: T.noise, bumpScale: 1.5 }),
  pav: std({ color: 0x8c9196, roughness: .8, map: T.piastrelle }),
});
ambienteBase(); ambiente(['sTank', 'sJack', 'sBox', 'condA', 'evap', 'mag'], AMB_M); ambiente(['sTarga', 'sPU', 'sCov'], AMB_B);
SOLO.push([M.sTank, .12], [M.condA, .2], [M.muro, .35]);

// lavanderia: parete e pavimento (scenografia, non pezzi)
scene.add(mesh(G.plane(2.4, 2.7), M.muro, .15, 1.35, -.62));
scene.add(mesh(G.box(2.4, .01, 1.5), M.pav, .15, -.005, .1));
const ombra = mesh(G.plane(1.0, 1.0), new THREE.MeshBasicMaterial({ map: T.shadow, transparent: true, depthWrite: false }), 0, .002, 0, -PI / 2); scene.add(ombra);

// 1 ─ Serbatoio
// RICOSTRUITO, l'ordine di montaggio: prima il guscio aperto in alto; il serpentino scende dentro dall'alto; poi pozzetti e presa dell'acqua calda,
// la calotta che chiude, l'anodo e la resistenza dai loro manicotti. Questi pezzi del serbatoio arrivano durante il gruppo del serpentino (at).
// calotta superiore ellittica (raccordo continuo con il mantello: un profilo a spigoli faceva un punto di luce che sfondava nel bagliore)
const PROF_T = [[0, .10], [.15, .115], [.23, .17], [RT, .25], ...Array.from({ length: 13 }, (_, i) => { const f = i / 12 * PI / 2; return [RT * Math.cos(f), 1.32 + .135 * Math.sin(f)]; })].map(([r, y]) => new THREE.Vector2(r, y + B));
const T_TANK = 3.5, T_COIL = 7.6, T_COND = 12.5;
const gTank = group('tank', 'Serbatoio', 'Trecento litri in acciaio inox Duplex 2205: resiste alla corrosione e non serve trattarlo.', T_TANK, T_COIL, { stage: [0, 0, 0], ex: [0, 0, 0], zoom: 1,
  keys: [[.02, 28, 16, .42, -.5], [.24, 32, 13, .5, -.42], [.4, 24, 9, 1.0, .02], [.62, 50, 8, 1.0, .05]],
  info: { e: 'Il cuore: trecento litri d\'acqua in un serbatoio d\'acciaio inossidabile. L\'acqua fredda entra dal fondo, quella calda esce dall\'alto.', s: 'Acciaio inox Duplex 2205 · 300 l · anodo in magnesio · resistenza 1500 W con termostato 85 °C · termostato 80 °C · attacchi G 3/4 · manuale 00340944 p.12-15' } });
{
  for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3 + PI / 6; P(mesh(G.cyl(.03, B, 16), M.rubber, Math.sin(a) * .22, B / 2, Math.cos(a) * .22), { d: i * .03, from: [0, -.3, 0], n: i ? null : 'Piedini' }); }
  P(mesh(G.cyl(R - .004, .012, 48), M.black, 0, B + .006, 0), { d: .1, from: [0, -.4, 0], spin: [0, 1, 0], n: 'Fondo' });
  PIN(G.cyl(.012, .07, 12), M.galv, [0, 1, 2].map(i => { const a = i * PI * 2 / 3 + PI / 2; return { p: [Math.sin(a) * .15, B + .047, Math.cos(a) * .15] }; }), { d0: .14, d1: .16, n: 'Supporti del serbatoio' });
  P(mesh(new THREE.LatheGeometry(PROF_T.slice(0, 4), 48), M.sTank), { d: .2, from: [0, -.5, 0], spin: [0, 1, 0], dur: .55, n: 'Fondo bombato' });
  P(mesh(new THREE.LatheGeometry(PROF_T.slice(3, 5), 48), M.sTank), { d: .3, from: [0, 1.2, 0], spin: [0, .6, 0], dur: .65, ease: eoc, n: 'Mantello in inox Duplex 2205' });
  P(mesh(G.torus(RT, .0035, PI * 2, 64), M.sTank, 0, B + .25, 0, PI / 2, 0, 0), { d: .42, n: 'Saldature', snd: 'tick' });
  // manicotti sul fianco destro: anodo e acqua calda (quelli del serpentino arrivano con lui); acqua fredda sul fondo
  [[1.17, 'Manicotto dell\'anodo'], [1.27, 'Manicotto dell\'acqua calda']].forEach(([h, n], i) => P(mesh(G.cylX(.016, .04, 16), M.inox, RT + .015, AT(h), 0), { d: .5 + i * .03, from: [.3, 0, 0], spin: [2, 0, 0], n, snd: 'screw' }));
  P(mesh(G.cyl(.016, .03, 16), M.inox, .15, B + .1, 0), { d: .58, from: [0, -.3, 0], spin: [0, 2, 0], n: 'Manicotto dell\'acqua fredda, sul fondo', snd: 'screw' });
  // acqua fredda: entra in basso e sbocca sul fondo
  P(mesh(tubeGeo([[R - .01, AT(.0325), 0], [.19, AT(.0325), 0], [.155, B + .05, 0], [.15, B + .09, 0]], .009, 24), M.inox), { d: .64, n: 'Ingresso dell\'acqua fredda, sotto il serbatoio' });
  P(mesh(G.cyl(.022, .012, 16), M.inox, .15, B + .14, 0), { d: .72, from: [0, 1.1, 0], spin: [0, 0, 0], ease: eoc, n: 'Diffusore' });
  // dopo il serpentino (at): pozzetti, presa dell'acqua calda, calotta, anodo, resistenza
  [[205, .47, 'Pozzetto della sonda T2', .12], [150, .855, 'Pozzetto della sonda ausiliaria', .16], [205, 1.15, 'Pozzetto del termostato 80 °C', .14], [205, 1.25, 'Pozzetto della sonda T3', .12]].forEach(([az, h, n, L], i) => {
    const m = radiale(mesh(G.cyl(.007, L, 10), M.inox, ...polare(az, RT - L / 2 + .01, AT(h))), az); P(m, { at: 9.6 + i * .1, dur: .4, from: polare(az, .3, 0), spin: [0, 0, 0], ease: eoc, n }); });
  P(mesh(tubeGeo([[RT + .03, AT(1.27), 0], [.16, AT(1.27), 0], [.08, AT(1.33), 0], [.04, AT(1.42), 0]], .009, 24), M.inox), { at: 9.95, n: 'Presa dell\'acqua calda, in cima' });
  P(mesh(new THREE.LatheGeometry(PROF_T.slice(4), 48), M.sTank), { at: 10.35, from: [0, .7, 0], spin: [0, 1, 0], dur: .55, ease: eoc, n: 'Calotta superiore' });
  P(mesh(G.torus(RT, .0035, PI * 2, 64), M.sTank, 0, B + 1.32, 0, PI / 2, 0, 0), { at: 10.9, dur: .3, snd: 'tick' });
  P(mesh(G.cylX(.011, .36, 14), M.mag, RT - .18, AT(1.17), 0), { at: 11.0, from: [.8, 0, 0], spin: [0, 0, 0], ease: eoc, n: 'Anodo in magnesio' });
  { const a9 = 205, d9 = polare(a9, RT - .15, AT(.95)), geo = mergeGeometries([G.cylX(.006, .3, 10).translate(0, -.02, 0), G.cylX(.006, .3, 10).translate(0, .02, 0), G.torus(.02, .006, PI).rotateZ(PI / 2).translate(-.15, 0, 0)]);
    P(mesh(geo, M.res, ...d9, 0, rad(a9) - PI / 2, 0), { at: 11.15, from: polare(a9, .55, 0), spin: [0, 0, 0], ease: eoc, n: 'Resistenza 1500 W' }); }
  P(radiale(mesh(G.cyl(.04, .02, 24), M.brass, ...polare(205, RT + .008, AT(.95))), 205), { at: 11.4, from: polare(205, .25, 0), spin: [0, 3, 0], ease: eoc, n: 'Flangia della resistenza', snd: 'screw' });
}
// acqua stratificata, dentro il serbatoio: segue il gruppo ma non è un pezzo
const tAcqua = cv(4, 256, () => {}), acquaM = new THREE.MeshBasicMaterial({ map: tAcqua, transparent: true, opacity: 0, depthWrite: false });
const acqua = mesh(new THREE.CylinderGeometry(RT - .008, RT - .008, 1.3, 40, 1, true), acquaM, 0, B + .78, 0); acqua.renderOrder = 2; gTank.node.add(acqua);
function disegnaAcqua(caldo, set) { const c = tAcqua.image.getContext('2d'), g = c.createLinearGradient(0, 0, 0, 256), k = clamp(caldo, .001, .999), top = set >= 70 ? '#ff2d1a' : set >= 65 ? '#ff5a1f' : '#ff8a2e';
  g.addColorStop(0, top); g.addColorStop(Math.max(0, k - .05), top); g.addColorStop(Math.min(1, k + .05), '#2a7fd6'); g.addColorStop(1, '#1d5fb0'); c.fillStyle = g; c.fillRect(0, 0, 4, 256); tAcqua.needsUpdate = true; }

// 2 ─ Serpentino: scende dall'alto nel serbatoio ancora aperto
group('coil', 'Serpentino', 'Una spirale in acciaio AISI 316 da 1,2 m², in basso: porta nell\'acqua il calore di un\'altra fonte, per esempio il solare termico. Poi la calotta chiude il serbatoio.', T_COIL, T_COND, { stage: [0, 0, 0], ex: [0, 0, .85], zoom: 1,
  keys: [[.02, 40, 24, 1.25, .4], [.24, 28, 12, 1.15, .02], [.42, 64, 10, 1.3, .2], [.57, 36, 20, 1.6, .55], [.72, 100, 10, 1.45, .45]],
  info: { e: 'Una seconda strada per il calore: se in casa c\'è un impianto solare termico, il suo calore entra nell\'acqua da qui.', s: 'AISI 316 · 1,2 m² di superficie di scambio · attacchi G 3/4 a 235 mm (uscita al solare) e 855 mm (ingresso dal solare) · manuale 00340944 p.15 · ordine di montaggio: ricostruito' } });
{
  const NT = 9, y0 = AT(.30), y1 = AT(.78), rc = .185;
  for (let i = 0; i < NT; i++) { const p = []; for (let k = 0; k <= 24; k++) { const a = (i + k / 24) * PI * 2, y = lerp(y0, y1, (i + k / 24) / NT); p.push([Math.cos(a) * rc, y, Math.sin(a) * rc]); }
    const m = mesh(tubeGeo(p, .011, 48), M.inox); m.userData.vola = true; P(m, { d: .02 + i * .035, from: [0, 1.3, 0], spin: [0, .8, 0], dur: .5, ease: eoc, n: i ? null : 'Spire in AISI 316', snd: 'fin' }); }
  // supporti: barrette appoggiate all'interno delle spire
  PIN(G.box(.012, y1 - y0 + .06, .02), M.inox, [0, 1, 2].map(i => { const a = i * PI * 2 / 3 + .4; return { p: [Math.cos(a) * (rc - .017), (y0 + y1) / 2, Math.sin(a) * (rc - .017)], r: [0, -a, 0], a }; }),
    { d0: .32, d1: .36, from: (i, it) => [-Math.cos(it.a) * .09, 0, -Math.sin(it.a) * .09], spin: [0, 0, 0], ease: eoc, n: 'Supporti' });
  P(mesh(tubeGeo([[RT + .03, AT(.235), 0], [.2, AT(.235), 0], [rc, y0, 0]], .011, 20), M.inox), { d: .38, n: 'Uscita verso il solare (2)' });
  P(mesh(tubeGeo([[rc, y1, 0], [.2, AT(.82), 0], [RT + .03, AT(.855), 0]], .011, 20), M.inox), { d: .41, n: 'Ingresso dal solare (3)' });
  [[RT + .015, AT(.235)], [RT + .015, AT(.855)]].forEach(([x, y], i) => P(mesh(G.cylX(.016, .04, 16), M.inox, x, y, 0), { d: .44 + i * .02, from: [.3, 0, 0], spin: [2, 0, 0], snd: 'screw', n: i ? null : 'Manicotti' }));
}

// 3 ─ Condensatore a flusso parallelo, avvolto all'esterno del serbatoio
// Ogni banda si avvolge al suo posto partendo dal collettore d'ingresso; dove passa un manicotto, un pozzetto o la flangia la banda ha una tacca.
// RICOSTRUITO: numero e quote delle bande, tacche.
group('cond', 'Condensatore avvolto', 'Bande piatte di alluminio a flusso parallelo, avvolte fuori dal serbatoio: il gas caldo cede il calore all\'acqua senza mai toccarla.', T_COND, 16.5, { stage: [0, 0, 0], ex: [-.85, 0, 0], zoom: 1,
  keys: [[.03, 118, 12, 1.25, .2], [.32, 72, 8, 1.2, .1], [.58, 14, 9, 1.45, 0]],
  info: { e: 'Qui il calore preso dall\'aria passa all\'acqua. Il gas scorre in bande d\'alluminio strette al serbatoio: niente contatto con l\'acqua di casa, niente calcare.', s: 'Alluminio, flusso parallelo, sezione ovale · all\'esterno del bollitore: anti-contaminazione e anti-incrostazione · depliant 00341057 · numero di bande: ricostruito' } });
{
  const NB = 18, ha = .52, hb = 1.27, rb = RT + .006, BH = .022, A0 = 166, AL = 332, NS = 144;
  // ciò che attraversa la fascia delle bande: [azimut, quota, mezza altezza]
  const PASSA = [[90, .235, .016], [90, .855, .016], [90, 1.17, .016], [90, 1.27, .016], [205, .95, .04], [205, .47, .007], [150, .855, .007], [205, 1.15, .007], [205, 1.25, .007]];
  const banda = h => {
    const y = AT(h), tacche = PASSA.filter(([, hc, r]) => Math.abs(h - hc) <= BH / 2 + r + .003).map(([az, , r]) => [az, Math.asin((r + .005) / rb) * 180 / PI]);
    const pos = [], nor = [], idx = [], len = [];
    for (let k = 0; k <= NS; k++) { const az = rad(A0 - AL * k / NS), sx = Math.sin(az), cz = Math.cos(az); pos.push(sx * rb, y - BH / 2, cz * rb, sx * rb, y + BH / 2, cz * rb); nor.push(sx, 0, cz, sx, 0, cz); len.push(k); }
    for (let k = 0; k < NS; k++) { const am = A0 - AL * (k + .5) / NS, b0 = 2 * k;
      if (tacche.some(([az, w]) => Math.abs(((am - az) % 360 + 540) % 360 - 180) < w)) idx.push(b0, b0, b0, b0, b0, b0); else idx.push(b0, b0 + 1, b0 + 2, b0 + 1, b0 + 3, b0 + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx);
    g.userData = { tubo: true, len: Float32Array.from(len), tot: NS, n: NS, rad: 1, testa: V(...polare(A0, rb, y)), punta: V(...polare(A0 - AL, rb, y)) };
    return g; };
  for (let i = 0; i < NB; i++) P(mesh(banda(lerp(hb, ha, i / (NB - 1))), M.condA), { d: .06 + i * .03, n: i ? null : 'Bande in alluminio a sezione ovale', snd: 'fin' });
  [[170, 'Collettore di ingresso del gas'], [190, 'Collettore di uscita']].forEach(([az, n], i) => P(mesh(G.cyl(.011, AT(hb) - AT(ha) + .05, 16), M.condA, ...polare(az, rb + .006, AT((ha + hb) / 2))), { d: .64 + i * .05, from: polare(az, .3, 0), spin: [0, 0, 0], ease: eoc, n }));
  PIN(G.box(.02, .012, .004), M.galv, [0, 1, 2, 3].flatMap(k => [60, 300].map(az => ({ p: polare(az, rb + .004, AT(lerp(ha, hb, k / 3))), r: [0, rad(az), 0], az }))),
    { d0: .78, d1: .9, from: (i, it) => polare(it.az, .2, 0), spin: [0, 0, 0], ease: eoc, n: 'Fascette di tenuta' });
}

// 4 ─ Isolamento e rivestimento
group('iso', 'Isolamento e rivestimento', 'Cinque centimetri di poliuretano espanso tengono il calore; fuori, la lamiera grigio argento con tutti gli attacchi.', 16.5, 21.0, { stage: [0, 0, 0], ex: [.95, 0, 0], zoom: 1, keys: [[.03, 36, 10, 1.05, 0], [.3, 66, 8, 1.05, 0], [.52, 150, 8, 1.0, 0], [.8, 80, 8, 1.05, 0]],
  info: { e: 'Il cappotto: tiene l\'acqua calda per ore. Fuori, la lamiera con gli attacchi dell\'acqua sul fianco destro e le coperture sul retro.', s: 'Poliuretano espanso 50 mm · Ø 600 mm · attacchi 1-6 sul fianco destro a 32,5 / 235 / 855 / 1170 / 1270 / 1370 mm · coperture 7-13 sul retro · manuale 00340944 p.14-15' } });
{
  const H0 = B + .012, HH = YC - H0;
  [[PI / 2, PI * 1.5, -1], [-PI / 2, PI / 2, 1]].forEach(([a, b2, s], i) => P(mesh(annulus(R - .005, RT + .016, HH, a, b2, 48), M.sPU, 0, H0 + HH / 2, 0), { d: i * .06, from: [s * .7, 0, 0], spin: [0, 0, 0], dur: .55, ease: eoc, n: i ? null : 'Poliuretano espanso, 50 mm' }));
  P(mesh(G.cyl(R - .005, .03, 48), M.sPU, 0, YC - .015, 0), { d: .14, from: [0, .5, 0], spin: [0, 0, 0] });
  [[PI / 2, PI * 1.5, -1, 'Rivestimento grigio argento'], [-PI / 2, PI / 2, 1, null]].forEach(([a, b2, s, n], i) => P(mesh(annulus(R, R - .003, HH, a, b2, 64), M.sJack, 0, H0 + HH / 2, 0), { d: .22 + i * .07, from: [s * .9, 0, 0], spin: [0, 0, 0], dur: .6, ease: eoc, n }));
  P(mesh(G.torus(R, .006, PI * 2, 64), M.sCov, 0, YC - .003, 0, PI / 2, 0, 0), { d: .36, from: [0, .4, 0], spin: [0, 0, 0], ease: eoc, n: 'Bordo superiore' });
  // attacchi 1-6 sul fianco destro
  [[.0325, M.brass, .014, 'Acqua fredda (1)'], [.235, M.brass, .014, 'Al solare (2)'], [.855, M.brass, .014, 'Dal solare (3)'], [1.17, M.sCov, .017, 'Tappo dell\'anodo (4)'], [1.27, M.brass, .014, 'Acqua calda (5)'], [1.37, M.brass, .011, 'Condensa G 1/2 (6)']].forEach(([h, m, r, n], i) => {
    P(mesh(G.cylX(r, .045, 16), m, R + .02, AT(h), 0), { d: .42 + i * .03, from: [.3, 0, 0], spin: [4, 0, 0], snd: 'screw', n });
    if (m === M.brass) P(mesh(G.cylX(r + .006, .012, 6), m, R + .006, AT(h), 0), { d: .44 + i * .03, from: [.3, 0, 0], spin: [6, 0, 0], snd: 'screw' }); });
  // coperture e passaggi sul retro (7-13)
  const ret = (az, h) => { const m = mesh(G.cyl(1, 1, 24), M.sCov); m.position.set(...polare(az, R + .004, AT(h))); m.rotation.order = 'YXZ'; m.rotation.set(PI / 2, rad(az), 0); return m; };
  [[150, .855, .012, .02, 'Pozzetto della sonda ausiliaria PG9 (7)'], [228, .86, .05, .014, 'Copertura dei morsetti ausiliari (8)'], [205, .95, .055, .014, 'Copertura della resistenza (9)'], [205, 1.15, .045, .014, 'Copertura del termostato (10)'],
    [228, 1.33, .012, .02, 'Sonda solare (11)'], [228, 1.42, .014, .02, 'Passaggio alimentazione (12)'], [228, .79, .012, .02, 'Passaggio cavi ausiliari (13)']].forEach(([az, h, r, t, n], i) => { const m = ret(az, h); m.scale.set(r, t, r); const d = polare(az, .4, 0); P(m, { d: .62 + i * .03, from: [d[0], 0, d[2]], spin: [0, 0, 0], n }); });
  P(mesh(G.plane(.16, .094), M.sTarga, ...polare(180, R + .002, AT(.62)), 0, PI, 0), { d: .86, from: [0, 0, -.4], spin: [0, 0, 0], n: 'Targhetta' });
  // acqua di casa: tubi e valvole fino alla parete (percorso indicativo)
  const tw = (h, n, d) => { P(mesh(tubeGeo([[R + .045, AT(h), 0], [.4, AT(h), 0], [.43, AT(h), -.04], [.43, AT(h), -.3], [.43, AT(h), -.6]], .011, 40), M.copper), { d, dur: .5, n });
    P(mesh(G.rbox(.034, .034, .05, .006), M.brass, .43, AT(h), -.25), { d: d + .03, n: 'Valvola a sfera' }); P(mesh(G.box(.012, .07, .012), h < .5 ? M.blue : M.red, .43, AT(h) + .04, -.25), { d: d + .04, from: [0, .2, 0] }); };
  tw(.0325, 'Tubo dell\'acqua fredda', .9); tw(1.27, 'Tubo dell\'acqua calda', .94);
}

// 5 ─ Compressore rotativo (in sezione finché non arriva la chiusura: interno di principio)
group('comp', 'Compressore rotativo', 'Un pistone rotante schiaccia il propano R290 e lo scalda. Sotto, la piastra che regge tutto il gruppo frigorifero.', 21.0, 26.5, { stage: [0, .1, .85], ex: [0, .5, 0], az: 34, el: 14, trav: .55,
  keys: [[.03, 30, 18, 1.15, 0], [.3, 22, 10, .7, -.02], [.5, 40, 12, .85, 0], [.72, 28, 8, .72, -.01], [.88, 36, 14, 1.15, 0]],
  info: { e: 'Il motore della pompa di calore: schiaccia il gas, che si scalda, e lo manda al condensatore attorno al serbatoio.', s: 'Compressore rotativo · propano R290 · interno: schema di principio · manuale 00340944 p.13, depliant 00341057' } });
let cmp, crank;
{
  P(mesh(G.cyl(R - .014, .012, 56), M.galv, 0, YC + .006, 0), { d: 0, from: [0, -.3, 0], spin: [0, 1, 0], n: 'Piastra di appoggio del gruppo frigorifero' });
  PIN(annulus(.03, .02, .013), M.rubber, [[.06, -.24], [-.03, -.25], [.07, .23]].map(([x, z]) => ({ p: [x, YC + .006, z] })), { d0: .04, d1: .06, n: 'Passaggi dei tubi' });
  cmp = new THREE.Group(); cmp.position.set(CX, Y5, CZ); cmp.scale.setScalar(KS); CUR.node.add(cmp); crank = new THREE.Group(); cmp.add(crank);
  const AX = -.115, AZ = .05, cp = (m, o) => P(m, Object.assign({ parent: cmp }, o)), ck = (m, o) => P(m, Object.assign({ parent: crank, spin: [0, 4, 0], from: [0, .35, 0] }, o));
  cp(mesh(G.rbox(.2, .012, .2, .004), M.galv, 0, .006, 0), { d: .08, from: [0, -.2, 0], n: 'Supporto antivibrante' });
  const gr = [0, 1, 2].map(i => { const a = rad(90 + i * 120); return { p: [Math.cos(a) * .082, .027, Math.sin(a) * .082] }; });
  PIN(G.cyl(.017, .03, 16), M.rubber, gr, { parent: cmp, d0: .1, d1: .13, n: 'Gommini' });
  cp(mesh(new THREE.CylinderGeometry(.11, .11, .005, 3), M.black, 0, .0445, 0, 0, rad(-30), 0), { d: .15, n: 'Piede' });
  screws(gr.map(g => ({ p: [g.p[0], .048, g.p[2]] })), { parent: cmp, d0: .16, d1: .18 });
  cp(mesh(G.dome(.066, .45, false), M.shellC, 0, .075, 0), { d: .2, from: [0, -.25, 0], spin: [0, 2, 0], n: 'Fondello' });
  cp(mesh(G.cyl(.05, .014, 32), M.cast, 0, .09, 0), { d: .23, n: 'Supporto inferiore' });
  ck(mesh(G.cyl(.0105, .25, 20), M.steel, 0, .19, 0), { d: .26, dur: .6, n: 'Albero eccentrico' });
  ck(mesh(G.cyl(.024, .028, 28), M.steel, .009, .12, 0), { d: .3 }); ck(mesh(annulus(.032, .024, .028), M.brass, .009, .12, 0), { d: .32, n: 'Pistone rotante' });
  cp(mesh(annulus(.058, .041, .03), M.cast, 0, .12, 0), { d: .36, n: 'Camera di compressione' });
  cp(mesh(G.box(.02, .028, .004), M.steel, .049 * Math.sin(rad(215)), .12, .049 * Math.cos(rad(215)), 0, rad(125), 0), { d: .39, n: 'Paletta' });
  cp(mesh(G.cyl(.05, .014, 32), M.cast, 0, .152, 0), { d: .43, n: 'Supporto superiore' });
  cp(mesh(G.cyl(.042, .018, 28, .034), M.steel, 0, .168, 0), { d: .45, n: 'Silenziatore' });
  ck(mesh(G.cyl(.0345, .075, 36), M.lam, 0, .235, 0), { d: .48, n: 'Rotore' });
  cp(mesh(annulus(.0615, .0375, .075), M.lam, 0, .235, 0), { d: .52, from: [0, .45, 0], spin: [0, 1.5, 0], dur: .6, n: 'Statore' });
  [.283, .187].forEach((y, i) => cp(mesh(G.torus(.0495, .0115), M.copper, 0, y, 0, PI / 2, 0, 0), { d: .55 + i * .01, n: i ? null : 'Avvolgimenti in rame' }));
  cp(mesh(G.open(.066, .26, PI / 2, rad(250)), M.shellC, 0, .205, 0), { d: .58, from: [-.2, .35, -.25], spin: [0, 2.5, 0], dur: .65, n: 'Mantello' });
  cp(mesh(G.cyl(.03, .19, 28), M.shellC, AX, .225, AZ), { d: .62, n: 'Separatore di liquido' });
  cp(mesh(G.dome(.03, .5), M.shellC, AX, .32, AZ), { d: .63 }); cp(mesh(G.dome(.03, .5, false), M.shellC, AX, .13, AZ), { d: .63 });
  cp(mesh(annulus(.0325, .03, .014), M.steel, AX, .25, AZ), { d: .64 });
  { const L = Math.hypot(AX, AZ), ux = AX / L, uz = AZ / L; cp(mesh(tubeGeo([[AX, .118, AZ], [AX * .8, .1, AZ * .8], [ux * .085, .12, uz * .085], [ux * .062, .12, uz * .062]], .0068, 28), M.copper), { d: .66, n: 'Aspirazione' }); }
  cp(mesh(G.cyl(.008, .05, 14), M.copper, AX, .36, AZ), { d: .68 });
  cp(mesh(G.dome(.066, .45), M.shellC, 0, .335, 0), { d: .7, from: [0, .4, 0], spin: [0, 2, 0], n: 'Calotta' });
  cp(mesh(G.rbox(.052, .03, .05, .006), M.plastic, .012, .366, .026), { d: .72, n: 'Scatola morsetti' });
  cp(mesh(G.cyl(.008, .07, 14), M.copper, -.02, .39, -.02), { d: .74, n: 'Mandata' });
  const dn = [Math.sin(rad(35)), 0, Math.cos(rad(35))];
  cp(mesh(G.open(.066, .26, rad(-20), rad(110)), M.sDoor, 0, .205, 0), { d: .86, from: [dn[0] * .3, .04, dn[2] * .3], spin: [0, 0, 0], dur: .6, ease: eoc, n: 'Chiusura del mantello' });
  cp(mesh(G.open(.0725, .275, PI / 2, PI), M.sFelt, 0, .2, 0), { d: .92, from: [0, 0, -.35], spin: [0, 0, 0], ease: eoc, n: 'Cuffia insonorizzante' });
  cp(mesh(G.open(.0725, .275, -PI / 2, PI), M.sFelt, 0, .2, 0), { d: .94, from: [0, 0, .35], spin: [0, 0, 0], ease: eoc });
  PIPE.comp = [[AX, .4, AZ], [AX, .3, AZ], [AX, .14, AZ], [AX * .8, .1, AZ * .8], [-.04, .12, .02], [.012, .12, 0], [0, .16, -.01], [.01, .21, .012], [-.01, .27, 0], [0, .32, -.01], [-.02, .37, -.02], [-.02, .43, -.02]];
}
const qcw = p => [CX + p[0] * KS, Y5 + p[1] * KS, CZ + p[2] * KS];

// 6 ─ Evaporatore, ventilatore e circuito del propano
const FP = {
  dis: [qcw([-.02, .43, -.02]), [CX - .012, Y5 + .285, CZ - .012], [.06, Y5 + .285, -.24], [.06, YC - .03, -.24], [.0455, AT(1.38), -.258], [.0455, AT(1.29), -.258]],
  cond: (() => { const a = [], n = 64; for (let i = 0; i <= n; i++) { const f = i / n, az = 170 - f * 700; a.push(polare(az, RT + .012, lerp(AT(1.27), AT(.52), f))); } return a; })(),
  liq: [[-.0455, AT(.5), -.258], [-.05, AT(.6), -.27], [-.06, AT(1.0), -.272], [-.06, AT(1.4), -.27], [-.03, YC + .02, -.262], [.08, Y5 + .02, -.255], [.2, Y5 + .02, -.2], [.25, Y5 + .02, -.06], [.23, Y5 + .03, .08], [.17, Y5 + .05, .13]],
  exp: [[.17, Y5 + .09, .13], [.13, Y5 + .1, .17], [.07, Y5 + .06, .17], [EX + .012, Y5 + .05, .16]],
  evap: (() => { const a = []; for (let i = 0; i < 5; i++) { const y = Y5 + .055 + i * .057, f = i % 2 === 0; a.push([EX + .014, y, f ? .15 : -.19], [EX + .014, y, f ? -.19 : .15]); } return a; })(),
  suc: [[EX + .01, Y5 + .3, -.2], [.06, Y5 + .33, -.17], [CX - .115 * KS, Y5 + .3, CZ + .05 * KS], [CX - .115 * KS, Y5 + .24, CZ + .05 * KS]],
  bypass: [[.12, Y5 + .285, -.18], [.15, Y5 + .22, -.06], [.11, Y5 + .13, .07], [.07, Y5 + .07, .16]],
  cond6: [[EX + .03, Y5 + .012, .1], [.08, YC - .02, .2], [.22, AT(1.45), .14], [.27, AT(1.375), .03], [R, AT(1.37), 0]],
  aria: [[.16, YC + .75, 0], [.16, YC + .45, 0], [.15, Y5 + .22, .0], [.08, Y5 + .16, -.02], [EX - .02, Y5 + .15, -.02], [FX + .06, FY, FZ], [FX, FY - .02, FZ - .02], [FX, FY + .1, FZ - .066], [FX - .005, YC + .3, -.01], [-.16, YC + .45, 0], [-.16, YC + .8, 0]],
};
for (const k in FP) PIPE[k] = FP[k];
const fanRot = new THREE.Group();
group('frig', 'Evaporatore, ventilatore e circuito R290', 'Il ventilatore aspira l\'aria della stanza attraverso l\'evaporatore a microcanali: il propano le toglie calore. Valvola di espansione elettronica e by-pass.', 26.5, 31.5, { stage: [0, 0, 0], ex: [0, .8, 0], az: 30, el: 30, zoom: .95,
  info: { e: 'Qui la pompa di calore prende il calore dall\'aria della stanza: l\'aria esce più fresca e più asciutta, per questo sta bene in lavanderia o in dispensa.', s: 'Evaporatore a microcanali · ventilatore centrifugo · valvola di espansione elettronica · valvola a 2 vie di by-pass · pressostato di bassa · presa di servizio · sonde T1, T4, T5 · box elettrico con coperchio a 4 viti · manuale 00340944 p.13, 18, 26' } });
{
  // evaporatore a microcanali, in piedi tra la camera d'ingresso e quella del ventilatore
  P(mesh(G.box(.06, .012, .38), M.galv, EX, Y5 + .006, -.02), { d: 0, from: [0, .3, 0], spin: [0, 0, 0], ease: eoc, n: 'Vaschetta della condensa' });
  [-.2, .16].forEach((z, i) => P(mesh(G.cyl(.011, .28, 16), M.alu, EX, Y5 + .17, z), { d: .03 + i * .02, from: [0, .4, 0], n: i ? null : 'Collettori' }));
  PIN(G.box(.018, .003, .34), M.alu, Array.from({ length: 14 }, (_, i) => ({ p: [EX, Y5 + .05 + i * .019, -.02] })), { d0: .07, d1: .2, from: [0, .3, 0], spin: [0, 0, 0], ease: eoc, n: 'Microcanali', snd: 'fin' });
  PIN(G.box(.016, .016, .34), M.evap, Array.from({ length: 13 }, (_, i) => ({ p: [EX, Y5 + .0595 + i * .019, -.02] })), { d0: .2, d1: .3, from: [0, .3, 0], spin: [0, 0, 0], ease: eoc, n: 'Alette a feritoie', snd: 'fin' });
  P(mesh(G.box(.004, .29, .4), M.galv, EX - .016, Y5 + .17, -.02), { d: .32, from: [-.3, 0, 0], spin: [0, 0, 0], n: 'Paratia' });
  P(mesh(G.rbox(.012, .022, .012, .003), M.plastic, EX + .014, Y5 + .27, -.2), { d: .34, n: 'Sonda T4 dell\'evaporatore' });
  // ventilatore centrifugo: chiocciola, girante, motore
  const sh = new THREE.Shape(); sh.moveTo(.032, .063); for (let i = 0; i <= 40; i++) { const f = i / 40, a = lerp(.35 * PI, 2 * PI, f), r = lerp(.07, .1, f); sh.lineTo(r * Math.cos(a), r * Math.sin(a)); } sh.lineTo(.1, .14); sh.lineTo(.032, .14); sh.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, .046, 0, PI * 2, true); sh.holes.push(hole);
  const vg = new THREE.ExtrudeGeometry(sh, { depth: .09, bevelEnabled: false, curveSegments: 24 }); vg.translate(0, 0, -.045); vg.rotateY(PI / 2);
  P(mesh(vg, M.plastic, FX, FY, FZ), { d: .38, from: [-.4, .2, 0], spin: [1, 0, 0], dur: .55, n: 'Chiocciola del ventilatore' });
  fanRot.position.set(FX, FY, FZ); CUR.node.add(fanRot);
  PIN(G.box(.07, .022, .003), M.black, Array.from({ length: 30 }, (_, i) => { const a = i / 30 * PI * 2; return { p: [0, Math.cos(a) * .058, Math.sin(a) * .058], r: [-a + .45, 0, 0] }; }), { parent: fanRot, d0: .44, d1: .56, from: [.3, 0, 0], spin: [3, 0, 0], ease: eoc, n: 'Girante a pale curve', snd: 'tick' });
  P(mesh(G.cylX(.064, .004, 32), M.black, -.036, 0, 0), { parent: fanRot, d: .58, from: [.3, 0, 0], spin: [3, 0, 0] });
  P(mesh(G.cylX(.04, .065, 28), M.black, FX - .08, FY, FZ), { d: .62, from: [-.4, 0, 0], spin: [4, 0, 0], n: 'Motore del ventilatore' });
  P(mesh(G.box(.006, .1, .1), M.galv, FX - .048, FY, FZ), { d: .64, from: [-.3, 0, 0], spin: [0, 0, 0] });
  P(mesh(G.box(.09, YC + .3 - (FY + .14), .068), M.plastic, FX, (YC + .3 + FY + .14) / 2, FZ - .066), { d: .66, from: [0, .4, 0], spin: [0, 0, 0], n: 'Condotto verso l\'uscita dell\'aria' });
  // circuito del propano
  const tub = (k, r, d, n, m = M.copper) => P(mesh(tubeGeo(FP[k], r, FP[k].length * 14), m), { d, dur: .5, n });
  tub('dis', .005, .7, 'Mandata del gas caldo'); tub('liq', .004, .73, 'Linea del liquido'); tub('exp', .004, .76, null); tub('suc', .0065, .79, 'Aspirazione'); tub('bypass', .0035, .82, 'Linea di by-pass');
  P(mesh(tubeGeo(FP.suc.slice(0, 3), .012, 30), M.foam), { d: .84, n: 'Isolamento dell\'aspirazione' });
  tub('cond6', .006, .845, 'Scarico della condensa (6)', M.grey);
  P(mesh(G.cyl(.011, .036, 14), M.brass, .17, Y5 + .065, .13), { d: .85, n: 'Valvola di espansione elettronica' }); P(mesh(G.cyl(.018, .032, 20), M.blue, .17, Y5 + .1, .13), { d: .86 });
  P(mesh(G.cyl(.01, .03, 12), M.brass, .11, Y5 + .13, .07), { d: .87, n: 'Valvola a 2 vie di by-pass' }); P(mesh(G.rbox(.03, .03, .03, .004), M.black, .11, Y5 + .16, .07), { d: .88 });
  P(mesh(G.cyl(.0065, .02, 6), M.brass, .065, Y5 + .34, -.17), { d: .89, n: 'Pressostato di bassa pressione' }); P(mesh(G.cyl(.0085, .018, 12), M.plastic, .065, Y5 + .358, -.17), { d: .895 });
  P(mesh(G.cyl(.005, .018, 8), M.brass, .09, Y5 + .325, -.135), { d: .9, n: 'Presa di servizio' }); P(mesh(G.cyl(.0065, .008, 6), M.blue, .09, Y5 + .338, -.135), { d: .905 });
  P(mesh(G.rbox(.012, .022, .012, .003), M.plastic, .1, Y5 + .3, -.115), { d: .91, n: 'Sonda T5 di aspirazione' });
  P(mesh(G.rbox(.012, .022, .012, .003), M.plastic, .17, Y5 + .33, .06), { d: .915, n: 'Sonda T1 dell\'aria ambiente' });
  // box elettrico, con il coperchio metallico a 4 viti
  const bx = -.16, by = Y5 + .1, bz = -.13;
  P(mesh(G.box(.05, .18, .12), M.galv, bx, by, bz), { d: .92, from: [-.4, 0, -.2], spin: [0, 0, 0], n: 'Box elettrico' });
  P(mesh(G.box(.003, .16, .1), M.pcb, bx + .02, by, bz), { d: .94, from: [.3, 0, 0], spin: [0, 0, 0], n: 'Scheda di controllo' });
  PIN(G.cyl(.008, .022, 12), M.cap, [[-.04, -.02], [-.04, .02], [.0, -.02]].map(([y, z]) => ({ p: [bx + .032, by + y, bz + z], r: [0, 0, PI / 2] })), { d0: .95, d1: .96 });
  P(mesh(G.box(.003, .18, .12), M.sBox, bx + .027, by, bz), { d: .97, from: [.4, 0, 0], spin: [0, 0, 0], n: 'Coperchio del box' });
  screws([[-.08, -.05], [-.08, .05], [.08, -.05], [.08, .05]].map(([y, z]) => ({ p: [bx + .029, by + y, bz + z], r: [0, 0, -PI / 2] })), { d0: .98, d1: 1, n: 'Quattro viti' });
}

// 7 ─ Coperchio e interfaccia
// Dal manuale p.13 (vista d'insieme) e dalla foto del depliant: anello di base, corpo cilindrico che si stringe appena in alto, sul tetto i due imbocchi
// con la griglia tra nervature ad H, sul fronte la finestra dell'interfaccia con il regolatore e il logo, ai lati due pannelli dal bordo curvo.
// RICOSTRUITO: quote del profilo, delle nervature e dei pannelli laterali.
M.sCovL = xr(std({ color: 0x3a3e42, roughness: .45, metalness: .12, side: THREE.DoubleSide })); ambiente(['sCovL'], AMB_B);
group('cop', 'Coperchio e interfaccia', 'Il cappello in plastica, isolato acusticamente: da un imbocco entra l\'aria, dall\'altro esce. Davanti, il regolatore touch screen.', 31.5, 35.0, { stage: [0, 0, 0], ex: [0, 1.2, 0], zoom: 1,
  keys: [[.04, 20, 16, 1.5, 0], [.36, 36, 34, 1.15, .06], [.66, 6, 8, .85, -.03]],
  info: { e: 'Il cappello: protegge la pompa di calore, smorza il rumore e porta l\'aria dentro e fuori. Davanti, lo schermo per comandarlo, anche dal telefono via Wi-Fi.', s: 'Plastica isolata acusticamente · imbocchi aria Ø 177 mm a 320 mm di interasse, canalizzabili DN 180 · regolatore touch screen · Wi-Fi integrato · manuale 00340944 p.12-14' } });
{
  const LID = [[R + .004, 0], [R + .004, .045], [.297, .05], [.297, .19], [.27, .37], [.252, .395], [.21, .403], [.0885, .403], [0, .403]];
  const HT = .403, rL = y => y <= .19 ? .297 : y >= .37 ? .27 : .297 - .15 * (y - .19), TILT = Math.atan(.15);     // raggio del corpo alla quota y sopra YC
  P(mesh(new THREE.LatheGeometry(LID.map(([r, y]) => new THREE.Vector2(Math.max(0, r - .012), y - .006)), 48), M.sFelt, 0, YC, 0), { d: 0, from: [0, .8, 0], spin: [0, 1, 0], dur: .55, ease: eoc, n: 'Isolamento acustico' });
  P(mesh(new THREE.LatheGeometry(LID.map(([r, y]) => new THREE.Vector2(r, y)), 64), M.sCov, 0, YC, 0), { d: .12, from: [0, 1.0, 0], spin: [0, .8, 0], dur: .65, ease: eoc, n: 'Coperchio superiore in plastica' });
  // nervature ad H sul tetto: due lungo l'asse degli imbocchi, una in mezzo
  [[0, .108, .36, .016], [0, -.108, .36, .016], [0, 0, .016, .2]].forEach(([x, z, w, l], i) => P(mesh(G.rbox(w, .012, l, .005), M.sCov, x, YC + HT + .006, z), { d: .2 + i * .03, from: [0, .3, 0], spin: [0, 0, 0], ease: eoc, n: i ? null : 'Nervature del tetto' }));
  [[-.16, 'Uscita dell\'aria'], [.16, 'Ingresso dell\'aria']].forEach(([x, n], k) => {
    P(mesh(G.open(.0885, .05, 0, PI * 2, 40), M.sCov, x, YC + .42, 0), { d: .3 + k * .14, from: [0, .5, 0], spin: [0, 2, 0], ease: eoc, n });
    for (let i = 0; i < 4; i++) P(mesh(G.torus(.022 + i * .019, .003, PI * 2, 40), M.black, x, YC + .432, 0, PI / 2, 0, 0), { d: .34 + k * .14 + i * .02, from: [0, .35, 0], spin: [0, 0, 0], snd: 'tick', n: i ? null : 'Griglia' });
    PIN(G.box(.17, .004, .004), M.black, [0, 1, 2].map(i => ({ p: [x, YC + .432, 0], r: [0, i * PI / 3, 0] })), { d0: .42 + k * .14, d1: .43 + k * .14, from: [0, .3, 0], spin: [0, 1, 0] }); });
  // pannelli laterali: coprono il fianco sotto un bordo che sale curvo dal fronte verso il retro
  const fianco = sg => {
    const NA = 40, NY = 14, pos = [], idx = [];
    for (let i = 0; i <= NA; i++) { const th = lerp(28, 140, i / NA), top = .06 + .31 * sm(28, 100, th), a = rad(th);
      for (let j = 0; j <= NY; j++) { const y = lerp(.055, top, j / NY), r = rL(y) + .0025; pos.push(sg * Math.sin(a) * r, y, Math.cos(a) * r); } }
    for (let i = 0; i < NA; i++) for (let j = 0; j < NY; j++) { const a = i * (NY + 1) + j, b = a + NY + 1; if (sg > 0) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  [1, -1].forEach((sg, i) => P(mesh(fianco(sg), M.sCovL, 0, YC, 0), { d: .6 + i * .04, from: polare(sg * 85, .3, 0), spin: [0, 0, 0], ease: eoc, n: i ? null : 'Pannelli laterali' }));
  // finestra dell'interfaccia sul fronte: il regolatore sta sulla parete inclinata, schermo e logo sulla sua faccia
  const ry = .28, rz = rL(ry), nrm = [0, Math.sin(TILT), Math.cos(TILT)], su = [0, Math.cos(TILT), -Math.sin(TILT)], sul = (o, u) => [0, YC + ry + nrm[1] * o + su[1] * u, rz - .004 + nrm[2] * o + su[2] * u];
  P(mesh(G.rbox(.12, .16, .02, .008), M.black, ...sul(0, 0), -TILT, 0, 0), { d: .7, from: [0, 0, .35], spin: [0, 0, 0], ease: eoc, n: 'Regolatore touch screen' });
  P(mesh(G.plane(.085, .085), M.schermo, ...sul(.0106, .005), -TILT, 0, 0), { d: .76, from: [0, 0, .25], spin: [0, 0, 0], ease: eoc });
  P(mesh(G.plane(.07, .0175), M.logoC, ...sul(.0106, .064), -TILT, 0, 0), { d: .8, from: [0, 0, .25], spin: [0, 0, 0], ease: eoc, n: 'Logo' });
  screws([0, 90, 180, 270].map(a => ({ p: polare(a + 45, R + .005, YC + .025), r: [PI / 2, 0, -rad(a + 45)] })), { d0: .84, d1: .92, mat: M.steel, n: 'Viti del coperchio' });
}
finalize();
function schermo(set, lav) { const c = T.schermo.image.getContext('2d'); c.fillStyle = '#0d1114'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#9fd8ff'; c.font = '700 92px Barlow, Arial, sans-serif'; c.textAlign = 'center'; c.fillText(set + '°', 128, 150);
  c.font = '600 26px Barlow, Arial, sans-serif'; c.fillStyle = lav ? '#ffb070' : '#5a6a74'; c.fillText(lav ? 'IN FUNZIONE' : 'ATTESA', 128, 205); T.schermo.needsUpdate = true; }
