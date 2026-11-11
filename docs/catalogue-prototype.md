# Cours PDF dans les chapitres Nexora

La bibliothèque complémentaire a été retirée. Les références figurent désormais directement dans la grille des chapitres, avec leurs boutons Cours et TD.

## État réel de l’import

La sélection contient 19 références (6 maths, 6 physique/chimie, 6 informatique, 1 SI), regroupées en 15 cartes de cours. Quatre TD sont associés aux cours correspondants. Les chapitres Nexora existants sont conservés.

- Le recueil SI Spé scanné a été retiré à la demande de l’utilisateur, ainsi que sa carte et son fichier. Il ne fait plus partie de la sélection de l’importeur.
- Critère de sélection : documents professionnels, composés numériquement et lisibles ; exclure les scans de notes manuscrites.
- Aucun PDF importé n’est actuellement disponible. Les 19 documents restants renvoient HTTP 403. Aucun contournement n’a été tenté.
- Les cartes concernées indiquent PDF indisponible et désactivent les boutons.
- L’attribution eLearning.CPGE reste visible ; les cartes ne redirigent plus vers ses pages.

Le lecteur réutilise PDF.js : navigation page par page, rotation et téléchargement du fichier local. Il est conservé pour les futurs documents validés.

## Catalogue et import

`frontend/lib/catalog-sample.json` contient les métadonnées et la disponibilité des fichiers. `frontend/lib/pdf-course-chapters.ts` associe cours et TD.

Depuis `frontend`, l’importeur optionnel se lance avec :

```powershell
python scripts/import-course-pdfs.py
```

Il conserve les PDF déjà présents, suit uniquement les liens publiés et n’enregistre que les réponses portant la signature PDF. Il enregistre les refus d’accès dans le catalogue. Il ne télécharge pas le catalogue complet. Pour compléter les documents refusés, fournir les fichiers ou des liens de téléchargement accessibles.

## Backend

Le modèle ExternalResource contient aussi localPdfUrl, pdfSourceUrl et downloadStatus. Les documents restent distincts des leçons natives rédigées en LaTeX. L’interface de maquette utilise le JSON.

Lorsque PostgreSQL sera disponible, depuis `backend` :

```powershell
npm run db:generate --workspace=catalog-course-service
npm run db:push --workspace=catalog-course-service
npm run db:seed --workspace=catalog-course-service
```

La route reste `GET /api/catalog/resources?subject=SI&level=SPE&type=COURSE`, derrière l’authentification habituelle. L’import utilise un upsert par URL. La base locale sur le port 5434 n’a pas été alimentée.

## Vérification

Les vérifications TypeScript et les quatre tests du service couvrent la sélection, les filtres, l’import répété en mémoire et la présence physique des PDF déclarés disponibles. Aucun nouveau paquet logiciel n’a été installé.
