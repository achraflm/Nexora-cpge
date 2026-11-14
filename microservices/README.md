# Fondation microservices CNC

## Analyse et choix de coexistence

Le frontend Next.js et le backend Express/Prisma existants restent dans leurs dossiers.
Cette fondation NestJS est autonome dans microservices, avec son propre verrou npm,
ses ports, ses bases et ses volumes. Le frontend utilise encore le backend existant.
Une migration explicite domaine par domaine pourra suivre la validation de cette architecture.

## Domaines

| Service | Port | Responsabilité future |
| --- | --- | --- |
| gateway | 5100 | Entrée REST du frontend, routage et politiques transversales |
| identity | 5101 | Comptes, profils, rôles et authentification |
| academic-content | 5102 | Matières, chapitres, cours, exercices, annales et ressources |
| communication | 5103 | Tickets, messages, errata et notifications |
| student-analytics | 5104 | Activité, streak, progression et dashboard |
| document-processing | 5105 | Documents, orchestration du futur worker Python |
| adaptive-qcm | 5106 | Questions, sessions et adaptation future |

Les six services ne comportent aucun traitement métier. Chaque dossier contient src,
modules, config, common, infrastructure, prisma et test. Les dossiers vides sont des
emplacements réservés. Le paquet runtime partage uniquement le démarrage, la validation
technique de configuration et une enveloppe d'événement.

## Communication et propriété des données

Les clients passeront par la gateway. Seules les routes /health et /health/:service
de la gateway sont disponibles à cette étape. Le routage des health checks utilise une
liste fixe de destinations et un délai maximal de trois secondes.

Chaque service dispose de sa propre base PostgreSQL et de son rôle. Le script initial
retire CONNECT au rôle PUBLIC. Aucun service ne doit accéder aux tables d'un autre.
Prisma 7.10.1 est préparé avec un schéma vide par service. La génération du client et les
migrations commenceront après l'ajout du premier modèle métier.

Redis est prévu pour le cache d'analytics. RabbitMQ transportera des événements versionnés,
avec identifiant et correlationId. Les futures implémentations devront définir les files,
accusés de réception et règles d'idempotence selon leurs besoins. MinIO stockera les
documents, avec métadonnées et droits appartenant au service propriétaire.
Les connexions sont configurées par variables d'environnement. Aucun client, consommateur,
bucket ou traitement fictif n'est créé.

Document Processing pourra appeler un worker Python par HTTP ou publier des travaux
RabbitMQ. Son contrat de configuration est dans infrastructure/vision-port.ts.
Le worker et les modèles seront ajoutés lors du développement du domaine.

## Démarrer

Prérequis Node.js 22.12+ et Docker Compose.

Depuis microservices, copier .env.example vers .env si nécessaire puis exécuter

```sh
npm ci
npm run typecheck
npm run build
npm run up
npm run check
docker compose ps
```

Chaque service peut aussi être compilé avec npm run build -w @cnc/identity puis lancé
depuis son dossier avec npm start, après copie de son .env.example vers .env.
Compiler runtime en premier avec npm run build -w @cnc/runtime.
Le script dev lance TypeScript en surveillance. Relancer npm start après recompilation.

Les ports d'infrastructure sont 5544 (PostgreSQL), 6389 (Redis), 5682 et 15682
(RabbitMQ et console), 9100 et 9101 (MinIO et console). Ils sont liés à localhost.
Les secrets fournis sont exclusivement des valeurs locales de développement.
Les rôles PostgreSQL utilisent local_dev_only dans le script initial. Pour changer ces
valeurs sur une installation existante, modifier les rôles et les URL correspondantes.
Le script initial ne s'exécute que sur un volume vierge.

```sh
npm run down
```

Cette commande conserve les données. Les volumes appartiennent au projet cnc-foundation.
Un health check de service confirme que son serveur HTTP répond. Les health checks
Docker de l'infrastructure contrôlent séparément PostgreSQL, Redis, RabbitMQ et MinIO.

## Sources

## État des vérifications locales

Compilation des sept applications réussie. Le contrôle scripts/check.mjs et le relais
/health/identity de la gateway répondent correctement. PostgreSQL et Redis sont démarrés,
les six bases sont présentes et Redis répond PONG. L'installation npm ne signale aucune
vulnérabilité après mise à jour de Prisma et Zod.

Le démarrage Compose complet reste à vérifier. Le téléchargement MinIO a été refusé
par Docker Hub puis par quay.io (401). RabbitMQ a été interrompu dans le même lancement.
Les sept serveurs ont été vérifiés directement avec Node et leurs fichiers .env.example.
Ces résultats ne valident donc pas encore la connectivité RabbitMQ/MinIO ni les images
applicatives Docker. Relancer npm run up une fois l'accès au registre rétabli.

## Références

- https://docs.nestjs.com/v11/first-steps
- https://www.prisma.io/docs/orm/v6/prisma-schema/overview/data-sources
