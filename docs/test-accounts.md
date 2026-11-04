# Comptes de Test & Authentification Multi-Rôles — Plateforme « Learning » (CNC CPGE)

Ce document répertorie les comptes de démonstration et de test pour évaluer l'ensemble des parcours utilisateurs de la plateforme **Learning** (Préparation au Concours National Commun CPGE Maroc).

---

## 1. Comptes de Démonstration Disponibles

| Rôle | Email | Mot de passe | Profil & Détails | Redirection Cible |
| :--- | :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@learning-cnc.ma` | `AdminPassword2026!` | **Dr. Karim Mansouri**<br>Responsable Pédagogique & Agrégé CPGE<br>Permissions : Accès total Back-Office (UC11, UC12) | `/admin` (Back-Office Admin) |
| **Étudiant (CPGE)** | `achraf.lemrani@cpge-cnc.ma` | `StudentPassword2026!` | **Achraf Lemrani**<br>Filière : **MP** (Maths-Physique)<br>Année : **2e année Spé**<br>Centre : **Lycée Omar Ibn Al-Khattab** (Rabat) | `/dashboard` (Espace Étudiant) |

---

## 2. Boutons de Connexion Rapide (Fast-Access Demo)

Sur la page de connexion ([`LoginPage`](file:///C:/Users/admin/Downloads/finance%20engeniering/projet/components/LoginPage.tsx)), deux boutons de connexion instantanée permettent de tester immédiatement chaque interface en un clic :
- **🎓 Démo Étudiant** : Remplit et valide la session étudiante (MP Spé, Lycée Omar Ibn Al-Khattab) et ouvre le Dashboard / Double Mode.
- **🛡️ Démo Admin** : Remplit et valide la session administrateur et ouvre le Back-Office de gestion des cours, annales, QCM et errata.

---

## 3. Structure du Token Mock JWT

Lors de l'authentification, un token JWT simulé est généré avec le payload suivant :

```json
{
  "sub": "usr_cpge_2026_01",
  "name": "Achraf Lemrani",
  "email": "achraf.lemrani@cpge-cnc.ma",
  "role": "STUDENT",
  "stream": "MP",
  "year": "SPE",
  "center": "Lycée Omar Ibn Al-Khattab",
  "city": "Rabat",
  "iat": 1792270000,
  "exp": 1794862000
}
```

Pour le compte Administrateur :
```json
{
  "sub": "adm_learning_001",
  "name": "Dr. Karim Mansouri",
  "email": "admin@learning-cnc.ma",
  "role": "ADMIN",
  "department": "Direction des Études & Agrégation",
  "permissions": ["MANAGE_COURSES", "PUBLISH_ANNALES", "MANAGE_QCM", "RESOLVE_ERRATA"],
  "iat": 1792270000,
  "exp": 1794862000
}
```

---

## 4. Parcours Utilisateurs Associés

1. **Étudiant CPGE** :
   - Inscription personnalisée via la page **Sign Up** avec sélection de centre, classe Sup/Spé et filière MP/PSI/TSI.
   - Tableau de bord personnalisé avec régularité de travail (12 jours), jauge de révision et radar de compétences.
   - Consultation des fiches de synthèse en **Double Mode** (PDF classique ou Dévoilement progressif Bibm@th avec KaTeX).
   - QCM flash adaptatif avec répétition espacée ($J+1$).
   - Signalement d'errata et assistance directe via le module Contact Admin.

2. **Administrateur Back-Office** :
   - **Module A** : CRUD complet du catalogue (4 matières, chapitres, leçons, fiches PDF et éditeur KaTeX en direct).
   - **Module B** : Publication des sujets officiels CNC 2010–2026 (énoncés, corrigés et rapports de jury).
   - **Module C** : Création et calibration des questions QCM avec explication sur chaque distracteur.
   - **Module D** : Traitement des tickets étudiants et correction instantanée des errata avec statut `RESOLVED`.
