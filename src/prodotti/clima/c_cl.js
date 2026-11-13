// ───────── Climatizzatori Unical · pezzi e scena (motore della UHP, pagina comune) ─────────
// Mono: YA3 13H = YA3 13HI (802 × 297 × 189 mm) + YA3 13HE (765 × 555 × 303 mm), depliant YA3 2026 p.4 e manuale di installazione 00339164 p.10 (componenti:
// piastra di montaggio, pannello frontale, aletta, filtro, tubo di drenaggio, cavo di segnale, tubo del refrigerante), p.12 (a 2,3 m o più dal pavimento,
// 15 cm sopra, 12 cm ai lati), p.22-A (unità esterna: 555 × 303 mm, attacchi delle valvole a 93 e 153 mm da terra sul fianco destro, piedi a 274 mm).
// Dual: XMX2 18HE (805 × 554 × 330 mm, R32 1,25 kg) con due XMPS 12HI pavimento/parete (794 × 621 × 206 mm): combinazione 12+12 della tabella MULTI
// del depliant "clima la gamma" 09-2026 p.13-15; XMPS dal libretto 00339716 p.9 (ingresso aria frontale con filtro, uscite in alto e in basso, display).
// RICOSTRUITO: tutta la disposizione interna (i documenti nominano le parti ma non dicono dove stanno), interno del compressore, numero di alette e pale,
// percorso delle linee, posto delle unità esterne. Scelta delle macchine (mono 13H, dual con due console): da confermare con Bore.
const WX0 = -.25, WX1 = -.05, ZB = -.5, YUI = 2.3;                                     // muro esterno in sezione; parete di fondo interna; quota dell'unità a parete
const UI = { x: .75, W: .802, H: .297, D: .189 }, UE = { x: -1.05, z: .35, W: .765, H: .555, D: .303 }, UX = { x: -2.1, z: .35, W: .805, H: .554, D: .33 }, CO = [{ x: 1.75 }, { x: 2.75 }], CW = .794, CH = .621, CD = .206;
T.ya3 = cv(512, 128, g => { g.fillStyle = '#eef0f1'; g.fillRect(0, 0, 512, 128); g.fillStyle = '#c7cbce'; g.fillRect(0, 118, 512, 10); g.fillStyle = '#1d2226'; g.font = '600 22px Barlow, Arial, sans-serif'; g.fillText('Unical', 22, 34); });
T.disp = cv(128, 64, () => {});
T.xmpsF = cv(256, 256, g => { g.fillStyle = '#e9ebec'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#c3c8cb'; g.lineWidth = 3; for (let y = 60; y < 230; y += 9) { g.beginPath(); g.moveTo(24, y); g.lineTo(232, y); g.stroke(); } g.fillStyle = '#1d2226'; g.fillRect(96, 22, 64, 20); });
T.muroC = rep(cv(256, 256, g => { const r = rng(31); g.fillStyle = '#4a4e52'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 5000; i++) { const v = 62 + r() * 34 | 0; g.fillStyle = `rgba(${v},${v + 3},${v + 6},.5)`; g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3); } }), 4, 4);
Object.assign(M, {
  sUi: xr(std({ color: 0xe6e8ea, roughness: .35, metalness: .02, map: T.ya3 })), sUi2: xr(std({ color: C_BIANCO, roughness: .4, metalness: .02 })), sUe: xr(std({ color: 0xd6d8da, roughness: .55, metalness: .05 })),
  sXm: xr(std({ color: 0xffffff, roughness: .5, map: T.xmpsF })), disp: new THREE.MeshBasicMaterial({ map: T.disp }),
  filt: std({ color: 0x9aa1a6, roughness: .8, transparent: true, opacity: .8, side: THREE.DoubleSide }),
  alet: std({ color: 0x9aa3a8, roughness: .4, metalness: .8, emissive: 0x2a8cff, emissiveIntensity: 0 }),
  muroC: std({ color: 0x9aa0a4, roughness: .95, map: T.muroC, bumpMap: T.noise, bumpScale: 1.5 }), sez: std({ color: 0x8a5f4c, roughness: .95 }),
});
ambienteBase(); ambiente(['alet'], AMB_M); ambiente(['sUi', 'sUi2', 'sUe', 'sXm', 'filt'], AMB_B);
SOLO.push([M.muroC, .3], [M.sez, .2]);
{ const H2 = 2.8; scene.add(mesh(G.plane(3.4, H2), M.muroC, 1.65, H2 / 2, ZB), mesh(G.plane(1.2, H2), M.muroC, WX1, H2 / 2, ZB + .6, 0, PI / 2, 0), mesh(G.plane(1.2, H2), M.muroC, WX0, H2 / 2, ZB + .6, 0, -PI / 2, 0), mesh(G.plane(WX1 - WX0, H2), M.sez, (WX0 + WX1) / 2, H2 / 2, ZB + 1.2));
  scene.add(mesh(G.plane(WX1 - WX0, 1.2), M.sez, (WX0 + WX1) / 2, H2, ZB + .6, -PI / 2, 0, 0)); }
