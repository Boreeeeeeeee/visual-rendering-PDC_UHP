
// ───────── Ibrido HYBREER 3 · costruzione, parte 2: caldaia a condensazione KONm C 24 ─────────
// Dal manuale di installazione KONm 00335660:
//   p.10 "Vista con l'indicazione dei componenti principali" (KONm C18 - C24): la posizione di ogni componente numerato è letta su quel disegno, in scala
//        (telaio 420 × 700 mm). I numeri tra parentesi nei commenti sono quelli della legenda.
//   p.12 quote: 700 × 420 × 345 mm; attacchi sotto a 207 mm dalla parete, da sinistra C a 43 mm, F +56, G +60, R +130, M +70 (C e F G½, G, R e M G¾);
//        scarico fumi al centro a 225 mm dalla parete, due prese laterali a ±125 mm, a 205 mm dalla parete.
//   p.15 vaso di espansione 8 l con precarica 1 bar; contenuto del circuito primario 2,2 l.
// Dal depliant KONm (ed. 06/2025): foto dell'interno della KONm 24C (colori e forme: schienale zincato con imbutiture, condotto fumi bianco, tubi in rame,
//   piastra con bugne sullo scambiatore, ventilatore in alluminio, valvola gas) e del pannello comandi; bruciatore premix "Flat" in fibra FeCrAlloy con
//   blocco "Quick release", scambiatore in Al/Si/Mg, circolatore modulante con disaeratore.
// Dal manuale utente 00334008 §6.1: pannello comandi (A manometro, B selettore e temperatura riscaldamento, C temperatura sanitario, D sblocco, E display).
// RICOSTRUITO: le profondità (il disegno è una vista frontale), l'interno dello scambiatore (alettatura a piolini: schema di principio), il vaso di espansione
//   dietro lo schienale (nel disegno della C24 il n. 8 non è indicato), il percorso fine di tubi e cavi.
const kHome = { off: [KX + .16, 1.5, ZW + .17], w: 1.15, h: 1.5 };
const KA = { C: -.167, F: -.111, G: -.051, R: .079, M: .149 }, KZ = .207;      // attacchi: distanza dal centro e dalla parete (p.12)
const KP = {
  flow: [[-.13, .575, .13], [-.165, .575, .13], [-.165, .5, .13], [-.165, .26, .13], [-.16, .215, .14], [-.13, .2, .16], [.1, .2, .17], [.16, .19, .175], [.17, .12, .18], [.152, .07, .19]],
  mOut: [[.151, .03, .19], [.149, .0, KZ], [.149, -.03, KZ]],
  ret1: [[.079, -.03, KZ], [.079, .03, KZ], [.081, .06, .19], [.081, .075, .17]],
  ret2: [[.05, .11, .165], [.02, .15, .14], [-.03, .163, .13], [-.074, .165, .13], [-.074, .22, .13], [-.074, .292, .13]],
  hx: [[-.074, .3, .13], [-.12, .34, .13], [.01, .39, .13], [-.12, .44, .13], [.01, .49, .13], [-.1, .535, .13], [-.13, .575, .13]],
  gas: [[-.051, -.03, KZ], [-.051, .08, KZ], [-.03, .13, KZ], [.02, .2, .205], [.1, .27, .2], [.156, .33, .2], [.156, .36, .2]],
  mix: [[.156, .465, .2], [.166, .487, .2], [.162, .5, .2], [.106, .5, .2], [.106, .58, .16], [0, .59, .13], [-.055, .56, .13]],
  fumi: [[-.055, .33, .13], [-.05, .27, .15], [-.02, .25, .21], [-.014, .26, .225], [-.026, .32, .225], [-.022, .46, .225], [0, .6, .225], [0, .72, .225]],
  camino: [[0, .70, .225], [0, .6, .225], [-.022, .46, .225], [-.026, .32, .225], [-.014, .25, .225]],
};
for (const k in KP) PIPE['k' + k] = sposta(KP[k], KX, KY, ZW);
let bFan = null, fiamma = null;

