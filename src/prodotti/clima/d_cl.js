// ───────── Climatizzatori · modi, flussi, film e strumenti ─────────
// Modi qualitativi: freddo e caldo (pompa di calore), unità accese una per una. Nessun numero a schermo oltre ai dati delle schede.
const TA = 3.5, TR = 33.5, TE = 47.5;
const ST = { ghost: 0, xray: 0, E: 0, shr: 1, read: 0, mono: 0, c1: 0, c2: 0, ref: 0, caldo: 0, demo: 0 };
const CL = { caldo: false, mono: true, c1: true, c2: false };
const COLD_A = [.3, .7, 1.6], WARM_A = [1.6, .6, .2], ROOM = [.8, .8, .8];
const PATH = {};
{
  const cw = p => [UE.x + ue.CXl + p[0] * .62, .042 + p[1] * .62, UE.z + ue.CZl + p[2] * .62], ZC = UE.z - UE.D / 2 + .045;
  const coil = (() => { const a = []; for (let i = 0; i < 5; i++) { const y = .1 + i * (UE.H - .2) / 4, r = i % 2 === 0; a.push([UE.x + (r ? ue.XP - .02 : -UE.W / 2 + .03), y, ZC], [UE.x + (r ? -UE.W / 2 + .03 : ue.XP - .02), y, ZC]); } return a; })();
  const uiC = (() => { const a = [], L = UI.W - .12; for (let i = 0; i < 3; i++) { const y = YUI + UI.H * (.25 + i * .22), r = i % 2 === 0; a.push([UI.x + (r ? -L / 2 : L / 2), y, ZB + .07], [UI.x + (r ? L / 2 : -L / 2), y, ZB + .07]); } return a; })();
  const compW = PIPE.compC.map(cw), top = compW[compW.length - 1], acc = compW[0];
  const dis = [top, [top[0], top[1] + .08, top[2]], [UE.x + ue.CXl, UE.H * .62, UE.z + .02], [UE.x + ue.XP - .02, UE.H * .7, ZC + .02], coil[0]];
  const toLiq = [coil[coil.length - 1], [UE.x + ue.CXl + .06, UE.H * .3, UE.z + .07], LM.liq[0]];
  const back = [LM.gas[0], [UE.x + ue.CXl - .02, .4, UE.z], acc];
  const fR = new Flow(machine, 420, .02), fC = new Flow(cmp, 60, .012);
  const ciclo = c => c ? [seg(compW, PALE, HOT), seg(dis.slice().reverse().concat([]).reverse(), HOT, HOT), seg(LM.gas, HOT, HOT), seg(uiC, HOT, WARM, 1), seg(LM.liq, WARM, WARM, 1), seg(toLiq, WARM, COLD, 1), seg(coil, COLD, COOL, 1), seg(back, PALE, PALE)]
    : [seg(compW, PALE, HOT), seg(dis, HOT, HOT), seg(coil, HOT, WARM), seg(toLiq, WARM, WARM), seg(LM.liq, WARM, COLD), seg(uiC, COLD, COOL), seg(LM.gas, PALE, PALE, 1), seg(back, PALE, PALE)];
  PATH.rF = fR.path(ciclo(false), 600); PATH.rH = fR.path(ciclo(true), 600); PATH.ride = giroDi(fR.path(ciclo(false), 900)); PATH.cmp = fC.path([seg(PIPE.compC, COLD, HOT)]);
  // aria: unità a parete, unità esterne, console
  const aUI = x => [[x, YUI + UI.H + .35, ZB + .12], [x, YUI + UI.H - .01, ZB + .1], [x, YUI + UI.H * .6, ZB + .08], [x, YUI + UI.H * .35, ZB + .085], [x, YUI + UI.H * .06, ZB + UI.D * .85], [x, YUI - .3, ZB + .55], [x, YUI - .7, ZB + 1.0]];
  const aUE = (U, o, dy) => [[U.x + o.FXc, o.Fy + dy, U.z - U.D / 2 - .35], [U.x + o.FXc, o.Fy + dy, U.z - U.D / 2 + .04], [U.x + o.FXc, o.Fy + dy * .3, U.z], [U.x + o.FXc, o.Fy + dy * .6, U.z + U.D / 2 + .1], [U.x + o.FXc + dy, o.Fy + dy, U.z + U.D / 2 + .7]];
  const aCO = (x, su) => [[x, CH * .55, ZB + 1.0], [x, CH * .55, ZB + CD + .05], [x, CH * .3, ZB + .1], su ? [x, CH * .8, ZB + .1] : [x, .08, ZB + .12], su ? [x, CH + .05, ZB + .12] : [x, .03, ZB + CD + .05], su ? [x, CH + .5, ZB + .5] : [x, .03, ZB + .9]];
  const fl = (n) => new Flow(machine, n, .022, .01);
  PATH.fUI = [-.25, 0, .25].map(dx => ({ f: fl(60), pf: null, pts: aUI(UI.x + dx) })); PATH.fUE = [-.12, 0, .12].map(dy => ({ f: fl(50), pts: aUE(UE, ue, dy) })); PATH.fUX = [-.12, 0, .12].map(dy => ({ f: fl(50), pts: aUE(UX, ux, dy) }));
  PATH.fC1 = [[-.2, 1], [.2, 0]].map(([dx, su]) => ({ f: fl(50), pts: aCO(CO[0].x + dx, su) })); PATH.fC2 = [[-.2, 1], [.2, 0]].map(([dx, su]) => ({ f: fl(50), pts: aCO(CO[1].x + dx, su) }));
  for (const k of ['fUI', 'fUE', 'fUX', 'fC1', 'fC2']) for (const a of PATH[k]) { a.pC = a.f.path([seg(a.pts.slice(0, 4), ROOM, ROOM), seg(a.pts.slice(3), k === 'fUE' || k === 'fUX' ? WARM_A : COLD_A, k === 'fUE' || k === 'fUX' ? WARM_A : COLD_A)]); a.pH = a.f.path([seg(a.pts.slice(0, 4), ROOM, ROOM), seg(a.pts.slice(3), k === 'fUE' || k === 'fUX' ? COLD_A : WARM_A, k === 'fUE' || k === 'fUX' ? COLD_A : WARM_A)]); }
  const fD = [0, 1].map(() => new Flow(machine, 120, .018)); PATH.fD = fD; PATH.d = [0, 1].map(k => fD[k].path([seg('d' + k, WARM, COLD)]));
  Object.assign(PATH, { fR, fC });
}
let rA = 0, crA = 0, lastD = '';
const CFG = {
  id: 'clima', nome: 'Climatizzatori', modello: '', sub: 'Unical · mono YA3 13H · dual XMX2 18HE con due XMPS 12HI',
  start: { k: 'Climatizzatori Unical: mono e dual', p: 'Un climatizzatore a parete con la sua unità esterna, e un dual che con una sola unità esterna serve due stanze. Poi provali tu: smontali, guardaci dentro, segui il gas.', dur: '50 secondi' },
  T_ASM: TA, T_RUN: TR, T_END: TE, MC: V(.25, 1.2, -.05), BW: 6.0, BH: 3.0, S: ST,
  ganci: [[.1, 1.5, 'Mono', 'var(--ice)', 'un\'unità esterna, una stanza'], [1.55, TA - .2, 'Dual', 'var(--heat)', 'un\'unità esterna, due stanze']],
  letture: [['Modo', s => s.caldo > .5 ? 'Caldo' : 'Freddo', null, 'gen'], ['Accesi', s => [s.mono > .5 ? 'YA3' : null, s.c1 > .5 ? 'console 1' : null, s.c2 > .5 ? 'console 2' : null].filter(Boolean).join(' + ') || 'Nessuno', null, 'gen']],
  caps: [[0, 'Estate', 'Il climatizzatore a parete prende il calore della stanza e l\'unità esterna lo butta fuori.'],
    [4.5, 'Due stanze', 'Si accendono le due console: una sola unità esterna, il dual, divide la potenza tra le due stanze.'],
    [8.5, 'Inverno', 'Il giro del gas si inverte: fuori si prende il calore dell\'aria, dentro esce aria calda.'],
    [12, 'Unical: YA3 e MULTI', 'YA3 13H a parete · XMX2 18HE con due XMPS 12HI · R32 · caldo e freddo in pompa di calore.']],
  camRun(H, TUTTO) { H(TR + .9, TUTTO, 8, 10); H(TR + 4.5, { off: [.6, 1.0, -.1], w: 4.2, h: 2.4 }, 14, 10); H(TR + 8.5, TUTTO, -10, 10, .95); H(TR + 12, TUTTO, 6, 10); },
  film(t, fase) {
    if (fase === 0) Object.assign(ST, { mono: 1, c1: 1, c2: 1, ref: 0, caldo: 0, demo: 0, xray: 0, E: t < 2.35 ? 0 : 1.25 * eoc(clamp((t - 2.35) / 1.05)), shr: 1 - sm(TA - .32, TA - .03, t), read: 0 });
    else if (fase === 1) { const a = 10.0; Object.assign(ST, { mono: 0, c1: 0, c2: 0, ref: 0, caldo: 0, demo: sm(a + 2.7, a + 3.1, t) * (1 - sm(a + 4.3, a + 4.8, t)), xray: 0, E: 0, shr: 1, read: 0 }); ST.comp = 2.2 * sm(a + 2.2, a + 2.9, t) * (1 - sm(a + 4.6, a + 5.2, t)); }
    else { const r = t - TR, x = sm(.3, 1.5, r) * (1 - sm(11.4, 12.6, r)); Object.assign(ST, { mono: sm(.2, 1, r), c1: sm(4.5, 5.3, r), c2: sm(4.7, 5.5, r), caldo: r > 8.5 ? 1 : 0, ref: sm(1.4, 2.4, r) * x, demo: 0, xray: x, E: 0, shr: 1, read: r > 1 ? 1 : 0 }); }
    if (fase !== 1) ST.comp = ST.mono * 3;
  },
  look(now, dt) {
    rA += dt * PI * 2; crA += dt * (ST.comp || 0) * PI * 2; if (crank) crank.rotation.y = crA;
    const sp = (k, v, ax) => { const g = ROT[k]; if (g) g.rotation[ax] -= dt * v * PI * 2; };
    sp('rot' + UI.x, 3 * ST.mono, 'x'); sp('fan' + UE.x, 5 * ST.mono, 'z'); sp('fan' + UX.x, 5 * Math.max(ST.c1, ST.c2), 'z'); sp('con' + CO[0].x, 3 * ST.c1, 'x'); sp('con' + CO[1].x, 3 * ST.c2, 'x');
    M.alet.emissive.setHex(ST.caldo > .5 ? 0xff6a2a : 0x2a8cff); M.alet.emissiveIntensity = .3 * Math.max(ST.mono, ST.c1, ST.c2);
    PATH.fR.upd(now, ST.ref, .03, ST.caldo > .5 ? PATH.rH : PATH.rF); PATH.fC.upd(now, ST.demo * .55, .55, PATH.cmp);
    const air = (arr, amt) => arr.forEach(a => a.f.upd(now, amt * .6, .12, ST.caldo > .5 ? a.pH : a.pC));
    air(PATH.fUI, ST.mono); air(PATH.fUE, ST.mono); air(PATH.fUX, Math.max(ST.c1, ST.c2)); air(PATH.fC1, ST.c1); air(PATH.fC2, ST.c2);
    PATH.fD[0].upd(now, ST.c1 * ST.xray, .05, PATH.d[0]); PATH.fD[1].upd(now, ST.c2 * ST.xray, .05, PATH.d[1]);
    const d = ST.caldo > .5 ? '22°' : '25°'; if (d !== lastD) { lastD = d; display(d); }
    ombraC.material.opacity = .8 * (1 - clamp(ST.E * 1.5)) * ST.shr;
  },
  libero() { Object.assign(CL, { caldo: false, mono: true, c1: true, c2: false }); },
  short: { ui: 'YA3 interna', ue: 'YA3 esterna', linea: 'Linee', xmps: 'Console', xmx: 'Dual esterna', linee2: 'Linee dual' },
  gusci: ['ui', 'ue', 'xmps', 'xmx'], aperti: ['linea', 'linee2'],
  tick(dt, { U, ease, inside, calm }) {
    ease('mono', (CL.mono || U.ride ? 1 : 0) * calm, 2.5); ease('c1', (CL.c1 ? 1 : 0) * calm, 2.5); ease('c2', (CL.c2 ? 1 : 0) * calm, 2.5); ST.caldo = CL.caldo ? 1 : 0;
    ease('ref', (CL.mono || U.ride) && inside ? calm : 0, 3); ST.comp = ST.mono * 3;
  },
  ronzio: s => [Math.max(s.mono, s.c1, s.c2) * 3, s.mono * 2],
  stato: () => ({ caldo: CL.caldo, mono: +ST.mono.toFixed(2), c1: +ST.c1.toFixed(2), c2: +ST.c2.toFixed(2), ref: +ST.ref.toFixed(2) }),
};
function uiCl() { press($('kF'), !CL.caldo); press($('kC'), CL.caldo); press($('kM'), CL.mono); press($('k1'), CL.c1); press($('k2'), CL.c2);
  $('pCl').textContent = (CL.caldo ? 'Caldo: il gas gira al contrario, fuori si prende il calore dell\'aria. ' : 'Freddo: dentro si toglie il calore, fuori lo si butta via. ') + (CL.c1 && CL.c2 ? 'Le due console lavorano insieme: il dual divide la potenza.' : CL.c1 || CL.c2 ? 'Il dual serve una stanza sola.' : 'Il dual è spento.'); }