const ombraC = mesh(G.plane(5.6, 1.6), new THREE.MeshBasicMaterial({ map: T.shadow, transparent: true, depthWrite: false }), .3, .003, .1, -PI / 2); scene.add(ombraC);
const ROT = {};                                                                                // parti che girano

// un'unità a parete YA3: tutti i pezzi dalla piastra al pannello frontale
function unitaParete(x0, dettaglio) {
  const n = node(x0, YUI, ZB), { W, H, D } = UI, o = x => Object.assign({ parent: n }, x), up = [0, .4, .3];
  P(mesh(G.box(W * .9, H * .7, .004), M.galv, 0, H * .45, .002), o({ d: 0, from: [0, 0, .6], spin: [0, 0, 0], n: 'Piastra di montaggio' }));
  screws([-.3, -.1, .1, .3].map(x => ({ p: [x, H * .62, .004], r: [PI / 2, 0, 0] })), o({ d0: .04, d1: .1, n: 'Tasselli e viti' }));
  P(mesh(G.rbox(W - .01, H - .02, .03, .006), M.plastic, 0, H / 2, .02), o({ d: .12, from: [0, 0, .5], spin: [0, 0, 0], n: 'Telaio posteriore' }));
  // batteria in tre pezzi, piegata attorno al ventilatore
  const L = W - .12, NF = dettaglio ? 90 : 0, slab = [[.7, .02, .09, -.5], [.62, .1, .07, .3], [.2, .16, .12, 1.25]];
  slab.forEach(([fy, fz, h, a], i) => { P(mesh(G.box(L, h, .006), M.copper, 0, H * fy, D * .1 + fz, a, 0, 0), o({ d: .2 + i * .04, from: [0, .3, .3], spin: [0, 0, 0], n: i ? null : 'Batteria in rame' }));
    if (NF) PIN(G.box(.0006, h, .028), M.alet, Array.from({ length: NF }, (_, k) => ({ p: [-L / 2 + k * L / (NF - 1), H * fy, D * .1 + fz], r: [a, 0, 0] })), o({ d0: .32 + i * .05, d1: .4 + i * .05, dur: .3, from: [0, .25, .2], spin: [0, 0, 0], ease: eoc, n: i ? null : 'Alette d\'alluminio', snd: 'fin' })); });
  P(mesh(G.cyl(.008, H * .55, 12), M.copper, -L / 2 - .015, H * .5, D * .2), o({ d: .56, n: 'Collettore' }));
  // ventilatore tangenziale
  const rot = new THREE.Group(); rot.position.set(0, H * .35, D * .45); n.add(rot); ROT['rot' + x0] = rot;
  if (dettaglio) PIN(G.box(L / 6 - .004, .016, .0016), M.rotore || M.black, Array.from({ length: 6 * 22 }, (_, k) => { const s = k / 22 | 0, b = k % 22, a = (b + (s % 2) * .5) / 22 * PI * 2; return { p: [-L / 2 + (s + .5) * L / 6, Math.cos(a) * .04, Math.sin(a) * .04], r: [a + .5, 0, 0] }; }), { parent: rot, d0: .6, d1: .72, dur: .3, from: [0, .2, .3], spin: [3, 0, 0], ease: eoc, n: 'Ventilatore tangenziale', snd: 'fin' });
  else P(mesh(G.cylX(.046, L, 24), M.black), { parent: rot, d: .6, from: [0, .2, .3], spin: [3, 0, 0], n: 'Ventilatore tangenziale' });
  P(mesh(G.cylX(.028, .055, 20), M.black, L / 2 + .03, H * .35, D * .45), o({ d: .74, n: 'Motore del ventilatore' }));
  P(mesh(G.box(L, .012, .05), M.plastic, 0, H * .12, D * .55), o({ d: .78, from: [0, -.2, .2], spin: [0, 0, 0], n: 'Vaschetta della condensa' }));
  if (dettaglio) PIN(G.box(.003, .05, .03), M.plastic, Array.from({ length: 14 }, (_, k) => ({ p: [-L / 2 + .04 + k * (L - .08) / 13, H * .1, D * .72] })), o({ d0: .8, d1: .84, n: 'Deflettori verticali' }));
  P(mesh(G.box(W - .06, .006, .07), M.sUi2, 0, H * .06, D * .82, -.5, 0, 0), o({ d: .86, from: [0, -.2, .3], spin: [0, 0, 0], n: 'Aletta' }));
  if (dettaglio) { [-.18, .18].forEach((x, i) => P(mesh(G.box(.34, .006, .14), M.filt, x, H - .02, D * .45, -.15, 0, 0), o({ d: .88 + i * .02, from: [0, .3, 0], spin: [0, 0, 0], n: i ? null : 'Filtri dell\'aria' })));
    P(mesh(G.box(.05, .02, .02), M.blue, W / 2 - .08, H * .8, D * .6), o({ d: .91, n: 'Ionizzatore' })); }
  P(mesh(G.rbox(W, H, D * .35, .03), M.sUi, 0, H / 2, D * .82), o({ d: .93, from: [0, 0, .5], spin: [0, 0, 0], ease: eoc, dur: .55, n: 'Pannello frontale' }));
  P(mesh(G.plane(.06, .03), M.disp, W / 2 - .1, H * .55, D + .002), o({ d: .97, from: [0, 0, .3], spin: [0, 0, 0], n: dettaglio ? 'Display' : null }));
  return n;
}
// una console XMPS (nome diverso da console, che è del browser)
function unitaConsole(x0, dettaglio) {
  const n = node(x0, 0, ZB), o = x => Object.assign({ parent: n }, x);
  P(mesh(G.box(CW - .02, CH - .02, .01), M.zinc, 0, CH / 2, .006), o({ d: 0, from: [0, 0, .6], spin: [0, 0, 0], n: 'Telaio posteriore' }));
  P(mesh(G.box(CW - .1, CH * .5, .03), M.copper, 0, CH * .55, .07), o({ d: .1, from: [0, .3, .3], spin: [0, 0, 0], n: 'Batteria' }));
  if (dettaglio) PIN(G.box(.0006, CH * .5, .032), M.alet, Array.from({ length: 110 }, (_, k) => ({ p: [-(CW - .1) / 2 + k * (CW - .1) / 109, CH * .55, .07] })), o({ d0: .14, d1: .34, dur: .3, from: [0, .25, .25], spin: [0, 0, 0], ease: eoc, n: 'Alette d\'alluminio', snd: 'fin' }));
  const rot = new THREE.Group(); rot.position.set(0, CH * .2, .1); n.add(rot); ROT['con' + x0] = rot;
  P(mesh(G.cylX(.05, CW - .14, 24), M.black), { parent: rot, d: .4, from: [0, -.2, .3], spin: [3, 0, 0], n: 'Ventilatore' });
  if (dettaglio) PIN(G.box(.004, .1, .02), M.black, Array.from({ length: 24 }, (_, k) => { const a = k / 24 * PI * 2; return { p: [0, Math.cos(a) * .05, Math.sin(a) * .05], r: [a, 0, 0], s: [(CW - .14) / .004, 1, 1] }; }), { parent: rot, d0: .42, d1: .5, from: [0, -.2, .3], spin: [3, 0, 0] });
  P(mesh(G.cylX(.03, .06, 18), M.black, CW / 2 - .05, CH * .2, .1), o({ d: .54, n: 'Motore' }));
  P(mesh(G.box(CW - .06, .012, .08), M.plastic, 0, CH * .3, .1), o({ d: .58, n: 'Vaschetta della condensa' }));
  PIN(G.box(CW - .2, .004, .03), M.sUi2, [0, 1, 2, 3].map(k => ({ p: [0, CH - .006, .05 + k * .035], r: [.5, 0, 0] })), o({ d0: .62, d1: .66, from: [0, .3, 0], spin: [0, 0, 0], n: 'Deflettore superiore' }));
  P(mesh(G.box(CW - .2, .004, .05), M.sUi2, 0, .03, CD - .02, -.4, 0, 0), o({ d: .68, from: [0, -.2, .3], spin: [0, 0, 0], n: 'Uscita inferiore' }));
  if (dettaglio) P(mesh(G.box(CW - .1, CH * .45, .004), M.filt, 0, CH * .5, CD - .03), o({ d: .72, from: [0, 0, .4], spin: [0, 0, 0], n: 'Filtro' }));
  P(mesh(G.rbox(CW, CH, .05, .02), M.sXm, 0, CH / 2, CD - .025), o({ d: .8, from: [0, 0, .5], spin: [0, 0, 0], ease: eoc, dur: .55, n: 'Pannello frontale' }));
  [-1, 1].forEach((s, i) => P(mesh(G.box(.01, CH, CD - .05), M.sUi2, s * (CW / 2 - .005), CH / 2, (CD - .05) / 2), o({ d: .86 + i * .03, from: [s * .4, 0, 0], spin: [0, 0, 0], n: i ? null : 'Fianchi' })));
  P(mesh(G.plane(.08, .03), M.disp, 0, CH - .045, CD + .001), o({ d: .94, from: [0, 0, .3], spin: [0, 0, 0], n: dettaglio ? 'Display' : null }));
  return n;
}
// un'unità esterna: fondo, batteria a L, ventilatore, compressore, valvole, scheda, mantello
let cmp = null, crank = null;
function esterna(U, sezione, valvole) {
  const n = node(U.x, 0, U.z), o = x => Object.assign({ parent: n }, x), { W, H, D } = U, XP = W / 2 - .25, FXc = (-W / 2 + XP) / 2, FR = Math.min(.22, (XP + W / 2) / 2 - .03), Fy = H * .5;
  PIN(G.box(.06, .03, .274), M.zinc, [-W * .3, W * .3].map(x => ({ p: [x, .015, 0] })), o({ d0: 0, d1: .03, from: [0, -.3, 0], n: 'Piedi' }));
  P(mesh(G.box(W - .01, .012, D - .01), M.galv, 0, .036, 0), o({ d: .06, from: [0, -.3, .2], spin: [0, 0, 0], n: 'Fondo' }));
  P(mesh(G.box(.004, H - .06, D - .04), M.galv, XP, H / 2, 0), o({ d: .1, from: [0, .4, 0], spin: [0, 0, 0], n: 'Paratia' }));
  // batteria a L: dietro e sul fianco sinistro
  const nB = Math.round((XP + W / 2 - .03) / .005), nS = Math.round((D - .06) / .005);
  P(mesh(G.box(XP + W / 2 - .02, H - .1, .006), M.copper, (XP - W / 2) / 2, H / 2 + .02, -D / 2 + .04), o({ d: .13, from: [0, 0, -.3], spin: [0, 0, 0], n: 'Batteria rame-alluminio' }));
  PIN(G.box(.0006, H - .1, .03), M.alet, Array.from({ length: nB }, (_, k) => ({ p: [-W / 2 + .02 + k * .005, H / 2 + .02, -D / 2 + .04] })), o({ d0: .16, d1: .34, dur: .3, from: [0, .3, 0], spin: [0, 0, 0], ease: eoc, n: 'Alette', snd: 'fin' }));
  PIN(G.box(.03, H - .1, .0006), M.alet, Array.from({ length: nS }, (_, k) => ({ p: [-W / 2 + .025, H / 2 + .02, -D / 2 + .06 + k * .005] })), o({ d0: .34, d1: .4, dur: .3, from: [0, .3, 0], spin: [0, 0, 0], ease: eoc, snd: 'fin' }));
  // ventilatore
  P(mesh(G.box(.02, H - .1, .012), M.galv, FXc, H / 2, -D / 2 + .08), o({ d: .42, from: [0, .4, 0], spin: [0, 0, 0], n: 'Staffa del motore' }));
  P(mesh(G.cylZ(.045, .06, 24), M.black, FXc, Fy, -D / 2 + .12), o({ d: .45, from: [0, 0, .4], spin: [0, 0, 3], n: 'Motore a velocità variabile' }));
  const fan = new THREE.Group(); fan.position.set(FXc, Fy, D / 2 - .09); n.add(fan); ROT['fan' + U.x] = fan;
  const bs = new THREE.Shape(); bs.moveTo(-.02, .035); bs.quadraticCurveTo(-.09, .07, -.1, FR * .9); bs.quadraticCurveTo(-.03, FR * 1.02, .04, FR * .95); bs.quadraticCurveTo(.07, .12, .02, .035); bs.closePath();
  const bg = new THREE.ExtrudeGeometry(bs, { depth: .003, bevelEnabled: false, curveSegments: 12 });
  P(mesh(G.cylZ(.035, .045, 24), M.plastic), { parent: fan, d: .5, from: [0, 0, .4], spin: [0, 0, 4], n: 'Elica' });
  for (let i = 0; i < 4; i++) P(mesh(bg, M.plastic, 0, 0, 0, .3, 0, i * PI / 2), { parent: fan, d: .52 + i * .03, from: [0, 0, .3], spin: [0, 0, 2] });
  // compressore nel vano di destra
  const CXl = XP + .12, CZl = -.02;
  if (sezione) {
    cmp = new THREE.Group(); cmp.position.set(CXl, .042, CZl); cmp.scale.setScalar(.62); n.add(cmp); crank = new THREE.Group(); cmp.add(crank);
    const cp = (m, x) => P(m, Object.assign({ parent: cmp }, x)), ck = (m, x) => P(m, Object.assign({ parent: crank, spin: [0, 4, 0], from: [0, .35, 0] }, x)), AXc = -.11, AZc = .05;
    PIN(G.cyl(.017, .03, 16), M.rubber, [0, 1, 2].map(i => { const a = rad(90 + i * 120); return { p: [Math.cos(a) * .082, .015, Math.sin(a) * .082] }; }), { parent: cmp, d0: .58, d1: .6, n: 'Gommini' });
    cp(mesh(G.dome(.066, .45, false), M.shellC, 0, .06, 0), { d: .61, from: [0, -.25, 0], spin: [0, 2, 0], n: 'Fondello' });
    ck(mesh(G.cyl(.0105, .25, 20), M.steel, 0, .18, 0), { d: .62, n: 'Albero eccentrico' });
    ck(mesh(annulus(.032, .024, .028), M.brass, .009, .11, 0), { d: .63, n: 'Pistone rotante' });
    cp(mesh(annulus(.058, .041, .03), M.cast, 0, .11, 0), { d: .64, n: 'Camera di compressione' });
    ck(mesh(G.cyl(.0345, .075, 36), M.lam, 0, .225, 0), { d: .65, n: 'Rotore' });
    cp(mesh(annulus(.0615, .0375, .075), M.lam, 0, .225, 0), { d: .66, from: [0, .45, 0], spin: [0, 1.5, 0], n: 'Statore' });
    [.273, .177].forEach((y, i) => cp(mesh(G.torus(.0495, .0115), M.copper, 0, y, 0, PI / 2, 0, 0), { d: .67, n: i ? null : 'Avvolgimenti' }));
    cp(mesh(G.open(.066, .26, PI / 2, rad(250)), M.shellC, 0, .195, 0), { d: .68, from: [-.2, .35, -.25], spin: [0, 2.5, 0], n: 'Mantello' });
    cp(mesh(G.cyl(.03, .19, 28), M.shellC, AXc, .215, AZc), { d: .69, n: 'Separatore di liquido' });
    cp(mesh(G.dome(.066, .45), M.shellC, 0, .325, 0), { d: .7, from: [0, .4, 0], spin: [0, 2, 0], n: 'Calotta' });
    cp(mesh(G.open(.066, .26, rad(-20), rad(110)), M.sDoor, 0, .195, 0), { d: .78, from: [.25, .04, .2], spin: [0, 0, 0], ease: eoc, n: 'Chiusura del mantello' });
    PIPE.compC = [[AXc, .4, AZc], [AXc, .25, AZc], [AXc, .13, AZc], [-.05, .11, .02], [.01, .11, 0], [0, .15, -.01], [.01, .21, .01], [-.01, .27, 0], [-.02, .36, -.02], [-.02, .42, -.02]];
  } else {
    P(mesh(G.cyl(.05, .2, 28), M.shellC, CXl, .14, CZl), o({ d: .6, n: 'Compressore rotativo DC inverter' }));
    P(mesh(G.cyl(.025, .14, 20), M.shellC, CXl - .08, .14, CZl + .03), o({ d: .63, n: 'Separatore di liquido' }));
  }
  // circuito e valvole
  P(mesh(G.cylX(.012, .07, 16), M.brass, CXl, H * .62, .02), o({ d: .72, n: 'Valvola a 4 vie' })); P(mesh(G.rbox(.025, .025, .025, .004), M.blue, CXl + .045, H * .62 + .015, .035), o({ d: .73 }));
  P(mesh(G.cyl(.009, .03, 12), M.brass, CXl + .06, H * .3, .07), o({ d: .74, n: 'Valvola di espansione' })); P(mesh(G.cyl(.015, .025, 16), M.plastic, CXl + .06, H * .3 + .028, .07), o({ d: .75 }));
  const vv = []; for (let k = 0; k < valvole; k++) for (const [h, r] of [[.093, .011], [.153, .014]]) vv.push({ p: [W / 2 - .02, h + k * .12, .06 - k * .02], r: [0, 0, PI / 2], s: [r / .012, 1, r / .012] });
  PIN(G.cyl(.012, .04, 6), M.brass, vv, o({ d0: .76, d1: .8, from: [.3, 0, 0], spin: [4, 0, 0], n: valvole > 1 ? 'Due coppie di valvole: una per stanza' : 'Valvole di servizio', snd: 'screw' }));
  [[XP + .02, H * .62, .02, CXl - .012, H * .62, .02], [CXl + .036, H * .62, .02, W / 2 - .03, .153, .06], [CXl + .06, H * .3, .07, W / 2 - .03, .093, .06]].forEach(([a, b, c, d2, e, f], i) => P(mesh(tubeGeo([[a, b, c], [(a + d2) / 2, (b + e) / 2 + .05, (c + f) / 2], [d2, e, f]], .005, 20), M.copper), o({ d: .81 + i * .01, n: i ? null : 'Tubi in rame' })));
  P(mesh(G.box(.2, .005, D - .1), M.pcb, CXl, H - .07, 0), o({ d: .84, from: [0, .3, 0], spin: [0, 0, 0], n: 'Scheda inverter' }));
  PIN(G.box(.004, .05, .06), M.alu, Array.from({ length: 8 }, (_, k) => ({ p: [XP - .03, H - .1, -.05 + k * .015] })), o({ d0: .85, d1: .86, n: 'Dissipatore' }));
  // mantello
  const fs = new THREE.Shape(); fs.moveTo(-W / 2, 0); fs.lineTo(XP, 0); fs.lineTo(XP, H); fs.lineTo(-W / 2, H); fs.closePath(); const hole = new THREE.Path(); hole.absarc(FXc, Fy, FR + .015, 0, PI * 2, true); fs.holes.push(hole);
  P(mesh(new THREE.ExtrudeGeometry(fs, { depth: .004, bevelEnabled: false, curveSegments: 40 }), M.sUe, 0, 0, D / 2 - .004), o({ d: .88, from: [0, 0, .6], spin: [0, 0, 0], ease: eoc, n: 'Frontale' }));
  for (let i = 0; i < 7; i++) P(mesh(G.torus(.035 + i * (FR - .02) / 6, .002, PI * 2, 48), M.sGrid, FXc, Fy, D / 2 + .006), o({ d: .9 + i * .008, from: [0, 0, .4], spin: [0, 0, 0], snd: 'tick', n: i ? null : 'Griglia' }));
  P(mesh(G.box(W - XP - W / 2 + .001, H, .004), M.sUe, (XP + W / 2) / 2, H / 2, D / 2 - .002), o({ d: .92, from: [.2, 0, .5], spin: [0, 0, 0], ease: eoc }));
  P(mesh(G.box(.004, H, D), M.sUe, W / 2 - .002, H / 2, 0), o({ d: .94, from: [.5, 0, 0], spin: [0, 0, 0], ease: eoc, n: 'Fianco destro e coperchio delle valvole' }));
  P(mesh(G.rbox(W + .006, .012, D + .006, .004), M.sUe, 0, H - .006, 0), o({ d: .97, from: [0, .5, 0], spin: [0, 0, 0], ease: eoc, n: 'Coperchio' }));
  return { n, FXc, Fy, CXl, CZl, XP };
}

