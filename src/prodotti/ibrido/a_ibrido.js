// ───────── Ibrido HYBREER 3 · pagina completa: film di montaggio e strumenti ─────────
// Composizione scelta da Bore (13 novembre 2026): HYBREER 3 KON 24 HPQ 70/90 = HP_QOR 70 + KONm 24 C + kit HYBREER (vedi src/dati/ibrido.json).
// Dai documenti:
//  HP_QOR 70, depliant Sistemi ibridi 06-2026 p.28-29: 1040 x 865 x 410 mm, piedi a interasse 656 mm, scatola collegamenti di 65 mm sul fianco destro, attacchi acqua G1"
//   sul retro (89 + 279 e + 165 mm da terra); componenti: compressore twin rotary, ventilatore brushless, scambiatore a piastre inox, batteria rame-alluminio,
//   kit idronico (valvola di sicurezza 3 bar, sfogo aria, circolatore inverter, flussostato, vaso di espansione 5 l, filtro).
//  KONm 24 C, depliant p.30-31: 700 x 420 x 345 mm; scambiatore primario Al/Si/Mg ultrapiatto, bruciatore premiscelato modulante, scambiatore sanitario a 12 piastre,
//   circolatore modulante, vaso di espansione 8 l; attacchi sotto C, F, G, R, M (manuale HYBREER 00339200 p.14).
//  Kit HYBREER, manuale 00339200 p.3-4 e 14: cofano 380 x 380 x 181, collettore 00376907 (passo 25,5 / 75 / 86,5 / 75 / 25,5 mm, sotto 236,4 mm), valvole di non ritorno
//   su M pdc e M Cal, staffa, kit relè 00378689, sonda T1 00470021 sulla mandata della pompa di calore. Logica sulla temperatura esterna: p.19.
// SCHEMA DI PRINCIPIO: la disposizione interna di HP_QOR e KONm (i documenti nominano i componenti, non dove stanno).
// RICOSTRUITO: ventilatore del bruciatore, valvola gas, valvola a tre vie e sifone della caldaia; parete, pavimento radiante, percorso di tubi, gas e scarico fumi.
const VC = std({ vertexColors: true, roughness: .45, metalness: .25 });
const pez = (g, hex, x = 0, y = 0, z = 0, rx = 0, rz = 0) => { g = g.index ? g.toNonIndexed() : g.clone(); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) c.toArray(a, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
const fuso = (...gs) => mergeGeometries(gs);
// involucri che lo strumento "Dentro" rende trasparenti
const COPERTI = [], cop = m => { m.transparent = true; m.userData.o = 1; COPERTI.push(m); return m; };
const BI = cop(std({ color: 0xeceeef, roughness: .4, metalness: .05 })), GR = std({ color: 0x9aa0a5, roughness: .5, metalness: .4 }), NERO = std({ color: 0x15171a, roughness: .5, metalness: .3 });
const OTT = std({ color: 0xb08a3c, roughness: .35, metalness: .8 }), INOX = std({ color: 0xb4babf, roughness: .28, metalness: .9 }), RAME = std({ color: 0xc47a45, roughness: .35, metalness: .9 });
const tFlow = cv(64, 8, (c) => { const g = c.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, '#777'); g.addColorStop(.5, '#fff'); g.addColorStop(.62, '#777'); g.addColorStop(1, '#777'); c.fillStyle = g; c.fillRect(0, 0, 64, 8); });
const FLUSSI = {};
function condotto(nome, pts, col, r = .016) { const c = new THREE.CurvePath(); for (let i = 1; i < pts.length; i++) c.add(new THREE.LineCurve3(pts[i - 1], pts[i])); const tx = tFlow.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(Math.max(1, c.getLength() / .22), 1); tx.needsUpdate = true;
  const m = new THREE.MeshBasicMaterial({ map: tx, color: 0x6a7076 }); (FLUSSI[nome] = FLUSSI[nome] || []).push({ m, tx, col: new THREE.Color(col) }); return mesh(new THREE.TubeGeometry(c, Math.round(c.getLength() * 16) + 4, r, 8), m); }

// la scena: pavimento, una parete in muratura con caldaia e kit, la pompa di calore davanti a sinistra
const ZW = -.5, KX = .95, QX = -1.1, QZ = .3;
root.add(mesh(box(2.0, 2.6, .1), std({ color: 0x6f6c66, roughness: .95 }), KX, 1.3, ZW - .05));
const L = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const ax = (o, a) => { if (a === 'x') o.rotation.z = PI / 2; else if (a === 'z') o.rotation.x = PI / 2; return o; };

// 1 ─ pompa di calore HP_QOR 70: coordinate locali con l'origine a terra al centro, frontale verso +z
gruppo('Pompa di calore', 'Prende il calore dall\'aria di fuori, anche d\'inverno, e lo passa all\'acqua dell\'impianto. Dentro: compressore, ventilatore, batteria alettata e uno scambiatore a piastre.',
  'HP_QOR 70 · R32, 1,25 kg · 6,50 kW con COP 5,30 (aria 7 °C, acqua 30/35 °C) · mandata fino a 65 °C · lavora fino a −25 °C · 1040 × 865 × 410 mm · 87 kg · interno: schema di principio',
  2, 15, { az: -28, el: 16, d: 3.1, x: QX, y: .5 }, [-.6, 0, .5]);
