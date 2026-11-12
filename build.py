#!/usr/bin/env python3
"""Costruisce la pagina del sito a partire dai sorgenti in src/.

Uso:
  python3 build.py            scrive index.html nella radice (la versione approvata)
  python3 build.py --check    non scrive niente: verifica che index.html sia identico alla build
  python3 build.py --out anteprima/index.html   scrive altrove (per le anteprime di tappa)

Regola di unione (la stessa usata finora nell'artefatto della UHP 120):
  src/prodotti/uhp/shell.html con
    <!--FONTS-->      -> link a Barlow e Barlow Condensed
    <!--IMPORTMAP-->  -> mappa di importazione di Three.js
    /*SCRIPT*/        -> i file .js della cartella, in ordine alfabetico, uniti da un a capo
Solo libreria standard: nessuna installazione.
"""
import argparse
import hashlib
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
UHP = ROOT / "src" / "prodotti" / "uhp"

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


def build() -> str:
    shell = (UHP / "shell.html").read_text(encoding="utf-8")
    for mark in ("<!--FONTS-->", "<!--IMPORTMAP-->", "/*SCRIPT*/"):
        if shell.count(mark) != 1:
            sys.exit("shell.html: il segnaposto %s deve comparire una volta sola" % mark)
    script = "\n".join(p.read_text(encoding="utf-8") for p in sorted(UHP.glob("*.js")))
    # Sostituzioni una alla volta e senza espressioni regolari: il codice contiene "\" e "$".
    page = shell.replace("<!--FONTS-->", FONTS).replace("<!--IMPORTMAP-->", IMPORTMAP)
    head, tail = page.split("/*SCRIPT*/")
    return head + script + tail


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--out", default="index.html", help="file di destinazione, relativo alla radice")
    ap.add_argument("--check", action="store_true", help="confronta senza scrivere")
    args = ap.parse_args()

    page = build().encode("utf-8")
    out = ROOT / args.out
    digest = hashlib.sha256(page).hexdigest()[:16]
    if args.check:
        same = out.exists() and out.read_bytes() == page
        print("%s: %s (%d byte, sha256 %s)" % (args.out, "identico alla build" if same else "DIVERSO dalla build", len(page), digest))
        sys.exit(0 if same else 1)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(page)
    print("scritto %s (%d byte, sha256 %s)" % (args.out, len(page), digest))


if __name__ == "__main__":
    main()
