# Audit du CDC : interface et prototype

Date : 25 octobre 2026.

## Verdict

Le prototype couvre une grande partie des écrans attendus, mais ne couvre pas encore tous les parcours du CDC. Les écarts principaux sont la bibliothèque d'ouvrages, la remise et l'archivage des rédactions, le signalement contextualisé, le raccordement des statistiques et le QCM adaptatif optionnel.

Périmètre : présence des écrans, navigation, contrôles et simulation locale des parcours. L'absence de backend, JWT réel, microservices, base de données, notifications e-mail ou moteur serveur n'est pas comptée comme un défaut dans cet audit. Un parcours peut être simulé avec des données de démonstration ; il doit néanmoins offrir les étapes demandées et des retours cohérents.

Méthode : lecture des 21 pages du PDF, inspection des composants et vérifications dans l'application locale. Les pages indiquées ci-dessous sont les pages du fichier PDF, couverture comprise. Aucun code applicatif modifié.

## Matrice de couverture

| Exigence du CDC | État UI/prototype | Constat |
|---|---|---|
| Inscription avec nom, prénom, e-mail, centre, année et filière — p. 6 | Présent | Formulaire et simulation de session dans SignUpPage. |
| Connexion étudiant / administrateur — p. 6, 11 | Présent | Écrans, accès démo et redirections de rôle ; authentification volontairement simulée. |
| Profil académique modifiable — p. 6 | Présent | Paramètres profil et cursus. Le dashboard reste toutefois codé pour Achraf / MP, indépendamment du profil. |
| Accès libre Sup et Spé — p. 6 | Présent avec écart | Deux portes d'entrée et bascule entre niveaux. Pas de vue « Tous les niveaux » ni de choix rapide depuis le dashboard conforme au CDC. |
| Quatre matières — p. 5–6 | Présent | Mathématiques, Physique/Chimie, SI et Informatique. |
| Organisation niveau / domaine / chapitre / leçon — p. 6 | Partiel | Navigation niveau → matière → chapitre → cours/TD. Les domaines et les leçons ne sont pas proposés comme des niveaux de navigation distincts. |
| Cours avec mathématiques et support PDF — p. 6 | Partiel | Théorie KaTeX et mode « PDF » visuel. Ce dernier est une planche HTML avec zoom et impression, sans téléchargement du PDF de cours dans ce composant. |
| Exercices PDF : énoncé et corrigé séparés — p. 6 | Manquant dans le parcours TD | La page TD présente les exercices interactifs, sans bascule vers une série PDF et son corrigé PDF séparé. Le mode PDF du cours ne remplace pas cette exigence. |
| Exercices Bibm@th : source, difficulté, indices progressifs et corrigé — p. 6 | Présent | Source et étoiles affichées ; dévoilement des indices et du corrigé testé dans le navigateur. |
| Auto-évaluation des exercices — p. 6 | Présent localement | Boutons Maîtrisé / Avec aide / À revoir et état React local. Pas de report sur le dashboard. |
| Annales CNC 2010–2026 — p. 6 | Partiel | Portail, sessions et épreuves présents. Le catalogue étudiant utilisé expose seulement 2022, 2023 et 2024. |
| Classement année / filière / épreuve — p. 6 | Partiel | Sessions, matières/épreuves et recherche. Les filières sont affichées comme métadonnées, sans filtre étudiant MP / PSI / TSI dédié dans ce parcours. |
| Simulation chronométrée 3h/4h — p. 6 | Présent dans le code | Liseuse simulée, préparation, compte à rebours selon l'épreuve, brouillon et remise. La durée complète n'a pas été testée. |
| Rapports de jury et correction par épreuve — p. 6 | Partiel | Champs de documents côté admin. Pas de parcours étudiant dédié au rapport du jury identifié ; le corrigé après remise contient des points clés fixes de mathématiques. |
| « Mes Problèmes Rédigés » : éditeur LaTeX/Markdown ou scan — p. 7, 12 | Partiel | L'onglet ouvre une banque de problèmes avec zone de brouillon et bouton Enregistrer. Des pochettes offrent séparément édition et dépôt de documents, mais ne constituent pas le parcours de rédaction attaché à une annale. |
| Soumettre → archiver → débloquer corrigé/barème → auto-évaluer — p. 7, 12 | Incomplet | La remise d'épreuve modifie l'état de la liseuse, sans transfert vers un portefeuille partagé, saisie de note ni mise à jour des indicateurs. |
| Bibliothèque d'ouvrages par matière/filière/niveau — p. 7 | Absent | Aucun catalogue ni entrée de navigation pour les ouvrages de référence. Les pochettes personnelles ne sont pas une bibliothèque d'ouvrages. |
| Fiche ouvrage : auteurs, édition, résumé, conseil, PDF — p. 7 | Absent | Aucun écran ou modèle ReferenceBook identifié dans l'application. |
| Dashboard, streak, heatmap annuelle et radar — p. 7 | Présent visuellement | Dashboard et heatmap consultés. Données de démonstration fixes ou générées. |
| Record de streak, progression Sup/Spé, moyenne par matière — p. 7 | Incomplet | Pas de record de streak identifié ; pas de ventilation Sup/Spé ni d'auto-évaluation moyenne par matière. |
| Activités → statistiques et streak actualisés — p. 7, 12, 15 | Non relié | Les actions d'exercice, les brouillons, les copies et le dashboard ne partagent pas d'état pédagogique. Même une simulation locale de mise à jour manque. |
| Contact admin, messages, pièces jointes et statuts — p. 7 | Présent comme maquette interactive | Écran de conversation, pièces jointes, tickets exemples et réponse automatique simulée. |
| Signalement contextualisé depuis une ressource — p. 7, 16 | Incomplet | Le bouton Signaler d'un exercice affiche « Erratum transmis ! » pendant trois secondes, sans formulaire, catégorie, référence transmise ni ticket créé. |
| Catégories erratum / question / bug / suggestion d'ouvrage — p. 7 | Partiel | Séparation Pédagogique / Technique et raccourcis. Pas de formulaire proposant explicitement les quatre catégories du CDC. |
| Suivi d'un ticket et notification de réponse — p. 7 | Partiel | Statuts exemples affichés. Changer de ticket modifie son identifiant, mais les messages ne sont pas stockés par ticket ; pas de notification contextualisée reliée à la réponse admin. |
| Back-office : gérer cours, exercices, ouvrages et CNC — p. 11 | Partiel | Catalogue, annales, QCM et messagerie présents. Pas de gestion d'ouvrages ; les changements admin ne sont pas propagés au catalogue étudiant. |
| Back-office : répondre et résoudre les tickets — p. 11 | Présent localement | États, réponses et résolution simulés côté admin ; non reliés aux conversations de l'espace étudiant. |
| Mode sombre et adaptation responsive — p. 21 | Présent, validation limitée | Composant de thème, styles responsive et menu replié observés. Pas de recette exhaustive téléphone/tablette/ordinateur, ni de test complet des deux thèmes. |

