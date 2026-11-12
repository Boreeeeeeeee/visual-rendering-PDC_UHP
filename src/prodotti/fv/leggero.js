// ───────── Fotovoltaico Unical · livello leggero per Home e Casa ─────────
// MULTIVOLT 460 BF (scheda 00341524): 1762 x 1134 x 30 mm, 96 mezze celle 6 x 16, doppio vetro, telaio in alluminio.
// ZOE1-6000 (manuale 00341435 p.22, 75): 540 x 450 x 185 mm, frontale chiaro con scritta Unical in alto e schermo LCD in basso al centro.
// SUM BL15P (manuale 00341436 p.13-14, 36): tre moduli da 650 x 360 x 180 mm impilati su una base, etichetta-display al centro con 4 tacche di carica.
// Ricostruito: altezza della base della batteria (50 mm, ricavata dai 770 mm per due moduli della guida rapida), colore esatto degli involucri (bianco dalle foto).
const FV = (() => {
  const tMod = cv(256, 128, (c, w, h) => { c.fillStyle = '#07090c'; c.fillRect(0, 0, w, h); const cw = (w - 12) / 16, ch = (h - 8) / 6;
    for (let i = 0; i < 16; i++) for (let j = 0; j < 6; j++) { c.fillStyle = (i + j) % 2 ? '#10161f' : '#0e141c'; c.fillRect(4 + i * cw + (i > 7 ? 4 : 0) + .6, 4 + j * ch + .6, cw - 1.2, ch - 1.2); } });
  const vetro = std({ map: tMod, roughness: .18, metalness: .35 }), telaio = std({ color: 0x15171a, roughness: .5, metalness: .6 });
  // modulo sdraiato: lunghezza lungo x, larghezza lungo z, faccia superiore con le celle
  const modGeo = box(1.762, .03, 1.134), modMat = [telaio, telaio, vetro, telaio, telaio, telaio];
  const bianco = std({ color: 0xe9ebec, roughness: .45, metalness: .05 }), grigio = std({ color: 0x9aa0a5, roughness: .5, metalness: .4 }), nero = std({ color: 0x15171a, roughness: .5 });
  function inverter() {
    const g = new THREE.Group(); g.add(mesh(rbox(.54, .45, .14, .02), bianco, 0, 0, .045 + .07)); g.add(mesh(box(.46, .40, .045), grigio, 0, 0, .0225));   // corpo e radiatore sul retro
    const tL = cv(256, 80, c => drawUnicalLogo(c, 8, 6, 230)); g.add(mesh(new THREE.PlaneGeometry(.15, .047), std({ map: tL, transparent: true, roughness: .5 }), 0, .15, .1865));
    const tD = cv(64, 48, c => { c.fillStyle = '#0d1114'; c.fillRect(0, 0, 64, 48); c.fillStyle = '#7fd0ff'; c.fillRect(8, 8, 48, 18); c.fillStyle = '#3a4046'; for (let i = 0; i < 4; i++) c.fillRect(8 + i * 13, 32, 9, 9); });
    g.add(mesh(new THREE.PlaneGeometry(.1, .075), new THREE.MeshBasicMaterial({ map: tD }), 0, -.13, .1865));
    for (const x of [-.2, -.12, -.04, .05, .13, .2]) g.add(mesh(cyl(.012, .03, 10), nero, x, -.24, .1));      // terminali sul lato inferiore
    return g;
  }
  function batteria(n = 3) {
    const g = new THREE.Group(), tLed = cv(32, 96, () => {}), led = new THREE.MeshBasicMaterial({ map: tLed });
    g.add(mesh(box(.65, .05, .18), grigio, 0, .025, 0));
    for (let i = 0; i < n; i++) { g.add(mesh(rbox(.65, .355, .18, .012), bianco, 0, .05 + .18 + i * .36, 0)); g.add(mesh(new THREE.PlaneGeometry(.025, .075), led, 0, .05 + .18 + i * .36, .0905)); }
    let ult = -1;
    function carica(soc) { const k = Math.round(clamp(soc) * 4); if (k === ult) return; ult = k; const c = tLed.image.getContext('2d'); c.fillStyle = '#0d1114'; c.fillRect(0, 0, 32, 96); for (let i = 0; i < 4; i++) { c.fillStyle = i < k ? '#7dff9a' : '#27302b'; c.fillRect(8, 74 - i * 20, 16, 12); } tLed.needsUpdate = true; }
    carica(.5); return { group: g, carica, alto: .05 + n * .36 };
  }
  return { modGeo, modMat, inverter, batteria };
})();
registra({
  id: 'fv', nome: 'Fotovoltaico', riga: 'MULTIVOLT 460 BF, inverter ZOE1-6000 e batteria SUM BL15P', apri: 'Apri il fotovoltaico', pagina: 'fv/',
  alto: 1.75, ordine: 3,
  costruisci() {      // per la Home: un modulo, l'inverter e la batteria uno accanto all'altro
    const g = new THREE.Group(), m = mesh(FV.modGeo, FV.modMat, -.55, .85, -.1); m.rotation.set(-rad(20), PI / 2, PI / 2); g.add(m);       // in piedi, appoggiato all'indietro
    g.add(mesh(box(.95, 1.9, .03), std({ color: 0x23282d, roughness: .9 }), .55, .95, -.03));                                               // un pezzo di parete per inverter e batteria
    const b = FV.batteria(3); b.group.position.set(.55, 0, .08); g.add(b.group); const i = FV.inverter(); i.position.set(.55, 1.55, -.015); g.add(i);
    return { group: g, tick() {} };
  },
});
