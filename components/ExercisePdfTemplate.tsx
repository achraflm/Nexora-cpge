'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FilePdf,
  DownloadSimple,
  Printer,
  Lightbulb,
  CheckCircle,
  ArrowCounterClockwise,
  Check,
  Star,
  WarningCircle,
  FileCode,
  ArrowLeft,
  CaretRight,
  BookOpen,
  Clock,
  Sparkle,
  Fire,
  GraduationCap,
  NotePencil,
  Eye,
  EyeSlash,
  Code,
  ChartLineUp,
  ShieldCheck,
  Lightning,
  Play,
  Pause,
  FloppyDisk,
  MagnifyingGlass,
  Funnel,
  ArrowsOut,
  ArrowsIn,
  Atom,
  Gear,
  TerminalWindow,
} from '@phosphor-icons/react'
import { MathFormula } from './MathFormula'
import { MathText } from './MathText'
import { SilkShader } from './SilkShader'
import { ThemeToggle } from './ThemeToggle'
import { NexoraLogo } from './NexoraLogo'
import { ProblemPdfReader } from './ProblemPdfReader'
import { CLASSIQUES_PROBLEMS } from '@/lib/classiques-problems'

// -----------------------------------------------------------------------------
// TYPES & DATA STRUCTURES
// -----------------------------------------------------------------------------

export type ProblemModuleId = 'maths' | 'physique' | 'sii' | 'info'

export interface ProblemQuestion {
  partTitle: string
  items: {
    qNum: string
    statement: string
    math?: string
    hint?: string
    solution: string
    solutionMath?: string
    points: number
  }[]
}

export interface ProblemItem {
  id: string
  code: string
  module: ProblemModuleId
  moduleTitle: string
  title: string
  concoursTarget: string
  filiere: string
  recommendedDuration: string // e.g. "4h00"
  difficulty: number // 1 to 5
  tags: string[]
  intro: string
  questions: ProblemQuestion[]
  juryComments?: string
  totalPoints: number
}

// -----------------------------------------------------------------------------
// CPGE PROBLEMS REPOSITORY (DIVIDED BY MODULE)
// -----------------------------------------------------------------------------

