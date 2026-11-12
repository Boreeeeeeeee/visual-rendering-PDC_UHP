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
| `#casa` | Casa in sezione, con il cursore "Una giornata in casa" |
| `#uhp`, `#acs`, `#fv` (e gli altri prodotti quando ci saranno) | Pagina completa del prodotto: film di montaggio e strumenti. `uhp` = pompa di calore UHP 120, `acs` = scaldacqua a pompa di calore HP 300PSDX, `fv` = moduli MULTIVOLT, inverter ZOE1 e batteria SUM BL |

Home e Casa sono una pagina sola e usano il **livello leggero** di ogni prodotto. La pagina completa di un prodotto è un file a sé (`uhp/index.html`): si carica in un riquadro solo quando si entra nel prodotto e si scarica uscendo, così sul telefono la memoria torna libera.

## Cosa c'è

| Percorso | Cosa contiene |
|---|---|
| `index.html` | Versione approvata. Finché Bore non approva le tappe 1 e 2 è ancora la sola pagina della UHP 120. |
| `anteprima/` | La tappa in corso, generata da `build.py`. Non si modifica a mano. |
| `src/app/` | Home, Casa e passaggio tra le scene: `shell.html` (pagina e stile), `a_base.js`, `b_home.js`, `c_casa.js`, `d_app.js`, `og.jpg`. |
| `src/prodotti/<id>/` | Un prodotto: `leggero.js` (livello leggero e registrazione nel sito), `shell.html` e i file `?_*.js` della pagina completa. |
| `src/comune/logo.js` | Logo Unical vettoriale, preso dai PDF dei manuali. |
| `src/comune/kit.js` | Base comune alle pagine complete dei prodotti (tranne la UHP, che ha il suo motore): resa, scena, materiali, motore del montaggio. |
| `src/dati/` | Una scheda dati per prodotto, con documento e pagina di provenienza per ogni valore. |
| `build.py` | Unisce i sorgenti. Solo Python 3, nessuna installazione. |
| `prove/prova.mjs` | Prova automatica con Chrome senza finestra a 390×780, 844×390 e 1280×720. |

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
