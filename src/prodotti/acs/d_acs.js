// ───────── HP 300PSDX · flussi, logica dell'acqua, film e strumenti ─────────
// Numeri a schermo, tutti dal manuale 00340944: set di fabbrica 55 °C (p.32); 65 °C massimo con la sola pompa di calore e 70 °C con la resistenza (p.37);
// contatto fotovoltaico che porta il set a 65 °C (p.32); antilegionella a 65 °C (p.30). La velocità di scarico e ricarica del serbatoio è qualitativa.
const TA = 3.5, TR = 35, TE = 49;
const ST = { ghost: 0, xray: 0, E: 0, shr: 1, read: 0, comp: 0, fan: 0, ref: 0, air: 0, demo: 0, water: 0, dw: 0, heat: 0, caldo: 1, set: 55, who: 0 };
const A = { caldo: 1, doccia: false, fv: false, anti: false, res: false, comp: false, set: 55 };
let setPrima = 55;
function passoAcqua(dt) {
  A.set = A.res ? 70 : (A.fv || A.anti) ? 65 : 55;
  if (A.set > setPrima) A.caldo = Math.min(A.caldo, .7); setPrima = A.set;                 // set più alto: il serbatoio non è più "pieno"
  if (A.doccia) A.caldo = Math.max(0, A.caldo - dt * .075);
  A.comp = A.doccia ? A.caldo < .6 : A.caldo < 1; if (A.comp) A.caldo = Math.min(1, A.caldo + dt * (A.res ? .06 : .03));
  if (A.doccia && A.caldo <= 0) A.doccia = false;
}
// flussi
const PATH = {};
{
  const fRef = new Flow(machine, 360, .018), fCmp = new Flow(cmp, 60, .012), fAir = new Flow(machine, 220, .03, .01), fC = new Flow(machine, 90, .026), fH = new Flow(machine, 90, .026);
  const compW = PIPE.comp.map(qcw), cw = [[.43, AT(.0325), -.6], [.43, AT(.0325), -.04], [.4, AT(.0325), 0], [R - .01, AT(.0325), 0], [.19, AT(.0325), 0], [.155, B + .05, 0], [.15, B + .14, 0]];
  const hw = [[.04, AT(1.42), 0], [.08, AT(1.33), 0], [.16, AT(1.27), 0], [R + .045, AT(1.27), 0], [.4, AT(1.27), 0], [.43, AT(1.27), -.04], [.43, AT(1.27), -.6]];
  const giro = [seg(compW, PALE, HOT), seg('dis', HOT, HOT), seg('cond', HOT, WARM), seg('liq', WARM, WARM), seg('exp', WARM, COLD), seg('evap', COLD, COOL), seg('suc', PALE, PALE)];
  PATH.ref = fRef.path(giro); PATH.ride = giroDi(fRef.path(giro, 900)); PATH.cmp = fCmp.path([seg(PIPE.comp, COLD, HOT)]);
  PATH.aria = fAir.path([seg(FP.aria.slice(0, 5), [1.0, .8, .55], [.9, .78, .6]), seg(FP.aria.slice(4), [.3, .7, 1.5], [.45, .75, 1.3])]);
  PATH.cw = fC.path([seg(cw, W0, W0)]); PATH.hw = fH.path([seg(hw, W1, W1)]);
  Object.assign(PATH, { fRef, fCmp, fAir, fC, fH });
}
let fanA = 0, crankA = 0, lastAcq = '', lastScr = '';
const CFG = {
  id: 'acs', nome: 'HP', modello: '300PSDX', sub: 'Unical · scaldacqua a pompa di calore · 300 l · R290',
  start: { k: 'Scaldacqua a pompa di calore Unical HP 300PSDX', p: 'Prende il calore dall\'aria della stanza e lo mette nell\'acqua. Poi provalo tu: smontalo, guardaci dentro, segui il gas, apri la doccia.', dur: '45 secondi' },
  T_ASM: TA, T_RUN: TR, T_END: TE, MC: V(.06, 1.02, 0), BW: 1.25, BH: 2.3, S: ST,
  ganci: [[.1, 1.5, '55 °C', 'var(--heat)', 'acqua calda presa dall\'aria della stanza'], [1.55, TA - .2, 'R290', 'var(--ice)', 'il propano: un refrigerante naturale']],
  letture: [['Temperatura impostata', s => s.set + ' °C', 'var(--heat)'], ['Al lavoro', s => ['In attesa', 'Pompa di calore', 'Pompa di calore + resistenza'][s.who], null, 'gen']],
  caps: [[0, 'In funzione', 'Il compressore scalda il propano, che cede il calore all\'acqua attraverso il condensatore avvolto. L\'acqua calda si raccoglie in alto.'],
    [4.5, 'Una doccia', 'L\'acqua calda esce dall\'alto, quella fredda entra dal fondo. Quando la riserva cala, la pompa di calore riparte.'],
    [8.6, 'Il sole sul tetto', 'Con il contatto fotovoltaico la temperatura sale a 65 °C: l\'energia del sole si mette da parte come acqua calda.'],
    [12, 'Unical HP 300PSDX', '300 litri in inox Duplex · propano R290 · fino a 65 °C con la sola pompa di calore, 70 °C con la resistenza.']],
  camRun(H, TUTTO) { H(TR + .9, TUTTO, 10, 9); H(TR + 4.6, { off: [.06, .8, 0], w: 1.0, h: 1.7 }, -24, 6); H(TR + 8.5, { off: [.0, 1.65, 0], w: .95, h: .85 }, 28, 20); H(TR + 12, TUTTO, 6, 9); },
  film(t, fase) {
    if (fase === 0) Object.assign(ST, { xray: 0, comp: 1.5, fan: 4, air: 1, ref: 0, demo: 0, water: 0, dw: 0, heat: 0, E: t < 2.35 ? 0 : 1.25 * eoc(clamp((t - 2.35) / 1.05)), shr: 1 - sm(TA - .32, TA - .03, t), read: 0, who: 1, set: 55, caldo: 1 });
    else if (fase === 1) { const a = 21.0; Object.assign(ST, { xray: .85 * sm(10.9, 11.4, t) * (1 - sm(12.25, 12.6, t)), comp: 2.2 * sm(a + 1.9, a + 2.7, t) * (1 - sm(a + 4.0, a + 4.7, t)), fan: 0, air: 0, ref: 0, demo: sm(a + 2.7, a + 3.1, t) * (1 - sm(a + 3.7, a + 4.0, t)), water: 0, dw: 0, heat: 0, E: 0, shr: 1, read: 0, who: 1, set: 55, caldo: 1 }); }
    else { const r = t - TR, x = sm(.3, 1.5, r) * (1 - sm(11.4, 12.6, r));
      Object.assign(ST, { xray: x, comp: 3 * sm(.6, 2, r), fan: 5 * sm(.3, 1.8, r), air: sm(.8, 2, r), ref: sm(1.4, 2.4, r) * x, demo: 0, water: sm(.2, 1, r), dw: sm(4.6, 5, r) * (1 - sm(7.8, 8.2, r)), heat: 0, E: 0, shr: 1, read: r > 1 ? 1 : 0,
        caldo: 1 - .45 * sm(4.8, 7.8, r) + .45 * sm(8.4, 11.5, r), set: r > 8.6 ? 65 : 55, who: 1 }); }
  },
  look(now, dt) {
    fanA += dt * ST.fan * PI * 2; fanRot.rotation.x = fanA; crankA += dt * ST.comp * PI * 2; crank.rotation.y = crankA;
    acqua.visible = ST.water > .01; acquaM.opacity = .62 * ST.water;
    const ka = ST.caldo.toFixed(3) + '|' + ST.set; if (ka !== lastAcq) { lastAcq = ka; disegnaAcqua(ST.caldo, ST.set); }
    const ks = ST.set + '|' + (ST.comp > 1 ? 1 : 0); if (ks !== lastScr) { lastScr = ks; schermo(ST.set, ST.comp > 1); }
    const on = clamp(ST.comp / 3); M.condA.emissiveIntensity = on * (.3 + .1 * Math.sin(now * 4)); M.evap.emissiveIntensity = on * .35; M.res.emissiveIntensity = ST.heat * 1.6;
    PATH.fRef.upd(now, ST.ref, .05 + ST.comp * .006, PATH.ref); PATH.fCmp.upd(now, ST.demo * .55, .55, PATH.cmp); PATH.fAir.upd(now, ST.air, .09 + ST.fan * .01, PATH.aria);
    PATH.fC.upd(now, ST.dw, .14, PATH.cw); PATH.fH.upd(now, ST.dw, .14, PATH.hw);
    ombra.material.opacity = .85 * (1 - clamp(ST.E * 1.5)) * ST.shr;
  },
  libero() { Object.assign(A, { caldo: .85, doccia: false, fv: false, anti: false, res: false, comp: true }); setPrima = 55; Object.assign(ST, { comp: 3, fan: 5, ref: 0, air: 1, demo: 0, water: 1, dw: 0, heat: 0, caldo: .85, set: 55, who: 1 }); },
  short: { tank: 'Serbatoio', coil: 'Serpentino', cond: 'Condensatore', iso: 'Rivestimento', comp: 'Compressore', frig: 'Evaporatore', cop: 'Coperchio' },
  gusci: ['iso', 'cop'], aperti: [], trasparente: U => U.tool === 'doccia' || U.tool === 'modi',
  tick(dt, { U, ease, inside, calm }) {
    passoAcqua(dt); const run = A.comp || U.ride;
    ease('comp', run ? 3 * calm : 0); ease('fan', A.comp ? 5 * calm : 0); ease('ref', run && inside ? calm : 0, 3); ease('air', A.comp && !U.ride ? calm : 0); ease('water', 1); ease('dw', A.doccia ? calm : 0, 3); ease('heat', A.res && A.comp ? 1 : 0);
    ST.caldo = A.caldo; ST.set = A.set; ST.who = A.comp ? (A.res ? 2 : 1) : 0;
    if (U.tool === 'doccia') uiDoccia();
  },
  entra() { },
  ronzio: s => [s.fan, s.comp],
  stato: () => ({ caldo: +A.caldo.toFixed(3), doccia: A.doccia, set: A.set, comp: A.comp, who: ST.who, fan: +ST.fan.toFixed(2), water: +ST.water.toFixed(2) }),
};
function uiDoccia() { $('kDoccia').textContent = A.doccia ? 'Chiudi la doccia' : 'Apri la doccia'; press($('kDoccia'), A.doccia); $('bCaldo').style.width = (A.caldo * 100).toFixed(1) + '%';
  $('pDoccia').textContent = A.doccia ? (A.comp ? 'La riserva è scesa: la pompa di calore riparte e la ricarica mentre fai la doccia.' : 'Esce l\'acqua calda dall\'alto, entra quella fredda dal fondo.')
    : A.comp ? 'Doccia chiusa: la pompa di calore ricarica il serbatoio.' : 'Serbatoio carico: la pompa di calore aspetta.'; }
