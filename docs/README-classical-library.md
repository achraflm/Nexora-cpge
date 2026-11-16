# Bibliothèque des problèmes classiques

Les fiches étudiantes sont affichées uniquement si leurs documents locaux annoncés
sont lisibles : énoncé et, lorsqu’il est disponible, corrigé. Le catalogue contrôle
la révision de chaque ressource et la signature PDF du fichier. Les documents
manquants restent visibles dans l’administration, mais ne comptent plus dans les
matières côté étudiant ; leur accès direct renvoie également une erreur 404.

Les bannières mathématiques sont des copies locales non modifiées de Wikimedia
Commons : [intégrale gaussienne par A1E6](https://commons.wikimedia.org/wiki/File:The_Gaussian_integral.svg)
(CC BY-SA 4.0) et [fonction gamma par Rumil](https://commons.wikimedia.org/wiki/File:Gamma_function.svg)
(CC0 1.0). Elles sont affichées sans recadrage, avec leurs crédits et licences.

## État livré le 15 novembre 2026

La bibliothèque est intégrée à l'onglet étudiant **Problèmes** et à l'onglet
administrateur **Classiques**. Cinq matières indépendantes : mathématiques,
physique, chimie, sciences industrielles, informatique. La base locale
contient 50 fiches issues du repérage initial. Deux sont publiées avec des
versions sous licence libre de Wikiversité : **Intégrale gaussienne** et
**Fonction gamma d’Euler**. Les autres fiches de ce repérage restent en brouillon.
La physique contient également **Cycle avec régénération — propulsion d’un
brise-glace**. La feuille antérieure reste retirée de la publication.

Deux autres matières disposent de problèmes corrigés : **Cinétique d’une
réaction en chaîne** (Chimie, Wikiversité, CC BY-SA 4.0) et **Le compte est
bon** (Informatique, Arnaud Bodin, Exo7, CC BY-NC-SA 4.0).

Les deux copies de Wikiversité sont mises en page en PDF sans réécriture et
conservent la version originale, l’historique et la licence CC BY-SA 4.0 dans
les crédits. Les PDF sont dans backend/content/classical/wikiversity et
l’import se lance depuis backend avec npx tsx scripts/import-classical-wikiversity.ts.
Le sismographe de Denis Defauchy a été retrouvé avec son énoncé et sa correction.
Aucune mention de redistribution n’a été relevée dans ces deux PDF.

[Audit préalable](classical-library-audit.md) ·
[Catalogue des 50 candidats](classical-candidates.md) ·
[Métadonnées et sources](classical-candidates.json).

Cinq couples de documents ont été inspectés séparément (trois exercices
d'oscillateurs et deux de chimie). Les autres corrections restent en attente.
Ce lot ne couvre pas encore tous les thèmes souhaités : voir les limites
explicites du rapport. Aucun énoncé, corrigé ou indice externe n'a été
reconstitué, réécrit ou généré. Le lot local provient du manuel d’Olivier Cleynen sous CC BY-SA 4.0 ;
les 50 pistes initiales n’ont pas été copiées sans autorisation.

Les anciens `classiques-problems.ts` et PDF dans `public/problemes` sont des
contenus indépendants de la plateforme, non authentifiés comme documents
d'enseignants. Ils ne sont pas importés dans la nouvelle bibliothèque et ne
sont plus affichés par son entrée étudiant. Ils sont conservés pour ne pas
détruire les fichiers préexistants.

## Parcours de publication

1. Ajouter une fiche ou choisir un candidat.
2. Examiner les sources et documents, leurs auteurs, les numéros et pages.
3. Vérifier l'origine hors concours, le programme, les filières, le niveau,
   les prérequis, la difficulté et la durée. Une filière non vérifiée reste
   décochée. Le niveau ne restreint jamais l'accès des étudiants.
4. Renseigner les preuves, les dates et les droits. Ne pas confondre page
   publique et autorisation de reproduction.
5. Enregistrer, puis faire progresser la validation avec un compte rendu
   à chaque étape. Le serveur impose l'ordre, les preuves et l'approbation.
6. Après vérification de l'énoncé, on peut poursuivre **sans corrigé**.
   Sinon, vérifier séparément le corrigé et choisir son statut authentique.
7. Publier. Un changement de métadonnées remet la fiche en vérification et
   retire immédiatement sa visibilité étudiant. Le rejet est conservé dans
   l'historique ; il n'efface pas les notes des étudiants.

OFFICIAL exige une attestation explicite. AUTHOR_PUBLISHED et
TEACHER_PUBLISHED exigent une attribution, un document, une date, une preuve
et la confirmation de l'original. UNVERIFIED et PENDING_VERIFICATION ne
donnent jamais accès au corrigé dans l'API étudiant. NO_CORRECTION reste un
état distinct. La classification repose sur le contrôle éditorial humain :
le logiciel ne peut certifier la vérité d'une preuve saisie par un admin.

## Documents et droits

- La publication exige désormais un **PDF local** pour l’énoncé et chaque
  corrigé authentifié. Les anciennes valeurs LINK_ONLY et EMBED restent
  disponibles pour documenter des brouillons, mais ne permettent plus de publier.
- Dans l’éditeur admin, **Importer le PDF depuis cet ordinateur** stocke le
  fichier original (20 Mo maximum). **Enregistrer la fiche** conserve son
  association et sa révision en base ; la validation doit ensuite être effectuée.
- Les étudiants lisent via `/api/classical-problems/:id/document/:kind`, sans
  dépendance au site tiers. Les liens de source ne sont plus affichés comme
  parcours de lecture. Les crédits restent dans une section repliée et dans le PDF.
- Les fichiers restent privés dans `backend/private-resources`, à sauvegarder
  **avec la base PostgreSQL**. Un compte désactivé ne peut plus les consulter.
- Document publié : **Cycle avec régénération — propulsion d’un brise-glace**,
  Olivier Cleynen, *Thermodynamique de l’ingénieur*, problème 9.3.
  Un seul énoncé en sept questions, extrait des pages 269–270. Les zones du
  problème 9.3 et de ses réponses page 271 sont recadrées à partir d’images
  originales haute résolution, sans réécriture. Aucun exercice voisin n’est visible.
  Énoncé : 2 pages, puis les tables 313, 318, 319 et les crédits/licence 4, 328
  (7 pages au total). Corrigé : réponses originales, schémas 260, 264 et
  crédits/licence (5 pages). CC BY-SA 4.0, crédits des figures conservés.
  Source : https://thermodynamique.fr/ ; licence :
  https://creativecommons.org/licenses/by-sa/4.0/deed.fr.
- Le journal du premier import indique explicitement une vérification documentaire
  assistée à la demande du propriétaire, sans prétendre à une validation pédagogique
  humaine indépendante. Aucun corrigé n’a été généré.
- Reproduction de l’import : télécharger l’original dans
  `tmp/classical-import/thermodynamique-original.pdf`, lancer
  `backend/scripts/extract-classical-local-sample.py` avec Python/pypdf/pypdfium2/reportlab, puis
  depuis backend `npx tsx scripts/import-classical-local-sample.ts` (app démarrée).
  Le script est idempotent sur le titre, conserve une fiche déjà publiée et utilise
  les comptes locaux de démonstration, ou IMPORT_ADMIN_EMAIL/IMPORT_ADMIN_PASSWORD.

## Persistance et API

Schéma `catalog`, modèles Prisma : ClassicProblem, ClassicProgress,
ClassicReview. Subject et Chapter sont réutilisés ; CHEM complète l'enum
des matières. `chapterId` permet le rattachement à un chapitre existant ;
`chapterLabel` permet de préparer une fiche avant ce rattachement. Pas de
duplication de stockage documentaire. Les provenances énoncé/corrigé sont
deux objets distincts validés, dans les métadonnées JSON.

Préfixe gateway : `/api/catalog/classical-problems`.
Proxy Next authentifié : `/api/classical-problems`.

| Route | Usage |
|---|---|
| GET / | Catalogue filtré ; seuls les publiés pour un étudiant |
| GET /:id | Fiche autorisée et progression du seul utilisateur connecté |
| POST / | Création admin, toujours brouillon |
| PATCH /:id | Modification admin avec contrôle de révision |
| POST /:id/review | Transition admin et compte rendu historisé |
| GET /:id/reviews | Historique admin |
| PUT /:id/progress | Progression, favoris, enregistrement, notes, signets étudiants |
| GET /:id/document/statement ou correction | PDF original local autorisé |

Filtres : matière, niveau, filière, chapitre, difficulté, type, recherche,
disponibilité du corrigé et travail personnel. Le premier lot est chargé
en une fois côté client ; l'API borne les résultats à 1000. Une pagination
serveur sera nécessaire au-delà de ce volume. Les états de progression
comprennent NOT_STARTED, IN_PROGRESS, STATEMENT_COMPLETED,
CORRECTION_CONSULTED, MASTERED et TO_REVIEW. Notes et signets sont privés.

Les protections existantes de la gateway continuent de refuser les comptes
désactivés. Les mutations Next contrôlent l'origine et les rôles ; le
microservice contrôle aussi les rôles et l'identité transmise par la gateway.
Les URL sont limitées à HTTPS public et ne sont jamais téléchargées côté
serveur. Le contrôle de révision empêche les écrasements concurrents.

## Installation sur une autre base

Appliquer `backend/services/catalog-course-service/prisma/classical-library.sql`
avec le rôle de migration, sur une base déjà initialisée. Cette migration
est additive : ne pas réinitialiser la base. Puis, depuis `backend` :

```text
npm run db:generate -w catalog-course-service
npx tsx services/catalog-course-service/prisma/seed-classical.ts
```

Relancer le service catalogue si nécessaire. Sous Windows, fermer son
processus avant de régénérer le moteur Prisma si le fichier DLL est verrouillé.
L'import est répétable : il ne remplace pas les fiches modifiées par un admin.
Le script `build-classical-candidates.mjs` produit uniquement les fichiers
de rapport ; il n'importe rien et ne récupère aucun document.

## Vérifications effectuées

- Types TypeScript du frontend et du service catalogue.
- Suite catalogue : 15 tests réussis, dont 8 règles de publication et de
  provenance (officiel sans preuve, corrigé non vérifié, droits, URL, etc.).
- Test d'intégration en base : rôles, ordre des validations, isolation des
  progressions, filtres combinés, révisions concurrentes, retrait,
  non-exposition des corrigés non vérifiés, PDF original byte pour byte et
  refus après remplacement du fichier.
- Chromium : publication par l'écran admin, filtres, favori, notes et
  signet persistants après rechargement, corrigé indisponible désactivé,
  accès admin interdit à l'étudiant, origine étrangère refusée, largeur
  mobile sans débordement. Captures desktop et mobile inspectées.
- Les fixtures des tests sont supprimées. Les 10 comptes préexistants ont
  été conservés ; aucun message ou contenu existant n'a été réinitialisé.

Depuis `backend` :

```text
npm run test -w catalog-course-service
npx tsx services/catalog-course-service/test/classical.integration.ts
npx tsx scripts/check-classical-browser.ts
```

Le test d'intégration exige une base locale initialisée et crée des UUID
temporaires qu'il nettoie en `finally`. Le test navigateur exige l'app sur
localhost:3000 et les comptes de démonstration existants. Il utilise
`PLAYWRIGHT_PACKAGE` et `CHROMIUM_EXECUTABLE` si Playwright n'est pas installé
dans le projet. Il ne doit pas être exécuté sur une instance de production.

Le lecteur des problèmes reprend le mode Étude des annales CNC. Il ouvre les
PDF une page à la fois avec défilement vertical dans la page. Ses
commandes de zoom, de navigation et de plein écran restent intégrées au site.

Le test navigateur check-classical-reader.ts vérifie les fiches publiées,
leurs documents locaux, l’affichage vertical sur ordinateur et mobile et
le rechargement après une interruption simulée.

Navigation étudiant : choix d’une matière, puis liste de ses problèmes, puis Lire le problème. La recherche et les filtres ont été supprimés. Icônes Phosphor distinctes : GraduationCap, Atom, Flask, Gear, TerminalWindow. Les cartes indiquent le nombre de problèmes publiés par matière.