## Extension optionnelle Projet 15 et options de fin de projet

Ces exigences sont explicitement optionnelles dans le CDC : leur absence n'invalide pas le socle Projet 28.

| Option | État | Détail |
|---|---|---|
| Banque QCM par matière, correction et bilan | Présent dans le code | Questions, choix, explications, score, chronomètre de session et bilan. |
| Difficulté ajustée après chaque réponse — p. 19 | Incomplet | Le QCM par matière suit une liste séquentielle. Le flash affiche un niveau fixe 3/4 et un score ajusté de +6/-4, sans adaptation selon difficulté et temps. |
| Flash quotidien, répétition J+1/J+3/J+7/J+21 — p. 20 | Absent comme parcours | Aucune file de révision ni calendrier de répétition relié au dashboard. Le chrono du flash intégré aux TD affiche littéralement 01:45. |
| Bilan des leçons fragiles — p. 20 | Non identifié | Pas de restitution des chapitres à consolider conforme au scénario adaptatif. |
| Fiches express — p. 8 | Partiel | Fiches personnelles et contenus de synthèse présents ; pas de catalogue dédié et complet de formulaires express. |
| Accompagnement TIPE — p. 8 | Absent | Pas de module sujets / MCOT / exemples identifié. |
| Simulateur d'admissibilité et rang — p. 8 | Absent | Pas d'écran de saisie des notes et résultat pondéré identifié. |
| Oraux et programmes de khôlles — p. 8 | Partiel | Rapports personnels de khôlles, sans banque d'oraux ni générateur hebdomadaire. |
| Carnet d'erreurs — p. 8 | Absent | Pas d'épinglage d'exercice ou de conseil vers un carnet d'erreurs identifié. |

