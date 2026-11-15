// ───────── il sito: tre scene (Home, Casa, Prodotto), indirizzi con il cancelletto, ciclo di disegno ─────────
// #home (o niente) = cerchio dei prodotti · #casa = la casa · #<id prodotto> = pagina completa del prodotto, caricata solo quando serve.
$('logo').innerHTML = unicalLogoSvg();
const SCENE = { home: Home, casa: Casa };
let attiva = null, nome = '', ultima = 'home', inCorso = false;
const velo = $('veil'), prod = $('prod');
const attendi = ms => new Promise(r => setTimeout(r, ms));
const prodotto = id => PRODOTTI.find(p => p.id === id && p.pagina);

function resize() { const w = Math.max(2, stage.clientWidth), h = Math.max(2, stage.clientHeight); renderer.setSize(w, h, false); Home.resize(w, h); AREA_C = areaCasa(w, h); Casa.resize(w, h, AREA_C); dispostiSimboli(); }

async function vai(dest, subito) {
  if (dest === nome || inCorso) return; inCorso = true;
  const p = prodotto(dest);
  if (!SCENE[dest] && !p) dest = 'home';
  if (!subito) { velo.classList.add('on'); await attendi(380); }
  document.body.dataset.scena = p ? 'prodotto' : dest; nome = dest;
  if (p) {              // il livello completo vive in una pagina a sé: si carica ora e si scarica uscendo, così la memoria torna libera
    attiva = null; prod.hidden = false; await new Promise(r => { prod.onload = r; prod.src = p.pagina; setTimeout(r, 6000); });
    document.title = p.nome + ' · Casa Unical';
  } else {
    if (!prod.hidden) { prod.hidden = true; prod.removeAttribute('src'); prod.src = 'about:blank'; }
    attiva = SCENE[dest]; ultima = dest; if (dest === 'casa') { resize(); if (riprendiDopo) Casa.play(true); riprendiDopo = false; } else scheda(null); attiva.entra(); last = 0; document.title = dest === 'casa' ? 'La casa · Casa Unical' : 'Casa Unical';
  }
  velo.classList.remove('on'); inCorso = false;
  const h = location.hash.slice(1); if (h !== nome && !(h === '' && nome === 'home')) rotta();   // l'indirizzo è cambiato durante il passaggio
}
function rotta() {
  let h = location.hash.slice(1).toLowerCase();
  if (h === 'indietro') { history.replaceState(null, '', '#' + ultima); h = ultima; }
  vai(h || 'home', !nome);
}
addEventListener('hashchange', rotta);
const apri = h => { if (location.hash.slice(1) === h) rotta(); else location.hash = h; };

// Home
if (Home.voci.length < 2) { document.body.classList.add('solo'); $('hHint').textContent = 'Tocca il prodotto per aprirlo'; }
const fmtN = i => String(i + 1).padStart(2, '0') + ' / ' + String(Home.voci.length).padStart(2, '0');
Home.su(v => apri(v.id), (v, i) => {
  $('hNum').textContent = fmtN(i); $('hName').textContent = v.nome; $('hLine').textContent = v.riga;
  const b = $('bOpen'); b.disabled = !v.fatto; b.firstChild.textContent = v.fatto ? (v.apri || 'Apri') : 'In arrivo';
});
$('bOpen').onclick = () => { const v = Home.voci[Home.sel]; if (v.fatto) apri(v.id); };
$('bCasa').onclick = () => apri('casa'); $('bPrev').onclick = () => Home.gira(-1); $('bNext').onclick = () => Home.gira(1);
addEventListener('keydown', e => { if (nome !== 'home') return; if (e.key === 'ArrowLeft') Home.gira(-1); if (e.key === 'ArrowRight') Home.gira(1); if (e.key === 'Enter') $('bOpen').click(); });

