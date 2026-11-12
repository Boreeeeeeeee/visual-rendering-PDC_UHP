
// ───────── la macchina: Unical UHP 100÷160T (dati UHP 120) ─────────
// Quote dal manuale di installazione 00341518 §5.5.2: A 1280, C 450, F 1040, G 72, D 94, E 81, H 784. Metri, X larghezza, Y alto, Z verso il fronte.
const Wd = 1.28, Dp = .45, Y0 = .036, YB = .081, YT = 1.076, XL = -.64, XR = .64, ZB = -.225, ZF = .225, XP = .19;
const HP = YT - .03 - YB, YC = YB + HP / 2;
const FAN = { x: -.215, y: .565, r: .30 };
const PIPE = {};
const qBasis = (x, y) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, V().crossVectors(x, y)));

// 1 ─ Basamento e telaio
group('base', 'Basamento', 'Fondo che raccoglie la condensa, cavo scaldante antigelo e quattro antivibranti.', 3.5, 6.0, { stage: [0, .2, .7], ex: [0, -.28, 0], az: 24, el: 24, zoom: .8,
  info: { e: 'Il pavimento della macchina. Raccoglie l\'acqua che si forma sulla batteria e la porta allo scarico.', s: 'Cavo scaldante sul fondo contro il ghiaccio · 4 antivibranti · attacchi acqua G 1"' } });
{
  const feet = []; for (const x of [-.392, .392]) for (const z of [-.19, .19]) feet.push({ p: [x, .018, z] });
  PIN(G.cyl(.027, .036, 20, .021), M.rubber, feet, { d0: 0, d1: .08, from: [0, -.22, 0], spin: [0, 2, 0], n: 'Antivibranti' });
  [-.392, .392].forEach((x, i) => P(mesh(G.rbox(.06, .03, .5, .004), M.dark, x, Y0 + .015, 0), { d: .1 + i * .05, from: [x * .6, .25, 0], spin: [0, .8, 0], n: 'Piedi' }));
  P(mesh(G.rbox(Wd, .015, Dp, .005), M.basePlate, 0, YB - .0075, 0), { d: .22, from: [0, .45, .1], spin: [.5, 0, 0], dur: .6, n: 'Fondo stampato' });
  P(mesh(G.box(Wd, .028, .004), M.dark, 0, YB + .014, ZF - .002), { d: .3, from: [0, 0, .3], spin: [0, 0, 0] });
  P(mesh(G.box(Wd, .028, .004), M.dark, 0, YB + .014, ZB + .002), { d: .32, from: [0, 0, -.3], spin: [0, 0, 0] });
  P(mesh(G.box(.004, .028, Dp), M.dark, XL + .002, YB + .014, 0), { d: .34, from: [-.3, 0, 0], spin: [0, 0, 0] });
  P(mesh(G.box(.004, .028, Dp), M.dark, XR - .002, YB + .014, 0), { d: .36, from: [.3, 0, 0], spin: [0, 0, 0] });
  const y = YB + .005;
  P(mesh(tubeGeo([[.14, y, -.195], [-.55, y, -.195], [-.605, y, -.15], [-.605, y, .13], [-.57, y, .17], [-.52, y, .13], [-.52, y, -.11], [-.47, y, -.15], [.14, y, -.15]], .0042, 120), M.heater), { d: .44, from: [0, .3, 0], spin: [0, 0, 0], dur: .55, n: 'Cavo scaldante antigelo' });
  P(mesh(annulus(.017, .009, .005), M.term, -.3, YB + .003, .13), { d: .5, n: 'Scarico condensa' });
  P(mesh(G.cyl(.012, .034, 14), M.term, -.3, YB - .032, .13), { d: .52, from: [0, -.2, 0] });
  P(mesh(G.box(.004, HP - .03, .4), M.galv, XP, YC - .005, 0), { d: .56, from: [0, .5, 0], spin: [0, .5, 0], dur: .55, n: 'Paratia del vano tecnico' });
  [[XR - .015, ZB + .015], [XR - .015, ZF - .015], [XL + .015, ZB + .015]].forEach((p, i) => P(mesh(G.box(.026, HP, .026), M.dark, p[0], YC, p[1]), { d: .62 + i * .04, from: [0, .5, 0], spin: [0, 1.5, 0], n: i ? null : 'Montanti' }));
  [ZF - .012, ZB + .012].forEach((z, i) => P(mesh(G.box(Wd - .06, .018, .018), M.dark, 0, YT - .045, z), { d: .76 + i * .04, from: [0, .3, z * 1.5], spin: [.8, 0, 0] }));
  const sc = []; for (const x of [-.5, -.17, .17, .5]) for (const z of [-.17, .17]) sc.push({ p: [x, YB + .001, z] });
  screws(sc, { d0: .84, d1: 1, n: 'Viti del fondo' });
}

// 2 ─ Compressore twin rotary (in sezione finché non arriva lo sportello)
const gC = group('comp', 'Compressore twin rotary', 'DC inverter a due camere di compressione, su piattaforma antivibrante e con doppio rivestimento termoacustico.', 6.0, 13.5, { stage: [.5, .18, .95], ex: [.2, 0, .8], az: 38, el: 12, trav: .5,
  keys: [[.03, 40, 16, 1.05, 0], [.3, 30, 9, .62, -.07], [.5, 46, 12, .9, 0], [.72, 34, 7, .7, -.02], [.9, 44, 12, 1.1, 0]],
  info: { e: 'Il cuore. Schiaccia il gas propano e lo scalda: è da qui che parte il calore per la casa.', s: 'Twin rotary DC inverter · due camere di compressione · doppio rivestimento termoacustico · protezione sullo scarico a 115 °C' } });
