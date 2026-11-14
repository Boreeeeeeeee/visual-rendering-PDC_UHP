// ───────── F-COIL AGR · modi, flussi, film e strumenti ─────────
// Modi dal manuale 00340791 p.18-21 e dalla scheda: ventilazione, estivo, invernale, automatico, notturno (NIGHT: solo convezione, ventilatore fermo);
// velocità minima, massima o modulata. Nessun numero a schermo: le intensità sono qualitative.
const TA = 3.5, TR = 30.5, TE = 44;
const ST = { ghost: 0, xray: 0, E: 0, shr: 1, read: 0, fan: 0, aria: 0, acqua: 0, gocce: 0, rad: 0, caldo: 1, modo: 1, vel: 2 };
const MODI = ['Ventilazione', 'Caldo', 'Freddo', 'Notte'], VEL = ['Minima', 'Modulata', 'Massima'];
const FC = { modo: 1, vel: 1 };
const PATH = {};
{
  // K2: particelle in scala con la macchina (tubi da 4-7 mm): prima erano grandi come le alette
  const fw = new Flow(machine, 140, .009), fr = new Flow(machine, 90, .008), fg = new Flow(machine, 40, .012, .01), fa = [-.24, -.05, .14, .32].map(() => new Flow(machine, 70, .011, .01));
  const aria = x => [[x, Y0 + .04, .5], [x, Y0 + .06, .25], [x, Y0 + .08, .135], [x, FY - .03, FZ + .03], [x, FY + .03, FZ - .03], [x, Y0 + .26, .07], [x, Y0 + .42, .05], [x, Y0 + HF - .02, .06], [x, Y0 + HF + .2, .1], [x, Y0 + HF + .55, .3]];
  PATH.w = fw.path([seg('wIn', W0, W0), seg('wBat', W0, W1), seg('wOut', W1, W1)]); PATH.wc = fw.path([seg('wIn', [.3, .7, 1.8], [.3, .7, 1.8]), seg('wBat', [.3, .7, 1.8], [.5, .85, 1.5]), seg('wOut', [.5, .85, 1.5], [.5, .85, 1.5])]);
  PATH.rad = fr.path([seg('rad', W1, [1.4, .55, .2])]); PATH.g = fg.path([seg('gocce', [.5, .8, 1.6], [.4, .7, 1.4])]);
  PATH.aH = fa.map((f, i) => f.path([seg(aria([-.24, -.05, .14, .32][i]).slice(0, 5), [.7, .75, .85], [.75, .78, .85]), seg(aria([-.24, -.05, .14, .32][i]).slice(4), [1.6, .6, .2], [1.2, .55, .3])]));
  PATH.aC = fa.map((f, i) => f.path([seg(aria([-.24, -.05, .14, .32][i]).slice(0, 5), [.85, .8, .7], [.8, .8, .75]), seg(aria([-.24, -.05, .14, .32][i]).slice(4), [.3, .7, 1.6], [.4, .75, 1.4])]));
  PATH.aV = fa.map((f, i) => f.path([seg(aria([-.24, -.05, .14, .32][i]), [.8, .82, .85], [.8, .82, .85])]));
  PATH.ride = giroDi(fa[1].path([seg(aria(.02), [.85, .8, .7], [1.6, .6, .2])], 600));
  Object.assign(PATH, { fw, fr, fg, fa });
}
let rotA = 0;
const statoModo = (modo, vel) => ({ fan: modo === 3 ? 0 : [1.2, 2.4, 3.6][vel], aria: modo === 3 ? 0 : [.45, .75, 1][vel], acqua: modo === 0 ? 0 : 1, gocce: modo === 2 ? 1 : 0, rad: modo === 1 ? .35 : modo === 3 ? 1 : 0, caldo: modo === 2 ? 0 : 1 });
const CFG = {
  id: 'fcoil', nome: 'F-COIL', modello: 'AGR 400', sub: 'Unical · ventilconvettore a parete · 897 × 579 × 129 mm',
  start: { k: 'Ventilconvettore Unical F-COIL AGR', p: 'Scalda, raffresca e deumidifica in 12,9 cm di spessore. Poi provalo tu: smontalo, guardaci dentro, segui l\'aria, cambia modo.', dur: '45 secondi' },
  T_ASM: TA, T_RUN: TR, T_END: TE, MC: V(0, .48, .15), BW: 1.25, BH: 1.0, S: ST,
  ganci: [[.1, 1.5, '12,9 cm', 'var(--heat)', 'di spessore, in tutto'], [1.55, TA - .2, 'Caldo e freddo', 'var(--ice)', 'e toglie l\'umidità d\'estate']],
  letture: [['Modo', s => MODI[s.modo], null, 'gen'], ['Ventilatore', s => s.fan < .05 ? 'Fermo' : VEL[s.vel], null, 'gen']],
  caps: [[0, 'Inverno', 'Acqua calda nella batteria: il ventilatore spinge aria tiepida verso l\'alto e la stanza si scalda in fretta.'],
    [4.5, 'Estate', 'Acqua fredda: l\'aria esce fresca e più asciutta. L\'umidità condensa sulla batteria e scende nella bacinella.'],
    [8.5, 'Notte', 'Il ventilatore si ferma: scalda solo il frontale radiante, per convezione e senza rumore.'],
    [12, 'Unical F-COIL AGR', '12,9 cm di spessore · motore DC inverter brushless · pannello radiante · caldo, freddo e deumidificazione.']],
  camRun(H, TUTTO) { H(TR + .9, TUTTO, 18, 12); H(TR + 4.5, { off: [-.1, .4, .2], w: .95, h: .75 }, 34, 16); H(TR + 8.5, TUTTO, -8, 8, .9); H(TR + 12, TUTTO, 14, 10); },
  film(t, fase) {
    if (fase === 0) Object.assign(ST, statoModo(1, 1), { modo: 1, vel: 1, xray: 0, E: t < 2.35 ? 0 : 1.25 * eoc(clamp((t - 2.35) / 1.05)), shr: 1 - sm(TA - .32, TA - .03, t), read: 0 });
    else if (fase === 1) { const a = 7.5; Object.assign(ST, { fan: 3 * sm(a + 2.2, a + 2.8, t) * (1 - sm(a + 4.6, a + 5.2, t)), aria: 0, acqua: 0, gocce: 0, rad: 0, caldo: 1, modo: 1, vel: 1, xray: .85 * sm(28.6, 29.0, t) * (1 - sm(30.0, 30.4, t)), E: 0, shr: 1, read: 0 }); }   // ai collegamenti il mantello si fa trasparente: i tubi entrano nel muro dietro la macchina
    else { const r = t - TR, m = r < 4.5 ? 1 : r < 8.5 ? 2 : 3; Object.assign(ST, statoModo(m, 1), { modo: m, vel: 1, xray: sm(.3, 1.5, r) * (1 - sm(11.4, 12.6, r)), E: 0, shr: 1, read: r > 1 ? 1 : 0 }); if (m === 3) ST.acqua = 1; }
  },
  look(now, dt) {
    rotA += dt * ST.fan * PI * 2; rotor.rotation.x = -rotA;
    M.radiante.emissiveIntensity = ST.rad * .35; M.alettaF.emissive.setHex(ST.caldo > .5 ? 0xff6a2a : 0x2a8cff); M.alettaF.emissiveIntensity = ST.acqua * .3;
    const fw = ST.acqua * (ST.xray > .3 || ST.ghost > .3 ? 1 : .0); PATH.fw.upd(now, fw, .18, ST.caldo > .5 ? PATH.w : PATH.wc); PATH.fr.upd(now, ST.rad * fw, .06, PATH.rad); PATH.fg.upd(now, ST.gocce * ST.aria, .12, PATH.g);
    const ap = ST.acqua < .5 ? PATH.aV : ST.caldo > .5 ? PATH.aH : PATH.aC; PATH.fa.forEach((f, i) => f.upd(now, ST.aria * .6, .1 + ST.fan * .03, ap[i]));
    ombraF.material.opacity = .8 * (1 - clamp(ST.E * 1.5)) * ST.shr;
  },
  libero() { Object.assign(FC, { modo: 1, vel: 1 }); },
  short: { strut: 'Struttura', vent: 'Ventilatore', batt: 'Batteria', cond: 'Condensa', rad: 'Pannello radiante', mant: 'Mantello', link: 'Collegamenti' },
  gusci: ['mant'], aperti: ['link'], trasparente: U => U.tool === 'comandi',
  tick(dt, { U, ease, calm }) {
    const s = statoModo(FC.modo, FC.vel); if (U.ride) { s.aria = 1; s.fan = 2.4; }
    for (const k of ['fan', 'aria', 'acqua', 'gocce', 'rad']) ease(k, s[k] * (k === 'rad' ? 1 : calm), 2.5); ST.caldo = s.caldo; ST.modo = FC.modo; ST.vel = FC.vel;
  },
  ronzio: s => [s.fan * .6, 0],
  stato: () => ({ modo: MODI[FC.modo], vel: VEL[FC.vel], fan: +ST.fan.toFixed(2), aria: +ST.aria.toFixed(2), gocce: +ST.gocce.toFixed(2), rad: +ST.rad.toFixed(2) }),
};
function uiComandi() { [...$('kModo').children].forEach((b, i) => press(b, i === FC.modo)); [...$('kVel').children].forEach((b, i) => press(b, i === FC.vel));
  $('pModo').textContent = ['Solo ventilazione: l\'aria gira, la batteria resta ferma.', 'Caldo: l\'acqua calda della pompa di calore scalda l\'aria e il frontale.', 'Freddo: l\'aria esce fresca e asciutta, la condensa scende nella bacinella.', 'Notte: ventilatore fermo, scalda solo il frontale radiante. In silenzio.'][FC.modo]; }