function uiModi() { press($('kFv'), A.fv); press($('kAnti'), A.anti); press($('kRes'), A.res);
  $('pModi').textContent = A.res ? 'Resistenza accesa: l\'acqua arriva fino a 70 °C. Serve quando fuori dalla lavanderia fa molto freddo o c\'è fretta.'
    : A.fv ? 'Contatto fotovoltaico: quando i pannelli producono, la temperatura sale a 65 °C e il sole si mette da parte come acqua calda.'
    : A.anti ? 'Antilegionella: una volta a settimana l\'acqua sale a 65 °C per circa mezz\'ora.' : 'Di fabbrica l\'acqua è a 55 °C. Prova un modo.'; }
CFG.strumenti = ['touch', 'expl',
  { k: 'xray', nota: 'Arancio: acqua calda, blu: acqua fredda. Dentro il cerchio il propano corre nei tubi, rosso quando è caldo e azzurro quando è freddo.' },
  { k: 'ride', titolo: 'Segui il propano nel suo giro', path: () => PATH.ride, vel: .7, dist: [.7, 1.1], inizio: 'Si parte dal compressore',
    frasi: [[0, 'Nel compressore il propano viene schiacciato e si scalda'], [1, 'Caldo, scende verso il serbatoio'], [2, 'Gira intorno al serbatoio e cede il calore all\'acqua attraverso l\'acciaio'], [3, 'Ormai liquido, risale verso la valvola di espansione'],
      [4, 'La valvola lo fa espandere: diventa freddissimo'], [5, 'Nell\'evaporatore prende il calore dall\'aria della stanza'], [6, 'Torna al compressore come gas, e il giro ricomincia']],
    fine: 'Giro finito: è sempre lo stesso gas, che porta il calore dall\'aria all\'acqua.' },
  { k: 'doccia', nome: 'Doccia', icona: '<path d="M4 20V9a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5M11 9h8M12 13v1.5M15 13v2.5M18 13v1.5M13.500 18v1.500M16.500 18v1.500"/>',
    html: '<div class="how"><i class="gest tap"></i><span>Apri la doccia e guarda il serbatoio.</span></div><div class="row"><button class="btn" id="kDoccia" type="button" aria-pressed="false">Apri la doccia</button><div class="prog" style="flex:1" aria-label="Acqua calda nel serbatoio"><i id="bCaldo"></i></div></div><p class="note" id="pDoccia"></p>',
    init() { $('kDoccia').onclick = () => { A.doccia = !A.doccia; uiDoccia(); }; }, entra() { uiDoccia(); } },
  { k: 'modi', nome: 'Modi', icona: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M18.700 5.300l-1.800 1.800M7.100 16.900l-1.800 1.800"/>',
    html: '<div class="keys" style="grid-template-columns:repeat(3,1fr)"><button class="key" id="kFv" type="button" aria-pressed="false">Sole sul tetto</button><button class="key" id="kAnti" type="button" aria-pressed="false">Antilegionella</button><button class="key" id="kRes" type="button" aria-pressed="false">Resistenza</button></div><p class="note" id="pModi"></p>',
    init() { $('kFv').onclick = () => { A.fv = !A.fv; uiModi(); }; $('kAnti').onclick = () => { A.anti = !A.anti; uiModi(); }; $('kRes').onclick = () => { A.res = !A.res; uiModi(); }; }, entra() { uiModi(); } },
];