const cmp = new THREE.Group(); cmp.position.set(.315, YB, -.035); gC.node.add(cmp);
const crank = new THREE.Group(); cmp.add(crank);
{
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
    cp(mesh(annulus(.058, .0405, .024), M.cast, 0, y, 0), { d: d + .05, n: y < .12 ? 'Cilindro inferiore' : 'Cilindro superiore' });
    cp(mesh(G.box(.02, .02, .004), M.steel, .049 * Math.sin(rad(215)), y, .049 * Math.cos(rad(215)), 0, rad(215 - 90), 0), { d: d + .07 });
  });
  cp(mesh(annulus(.058, .013, .007), M.steel, 0, .1205, 0), { d: .33, n: 'Piastra intermedia' });
  cp(mesh(G.cyl(.05, .012, 32), M.cast, 0, .154, 0), { d: .45, n: 'Supporto superiore' });
  cp(mesh(G.cyl(.042, .018, 28, .034), M.steel, 0, .169, 0), { d: .47, n: 'Silenziatore' });
  ck(mesh(G.cyl(.0345, .075, 36), M.lam, 0, .235, 0), { d: .49, n: 'Rotore' });
  ck(mesh(annulus(.0345, .018, .008, 0, PI), M.brass, 0, .2765, 0), { d: .5 });
  ck(mesh(annulus(.0345, .018, .008, PI, PI * 2), M.brass, 0, .1935, 0), { d: .5 });
  cp(mesh(annulus(.0615, .0375, .075), M.lam, 0, .235, 0), { d: .52, from: [0, .45, 0], spin: [0, 1.5, 0], dur: .6, n: 'Statore' });
  [.283, .187].forEach((y, i) => cp(mesh(G.torus(.0495, .0115), M.copper, 0, y, 0, PI / 2, 0, 0), { d: .54 + i * .01, n: i ? null : 'Avvolgimenti in rame' }));
  cp(mesh(G.open(.066, .26, PI / 2, rad(250)), M.shellC, 0, .205, 0), { d: .56, from: [-.2, .35, -.25], spin: [0, 2.5, 0], dur: .65, n: 'Mantello' });
  // separatore di liquido con le due aspirazioni (una per camera)
  cp(mesh(G.cyl(.03, .19, 28), M.shellC, -.06, .225, .13), { d: .6, n: 'Separatore di liquido' });
  cp(mesh(G.dome(.03, .5), M.shellC, -.06, .32, .13), { d: .61 }); cp(mesh(G.dome(.03, .5, false), M.shellC, -.06, .13, .13), { d: .61 });
  cp(mesh(annulus(.0325, .03, .014), M.steel, -.06, .25, .13), { d: .62 });
  [[.105, .64], [.136, .66]].forEach(([y, d], i) => cp(mesh(tubeGeo([[-.06 + (i ? .012 : -.012), .118, .13], [-.06 + (i ? .012 : -.012), y - .012, .12], [-.05, y, .1], [-.028, y, .06]], .0062, 28), M.copper), { d, n: i ? null : 'Due aspirazioni' }));
  cp(mesh(G.cyl(.008, .05, 14), M.copper, -.06, .36, .13), { d: .66 });
  cp(mesh(G.dome(.066, .45), M.shellC, 0, .335, 0), { d: .68, from: [0, .4, 0], spin: [0, 2, 0], n: 'Calotta' });
  cp(mesh(G.rbox(.052, .03, .05, .006), M.plastic, .012, .366, .026), { d: .7, n: 'Scatola morsetti' });
  cp(mesh(G.cyl(.008, .06, 14), M.copper, -.02, .385, -.02), { d: .72, n: 'Mandata' });
  cp(mesh(annulus(.0695, .066, .022), M.heater, 0, .068, 0), { d: .74, n: 'Riscaldatore del carter' });
  const dn = [Math.sin(rad(35)), 0, Math.cos(rad(35))];
  cp(mesh(G.open(.066, .26, rad(-20), rad(110)), M.sDoor, 0, .205, 0), { d: .84, from: [dn[0] * .3, .04, dn[2] * .3], spin: [0, 0, 0], dur: .6, ease: eoc, n: 'Chiusura del mantello' });
  cp(mesh(G.open(.0725, .275, PI / 2, PI), M.sFelt, 0, .2, 0), { d: .88, from: [0, 0, -.35], spin: [0, 0, 0], ease: eoc, n: 'Primo strato fonoassorbente' });
  cp(mesh(G.open(.0725, .275, -PI / 2, PI), M.sFelt, 0, .2, 0), { d: .89, from: [0, 0, .35], spin: [0, 0, 0], ease: eoc });
  cp(mesh(G.open(.0785, .285, 0, PI), M.sJacket, 0, .2, 0), { d: .92, from: [.35, 0, 0], spin: [0, 0, 0], ease: eoc, n: 'Secondo strato termoacustico' });
  cp(mesh(G.open(.0785, .285, PI, PI), M.sJacket, 0, .2, 0), { d: .93, from: [-.35, 0, 0], spin: [0, 0, 0], ease: eoc });
  cp(mesh(annulus(.0785, .034, .01), M.sJacket, 0, .345, 0), { d: .95, from: [0, .3, 0], spin: [0, 0, 0] });
  cp(mesh(annulus(.0805, .0785, .022), M.sFelt, 0, .25, 0), { d: .97, from: [0, .3, 0], spin: [0, 3, 0] });
}
PIPE.comp = [[-.06, .4, .13], [-.06, .3, .13], [-.06, .14, .13], [-.05, .112, .1], [-.028, .118, .06], [0, .12, .01], [.012, .16, -.01], [0, .21, .012], [-.012, .27, 0], [0, .32, -.01], [-.02, .36, -.02], [-.02, .42, -.02]];

