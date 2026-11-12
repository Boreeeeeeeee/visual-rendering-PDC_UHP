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
  const az0 = await page.evaluate(() => window.__casa.Casa.cam.az); await page.mouse.move(W * .4, H * .45); await page.mouse.down(); await page.mouse.move(W * .4 + 80, H * .45 + 20, { steps: 4 }); await page.mouse.up();
  ok(await page.evaluate(() => window.__casa.Casa.cam.az) !== az0, 'la casa si gira trascinando');
  const z0 = await page.evaluate(() => window.__casa.Casa.cam.zoom); await page.mouse.wheel(0, -300); await sleep(200); ok(await page.evaluate(() => window.__casa.Casa.cam.zoom) < z0, 'la rotella avvicina');
  // dalla Casa al prodotto e ritorno alla Casa
  await page.click('#tag'); ok(await scena('prodotto'), "l'etichetta sulla macchina apre il prodotto"); await fino(async () => await fr.locator('.back').count() > 0, 15000);
  await fr.locator('.back').evaluate(a => a.click()); ok(await scena('casa'), 'il ritorno dal prodotto riporta alla Casa');
  // indirizzi diretti
  for (const [h, vuole] of [['#casa', 'casa'], ['#uhp', 'prodotto'], ['#nonesiste', 'home'], ['', 'home']]) { await page.goto('about:blank'); await page.goto(base + h, { waitUntil: 'load' }); await fino(() => page.evaluate(() => !!window.__casa), 20000); ok(await scena(vuole), `indirizzo diretto ${h || '(vuoto)'} → ${vuole}`); }
  ok(errs.length === 0, 'console senza errori: ' + errs.join(' | ')); await ctx.close();
}
console.log(`${fatti - falliti} controlli passati su ${fatti}`); await b.close(); srv.close(); process.exit(falliti ? 1 : 0);