// 1 ─ Unità interna YA3 13HI
group('ui', 'Unità interna YA3 13HI', 'Si appende alla piastra a 2,3 metri da terra. Dentro, una batteria piegata attorno al ventilatore, i filtri e lo ionizzatore.', 3.5, 10.0, { stage: [0, 0, .8], ex: [0, .1, .5], az: 18, el: -6, zoom: 1.1,
  keys: [[.03, 24, -2, 1.3, 0], [.3, 10, -10, .8, 0], [.55, 30, -4, .8, 0], [.8, 14, -8, 1.0, 0], [.95, 20, -4, 1.3, 0]],
  info: { e: 'Il climatizzatore che si vede in casa: aspira l\'aria dall\'alto, la fa passare nella batteria e la soffia fuori dall\'aletta, fresca d\'estate e calda d\'inverno.', s: 'YA3 13HI · 802 × 297 × 189 mm · 8,6 kg · ionizzatore · R32 · a 2,3 m o più dal pavimento, 15 cm sopra, 12 cm ai lati · depliant YA3 2026, manuale 00339164 p.10, 12' } });
unitaParete(UI.x, true);

// 2 ─ Unità esterna YA3 13HE (compressore in sezione)
const gUe = group('ue', 'Unità esterna YA3 13HE', 'Fuori casa: compressore rotativo DC inverter, batteria a L, ventilatore a velocità variabile e le due valvole per le linee.', 10.0, 17.5, { stage: [0, .1, .7], ex: [-.3, 0, .4], az: 28, el: 14, zoom: 1.0,
  keys: [[.03, 34, 18, 1.1, 0], [.35, 30, 10, .55, -.08], [.55, 42, 12, .62, -.05], [.8, 26, 10, .9, 0], [.95, 30, 14, 1.1, 0]],
  info: { e: 'Il motore del climatizzatore: d\'estate butta fuori il calore della casa, d\'inverno lo prende dall\'aria di fuori.', s: 'YA3 13HE · 765 × 555 × 303 mm · 26,7 kg · R32 · valvole a 93 e 153 mm da terra sul fianco destro · manuale 00339164 p.22-A · interno: schema di principio' } });
