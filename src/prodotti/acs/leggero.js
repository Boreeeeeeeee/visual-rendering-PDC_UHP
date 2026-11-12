// ───────── HP 300PSDX · livello leggero per Home e Casa ─────────
// Quote dal manuale installatore 00340944, p.14-15 (vedi src/dati/acs.json): Ø 600, altezza 1990 con piedini (35) e imbocchi aria (40),
// coperchio con imbocchi 445, imbocchi Ø 177 a interasse 320, attacchi sul fianco destro alle altezze 32,5 / 235 / 855 / 1170 / 1270 / 1370 dal fondo.
// Ricostruito: l'angolo degli attacchi e delle coperture attorno al cilindro e il verso dei due imbocchi (il manuale dà solo le altezze).
registra({
  id: 'acs', nome: 'HP 300PSDX', riga: 'Scaldacqua a pompa di calore da 300 litri, propano R290', apri: 'Apri l\'HP 300PSDX', pagina: 'acs/',
  alto: 1.99, ordine: 2,
  costruisci() {
    const g = new THREE.Group(), B = .035, R = .30, YC = B + 1.51;   // B = piedini, YC = dove comincia il coperchio (1990 - 445)
    const argento = std({ color: 0xb4b8bb, roughness: .38, metalness: .75 }), nero = std({ color: 0x1b1d20, roughness: .45, metalness: .1 }), gomma = std({ color: 0x0c0c0d, roughness: .95 });
    const ottone = std({ color: 0xb08a3c, roughness: .35, metalness: .8 });
    for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3 + PI / 6; g.add(mesh(cyl(.03, B, 12), gomma, Math.sin(a) * .22, B / 2, Math.cos(a) * .22)); }
    g.add(mesh(cyl(R, YC - B, 48), argento, 0, (YC + B) / 2, 0));
    g.add(mesh(cyl(R + .003, .02, 48), nero, 0, YC - .01, 0));
    const prof = [[R, 0], [R, .06], [.296, .26], [.275, .355], [.235, .4], [0, .405]].map(([r, y]) => new THREE.Vector2(r, y));
    g.add(mesh(new THREE.LatheGeometry(prof, 48), nero, 0, YC, 0));
    // imbocchi aria Ø 177 con griglia, interasse 320
    const tGr = cv(64, 64, (c, w, h) => { c.fillStyle = '#0b0c0d'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a3d41'; c.lineWidth = 3; for (let r = 6; r < 32; r += 7) { c.beginPath(); c.arc(32, 32, r, 0, 7); c.stroke(); } for (let a = 0; a < 6; a++) { c.beginPath(); c.moveTo(32, 32); c.lineTo(32 + Math.cos(a * PI / 3) * 30, 32 + Math.sin(a * PI / 3) * 30); c.stroke(); } });
    for (const x of [-.16, .16]) { g.add(mesh(cyl(.0885, .04, 28), nero, x, YC + .425, 0)); const d = mesh(new THREE.CircleGeometry(.08, 28), std({ map: tGr, roughness: .6 }), x, YC + .446, 0); d.rotation.x = -PI / 2; g.add(d); }
    // interfaccia utente sul coperchio
    const tUI = cv(96, 96, (c, w, h) => { c.fillStyle = '#101214'; c.fillRect(0, 0, w, h); c.fillStyle = '#9fd8ff'; c.font = '700 34px sans-serif'; c.fillText('55°', 16, 58); });
    const ui = mesh(new THREE.PlaneGeometry(.1, .1), new THREE.MeshBasicMaterial({ map: tUI }), 0, YC + .2, .297); ui.rotation.x = -.14; g.add(ui);
    g.add(mesh(rbox(.13, .13, .02, .008), std({ color: 0x2a2d31, roughness: .4 }), 0, YC + .2, .287));
    // attacchi sul fianco destro (rispetto al pannello): fredda, al solare, dal solare, anodo, calda, condensa
    const att = h => V(R + .012, B + h, 0);
    for (const h of [.0325, .235, .855, 1.17, 1.27, 1.37]) { const a = mesh(cyl(h === 1.37 ? .011 : .014, .03, 14), h === 1.17 ? nero : ottone); a.position.copy(att(h)); a.rotation.z = PI / 2; g.add(a); }
    // coperture posteriori di resistenza (950) e termostato (1150)
    for (const h of [.95, 1.15]) { const a = rad(150), c = mesh(cyl(.05, .012, 20), nero, Math.sin(a) * (R + .004), B + h, Math.cos(a) * (R + .004)); c.rotation.order = 'YXZ'; c.rotation.set(PI / 2, a, 0); g.add(c); }
    const led = ui.material;
    return { group: g, attacchi: { fredda: att(.0325).setX(R + .03), calda: att(1.27).setX(R + .03) }, tick(dt, carico = 0) { led.color.setScalar(.75 + .25 * carico); } };
  },
});