## Priorités recommandées pour finir le prototype

1. Ajouter une entrée Bibliothèque, des filtres et une fiche ouvrage complète, avec quelques livres fictifs ou exemples autorisés.
2. Construire un parcours de rédaction relié à l'annale : éditeur ou scan → soumission → archive → correction/barème → note et notes personnelles.
3. Partager les données de démonstration entre exercices, copies, dashboard et streak ; conserver les états en local pour la démonstration.
4. Ajouter le mode PDF des TD avec deux documents distincts, énoncé et corrigé.
5. Transformer Signaler en formulaire contextualisé avec catégorie et référence, puis relier le ticket à la messagerie admin et à son suivi étudiant.
6. Compléter le sélecteur d'années 2010–2026 et le filtre de filière. Pour un prototype, les années sans exemples peuvent être indiquées comme vides ; ne pas annoncer un contenu disponible qui ne l'est pas.
7. Relier le profil au dashboard, ajouter le record de streak et les ventilations demandées. Harmoniser les contenus : les références R/Telco/SHAP dominent actuellement plusieurs zones de la présentation CNC.
8. Si le Projet 15 est retenu, démontrer au moins une hausse/baisse de difficulté, un vrai chrono flash, des questions à revoir et un bilan des leçons fragiles.

## Repères de vérification dans le code

- `components/SignUpPage.tsx` : champs et soumission simulée ; `lib/auth.ts` : session de démonstration.
- `components/CourseExerciseQcmDoubleMode.tsx` : navigation Sup/Spé, cours, TD, auto-évaluation, annales et QCM. `handleEvaluation` vers ligne 3073 ; signalement vers 4562 ; chrono flash fixe vers 4768.
- `lib/concours-annales-database.ts` : catalogue étudiant d'annales.
- `components/ExercisePdfTemplate.tsx` : banque de problèmes et brouillon, notamment vers ligne 837.
- `components/ConcoursPdfExamViewer.tsx` : `handleConfirmSubmit` vers ligne 325 et corrigé fixe vers 986.
- `app/page.tsx` : statistiques et profil fixes ; branchement de l'onglet problèmes vers ligne 557.
- `components/ActivityBar.tsx` : heatmap avec données générées.
- `components/PersonalReportsHub.tsx` et `components/PochettesWorkspace.tsx` : pochettes et contenus personnels séparés du parcours de remise.
- `components/ContactAdminTemplate.tsx` : tickets exemples, tableau unique de messages et réponse automatique.
- `components/AdminBackOffice.tsx` : gestion locale du catalogue, des annales, QCM et conversations.

Limites : les formulaires d'inscription et les mutations admin n'ont pas été soumis ; aucun fichier personnel n'a été téléversé et aucun message n'a été envoyé. Les parcours non exercés dans le navigateur sont évalués par inspection du code. Cet audit ne certifie ni l'exactitude pédagogique des contenus ni l'authenticité des annales annoncées comme officielles.