const ue = esterna(UE, true, 1);

// 3 ─ Linee frigorifere del mono
const LM = {
  liq: [[UE.x + UE.W / 2 + .02, .093, UE.z + .06], [UE.x + UE.W / 2 + .1, .1, UE.z], [WX0 - .05, .2, ZB + .3], [WX0 - .04, YUI + .1, ZB + .3], [WX1 + .05, YUI + .1, ZB + .1], [UI.x - UI.W / 2 + .03, YUI + .1, ZB + .04], [UI.x - UI.W / 2 + .045, YUI + .14, ZB + .04]],
  gas: [[UE.x + UE.W / 2 + .02, .153, UE.z + .06], [UE.x + UE.W / 2 + .12, .16, UE.z], [WX0 - .07, .25, ZB + .33], [WX0 - .07, YUI + .13, ZB + .33], [WX1 + .05, YUI + .13, ZB + .13], [UI.x - UI.W / 2 + .03, YUI + .13, ZB + .07], [UI.x - UI.W / 2 + .045, YUI + .16, ZB + .06]],
};
for (const k in LM) PIPE['m' + k] = LM[k];
group('linea', 'Linee frigorifere', 'Due tubi di rame coibentati, il cavo di segnale e lo scarico della condensa passano nel muro e uniscono le due unità.', 17.5, 20.5, { stage: [0, 0, 0], ex: [0, 0, .3], az: 10, el: 12, zoom: .85,
  info: { e: 'Le strade del gas: nel tubo sottile va il liquido, in quello grosso il gas. Il cavo dice all\'unità esterna cosa vuole quella interna.', s: 'Linea del liquido Ø 6,35 mm (1/4") e del gas Ø 9,52 mm (3/8") · coibentate · cavo di segnale · tubo di drenaggio in pendenza · manuale 00339164 p.7, 10 · percorso: indicativo' } });
{
  P(mesh(tubeGeo(LM.liq, .0035, 80), M.copper), { d: 0, dur: .6, n: 'Linea del liquido, 1/4"' });
  P(mesh(tubeGeo(LM.gas, .005, 80), M.copper), { d: .15, dur: .6, n: 'Linea del gas, 3/8"' });
  P(mesh(tubeGeo(LM.gas.slice(1, -1), .013, 80), M.sFoam), { d: .35, dur: .5, n: 'Coibentazione' });
  P(mesh(tubeGeo(LM.liq.slice(1, -1).map(p => [p[0] + .015, p[1] + .01, p[2] + .02]), .003, 60), M.grey), { d: .55, n: 'Cavo di segnale' });
  P(mesh(tubeGeo([[UI.x - UI.W / 2 + .05, YUI + .03, ZB + .12], [WX1 + .03, YUI - .05, ZB + .2], [WX0 - .03, YUI - .1, ZB + .4], [WX0 - .04, .3, ZB + .45], [WX0 - .15, .05, ZB + .5]], .007, 60), M.grey), { d: .7, n: 'Tubo di drenaggio' });
  PIN(annulus(.03, .015, .006), M.grey, [YUI + .12].map(y => ({ p: [WX1 + .004, y, ZB + .2], r: [0, 0, PI / 2] })), { d0: .85, d1: .85, n: 'Passamuro' });
}

