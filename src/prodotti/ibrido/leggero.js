// ───────── Ibrido HYBREER 3 · livello leggero per Home e Casa ─────────
// Composizione scelta da Bore (13 novembre 2026): HYBREER 3 KON 24 HPQ 70/90 = pompa di calore HP_QOR 70 + caldaia KONm 24 C + kit HYBREER (depliant Sistemi ibridi p.6).
// HP_QOR 70 (depliant p.29): corpo 1040 x 865 x 410 mm, piedi a interasse 656 mm (il primo a 191 mm dal fianco sinistro), scatola dei collegamenti di 65 mm sul fianco destro,
//   attacchi acqua G1" sul retro a 368 e 533 mm da terra (89 + 279, + 165): ritorno IN sopra, mandata OUT sotto (manuale HYBREER 00339200 p.14).
// KONm 24 C (depliant p.31): 700 x 420 x 345 mm; attacchi sotto, da sinistra C, F, G, scarico, R, M (manuale HYBREER p.14).
// Kit HYBREER (manuale p.3-4): cofano 380 x 380 x 181 mm (frontale 350), collettore orizzontale con attacchi sopra R pdc, M pdc, R Cal, M Cal e sotto R imp, M imp.
// Ricostruito: posizione orizzontale degli attacchi sotto la caldaia e sul retro della HP_QOR (letta in proporzione sui disegni), colore esatto degli involucri.
const IB = (() => {
  const bianco = std({ color: 0xeceeef, roughness: .42, metalness: .05 }), grigio = std({ color: 0x9aa0a5, roughness: .5, metalness: .4 }), nero = std({ color: 0x15171a, roughness: .5, metalness: .3 });
  const ottone = std({ color: 0xb08a3c, roughness: .35, metalness: .8 }), gomma = std({ color: 0x0c0c0d, roughness: .95 });
  const giu = (o, x, y, z) => { o.position.set(x, y, z); return o; };
  // HP_QOR 70, origine a terra al centro, frontale verso +z
  function qor() {
    const g = new THREE.Group(), W = 1.04, H = .865, D = .41, Y0 = .045, XF = -.235, YF = .455, RF = .225;
    for (const x of [-.52 + .191, -.52 + .191 + .656]) g.add(mesh(box(.07, Y0, .458), grigio, x, Y0 / 2, 0));
    const tF = cv(512, 420, (c, w, h) => { c.fillStyle = '#eceeef'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#c9cdd0'; c.lineWidth = 4; c.beginPath(); c.roundRect(14, 18, 252, 384, 34); c.stroke();      // cornice quadrata del ventilatore
      drawUnicalLogo(c, 330, 34, 150); c.fillStyle = '#2b2f33'; c.font = '600 30px sans-serif'; c.fillText('HP_QOR', 345, 112);
      c.fillStyle = '#d5d9dc'; for (let i = 0; i < 6; i++) { c.beginPath(); c.roundRect(370, 150 + i * 34, 72, 10, 5); c.fill(); }
      c.fillStyle = '#2b2f33'; c.font = '500 18px sans-serif'; c.fillText('full inverter', 350, 380); });
    g.add(mesh(rbox(W, H - Y0, D, .02), [bianco, bianco, bianco, bianco, std({ map: tF, roughness: .42 }), bianco], 0, Y0 + (H - Y0) / 2, 0));
    // griglia tonda e ventilatore dietro
    const tG = cv(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#e8eaec'; c.lineWidth = 3; for (let r = 22; r < 128; r += 9) { c.beginPath(); c.arc(128, 128, r, 0, 7); c.stroke(); }
      c.lineWidth = 4; for (let a = 0; a < 8; a++) { c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.cos(a * PI / 4) * 126, 128 + Math.sin(a * PI / 4) * 126); c.stroke(); } c.fillStyle = '#eceeef'; c.beginPath(); c.arc(128, 128, 18, 0, 7); c.fill(); });
    g.add(mesh(new THREE.CircleGeometry(RF, 40), std({ color: 0x0d0f11, roughness: .9 }), XF, YF, D / 2 + .001));
    const fan = new THREE.Group(); fan.position.set(XF, YF, D / 2 + .004);
    const pala = new THREE.Shape(); pala.moveTo(.03, -.02); pala.quadraticCurveTo(.13, -.1, RF - .02, -.01); pala.quadraticCurveTo(.15, .08, .03, .03); pala.closePath();
    const pg = new THREE.ShapeGeometry(pala, 6), pm = std({ color: 0x25292d, roughness: .6, side: THREE.DoubleSide }); for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(pg, pm); b.rotation.z = i * PI * 2 / 3; fan.add(b); } g.add(fan);
    g.add(mesh(new THREE.CircleGeometry(RF, 40), std({ map: tG, transparent: true, roughness: .5 }), XF, YF, D / 2 + .008));
    // scatola dei collegamenti sul fianco destro (65 mm) e batteria alettata sul retro, dietro al ventilatore
    g.add(mesh(rbox(.065, .34, .2, .012), bianco, W / 2 + .03, .5, .02));
    const tFin = rep(cv(64, 64, (c, w, h) => { c.fillStyle = '#6f7478'; c.fillRect(0, 0, w, h); c.fillStyle = '#3d4246'; for (let x = 0; x < w; x += 6) c.fillRect(x, 0, 2, h); }), 20, 4);
    g.add(mesh(box(.68, .74, .006), std({ map: tFin, roughness: .6, metalness: .4 }), -.17, .46, -D / 2 - .003));
    // attacchi acqua sul retro: ritorno (IN) sopra a 533 mm, mandata (OUT) sotto a 368 mm
    const att = { ritorno: V(.4, .533, -D / 2 - .05), mandata: V(.4, .368, -D / 2 - .05) };
    for (const k in att) { const a = mesh(cyl(.016, .05, 14), ottone, att[k].x, att[k].y, -D / 2 - .02); a.rotation.x = PI / 2; g.add(a); }
    let ang = 0;
    return { group: g, attacchi: att, bocca: V(XF, YF, D / 2), tick(dt, carico = .4) { ang += dt * (1.2 + 9 * carico) * (carico > .02 ? 1 : 0); fan.rotation.z = -ang; } };
  }
  // KONm 24 C, origine sulla parete al centro del lato inferiore, frontale verso +z
  const KX = { C: -.17, F: -.112, G: -.05, S: .003, R: .084, M: .154 };
  function kon() {
    const g = new THREE.Group(), W = .42, H = .70, D = .345;
    const tF = cv(256, 420, (c, w, h) => { c.fillStyle = '#eceeef'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d6d9dc'; c.lineWidth = 3; c.beginPath(); c.roundRect(18, 14, w - 36, h - 92, 26); c.stroke();
      c.fillStyle = '#e2e5e7'; c.beginPath(); c.roundRect(52, h - 66, w - 104, 46, 10); c.fill(); drawUnicalLogo(c, 116, h - 76, 26);
      c.fillStyle = '#c8ccd0'; for (const x of [76, 100]) { c.beginPath(); c.arc(x, h - 43, 10, 0, 7); c.fill(); } c.fillStyle = '#3d8fd9'; c.fillRect(118, h - 58, 30, 28);
      c.fillStyle = '#7a8086'; c.font = '600 11px sans-serif'; c.fillText('KON', 156, h - 39); c.strokeStyle = '#9aa0a5'; c.lineWidth = 2; c.beginPath(); c.arc(186, h - 43, 10, 0, 7); c.stroke(); });
    g.add(mesh(rbox(W, H, D, .02), [bianco, bianco, bianco, bianco, std({ map: tF, roughness: .42 }), bianco], 0, H / 2, D / 2));
    for (const [x, r] of [[-.08, .05], [.08, .04]]) g.add(mesh(cyl(r, .02, 20), grigio, x, H + .01, D / 2));      // imbocchi sopra
    for (const k in KX) g.add(mesh(cyl(k === 'G' ? .011 : .009, .05, 10), k === 'S' ? nero : k === 'G' ? std({ color: 0xd9b23a, roughness: .4, metalness: .6 }) : ottone, KX[k], -.025, .08));
    const att = {}; for (const k in KX) att[k] = V(KX[k], -.05, .08);
    return { group: g, attacchi: att, scarico: V(-.08, H + .02, D / 2), tick() {} };
  }
  // kit HYBREER col cofano, origine sulla parete al centro del lato inferiore
  const KK = { Rpdc: -.118, Mpdc: -.043, RCal: .0435, MCal: .1185, Rimp: -.118, Mimp: .118 };
  function kit() {
    const g = new THREE.Group(), tC = cv(256, 256, (c, w, h) => { c.fillStyle = '#eceeef'; c.fillRect(0, 0, w, h); c.fillStyle = '#9aa0a5'; c.font = '500 22px sans-serif'; c.textAlign = 'right'; c.fillText('HYBREER', w - 22, 36); c.fillStyle = '#c4c8cb'; c.fillRect(w - 64, h - 30, 42, 14); drawUnicalLogo(c, w - 62, h - 29, 38, '#eceeef'); });
    g.add(mesh(box(.38, .38, .006), bianco, 0, .19, .003)); g.add(mesh(rbox(.35, .38, .175, .006), [bianco, bianco, bianco, bianco, std({ map: tC, roughness: .42 }), bianco], 0, .19, .006 + .0875));
    for (const k of ['Rpdc', 'Mpdc', 'RCal', 'MCal']) g.add(mesh(cyl(.016, .04, 12), k[0] === 'M' && k !== 'Mimp' ? ottone : grigio, KK[k], .39, .09));
    for (const k of ['Rimp', 'Mimp']) g.add(mesh(cyl(.016, .04, 12), grigio, KK[k], -.01, .09));
    const att = {}; for (const k in KK) att[k] = V(KK[k], k.endsWith('imp') ? -.03 : .41, .09);
    return { group: g, attacchi: att };
  }
  return { qor, kon, kit, KX, KK };
})();
registra({
  id: 'ibrido', nome: 'HYBREER 3', riga: 'Ibrido: pompa di calore HP_QOR 70, caldaia a condensazione KONm 24 C e kit HYBREER', apri: 'Apri l\'ibrido', pagina: 'ibrido/',
  alto: 2.0, ordine: 4,
  costruisci() {      // per la Home: la pompa di calore a terra e, su un pezzo di parete, la caldaia con il kit sotto
    const g = new THREE.Group(), q = IB.qor(); q.group.position.set(-.38, 0, .1); g.add(q.group);
    g.add(mesh(box(.62, 2.0, .03), std({ color: 0x23282d, roughness: .9 }), .62, 1.0, -.2));
    const k = IB.kit(); k.group.position.set(.62, .62, -.185); g.add(k.group); const c = IB.kon(); c.group.position.set(.62, 1.18, -.185); g.add(c.group);
    return { group: g, tick(dt, carico) { q.tick(dt, carico); } };
  },
});
