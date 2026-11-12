# visual-rendering-PDC_UHP

Animazioni interattive dei prodotti Unical, a cura di Borelli Impianti.
Sito: https://boreeeeeeeee.github.io/visual-rendering-PDC_UHP/ (GitHub Pages dal ramo `main`, cartella principale).

Oggi il sito mostra la pompa di calore UHP 120. Il progetto "Casa Unical" la porta dentro una casa con gli altri prodotti Unical; il piano a tappe sta nel progetto Claude "Animazion 3d test".

## Cosa c'è

| Percorso | Cosa contiene |
|---|---|
| `index.html` | La pagina pubblicata (versione approvata). Non si modifica a mano: si rigenera con `build.py`. |
| `anteprima/` | La tappa in corso, da provare prima dell'approvazione. Compare dalla tappa 1. |
| `src/prodotti/uhp/` | Sorgenti della UHP 120: `shell.html` (pagina e stile) e cinque file `.js` uniti in ordine alfabetico. |
| `src/dati/` | Una scheda dati per prodotto, con documento e pagina di provenienza per ogni valore. |
| `build.py` | Unisce i sorgenti nella pagina. Solo Python 3, nessuna installazione. |

## Come si rigenera la pagina

```
python3 build.py            # scrive index.html
python3 build.py --check    # verifica che index.html corrisponda ai sorgenti, senza scrivere
python3 build.py --out anteprima/index.html
```

## Regole

- I valori a schermo vengono solo dalle schede in `src/dati/`, che citano manuale e pagina. Niente numeri inventati.
- Il repository non va rinominato: cambierebbe l'indirizzo del sito.
- Three.js 0.186.1 da jsDelivr, caratteri Barlow e Barlow Condensed da Google Fonts.