// 3 ─ Batteria alettata a L (schiena e fianco sinistro)
const cy0 = YB + .03, cH = .87, cyc = cy0 + cH / 2;
group('coil', 'Batteria alettata', 'Tubi in rame e alette in alluminio con trattamento anticorrosione GOLD-FIN, su più ranghi.', 13.5, 18, { stage: [-.2, .25, -1.05], ex: [-.1, 0, -.75], az: 152, el: 13, zoom: .95,
  info: { e: 'Il polmone. L\'aria esterna passa tra le alette e cede il suo calore al gas, anche sotto zero.', s: 'Tubi in rame · alette in alluminio GOLD-FIN · ranghi multipli · sbrinamento automatico' } });
{
  P(mesh(G.box(.004, cH + .02, .062), M.galv, .166, cyc, -.185), { d: 0, from: [.4, 0, 0], spin: [0, 0, 0], n: 'Piastre tubiere' });
  P(mesh(G.box(.062, cH + .02, .004), M.galv, -.605, cyc, .15), { d: .03, from: [0, 0, .4], spin: [0, 0, 0] });
  const rows = [[-.198, -.618, .035, .25], [-.172, -.592, .02, .75]], pitch = cH / 14;
  const tgeo = (zb, xs, rho) => { const c = new THREE.CurvePath(); c.add(new THREE.LineCurve3(V(.163, 0, zb), V(xs + rho, 0, zb))); c.add(new THREE.QuadraticBezierCurve3(V(xs + rho, 0, zb), V(xs, 0, zb), V(xs, 0, zb + rho))); c.add(new THREE.LineCurve3(V(xs, 0, zb + rho), V(xs, 0, .148))); return new THREE.TubeGeometry(c, 56, .0048, 8, false); };
  rows.forEach(([zb, xs, rho, o], r) => PIN(tgeo(zb, xs, rho), M.copper, Array.from({ length: 14 }, (_, i) => ({ p: [0, cy0 + pitch * (i + o), 0] })), { d0: .05 + r * .1, d1: .15 + r * .1, from: [.8, 0, 0], spin: [0, 0, 0], dur: .45, ease: eoc, n: r ? null : 'Tubi in rame' }));
  const ya = i => cy0 + pitch * (i + .25), yb = i => cy0 + pitch * (i + .75);
  const bend = (A, B, out) => { const x = B.clone().sub(A), L = x.length(); return { p: A.clone().add(B).multiplyScalar(.5).toArray(), q: qBasis(x.normalize(), out), L }; };
  const b1 = Array.from({ length: 14 }, (_, i) => bend(V(.165, ya(i), -.198), V(.165, yb(i), -.172), V(1, 0, 0)));
  const b2 = Array.from({ length: 14 }, (_, i) => bend(V(-.618, ya(i), .15), V(-.592, yb(i), .15), V(0, 0, 1)));
  PIN(G.torus(b1[0].L / 2, .0048, PI, 14), M.copper, b1, { d0: .26, d1: .3, from: [.25, 0, 0], spin: [0, 0, 0], n: 'Curve di ritorno' });
  PIN(G.torus(b2[0].L / 2, .0048, PI, 14), M.copper, b2, { d0: .28, d1: .32, from: [0, 0, .25], spin: [0, 0, 0] });
  const fb = [], nb = 200; for (let i = 0; i < nb; i++) fb.push({ p: [.155 - i * .0036, cyc, -.185] });
  PIN(G.box(.0011, cH, .054), M.gold, fb, { d0: .3, d1: .64, dur: .36, from: [0, .7, 0], spin: [0, 0, 0], ease: eoc, n: 'Alette GOLD-FIN', snd: 'fin' });
  const fc = []; for (let i = 1; i <= 9; i++) { const a = i / 10 * PI / 2; fc.push({ p: [-.565 - .04 * Math.sin(a), cyc, -.145 - .04 * Math.cos(a)], r: [0, a, 0] }); }
  PIN(G.box(.0011, cH, .054), M.gold, fc, { d0: .64, d1: .67, dur: .36, from: [0, .7, 0], spin: [0, 0, 0], ease: eoc, snd: 'fin' });
  const fs = [], ns = 82; for (let i = 0; i < ns; i++) fs.push({ p: [-.605, cyc, -.148 + i * .0036] });
  PIN(G.box(.054, cH, .0011), M.gold, fs, { d0: .67, d1: .8, dur: .36, from: [0, .7, 0], spin: [0, 0, 0], ease: eoc, snd: 'fin' });
  P(mesh(G.cyl(.011, .7, 16), M.copper, .186, cyc, -.148), { d: .83, from: [.3, 0, .2], n: 'Collettore' });
  P(mesh(G.cyl(.006, .034, 14, .013), M.brass, .186, YB + .12, -.203), { d: .86, n: 'Distributore' });
  [1, 4, 7, 10, 13].forEach((k, i) => P(mesh(tubeGeo([[.186, YB + .138, -.203], [.2 + i * .004, YB + .2 + i * .02, -.2], [.185, ya(k) - .03, -.2], [.167, ya(k), -.198]], .0026, 24), M.copper), { d: .88 + i * .012, n: i ? null : 'Capillari' }));
  P(mesh(G.rbox(.014, .03, .012, .003), M.plastic, .16, YB + .2, -.153), { d: .95, n: 'Sonda di sbrinamento' });
}

