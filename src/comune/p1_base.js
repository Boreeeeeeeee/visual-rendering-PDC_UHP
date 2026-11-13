// ───────── Pagine prodotto · base comune (dopo uhp/a_core.js e uhp/b_engine.js, prima dei pezzi del prodotto) ─────────
// Tutto quello che la pagina dell'ibrido si era scritta da sé e che serve uguale agli altri prodotti: aiuti per i pezzi, bianchi che non sfondano,
// particelle, flussi lungo i tubi, scintille. Il film e gli strumenti stanno in p2_show.js e p3_ui.js, dopo i pezzi.
const PIPE = {};
const qBasis = (x, y) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, V().crossVectors(x, y)));
const node = (x, y, z, s = 1) => { const n = new THREE.Group(); n.position.set(x, y, z); n.scale.setScalar(s); CUR.node.add(n); return n; };
const sposta = (pts, dx, dy, dz) => pts.map(p => [p[0] + dx, p[1] + dy, p[2] + dz]);
// Rilievi (bumpMap) su facce viste di taglio: lo shader normalizza un vettore nullo e il bagliore allarga il pixel non valido a mezza schermata. Corretto una volta per tutti.
THREE.ShaderChunk.bumpmap_pars_fragment = THREE.ShaderChunk.bumpmap_pars_fragment.replace('return normalize( abs( fDet ) * surf_norm - vGrad );', 'vec3 nb = abs( fDet ) * surf_norm - vGrad; return dot( nb, nb ) > 1e-14 ? normalize( nb ) : surf_norm;');
const BIANCO = '#c9cccf', C_BIANCO = 0xc9cccf;     // bianco tenuto basso: con le luci della scena arriva al bianco senza sfondare nel bagliore
Object.assign(M, {
  sWhite: xr(std({ color: C_BIANCO, roughness: .8, metalness: 0, bumpMap: T.noise, bumpScale: .25 })),
  sWhite2: xr(std({ color: C_BIANCO, roughness: .84, metalness: 0, side: THREE.DoubleSide })),
  sGrid: xr(std({ color: 0xb4b8bb, roughness: .75, metalness: .05 })),
  sClear: xr(std({ color: 0x8f9aa2, roughness: .35, metalness: 0, transparent: true, opacity: .3 })),
  sFoam: xr(std({ color: 0x17181a, roughness: 1, metalness: 0, bumpMap: T.noise, bumpScale: 2.2 })),
  sGrey: xr(std({ color: 0x565b60, roughness: .7, metalness: .1 })),
  fin: std({ color: 0x8f969b, roughness: .45, metalness: .8 }),
  zinc: std({ color: 0xa3a9ad, roughness: .4, metalness: .85, map: T.spangle }),
  white: std({ color: C_BIANCO, roughness: .84, metalness: 0 }),
  grey: std({ color: 0x8f969b, roughness: .55, metalness: .1 }),
  wRed: std({ color: 0xc8322a, roughness: .5 }), wBlue: std({ color: 0x2b62b8, roughness: .5 }), wYel: std({ color: 0xd9b23a, roughness: .45, metalness: .3 }), wOr: std({ color: 0xe07a1f, roughness: .5 }),
});
// l'intensità dell'ambiente si regola per materiale solo se il materiale ha la sua mappa: gliela do io, più bassa
const AMB_B = .3, AMB_M = .42;
const ambiente = (keys, k) => { for (const n of keys) { const m = M[n]; if (!m) continue; m.envMap = scene.environment; m.envMapIntensity = k; } };
const ambienteBase = () => { ambiente(['sWhite', 'sWhite2', 'sGrid', 'sClear', 'white', 'grey', 'term', 'sGrey'], AMB_B); ambiente(['galv', 'steel', 'inox', 'alu', 'fin', 'zinc', 'lam'], AMB_M); ambiente(['copper', 'brass'], .6); };

