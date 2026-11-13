
// ───────── Ibrido HYBREER 3 · costruzione, parte 1: texture, materiali e pompa di calore HP_QOR 70 ─────────
// Stesso motore della UHP (uhp/a_core.js e uhp/b_engine.js): ogni pezzo ha nome, istante di arrivo e posto finale.
// Composizione scelta da Bore: HYBREER 3 KON 24 HPQ 70/90 = HP_QOR 70 + KONm 24 C + kit HYBREER (vedi src/dati/ibrido.json).
// HP_QOR 70, depliant Sistemi ibridi 06-2026 p.28-29: 1040 × 865 × 410 mm; piedi a interasse 656 mm, il primo a 191 mm dal fianco sinistro, profondi 458 mm;
//   coperchio dei collegamenti di 65 mm sul fianco destro; attacchi acqua G1" sul retro a 368 mm (uscita) e 533 mm (ingresso) da terra, a circa 65 mm dal fianco;
//   griglia tonda in una cornice quadrata a sinistra, a destra logo, "HP_QOR", sei feritoie e "full inverter".
//   Componenti nominati: compressore DC inverter twin rotary a doppia camera, ventilatore brushless, scambiatore a piastre inox per R32, batteria rame-alluminio,
//   kit idronico (valvola di sicurezza 3 bar, sfogo aria, circolatore inverter, flussostato, vaso 5 l, filtro ingresso), kit antigelo dello scambiatore.
// SCHEMA DI PRINCIPIO (il depliant nomina i componenti ma non dice dove stanno): tutta la disposizione interna, l'interno del compressore (un twin rotary generico),
//   valvola a 4 vie e valvola di espansione (implicite in una macchina che scalda e raffresca), scheda elettronica, numero di pale (tre), batteria a L.
const QX = -.95, QZ = .45, KX = .6, ZW = -.45, KY = 1.30, HY = .66;      // dove stanno nella scena: pompa di calore, parete, caldaia, kit
const PIPE = {};
const qBasis = (x, y) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, V().crossVectors(x, y)));
const node = (x, y, z, s = 1) => { const n = new THREE.Group(); n.position.set(x, y, z); n.scale.setScalar(s); CUR.node.add(n); return n; };
const sposta = (pts, dx, dy, dz) => pts.map(p => [p[0] + dx, p[1] + dy, p[2] + dz]);
// Rilievi (bumpMap): dove la faccia è vista di taglio e la texture è piatta lo shader di Three.js normalizza un vettore nullo e produce un pixel non valido,
// che il bagliore allarga a mezza schermata. Lo correggo una volta per tutti i materiali, prima che vengano compilati.
THREE.ShaderChunk.bumpmap_pars_fragment = THREE.ShaderChunk.bumpmap_pars_fragment.replace('return normalize( abs( fDet ) * surf_norm - vGrad );', 'vec3 nb = abs( fDet ) * surf_norm - vGrad; return dot( nb, nb ) > 1e-14 ? normalize( nb ) : surf_norm;');
const BIANCO = '#c9cccf', C_BIANCO = 0xc9cccf;     // bianco tenuto basso: con le luci della scena arriva al bianco senza sfondare nel bagliore

// texture proprie dell'ibrido
T.qfront = cv(420, 1024, (g, w, h) => { g.fillStyle = BIANCO; g.fillRect(0, 0, w, h); drawUnicalLogo(g, 96, 70, 230); g.fillStyle = '#23272b'; g.font = '600 50px Barlow, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('HP_QOR', 210, 190);
  for (let i = 0; i < 6; i++) { const y = 300 + i * 62; g.fillStyle = '#b9bec2'; g.beginPath(); g.roundRect(128, y, 164, 20, 10); g.fill(); g.fillStyle = '#ccd0d3'; g.beginPath(); g.roundRect(128, y + 5, 164, 15, 8); g.fill(); }
  g.fillStyle = '#23272b'; g.font = '500 34px Barlow, Arial, sans-serif'; g.fillText('full inverter', 210, 905); });
T.plateQ = cv(512, 300, (g, w, h) => { g.fillStyle = '#e9ece9'; g.fillRect(0, 0, w, h); drawUnicalLogo(g, 22, 22, 128); g.fillStyle = '#16191b'; g.font = '700 30px Barlow, Arial, sans-serif'; g.fillText('HP_QOR 70', 300, 54); g.fillRect(22, 72, w - 44, 3); g.font = '500 23px Barlow, Arial, sans-serif';
  [['Refrigerante', 'R32 · 1,25 kg'], ['Alimentazione', '220-240 V ~ 50 Hz'], ['Potenza max assorbita', '3,2 kW'], ['Corrente max', '18 A'], ['Attacchi acqua', 'G 1" BSP'], ['Peso in esercizio', '87 kg']].forEach((r, i) => { g.fillText(r[0], 22, 108 + i * 32); g.fillText(r[1], 300, 108 + i * 32); }); });
T.plateK = cv(512, 300, (g, w, h) => { g.fillStyle = '#e9ece9'; g.fillRect(0, 0, w, h); drawUnicalLogo(g, 22, 22, 128); g.fillStyle = '#16191b'; g.font = '700 30px Barlow, Arial, sans-serif'; g.fillText('KONm C 24', 300, 54); g.fillRect(22, 72, w - 44, 3); g.font = '500 23px Barlow, Arial, sans-serif';
  [['Portata termica', '23,4 kW'], ['Potenza utile', '22,6 kW'], ['Riscaldamento', '0,5 – 3 bar · max 85 °C'], ['Alimentazione', '230 V ~ 50 Hz'], ['Protezione', 'IP X5D'], ['Classe NOx', '6']].forEach((r, i) => { g.fillText(r[0], 22, 108 + i * 32); g.fillText(r[1], 262, 108 + i * 32); }); });
T.vesQ = cv(256, 256, (g, w, h) => { g.fillStyle = '#c9cdcf'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2f2f2'; g.fillRect(48, 80, 160, 90); g.fillStyle = '#1b1e20'; g.font = '700 52px Barlow, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('5 L', 128, 144); }); T.vesQ.wrapS = THREE.RepeatWrapping; T.vesQ.repeat.set(3, 1);
T.vesK = cv(256, 256, (g, w, h) => { g.fillStyle = '#a23a30'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2f2f2'; g.fillRect(40, 70, 176, 116); g.fillStyle = '#1b1e20'; g.font = '700 44px Barlow, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('8 L', 128, 122); g.font = '500 25px Barlow, Arial, sans-serif'; g.fillText('precarica 1 bar', 128, 162); });
T.kpanel = cv(1024, 256, (g, w, h) => { g.fillStyle = '#eceeef'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c2c7ca'; g.lineWidth = 4; g.beginPath(); g.roundRect(14, 14, w - 28, h - 28, 60); g.stroke(); drawUnicalLogo(g, 452, 16, 120);
  g.strokeStyle = '#8a9095'; g.lineWidth = 3; g.fillStyle = '#6a7075'; g.font = '500 20px Barlow, Arial, sans-serif'; g.textAlign = 'center';
  // B: selettore estate/inverno e temperatura del riscaldamento · C: temperatura dell'acqua calda (manuale utente 00334008, §6.1)
  for (const [x, s] of [[250, 'riscaldamento'], [395, 'sanitario']]) { g.beginPath(); g.arc(x, 150, 58, PI * .75, PI * 2.25); g.stroke(); g.fillText(s, x, 62); g.fillText('MIN', x - 62, 226); g.fillText('MAX', x + 62, 226); }
  g.fillStyle = '#7f858a'; g.font = '500 62px Barlow, Arial, sans-serif'; g.textAlign = 'left'; g.fillText('KON', 690, 172);
  g.beginPath(); g.arc(120, 150, 18, 0, 7); g.stroke(); g.font = '500 18px Barlow, Arial, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#6a7075'; g.fillText('sblocco', 120, 200); });
T.gauge = cv(128, 128, (g, w, h) => { g.fillStyle = '#f4f4f1'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.strokeStyle = '#30353a'; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 46, PI * .8, PI * 2.2); g.stroke();
  g.fillStyle = '#30353a'; g.font = '600 15px Barlow, Arial, sans-serif'; g.textAlign = 'center'; ['0', '1', '2', '3', '4'].forEach((s, i) => { const a = PI * .8 + i * PI * 1.4 / 4; g.fillText(s, 64 + Math.cos(a) * 32, 69 + Math.sin(a) * 32); }); g.fillText('bar', 64, 104);
  g.strokeStyle = '#c0261c'; g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(PI * 1.32) * 40, 64 + Math.sin(PI * 1.32) * 40); g.stroke(); });
T.cof = cv(512, 556, (g, w, h) => { g.fillStyle = BIANCO; g.fillRect(0, 0, w, h); g.fillStyle = '#8f969b'; g.font = '500 40px Barlow, Arial, sans-serif'; g.textAlign = 'right'; g.fillText('HYBREER', w - 34, 70); g.fillStyle = '#b4b9bd'; g.fillRect(w - 128, h - 66, 96, 32); drawUnicalLogo(g, w - 122, h - 62, 84, '#eef0f1'); });
T.emb = cv(512, 768, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); g.strokeStyle = '#cfcfcf'; g.lineWidth = 9;     // imbutiture tonde dello schienale, come nella foto del depliant KONm
  for (const [x, y, r] of [[120, 96, 30], [420, 96, 30], [330, 620, 26], [392, 620, 26], [454, 620, 26], [330, 690, 26], [392, 690, 26], [454, 690, 26], [454, 550, 26], [300, 500, 20]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); } }, false);