// 4 ─ Ventilatore
const fanRot = new THREE.Group();
group('fan', 'Ventilatore', 'Motore DC inverter brushless, pale a profilo antiriflusso per ridurre il rumore.', 18, 21, { stage: [-.15, .1, 1.0], ex: [0, 0, .5], az: 318, el: 10, zoom: 1.0,
  info: { e: 'Aspira l\'aria attraverso la batteria. Cambia velocità da solo, in base a quanto calore serve.', s: 'Motore DC inverter brushless · profilo antiriflusso · potenza sonora 58 dB(A), 45 dB(A) a 1 m (UHP 120)' } });
{
  [-.12, .12].forEach((dx, i) => P(mesh(G.box(.03, HP - .04, .012), M.galv, FAN.x + dx, YC - .01, -.058), { d: i * .05, from: [0, .5, 0], spin: [0, 1, 0], n: i ? null : 'Montanti del motore' }));
  P(mesh(G.box(.3, .15, .004), M.galv, FAN.x, FAN.y, -.05), { d: .12, spin: [0, 0, 1] });
  P(mesh(G.cylZ(.058, .075, 32), M.black, FAN.x, FAN.y, -.008), { d: .2, from: [0, .1, .45], spin: [0, 0, 3], dur: .55, n: 'Motore DC brushless' });
  P(mesh(G.cylZ(.047, .012, 32, .04), M.alu, FAN.x, FAN.y, .035), { d: .26, from: [0, 0, .4], spin: [0, 0, 2] });
  P(mesh(G.cylZ(.006, .05, 12), M.steel, FAN.x, FAN.y, .06), { d: .3, from: [0, 0, .4], spin: [0, 0, 6] });
  screws([[-.11, -.05], [.11, -.05], [-.11, .05], [.11, .05]].map(a => ({ p: [FAN.x + a[0], FAN.y + a[1], -.047], r: [PI / 2, 0, 0] })), { d0: .34, d1: .4 });
  fanRot.position.set(FAN.x, FAN.y, .09); CUR.node.add(fanRot);
  P(mesh(G.cylZ(.062, .056, 36), M.plastic), { parent: fanRot, d: .46, from: [0, 0, .5], spin: [0, 0, 4], n: 'Mozzo' });
  P(mesh(G.cylZ(.034, .012, 24, .028), M.alu, 0, 0, .033), { parent: fanRot, d: .5, from: [0, 0, .5], spin: [0, 0, 4] });
  const bs = new THREE.Shape(); bs.moveTo(-.04, .05); bs.quadraticCurveTo(-.135, .09, -.15, .245); bs.quadraticCurveTo(-.06, .306, .045, .287); bs.quadraticCurveTo(.108, .16, .04, .05); bs.closePath();
  const bg = new THREE.ExtrudeGeometry(bs, { depth: .004, bevelEnabled: false, curveSegments: 16 }); bg.translate(0, 0, -.002);
  { const p = bg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = rad(lerp(36, 17, clamp((y - .05) / .24))); p.setXYZ(i, x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)); } bg.computeVertexNormals(); }
  for (let i = 0; i < 3; i++) P(mesh(bg, M.blade, 0, 0, 0, 0, 0, i * PI * 2 / 3), { parent: fanRot, d: .56 + i * .07, from: [Math.sin(i * 2.1) * .35, Math.cos(i * 2.1) * .35, .3], spin: [0, 1.5, 1], dur: .55, n: i ? null : 'Pale antiriflusso' });
  P(mesh(G.torus(.312, .011), M.plastic, FAN.x, FAN.y, .196), { d: .84, from: [0, 0, .5], spin: [0, 0, 2], dur: .55, n: 'Convogliatore' });
  P(mesh(tubeGeo([[FAN.x + .05, FAN.y + .02, -.035], [FAN.x + .2, FAN.y + .26, -.08], [XP - .02, .9, -.06], [XP + .01, .95, -.06]], .004, 30), M.plastic), { d: .92, n: 'Cablaggio' });
}