// Anciens problèmes « type concours » : conservés pour mémoire mais NON affichés.
// Seuls les problèmes classiques (lib/classiques-problems.ts) sont proposés aux élèves.
const ARCHIVED_CONCOURS_PROBLEMS: ProblemItem[] = [
  // ---------------------------------------------------------------------------
  // MODULE 1 : MATHÉMATIQUES
  // ---------------------------------------------------------------------------
  {
    id: 'prob-m1',
    code: 'MATH-M1',
    module: 'maths',
    moduleTitle: 'Mathématiques',
    title: 'Endomorphismes symétriques, Projecteurs orthogonaux & Théorème spectral',
    concoursTarget: 'Centrale-Supélec / Mines-Ponts',
    filiere: 'MP / PSI',
    recommendedDuration: '4h00',
    difficulty: 4,
    tags: ['Algèbre Linéaire', 'Espaces Euclidiens', 'Réduction', 'Formes Quadratiques'],
    totalPoints: 20,
    intro:
      "Soit $(E, \\langle \\cdot, \\cdot \\rangle)$ un espace préhilbertien réel de dimension finie $n \\ge 1$. On note $\\mathcal{S}(E)$ l'ensemble des endomorphismes auto-adjoints de $E$. Ce problème étudie les propriétés spectrales fines des projecteurs orthogonaux associés et leur application à la minimisation de la distance sur un sous-espace vectoriel.",
    juryComments:
      "Les candidats confondent fréquemment l'hypothèse de symétrie avec la positivité. Une attention particulière doit être portée à l'orthogonalité mutuelle des sous-espaces propres.",
    questions: [
      {
        partTitle: 'Partie I — Réduction spectrale et sous-espaces stables',
        items: [
          {
            qNum: '1.a',
            statement:
              "Soit $u \\in \\mathcal{S}(E)$. Montrer que toutes les valeurs propres de $u$ sont réelles, même si l'on considère la restriction sur le complexifié $E_\\mathbb{C}$.",
            math: '\\forall x, y \\in E, \\quad \\langle u(x), y \\rangle = \\langle x, u(y) \\rangle',
            hint: 'Considérer un vecteur propre complexe non nul $Z$ associé à $\\lambda$, et calculer $\\langle u(Z), Z \\rangle$.',
            solution:
              "Soit $\\lambda \\in \\mathbb{C}$ et $Z \\in E_\\mathbb{C} \\setminus \\{0\\}$ tel que $u(Z) = \\lambda Z$. En utilisant le produit scalaire hermitien canonique : $\\langle u(Z), Z \\rangle = \\lambda \\|Z\\|^2$. Or par auto-adjonction réelle de $u$, $\\langle u(Z), Z \\rangle = \\langle Z, u(Z) \\rangle = \\bar{\\lambda} \\|Z\\|^2$. Comme $\\|Z\\|^2 > 0$, il vient $\\lambda = \\bar{\\lambda}$, donc $\\lambda \\in \\mathbb{R}$.",
            solutionMath: '\\lambda \\|Z\\|^2 = \\bar{\\lambda} \\|Z\\|^2 \\implies (\\lambda - \\bar{\\lambda})\\|Z\\|^2 = 0 \\implies \\lambda \\in \\mathbb{R}',
            points: 3,
          },
          {
            qNum: '1.b',
            statement:
              'Démontrer que si $F$ est un sous-espace vectoriel stable par $u$, alors son orthogonal $F^\\perp$ est également stable par $u$.',
            math: 'u(F) \\subset F \\implies u(F^\\perp) \\subset F^\\perp',
            hint: 'Prendre $y \\in F^\\perp$ et tester $\\langle u(y), x \\rangle$ pour tout $x \\in F$.',
            solution:
              "Soit $y \\in F^\\perp$. Pour tout $x \\in F$, on a $\\langle u(y), x \\rangle = \\langle y, u(x) \\rangle$. Puisque $F$ est stable par $u$, $u(x) \\in F$. Comme $y \\in F^\\perp$, $\\langle y, u(x) \\rangle = 0$. Donc pour tout $x \\in F$, $\\langle u(y), x \\rangle = 0$, ce qui prouve que $u(y) \\in F^\\perp$.",
            points: 3,
          },
        ],
      },
      {
        partTitle: 'Partie II — Projecteurs spectraux et décomposition',
        items: [
          {
            qNum: '2.a',
            statement:
              "Soient $\\lambda_1, \\dots, \\lambda_p$ les valeurs propres deux à deux distinctes de $u$. Établir l'existence et l'unicité d'une famille de projecteurs orthogonaux $(p_1, \\dots, p_p)$ tels que $u = \\sum_{i=1}^p \\lambda_i p_i$.",
            math: 'u = \\sum_{i=1}^p \\lambda_i p_i, \\quad \\sum_{i=1}^p p_i = \\text{Id}_E, \\quad p_i \\circ p_j = \\delta_{ij} p_i',
            hint: 'Utiliser la décomposition de $E$ en somme directe orthogonale des sous-espaces propres $E_{\\lambda_i}(u)$.',
            solution:
              "D'après le théorème spectral euclidien, $E = \\bigoplus_{i=1}^p E_{\\lambda_i}(u)$ et cette somme est orthogonale. Notons $p_i$ la projection orthogonale sur $E_{\\lambda_i}(u)$. Pour tout $x \\in E$, $x = \\sum_{i=1}^p p_i(x)$ avec $p_i(x) \\in E_{\\lambda_i}(u)$. Par linéarité, $u(x) = \\sum_{i=1}^p u(p_i(x)) = \\sum_{i=1}^p \\lambda_i p_i(x)$. De plus, les sous-espaces étant deux à deux orthogonaux, $p_i p_j = 0$ pour $i \\neq j$ et $p_i^2 = p_i$.",
            points: 4,
          },
          {
            qNum: '2.b',
            statement:
              'Exprimer chaque projecteur spectral $p_i$ comme un polynôme en $u$ à coefficients réels à l’aide des polynômes d’interpolation de Lagrange.',
            math: 'L_i(X) = \\prod_{j \\neq i} \\frac{X - \\lambda_j}{\\lambda_i - \\lambda_j}',
            hint: 'Évaluer $L_i(u)$ sur chaque sous-espace propre $E_{\\lambda_k}(u)$.',
            solution:
              "Soit $L_i(X) = \\prod_{j \\neq i} \\frac{X - \\lambda_j}{\\lambda_i - \\lambda_j}$. Pour $x_k \\in E_{\\lambda_k}(u)$, on a $L_i(u)(x_k) = L_i(\\lambda_k) x_k = \\delta_{ik} x_k$. Ainsi, l'endomorphisme $L_i(u)$ coïncide avec la projection $p_i$ sur chaque sous-espace propre. Par linéarité, $p_i = L_i(u) \\in \\mathbb{R}[u]$.",
            points: 4,
          },
        ],
      },
      {
        partTitle: 'Partie III — Minimisation quadratique et quotient de Rayleigh',
        items: [
          {
            qNum: '3.a',
            statement:
              'Démontrer la formule du quotient de Rayleigh : $\\lambda_{\\min} \\le \\frac{\\langle u(x), x \\rangle}{\\|x\\|^2} \\le \\lambda_{\\max}$ pour tout $x \\in E \\setminus \\{0\\}$.',
            math: 'R(x) = \\frac{\\langle u(x), x \\rangle}{\\|x\\|^2}',
            hint: 'Décomposer $x$ dans une base orthonormée de vecteurs propres.',
            solution:
              "Soit $(e_1, \\dots, e_n)$ une BON de vecteurs propres associée aux valeurs propres ordonnées $\\lambda_1 \\le \\lambda_2 \\le \\dots \\le \\lambda_n$. Posons $x = \\sum x_k e_k$. Alors $\\|x\\|^2 = \\sum x_k^2$ et $\\langle u(x), x \\rangle = \\sum \\lambda_k x_k^2$. Or $\\lambda_1 \\sum x_k^2 \\le \\sum \\lambda_k x_k^2 \\le \\lambda_n \\sum x_k^2$. En divisant par $\\|x\\|^2 > 0$, on obtient l'encadrement exact.",
            solutionMath: '\\lambda_1 \\|x\\|^2 \\le \\sum_{k=1}^n \\lambda_k x_k^2 \\le \\lambda_n \\|x\\|^2 \\implies \\lambda_{\\min} \\le R(x) \\le \\lambda_{\\max}',
            points: 6,
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 2 : PHYSIQUE & CHIMIE
  // ---------------------------------------------------------------------------
  {
    id: 'prob-p1',
    code: 'PHYS-P1',
    module: 'physique',
    moduleTitle: 'Physique & Chimie',
    title: 'Électromagnétisme — Ondes planes guidées & Cavités résonnantes métalliques',
    concoursTarget: 'Mines-Ponts / CNC',
    filiere: 'PSI / PC / MP',
    recommendedDuration: '4h00',
    difficulty: 4,
    tags: ['Électromagnétisme', 'Ondes Guidées', 'Conditions aux Limites', 'Équations de Maxwell'],
    totalPoints: 20,
    intro:
      "Ce problème propose l'étude de la propagation d'ondes électromagnétiques monochromatiques dans un guide d'onde rectangulaire à parois parfaitement conductrices, puis l'analyse des modes stationnaires dans une cavité résonnante 3D.",
    juryComments:
      "L'application des conditions de passage sur un conducteur parfait (continuité du champ électrique tangentiel $E_t = 0$) est essentielle et doit être justifiée avec soin.",
    questions: [
      {
        partTitle: 'Partie I — Propagation en mode Transverse Électrique TE_10',
        items: [
          {
            qNum: '1.a',
            statement:
              "Rappeler les équations de Maxwell dans le vide à l'intérieur du guide. En déduire l'équation de Helmholtz vérifiée par l'amplitude spatiale $\\mathbf{E}_0(x, y, z)$.",
            math: '\\Delta \\mathbf{E} - \\frac{1}{c^2} \\frac{\\partial^2 \\mathbf{E}}{\\partial t^2} = \\mathbf{0} \\implies \\Delta \\mathbf{E}_0 + k_0^2 \\mathbf{E}_0 = \\mathbf{0}',
            hint: 'Prendre le rotationnel du rotationnel de $\\mathbf{E}$ en tenant compte de $\\text{div } \\mathbf{E} = 0$.',
            solution:
              "Dans le vide sans charges ni courants : $\\text{rot}(\\text{rot} \\mathbf{E}) = \\text{grad}(\\text{div} \\mathbf{E}) - \\Delta \\mathbf{E} = -\\Delta \\mathbf{E}$. Avec $\\text{rot} \\mathbf{E} = -\\partial \\mathbf{B}/\\partial t$ et $\\text{rot} \\mathbf{B} = \\mu_0 \\varepsilon_0 \\partial \\mathbf{E}/\\partial t = (1/c^2) \\partial \\mathbf{E}/\\partial t$, on obtient l'équation de d'Alembert. En régime harmonique $(\\partial/\\partial t \\to j\\omega)$, elle devient $\\Delta \\mathbf{E}_0 + (\\omega/c)^2 \\mathbf{E}_0 = \\mathbf{0}$.",
            points: 4,
          },
          {
            qNum: '1.b',
            statement:
              'Pour un guide rectangulaire de dimensions $a \\times b$ (avec $a > b$), déterminer la fréquence de coupure $f_c$ du mode fondamental $TE_{10}$.',
            math: 'f_c = \\frac{c}{2a}, \\quad k_g = \\sqrt{\\frac{\\omega^2}{c^2} - \\left(\\frac{\\pi}{a}\\right)^2}',
            hint: 'Écrire $E_y(x, z, t) = E_0 \\sin(k_x x) e^{j(\\omega t - k_g z)}$ et appliquer $E_y(0) = E_y(a) = 0$.',
            solution:
              "Les conditions aux limites sur le conducteur parfait imposent la nullité de la composante tangentielle $E_y$ en $x=0$ et $x=a$. Ainsi $\\sin(k_x a) = 0$, d'où $k_x = m\\pi / a$ avec $m \\in \\mathbb{N}^*$. Pour le mode fondamental $m=1$, la relation de dispersion donne $k_g^2 = (\\omega/c)^2 - (\\pi/a)^2$. La propagation requiert $k_g > 0$, soit $\\omega > \\omega_c = \\pi c / a$, d'où la fréquence de coupure $f_c = c / (2a)$.",
            points: 6,
          },
        ],
      },
      {
        partTitle: 'Partie II — Vitesse de phase et vitesse de groupe',
        items: [
          {
            qNum: '2.a',
            statement:
              'Calculer la vitesse de phase $v_\\varphi = \\omega / k_g$ et la vitesse de groupe $v_g = d\\omega / dk_g$. Vérifier la relation $v_\\varphi \\cdot v_g = c^2$.',
            math: 'v_\\varphi = \\frac{c}{\\sqrt{1 - (f_c/f)^2}} > c, \\quad v_g = c\\sqrt{1 - (f_c/f)^2} < c',
            hint: 'Différencier la relation de dispersion $\\omega^2 = c^2(k_g^2 + k_x^2)$.',
            solution:
              "En différentiant $\\omega^2 = c^2 k_g^2 + \\omega_c^2$, on trouve $2\\omega d\\omega = 2c^2 k_g dk_g$, soit $v_g = d\\omega/dk_g = c^2 k_g / \\omega = c^2 / v_\\varphi$. Donc $v_\\varphi v_g = c^2$. Bien que $v_\\varphi > c$, aucune information ni énergie ne se déplace plus vite que $c$, car la vitesse de transport énergétique $v_e = v_g < c$.",
            points: 5,
          },
          {
            qNum: '2.b',
            statement:
              "Calculer le vecteur de Poynting moyen $\\langle \\boldsymbol{\\Pi} \\rangle$ et la puissance moyenne transmise à travers la section droite du guide.",
            math: '\\langle \\boldsymbol{\\Pi} \\rangle = \\frac{1}{2} \\text{Re}(\\mathbf{E} \\times \\mathbf{B}^*)',
            hint: 'Déterminer le champ $\\mathbf{B}$ associé via les équations de Maxwell-Faraday.',
            solution:
              "Le champ magnétique s'obtient par $\\mathbf{B} = -\\frac{1}{j\\omega} \\text{rot} \\mathbf{E}$. Le calcul du produit vectoriel et de sa moyenne temporelle donne un flux d'énergie purement axial selon $\\mathbf{u}_z$. L'intégration sur le rectangle $[0, a] \\times [0, b]$ donne la puissance $P = \\frac{a b}{4} \\frac{k_g}{\\mu_0 \\omega} |E_0|^2$.",
            points: 5,
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 3 : SCIENCES INDUSTRIELLES (SII)
  // ---------------------------------------------------------------------------
  {
    id: 'prob-si1',
    code: 'SII-SI1',
    module: 'sii',
    moduleTitle: 'Sciences Industrielles (SII)',
    title: 'Asservissement d’un Exosquelette de Rééducation — SLCI & Robustesse de Bode',
    concoursTarget: 'Mines-Ponts / Centrale',
    filiere: 'PSI / TSI / MP',
    recommendedDuration: '4h00',
    difficulty: 3,
    tags: ['Automatique', 'SLCI', 'Diagrammes de Bode', 'Correcteur PID', 'Marges de Stabilité'],
    totalPoints: 20,
    intro:
      "Ce sujet étudie l'asservissement angulaire de l'articulation du genou d'un exosquelette d'assistance à la marche. L'actionneur est un moteur synchrone sans balais associé à un réducteur harmonique. On modélise la fonction de transfert en boucle ouverte et on dimensionne un correcteur à avance de phase et PID.",
    juryComments:
      "La précision sur la lecture des marges de phase $(\\Delta \\phi \\ge 45^\\circ)$ et de gain $(\\Delta G \\ge 6\\text{ dB})$ doit être rigoureusement explicitée.",
    questions: [
      {
        partTitle: 'Partie I — Modélisation du système non corrigé',
        items: [
          {
            qNum: '1.a',
            statement:
              "La chaîne directe non corrigée présente la fonction de transfert $H(p) = \\frac{K}{p(1 + \\tau_1 p)(1 + \\tau_2 p)}$ avec $K = 50$, $\\tau_1 = 0.05\\text{ s}$ et $\\tau_2 = 0.005\\text{ s}$. Tracer l'allure asymptotique du diagramme de Bode (Gain et Phase).",
            math: 'H(p) = \\frac{50}{p(1 + 0.05 p)(1 + 0.005 p)}',
            hint: 'Identifier la pulsation de coupure basse liée à l’intégrateur et les pulsations de cassure $\\omega_1 = 1/\\tau_1 = 20\\text{ rad/s}$ et $\\omega_2 = 200\\text{ rad/s}$.',
            solution:
              "En basse fréquence, la pente est de $-20\\text{ dB/déc}$ avec un déphasage de $-90^\\circ$. À $\\omega_1 = 20\\text{ rad/s}$, la pente passe à $-40\\text{ dB/déc}$ et le déphasage décroît vers $-180^\\circ$. À $\\omega_2 = 200\\text{ rad/s}$, la pente s'infléchit à $-60\\text{ dB/déc}$ et la phase tend vers $-270^\\circ$. Le système en boucle fermée présente un dépassement important voire une instabilité sans correction.",
            points: 5,
          },
          {
            qNum: '1.b',
            statement:
              'Calculer la pulsation de coupure à 0 dB $\\omega_{0\\text{dB}}$ et déterminer la marge de phase $\\Delta \\phi$ du système non corrigé. Conclure.',
            math: '\\Delta \\phi = 180^\\circ + \\arg(H(j\\omega_{0\\text{dB}}))',
            hint: 'Résoudre $|H(j\\omega)| = 1$. Pour $\\omega \\approx 30\\text{ rad/s}$, évaluer le déphasage.',
            solution:
              "Par résolution numérique ou lecture graphique, $|H(j\\omega)| = 1$ donne $\\omega_{0\\text{dB}} \\approx 27.5\\text{ rad/s}$. La phase vaut $\\arg H(j\\omega) = -90^\\circ - \\arctan(0.05 \\times 27.5) - \\arctan(0.005 \\times 27.5) \\approx -90^\\circ - 54^\\circ - 8^\\circ = -152^\\circ$. D'où $\\Delta \\phi = 180^\\circ - 152^\\circ = 28^\\circ$. Cette marge est inférieure aux $45^\\circ$ recommandés dans le cahier des charges.",
            points: 5,
          },
        ],
      },
      {
        partTitle: 'Partie II — Synthèse du correcteur à avance de phase',
        items: [
          {
            qNum: '2.a',
            statement:
              "On introduit un correcteur $C(p) = \\frac{1 + a T p}{1 + T p}$ avec $a > 1$. Montrer que l'apport maximal de phase $\\phi_m$ vérifie $\\sin(\\phi_m) = \\frac{a - 1}{a + 1}$ à la pulsation $\\omega_m = \\frac{1}{T \\sqrt{a}}$.",
            math: '\\phi_m = \\arcsin\\left(\\frac{a - 1}{a + 1}\\right), \\quad \\omega_m = \\frac{1}{T\\sqrt{a}}',
            hint: 'Dériver la fonction $\\phi(\\omega) = \\arctan(aT\\omega) - \\arctan(T\\omega)$ par rapport à $\\omega$.',
            solution:
              "On a $\\tan(\\phi(\\omega)) = \\frac{aT\\omega - T\\omega}{1 + a T^2 \\omega^2} = \\frac{(a-1)T\\omega}{1 + a T^2 \\omega^2}$. La dérivée s'annule pour $\\omega_m = 1/(T\\sqrt{a})$. En cette pulsation, $\\tan(\\phi_m) = \\frac{a-1}{2\\sqrt{a}}$, ce qui conduit après simplification trigonométrique standard à $\\sin(\\phi_m) = \\frac{a-1}{a+1}$.",
            points: 5,
          },
          {
            qNum: '2.b',
            statement:
              'Dimensionner les paramètres $a$ et $T$ pour garantir une marge de phase de $\\Delta \\phi \\ge 50^\\circ$ et calculer la nouvelle bande passante du système en boucle fermée.',
            hint: 'Choisir $\\phi_m$ pour compenser le déficit de phase de $22^\\circ$ plus une marge de sécurité de $10^\\circ$, soit $\\phi_m \\approx 32^\\circ$.',
            solution:
              "Avec $\\phi_m = 32^\\circ$, on calcule $a = \\frac{1 + \\sin(32^\\circ)}{1 - \\sin(32^\\circ)} \\approx \\frac{1.53}{0.47} \\approx 3.25$. Le gain apporté par le correcteur à $\\omega_m$ est $+10\\log_{10}(a) = +5.1\\text{ dB}$. On place $\\omega_m$ là où le système non corrigé est à $-5.1\\text{ dB}$, soit $\\omega_m \\approx 38\\text{ rad/s}$. On en déduit $T = \\frac{1}{38 \\sqrt{3.25}} \\approx 0.0146\\text{ s}$. La marge de phase atteint $52^\\circ$ et le temps de réponse à 5% est réduit d'un facteur 2.",
            points: 5,
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 4 : INFORMATIQUE & ALGORITHMIQUE
  // ---------------------------------------------------------------------------
  {
    id: 'prob-i1',
    code: 'INFO-I1',
    module: 'info',
    moduleTitle: 'Informatique & Algorithmique',
    title: 'Routage Optimal & Graphes Pondérés — Algorithme de Dijkstra et A*',
    concoursTarget: 'Épreuve Commune CNC / Centrale MP',
    filiere: 'Toutes filières',
    recommendedDuration: '3h00',
    difficulty: 3,
    tags: ['Graphes', 'Algorithmes Voraces', 'Files de Priorité', 'Heuristiques A*', 'Complexité'],
    totalPoints: 20,
    intro:
      "Ce problème aborde la recherche du plus court chemin dans un réseau de transport représenté par un graphe orienté pondéré $G = (V, E, w)$ à poids strictement positifs. On analyse la correction et la complexité de l'algorithme de Dijkstra à l'aide d'un tas binaire, puis son extension heuristique $A^*$.",
    juryComments:
      "La preuve formelle de la correction de Dijkstra par récurrence sur l'ensemble des sommets fixés doit être rédigée avec un soin mathématique impeccable.",
    questions: [
      {
        partTitle: 'Partie I — Tas binaire et complexité de Dijkstra',
        items: [
          {
            qNum: '1.a',
            statement:
              "Rappeler la structure d'un tas binaire min. Quelle est la complexité dans le pire des cas des opérations `extraire_min` et `diminuer_cle` pour un tas contenant $N$ éléments ?",
            math: '\\mathcal{O}(\\log N)',
            hint: 'Considérer la hauteur de l’arbre binaire presque parfait.',
            solution:
              "Un tas binaire min est un arbre binaire presque complet respectant la propriété de tas : la clé de tout nœud est inférieure ou égale à celle de ses fils. La hauteur est $\\lfloor \\log_2 N \\rfloor$. L'opération `extraire_min` remplace la racine par la dernière feuille puis effectue un tamisage vers le bas (percolate down) en $\\mathcal{O}(\\log N)$. L'opération `diminuer_cle` modifie la priorité puis effectue un tamisage vers le haut (percolate up) en $\\mathcal{O}(\\log N)$ si l'on maintient une table de hachage associant chaque sommet à son index dans le tas.",
            points: 4,
          },
          {
            qNum: '1.b',
            statement:
              "Démontrer que la complexité temporelle globale de l'algorithme de Dijkstra implanté avec un tas binaire est $\\mathcal{O}((|V| + |E|) \\log |V|)$.",
            math: '|V| \\times \\mathcal{O}(\\log |V|) + |E| \\times \\mathcal{O}(\\log |V|) = \\mathcal{O}((|V| + |E|) \\log |V|)',
            hint: 'Compter le nombre total d’extractions du minimum et le nombre maximal de mises à jour de distance (relâchements).',
            solution:
              "Chaque sommet de $V$ est inséré puis extrait du tas une seule fois : cela génère $|V|$ opérations `extraire_min`, soit un coût de $\\mathcal{O}(|V| \\log |V|)$. Chaque arête $(u, v) \\in E$ est examinée lors du relâchement du sommet $u$. Si une distance est améliorée, on appelle `diminuer_cle`, ce qui arrive au plus $|E|$ fois au total, pour un coût de $\\mathcal{O}(|E| \\log |V|)$. La somme donne bien $\\mathcal{O}((|V| + |E|) \\log |V|)$.",
            points: 4,
          },
        ],
      },
      {
        partTitle: 'Partie II — Heuristique admissible et algorithme A*',
        items: [
          {
            qNum: '2.a',
            statement:
              "Soit $h : V \\to \\mathbb{R}^+$ une fonction heuristique estimant la distance d'un sommet au sommet but $t$. Définir la notion d'heuristique admissible et d'heuristique cohérente (ou monotone).",
            math: '\\forall u \\in V, \\quad h(u) \\le d^*(u, t) \\quad \\text{(Admissibilité)}',
            hint: 'Une heuristique cohérente vérifie une inégalité triangulaire avec les poids des arêtes.',
            solution:
              "Une heuristique $h$ est dite admissible si pour tout sommet $u$, elle sous-estime toujours la distance réelle minimale au but : $0 \\le h(u) \\le d^*(u, t)$. Elle est dite cohérente (ou consistante / monotone) si pour toute arête $(u, v) \\in E$, $h(u) \\le w(u, v) + h(v)$ et $h(t) = 0$. La cohérence implique l'admissibilité et garantit que chaque sommet n'est développé qu'une seule fois.",
            points: 6,
          },
          {
            qNum: '2.b',
            statement:
              "Écrire la fonction Python `a_etoile(graphe, source, cible, h)` retournant la distance minimale et la liste des sommets du plus court chemin.",
            hint: 'Utiliser le module `heapq` de la bibliothèque standard Python avec un tuple `(f_score, sommet)`.',
            solution:
              "L'algorithme maintient `g_score[u]` (distance réelle depuis la source) et `f_score[u] = g_score[u] + h(u)` (coût estimé total). Les sommets sont triés dans la file de priorité selon `f_score`. Dès que la cible est dépilée, l'optimalité est garantie.",
            solutionMath: 'f(u) = g(u) + h(u)',
            points: 6,
          },
        ],
      },
    ],
  },
]
void ARCHIVED_CONCOURS_PROBLEMS

// ---------------------------------------------------------------------------
// PROBLÈMES AFFICHÉS : uniquement les grands classiques CPGE
// ---------------------------------------------------------------------------
export const cpgeProblems: ProblemItem[] = CLASSIQUES_PROBLEMS

const MODULE_SECTIONS: { id: ProblemModuleId; label: string }[] = [
  { id: 'maths', label: 'Mathématiques' },
  { id: 'physique', label: 'Physique & Chimie' },
  { id: 'sii', label: 'Sciences Industrielles (SII)' },
  { id: 'info', label: 'Informatique & Algorithmique' },
]

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function ExercisePdfTemplate({
  onBackToDashboard,
  onNavigateToContactAdmin,
  hideHeader = false,
}: {
  onBackToDashboard: () => void
  onNavigateToContactAdmin?: () => void
  hideHeader?: boolean
}) {
  // Navigation & Filtering
  const [selectedModule, setSelectedModule] = useState<'all' | ProblemModuleId>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null)

  // Visionnage normal (problème complet affiché) — Mode Focus optionnel
  const [isNormalView, setIsNormalView] = useState<boolean>(false)

  // Mode Focus State
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true)
  const [timerSeconds, setTimerSeconds] = useState<number>(0)
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({})
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({})
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({})
  const [isNoteSaved, setIsNoteSaved] = useState<boolean>(false)

  // Timer Effect in Focus Mode
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isFocusMode && isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isFocusMode, isTimerRunning])

  // Format timer seconds into HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Filter problems
  const filteredProblems = cpgeProblems.filter((p) => {
    const matchesModule = selectedModule === 'all' || p.module === selectedModule
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.concoursTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesModule && matchesSearch
  })

  // Selected Problem
  const activeProblem = cpgeProblems.find((p) => p.id === activeProblemId) || cpgeProblems[0]

  // Handlers
  const handleOpenProblem = (problemId: string) => {
    setActiveProblemId(problemId)
    setIsNormalView(true)
    setIsFocusMode(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCloseProblem = () => {
    setIsNormalView(false)
    setIsFocusMode(false)
    setIsTimerRunning(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isAllRevealed = (p: ProblemItem) =>
    p.questions.every((part) => part.items.every((it) => revealedSolutions[`${p.id}-${it.qNum}`]))

  const setAllSolutions = (p: ProblemItem, value: boolean) => {
    setRevealedSolutions((prev) => {
      const updated = { ...prev }
      p.questions.forEach((part) => part.items.forEach((it) => (updated[`${p.id}-${it.qNum}`] = value)))
      return updated
    })
  }

  const handleOpenFocusMode = (problemId: string) => {
    setActiveProblemId(problemId)
    setIsNormalView(true)
    setIsFocusMode(true)
    setIsTimerRunning(true)
    setTimerSeconds(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExitFocusMode = () => {
    setIsFocusMode(false)
    setIsTimerRunning(false)
  }

  const handleToggleSolution = (qKey: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [qKey]: !prev[qKey],
    }))
  }

  const handleToggleHint = (qKey: string) => {
    setRevealedHints((prev) => ({
      ...prev,
      [qKey]: !prev[qKey],
    }))
  }

  const handleSaveNotes = (problemId: string, content: string) => {
    setStudentNotes((prev) => ({ ...prev, [problemId]: content }))
    setIsNoteSaved(true)
    setTimeout(() => setIsNoteSaved(false), 2000)
  }

  // Module pill styling
  const moduleBadge = (mod: ProblemModuleId) => {
    switch (mod) {
      case 'maths':
        return { label: 'Mathématiques', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' }
      case 'physique':
        return { label: 'Physique & Chimie', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' }
      case 'sii':
        return { label: 'Sciences Industrielles', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' }
      case 'info':
        return { label: 'Informatique', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' }
    }
  }

  // ---------------------------------------------------------------------------
  // RENDER: FOCUS MODE VIEW
  // ---------------------------------------------------------------------------
  if (isFocusMode && activeProblem) {
    const isFullSolutionRevealed = activeProblem.questions.every((part) =>
      part.items.every((it) => revealedSolutions[`${activeProblem.id}-${it.qNum}`])
    )

    return (
      <div className="learning-shell relative min-h-screen overflow-x-clip bg-[#070b14] text-slate-100 transition-colors duration-200">
        <SilkShader />

        {/* Ambient Glowing Orbs */}
        <div className="glass-glow-ambient -top-40 -left-40 size-[550px] bg-[#3978F6]/20" />
        <div className="glass-glow-ambient top-1/2 -right-40 size-[500px] bg-[#06b6d4]/15" />

        {/* Persistent Focus Mode Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d1627]/90 backdrop-blur-xl shadow-2xl">
          <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
            {/* Left: Focus Badge & Problem Reference */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExitFocusMode}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20 hover:border-white/30"
                title="Quitter le Mode Focus et revenir à la liste"
              >
                <ArrowLeft size={15} weight="bold" />
                <span>Retour au visionnage normal</span>
              </button>

              <div className="hidden h-5 w-px bg-white/15 sm:block" />

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 shadow-xs">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Mode Focus Actif
                </span>
                <span className="hidden font-mono text-xs font-bold text-[#6495ed] md:inline">
                  {activeProblem.code} • {activeProblem.concoursTarget}
                </span>
              </div>
            </div>

            {/* Center: Live Focus Stopwatch */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-blue-500/30 bg-[#12203d]/80 px-4 py-1.5 shadow-none">
              <Clock size={16} weight="bold" className="text-[#3978F6] animate-pulse" />
              <div className="text-center font-mono">
                <span className="text-sm font-bold tracking-widest text-white">
                  {formatTime(timerSeconds)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="ml-1 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                title={isTimerRunning ? 'Mettre en pause' : 'Reprendre le chronomètre'}
              >
                {isTimerRunning ? <Pause size={14} weight="bold" /> : <Play size={14} weight="bold" />}
              </button>
              <button
                type="button"
                onClick={() => setTimerSeconds(0)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Réinitialiser le chrono"
              >
                <ArrowCounterClockwise size={14} weight="bold" />
              </button>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-xs font-semibold text-slate-300 lg:flex">
                <span className="rounded-lg bg-white/10 px-2 py-0.5 font-mono">
                  Barème : {activeProblem.totalPoints} pts
                </span>
                <span className="rounded-lg bg-white/10 px-2 py-0.5 font-mono">
                  Durée cons. : {activeProblem.recommendedDuration}
                </span>
              </div>

              {/* Master Reveal All Solutions Button */}
              <button
                type="button"
                onClick={() => {
                  const targetState = !isFullSolutionRevealed
                  const updated: Record<string, boolean> = {}
                  activeProblem.questions.forEach((part) => {
                    part.items.forEach((it) => {
                      updated[`${activeProblem.id}-${it.qNum}`] = targetState
                    })
                  })
                  setRevealedSolutions(updated)
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-md ${
                  isFullSolutionRevealed
                    ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-gradient-to-r from-[#3978F6] to-indigo-600 text-white hover:brightness-110 shadow-none'
                }`}
              >
                {isFullSolutionRevealed ? (
                  <>
                    <EyeSlash size={15} weight="bold" />
                    <span>Masquer le Corrigé</span>
                  </>
                ) : (
                  <>
                    <Eye size={15} weight="bold" />
                    <span>Afficher tout le Corrigé</span>
                  </>
                )}
              </button>

              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Focus Workspace Canvas */}
        <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-8 sm:px-8 space-y-8">
          {/* Problem Header Banner */}
          <div className="rounded-3xl border border-white/10 bg-[#0e1a30]/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-[#3978F6] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  {activeProblem.code}
                </span>
                <span className="text-xs font-bold text-blue-400">{activeProblem.moduleTitle}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-bold text-slate-300">{activeProblem.concoursTarget}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">Filière {activeProblem.filiere}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      weight={i < activeProblem.difficulty ? 'fill' : 'regular'}
                      className={i < activeProblem.difficulty ? 'text-amber-400' : 'text-slate-600'}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-400">Niveau {activeProblem.difficulty}/5</span>
              </div>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {activeProblem.title}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              <MathText text={activeProblem.intro} />
            </p>

            {/* Tags list */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeProblem.tags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Jury Comments Alert */}
            {activeProblem.juryComments && (
              <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
                  <WarningCircle size={16} weight="fill" />
                  <span>Rapport du Jury & Conseils Méthodologiques :</span>
                </div>
                <p className="leading-relaxed"><MathText text={activeProblem.juryComments} /></p>
              </div>
            )}
          </div>

          {/* Two-Column Layout: Questions & Statements on Left (65%), Digital Scratchpad on Right (35%) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Questions & Step-by-Step Pedagogical Corrections */}
            <div className="space-y-8 lg:col-span-8">
              {activeProblem.questions.map((part, partIdx) => (
                <div
                  key={partIdx}
                  className="rounded-3xl border border-white/10 bg-[#0e1a30]/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6"
                >
                  <div className="border-b border-white/10 pb-3">
                    <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                      <GraduationCap size={20} className="text-[#3978F6]" weight="bold" />
                      <span>{part.partTitle}</span>
                    </h2>
                  </div>

                  {/* Individual Questions */}
                  <div className="space-y-6">
                    {part.items.map((it) => {
                      const qKey = `${activeProblem.id}-${it.qNum}`
                      const isSolRevealed = revealedSolutions[qKey] || false
                      const isHintRevealed = revealedHints[qKey] || false

                      return (
                        <div
                          key={it.qNum}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 transition hover:border-white/20"
                        >
                          {/* Question Number & Points Badge */}
                          <div className="flex items-center justify-between gap-3 mb-2.5">
                            <span className="flex items-center gap-1.5 font-mono text-sm font-bold text-[#60a5fa]">
                              Question {it.qNum}
                            </span>
                            <span className="rounded-md border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 font-mono text-xs font-bold text-blue-300">
                              {it.points} pts
                            </span>
                          </div>

                          {/* Statement */}
                          <p className="text-sm font-medium leading-relaxed text-slate-200">
                            <MathText text={it.statement} />
                          </p>

                          {/* Mathematical formula of statement */}
                          {it.math && (
                            <div className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3">
                              <MathFormula math={it.math} block />
                            </div>
                          )}

                          {/* Actions Bar: Hint Button + Reveal Solution Button */}
                          <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                            {it.hint && (
                              <button
                                type="button"
                                onClick={() => handleToggleHint(qKey)}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                  isHintRevealed
                                    ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300'
                                    : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                <Lightbulb size={14} weight={isHintRevealed ? 'fill' : 'bold'} />
                                <span>{isHintRevealed ? 'Masquer l’indice' : 'Afficher l’indice'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleSolution(qKey)}
                              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                                isSolRevealed
                                  ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                                  : 'bg-[#3978F6] text-white hover:bg-blue-600 shadow-sm'
                              }`}
                            >
                              {isSolRevealed ? (
                                <>
                                  <EyeSlash size={14} weight="bold" />
                                  <span>Masquer la correction</span>
                                </>
                              ) : (
                                <>
                                  <Eye size={14} weight="bold" />
                                  <span>Afficher le corrigé détaillé</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Hint Box */}
                          {isHintRevealed && it.hint && (
                            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                              <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                                <Lightbulb size={14} weight="fill" />
                                <span>Indice pour démarrer :</span>
                              </div>
                              <p className="leading-relaxed"><MathText text={it.hint} /></p>
                            </div>
                          )}

                          {/* Step-by-Step Pedagogical Correction */}
                          {isSolRevealed && (
                            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-[#081e18]/90 p-4 sm:p-5 text-slate-200 space-y-3 animate-fadeIn">
                              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                                <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs sm:text-sm">
                                  <CheckCircle size={16} weight="fill" />
                                  <span>Démonstration & Corrigé Officiel</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                                  Attribution : {it.points} / {it.points} pts
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-200">
                                <MathText text={it.solution} />
                              </p>

                              {it.solutionMath && (
                                <div className="my-2.5 overflow-x-auto rounded-xl border border-emerald-500/30 bg-black/50 p-3">
                                  <MathFormula math={it.solutionMath} block />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Scratchpad & Student Notes Workspace */}
            <div className="space-y-6 lg:col-span-4">
              <div className="sticky top-24 rounded-3xl border border-white/10 bg-[#0e1a30]/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <NotePencil size={18} weight="bold" className="text-[#3978F6]" />
                    <h3 className="text-sm font-bold text-white">Brouillon & Recherche</h3>
                  </div>
                  {isNoteSaved && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-fadeIn">
                      <Check size={13} weight="bold" /> Sauvegardé
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Rédigez vos pistes de recherche, équations intermédiaires et brouillons avant de consulter le corrigé.
                </p>

                <textarea
                  value={studentNotes[activeProblem.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setStudentNotes((prev) => ({ ...prev, [activeProblem.id]: val }))
                  }}
                  placeholder="Écrivez vos démarches ici... (ex: Soit lambda valeur propre, calcul du discriminant...)"
                  className="w-full h-80 rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-[#3978F6] focus:outline-none focus:ring-1 focus:ring-[#3978F6] resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-xs text-slate-500">
                    {(studentNotes[activeProblem.id] || '').length} caractères
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSaveNotes(activeProblem.id, studentNotes[activeProblem.id] || '')}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500 shadow-sm"
                  >
                    <FloppyDisk size={14} weight="bold" />
                    <span>Enregistrer</span>
                  </button>
                </div>

                {/* Quick Shortcuts */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-400 space-y-2">
                  <div className="font-bold text-slate-300">Rappels Pratiques CPGE :</div>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    <li>Justifier scrupuleusement la finitude de la dimension</li>
                    <li>Vérifier la non-nullité des vecteurs propres</li>
                    <li>Mentionner les conditions aux limites dès l'introduction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // RENDER: VISIONNAGE NORMAL (problème complet, Mode Focus optionnel)
  // ---------------------------------------------------------------------------
  if (isNormalView && activeProblem) {
    return <ProblemPdfReader problem={activeProblem} onBack={handleCloseProblem} />
  }

  // ---------------------------------------------------------------------------
  // RENDER: DEFAULT MODULES & PROBLEMS CATALOG
  // ---------------------------------------------------------------------------
  return (
    <div className="learning-shell relative min-h-screen overflow-x-clip bg-transparent text-[#172033] dark:text-[#eaf2ff] transition-colors duration-200">
      <SilkShader />

      {/* Ambient Glowing Orbs */}
      <div className="glass-glow-ambient -top-40 -left-40 size-[550px] bg-[#3978F6]/20 dark:bg-[#3978F6]/30" />
      <div className="glass-glow-ambient top-1/3 -right-40 size-[500px] bg-[#06b6d4]/15 dark:bg-[#06b6d4]/25" />

      {/* Main Glass Header */}
      {!hideHeader && (
        <div className="relative z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl dark:border-white/15 dark:bg-[#0b162c]/80">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-900 dark:border-white/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
              >
                <ArrowLeft size={15} weight="bold" />
                <span>Retour Tableau de bord</span>
              </button>

              <div className="hidden h-5 w-px bg-slate-300 dark:bg-white/20 sm:block" />

              <div className="flex items-center gap-2 text-xs">
                <NexoraLogo size={22} />
                <span className="rounded-lg bg-[#3978F6] px-2 py-0.5 font-bold text-white shadow-xs">
                  CPGE Problèmes
                </span>
                <CaretRight size={12} className="text-slate-400 dark:text-white/40" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Problèmes & exercices de synthèse
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Fire size={15} weight="fill" className="text-amber-500" />
                <span>Série : 12j</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Container */}
      <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-8 sm:px-8 space-y-8">
        {/* Hero Banner */}
        <div className="glass-container rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3978F6]/40 bg-[#3978F6]/15 px-3 py-1 text-xs font-bold text-[#1d4ed8] dark:text-[#b9d5ff]">
                <Lightning size={14} weight="fill" />
                <span>Entraînement CPGE</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-[#0f172a] dark:text-white">
                Banque de problèmes
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Retrouvez les problèmes du site et les exercices structurés en plusieurs questions, classés par matière.
                Consultez les énoncés et leurs corrigés au format PDF, directement en ligne ou en téléchargement.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs font-bold text-blue-600 dark:text-blue-300">
              <Sparkle size={24} weight="fill" className="shrink-0 text-[#3978F6]" />
              <div>
                <p className="font-bold">{cpgeProblems.length} problèmes disponibles</p>
                <p className="font-medium text-xs opacity-80">Corrigés détaillés & grilles /20</p>
              </div>
            </div>
          </div>

          {/* Module Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-200/80 dark:border-white/10 pt-4">
            {[
              { id: 'all', label: 'Toutes les matières', icon: BookOpen },
              { id: 'maths', label: 'Mathématiques', icon: GraduationCap },
              { id: 'physique', label: 'Physique & Chimie', icon: Atom },
              { id: 'sii', label: 'Sciences Industrielles (SII)', icon: Gear },
              { id: 'info', label: 'Informatique & Algorithmique', icon: TerminalWindow },
            ]
              .filter((m) => m.id === 'all' || cpgeProblems.some((p) => p.module === m.id))
              .map((m) => {
              const isActive = selectedModule === m.id
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModule(m.id as typeof selectedModule)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                    isActive
                      ? 'bg-[#3978F6] text-white shadow-md'
                      : 'border border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white hover:text-slate-900 dark:border-white/15 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 dark:hover:text-white'
                  }`}
                >
                  <Icon size={15} weight="bold" />
                  <span>{m.label}</span>
                </button>
              )
            })}
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par intitulé, notion-clé (ex: Bode, Fourier, Dijkstra, Spectral)..."
              className="w-full rounded-xl border border-slate-200/80 bg-white/80 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#3978F6] focus:outline-none focus:ring-1 focus:ring-[#3978F6] dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder-slate-500"
            />
          </div>
        </div>

        {/* Une section séparée par module */}
        {filteredProblems.length === 0 && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">Aucun problème ne correspond à la recherche.</p>
        )}
        {MODULE_SECTIONS.map((section) => {
          const sectionProblems = filteredProblems.filter((p) => p.module === section.id)
          if (sectionProblems.length === 0) return null
          return (
            <section key={section.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200/80 pb-2 dark:border-white/10">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{section.label}</h2>
                <span className="rounded-full bg-[#3978F6]/15 px-2.5 py-0.5 text-xs font-bold text-[#1d4ed8] dark:text-[#b9d5ff]">
                  {sectionProblems.length} problème{sectionProblems.length > 1 ? 's' : ''}
                </span>
              </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sectionProblems.map((problem) => {
            const badge = moduleBadge(problem.module)
            return (
              <div
                key={problem.id}
                className="aspect-square group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 cursor-pointer bg-white/85 dark:bg-[#0c1628]/90 backdrop-blur-xl border border-blue-500/60 shadow-none hover:border-blue-400 hover:shadow-none hover:-translate-y-1 transition-all overflow-hidden"
                onClick={() => handleOpenProblem(problem.id)}
              >
                {/* Top Content */}
                <div className="space-y-3">
                  {/* Meta Badges */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#3978F6] dark:text-[#74a5ff]">
                      {problem.code}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-100/90 px-2 py-0.5 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 truncate max-w-[140px]">
                      {problem.concoursTarget}
                    </span>
                  </div>

                  {/* Module Pill */}
                  <div>
                    <span className={`inline-block rounded-lg border px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#3978F6] transition leading-snug line-clamp-3">
                    {problem.title}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-100/80 px-1.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-400 truncate max-w-[130px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Duration, Points & Focus Action */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <Clock size={12} />
                    <span>{problem.recommendedDuration}</span>
                    <span>•</span>
                    <span>{problem.totalPoints} pts</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenProblem(problem.id)
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3978F6] to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:brightness-110 shrink-0"
                  >
                    <ArrowsOut size={13} weight="bold" />
                    <span>Voir le PDF</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