CFG.strumenti = ['touch', 'expl',
  { k: 'xray', nota: 'Azzurro: gas freddo e aria fresca. Rosso: gas caldo e aria calda. Dentro il cerchio il gas corre nei tubi.' },
  { k: 'ride', titolo: 'Segui il gas del mono', path: () => PATH.ride, vel: .9, dist: [.8, 1.2], inizio: 'Si parte dal compressore, fuori casa',
    frasi: [[0, 'Nel compressore il gas viene schiacciato e si scalda'], [1, 'Caldo, va nella batteria dell\'unità esterna'], [2, 'Il ventilatore gli porta via il calore: diventa liquido'], [3, 'Passa dalla valvola di espansione ed entra nella linea'], [4, 'Attraversa il muro e sale fino all\'unità interna'],
      [5, 'Nella batteria dell\'unità interna prende il calore della stanza'], [6, 'Torna fuori come gas, nella linea grossa'], [7, 'Rientra nel compressore e il giro ricomincia']],
    fine: 'Giro finito: è sempre lo stesso gas, che porta il calore da dentro a fuori.' },
  { k: 'comandi', nome: 'Comandi', icona: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M10 7h4M10 11h4M12 15v2"/>',
    html: '<div class="keys" style="grid-template-columns:repeat(2,1fr)"><button class="key" id="kF" type="button">Freddo</button><button class="key" id="kC" type="button">Caldo</button></div><div class="keys" style="grid-template-columns:repeat(3,1fr)"><button class="key" id="kM" type="button">YA3</button><button class="key" id="k1" type="button">Console 1</button><button class="key" id="k2" type="button">Console 2</button></div><p class="note" id="pCl"></p>',
    init() { $('kF').onclick = () => { CL.caldo = false; uiCl(); }; $('kC').onclick = () => { CL.caldo = true; uiCl(); }; $('kM').onclick = () => { CL.mono = !CL.mono; uiCl(); }; $('k1').onclick = () => { CL.c1 = !CL.c1; uiCl(); }; $('k2').onclick = () => { CL.c2 = !CL.c2; uiCl(); }; },
    entra() { uiCl(); } },
];