// 5 ─ Scambiatore a piastre e kit idronico (manuale §5.8.2, modelli 100÷160T)
const RIDE_HIDE = [];   // pezzi che durante il giro nel circuito coprirebbero i tubi
const WIN = [.559, Y0 + .072, ZB - .02], WOUT = [.465, Y0 + .072, ZB - .02];
PIPE.wIn = [WIN, [.559, .108, -.2], [.559, .108, -.06], [.556, .2, -.047], [.555, .29, -.06], [.555, .29, -.092]];
PIPE.wHx = [[.555, .29, -.086], [.55, .5, -.086], [.555, .71, -.086]];   // i flussi corrono sulla faccia anteriore dello scambiatore, per restare visibili
PIPE.wA = [[.555, .71, -.092], [.555, .71, -.055], [.525, .755, -.06], [.488, .78, -.105]];
PIPE.wB = [[.455, .875, -.1], [.47, .9, -.06], [.5, .895, -.035], [.52, .87, -.03]];
PIPE.wC = [[.52, .87, -.03], [.508, .85, .02], [.5, .8, .03], [.5, .34, .03], [.5, .262, .03]];
PIPE.wOut = [[.5, .138, .03], [.492, .112, .0], [.47, .108, -.08], [.465, .108, -.2], WOUT];
group('hyd', 'Scambiatore e kit idronico', 'Piastre in acciaio inox AISI 316L, circolatore inverter, vaso da 5 litri, valvola di sicurezza 3 bar e flussostato.', 21, 25.5, { stage: [.85, .15, .55], ex: [.75, 0, .1], az: 425, el: 12, zoom: .95,
  info: { e: 'Qui il calore passa dal gas all\'acqua di casa, che esce verso termosifoni o pavimento.', s: 'Scambiatore a piastre inox AISI 316L · circolatore inverter · vaso 5 l · valvola 3 bar · flussostato · mandata fino a 80 °C' } });
{
  P(mesh(G.box(.115, .5, .004), M.steel, .525, .5, -.179), { d: 0, from: [0, 0, -.35], spin: [0, 0, 0], n: 'Piastra di fondo' });
  const pl = []; for (let i = 0; i < 30; i++) pl.push({ p: [.525, .5, -.1755 + i * .0027] });
  PIN(G.box(.115, .5, .0019), M.inox, pl, { d0: .03, d1: .3, dur: .3, from: [0, .05, .45], spin: [0, 0, 0], ease: eoc, n: 'Piastre inox AISI 316L', snd: 'fin' });
  P(mesh(G.box(.115, .5, .004), M.steel, .525, .5, -.0925), { d: .33, from: [0, 0, .35], spin: [0, 0, 0] });
  [[.555, .71, M.steel, .014], [.555, .29, M.steel, .014], [.495, .71, M.copper, .009], [.495, .29, M.copper, .009]].forEach(([x, y, m, r], i) => P(mesh(G.cylZ(r, .03, 16), m, x, y, -.077), { d: .36 + i * .01, from: [0, 0, .3], spin: [0, 0, 3] }));
  P(mesh(G.box(.004, .4, .06), M.heater, .5845, .5, -.135), { d: .4, from: [.3, 0, 0], spin: [0, 0, 0], n: 'Resistenza antigelo' });
  // circolatore
  P(mesh(G.cyl(.03, .1, 24), M.cast, .5, .2, .03), { d: .44, n: 'Circolatore inverter' });
  P(mesh(G.cylZ(.044, .04, 28), M.cast, .5, .2, .045), { d: .46 });
  P(mesh(G.cylZ(.041, .058, 28), M.black, .5, .2, .094), { d: .48, from: [0, 0, .4], spin: [0, 0, 3] });
  P(mesh(G.rbox(.07, .07, .024, .008), M.plastic, .5, .2, .134), { d: .5, from: [0, 0, .4] });
  P(mesh(G.torus(.02, .003), M.led, .5, .2, .147), { d: .52, from: [0, 0, .3] });
  [.262, .138].forEach((y, i) => P(mesh(G.cyl(.023, .022, 6), M.brass, .5, y, .03), { d: .53 + i * .01, spin: [0, 5, 0] }));
  // vaso di espansione piatto da 5 litri
  RIDE_HIDE.push(P(mesh(G.rbox(.07, .36, .22, .022), M.vessel, .597, .7, .09, 0, 0, 0), { d: .56, from: [.4, .1, 0], spin: [0, 1.2, 0], dur: .55, n: 'Vaso di espansione 5 l' }));
  RIDE_HIDE.push(P(mesh(tubeGeo([[.559, .135, -.05], [.59, .2, -.02], [.6, .4, .05], [.597, .52, .07]], .006, 30), M.rubber), { d: .6 }));
  // separatore aria-acqua, sfiato, valvola di sicurezza, flussostato
  P(mesh(G.cyl(.03, .18, 24), M.steel, .455, .8, -.12), { d: .63, n: 'Separatore aria-acqua' });
  P(mesh(G.dome(.03, .5), M.steel, .455, .89, -.12), { d: .64 });
  P(mesh(G.cyl(.012, .034, 14), M.brass, .455, .915, -.12), { d: .66, n: 'Sfiato automatico' });
  P(mesh(G.cylZ(.012, .04, 12), M.brass, .455, .79, -.072), { d: .68, n: 'Valvola di sicurezza 3 bar' });
  P(mesh(G.cylZ(.016, .018, 16), M.red, .455, .79, -.045), { d: .69 });
  P(mesh(G.cyl(.014, .05, 6), M.brass, .52, .87, -.03), { d: .71, n: 'Flussostato' });
  P(mesh(G.rbox(.034, .04, .034, .005), M.plastic, .52, .915, -.03), { d: .72 });
  // tubi dell'acqua
  [['wIn', 'Ingresso acqua (ritorno)'], ['wA', null], ['wB', null], ['wC', null], ['wOut', 'Uscita acqua (mandata)']].forEach(([k, n], i) => P(mesh(tubeGeo(PIPE[k], .0135, 40), M.alu), { d: .75 + i * .03, dur: .5, n }));
  [WIN, WOUT].forEach((p, i) => { P(mesh(G.cylZ(.019, .05, 20), M.brass, p[0], p[1], ZB - .012), { d: .9 + i * .02, from: [0, 0, -.3], spin: [0, 0, 4], n: i ? null : 'Attacchi G 1"' }); P(mesh(G.cylZ(.025, .014, 6), M.brass, p[0], p[1], ZB - .03), { d: .92 + i * .02, from: [0, 0, -.3], spin: [0, 0, 6], snd: 'screw' }); });
  [[.555, .26, -.05], [.555, .74, -.06], [.5, .31, .045]].forEach((p, i) => P(mesh(G.rbox(.012, .022, .012, .003), M.plastic, ...p), { d: .96 + i * .01, n: i ? null : 'Sonde acqua' }));
}

