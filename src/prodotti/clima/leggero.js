// ───────── Climatizzatori · livello leggero per Home e Casa ─────────
// Misure dai documenti (vedi c_cl.js): YA3 13HI 802 × 297 × 189, YA3 13HE 765 × 555 × 303, XMPS 12HI 794 × 621 × 206, XMX2 18HE 805 × 554 × 330 mm.
const CLM = (() => {
  const bianco = std({ color: 0xe6e8ea, roughness: .4, metalness: .02 }), grig = std({ color: 0xb4b8bb, roughness: .6 }), scuro = std({ color: 0x2a2d31, roughness: .6 }), nero = std({ color: 0x15171a, roughness: .5 });
  const parete = () => { const g = new THREE.Group(); g.add(mesh(rbox(.802, .297, .189, .03), bianco, 0, .1485, .0945)); g.add(mesh(box(.74, .006, .06), grig, 0, .03, .17)); return g; };
  const console = () => { const g = new THREE.Group(); g.add(mesh(rbox(.794, .621, .206, .02), bianco, 0, .3105, .103)); for (let i = 0; i < 12; i++) g.add(mesh(box(.68, .004, .006), grig, 0, .14 + i * .03, .208)); g.add(mesh(box(.6, .006, .08), grig, 0, .62, .1)); return g; };
  const esterna = (W, H, D) => { const g = new THREE.Group(), XP = W / 2 - .25, FX = (-W / 2 + XP) / 2, R = Math.min(.22, (XP + W / 2) / 2 - .03);
    g.add(mesh(rbox(W, H, D, .015), std({ color: 0xd6d8da, roughness: .55 }), 0, H / 2 + .03, 0));
    const gr = mesh(new THREE.CircleGeometry(R, 32), scuro, FX, H / 2 + .03, D / 2 + .002); g.add(gr); for (let i = 1; i < 6; i++) { const t = mesh(new THREE.TorusGeometry(R * i / 6, .002, 4, 40), grig, FX, H / 2 + .03, D / 2 + .004); g.add(t); }
    for (const x of [-W * .3, W * .3]) g.add(mesh(box(.06, .03, .274), nero, x, .015, 0)); return g; };
  return { parete, console, esterna };
})();
registra({
  id: 'clima', nome: 'Climatizzatori', riga: 'Mono a parete YA3 e dual con due console XMPS', apri: 'Apri i climatizzatori', pagina: 'clima/',
  alto: 1.4, largo: 1.95, ordine: 6,
  costruisci() {
    const g = new THREE.Group(), p = CLM.parete(), c = CLM.console(), e = CLM.esterna(.765, .555, .303);
    p.position.set(-.45, .82, -.1); c.position.set(.5, 0, -.1); e.position.set(-.45, 0, .1); e.scale.setScalar(.9); g.add(p, c, e);
    g.add(mesh(box(1.75, 1.22, .04), std({ color: 0xb9b4a9, roughness: .9 }), .02, .61, -.12));     // un pezzo di parete: le unità interne stanno appese al muro, non su un palo
    return { group: g, tick() {} };
  },
});