T.fibra = rep(cv(64, 64, (g, w, h) => { g.fillStyle = '#5b5148'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8b7f72'; g.lineWidth = 1; for (let i = -64; i < 128; i += 5) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); } }), 6, 3);
T.bugne = rep(cv(64, 64, (g, w, h) => { g.fillStyle = '#707070'; g.fillRect(0, 0, w, h); const r = g.createRadialGradient(32, 32, 2, 32, 32, 22); r.addColorStop(0, '#e8e8e8'); r.addColorStop(1, '#707070'); g.fillStyle = r; g.beginPath(); g.arc(32, 32, 22, 0, 7); g.fill(); }, false), 16, 14);
T.muro = rep(cv(256, 256, (g, w, h) => { const r = rng(31); g.fillStyle = '#4a4e52'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { const v = 62 + r() * 34 | 0; g.fillStyle = `rgba(${v},${v + 3},${v + 6},.5)`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); } }), 3, 4);
// display della caldaia: temperatura (N), riscaldamento attivo (F) e bruciatore in funzione (L), come nella legenda del manuale utente §6.1
T.lcd = cv(128, 128, () => {});
function lcdCaldaia(temp, acceso) { const g = T.lcd.image.getContext('2d'); g.fillStyle = '#2f7fd8'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#dff1ff'; g.font = '700 54px Barlow, Arial, sans-serif'; g.textAlign = 'left'; g.fillText(acceso ? String(temp) : '--', 10, 62); g.font = '600 22px Barlow, Arial, sans-serif'; g.fillText('°C', 86, 40);
  if (acceso) { g.beginPath(); g.moveTo(100, 76); g.bezierCurveTo(118, 96, 112, 116, 100, 118); g.bezierCurveTo(86, 116, 86, 100, 94, 92); g.bezierCurveTo(96, 100, 100, 96, 100, 76); g.fill(); for (let i = 0; i < 4; i++) g.fillRect(14 + i * 11, 88, 6, 28); } T.lcd.needsUpdate = true; }
lcdCaldaia(35, false);

// materiali propri: tutti dentro M, così il "giro" li rende quasi trasparenti; quelli con xr() sono involucri che i raggi X bucano
Object.assign(M, {
  sWhite: xr(std({ color: C_BIANCO, roughness: .8, metalness: 0, bumpMap: T.noise, bumpScale: .25 })),
  sWhite2: xr(std({ color: C_BIANCO, roughness: .84, metalness: 0, side: THREE.DoubleSide, envMapIntensity: .45 })),
  sQFront: xr(std({ color: 0xffffff, roughness: .84, metalness: 0, map: T.qfront, envMapIntensity: .45 })),
  sQLabel: xr(std({ color: 0xc8c8c8, roughness: .55, map: T.plateQ, envMapIntensity: .4 })), sKLabel: xr(std({ color: 0xc8c8c8, roughness: .55, map: T.plateK, envMapIntensity: .4 })),
  sGrid: xr(std({ color: 0xb4b8bb, roughness: .75, metalness: .05, envMapIntensity: .5 })),
  sIn: xr(std({ color: 0xc8c8c8, roughness: .55, map: T.io('IN'), envMapIntensity: .4 })), sOut: xr(std({ color: 0xc8c8c8, roughness: .55, map: T.io('OUT'), envMapIntensity: .4 })),
  sKPanel: xr(std({ color: 0xd9d9d9, roughness: .84, map: T.kpanel, envMapIntensity: .45 })), sCof: xr(std({ color: 0xffffff, roughness: .84, map: T.cof, envMapIntensity: .45 })),
  sAlsi: xr(std({ color: 0x4d5155, roughness: .68, metalness: .55, bumpMap: T.noise, bumpScale: 1.2 })),
  sBugne: xr(std({ color: 0x9da3a7, roughness: .58, metalness: .85, envMapIntensity: .6 })),
  sFoam: xr(std({ color: 0x17181a, roughness: 1, metalness: 0, bumpMap: T.noise, bumpScale: 2.2 })),
  sClear: xr(std({ color: 0x8f9aa2, roughness: .35, metalness: 0, transparent: true, opacity: .3 })),
  sPP: xr(std({ color: 0xc4c5c0, roughness: .4, metalness: 0, envMapIntensity: .5 })),
  fin: std({ color: 0x8f969b, roughness: .45, metalness: .8, envMapIntensity: .55 }),
  alsi: std({ color: 0x4d5155, roughness: .68, metalness: .55, bumpMap: T.noise, bumpScale: 1.2 }),
  zinc: std({ color: 0xa3a9ad, roughness: .4, metalness: .85, map: T.spangle, envMapIntensity: .6 }),
  backK: std({ color: 0xb4bbc0, roughness: .6, metalness: .85, map: rep(T.spangle.clone(), 5, 8),     // cristalli della zincatura piccoli, non a macchie
    bumpMap: T.emb, bumpScale: 3 }),
  fibra: std({ color: 0xffffff, roughness: .8, metalness: .3, map: T.fibra, emissive: 0xff5a1c, emissiveIntensity: 0 }),
  white: std({ color: C_BIANCO, roughness: .84, metalness: 0, envMapIntensity: .45 }),
  grey: std({ color: 0x8f969b, roughness: .55, metalness: .1 }),
  wRed: std({ color: 0xc8322a, roughness: .5 }), wBlue: std({ color: 0x2b62b8, roughness: .5 }), wYel: std({ color: 0xd9b23a, roughness: .45, metalness: .3 }), wOr: std({ color: 0xe07a1f, roughness: .5 }),
  pex: std({ color: 0xd8642c, roughness: .5 }), massetto: std({ color: 0x2c3138, roughness: .9, bumpMap: T.bugne, bumpScale: 2.5 }),
  vesQ: std({ color: 0xbdbdbd, roughness: .5, metalness: .2, map: T.vesQ, envMapIntensity: .5 }), vesQ2: std({ color: 0x96999b, roughness: .5, metalness: .2, envMapIntensity: .5 }), vesK: std({ color: 0xd0d0d0, roughness: .5, metalness: .2, map: T.vesK, envMapIntensity: .5 }),
  lcd: new THREE.MeshBasicMaterial({ map: T.lcd }), gauge: std({ color: 0xcccccc, roughness: .5, map: T.gauge, envMapIntensity: .4 }),
});
const FIAMMA = new THREE.MeshBasicMaterial({ color: new THREE.Color(.35, .9, 2.6), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });   // resta fuori da M: nel giro si deve vedere

// ══════════ HP_QOR 70 ══════════ coordinate locali: origine a terra al centro, X larghezza, Z verso il fronte
const QW = 1.04, QH = .865, QD = .41, QB = .066, XP = .2, QFAN = { x: -.14, y: .435 }, QYC = (QB + QH - .02) / 2, QHP = QH - .02 - QB;
const qHome = { off: [QX, .43, QZ], w: 1.75, h: 1.25 };

// 1 ─ Basamento e batteria alettata
group('qbase', 'Basamento e batteria', 'Fondo su due piedi a 656 mm di interasse e batteria a L: tubi in rame, alette in alluminio con trattamento anticorrosione.', 3.5, 7.0, { stage: [-.25, .2, .8], ex: [-.5, -.05, -.45], az: 26, el: 18, zoom: .82,
  info: { e: 'Il polmone della pompa di calore. L\'aria di fuori passa tra le alette e cede il suo calore al gas, anche d\'inverno.', s: 'HP_QOR 70 · tubi in rame con alette in alluminio, trattamento anticorrosione · piedi a 656 mm di interasse, profondi 458 mm · lavora fino a −25 °C esterni' } }).home = qHome;
const qy0 = QB + .025, qcH = .72, qyc = qy0 + qcH / 2;
{
  const q = node(QX, 0, QZ), o = x => Object.assign({ parent: q }, x);
  [-.329, .327].forEach((x, i) => P(mesh(G.rbox(.075, .05, .458, .005), M.zinc, x, .025, 0), o({ d: i * .04, from: [0, -.25, 0], spin: [0, .6, 0], n: i ? null : 'Piedi, interasse 656 mm' })));
  const fe = []; for (const x of [-.329, .327]) for (const z of [-.212, .212]) fe.push({ p: [x, .05, z] }); screws(fe, o({ d0: .06, d1: .1, n: 'Bulloni di fondazione Ø 10' }));
  [-.329, .327].forEach((x, i) => P(mesh(G.rbox(.105, .008, .49, .003), M.rubber, x, .003, 0), o({ d: i * .03, from: [0, -.2, 0], spin: [0, 0, 0], n: i ? null : 'Tappetini antiurto in gomma' })));
  P(mesh(G.rbox(QW - .004, .016, QD - .004, .005), M.basePlate, 0, .058, 0), o({ d: .12, from: [0, .45, .1], spin: [.5, 0, 0], dur: .6, n: 'Fondo stampato' }));
  [[0, .016, QD / 2 - .002, QW, .004], [0, .016, -QD / 2 + .002, QW, .004]].forEach(([x, , z, w, d], i) => P(mesh(G.box(w, .026, d), M.zinc, x, QB + .011, z), o({ d: .18 + i * .02, from: [0, 0, z * 1.5], spin: [0, 0, 0] })));
  [-QW / 2 + .002, QW / 2 - .002].forEach((x, i) => P(mesh(G.box(.004, .026, QD), M.zinc, x, QB + .011, 0), o({ d: .22 + i * .02, from: [x * .6, 0, 0], spin: [0, 0, 0] })));
  P(mesh(annulus(.016, .008, .005), M.term, -.3, QB + .003, .1), o({ d: .26, n: 'Scarico della condensa' }));
  P(mesh(G.box(.004, QHP - .02, QD - .02), M.galv, XP, QYC, 0), o({ d: .3, from: [0, .5, 0], spin: [0, .5, 0], dur: .55, n: 'Paratia del vano tecnico' }));
  // batteria a L: schiena e fianco sinistro, due ranghi
  P(mesh(G.box(.004, qcH + .02, .062), M.galv, .172, qyc, -.165), o({ d: .34, from: [.4, 0, 0], spin: [0, 0, 0], n: 'Piastre tubiere' }));
  P(mesh(G.box(.062, qcH + .02, .004), M.galv, -.485, qyc, .17), o({ d: .36, from: [0, 0, .4], spin: [0, 0, 0] }));
  const rows = [[-.178, -.498, .035, .25], [-.152, -.472, .02, .75]], NT = 12, pitch = qcH / NT;
  const tgeo = (zb, xs, rho) => { const c = new THREE.CurvePath(); c.add(new THREE.LineCurve3(V(.17, 0, zb), V(xs + rho, 0, zb))); c.add(new THREE.QuadraticBezierCurve3(V(xs + rho, 0, zb), V(xs, 0, zb), V(xs, 0, zb + rho))); c.add(new THREE.LineCurve3(V(xs, 0, zb + rho), V(xs, 0, .168))); return new THREE.TubeGeometry(c, 56, .0045, 8, false); };
  rows.forEach(([zb, xs, rho, of], r) => PIN(tgeo(zb, xs, rho), M.copper, Array.from({ length: NT }, (_, i) => ({ p: [0, qy0 + pitch * (i + of), 0] })), o({ d0: .38 + r * .06, d1: .46 + r * .06, from: [.8, 0, 0], spin: [0, 0, 0], dur: .45, ease: eoc, n: r ? null : 'Tubi in rame' })));
  const ya = i => qy0 + pitch * (i + .25), yb = i => qy0 + pitch * (i + .75);
  const bend = (A, B, out) => { const x = B.clone().sub(A), L = x.length(); return { p: A.clone().add(B).multiplyScalar(.5).toArray(), q: qBasis(x.normalize(), out), L }; };
  const b1 = Array.from({ length: NT }, (_, i) => bend(V(.175, ya(i), -.178), V(.175, yb(i), -.152), V(1, 0, 0)));
  const b2 = Array.from({ length: NT }, (_, i) => bend(V(-.498, ya(i), .17), V(-.472, yb(i), .17), V(0, 0, 1)));
  PIN(G.torus(b1[0].L / 2, .0045, PI, 14), M.copper, b1, o({ d0: .52, d1: .55, from: [.25, 0, 0], spin: [0, 0, 0], n: 'Curve di ritorno' }));
  PIN(G.torus(b2[0].L / 2, .0045, PI, 14), M.copper, b2, o({ d0: .54, d1: .57, from: [0, 0, .25], spin: [0, 0, 0] }));
  const fb = [], nb = 146; for (let i = 0; i < nb; i++) fb.push({ p: [.165 - i * .0042, qyc, -.165] });
  PIN(G.box(.0011, qcH, .054), M.fin, fb, o({ d0: .56, d1: .82, dur: .34, from: [0, .7, 0], spin: [0, 0, 0], ease: eoc, n: 'Alette in alluminio', snd: 'fin' }));
  const fc = []; for (let i = 1; i <= 9; i++) { const a = i / 10 * PI / 2; fc.push({ p: [-.445 - .04 * Math.sin(a), qyc, -.125 - .04 * Math.cos(a)], r: [0, a, 0] }); }
  PIN(G.box(.0011, qcH, .054), M.fin, fc, o({ d0: .82, d1: .84, dur: .34, from: [0, .7, 0], spin: [0, 0, 0], ease: eoc, snd: 'fin' }));
  const fs = [], ns = 70; for (let i = 0; i < ns; i++) fs.push({ p: [-.485, qyc, -.125 + i * .0042] });
  PIN(G.box(.054, qcH, .0011), M.fin, fs, o({ d0: .84, d1: .94, dur: .34, from: [0, .7, 0], spin: [0, 0, 0], ease: eoc, snd: 'fin' }));
  P(mesh(G.cyl(.009, .6, 16), M.copper, .186, qyc, -.13), o({ d: .95, from: [.3, 0, .2], n: 'Collettore' }));
  P(mesh(G.cyl(.005, .03, 14, .011), M.brass, .186, QB + .12, -.186), o({ d: .96, n: 'Distributore' }));
  [1, 4, 7, 10].forEach((k, i) => P(mesh(tubeGeo([[.186, QB + .136, -.186], [.192 + i * .002, QB + .2 + i * .02, -.184], [.184, ya(k) - .03, -.182], [.174, ya(k), -.178]], .0024, 24), M.copper), o({ d: .97 + i * .006, n: i ? null : 'Capillari' })));
}

// 2 ─ Scambiatore a piastre e modulo idraulico: ogni componente è dove lo mostra il disegno del manuale 00339595 (p.20)
const QPX = .391;                                     // attacchi sul retro a 911 mm dal fianco sinistro (p.10: E + F + G), a 368 e 533 mm da terra (K + J, + I)
const QIN = [QPX, .533, -QD / 2], QOUT = [QPX, .368, -QD / 2];
const HXX = .356, HXY = .2075, HXH = .275, ZHB = -.197, ZHF = -.135, XRF = HXX - .035, PZ = -.05, VX = .29, VZ = -.01, ACX = .343, ACZ = -.1, CMX = .37, CMZ = .125;
const QP = {
  // acqua: entra in alto, scende nel circolatore, entra in basso nello scambiatore, esce in testa e torna all'attacco basso
  wIn: [[QPX, .533, -.2], [QPX, .533, -.1], [QPX, .526, -.07], [QPX, .5, PZ], [QPX, .3, PZ], [QPX, .15, PZ], [QPX, .122, -.06], [QPX, .115, -.085], [QPX, .115, ZHF]],
  wHx: [[QPX, .115, ZHF + .006], [QPX + .008, .21, ZHF + .006], [QPX, .3, ZHF + .006]],          // i flussi corrono sulla faccia anteriore dello scambiatore, per restare visibili
  wA: [[QPX, .3, ZHF], [QPX, .3, -.115], [QPX, .31, -.098], [QPX, .334, -.092], [QPX, .358, -.1], [QPX, .368, -.12], [QPX, .368, -.2]],
  wB: [[QPX, .368, -.2], [QPX, .368, -.242]],
  // R32 (allegato A, p.63): compressore → valvola a 4 vie → scambiatore a piastre → cilindro dell'accumulatore → filtro, valvola di espansione, capillare, filtro → batteria → valvola a 4 vie → compressore
  a: [[.353, .427, .108], [.35, .47, .09], [.34, .56, .03], [.322, .65, .03], [.3, .662, .05], [.3, .622, .05]],
  b: [[.33, .578, .05], [.335, .54, .02], [.324, .47, -.06], [XRF, .4, -.1], [XRF, .31, -.112], [XRF, .3, ZHF]],
  rHx: [[XRF, .3, ZHF + .006], [XRF - .008, .21, ZHF + .006], [XRF, .115, ZHF + .006]],
  c: [[XRF, .115, ZHF], [XRF, .115, -.112], [.33, .125, -.102], [ACX, .16, ACZ], [ACX, .34, ACZ], [.355, .41, -.11], [.34, .49, -.13], [.27, .522, -.15], [.242, .497, -.15]],
  d: [[.228, .472, -.15], [.22, .4, -.17], [.212, .25, -.184], [.2, .2, -.186], [.186, QB + .135, -.186]],
  coil: (() => { const a = []; for (let i = 0; i < 6; i++) { const y = qy0 + .06 + i * .12, L = i % 2 === 0; a.push([L ? .15 : -.42, y, -.135], [L ? -.42 : .15, y, -.135]); } return a; })(),
  e: [[.186, .74, -.13], [.205, .73, -.09], [.235, .62, -.02], [.258, .555, .035], [.27, .56, .05], [.27, .578, .05]],
  f: [[.3, .578, .05], [.31, .545, .08], [.38, .5, .14], [.45, .46, .14], [.4775, .43, .134], [.4775, .4, .134]],
};
for (const k in QP) PIPE['q' + k] = sposta(QP[k], QX, 0, QZ);
group('qhyd', 'Scambiatore e modulo idraulico', 'Scambiatore a piastre inox brevettato per R32 e modulo idraulico: circolatore inverter, vaso da 5 litri, valvola di sicurezza 3 bar, flussostato e sfogo aria.', 7.0, 11.0, { stage: [.2, .15, .8], ex: [.15, .05, -.5], az: 40, el: 20, zoom: .95,
  info: { e: 'Qui il calore passa dal gas all\'acqua di casa, che poi va al kit HYBREER.', s: 'Disposizione dal manuale 00339595 p.20 · scambiatore a piastre inox brevettato per R32 · circolatore inverter · vaso di espansione 5 l precaricato a 1,5 bar · valvola di sovrapressione 3 bar · flussostato · spurgo automatico dell\'aria · sensori Tw_in, Tw_out, T2, T2B · attacchi sul retro a 368 e 533 mm da terra · kit antigelo integrato' } }).home = qHome;
{
  const q = node(QX, 0, QZ), o = x => Object.assign({ parent: q }, x);
  // scambiatore a piastre, in piedi contro la schiena del vano
  P(mesh(G.box(.12, HXH, .004), M.steel, HXX, HXY, ZHB + .002), o({ d: 0, from: [0, 0, -.35], spin: [0, 0, 0], n: 'Piastra di fondo' }));
  const pl = []; for (let i = 0; i < 22; i++) pl.push({ p: [HXX, HXY, ZHB + .0055 + i * .0025] });
  PIN(G.box(.12, HXH, .0018), M.inox, pl, o({ d0: .03, d1: .25, dur: .3, from: [0, .05, .45], spin: [0, 0, 0], ease: eoc, n: 'Piastre in acciaio inox', snd: 'fin' }));
  P(mesh(G.box(.12, HXH, .004), M.steel, HXX, HXY, ZHF - .002), o({ d: .27, from: [0, 0, .35], spin: [0, 0, 0], n: 'Piastra di testa' }));
  [[QPX, .3, M.steel, .013], [QPX, .115, M.steel, .013], [XRF, .3, M.copper, .009], [XRF, .115, M.copper, .009]].forEach(([x, y, m, r], i) => P(mesh(G.cylZ(r + .003, .014, 16), m, x, y, ZHF + .007), o({ d: .29 + i * .008, from: [0, 0, .3], spin: [0, 0, 3] })));
  P(mesh(G.box(.004, .2, .05), M.heater, HXX - .0625, HXY, -.166), o({ d: .33, from: [-.2, 0, 0], spin: [0, 0, 0], n: 'Kit antigelo dello scambiatore' }));
  // vaso di espansione da 5 litri, in piedi sulla sua staffa
  P(mesh(G.box(.17, .004, .13), M.galv, VX, .196, VZ), o({ d: .35, from: [0, .3, 0], n: 'Staffa del vaso' }));
  [-1, 1].forEach((sg, i) => P(mesh(G.box(.004, .13, .13), M.galv, VX + sg * .083, .131, VZ), o({ d: .36 + i * .008, from: [sg * .2, 0, 0], spin: [0, 0, 0] })));
  P(mesh(G.cyl(.03, .012, 20), M.steel, VX, .204, VZ), o({ d: .38 }));
  P(mesh(G.dome(.085, .5, false), M.vesQ2, VX, .25, VZ), o({ d: .39, from: [0, .35, 0], spin: [0, 1.5, 0] }));
  P(mesh(G.cyl(.085, .17, 40), M.vesQ, VX, .335, VZ, 0, rad(-40), 0), o({ d: .4, from: [0, .35, 0], spin: [0, 1.5, 0], dur: .55, n: 'Vaso di espansione 5 l' }));
  P(mesh(G.dome(.085, .5), M.vesQ2, VX, .42, VZ), o({ d: .41, from: [0, .35, 0], spin: [0, 1.5, 0] }));
  P(mesh(G.torus(.0862, .0035), M.steel, VX, .268, VZ, PI / 2, 0, 0), o({ d: .42, from: [0, .3, 0] }));
  P(mesh(G.cyl(.005, .014, 10), M.brass, VX + .02, .466, VZ), o({ d: .43, n: 'Valvola di precarica' }));
  P(mesh(tubeGeo([[VX, .2, VZ], [VX + .012, .172, VZ - .02], [VX + .06, .165, PZ + .008], [QPX - .012, .17, PZ]], .006, 24), M.rubber), o({ d: .44 }));
  // circolatore sul tratto verticale, motore verso il fianco destro
  P(mesh(G.cyl(.022, .1, 20), M.cast, QPX, .22, PZ), o({ d: .47, n: 'Circolatore inverter' }));
  P(mesh(G.cylX(.04, .036, 28), M.cast, QPX, .22, PZ), o({ d: .48 }));
  [.277, .163].forEach((y, i) => P(mesh(G.cyl(.024, .016, 6), M.brass, QPX, y, PZ), o({ d: .49 + i * .008, spin: [0, 5, 0], snd: 'screw', n: i ? null : 'Bocchettoni del circolatore' })));
  P(mesh(G.cylX(.036, .052, 28), M.black, QPX + .044, .22, PZ), o({ d: .51, from: [.4, 0, 0], spin: [3, 0, 0] }));
  P(mesh(G.rbox(.022, .062, .062, .008), M.plastic, QPX + .081, .22, PZ), o({ d: .53, from: [.4, 0, 0] }));
  P(mesh(G.torus(.018, .003), M.led, QPX + .093, .22, PZ, 0, PI / 2, 0), o({ d: .55, from: [.3, 0, 0] }));
  // flussostato e spurgo dell'aria sul tratto alto, valvola di sovrapressione in testa allo scambiatore
  P(mesh(G.cyl(.008, .03, 12), M.brass, QPX, .556, -.165), o({ d: .58 }));
  P(mesh(G.cyl(.013, .02, 6), M.brass, QPX, .578, -.165), o({ d: .585, spin: [0, 5, 0], n: 'Flussostato' }));
  P(mesh(G.rbox(.026, .03, .04, .005), M.plastic, QPX, .603, -.165), o({ d: .59 }));
  P(mesh(G.cyl(.008, .024, 12), M.brass, QPX, .553, -.12), o({ d: .6 }));
  P(mesh(G.cyl(.015, .04, 18), M.brass, QPX, .585, -.12), o({ d: .605, n: 'Valvola di spurgo automatico dell\'aria' }));
  P(mesh(G.cyl(.009, .012, 12), M.black, QPX, .611, -.12), o({ d: .61 }));
  P(mesh(G.cylX(.011, .04, 12), M.brass, QPX + .03, .3, -.108), o({ d: .63, n: 'Valvola di sovrapressione 3 bar' }));
  P(mesh(G.cylX(.016, .02, 16), M.red, QPX + .058, .3, -.108), o({ d: .64 }));
  // cilindro dell'accumulatore sulla linea del liquido, accanto al circolatore
  P(mesh(G.cyl(.016, .15, 20), M.steel, ACX, .25, ACZ), o({ d: .66, from: [-.2, .2, .2], n: 'Cilindro dell\'accumulatore' }));
  P(mesh(G.dome(.016, .6), M.steel, ACX, .325, ACZ), o({ d: .665 })); P(mesh(G.dome(.016, .6, false), M.steel, ACX, .175, ACZ), o({ d: .665 }));
  // tubi dell'acqua e attacchi sul retro
  P(mesh(tubeGeo(QP.wIn, .0125, 72), M.copper), o({ d: .7, dur: .55, n: 'Ingresso acqua: giù al circolatore e allo scambiatore' }));
  P(mesh(G.cylZ(.0125, .05, 16), M.copper, QPX, .115, -.028), o({ d: .75 }));
  P(mesh(tubeGeo(QP.wA, .0125, 48), M.copper), o({ d: .77, dur: .5, n: 'Uscita acqua: dalla testa dello scambiatore all\'attacco' }));
  [QIN, QOUT].forEach((p, i) => { P(mesh(G.cylZ(.0185, .05, 20), M.brass, p[0], p[1], p[2] - .012), o({ d: .84 + i * .02, from: [0, 0, -.3], spin: [0, 0, 4], n: i ? 'Uscita acqua G 1"' : 'Ingresso acqua G 1"' })); P(mesh(G.cylZ(.024, .014, 6), M.brass, p[0], p[1], p[2] - .03), o({ d: .86 + i * .02, from: [0, 0, -.3], spin: [0, 0, 6], snd: 'screw' })); });
  // i quattro sensori del modulo idraulico
  [[QPX - .024, .3, -.108, 'Sensore Tw_out'], [QPX, .115, .001, 'Sensore Tw_in'], [ACX, .148, ACZ + .014, 'Sensore T2, refrigerante liquido'], [XRF + .014, .36, -.106, 'Sensore T2B, refrigerante gas']].forEach(([x, y, z, n], i) => P(mesh(G.rbox(.012, .022, .012, .003), M.plastic, x, y, z), o({ d: .92 + i * .015, n })));
}

// 3 ─ Compressore twin rotary, in sezione finché non arriva lo sportello (interno generico: schema di principio)
const gC = group('qcomp', 'Compressore twin rotary', 'DC inverter a doppia camera di compressione con rotori bilanciati: modula meglio, vibra meno ed è più silenzioso.', 11.0, 16.5, { stage: [.4, .18, .9], ex: [.15, -.05, .75], az: 34, el: 12, trav: .5,
  keys: [[.03, 38, 16, 1.05, 0], [.3, 28, 9, .62, -.06], [.5, 44, 12, .9, 0], [.72, 32, 7, .7, -.02], [.9, 40, 12, 1.1, 0]],
  info: { e: 'Il cuore. Schiaccia il gas R32 e lo scalda: è da qui che parte il calore per la casa.', s: 'Twin rotary DC inverter · doppia camera di compressione con rotori bilanciati · tempi di reazione e accensione ridotti del 40 % · R32, 1,25 kg · interno: schema di principio' } });
gC.home = qHome;
let cmp, crank;
{
  const q = node(QX, 0, QZ); cmp = new THREE.Group(); cmp.position.set(CMX, QB, CMZ); cmp.scale.setScalar(.86); q.add(cmp); crank = new THREE.Group(); cmp.add(crank);
  const AX = .125, AZ = .01;      // separatore di liquido sul fianco destro del compressore
  const cp = (m, o) => P(m, Object.assign({ parent: cmp }, o)), ck = (m, o) => P(m, Object.assign({ parent: crank, spin: [0, 4, 0], from: [0, .35, 0] }, o));
  cp(mesh(G.rbox(.22, .012, .22, .004), M.galv, 0, .006, 0), { d: 0, from: [0, -.2, 0], n: 'Piattaforma antivibrante' });
  const gr = [0, 1, 2].map(i => { const a = rad(90 + i * 120); return { p: [Math.cos(a) * .088, .027, Math.sin(a) * .088] }; });
  PIN(G.cyl(.017, .03, 16), M.rubber, gr, { parent: cmp, d0: .03, d1: .06, n: 'Gommini' });
  cp(mesh(new THREE.CylinderGeometry(.118, .118, .005, 3), M.black, 0, .0445, 0, 0, rad(-30), 0), { d: .08, n: 'Piede' });
  screws(gr.map(g => ({ p: [g.p[0], .048, g.p[2]] })), { parent: cmp, d0: .1, d1: .12 });
  cp(mesh(G.dome(.066, .45, false), M.shellC, 0, .075, 0), { d: .13, from: [0, -.25, 0], spin: [0, 2, 0], n: 'Fondello' });
  cp(mesh(G.cyl(.05, .012, 32), M.cast, 0, .087, 0), { d: .16, n: 'Supporto inferiore' });
  ck(mesh(G.cyl(.0105, .25, 20), M.steel, 0, .19, 0), { d: .2, dur: .6, n: 'Albero a due eccentrici' });
  [[.105, .0085, .24, 'Pistone rotante inferiore'], [.136, -.0085, .36, 'Pistone rotante superiore']].forEach(([y, x, d, n]) => {
    ck(mesh(G.cyl(.0235, .022, 28), M.steel, x, y, 0), { d });
    ck(mesh(annulus(.0315, .0235, .022), M.brass, x, y, 0), { d: d + .02, n });
    cp(mesh(annulus(.058, .0405, .024), M.cast, 0, y, 0), { d: d + .05, n: y < .12 ? 'Camera inferiore' : 'Camera superiore' });
    cp(mesh(G.box(.02, .02, .004), M.steel, .049 * Math.sin(rad(215)), y, .049 * Math.cos(rad(215)), 0, rad(215 - 90), 0), { d: d + .07 });
  });
  cp(mesh(annulus(.058, .013, .007), M.steel, 0, .1205, 0), { d: .33, n: 'Piastra intermedia' });
  cp(mesh(G.cyl(.05, .012, 32), M.cast, 0, .154, 0), { d: .45, n: 'Supporto superiore' });
  cp(mesh(G.cyl(.042, .018, 28, .034), M.steel, 0, .169, 0), { d: .47, n: 'Silenziatore' });
  ck(mesh(G.cyl(.0345, .075, 36), M.lam, 0, .235, 0), { d: .49, n: 'Rotore bilanciato' });
  ck(mesh(annulus(.0345, .018, .008, 0, PI), M.brass, 0, .2765, 0), { d: .5 });
  ck(mesh(annulus(.0345, .018, .008, PI, PI * 2), M.brass, 0, .1935, 0), { d: .5 });
  cp(mesh(annulus(.0615, .0375, .075), M.lam, 0, .235, 0), { d: .52, from: [0, .45, 0], spin: [0, 1.5, 0], dur: .6, n: 'Statore' });
  [.283, .187].forEach((y, i) => cp(mesh(G.torus(.0495, .0115), M.copper, 0, y, 0, PI / 2, 0, 0), { d: .54 + i * .01, n: i ? null : 'Avvolgimenti in rame' }));
  cp(mesh(G.open(.066, .26, PI / 2, rad(250)), M.shellC, 0, .205, 0), { d: .56, from: [-.2, .35, -.25], spin: [0, 2.5, 0], dur: .65, n: 'Mantello' });
  cp(mesh(G.cyl(.03, .19, 28), M.shellC, AX, .225, AZ), { d: .6, n: 'Separatore di liquido' });
  cp(mesh(G.dome(.03, .5), M.shellC, AX, .32, AZ), { d: .61 }); cp(mesh(G.dome(.03, .5, false), M.shellC, AX, .13, AZ), { d: .61 });
  cp(mesh(annulus(.0325, .03, .014), M.steel, AX, .25, AZ), { d: .62 });
  [[.105, .64], [.136, .66]].forEach(([y, d], i) => cp(mesh(tubeGeo([[AX, .118, AZ + (i ? .012 : -.012)], [AX - .008, y - .012, AZ + (i ? .012 : -.012)], [.1, y, AZ * .6], [.062, y, .004]], .0062, 28), M.copper), { d, n: i ? null : 'Due aspirazioni, una per camera' }));
  cp(mesh(G.cyl(.008, .05, 14), M.copper, AX, .36, AZ), { d: .66 });
  cp(mesh(G.dome(.066, .45), M.shellC, 0, .335, 0), { d: .68, from: [0, .4, 0], spin: [0, 2, 0], n: 'Calotta' });
  cp(mesh(G.rbox(.052, .03, .05, .006), M.plastic, .012, .366, .026), { d: .7, n: 'Scatola morsetti' });
  cp(mesh(G.cyl(.008, .06, 14), M.copper, -.02, .385, -.02), { d: .72, n: 'Mandata' });
  const dn = [Math.sin(rad(35)), 0, Math.cos(rad(35))];
  cp(mesh(G.open(.066, .26, rad(-20), rad(110)), M.sDoor, 0, .205, 0), { d: .84, from: [dn[0] * .3, .04, dn[2] * .3], spin: [0, 0, 0], dur: .6, ease: eoc, n: 'Chiusura del mantello' });
  cp(mesh(G.open(.0725, .275, PI / 2, PI), M.sFelt, 0, .2, 0), { d: .9, from: [0, 0, -.35], spin: [0, 0, 0], ease: eoc, n: 'Rivestimento fonoassorbente' });
  cp(mesh(G.open(.0725, .275, -PI / 2, PI), M.sFelt, 0, .2, 0), { d: .92, from: [0, 0, .35], spin: [0, 0, 0], ease: eoc });
  cp(mesh(annulus(.0725, .034, .01), M.sFelt, 0, .345, 0), { d: .96, from: [0, .3, 0], spin: [0, 0, 0] });
}
PIPE.comp = [[.125, .4, .01], [.125, .3, .01], [.125, .14, .01], [.105, .112, .008], [.062, .118, .004], [.012, .12, 0], [.012, .16, -.01], [0, .21, .012], [-.012, .27, 0], [0, .32, -.01], [-.02, .36, -.02], [-.02, .42, -.02]];
const qcw = p => [QX + CMX + p[0] * .86, QB + p[1] * .86, QZ + CMZ + p[2] * .86];      // dal compressore alla scena

// 4 ─ Ventilatore
const fanRot = new THREE.Group();
group('qfan', 'Ventilatore', 'Motore brushless DC inverter ad alta modulazione e bassa rumorosità.', 16.5, 19.0, { stage: [-.15, .1, 1.0], ex: [-.1, 0, .6], az: -26, el: 16, zoom: 1.4,
  info: { e: 'Aspira l\'aria attraverso la batteria. Cambia velocità da solo, in base a quanto calore serve.', s: 'Motore brushless DC inverter · alta modulazione, bassa rumorosità · due livelli di silenziamento impostabili · pressione sonora 48 dB(A) a 1 m (HP_QOR 70)' } }).home = qHome;
{
  const q = node(QX, 0, QZ), o = x => Object.assign({ parent: q }, x), F = QFAN;
  [-.11, .11].forEach((dx, i) => P(mesh(G.box(.028, QHP - .04, .012), M.galv, F.x + dx, QYC - .01, -.07), o({ d: i * .05, from: [0, .5, 0], spin: [0, 1, 0], n: i ? null : 'Montanti del motore' })));
  P(mesh(G.box(.27, .14, .004), M.galv, F.x, F.y, -.062), o({ d: .12, spin: [0, 0, 1] }));
  P(mesh(G.cylZ(.052, .07, 32), M.black, F.x, F.y, -.022), o({ d: .2, from: [0, .1, .45], spin: [0, 0, 3], dur: .55, n: 'Motore brushless DC' }));
  P(mesh(G.cylZ(.042, .012, 32, .036), M.alu, F.x, F.y, .019), o({ d: .26, from: [0, 0, .4], spin: [0, 0, 2] }));
  P(mesh(G.cylZ(.006, .05, 12), M.steel, F.x, F.y, .045), o({ d: .3, from: [0, 0, .4], spin: [0, 0, 6] }));
  screws([[-.1, -.045], [.1, -.045], [-.1, .045], [.1, .045]].map(a => ({ p: [F.x + a[0], F.y + a[1], -.059], r: [PI / 2, 0, 0] })), o({ d0: .34, d1: .4 }));
  fanRot.position.set(F.x, F.y, .08); q.add(fanRot);
  P(mesh(G.cylZ(.055, .05, 36), M.plastic), { parent: fanRot, d: .46, from: [0, 0, .5], spin: [0, 0, 4], n: 'Mozzo' });
  P(mesh(G.cylZ(.03, .012, 24, .025), M.alu, 0, 0, .03), { parent: fanRot, d: .5, from: [0, 0, .5], spin: [0, 0, 4] });
  const bs = new THREE.Shape(); bs.moveTo(-.04, .05); bs.quadraticCurveTo(-.135, .09, -.15, .245); bs.quadraticCurveTo(-.06, .306, .045, .287); bs.quadraticCurveTo(.108, .16, .04, .05); bs.closePath();
  const bg = new THREE.ExtrudeGeometry(bs, { depth: .004, bevelEnabled: false, curveSegments: 16 }); bg.translate(0, 0, -.002);
  { const p = bg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = rad(lerp(36, 17, clamp((y - .05) / .24))); p.setXYZ(i, x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)); } bg.computeVertexNormals(); bg.scale(.86, .86, .86); }
  for (let i = 0; i < 3; i++) P(mesh(bg, M.blade, 0, 0, 0, 0, 0, i * PI * 2 / 3), { parent: fanRot, d: .56 + i * .07, from: [Math.sin(i * 2.1) * .35, Math.cos(i * 2.1) * .35, .3], spin: [0, 1.5, 1], dur: .55, n: i ? null : 'Pale' });
  P(mesh(G.torus(.278, .01), M.plastic, F.x, F.y, .172), o({ d: .84, from: [0, 0, .5], spin: [0, 0, 2], dur: .55, n: 'Convogliatore' }));
  P(mesh(tubeGeo([[F.x + .045, F.y + .02, -.045], [F.x + .18, F.y + .24, -.08], [XP - .02, .76, -.06], [XP + .02, .79, -.04]], .004, 30), M.plastic), o({ d: .92, n: 'Cablaggio' }));
}

