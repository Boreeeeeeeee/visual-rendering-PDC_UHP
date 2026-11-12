// ───────── Casa: casa in sezione, il generatore al suo posto, una giornata dalle 0 alle 24 ─────────
// La casa, gli arredi, l'impianto a pavimento e il percorso dei tubi sono una scenografia generica, non prodotti Unical.
// La giornata è qualitativa: nessun valore a schermo oltre all'ora. Orari di alba e tramonto e andamento del carico sono indicativi.
const Casa = (() => {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0f13); scene.fog = new THREE.Fog(0x0b0f13, 38, 115);
  scene.environment = ENV; scene.environmentIntensity = .35;
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 200);
  const sun = new THREE.DirectionalLight(0xffffff, 2); scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x2a2a26, .5); scene.add(hemi);
  const HW = 3.2, HD = 2.6, FY = .12, WH = 2.7, TW = .22, RH = 1.8, P1 = .1, P2 = 1.4, H2 = WH + .2 + 1.0, FM = FY + WH + .2;   // H2 = pareti fino alla gronda (piano terra + solaio + 1 m di mansarda), FM = pavimento della mansarda   // metri

  // materiali: i tagli (pareti, solaio e tetto sezionati) hanno un colore a parte, come in un disegno in sezione
  const cut = std({ color: 0xe9e2d0, roughness: .9 }), wall = std({ color: 0xd8d2c4, roughness: .92 }), slab = std({ color: 0x8d8b84, roughness: .95 });
  const sez = m => [m, m, m, m, cut, m];   // faccia +z = taglio
  const g = new THREE.Group(); scene.add(g);
  const add = (geo, mat, x, y, z, parent = g) => { const o = mesh(geo, mat, x, y, z); parent.add(o); return o; };

  // terreno, solaio, pareti
  const ground = add(new THREE.CircleGeometry(130, 48), std({ color: 0x5c7a45, roughness: 1 }), 0, 0, 0); ground.rotation.x = -PI / 2;
  add(box(2 * HW, FY + .3, 2 * HD), sez(slab), 0, (FY - .3) / 2, 0);
  const tWood = rep(cv(128, 128, (c, w, h) => { c.fillStyle = '#b08f66'; c.fillRect(0, 0, w, h); const r = rng(9); for (let y = 0; y < h; y += 16) { c.fillStyle = `rgba(70,45,20,${.10 + r() * .16})`; c.fillRect(0, y, w, 15); c.fillStyle = 'rgba(40,25,10,.5)'; c.fillRect(0, y + 15, w, 1); c.fillRect(r() * w, y, 1, 16); } }), 3, 5);
  const tTile = rep(cv(64, 64, (c, w, h) => { c.fillStyle = '#aab1b3'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7d8587'; c.lineWidth = 2; c.strokeRect(0, 0, w, h); }), 4, 14);
  const fLiv = std({ map: tWood, roughness: .7, emissive: 0x000000 }), fBag = std({ map: tTile, roughness: .5, emissive: 0x000000 });
  const fl = (x0, x1, m) => { const o = add(new THREE.PlaneGeometry(x1 - x0, 2 * HD - TW), m, (x0 + x1) / 2, FY + .002, TW / 2); o.rotation.x = -PI / 2; return o; };
  fl(-HW + TW, P1, fLiv); fl(P1, HW - TW, fBag);
  add(box(2 * HW, H2, TW), wall, 0, FY + H2 / 2, -HD + TW / 2);
  add(box(2 * HW - 2 * TW, .2, 2 * HD - TW), sez(slab), 0, FY + WH + .1, TW / 2);      // solaio della mansarda
  for (const s of [-1, 1]) add(box(TW, H2, 2 * HD), sez(wall), s * (HW - TW / 2), FY + H2 / 2, 0);
  for (const x of [P1, P2]) add(box(.1, WH, 2 * HD - 2.0), sez(wall), x, FY + WH / 2, -1.0);
  // timpano posteriore e tetto a due falde con il colmo dal fronte al retro: il fronte è tagliato, le falde restano
  const tri = new THREE.Shape(); tri.moveTo(-HW, 0); tri.lineTo(HW, 0); tri.lineTo(0, RH); tri.closePath();
  add(new THREE.ExtrudeGeometry(tri, { depth: TW, bevelEnabled: false }), wall, 0, FY + H2, -HD);
  const tRoof = rep(cv(64, 64, (c, w, h) => { c.fillStyle = '#4a3f3a'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a312d'; for (let x = 0; x < w; x += 16) c.fillRect(x, 0, 2, h); c.fillRect(0, 0, w, 3); }), 10, 12);
  const roofM = std({ map: tRoof, roughness: .85 }), SPORTO = .4, ang = Math.atan(RH / HW), LF = (HW + SPORTO) / Math.cos(ang);
  const falde = [-1, 1].map(s => { const o = add(box(LF, .12, 2 * HD + .3), [roofM, roofM, roofM, std({ color: 0x9c8468, roughness: .9 }), cut, roofM], s * (HW + SPORTO) / 2, FY + H2 + RH - Math.tan(ang) * (HW + SPORTO) / 2 + .07, -.15); o.rotation.z = -s * ang; return o; });

  // arredi essenziali, solo per far leggere le stanze
  const soft = std({ color: 0x5d6f7c, roughness: .95 }), legno = std({ color: 0x6b5238, roughness: .7 }), bianco = std({ color: 0xf1f1ee, roughness: .4 }), nero = std({ color: 0x17191b, roughness: .5 });
  add(rbox(1.9, .38, .8, .06), soft, -1.6, FY + .24, -HD + TW + .5); add(rbox(1.9, .5, .2, .06), soft, -1.6, FY + .6, -HD + TW + .16);
  for (const x of [-2.5, -.7]) add(rbox(.18, .5, .8, .05), soft, x, FY + .35, -HD + TW + .5);
  const rug = add(new THREE.PlaneGeometry(2.2, 1.3), std({ color: 0x8c3f32, roughness: 1 }), -1.6, FY + .006, .1); rug.rotation.x = -PI / 2;
  add(rbox(1.0, .06, .55, .02), legno, -1.6, FY + .36, .1); for (const [x, z] of [[-2, -.1], [-1.2, -.1], [-2, .3], [-1.2, .3]]) add(cyl(.02, .34, 8), nero, x, FY + .17, z);
  add(box(.04, .62, 1.05), nero, -HW + TW + .03, FY + 1.35, .9);    // televisore sulla parete sinistra
  const vetro = new THREE.MeshBasicMaterial({ color: 0x9cc4e4 });
  const finestra = (x, w, h, y) => { add(box(w + .12, h + .12, .03), bianco, x, y, -HD + TW + .012); add(box(w, h, .02), vetro, x, y, -HD + TW + .026); add(box(.04, h, .03), bianco, x, y, -HD + TW + .03); };
  finestra(-1.3, 1.5, 1.2, FY + 1.6); finestra(.75, .6, .6, FY + 1.9);
  add(rbox(.85, .06, .85, .02), bianco, .75, FY + .03, -HD + TW + .45);      // piatto doccia
  add(box(.02, 1.9, .85), new THREE.MeshStandardMaterial({ color: 0xbfe0ee, transparent: true, opacity: .28, roughness: .1 }), 1.18, FY + .98, -HD + TW + .45);
  add(cyl(.012, 1.9, 8), std({ color: 0xc9ccd0, metalness: .9, roughness: .2 }), .42, FY + 1.05, -HD + TW + .1); add(cyl(.09, .02, 16), std({ color: 0xc9ccd0, metalness: .9, roughness: .2 }), .52, FY + 2.0, -HD + TW + .2);
  add(rbox(.5, .14, .4, .03), bianco, P1 + .3, FY + .85, .5); add(box(.42, .7, .32), legno, P1 + .28, FY + .43, .5);     // lavabo
  // luci di casa: lampade a sospensione, accese quando fuori è buio e la casa è sveglia
  const lampM = new THREE.MeshBasicMaterial({ color: 0x40382a });
  const lampade = [[-1.6, .1, 9], [.75, .3, 3.5], [2.4, .2, 4.5]].map(([x, z, i]) => { add(cyl(.006, .7, 6), nero, x, FY + WH - .15, z); add(new THREE.SphereGeometry(.1, 16, 12), lampM, x, FY + WH - .55, z);
    const l = new THREE.PointLight(0xffd9a0, 0, 7, 1.6); l.position.set(x, FY + WH - .6, z); l.userData.max = i; g.add(l); return l; });

  // posto del generatore: fuori, a terra accanto alla parete destra, rivolto verso chi guarda. Qui va la UHP; alla tappa 4 lo stesso posto ospita l'ibrida.
  const POSTO = { pos: V(HW + 1.15, .08, 1.55), yaw: rad(-14) };
  add(rbox(1.7, .08, .8, .02), slab, POSTO.pos.x, .04, POSTO.pos.z).rotation.y = POSTO.yaw;
  const gen = PRODOTTI.find(p => p.id === 'uhp'), ist = gen.costruisci();
  ist.group.position.copy(POSTO.pos); ist.group.rotation.y = POSTO.yaw; g.add(ist.group); ist.group.updateMatrixWorld(true);
  ist.group.traverse(o => { o.userData.prodotto = gen.id; });

  // tubi: dal retro della macchina alla parete, su fino al collettore, poi le serpentine a pavimento
  const tFlow = cv(64, 8, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#8c8c8c'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(.6, '#8c8c8c'); gr.addColorStop(1, '#8c8c8c'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const tubi = [];
  function tubo(pts, r, verso, ramo) {
    const c = new THREE.CurvePath(); for (let i = 1; i < pts.length; i++) c.add(new THREE.LineCurve3(pts[i - 1], pts[i])); const len = c.getLength(), tx = tFlow.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(Math.max(1, len / .32), 1); tx.needsUpdate = true;
    const m = new THREE.MeshBasicMaterial({ map: tx }); add(new THREE.TubeGeometry(c, Math.max(8, Math.round(len * 16)), r, 6), m, 0, 0, 0); tubi.push({ m, tx, verso, ramo });
  }
  const aM = ist.group.localToWorld(ist.attacchi.mandata.clone()), aR = ist.group.localToWorld(ist.attacchi.ritorno.clone());
  const dietro = V(0, 0, -1).applyAxisAngle(V(0, 1, 0), POSTO.yaw), XI = HW - TW - .05, ZI = -HD + TW + .06, COL = { x: P2 + .5, y: FY + .85 };
  [[aM, 1, 'mandata', 0], [aR, -1, 'ritorno', .09]].forEach(([a, verso, ramo, dz]) => {
    const b = a.clone().addScaledVector(dietro, .28 + dz), zc = b.z;
    tubo([a, b, V(HW + .25, a.y, zc), V(XI - dz, a.y, zc), V(XI - dz, a.y, ZI + dz), V(COL.x + .18 - dz * 2, a.y, ZI + dz), V(COL.x + .18 - dz * 2, COL.y - .2, ZI + dz)], .026, verso, ramo);
  });
  add(rbox(.6, .46, .1, .015), std({ color: 0xc7ccd0, roughness: .4, metalness: .5 }), COL.x, COL.y, ZI);     // collettore dell'impianto (generico)
  function serpentina(x0, x1, z0, z1, passo, entra) { const p = entra.slice(); let dir = 1; for (let x = x1; x >= x0 - .001; x -= passo) { p.push(V(x, FY + .014, dir > 0 ? z1 : z0), V(x, FY + .014, dir > 0 ? z0 : z1)); dir = -dir; } return p; }
  const yp = FY + .014, giu = x => [V(x, COL.y - .2, ZI + .02), V(x, yp, ZI + .02)];
  tubo(serpentina(-HW + TW + .25, P1 - .25, -HD + TW + .3, HD - .3, .34, [...giu(COL.x - .08), V(COL.x - .08, yp, HD - .3)]), .013, 1, 'mandata');
  tubo(serpentina(P1 + .22, P2 - .2, -HD + TW + 1.1, HD - .8, .3, [...giu(COL.x - .2), V(COL.x - .2, yp, HD - .55), V(P2 - .2, yp, HD - .55)]), .013, 1, 'mandata');
  // acqua calda: HP 300PSDX nella lavanderia. Il locale disegnato è circa 1,9 x 4,8 x 2,7 m = 24 m³: sopra i 20 m³ che il manuale chiede (p.19) quando l'aria non è canalizzata.
  const viste = [{ def: gen, ist, pos: POSTO.pos.clone().setY(1.5) }];
  const acsDef = PRODOTTI.find(p => p.id === 'acs'), acs = acsDef && acsDef.costruisci();
  if (acs) {
    acs.group.position.set(HW - TW - .5, FY, -HD + TW + .5); g.add(acs.group); acs.group.updateMatrixWorld(true); acs.group.traverse(o => { o.userData.prodotto = 'acs'; });
    viste.push({ def: acsDef, ist: acs, pos: acs.group.position.clone().setY(FY + 2.3) });
    add(rbox(.6, .85, .6, .03), bianco, P2 + .4, FY + .425, -.6); add(cyl(.2, .02, 24), nero, P2 + .4, FY + .45, -.29).rotation.x = PI / 2;     // lavatrice
    const c = acs.group.localToWorld(acs.attacchi.calda.clone()), f = acs.group.localToWorld(acs.attacchi.fredda.clone()), zb = -HD + TW + .07;
    tubo([c, V(c.x + .1, c.y, c.z), V(c.x + .1, FY + 2.3, c.z), V(c.x + .1, FY + 2.3, zb), V(.52, FY + 2.3, zb), V(.52, FY + 2.02, zb)], .016, 1, 'acs');        // calda fino alla doccia (percorso generico)
    tubo([V(XI, f.y, c.z + .5), V(f.x + .1, f.y, c.z + .5), V(f.x + .1, f.y, f.z), f], .016, 1, 'fredda');
  }
  // fotovoltaico: 14 moduli MULTIVOLT 460 BF, sette per falda (est e ovest), una stringa per ciascuno dei due MPPT dello ZOE1-6000.
  // I profili passano a 400 mm dai lati corti dei moduli: è dove il manuale 00340211SS (p.14, metodo C, S = 400 ± 50) vuole i quattro morsetti sul lato lungo.
  // Inverter e batteria in mansarda, sulla parete di fondo in muratura: ambiente asciutto, lontano dall'acqua, superficie non infiammabile (manuali 00341435 p.31-32 e 00341436 p.8).
  // Generici: ganci e profili (accessori per tetti residenziali, senza un modello preciso), quadro, contatore e percorso dei cavi.
  const fvDef = PRODOTTI.find(p => p.id === 'fv'); let bat = null;
  if (fvDef) {
    const allu = std({ color: 0xb9bec2, roughness: .4, metalness: .8 }), ZC = [-1.731, -.577, .577, 1.731], UU = [.3 + .881, .3 + .881 + 1.782];
    falde.forEach((f, k) => { const s = k ? 1 : -1, lx = u => s * (-LF / 2 + u), posti = [];
      ZC.forEach(z => posti.push([UU[0], z])); ZC.slice(1).forEach(z => posti.push([UU[1], z]));          // 4 nella fila alta, 3 in quella bassa
      const im = new THREE.InstancedMesh(FV.modGeo, FV.modMat, posti.length), m4 = new THREE.Matrix4(); posti.forEach(([u, z], i) => { m4.makeTranslation(lx(u), .145, z); im.setMatrixAt(i, m4); }); f.add(im);
      for (const [r, u0] of [[0, UU[0]], [1, UU[1]]]) for (const d of [-.481, .481]) { const z0 = ZC[r] - .62, z1 = ZC[3] + .62; f.add(mesh(box(.04, .04, z1 - z0), allu, lx(u0 + d), .11, (z0 + z1) / 2));
        for (let z = z0 + .2; z < z1; z += .8) f.add(mesh(box(.06, .03, .04), allu, lx(u0 + d), .075, z)); } });
    const zi = -HD + TW, fvG = new THREE.Group(), inv = FV.inverter(); inv.position.set(.75, FM + 1.45, zi); bat = FV.batteria(3); bat.group.position.set(-.35, FM, zi + .11); fvG.add(inv, bat.group); g.add(fvG);
    fvG.traverse(o => { o.userData.prodotto = 'fv'; }); viste.push({ def: fvDef, ist: { group: fvG, tick() {} }, pos: V(.2, FM + 2.25, zi + .2) });
    const grigio = std({ color: 0x8f969b, roughness: .5, metalness: .4 }), yq = FY + 1.7, zc = zi + .12, yr = FY + H2 + RH - Math.tan(ang) * 1.6 - .12;
    add(box(.3, .4, .1), grigio, -.3, yq, zi + .05); add(box(.12, .4, .3), grigio, -HW - .06, FY + 1.3, 1.0);       // quadro di casa e contatore (generici)
    for (const s of [-1, 1]) tubo([V(s * 1.6, yr, zi + .5), V(s * 1.6, yr, zc), V(.75 + s * .05, yr, zc), V(.75 + s * .05, FM + 1.2, zc)], .012, 1, 'fv');
    tubo([V(.6, FM + 1.2, zc), V(.6, FM + .59, zc), V(-.02, FM + .59, zc)], .014, 1, 'bat');
    tubo([V(.92, FM + 1.2, zc), V(.92, FM + .06, zc), V(-.3, FM + .06, zc), V(-.3, yq + .2, zc)], .012, 1, 'casa');
    tubo([V(-.45, yq, zc), V(-HW + TW + .06, yq, zc), V(-HW + TW + .06, yq, 1.0), V(-HW - .06, yq, 1.0), V(-HW - .06, FY + 1.5, 1.0)], .012, 1, 'rete');
  }
  // aria che attraversa la macchina, visibile quando lavora
  const NA = 36, aPos = new Float32Array(NA * 3), aSeed = Array.from({ length: NA }, (_, i) => [rng(i + 3)(), rng(i + 40)(), rng(i + 77)()]);
  const aria = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(aPos, 3)), new THREE.PointsMaterial({ size: .05, transparent: true, opacity: 0, depthWrite: false, color: 0xbfe6ff }));
  ist.group.add(aria);

  // sole in cielo
  const sole = add(new THREE.SphereGeometry(1.5, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff1c9, fog: false }), 0, 0, 0);

  // ───────── la giornata ─────────
  const S = { t: 6.4, estate: false, play: true, carico: 0, doccia: 0, caldo: 1, ricarica: false, fv: !!fvDef, pv: 0, ld: 0, bat: 0, rete: 0, soc: .5, sole: false };
  const C = (h) => new THREE.Color(h), NOTTE = C(0x070b12), ALBA = C(0x6a5a6e), GI = C(0x86a5bf), GE = C(0x6aa6dc), tmp = C(0), CALDO = C(0xff7a2a), FREDDO = C(0x3fa9ff);
  const COL_T = { mandataC: C(0xff8a3d), ritornoC: C(0xb5522e), mandataF: C(0x7fd6ff), ritornoF: C(0x3f86c9), fermo: C(0x7a7f85), acs: C(0xff5a3c), fredda: C(0x58b8ff), fv: C(0xffd84a), bat: C(0x7dff9a), casa: C(0xfff2b0), rete: C(0xc49bff) };
  const FASI = {
    inverno: [[0, 'Notte. Fuori fa freddo: la pompa di calore lavora piano e tiene la casa in temperatura.'], [5, 'Mattino presto. Prende calore dall\'aria fredda e lo passa all\'acqua dell\'impianto: la casa è calda prima della sveglia.'],
      [9, 'Giorno. Con il sole la casa chiede meno calore e la macchina rallenta.'], [16, 'Sera. Fuori torna il freddo e la casa si riempie: lavora di più.'], [22, 'Notte. Rallenta e mantiene.']],
    estate: [[0, 'Notte. La casa è fresca: la pompa di calore riposa.'], [9, 'Il sole scalda la casa: parte il raffrescamento.'],
      [13, 'Pomeriggio. Lavora al contrario: toglie calore alla casa e lo porta fuori.'], [19, 'Sera. Fuori rinfresca e la macchina rallenta.'], [23, 'Notte. Si ferma.']],
  };
  const camp = (t, a, b, lo, hi) => lo + (hi - lo) * sm(a, a + 1.5, t) * (1 - sm(b, b + 1.5, t));   // rampa morbida tra due orari
  function carico(t, estate) {
    if (estate) return Math.max(camp(t, 9, 19, 0, .85), camp(t, 12, 22, 0, .45));
    return clamp(.42 + camp(t, 4.5, 8.5, 0, .5) + camp(t, 16, 21.5, 0, .42) - camp(t, 10.5, 14.5, 0, .2));
  }
  // acqua calda nella giornata (indicativo): due docce, poi l'HP 300PSDX si ricarica da solo con la sua pompa di calore
  const DOCCE = [[7, 7.6], [20, 20.8]];
  function acqua(t) { let doccia = 0, caldo = 1; const tt = t < 1 ? t + 24 : t;
    for (const [a, b] of DOCCE) { const r = b + 3.6; if (tt >= a && tt < b) { doccia = 1; caldo = lerp(1, .5, (tt - a) / (b - a)); } else if (tt >= b && tt < r) caldo = lerp(.5, 1, (tt - b) / (r - b)); }
    return { doccia, caldo }; }
  // energia nella giornata (indicativa), secondo la modalità Autoconsumo dello ZOE1 (manuale 00341435 p.14): di giorno il fotovoltaico alimenta la casa,
  // quello che avanza carica la batteria e poi va in rete; di notte la batteria alimenta la casa fino alla scarica minima (10%), poi si prende dalla rete.
  const EN = [false, true].map(estate => { const r = [], alba = estate ? 5.6 : 7.7, tram = estate ? 21 : 16.8; let soc = .3;
    for (let giro = 0; giro < 3; giro++) for (let i = 0; i < 240; i++) { const t = i / 10, k = clamp((t - alba) / (tram - alba)), pv = (t > alba && t < tram ? Math.pow(Math.sin(k * PI), 1.2) : 0) * (estate ? 1 : .6);
      const ld = .14 + .42 * carico(t, estate) + .12 * camp(t, 18.5, 21.5, 0, 1) + (acqua(t).caldo < .999 ? .1 : 0), av = pv - ld; let b = 0;
      if (av > 0) { b = soc < 1 ? Math.min(av, .6) : 0; soc = Math.min(1, soc + b * .034); } else { b = soc > .1 ? Math.max(av, -.6) : 0; soc = Math.max(.1, soc + b * .034); }
      r[i] = { pv, ld, b, rete: av - b, soc }; }
    return r; });
  const fase = (t, estate) => { const f = FASI[estate ? 'estate' : 'inverno']; let r = f[0][1]; for (const [h, s] of f) if (t >= h) r = s; return r; };
  let onStato = () => {}; const VEL = {};
  function applica() {
    const { t, estate } = S, alba = estate ? 5.6 : 7.7, tram = estate ? 21 : 16.8, k = clamp((t - alba) / (tram - alba)), su = t > alba && t < tram ? Math.sin(k * PI) : 0;
    const giorno = sm(0, .22, su), crep = sm(0, .1, su) * (1 - sm(.12, .4, su));
    const phi = k * PI, hMax = estate ? 1 : .42;
    sole.position.set(-Math.cos(phi) * 34, 3 + su * hMax * 30, 14 - 30 * (1 - su * .25)); sole.visible = su > 0; sole.material.color.setHSL(.11, 1, .6 + .3 * giorno);
    sun.position.copy(sole.position).setZ(16); sun.intensity = 2.6 * giorno; sun.color.setHSL(.09, .5 + .4 * crep, .92 - .2 * crep);
    scene.background.copy(NOTTE).lerp(ALBA, crep).lerp(estate ? GE : GI, giorno); scene.fog.color.copy(scene.background); hemi.intensity = .22 + .55 * giorno; hemi.color.copy(scene.background).lerp(tmp.set(0xffffff), .5);
    ground.material.color.set(estate ? 0x5c7a45 : 0x66705a); vetro.color.copy(scene.background).lerp(tmp.set(0xffffff), .25 * giorno);
    const sveglia = t > 6 && t < 23.4, luci = (1 - giorno) * (sveglia ? 1 : 0);
    lampade.forEach(l => { l.intensity = l.userData.max * luci; }); lampM.color.setHSL(.1, .8, .12 + .7 * luci);
    S.carico = carico(t, estate);
    const tinta = estate ? FREDDO : CALDO; fLiv.emissive.copy(tinta).multiplyScalar(.10 * S.carico); fBag.emissive.copy(tinta).multiplyScalar(.10 * S.carico);
    const aq = acqua(t); S.doccia = aq.doccia; S.caldo = aq.caldo; S.ricarica = !aq.doccia && aq.caldo < .999;
    const en = EN[estate ? 1 : 0][Math.min(239, Math.floor(t * 10))]; S.pv = en.pv; S.ld = en.ld; S.bat = en.b; S.rete = en.rete; S.soc = en.soc; S.sole = S.fv && en.pv - en.ld > .05; if (bat) bat.carica(en.soc);
    const ATT = { acs: S.doccia, fredda: S.doccia, fv: sm(0, .08, S.pv), bat: sm(0, .02, Math.abs(S.bat)), casa: 1, rete: sm(0, .02, Math.abs(S.rete)) };
    VEL.acs = VEL.fredda = 1.5 * S.doccia; VEL.fv = 2.2 * S.pv; VEL.bat = 2.6 * S.bat; VEL.casa = .5 + S.ld; VEL.rete = 2.6 * S.rete;
    for (const tb of tubi) { if (tb.ramo in ATT) tb.m.color.copy(COL_T.fermo).lerp(COL_T[tb.ramo], ATT[tb.ramo]); else tb.m.color.copy(COL_T.fermo).lerp(COL_T[tb.ramo + (estate ? 'F' : 'C')], sm(0, .15, S.carico)); }
    aria.material.opacity = .55 * sm(.02, .3, S.carico); aria.material.color.set(estate ? 0xffc9a0 : 0xbfe6ff);
    onStato(S, fase(t, estate));
  }
  // camera a orbita limitata: trascina per girare, pizzica o rotella per avvicinarti
  const cam = { az: rad(-7), el: rad(20), zoom: 1, dist: 20, tgt: V(.75, 1.2, 0) }; let W = 1, H = 1;
  function resize(w, h) { W = w; H = h; camera.aspect = w / h; camera.fov = w < h ? 40 : 30; camera.updateProjectionMatrix();
    const vf = rad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * camera.aspect); const stretto = w < h, basso = h < 460; cam.dist = Math.max((stretto ? 4.8 : 5.6) / Math.tan(hf), (basso ? 5.6 : 4.7) / Math.tan(vf)) + 2.6; cam.tgt.set(stretto ? 1.0 : .75, stretto ? 2.9 : basso ? 2.7 : 2.5, 0); if (stretto && !mossaCam) cam.el = rad(27); }
  function posaCamera() { const d = cam.dist * cam.zoom, ce = Math.cos(cam.el); camera.position.set(cam.tgt.x + Math.sin(cam.az) * ce * d, cam.tgt.y + Math.sin(cam.el) * d, cam.tgt.z + Math.cos(cam.az) * ce * d); camera.lookAt(cam.tgt); }
  const etich = V(); let onEtichetta = () => {}, mossaCam = false;
  function tick(dt, now) {
    if (S.play) { S.t = (S.t + dt * .8) % 24; applica(); }
    for (const tb of tubi) tb.tx.offset.x -= dt * tb.verso * (tb.ramo in VEL ? VEL[tb.ramo] : S.carico > .02 ? .5 + 1.6 * S.carico : 0);
    ist.tick(dt, S.carico); if (acs) acs.tick(dt, S.ricarica ? 1 : 0);
    if (S.carico > .02) { for (let i = 0; i < NA; i++) { const s = aSeed[i], f = (now * (.35 + .5 * S.carico) + s[2]) % 1; aPos[i * 3] = ist.bocca.x + (s[0] - .5) * .5 * (1 + f); aPos[i * 3 + 1] = ist.bocca.y + (s[1] - .5) * .5 * (1 + f); aPos[i * 3 + 2] = ist.bocca.z + .05 + f * 1.1; } aria.geometry.attributes.position.needsUpdate = true; }
    posaCamera();
    viste.forEach((v, i) => { etich.copy(v.pos).project(camera); onEtichetta(i, (etich.x * .5 + .5) * W, (-etich.y * .5 + .5) * H, etich.z < 1); });
  }
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), dita = new Map(); let mosso = 0, pinch = 0, onApri = () => {};
  function down(e) { dita.set(e.pointerId, [e.clientX, e.clientY]); mosso = 0; pinch = 0; }
  function move(e) { const p = dita.get(e.pointerId); if (!p) return;
    if (dita.size === 1) { const dx = e.clientX - p[0], dy = e.clientY - p[1]; mosso += Math.abs(dx) + Math.abs(dy); mossaCam = true; cam.az = clamp(cam.az - dx * .005, rad(-32), rad(42)); cam.el = clamp(cam.el + dy * .004, rad(5), rad(42)); }
    dita.set(e.pointerId, [e.clientX, e.clientY]);
    if (dita.size === 2) { const [a, b] = [...dita.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) cam.zoom = clamp(cam.zoom * pinch / d, .32, 1.25); pinch = d; mosso += 20; } }
  function up(e) { const p = dita.get(e.pointerId); dita.delete(e.pointerId); pinch = 0;
    if (p && mosso < 8) { const r = canvas.getBoundingClientRect(); ptr.set((p[0] - r.left) / r.width * 2 - 1, -(p[1] - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, camera); const hit = ray.intersectObjects(viste.map(v => v.ist.group), true)[0]; if (hit) onApri(PRODOTTI.find(q => q.id === hit.object.userData.prodotto)); } }
  function wheel(e) { cam.zoom = clamp(cam.zoom * Math.exp(e.deltaY * .0012), .32, 1.25); }
  return { scene, camera, resize, tick, down, move, up, wheel, S, cam, POSTO, viste,
    entra() { applica(); }, ora(t) { S.t = clamp(t, 0, 24) % 24; applica(); }, stagione(estate) { S.estate = !!estate; applica(); }, play(v) { S.play = !!v; applica(); },
    su(apri, stato, etichetta) { onApri = apri; onStato = stato; onEtichetta = etichetta; } };
})();
