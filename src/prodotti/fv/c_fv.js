// ───────── Fotovoltaico Unical · pezzi e scena (motore della UHP, pagina comune) ─────────
// Dai documenti (vedi src/dati/fv-*.json):
//  MULTIVOLT 460 BF, scheda 00341524: 1762 × 1134 × 30 mm, 96 mezze celle 6 × 16 in due metà, doppio vetro da 2 mm, tre scatole di giunzione IP68 con tre diodi, 460 W;
//  manuale 00340211SS p.12-14: almeno quattro morsetti per modulo sul lato lungo, a S = 400 ± 50 mm dai lati corti (metodo C).
//  ZOE1-6000, manuale 00341435: 540 × 450 × 185 mm (p.22, p.75), staffa con fori a 400 mm (p.35), radiatore alettato e modulo di induttanza sul retro (p.22),
//  terminali sul lato inferiore nell'ordine e alle posizioni del disegno di p.22, pannello di comando con spia, schermo e pulsanti ESC, su, giù, OK (p.22-23),
//  relè sulle uscite (p.36), ventola interna (p.69), modalità Autoconsumo (p.14). Aspetto del modulo: foto della scheda 00341524 (celle quasi nere).
//  SUM BL15P, manuale 00341436: tre moduli da 650 × 360 × 180 mm su una base, staffe a L, porte e interruttore sul fianco sotto un pannello, etichetta con 4 tacche (p.13-14, 19, 34-36).
// SCHEMA DI PRINCIPIO (i manuali di inverter e batteria nominano solo alcuni componenti): schede, condensatori, stadio di potenza, induttanze e loro disposizione;
//  celle della batteria (16 in serie, ricavate da 51,2 V / 3,2 V), barre e scheda BMS. RICOSTRUITO: ganci, profili e morsetti (accessori per tetti residenziali,
//  senza modello), tegole, parete, percorso dei cavi, base della batteria (50 mm), le due targhe "Casa" e "Rete". I moduli in pagina sono due, per vedere il fissaggio da vicino.
const SCENA = {};
const RX0 = -1.5, RY0 = .85, RZ0 = .1, RA = rad(27), ZW = -.55, IX = 1.95, IY = 1.55, Z0 = ZW + .047, BX = .95, BZ = ZW + .11, BY1 = .05 + .18;
const ROOF = new THREE.Matrix4().compose(V(RX0, RY0, RZ0), new THREE.Quaternion().setFromEuler(new THREE.Euler(RA, 0, 0)), V(1, 1, 1));
const tw = (x, y, z) => V(x, y, z).applyMatrix4(ROOF).toArray();                       // dal tetto alla scena
const NRM = [0, .8, .41];                                                                 // i pezzi del tetto arrivano dall'alto, perpendicolari alla falda
const falda = () => { const n = node(RX0, RY0, RZ0); n.rotation.x = RA; return n; };
const ZP = [-.481, .481], YM = .11, XA = [-.577, .577];
// texture e materiali
// celle quasi nere con i fili sottili della tecnologia MBB appena visibili, come nella foto della scheda 00341524 (prima i fili chiari facevano il modulo bianco)
T.cella = cv(64, 64, g => { g.fillStyle = '#0a0e14'; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(120,132,145,.07)'; for (let x = 2; x < 64; x += 4) g.fillRect(x, 0, 1, 64); g.fillStyle = 'rgba(150,160,172,.13)'; [16, 32, 48].forEach(x => g.fillRect(x, 0, 1, 64)); });
T.tegole = rep(cv(64, 64, g => { g.fillStyle = '#7a4a38'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#5e3628'; for (let x = 0; x < 64; x += 16) g.fillRect(x, 0, 2, 64); g.fillRect(0, 0, 64, 4); }), 9, 7);
T.logoW = cv(256, 80, g => { g.clearRect(0, 0, 256, 80); drawUnicalLogo(g, 8, 6, 230); });
T.lcdI = cv(212, 236, () => {}); T.ledB = cv(32, 128, () => {});
T.targaCR = s => cv(128, 64, g => { g.fillStyle = '#2a2f34'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#e9ecee'; g.font = '700 30px Barlow, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(s, 64, 42); });
// parete chiara di intonaco, come nella versione del mattino del 13: inverter e batteria bianchi ci stanno sopra senza sembrare scatole nel buio
T.parete = rep(cv(256, 256, g => { const r = rng(31); g.fillStyle = '#e4e0d8'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 5000; i++) { const v = 200 + r() * 40 | 0; g.fillStyle = `rgba(${v},${v - 3},${v - 9},.45)`; g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3); } }), 4, 4);
Object.assign(M, {
  cella: std({ color: 0xffffff, roughness: .32, metalness: .3, map: T.cella, emissive: 0x1a3c70, emissiveIntensity: 0 }),
  // vetro chiaro e quasi invisibile; quello posteriore un po' scuro: tra una cella e l'altra si vede il tetto in ombra sotto il modulo, non le tegole al sole
  vetro: std({ color: 0x24313a, roughness: .12, metalness: 0, transparent: true, opacity: .1, depthWrite: false }),
  vetroR: std({ color: 0x15191d, roughness: .3, metalness: 0, transparent: true, opacity: .88, depthWrite: false }),
  // la pellicola chiara, anche quasi trasparente, sotto la luce forte velava di grigio tutto il modulo: è scura e appena visibile
  eva: std({ color: 0x3c454c, roughness: .7, metalness: 0, transparent: true, opacity: .05, depthWrite: false }),
  nastro: std({ color: 0x60666b, roughness: .45, metalness: .6 }),
  telaio: std({ color: 0x15171a, roughness: .5, metalness: .6 }),
  allu: std({ color: 0xb9bec2, roughness: .5, metalness: .8 }),
  tegole: std({ color: 0xffffff, roughness: .9, map: T.tegole }),
  sInv: xr(std({ color: 0xdde0e2, roughness: .35, metalness: .05 })), sBat: xr(std({ color: 0xdfe2e4, roughness: .4, metalness: .05 })), sPan: xr(std({ color: 0xc9cdd0, roughness: .6 })),
  logoW: new THREE.MeshBasicMaterial({ map: T.logoW, transparent: true }), lcdI: new THREE.MeshBasicMaterial({ map: T.lcdI, transparent: true }), panI: std({ color: 0x0b0d10, roughness: .14, metalness: .25 }), ledB: new THREE.MeshBasicMaterial({ map: T.ledB }),
  cellaB: std({ color: 0x2f66c9, roughness: .45, metalness: .2, emissive: 0x3fbf6a, emissiveIntensity: 0 }),
  giallo: std({ color: 0xe2b93b, roughness: .5 }), verde: std({ color: 0x2e8b57, roughness: .5 }), arancio: std({ color: 0xe08a2a, roughness: .6 }),
  parete: std({ color: 0x7a766f, roughness: .95, map: T.parete, bumpMap: T.noise, bumpScale: 1 }),
});
ambienteBase(); ambiente(['allu', 'nastro', 'telaio'], AMB_M); ambiente(['vetro', 'vetroR'], .12); ambiente(['cella'], .25); ambiente(['sInv', 'sBat', 'sPan'], AMB_B); ambiente(['panI'], .5);
SOLO.push([M.parete, .3], [M.tegole, .3]);
// scenografia: falda di tegole, parete con inverter e batteria, pavimento
{ const t = mesh(G.box(2.8, .08, 3.0), M.tegole, 0, -.04, 0); t.applyMatrix4(ROOF); scene.add(t);
  scene.add(mesh(G.plane(2.5, 2.6), M.parete, 1.45, 1.3, ZW));
  const sole = mesh(new THREE.CircleGeometry(.28, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.0, 1.1), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), 2.1, 3.4, -1.6); scene.add(sole); SCENA.sole = sole; }   // a destra: sul telefono in verticale a sinistra in alto ci sono le letture

// 1 ─ Ganci e profili
group('tetto', 'Ganci e profili', 'Prima i ganci, avvitati alla struttura del tetto e fatti passare tra le tegole. Poi due profili di alluminio per ogni fila di moduli.', 3.5, 8.0, { stage: [0, 0, 0], ex: [0, .45, .3], zoom: 1, keys: [[.03, -40, 30, .8, 0], [.5, -32, 30, 1.0, 0]],
  info: { e: 'La base di tutto: i ganci reggono i profili, i profili reggono i moduli. Le tegole restano al loro posto.', s: 'Accessori per tetti residenziali · due profili per fila, a 400 mm dai lati corti dei moduli: lì il manuale vuole i morsetti (S = 400 ± 50 mm, manuale 00340211SS p.12-14) · modello di ganci e profili: ricostruito' } });
{
  const r = falda(), o = x => Object.assign({ parent: r }, x);
  const gancio = new THREE.Shape(); [[.1, 0], [.02, 0], [.02, .049], [-.03, .049], [-.03, .055], [.026, .055], [.026, .006], [.1, .006]].forEach(([a, b], i) => i ? gancio.lineTo(a, b) : gancio.moveTo(a, b)); gancio.closePath();
  const gG = new THREE.ExtrudeGeometry(gancio, { depth: .035, bevelEnabled: false }); gG.translate(0, 0, -.0175); gG.rotateY(PI / 2);
  const hooks = []; for (const z of ZP) for (const x of [-1.05, -.35, .35, 1.05]) hooks.push({ p: [x, 0, z] });
  PIN(gG, M.inox, hooks, o({ d0: 0, d1: .35, from: NRM, spin: [0, 0, 0], ease: eoc, n: 'Otto ganci in acciaio inox', snd: 'click' }));
  screws(hooks.flatMap(h => [-.012, .012].map(dx => ({ p: [h.p[0] + dx, .006, h.p[2] - .07] }))), o({ d0: .1, d1: .45, n: 'Viti nelle travi' }));
  const prof = new THREE.Shape(); [[-.02, 0], [.02, 0], [.02, .04], [.007, .04], [.007, .034], [.014, .034], [.014, .006], [-.014, .006], [-.014, .034], [-.007, .034], [-.007, .04], [-.02, .04]].forEach(([a, b], i) => i ? prof.lineTo(a, b) : prof.moveTo(a, b)); prof.closePath();
  const gP = new THREE.ExtrudeGeometry(prof, { depth: 2.6, bevelEnabled: false }); gP.translate(0, 0, -1.3); gP.rotateY(PI / 2);
  ZP.forEach((z, i) => P(mesh(gP, M.allu, 0, .055, z), o({ d: .55 + i * .12, from: [NRM[0], NRM[1], NRM[2] + .3], spin: [0, 0, 0], dur: .6, n: i ? null : 'Profili in alluminio' })));
  PIN(G.box(.004, .04, .04), M.black, ZP.flatMap(z => [-1.302, 1.302].map(x => ({ p: [x, .075, z] }))), o({ d0: .82, d1: .88, from: NRM, n: 'Tappi' }));
  screws(hooks.map(h => ({ p: [h.p[0], .055, h.p[2]] })), o({ d0: .88, d1: .98, n: 'Bulloni gancio-profilo' }));
}

// un modulo intero, uguale per i due: il primo si compone strato per strato, il secondo arriva già finito, tutto insieme
function costruisciModulo(X, finito) {
  const r = falda(), up = k => [NRM[0] * k, NRM[1] * k, NRM[2] * k], F = up(1.4);
  const o = (x, d, n) => Object.assign({ parent: r }, finito ? { d: .02, from: F, spin: [0, 0, 0], ease: eoc, n: n === 0 ? 'Modulo già assemblato' : null } : x);
  const oi = (x, n) => Object.assign({ parent: r }, finito ? { d0: .02, d1: .02, from: F, spin: [0, 0, 0], ease: eoc, n: n === 0 ? 'Modulo già assemblato' : null } : x);
  P(mesh(G.box(1.114, .002, 1.742), M.vetroR, X, YM - .006, 0), o({ d: 0, from: up(1.2), spin: [0, 0, 0], ease: eoc, n: 'Vetro posteriore, 2 mm' }, 0, 0));
  P(mesh(G.box(1.11, .0008, 1.738), M.eva, X, YM - .0045, 0), o({ d: .06, from: up(1.1), spin: [0, 0, 0], ease: eoc, n: 'Pellicola incapsulante' }));
  const cells = []; for (let j = 0; j < 16; j++) for (let i = 0; i < 6; i++) cells.push({ p: [X - .4583 + i * .1833, YM - .0035, -.8325 + j * .1037 + (j > 7 ? .012 : 0)] });
  PIN(G.box(.178, .0012, .1), M.cella, cells, oi({ df: (k, f) => .12 + ((k % 6) * .02 + (k / 6 | 0) * .025), dur: .32, from: up(.7), spin: [0, 0, 0], ease: eoc, n: '96 mezze celle N-Type', snd: 'tick' }));
  const rib = []; for (let h = 0; h < 2; h++) for (let i = 0; i < 6; i++) for (const dx of [-.06, 0, .06]) rib.push({ p: [X - .4583 + i * .1833 + dx, YM - .0027, (h ? 1 : -1) * .43] });
  PIN(G.box(.0025, .0005, .83), M.nastro, rib, oi({ d0: .6, d1: .7, from: up(.5), spin: [0, 0, 0], ease: eoc, n: 'Nastri di collegamento', snd: 'fin' }));
  PIN(G.box(1.08, .0008, .008), M.nastro, [-.865, -.005, .005, .865].map(z => ({ p: [X, YM - .0027, z] })), oi({ d0: .71, d1: .73, from: up(.5), n: 'Barre collettrici' }));
  P(mesh(G.box(1.11, .0008, 1.738), M.eva, X, YM - .0015, 0), o({ d: .75, from: up(1), spin: [0, 0, 0], ease: eoc }));
  P(mesh(G.box(1.114, .002, 1.742), M.vetro, X, YM, 0), o({ d: .78, from: up(1.2), spin: [0, 0, 0], ease: eoc, n: 'Vetro anteriore, 2 mm' }));
  [-1, 1].forEach((q, i) => { P(mesh(G.box(.012, .03, 1.762), M.telaio, X + q * .561, YM - .01, 0), o({ d: .82 + i * .02, from: [q * .4, .1, 0], spin: [0, 0, 0], n: i ? null : 'Telaio in alluminio' }));
    P(mesh(G.box(1.11, .03, .012), M.telaio, X, YM - .01, q * .875), o({ d: .85 + i * .02, from: [0, .1, q * .4], spin: [0, 0, 0] })); });
  // tre scatole di giunzione sul retro, in linea al centro, con i diodi e i cavi
  [-.3, 0, .3].forEach((x, i) => { const bx = X + x, by = YM - .02;
    P(mesh(G.box(.07, .014, .05), M.black, bx, by, 0), o({ d: .88 + i * .02, from: up(-.5), spin: [0, 0, 0], n: i ? null : 'Scatole di giunzione IP68' }));
    if (i === 1) PIN(G.box(.008, .004, .012), M.black, [-.02, 0, .02].map(dx => ({ p: [bx + dx, by - .009, 0] })), oi({ d0: .92, d1: .93, from: up(-.3), n: 'Tre diodi di bypass' }));
    if (i !== 1) { const s = i ? 1 : -1; P(mesh(G.cylX(.003, .1, 6), M.black, bx + s * .085, by, 0), o({ d: .94, from: [s * .2, 0, 0], spin: [0, 0, 0] })); P(mesh(G.cylX(.006, .03, 8), s > 0 ? M.red : M.black, bx + s * .145, by, 0), o({ d: .96, from: [s * .2, 0, 0], spin: [0, 0, 0], n: i === 2 ? 'Connettori' : null })); } });
}
// 2 ─ Un modulo, strato per strato (elenco dei componenti del manuale)
const XM = XA[0];
group('modulo', 'Modulo MULTIVOLT 460 BF', 'Un modulo è un panino: vetro, pellicola, 96 mezze celle, pellicola, vetro, chiusi in un telaio. È bifacciale: prende luce anche da dietro.', 8.0, 14.5, { stage: [0, 0, 0], ex: [0, .5, .9], az: -18, el: 42, zoom: .62,
  keys: [[.03, -34, 40, 1.05, 0], [.3, -22, 50, 1.0, 0], [.55, -30, 44, .95, 0], [.8, -16, 40, 1.0, 0]],
  info: { e: 'Il sole sulle celle muove gli elettroni: nasce una corrente continua. Il doppio vetro protegge le celle e lascia passare la luce anche da dietro.', s: 'MULTIVOLT 460 BF · 460 W · 96 mezze celle N-Type 6 × 16 · doppio vetro da 2 mm · 1762 × 1134 × 30 mm · 24,5 kg · tre scatole di giunzione IP68 con tre diodi · scheda 00341524' } });
{
  costruisciModulo(XM, false);
}

// 3 ─ Secondo modulo e morsetti
group('modulo2', 'Secondo modulo e morsetti', 'Il secondo modulo arriva finito. Quattro morsetti per modulo lo stringono ai profili: due a fine fila, uno in mezzo che ne tiene due.', 14.5, 17.5, { stage: [0, 0, 0], ex: [.0, .7, 1.2], az: -24, el: 34, zoom: 1,
  info: { e: 'I morsetti stringono il telaio sul lato lungo, proprio sopra i profili: così il modulo regge vento e neve senza piegarsi.', s: 'Almeno quattro morsetti per modulo, sul lato lungo, lunghi almeno 50 mm, a 400 ± 50 mm dai lati corti · manuale 00340211SS p.12-14 · nella casa i moduli sono 14: 6,44 kWp' } });
{
  costruisciModulo(XA[1], true);
  const r = falda(), o = x => Object.assign({ parent: r }, x);
  // morsetti: di fine fila (due per profilo) e centrali (uno per profilo), con il bullone a martello
  const fine = [], mid = [];
  for (const z of ZP) { for (const x of [-1.152, 1.152]) fine.push({ p: [x, YM + .006, z], s: [Math.sign(x), 1, 1] }); mid.push({ p: [0, YM + .006, z] }); }
  PIN(G.box(.03, .006, .06), M.allu, fine, o({ d0: .4, d1: .6, from: NRM, spin: [0, 0, 0], n: 'Morsetti di fine fila' }));
  PIN(G.box(.006, .036, .06), M.allu, fine.map(f => ({ p: [f.p[0] + Math.sign(f.p[0]) * .012, YM - .012, f.p[2]] })), o({ d0: .41, d1: .61, from: NRM, spin: [0, 0, 0] }));
  PIN(G.box(.044, .006, .06), M.allu, mid, o({ d0: .65, d1: .72, from: NRM, spin: [0, 0, 0], n: 'Morsetti centrali' }));
  screws(fine.concat(mid).map(f => ({ p: [f.p[0], YM + .009, f.p[2]] })), o({ d0: .78, d1: .98, n: 'Bulloni a martello' }));
}

// 4 ─ Inverter ZOE1-6000 (componenti interni: schema di principio)
group('inverter', 'Inverter ZOE1-6000', 'Trasforma la corrente continua dei moduli in quella alternata di casa e decide dove mandarla: casa, batteria o rete.', 17.5, 25.5, { stage: [0, 0, .9], ex: [.5, .15, .5], az: 18, el: 10, zoom: 1.0, trav: .62,
  keys: [[.03, 24, 14, 1.45, 0], [.25, 12, 8, 1.15, 0], [.5, 28, 16, 1.15, 0], [.72, 8, 6, 1.2, 0]],
  info: { e: 'Il cervello dell\'impianto: segue il punto di massima potenza di ogni stringa, carica la batteria con quello che avanza e manda in rete il resto.', s: 'ZOE1-6000 · 6 kW · due MPPT, una stringa ciascuno · fino a 9 kW di moduli · IP66 · 540 × 450 × 185 mm · 27,5 kg · manuale 00341435 p.14, 22, 35, 36, 69, 75 · interno: schema di principio' } });
{
  const n = node(IX, IY, Z0), o = x => Object.assign({ parent: n }, x), F = { from: [0, 0, .8], spin: [0, 0, 0], ease: eoc };
  P(mesh(G.box(.46, .1, .012), M.grey, 0, .12, -.041), o(Object.assign({ d: 0, n: 'Staffa a parete, fori a 400 mm' }, F)));
  screws([-.2, .2].map(x => ({ p: [x, .12, -.035], r: [PI / 2, 0, 0] })), o({ d0: .03, d1: .05 }));
  P(mesh(G.box(.5, .42, .006), M.alu, 0, 0, -.005), o(Object.assign({ d: .07, n: 'Radiatore' }, F)));
  PIN(G.box(.005, .4, .026), M.alu, Array.from({ length: 15 }, (_, i) => ({ p: [-.224 + i * .032, 0, -.022] })), o({ d0: .09, d1: .15, from: [0, 0, -.4], spin: [0, 0, 0], ease: eoc, n: 'Alette', snd: 'fin' }));
  P(mesh(G.box(.16, .12, .03), M.black, .13, -.12, -.023), o(Object.assign({ d: .16, n: 'Modulo di induttanza, sul retro' }, F)));
  P(mesh(G.box(.52, .43, .004), M.grey, 0, 0, .002), o(Object.assign({ d: .19, n: 'Fondo della cassa' }, F)));
  P(mesh(G.box(.44, .3, .003), M.pcb, 0, .05, .008), o(Object.assign({ d: .23, n: 'Scheda di potenza' }, F)));
  PIN(G.cyl(.017, .042, 16), M.cap, Array.from({ length: 8 }, (_, i) => ({ p: [-.185 + (i % 4) * .04, .16 - (i / 4 | 0) * .045, .032], r: [PI / 2, 0, 0] })), o({ d0: .27, d1: .33, from: [0, 0, .5], spin: [0, 0, 0], n: 'Condensatori del bus in continua', snd: 'tick' }));
  PIN(G.box(.018, .024, .006), M.black, Array.from({ length: 6 }, (_, i) => ({ p: [.01 + i * .032, .15, .018] })), o({ d0: .35, d1: .4, from: [0, 0, .4], spin: [0, 0, 0], n: 'Stadio di potenza: sei interruttori', snd: 'tick' }));
  PIN(G.torus(.03, .013, PI * 2, 24), M.copper, [[.02, .06], [.1, .06], [.18, .06], [.18, -.02]].map(([x, y]) => ({ p: [x, y, .025] })), o({ d0: .42, d1: .48, from: [0, 0, .5], spin: [0, 0, 3], n: 'Induttanze' }));
  PIN(G.box(.03, .034, .018), M.giallo, [0, 1, 2].map(i => ({ p: [-.19 + i * .036, .045, .02] })), o({ d0: .5, d1: .52, n: 'Filtro di uscita' }));
  PIN(G.box(.024, .03, .022), M.blue, [0, 1, 2, 3].map(i => ({ p: [.08 + i * .03, -.085, .021] })), o({ d0: .55, d1: .58, n: 'Relè delle uscite verso rete e BACK-UP' }));
  P(mesh(G.box(.07, .07, .016), M.black, -.15, -.045, .018), o({ d: .6, n: 'Ventola interna' }));
  const ventola = new THREE.Group(); ventola.position.set(-.15, -.045, .028); n.add(ventola);
  PIN(G.box(.022, .009, .002), M.grey, [0, 1, 2, 3, 4].map(i => ({ p: [Math.cos(i * PI * 2 / 5) * .016, Math.sin(i * PI * 2 / 5) * .016, 0], r: [0, 0, i * PI * 2 / 5] })), { parent: ventola, d0: .62, d1: .64, from: [0, 0, .3], spin: [0, 0, 4] });
  P(mesh(G.box(.045, .05, .05), M.black, -.11, -.195, .06), o({ d: .66, n: 'Interruttore CC' }));
  P(mesh(G.box(.1, .03, .025), M.verde, .15, -.165, .02), o({ d: .69, n: 'Morsettiera in alternata' }));
  PIN(G.box(.008, .19, .003), M.copper, [.215, .235].map(x => ({ p: [x, -.03, .014] })), o({ d0: .71, d1: .72, n: 'Barre di rame' }));
  P(mesh(G.box(.17, .11, .003), M.pcb, 0, -.12, .085), o({ d: .74, from: [0, 0, .5], spin: [0, 0, 0], n: 'Scheda di controllo' }));
  P(mesh(G.box(.04, .07, .001), M.allu, 0, -.1, .11), o({ d: .76 }));
  // terminali sul lato inferiore, nell'ordine e alle posizioni del disegno di p.22: BAT+ e BAT-, manopola dell'interruttore CC, FV1 e FV2, COM, WiFi, rete (ON-GRID), BACKUP
  const TY = -.238, TZ = .07;
  PIN(G.rbox(.03, .028, .03, .004), M.black, [-.207, -.164].map(x => ({ p: [x, TY, TZ] })), o({ d0: .76, d1: .77, from: [0, -.4, 0], spin: [0, 0, 0], ease: eoc, n: 'Terminali della batteria, BAT+ e BAT-', snd: 'click' }));
  P(mesh(G.cyl(.022, .014, 20), M.black, -.096, TY + .003, TZ), o({ d: .78, from: [0, -.3, 0], spin: [0, 4, 0], ease: eoc, n: 'Manopola dell\'interruttore CC', snd: 'screw' }));
  P(mesh(G.box(.038, .01, .008), M.grey, -.096, TY - .009, TZ), o({ d: .79, from: [0, -.3, 0], spin: [0, 4, 0], ease: eoc }));
  PIN(G.cyl(.009, .03, 12), M.black, [-.039, -.0125].flatMap(x => [TZ - .015, TZ + .015].map(z => ({ p: [x, TY, z] }))), o({ d0: .8, d1: .82, from: [0, -.4, 0], spin: [0, 3, 0], ease: eoc, n: 'Ingressi FV1 e FV2', snd: 'screw' }));
  P(mesh(G.rbox(.028, .026, .034, .004), M.black, .032, TY, TZ), o({ d: .83, from: [0, -.3, 0], spin: [0, 0, 0], ease: eoc, n: 'Porta COM' }));
  PIN(G.cyl(.014, .03, 16), M.black, [.084, .138, .19].map(x => ({ p: [x, TY, TZ] })), o({ d0: .84, d1: .86, from: [0, -.4, 0], spin: [0, 3, 0], ease: eoc, n: 'WiFi, rete (ON-GRID) e BACKUP', snd: 'screw' }));
  P(mesh(G.rbox(.54, .45, .138, .022), M.sInv, 0, 0, .069), o({ d: .88, from: [0, .2, 1.1], spin: [0, 0, 0], ease: eoc, dur: .6, n: 'Coperchio' }));
  P(mesh(G.plane(.15, .047), M.logoW, 0, .15, .1395), o({ d: .92, from: [0, 0, .5], spin: [0, 0, 0] }));
  // pannello di comando (p.22-23): riquadro nero lucido dagli angoli molto arrotondati, con la spia in alto, lo schermo e i pulsanti ESC, su, giù, OK
  const sq = new THREE.Shape(), qw = .056, qh = .0625, qr = .028;
  sq.moveTo(-qw + qr, -qh); sq.lineTo(qw - qr, -qh); sq.quadraticCurveTo(qw, -qh, qw, -qh + qr); sq.lineTo(qw, qh - qr); sq.quadraticCurveTo(qw, qh, qw - qr, qh); sq.lineTo(-qw + qr, qh); sq.quadraticCurveTo(-qw, qh, -qw, qh - qr); sq.lineTo(-qw, -qh + qr); sq.quadraticCurveTo(-qw, -qh, -qw + qr, -qh);
  P(mesh(new THREE.ExtrudeGeometry(sq, { depth: .003, bevelEnabled: true, bevelThickness: .0015, bevelSize: .0015, bevelSegments: 2, curveSegments: 10 }), M.panI, 0, -.102, .1375), o({ d: .93, from: [0, 0, .4], spin: [0, 0, 0], ease: eoc, n: 'Pannello di comando: spia, schermo, quattro pulsanti' }));
  P(mesh(G.plane(.106, .118), M.lcdI, 0, -.102, .1427), o({ d: .96, from: [0, 0, .3], spin: [0, 0, 0], ease: eoc }));
  SCENA.ventola = ventola;
}

// 5 ─ Batteria SUM BL15P (celle, barre e BMS: schema di principio)
group('batteria', 'Batteria SUM BL15P', 'Tre moduli impilati. In ognuno sedici celle al litio-ferro-fosfato in fila, unite da barre di rame, e una scheda che le sorveglia una per una.', 25.5, 33.0, { stage: [0, 0, .9], ex: [-.4, .1, .6], az: -16, el: 12, zoom: .8, trav: .62,
  keys: [[.03, -22, 16, 1.0, 0], [.22, -6, 18, .55, -.25], [.45, -24, 14, .62, -.2], [.7, -10, 10, .9, 0], [.92, -18, 12, 1.0, 0]],
  info: { e: 'Tiene da parte l\'energia del giorno per la sera. Quando il sole cala, la casa va avanti con la batteria prima di chiedere alla rete.', s: 'SUM BL15P · tre moduli LFP da 51,2 V · 650 × 360 × 180 mm l\'uno · IP66 · interruttore e porte sul fianco · staffe a L a parete · manuale 00341436 p.13-14, 19, 34-36 · celle, barre e BMS: schema di principio (16 celle ricavate da 51,2 V)' } });
{
  const n = node(BX, 0, BZ), o = x => Object.assign({ parent: n }, x);
  P(mesh(G.rbox(.65, .05, .18, .01), M.grey, 0, .025, 0), o({ d: 0, from: [0, 0, .8], spin: [0, 0, 0], n: 'Base' }));
  for (let k = 0; k < 3; k++) {
    const y0 = BY1 + k * .36, d0 = .04 + k * .3, sp = k ? .1 : .16, cs = [];
    P(mesh(G.box(.62, .33, .006), M.allu, 0, y0, -.082), o({ d: d0, from: [0, 0, .9], spin: [0, 0, 0], n: k ? null : 'Fondo del modulo' }));
    for (let i = 0; i < 16; i++) cs.push({ p: [-.281 + i * .0375, y0 - .03, -.015] });
    PIN(G.rbox(.034, .236, .12, .004), M.cellaB, cs, o({ d0: d0 + .02, d1: d0 + sp, dur: .3, from: [0, .5, .6], spin: [0, 0, 0], ease: eoc, n: k ? null : 'Sedici celle LFP', snd: 'tick' }));
    PIN(G.box(.012, .25, .125), M.allu, [-1, 1].map(q => ({ p: [q * .305, y0 - .03, -.015] })), o({ d0: d0 + sp + .01, d1: d0 + sp + .02, from: [0, 0, .6], spin: [0, 0, 0], n: k ? null : 'Piastre di testa' }));
    PIN(G.box(.03, .004, .022), M.copper, Array.from({ length: 15 }, (_, i) => ({ p: [-.262 + i * .0375, y0 + .092, i % 2 ? .021 : -.051] })), o({ d0: d0 + sp + .03, d1: d0 + sp + .07, from: [0, .3, .4], spin: [0, 0, 0], n: k ? null : 'Barre di rame', snd: 'fin' }));
    P(mesh(G.box(.56, .002, .012), M.arancio, 0, y0 + .097, -.015), o({ d: d0 + sp + .08, n: k ? null : 'Cavetto che misura ogni cella' }));
    P(mesh(G.box(.5, .05, .003), M.pcb, -.04, y0 + .135, .03), o({ d: d0 + sp + .1, from: [0, .3, .5], spin: [0, 0, 0], n: k ? null : 'Scheda BMS' }));
    P(mesh(G.box(.03, .075, .05), M.black, .3, y0 + .09, 0), o({ d: d0 + sp + .11, n: k ? null : 'Interruttore automatico e porte' }));
    P(mesh(G.rbox(.65, .355, .18, .014), M.sBat, 0, y0, 0), o({ d: d0 + sp + .14, from: [0, .2, 1.0], spin: [0, 0, 0], ease: eoc, dur: .55, n: k ? null : 'Involucro' }));
    P(mesh(G.plane(.028, .11), M.ledB, 0, y0, .0906), o({ d: d0 + sp + .16, from: [0, 0, .4], spin: [0, 0, 0], n: k ? null : 'Etichetta con 4 tacche di carica' }));
    P(mesh(G.box(.012, .3, .14), M.sPan, .331, y0, 0), o({ d: d0 + sp + .18, from: [.4, 0, 0], spin: [0, 0, 0], n: k ? null : 'Pannello laterale' }));
  }
  PIN(G.box(.04, .05, .11), M.grey, [-.25, .25].map(x => ({ p: [x, 1.13 + .025, -.055] })), o({ d0: .96, d1: .98, from: [0, .4, .3], n: 'Staffe a L' }));
}

// 6 ─ Cavi (percorso indicativo: qui tetto e parete sono affiancati)
const zc = ZW + .12, cI = dx => [IX + dx, IY - .26, Z0 + .07];
// stringa: dal connettore rosso della scatola di destra giù sotto il modulo, poi tra il tetto e i moduli (sotto i telai) fino oltre il bordo della falda,
// e solo lì giù verso l'inverter (prima scendeva dritta attraverso la falda e sfiorava il telaio del modulo di sinistra)
const stringa = (X, z, xi) => { const e = tw(1.47, .06, z);
  return [tw(X + .46, YM - .02, 0), tw(X + .53, YM - .02, 0), tw(X + .53, .06, 0), tw(X + .53, .06, z), e, [e[0], .03, e[2]], [xi, .03, e[2]], [xi, .03, zc], [xi, IY - .26, zc]]; };
const CV = {
  s1: stringa(XA[0], .25, IX - .039), s2: stringa(XA[1], .33, IX - .0125),
  bat: [cI(-.185), [IX - .185, BY1 + .02, zc], [BX + .34, BY1 + .02, zc]],
  casa: [cI(.19), [IX + .19, .9, zc], [IX + .35, .9, zc]], rete: [cI(.138), [IX + .138, .5, zc], [IX + .35, .5, zc]],
  dentro: [[IX - .04, IY - .2, Z0 + .03], [IX - .1, IY - .05, Z0 + .03], [IX - .15, IY + .16, Z0 + .035], [IX + .05, IY + .15, Z0 + .03], [IX + .1, IY + .06, Z0 + .03], [IX + .18, IY - .02, Z0 + .03], [IX + .19, IY - .17, Z0 + .03], [IX + .19, IY - .23, Z0 + .07]],
};
for (const k in CV) PIPE[k] = CV[k];
group('cavi', 'Cavi', 'Due stringhe di moduli scendono all\'inverter, una per ingresso. Un cavo corto lo unisce alla batteria; due uscite vanno alla casa e alla rete.', 33.0, 36.5, { stage: [0, 0, 0], ex: [0, 0, .3], zoom: 1, keys: [[.03, -10, 16, 1.6, 0], [.5, -2, 14, 1.6, 0]],
  info: { e: 'Le strade dell\'energia: dal tetto all\'inverter in continua, dall\'inverter alla casa e alla rete in alternata, avanti e indietro con la batteria.', s: 'Due stringhe, una per MPPT · batteria sul fianco, a meno di 3 m dall\'inverter · uscite verso la casa e verso la rete · manuale 00341435 p.22 · percorso dei cavi: indicativo' } });
{
  [['s1', M.black, 'Stringa 1, verso FV1'], ['s2', M.black, 'Stringa 2, verso FV2'], ['bat', M.arancio, 'Cavo della batteria'], ['casa', M.grey, 'Uscita verso la casa'], ['rete', M.grey, 'Uscita verso la rete']].forEach(([k, m, n], i) => P(mesh(tubeGeo(CV[k], .011, CV[k].length * 16), m), { d: i * .15, dur: .55, from: [0, .3, .3], spin: [0, 0, 0], n }));
  [[.9, 'Casa'], [.5, 'Rete']].forEach(([y, s], i) => P(mesh(G.box(.3, .16, .06), [M.grey, M.grey, M.grey, M.grey, new THREE.MeshBasicMaterial({ map: T.targaCR(s) }), M.grey], IX + .5, y, zc), { d: .8 + i * .08, from: [.4, 0, .3], spin: [0, 0, 0], n: i ? null : 'Casa e rete (targhe)' }));
}
finalize();
// faccia del pannello di comando (p.23): spia verde fissa in funzione, schermo con lo stato (parole, nessun numero), pulsanti ESC, su, giù, OK
function lcdInv(txt) { const c = T.lcdI.image.getContext('2d'); c.clearRect(0, 0, 212, 236);
  c.strokeStyle = '#59f08a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(80, 28); c.quadraticCurveTo(106, 18, 132, 28); c.stroke();
  c.fillStyle = '#17232d'; c.fillRect(38, 60, 136, 92); c.fillStyle = '#8fd8ff'; c.font = '700 28px Barlow, Arial, sans-serif'; c.textAlign = 'center'; c.fillText(txt, 106, 116);
  c.strokeStyle = '#b9bfc4'; c.lineWidth = 3; c.fillStyle = '#b9bfc4'; c.font = '700 12px Barlow, Arial, sans-serif';
  ['ESC', 'su', 'giu', 'OK'].forEach((k, i) => { const x = 30 + i * 40, y = 182; c.beginPath(); c.roundRect(x, y, 32, 28, 8); c.stroke();
    if (k === 'su' || k === 'giu') { const d = k === 'su' ? -1 : 1; c.beginPath(); c.moveTo(x + 9, y + 14 - d * 4); c.lineTo(x + 16, y + 14 + d * 4); c.lineTo(x + 23, y + 14 - d * 4); c.stroke(); } else c.fillText(k, x + 16, y + 18); });
  T.lcdI.needsUpdate = true; }
function tacche(soc) { const k = Math.round(clamp(soc) * 4), c = T.ledB.image.getContext('2d'); c.fillStyle = '#0d1114'; c.fillRect(0, 0, 32, 128); for (let i = 0; i < 4; i++) { c.fillStyle = i < k ? '#7dff9a' : '#27302b'; c.fillRect(8, 78 - i * 20, 16, 12); } c.fillStyle = '#7fd0ff'; c.beginPath(); c.arc(16, 104, 5, 0, 7); c.fill(); T.ledB.needsUpdate = true; }