// particelle
const PTS = [];
function points(n, size, add = true) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size, map: T.glow, vertexColors: true, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending }));
  p.frustumCulled = false; p.userData.size = size; PTS.push(p); return p;
}
function ptSizes() { const k = 1 / Math.tan(rad(camera.fov / 2)); for (const p of PTS) p.material.size = p.userData.size * k; }
// i flussi corrono dentro i tubi: li disegno un po' più vicini alla camera, così non restano nascosti dalla parete del tubo
function pushed(p, d = .022) { p.material.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <project_vertex>', `vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\n\tmvPosition.xyz -= normalize( mvPosition.xyz ) * ${d.toFixed(3)};\n\tgl_Position = projectionMatrix * mvPosition;`); }; return p; }
const R0 = rng(99);
// flussi lungo i tubi: campioni di posizione e colore per ogni tratto
class Flow {
  constructor(parent, n, size, push) { this.pts = pushed(points(n, size), push); this.n = n; parent.add(this.pts); this.ph = new Float32Array(n); this.jit = new Float32Array(n * 3); this.pts.visible = false; for (let i = 0; i < n; i++) { this.ph[i] = (i + R0() * .6) / n; for (let k = 0; k < 3; k++) this.jit[i * 3 + k] = (R0() - .5) * .008; } }
  path(segs, S = 420) {
    const cs = segs.map(s => { const c = curveOf(s.rev ? s.pts.slice().reverse() : s.pts); return { c, L: c.getLength(), s }; }), tot = cs.reduce((a, b) => a + b.L, 0);
    const P = new Float32Array(S * 3), C = new Float32Array(S * 3); let k = 0; const marks = [];
    for (const o of cs) { const m = Math.max(2, Math.round(S * o.L / tot)); marks.push(k / S); for (let i = 0; i < m && k < S; i++, k++) { const f = i / (m - 1), v = o.c.getPointAt(f); P[k * 3] = v.x; P[k * 3 + 1] = v.y; P[k * 3 + 2] = v.z; for (let j = 0; j < 3; j++) C[k * 3 + j] = lerp(o.s.c0[j], o.s.c1[j], f); } }
    for (; k < S; k++) for (let j = 0; j < 3; j++) { P[k * 3 + j] = P[(k - 1) * 3 + j]; C[k * 3 + j] = C[(k - 1) * 3 + j]; }
    return { P, C, S, marks, tot };
  }
  upd(now, amt, spd, pa) {
    this.pts.visible = amt > .01; if (!this.pts.visible) return; const p = this.pts.geometry.attributes.position, c = this.pts.geometry.attributes.color, S = pa.S;
    for (let i = 0; i < this.n; i++) { const u = (((this.ph[i] + now * spd) % 1) + 1) % 1, f = u * (S - 1), a = f | 0, b = Math.min(S - 1, a + 1), t = f - a;
      p.setXYZ(i, lerp(pa.P[a * 3], pa.P[b * 3], t) + this.jit[i * 3], lerp(pa.P[a * 3 + 1], pa.P[b * 3 + 1], t) + this.jit[i * 3 + 1], lerp(pa.P[a * 3 + 2], pa.P[b * 3 + 2], t) + this.jit[i * 3 + 2]);
      c.setXYZ(i, pa.C[a * 3] * amt, pa.C[a * 3 + 1] * amt, pa.C[a * 3 + 2] * amt); }
    p.needsUpdate = c.needsUpdate = true;
  }
}
const seg = (k, c0, c1, rev) => ({ pts: Array.isArray(k) ? k : PIPE[k], c0, c1, rev: !!rev });
// un percorso su cui far correre la camera (strumento Giro): la curva passa per i campioni del flusso
const giroDi = r => { r.curve = new THREE.CatmullRomCurve3(Array.from({ length: 300 }, (_, i) => { const q = Math.round(i / 299 * (r.S - 1)); return V(r.P[q * 3], r.P[q * 3 + 1], r.P[q * 3 + 2]); }), false, 'centripetal'); return r; };
const HOT = [1.7, .26, .06], WARM = [1.5, .7, .12], COLD = [.1, .5, 1.8], COOL = [.3, .9, 1.6], PALE = [.45, .8, 1.3], W0 = [.12, .45, 1.6], W1 = [1.7, .5, .08];
// scintille all'arrivo dei pezzi e anello a terra quando un gruppo va al suo posto
const NK = 240, spark = points(NK, .011), spV = new Float32Array(NK * 4); scene.add(spark); let spI = 0;
function emitSpark(pos, n) { const p = spark.geometry.attributes.position; for (let k = 0; k < n; k++) { const i = spI = (spI + 1) % NK; p.setXYZ(i, pos.x, pos.y, pos.z); spV[i * 4] = (Math.random() - .5) * 1.1; spV[i * 4 + 1] = Math.random() * 1.0 + .2; spV[i * 4 + 2] = (Math.random() - .5) * 1.1; spV[i * 4 + 3] = 1; } }
function updSparks(dt) { const p = spark.geometry.attributes.position, c = spark.geometry.attributes.color; for (let i = 0; i < NK; i++) { let l = spV[i * 4 + 3]; if (l <= 0) { c.setXYZ(i, 0, 0, 0); continue; } l -= dt * 2.2; spV[i * 4 + 3] = l; spV[i * 4 + 1] -= dt * 3; p.setXYZ(i, p.getX(i) + spV[i * 4] * dt, Math.max(.005, p.getY(i) + spV[i * 4 + 1] * dt), p.getZ(i) + spV[i * 4 + 2] * dt); const k = Math.max(0, l); c.setXYZ(i, 3.2 * k, 1.5 * k * k, .4 * k * k); } p.needsUpdate = c.needsUpdate = true; }
const ring = mesh(new THREE.RingGeometry(.93, 1, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(.7, 1.4, 1.1), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 0, .01, 0, -PI / 2); scene.add(ring); let ringT = 9;
// nel Giro restano accesi solo il fluido e la sua scia: i materiali in SOLO si fanno da parte ([materiale, opacità])
let soloNow = 0; const SOLO = [[M.copper, .2], [M.brass, .25]];
function soloAcqua(x) { if (x === soloNow) return; soloNow = x; for (const [m, o] of SOLO) { m.opacity = lerp(1, o, x); const tr = x > .004; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.depthWrite = x < .5; } }
// terreno e ombra di base; ogni prodotto aggiunge la sua scenografia
const ground = mesh(new THREE.CircleGeometry(11, 64), new THREE.MeshBasicMaterial({ map: T.ground }), 0, 0, 0, -PI / 2); scene.add(ground);