const q = (o, x, y, z) => L(o, QX + x, y, QZ + z), QW = 1.04, QH = .865, QD = .41, XF = -.235, YF = .455, RF = .215;
for (const x of [-.52 + .191, -.52 + .191 + .656]) P(q(mesh(box(.07, .045, .458), GR), x, .0225, 0), [0, -.3, 0], x > 0 ? .04 : 0, 0);                       // piedi, interasse 656 mm
P(q(mesh(box(QW - .01, .02, QD - .01), GR), 0, .055, 0), [0, -.5, 0], .07, .05);                                                                            // basamento
const tFin = cv(128, 128, (c, w, h) => { c.fillStyle = '#7a8085'; c.fillRect(0, 0, w, h); c.fillStyle = '#41474c'; for (let x = 0; x < w; x += 5) c.fillRect(x, 0, 2, h); c.fillStyle = '#b07a4a'; for (let y = 8; y < h; y += 16) c.fillRect(0, y, w, 2); }); tFin.wrapS = tFin.wrapT = THREE.RepeatWrapping; tFin.repeat.set(5, 6);
const FIN = std({ map: tFin, roughness: .55, metalness: .5 });
P(q(mesh(box(.64, .74, .03), FIN), -.19, .45, -.185), [0, 0, -.7], .14, .2); P(q(mesh(box(.03, .74, .36), FIN), -.5, .45, 0), [-.7, 0, 0], .2, .2);               // batteria alettata a L, dietro e a sinistra
for (const [x, z] of [[.12, -.185], [.12, -.165]]) P(q(mesh(cyl(.008, .7, 8), RAME), x, .45, z), [0, 0, -.6], .24, .3);                                     // collettori della batteria
P(q(mesh(box(.04, .72, .03), GR), XF, .46, -.1), [0, .6, 0], .28, .35); P(q(ax(mesh(cyl(.06, .09, 20), NERO), 'z'), XF, YF, -.05), [0, .5, .3], .32, .4);      // supporto e motore brushless del ventilatore
const pala = new THREE.Shape(); pala.moveTo(.03, -.02); pala.quadraticCurveTo(.12, -.1, RF - .01, -.012); pala.quadraticCurveTo(.15, .085, .03, .03); pala.closePath();
const ventola = q(new THREE.Group(), XF, YF, .03); { const pg = new THREE.ShapeGeometry(pala, 8); for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(pg, std({ color: 0x2b3035, roughness: .55, side: THREE.DoubleSide })); b.rotation.z = i * PI * 2 / 3; ventola.add(b); } ventola.add(ax(mesh(cyl(.035, .05, 16), NERO), 'z')); }
P(ventola, [0, 0, .7], .38, .5);
P(q(mesh(box(.01, .78, .38), GR), .07, .46, 0), [0, .7, 0], .44, .4);                                                                                       // divisorio tra ventilatore e compressore
P(q(mesh(fuso(pez(cyl(.072, .25, 24), 0x2a2d31), pez(cyl(.074, .02, 24), 0x1b1d20, 0, .1, 0), pez(cyl(.074, .02, 24), 0x1b1d20, 0, -.1, 0), pez(cyl(.03, .19, 14), 0x3a3f44, .11, .0, -.02), pez(box(.06, .03, .05), 0x15171a, 0, .14, .04)), VC), .25, .2, -.05), [0, .7, .2], .5, .6);   // compressore twin rotary con separatore di liquido
const SP = fuso(pez(box(.11, .2, .055), 0x9da4a9), ...[...Array(10)].map((_, i) => pez(box(.112, .003, .057), 0x6f767b, 0, -.09 + i * .02, 0)), ...[[-.035, .085], [.035, .085], [-.035, -.085], [.035, -.085]].map(([x, y]) => pez(cyl(.009, .03, 10), 0xb08a3c, x, y, .04, PI / 2)));
P(q(mesh(SP, VC), .33, .52, -.12), [.5, .3, 0], .58, .65);                                                                                                  // scambiatore a piastre inox
P(q(mesh(tubo([V(.25, .33, -.03), V(.25, .44, .0), V(.33, .45, -.08), V(.33, .41, -.12)], .007), RAME), 0, 0, 0), [0, .4, .3], .64, .7);                     // linee del refrigerante
P(q(mesh(tubo([V(.11, .17, -.07), V(.15, .3, -.15), V(.12, .55, -.17)], .007), RAME), 0, 0, 0), [0, .4, .3], .66, .7);
P(q(mesh(fuso(pez(cyl(.04, .07, 18), 0x2456a6, 0, 0, 0, PI / 2), pez(cyl(.03, .05, 16), 0x1b1d20, 0, 0, -.06, PI / 2), pez(box(.05, .05, .03), 0x15171a, 0, .045, .0)), VC), .42, .3, -.1), [.5, 0, .2], .7, .75);   // circolatore inverter
P(q(mesh(fuso(pez(cyl(.095, .06, 28), 0xc0392b, 0, 0, 0, PI / 2), pez(cyl(.012, .02, 10), 0xb08a3c, 0, 0, .04, PI / 2)), VC), .3, .74, -.05), [0, .5, .3], .74, .8);       // vaso di espansione 5 litri
P(q(mesh(fuso(pez(cyl(.011, .05, 10), 0xb08a3c), pez(cyl(.016, .016, 12), 0xc0392b, 0, .03, 0)), VC), .45, .62, -.13), [.4, .3, 0], .78, .85);                              // valvola di sicurezza 3 bar
P(q(mesh(fuso(pez(cyl(.01, .04, 10), 0xb08a3c), pez(cyl(.014, .012, 12), 0xb08a3c, 0, .025, 0)), VC), .33, .64, -.12), [0, .4, 0], .8, .85);                             // valvola di sfogo aria
P(q(mesh(fuso(pez(box(.03, .03, .03), 0x15171a), pez(cyl(.01, .05, 10), 0xb08a3c, 0, 0, 0, 0, PI / 2)), VC), .4, .44, -.17), [.4, 0, 0], .82, .85);                        // flussostato
P(q(mesh(fuso(pez(cyl(.014, .07, 12), 0xb08a3c, 0, 0, 0, PI / 2), pez(cyl(.012, .05, 12), 0xb08a3c, 0, -.02, .0, .6)), VC), .4, .533, -.19), [.4, 0, -.3], .84, .85);     // filtro sull'ingresso dell'acqua
P(q(mesh(tubo([V(.4, .368, -.2), V(.4, .4, -.15), V(.36, .45, -.12)], .01), RAME), 0, 0, 0), [0, 0, -.3], .86, .8); P(q(mesh(tubo([V(.4, .533, -.2), V(.36, .58, -.15), V(.34, .62, -.12)], .01), RAME), 0, 0, 0), [0, 0, -.3], .87, .8);   // tubi dell'acqua
P(q(mesh(fuso(pez(box(.22, .15, .02), 0x2a2d31), pez(box(.2, .12, .004), 0x1f6b45, 0, 0, .012), pez(box(.05, .03, .01), 0x15171a, -.05, .02, .016), pez(box(.03, .04, .01), 0xcfd3d6, .06, -.02, .016)), VC), .3, .76, .15), [0, .4, .5], .9, .9);   // scheda elettronica
// involucro: coperchio, frontale con il foro del ventilatore e la griglia, fianco destro con la scatola collegamenti, schiena del vano compressore con gli attacchi
const tFr = cv(512, 420, (c, w, h) => { c.fillStyle = '#eceeef'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9cdd0'; c.lineWidth = 5; c.beginPath(); c.roundRect(14, 18, 252, 384, 34); c.stroke();
  drawUnicalLogo(c, 330, 34, 150); c.fillStyle = '#2b2f33'; c.font = '600 30px Barlow, sans-serif'; c.fillText('HP_QOR', 345, 112); c.fillStyle = '#d5d9dc'; for (let i = 0; i < 6; i++) { c.beginPath(); c.roundRect(370, 150 + i * 34, 72, 10, 5); c.fill(); }
  c.fillStyle = '#2b2f33'; c.font = '500 18px Barlow, sans-serif'; c.fillText('full inverter', 350, 380); });
