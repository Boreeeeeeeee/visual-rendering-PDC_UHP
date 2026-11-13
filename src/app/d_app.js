// ───────── il sito: tre scene (Home, Casa, Prodotto), indirizzi con il cancelletto, ciclo di disegno ─────────
// #home (o niente) = cerchio dei prodotti · #casa = la casa · #<id prodotto> = pagina completa del prodotto, caricata solo quando serve.
$('logo').innerHTML = unicalLogoSvg();
const SCENE = { home: Home, casa: Casa };
let attiva = null, nome = '', ultima = 'home', inCorso = false;
const velo = $('veil'), prod = $('prod');
const attendi = ms => new Promise(r => setTimeout(r, ms));
const prodotto = id => PRODOTTI.find(p => p.id === id && p.pagina);

function resize() { const w = Math.max(2, stage.clientWidth), h = Math.max(2, stage.clientHeight); renderer.setSize(w, h, false); Home.resize(w, h); Casa.resize(w, h); }
addEventListener('resize', resize); new ResizeObserver(resize).observe(stage); resize();

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
    attiva = SCENE[dest]; ultima = dest; attiva.entra(); last = 0; document.title = dest === 'casa' ? 'La casa · Casa Unical' : 'Casa Unical';
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

// Casa
const sDay = $('sDay'), hh = t => { const m = Math.round(t * 60) % 1440; return String(m / 60 | 0).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const tags = Casa.viste.map(v => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tag'; b.textContent = v.def.nome + ' ›'; b.onclick = () => apri(v.def.id); $('tags').appendChild(b); return b; });
Casa.su(p => apri(p.id), (S, testo) => {
  $('cHour').textContent = hh(S.t); $('cText').textContent = testo; sDay.value = S.t; sDay.style.setProperty('--f', (S.t / 24 * 100) + '%');
  $('bInv').setAttribute('aria-pressed', !S.estate); $('bEst').setAttribute('aria-pressed', S.estate); $('bPlay').setAttribute('aria-pressed', S.play); $('bPlay').textContent = S.play ? 'Pausa' : 'Avvia';
  $('bUhp').setAttribute('aria-pressed', S.gen !== 'ibrido'); $('bIbr').setAttribute('aria-pressed', S.gen === 'ibrido'); tags[0].textContent = Casa.viste[0].def.nome + ' ›';
  const k = $('cCal'); k.hidden = !(S.gen === 'ibrido' && S.caldaia > .5); k.textContent = 'Caldaia accesa'; k.dataset.m = 'on';
  $('cStato').textContent = S.carico < .03 ? 'A riposo' : (S.estate ? 'Raffresca' : 'Riscalda'); $('cStato').dataset.m = S.carico < .03 ? 'off' : (S.estate ? 'f' : 'c');
  const f = $('cFv'); f.hidden = !S.fv; f.textContent = S.pv > .05 ? (S.bat > .01 ? 'Sole: alimenta la casa e carica la batteria' : S.rete > .02 ? 'Sole: batteria piena, il resto va in rete' : S.rete < -.02 ? 'Poco sole: la rete aiuta' : 'Sole: alimenta la casa') : (S.bat < -.01 ? 'Buio: la batteria alimenta la casa' : 'Buio: la casa prende dalla rete'); f.dataset.m = S.pv > .05 ? 's' : 'off';
  const cl = $('cCli'); cl.hidden = !(S.dual > .5 || S.mono > .5); cl.textContent = 'Climatizzatori accesi';     // dove, lo dice il testo della fase: sul telefono il riquadro non deve crescere
  const a = $('cAcs'); a.textContent = S.doccia ? 'Doccia: esce acqua calda' : S.sole ? 'Acqua calda: il sole la porta a 65 °C' : S.ricarica ? 'Acqua calda: si ricarica' : 'Acqua calda: pronta'; a.dataset.m = S.doccia ? 'c' : S.ricarica ? 'r' : 'off';
}, (i, x, y, vis) => { const q = posTag[i]; q.x = x; q.y = y; q.vis = vis; if (i === tags.length - 1) dispostiTag(); });
// etichette: se due si sovrappongono, la più in alto sale e il suo gambo si allunga fino al prodotto
const posTag = tags.map(() => ({ x: 0, y: 0, vis: false }));
function dispostiTag() {
  const ord = posTag.map((q, i) => i).filter(i => posTag[i].vis).sort((a, b) => posTag[b].y - posTag[a].y), messe = [], dim = tags.map(t => [t.offsetWidth + 8, t.offsetHeight + 6]);   // prima si legge, poi si scrive
  for (const i of ord) { const q = posTag[i], [w, hh] = dim[i]; let bot = q.y;
    for (let giro = 0; giro < 6; giro++) { const c = messe.find(r => Math.abs(r.x - q.x) < (r.w + w) / 2 && bot - hh < r.bot && bot > r.bot - r.hh); if (!c) break; bot = c.bot - c.hh; }
    messe.push({ x: q.x, w, bot, hh }); tags[i].style.setProperty('--gambo', (14 + q.y - bot).toFixed(0) + 'px');
    const vw = stage.clientWidth, xc = clamp(q.x, w / 2 + 2, Math.max(w / 2 + 2, vw - w / 2 - 2));     // la pillola resta nello schermo, il gambo continua a puntare al prodotto
    tags[i].style.setProperty('--sx', clamp(q.x - xc, -w / 2 + 16, w / 2 - 16).toFixed(0) + 'px');
    tags[i].style.transform = `translate(${xc.toFixed(1)}px, ${bot.toFixed(1)}px) translate(-50%, -100%)`; }
  tags.forEach((t, i) => { t.style.visibility = posTag[i].vis ? 'visible' : 'hidden'; });
}

sDay.addEventListener('input', () => { const v = +sDay.value; Casa.play(false); Casa.ora(v); });   // il valore si legge prima: fermare la giornata riscrive il cursore
$('bPlay').onclick = () => Casa.play(!Casa.S.play); $('bInv').onclick = () => Casa.stagione(false); $('bEst').onclick = () => Casa.stagione(true);
$('bHome').onclick = () => apri('home');
if (Casa.ibrido) { $('cGen').hidden = false; $('bUhp').onclick = () => Casa.generatore('uhp'); $('bIbr').onclick = () => Casa.generatore('ibrido'); }

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
  const now = ts / 1000, dt = last ? Math.min(.05, now - last) : 0, grezzo = last ? now - last : 0; last = now;
  attiva.tick(dt, now); renderer.render(attiva.scene, attiva.camera);
  if (grezzo > .036) { if (++lenti > 45 && PR > .8) { PR = Math.max(.8, PR - .25); renderer.setPixelRatio(PR); resize(); lenti = 0; } } else if (grezzo) lenti = Math.max(0, lenti - 1);
}
// per le prove automatiche
window.__casa = { vai: apri, Home, Casa, info: () => renderer.info.render, stato: () => ({ scena: prodotto(nome) ? 'prodotto' : nome, prodotto: prodotto(nome) ? nome : null, pr: PR, home: Home.stato(), ora: Casa.S.t, estate: Casa.S.estate, pv: +Casa.S.pv.toFixed(3), bat: +Casa.S.bat.toFixed(3), rete: +Casa.S.rete.toFixed(3), soc: +Casa.S.soc.toFixed(3), sole: Casa.S.sole, doccia: Casa.S.doccia, caldo: +Casa.S.caldo.toFixed(3), ricarica: Casa.S.ricarica, carico: +Casa.S.carico.toFixed(3), fcoil: +Casa.S.fcoil.toFixed(3), mono: +Casa.S.mono.toFixed(3), dual: +Casa.S.dual.toFixed(3), gen: Casa.S.gen, caldaia: +Casa.S.caldaia.toFixed(3) }),
  passo(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) { last += dt; attiva && attiva.tick(dt, last); } attiva && renderer.render(attiva.scene, attiva.camera); } };
rotta(); document.body.classList.add('pronto'); requestAnimationFrame(frame);
