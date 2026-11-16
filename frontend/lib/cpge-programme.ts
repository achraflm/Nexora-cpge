export const programmeSources = {
  sup: 'https://www.cpge.ac.ma/documents/Docs/_PrgFil/10-scr-1e-mpsi-.pdf',
  spe: 'https://www.cpge.ac.ma/documents/Docs/_PrgFil/10-prg-2e-mp---.pdf',
}

// Intitulés organisés à partir des tables des matières ministérielles, consultées le 15 novembre 2026.
// La chimie est regroupée avec la physique dans le module existant.
export const cpgeProgramme = {
  maths: {
    sup: [
      'Éléments de logique', 'Ensembles et applications', 'Nombres complexes',
      'Calcul algébrique', 'Nombres réels', 'Suites numériques',
      'Limites et continuité', 'Dérivation', 'Suites récurrentes',
      'Fonctions usuelles et fonctions convexes', 'Primitives',
      'Équations différentielles linéaires', 'Arithmétique des entiers',
      'Structures algébriques', 'Calcul matriciel et systèmes linéaires',
      'Polynômes et fractions rationnelles', 'Développements limités',
      'Espaces vectoriels', 'Applications linéaires', 'Matrices et changements de bases',
      'Groupe symétrique et déterminants', 'Espaces préhilbertiens réels',
      'Intégration sur un segment', 'Intégrales généralisées',
      'Séries numériques', 'Arcs paramétrés plans', 'Fonctions de deux variables',
      'Dénombrement', 'Probabilités sur un univers fini', 'Variables aléatoires réelles',
    ],
    spe: [
      'Structures algébriques usuelles', 'Topologie des espaces normés',
      'Réduction des endomorphismes', 'Séries de vecteurs', 'Familles sommables',
      'Fonctions vectorielles', 'Suites et séries de fonctions', 'Séries entières',
      'Endomorphismes des espaces euclidiens', 'Intégrales dépendant d’un paramètre',
      'Espaces probabilisés', 'Variables aléatoires et lois de probabilité',
      'Espérance et moments', 'Fonctions génératrices', 'Convergence et théorèmes limites',
      'Équations différentielles linéaires', 'Calcul différentiel et optimisation',
    ],
  },
  physique: {
    sup: [
      'Mesures et incertitudes', 'Lois générales des circuits électriques',
      'Circuits linéaires', 'Régimes transitoires', 'Régime sinusoïdal forcé',
      'Filtrage linéaire', 'Amplificateur linéaire intégré',
      'Optique géométrique', 'Formation des images et conditions de Gauss',
      'Dispositifs optiques', 'Cinématique du point', 'Dynamique du point en référentiel galiléen',
      'Travail et énergie cinétique', 'Mouvement des particules chargées',
      'Oscillateur linéaire', 'Moment cinétique', 'Forces centrales conservatives',
      'Référentiels non galiléens', 'Introduction à la physique quantique',
      'Systèmes thermodynamiques à l’équilibre', 'Statique des fluides',
      'Premier principe de la thermodynamique', 'Deuxième principe de la thermodynamique',
      'Changements de phase', 'Machines thermiques', 'Champ et potentiel électrostatiques',
      'Dipôle électrostatique', 'Champ magnétostatique', 'Dipôle magnétique',
      'Transformations chimiques', 'Réactions acide-base', 'Complexation',
      'Dissolution et précipitation', 'Oxydoréduction', 'Cinétique chimique',
      'Mécanismes réactionnels', 'Structure électronique de l’atome',
      'Structure électronique des molécules', 'Structure et propriétés physiques',
      'Cristallographie',
    ],
    spe: [
      'Composition en fréquence d’un signal périodique', 'Effet d’un filtre sur un signal périodique',
      'Électronique numérique', 'Modulation et démodulation d’amplitude', 'Mécanique du solide',
      'Lois locales de l’électromagnétisme statique', 'Forces de Laplace',
      'Induction électromagnétique', 'Équations de Maxwell', 'Énergie électromagnétique',
      'Propagation des ondes électromagnétiques', 'Réflexion sur un conducteur parfait',
      'Rayonnement dipolaire', 'Modèle scalaire des ondes lumineuses',
      'Interférences lumineuses', 'Réseau plan', 'Conduction thermique',
      'Thermodynamique statistique', 'Équation de Schrödinger', 'Particule libre',
      'États stationnaires et potentiels constants par morceaux', 'États non stationnaires',
      'Grandeurs de réaction', 'Équilibres chimiques', 'Optimisation des procédés chimiques',
      'Thermodynamique de l’oxydoréduction', 'Courbes courant-potentiel',
      'Corrosion humide', 'Stockage et conversion électrochimique de l’énergie',
    ],
  },
  si: {
    sup: [
      'Ingénierie système et diagrammes', 'Analyse fonctionnelle et structurelle',
      'Modélisation géométrique des liaisons', 'Cinématique du solide indéformable',
      'Statique des solides', 'Chaînes de solides', 'Systèmes séquentiels',
      'Analyse d’un algorithme', 'Intelligence artificielle',
    ],
    spe: [
      'Cinétique du solide', 'Dynamique des solides', 'Théorème de l’énergie cinétique',
      'Modélisation des systèmes asservis', 'Modèles de comportement',
      'Réponses temporelles et fréquentielles', 'Simplification des modèles',
      'Performances des systèmes asservis', 'Correction des systèmes asservis',
      'Intelligence artificielle',
    ],
  },
  info: {
    sup: [
      'Architecture des ordinateurs et représentation des nombres', 'Introduction à Python',
      'Récursivité', 'Correction et terminaison des algorithmes', 'Types de données composés',
      'Piles et files', 'Fichiers', 'Bibliothèques mathématiques',
      'Introduction au traitement d’images', 'Ingénierie numérique',
    ],
    spe: [
      'Complexité algorithmique', 'Algorithmes de tri', 'Arbres binaires',
      'Algorithmes gloutons', 'Programmation dynamique', 'Métaheuristiques',
      'Théorie des graphes', 'Introduction à l’intelligence artificielle',
      'Théorie des jeux', 'Bases de données relationnelles',
    ],
  },
} satisfies Record<string, Record<'sup' | 'spe', string[]>>