// 5 ─ Circuito del gas R32 ed elettronica: i componenti sono quelli dell'allegato A (p.63) e delle schede di p.21-25; la loro posizione nel vano è ricostruita
group('qref', 'Circuito R32 ed elettronica', 'Il gas R32 gira in un circuito chiuso tra compressore, scambiatore a piastre e batteria. La scheda inverter decide la velocità.', 19.0, 22.0, { stage: [0, 0, 0], ex: [.2, .5, .45],     // al suo posto: arrivando in blocco i tubi passavano dentro compressore e vaso
   az: 28, el: 18, zoom: .9,
  info: { e: 'Il percorso chiuso del gas: gira sempre lo stesso, senza consumarsi. D\'estate il giro si inverte e la casa si raffresca.', s: 'R32, 1,25 kg · ciclo dal manuale 00339595, allegato A: valvola a 4 vie, valvola di espansione elettronica, capillare, due filtri, pressostati di alta e di bassa, sensore di pressione · tre schede: modulo inverter, controllo principale, modulo idraulico · porta Modbus · ingresso per il fotovoltaico' } }).home = qHome;
{
  const q = node(QX, 0, QZ), o = x => Object.assign({ parent: q }, x);
  P(mesh(G.cylX(.014, .09, 20), M.brass, .3, .6, .05), o({ d: 0, spin: [2, 0, 0], n: 'Valvola a 4 vie' }));
  P(mesh(G.cyl(.0075, .028, 12), M.copper, .3, .62, .05), o({ d: .03 }));
  [.27, .3, .33].forEach((x, i) => P(mesh(G.cyl(.0075, .028, 12), M.copper, x, .582, .05), o({ d: .04 + i * .01 })));
  P(mesh(G.rbox(.03, .032, .028, .004), M.blue, .345, .622, .066), o({ d: .08, n: 'Bobina di inversione' }));
  P(mesh(G.cyl(.011, .036, 14), M.brass, .228, .49, -.15), o({ d: .12, n: 'Valvola di espansione elettronica' }));
  P(mesh(G.cyl(.018, .03, 20), M.plastic, .228, .523, -.15), o({ d: .14 }));
  [['a', .008, 'Mandata del gas caldo'], ['b', .008, null], ['c', .006, 'Linea del liquido'], ['d', .006, null], ['e', .008, null], ['f', .008, 'Aspirazione']].forEach(([k, r, n], i) => P(mesh(tubeGeo(QP[k], r, 44), M.copper), o({ d: .18 + i * .05, dur: .5, n })));
  P(mesh(tubeGeo(QP.f.slice(1), .012, 26), M.foam), o({ d: .5, n: 'Isolamento' }));
  P(mesh(G.cylX(.0105, .036, 14), M.copper, .305, .507, -.14, 0, rad(-16), rad(22)), o({ d: .5, n: 'Filtro' })); P(mesh(G.cyl(.0105, .036, 14), M.copper, .22, .4, -.17), o({ d: .51 }));
  PIN(G.torus(.012, .0022), M.copper, [0, 1, 2, 3].map(i => ({ p: [.214, .3 + i * .008, -.181], r: [PI / 2, 0, 0] })), o({ d0: .52, d1: .53, n: 'Capillare' }));
  [[.352, .448, .1, 'Sensore di temperatura di scarico'], [.45, .46, .152, 'Sensore di temperatura di aspirazione'], [.186, .3, -.118, 'Sensore della batteria'], [-.3, .52, -QD / 2 + .012, 'Sensore di temperatura ambiente']].forEach(([x, y, z, n], i) => P(mesh(G.rbox(.012, .022, .012, .003), M.plastic, x, y, z), o({ d: .535 + i * .004, n })));
  P(mesh(G.cyl(.0065, .02, 6), M.brass, .335, .54, .034, PI / 2, 0, 0), o({ d: .552, n: 'Sensore di pressione' })); P(mesh(G.cyl(.0085, .018, 12), M.blue, .335, .54, .05, PI / 2, 0, 0), o({ d: .556 }));
  [[.345, .515, .06, 'Pressostato di alta'], [.38, .5, .14, 'Pressostato di bassa']].forEach(([x, y, z, n], i) => { P(mesh(G.cyl(.0065, .02, 6), M.brass, x, y, z + .012, PI / 2, 0, 0), o({ d: .56 + i * .015, n })); P(mesh(G.cyl(.0085, .018, 12), M.plastic, x, y, z + .028, PI / 2, 0, 0), o({ d: .565 + i * .015 })); });
  // elettronica in alto nel vano tecnico: modulo inverter (con il dissipatore nel flusso d'aria) e scheda di controllo principale; la scheda del modulo idraulico sta dietro il coperchio dei collegamenti
  const ix = .36, iy = .795;
  P(mesh(G.rbox(.29, .008, .3, .003), M.galv, ix, iy, .045), o({ d: .6, n: 'Vassoio dell\'elettronica' }));
  P(mesh(G.box(.26, .003, .155), M.pcb, ix, iy + .007, -.0125), o({ d: .64, from: [0, .3, 0], spin: [0, 1, 0], n: 'Modulo inverter' }));
  P(mesh(G.box(.26, .003, .105), M.pcb, ix, iy + .007, .1275), o({ d: .66, from: [0, .3, 0], spin: [0, 1, 0], n: 'Scheda di controllo principale' }));
  PIN(G.box(.016, .012, .008), M.white, [-.1, -.07, -.04, -.01, .02].map(x => ({ p: [ix + x, iy + .015, .17] })), o({ d0: .67, d1: .68, from: [0, .2, 0], n: 'Connettori dei sensori' }));
  P(mesh(G.box(.003, .17, .15), M.pcb, .5, .64, .03), o({ d: .87, from: [.3, 0, 0], spin: [0, 0, 0], n: 'Scheda del modulo idraulico' }));
  PIN(G.box(.01, .012, .016), M.white, [-.05, -.02, .01, .04].map(z => ({ p: [.494, .7, .03 + z] })).concat([-.04, 0, .04].map(z => ({ p: [.494, .58, .03 + z] }))), o({ d0: .875, d1: .88, from: [-.2, 0, 0], spin: [0, 0, 0] }));
  PIN(G.cyl(.014, .04, 18), M.cap, [[-.09, -.06], [-.05, -.06], [-.09, -.02], [-.05, -.02]].map(a => ({ p: [ix + a[0], iy + .028, .045 + a[1]] })), o({ d0: .68, d1: .72, from: [0, .25, 0], n: 'Condensatori' }));
  P(mesh(G.torus(.022, .01), M.copper, ix + .06, iy + .02, -.02, PI / 2, 0, 0), o({ d: .74, n: 'Induttanza' }));
  P(mesh(G.rbox(.06, .026, .045, .004), M.black, ix + .08, iy + .022, .12), o({ d: .76 }));
  P(mesh(G.box(.012, .09, .13), M.alu, XP - .008, .71, .02), o({ d: .78, n: 'Dissipatore' }));
  PIN(G.box(.05, .08, .003), M.alu, Array.from({ length: 9 }, (_, i) => ({ p: [XP - .04, .71, -.035 + i * .0135] })), o({ d0: .8, d1: .86, from: [-.3, 0, 0], spin: [0, 0, 0], snd: 'fin' }));
  // morsettiera sul fianco destro, sotto il coperchio dei collegamenti
  P(mesh(G.box(.004, .2, .16), M.galv, .526, .6, .03), o({ d: .88, from: [.3, 0, 0], spin: [0, 0, 0], n: 'Morsettiera' }));
  PIN(G.box(.018, .022, .0105), M.term, Array.from({ length: 11 }, (_, i) => ({ p: [.537, .63, -.03 + i * .012] })), o({ d0: .9, d1: .95, from: [.25, 0, 0], spin: [0, 0, 0], snd: 'fin' }));
  [-.03, .03, .09].forEach((z, i) => P(mesh(tubeGeo([[.537, .615, z * .6 + .02], [.545, .5, z], [.552, .4, z]], .004, 16), M.plastic), o({ d: .96 + i * .01, n: i ? null : 'Cavi' })));
}

