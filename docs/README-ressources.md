# Ressources pédagogiques — MPSI/SUP et MP/SPE

## Accès

- Étudiant : petite **loupe dans la barre du haut**, qui ouvre le catalogue et ses filtres.
- Administrateur : **Administration → Cours & TD → Importer une ressource**.
- Comptes locaux : [README-authentification.md](README-authentification.md).

Les anciens cours, exercices, annales et QCM restent accessibles. Le tableau de bord conserve ses cartes de profil, révisions, objectifs, statistiques et calendrier ; ses valeurs proviennent du compte connecté.

## Fonctionnement

1. Saisir le titre, la filière, la matière et Cours/TD. L’année est déterminée par la filière.
2. Choisir le document. Le serveur vérifie son contenu et affiche le format détecté.
3. Pour LaTeX, joindre éventuellement les images, fichiers `.bib`, `.sty`, `.cls` ou `.tex` référencés. Utiliser des noms simples, sans sous-dossier, et des références relatives.
4. Enregistrer en brouillon ou publier. Le document est conservé dans un stockage privé ; les conversions se poursuivent en arrière-plan.
5. Consulter l’aperçu ou ouvrir le catalogue étudiant. Un document en préparation affiche son état ; un échec affiche une explication et peut être relancé dans l’administration.

Une modification de fichier crée une nouvelle révision et déclenche une nouvelle conversion. Les consultations suivantes réutilisent le PDF enregistré. Une modification des seules métadonnées ne recompile pas le document.

Formats : PDF, DOC/DOCX, PPT/PPTX et TEX. Limite : **20 Mo pour l’ensemble de l’import**, avec au maximum 10 fichiers complémentaires. Les documents chiffrés, corrompus, les packages absents et les fonctions dépendant d’un programme externe peuvent échouer proprement.

Le lecteur utilise le moteur PDF.js existant avec navigation entre pages, zoom, rotation, plein écran et téléchargement selon l’autorisation. Word et PowerPoint sont convertis en PDF : les animations PowerPoint et macros ne sont pas restituées. La conversion vise à préserver la mise en page ; les polices manquantes peuvent être substituées.

## Architecture retenue

L’analyse du projet a identifié :

- un service `catalog-course-service` avec les quatre codes de matière `MATH`, `PHYS`, `INFO`, `SI` ;
- un ancien catalogue externe et des démonstrations locales, sans importation persistante de documents pédagogiques ;
- une infrastructure MinIO déclarée mais sans adaptateur de stockage de fichiers utilisé par le catalogue ;
- des sessions serveur et des rôles STUDENT/ADMIN déjà vérifiés par la passerelle ;
- un lecteur PDF.js réutilisable.

La nouvelle table `catalog.educational_resources` ajoute les métadonnées pédagogiques, la publication, l’identifiant de l’importateur, les dates, le format détecté et la taille. Les clés du fichier original, des compléments et du PDF généré sont distinctes. Les champs `revision`, `sourceHash`, `conversion`, `conversionError` et `convertedAt` suivent la conversion. Aucun binaire n’est enregistré en PostgreSQL.

Les ressources référencent la table des matières existante. Une validation serveur et une contrainte PostgreSQL imposent MPSI/SUP et MP/SPE. Les autres filières des anciens modules ne sont pas ajoutées au nouveau catalogue.

Le stockage privé utilise des clés opaques sous `backend/private-resources` (ignoré par Git). `RESOURCE_STORAGE_ROOT` permet de changer ce dossier. Les clés persistées sont indépendantes des chemins absolus ; un adaptateur S3/MinIO pourra remplacer les opérations de stockage. **Le transfert vers MinIO n’est pas implémenté dans cette version.**

## Installation

Depuis `backend`, après configuration de `.env` :

```powershell
npm install
npm run infra:up
npm run db:generate -w catalog-course-service
npm run db:push -w catalog-course-service
npx dotenv -e .env -- prisma db execute --schema services/catalog-course-service/prisma/schema.prisma --file services/catalog-course-service/prisma/resource-constraints.sql
docker build -t nexora-converter:local converter
npm run dev
```

