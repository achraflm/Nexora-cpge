# Authentification et base de démonstration Nexora

Les comptes suivants sont fictifs et réservés au développement local.

| Compte | Mot de passe | Profil |
| --- | --- | --- |
| amina.demo@example.test | Nexora-Etudiant-2026! | MP Sup |
| yassine.demo@example.test | Nexora-Etudiant-2026! | MP Spé |
| salma.demo@example.test | Nexora-Etudiant-2026! | PSI Sup |
| ilyas.demo@example.test | Nexora-Etudiant-2026! | PSI Spé |
| nour.demo@example.test | Nexora-Etudiant-2026! | TSI Sup |
| adam.demo@example.test | Nexora-Etudiant-2026! | TSI Spé |
| admin.demo@example.test | Nexora-Admin-2026! | Administrateur |

## Démarrage

Depuis backend, démarrer PostgreSQL avec `docker compose up -d postgres`, puis exécuter `npm run db:generate`, `npm run db:push`, `npm run db:seed:demo` et `npm run dev`. Le fichier `.env` reprend `.env.example` avec deux secrets aléatoires distincts pour JWT_ACCESS_SECRET et INTERNAL_SECRET.

Sur une installation existante, arrêter le service d’analytique, puis lancer depuis `backend` `npm run db:generate -w analytics-streak-service` et `npm run db:push -w analytics-streak-service` avant de le redémarrer. L’historique des quatre derniers documents commence à la première consultation enregistrée après cette mise à jour.

Pour charger les chapitres publiés de Cours & TD, lancer `npm run courses:import` dans `backend` après la mise à jour du schéma. Les sources, licences et commandes de recompilation sont dans le [rapport Cours & TD](rapport-cours-td-prototype.md).

Pour activer l’édition des chapitres sur une installation existante, arrêter le service catalogue, lancer `npm run db:push -w catalog-course-service` depuis `backend`, puis redémarrer le service. Dans **Administration → Cours & TD → Chapitres**, sélectionner le niveau, la matière, le chapitre et la partie Cours ou TD. Le LaTeX est lu dans la partie choisie. Les PDF importés sont stockés dans PostgreSQL et apparaissent dans **Documents supplémentaires** après publication. L’import des cours de référence et l’édition administrative utilisent des données distinctes.

Depuis frontend, exécuter `npm run dev`. Ouvrir http://localhost:3000/login. La configuration facultative du frontend est décrite dans `.env.example`. APP_ORIGIN doit correspondre exactement à l’origine du navigateur.

Le seed crée sept comptes, quatre matières, huit chapitres, leçons, exercices et QCM, quatre ouvrages et trente jours de données d’activité fictives avec des jours de repos. Les identifiants sont stables. Les relances conservent les enregistrements existants. Les coefficients de matières sont des valeurs de test égales à un. Le seed refuse NODE_ENV=production.

Sur une base existante, appliquer le script SQL additif [account-management.sql](../backend/services/auth-user-service/prisma/account-management.sql) avant de déployer la mise à jour. Régénérer le client Prisma avec `npm run db:generate -w auth-user-service`, puis relancer la gateway et le service d’authentification ensemble. Sous Windows, arrêter le service d’authentification avant la génération s’il verrouille le moteur Prisma.

## Gestion des comptes

- Dans **Administration → Comptes**, créer, rechercher, consulter et modifier les comptes étudiants ou administrateurs. Le rôle est fixé à la création. Un administrateur peut désactiver et réactiver un compte. Au moins un administrateur doit rester actif.
- Dans **Paramètres**, les modifications de profil, de photo, de badge, d’année et de préférences sont enregistrées dans PostgreSQL. Le changement de mot de passe vérifie le mot de passe actuel et demande une nouvelle connexion.
- Dans **Paramètres → Sécurité & Mot de passe**, un étudiant peut désactiver son compte. Ses données restent liées au même identifiant. La désactivation révoque les sessions et bloque aussi les jetons d’accès déjà délivrés. Après réactivation, une nouvelle connexion est nécessaire.