// Casa: la giornata a momenti. Il riquadro in alto dice ora, momento e cosa succede; la barra in basso ha stagione, generatore, i momenti e i comandi.
const sDay = $('sDay'), hh = t => { const m = Math.round(t * 60) % 1440; return String(m / 60 | 0).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const ICONA = { pausa: '<svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.6" height="12" rx="1"/><rect x="9.4" y="2" width="3.6" height="12" rx="1"/></svg>', play: '<svg viewBox="0 0 16 16"><path d="M4 2.2v11.6c0 .6.7 1 1.2.7l9-5.8c.5-.3.5-1 0-1.4l-9-5.8C4.7 1.2 4 1.6 4 2.2z"/></svg>' };
const tags = Casa.viste.map(v => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tag'; b.textContent = v.def.nome + ' ›'; b.onclick = () => scheda(v.def.id); $('tags').appendChild(b); return b; });
let INFO = null, chiaveM = '', titoloM = '', icona = '';
// scheda del prodotto toccato: cosa sta facendo adesso, e il pulsante per aprirlo. Mentre è aperta la giornata si ferma.
let foglio = null, riprendi = false, riprendiDopo = false;
function scheda(id) {
  const p = id && PRODOTTI.find(q => q.id === id);
  if (!p) { if (foglio) { $('cSheet').hidden = true; foglio = null; if (riprendi) Casa.play(true); riprendi = false; } return; }
  if (!foglio) { riprendi = Casa.R.modo === 'auto'; if (riprendi) Casa.play(false); }
  foglio = p; $('shNome').textContent = p.nome; $('shText').textContent = Casa.descrivi(p.id); $('shApri').textContent = (p.apri || 'Apri') + ' ›'; $('cSheet').hidden = false; aggiornaTag();
}
$('shX').onclick = () => scheda(null);
$('shApri').onclick = () => { const p = foglio; $('cSheet').hidden = true; foglio = null; riprendiDopo = riprendi; riprendi = false; apri(p.id); };
// barra del giorno: il cielo della stagione (notte, alba, giorno, tramonto) fa da sfondo; sopra, un simbolo per ogni momento, che si tocca per andarci.
// I simboli stanno sopra la loro ora; se due sono troppo vicini si scostano, e sulla barra resta una tacca all'ora giusta.
const SIMBOLI = {
  alba: '<path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 6V3M5.6 9.6 4 8M18.4 9.6 20 8"/>', tramonto: '<path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 3v4M10 5l2 2 2-2"/>',
  sole: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  luna: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', doccia: '<path d="M4 4h6M10 4a6 6 0 0 1 6 6M12.5 10h7M13 14l-1 2M16 14v2.5M19 14l1 2M14.5 18.5l-.5 1.5M18 18.5l.5 1.5"/>',
  termo: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0zM12 9v8"/>', fiamma: '<path d="M12 21c4 0 6-2.5 6-6 0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15c0 3.5 2 6 6 6z"/>',
  fiammaNo: '<path d="M12 21c4 0 6-2.5 6-6 0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15c0 3.5 2 6 6 6zM4 4l16 16"/>',
  fiocco: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/>', ventola: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>' };
let simboli = [], tacche = [];
function segni(info) {
  const k = info.chiave + info.alba; if (k === chiaveM) return dispostiSimboli(); chiaveM = k;
  const ic = $('cIcons'), tk = $('cTicks'); ic.innerHTML = ''; tk.innerHTML = '';
  simboli = info.lista.map((m, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'mi'; b.title = hh(m.t) + ' · ' + m.titolo; b.setAttribute('aria-label', hh(m.t) + ', ' + m.titolo);
    b.innerHTML = '<svg viewBox="0 0 24 24">' + (SIMBOLI[m.icona] || SIMBOLI.sole) + '</svg>'; b.onclick = () => Casa.vai(i); ic.appendChild(b); return b; });
  tacche = info.lista.map(m => { const d = document.createElement('i'); d.style.left = (m.t / 24 * 100) + '%'; tk.appendChild(d); return d; });
  // il cielo della giornata sulla barra
  const a = info.alba, t = info.tram, pc = h => (clamp(h, 0, 24) / 24 * 100).toFixed(1) + '%';
  $('cTrack').style.backgroundImage = `linear-gradient(90deg, #142338 0%, #142338 ${pc(a - 1.1)}, #e3925f ${pc(a)}, #8cc2e6 ${pc(a + 1.3)}, #8cc2e6 ${pc(t - 1.3)}, #e07a4f ${pc(t)}, #142338 ${pc(t + 1.1)}, #142338 100%)`;
  dispostiSimboli();
}
function dispostiSimboli() {
  if (!simboli.length || !INFO) return; const W = $('cIcons').clientWidth, r = simboli[0].offsetWidth / 2 || 16, L = W - 26, gap = r * 2 + 3;
  const x = INFO.lista.map(m => 13 + m.t / 24 * L);
  for (let i = 1; i < x.length; i++) x[i] = Math.max(x[i], x[i - 1] + gap);
  x[x.length - 1] = Math.min(x[x.length - 1], W - r); for (let i = x.length - 2; i >= 0; i--) x[i] = Math.min(x[i], x[i + 1] - gap);
  x.forEach((v, i) => { simboli[i].style.left = Math.max(r, v).toFixed(1) + 'px'; });
}
function aggiornaTag() { if (!INFO) return; const libera = INFO.modo === 'libero';      // tutte le etichette solo nella giornata libera; in pausa restano quelle del momento
  tags.forEach((b, i) => { const id = Casa.viste[i].def.id, su = INFO.chi.includes(id); b.dataset.mostra = foglio ? 0 : libera || su ? 1 : 0; b.classList.toggle('su', su && !foglio); }); }
Casa.su(p => p && scheda(p.id), (S, info) => {
  INFO = info; segni(info);
  $('cHour').textContent = hh(S.t); sDay.value = S.t; sDay.style.setProperty('--f', (S.t / 24 * 100) + '%');
  if (info.titolo !== titoloM) { titoloM = info.titolo; const c = $('cCard'); c.classList.remove('nuovo'); void c.offsetWidth; c.classList.add('nuovo'); }
  $('cTit').textContent = info.titolo; $('cText').textContent = info.testo;
  $('cNum').textContent = info.i >= 0 ? (S.estate ? 'Estate' : 'Inverno') + ' · ' + (info.i + 1) + ' / ' + info.n : 'Ora libera';
  simboli.forEach((d, i) => { d.classList.toggle('ora', i === info.i); d.classList.toggle('fatto', info.i >= 0 && i < info.i); });
  $('bInv').setAttribute('aria-pressed', !S.estate); $('bEst').setAttribute('aria-pressed', S.estate);
  const ic = info.modo === 'auto' ? 'pausa' : 'play'; if (ic !== icona) { icona = ic; $('bPlay').innerHTML = ICONA[ic]; $('bPlay').setAttribute('aria-label', ic === 'pausa' ? 'Pausa' : 'Avvia'); }
  $('bUhp').setAttribute('aria-pressed', S.gen !== 'ibrido'); $('bIbr').setAttribute('aria-pressed', S.gen === 'ibrido'); tags[0].textContent = Casa.viste[0].def.nome + ' ›';
  if (foglio) $('shText').textContent = Casa.descrivi(foglio.id);
  aggiornaTag();
}, (i, x, y, vis) => { const q = posTag[i]; q.x = x; q.y = y; q.vis = vis; if (i === tags.length - 1) { dispostiTag(); spot(); } });
// etichette: se due si sovrappongono, la più in alto sale e il suo gambo si allunga fino al prodotto
const posTag = tags.map(() => ({ x: 0, y: 0, vis: false }));
function dispostiTag() {
  const on = i => posTag[i].vis && tags[i].dataset.mostra === '1';
  const card = $('cCard').getBoundingClientRect();
  const ord = posTag.map((q, i) => i).filter(on).sort((a, b) => posTag[b].y - posTag[a].y), messe = [], dim = tags.map(t => [t.offsetWidth + 8, t.offsetHeight + 6]);   // prima si legge, poi si scrive
  for (const i of ord) { const q = posTag[i], [w, hh] = dim[i]; let bot = q.y;
    for (let giro = 0; giro < 6; giro++) { const c = messe.find(r => Math.abs(r.x - q.x) < (r.w + w) / 2 && bot - hh < r.bot && bot > r.bot - r.hh); if (!c) break; bot = c.bot - c.hh; }
    if (q.x + w / 2 > card.left && q.x - w / 2 < card.right && bot - hh < card.bottom + 4) bot = card.bottom + 4 + hh;
    messe.push({ x: q.x, w, bot, hh }); tags[i].style.setProperty('--gambo', Math.max(0, 14 + q.y - bot).toFixed(0) + 'px');
    const vw = stage.clientWidth, xc = clamp(q.x, w / 2 + 2, Math.max(w / 2 + 2, vw - w / 2 - 2));     // la pillola resta nello schermo, il gambo continua a puntare al prodotto
    tags[i].style.setProperty('--sx', clamp(q.x - xc, -w / 2 + 16, w / 2 - 16).toFixed(0) + 'px');
    tags[i].style.transform = `translate(${xc.toFixed(1)}px, ${bot.toFixed(1)}px) translate(-50%, -100%)`; }
  tags.forEach((t, i) => { t.style.visibility = on(i) ? 'visible' : 'hidden'; });
}
// ombra attorno al momento: lascia in luce la parte libera dello schermo, dove la camera mette il prodotto
function spot() { const s = $('cSpot'), a = AREA_C; if (!INFO || !a) return; s.style.opacity = (Casa.R.ombra * .95).toFixed(3);
  s.style.setProperty('--sx', (a.x + a.w / 2) + 'px'); s.style.setProperty('--sy', (a.y + a.h / 2) + 'px'); s.style.setProperty('--rx', (a.w * .78) + 'px'); s.style.setProperty('--ry', (a.h * .85) + 'px'); }
// barra: trascinando il cursore si va a un'ora qualsiasi; lasciandolo vicino a un momento la giornata riparte da lì
sDay.addEventListener('input', () => { const v = +sDay.value; Casa.ora(v); });   // il valore si legge prima: la giornata libera riscrive il cursore
sDay.addEventListener('change', () => { const v = +sDay.value, L = INFO ? INFO.lista : []; let j = -1; L.forEach((m, k) => { if (Math.abs(m.t - v) < .45) j = k; }); if (j >= 0) Casa.vai(j); });
$('bPlay').onclick = () => Casa.play(Casa.R.modo !== 'auto');
$('bInv').onclick = () => Casa.stagione(false); $('bEst').onclick = () => Casa.stagione(true);
$('bHome').onclick = () => apri('home');
if (Casa.ibrido) { $('cGen').hidden = false; $('bUhp').onclick = () => Casa.generatore('uhp'); $('bIbr').onclick = () => Casa.generatore('ibrido'); }
addEventListener('keydown', e => { if (nome !== 'casa' || e.target.tagName === 'INPUT') return; if (e.key === 'ArrowRight') Casa.avanti(); if (e.key === 'ArrowLeft') Casa.indietro(); if (e.key === ' ') { e.preventDefault(); $('bPlay').click(); } if (e.key === 'Escape') scheda(null); });
// parte libera dello schermo per la camera: sotto il riquadro oppure accanto, dove la casa (larga circa 9,6 m e alta 6) viene più grande
let AREA_C = null;
function areaCasa(w, h) {
  if (document.body.dataset.scena !== 'casa') return null;
  const c = $('cCard').getBoundingClientRect(), b = $('cBar').getBoundingClientRect(), top = $('logo').getBoundingClientRect().bottom + 6, giu = b.top - 8;
  const A = { x: 0, y: Math.max(top, c.bottom + 8), w }, B = { x: c.right + 8, y: top }; A.h = giu - A.y; B.w = w - B.x; B.h = giu - B.y;
  const voto = r => r.w > 60 && r.h > 60 ? Math.min(r.w / 9.6, r.h / 6) : 0;
  stage.style.setProperty('--barH', b.height + 'px');
  return voto(B) > voto(A) * 1.04 ? B : A;
}

// gesti sulla scena attiva
canvas.addEventListener('pointerdown', e => { if (!attiva) return; canvas.setPointerCapture(e.pointerId); attiva.down(e); });
canvas.addEventListener('pointermove', e => attiva && attiva.move(e));
for (const ev of ['pointerup', 'pointercancel']) canvas.addEventListener(ev, e => attiva && attiva.up(e));
canvas.addEventListener('wheel', e => { if (attiva && attiva.wheel) { e.preventDefault(); attiva.wheel(e); } }, { passive: false });

// ciclo di disegno: fermo mentre è aperto un prodotto; se la resa è lenta il rapporto pixel scende da solo
let last = 0, lenti = 0, veloci = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  if (!attiva || document.hidden) { last = 0; return; }
  const now = ts / 1000, dt = last ? clamp(now - last, 0, .05) : 0, grezzo = last ? now - last : 0; last = now;
  attiva.tick(dt, now); renderer.render(attiva.scene, attiva.camera);
  if (grezzo > .036) { if (++lenti > 45 && PR > .8) { PR = Math.max(.8, PR - .25); renderer.setPixelRatio(PR); resize(); lenti = 0; } } else if (grezzo) lenti = Math.max(0, lenti - 1);
}
// per le prove automatiche
window.__casa = { vai: apri, Home, Casa, info: () => renderer.info.render, stato: () => ({ scena: prodotto(nome) ? 'prodotto' : nome, prodotto: prodotto(nome) ? nome : null, pr: PR, home: Home.stato(), ora: Casa.S.t, estate: Casa.S.estate, pv: +Casa.S.pv.toFixed(3), bat: +Casa.S.bat.toFixed(3), rete: +Casa.S.rete.toFixed(3), soc: +Casa.S.soc.toFixed(3), sole: Casa.S.sole, doccia: Casa.S.doccia, caldo: +Casa.S.caldo.toFixed(3), ricarica: Casa.S.ricarica, carico: +Casa.S.carico.toFixed(3), fcoil: +Casa.S.fcoil.toFixed(3), mono: +Casa.S.mono.toFixed(3), dual: +Casa.S.dual.toFixed(3), gen: Casa.S.gen, caldaia: +Casa.S.caldaia.toFixed(3), persone: Casa.persone(), modo: Casa.R.modo, fase: Casa.R.fase, momento: Casa.R.modo === 'libero' ? -1 : Casa.R.i, titolo: Casa.R.m && Casa.R.m.titolo, foco: +Casa.R.foco.toFixed(3) }),
  passo(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) { last += dt; attiva && attiva.tick(dt, last); } attiva && renderer.render(attiva.scene, attiva.camera); } };
addEventListener('resize', resize); { const ro = new ResizeObserver(() => resize()); ro.observe(stage); ro.observe($('cCard')); ro.observe($('cBar')); } resize();
rotta(); document.body.classList.add('pronto'); requestAnimationFrame(frame);
