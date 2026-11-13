// ───────── Fotovoltaico · energia, film e strumenti ─────────
// Flussi secondo la modalità Autoconsumo (manuale ZOE1 p.14): il fotovoltaico alimenta la casa, l'avanzo carica la batteria e poi va in rete;
// senza sole la batteria alimenta la casa fino alla scarica minima, poi si prende dalla rete. Intensità qualitative: nessun valore a schermo.
const TA = 3.5, TR = 36.5, TE = 50.5;
const ST = { ghost: 0, xray: 0, E: 0, shr: 1, read: 0, sole: 0, soc: .45, bat: 0, rete: 0, casa: .35, s: 0, b: 0, c: 0, g: 0, dentro: 0 };
const EN = { sole: .8, soc: .45, bat: 0, rete: 0, casa: .35 };
function ripartisci(o) { const av = o.sole - o.casa; o.bat = av > 0 ? (o.soc < 1 ? Math.min(av, .5) : 0) : (o.soc > .1 ? Math.max(av, -.5) : 0); o.rete = av - o.bat; }
function energia(dt) { ripartisci(EN); EN.soc = clamp(EN.soc + EN.bat * dt * .12, .1, 1); }
const SOLE = [1.6, 1.25, .2], DC = [1.7, 1.35, .25], ACC = [1.5, 1.35, 1.1], BAT = [.35, 1.6, .55], RETE = [1.0, .55, 1.7];
const PATH = {};
{
  const f = (n, s) => new Flow(machine, n, s, .03);
  const fs1 = f(110, .026), fs2 = f(110, .026), fb = f(60, .03), fc = f(50, .03), fr = f(50, .03), fi = f(70, .022);
  PATH.s1 = fs1.path([seg('s1', SOLE, DC)]); PATH.s2 = fs2.path([seg('s2', SOLE, DC)]); PATH.bat = fb.path([seg('bat', BAT, BAT)]); PATH.casa = fc.path([seg('casa', ACC, ACC)]); PATH.rete = fr.path([seg('rete', RETE, RETE)]);
  PATH.dentro = fi.path([seg('dentro', DC, ACC)]); PATH.ride = giroDi(fs1.path([seg('s1', SOLE, DC), seg('dentro', DC, ACC), seg('casa', ACC, ACC)], 900));
  Object.assign(PATH, { fs1, fs2, fb, fc, fr, fi });
}
let ventA = 0, lastLcd = '', lastSoc = -1;
const testoLcd = () => EN.sole > .15 ? 'SOLE' : ST.bat < -.01 ? 'BATTERIA' : 'RETE';
const CFG = {
  id: 'fv', nome: 'Fotovoltaico', modello: 'Unical', sub: 'Unical · MULTIVOLT 460 BF · ZOE1-6000 · SUM BL15P',
  start: { k: 'Fotovoltaico con accumulo Unical', p: 'Moduli sul tetto, inverter e batteria in mansarda. Poi provalo tu: smontalo, guardaci dentro, segui l\'energia, fai sorgere e tramontare il sole.', dur: '50 secondi' },
  T_ASM: TA, T_RUN: TR, T_END: TE, MC: V(.25, 1.15, -.1), BW: 4.7, BH: 2.7, S: ST,
  ganci: [[.1, 1.5, '6,44 kWp', '#ffd84a', 'sul tetto della casa: 14 moduli'], [1.55, TA - .2, '15,36 kWh', '#7dff9a', 'da parte per la sera']],
  letture: [['Sole', s => s.sole > .6 ? 'Pieno' : s.sole > .15 ? 'Velato' : 'Notte', '#ffd84a', 'gen'], ['Batteria', s => s.bat > .01 ? 'Si carica' : s.bat < -.01 ? 'Alimenta la casa' : s.soc >= 1 ? 'Piena' : 'Ferma', '#7dff9a', 'gen'],
    ['Rete', s => s.rete > .01 ? 'Riceve' : s.rete < -.01 ? 'Fornisce' : 'Ferma', '#c49bff', 'gen']],
  caps: [[0, 'Mezzogiorno', 'Il sole dà più di quello che serve: la casa prende la sua parte e la batteria si carica con il resto.'],
    [4.6, 'Tramonto', 'Il sole cala. Quello che manca lo dà la batteria: la rete non serve.'],
    [8.6, 'Notte', 'La batteria tiene accesa la casa. Quando arriva alla scarica minima, si prende dalla rete.'],
    [12, 'Unical: moduli, inverter, batteria', 'MULTIVOLT 460 BF · ZOE1-6000 · SUM BL15P · l\'energia del sole, usata in casa prima che altrove.']],
  camRun(H, TUTTO) { H(TR + .9, TUTTO, -6, 14); H(TR + 4.6, { off: [1.5, 1.05, ZW + .3], w: 1.9, h: 1.7 }, 10, 10); H(TR + 8.6, { off: [1.1, .85, ZW + .3], w: 1.5, h: 1.45 }, -14, 8); H(TR + 12, TUTTO, -4, 12); },
  film(t, fase) {
    const o = { sole: 0, soc: .45, casa: .35 };
    if (fase === 0) { o.sole = 1; o.soc = .5; ripartisci(o); Object.assign(ST, o, { xray: 0, E: t < 2.35 ? 0 : 1.25 * eoc(clamp((t - 2.35) / 1.05)), shr: 1 - sm(TA - .32, TA - .03, t), read: 0 }); }
    else if (fase === 1) { o.sole = .7 * sm(12.6, 13.2, t) * (1 - sm(14.2, 14.7, t)); Object.assign(ST, o, { bat: 0, rete: 0, xray: 0, E: 0, shr: 1, read: 0 }); ST.flussi = 0; }
    else { const r = t - TR; o.sole = 1 - sm(4.6, 7.2, r); o.soc = clamp(.5 + .45 * sm(.6, 4.4, r) - .85 * sm(7.6, 11.4, r), .1, .95); ripartisci(o);
      Object.assign(ST, o, { xray: sm(.3, 1.5, r) * (1 - sm(11.4, 12.6, r)), E: 0, shr: 1, read: r > 1 ? 1 : 0 }); }
    const fl = fase === 1 ? 0 : 1; ST.s = ST.sole * fl; ST.b = Math.abs(ST.bat) * 2 * fl; ST.c = fl; ST.g = Math.min(1, Math.abs(ST.rete) * 3) * fl; ST.dentro = ST.xray * fl;
  },
  look(now, dt) {
    M.cella.emissiveIntensity = M.celle.emissiveIntensity = .55 * ST.sole; SCENA.sole.material.opacity = ST.sole; keyL.intensity = 1.6 + .8 * ST.sole;
    M.cellaB.emissiveIntensity = ST.bat > .01 ? .35 + .15 * Math.sin(now * 4) : ST.bat < -.01 ? .15 : 0;
    ventA += dt * (ST.s + ST.b > .05 ? 14 : 0); SCENA.ventola.rotation.z = -ventA;
    const l = testoLcd(); if (l !== lastLcd) { lastLcd = l; lcdInv(l); }
    if (Math.abs(ST.soc - lastSoc) > .01) { lastSoc = ST.soc; tacche(ST.soc); }
    PATH.fs1.upd(now, ST.s, .09, PATH.s1); PATH.fs2.upd(now, ST.s, .09, PATH.s2); PATH.fb.upd(now, Math.min(1, ST.b), ST.bat >= 0 ? .2 : -.2, PATH.bat);
    PATH.fc.upd(now, ST.c, .22, PATH.casa); PATH.fr.upd(now, ST.g, ST.rete >= 0 ? .22 : -.22, PATH.rete); PATH.fi.upd(now, ST.dentro * Math.min(1, ST.s + ST.b), .25, PATH.dentro);
  },
  libero() { Object.assign(EN, { sole: .8, soc: .45, casa: .35 }); },
  short: { tetto: 'Ganci e profili', modulo: 'Modulo', modulo2: 'Morsetti', inverter: 'Inverter', batteria: 'Batteria', cavi: 'Cavi' },
  gusci: ['inverter', 'batteria'], aperti: ['cavi'],
  tick(dt, { U, ease, inside, calm }) {
    energia(dt); Object.assign(ST, { sole: EN.sole, soc: EN.soc, bat: EN.bat, rete: EN.rete, casa: EN.casa });
    ease('s', EN.sole * calm, 3); ease('b', Math.min(1, Math.abs(EN.bat) * 2) * calm, 3); ease('c', calm, 3); ease('g', Math.min(1, Math.abs(EN.rete) * 3) * calm, 3); ease('dentro', inside ? calm : 0, 3);
    if (U.ride) { ST.s = 1; ST.dentro = 1; ST.c = 1; }
    if (U.tool === 'sole') uiSole();
  },
  ronzio: s => [s.s + s.b > .05 ? 1.2 : 0, 0],
  stato: () => ({ sole: +EN.sole.toFixed(2), soc: +EN.soc.toFixed(3), bat: +EN.bat.toFixed(3), rete: +EN.rete.toFixed(3), casa: EN.casa }),
};
function uiSole() { $('bSoc').style.width = (EN.soc * 100).toFixed(0) + '%';
  $('pSole').textContent = EN.sole - EN.casa > 0 ? (EN.bat > 0 ? 'C\'è più sole di quanto serve: l\'avanzo carica la batteria.' : 'Batteria piena: quello che avanza va in rete.')
    : EN.bat < 0 ? 'Il sole non basta: la batteria dà quello che manca.' : 'Batteria alla scarica minima: si prende dalla rete.'; }
