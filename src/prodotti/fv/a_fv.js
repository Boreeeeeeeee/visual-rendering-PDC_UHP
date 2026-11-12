// ───────── Fotovoltaico Unical · pagina completa: film di installazione e strumenti ─────────
// Dai documenti (vedi src/dati/fv-*.json):
//  MULTIVOLT 460 BF, scheda 00341524: 1762 x 1134 x 30 mm, 96 mezze celle 6 x 16, 460 W; manuale 00340211SS p.12-14: almeno quattro morsetti per modulo
//  sul lato lungo, lunghi almeno 50 mm, a S = 400 ± 50 mm dai lati corti (metodo C).
//  ZOE1-6000, manuale 00341435: 540 x 450 x 185 mm, staffa a parete con fori a 400 mm, terminali sul lato inferiore nell'ordine di p.22, modalità Autoconsumo di p.14.
//  SUM BL15P, manuale 00341436: tre moduli da 650 x 360 x 180 mm su una base, fissati a parete con staffe a L, porte sul fianco, 4 tacche di carica.
// Su richiesta di Bore (13 novembre 2026) si mostra anche l'interno. Il modulo segue l'elenco dei componenti del suo manuale. Per inverter e batteria i manuali
// nominano solo alcuni componenti: il resto è uno SCHEMA DI PRINCIPIO, dichiarato tale anche nelle schede a schermo, non il progetto Unical.
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
// Involucri che lo strumento "Dentro" rende trasparenti
const COP = std({ color: 0xeef0f1, roughness: .32, metalness: .05, transparent: true, opacity: 1 }), PCB = std({ color: 0x1f6b45, roughness: .6 }), RAME = std({ color: 0xc47a45, roughness: .35, metalness: .9 }), NERO = std({ color: 0x15171a, roughness: .5, metalness: .3 });
const INOX = std({ color: 0xa7adb2, roughness: .3, metalness: .9 }), VETRO = std({ color: 0x7f9fb3, roughness: .05, metalness: 0, transparent: true, opacity: .1, depthWrite: false });
const estruso = (pts, lungo) => { const s = new THREE.Shape(); pts.forEach(([a, b], i) => i ? s.lineTo(a, b) : s.moveTo(a, b)); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: lungo, bevelEnabled: false }); g.translate(0, 0, -lungo / 2); g.rotateY(PI / 2); return g; };   // profilo disegnato in sezione (z, y), estruso lungo x
// pezzi dettagliati fatti di più solidi fusi in un oggetto solo, colorati per vertice: tanto dettaglio, poche chiamate di disegno
const VC = std({ vertexColors: true, roughness: .45, metalness: .25 });
const pez = (g, hex, x = 0, y = 0, z = 0, rx = 0, rz = 0) => { g = g.index ? g.toNonIndexed() : g.clone(); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) c.toArray(a, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
const fuso = (...gs) => mergeGeometries(gs), sei = [0, 1, 2, 3, 4, 5];
// 1 ─ ganci e profili
gruppo('Ganci e profili', 'Prima i ganci, fissati alla struttura del tetto e fatti passare tra le tegole. Poi due profili di alluminio per ogni fila di moduli.', 'Accessori per tetti residenziali · due profili per fila, a 400 mm dai lati corti dei moduli: è lì che il manuale vuole i morsetti (S = 400 ± 50 mm)', 2, 7, { az: -38, el: 26, d: 5.0, x: -1.5, y: 1.0 }, [0, .5, .35]);
const gGancio = estruso([[.1, 0], [.02, 0], [.02, .049], [-.03, .049], [-.03, .055], [.026, .055], [.026, .006], [.1, .006]], .035);
const gProfilo = estruso([[-.02, 0], [.02, 0], [.02, .04], [.007, .04], [.007, .034], [.014, .034], [.014, .006], [-.014, .006], [-.014, .034], [-.007, .034], [-.007, .04], [-.02, .04]], 2.6);
for (const z of ZP) for (const [i, x] of [-1.05, -.35, .35, 1.05].entries()) P(sulTetto(mesh(gGancio, INOX, x, 0, z)), N, i * .1 + (z > 0 ? .3 : 0));
for (const z of ZP) { P(sulTetto(mesh(gProfilo, AL, 0, .055, z)), N, z > 0 ? .85 : .7); for (const x of [-1.302, 1.302]) P(sulTetto(mesh(box(.004, .04, .04), NERO, x, .075, z)), N, .95); }
// 2 ─ moduli: il primo si compone strato per strato, come nell'elenco dei componenti del manuale (§3, Informazioni generali); il secondo arriva già finito
gruppo('Moduli', 'Un modulo è un panino: vetro, pellicola, celle, pellicola, vetro, chiusi in un telaio di alluminio. Sono bifacciali: prendono luce anche da dietro.', 'MULTIVOLT 460 BF · 460 W · 96 mezze celle N-Type 6 × 16 · doppio vetro da 2 mm · 1762 × 1134 × 30 mm · 24,5 kg · scatole di giunzione IP68 con 3 diodi · almeno quattro morsetti per modulo · nella casa sono 14: 6,44 kWp', 7, 15, { az: -34, el: 36, d: 4.2, x: -1.7, y: 1.1 }, [0, 1.05, .7]);
const telaio = std({ color: 0x15171a, roughness: .5, metalness: .6 }), celle = std({ map: tCel, roughness: .2, metalness: .35, side: THREE.DoubleSide }), YM = .11, su = k => N.map(v => v * k);
const gScatola = fuso(pez(box(.07, .014, .05), 0x15171a), pez(cyl(.004, .14, 6), 0x15171a, .1, 0, 0, 0, PI / 2), pez(cyl(.007, .03, 8), 0x2a2d31, .18, 0, 0, 0, PI / 2));     // scatola di giunzione con cavo e connettore
function modulo(XA, r0, k) {      // i due moduli sono identici: stessi strati; il secondo si compone più in fretta
  P(sulTetto(mesh(box(1.114, .002, 1.742), VETRO, XA, YM - .003, 0)), su(1.0), r0, 0);                                    // vetro posteriore
  P(sulTetto(mesh(box(1.10, .0012, 1.73), celle, XA, YM, 0)), su(1.5), r0 + .12 * k, .16);                                 // celle tra due pellicole incapsulanti
  P(sulTetto(mesh(box(1.114, .002, 1.742), VETRO, XA, YM + .003, 0)), su(2.0), r0 + .24 * k, .32);                         // vetro anteriore
  for (const q of [-1, 1]) { P(sulTetto(mesh(box(.012, .03, 1.762), telaio, XA + q * .561, YM, 0)), [q * .5, .1, 0], r0 + .36 * k, .5); P(sulTetto(mesh(box(1.11, .03, .012), telaio, XA, YM, q * .875)), [0, .1 - q * .25, q * .45], r0 + .4 * k, .5); }
  for (const x of [-.3, 0, .3]) P(sulTetto(mesh(gScatola, VC, XA + x, YM - .012, 0)), su(-.5), r0 + .5 * k, .25);         // tre scatole di giunzione sul retro
}
modulo(-.577, 0, 1); modulo(.577, .5, .5);
const morsetto = (x, z, fine) => { const g = new THREE.Group(); g.add(mesh(box(fine ? .03 : .044, .005, .06), AL, fine ? -Math.sign(x) * .008 : 0, .018, 0)); if (fine) g.add(mesh(box(.005, .034, .06), AL, Math.sign(x) * .0075, .002, 0)); g.add(mesh(cyl(.005, .03, 8), INOX, fine ? Math.sign(x) * .0005 : 0, .006, 0)); g.add(mesh(cyl(.008, .006, 6), INOX, fine ? Math.sign(x) * .0005 : 0, .024, 0)); g.position.set(x, YM, z); return sulTetto(g); };
for (const z of ZP) for (const [i, x] of [-1.152, 0, 1.152].entries()) P(morsetto(x, z, x !== 0), N, .8 + i * .05);
// la parete in muratura con inverter e batteria
const ZW = -.55, parete = mesh(box(2.5, 2.6, .1), std({ color: 0x6f6c66, roughness: .95 }), 1.45, 1.3, ZW - .05); root.add(parete);
// 3 ─ inverter. Documentati: staffa, radiatore alettato e modulo di induttanza sul retro, schermo, interruttore CC, ordine dei terminali (p.22), relè interni sulle uscite (p.36), ventola interna (ricerca guasti, p.69).
//     Schema di principio, non il progetto Unical: schede, condensatori, stadio di potenza e loro disposizione.
gruppo('Inverter', 'Trasforma la corrente dei moduli in quella di casa e decide dove mandarla: casa, batteria o rete. Dentro: uno stadio di potenza, i condensatori, le induttanze e una scheda che comanda tutto.', 'ZOE1-6000 · 6 kW · due MPPT, una stringa ciascuno · fino a 9 kW di moduli · IP66 · rendimento massimo 97,8 % · 540 × 450 × 185 mm · 27,5 kg · interno: schema di principio', 15, 24, { az: 20, el: 6, d: 1.55, x: 1.95, y: 1.52 }, [0, 0, .7]);
const IX = 1.95, IY = 1.55, Z0 = ZW + .047, dz = z => [0, 0, z];
P(mesh(box(.46, .1, .012), GR, IX, IY + .12, ZW + .006), dz(1), 0);                                                           // staffa, fori a 400 mm
for (const x of [-.2, .2]) { const v = mesh(cyl(.008, .02, 8), NERO, IX + x, IY + .12, ZW + .016); v.rotation.x = PI / 2; P(v, dz(.8), .06); }
{ const g = new THREE.Group(); g.add(mesh(box(.5, .42, .006), GR, 0, 0, .041)); for (let i = -7; i <= 7; i++) g.add(mesh(box(.005, .40, .026), GR, i * .032, 0, .025)); g.add(mesh(box(.16, .12, .03), NERO, .13, -.12, .024)); g.position.set(IX, IY, ZW); P(g, dz(1.1), .12); }   // radiatore e modulo di induttanza
const I = (g, m, x, y, z, rit) => P(mesh(g, m, IX + x, IY + y, Z0 + z), dz(1.2), rit), ax = o => { o.rotation.x = PI / 2; return o; };
I(fuso(pez(box(.52, .43, .004), 0x8f969b), pez(box(.52, .012, .05), 0x8f969b, 0, .209, .027), pez(box(.52, .012, .05), 0x8f969b, 0, -.209, .027), pez(box(.012, .43, .05), 0x8f969b, .254, 0, .027), pez(box(.012, .43, .05), 0x8f969b, -.254, 0, .027)), VC, 0, 0, .002, .2);   // vasca in alluminio
I(fuso(pez(box(.44, .3, .003), 0x1f6b45), pez(box(.4, .004, .0035), 0xc9a227, 0, -.13, .001), pez(box(.004, .26, .0035), 0xc9a227, -.2, 0, .001), pez(box(.3, .003, .0035), 0xc9a227, .04, .02, .001)), VC, 0, .05, .008, .26);   // scheda di potenza con le piste
const gCond = fuso(pez(cyl(.017, .042, 16), 0x1b1d20), pez(cyl(.0155, .003, 16), 0xcfd3d6, 0, .022, 0), pez(cyl(.0173, .01, 16), 0x7d858c, 0, -.01, 0));
for (let i = 0; i < 8; i++) ax(I(gCond, VC, -.185 + (i % 4) * .04, .16 - (i / 4 | 0) * .04, .032, .3 + i * .008));       // otto condensatori
I(fuso(pez(box(.2, .05, .012), 0xb9bec2), ...sei.map(i => pez(box(.018, .024, .006), 0x15171a, -.08 + i * .032, 0, .009)), ...sei.map(i => pez(box(.012, .008, .002), 0xcfd3d6, -.08 + i * .032, .017, .006))), VC, .09, .15, .016, .4);   // stadio di potenza: sei transistor su una barra di alluminio
const gInd = fuso(pez(new THREE.TorusGeometry(.03, .013, 10, 24), 0xc47a45), pez(cyl(.044, .004, 20), 0x2a2d31, 0, 0, -.015, PI / 2), pez(cyl(.012, .02, 12), 0x3a3f44, 0, 0, 0, PI / 2));
[[.02, .06], [.1, .06], [.18, .06], [.18, -.02]].forEach(([x, y], i) => I(gInd, VC, x, y, .025, .46 + i * .015));           // induttanze
I(fuso(...[0, 1, 2].map(i => pez(box(.03, .034, .018), 0xe2b93b, i * .036, 0, 0)), pez(new THREE.TorusGeometry(.016, .008, 8, 16), 0x3d7a4a, .125, 0, 0)), VC, -.19, .045, .02, .53);   // filtro: condensatori gialli e bobina
I(fuso(...[0, 1, 2, 3].map(i => pez(box(.024, .03, .022), 0x2456a6, i * .03, 0, 0)), ...[0, 1, 2, 3].map(i => pez(box(.02, .012, .001), 0xe9ebec, i * .03, 0, .0116))), VC, .08, -.085, .021, .57);   // relè delle uscite verso rete e BACK-UP
I(fuso(pez(box(.07, .07, .016), 0x15171a), pez(cyl(.031, .017, 20), 0x2a2d31, 0, 0, 0, PI / 2)), VC, -.15, -.045, .018, .61);                                                                             // ventola interna
const pale = I(fuso(pez(cyl(.012, .012, 12), 0x8f969b, 0, 0, 0, PI / 2), ...[0, 1, 2, 3, 4].map(i => { const g = pez(box(.022, .009, .002), 0x8f969b, .018, 0, .004); g.rotateZ(i * PI * 2 / 5); return g; })), VC, -.15, -.045, .024, .62);
I(fuso(pez(box(.045, .055, .05), 0x15171a), pez(cyl(.016, .012, 16), 0xc0392b, 0, 0, .031, PI / 2), pez(box(.006, .026, .004), 0xe9ebec, 0, 0, .039)), VC, -.12, -.16, .03, .65);                         // interruttore CC con la manopola
I(fuso(pez(box(.1, .03, .025), 0x2e8b57), ...[0, 1, 2, 3].map(i => pez(cyl(.005, .004, 8), 0xcfd3d6, -.036 + i * .024, 0, .014, PI / 2))), VC, .15, -.165, .02, .68);                                      // morsettiera delle uscite in alternata
I(fuso(pez(box(.008, .19, .003), 0xc47a45), pez(box(.008, .19, .003), 0xc47a45, .02, 0, 0)), VC, .215, -.03, .014, .7);                                                                                       // barre di rame
I(fuso(pez(box(.17, .11, .003), 0x1d4f7a), pez(box(.03, .03, .004), 0x15171a, -.03, .01, .003), pez(box(.028, .02, .005), 0xcfd3d6, .05, .03, .004), pez(box(.05, .008, .006), 0xe9ebec, 0, -.045, .004)), VC, 0, -.12, .085, .74);   // scheda di controllo
I(pez(box(.04, .07, .001), 0xb9bec2), VC, 0, -.1, .11, .77);                                                                                                                                                  // cavo piatto verso lo schermo
I(fuso(pez(box(.53, .006, .004), 0x0c0c0d, 0, .218, 0), pez(box(.53, .006, .004), 0x0c0c0d, 0, -.218, 0), pez(box(.006, .44, .004), 0x0c0c0d, .262, 0, 0), pez(box(.006, .44, .004), 0x0c0c0d, -.262, 0, 0)), VC, 0, 0, .054, .82);   // guarnizione
{ const g = new THREE.Group();     // terminali sul lato inferiore, da sinistra: batteria +/-, interruttore CC, FV1 e FV2, COM, WiFi, rete, BACK-UP (manuale p.22)
  [[-.22, 0x1b1d20], [-.18, 0xc0392b], [-.12, 0xb3261e], [-.06, 0x1b1d20], [-.02, 0x1b1d20], [.05, 0x30353a], [.1, 0xdfe3e6], [.16, 0x30353a], [.22, 0x30353a]].forEach(([x, c]) => { g.add(mesh(cyl(.012, .028, 12), std({ color: c, roughness: .5 }), x, 0, 0)); g.add(mesh(cyl(.015, .008, 6), GR, x, .012, 0)); });
  g.position.set(IX, IY - .238, Z0 + .07); P(g, [0, -.5, .4], .8); }
{ const g = new THREE.Group(); g.add(mesh(rbox(.54, .45, .138, .022), COP, 0, 0, .069)); g.add(mesh(box(.5, .05, .002), std({ color: 0xcfd3d6, roughness: .5 }), 0, -.19, .139));
  const tL = cv(256, 80, c => drawUnicalLogo(c, 8, 6, 230)); g.add(mesh(new THREE.PlaneGeometry(.15, .047), std({ map: tL, transparent: true, roughness: .5 }), 0, .15, .1395));
  const tD = cv(96, 72, c => { c.fillStyle = '#0d1114'; c.fillRect(0, 0, 96, 72); c.fillStyle = '#7fd0ff'; c.fillRect(10, 10, 76, 30); c.fillStyle = '#0d1114'; c.font = '700 20px sans-serif'; c.fillText('6.0 kW', 16, 32); c.fillStyle = '#4a5158'; for (let i = 0; i < 4; i++) c.fillRect(10 + i * 20, 50, 15, 13); });
  g.add(mesh(new THREE.PlaneGeometry(.11, .083), new THREE.MeshBasicMaterial({ map: tD }), 0, -.1, .1395)); g.position.set(IX, IY, Z0); P(g, [0, .3, 1.3], .88); }
// 4 ─ batteria. Documentati: tre moduli su una base, staffe a L, pannello laterale sopra le porte, interruttore automatico, porte BMS, etichetta con 4 tacche (p.13-14).
//     Ricavato: 16 celle in serie, perché 51,2 V di tensione nominale diviso i 3,2 V di una cella LFP fa 16. Schema di principio: forma e disposizione di celle, barre e scheda.
gruppo('Batteria', 'Tiene da parte l\'energia del giorno per la sera. In ogni modulo: sedici celle al litio-ferro-fosfato in fila, unite da barre di rame, e una scheda che le sorveglia una per una.', 'SUM BL15P · tre moduli LFP da 51,2 V · IP66 · interruttore automatico e porte BMS sul fianco · a pavimento con staffe a parete · interno: schema di principio (16 celle ricavate da 51,2 V)', 24, 33, { az: -18, el: 8, d: 2.3, x: .95, y: .55 }, [-.25, 0, .8]);
const BX = .95, BZ = ZW + .02 + .09, tLed = cv(32, 128, () => {}), ledM = new THREE.MeshBasicMaterial({ map: tLed }), Y1 = .05 + .18;
function tacche(soc) { const k = Math.round(clamp(soc) * 4), c = tLed.image.getContext('2d'); c.fillStyle = '#0d1114'; c.fillRect(0, 0, 32, 128); for (let i = 0; i < 4; i++) { c.fillStyle = i < k ? '#7dff9a' : '#27302b'; c.fillRect(8, 78 - i * 20, 16, 12); } c.fillStyle = '#7fd0ff'; c.beginPath(); c.arc(16, 108, 6, 0, 7); c.fill(); tLed.needsUpdate = true; }
P(mesh(rbox(.65, .05, .18, .01), GR, BX, .025, BZ), dz(1), 0);
const Bm = (g, m, x, y, z, da, rit, liv) => P(mesh(g, m, BX + x, Y1 + y, BZ + z), da, rit, liv), ARA = std({ color: 0xe08a2a, roughness: .6 });
// una cella prismatica: involucro blu con fascia, coperchio, i due poli (alluminio e rame) e la valvola di sfogo
const gCella = fuso(pez(rbox(.034, .236, .12, .004), 0x2f66c9, 0, -.004, 0), pez(box(.0345, .06, .1205), 0xe9ebec, 0, -.03, 0), pez(box(.031, .006, .116), 0x2a2d31, 0, .117, 0), pez(cyl(.008, .008, 12), 0xd9dde0, 0, .124, .036), pez(cyl(.008, .008, 12), 0xc47a45, 0, .124, -.036), pez(box(.012, .002, .022), 0x9aa0a5, 0, .121, 0));
const gBarra = fuso(pez(box(.03, .004, .022), 0xc47a45), pez(cyl(.006, .004, 6), 0xcfd3d6, -.011, .004, 0), pez(cyl(.006, .004, 6), 0xcfd3d6, .011, .004, 0));
const gBms = fuso(pez(box(.5, .05, .003), 0x1f6b45), ...[-.18, -.06, .08].map(x => pez(box(.03, .02, .005), 0x15171a, x, 0, .004)), pez(box(.05, .03, .012), 0xb9bec2, .18, 0, .007), pez(box(.02, .012, .008), 0xe9ebec, -.23, .01, .005), pez(box(.02, .012, .008), 0xe9ebec, .01, -.012, .005));
const gInt = fuso(pez(box(.03, .075, .05), 0x1b1d20), pez(box(.012, .02, .012), 0x3fbf6a, .018, .005, 0), pez(cyl(.011, .03, 12), 0xe67e22, .008, -.07, 0, 0, PI / 2), pez(cyl(.011, .03, 12), 0x1b1d20, .008, -.105, 0, 0, PI / 2), pez(box(.012, .014, .016), 0x8f969b, .012, .06, .012), pez(box(.012, .014, .016), 0x8f969b, .012, .06, -.012));
const etichetta = () => mesh(new THREE.PlaneGeometry(.028, .11), ledM, 0, 0, .0906);
function pacco(k) {      // un modulo batteria: nel primo le celle entrano una per una, negli altri due arrivano in blocco. Dentro sono uguali.
  const y0 = k * .36, r0 = k ? .5 + k * .12 : .06, da = [0, .5, 1.0], m4 = new THREE.Matrix4(), r = d => r0 + (k ? d * .25 : d);
  Bm(box(.62, .33, .006), AL, 0, y0, -.082, dz(1.1), r0, .02);                                                                    // fondo
  if (!k) for (let i = 0; i < 16; i++) Bm(gCella, VC, -.281 + i * .0375, y0 - .03, -.015, da, r(.06 + i * .012), .3).rotation.y = i % 2 ? PI : 0;   // 16 celle, una dritta e una girata
  else { const im = new THREE.InstancedMesh(gCella, VC, 16); for (let i = 0; i < 16; i++) { m4.makeRotationY(i % 2 ? PI : 0).setPosition(-.281 + i * .0375, 0, 0); im.setMatrixAt(i, m4); } im.position.set(BX, Y1 + y0 - .03, BZ - .015); P(im, da, r(.06), .3); }
  for (const q of [-1, 1]) Bm(box(.012, .25, .125), AL, q * .305, y0 - .03, -.015, [q * .5, 0, .6], r(.28), .38);              // piastre di testa
  for (const y of [-.09, .03]) Bm(box(.63, .012, .002), INOX, 0, y0 + y, .046, da, r(.3), .44);                                 // fasce che tengono strette le celle
  { const im = new THREE.InstancedMesh(gBarra, VC, 15); for (let i = 0; i < 15; i++) { m4.makeTranslation(-.262 + i * .0375, 0, i % 2 ? .036 : -.036); im.setMatrixAt(i, m4); } im.position.set(BX, Y1 + y0 + .1, BZ - .015); P(im, [0, .4, .8], r(.34), .52); }   // barre di rame imbullonate
  Bm(box(.56, .002, .012), ARA, 0, y0 + .104, -.015, [0, .4, .8], r(.38), .58);                                                 // cavetto piatto che misura ogni cella
  Bm(gBms, VC, -.04, y0 + .135, .03, [0, .4, .9], r(.42), .66);                                                                  // scheda BMS
  Bm(gInt, VC, .3, y0 + .09, 0, [.6, 0, .4], r(.46), .72);                                                                       // interruttore automatico, connettori BAT+/BAT- e porte
  for (const [q, m] of [[-1, ARA], [1, NERO]]) P(mesh(tubo([V(BX + q * .29, Y1 + y0 + .1, BZ - .05), V(BX + q * .27, Y1 + y0 + .155, BZ - .06), V(BX + .2, Y1 + y0 + .16 - (q > 0 ? .02 : 0), BZ - .055), V(BX + .295, Y1 + y0 + .12, BZ - .02)], .005), m), [0, .4, .8], r(.48), .6);   // cavi di potenza
  const g = new THREE.Group(); g.add(mesh(rbox(.65, .355, .18, .014), COP)); g.add(etichetta()); g.add(mesh(box(.012, .3, .14), std({ color: 0xd3d6d8, roughness: .6 }), .331, 0, 0)); g.position.set(BX, Y1 + y0, BZ); P(g, [0, k ? .6 : .2, 1.3], r(.52), 1);
}
for (let k = 0; k < 3; k++) pacco(k);
for (const x of [-.25, .25]) P(mesh(box(.04, .05, .11), GR, BX + x, 1.13 + .025, ZW + .055), [0, .4, .5], .92);                // staffe a L in cima
// 5 ─ cavi
gruppo('Cavi', 'Due stringhe di moduli scendono all\'inverter, una per ingresso. Un cavo corto lo unisce alla batteria.', 'Due stringhe, una per MPPT · batteria collegata sul fianco, a meno di 3 m dall\'inverter · uscite verso la casa e verso la rete', 33, 37, { az: -6, el: 16, d: 7.4, x: .1, y: 1.0 }, [0, 0, .25]);
const cI = (dx) => V(IX + dx, IY - .26, Z0 + .07), pT = (x, z) => sulTetto(mesh(box(.01, .01, .01), GR, x, .05, z)).position.clone(), zc = ZW + .12;
// le stringhe corrono sotto i moduli fino al bordo della falda, scendono e raggiungono l'inverter lungo il pavimento (percorso generico: qui tetto e parete sono affiancati)
for (const [i, x] of [-.577, .577].entries()) { const z = .2 + i * .08, b = pT(1.38, z), xi = IX - .06 + i * .04; P(cavo('fv', [pT(x, z), b, V(b.x, .03, b.z), V(xi, .03, b.z), V(xi, .03, zc), V(xi, IY - .26, zc)], 0xffd84a), [0, .3, .4], i * .2); }
P(cavo('bat', [cI(-.2), V(IX - .2, Y1 + .02, zc), V(BX + .34, Y1 + .02, zc)], 0x7dff9a), [0, 0, .5], .45);
P(cavo('casa', [cI(.22), V(IX + .22, .9, zc), V(IX + .35, .9, zc)], 0xfff2b0), [0, 0, .5], .6); P(cavo('rete', [cI(.16), V(IX + .16, .5, zc), V(IX + .35, .5, zc)], 0xc49bff), [0, 0, .5], .7);
for (const [y, s] of [[.9, 'Casa'], [.5, 'Rete']]) { const t = cv(128, 64, c => { c.fillStyle = '#2a2f34'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#e9ecee'; c.font = '700 30px sans-serif'; c.textAlign = 'center'; c.fillText(s, 64, 42); }); P(mesh(box(.3, .16, .08), [GR, GR, GR, GR, new THREE.MeshBasicMaterial({ map: t }), GR], IX + .5, y, zc), [.5, 0, .3], .8); }

// ───────── stato e film ─────────
// Flussi secondo la modalità Autoconsumo (manuale ZOE1 p.14): il fotovoltaico alimenta la casa, l'avanzo carica la batteria e poi va in rete;
// senza sole la batteria alimenta la casa fino alla scarica minima del 10%, poi si prende dalla rete. Intensità qualitative, nessun valore a schermo.
const E = { sole: .8, soc: .45, bat: 0, rete: 0 }, CASA = .35, FINE_M = 37, FINE = 45;
const U = { mode: 'start', t: 0, tool: 'tocca', e: 0, eTo: 0, dentro: 0, dentroTo: 0, az: rad(-10), el: rad(14), zoom: 1, auto: true };
function energia(dt) { const av = E.sole - CASA; E.bat = av > 0 ? (E.soc < 1 ? Math.min(av, .5) : 0) : (E.soc > .1 ? Math.max(av, -.5) : 0); E.rete = av - E.bat; E.soc = clamp(E.soc + E.bat * dt * .12, .1, 1); }
const VISTA_F = { az: -8, el: 14, d: 7.8, x: 0, y: 1.2 };
function vistaFilm(t) { let v = G[0].vista; for (const g of G) { const k = sm(g.t0 - .5, g.t0 + .7, t), w = g.vista, o = {}; for (const q in w) o[q] = lerp(v[q], w[q], k); v = o; }
  const k = sm(FINE_M - .3, FINE_M + 1.2, t), o = {}; for (const q in v) o[q] = lerp(v[q], VISTA_F[q], k); return o; }
let stretto = false, ultSoc = -1;
function posa(now, dt) {
  const film = U.mode === 'film', t = film ? U.t : FINE;
  for (const g of G) for (const p of g.pezzi) { const dur = (g.t1 - g.t0) * .42, k = film ? Math.max(1 - sm(1.2, 2.0, t), clamp((t - (g.t0 + p.rit * (g.t1 - g.t0 - dur))) / dur)) : 1;
    p.o.visible = k > 0; p.o.position.copy(p.home).addScaledVector(p.da, 1 - eoc(k)).addScaledVector(g.esp, U.e).addScaledVector(p.dir, (.04 + .46 * p.liv) * U.e); }   // Smonta separa i gruppi e, dentro ogni gruppo, ogni pezzo
  U.dentro = lerp(U.dentro, film ? 0 : U.dentroTo, 1 - Math.exp(-dt * 6)); COP.opacity = lerp(1, .1, U.dentro) * lerp(1, .45, sm(0, .3, U.e)); COP.depthWrite = COP.opacity > .9; pale.rotation.z -= dt * 12 * (E.sole > .02 ? 1 : 0);
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
function setTool(n) { U.tool = n; for (const b of $('tabs').children) b.setAttribute('aria-pressed', b.dataset.tool === n); for (const s of $('panel').children) s.classList.toggle('on', s.dataset.tool === n); U.eTo = n === 'smonta' ? +$('sE').value : 0; U.dentroTo = n === 'dentro' ? 1 : 0; if (n === 'tocca') scheda(-1); }
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
  stato: () => ({ mode: U.mode, tool: U.tool, t: +U.t.toFixed(2), e: +U.e.toFixed(3), dentro: +U.dentro.toFixed(3), sole: E.sole, soc: +E.soc.toFixed(3), bat: +E.bat.toFixed(3), rete: +E.rete.toFixed(3), pezzi: G.reduce((n, g) => n + g.pezzi.length, 0), calls: renderer.info.render.calls }) };
requestAnimationFrame(frame);
