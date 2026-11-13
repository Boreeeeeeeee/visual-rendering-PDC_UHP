// ───────── Home: i prodotti su un piatto girevole ─────────
const Home = (() => {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0f13); scene.fog = new THREE.Fog(0x0b0f13, 5.2, 10.5);
  scene.environment = ENV; scene.environmentIntensity = .7;
  const camera = new THREE.PerspectiveCamera(30, 1, .05, 60);
  const key = new THREE.SpotLight(0xffffff, 60, 12, rad(26), .7, 1.6); key.position.set(1.6, 4.4, 5.6); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x9fd0ff, .9); rim.position.set(-3, 2.5, -3.5); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1c2026, .32));
  const floor = mesh(new THREE.PlaneGeometry(80, 80), std({ map: T_GRID, roughness: .7, metalness: .2 }), 0, -.062, 0); floor.rotation.x = -PI / 2; scene.add(floor);

  // voci del cerchio: i prodotti fatti, più (solo in anteprima) i segnaposti neutri di quelli in arrivo
  const voci = PRODOTTI.slice().sort((a, b) => (a.ordine || 9) - (b.ordine || 9)).map(p => ({ ...p, fatto: true }));
  if (ANTEPRIMA) {
    // Sagome neutre per provare il movimento. Le misure sono generiche.
    const sag = (nome, riga, alto, forma) => voci.push({ id: null, nome, riga, alto, fatto: false, costruisci: () => ({ group: forma(), tick() {} }) });
    const mat = () => std({ color: 0x39424a, roughness: .9, metalness: 0, transparent: true, opacity: .55 });
    const solido = (geo, y) => { const g = new THREE.Group(), m = mesh(geo, mat(), 0, y, 0); g.add(m, new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: 0x8fa3b0, transparent: true, opacity: .7 }))); g.children[1].position.y = y; return g; };
  }
  const n = voci.length, R = n > 1 ? 2.15 : 0, passo = PI * 2 / n;
  const piatto = new THREE.Group(); scene.add(piatto);
  const disco = mesh(cyl(R + 1.25, .06, 72), std({ color: 0x12181d, roughness: .5, metalness: .6 }), 0, -.03, 0); piatto.add(disco);
  const anello = mesh(new THREE.TorusGeometry(R + 1.25, .012, 8, 96), new THREE.MeshBasicMaterial({ color: 0xa9bd8f }), 0, .002, 0); anello.rotation.x = PI / 2; piatto.add(anello);
  voci.forEach((v, i) => {
    v.ist = v.costruisci(); const a = i * passo, slot = new THREE.Group();
    slot.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); slot.rotation.y = a; slot.add(v.ist.group); piatto.add(slot); v.slot = slot;
    v.ist.group.traverse(o => { o.userData.voce = i; });
  });

  let rot = 0, vel = 0, meta = null, sel = 0, presa = false, t0 = 0, aperto = () => {}, mostra = () => {};
  const idx = () => ((Math.round(-rot / passo) % n) + n) % n;
  function vaiA(i) { let d = -i * passo - rot; d = ((d + PI) % (PI * 2) + PI * 2) % (PI * 2) - PI; meta = Math.abs(d) > 1e-4 ? rot + d : null; }   // già in posizione: niente da fare
  function resize(w, h) {
    camera.aspect = w / h; const stretto = w < h; camera.fov = stretto ? 40 : 30; camera.updateProjectionMatrix();
    basso = h < 460; vf = rad(camera.fov) / 2; hf = Math.atan(Math.tan(vf) * camera.aspect); key.target.position.set(0, .5, R); inquadra(1);
  }
  // la camera si adatta all'altezza del prodotto davanti, che resta nella fascia libera sopra i testi
  let vf = .26, hf = .4, cd = 5, cy = .2, basso = false;
  function inquadra(k) { const A = voci[sel].alto || 1, d = Math.max(A / ((basso ? .62 : .80) * Math.tan(vf)), 1.5 / (1.62 * Math.tan(hf))), y = A / 2 - (basso ? .40 : .22) * d * Math.tan(vf);
    cd = lerp(cd, d, k); cy = lerp(cy, y, k); camera.position.set(0, cy + .2 * cd, R + .98 * cd); camera.lookAt(0, cy, R); }
  function tick(dt, now) {
    inquadra(1 - Math.exp(-dt * 3));
    if (!presa) {
      if (meta !== null) { rot = lerp(rot, meta, 1 - Math.exp(-dt * 7)); if (Math.abs(meta - rot) < .0008) { rot = meta; meta = null; } vel = 0; }
      else if (Math.abs(vel) > .25) { rot += vel * dt; vel *= Math.exp(-dt * 2.6); }
      else { vel = 0; vaiA(idx()); }
    }
    piatto.rotation.y = rot;
    const s = idx(); if (s !== sel) { sel = s; mostra(voci[sel], sel); }
    voci.forEach((v, i) => { const davanti = i === sel && meta === null && !presa;   // quello davanti si fa guardare: oscilla piano
      const want = davanti ? rad(-28) + Math.sin((now - t0) * .5) * rad(16) : rad(-28); v.ist.group.rotation.y = lerp(v.ist.group.rotation.y, want, 1 - Math.exp(-dt * 3)); v.ist.tick(dt, i === sel ? .35 : 0); });
  }
  // gesti: trascina per girare, prosegue per inerzia, si ferma sul più vicino; tocco = apri o porta davanti
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let px = 0, pt = 0, mosso = 0, giu = null;
  function down(e) { presa = true; meta = null; vel = 0; px = e.clientX; pt = performance.now(); mosso = 0; giu = [e.clientX, e.clientY]; }
  function move(e) { if (!presa) return; const dx = e.clientX - px, now = performance.now(), k = 2.4 / Math.max(320, stage.clientWidth);
    rot += dx * k; mosso += Math.abs(dx); const dtm = Math.max(8, now - pt) / 1000; vel = lerp(vel, dx * k / dtm, .5); px = e.clientX; pt = now; }
  function up(e) { if (!presa) return; presa = false; if (performance.now() - pt > 120) vel = 0;
    if (mosso < 8 && giu) { const r = canvas.getBoundingClientRect(); ptr.set((giu[0] - r.left) / r.width * 2 - 1, -(giu[1] - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(voci.map(v => v.ist.group), true)[0]; if (hit) { const i = hit.object.userData.voce; if (i === sel) { if (voci[i].fatto) aperto(voci[i]); } else vaiA(i); } } }
  return { scene, camera, voci, resize, tick, down, move, up,
    entra() { t0 = performance.now() / 1000; mostra(voci[sel], sel); },
    gira(d) { vaiA(((idx() + d) % n + n) % n); }, vaiA, get sel() { return sel; },
    su(f, g) { aperto = f; mostra = g; }, stato: () => ({ rot, vel, sel, meta }) };
})();