// 6 ─ Circuito frigorifero (manuale §5.8.1)
const DIS = [.295, YB + .415, -.055], ACT = [.255, YB + .385, .095];
PIPE.a = [DIS, [.295, .56, -.055], [.31, .7, -.045], [.325, .735, -.01], [.31, .73, .02], [.3, .678, .02]];
PIPE.b = [[.33, .645, .02], [.332, .6, .02], [.37, .57, .0], [.43, .6, -.04], [.47, .68, -.06], [.495, .71, -.066], [.495, .71, -.092]];
PIPE.rHx = [[.495, .71, -.086], [.5, .5, -.086], [.495, .29, -.086]];
PIPE.c = [[.495, .29, -.092], [.495, .285, -.06], [.46, .28, -.05], [.428, .36, -.07], [.418, .5, -.1], [.425, .54, -.14], [.425, .49, -.15]];
PIPE.d = [[.425, .31, -.15], [.415, .275, -.17], [.37, .255, -.19], [.3, .25, -.192], [.235, .25, -.192], [.2, .23, -.2], [.186, YB + .137, -.203]];
PIPE.coil = (() => { const a = []; for (let i = 0; i < 7; i++) { const y = cy0 + .06 + i * .125, L = i % 2 === 0; a.push([L ? .15 : -.56, y, -.153], [L ? -.56 : .15, y, -.153]); } return a; })();
PIPE.e = [[.186, .82, -.148], [.2, .8, -.13], [.215, .7, -.1], [.24, .6, -.04], [.265, .6, .01], [.27, .645, .02]];
PIPE.f = [[.3, .645, .02], [.3, .6, .04], [.275, .56, .085], [.257, .52, .095], ACT];
group('ref', 'Circuito frigorifero', 'Propano R290, 1,35 kg: valvola a 4 vie, valvola di espansione elettronica e ricevitore di liquido.', 25.5, 28.5, { stage: [.25, .55, .75], ex: [.1, .55, .35], az: 410, el: 16, zoom: .9,
  info: { e: 'Il percorso chiuso del propano: gira sempre lo stesso gas, senza consumarsi.', s: 'R290 · 1,35 kg · valvola a 4 vie · valvola di espansione elettronica · ricevitore di liquido · pressostati a 32 e 0,3 bar' } });
{
  P(mesh(G.cylX(.016, .1, 20), M.brass, .3, .66, .02), { d: 0, spin: [2, 0, 0], n: 'Valvola a 4 vie' });
  P(mesh(G.cyl(.008, .03, 12), M.copper, .3, .682, .02), { d: .03 });
  [.27, .3, .33].forEach((x, i) => P(mesh(G.cyl(.008, .03, 12), M.copper, x, .642, .02), { d: .04 + i * .01 }));
  P(mesh(G.rbox(.032, .034, .03, .004), M.blue, .345, .688, .04), { d: .09, n: 'Bobina di inversione' });
  P(mesh(G.cyl(.035, .15, 24), M.shellC, .425, .4, -.15), { d: .14, n: 'Ricevitore di liquido' });
  P(mesh(G.dome(.035, .45), M.shellC, .425, .475, -.15), { d: .15 }); P(mesh(G.dome(.035, .45, false), M.shellC, .425, .325, -.15), { d: .15 });
  P(mesh(G.cyl(.012, .04, 14), M.brass, .235, .262, -.192), { d: .2, n: 'Valvola di espansione elettronica' });
  P(mesh(G.cyl(.02, .034, 20), M.plastic, .235, .3, -.192), { d: .22 });
  [.3, .37].forEach((x, i) => P(mesh(G.cylX(.012, .05, 16), M.copper, x, i ? .255 : .25, -.191), { d: .25 + i * .02, n: i ? null : 'Filtri' }));
  [['a', .0085, 'Mandata del gas caldo'], ['b', .0085, null], ['c', .0065, 'Linea del liquido'], ['d', .0065, null], ['e', .0085, null], ['f', .0085, 'Aspirazione']].forEach(([k, r, n], i) => P(mesh(tubeGeo(PIPE[k], r, 48), M.copper), { d: .3 + i * .07, dur: .5, n }));
  P(mesh(tubeGeo(PIPE.f.slice(1), .0125, 30), M.foam), { d: .74, n: 'Isolamento' });
  [[.302, .6, -.052, 'Pressostato di alta 32 bar'], [.318, .715, -.04, null], [.278, .565, .08, 'Pressostato di bassa']].forEach(([x, y, z, n], i) => { P(mesh(G.cyl(.007, .022, 6), M.brass, x, y, z + .012, PI / 2, 0, 0), { d: .8 + i * .03, n }); P(mesh(G.cyl(.009, .02, 12), M.plastic, x, y, z + .03, PI / 2, 0, 0), { d: .81 + i * .03 }); });
  [[.415, .275, -.155], [.3, .575, .06]].forEach((p, i) => P(mesh(G.cyl(.0045, .024, 8), M.brass, p[0], p[1] + .014, p[2]), { d: .9 + i * .02, n: i ? null : 'Attacchi di carica' }));
  P(mesh(G.plane(.085, .085), M.flame, XP + .0035, .78, .1, 0, PI / 2, 0), { d: .96, from: [.3, 0, 0], spin: [0, 0, 0], n: 'Etichetta R290' });
}