// 4 ─ Console XMPS 12HI (la prima delle due del dual)
group('xmps', 'Console XMPS 12HI', 'Pavimento o parete: aspira davanti e soffia sia in alto sia in basso. Con il dual se ne collegano due a una sola unità esterna.', 20.5, 26.0, { stage: [0, 0, .8], ex: [.2, 0, .5], az: 22, el: 10, zoom: 1.0,
  info: { e: 'Per le stanze dove una macchina in alto non sta: si mette a pavimento come un termosifone, e d\'inverno soffia l\'aria calda in basso.', s: 'XMPS 12HI · 794 × 621 × 206 mm · 15 kg · 3,52 kW in raffreddamento, 3,81 kW in riscaldamento · libretto 00339716 p.9 · depliant clima la gamma 09-2026 p.14' } });
unitaConsole(CO[0].x, true);

// 5 ─ Unità esterna dual XMX2 18HE
group('xmx', 'Unità esterna dual XMX2 18HE', 'Una sola unità esterna per due stanze: ha due coppie di valvole e divide la potenza tra le unità interne che la chiedono.', 26.0, 31.0, { stage: [0, .1, .7], ex: [-.3, 0, .4], az: 26, el: 14, zoom: 1.0,
  info: { e: 'Meno ingombro fuori casa: una macchina sola serve due stanze, e se tutte e due chiedono tanto, si divide la potenza da sola.', s: 'XMX2 18HE · 805 × 554 × 330 mm · 35 kg · R32 1,25 kg · combinazioni 9+9, 9+12, 9+18, 12+12 · qui due XMPS 12HI (12+12) · depliant clima la gamma 09-2026 p.13-15 · interno: schema di principio' } });
