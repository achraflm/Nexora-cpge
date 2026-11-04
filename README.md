# Nexora — Plateforme d'Excellence CPGE & Ingénierie

> Plateforme CNC — Projets 28 & 15

**Nexora** est une plateforme d'apprentissage destinée aux étudiants des **Classes Préparatoires aux Grandes Écoles (CPGE)** au Maroc, qui préparent le **Concours National Commun (CNC)** ainsi que les concours français (CCINP, Centrale-Supélec, Mines-Ponts).

Elle couvre les filières **MP**, **PSI** et **TSI** (1re année *Sup* et 2e année *Spé*) et les matières **Mathématiques**, **Physique-Chimie**, **Sciences de l'Ingénieur** et **Informatique**.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Structure du dépôt](#structure-du-dépôt)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Variables d'environnement](#variables-denvironnement)
- [API](#api)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Scripts utiles](#scripts-utiles)
- [État d'avancement](#état-davancement)
- [Documentation](#documentation)

---

## Fonctionnalités

| Module | Description |
| --- | --- |
| **Tableau de bord** | Vue d'ensemble de la progression, streak quotidien, heatmap d'activité, badges de réussite. |
| **Cours & Exercices (Double Mode)** | Chaque chapitre est disponible en mode **PDF** ou en mode interactif façon *Bibm@th* (indices progressifs, corrigés, formules KaTeX). |
| **Annales** | Plus de 550 sujets et corrigés : CNC (2010 – 2026), CCINP, Centrale, Mines, avec un lecteur PDF intégré (pdf.js). |
| **Problèmes / Examens blancs** | Épreuves chronométrées et portefeuille « Mes problèmes rédigés ». |
| **QCM adaptatif** *(Projet 15)* | QCM dont la difficulté s'adapte au niveau de l'élève, avec répétition espacée (flash cards) et suivi de maîtrise. |
| **Pochettes / Fiches** | Espace de travail personnel pour organiser ses documents et fiches de révision. |
| **Contact & Errata** | Système de tickets entre étudiants et administrateurs, notifications. |
| **Back-office admin** | Gestion des cours, exercices, annales, QCM, tickets et utilisateurs. |

---

## Architecture

Le projet est séparé en **deux applications indépendantes** (chacune avec son `package.json` et ses `node_modules`) :

```
                    ┌──────────────────────────┐
                    │  Frontend (Next.js 16)   │  :3000
                    └────────────┬─────────────┘
                                 │  HTTP /api/*
                    ┌────────────▼─────────────┐
                    │       API Gateway        │  :4000
                    │ CORS · rate-limit · JWT  │
                    └────────────┬─────────────┘
     ┌──────────────┬────────────┼─────────────┬──────────────┬──────────────┐
     ▼              ▼            ▼             ▼              ▼              ▼
 auth-user     catalog-course  exam-submission analytics-   admin-contact  adaptive-qcm
  :4001          :4002          :4003          streak :4004   :4005          :4006
     └──────────────┴────────────┴──────┬──────┴──────────────┴──────────────┘
                                        ▼
                 PostgreSQL 16 (un schéma par service) · Redis · MinIO
```

- La **gateway** retire le préfixe `/api`, vérifie le JWT, puis transmet la requête au bon service en injectant les en-têtes `x-user-id`, `x-user-role` et `x-internal-secret`.
- Chaque **microservice** possède son propre schéma Prisma et son propre schéma PostgreSQL (`auth`, `catalog`, `exam`, `analytics`, `contact`, `qcm`).
- `packages/common` contient le code partagé : chargement de l'environnement, gestion des erreurs, contexte d'authentification, fabrique d'application Express.

> **Note :** le frontend est actuellement un prototype autonome (authentification simulée via `localStorage`, données dans `frontend/lib/`). Il n'est pas encore branché sur le backend.

---

## Stack technique

**Frontend**

- [Next.js 16](https://nextjs.org/) (App Router) · React 19 · TypeScript 5.7
- Tailwind CSS 4 · shadcn/ui · Radix / Base UI · Framer Motion
- KaTeX (rendu mathématique) · pdf.js (lecteur PDF) · lucide-react / Phosphor icons

**Backend**

- Node.js (≥ 20.12, testé avec Node 24) · TypeScript 5.9 · Express 5 · `tsx` (exécution directe, sans build)
- Prisma 6 · PostgreSQL 16 · Redis 7 · MinIO (stockage objet)
- JWT (`jsonwebtoken`) · bcrypt · zod · `http-proxy-middleware` · `express-rate-limit`
- Tests avec le runner natif de Node (`tsx --test`)
- Infrastructure locale via Docker Compose

---

## Structure du dépôt

```
.
├── frontend/                      Application Next.js (interface étudiant + back-office)
│   ├── app/                       Pages : /, /login, /signup, /admin, /parametres, /pochettes
│   ├── components/                Composants UI (Double Mode, AdminBackOffice, lecteur PDF, …)
│   ├── lib/                       Auth simulée, bases de données des annales et problèmes
│   ├── public/                    Annales PDF, logos, assets pdf.js
│   └── scripts/                   Téléchargement des annales, copie des assets pdf.js
│
├── backend/                       Microservices Node.js (npm workspaces)
│   ├── compose.yaml               PostgreSQL, Redis, MinIO
│   ├── .env.example               Modèle de configuration
│   ├── gateway/                   API Gateway                                      :4000
│   ├── packages/common/           Code partagé
│   └── services/
│       ├── auth-user-service/         Sprint 1 — inscription, login, refresh, profil   :4001
│       ├── catalog-course-service/    Sprint 2 — matières, chapitres, leçons, livres   :4002
│       ├── exam-submission-service/   Sprint 3 — examens, sessions, copies             :4003
│       ├── analytics-streak-service/  Sprint 4 — activité, streak, statistiques        :4004
│       ├── admin-contact-service/     Sprint 4 — tickets, notifications                :4005
│       └── adaptive-qcm-service/      Sprint 5 — QCM adaptatif, flash cards            :4006
│
└── docs/
    ├── cdc.pdf                    Cahier des charges
    ├── audit-ui-cdc.md            Audit de l'interface vis-à-vis du CDC
    ├── test-accounts.md           Comptes de démonstration
    └── rapport/                   Rapport LaTeX (sources + PDF)
```

---

## Prérequis

- **Node.js 20.12+** (recommandé : 22 ou 24) et **npm**
- **Docker** + Docker Compose (pour PostgreSQL, Redis et MinIO)
- Git

---

## Démarrage rapide

```bash
git clone https://github.com/achraflm/Nexora-cpge.git
cd Nexora-cpge
```

### Frontend

```bash
cd frontend
npm install        # copie aussi les assets pdf.js dans public/pdfjs (postinstall)
npm run dev        # http://localhost:3000
```

Build de production :

```bash
npm run build
npm start
```

### Backend

```bash
cd backend
cp .env.example .env          # puis renseigner JWT_ACCESS_SECRET et INTERNAL_SECRET
npm install
npm run infra:up              # PostgreSQL (port 5434), Redis (6379), MinIO (9000/9001) via Docker
npm run db:generate           # génère les clients Prisma
npm run db:push               # crée les schémas auth, catalog, exam, analytics, contact, qcm
npm run db:seed               # crée les comptes de démonstration
npm run dev                   # lance la gateway + les 6 services
```

Vérifier que tout fonctionne :

```bash
curl http://localhost:4000/api/health
```

Générer des secrets aléatoires (exemple) :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Arrêter l'infrastructure : `npm run infra:down`.

---

## Variables d'environnement

Toutes les variables sont lues depuis `backend/.env` (voir `backend/.env.example`). Ce fichier **ne doit jamais être commité**.

| Variable | Rôle |
| --- | --- |
| `AUTH_DATABASE_URL`, `CATALOG_DATABASE_URL`, `EXAM_DATABASE_URL`, `ANALYTICS_DATABASE_URL`, `CONTACT_DATABASE_URL`, `QCM_DATABASE_URL` | Chaînes de connexion PostgreSQL (un schéma par service) |
| `REDIS_URL` | Connexion Redis |
| `JWT_ACCESS_SECRET` | **Obligatoire** — secret de signature des access tokens |
| `INTERNAL_SECRET` | **Obligatoire** — secret partagé gateway ↔ services |
| `ACCESS_TOKEN_TTL` | Durée de vie de l'access token |
| `REFRESH_TOKEN_TTL_DAYS` | Durée de vie du refresh token (jours) |
| `CORS_ORIGIN` | Origine autorisée (ex. `http://localhost:3000`) |
| `GATEWAY_PORT`, `AUTH_PORT`, `CATALOG_PORT`, `EXAM_PORT`, `ANALYTICS_PORT`, `CONTACT_PORT`, `QCM_PORT` | Ports d'écoute |
| `AUTH_URL`, `CATALOG_URL`, `EXAM_URL`, `ANALYTICS_URL`, `CONTACT_URL`, `QCM_URL` | *(optionnel)* URL des services utilisées par la gateway |

Le frontend ne nécessite aucune variable d'environnement pour le moment.

---

## API

Toutes les routes passent par la gateway : `http://localhost:4000/api/...`

- **Routes publiques :** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/health`
- **Toutes les autres routes** nécessitent un en-tête `Authorization: Bearer <access_token>`.
- **Rate limiting :** 600 requêtes / 15 min (global), 20 requêtes / 15 min sur login et register.

### Auth & utilisateurs — `auth-user-service` ✅

| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Inscription d'un étudiant |
| `POST` | `/api/auth/login` | Connexion (access + refresh token) |
| `POST` | `/api/auth/refresh` | Renouvellement de l'access token |
| `POST` | `/api/auth/logout` | Révocation du refresh token |
| `GET` | `/api/users/me` | Profil de l'utilisateur connecté |
| `PATCH` | `/api/users/me` | Mise à jour du profil |
| `GET` | `/api/users?page=&pageSize=` | Liste paginée des utilisateurs *(ADMIN)* |

### Catalogue — `catalog-course-service` 🚧

`GET /api/catalog/subjects` · `GET /api/catalog/chapters` · `GET /api/catalog/chapters/:id` · `GET /api/catalog/lessons/:id` · `GET /api/catalog/lessons/:id/exercises` · `GET /api/catalog/exercises/:id` · `POST /api/catalog/exercises/:id/attempts` · `GET /api/catalog/books` · `GET /api/catalog/books/:id`
*ADMIN :* `POST /api/catalog/:entity` · `PATCH /api/catalog/:entity/:id` · `DELETE /api/catalog/:entity/:id`

### Examens — `exam-submission-service` 🚧

`GET /api/exams` · `GET /api/exams/:id` · `POST /api/exams/:id/sessions` · `POST /api/exams/sessions/:sessionId/submit` · `PATCH /api/exams/submissions/:id` · `GET /api/exams/submissions/mine`
*ADMIN :* `POST /api/exams` · `PATCH /api/exams/:id`

### Analytics & streak — `analytics-streak-service` 🚧

`POST /api/analytics/activities` · `GET /api/analytics/me/streak` · `GET /api/analytics/me/heatmap` · `GET /api/analytics/me/subjects` · `GET /api/analytics/me/summary`

### Contact — `admin-contact-service` 🚧

`POST /api/contact/tickets` · `GET /api/contact/tickets/mine` · `GET /api/contact/tickets/:id` · `GET /api/contact/notifications` · `PATCH /api/contact/notifications/:id/read`
*ADMIN :* `GET /api/contact/admin/tickets` · `PATCH /api/contact/admin/tickets/:id` · `POST /api/contact/admin/tickets/:id/reply`

### QCM adaptatif — `adaptive-qcm-service` 🚧

`POST /api/qcm/sessions` · `POST /api/qcm/sessions/:id/answers` · `POST /api/qcm/sessions/:id/finish` · `GET /api/qcm/flash` · `GET /api/qcm/mastery`
*ADMIN :* `POST /api/qcm/questions` · `PATCH /api/qcm/questions/:id`

✅ implémenté · 🚧 squelette (routes déclarées, réponse `501 Not Implemented`)

---

## Comptes de démonstration

Des comptes **étudiant** et **administrateur** sont disponibles :

- **Frontend :** boutons « Démo Étudiant » et « Démo Admin » sur la page `/login`.
- **Backend :** créés par `npm run db:seed`.

Les identifiants sont listés dans [`docs/test-accounts.md`](docs/test-accounts.md). Ils sont réservés au développement local.

---

## Scripts utiles

**Backend** (`backend/`)

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance la gateway et tous les services (mode watch) |
| `npm run infra:up` / `infra:down` | Démarre / arrête PostgreSQL, Redis, MinIO |
| `npm run db:generate` | Génère les clients Prisma |
| `npm run db:push` | Synchronise les schémas avec la base |
| `npm run db:seed` | Insère les comptes de démonstration |
| `npm run typecheck` | Vérification TypeScript de tous les workspaces |
| `npm test` | Lance les tests unitaires |

**Frontend** (`frontend/`)

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement (port 3000) |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run annales:sync` | Télécharge les annales CNC |
| `npm run annales:official` | Télécharge les annales des concours officiels |

---

## État d'avancement

| Sprint | Périmètre | État |
| --- | --- | --- |
| — | Prototype frontend complet (étudiant + back-office) | ✅ |
| 1 | Auth & utilisateurs (inscription, login, refresh, profil, admin) | ✅ |
| 2 | Catalogue : matières, chapitres, leçons, exercices, livres | 🚧 schéma Prisma + routes |
| 3 | Examens blancs & soumissions | 🚧 schéma Prisma + routes |
| 4 | Analytics & streak / Contact & errata | 🚧 moteur de streak implémenté et testé |
| 5 | QCM adaptatif (Projet 15) | 🚧 moteur adaptatif implémenté et testé |
| — | Branchement du frontend sur l'API | ⏳ à faire |

Le détail (ce qui est fait, ce qui reste à faire, logique du code) se trouve dans le rapport : [`docs/rapport/rapport.pdf`](docs/rapport/rapport.pdf).

---

## Documentation

- [`docs/cdc.pdf`](docs/cdc.pdf) — Cahier des charges
- [`docs/rapport/rapport.pdf`](docs/rapport/rapport.pdf) — Rapport technique (architecture, frontend, backend, base de données, démarrage)
- [`docs/audit-ui-cdc.md`](docs/audit-ui-cdc.md) — Audit de l'interface par rapport au CDC
- [`docs/test-accounts.md`](docs/test-accounts.md) — Comptes de test

---

> Les sujets d'annales présents dans `frontend/public/annales/` restent la propriété de leurs organismes respectifs (CNC, CCINP, Centrale-Supélec, Mines-Ponts) et sont fournis à des fins pédagogiques.
