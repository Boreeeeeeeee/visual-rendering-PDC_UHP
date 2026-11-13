
// ───────── Ibrido HYBREER 3 · costruzione, parte 3: kit HYBREER, collegamenti e impianto ─────────
// Dal manuale HYBREER 3 00339200/a:
//   p.3 cofano 00377132: 380 × 380 × 181 mm (frontale 350), fissaggi Ø 5 a 50 mm da sopra e da sotto, pretranciatura sopra e sotto.
//   p.4 collettore 00376907 in orizzontale: sopra, da sinistra, R pdc, M pdc, R Cal, M Cal a passo 25,5 / 75 / 86,5 / 75 / 25,5 mm; sotto R imp e M imp a 236,4 mm;
//       corpo alto 70 mm; valvole di non ritorno (2) su M pdc e M Cal; staffa (1); tappo di sicurezza e detentore a vite avvitato a fondo = collettore chiuso.
//   p.14 collegamenti con HP_QOR: pompa di calore su R pdc / M pdc, caldaia su R Cal / M Cal, impianto sotto; kit relè 00378689; sonda T1 00470021.
//   p.16 kit relè: scatola con i passacavi verso il basso, tre relè, morsetti; p.17 sonda T1 in un pozzetto sull'attacco di mandata della pompa di calore.
//   Nota di p.14: con il raffrescamento i tubi di mandata e ritorno vanno coibentati.
// RICOSTRUITO: parete, percorso dei tubi, rubinetto e tubo del gas, tratto esterno dello scarico fumi, scarico della condensa, pavimento radiante (generico).
const hHome = { off: [KX + .2, HY + .2, ZW + .12], w: 1.0, h: .85 };
const HK = { Rpdc: -.11825, Mpdc: -.04325, RCal: .04325, MCal: .11825 }, HZ = .09;
const hw = (x, y, z) => [KX + x, HY + y, ZW + z], kwp = (x, y, z) => [KX + x, KY + y, ZW + z];