// 7 ─ Quadri elettrici
group('el', 'Quadri elettrici', 'Box inverter sigillato sotto il coperchio e scheda del circuito idraulico con la morsettiera.', 28.5, 31, { stage: [.3, .75, .5], ex: [.1, .85, .1], az: 400, el: 30, zoom: .95,
  info: { e: 'Il cervello. Decide ogni secondo a che velocità far girare compressore e ventilatore.', s: 'Box inverter sigillato sotto il coperchio · scheda idraulica con morsettiera · comando remoto touch con Wi-Fi e RS-485' } });
{
  const ix = .415, iy = .94;
  P(mesh(G.rbox(.4, .012, .34, .004), M.galv, ix, iy, 0), { d: 0, n: 'Box inverter' });
  P(mesh(G.box(.36, .003, .3), M.pcb, ix, iy + .009, 0), { d: .05, from: [0, .3, 0], spin: [0, 1, 0], n: 'Scheda inverter' });
  PIN(G.cyl(.016, .05, 18), M.cap, [[-.12, -.08], [-.075, -.08], [-.12, -.03], [-.075, -.03]].map(a => ({ p: [ix + a[0], iy + .036, a[1]] })), { d0: .1, d1: .16, from: [0, .25, 0], n: 'Condensatori' });
  P(mesh(G.torus(.026, .012), M.copper, ix + .05, iy + .024, -.07, PI / 2, 0, 0), { d: .18, n: 'Induttanza' });
  P(mesh(G.rbox(.07, .03, .05, .004), M.black, ix + .12, iy + .026, .06), { d: .2 });
  P(mesh(G.rbox(.05, .022, .09, .004), M.plastic, ix - .02, iy + .022, .08), { d: .22 });
  P(mesh(G.box(.06, .01, .13), M.alu, XP - .03, .975, 0), { d: .24, n: 'Dissipatore' });
  PIN(G.box(.055, .075, .003), M.alu, Array.from({ length: 10 }, (_, i) => ({ p: [XP - .03, .93, -.054 + i * .012] })), { d0: .26, d1: .34, from: [-.3, 0, 0], spin: [0, 0, 0], snd: 'fin' });
  P(mesh(G.rbox(.404, .008, .344, .003), M.sLid, ix, iy + .068, 0), { d: .4, from: [0, .3, 0], spin: [0, 0, 0], n: 'Coperchio sigillato' });
  screws([[-.19, -.16], [.19, -.16], [-.19, .16], [.19, .16], [0, -.16], [0, .16]].map(a => ({ p: [ix + a[0], iy + .072, a[1]] })), { d0: .46, d1: .52, mat: M.sScrew });
  // scheda del circuito idraulico con la morsettiera utente
  const hx = .4775, hy = .56;
  P(mesh(G.rbox(.16, .4, .006, .003), M.galv, hx, hy, .153), { d: .54, from: [0, 0, .4], n: 'Scheda del circuito idraulico' });
  P(mesh(G.box(.14, .3, .003), M.pcb, hx, hy + .04, .158), { d: .58, from: [0, 0, .4], spin: [0, 0, 1] });
  PIN(G.box(.011, .022, .018), M.term, Array.from({ length: 12 }, (_, i) => ({ p: [hx - .066 + i * .012, hy - .15, .167] })), { d0: .62, d1: .72, from: [0, 0, .25], spin: [0, 0, 0], n: 'Morsettiera XT1', snd: 'fin' });
  PIN(G.box(.022, .028, .02), M.blue, [0, 1, 2].map(i => ({ p: [hx - .04 + i * .03, hy + .12, .168] })), { d0: .72, d1: .76, from: [0, 0, .25], n: 'Relè' });
  P(mesh(G.rbox(.165, .405, .034, .006), M.sLid, hx, hy, .175), { d: .8, from: [0, 0, .4], spin: [0, 0, 0] });
  [[[ix - .1, iy, .0], [.3, .8, .05], [.327, YB + .39, .0]], [[ix - .15, iy, -.05], [XP + .03, .9, -.06], [XP + .012, .95, -.06]], [[ix + .1, iy, .1], [.5, .86, .14], [hx, hy + .2, .15]]].forEach((p, i) => P(mesh(tubeGeo(p, .0045, 26), M.plastic), { d: .86 + i * .03, n: i ? null : 'Cablaggi' }));
}