// 7 ─ Caldaia: scambiatore, bruciatore e ventilatore
const gK = group('kcomb', 'Caldaia: scambiatore e bruciatore', 'Bruciatore premix "Flat" in fibra FeCrAlloy sopra uno scambiatore in lega Al/Si/Mg: i fumi scendono, cedono anche il calore del vapore e risalgono al camino.', 25.5, 31.5, { stage: [.1, .05, 1.1], ex: [.25, .35, .45], az: 22, el: 9, trav: .42,
  keys: [[.03, 26, 10, 1.05, 0], [.3, 12, 5, .62, .03], [.52, 30, 8, .8, .02], [.74, 16, 6, .68, 0], [.92, 24, 9, 1.05, 0]],
  info: { e: 'Il secondo generatore. Brucia il gas e recupera anche il calore del vapore dei fumi: per questo si chiama a condensazione.', s: 'KONm C 24 · scambiatore primario in Al/Si/Mg ultrapiatto · bruciatore premix modulante "Flat" in fibra FeCrAlloy, blocco Quick release · modulazione fino a 1:8 · 22,6 kW utili · rendimento 102,6 % a 50/30 °C · NOx classe 6 · interno dello scambiatore: schema di principio' } });
gK.home = kHome;
{
  const b = node(KX, KY, ZW), o = x => Object.assign({ parent: b }, x), Z = { spin: [0, 0, 0], ease: eoc };
  P(mesh(G.box(.36, .05, .004), M.zinc, 0, .665, .002), o({ d: 0, from: [0, 0, .5], spin: [0, 0, 0], n: 'Dima di fissaggio a parete' }));
  screws([-.15, .15].map(x => ({ p: [x, .665, .005], r: [PI / 2, 0, 0] })), o({ d0: .02, d1: .03 }));
  P(mesh(G.rbox(.34, .42, .05, .018), M.vesK, 0, .42, .036), o({ d: .04, from: [0, 0, .7], spin: [0, 0, 0], dur: .55, n: 'Vaso di espansione 8 l (8)' }));
  P(mesh(G.box(.396, .68, .003), M.backK, 0, .35, .068), o({ d: .07, from: [0, 0, .7], spin: [0, 0, 0], dur: .55, n: 'Schienale zincato' }));
  P(mesh(G.box(.396, .004, .262), M.zinc, 0, .688, .2), o({ d: .09, from: [0, .3, 0], spin: [0, 0, 0] }));
  P(mesh(G.box(.396, .004, .262), M.zinc, 0, .012, .2), o({ d: .1, from: [0, -.3, 0], spin: [0, 0, 0] }));
  // scambiatore/condensatore in alluminio (24), aperto sul davanti finché non arriva la chiusura
  P(mesh(G.box(.19, .29, .012), M.alsi, -.055, .435, .086), o({ d: .13, from: [0, 0, .6], spin: [0, 0, 0], n: 'Scambiatore in Al/Si/Mg (24)' }));
  [-.144, .034].forEach((x, i) => P(mesh(G.box(.012, .29, .088), M.alsi, x, .435, .136), o({ d: .15 + i * .01, from: [x * 2, 0, .3], spin: [0, 0, 0] })));
  P(mesh(G.box(.166, .012, .088), M.alsi, -.055, .296, .136), o({ d: .17, from: [0, -.3, .2], spin: [0, 0, 0] }));
  PIN(G.box(.006, .004, .08), M.alsi, [-.151, .041].flatMap(x => Array.from({ length: 7 }, (_, i) => ({ p: [x, .32 + i * .038, .136] }))), o({ d0: .17, d1: .19, from: [0, 0, .3], spin: [0, 0, 0], snd: 'fin' }));
  const pin = []; for (let r = 0; r < 9; r++) for (let c = 0; c < 8; c++) pin.push({ p: [-.122 + c * .019 + (r % 2 ? .0095 : 0), .322 + r * .0225, .132] });
  PIN(G.cylZ(.0042, .078, 8), M.alsi, pin, o({ d0: .19, d1: .31, dur: .3, from: [0, .02, .4], spin: [0, 0, 0], ease: eoc, n: 'Alettatura a piolini', snd: 'fin' }));
  // raccolta condensa e collettore fumi sotto lo scambiatore
  { const s = new THREE.Shape(); [[-.15, .292], [.04, .292], [.04, .272], [.0, .232], [-.03, .222], [-.13, .248], [-.15, .268]].forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath();
    P(mesh(new THREE.ExtrudeGeometry(s, { depth: .105, bevelEnabled: false }), M.plastic, 0, 0, .082), o({ d: .32, from: [0, -.3, .2], spin: [0, 0, 0], n: 'Raccolta condensa e collettore fumi' })); }
  P(mesh(G.rbox(.014, .02, .016, .003), M.black, -.12, .25, .19), o({ d: .34, n: 'Termostato del collettore fumi (23)' }));
  P(mesh(G.cylZ(.005, .03, 10), M.steel, -.082, .236, .195), o({ d: .35, n: 'Sensore di livello (27)' }));
  // bruciatore premix "Flat" e piastra con blocco Quick release
  P(mesh(G.box(.15, .01, .064), M.fibra, -.055, .55, .132), o({ d: .38, from: [0, .3, .2], spin: [.6, 0, 0], dur: .55, n: 'Bruciatore Flat in fibra FeCrAlloy (5)' }));
  P(mesh(G.box(.3, .022, .09), M.alu, .02, .591, .132), o({ d: .42, from: [0, .3, 0], spin: [0, 0, 0], dur: .5, n: 'Piastra del sistema di combustione' }));
  PIN(G.box(.012, .05, .006), M.zinc, [-.118, -.02, .08, .165].map(x => ({ p: [x, .6, .181] })), o({ d0: .45, d1: .47, from: [0, .1, .25], spin: [1.5, 0, 0], n: 'Blocchi Quick release' }));
  fiamma = mesh(G.box(.142, .036, .058), FIAMMA, -.055, .525, .132); b.add(fiamma);
  // ventilatore modulante (18) con il suo motore, presa d'aria e condotto di miscela
  P(mesh(G.cylX(.06, .048, 32), M.black, .058, .497, .2), o({ d: .5, from: [-.1, 0, .5], spin: [3, 0, 0], dur: .5, n: 'Motore del ventilatore (18)' }));
  PIN(G.rbox(.02, .026, .03, .003), M.white, [.535, .455].map(y => ({ p: [.04, y, .245] })), o({ d0: .52, d1: .53, from: [0, 0, .25] }));
  bFan = new THREE.Group(); bFan.position.set(.106, .497, .2); b.add(bFan);
  P(mesh(G.cylX(.062, .026, 28), M.plastic), { parent: bFan, d: .53, from: [0, 0, .45], spin: [4, 0, 0], n: 'Girante' });
  PIN(G.box(.03, .012, .003), M.plastic, Array.from({ length: 12 }, (_, i) => { const a = i * PI / 6; return { p: [0, Math.cos(a) * .052, Math.sin(a) * .052], r: [a + .5, 0, 0] }; }), { parent: bFan, d0: .54, d1: .55, from: [0, 0, .4], spin: [3, 0, 0], snd: 'fin' });
  P(mesh(G.cylX(.076, .046, 36), M.sBugne, .106, .497, .2), o({ d: .57, from: [.1, 0, .5], spin: [3, 0, 0], dur: .5, n: 'Chiocciola in alluminio' }));
  P(mesh(G.box(.05, .03, .05), M.alu, .106, .574, .168), o({ d: .59, from: [0, .2, .2] }));
  P(mesh(G.cylX(.019, .058, 24), M.alu, .162, .5, .2), o({ d: .6, from: [.3, 0, .1], spin: [4, 0, 0], n: 'Presa d\'aria con miscelatore' }));
  screws([0, 1, 2, 3].map(i => { const a = i * PI / 2 + .6; return { p: [.1295, .497 + Math.cos(a) * .066, .2 + Math.sin(a) * .066], r: [0, 0, -PI / 2] }; }), o({ d0: .61, d1: .63 }));
  // valvola gas elettropneumatica (3) e tubo del gas
  P(mesh(G.rbox(.05, .09, .05, .006), M.zinc, .156, .42, .2), o({ d: .64, from: [.3, 0, .3], spin: [0, 2, 0], n: 'Valvola gas elettropneumatica (3)' }));
  P(mesh(G.rbox(.032, .034, .026, .004), M.red, .156, .428, .237), o({ d: .65, from: [0, 0, .3] }));
  P(mesh(G.cylZ(.011, .012, 16), M.steel, .156, .46, .232), o({ d: .66, from: [0, 0, .3] }));
  P(mesh(G.cyl(.015, .018, 6), M.brass, .156, .366, .2), o({ d: .67, spin: [0, 5, 0], snd: 'screw' }));
  P(mesh(tubeGeo(KP.mix.slice(0, 3), .0055, 16), M.copper), o({ d: .68 }));
  P(mesh(tubeGeo(KP.gas, .0085, 48), M.copper), o({ d: .69, dur: .55, n: 'Tubo del gas' }));
  P(mesh(G.cylZ(.02, .016, 20), M.plastic, .119, .661, .08), o({ d: .71, n: 'Pressostato del ventilatore (19)' }));
  P(mesh(tubeGeo([[.119, .661, .09], [.13, .62, .13], [.125, .575, .18]], .003, 14), M.rubber), o({ d: .72 }));
  // chiusura dello scambiatore, piastra con le bugne, elettrodo
  P(mesh(G.box(.19, .29, .012), M.sAlsi, -.055, .435, .176), o(Object.assign({ d: .76, from: [0, 0, .5], dur: .6, n: 'Chiusura dello scambiatore' }, Z)));
  P(mesh(G.rbox(.066, .236, .006, .003), M.sBugne, -.072, .418, .185), o(Object.assign({ d: .79, from: [0, 0, .45], n: 'Piastra di ispezione' }, Z)));
  PIN(G.cylZ(.0095, .006, 16, .0075), M.sBugne, [-.0835, -.0607].flatMap(x => Array.from({ length: 8 }, (_, i) => ({ p: [x, .324 + i * .0274, .19] }))), o({ d0: .8, d1: .83, from: [0, 0, .4], spin: [0, 0, 2], snd: 'fin' }));
  PIN(G.box(.012, .05, .005), M.zinc, [[-.108, .545], [-.1, .33]].map(a => ({ p: [a[0], a[1], .19] })), o({ d0: .84, d1: .85, from: [0, 0, .25], spin: [1, 0, 0] }));
  P(mesh(G.cylZ(.0065, .03, 12), M.white, -.089, .545, .2), o({ d: .86, from: [0, 0, .3], n: 'Elettrodo di accensione e rilevazione (4)' }));
  P(mesh(G.cylZ(.009, .024, 12, .006), M.wRed, -.089, .545, .225), o({ d: .87, from: [0, 0, .3] }));
  // condotto fumi bianco, dal collettore in basso fino allo scarico in alto
  P(mesh(new THREE.TubeGeometry(curveOf(KP.camino), 40, .029, 20, false), M.sPP), o(Object.assign({ d: .9, from: [0, .15, .6], dur: .65, n: 'Condotto fumi' }, Z)));
  P(mesh(G.cyl(.036, .03, 24), M.grey, -.012, .227, .225), o({ d: .93, from: [0, -.2, .3], spin: [0, 3, 0] }));
  // sfiato (25), tubo di mandata con termostato di sicurezza (10) e sonda (11)
  P(mesh(tubeGeo(KP.flow, .011, 80), M.copper), o({ d: .94, dur: .55, n: 'Tubo di mandata' }));
  P(mesh(G.cyl(.011, .05, 14), M.copper, -.165, .6, .13), o({ d: .95 }));
  P(mesh(G.cyl(.017, .05, 18), M.brass, -.165, .64, .13), o({ d: .96, n: 'Valvola di sfiato (25)' }));
  P(mesh(G.cyl(.008, .016, 10), M.brass, -.165, .672, .13), o({ d: .965 }));
  P(mesh(G.rbox(.022, .016, .02, .003), M.black, -.165, .551, .148), o({ d: .97, n: 'Termostato di sicurezza (10)' }));
  P(mesh(G.rbox(.014, .02, .016, .003), M.wRed, -.165, .519, .146), o({ d: .98, n: 'Sensore temperatura riscaldamento (11)' }));
}