CFG.strumenti = ['touch', 'expl',
  { k: 'xray', nota: 'Giallo: corrente continua dal tetto. Bianco: alternata verso la casa. Verde: batteria. Viola: rete.' },
  { k: 'ride', titolo: 'Segui l\'energia', path: () => PATH.ride, vel: 1.1, dist: [1.0, 1.5], inizio: 'Si parte dalle celle del modulo',
    frasi: [[0, 'Dalle celle, in corrente continua, scende lungo la stringa fino all\'inverter'], [1, 'Nell\'inverter i condensatori la livellano e sei interruttori la trasformano in alternata'], [2, 'Esce in alternata e accende la casa']],
    fine: 'Giro finito: dal tetto alla presa di casa, in un istante.' },
  { k: 'sole', nome: 'Sole', icona: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M18.700 5.300l-1.800 1.800M7.100 16.900l-1.800 1.800"/>',
    html: '<div class="how"><i class="gest"></i><span>Muovi il sole e i consumi di casa: guarda dove va l\'energia.</span></div><div class="sl"><small style="min-width:64px">Sole</small><input id="sS" type="range" min="0" max="100" value="80" aria-label="Sole"></div><div class="sl"><small style="min-width:64px">Consumi</small><input id="sC" type="range" min="10" max="90" value="35" aria-label="Consumi della casa"></div><div class="row"><small>Batteria</small><div class="prog" style="flex:1"><i id="bSoc"></i></div></div><p class="note" id="pSole"></p>',
    init() { const s = $('sS'), c = $('sC'); fill(s); fill(c); s.addEventListener('input', () => { EN.sole = s.value / 100; fill(s); }); c.addEventListener('input', () => { EN.casa = c.value / 100; fill(c); }); },
    entra() { $('sS').value = Math.round(EN.sole * 100); $('sC').value = Math.round(EN.casa * 100); fill($('sS')); fill($('sC')); uiSole(); } },
];