const ux = esterna(UX, false, 2);

// 6 ─ Linee del dual e seconda console
const LD = [0, 1].map(k => ({ liq: [[UX.x + UX.W / 2 + .02, .093 + k * .12, UX.z + .06 - k * .02], [UX.x + UX.W / 2 + .1, .1 + k * .12, UX.z - .1], [WX0 - .05, .12 + k * .06, ZB + .55 + k * .05], [WX1 + .05, .12 + k * .06, ZB + .55 + k * .05], [CO[k].x - CW / 2 - .05, .12 + k * .06, ZB + .1], [CO[k].x - CW / 2 + .04, .2, ZB + .05]] }));
LD.forEach((l, k) => { PIPE['d' + k] = l.liq; });
group('linee2', 'Linee del dual', 'Due coppie di linee, una per stanza, dalla stessa unità esterna alle due console.', 31.0, 33.5, { stage: [0, 0, 0], ex: [0, 0, .3], az: 6, el: 14, zoom: .8,
  info: { e: 'Ogni console ha le sue linee, che partono dalla stessa unità esterna: si accendono e si regolano una per una.', s: 'Linee 1/4" e 3/8" per ogni unità interna · massimo 25 m per unità interna, 40 m in tutto con carica supplementare · dislivello massimo 15 m · depliant clima la gamma 09-2026 p.15 · percorso: indicativo' } });
{
  LD.forEach((l, k) => { P(mesh(tubeGeo(l.liq, .0045, 80), M.copper), { d: k * .2, dur: .5, n: k ? null : 'Linee frigorifere delle due stanze' }); P(mesh(tubeGeo(l.liq.slice(1, -1), .012, 80), M.sFoam), { d: .1 + k * .2, dur: .5, n: k ? null : 'Coibentazione' }); });
  // la seconda console arriva già montata
  const n = node(CO[1].x, 0, ZB);
  P(mesh(G.box(CW - .02, CH - .02, .01), M.zinc, 0, CH / 2, .006), { parent: n, d: .5, from: [0, 0, .6], spin: [0, 0, 0], n: 'Seconda console XMPS 12HI' });
  const rot = new THREE.Group(); rot.position.set(0, CH * .2, .1); n.add(rot); ROT['con' + CO[1].x] = rot;
  P(mesh(G.cylX(.05, CW - .14, 24), M.black), { parent: rot, d: .55, from: [0, 0, .5], spin: [0, 0, 0] });
  P(mesh(G.box(CW - .1, CH * .5, .03), M.copper, 0, CH * .55, .07), { parent: n, d: .58, from: [0, 0, .5], spin: [0, 0, 0] });
  P(mesh(G.rbox(CW, CH, .05, .02), M.sXm, 0, CH / 2, CD - .025), { parent: n, d: .7, from: [0, 0, .5], spin: [0, 0, 0], ease: eoc });
  [-1, 1].forEach(s => P(mesh(G.box(.01, CH, CD - .05), M.sUi2, s * (CW / 2 - .005), CH / 2, (CD - .05) / 2), { parent: n, d: .78, from: [0, 0, .5], spin: [0, 0, 0] }));
  P(mesh(G.plane(.08, .03), M.disp, 0, CH - .045, CD + .001), { parent: n, d: .86, from: [0, 0, .3], spin: [0, 0, 0] });
}
finalize();
function display(txt) { const c = T.disp.image.getContext('2d'); c.fillStyle = '#0d1114'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#9fd8ff'; c.font = '700 34px Barlow, Arial, sans-serif'; c.textAlign = 'center'; c.fillText(txt, 64, 45); T.disp.needsUpdate = true; }