const FR = cop(std({ map: tFr, roughness: .4, side: THREE.DoubleSide }));
{ const s = new THREE.Shape(); s.moveTo(-QW / 2, 0); s.lineTo(QW / 2, 0); s.lineTo(QW / 2, QH - .065); s.lineTo(-QW / 2, QH - .065); s.closePath(); const h = new THREE.Path(); h.absarc(XF, YF - .065, RF, 0, PI * 2, true); s.holes.push(h);
  const gF = new THREE.ShapeGeometry(s, 32), p = gF.attributes.position, uv = gF.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + QW / 2) / QW, p.getY(i) / (QH - .065));
  const tG = cv(256, 256, (c, w) => { c.clearRect(0, 0, w, w); c.strokeStyle = '#e8eaec'; c.lineWidth = 3; for (let r = 22; r < 128; r += 9) { c.beginPath(); c.arc(128, 128, r, 0, 7); c.stroke(); } c.lineWidth = 4; for (let a = 0; a < 8; a++) { c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.cos(a * PI / 4) * 126, 128 + Math.sin(a * PI / 4) * 126); c.stroke(); } c.fillStyle = '#eceeef'; c.beginPath(); c.arc(128, 128, 18, 0, 7); c.fill(); });
  const g = new THREE.Group(); g.add(mesh(gF, FR, 0, 0, 0)); g.add(mesh(new THREE.CircleGeometry(RF, 40), cop(std({ map: tG, transparent: true, roughness: .5 })), XF, YF - .065, .006)); P(q(g, 0, .065, QD / 2), [0, 0, .9], .95, 1); }
P(q(mesh(box(QW, .015, QD), BI), 0, QH - .0075, 0), [0, .7, 0], .93, 1);                                                                                    // coperchio
P(q(mesh(box(.012, QH - .07, QD), BI), QW / 2 - .006, .46, 0), [.6, 0, 0], .9, 1); P(q(mesh(rbox(.065, .34, .2, .012), BI), QW / 2 + .032, .5, .02), [.6, 0, 0], .92, 1);   // fianco destro e scatola collegamenti (65 mm)
{ const g = new THREE.Group(); g.add(mesh(box(.44, QH - .07, .012), BI, 0, 0, 0)); for (const [y, c] of [[.533 - .46, 0x15171a], [.368 - .46, 0x15171a], [.089 - .46, 0x2a2d31]]) g.add(ax(mesh(cyl(.02, .03, 14), std({ color: c, roughness: .5 }), .12, y, -.015), 'z'));
  for (const y of [.533, .368]) g.add(ax(mesh(cyl(.016, .05, 14), OTT, .12, y - .46, -.04), 'z')); P(q(g, .28, .46, -QD / 2 - .006), [0, 0, -.7], .96, 1); }           // attacchi G1" sul retro: ritorno IN a 533 mm, mandata OUT a 368 mm