Sous Windows, arrêter temporairement le service catalogue avant `prisma generate` si sa bibliothèque Prisma est verrouillée. Dans `frontend`, lancer `npm run dev` après installation des dépendances. Le serveur de catalogue doit avoir accès au moteur Docker ; aucun socket Docker n’est monté dans les conteneurs de conversion.

## API

L’interface utilise `/api/resources` sur Next.js. Cette route conserve les jetons côté serveur et relaie vers `/api/catalog/educational-resources` dans la passerelle.

| Route relative | Usage |
|---|---|
| `GET /` | Catalogue filtrable : `track`, `subject`, `type`, `q`, `sort` |
| `GET /:id` | Métadonnées et état de préparation |
| `GET /:id/file` | PDF de lecture, sous contrôle des permissions |
| `GET /:id/file?download=1` | PDF à télécharger, si autorisé |
| `GET /:id/file?original=1` | Source originale, si autorisée |
| `POST /inspect` | Identification du fichier, administration uniquement |
| `POST /` | Import multipart : `metadata`, `file`, `companions` |
| `PATCH /:id` | Modification des métadonnées, publication/dépublication |
| `PUT /:id/file` | Remplacement du fichier et des compléments |
| `POST /:id/retry` | Relance d’une conversion échouée |
| `DELETE /:id` | Retrait du catalogue |

## Protections et exploitation

- Autorisation vérifiée côté serveur sur chaque opération, y compris le téléchargement et l’accès par identifiant. Les brouillons retournent 404 à un étudiant.
- Métadonnées validées et requêtes Prisma paramétrées. Les clés de stockage ne sont jamais acceptées depuis le navigateur ni exposées dans les réponses.
- Contrôle de l’extension, du MIME et des signatures ; inspection des conteneurs Office et du texte LaTeX. Les chemins et doublons des compléments sont refusés.
- Protection de l’origine sur les écritures utilisant les cookies. Les réponses privées ne sont pas mises en cache publiquement.
- Conversions dans un conteneur non privilégié : réseau coupé, racine en lecture seule, capacités retirées, aucun secret de l’application, entrée montée en lecture seule.
- Limites par conversion : 1 CPU, 768 Mo de mémoire, 96 processus, espace temporaire de 256 Mo, PDF final de 20 Mo et durée de 90 secondes dans le conteneur (surveillance supplémentaire de 100 secondes par le service).
- LaTeX utilise `-no-shell-escape`, `openin_any=p` et `openout_any=p`. Les PDF sont produits sur l’espace temporaire du conteneur puis transmis au serveur ; aucun dossier hôte n’est monté en écriture.
- Une conversion à la fois par instance du service. Les travaux en attente sont persistés en base ; après interruption du service, les travaux marqués en cours passent en échec et peuvent être relancés.

Pour cette première version, exécuter **une seule instance** du service de conversion/catalogue. Un déploiement distribué demanderait une file de travaux dédiée avec baux et reprise. Les anciens fichiers remplacés ou supprimés restent privés pour récupération ; une politique de purge différée reste à déployer. Sauvegarder ensemble PostgreSQL et le dossier privé. Installer les mises à jour de l’image de conversion régulièrement.

L’interdiction de téléchargement masque le bouton et refuse les routes de téléchargement ; elle ne peut pas empêcher la copie d’un document déjà rendu au navigateur. Il ne s’agit pas d’un système DRM.

## Vérification

```powershell
# backend
npm run typecheck
npm test
node scripts/check-resources.mjs
node scripts/check-resources.mjs --conversions
# frontend
npx tsc --noEmit
```

Les contrôles d’intégration nécessitent les services locaux, les comptes de démonstration et les documents de test sous `backend/.test-fixtures`. Ils créent leurs propres ressources et les retirent ensuite. Ils vérifient les permissions, les brouillons, la cohérence filière/année, les signatures, les filtres combinés, la lecture PDF, le téléchargement, la protection d’origine et, avec `--conversions`, les formats Office/LaTeX et l’erreur de compilation.
