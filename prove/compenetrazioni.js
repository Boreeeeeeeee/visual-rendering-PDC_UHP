// Pezzi che durante il montaggio passano attraverso pezzi già posati. Si esegue nella pagina del prodotto: (testo di questo file)('__id').
// Confronta i riquadri d'ingombro dei pezzi in movimento con quelli dei pezzi fermi, ogni 0,05 s; scarta le coppie che si toccano anche a montaggio
// finito e i pezzi più piccoli di 3 cm. Una coppia conta se si sovrappone per almeno un quarto del più piccolo in almeno tre istanti.
// I tubi che crescono lungo il percorso stanno già al loro posto e non contano come pezzi in movimento.
(api => {
  const A = window[api], P = A.PIECES, G = A.GROUPS, B3 = G[0].box.constructor, M4 = G[0].node.matrixWorld.constructor;
  let root = G[0].node; while (root.parent) root = root.parent;
  // nome leggibile: il nome del pezzo o quello dell'ultimo pezzo con nome nel suo gruppo
  const lab = []; for (const g of G) { let last = g.key; g.pieces.forEach((p, i) => { if (p.n) last = p.n; lab[P.indexOf(p)] = g.key + ': ' + (p.n || last + ' #' + i); }); }
  const m4 = new M4();
  const box = (p, out) => { const geo = (p.im || p.m).geometry; if (!geo.boundingBox) geo.computeBoundingBox(); out.copy(geo.boundingBox);
    if (p.im) { p.im.getMatrixAt(p.inst, m4); m4.premultiply(p.im.matrixWorld); out.applyMatrix4(m4); } else out.applyMatrix4(p.m.matrixWorld); return out; };
  const vol = b => { const s = b.max.clone().sub(b.min); return Math.max(1e-9, s.x) * Math.max(1e-9, s.y) * Math.max(1e-9, s.z); };
  const inter = (a, b) => { const x = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x), y = Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y), z = Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z); return x > 0 && y > 0 && z > 0 ? x * y * z : 0; };
  // a riposo
  A.apply(A.T_RUN, 0, 1, false); root.updateMatrixWorld(true); const rest = P.map(p => box(p, new B3()));
  const big = P.map((p, i) => { const s = rest[i].max.clone().sub(rest[i].min); return Math.max(s.x, s.y, s.z) > .03; });
  const restOv = (i, j) => inter(rest[i], rest[j]) > 0;
  const hits = new Map(), cur = P.map(() => new B3());
  for (let t = 0; t < A.T_RUN; t += .05) {
    A.apply(t, 0, 1, false); root.updateMatrixWorld(true);
    const mov = [], sta = [];
    P.forEach((p, i) => { if (p.st === 0 || !big[i]) return; const moving = (p.st === 1 && !p.cresce) || p.g.q < .999; box(p, cur[i]); (moving ? mov : sta).push(i); });
    for (const i of mov) for (const j of sta) { if (P[i].g === P[j].g && P[i].st === 2) continue; if (restOv(i, j)) continue;
      const v = inter(cur[i], cur[j]); if (!v) continue; const f = v / Math.min(vol(cur[i]), vol(cur[j])); if (f < .25) continue;
      const k = lab[i] + '  ⟶  ' + lab[j], h = hits.get(k); if (!h || f > h.f) hits.set(k, { f, t: +t.toFixed(2), n: (h ? h.n : 0) + 1 }); else h.n++; }
  }
  A.apply(A.T_RUN, 0, 1, false);
  return [...hits.entries()].filter(([, h]) => h.n >= 3).sort((a, b) => b[1].f - a[1].f).map(([k, h]) => `${h.t}s  ${(h.f * 100) | 0}%  x${h.n}  ${k}`);
})
