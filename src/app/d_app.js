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
const tag = $('tag'); tag.textContent = Casa.generatore.nome + ' ›'; tag.onclick = () => apri(Casa.generatore.id);
Casa.su(p => apri(p.id), (S, testo) => {
  $('cHour').textContent = hh(S.t); $('cText').textContent = testo; sDay.value = S.t; sDay.style.setProperty('--f', (S.t / 24 * 100) + '%');
  $('bInv').setAttribute('aria-pressed', !S.estate); $('bEst').setAttribute('aria-pressed', S.estate); $('bPlay').setAttribute('aria-pressed', S.play); $('bPlay').textContent = S.play ? 'Pausa' : 'Avvia';
  $('cStato').textContent = S.carico < .03 ? 'A riposo' : (S.estate ? 'Raffresca' : 'Riscalda'); $('cStato').dataset.m = S.carico < .03 ? 'off' : (S.estate ? 'f' : 'c');
}, (x, y, vis) => { tag.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`; tag.style.visibility = vis ? 'visible' : 'hidden'; });
sDay.addEventListener('input', () => { const v = +sDay.value; Casa.play(false); Casa.ora(v); });   // il valore si legge prima: fermare la giornata riscrive il cursore
$('bPlay').onclick = () => Casa.play(!Casa.S.play); $('bInv').onclick = () => Casa.stagione(false); $('bEst').onclick = () => Casa.stagione(true);
$('bHome').onclick = () => apri('home');

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
window.__casa = { vai: apri, Home, Casa, info: () => renderer.info.render, stato: () => ({ scena: prodotto(nome) ? 'prodotto' : nome, prodotto: prodotto(nome) ? nome : null, pr: PR, home: Home.stato(), ora: Casa.S.t, estate: Casa.S.estate, carico: +Casa.S.carico.toFixed(3) }),
  passo(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) { last += dt; attiva && attiva.tick(dt, last); } attiva && renderer.render(attiva.scene, attiva.camera); } };
rotta(); document.body.classList.add('pronto'); requestAnimationFrame(frame);