// 8 ─ Caldaia: gruppo idraulico
group('khyd', 'Caldaia: gruppo idraulico', 'Circolatore modulante con disaeratore, valvola deviatrice, scambiatore sanitario a 12 piastre e sifone della condensa. Qui la caldaia fa solo riscaldamento.', 31.5, 35.0, { stage: [0, 0, 0], ex: [.2, -.4, .5],     // al suo posto: arrivando in blocco da davanti attraversava condotto fumi e tubo del gas
   az: 14, el: 2, zoom: 1.0,
  info: { e: 'La parte bassa: la pompa che spinge l\'acqua nello scambiatore, le valvole e lo scarico della condensa.', s: 'Circolatore modulante ad alta efficienza con disaeratore, by-pass e valvola di sicurezza · valvola deviatrice · scambiatore sanitario a 12 piastre inox AISI 316L · sifone · attacchi a 207 mm dalla parete: C e F G½, G, R e M G¾ · con il kit HYBREER C e F restano chiusi' } }).home = kHome;
{
  const b = node(KX, KY, ZW), o = x => Object.assign({ parent: b }, x);
  // circolatore (12)
  P(mesh(G.cylZ(.04, .05, 28), M.cast, .081, .1, .17), o({ d: 0, n: 'Circolatore modulante (12)' }));
  P(mesh(G.cyl(.02, .1, 18), M.cast, .081, .105, .17), o({ d: .02 }));
  P(mesh(G.cylZ(.036, .06, 28), M.black, .081, .1, .225), o({ d: .04, from: [0, 0, .4], spin: [0, 0, 3] }));
  P(mesh(G.rbox(.076, .062, .04, .006), M.grey, .081, .118, .272), o({ d: .06, from: [0, 0, .4], n: 'Elettronica del circolatore' }));
  P(mesh(G.cyl(.012, .03, 12), M.brass, .081, .168, .17), o({ d: .08, n: 'Disaeratore' }));
  P(mesh(tubeGeo(KP.ret1, .011, 24), M.copper), o({ d: .1, n: 'Ritorno dall\'impianto' }));
  P(mesh(tubeGeo(KP.ret2, .011, 44), M.copper), o({ d: .14, dur: .5 }));
  P(mesh(G.rbox(.014, .02, .016, .003), M.wBlue, -.074, .185, .146), o({ d: .18, n: 'Sensore temperatura ritorno (22)' }));
  P(mesh(G.cylZ(.017, .02, 18), M.black, -.125, .192, .178), o({ d: .2, n: 'Pressostato mancanza acqua (13)' }));
  // valvola deviatrice (16) e mandata
  P(mesh(G.rbox(.042, .05, .042, .005), M.brass, .151, .045, .19), o({ d: .24, n: 'Valvola deviatrice (16)' }));
  P(mesh(G.cylZ(.02, .042, 18), M.white, .151, .05, .232), o({ d: .26, from: [0, 0, .3], spin: [0, 0, 3] }));
  P(mesh(tubeGeo(KP.mOut, .011, 16), M.copper), o({ d: .28 }));
  // scambiatore a piastre sanitario (17): 12 piastre
  P(mesh(G.box(.19, .076, .003), M.steel, .03, .046, .0815), o({ d: .3, from: [0, 0, -.2], spin: [0, 0, 0] }));
  PIN(G.box(.19, .076, .0019), M.inox, Array.from({ length: 12 }, (_, i) => ({ p: [.03, .046, .0845 + i * .0027] })), o({ d0: .32, d1: .44, dur: .3, from: [0, -.05, .4], spin: [0, 0, 0], ease: eoc, n: 'Scambiatore sanitario a 12 piastre (17)', snd: 'fin' }));
  P(mesh(G.box(.19, .076, .003), M.steel, .03, .046, .1185), o({ d: .46, from: [0, 0, .3], spin: [0, 0, 0] }));
  P(mesh(tubeGeo([[.151, .04, .17], [.14, .05, .135], [.11, .055, .12]], .008, 16), M.copper), o({ d: .48 }));
  P(mesh(tubeGeo([[-.04, .03, .12], [.02, .012, .15], [.06, .025, .18], [.079, .04, .2]], .008, 20), M.copper), o({ d: .5 }));
  // valvola di sicurezza (20), sifone (26)
  P(mesh(G.cylZ(.012, .04, 14), M.brass, .118, .028, .245), o({ d: .53, n: 'Valvola di sicurezza (20)' }));
  P(mesh(G.cylZ(.016, .016, 16), M.red, .118, .028, .272), o({ d: .54 }));
  P(mesh(G.cyl(.03, .15, 24), M.sPP, -.005, .125, .225), o({ d: .57, from: [0, -.3, .2], spin: [0, 2, 0], n: 'Sifone della condensa (26)' }));
  P(mesh(G.cyl(.032, .014, 24), M.grey, -.005, .046, .225), o({ d: .59, from: [0, -.3, .2] }));
  P(mesh(tubeGeo([[-.005, .04, .225], [.0, .0, .22], [.012, -.035, .2]], .009, 14), M.grey), o({ d: .6 }));
  // sanitario: flussostato con filtro (2), sonda (1); resta chiuso con il kit HYBREER
  P(mesh(G.cyl(.014, .05, 14), M.brass, KA.F, .04, KZ), o({ d: .63, n: 'Flussostato con filtro acqua fredda (2)' }));
  P(mesh(G.rbox(.02, .024, .02, .003), M.black, KA.F - .016, .046, KZ), o({ d: .64 }));
  P(mesh(tubeGeo([[KA.F, .065, KZ], [-.1, .09, .17], [-.07, .085, .135], [-.05, .07, .122]], .008, 22), M.copper), o({ d: .66 }));
  P(mesh(tubeGeo([[-.06, .03, .122], [-.11, .03, .15], [-.16, .03, .19], [KA.C, .01, KZ], [KA.C, -.03, KZ]], .008, 26), M.copper), o({ d: .68 }));
  P(mesh(G.rbox(.014, .02, .016, .003), M.wRed, -.172, .11, .15), o({ d: .7, n: 'Sensore temperatura sanitario (1)' }));
  P(mesh(G.cyl(.014, .018, 14), M.black, -.005, -.024, .19), o({ d: .72, n: 'Rubinetto di carico (15)' }));
  // attacchi sotto, alle quote di p.12
  Object.entries(KA).forEach(([k, x], i) => { const r = k === 'C' || k === 'F' ? .0105 : .0128;
    P(mesh(G.cyl(r, .04, 16), M.brass, x, -.025, KZ), o({ d: .75 + i * .02, from: [0, -.25, 0], spin: [0, 4, 0], n: i ? null : 'Attacchi C · F · G · R · M' }));
    P(mesh(G.cyl(r + .006, .012, 6), k === 'G' ? M.wYel : M.brass, x, -.012, KZ), o({ d: .76 + i * .02, from: [0, -.25, 0], spin: [0, 6, 0], snd: 'screw' })); });
  PIN(G.cyl(.012, .012, 6), M.black, [KA.C, KA.F].map(x => ({ p: [x, -.05, KZ] })), o({ d0: .86, d1: .87, from: [0, -.2, 0], spin: [0, 5, 0], n: 'Tappi su C e F: solo riscaldamento', snd: 'screw' }));
  // cavi
  P(mesh(tubeGeo([[-.089, .545, .236], [-.06, .46, .25], [.03, .33, .255], [.1, .2, .26], [.06, .13, .29]], .0035, 36), M.wRed), o({ d: .9, dur: .5, n: 'Cablaggi' }));
  P(mesh(tubeGeo([[.156, .43, .25], [.1, .42, .262], [.03, .3, .262], [.0, .15, .27]], .004, 30), M.plastic), o({ d: .93, dur: .5 }));
  P(mesh(tubeGeo([[-.165, .52, .155], [-.145, .4, .19], [-.12, .25, .2], [-.09, .13, .25]], .0025, 30), M.wBlue), o({ d: .96, dur: .5 }));
}