// 10 ─ Kit HYBREER
group('kit', 'Kit HYBREER', 'Doppio collettore coibentato: sopra arrivano pompa di calore e caldaia, sotto parte l\'impianto. Le valvole di non ritorno tengono separati i due generatori.', 38.0, 42.0, { stage: [.2, -.1, 1.0], ex: [.25, -.3, .5], az: 18, el: 12, zoom: 1.0,
  info: { e: 'Il punto d\'incontro. Bilancia due generatori molto diversi tra loro e manda all\'impianto l\'acqua di chi sta lavorando.', s: 'Collettore 00376907, 4 kg, attacchi G 1" · collettore chiuso senza pompa di rilancio (come viene fornito): svitando il detentore diventa un compensatore idraulico · valvole di non ritorno su M pdc e M Cal · coibentato per caldo e freddo · cofano 380 × 380 × 181 mm · kit relè 00378689' } }).home = hHome;
{
  const h = node(KX, HY, ZW), o = x => Object.assign({ parent: h }, x), F0 = { spin: [0, 0, 0], ease: eoc };
  P(mesh(G.box(.38, .38, .004), M.sWhite, 0, .19, .002), o(Object.assign({ d: 0, from: [0, 0, .6], k: [0, 0, -.02], dur: .55, n: 'Fondo del cofano' }, F0)));
  screws([[-.183, .33], [.183, .33], [-.183, .05], [.183, .05]].map(a => ({ p: [a[0], a[1], .005], r: [PI / 2, 0, 0] })), o({ d0: .04, d1: .08, n: 'Fissaggi a parete' }));
  // staffa (1)
  P(mesh(G.box(.24, .075, .004), M.zinc, 0, .115, .007), o({ d: .1, from: [0, -.2, .3], spin: [0, 0, 0], n: 'Staffa di fissaggio' }));
  P(mesh(G.box(.24, .004, .09), M.zinc, 0, .152, .052), o({ d: .12, from: [0, -.2, .3], spin: [0, 0, 0] }));
  screws([-.09, .09].map(x => ({ p: [x, .115, .01], r: [PI / 2, 0, 0] })), o({ d0: .14, d1: .16 }));
  // collettore (H): corpo, setto tra mandata e ritorno, detentore a vite, tappo di sicurezza
  P(mesh(G.rbox(.272, .066, .066, .006), M.steel, 0, .19, HZ), o({ d: .2, from: [0, .2, .5], spin: [.8, 0, 0], dur: .55, n: 'Collettore, 4 kg' }));
  P(mesh(G.cylZ(.0135, .03, 20), M.brass, .105, .19, HZ + .04), o({ d: .26, from: [0, 0, .3], spin: [0, 0, 5], n: 'Detentore a vite, chiuso', snd: 'screw' }));
  P(mesh(G.cylZ(.02, .012, 6), M.brass, .105, .19, HZ + .058), o({ d: .29, from: [0, 0, .3], spin: [0, 0, 6], n: 'Tappo di sicurezza', snd: 'screw' }));
  // attacchi G 1": quattro sopra, due sotto
  Object.entries(HK).forEach(([k, x], i) => { P(mesh(G.cyl(.0165, .05, 18), M.steel, x, .246, HZ), o({ d: .32 + i * .02, from: [0, .25, 0], spin: [0, 3, 0], n: i ? null : 'Attacchi G 1": R pdc · M pdc · R Cal · M Cal' })); if (k[0] === 'R') P(mesh(G.cyl(.022, .016, 6), M.brass, x, .278, HZ), o({ d: .33 + i * .02, from: [0, .25, 0], spin: [0, 6, 0], snd: 'screw' })); });
  [-.1182, .1182].forEach((x, i) => { P(mesh(G.cyl(.0165, .05, 18), M.steel, x, .134, HZ), o({ d: .42 + i * .02, from: [0, -.25, 0], spin: [0, 3, 0], n: i ? null : 'Attacchi R imp · M imp' })); P(mesh(G.cyl(.022, .016, 6), M.brass, x, .104, HZ), o({ d: .43 + i * .02, from: [0, -.25, 0], spin: [0, 6, 0], snd: 'screw' })); });
  // valvole di non ritorno (2) sulle due mandate
  [HK.Mpdc, HK.MCal].forEach((x, i) => { P(mesh(G.cyl(.019, .034, 20), M.brass, x, .288, HZ), o({ d: .48 + i * .03, from: [0, .3, 0], spin: [0, 5, 0], n: i ? 'Valvola di non ritorno su M Cal' : 'Valvola di non ritorno su M pdc' }));
    P(mesh(G.cyl(.023, .012, 6), M.brass, x, .3, HZ), o({ d: .49 + i * .03, from: [0, .3, 0], spin: [0, 6, 0], snd: 'screw' })); P(mesh(G.cyl(.011, .006, 14), M.white, x, .309, HZ), o({ d: .5 + i * .03, from: [0, .3, 0] })); });
  // gusci isolanti
  P(mesh(G.rbox(.312, .112, .056, .022), M.sFoam, 0, .19, HZ - .028), o(Object.assign({ d: .58, from: [0, 0, -.2], k: [0, 0, .05], n: 'Coibentazione per caldo e freddo' }, F0)));
  P(mesh(G.rbox(.312, .112, .056, .022), M.sFoam, 0, .19, HZ + .028), o(Object.assign({ d: .62, from: [0, 0, .45], k: [0, 0, .5], dur: .55 }, F0)));
  // kit relè 00378689, accanto al cofano, con i passacavi in basso
  const rx = .335, ry = .2;
  P(mesh(G.rbox(.17, .12, .05, .006), M.grey, rx, ry, .025), o({ d: .66, from: [.3, 0, .3], spin: [0, 0, 0], k: [.4, 0, .15], n: 'Kit relè 00378689' }));
  P(mesh(G.box(.15, .012, .006), M.zinc, rx, ry, .053), o({ d: .68, from: [0, 0, .25], spin: [0, 0, 0], k: [.4, 0, .22] }));
  PIN(G.box(.0085, .05, .022), M.term, [-.066, -.056, -.046, -.036, -.026, .036, .046, .056, .066].map(x => ({ p: [rx + x, ry, .066] })), o({ d0: .69, d1: .73, from: [0, 0, .25], spin: [0, 0, 0], k: [.4, 0, .3], n: 'Morsetti', snd: 'fin' }));
  PIN(G.box(.014, .05, .03), M.wOr, [-.012, .004, .02].map(x => ({ p: [rx + x, ry, .07] })), o({ d0: .73, d1: .75, from: [0, 0, .25], spin: [0, 0, 0], k: [.4, 0, .34], n: 'Tre relè: la pompa di calore chiama la caldaia' }));
  PIN(G.cyl(.009, .02, 12), M.white, [-.054, -.018, .018, .054].map(x => ({ p: [rx + x, ry - .068, .03] })), o({ d0: .76, d1: .78, from: [0, -.2, 0], k: [.4, -.08, .15], n: 'Passacavi verso il basso' }));
  P(mesh(G.rbox(.172, .122, .04, .006), M.sClear, rx, ry, .068), o(Object.assign({ d: .8, from: [0, 0, .4], k: [.4, 0, .45] }, F0)));
  // cofano bianco
  P(mesh(G.box(.35, .38, .004), [M.sWhite, M.sWhite, M.sWhite, M.sWhite, M.sCof, M.sWhite], 0, .19, .179), o(Object.assign({ d: .86, from: [0, 0, .7], k: [0, 0, .85], dur: .7, n: 'Cofano di copertura' }, F0)));
  [-1, 1].forEach(s => P(mesh(G.box(.004, .38, .175), M.sWhite2, s * .173, .19, .0915), o(Object.assign({ d: .86, from: [0, 0, .7], k: [0, 0, .85], dur: .7 }, F0))));
  [.378, .002].forEach(y => P(mesh(G.box(.346, .004, .07), M.sWhite2, 0, y, .143), o(Object.assign({ d: .86, from: [0, 0, .7], k: [0, 0, .85], dur: .7 }, F0))));
  screws([[-.19, .33], [.19, .05]].map(a => ({ p: [a[0], a[1], .006], r: [PI / 2, 0, 0] })), o({ d0: .95, d1: .98, mat: M.sScrew, k: [0, 0, .05], n: 'Viti Ø 5 del cofano' }));
}