## Transcription d’images en LaTeX

**Déposer mon travail** s’affiche dans un TD, un problème ou un sujet de concours ouvert. En mode concours, l’action se trouve dans la fenêtre de remise de copie. L’étudiant peut utiliser la caméra ou importer un fichier JPEG, PNG ou WebP de 15 Mo au plus. Nexora redimensionne l’image pour la transcription et conserve le fichier sélectionné lors du dépôt. L’étudiant peut corriger le LaTeX après l’enregistrement de la photo.

L’enregistrement de la photo crée une pochette personnelle au nom du TD, du problème ou du sujet dans **Mes pochettes**. Le lien **Consulter la pochette** est disponible dès l’enregistrement de la photo. La photo reste visible tant que la transcription est à vérifier. Après validation du rendu, la pochette affiche la copie mise en page avec sa source `.tex` et permet de l’imprimer ou de l’enregistrer en PDF.

Dans une fiche ouverte d’une pochette de révision, **Documents de la fiche** propose **Importer un PDF**, **Prendre une photo** et **Importer une image**. Les documents importés dans ces fiches et les fiches elles-mêmes sont enregistrés dans le navigateur utilisé. La saisie manuelle en LaTeX et son aperçu sont disponibles dans la fiche et dans les copies déposées.

Sur une installation existante, arrêter le service de remise de copies, lancer `npm run db:push -w exam-submission-service` depuis `backend`, puis relancer le service.

Pour activer la transcription automatique, retourner sa propre fonction dans `getVisionProvider()` ([vision-provider.ts](../frontend/lib/vision-provider.ts)). Elle reçoit les octets d’une image JPEG, ses dimensions et un signal d’annulation. Elle renvoie `{ latex, status }`, avec `ok` pour un résultat complet, `partial` ou `limited` lorsqu’une vérification est nécessaire et `unreadable` lorsque le document est illisible. Nexora prépare l’image à 2 560 pixels maximum sur son côté le plus long et peut relire par zones. Les identifiants éventuels du modèle restent côté serveur.

## Fonctionnement et protections

Le service auth existant conserve les mots de passe avec bcrypt, coût 12. La limite de 72 octets UTF-8 évite la troncature silencieuse de bcrypt. Zod valide les entrées et refuse un rôle injecté dans l’inscription. Prisma paramètre les accès à PostgreSQL. Le rôle d’un nouvel inscrit est toujours STUDENT.

Next.js conserve le refresh token dans un cookie HttpOnly, SameSite=Lax, Secure en production. Sa valeur est hachée SHA-256 dans la base. Les JWT circulent entre le serveur Next.js et la gateway. Les pages protégées vérifient la session en base à chaque rendu serveur. Le stockage local du navigateur ne fournit aucune autorité d’accès. La déconnexion révoque la session en base. La rotation explicite utilise une transaction et une consommation conditionnelle pour éviter deux renouvellements simultanés.

Les requêtes de connexion et d’inscription du navigateur exigent une origine exacte et du JSON, avec une limite de 8 Ko. Les opérations de modification des comptes vérifient aussi l’origine. La gateway applique ses quotas de connexion et vérifie signature HS256, issuer et audience. Les réponses d’authentification utilisent Cache-Control: no-store. Des en-têtes anti-framing, nosniff et des restrictions CSP de base sont configurés.

## Portée et limites

L’accueil charge les statistiques propres au compte depuis PostgreSQL. Un compte nouvellement créé commence avec zéro activité. Certains écrans pédagogiques restent des prototypes locaux et leurs actions ne produisent pas encore toutes des événements persistés.

La vérification d’adresse e-mail, la récupération de mot de passe et MFA restent à développer. Une déconnexion ordinaire révoque le jeton de renouvellement du navigateur. La désactivation et le changement de mot de passe révoquent aussi les jetons d’accès via la vérification du compte par la gateway. Les quotas actuels résident en mémoire et sont partagés par les appels du serveur Next.js.

Références utilisées pour la vérification des protections

- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
