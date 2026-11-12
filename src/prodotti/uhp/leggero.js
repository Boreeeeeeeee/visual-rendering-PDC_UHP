// ───────── UHP 120 · livello leggero per Home e Casa ─────────
// Stesse quote del modello completo (c_build.js, dal manuale 00341518 §5.5.2): larghezza 1280, profondità 450, altezza 1040 + piedi,
// interasse piedi 784, attacchi acqua G 1" sul retro a 72 mm dal fondo. Pochi pezzi: il dettaglio vero sta nella pagina del prodotto.
registra({
  id: 'uhp', nome: 'UHP 120', riga: 'Pompa di calore aria-acqua a propano R290', apri: 'Apri la UHP 120', pagina: 'uhp/',
  alto: 1.08, ordine: 1,
  costruisci() {
    const g = new THREE.Group();
    const Wd = 1.28, Dp = .45, Y0 = .036, YB = .081, YT = 1.076, XL = -.64, XR = .64, ZB = -.225, ZF = .225, XP = .19, HP = YT - .03 - YB, YC = YB + HP / 2;
    const dark = std({ color: 0x2a2d31, roughness: .55, metalness: .25 }), green = std({ color: 0x4d613d, roughness: .58, metalness: .02 });
    const guard = std({ color: 0x15171a, roughness: .5, metalness: .5 }), rubber = std({ color: 0x0c0c0d, roughness: .95 });
    // piedi (interasse 784 mm) e fondo
    for (const x of [-.392, .392]) g.add(mesh(rbox(.09, Y0 + .02, Dp + .04, .008), rubber, x, (Y0 + .02) / 2, 0));
    g.add(mesh(box(Wd, YB - Y0, Dp), dark, 0, (Y0 + YB) / 2, 0));
    // corpo: fianco destro, schiena del vano tecnico, coperchio
    const tSide = cv(256, 512, (c, w, h) => { c.fillStyle = '#2a2d31'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1b1d20'; c.lineWidth = 5; c.beginPath(); c.roundRect(26, 40, w - 52, h - 80, 26); c.stroke();
      c.fillStyle = '#e9ece9'; c.fillRect(70, 120, 46, 40); c.fillStyle = '#111315'; c.fillRect(96, 330, 34, 46); });
    g.add(mesh(box(.012, HP, Dp), [std({ map: tSide, roughness: .55, metalness: .25 }), dark, dark, dark, dark, dark], XR - .006, YC, 0));
    g.add(mesh(box(XR - XP, HP, .01), dark, (XP + XR) / 2, YC, ZB + .005));
    g.add(mesh(rbox(Wd + .006, .03, Dp + .006, .008), dark, 0, YT - .015, 0));
    // batteria alettata dietro e sul fianco sinistro, dietro la griglia di protezione
    const tFin = rep(cv(64, 64, (c, w, h) => { c.fillStyle = '#6d5a2c'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a3018'; for (let x = 0; x < w; x += 8) c.fillRect(x, 0, 3, h); c.fillStyle = '#15171a'; c.fillRect(0, 0, w, 3); c.fillRect(0, 0, 2, h); }), 22, 5);
    const fin = std({ map: tFin, roughness: .6, metalness: .3 });
    g.add(mesh(box(XP - XL, HP, .008), fin, (XL + XP) / 2, YC, ZB + .004));
    const tFin2 = tFin.clone(); tFin2.repeat.set(11, 5); tFin2.needsUpdate = true;
    const finL = mesh(box(.008, HP, Dp - .01), std({ map: tFin2, roughness: .6, metalness: .3 }), XL + .004, YC, 0); g.add(finL);
    // frontale sinistro: cornice verde, vano scuro, ventilatore e lamelle verticali
    const FAN = { x: -.215, y: .565, r: .30 };
    g.add(mesh(box(XP - XL - .02, HP - .02, .01), std({ color: 0x15191a, roughness: .9 }), (XL + XP) / 2, YC, ZF - .12));
    g.add(mesh(new THREE.TorusGeometry(FAN.r + .012, .012, 8, 40), guard, FAN.x, FAN.y, ZF - .07));
    const fan = new THREE.Group(); fan.position.set(FAN.x, FAN.y, ZF - .075);
    const blade = new THREE.Shape(); blade.moveTo(.05, -.02); blade.quadraticCurveTo(.2, -.13, FAN.r - .01, -.02); blade.quadraticCurveTo(.22, .1, .05, .04); blade.closePath();
    const bg = new THREE.ShapeGeometry(blade, 8), bm = std({ color: 0x3f4a33, roughness: .5, metalness: .1, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(bg, bm); b.rotation.z = i * PI * 2 / 3; fan.add(b); }
    const hub = mesh(cyl(.06, .05, 20), guard); hub.rotation.x = PI / 2; fan.add(hub); g.add(fan);
    const N = 46, lam = new THREE.InstancedMesh(box(.008, HP - .03, .014), green, N), m4 = new THREE.Matrix4();
    for (let i = 0; i < N; i++) { m4.makeTranslation(XL + .03 + i * (XP - XL - .05) / (N - 1), YC, ZF - .008); lam.setMatrixAt(i, m4); } g.add(lam);
    g.add(mesh(box(.03, HP, .03), green, XL + .015, YC, ZF - .015));
    for (const y of [YB + .012, YT - .042]) g.add(mesh(box(XP - XL, .024, .03), green, (XL + XP) / 2, y, ZF - .015));
    // frontale destro con il logo in verticale
    g.add(mesh(rbox(XR - XP, HP, .012, .004), green, (XP + XR) / 2, YC, ZF - .006));
    const tLogo = cv(256, 1100, (c, w, h) => { c.clearRect(0, 0, w, h); c.translate(w / 2, h / 2); c.rotate(-PI / 2); drawUnicalLogo(c, -338, -100, 676, '#33383d'); });
    g.add(mesh(new THREE.PlaneGeometry(.17, .73), std({ map: tLogo, transparent: true, roughness: .6, polygonOffset: true, polygonOffsetFactor: -2 }), .5, YC, ZF + .0008));
    // retro: attacchi acqua G 1" e tre passacavi
    const brass = std({ color: 0xb08a3c, roughness: .35, metalness: .8 });
    for (const x of [.559, .465]) { const a = mesh(cyl(.017, .05, 16), brass, x, Y0 + .072, ZB - .02); a.rotation.x = PI / 2; g.add(a); }
    for (const y of [.5, .56, .62]) { const a = mesh(cyl(.014, .022, 12), guard, .6, y, ZB - .008); a.rotation.x = PI / 2; g.add(a); }
    let ang = 0;
    return { group: g, attacchi: { mandata: V(.465, Y0 + .072, ZB - .045), ritorno: V(.559, Y0 + .072, ZB - .045) }, bocca: V(FAN.x, FAN.y, ZF),
      tick(dt, carico = .4) { ang += dt * (1.2 + 9 * carico) * (carico > .02 ? 1 : 0); fan.rotation.z = -ang; } };
  },
});