// 11 ─ Collegamenti e impianto
const qIn = [QX + .455, .533, QZ - QD / 2 - .037], qOut = [QX + .455, .368, QZ - QD / 2 - .037], ZT = ZW + HZ;
const LP = {
  Mp: [qOut, [qOut[0], .368, -.2], [qOut[0], .368, ZT], [.25, .368, ZT], [.25, 1.13, ZT], [KX + HK.Mpdc, 1.13, ZT], [KX + HK.Mpdc, HY + .315, ZT]],
  Rp: [qIn, [qIn[0], .533, -.14], [qIn[0], .533, ZT + .06], [.19, .533, ZT + .06], [.19, 1.2, ZT + .06], [KX + HK.Rpdc, 1.2, ZT + .06], [KX + HK.Rpdc, 1.2, ZT], [KX + HK.Rpdc, HY + .29, ZT]],
  Mc: [kwp(KA.M, -.045, KZ), kwp(KA.M, -.11, KZ), kwp(HK.MCal + .012, -.2, .14), [KX + HK.MCal, 1.07, ZT], [KX + HK.MCal, HY + .315, ZT]],
  Rc: [kwp(KA.R, -.045, KZ), kwp(KA.R, -.09, KZ), kwp(HK.RCal + .015, -.17, .15), [KX + HK.RCal, 1.1, ZT], [KX + HK.RCal, HY + .29, ZT]],
  Mi: [hw(.1182, .1, HZ), hw(.1182, -.35, HZ), [KX + .1182, .16, ZT], [KX + .14, .075, ZT + .03], [KX + .3, .05, ZT + .08], [1.17, .05, -.25]],
  Ri: [hw(-.1182, .1, HZ), hw(-.1182, -.4, HZ), [KX - .1182, .16, ZT], [KX - .1, .09, ZT + .02], [KX + .2, .05, ZT + .03], [1.15, .05, ZT + .03], [1.23, .05, -.3]],
  gas: [[.32, .05, ZW + .03], [.32, 1.23, ZW + .03], [.36, 1.262, ZW + .09], [.5, 1.262, ZW + KZ], [KX + KA.G, 1.262, ZW + KZ], kwp(KA.G, -.045, KZ)],
  cond: [kwp(.012, -.035, .2), kwp(.03, -.1, .1), [KX + .2, 1.1, ZW + .03], [.87, .9, ZW + .03], [.87, .06, ZW + .03]],
};
// pavimento radiante: dodici file, andata e ritorno
const FL = { x0: .08, x1: 1.17, z0: -.25, dz: .083, n: 12, y: .05 };
LP.floor = (() => { const a = []; for (let i = 0; i < FL.n; i++) { const z = FL.z0 + i * FL.dz, L = i % 2 === 0; a.push([L ? FL.x1 : FL.x0, FL.y, z], [L ? FL.x0 : FL.x1, FL.y, z]); } a.push([1.23, FL.y, FL.z0 + (FL.n - 1) * FL.dz], [1.23, FL.y, -.3]); return a; })();
for (const k in LP) PIPE['l' + k] = LP[k];
PIPE.fumiExt = [kwp(0, .72, .225), kwp(0, .93, .225), kwp(0, .98, .19), kwp(0, 1.0, .1), kwp(0, 1.0, -.06)];
group('link', 'Collegamenti e impianto', 'Tubi coibentati tra pompa di calore, kit e caldaia, sonda T1 sulla mandata, gas, scarico fumi e pavimento radiante.', 42.0, 45.5, { stage: [0, 0, .9], ex: [0, -.1, .7], az: 4, el: 16, zoom: .82,
  info: { e: 'Quello che unisce tutto: l\'acqua va e torna tra i due generatori, il kit e il pavimento di casa.', s: 'Pompa di calore su R pdc / M pdc, caldaia su R Cal / M Cal, impianto su R imp / M imp · sonda di mandata globale T1 00470021 sull\'attacco della pompa di calore · tubi coibentati per il raffrescamento · gas, fumi e pavimento: percorso indicativo' } }).home = { off: [.1, 1.02, 0], w: 2.75, h: 2.5 };
{
  const o = x => x, tubo = (k, r, m, opt) => P(mesh(tubeGeo(LP[k], r, LP[k].length * 14), m), opt);
  // pavimento radiante: pannello isolante con le bugne, tubo a serpentina
  P(mesh(G.box(1.27, .03, 1.08), M.massetto, .64, .015, .2), o({ d: 0, from: [0, -.2, .3], spin: [0, 0, 0], dur: .55, k: [0, -.25, .1], n: 'Pannello isolante del pavimento' }));
  PIN(G.cylX(.0085, FL.x1 - FL.x0, 10), M.pex, Array.from({ length: FL.n }, (_, i) => ({ p: [(FL.x0 + FL.x1) / 2, FL.y, FL.z0 + i * FL.dz] })), o({ d0: .05, d1: .2, dur: .35, from: [0, .2, .4], spin: [0, 0, 0], ease: eoc, k: [0, -.2, .1], n: 'Tubo del pavimento radiante', snd: 'fin' }));
  PIN(new THREE.TorusGeometry(FL.dz / 2, .0085, 8, 14, PI), M.pex, Array.from({ length: FL.n - 1 }, (_, i) => ({ p: [i % 2 ? FL.x1 : FL.x0, FL.y, FL.z0 + (i + .5) * FL.dz], r: [PI / 2, 0, i % 2 ? -PI / 2 : PI / 2] })), o({ d0: .2, d1: .26, from: [0, .2, .3], spin: [0, 0, 0], k: [0, -.2, .1], snd: 'fin' }));
  P(mesh(tubeGeo([[FL.x1, FL.y, FL.z0 + (FL.n - 1) * FL.dz], [1.21, FL.y, FL.z0 + (FL.n - 1) * FL.dz - .01], [1.23, FL.y, .55], [1.23, FL.y, -.3]], .0085, 30), M.pex), o({ d: .27, k: [0, -.2, .1] }));
  // pompa di calore ↔ kit, con la sonda T1 sull'attacco di mandata
  P(mesh(G.cylZ(.02, .05, 18), M.brass, qOut[0], qOut[1], qOut[2] - .012), o({ d: .3, from: [0, 0, -.3], spin: [0, 0, 4], n: 'Raccordo con pozzetto della sonda' }));
  P(mesh(G.cyl(.008, .04, 12), M.brass, qOut[0], qOut[1] - .03, qOut[2] - .012), o({ d: .32, from: [0, -.2, 0] }));
  P(mesh(G.cyl(.004, .03, 10), M.copper, qOut[0], qOut[1] - .055, qOut[2] - .012), o({ d: .33, from: [0, -.2, 0], n: 'Sonda di mandata globale T1' }));
  P(mesh(tubeGeo([[qOut[0], qOut[1] - .07, qOut[2] - .012], [qOut[0] + .05, .2, qOut[2] + .02], [qOut[0] + .12, .12, QZ - .1], [QX + .56, .4, QZ - .03]], .003, 24), M.wBlue), o({ d: .34 }));
  tubo('Mp', .0135, M.copper, { d: .36, dur: .6, n: 'Mandata della pompa di calore → M pdc' });
  tubo('Rp', .0135, M.copper, { d: .4, dur: .6, n: 'R pdc → ritorno alla pompa di calore' });
  [[LP.Mp[2], LP.Mp[3]], [LP.Mp[3], LP.Mp[4]], [LP.Rp[3], LP.Rp[4]], [LP.Rp[2], LP.Rp[3]]].forEach(([a, b2], i) => { const A = V(...a), B = V(...b2), m = mesh(new THREE.CylinderGeometry(.024, .024, A.distanceTo(B) * .76, 14), M.sFoam);
    m.position.copy(A).lerp(B, .5); m.quaternion.setFromUnitVectors(V(0, 1, 0), B.clone().sub(A).normalize()); P(m, o({ d: .46 + i * .02, from: [0, .15, .3], spin: [0, 0, 0], n: i ? null : 'Coibentazione dei tubi' })); });
  // caldaia ↔ kit, kit ↔ impianto
  tubo('Mc', .012, M.copper, { d: .56, dur: .5, n: 'Mandata della caldaia → M Cal' }); tubo('Rc', .012, M.copper, { d: .59, dur: .5, n: 'R Cal → ritorno alla caldaia' });
  tubo('Mi', .0135, M.copper, { d: .63, dur: .5, n: 'M imp → pavimento' }); tubo('Ri', .0135, M.copper, { d: .66, dur: .5, n: 'Pavimento → R imp' });
  // gas con il suo rubinetto
  tubo('gas', .008, M.wYel, { d: .7, dur: .55, n: 'Tubo del gas' });
  P(mesh(G.rbox(.03, .04, .03, .005), M.brass, .32, 1.0, ZW + .03), o({ d: .74, n: 'Rubinetto del gas' })); P(mesh(G.box(.012, .012, .07), M.wYel, .32, 1.0, ZW + .075), o({ d: .75, from: [0, 0, .25] }));
  // scarico fumi coassiale: sale e attraversa la parete
  P(mesh(G.cyl(.05, .21, 28), M.white, KX, KY + .835, ZW + .225), o({ d: .78, from: [0, .4, 0], spin: [0, 2, 0], dur: .55, n: 'Scarico fumi coassiale Ø 60/100' }));
  P(mesh(new THREE.TorusGeometry(.06, .05, 16, 16, PI / 2), M.white, KX, KY + .94, ZW + .165, 0, -PI / 2, 0), o({ d: .81, from: [0, .4, 0], spin: [1, 0, 0] }));
  P(mesh(G.cylZ(.05, .2, 28), M.white, KX, KY + 1.0, ZW + .065), o({ d: .84, from: [0, 0, .4], spin: [0, 0, 2] }));
  P(mesh(annulus(.075, .05, .008), M.white, KX, KY + 1.0, ZW + .004, PI / 2, 0, 0), o({ d: .86, from: [0, 0, .3] }));
  // scarico della condensa e cavi del kit relè
  tubo('cond', .009, M.grey, { d: .88, dur: .5, n: 'Scarico della condensa' });
  [[[KX + .28, HY + .13, ZW + .03], [KX + .26, 1.05, ZW + .04], [KX + .16, 1.2, ZW + .2], [KX + .13, KY + .02, ZW + .26]], [[KX + .39, HY + .13, ZW + .03], [KX + .4, .3, ZW + .03], [.9, .08, ZW + .03]], [[KX + .35, HY + .13, ZW + .03], [KX + .34, .2, ZW + .04], [.3, .1, ZW + .05], [QX + .59, .2, QZ - .12], [QX + .553, .39, QZ + .03]]].forEach((p, i) => P(mesh(tubeGeo(p, .0035, 36), M.plastic), o({ d: .92 + i * .025, dur: .5, n: i ? null : 'Cavi: caldaia, pompa di calore, termostato' })));
}
finalize();
