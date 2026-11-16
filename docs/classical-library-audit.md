# Bibliothèque de problèmes classiques — audit préalable

15 novembre 2026. Rapport établi avant tout import de contenu.

## Architecture observée

Le projet actif est `frontend` (Next/React) et `backend` (Express, Prisma,
PostgreSQL et gateway). Le dossier `microservices` ne porte pas les routes
utilisées par l'application. Lecture du CDC : pages PDF 6–7 (accès libre aux
niveaux, documents séparés et suivi), 9 (services), 13–14 (modèles), 21
(sécurité et ergonomie). La demande actuelle ajoute une bibliothèque sans
annales, une catégorie Chimie et la filière PC ; elle prime sur l'ancien CDC.

`ExercisePdfTemplate` présente un tableau TypeScript et des PDF produits par
la plateforme. Ces documents n'ont pas de provenance externe vérifiée. Ils
ne doivent pas être requalifiés en corrigés d'enseignants. Le nouvel écran
remplace cette entrée ; les fichiers antérieurs restent conservés, hors de
la bibliothèque vérifiée. `Exercise` dépend d'une leçon et stocke un corrigé
en texte : ce modèle ne convient pas à un problème transversal sourcé.

Réutilisation : Subject, StudyLevel, Chapter (relation facultative), gateway,
contrôle du compte actif, sessions Next, styles existants et moteur PDF.
Extension : ClassicProblem, progression personnelle et journal de validation.
Les ressources énoncé/corrigé possèdent chacune leurs propres métadonnées
structurées ; aucune solution ni aucun indice généré ne sera stocké.

## Recherche et sélection

Le catalogue joint comporte 50 pistes, 10 par matière. Une piste thématique
avec une page d'index n'est PAS un exercice vérifié. Les champs inconnus
restent vides ; difficulté, durée et classement sont des propositions
éditoriales à valider. Aucun rattachement MP/PSI/PC/TSI n'est déduit uniquement
du nom du site. Les documents de PCSI ne prouvent pas une compatibilité avec
toutes les filières marocaines.

Sources consultées :

- [Bibm@th, intégrales à paramètres](https://www.bibmath.net/ressources/index.php?action=affiche&quoi=bde/analyse/integration/foncdefintegrales&type=fexo) : énoncés et corrigés présents sur une même page. Auteur individuel et droits de republication non établis ; ne pas recopier.
- [Janson de Sailly, chimie PCSI](https://chimie-pcsi-jds.net/pc_exercices.html) : liens distincts d'énoncés et de corrections. Les PDF des exercices 4 et 10 de solutions aqueuses ont été ouverts séparément. Attribution institutionnelle disponible, nom individuel non confirmé. Aucune licence de réhébergement constatée.
- [Étienne Thibierge](https://www.etienne-thibierge.fr/) : enseignant identifié ; liens autorisés, réhébergement et usage commercial interdits selon sa page. Énoncé et correction du TD oscillateurs ouverts séparément. Certains exercices sont explicitement issus d'oraux de concours : exclusion individuelle obligatoire. Le site déclare une aide IA pour certains paragraphes historiques et industriels ; cela ne permet pas d'attester l'absence absolue d'IA dans chaque document.
- [CPGE-SII, mécanique](https://www.cpge-sii.com/mecanique/meca-2/revisions/) et [informatique](https://www.cpge-sii.com/informatique/itc1/) : index accessibles, fichiers souvent sur Dropbox. Les intitulés et liens de corrections ne valent pas inspection indépendante des fichiers. Droits et origine non encore validés.
- [APSIM, article 109](https://apsim.ma/docs-sii/apercus-comm-article-109) : présence d'extraits PT/e3a/Centrale explicitement annoncés. Ceux-ci sont rejetés pour cette bibliothèque.
- KholaWeb : accès 403 pendant cette recherche. Professeur Zoubert Fadhuli : échec d'ouverture. Aucun contenu de ces sites importé ni déclaré vérifié.

Exclusions constatées : TD oscillateurs, exercices 4, 5, 7 et 8 (banques PT
ou CCINP) ; TD machines, exercice 1 (CCINP) ; APSIM 109 documents 2–4
(concours). Ne pas importer les recueils complets qui les contiennent.

## Publication et droits

Les candidats entrent en DISCOVERED ou SOURCE_VERIFIED, jamais directement
en PUBLISHED. Une vérification de source, d'énoncé, de compatibilité et des
droits précède l'approbation. Une correction n'est visible que si elle est
AUTHOR_PUBLISHED, TEACHER_PUBLISHED ou OFFICIAL avec preuve et date.
OFFICIAL requiert une attestation explicite. PENDING_VERIFICATION ne signifie
pas NO_CORRECTION. Un énoncé vérifié peut être publié sans corrigé.

Le premier lot est uniquement un référencement externe : aucune copie de
PDF tiers et aucun proxy de téléchargement. Le mode LINK_ONLY ouvre le site
de l'auteur. L'affichage intégré nécessite une autorisation distincte EMBED
avec preuve. Les notes et signets personnels restent dans PostgreSQL.
Une modification de source retire l'approbation et remet le document en
vérification. L'historique conserve l'identité et la date des validations.

## Plan de validation

Vérifier les refus d'accès étudiant aux mutations administratives, la
non-exposition des brouillons et des corrigés non vérifiés, les transitions
de publication, les URL dangereuses, les filtres combinés, la persistance
isolée par utilisateur, les erreurs et états vides. Tester ensuite les
parcours réels dans le navigateur. Les disponibilités de sites externes ne
sont pas garanties par les tests locaux.
