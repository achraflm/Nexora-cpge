# Documentation technique et pédagogique Nexora

Rapport modulaire français en huit chapitres. Point d’entrée : `main.tex`. Extraits réels et schémas dans `extraits/`, manifeste de chemins/lignes/empreintes dans `verification/extraits.json`.

Compilation depuis ce dossier :

```sh
pdflatex -interaction=nonstopmode -halt-on-error main.tex
bibtex main
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
```

Paquets : TeX Live latex-extra, fonts-recommended et TikZ, ou équivalents MiKTeX. Pas de shell escape. Sortie : `main.pdf`.

Le rapport distingue les parcours reliés des interfaces locales et routes 501. Les raisons proposées sont une analyse des compromis, pas un historique inventé. Les références officielles en ligne peuvent traiter des versions plus récentes.

Actualiser : `python documentation/generate_report.py` depuis la racine, puis recompiler. Le générateur ne modifie pas l’application.