// 8 ─ Involucro
group('shell', 'Involucro', 'Pannelli verde Reseda, fianchi e coperchio antracite. Il coperchio si chiude con 7 viti.', 31, 36, { stage: [0, 0, 0], ex: [0, 0, 0], az: 385, el: 12, zoom: 1,
  info: { e: 'La carrozzeria. Protegge tutto da pioggia e neve e lascia passare l\'aria.', s: 'Pannelli verde Reseda · coperchio con 7 viti · 1280 × 500 × 1040 mm · 154 kg' } });
{
  const F0 = { spin: [0, 0, 0], ease: eoc };
  // schiena
  P(mesh(G.rbox(.45, HP, .01, .003), M.sDark, .415, YC, ZB + .005), Object.assign({ d: 0, from: [0, 0, -.6], k: [0, 0, -.9], dur: .6, n: 'Schiena del vano tecnico' }, F0));
  PIN(G.cylZ(.014, .022, 14), M.sGuard, [.5, .56, .62].map(y => ({ p: [.6, y, ZB - .008] })), { d0: .05, d1: .08, from: [0, 0, -.3], k: [0, 0, -.95], n: 'Passacavi' });
  [['IN', WIN[0]], ['OUT', WOUT[0]]].forEach(([s, x], i) => P(mesh(G.plane(.05, .025), std({ map: T.io(s), roughness: .5 }), x, WIN[1] + .05, ZB - .001, 0, PI, 0), Object.assign({ d: .09, from: [0, 0, -.3], k: [0, 0, -.9] }, F0)));
  const gb = []; for (let i = 0; i < 23; i++) gb.push({ p: [-.62 + i * .036, YC, ZB + .004] });
  PIN(G.box(.004, HP, .004), M.sGuard, gb, { d0: .08, d1: .2, from: [0, .1, -.5], spin: [0, 0, 0], k: [0, 0, -.9], ease: eoc, n: 'Griglia posteriore', snd: 'fin' });
  PIN(G.box(.8, .004, .004), M.sGuard, [0, 1, 2, 3, 4].map(i => ({ p: [-.225, YB + .1 + i * .19, ZB + .001] })), { d0: .2, d1: .23, from: [0, 0, -.5], spin: [0, 0, 0], k: [0, 0, -.92], ease: eoc });
  // fianco sinistro
  const gl = []; for (let i = 0; i < 12; i++) gl.push({ p: [XL + .004, YC, -.2 + i * .035] });
  PIN(G.box(.004, HP, .004), M.sGuard, gl, { d0: .22, d1: .28, from: [-.5, .1, 0], spin: [0, 0, 0], k: [-.8, 0, 0], ease: eoc, n: 'Griglia laterale', snd: 'fin' });
  PIN(G.box(.004, .004, .41), M.sGuard, [0, 1, 2, 3, 4].map(i => ({ p: [XL + .001, YB + .1 + i * .19, -.005] })), { d0: .28, d1: .3, from: [-.5, 0, 0], spin: [0, 0, 0], k: [-.82, 0, 0], ease: eoc });
  P(mesh(G.rbox(.03, HP, .03, .004), M.sGreen, XL + .015, YC, ZF - .015), Object.assign({ d: .3, from: [-.3, 0, .3], k: [-.4, 0, .8] }, F0));
  // fianco destro con maniglia
  P(mesh(G.rbox(.012, HP, Dp, .004), M.sSide, XR - .006, YC, 0), Object.assign({ d: .33, from: [.6, 0, 0], k: [.9, 0, 0], dur: .6, n: 'Fianco destro' }, F0));
  P(mesh(G.box(.003, .042, .1), M.sGuard, XR + .0008, YB + .245, 0), Object.assign({ d: .36, from: [.6, 0, 0], k: [.9, 0, 0] }, F0));
  P(mesh(G.plane(.11, .065), M.sLabel, XR + .0012, YB + .72, .1, 0, PI / 2, 0), Object.assign({ d: .37, from: [.6, 0, 0], k: [.9, 0, 0], n: 'Targhetta' }, F0));
  // frontale del ventilatore: lamiera forata e lamelle verticali
  const fs = new THREE.Shape(); fs.moveTo(XL, YB); fs.lineTo(XP, YB); fs.lineTo(XP, YB + HP); fs.lineTo(XL, YB + HP); fs.closePath(); const hole = new THREE.Path(); hole.absarc(FAN.x, FAN.y, .305, 0, PI * 2, true); fs.holes.push(hole);
  P(mesh(new THREE.ExtrudeGeometry(fs, { depth: .004, bevelEnabled: false, curveSegments: 48 }), M.sGreen, 0, 0, ZF - .012), Object.assign({ d: .42, from: [0, 0, .7], k: [0, 0, 1], dur: .65, n: 'Frontale del ventilatore' }, F0));
  const dg = []; for (const s of [1, -1]) for (let i = -4; i <= 4; i++) { const o = i * .066, L = 2 * Math.sqrt(.3 * .3 - o * o); dg.push({ p: [FAN.x - s * o * .7071, FAN.y + o * .7071, ZF - .014], r: [0, 0, s * PI / 4], s: [L, 1, 1] }); }
  PIN(G.box(1, .0035, .0035), M.sGuard, dg, { d0: .46, d1: .5, from: [0, 0, .6], spin: [0, 0, 0], k: [0, 0, 1], ease: eoc, n: 'Griglia di protezione', snd: 'fin' });
  const sl = [], nsl = 62; for (let i = 0; i < nsl; i++) sl.push({ p: [XL + .014 + i * (XP - XL - .028) / (nsl - 1), YC, ZF - .002] });
  PIN(G.box(.0034, HP - .012, .009), M.sSlat, sl, { d0: .5, d1: .72, dur: .34, from: [0, .12, .45], spin: [0, 0, 0], k: (i, it, f) => [0, 0, 1.08 + .1 * Math.sin(f * PI)], ease: eoc, n: 'Lamelle frontali', snd: 'fin' });
  // frontale destro con la scritta
  P(mesh(G.rbox(XR - XP, HP, .012, .004), M.sGreen, (XP + XR) / 2, YC, ZF - .006), Object.assign({ d: .75, from: [.15, 0, .7], k: [0, 0, 1], dur: .65, n: 'Frontale destro' }, F0));
  P(mesh(G.plane(.17, .73), M.sLetter, .5, YC, ZF + .0008), Object.assign({ d: .75, from: [.15, 0, .7], k: [0, 0, 1], dur: .65 }, F0));
  screws([.27, .57].map(x => ({ p: [x, YB + .03, ZF + .001], r: [PI / 2, 0, 0] })), { d0: .8, d1: .82, mat: M.sScrew, k: [0, 0, 1.12], n: 'Due viti esagonali' });
  // coperchio con nervature e 7 viti
  P(mesh(G.rbox(Wd + .006, .03, Dp + .006, .008), M.sDark, 0, YT - .015, 0), Object.assign({ d: .84, from: [0, .6, 0], k: [0, .9, 0], dur: .7, n: 'Coperchio' }, F0));
  PIN(G.rbox(1.16, .006, .085, .0028), M.sDark, [-.14, 0, .14].map(z => ({ p: [0, YT + .002, z] })), { d0: .84, d1: .84, dur: .7, from: [0, .6, 0], spin: [0, 0, 0], k: [0, .9, 0], ease: eoc });
  const ts = [-.5, -.17, .17, .5].map(x => ({ p: [x, YT - .015, ZB - .003], r: [-PI / 2, 0, 0] })).concat([-.12, .12].map(z => ({ p: [XL - .003, YT - .015, z], r: [0, 0, PI / 2] })), [{ p: [XR + .003, YT - .015, 0], r: [0, 0, -PI / 2] }]);
  screws(ts, { d0: .92, d1: 1, mat: M.sScrew, k: (i, it) => [it.p[0] * .2, 1.0, it.p[2] * .4], n: 'Sette viti del coperchio' });
}
finalize();
