// Prova automatica del sito con Chrome senza finestra, a 390x780, 844x390 e 1280x720.
// Uso: node prove/prova.mjs [cartella del sito, predefinita "anteprima"] [cartella per i fotogrammi]
// Serve Playwright (PLAYWRIGHT=percorso di playwright/index.mjs) e Three.js 0.186.1 in locale (THREE=cartella del pacchetto):
// la pagina resta quella pubblicata, le richieste a jsDelivr vengono servite dal disco e i caratteri di Google saltati.
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), DIR = '/' + (process.argv[2] || 'anteprima') + '/', OUT = process.argv[3] || '';
const THREE = process.env.THREE || path.join(ROOT, 'node_modules/three/');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(d); } }); }).listen(0);
const base = `http://127.0.0.1:${srv.address().port}${DIR}`;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
let falliti = 0, fatti = 0;
const ok = (c, msg) => { fatti++; if (!c) { falliti++; console.log('   NON PASSA:', msg); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const [W, H, touch] of [[390, 780, true], [844, 390, true], [1280, 720, false]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: touch }); let errs = [];
  await ctx.route('https://cdn.jsdelivr.net/npm/three@0.186.1/**', rt => fs.readFile(THREE + rt.request().url().split('three@0.186.1/')[1], (e, d) => e ? rt.fulfill({ status: 404, body: '' }) : rt.fulfill({ status: 200, contentType: 'text/javascript', body: d })));
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, rt => rt.abort());
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|fonts\.g/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push(String(e).slice(0, 300)));
  const st = () => page.evaluate(() => window.__casa.stato());
  const fino = async (f, ms = 9000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await f()) return true; await sleep(150); } return false; };
  const scena = s => fino(async () => (await st()).scena === s);
  const foto = n => OUT ? page.screenshot({ path: path.join(OUT, `${W}x${H}_${n}.jpg`), type: 'jpeg', quality: 82 }) : null;
  console.log(`— ${W}×${H}`);
  await page.goto(base, { waitUntil: 'load' }); ok(await fino(() => page.evaluate(() => !!window.__casa && document.body.classList.contains('pronto')), 20000), 'la pagina parte');
  ok(await scena('home'), 'si apre sulla Home'); await sleep(1200); await foto('home');
  // Home: trascino, prosegue per inerzia e si ferma su un prodotto
  const n = await page.evaluate(() => window.__casa.Home.voci.length), passo = Math.PI * 2 / n;
  await page.mouse.move(W * .7, H * .4); await page.mouse.down(); for (let i = 1; i <= 6; i++) { await page.mouse.move(W * .7 - i * W * .09, H * .4); await sleep(16); } await page.mouse.up();
  ok(Math.abs((await st()).home.rot) > .05, 'il cerchio gira trascinando');
  ok(await fino(async () => { const h = (await st()).home; return h.meta === null && h.vel === 0 && Math.abs(h.rot / passo - Math.round(h.rot / passo)) < .002; }, 30000), 'il cerchio si ferma su un prodotto');
  if (n > 1) ok((await st()).home.sel !== 0, 'dopo il trascinamento è davanti un altro prodotto');
  for (let i = 0; i < n && (await st()).home.sel !== 0; i++) { await page.click('#bNext'); await sleep(900); }
  ok((await st()).home.sel === 0, 'le frecce riportano davanti la UHP'); await fino(async () => (await st()).home.meta === null);
  ok((await page.textContent('#hName')).trim() === 'UHP 120' && !(await page.isDisabled('#bOpen')), 'titolo e pulsante della UHP');
  // tocco sul prodotto davanti: si apre la pagina completa; il ritorno riporta alla Home
  await page.mouse.click(W * .5, H * (H < 460 ? .3 : .36)); ok(await scena('prodotto'), 'il tocco sul prodotto lo apre');
  ok(page.url().endsWith('#uhp'), 'indirizzo #uhp'); const fr = page.frameLocator('#prod');
  ok(await fino(async () => await fr.locator('#bExplore').count() > 0, 15000), 'la pagina della UHP si carica nel riquadro'); await sleep(2500); await foto('uhp');
  ok(await fr.locator('.back').evaluate(a => { const r = a.getBoundingClientRect(); return a.ownerDocument.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === a; }), 'il ritorno è toccabile sopra la schermata d\'inizio');
  await fr.locator('.back').evaluate(a => a.click()); ok(await scena('home'), 'il ritorno dal prodotto riporta alla Home');
  ok(await page.evaluate(() => document.getElementById('prod').hidden), 'uscendo la pagina del prodotto si scarica');
  // Casa: la giornata
  await page.click('#bCasa'); ok(await scena('casa'), 'il pulsante porta nella Casa'); ok(page.url().endsWith('#casa'), 'indirizzo #casa');
  const t0 = (await st()).ora; await sleep(1500); ok((await st()).ora !== t0, 'la giornata scorre da sola');
  await page.click('#bPlay'); const t1 = (await st()).ora; await sleep(600); ok((await st()).ora === t1, 'Pausa ferma la giornata');
  const ora = v => page.evaluate(v => { const s = document.getElementById('sDay'); s.value = v; s.dispatchEvent(new Event('input', { bubbles: true })); }, v);
  await ora(6.5); let s = await st(); ok(Math.abs(s.ora - 6.5) < .01 && s.carico > .7 && (await page.textContent('#cStato')) === 'Riscalda', 'inverno, mattino: riscalda forte'); await sleep(500); await foto('casa_inverno_mattino');
  await ora(12.5); ok((await st()).carico < s.carico, 'inverno, mezzogiorno: rallenta');
  await ora(20); await sleep(500); await foto('casa_inverno_sera');
  await page.click('#bEst'); await ora(15); s = await st(); ok(s.estate && s.carico > .6 && (await page.textContent('#cStato')) === 'Raffresca', 'estate, pomeriggio: raffresca'); await sleep(500); await foto('casa_estate_pomeriggio');
  await ora(3); ok((await st()).carico < .03 && (await page.textContent('#cStato')) === 'A riposo', 'estate, notte: a riposo');
  await page.click('#bInv'); ok(!(await st()).estate, 'ritorno a inverno');
  // orbita e zoom
  // un punto libero della scena, non coperto da etichette o pannelli (le etichette seguono i prodotti e possono finire ovunque)
  const [px, py] = await page.evaluate(([W, H]) => { for (const [x, y] of [[.4, .45], [.5, .55], [.3, .6], [.6, .4], [.2, .5], [.7, .6], [.5, .35]]) { const e = document.elementFromPoint(W * x, H * y); if (e && e.id === 'gl') return [W * x, H * y]; } return [W * .4, H * .45]; }, [W, H]);
  const az0 = await page.evaluate(() => window.__casa.Casa.cam.az); await page.mouse.move(px, py); await page.mouse.down(); await page.mouse.move(px + 80, py + 20, { steps: 4 }); await page.mouse.up();
  ok(await page.evaluate(() => window.__casa.Casa.cam.az) !== az0, 'la casa si gira trascinando');
  const z0 = await page.evaluate(() => window.__casa.Casa.cam.zoom); await page.mouse.move(px, py); await page.mouse.wheel(0, -300); await sleep(200); ok(await page.evaluate(() => window.__casa.Casa.cam.zoom) < z0, 'la rotella avvicina');
  // dalla Casa al prodotto e ritorno alla Casa
  await page.locator('.tag').first().evaluate(b => b.click()); ok(await scena('prodotto'), "l'etichetta sulla macchina apre il prodotto"); await fino(async () => await fr.locator('.back').count() > 0, 15000);
  await fr.locator('.back').evaluate(a => a.click()); ok(await scena('casa'), 'il ritorno dal prodotto riporta alla Casa');
  // acqua calda nella giornata della Casa
  await ora(7.3); let c = await st(); ok(c.doccia === 1 && c.caldo < 1 && (await page.textContent('#cAcs')).startsWith('Doccia'), 'ore 7:18, doccia: esce acqua calda');
  await ora(9); c = await st(); ok(c.ricarica && (await page.textContent('#cAcs')).includes('ricarica'), 'dopo la doccia il serbatoio si ricarica');
  await ora(5); ok((await page.textContent('#cAcs')).includes('pronta'), 'prima dell\'alba acqua calda pronta'); await ora(15); await sleep(400); await foto('casa_acs');
  // HP 300PSDX: dalla Casa alla pagina completa, film e strumenti
  await page.locator('.tag').nth(1).evaluate(b => b.click()); ok(await scena('prodotto') && (await st()).prodotto === 'acs', "l'etichetta dell'HP 300PSDX apre il prodotto"); ok(page.url().endsWith('#acs'), 'indirizzo #acs');
  ok(await fino(async () => await fr.locator('#kDoccia').count() > 0, 20000), "la pagina dell'HP 300PSDX si carica");
  const acs = f => fr.locator('body').evaluate((_, f) => (0, eval)(f), f), premi = id => fr.locator('#' + id).evaluate(b => b.click()), sa = () => acs('window.__acs.stato()');
  await fino(async () => !!(await acs('!!window.__acs'))); await sleep(800); await foto('acs_inizio'); ok((await sa()).mode === 'start', "parte dalla schermata d'inizio");
  await premi('bGo'); await acs('window.__acs.seek(9)'); ok((await sa()).mode === 'film', 'il film parte'); await acs('window.__acs.seek(24)'); await sleep(300); await foto('acs_film');
  ok((await acs('window.__acs.seek(34.5); window.__acs.avanti(1); window.__acs.stato()')).caldo < .97, 'nel finale del film la doccia consuma acqua calda');   // in una sola chiamata: il film intanto va avanti da solo
  await premi('bFilm').catch(() => {}); await acs('window.__acs.libero(false)'); ok((await sa()).mode === 'free', 'si passa alla parte libera');
  const strum = n => fr.locator(`.tab[data-tool=${n}]`).evaluate(b => b.click());
  await strum('smonta'); await acs('window.__acs.avanti(2)'); ok((await sa()).e > .4, 'Smonta separa i gruppi'); await sleep(300); await foto('acs_smonta');
  await strum('sezione'); await acs('window.__acs.avanti(2)'); let a = await sa(); ok(a.sez > .95 && a.e < .05, 'Sezione taglia a metà e richiude');
  await strum('doccia'); await premi('kDoccia'); await acs('window.__acs.avanti(4)'); a = await sa(); ok(a.doccia && a.caldo < .8 && a.caldo > .3, "Doccia: l'acqua calda scende"); await sleep(300); await foto('acs_doccia');
  await premi('kDoccia'); await acs('window.__acs.avanti(30)'); a = await sa(); ok(!a.doccia && a.caldo === 1 && !a.comp, 'chiusa la doccia il serbatoio si ricarica e la macchina si ferma');
  await strum('modi'); ok((await sa()).set === 55, 'set di fabbrica 55 °C'); await premi('kFv'); await acs('window.__acs.avanti(.2)'); ok((await sa()).set === 65, 'contatto fotovoltaico: 65 °C'); await premi('kFv');
  await premi('kAnti'); await acs('window.__acs.avanti(.2)'); ok((await sa()).set === 65, 'antilegionella: 65 °C'); await premi('kAnti'); await premi('kRes'); await acs('window.__acs.avanti(.2)'); ok((await sa()).set === 70, 'resistenza: 70 °C'); await sleep(300); await foto('acs_modi'); await premi('kRes');
  await strum('tocca'); await fr.locator('#nomi .btn').nth(2).evaluate(b => b.click()); ok((await fr.locator('#pTocca').textContent()).includes('Condensatore'), 'la scheda del gruppo si apre');
  await fr.locator('.back').evaluate(a => a.click()); ok(await scena('casa'), "il ritorno dall'HP 300PSDX riporta alla Casa");
  // fotovoltaico nella Casa e pagina completa
  await ora(12.5); c = await st(); ok(c.pv > .4 && c.bat >= 0 && c.sole, 'inverno, mezzogiorno: il fotovoltaico produce più di quanto serve');
  ok((await page.textContent('#cFv')).startsWith('Sole') && (await page.textContent('#cAcs')).includes('65'), "con il sole in più l'acqua calda sale a 65 °C");
  await ora(22.5); c = await st(); ok(c.pv === 0 && (c.bat < 0 || c.rete < 0), 'sera: la casa va a batteria o a rete');
  await page.click('#bEst'); await ora(13); c = await st(); ok(c.soc > .5 && c.pv > .8, 'estate, primo pomeriggio: tanto sole e batteria carica'); await sleep(400); await foto('casa_fv'); await page.click('#bInv');
  await page.locator('.tag').nth(2).evaluate(b => b.click()); ok(await scena('prodotto') && (await st()).prodotto === 'fv', "l'etichetta del fotovoltaico apre il prodotto");
  ok(await fino(async () => await fr.locator('#sS').count() > 0, 20000), 'la pagina del fotovoltaico si carica');
  const fv = q => fr.locator('body').evaluate((_, q) => (0, eval)(q), q); await fino(async () => !!(await fv('!!window.__fv'))); await sleep(800); await foto('fv_inizio');
  ok((await fv('window.__fv.seek(21.5); window.__fv.stato()')).mode === 'film', 'il film del fotovoltaico parte'); await sleep(300); await foto('fv_film');
  let f = await fv("window.__fv.libero(false); window.__fv.setTool('sole'); { const s = document.getElementById('sS'); s.value = 1; s.dispatchEvent(new Event('input')); } window.__fv.avanti(3); window.__fv.stato()");
  ok(f.mode === 'free' && f.bat > 0 && f.soc > .45, 'Sole: con il sole la batteria si carica'); await sleep(300); await foto('fv_sole');
  f = await fv('window.__fv.avanti(60); window.__fv.stato()'); ok(f.soc === 1 && f.bat === 0 && f.rete > 0, 'batteria piena: il resto va in rete');
  f = await fv("{ const s = document.getElementById('sS'); s.value = 0; s.dispatchEvent(new Event('input')); } window.__fv.avanti(2); window.__fv.stato()"); ok(f.bat < 0 && Math.abs(f.rete) < 1e-6, 'senza sole la batteria alimenta la casa');
  f = await fv('window.__fv.avanti(120); window.__fv.stato()'); ok(f.soc <= .101 && f.bat === 0 && f.rete < 0, 'alla scarica minima si prende dalla rete');
  f = await fv("window.__fv.setTool('smonta'); window.__fv.avanti(2); window.__fv.stato()"); ok(f.e > .4, 'Smonta separa i gruppi del fotovoltaico');
  f = await fv("window.__fv.setTool('dentro'); window.__fv.avanti(2); window.__fv.stato()"); ok(f.dentro > .95 && f.e < .05 && f.pezzi > 80, 'Dentro rende trasparenti gli involucri'); await sleep(300); await foto('fv_dentro');
  await fr.locator('.back').evaluate(a => a.click()); ok(await scena('casa'), 'il ritorno dal fotovoltaico riporta alla Casa');
  // ibrido (tappa 4): scambio del generatore nella Casa, caldaia nelle ore più fredde, pagina completa
  await page.click('#bIbr'); c = await st(); ok(c.gen === 'ibrido' && (await page.textContent('.tag')).startsWith('HYBREER 3'), "il pulsante Ibrido mette l'ibrido al posto della UHP");
  await ora(6.5); c = await st(); ok(c.caldaia > .9 && c.carico > .7 && (await page.isVisible('#cCal')), 'inverno, mattino presto: caldaia accesa insieme alla pompa di calore'); await sleep(500); await foto('casa_ibrido_mattino');
  await ora(12.5); c = await st(); ok(c.caldaia === 0 && !(await page.isVisible('#cCal')), 'inverno, mezzogiorno: la caldaia è spenta');
  await page.click('#bEst'); await ora(15); c = await st(); ok(c.caldaia === 0 && c.carico > .6 && (await page.textContent('#cStato')) === 'Raffresca', "estate: raffresca solo la pompa di calore"); await page.click('#bInv');
  await page.locator('.tag').first().evaluate(b => b.click()); ok(await scena('prodotto') && (await st()).prodotto === 'ibrido', "l'etichetta dell'ibrido apre il prodotto"); ok(page.url().endsWith('#ibrido'), 'indirizzo #ibrido');
  ok(await fino(async () => await fr.locator('#sT').count() > 0, 20000), "la pagina dell'ibrido si carica");
  const ib = q => fr.locator('body').evaluate((_, q) => (0, eval)(q), q); await fino(async () => !!(await ib('!!window.__ibrido && !!window.__ui')), 20000); await sleep(800); await foto('ibrido_inizio');
  let x = await ib('window.__ibrido.stato()'); ok(x.mode === 'start' && x.pezzi > 850 && x.gruppi === 11, `l'ibrido parte dalla schermata d'inizio con ${x.pezzi} pezzi in 11 gruppi`);
  ok(await fr.locator('.back').evaluate(a => { const r = a.getBoundingClientRect(); return a.ownerDocument.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === a; }), "il ritorno dall'ibrido è toccabile sopra la schermata d'inizio");
  x = await ib('window.__ibrido.seek(2.9); window.__ibrido.stato()'); ok(x.mode === 'film' && x.E > .5, "il film dell'ibrido parte con l'impianto che si apre"); await sleep(300); await foto('ibrido_aggancio');
  x = await ib('window.__ibrido.seek(14.2); window.__ibrido.stato()'); ok(x.posati > 300 && x.posati < 500, 'a metà della pompa di calore i pezzi posati crescono'); await sleep(300); await foto('ibrido_compressore');
  x = await ib('window.__ibrido.seek(28.8); window.__ibrido.stato()'); ok(x.boil > .8, 'la fiamma del bruciatore si accende mentre la caldaia si monta'); await sleep(300); await foto('ibrido_bruciatore');
  x = await ib('window.__ibrido.seek(49); window.__ibrido.stato()'); ok(x.posati === x.pezzi && x.who === 1 && x.xray > .9 && x.fan > 5, 'in funzione a 10 °C: solo pompa di calore, involucri ai raggi X'); await sleep(300); await foto('ibrido_funzione');
  x = await ib('window.__ibrido.seek(54); window.__ibrido.stato()'); ok(x.who === 2 && x.boil > .9 && x.outT < 5, 'nel film sotto i 5 °C si accende anche la caldaia'); await sleep(300); await foto('ibrido_freddo');
  x = await ib('window.__ibrido.seek(57); window.__ibrido.stato()'); ok(x.who === 3 && x.fan < .5 && x.outT < -15, 'nel film sotto i −15 °C resta solo la caldaia');
  x = await ib("document.getElementById('bSkip').click(); window.__ibrido.step(30, .05); window.__ibrido.stato()"); ok(x.mode === 'free' && x.who === 1 && x.outT === 7, 'si passa alla parte libera: 7 °C, solo pompa di calore'); await sleep(300); await foto('ibrido_libero');
  const meteo = v => `window.__ui.setTool('meteo'); { const s = document.getElementById('sT'); s.value = ${v}; s.dispatchEvent(new Event('input')); } window.__ibrido.step(80, .05); window.__ibrido.stato()`;
  x = await ib(meteo(-6)); ok(x.who === 2 && x.boil > .9 && x.fan > 5, 'Meteo −6 °C: pompa di calore e caldaia insieme'); ok((await fr.locator('#rGen b').textContent()).includes('caldaia'), 'in alto si legge chi sta lavorando'); await sleep(300); await foto('ibrido_meteo');
  x = await ib(meteo(-20)); ok(x.who === 3 && x.boil > .9 && x.fan < .3, 'Meteo −20 °C: solo caldaia, ventilatore fermo');
  x = await ib(meteo(6)); ok(x.who === 1 && x.boil < .1, 'Meteo 6 °C con impianto a pavimento: solo pompa di calore');
  x = await ib("window.__ui.setTool('rem'); document.getElementById('kImp').children[2].click(); window.__ibrido.step(60, .05); window.__ibrido.stato()"); ok(x.who === 2 && x.watT === 55, 'Accendi, impianto a fan coil: a 6 °C la caldaia è già accesa (soglia 10 °C), mandata 55 °C');
  x = await ib("document.getElementById('kCool').click(); window.__ibrido.step(60, .05); window.__ibrido.stato()"); ok(x.cool && x.who === 1 && x.boil < .1 && x.watT === 18, 'Freddo: raffresca solo la pompa di calore'); await sleep(300); await foto('ibrido_accendi');
  x = await ib("document.getElementById('kPw').click(); window.__ibrido.step(60, .05); window.__ibrido.stato()"); ok(x.who === 0 && x.fan < .3, 'Spento: tutto fermo'); await ib("document.getElementById('kPw').click(); document.getElementById('kHeat').click(); document.getElementById('kImp').children[0].click()");
  x = await ib("window.__ui.setTool('expl'); window.__ibrido.step(40, .05); window.__ibrido.stato()"); ok(x.E > .45, "Smonta apre l'impianto pezzo per pezzo"); await sleep(300); await foto('ibrido_smonta');
  x = await ib("window.__ui.setTool('xray'); window.__ibrido.step(20, .05); getComputedStyle(document.getElementById('lens')).display"); ok(x === 'block', 'Raggi X mostra la lente'); await sleep(300); await foto('ibrido_raggi');
  x = await ib("window.__ui.setTool('ride'); window.__ibrido.step(100, .05); [window.__ui.U.ride, window.__ui.U.ru, document.getElementById('rT').textContent]"); ok(x[0] && x[1] > .1 && x[2].length > 10, "Giro: la camera segue l'acqua nei tubi"); await sleep(300); await foto('ibrido_giro');
  x = await ib("window.__ibrido.step(700, .05); [window.__ui.U.ride, document.getElementById('rT').textContent]"); ok(!x[0] && x[1].startsWith('Giro finito'), 'il giro arriva in fondo e si ferma');
  x = await ib("window.__ui.setTool('touch'); window.__ui.openCard(6); window.__ibrido.step(30, .05); document.getElementById('cT').textContent + '|' + document.getElementById('cS').textContent"); ok(x.includes('Caldaia') && x.includes('KONm C 24'), 'la scheda della caldaia si apre'); await sleep(300); await foto('ibrido_scheda');
  await fr.locator('.back').evaluate(a => a.click()); ok(await scena('casa') && (await st()).gen === 'ibrido', "il ritorno dall'ibrido riporta alla Casa, con l'ibrido ancora al suo posto");
  await page.click('#bUhp'); ok((await st()).gen === 'uhp' && (await page.textContent('.tag')).startsWith('UHP 120'), 'il pulsante Pompa di calore rimette la UHP');
  // indirizzi diretti
  for (const [h, vuole] of [['#casa', 'casa'], ['#uhp', 'prodotto'], ['#acs', 'prodotto'], ['#fv', 'prodotto'], ['#ibrido', 'prodotto'], ['#nonesiste', 'home'], ['', 'home']]) { await page.goto('about:blank'); await page.goto(base + h, { waitUntil: 'load' }); await fino(() => page.evaluate(() => !!window.__casa), 20000); ok(await scena(vuole), `indirizzo diretto ${h || '(vuoto)'} → ${vuole}`); }
  ok(errs.length === 0, 'console senza errori: ' + errs.join(' | ')); await ctx.close();
}
console.log(`${fatti - falliti} controlli passati su ${fatti}`); await b.close(); srv.close(); process.exit(falliti ? 1 : 0);
