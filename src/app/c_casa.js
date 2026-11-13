// ───────── Casa: casa in sezione, il generatore al suo posto, una giornata dalle 0 alle 24 ─────────
// La casa, gli arredi, l'impianto a pavimento e il percorso dei tubi sono una scenografia generica, non prodotti Unical.
// La giornata è qualitativa: nessun valore a schermo oltre all'ora. Orari di alba e tramonto e andamento del carico sono indicativi.
const Casa = (() => {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0f13); scene.fog = new THREE.Fog(0x0b0f13, 38, 115);
  scene.environment = ENV; scene.environmentIntensity = .35;
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 200);
  const sun = new THREE.DirectionalLight(0xffffff, 2); scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x2a2a26, .5); scene.add(hemi);
  const HW = 3.2, HD = 2.6, FY = .12, WH = 2.8, TW = .22, RH = 1.8, P1 = .1, P2 = 1.4, H2 = WH + .2 + 1.0, FM = FY + WH + .2;   // H2 = pareti fino alla gronda (piano terra + solaio + 1 m di mansarda), FM = pavimento della mansarda   // metri
  // Piano terra alto 2,80 m: lo YA3 in soggiorno vuole 2,3 m sotto e 15 cm sopra (manuale 00339164 p.12, fig. 3.1), cioè almeno 2,75 m.

  // materiali: i tagli (pareti, solaio e tetto sezionati) hanno un colore a parte, come in un disegno in sezione
  const cut = std({ color: 0xe9e2d0, roughness: .9 }), wall = std({ color: 0xd8d2c4, roughness: .92 }), slab = std({ color: 0x8d8b84, roughness: .95 });
  const sez = m => [m, m, m, m, cut, m];   // faccia +z = taglio
  const g = new THREE.Group(); scene.add(g);
  const add = (geo, mat, x, y, z, parent = g) => { const o = mesh(geo, mat, x, y, z); parent.add(o); return o; };
  let dest = g;     // gruppo in cui finiscono i tubi: quelli dei due generatori stanno in gruppi che si accendono e spengono

  // percorso a tratti dritti con una curva in ogni angolo (raggio rc): per linee e cavi che non devono piegarsi a S
  function spezzata(pts, rc = .06) { const c = new THREE.CurvePath(); let cur = pts[0].clone();
    for (let i = 1; i < pts.length - 1; i++) { const a = pts[i - 1], b = pts[i], n = pts[i + 1], d1 = b.clone().sub(a), d2 = n.clone().sub(b), r = Math.min(rc, d1.length() / 2.2, d2.length() / 2.2);
      const p1 = b.clone().addScaledVector(d1.normalize(), -r), p2 = b.clone().addScaledVector(d2.normalize(), r); if (p1.distanceTo(cur) > 1e-4) c.add(new THREE.LineCurve3(cur, p1)); c.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2)); cur = p2; }
    c.add(new THREE.LineCurve3(cur, pts[pts.length - 1].clone())); return c; }
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
  add(rbox(.85, .06, .85, .02), bianco, .7, FY + .03, -HD + TW + .45);      // piatto doccia
  add(box(.02, 1.9, .85), new THREE.MeshStandardMaterial({ color: 0xbfe0ee, transparent: true, opacity: .28, roughness: .1 }), 1.13, FY + .98, -HD + TW + .45);
  const cromo = std({ color: 0xc9ccd0, metalness: .9, roughness: .2 });     // colonna doccia a sinistra della finestra del bagno, che va da x .39 a 1.11 con il telaio
  add(cyl(.012, 1.95, 8), cromo, .3, FY + 1.03, -HD + TW + .1); add(box(.024, .024, .14), cromo, .3, FY + 2.0, -HD + TW + .17); add(cyl(.08, .02, 16), cromo, .3, FY + 1.98, -HD + TW + .26);
  add(rbox(.5, .14, .4, .03), bianco, P1 + .3, FY + .85, .5); add(box(.42, .7, .32), legno, P1 + .28, FY + .43, .5);     // lavabo
  const lampM = new THREE.MeshBasicMaterial({ color: 0x40382a });
  // luci di casa: plafoniere a soffitto. Un lampadario appeso, guardando la casa dal fronte, finiva davanti alle finestre o alla testa dell'HP 300PSDX
  const lampade = [[-1.6, .1, 9], [.75, .3, 3.5], [2.3, .4, 4.5]].map(([x, z, i]) => { add(cyl(.17, .05, 24), lampM, x, FY + WH - .025, z); const y = FY + WH - .15;
    const l = new THREE.PointLight(0xffd9a0, 0, 7, 1.6); l.position.set(x, y, z); l.userData.max = i; g.add(l); return l; });

  // posto del generatore: fuori, a terra accanto alla parete destra, rivolto verso chi guarda. Qui va la UHP oppure, scambiandola (tappa 4), la HP_QOR dell'ibrido.
  const POSTO = { pos: V(HW + 1.15, .08, 1.55), yaw: rad(-14) };
  add(rbox(1.7, .08, .8, .02), slab, POSTO.pos.x, .04, POSTO.pos.z).rotation.y = POSTO.yaw;
  const gUhp = new THREE.Group(); g.add(gUhp); dest = gUhp;
  const gen = PRODOTTI.find(p => p.id === 'uhp'), ist = gen.costruisci();
  ist.group.position.copy(POSTO.pos); ist.group.rotation.y = POSTO.yaw; gUhp.add(ist.group); ist.group.updateMatrixWorld(true);
  ist.group.traverse(o => { o.userData.prodotto = gen.id; });

  // tubi: dal retro della macchina alla parete, su fino al collettore, poi le serpentine a pavimento
  const tFlow = cv(64, 8, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#8c8c8c'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(.6, '#8c8c8c'); gr.addColorStop(1, '#8c8c8c'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const tubi = [];
  function tubo(pts, r, verso, ramo) {
    const c = spezzata(pts, .05), len = c.getLength(), tx = tFlow.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(Math.max(1, len / .32), 1); tx.needsUpdate = true;
    const m = new THREE.MeshBasicMaterial({ map: tx }); add(new THREE.TubeGeometry(c, Math.max(16, Math.round(len * 40)), r, 6), m, 0, 0, 0, dest); tubi.push({ m, tx, verso, ramo });
  }
  const aM = ist.group.localToWorld(ist.attacchi.mandata.clone()), aR = ist.group.localToWorld(ist.attacchi.ritorno.clone());
  const dietro = V(0, 0, -1).applyAxisAngle(V(0, 1, 0), POSTO.yaw), XI = HW - TW - .05, ZI = -HD + TW + .06, COL = { x: HW - TW - .4, y: FY + .32 };   // collettore in basso a destra: sopra stanno il kit HYBREER e la caldaia (tappa 4)
  [[aM, 1, 'mandata', 0], [aR, -1, 'ritorno', .09]].forEach(([a, verso, ramo, dz]) => {
    const b = a.clone().addScaledVector(dietro, .28 + dz), zc = b.z;
    tubo([a, b, V(HW + .25, a.y, zc), V(XI - dz, a.y, zc), V(XI - dz, a.y, ZI + dz), V(COL.x + .18 - dz * 2, a.y, ZI + dz), V(COL.x + .18 - dz * 2, COL.y - .2, ZI + dz)], .026, verso, ramo);
  });
  dest = g; add(rbox(.6, .46, .1, .015), std({ color: 0xc7ccd0, roughness: .4, metalness: .5 }), COL.x, COL.y, ZI);     // collettore dell'impianto (generico)
  function serpentina(x0, x1, z0, z1, passo, entra) { const p = entra.slice(); let dir = 1; for (let x = x1; x >= x0 - .001; x -= passo) { p.push(V(x, FY + .014, dir > 0 ? z1 : z0), V(x, FY + .014, dir > 0 ? z0 : z1)); dir = -dir; } return p; }
  const yp = FY + .014, giu = x => [V(x, COL.y - .2, ZI + .02), V(x, yp, ZI + .02)];
  tubo(serpentina(-HW + TW + .25, P1 - .25, -HD + TW + .3, HD - .3, .34, [...giu(COL.x - .08), V(COL.x - .08, yp, HD - .3)]), .013, 1, 'mandata');
  tubo(serpentina(P1 + .22, P2 - .2, -HD + TW + 1.1, HD - .8, .3, [...giu(COL.x - .2), V(COL.x - .2, yp, HD - .55), V(P2 - .2, yp, HD - .55)]), .013, 1, 'mandata');
  // acqua calda: HP 300PSDX nella lavanderia. Il locale disegnato è circa 1,9 x 4,8 x 2,7 m = 24 m³: sopra i 20 m³ che il manuale chiede (p.19) quando l'aria non è canalizzata.
  const viste = [{ def: gen, ist, pos: POSTO.pos.clone().setY(1.5) }];
  const acsDef = PRODOTTI.find(p => p.id === 'acs'), acs = acsDef && acsDef.costruisci();
  if (acs) {
    acs.group.position.set(HW - TW - .98, FY, -HD + TW + .5); g.add(acs.group); acs.group.updateMatrixWorld(true); acs.group.traverse(o => { o.userData.prodotto = 'acs'; });     // dalla tappa 4 spostato di 48 cm a sinistra: a destra stanno caldaia e kit
    viste.push({ def: acsDef, ist: acs, pos: acs.group.position.clone().setY(FY + 1.05) });     // etichetta sulla parte che si vede dal fronte, sotto il bordo del solaio
    add(rbox(.6, .85, .6, .03), bianco, P2 + .4, FY + .425, -.6); add(cyl(.2, .02, 24), nero, P2 + .4, FY + .45, -.29).rotation.x = PI / 2;     // lavatrice
    const c = acs.group.localToWorld(acs.attacchi.calda.clone()), f = acs.group.localToWorld(acs.attacchi.fredda.clone()), zb = -HD + TW + .07;
    const ya = FY + WH - .25, zd = -HD + TW + .1;     // calda fino alla doccia (percorso generico): sopra la finestra del bagno, poi giù lungo la colonna
    tubo([c, V(c.x + .1, c.y, c.z), V(c.x + .1, ya, c.z), V(c.x + .1, ya, zd), V(.3, ya, zd), V(.3, FY + 2.012, zd)], .016, 1, 'acs');
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
    const zs = -HD + TW + .02, xs = -HW + TW + .02, ys = FY + .06;     // rete: giù al battiscopa, dietro il divano e sotto il ventilconvettore, fuori fino al contatore (non passa sulla finestra)
    tubo([V(-.4, yq - .2, zi + .05), V(-.4, ys, zs), V(xs, ys, zs), V(xs, ys, 1.0), V(-HW - .03, ys, 1.0), V(-HW - .03, FY + 1.1, 1.0)], .012, 1, 'rete');
  }
  // aria dei terminali (ventilconvettore, climatizzatori, ventole delle unità esterne): punti che escono dalle bocche quando la macchina lavora
  const EMIT = [], ELICHE = [];
  function emettitore(obj, o, d, s, L, chi, colore) { obj.updateMatrixWorld(true); const q = new THREE.Quaternion(); obj.getWorldQuaternion(q);
    EMIT.push({ o: obj.localToWorld(o.clone()), d: d.clone().normalize().applyQuaternion(q), s: s.clone().applyQuaternion(q), L, chi, colore }); }
  // ventilconvettore F-COIL AGR 400 (tappa 5): in soggiorno, sulla parete di sinistra, a 140 mm dal pavimento (manuale 00340791 p.6). Taglia e posto da confermare con Bore.
  // Collegato alla distribuzione sotto il pavimento: percorso indicativo.
  const fcDef = PRODOTTI.find(p => p.id === 'fcoil');
  if (fcDef) {
    const fc = fcDef.costruisci(); fc.group.position.set(-HW + TW + .002, FY, .55); fc.group.rotation.y = PI / 2; g.add(fc.group); fc.group.traverse(o => { o.userData.prodotto = 'fcoil'; });
    viste.push({ def: fcDef, ist: fc, pos: V(-HW + TW + .12, FY + .8, .55) });
    emettitore(fc.group, V(0, .73, .065), V(0, 1, .3), V(.38, 0, 0), .55, 'fc', 'stagione');     // soffia dalla griglia in alto (manuale 00340791 p.4)
    const rame = std({ color: 0xc47a45, roughness: .35, metalness: .9 }); for (const dz of [-.37, -.33]) add(cyl(.008, .2, 10), rame, -HW + TW + .06, FY + .05, .55 + dz);
  }
  // climatizzatori (scelte di Bore del 13 novembre 2026). Mono: YA3 13HI in soggiorno, sulla parete esterna di sinistra verso il fronte, con 2,3 m sotto e 15 cm sopra
  // (manuale 00339164 p.12, fig. 3.1); la sua unità esterna YA3 13HE subito fuori. Dual: XMX2 18HE fuori sullo stesso lato, con le due console XMPS 12HI
  // in mansarda, una per muretto. Le linee escono dal muro dietro le macchine e scendono in una canalina bianca fino alle valvole delle unità esterne;
  // quelle della console di destra corrono nel solaio. Ricostruiti: posti delle macchine, fori nel muro, canaline e percorso delle linee.
  const clDef = PRODOTTI.find(p => p.id === 'clima'); let CLI = null;
  if (clDef && typeof CLM !== 'undefined') {
    const gC = new THREE.Group(), XE = -HW - .55, XW = -HW - .026;
    const ya3 = CLM.parete(), c1 = CLM.console(), c2 = CLM.console(), e1 = CLM.esterna(.765, .555, .303), e2 = CLM.esterna(.805, .554, .33);
    const Z1 = 1.64, Z2 = .02, ZC1 = Z1 + .765 / 2 + .075, ZC2 = Z2 + .805 / 2 + .075, ZK1 = ZC2 - .3, ZK2 = -.25, YH = FY + 2.38;
    ya3.position.set(-HW + TW, FY + 2.3, ZC1 - .3); ya3.rotation.y = PI / 2;                 // verso il fronte, dove il solaio non lo copre; tubi dal retro, lato sinistro guardandolo
    c1.position.set(-HW + TW, FM, ZK1); c1.rotation.y = PI / 2; c2.position.set(HW - TW, FM, ZK2); c2.rotation.y = -PI / 2;
    e1.position.set(XE, 0, Z1); e1.rotation.y = -PI / 2; e2.position.set(XE, 0, Z2); e2.rotation.y = -PI / 2; gC.add(ya3, c1, c2, e1, e2); g.add(gC);
    const pvc = std({ color: 0xe9e9e4, roughness: .6 }), coib = std({ color: 0x2b2e31, roughness: .9 }), valv = std({ color: 0x8f969b, roughness: .4, metalness: .6 });
    const canalina = (z, y0, y1) => { gC.add(mesh(box(.05, y1 - y0, .07), pvc, XW, (y0 + y1) / 2, z)); gC.add(mesh(box(.05, .02, .09), pvc, XW, y1 + .01, z)); };
    canalina(ZC1, .42, YH + .06); canalina(ZC2, .42, FM + .16);
    // ultimo tratto: dal fondo della canalina, linee coibentate fino alle valvole sul fianco dell'unità esterna (coperchio delle valvole compreso)
    for (const [z0, n, W, D, zc] of [[Z1, 1, .765, .303, ZC1], [Z2, 2, .805, .33, ZC2]]) { const zv = z0 + W / 2 + .012, xv = XE + D / 2 - .08;
      gC.add(mesh(box(.12, .16, .02), valv, xv, .28, zv));
      for (let k = 0; k < n; k++) { const y = .31 - k * .07, dz = k ? .018 : -.012;
        gC.add(new THREE.Mesh(new THREE.TubeGeometry(spezzata([V(XW, .45, zc + dz), V(XW, y, zc + dz), V(xv, y, zc + dz), V(xv, y, zv + .012)], .05), 32, .014, 8), coib)); } }
    gC.traverse(o => { o.userData.prodotto = 'clima'; }); viste.push({ def: clDef, ist: { group: gC, tick() {} }, pos: V(HW - TW - .3, FM + .9, ZK2) });     // etichetta sulla console di destra: a sinistra la copre il riquadro dell'ora
    CLI = { ya3, c1, c2, e1, e2 };
    emettitore(ya3, V(0, .03, .17), V(0, -.7, 1), V(.34, 0, 0), .8, 'mono', 'fresco');      // l'aletta in basso davanti
    for (const c of [c1, c2]) emettitore(c, V(0, .62, .1), V(0, 1, .35), V(.28, 0, 0), .6, 'dual', 'fresco');     // la console soffia dall'alto
    for (const [e, W, H, D, chi] of [[e1, .765, .555, .303, 'mono'], [e2, .805, .554, .33, 'dual']]) {      // ventola dell'unità esterna: gira e butta fuori il calore d'estate
      const FX = -.125, R = Math.min(.22, (W - .25) / 2 - .03), el = new THREE.Group(); el.position.set(FX, H / 2 + .03, D / 2 + .003); e.add(el);
      for (let k = 0; k < 3; k++) { const b = mesh(box(R * .9, R * .32, .002), std({ color: 0x3a3f44, roughness: .6 }), R * .45, 0, 0); const pv = new THREE.Group(); pv.rotation.z = k * PI * 2 / 3; pv.add(b); el.add(pv); }
      ELICHE.push({ el, chi }); emettitore(e, V(FX, H / 2 + .03, D / 2 + .02), V(0, 0, 1), V(R * .8, 0, 0), .7, chi, 'caldo'); }
  }
  // ibrido HYBREER 3 (tappa 4, scelte di Bore del 13 novembre 2026): HP_QOR 70 al posto della UHP; caldaia KONm 24 C e kit HYBREER a vista in lavanderia, sulla parete di fondo,
  // sopra il collettore dell'impianto. Collegamenti come nello schema del manuale HYBREER 00339200 p.14: pompa di calore su R pdc / M pdc, caldaia su R Cal / M Cal,
  // impianto su R imp / M imp. La caldaia lavora solo in riscaldamento (p.19, AHS = CALDO): i suoi attacchi C e F restano chiusi, l'acqua calda la fa l'HP 300PSDX.
  // Ricostruiti: posizione di caldaia e kit sulla parete, contatore del gas, percorso di tubi, gas e scarico fumi.
  const ibDef = PRODOTTI.find(p => p.id === 'ibrido'); let IBR = null;
  if (ibDef) {
    const gIb = new THREE.Group(); gIb.visible = false; g.add(gIb); dest = gIb;
    const q = IB.qor(); q.group.position.copy(POSTO.pos); q.group.rotation.y = POSTO.yaw; gIb.add(q.group); q.group.updateMatrixWorld(true);
    const zw = -HD + TW, KXc = COL.x, kit = IB.kit(), kon = IB.kon(); kit.group.position.set(KXc, FY + .66, zw); kon.group.position.set(KXc, FY + 1.3, zw); gIb.add(kit.group, kon.group);
    gIb.updateMatrixWorld(true); const W = (o, v) => o.localToWorld(v.clone());
    const kA = k => W(kit.group, kit.attacchi[k]), cA = k => W(kon.group, kon.attacchi[k]), ZH = zw + .035, ZF = zw + .09;
    // pompa di calore → kit: lungo la parete di fondo dietro l'HP 300PSDX, poi dall'alto negli attacchi R pdc e M pdc
    [[W(q.group, q.attacchi.mandata), 1, 'pdcM', 0, 'Mpdc', FY + 1.16], [W(q.group, q.attacchi.ritorno), -1, 'pdcR', .07, 'Rpdc', FY + 1.22]].forEach(([a, verso, ramo, dz, k, yh]) => {
      const b = a.clone().addScaledVector(dietro, .28 + dz), zc = b.z, f = kA(k);
      tubo([a, b, V(HW + .25, a.y, zc), V(XI - dz, a.y, zc), V(XI - dz, a.y, ZH), V(XI - dz, yh, ZH), V(f.x, yh, ZH), V(f.x, yh, ZF), V(f.x, f.y, ZF)], .02, verso, ramo); });
    // caldaia → kit: R e M scendono negli attacchi R Cal e M Cal
    for (const [c, k, verso, ramo] of [['M', 'MCal', 1, 'calM'], ['R', 'RCal', -1, 'calR']]) { const a = cA(c), f = kA(k), ym = FY + 1.22; tubo([a, V(a.x, ym, ZF), V(f.x, ym, ZF), V(f.x, f.y, ZF)], .016, verso, ramo); }
    // kit → collettore dell'impianto
    for (const [k, verso, ramo] of [['Mimp', 1, 'mandata'], ['Rimp', -1, 'ritorno']]) { const a = kA(k); tubo([a, V(a.x, COL.y + .23, ZF)], .02, verso, ramo); }
    // gas: contatore sulla parete esterna destra, dentro casa fino all'attacco G della caldaia
    const gasM = std({ color: 0xc9a227, roughness: .5, metalness: .5 }), aG = cA('G'), yg = FY + 1.0;
    add(box(.12, .32, .26), std({ color: 0x8f969b, roughness: .5, metalness: .4 }), HW + .06, yg, .55, gIb);
    tubo([V(HW + .06, yg, .55), V(XI - .1, yg, .55), V(XI - .1, yg, zw + .18), V(KXc + .27, yg, zw + .18), V(KXc + .27, FY + 1.27, zw + .18), V(aG.x, FY + 1.27, zw + .18), V(aG.x, FY + 1.27, aG.z), aG], .012, 1, 'gas');
    for (const c of ['C', 'F']) add(cyl(.013, .02, 10), gasM, cA(c).x, cA(c).y - .005, cA(c).z, gIb);     // attacchi sanitari chiusi
    // scarico fumi: sale e attraversa la parete di fondo
    const sc = W(kon.group, kon.scarico), fumi = std({ color: 0xdfe2e4, roughness: .4, metalness: .3 });
    add(cyl(.05, FY + 2.52 - sc.y, 16), fumi, sc.x, (sc.y + FY + 2.52) / 2, sc.z, gIb); add(cyl(.05, sc.z + HD + .12, 16), fumi, sc.x, FY + 2.52, (sc.z - HD - .12) / 2, gIb).rotation.x = PI / 2;
    gIb.traverse(o => { o.userData.prodotto = 'ibrido'; }); dest = g;
    IBR = { def: ibDef, gIb, q, ist: { group: gIb, tick: () => {} }, pos: POSTO.pos.clone().setY(1.3) };
  }
  // aria che attraversa la macchina, visibile quando lavora
  const NA = 36, aPos = new Float32Array(NA * 3), RA = rng(3), aSeed = Array.from({ length: NA }, () => [RA(), RA(), RA()]);     // un solo generatore: semi consecutivi davano numeri quasi uguali e l'aria era un punto solo
  const aria = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(aPos, 3)), new THREE.PointsMaterial({ size: .05, transparent: true, opacity: 0, depthWrite: false, color: 0xbfe6ff }));
  ist.group.add(aria); let bocca = ist.bocca;

  // punti d'aria dei terminali: escono dalle bocche e svaniscono; la quantità segue quanto lavora la macchina
  const PUNTO = cv(32, 32, c => { const r = c.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.55, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(0, 0, 32, 32); });
  const NPE = 16, NT = EMIT.length * NPE, tPos = new Float32Array(NT * 3), tCol = new Float32Array(NT * 4), RT = rng(501), tSeed = Array.from({ length: NT }, () => [RT(), RT(), RT()]);
  const ariaT = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(tPos, 3)).setAttribute('color', new THREE.BufferAttribute(tCol, 4)),
    new THREE.PointsMaterial({ size: .2, map: PUNTO, vertexColors: true, transparent: true, depthWrite: false }));     // colore e trasparenza per punto: si vedono anche di giorno sulle pareti chiare
  ariaT.frustumCulled = false; g.add(ariaT);
  const COLA = { fresco: [.12, .5, 1], caldo: [1, .38, .08] };
  // sole in cielo
  const sole = add(new THREE.SphereGeometry(1.5, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff1c9, fog: false }), 0, 0, 0);

  // ───────── la giornata ─────────
  const S = { t: 6.4, estate: false, play: true, gen: 'uhp', caldaia: 0, carico: 0, fcoil: 0, mono: 0, dual: 0, doccia: 0, caldo: 1, ricarica: false, fv: !!fvDef, pv: 0, ld: 0, bat: 0, rete: 0, soc: .5, sole: false };
  const C = (h) => new THREE.Color(h), NOTTE = C(0x070b12), ALBA = C(0x6a5a6e), GI = C(0x86a5bf), GE = C(0x6aa6dc), tmp = C(0), CALDO = C(0xff7a2a), FREDDO = C(0x3fa9ff);
  const COL_T = { mandataC: C(0xff8a3d), ritornoC: C(0xb5522e), mandataF: C(0x7fd6ff), ritornoF: C(0x3f86c9), fermo: C(0x7a7f85), acs: C(0xff5a3c), fredda: C(0x58b8ff), fv: C(0xffd84a), bat: C(0x7dff9a), casa: C(0xfff2b0), rete: C(0xc49bff), gas: C(0xffc83a), calC: C(0xff5a2a) };
  const FASI = {
    inverno: [[0, 'Notte. Fuori fa freddo: la pompa di calore lavora piano e tiene la casa in temperatura.'], [5, 'Mattino presto. Prende calore dall\'aria fredda e lo passa all\'acqua: pavimento e ventilconvettore scaldano la casa prima della sveglia.'],
      [9, 'Giorno. Con il sole la casa chiede meno calore e la macchina rallenta.'], [16, 'Sera. Fuori torna il freddo e la casa si riempie: lavora di più.'], [22, 'Notte. Rallenta e mantiene.']],
    estate: [[0, 'Notte. La casa è fresca: la pompa di calore riposa.'], [9, 'Il sole scalda la casa: parte il raffrescamento, a pavimento e dal ventilconvettore.'],
      [11, 'Sotto il tetto la mansarda si scalda per prima: partono le due console del climatizzatore dual.'],
      [13, 'Pomeriggio. Lavora al contrario: toglie calore alla casa e lo porta fuori. In soggiorno aiuta anche il climatizzatore a parete.'], [19.5, 'Sera. Fuori rinfresca: i climatizzatori si spengono e la pompa di calore rallenta.'], [23, 'Notte. Si ferma.']],
    // con l'ibrido (manuale HYBREER p.19): sotto la temperatura esterna impostata la caldaia si accende insieme alla pompa di calore; in estate raffresca solo la pompa di calore
    inverno_ibrido: [[0, 'Notte. Fuori fa freddo: la pompa di calore lavora piano e tiene la casa in temperatura.'], [1.5, 'Notte fonda. Fuori scende sotto la soglia impostata: si accende la caldaia e lavora insieme alla pompa di calore.'],
      [5, 'Mattino presto. Pompa di calore e caldaia insieme: la casa è calda prima della sveglia.'], [8.5, 'Fuori si scalda: la caldaia si spegne, resta solo la pompa di calore, che consuma meno.'],
      [16, 'Sera. Fuori torna il freddo e la casa si riempie: la pompa di calore lavora di più.'], [22, 'Notte. Rallenta e mantiene.']],
    estate_ibrido: [[0, 'Notte. La casa è fresca: tutto spento.'], [9, 'Il sole scalda la casa: parte il raffrescamento. La caldaia resta spenta: d\'estate lavora solo la pompa di calore.'],
      [11, 'Sotto il tetto la mansarda si scalda per prima: partono le due console del climatizzatore dual.'],
      [13, 'Pomeriggio. La pompa di calore toglie calore alla casa e lo porta fuori. In soggiorno aiuta anche il climatizzatore a parete.'], [19.5, 'Sera. Fuori rinfresca: i climatizzatori si spengono e la pompa di calore rallenta.'], [23, 'Notte. Si ferma.']],
  };
  const camp = (t, a, b, lo, hi) => lo + (hi - lo) * sm(a, a + 1.5, t) * (1 - sm(b, b + 1.5, t));   // rampa morbida tra due orari
  // climatizzatori (indicativo): solo d'estate. Il dual tiene fresca la mansarda, sotto il tetto, dalla tarda mattina alla sera;
  // il mono aiuta il soggiorno nelle ore più calde. D'inverno scaldano la pompa di calore, il pavimento e il ventilconvettore.
  const clima = (t, estate) => estate ? { dual: camp(t, 10.5, 19.5, 0, 1), mono: camp(t, 12, 17.5, 0, 1) } : { dual: 0, mono: 0 };
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
      const cl = clima(t, estate), ld = .14 + .42 * carico(t, estate) + .12 * camp(t, 18.5, 21.5, 0, 1) + (acqua(t).caldo < .999 ? .1 : 0) + .1 * cl.dual + .06 * cl.mono, av = pv - ld; let b = 0;
      if (av > 0) { b = soc < 1 ? Math.min(av, .6) : 0; soc = Math.min(1, soc + b * .034); } else { b = soc > .1 ? Math.max(av, -.6) : 0; soc = Math.max(.1, soc + b * .034); }
      r[i] = { pv, ld, b, rete: av - b, soc }; }
    return r; });
  const fase = (t, estate) => { const f = FASI[(estate ? 'estate' : 'inverno') + (S.gen === 'ibrido' ? '_ibrido' : '')]; let r = f[0][1]; for (const [h, s] of f) if (t >= h) r = s; return r; };
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
    S.carico = carico(t, estate); S.fcoil = sm(.02, .3, S.carico); const cl = clima(t, estate); S.dual = cl.dual; S.mono = cl.mono;
    // ore più fredde dell'inverno (indicative, nessun numero a schermo): la caldaia dell'ibrido si accende e lavora insieme alla pompa di calore
    S.caldaia = S.gen === 'ibrido' && !estate ? sm(1.3, 1.8, t) * (1 - sm(8.3, 8.8, t)) : 0;
    const tinta = estate ? FREDDO : CALDO; fLiv.emissive.copy(tinta).multiplyScalar(.10 * S.carico); fBag.emissive.copy(tinta).multiplyScalar(.10 * S.carico);
    const aq = acqua(t); S.doccia = aq.doccia; S.caldo = aq.caldo; S.ricarica = !aq.doccia && aq.caldo < .999;
    const en = EN[estate ? 1 : 0][Math.min(239, Math.floor(t * 10))]; S.pv = en.pv; S.ld = en.ld; S.bat = en.b; S.rete = en.rete; S.soc = en.soc; S.sole = S.fv && en.pv - en.ld > .05; if (bat) bat.carica(en.soc);
    const ATT = { acs: S.doccia, fredda: S.doccia, fv: sm(0, .08, S.pv), bat: sm(0, .02, Math.abs(S.bat)), casa: 1, rete: sm(0, .02, Math.abs(S.rete)), gas: S.caldaia };
    VEL.acs = VEL.fredda = 1.5 * S.doccia; VEL.fv = 2.2 * S.pv; VEL.bat = 2.6 * S.bat; VEL.casa = .5 + S.ld; VEL.rete = 2.6 * S.rete; VEL.gas = .8 * S.caldaia; VEL.calM = VEL.calR = 1.6 * S.caldaia;
    const RAMO = { pdcM: 'mandata', pdcR: 'ritorno' };
    for (const tb of tubi) { if (tb.ramo === 'calM' || tb.ramo === 'calR') tb.m.color.copy(COL_T.fermo).lerp(tb.ramo === 'calM' ? COL_T.calC : COL_T.ritornoC, S.caldaia); else if (tb.ramo in RAMO) tb.m.color.copy(COL_T.fermo).lerp(COL_T[RAMO[tb.ramo] + (estate ? 'F' : 'C')], sm(0, .15, S.carico)); else if (tb.ramo in ATT) tb.m.color.copy(COL_T.fermo).lerp(COL_T[tb.ramo], ATT[tb.ramo]); else tb.m.color.copy(COL_T.fermo).lerp(COL_T[tb.ramo + (estate ? 'F' : 'C')], sm(0, .15, S.carico)); }
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
    if (S.gen === 'ibrido') IBR.q.tick(dt, S.carico); else ist.tick(dt, S.carico); if (acs) acs.tick(dt, S.ricarica ? 1 : 0);
    if (S.carico > .02) { for (let i = 0; i < NA; i++) { const s = aSeed[i], f = (now * (.35 + .5 * S.carico) + s[2]) % 1; aPos[i * 3] = bocca.x + (s[0] - .5) * .5 * (1 + f); aPos[i * 3 + 1] = bocca.y + (s[1] - .5) * .5 * (1 + f); aPos[i * 3 + 2] = bocca.z + .05 + f * 1.1; } aria.geometry.attributes.position.needsUpdate = true; }
    const ATT = { fc: S.fcoil, mono: S.mono, dual: S.dual };
    EMIT.forEach((e, k) => { const a = ATT[e.chi], col = e.colore === 'stagione' ? (S.estate ? COLA.fresco : COLA.caldo) : COLA[e.colore];
      for (let j = 0; j < NPE; j++) { const i = k * NPE + j, s = tSeed[i], f = (now * .45 + s[1]) % 1, w = (s[0] - .5) * 2, r = (s[2] - .5) * .05 * (1 + f), v = a * Math.min(1, f * 6) * Math.min(1, (1 - f) * 2.2);
        tPos[i * 3] = e.o.x + e.d.x * e.L * f + e.s.x * w; tPos[i * 3 + 1] = e.o.y + e.d.y * e.L * f + e.s.y * w + r; tPos[i * 3 + 2] = e.o.z + e.d.z * e.L * f + e.s.z * w;
        tCol[i * 4] = col[0]; tCol[i * 4 + 1] = col[1]; tCol[i * 4 + 2] = col[2]; tCol[i * 4 + 3] = v; } });
    ariaT.geometry.attributes.position.needsUpdate = ariaT.geometry.attributes.color.needsUpdate = true;
    for (const e of ELICHE) e.el.rotation.z -= dt * 16 * ATT[e.chi];
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
  // scambio del generatore: UHP da sola oppure ibrido HYBREER 3. La prima etichetta segue il generatore acceso.
  const VUHP = { def: gen, ist, pos: viste[0].pos.clone() };
  function generatore(id) { if (id === 'ibrido' && !IBR) return; S.gen = id === 'ibrido' ? 'ibrido' : 'uhp'; const ib = S.gen === 'ibrido';
    gUhp.visible = !ib; if (IBR) IBR.gIb.visible = ib; Object.assign(viste[0], ib ? { def: IBR.def, ist: IBR.ist, pos: IBR.pos.clone() } : VUHP);
    (ib ? IBR.q.group : ist.group).add(aria); bocca = ib ? IBR.q.bocca : ist.bocca; applica(); }
  return { scene, camera, resize, tick, down, move, up, wheel, S, cam, POSTO, viste, generatore, ibrido: !!IBR,
    entra() { applica(); }, ora(t) { S.t = clamp(t, 0, 24) % 24; applica(); }, stagione(estate) { S.estate = !!estate; applica(); }, play(v) { S.play = !!v; applica(); },
    su(apri, stato, etichetta) { onApri = apri; onStato = stato; onEtichetta = etichetta; } };
})();