// 9 ─ Caldaia: quadro comandi e mantello
group('kshell', 'Caldaia: quadro e mantello', 'Pannello comandi con due manopole, display e manometro; mantello bianco. Sopra, lo scarico fumi coassiale al centro.', 35.0, 38.0, { stage: [0, 0, 0], ex: [0, 0, 0], az: 16, el: 8, zoom: 1,
  info: { e: 'Il vestito della caldaia, con i comandi: sul display compare la fiamma quando il bruciatore è acceso.', s: 'KONm C 24 · 700 × 420 × 345 mm · 34 kg · IP X5D · manutenzione "Pit stop" · pannello: manometro, selettore estate/inverno e temperatura riscaldamento, temperatura sanitario, sblocco, display' } }).home = kHome;
{
  const b = node(KX, KY, ZW), o = x => Object.assign({ parent: b }, x), F0 = { spin: [0, 0, 0], ease: eoc };
  // fianchi del telaio
  [-1, 1].forEach((s, i) => { P(mesh(G.rbox(.012, .7, .262, .004), M.sWhite, s * .204, .35, .2), o(Object.assign({ d: i * .03, from: [s * .5, 0, 0], k: [s * .55, 0, 0], dur: .55, n: i ? null : 'Fianchi del telaio' }, F0)));
    P(mesh(G.box(.026, .7, .008), M.sWhite, s * .197, .35, .327), o(Object.assign({ d: .06 + i * .02, from: [s * .3, 0, .3], k: [s * .55, 0, .1] }, F0))); });
  screws([-1, 1].flatMap(s => [.05, .25, .45, .65].map(y => ({ p: [s * .197, y, .331], r: [PI / 2, 0, 0] }))), o({ d0: .1, d1: .18, mat: M.sScrew, k: (i, it) => [it.p[0] * 2.8, 0, .16], n: 'Viti del telaio' }));
  P(mesh(G.plane(.1, .058), M.sKLabel, .2105, .3, .2, 0, PI / 2, 0), o(Object.assign({ d: .2, from: [.5, 0, 0], k: [.55, 0, 0], n: 'Targhetta' }, F0)));
  // scheda e morsettiera dietro il pannello
  P(mesh(G.box(.2, .07, .003), M.pcb, 0, .07, .262), o({ d: .22, from: [0, 0, .35], spin: [0, 0, 0], k: [0, -.25, .25], n: 'Scheda elettronica' }));
  PIN(G.box(.011, .016, .014), M.term, Array.from({ length: 6 }, (_, i) => ({ p: [.09 + i * .012, .11, .268] })), o({ d0: .25, d1: .28, from: [0, 0, .25], spin: [0, 0, 0], k: [0, -.2, .3], n: 'Morsettiera SE · TA1/OT · TA2', snd: 'fin' }));
  // pannello comandi (manuale utente §6.1)
  { const s = new THREE.Shape(); s.moveTo(-.172, 0); s.lineTo(.172, 0); s.lineTo(.172, .084); s.quadraticCurveTo(0, .122, -.172, .084); s.closePath();
    P(mesh(new THREE.ExtrudeGeometry(s, { depth: .058, bevelEnabled: false, curveSegments: 20 }), M.sWhite, 0, .016, .282), o(Object.assign({ d: .32, from: [0, -.1, .55], k: [0, -.3, .5], dur: .6, n: 'Pannello comandi' }, F0))); }
  P(mesh(G.plane(.3, .075), M.sKPanel, 0, .062, .3406), o(Object.assign({ d: .32, from: [0, -.1, .55], k: [0, -.3, .5], dur: .6 }, F0)));
  [[-.0768, 'Temperatura riscaldamento ed estate/inverno (B)'], [-.0343, 'Temperatura acqua calda (C)']].forEach(([x, n], i) => {
    P(mesh(G.cylZ(.0125, .013, 24), M.white, x, .0546, .347), o({ d: .4 + i * .03, from: [0, 0, .3], spin: [0, 0, 4], k: [0, -.3, .62], n }));
    P(mesh(G.box(.003, .013, .002), M.wRed, x, .0586, .3545), o({ d: .41 + i * .03, from: [0, 0, .3], spin: [0, 0, 4], k: [0, -.3, .62] })); });
  P(mesh(G.cylZ(.0045, .004, 14), M.grey, -.115, .0546, .342), o({ d: .46, from: [0, 0, .3], k: [0, -.3, .6], n: 'Pulsante di sblocco (D)' }));
  P(mesh(G.plane(.044, .044), M.lcd, .011, .058, .3412), o({ d: .48, from: [0, 0, .3], spin: [0, 0, 0], k: [0, -.3, .6], n: 'Display (E)' }));
  P(mesh(G.cylZ(.019, .008, 28), M.white, .118, .056, .344), o({ d: .5, from: [0, 0, .3], spin: [0, 0, 3], k: [0, -.3, .62], n: 'Manometro (A)' }));
  P(mesh(new THREE.CircleGeometry(.0165, 28), M.gauge, .118, .056, .3484), o({ d: .51, from: [0, 0, .3], spin: [0, 0, 0], k: [0, -.3, .62] }));
  // coperchio con scarico fumi coassiale al centro (225 mm dalla parete) e due prese laterali (±125 mm, 205 mm)
  P(mesh(G.rbox(.42, .012, .34, .004), M.sWhite, 0, .694, .175), o(Object.assign({ d: .56, from: [0, .5, 0], k: [0, .55, 0], dur: .6, n: 'Coperchio' }, F0)));
  P(mesh(annulus(.052, .031, .034), M.white, 0, .716, .225), o({ d: .6, from: [0, .3, 0], spin: [0, 3, 0], k: [0, .65, 0], n: 'Scarico fumi coassiale Ø 60/100' }));
  P(mesh(annulus(.031, .0285, .05), M.sPP, 0, .722, .225), o({ d: .61, from: [0, .3, 0], spin: [0, 3, 0], k: [0, .7, 0] }));
  PIN(G.cyl(.04, .006, 28), M.grey, [-.125, .125].map(x => ({ p: [x, .703, .205] })), o({ d0: .63, d1: .65, from: [0, .3, .25], spin: [0, 2, 0], ease: eoc, k: [0, .6, 0], n: 'Prese laterali chiuse' }));
  P(mesh(G.box(.396, .004, .262), M.sGrid, 0, .004, .2), o(Object.assign({ d: .68, from: [0, -.3, 0], k: [0, -.6, 0] }, F0)));
  // mantello
  P(mesh(G.rbox(.42, .585, .012, .005), M.sWhite, 0, .4075, .339), o(Object.assign({ d: .74, from: [0, .1, .7], k: [0, .12, .75], dur: .7, n: 'Mantello' }, F0)));
  P(mesh(G.rbox(.33, .49, .005, .002), M.sWhite, 0, .425, .3465), o(Object.assign({ d: .74, from: [0, .1, .7], k: [0, .12, .75], dur: .7 }, F0)));
  screws([-.16, .16].map(x => ({ p: [x, .125, .346], r: [PI / 2, 0, 0] })), o({ d0: .92, d1: .96, mat: M.sScrew, k: [0, .12, .85], n: 'Viti del mantello' }));
}
