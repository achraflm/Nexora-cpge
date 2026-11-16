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

Depuis frontend, exécuter `npm run dev`. Ouvrir http://localhost:3000/login. La configuration facultative du frontend est décrite dans `.env.example`. APP_ORIGIN doit correspondre exactement à l’origine du navigateur.

Le seed crée sept comptes, quatre matières, huit chapitres, leçons, exercices et QCM, quatre ouvrages et trente jours de données d’activité fictives avec des jours de repos. Les identifiants sont stables. Les relances conservent les enregistrements existants. Les coefficients de matières sont des valeurs de test égales à un. Le seed refuse NODE_ENV=production.

Sur une base existante, appliquer le script SQL additif [account-management.sql](../backend/services/auth-user-service/prisma/account-management.sql) avant de déployer la mise à jour. Régénérer le client Prisma avec `npm run db:generate -w auth-user-service`, puis relancer la gateway et le service d’authentification ensemble. Sous Windows, arrêter le service d’authentification avant la génération s’il verrouille le moteur Prisma.

## Gestion des comptes

- Dans **Administration → Comptes**, créer, rechercher, consulter et modifier les comptes étudiants ou administrateurs. Le rôle est fixé à la création. Un administrateur peut désactiver et réactiver un compte. Au moins un administrateur doit rester actif.
- Dans **Paramètres**, les modifications de profil, de photo, de badge, d’année et de préférences sont enregistrées dans PostgreSQL. Le changement de mot de passe vérifie le mot de passe actuel et demande une nouvelle connexion.
- Dans **Paramètres → Sécurité & Mot de passe**, un étudiant peut désactiver son compte. Ses données restent liées au même identifiant. La désactivation révoque les sessions et bloque aussi les jetons d’accès déjà délivrés. Après réactivation, une nouvelle connexion est nécessaire.

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
