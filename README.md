# visual-rendering-PDC_UHP

"Casa Unical": i prodotti Unical in tre dimensioni, dentro una casa. A cura di Borelli Impianti.

- Sito approvato: https://boreeeeeeeee.github.io/visual-rendering-PDC_UHP/
- Tappa in corso: https://boreeeeeeeee.github.io/visual-rendering-PDC_UHP/anteprima/

GitHub Pages dal ramo `main`, cartella principale. Il piano a tappe sta nel progetto Claude "Animazion 3d test".

## Com'è fatto il sito

Tre scene, un solo indirizzo:

| Indirizzo | Scena |
|---|---|
| `#home` (o niente) | Home: i prodotti su un piatto girevole |
| `#casa` | Casa in sezione, con il cursore "Una giornata in casa" e lo scambio del generatore: UHP da sola oppure ibrido HYBREER 3 |
| `#uhp`, `#acs`, `#fv`, `#ibrido`, `#fcoil`, `#clima` | Pagina completa del prodotto: film di montaggio e strumenti. `uhp` = pompa di calore UHP 120, `acs` = scaldacqua a pompa di calore HP 300PSDX, `fv` = fotovoltaico con accumulo, `ibrido` = HYBREER 3, `fcoil` = ventilconvettore F-COIL AGR 400, `clima` = climatizzatori mono e dual. |

Home e Casa sono una pagina sola e usano il **livello leggero** di ogni prodotto. La pagina completa di un prodotto è un file a sé (`uhp/index.html`): si carica in un riquadro solo quando si entra nel prodotto e si scarica uscendo, così sul telefono la memoria torna libera.

## Cosa c'è

| Percorso | Cosa contiene |
|---|---|
| `index.html` | Versione approvata. Finché Bore non approva le tappe 1 e 2 è ancora la sola pagina della UHP 120. |
| `anteprima/` | La tappa in corso, generata da `build.py`. Non si modifica a mano. |
| `src/app/` | Home, Casa e passaggio tra le scene: `shell.html` (pagina e stile), `a_base.js`, `b_home.js`, `c_casa.js`, `d_app.js`, `og.jpg`. |
| `src/prodotti/<id>/` | Un prodotto: `leggero.js` (livello leggero e registrazione nel sito), `shell.html` e i file `?_*.js` della pagina completa. |
| `src/comune/logo.js` | Logo Unical vettoriale, preso dai PDF dei manuali. |
| `src/comune/prodotto.html`, `p1_base.js`, `p2_show.js`, `p3_ui.js` | Pagina comune dei prodotti sul motore della UHP: intestazione, particelle e flussi, film con aggancio e didascalie, strumenti (Tocca, Smonta, Raggi X, Giro e quelli propri del prodotto). La usano `acs`, `fv`, `fcoil`, `clima` (elenco `MOTORE_COMUNE` in `build.py`): il prodotto scrive solo i pezzi e un oggetto `CFG`, i testi della testata stanno nel suo `meta.json`. `src/comune/kit.js` non lo usa più nessuno. |
| `src/prodotti/uhp/a_core.js`, `b_engine.js` | Motore di montaggio della UHP (pezzi con nome, viti, pezzi ripetuti, raggi X). Lo riusa tale e quale la pagina dell'ibrido: l'elenco sta in `MOTORE_UHP` dentro `build.py`. |
| `src/dati/` | Una scheda dati per prodotto, con documento e pagina di provenienza per ogni valore. |
| `build.py` | Unisce i sorgenti. Solo Python 3, nessuna installazione. |
| `prove/prova.mjs` | Prova automatica con Chrome senza finestra a 390×780, 844×390 e 1280×720. In fondo controlla, pagina per pagina, che nel montaggio nessun pezzo passi attraverso pezzi già posati più di quanto già noto (`prove/compenetrazioni.js` e l'elenco dei difetti noti `prove/compenetrazioni.json`, che si accorcia man mano che i prodotti vengono corretti). |
| Tubi e cavi (pagine comuni) | `tubeGeo` e `curveOf` del motore sono sostituiti in `src/comune/tubi.js`: un tubo è la spezzata dei suoi punti con curve ad arco vere negli angoli, e nel film cresce lungo il percorso dal primo all'ultimo punto invece di arrivare in volo. Per un tubo che deve volare: `m.userData.vola = true`. Cresce così ogni geometria con `userData.tubo` e le lunghezze dei suoi tratti (le bande del condensatore dell'HP 300 si avvolgono attorno al serbatoio). I flussi seguono lo stesso percorso. |
| Ordine di montaggio | Un pezzo di un gruppo può arrivare più tardi, durante un altro gruppo, con `P(m, { at: secondi })`: nell'HP 300 la calotta, i pozzetti, l'anodo e la resistenza fanno parte del serbatoio ma arrivano dopo il serpentino, che scende nel serbatoio ancora aperto. |

## Comandi

```
python3 build.py              # rigenera anteprima/
python3 build.py --check      # verifica che anteprima/ corrisponda ai sorgenti
python3 build.py --out .      # porta il sito nella radice: SOLO dopo l'approvazione
```

Prova automatica (servono Playwright, Chrome e il pacchetto `three@0.186.1` in locale):

```
PLAYWRIGHT=/percorso/playwright/index.mjs THREE=/percorso/node_modules/three/ node prove/prova.mjs anteprima [cartella per i fotogrammi]
```

## Regole

- I valori a schermo vengono solo dalle schede in `src/dati/`, che citano manuale e pagina. Niente numeri inventati.
- I segnaposti dei prodotti non ancora fatti compaiono solo sotto `/anteprima/`.
- Il repository non va rinominato: cambierebbe l'indirizzo del sito.
- Three.js 0.186.1 da jsDelivr, caratteri Barlow e Barlow Condensed da Google Fonts.