CFG.strumenti = ['touch', 'expl',
  { k: 'xray', nota: 'Arancio: acqua calda e aria tiepida. Azzurro: acqua fredda, aria fresca e gocce di condensa.' },
  { k: 'ride', titolo: 'Segui l\'aria', path: () => PATH.ride, vel: .5, dist: [.55, .85], inizio: 'Si parte dal pavimento della stanza',
    frasi: [[0, 'Il ventilatore aspira l\'aria della stanza dal basso, attraverso il filtro, e la spinge tra le alette calde della batteria: esce dall\'alto, tiepida']], fine: 'Giro finito: l\'aria torna nella stanza e ricomincia.' },
  { k: 'comandi', nome: 'Comandi', icona: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h3M9.500 10.500v3M14 12h2"/>',
    html: '<div class="keys" id="kModo" role="group" aria-label="Modo"></div><div class="keys" id="kVel" role="group" aria-label="Velocità" style="grid-template-columns:repeat(3,1fr)"></div><p class="note" id="pModo"></p>',
    init() { MODI.forEach((m, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'key'; b.textContent = m; b.onclick = () => { FC.modo = i; uiComandi(); }; $('kModo').appendChild(b); });
      VEL.forEach((m, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'key'; b.textContent = m; b.onclick = () => { FC.vel = i; uiComandi(); }; $('kVel').appendChild(b); }); },
    entra() { uiComandi(); } },
];
