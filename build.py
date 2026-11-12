#!/usr/bin/env python3
"""Costruisce il sito "Casa Unical" a partire dai sorgenti in src/.

Uso:
  python3 build.py                 scrive l'anteprima in anteprima/   (la tappa in corso)
  python3 build.py --out .         scrive nella radice del sito       (SOLO dopo l'approvazione di Bore)
  python3 build.py --check         non scrive: verifica che la cartella corrisponda ai sorgenti

Cosa produce nella cartella di destinazione:
  index.html        Home e Casa: src/app/shell.html + logo + src/app/a_base.js + i livelli leggeri dei prodotti
                    (src/prodotti/<id>/leggero.js) + il resto di src/app/*.js in ordine alfabetico
  <id>/index.html   pagina completa di ogni prodotto: src/prodotti/<id>/shell.html + logo + i suoi file ?_*.js in ordine alfabetico
  og.jpg            immagine di anteprima per WhatsApp (src/app/og.jpg, un fotogramma vero della Casa)

Segnaposti nelle pagine: <!--FONTS-->, <!--IMPORTMAP-->, <!--BASE--> (indirizzo assoluto della cartella), /*SCRIPT*/.
Solo libreria standard: nessuna installazione.
"""
import argparse
import hashlib
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
SITO = "https://boreeeeeeeee.github.io/visual-rendering-PDC_UHP/"

THREE = "0.186.1"
FONTS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;800'
    '&family=Barlow+Condensed:wght@500;600;700&display=swap" rel="stylesheet">'
)
IMPORTMAP = (
    '<script type="importmap">\n'
    '{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@%s/build/three.module.js", '
    '"three/addons/": "https://cdn.jsdelivr.net/npm/three@%s/examples/jsm/" } }\n'
    "</script>" % (THREE, THREE)
)


def leggi(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8")


def pagina(shell: pathlib.Path, script: list, base: str) -> bytes:
    """Unisce una pagina. Sostituzioni una alla volta e senza espressioni regolari: il codice contiene "\\" e "$"."""
    s = leggi(shell)
    for mark in ("<!--FONTS-->", "<!--IMPORTMAP-->", "/*SCRIPT*/"):
        if s.count(mark) != 1:
            sys.exit("%s: il segnaposto %s deve comparire una volta sola" % (shell, mark))
    s = s.replace("<!--FONTS-->", FONTS).replace("<!--IMPORTMAP-->", IMPORTMAP).replace("<!--BASE-->", base)
    head, tail = s.split("/*SCRIPT*/")
    return (head + "\n".join(leggi(p) for p in script) + tail).encode("utf-8")


def sito(out_rel: str) -> dict:
    """Restituisce {percorso relativo: contenuto} di tutto il sito."""
    base = SITO + ("" if out_rel in (".", "") else out_rel.strip("/") + "/")
    logo = SRC / "comune" / "logo.js"
    app = SRC / "app"
    prodotti = sorted(p for p in (SRC / "prodotti").iterdir() if (p / "leggero.js").exists())
    resto = sorted(p for p in app.glob("*.js") if p.name != "a_base.js")
    files = {"index.html": pagina(app / "shell.html", [logo, app / "a_base.js"] + [p / "leggero.js" for p in prodotti] + resto, base)}
    for p in prodotti:
        if (p / "shell.html").exists():
            kit = [] if (p / "b_engine.js").exists() else [SRC / "comune" / "kit.js"]   # la UHP ha il suo motore
            files["%s/index.html" % p.name] = pagina(p / "shell.html", [logo] + kit + sorted(p.glob("?_*.js")), base + p.name + "/")
    if (app / "og.jpg").exists():
        files["og.jpg"] = (app / "og.jpg").read_bytes()
    return files


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--out", default="anteprima", help="cartella di destinazione relativa alla radice (predefinita: anteprima)")
    ap.add_argument("--check", action="store_true", help="confronta senza scrivere")
    args = ap.parse_args()

    out = ROOT / args.out
    diversi = 0
    for rel, data in sito(args.out).items():
        f = out / rel
        digest = hashlib.sha256(data).hexdigest()[:12]
        if args.check:
            same = f.exists() and f.read_bytes() == data
            diversi += not same
            print("%-28s %s (%d byte, %s)" % (f.relative_to(ROOT), "identico" if same else "DIVERSO", len(data), digest))
        else:
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_bytes(data)
            print("scritto %-28s (%d byte, %s)" % (f.relative_to(ROOT), len(data), digest))
    if args.check:
        sys.exit(1 if diversi else 0)


if __name__ == "__main__":
    main()