// 6 ─ Involucro bianco
group('qshell', 'Involucro', 'Pannelli bianchi: griglia tonda del ventilatore, coperchio dei collegamenti sul fianco destro e attacchi acqua sul retro.', 22.0, 25.5, { stage: [0, 0, 0], ex: [0, 0, 0], az: -24, el: 12, zoom: 1,
  info: { e: 'La carrozzeria. Protegge tutto da pioggia e neve e lascia passare l\'aria.', s: 'HP_QOR 70 · 1040 × 865 × 410 mm (523 mm con attacchi e piedi) · 87 kg in esercizio · classe A+++ · 6,50 kW con COP 5,30 (aria 7 °C, acqua 30/35 °C)' } }).home = qHome;
{
  const q = node(QX, 0, QZ), o = x => Object.assign({ parent: q }, x), F0 = { spin: [0, 0, 0], ease: eoc }, F = QFAN, ZF = QD / 2, ZB = -QD / 2, XL = -QW / 2, XR = QW / 2;
  // schiena del vano tecnico con gli attacchi
  P(mesh(G.rbox(XR - XP, QHP, .006, .003), M.sWhite, (XP + XR) / 2, QYC, ZB + .003), o(Object.assign({ d: 0, from: [0, 0, -.6], k: [0, 0, -.8], dur: .6, n: 'Schiena del vano tecnico' }, F0)));
  [[QIN, M.sIn], [QOUT, M.sOut]].forEach(([p, m]) => P(mesh(G.plane(.05, .025), m, p[0] - .06, p[1], ZB - .001, 0, PI, 0), o(Object.assign({ d: .04, from: [0, 0, -.3], k: [0, 0, -.8] }, F0))));
  P(mesh(G.cylZ(.02, .02, 16), M.grey, QPX, .089, ZB - .008), o({ d: .05, from: [0, 0, -.3], k: [0, 0, -.82], n: 'Scarico' }));
  const gb = []; for (let i = 0; i < 20; i++) gb.push({ p: [XL + .02 + i * .034, QYC, ZB + .002] });
  PIN(G.box(.004, QHP, .004), M.sGrid, gb, o({ d0: .07, d1: .17, from: [0, .1, -.5], spin: [0, 0, 0], k: [0, 0, -.8], ease: eoc, n: 'Griglia posteriore', snd: 'fin' }));
  PIN(G.box(XP - XL, .004, .004), M.sGrid, [0, 1, 2, 3].map(i => ({ p: [(XL + XP) / 2, QB + .1 + i * .2, ZB - .001] })), o({ d0: .17, d1: .2, from: [0, 0, -.5], spin: [0, 0, 0], k: [0, 0, -.82], ease: eoc }));
  // fianco sinistro
  const gl = []; for (let i = 0; i < 10; i++) gl.push({ p: [XL + .002, QYC, -.17 + i * .036] });
  PIN(G.box(.004, QHP, .004), M.sGrid, gl, o({ d0: .2, d1: .25, from: [-.5, .1, 0], spin: [0, 0, 0], k: [-.7, 0, 0], ease: eoc, n: 'Griglia laterale', snd: 'fin' }));
  PIN(G.box(.004, .004, QD - .04), M.sGrid, [0, 1, 2, 3].map(i => ({ p: [XL - .001, QB + .1 + i * .2, 0] })), o({ d0: .25, d1: .27, from: [-.5, 0, 0], spin: [0, 0, 0], k: [-.72, 0, 0], ease: eoc }));
  P(mesh(G.rbox(.026, QHP, .026, .004), M.sWhite, XL + .013, QYC, ZF - .013), o(Object.assign({ d: .28, from: [-.3, 0, .3], k: [-.35, 0, .7] }, F0)));
  P(mesh(G.rbox(.026, QHP, .026, .004), M.sWhite, XL + .013, QYC, ZB + .013), o(Object.assign({ d: .29, from: [-.3, 0, -.3], k: [-.35, 0, -.7] }, F0)));
  // fianco destro, coperchio dei collegamenti (65 mm) con tre passacavi, targhetta
  P(mesh(G.rbox(.006, QHP, QD, .003), M.sWhite, XR - .003, QYC, 0), o(Object.assign({ d: .32, from: [.6, 0, 0], k: [.8, 0, 0], dur: .6, n: 'Fianco destro' }, F0)));
  P(mesh(G.rbox(.065, .39, .24, .014), M.sWhite, XR + .0325, .585, .03), o(Object.assign({ d: .36, from: [.6, 0, 0], k: [1.05, 0, 0], dur: .55, n: 'Coperchio dei collegamenti elettrici' }, F0)));
  PIN(G.cyl(.012, .022, 14), M.grey, [-.03, .03, .09].map(z => ({ p: [XR + .0325, .381, z] })), o({ d0: .39, d1: .41, from: [0, -.2, 0], k: [1.05, -.05, 0], n: 'Passacavi' }));
  P(mesh(G.plane(.12, .07), M.sQLabel, XR + .0008, .25, .06, 0, PI / 2, 0), o(Object.assign({ d: .42, from: [.6, 0, 0], k: [.8, 0, 0], n: 'Targhetta' }, F0)));
  screws([[.75, -.07], [.75, .13], [.42, -.07], [.42, .13]].map(a => ({ p: [XR + .066, a[0], a[1]], r: [0, 0, -PI / 2] })), o({ d0: .43, d1: .46, mat: M.sScrew, k: [1.15, 0, 0] }));
  // frontale del ventilatore con il foro, cornice quadrata in rilievo e griglia tonda
  const fs = new THREE.Shape(); fs.moveTo(XL, QB); fs.lineTo(XP, QB); fs.lineTo(XP, QB + QHP); fs.lineTo(XL, QB + QHP); fs.closePath(); const hole = new THREE.Path(); hole.absarc(F.x, F.y, .285, 0, PI * 2, true); fs.holes.push(hole);
  P(mesh(new THREE.ExtrudeGeometry(fs, { depth: .004, bevelEnabled: false, curveSegments: 48 }), M.sWhite, 0, 0, ZF - .004), o(Object.assign({ d: .48, from: [0, 0, .7], k: [0, 0, .9], dur: .65, n: 'Frontale del ventilatore' }, F0)));
  { const a = .325, r = .05, pts = [], cx = F.x, cy = F.y; for (const [sx, sy, a0] of [[1, 1, 0], [-1, 1, PI / 2], [-1, -1, PI], [1, -1, PI * 1.5]]) for (let i = 0; i <= 6; i++) { const t = a0 + i / 6 * PI / 2; pts.push([cx + sx * (a - r) + Math.cos(t) * r, cy + sy * (a - r) + Math.sin(t) * r, ZF + .001]); } pts.push(pts[0]);
    P(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => V(...p)), true, 'catmullrom', .1), 120, .004, 6, true), M.sWhite), o(Object.assign({ d: .52, from: [0, 0, .6], k: [0, 0, .95], n: 'Cornice del ventilatore' }, F0))); }
  for (let i = 0; i < 11; i++) P(mesh(G.torus(.035 + i * .0245, .0022, PI * 2, 56), M.sGrid, F.x, F.y, ZF + .012), o(Object.assign({ d: .55 + i * .012, from: [0, 0, .5], k: [0, 0, 1.0 + i * .008], n: i ? null : 'Griglia tonda', snd: 'tick' }, F0)));
  PIN(G.box(.255, .0045, .0045), M.sGrid, Array.from({ length: 8 }, (_, i) => { const a = i * PI / 4 + PI / 8; return { p: [F.x + Math.cos(a) * .1575, F.y + Math.sin(a) * .1575, ZF + .012], r: [0, 0, a] }; }), o({ d0: .68, d1: .72, from: [0, 0, .5], spin: [0, 0, 1], k: [0, 0, 1.06], ease: eoc, snd: 'fin' }));
  P(mesh(G.cylZ(.034, .008, 28), M.sGrid, F.x, F.y, ZF + .013), o(Object.assign({ d: .73, from: [0, 0, .5], k: [0, 0, 1.08] }, F0)));
  // frontale destro con logo, sei feritoie e "full inverter"
  P(mesh(G.box(XR - XP, QHP, .006), [M.sWhite, M.sWhite, M.sWhite, M.sWhite, M.sQFront, M.sWhite], (XP + XR) / 2, QYC, ZF - .003), o(Object.assign({ d: .76, from: [.15, 0, .7], k: [.1, 0, .9], dur: .65, n: 'Frontale destro' }, F0)));
  screws([[XP + .03, QB + .03], [XR - .03, QB + .03], [XP + .03, QH - .05], [XR - .03, QH - .05]].map(a => ({ p: [a[0], a[1], ZF + .001], r: [PI / 2, 0, 0] })), o({ d0: .8, d1: .84, mat: M.sScrew, k: [.1, 0, 1.0], n: 'Viti del frontale' }));
  // coperchio
  P(mesh(G.rbox(QW + .006, .02, QD + .006, .007), M.sWhite, 0, QH - .01, 0), o(Object.assign({ d: .86, from: [0, .6, 0], k: [0, .75, 0], dur: .7, n: 'Coperchio' }, F0)));
  PIN(G.rbox(.92, .005, .07, .0025), M.sWhite, [-.11, 0, .11].map(z => ({ p: [0, QH + .0015, z] })), o({ d0: .86, d1: .86, dur: .7, from: [0, .6, 0], spin: [0, 0, 0], k: [0, .75, 0], ease: eoc }));
  const ts = [-.42, -.14, .14, .42].map(x => ({ p: [x, QH - .01, ZB - .003], r: [-PI / 2, 0, 0] })).concat([-.1, .1].map(z => ({ p: [XL - .003, QH - .01, z], r: [0, 0, PI / 2] })));
  screws(ts, o({ d0: .93, d1: 1, mat: M.sScrew, k: (i, it) => [it.p[0] * .2, .85, it.p[2] * .4], n: 'Viti del coperchio' }));
}