// 2 ─ caldaia KONm 24 C sulla parete: origine al centro del lato inferiore, sulla parete
gruppo('Caldaia', 'Brucia il gas e recupera anche il calore del vapore dei fumi: per questo si chiama a condensazione. Qui fa solo riscaldamento e si accende quando fuori fa molto freddo.',
  'KONm 24 C · scambiatore primario Al/Si/Mg ultrapiatto · bruciatore premiscelato modulante, fino a 1:8, NOx classe 6 · 22,6 kW utili · rendimento 102,6 % a 50-30 °C · vaso 8 l · 700 × 420 × 345 mm · 34 kg · interno: schema di principio',
  15, 28, { az: 22, el: 8, d: 2.1, x: KX, y: 1.62 }, [.5, .2, .6]);
const KY = 1.25, k = (o, x, y, z) => L(o, KX + x, KY + y, ZW + z), dz = d => [0, 0, d];
P(k(mesh(box(.42, .7, .012), GR), 0, .35, .006), dz(.8), 0, 0);                                                                                             // schienale
P(k(mesh(fuso(pez(cyl(.15, .045, 32), 0xc0392b, 0, 0, 0, PI / 2), pez(cyl(.012, .03, 10), 0xb08a3c, .1, -.1, .03, PI / 2)), VC), .02, .42, .045), dz(1), .06, .1);                                // vaso di espansione 8 litri, contro lo schienale
const tAl = cv(128, 128, (c, w, h) => { c.fillStyle = '#b9bec2'; c.fillRect(0, 0, w, h); c.fillStyle = '#8f969b'; for (let y = 0; y < h; y += 7) c.fillRect(0, y, w, 3); }); tAl.wrapS = tAl.wrapT = THREE.RepeatWrapping; tAl.repeat.set(1, 3);
P(k(mesh(fuso(pez(box(.3, .3, .11), 0xffffff), pez(box(.31, .02, .115), 0x9aa0a5, 0, .15, 0), pez(box(.31, .02, .115), 0x9aa0a5, 0, -.15, 0)), std({ map: tAl, vertexColors: true, roughness: .4, metalness: .7 })), 0, .4, .14), dz(1.1), .14, .3);   // scambiatore primario Al/Si/Mg
const FIAMMA = new THREE.MeshBasicMaterial({ color: 0x4aa8ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
P(k(mesh(fuso(pez(cyl(.032, .24, 20), 0x8f969b, 0, 0, 0, 0, PI / 2), pez(cyl(.034, .01, 20), 0x5a6066, -.12, 0, 0, 0, PI / 2), pez(cyl(.034, .01, 20), 0x5a6066, .12, 0, 0, 0, PI / 2)), VC), 0, .5, .22), dz(1.2), .24, .4);   // bruciatore premiscelato
const fiamma = k(mesh(cyl(.045, .24, 20, true), FIAMMA), 0, .5, .22); fiamma.rotation.z = PI / 2; P(fiamma, dz(1.2), .26, .4);
P(k(mesh(fuso(pez(cyl(.05, .04, 22), 0x2a2d31, 0, 0, 0, PI / 2), pez(box(.05, .04, .05), 0x2a2d31, .05, 0, 0), pez(cyl(.022, .06, 12), 0x15171a, -.02, 0, .045, PI / 2)), VC), -.11, .615, .2), dz(1.2), .32, .45);   // ventilatore del bruciatore (ricostruito)
P(k(mesh(fuso(pez(cyl(.04, .2, 18), 0xdfe2e4), pez(cyl(.05, .02, 18), 0xb9bec2, 0, .1, 0)), VC), -.08, .62, .13), [0, .6, 0], .36, .5);                         // condotto fumi verso l'imbocco sopra
P(k(mesh(fuso(pez(box(.12, .07, .05), 0xb4babf), ...[...Array(12)].map((_, i) => pez(box(.003, .072, .052), 0x7d858c, -.055 + i * .01, 0, 0))), VC), -.12, .14, .15), [-.5, 0, .5], .42, .6);   // scambiatore sanitario a 12 piastre
P(k(mesh(fuso(pez(cyl(.035, .06, 18), 0x2456a6, 0, 0, 0, PI / 2), pez(cyl(.045, .03, 18), 0x15171a, 0, 0, -.04, PI / 2), pez(box(.04, .04, .02), 0x15171a, 0, .04, .02)), VC), .12, .13, .16), [.5, 0, .5], .48, .65);   // circolatore modulante
P(k(mesh(fuso(pez(box(.05, .045, .04), 0xb08a3c), pez(cyl(.018, .04, 12), 0x15171a, 0, .04, 0)), VC), .03, .1, .12), [0, -.3, .5], .52, .65);                 // valvola a tre vie (ricostruita)
P(k(mesh(fuso(pez(box(.06, .05, .045), 0x2a2d31), pez(cyl(.012, .03, 10), 0xd9b23a, 0, -.035, 0)), VC), -.05, .085, .2), [0, -.3, .5], .56, .65);               // valvola del gas (ricostruita)
P(k(mesh(fuso(pez(cyl(.025, .1, 14), 0xdfe2e4), pez(cyl(.008, .05, 8), 0x9aa0a5, 0, -.07, 0)), VC), .003, .09, .08), [0, -.3, .3], .6, .65);                    // sifone della condensa (ricostruito)
P(k(mesh(tubo([V(-.12, .17, .15), V(-.12, .25, .1), V(-.06, .26, .1)], .008), RAME), 0, 0, 0), dz(.5), .62, .7); P(k(mesh(tubo([V(.12, .16, .14), V(.12, .27, .1), V(.08, .26, .1)], .008), RAME), 0, 0, 0), dz(.5), .63, .7);
const KXA = { C: -.17, F: -.112, G: -.05, S: .003, R: .084, M: .154 };
{ const g = new THREE.Group(); for (const n in KXA) g.add(L(mesh(cyl(n === 'G' ? .011 : .009, .05, 10), n === 'S' ? NERO : n === 'G' ? std({ color: 0xd9b23a, roughness: .4, metalness: .6 }) : OTT), KXA[n], -.025, .08)); P(k(g, 0, 0, 0), [0, -.4, 0], .68, .75); }   // attacchi sotto: C, F, G, scarico, R, M
const tPan = cv(256, 64, (c, w, h) => { c.fillStyle = '#e2e5e7'; c.fillRect(0, 0, w, h); drawUnicalLogo(c, 112, 2, 30); c.fillStyle = '#c8ccd0'; for (const x of [70, 96]) { c.beginPath(); c.arc(x, 38, 10, 0, 7); c.fill(); } c.fillStyle = '#3d8fd9'; c.fillRect(114, 22, 32, 30); c.fillStyle = '#7a8086'; c.font = '600 12px Barlow, sans-serif'; c.fillText('KON', 156, 42); c.strokeStyle = '#9aa0a5'; c.lineWidth = 2; c.beginPath(); c.arc(190, 38, 10, 0, 7); c.stroke(); });
P(k(mesh(box(.3, .075, .05), [GR, GR, GR, GR, std({ map: tPan, roughness: .4 }), GR]), 0, .055, .3), [0, -.2, .6], .74, .8);                                    // pannello comandi
const tMan = cv(256, 420, (c, w, h) => { c.fillStyle = '#eceeef'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d6d9dc'; c.lineWidth = 3; c.beginPath(); c.roundRect(18, 14, w - 36, h - 92, 26); c.stroke(); });
P(k(mesh(rbox(.42, .6, .345, .02), [BI, BI, BI, BI, cop(std({ map: tMan, roughness: .4 })), BI]), 0, .4, .1725), [0, .2, 1.1], .84, 1);                        // mantello
for (const [x, r] of [[-.08, .05], [.08, .04]]) P(k(mesh(cyl(r, .02, 20), GR), x, .71, .17), [0, .5, 0], .9, 1);                                              // imbocchi sopra

// 3 ─ kit HYBREER sotto la caldaia: origine al centro del lato inferiore, sulla parete
gruppo('Kit HYBREER', 'È il punto d\'incontro: un doppio collettore dove arrivano pompa di calore e caldaia e da cui parte l\'impianto. Le valvole di non ritorno impediscono all\'acqua di uno di tornare nell\'altro.',
  'Collettore 00376907 chiuso, senza pompa di rilancio (come viene fornito) · attacchi G 1" · valvole di non ritorno su M pdc e M Cal · coibentato per caldo e freddo · cofano 380 × 380 × 181 mm · kit relè 00378689 per la caldaia di soccorso',
  28, 36, { az: 14, el: 14, d: 1.75, x: KX + .12, y: .85 }, [.3, -.3, .5]);
const HY = .62, h = (o, x, y, z) => L(o, KX + x, HY + y, ZW + z), KK = { Rpdc: -.118, Mpdc: -.043, RCal: .0435, MCal: .1185 };
P(h(mesh(box(.38, .38, .006), BI), 0, .19, .003), dz(.8), 0, 0);                                                                                             // fondo del cofano
P(h(mesh(fuso(pez(box(.24, .07, .004), 0xb9bec2), pez(box(.24, .004, .05), 0xb9bec2, 0, -.035, .025)), VC), 0, .1, .01), dz(1), .1, .2);                       // staffa di fissaggio a muro
P(h(mesh(box(.27, .07, .07), INOX), 0, .19, .09), dz(1.1), .2, .35);                                                                                           // collettore
P(h(mesh(rbox(.3, .12, .12, .03), std({ color: 0x1d2024, roughness: .8 })), 0, .19, .09), dz(1.2), .3, .45);                                                  // coibentazione
P(h(ax(mesh(cyl(.022, .012, 18), OTT), 'z'), .1, .19, .152), dz(1.2), .36, .5);                                                                               // otturatore a vite: chiuso = collettore, aperto = compensatore
for (const n in KK) P(h(mesh(fuso(pez(cyl(.016, .06, 12), 0xb4babf), pez(cyl(.02, .014, 6), 0x9aa0a5, 0, .02, 0)), VC), KK[n], .275, .09), [0, .4, 0], .4 + KK[n], .55);
for (const x of [-.118, .118]) P(h(mesh(fuso(pez(cyl(.016, .06, 12), 0xb4babf), pez(cyl(.02, .014, 6), 0x9aa0a5, 0, -.02, 0)), VC), x, .105, .09), [0, -.4, 0], .5, .55);
for (const n of ['Mpdc', 'MCal']) P(h(mesh(fuso(pez(cyl(.017, .05, 16), 0xb08a3c), pez(cyl(.021, .012, 6), 0x9c7a34, 0, .02, 0)), VC), KK[n], .33, .09), [0, .5, 0], .62, .7);   // valvole di non ritorno su M pdc e M Cal
P(h(mesh(fuso(pez(box(.16, .1, .05), 0xcfd3d6), ...[0, 1, 2, 3, 4, 5].map(i => pez(box(.016, .05, .02), i < 4 ? 0x2e8b57 : 0x2456a6, -.06 + i * .022, .005, .03)), pez(box(.15, .012, .012), 0x9aa0a5, 0, -.04, .03)), VC), .36, .3, .03), [.6, 0, .3], .75, .6);   // kit relè 00378689
const tCo = cv(256, 256, (c, w, h) => { c.fillStyle = '#eceeef'; c.fillRect(0, 0, w, h); c.fillStyle = '#9aa0a5'; c.font = '500 24px Barlow, sans-serif'; c.textAlign = 'right'; c.fillText('HYBREER', w - 20, 36); c.fillStyle = '#c4c8cb'; c.fillRect(w - 64, h - 30, 44, 15); drawUnicalLogo(c, w - 62, h - 29, 40, '#eceeef'); });
P(h(mesh(rbox(.35, .38, .175, .006), [BI, BI, BI, BI, cop(std({ map: tCo, roughness: .4 })), BI]), 0, .19, .006 + .0875), [0, 0, 1.0], .88, 1);              // cofano, 380 x 380 x 181

// 4 ─ collegamenti: tubi, sonda T1, gas, scarico fumi e impianto a pavimento
gruppo('Collegamenti', 'Dalla pompa di calore e dalla caldaia l\'acqua arriva al kit e da lì scende nel pavimento di casa. Una sonda sulla mandata della pompa di calore dice al sistema quanto è calda l\'acqua.',
  'Pompa di calore su R pdc e M pdc, caldaia su R Cal e M Cal, impianto su R imp e M imp (manuale HYBREER p.14) · sonda T1 00470021 sulla mandata della pompa di calore · gas e scarico fumi: percorso indicativo',
  36, 42, { az: -6, el: 20, d: 5.6, x: .05, y: .9 }, [0, 0, .3]);
const qA = y => V(QX + .28 + .12, y, QZ - QD / 2 - .07), kTop = n => V(KX + KK[n], HY + .36, ZW + .09), cA = n => V(KX + KXA[n], KY - .05, ZW + .08), ZT = ZW + .035;
P(condotto('pdcM', [qA(.368), V(QX + .4, .368, -.15), V(QX + .4, .24, -.15), V(QX + .4, .24, ZT), V(KX - .3, .24, ZT), V(KX - .3, HY + .45, ZT), V(KX + KK.Mpdc, HY + .45, ZT), V(KX + KK.Mpdc, HY + .45, ZW + .09), kTop('Mpdc')], 0xff8a3d, .02), [0, .3, .3], 0, .3);
P(condotto('pdcR', [qA(.533), V(QX + .48, .533, -.08), V(QX + .48, .32, -.08), V(QX + .48, .32, ZT + .05), V(KX - .36, .32, ZT + .05), V(KX - .36, HY + .5, ZT + .05), V(KX + KK.Rpdc, HY + .5, ZT + .05), V(KX + KK.Rpdc, HY + .5, ZW + .09), kTop('Rpdc')], 0x3f86c9, .02), [0, .3, .3], .08, .3);
P(h(mesh(fuso(pez(cyl(.012, .04, 10), 0xb08a3c, 0, 0, 0, PI / 2), pez(box(.012, .03, .012), 0x15171a, 0, .02, 0)), VC), -.3 - KX + KX, .24 - HY + .03, ZT - ZW), [0, .3, .3], .18, .4);   // sonda T1 nel pozzetto sulla mandata
for (const [n, c, verso] of [['calM', 'M', 'MCal'], ['calR', 'R', 'RCal']]) { const a = cA(c), f = kTop(verso), ym = KY - .12; P(condotto(n, [a, V(a.x, ym, a.z), V(f.x, ym, a.z), V(f.x, ym + .02, f.z), f], n === 'calM' ? 0xff5a2a : 0xb5522e, .016), [0, .3, .3], .26 + (n === 'calR' ? .05 : 0), .3); }
for (const [n, x, col] of [['impM', .118, 0xff8a3d], ['impR', -.118, 0x3f86c9]]) P(condotto(n, [V(KX + x, HY + .08, ZW + .09), V(KX + x, .04, ZW + .09), V(KX + x, .04, ZW + .3)], col, .02), [0, -.3, .3], .4 + (x < 0 ? .04 : 0), .3);
{ const a = cA('G'); P(condotto('gas', [V(KX + .95, .9, ZW + .2), V(KX + .3, .9, ZW + .2), V(KX + .3, KY - .09, ZW + .2), V(a.x, KY - .09, ZW + .2), V(a.x, KY - .09, a.z), a], 0xffc83a, .012), [.4, 0, .3], .5, .3); }
P(k(mesh(fuso(pez(cyl(.05, .42, 18), 0xdfe2e4, -.08, .93, .17), pez(cyl(.05, .3, 18), 0xdfe2e4, -.08, 1.14, .02, PI / 2), pez(cyl(.055, .02, 18), 0xb9bec2, -.08, .73, .17)), VC), 0, 0, 0), [0, .6, 0], .6, .3);   // scarico fumi concentrico: sale e attraversa la parete
// pavimento radiante davanti alla parete (generico)
const tPav = cv(256, 256, (c, w, h) => { c.fillStyle = '#5f5e59'; c.fillRect(0, 0, w, h); c.strokeStyle = '#a0603a'; c.lineWidth = 7; c.beginPath(); for (let i = 0; i < 6; i++) { const y = 22 + i * 40; c.moveTo(18, y); c.lineTo(w - 18, y); if (i < 5) { c.moveTo(i % 2 ? 18 : w - 18, y); c.lineTo(i % 2 ? 18 : w - 18, y + 40); } } c.stroke(); });
const PAV = std({ map: tPav, roughness: .9, emissive: 0x000000 });
{ const m = mesh(new THREE.PlaneGeometry(1.4, 1.0), PAV, KX, .006, ZW + .62); m.rotation.x = -PI / 2; P(m, [0, -.2, 0], .7, .3); }

// ───────── stato: temperatura esterna e chi lavora ─────────
// Manuale HYBREER p.19, HP_QOR con impianto a pavimento a 35 °C: sopra T4_AHS_ON = 5 °C solo pompa di calore; tra T4HMIN = −15 °C (di fabbrica) e 5 °C pompa di calore
// e caldaia insieme; sotto −15 °C solo caldaia. In raffrescamento lavora solo la pompa di calore (AHS = CALDO: la caldaia solo in riscaldamento).
const T4_AHS_ON = 5, T4HMIN = -15, FINE_M = 43, FINE = 51;
const E = { T: 10, estate: false, pdc: 1, cal: 0 };
function modo() { E.pdc = E.estate || E.T >= T4HMIN ? 1 : 0; E.cal = !E.estate && E.T < T4_AHS_ON ? 1 : 0; }
const U = { mode: 'start', t: 0, tool: 'tocca', e: 0, eTo: 0, dentro: 0, dentroTo: 0, az: rad(-8), el: rad(14), zoom: 1, auto: true, pdc: 0, cal: 0 };
const VISTA_F = { az: -6, el: 15, d: 6.2, x: .05, y: 1.0 };
function vistaFilm(t) { let v = G[0].vista; for (const g of G) { const k = sm(g.t0 - .5, g.t0 + .7, t), w = g.vista, o = {}; for (const q in w) o[q] = lerp(v[q], w[q], k); v = o; }
  const k = sm(FINE_M - .3, FINE_M + 1.2, t), o = {}; for (const q in v) o[q] = lerp(v[q], VISTA_F[q], k); return o; }
let stretto = false, ang = 0;
const COL_F = { pdcM: [0xff8a3d, 0x7fd6ff], pdcR: [0x3f86c9, 0x3f86c9], impM: [0xff8a3d, 0x7fd6ff], impR: [0x3f86c9, 0x3f86c9] };
function posa(now, dt) {
  const film = U.mode === 'film', t = film ? U.t : FINE;
  for (const g of G) for (const p of g.pezzi) { const dur = (g.t1 - g.t0) * .42, k = film ? Math.max(1 - sm(1.2, 2.0, t), clamp((t - (g.t0 + p.rit * (g.t1 - g.t0 - dur))) / dur)) : 1;
    p.o.visible = k > 0; p.o.position.copy(p.home).addScaledVector(p.da, 1 - eoc(k)).addScaledVector(g.esp, U.e).addScaledVector(p.dir, (.04 + .36 * p.liv) * U.e); }
  U.dentro = lerp(U.dentro, film ? 0 : U.dentroTo, 1 - Math.exp(-dt * 6));
  const op = lerp(1, .1, U.dentro) * lerp(1, .45, sm(0, .3, U.e)); for (const m of COPERTI) { m.opacity = op; m.depthWrite = op > .9; }
  if (film) { E.estate = false; E.T = t < FINE_M ? 10 : Math.round(lerp(10, -18, sm(FINE_M + 1, FINE_M + 6, t))); }
  modo(); const vivo = !film || t > FINE_M ? 1 : 0;
  U.pdc = lerp(U.pdc, E.pdc * vivo, 1 - Math.exp(-dt * 4)); U.cal = lerp(U.cal, E.cal * vivo, 1 - Math.exp(-dt * 4));
  ang += dt * 14 * U.pdc; ventola.rotation.z = -ang;
  FIAMMA.opacity = U.cal * (.55 + .2 * Math.sin(now * 23) * Math.sin(now * 7)); fiamma.scale.set(1, 1, 1 + .1 * Math.sin(now * 17));
  const A = { pdcM: U.pdc, pdcR: U.pdc, calM: U.cal, calR: U.cal, gas: U.cal, impM: Math.max(U.pdc, U.cal), impR: Math.max(U.pdc, U.cal) };
  for (const n in FLUSSI) for (const c of FLUSSI[n]) { const a = A[n] || 0, col = COL_F[n] ? COL_F[n][E.estate ? 1 : 0] : null; if (col !== null) c.col.setHex(col); c.m.color.setHex(0x6a7076).lerp(c.col, sm(0, .1, a)); c.tx.offset.x -= dt * (a > .02 ? .5 + 1.6 * a : 0); }
  PAV.emissive.setHex(E.estate ? 0x1a4a7a : 0x7a2a08); PAV.emissiveIntensity = .5 * Math.max(U.pdc, U.cal) * vivo;
  let v; if (film) v = vistaFilm(t); else { if (U.auto) U.az = rad(-8) + Math.sin(now * .25) * rad(16); v = { az: U.az / PI * 180, el: U.el / PI * 180, d: 6.2 * U.zoom, x: .05, y: 1.0 }; }
  const d = v.d * (stretto ? 1.85 : 1), ce = Math.cos(rad(v.el)), yy = v.y - (U.mode === 'free' ? d * (stretto ? .09 : .05) : 0);
  camera.position.set(v.x + Math.sin(rad(v.az)) * ce * d, yy + Math.sin(rad(v.el)) * d, Math.cos(rad(v.az)) * ce * d); camera.lookAt(v.x, yy, 0);
}
// ───────── interfaccia ─────────
function resize() { const w = Math.max(2, stage.clientWidth), h = Math.max(2, stage.clientHeight); renderer.setSize(w, h, false); camera.aspect = w / h; stretto = w < h; camera.fov = stretto ? 38 : 30; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); new ResizeObserver(resize).observe(stage); resize();
const setMode = m => { U.mode = m; document.body.className = m; };
const gradi = T => (T < 0 ? '−' + -T : T) + ' °C';
const testoFuori = () => E.estate ? 'Estate: raffresca solo la pompa di calore. La caldaia resta spenta, perché qui lavora solo in riscaldamento.'
  : E.T >= T4_AHS_ON ? `Fuori ${gradi(E.T)}: riscalda solo la pompa di calore, che prende il calore dall'aria. È il modo che consuma meno.`
  : E.T >= T4HMIN ? `Fuori ${gradi(E.T)}: sotto i 5 °C si accende anche la caldaia e lavora insieme alla pompa di calore.`
  : `Fuori ${gradi(E.T)}: sotto i −15 °C la pompa di calore si ferma e scalda solo la caldaia.`;
function didascalia(t) { let i = 0; for (let k = 0; k < G.length; k++) if (t >= G[k].t0 - .3) i = k; const run = t >= FINE_M, pre = t < G[0].t0 - .3;
  $('num').textContent = run || pre ? '' : String(i + 1).padStart(2, '0'); $('name').textContent = pre ? 'Ibrido HYBREER 3' : run ? 'In funzione' : G[i].nome;
  $('spec').textContent = pre ? 'Pompa di calore HP_QOR 70, caldaia KONm 24 C e kit HYBREER' : run ? testoFuori() : G[i].facile; }
function aggiorna() { $('pFuori').textContent = testoFuori(); $('setT').textContent = E.estate ? 'Estate' : gradi(E.T); $('kEst').setAttribute('aria-pressed', E.estate); $('sT').disabled = E.estate; }
function startFilm() { U.t = 0; U.e = U.eTo = 0; setMode('film'); }
function libero(annuncia) { setMode('free'); U.auto = true; U.el = rad(14); U.zoom = 1; E.estate = false; E.T = +$('sT').value; setTool('tocca'); if (annuncia) { const t = $('toast'); t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); } }
function setTool(n) { U.tool = n; for (const b of $('tabs').children) b.setAttribute('aria-pressed', b.dataset.tool === n); for (const s of $('panel').children) s.classList.toggle('on', s.dataset.tool === n); U.eTo = n === 'smonta' ? +$('sE').value : 0; U.dentroTo = n === 'dentro' ? 1 : n === 'fuori' ? .6 : 0; if (n === 'tocca') scheda(-1); aggiorna(); }
function scheda(i) { $('pTocca').textContent = i < 0 ? 'Trascina per girare, pizzica per avvicinarti. Tocca un pezzo o un nome.' : ''; if (i >= 0) { const b = document.createElement('b'), s = document.createElement('small'); b.textContent = G[i].nome + '. '; s.textContent = G[i].tecnico; $('pTocca').append(b, G[i].facile, document.createElement('br'), s); }
  for (const b of $('nomi').children) b.setAttribute('aria-pressed', +b.dataset.i === i); }
G.forEach((g, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.dataset.i = i; b.textContent = g.nome; b.onclick = () => scheda(i); $('nomi').appendChild(b); });
for (const b of $('tabs').children) b.onclick = () => setTool(b.dataset.tool);
$('sE').addEventListener('input', e => { U.eTo = +e.target.value; }); $('sT').addEventListener('input', e => { E.T = +e.target.value; aggiorna(); });
$('kEst').onclick = () => { E.estate = !E.estate; aggiorna(); };
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
function passo(dt, now) { if (U.mode === 'film') { U.t += dt; didascalia(U.t); if (U.t >= FINE) libero(true); } U.e = lerp(U.e, U.eTo, 1 - Math.exp(-dt * 6)); posa(now, dt); if (U.mode === 'free' && now - tAgg > .25) { tAgg = now; aggiorna(); } }
function frame(ts) { requestAnimationFrame(frame); if (document.hidden) { last = 0; return; } const now = ts / 1000, grezzo = last ? now - last : 0, dt = Math.min(.05, grezzo); last = now; passo(dt, now); renderer.render(scene, camera);
  if (grezzo > .036) { if (++lenti > 45 && PR > .8) { PR = Math.max(.8, PR - .25); renderer.setPixelRatio(PR); resize(); lenti = 0; } } else if (grezzo) lenti = Math.max(0, lenti - 1); }
aggiorna(); posa(0, 0);
window.__ibrido = { U, E, G, setTool, scheda, startFilm, libero, seek(t) { if (U.mode !== 'film') startFilm(); U.t = t; passo(0, t); renderer.render(scene, camera); }, avanti(s) { for (let i = 0; i < s * 20; i++) passo(.05, last + i * .05); renderer.render(scene, camera); },
  stato: () => ({ mode: U.mode, tool: U.tool, t: +U.t.toFixed(2), e: +U.e.toFixed(3), dentro: +U.dentro.toFixed(3), T: E.T, estate: E.estate, pdc: +U.pdc.toFixed(3), cal: +U.cal.toFixed(3), pezzi: G.reduce((n, g) => n + g.pezzi.length, 0), calls: renderer.info.render.calls }) };
requestAnimationFrame(frame);
