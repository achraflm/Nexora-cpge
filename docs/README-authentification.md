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

Le seed crée sept comptes, quatre matières, huit chapitres, leçons, exercices et QCM, quatre ouvrages, six tickets et trente jours de données d'activité fictives avec des jours de repos. Les identifiants sont stables. Les relances conservent les enregistrements existants. Les coefficients de matières sont des valeurs de test égales à un. Le seed refuse NODE_ENV=production.

## Fonctionnement et protections

Le service auth existant conserve les mots de passe avec bcrypt, coût 12. La limite de 72 octets UTF-8 évite la troncature silencieuse de bcrypt. Zod valide les entrées et refuse un rôle injecté dans l’inscription. Prisma paramètre les accès à PostgreSQL. Le rôle d’un nouvel inscrit est toujours STUDENT.

Next.js conserve le refresh token dans un cookie HttpOnly, SameSite=Lax, Secure en production. Sa valeur est hachée SHA-256 dans la base. Les JWT circulent entre le serveur Next.js et la gateway. Les pages protégées vérifient la session en base à chaque rendu serveur. Le stockage local du navigateur ne fournit aucune autorité d’accès. La déconnexion révoque la session en base. La rotation explicite utilise une transaction et une consommation conditionnelle pour éviter deux renouvellements simultanés.

Les POST navigateur exigent une origine exacte et du JSON, avec une limite de 8 Ko. La gateway applique ses quotas de connexion et vérifie signature HS256, issuer et audience. Les réponses d’authentification utilisent Cache-Control: no-store. Des en-têtes anti-framing, nosniff et des restrictions CSP de base sont configurés.

## Portée et limites

L’accueil charge les statistiques propres au compte depuis PostgreSQL. Un compte nouvellement créé commence avec zéro activité. Les autres écrans pédagogiques restent des prototypes locaux et leurs actions ne produisent pas encore toutes des événements persistés. Le back-office est protégé par un rôle serveur, mais ses écrans métier restent des démonstrations.

La connexion Google et la fausse réinitialisation du mot de passe ont été retirées. La vérification d’adresse e-mail, la récupération de mot de passe et MFA restent à développer. Les JWT déjà délivrés à un client direct restent valides jusqu’à leur expiration, même après révocation du refresh. Les quotas actuels résident en mémoire et sont partagés par les appels du serveur Next.js. Une production multi-instance nécessite un stockage partagé, HTTPS, une politique CSP plus stricte et une revue de sécurité complète. Aucune garantie d’absence de toute faille n’est avancée.

Références utilisées pour la vérification des protections

- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
