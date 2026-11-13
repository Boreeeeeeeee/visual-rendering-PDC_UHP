// ───────── F-COIL AGR 400 · livello leggero per Home e Casa ─────────
// Misure dal manuale 00340791 p.5: 897 × 579 × 129 mm (taglia 400, da confermare con Bore); a parete, 140 mm minimo dal pavimento (p.6). Pochi pezzi.
registra({
  id: 'fcoil', nome: 'F-COIL AGR', riga: 'Ventilconvettore: scalda, raffresca e deumidifica', apri: 'Apri il ventilconvettore', pagina: 'fcoil/',
  alto: .72, ordine: 5,
  costruisci() {
    const g = new THREE.Group(), W = .897, H = .579, D = .129, Y0 = .14;
    const bianco = std({ color: 0xd7d9db, roughness: .6, metalness: .05 }), grig = std({ color: 0xb4b8bb, roughness: .7 }), nero = std({ color: 0x1b1d20, roughness: .5 });
    g.add(mesh(rbox(W, H, D, .01), bianco, 0, Y0 + H / 2, D / 2));
    for (let i = 0; i < 8; i++) g.add(mesh(box(W - .1, .006, .012), grig, .02, Y0 + .04 + i * .016, D + .002));
    for (let i = 0; i < 9; i++) g.add(mesh(box(W - .14, .004, .008), grig, .04, Y0 + H + .002, .02 + i * .011));
    g.add(mesh(box(.11, .004, .045), nero, W / 2 - .1, Y0 + H + .003, .085));
    return { group: g, tick() {} };
  },
});
