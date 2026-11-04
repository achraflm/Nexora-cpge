'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  FilePdf,
  DownloadSimple,
  Printer,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOut,
  ArrowsIn,
  Lightbulb,
  CheckCircle,
  WarningCircle,
  Check,
  Star,
  CaretRight,
  Clock,
  Sparkle,
  Fire,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ArrowsCounterClockwise,
  Eye,
  Flag,
  CalendarCheck,
  Lightning,
  Brain,
  Calculator,
  Flask,
  Gear,
  TerminalWindow,
  Books,
  CheckSquare,
  FolderOpen,
  Scroll,
  Trophy,
} from '@phosphor-icons/react'
import { MathFormula } from './MathFormula'
import { ThemeToggle } from './ThemeToggle'
import { NexoraLogo } from './NexoraLogo'
import { Footer } from './Footer'
import GlassFolder, { type ArtPreset } from '@/components/ui/glass-folder-cards'
import GlassmorphicFolderCards, {
  type ConcoursId,
  CONCOURS_METADATA_CONFIG,
} from '@/components/ui/glassmorphic-folder-cards'
import {
  Building2,
  Trophy as LucideTrophy,
  Zap,
  BookOpen as LucideBookOpen,
  Award,
  Shield as LucideShield,
} from 'lucide-react'
import { ConcoursPdfExamViewer, type ExamViewerMode, type ConcoursExamItem } from './ConcoursPdfExamViewer'
import { CONCOURS_ANNALES_DATABASE, type ConcoursEpreuveFull } from '@/lib/concours-annales-database'

export interface CourseExercise {
  id: string
  refCode: string
  source: string
  difficultyStars: number
  title: string
  statement: string
  statementMath?: string[]
  hints: string[]
  solutionSteps: {
    stepTitle: string
    content: string
    math?: string
  }[]
  evalStatus?: 'mastered' | 'with_help' | 'review'
}

export interface QcmQuestion {
  id: string
  questionText: string
  questionMath?: string
  options: { id: string; label: string; math: string }[]
  correctOptionId: string
  explanation: string
  explanationMath?: string
}

export interface CourseSection {
  title: string
  content: string
  mathFormula?: string
  theorems?: {
    title: string
    content: string
    math?: string
  }[]
  trap?: {
    title: string
    content: string
    math?: string
  }
}

export interface CourseItem {
  id: string
  level?: 'sup' | 'spe'
  concoursId?: ConcoursId
  subjectId: 'maths' | 'physique' | 'si' | 'info'
  chapterNumber: number
  title: string
  subTitle: string
  stream: string
  durationEstimate: string
  difficultyStars: number
  summary: string
  pdfInfo: {
    fileName: string
    officialTitle: string
    epreuve: string
    session: string
    duration: string
    totalPages: number
  }
  theorySections: CourseSection[]
  exercises: CourseExercise[]
  qcmQuestions: QcmQuestion[]
}

export interface SubjectItem {
  id: 'maths' | 'physique' | 'si' | 'info'
  name: string
  shortCode: string
  icon: typeof Calculator
  colorClasses: {
    border: string
    bgLight: string
    bgDark: string
    text: string
    badge: string
    accentGradient: string
  }
  coeffs: string
  description: string
}

// --------------------------------------------------------------------------
// 0. CONCOURS DEFINITIONS & DATA (CNC, MINES, CENTRALE, CCINP, X-ENS)
// --------------------------------------------------------------------------
export interface ConcoursItem {
  id: ConcoursId
  name: string
  shortName: string
  country: string
  badgeText: string
  targetSchools: string
  description: string
  streams: string
  accentColor: string
  gradient: string
  badgeBg: string
  cardBorder: string
  icon: React.ComponentType<{ className?: string }>
  logoUrl: string
  logoDarkGlow: string
  logoBorderDark: string
}

export const CONCOURS_LIST: ConcoursItem[] = [
  {
    id: 'cnc',
    name: 'Concours National Commun',
    shortName: 'CNC (Maroc)',
    country: 'Maroc',
    badgeText: 'Maroc • Concours Officiel',
    targetSchools: 'EMI, ENSIAS, INSEA, EHTP, ENSEM, Mines Rabat, IAV, ENSAM...',
    description: 'Le concours national d’excellence des CPGE marocaines ouvrant l’accès aux grandes écoles d’ingénieurs du Royaume.',
    streams: 'MP • PSI • TSI',
    accentColor: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-600 via-indigo-600 to-indigo-900',
    badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    cardBorder: 'hover:border-blue-500/60 dark:hover:border-blue-400/60',
    icon: Award,
    logoUrl: '/logos/concours/cnc.png',
    logoDarkGlow: 'dark:shadow-none',
    logoBorderDark: 'dark:border-blue-400/40',
  },
  {
    id: 'mines',
    name: 'Concours Commun Mines-Ponts',
    shortName: 'Mines-Ponts',
    country: 'France',
    badgeText: 'France • Grandes Écoles Généralistes',
    targetSchools: 'Mines Paris, Ponts ParisTech, Télécom Paris, ISAE-Supaéro, ENSTA Paris, Mines Saint-Étienne...',
    description: 'Concours historique très sélectif regroupant 10 prestigieuses écoles d’ingénieurs généralistes françaises.',
    streams: 'MP • PSI • PC • TSI',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-600 via-teal-600 to-teal-900',
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    cardBorder: 'hover:border-emerald-500/60 dark:hover:border-emerald-400/60',
    icon: Building2,
    logoUrl: '/logos/concours/mines.png',
    logoDarkGlow: 'dark:shadow-none',
    logoBorderDark: 'dark:border-red-400/40',
  },
  {
    id: 'centrale',
    name: 'Concours Centrale-Supélec',
    shortName: 'Centrale',
    country: 'France',
    badgeText: 'France • Groupe des Écoles Centrale',
    targetSchools: 'CentraleSupélec, Centrale Lyon, Centrale Nantes, Centrale Lille, Arts & Métiers, ESTP...',
    description: 'Épreuves scientifiques de haut niveau axées sur la modélisation multiphysique, la rigueur conceptuelle et l’innovation.',
    streams: 'MP • PSI • PC • TSI',
    accentColor: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-600 via-red-600 to-rose-950',
    badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    cardBorder: 'hover:border-rose-500/60 dark:hover:border-rose-400/60',
    icon: Zap,
    logoUrl: '/logos/concours/centrale.webp',
    logoDarkGlow: 'dark:shadow-none',
    logoBorderDark: 'dark:border-amber-400/40',
  },
  {
    id: 'ccinp',
    name: 'Concours Communs INP (CCP)',
    shortName: 'CCINP (ex-CCP)',
    country: 'France',
    badgeText: 'France • Réseau Polytechnique INP',
    targetSchools: 'ENSEEIHT, Ensimag, Grenoble INP Phelma, ENSEIRB-MATMECA, ENSICAEN, Télécom Physique...',
    description: 'Plus de 70 grandes écoles d’ingénieurs spécialisées de référence en informatique, télécoms, électronique et mécanique.',
    streams: 'MP • PSI • PC • TSI',
    accentColor: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-600 via-violet-600 to-indigo-950',
    badgeBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    cardBorder: 'hover:border-purple-500/60 dark:hover:border-purple-400/60',
    icon: LucideBookOpen,
    logoUrl: '/logos/concours/ccinp.png',
    logoDarkGlow: 'dark:shadow-none',
    logoBorderDark: 'dark:border-purple-400/40',
  },
  {
    id: 'x-ens',
    name: 'École Polytechnique & ENS',
    shortName: 'X - ENS',
    country: 'France',
    badgeText: 'France • Sommet de l’Élite Scientifique',
    targetSchools: 'École Polytechnique (l’X), ENS Ulm, ENS Lyon, ENS Paris-Saclay, ENS Rennes...',
    description: 'Le concours scientifique le plus prestigieux et exigeant, axé sur la recherche fondamentale, la créativité et la virtuosité théorique.',
    streams: 'MP • PSI • PC',
    accentColor: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-600 via-orange-600 to-amber-950',
    badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    cardBorder: 'hover:border-amber-500/60 dark:hover:border-amber-400/60',
    icon: LucideTrophy,
    logoUrl: '/logos/concours/x-ens.jpg',
    logoDarkGlow: 'dark:shadow-none',
    logoBorderDark: 'dark:border-blue-400/40',
  },
]

// --------------------------------------------------------------------------
// 1. DATA: 4 MATIÈRES DU CONCOURS
// --------------------------------------------------------------------------
const SUBJECTS: SubjectItem[] = [
  {
    id: 'maths',
    name: 'Mathématiques',
    shortCode: 'MATH',
    icon: Calculator,
    colorClasses: {
      border: 'border-blue-500/40',
      bgLight: 'bg-blue-500/10',
      bgDark: 'dark:bg-blue-500/15',
      text: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
      accentGradient: 'from-blue-600 to-indigo-600',
    },
    coeffs: 'MP: 12 • PSI: 10 • TSI: 10',
    description: 'Algèbre linéaire, réduction, analyse réelle et complexe, séries et espaces euclidiens.',
  },
  {
    id: 'physique',
    name: 'Physique & Chimie',
    shortCode: 'PHYS',
    icon: Flask,
    colorClasses: {
      border: 'border-cyan-500/40',
      bgLight: 'bg-cyan-500/10',
      bgDark: 'dark:bg-cyan-500/15',
      text: 'text-cyan-600 dark:text-cyan-400',
      badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
      accentGradient: 'from-cyan-600 to-blue-600',
    },
    coeffs: 'MP: 10 • PSI: 11 • TSI: 9',
    description: 'Électromagnétisme, thermodynamique, optique ondulatoire et bilans énergétiques.',
  },
  {
    id: 'si',
    name: 'Sciences Industrielles (SI)',
    shortCode: 'SI',
    icon: Gear,
    colorClasses: {
      border: 'border-emerald-500/40',
      bgLight: 'bg-emerald-500/10',
      bgDark: 'dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
      accentGradient: 'from-emerald-600 to-teal-600',
    },
    coeffs: 'MP: 5 • PSI: 9 • TSI: 11',
    description: 'Systèmes asservis linéaires (SLCI), cinématique 3D, torseurs et dynamique.',
  },
  {
    id: 'info',
    name: 'Informatique & Algorithmique',
    shortCode: 'INFO',
    icon: TerminalWindow,
    colorClasses: {
      border: 'border-amber-500/40',
      bgLight: 'bg-amber-500/10',
      bgDark: 'dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
      accentGradient: 'from-amber-600 to-orange-600',
    },
    coeffs: 'MP: 5 • PSI: 4 • TSI: 4',
    description: 'Algorithmique de graphes, programmation dynamique, structures et complexité.',
  },
]

// --------------------------------------------------------------------------
// 2. DATA: COURSES PER MATIÈRE
// --------------------------------------------------------------------------
const COURSES_DATABASE: CourseItem[] = [
  // ==========================================================================
  // COURS DE SUP (1ÈRE ANNÉE CPGE) : MATHS, PHYSIQUE, SI, INFO
  // ==========================================================================
  {
    id: 'maths-sup-complexes',
    level: 'sup',
    subjectId: 'maths',
    chapterNumber: 1,
    title: 'Nombres Complexes, Trigonométrie & Géométrie Vectorielle',
    subTitle: 'Algèbre Fondamentale • CPGE 1ère Année (MPSI / PCSI / PTSI / TSI 1)',
    stream: 'SUP (MPSI / PCSI / PTSI / TSI 1)',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 2,
    summary: 'Formules d’Euler et De Moivre, racines n-ièmes de l’unité, équations algébriques dans C et similitudes directes du plan.',
    pdfInfo: {
      fileName: 'SUP_Maths_Ch1_Nombres_Complexes.pdf',
      officialTitle: 'COURS CPGE 1ÈRE ANNÉE — MATHÉMATIQUES SUP',
      epreuve: 'Chapitre 1 : Nombres Complexes',
      session: 'Programme Officiel SUP',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Formules d’Euler, de Moivre et Racines n-ièmes',
        content:
          'Pour tout z dans C*, l’écriture trigonométrique z = r e^{i theta} avec r > 0 et theta in R permet d’expliciter les puissances et les racines n-ièmes dans le corps des complexes.',
        mathFormula: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta, \\quad \\big(\\cos\\theta + i\\sin\\theta\\big)^n = \\cos(n\\theta) + i\\sin(n\\theta)',
        theorems: [
          {
            title: 'Groupe des Racines n-ièmes de l’unité',
            content:
              'L’ensemble U_n des racines n-ièmes de 1 forme un sous-groupe cyclique d’ordre n de (C*, .), engendré par omega = exp(2i pi / n).',
            math: '\\mathbb{U}_n = \\left\\{ e^{\\frac{2ik\\pi}{n}}, \\; k \\in \\{0, 1, \\dots, n-1\\} \\right\\}, \\quad \\sum_{\\omega \\in \\mathbb{U}_n} \\omega = 0 \\; (n \\ge 2)',
          },
        ],
        trap: {
          title: 'Piège Classique de 1ère Année',
          content:
            'La somme des racines n-ièmes de 1 est strictement nulle dès que n >= 2. Ne pas oublier de vérifier que la raison géométrique omega != 1 avant d’appliquer la formule de somme géométrique.',
          math: '\\sum_{k=0}^{n-1} q^k = \\frac{1 - q^n}{1 - q} \\quad \\text{valable si et seulement si } q \\neq 1',
        },
      },
      {
        title: 'II. Équations Polynomiales et Similitudes Directes',
        content:
          'Toute transformation affine du plan complexe admettant une écriture z\' = a z + b avec a in C* est une similitude directe de rapport |a| et d’angle arg(a).',
        mathFormula: 'f(z) = a z + b, \\quad k = |a|, \\quad \\theta = \\arg(a)',
      },
    ],
    exercises: [
      {
        id: 'exo-sup-cplx-1',
        refCode: 'EXO-SUP-MATH-101',
        source: 'Feuille de TD SUP — Nombres Complexes & Trigonométrie',
        difficultyStars: 2,
        title: 'Calcul de sommes trigonométriques via les exponentielles complexes',
        statement:
          'Pour tout réel x non multiple de 2pi et tout entier naturel n >= 1, calculer explicitement la somme C_n(x) = sum_{k=0}^n cos(k x) et la somme S_n(x) = sum_{k=0}^n sin(k x).',
        statementMath: [
          'C_n(x) = \\sum_{k=0}^n \\cos(kx), \\quad S_n(x) = \\sum_{k=0}^n \\sin(kx)',
          'C_n(x) + i S_n(x) = \\sum_{k=0}^n e^{ikx} = \\frac{1 - e^{i(n+1)x}}{1 - e^{ix}}',
        ],
        hints: [
          'Introduisez la somme géométrique complexe C_n(x) + i S_n(x) = sum_{k=0}^n (e^{ix})^k.',
          'Factorisez le numérateur et le dénominateur par l’exponentielle de l’angle moitié.',
          'Séparez ensuite partie réelle et partie imaginaire.',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Sommation géométrique complexe',
            content:
              'Comme x n’est pas multiple de 2pi, e^{ix} != 1. La somme géométrique de premier terme 1 et de raison e^{ix} donne :',
            math: '\\sum_{k=0}^n e^{ikx} = \\frac{1 - e^{i(n+1)x}}{1 - e^{ix}}',
          },
          {
            stepTitle: 'Étape 2 : Factorisation par l’angle moitié',
            content:
              'En factorisant par e^{i(n+1)x/2} au numérateur et par e^{ix/2} au dénominateur :',
            math: '\\frac{e^{i\\frac{(n+1)x}{2}} \\left( e^{-i\\frac{(n+1)x}{2}} - e^{i\\frac{(n+1)x}{2}} \\right)}{e^{i\\frac{x}{2}} \\left( e^{-i\\frac{x}{2}} - e^{i\\frac{x}{2}} \\right)} = e^{i\\frac{nx}{2}} \\frac{\\sin\\left(\\frac{(n+1)x}{2}\\right)}{\\sin\\left(\\frac{x}{2}\\right)}',
          },
          {
            stepTitle: 'Étape 3 : Identification de C_n(x) et S_n(x)',
            content:
              'En prenant la partie réelle, on obtient la valeur de C_n(x) :',
            math: 'C_n(x) = \\frac{\\cos\\left(\\frac{nx}{2}\\right) \\sin\\left(\\frac{(n+1)x}{2}\\right)}{\\sin\\left(\\frac{x}{2}\\right)}, \\quad S_n(x) = \\frac{\\sin\\left(\\frac{nx}{2}\\right) \\sin\\left(\\frac{(n+1)x}{2}\\right)}{\\sin\\left(\\frac{x}{2}\\right)}',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-sup-cplx-1',
        questionText: 'Soit n >= 2 un entier. Que vaut la somme des n racines n-ièmes complexes de l’unité ?',
        questionMath: 'S = \\sum_{k=0}^{n-1} \\exp\\left( \\frac{2ik\\pi}{n} \\right)',
        options: [
          { id: 'opt-A', label: 'A', math: 'S = 0' },
          { id: 'opt-B', label: 'B', math: 'S = 1' },
          { id: 'opt-C', label: 'C', math: 'S = n' },
          { id: 'opt-D', label: 'D', math: 'S = -1' },
        ],
        correctOptionId: 'opt-A',
        explanation:
          'Il s’agit de la somme des termes d’une suite géométrique de premier terme 1 et de raison omega = e^{2ipi/n} != 1. Comme omega^n = 1, la somme vaut 0.',
        explanationMath: 'S = \\frac{1 - \\omega^n}{1 - \\omega} = 0',
      },
    ],
  },
  {
    id: 'maths-sup-analyse',
    level: 'sup',
    subjectId: 'maths',
    chapterNumber: 2,
    title: 'Analyse Réelle : Continuité, Dérivation & Formule de Taylor-Young',
    subTitle: 'Analyse Réelle Fondamentale • CPGE 1ère Année (MPSI / PCSI / PTSI / TSI 1)',
    stream: 'SUP (MPSI / PCSI / PTSI / TSI 1)',
    durationEstimate: '4h 30 de travail',
    difficultyStars: 3,
    summary: 'Théorème de Rolle, théorème des accroissements finis (TAF), formule de Taylor-Young et développements limités usuels à tout ordre.',
    pdfInfo: {
      fileName: 'SUP_Maths_Ch2_Analyse_Reelle_Taylor.pdf',
      officialTitle: 'COURS CPGE 1ÈRE ANNÉE — MATHÉMATIQUES SUP',
      epreuve: 'Chapitre 2 : Analyse Réelle & Taylor',
      session: 'Programme Officiel SUP',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Théorème de Rolle et Théorème des Accroissements Finis',
        content:
          'Soit f continue sur [a, b] et dérivable sur ]a, b[. S’il existe f(a) = f(b), alors il existe c dans ]a, b[ tel que f\'(c) = 0. Le TAF généralise ce résultat aux sécantes quelconques.',
        mathFormula: '\\exists c \\in ]a, b[, \\quad f(b) - f(a) = f\'(c)(b - a)',
        theorems: [
          {
            title: 'Inégalité des Accroissements Finis (IAF)',
            content:
              'Si |f\'| est bornée par M sur ]a, b[, alors pour tous x, y dans [a, b], on a |f(x) - f(y)| <= M |x - y| (f est M-lipschitzienne).',
            math: '|f(x) - f(y)| \\le M |x - y|',
          },
        ],
      },
      {
        title: 'II. Formule de Taylor-Young & Développements Limités',
        content:
          'Si f est de classe C^n au voisinage de x_0, elle admet un développement limité d’ordre n polynomial au voisinage de x_0.',
        mathFormula: 'f(x) = \\sum_{k=0}^n \\frac{f^{(k)}(x_0)}{k!} (x - x_0)^k + o\\big((x - x_0)^n\\big)',
      },
    ],
    exercises: [
      {
        id: 'exo-sup-ana-1',
        refCode: 'EXO-SUP-MATH-201',
        source: 'Feuille de TD SUP — Dérivation & Accroissements Finis',
        difficultyStars: 3,
        title: 'Encadrement fin du logarithme et divergence de la série harmonique',
        statement:
          'En appliquant le théorème des accroissements finis à la fonction t -> ln(t) sur [k, k+1] pour k >= 1, établir que 1/(k+1) < ln(k+1) - ln(k) < 1/k. En déduire la divergence de la série harmonique.',
        statementMath: [
          '\\frac{1}{k+1} < \\ln(k+1) - \\ln(k) < \\frac{1}{k}, \\quad \\forall k \\ge 1',
          'H_n = \\sum_{k=1}^n \\frac{1}{k} > \\ln(n+1) \\xrightarrow[n \\to +\\infty]{} +\\infty',
        ],
        hints: [
          'La fonction ln est dérivable sur ]0, +inf[ et sa dérivée est 1/t.',
          'Sur [k, k+1], la dérivée 1/t est strictement décroissante.',
          'Sommez l’inégalité pour k allant de 1 à n par télescopage.',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Application du TAF',
            content:
              'La fonction ln est continue sur [k, k+1] et dérivable sur ]k, k+1[. Il existe donc c in ]k, k+1[ tel que ln(k+1) - ln(k) = 1/c.',
            math: '\\exists c \\in ]k, k+1[, \\quad \\ln(k+1) - \\ln(k) = \\frac{1}{c}',
          },
          {
            stepTitle: 'Étape 2 : Encadrement par décroissance de 1/t',
            content:
              'Comme k < c < k+1 et que la fonction t -> 1/t est strictement décroissante sur R+*, on a 1/(k+1) < 1/c < 1/k.',
            math: '\\frac{1}{k+1} < \\ln(k+1) - \\ln(k) < \\frac{1}{k}',
          },
          {
            stepTitle: 'Étape 3 : Télescopage et conclusion',
            content:
              'En sommant de k=1 à n, sum_{k=1}^n (ln(k+1) - ln(k)) = ln(n+1). On en déduit H_n > ln(n+1) -> +inf.',
            math: 'H_n = \\sum_{k=1}^n \\frac{1}{k} > \\ln(n+1) \\implies \\lim_{n \\to +\\infty} H_n = +\\infty',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-sup-ana-1',
        questionText: 'Quel est le développement limité à l’ordre 3 en 0 de f(x) = ln(1 + x) ?',
        questionMath: '\\ln(1+x) = a x + b x^2 + c x^3 + o(x^3)',
        options: [
          { id: 'opt-A', label: 'A', math: 'x - \\frac{x^2}{2} + \\frac{x^3}{3} + o(x^3)' },
          { id: 'opt-B', label: 'B', math: 'x + \\frac{x^2}{2} + \\frac{x^3}{3} + o(x^3)' },
          { id: 'opt-C', label: 'C', math: 'x - \\frac{x^2}{2!} + \\frac{x^3}{3!} + o(x^3)' },
          { id: 'opt-D', label: 'D', math: '1 + x - \\frac{x^2}{2} + o(x^3)' },
        ],
        correctOptionId: 'opt-A',
        explanation:
          'Par la formule de Taylor-Young, les dérivées successives en 0 sont f\'(0)=1, f\'\'(0)=-1, f\'\'\'(0)=2. Ainsi ln(1+x) = x - x^2/2 + x^3/3 + o(x^3).',
        explanationMath: '\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} + o(x^3)',
      },
    ],
  },
  {
    id: 'phys-sup-meca',
    level: 'sup',
    subjectId: 'physique',
    chapterNumber: 1,
    title: 'Mécanique du Point & Oscillateurs Harmoniques Amortis',
    subTitle: 'Mécanique Fondamentale • CPGE 1ère Année (MPSI / PCSI / PTSI / TSI 1)',
    stream: 'SUP (MPSI / PCSI / PTSI / TSI 1)',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 2,
    summary: 'Principe fondamental de la dynamique (PFD), théorèmes de l’énergie cinétique et mécanique, oscillateur harmonique amorti et résonance.',
    pdfInfo: {
      fileName: 'SUP_Physique_Ch1_Mecanique_Point_Oscillateur.pdf',
      officialTitle: 'COURS CPGE 1ÈRE ANNÉE — PHYSIQUE SUP',
      epreuve: 'Chapitre 1 : Mécanique & Oscillateurs',
      session: 'Programme Officiel SUP',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. PFD et Théorèmes Énergétiques',
        content:
          'Dans un référentiel galiléen, la résultante des forces appliquées à un point matériel M de masse m constante est égale au produit de m par son vecteur accélération.',
        mathFormula: 'm \\frac{d\\vec{v}}{dt} = \\sum \\vec{F}_{\\text{ext}}, \\quad \\Delta E_c = W_{A \\to B}(\\sum \\vec{F})',
      },
      {
        title: 'II. Oscillateur Harmonique Amorti en Régime Libre',
        content:
          'L’équation différentielle canonique s’écrit d^2 x / dt^2 + (omega_0 / Q) dx/dt + omega_0^2 x = 0. Selon la valeur du facteur de qualité Q, on observe un régime pseudo-périodique, critique ou apériodique.',
        mathFormula: '\\ddot{x} + \\frac{\\omega_0}{Q} \\dot{x} + \\omega_0^2 x = 0, \\quad \\Delta = \\omega_0^2 \\left( \\frac{1}{4Q^2} - 1 \\right)',
      },
    ],
    exercises: [
      {
        id: 'exo-sup-phys-1',
        refCode: 'EXO-SUP-PHYS-101',
        source: 'TD SUP — Oscillateur Mécanique Amorti',
        difficultyStars: 2,
        title: 'Étude d’un mobile attaché à un ressort horizontal avec amortissement fluide',
        statement:
          'Un mobile de masse m = 200g est relié à un ressort de raideur k = 50 N/m et subit une force de frottement visqueux f = -h v. Déterminer la valeur du coefficient h_c correspondant au régime critique.',
        statementMath: [
          'm \\ddot{x} + h \\dot{x} + k x = 0 \\implies \\ddot{x} + 2\\lambda \\dot{x} + \\omega_0^2 x = 0',
          'h_c = 2 \\sqrt{k m}',
        ],
        hints: [
          'Identifiez la pulsation propre omega_0 = sqrt(k/m) et le coefficient d’amortissement 2 lambda = h/m.',
          'Le discriminant de l’équation caractéristique s’annule dans le régime critique : lambda^2 - omega_0^2 = 0.',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Équation caractéristique',
            content:
              'L’équation caractéristique associée est r^2 + (h/m) r + (k/m) = 0. Son discriminant est Delta = (h/m)^2 - 4k/m.',
            math: '\\Delta = \\left(\\frac{h}{m}\\right)^2 - \\frac{4k}{m}',
          },
          {
            stepTitle: 'Étape 2 : Condition de régime critique',
            content:
              'Le régime critique correspond à Delta = 0, d’où h_c = 2 sqrt(k m). Avec m = 0.2 kg et k = 50 N/m, h_c = 2 sqrt(10) ~ 6.32 kg/s.',
            math: 'h_c = 2 \\sqrt{50 \\times 0.2} = 2 \\sqrt{10} \\approx 6.32 \\text{ N}\\cdot\\text{s}\\cdot\\text{m}^{-1}',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-sup-phys-1',
        questionText: 'Pour un oscillateur harmonique amorti de pulsation propre omega_0 et de facteur de qualité Q, le régime est pseudo-périodique si et seulement si :',
        questionMath: 'Q > ?',
        options: [
          { id: 'opt-A', label: 'A', math: 'Q > 1/2' },
          { id: 'opt-B', label: 'B', math: 'Q < 1/2' },
          { id: 'opt-C', label: 'C', math: 'Q = 1' },
          { id: 'opt-D', label: 'D', math: 'Q > 1' },
        ],
        correctOptionId: 'opt-A',
        explanation:
          'Le discriminant Delta = omega_0^2 (1/(4Q^2) - 1) est strictement négatif lorsque 1/(4Q^2) < 1, soit Q > 1/2. C’est la condition d’existence des oscillations amorties.',
        explanationMath: 'Q > \\frac{1}{2} \\iff \\text{Régime pseudo-périodique}',
      },
    ],
  },
  {
    id: 'si-sup-cine',
    level: 'sup',
    subjectId: 'si',
    chapterNumber: 1,
    title: 'Modélisation Cinématique & Schémas Cinématiques Normalisés',
    subTitle: 'Sciences Industrielles • CPGE 1ère Année (PTSI / PCSI / MPSI / TSI 1)',
    stream: 'SUP (PTSI / PCSI / MPSI / TSI 1)',
    durationEstimate: '3h 30 de travail',
    difficultyStars: 2,
    summary: 'Liaisons mécaniques normalisées, degrés de liberté, torseurs cinématiques, champ des vecteurs vitesse et loi de composition des mouvements.',
    pdfInfo: {
      fileName: 'SUP_SI_Ch1_Cinematique_Liaisons_Torseurs.pdf',
      officialTitle: 'COURS CPGE 1ÈRE ANNÉE — SCIENCES INDUSTRIELLES SUP',
      epreuve: 'Chapitre 1 : Modélisation Cinématique',
      session: 'Programme Officiel SUP',
      duration: '3h30',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Liaisons Normalisées & Degrés de Liberté',
        content:
          'Une liaison mécanique entre deux solides parfaits supprime un certain nombre de degrés de liberté (de 1 à 6). On distingue les liaisons ponctuelles, linéaires, surfaciques et d’encastrement.',
        mathFormula: 'N_c + N_d = 6, \\quad N_d \\in \\{0, 1, 2, 3, 4, 5\\}',
      },
      {
        title: 'II. Torseur Cinématique et Formule de Varignon',
        content:
          'Le champ des vecteurs vitesse d’un solide indéformable est équiprojectif et se représente en tout point A par son torseur cinématique.',
        mathFormula: '\\{ \\mathcal{V}(S/R) \\} = \\begin{Bmatrix} \\vec{\\Omega}(S/R) \\\\ \\vec{V}(A \\in S/R) \\end{Bmatrix}_A, \\quad \\vec{V}(B) = \\vec{V}(A) + \\vec{\\Omega} \\wedge \\vec{AB}',
      },
    ],
    exercises: [
      {
        id: 'exo-sup-si-1',
        refCode: 'EXO-SUP-SI-101',
        source: 'TD SUP — Cinématique du Solide Indéformable',
        difficultyStars: 2,
        title: 'Torseur cinématique d’un système bielle-manivelle',
        statement:
          'Soit un mécanisme bielle-manivelle plan. La manivelle OA de longueur R tourne à vitesse angulaire omega constante autour de l’axe (O, z). Déterminer le vecteur vitesse du point A appartenant à la manivelle par rapport au bâti.',
        statementMath: [
          '\\vec{V}(A \\in 1/0) = \\vec{\\Omega}(1/0) \\wedge \\vec{OA} = \\omega \\vec{z}_0 \\wedge R \\vec{x}_1 = R \\omega \\vec{y}_1',
        ],
        hints: [
          'La liaison entre le solide 1 (manivelle) et le solide 0 (bâti) est une liaison pivot d’axe (O, z). Donc V(O in 1/0) = 0.',
          'Appliquez la relation de Varignon entre le point O et le point A.',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Vitesse au centre de rotation',
            content:
              'Le point O étant sur l’axe de la liaison pivot reliant le solide 1 au bâti 0, sa vitesse est nulle : V(O in 1/0) = 0.',
            math: '\\vec{V}(O \\in 1/0) = \\vec{0}',
          },
          {
            stepTitle: 'Étape 2 : Relation de transport (Varignon)',
            content:
              'Par la relation de Varignon : V(A in 1/0) = V(O in 1/0) + Omega(1/0) ^ OA. Avec Omega = omega z_0 et OA = R x_1, on a V(A in 1/0) = R omega y_1.',
            math: '\\vec{V}(A \\in 1/0) = \\omega \\vec{z}_0 \\wedge R \\vec{x}_1 = R \\omega \\vec{y}_1',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-sup-si-1',
        questionText: 'Combien de degrés de liberté autorise une liaison pivot d’axe (O, z) ?',
        questionMath: 'N_d(\\text{pivot}) = ?',
        options: [
          { id: 'opt-A', label: 'A', math: '1 \\text{ rotation}' },
          { id: 'opt-B', label: 'B', math: '1 \\text{ translation}' },
          { id: 'opt-C', label: 'C', math: '2 \\text{ mobilités}' },
          { id: 'opt-D', label: 'D', math: '0 \\text{ mobilité}' },
        ],
        correctOptionId: 'opt-A',
        explanation:
          'Une liaison pivot d’axe z bloque les 3 translations et les rotations autour de x et y. Elle n’autorise qu’un unique degré de liberté : la rotation d’axe z.',
        explanationMath: 'N_d = 1 \\; (R_z), \\quad N_c = 5',
      },
    ],
  },
  {
    id: 'info-sup-algo',
    level: 'sup',
    subjectId: 'info',
    chapterNumber: 1,
    title: 'Algorithmique Fondamentale & Récursivité en Python',
    subTitle: 'Informatique Commune • CPGE 1ère Année (Toutes Filières)',
    stream: 'SUP (MPSI / PCSI / PTSI / TSI 1)',
    durationEstimate: '3h 30 de travail',
    difficultyStars: 2,
    summary: 'Structures de contrôle, récursivité terminale, invariants de boucle, recherche dichotomique et tris de complexité O(n log n).',
    pdfInfo: {
      fileName: 'SUP_Info_Ch1_Algorithmique_Recursivite.pdf',
      officialTitle: 'COURS CPGE 1ÈRE ANNÉE — INFORMATIQUE COMMUNE SUP',
      epreuve: 'Chapitre 1 : Algorithmes & Complexité',
      session: 'Programme Officiel SUP',
      duration: '3h30',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Invariant de Boucle et Terminaison',
        content:
          'Pour prouver la correction d’un algorithme impératif, on utilise un variant de boucle (entier strictement décroissant minoré pour la terminaison) et un invariant de boucle (propriété logique vraie avant, pendant et après pour la correction).',
        mathFormula: 'v_{k+1} < v_k \\quad \\text{et} \\quad v_k \\ge 0 \\implies \\text{Terminaison de la boucle}',
      },
      {
        title: 'II. Recherche Dichotomique et Tri Fusion',
        content:
          'La recherche dichotomique réduit la taille de recherche par deux à chaque étape, garantissant une complexité temporelle logarithmique O(log n). Le tri fusion opère par diviser pour régner en O(n log n).',
        mathFormula: 'T(n) = 2 T(n/2) + O(n) \\implies T(n) = O(n \\log n)',
      },
    ],
    exercises: [
      {
        id: 'exo-sup-info-1',
        refCode: 'EXO-SUP-INFO-101',
        source: 'TD SUP — Complexité et Algorithmes Fondamentaux',
        difficultyStars: 2,
        title: 'Preuve de terminaison et de complexité de la recherche dichotomique',
        statement:
          'On considère une liste triée L de taille n et un élément cible x. Écrire la fonction Python dichotomie(L, x) et prouver que le nombre de comparaisons est au plus ceil(log2(n)) + 1.',
        statementMath: [
          '\\text{dichotomie}(L, x) \\implies T(n) = O(\\log_2 n)',
        ],
        hints: [
          'Définissez les indices gauche et droite. La longueur de l’intervalle droite - gauche + 1 est le variant de boucle.',
          'À chaque itération, l’intervalle est divisé par 2.',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Code Python canonique',
            content:
              'La fonction initialise g = 0 et d = len(L) - 1. Tant que g <= d, m = (g + d) // 2. Si L[m] == x, return m. Sinon si L[m] < x, g = m + 1, sinon d = m - 1.',
            math: 'm = \\lfloor (g + d) / 2 \\rfloor',
          },
          {
            stepTitle: 'Étape 2 : Variant et complexité',
            content:
              'Le variant entier v = d - g + 1 décroît strictement d’au moins un facteur 2 à chaque étape. Le nombre d’itérations maximales vérifie 2^k >= n, soit k = ceil(log2(n)).',
            math: 'k = \\lceil \\log_2(n) \\rceil \\implies T(n) = O(\\log n)',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-sup-info-1',
        questionText: 'Quelle est la complexité temporelle dans le pire des cas de l’algorithme de tri fusion (Merge Sort) pour une liste de taille n ?',
        questionMath: 'T(n) = ?',
        options: [
          { id: 'opt-A', label: 'A', math: 'O(n \\log n)' },
          { id: 'opt-B', label: 'B', math: 'O(n^2)' },
          { id: 'opt-C', label: 'C', math: 'O(n)' },
          { id: 'opt-D', label: 'D', math: 'O(\\log n)' },
        ],
        correctOptionId: 'opt-A',
        explanation:
          'Le tri fusion divise la liste en deux moitiés, les trie récursivement et les fusionne en temps linéaire O(n). La relation de récurrence T(n) = 2T(n/2) + O(n) donne par le théorème maître T(n) = O(n log n).',
        explanationMath: 'T(n) = \\Theta(n \\log n)',
      },
    ],
  },
  // ==========================================================================
  // COURS DE SPÉ (2ÈME ANNÉE CPGE) : MATHS, PHYSIQUE, SI, INFO
  // ==========================================================================
  // ==============================
  // MATHÉMATIQUES — COURS 1 (SPÉ)
  // ==============================
  {
    id: 'maths-reduc',
    concoursId: 'cnc',
    subjectId: 'maths',
    chapterNumber: 1,
    title: 'Réduction des Endomorphismes & Décomposition Spectrale',
    subTitle: 'Algèbre Linéaire • Concours CNC MP / PSI / TSI',
    stream: 'CNC MP / PSI / TSI',
    durationEstimate: '4h 30 de travail',
    difficultyStars: 3,
    summary: 'Polynômes caractéristiques et minimaux, lemme des noyaux, critères de diagonalisabilité et projecteurs spectraux.',
    pdfInfo: {
      fileName: 'CNC_MP_2022_Reduction_Endomorphismes.pdf',
      officialTitle: 'CONCOURS NATIONAL COMMUN (CNC) — FILIÈRE MP & PSI',
      epreuve: 'Épreuve de Mathématiques I',
      session: 'Session 2022',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Sous-espaces caractéristiques et polynômes annulateurs',
        content:
          'Soit E un espace vectoriel de dimension finie n >= 1 sur le corps K (R ou C), et u dans L(E). L’ensemble des polynômes annulateurs de u est un idéal non nul de K[X], engendré par un unique polynôme unitaire noté pi_u, appelé polynôme minimal de u.',
        mathFormula: '\\pi_u(X) = \\min \\{ P \\in K[X] \\text{ unitaire } : P(u) = 0_{\\mathcal{L}(E)} \\}',
        theorems: [
          {
            title: 'Théorème Fondamental (Lemme de décomposition des noyaux)',
            content:
              'Soient P_1, P_2, ..., P_k des polynômes de K[X] deux à deux premiers entre eux, et P = P_1 * P_2 * ... * P_k. Alors le noyau de P(u) est somme directe des noyaux des P_i(u) :',
            math: '\\ker\\big(P(u)\\big) = \\bigoplus_{i=1}^k \\ker\\big(P_i(u)\\big)',
          },
          {
            title: 'Caractérisation Spectrale',
            content:
              'De plus, pour chaque indice i, la projection sur ker(P_i(u)) parallèlement aux autres composantes est un polynôme en u.',
            math: 'p_i = Q_i(u) \\in \\mathbb{K}[u], \\quad \\sum_{i=1}^k p_i = \\text{id}_E',
          },
        ],
        trap: {
          title: 'Piège Classique du Concours National Commun (CNC)',
          content:
            'Attention à ne jamais confondre « polynôme caractéristique scindé » et « diagonalisable ». Une matrice unipotente non triviale a son polynôme caractéristique scindé sur R, mais n’est pas diagonalisable car la multiplicité géométrique est strictement inférieure à la multiplicité algébrique.',
          math: 'M = \\begin{pmatrix} 1 & 1 \\\\ 0 & 1 \\end{pmatrix} \\implies \\chi_M(X) = (X - 1)^2, \\quad \\dim\\ker(M - I_2) = 1 < 2',
        },
      },
      {
        title: 'II. Critères fondamentaux de diagonalisabilité',
        content:
          'Pour un endomorphisme u dans L(E), les conditions suivantes sont rigoureusement équivalentes :',
        theorems: [
          {
            title: 'Critère par le polynôme minimal',
            content:
              'u est diagonalisable sur K si et seulement si son polynôme minimal pi_u(X) est scindé à racines simples sur K.',
            math: 'u \\in \\mathcal{D}(E) \\iff \\pi_u(X) = \\prod_{i=1}^p (X - \\lambda_i), \\quad \\lambda_i \\text{ deux à deux distincts}',
          },
          {
            title: 'Critère par les multiplicités géométriques',
            content:
              'u est diagonalisable ssi chi_u est scindé sur K et pour toute valeur propre lambda, la multiplicité algébrique m_lambda égale la dimension du sous-espace propre associé.',
            math: '\\forall \\lambda \\in \\text{Sp}(u), \\quad \\dim\\ker(u - \\lambda \\text{id}_E) = m_\\lambda',
          },
        ],
      },
    ],
    exercises: [
      {
        id: 'exo-math-1',
        refCode: 'EXO-MP-MATH-204',
        source: 'Extrait CNC MP 2022 — Mathématiques I',
        difficultyStars: 3,
        title: 'Décomposition spectrale et diagonalisabilité d’un projecteur généralisé',
        statement:
          'Soit E un C-espace vectoriel de dimension finie n >= 1 et u dans L(E). On suppose que le polynôme P(X) = (X - 1)(X - 2)(X - 3) annule l’endomorphisme u.',
        statementMath: [
          'P(u) = (u - \\text{id}_E) \\circ (u - 2\\text{id}_E) \\circ (u - 3\\text{id}_E) = 0_{\\mathcal{L}(E)}',
          'E = \\ker(u - \\text{id}_E) \\oplus \\ker(u - 2\\text{id}_E) \\oplus \\ker(u - 3\\text{id}_E)',
        ],
        hints: [
          'Examinez la nature des racines du polynôme annulateur P(X) dans le corps C (sont-elles réelles ? simples ?).',
          'Appliquez le lemme de décomposition des noyaux aux polynômes P_1 = X - 1, P_2 = X - 2 et P_3 = X - 3 deux à deux premiers entre eux.',
          'Concluez sur la diagonalisabilité de u en reliant la somme des dimensions des sous-espaces propres à dim(E).',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Racines du polynôme annulateur',
            content:
              'Le polynôme P(X) = (X-1)(X-2)(X-3) est un polynôme annulateur de u. Ses racines sont {1, 2, 3}, toutes de multiplicité 1 dans C (et dans R). Par conséquent, P(X) est scindé à racines simples sur R.',
            math: '\\text{Racines}(P) = \\{1, 2, 3\\} \\subset \\mathbb{R}, \\quad \\mu_k = 1',
          },
          {
            stepTitle: 'Étape 2 : Application du Lemme des Noyaux',
            content:
              'Les polynômes (X - 1), (X - 2) et (X - 3) sont deux à deux premiers entre eux car leurs racines sont distinctes. D’après le théorème de décomposition des noyaux (lemme des noyaux) :',
            math: '\\ker(P(u)) = \\ker(u - \\text{id}_E) \\oplus \\ker(u - 2\\text{id}_E) \\oplus \\ker(u - 3\\text{id}_E)',
          },
          {
            stepTitle: 'Étape 3 : Conclusion sur la somme directe et la diagonalisabilité',
            content:
              'Comme P(u) = 0, ker(P(u)) = E. Ainsi, l’espace E est somme directe des sous-espaces propres associés aux valeurs propres lambda in {1, 2, 3}. L’endomorphisme u est donc diagonalisable.',
            math: 'E = \\bigoplus_{\\lambda \\in \\text{Sp}(u)} E_\\lambda(u) \\implies u \\in \\mathcal{D}(E)',
          },
        ],
      },
      {
        id: 'exo-math-2',
        refCode: 'EXO-PSI-MATH-118',
        source: 'Extrait CNC PSI 2021 — Mathématiques II',
        difficultyStars: 4,
        title: 'Co-diagonalisation simultanée d’une famille d’endomorphismes commutants',
        statement:
          'Soient u et v deux endomorphismes diagonalisables d’un K-espace vectoriel E de dimension finie n. On suppose que u et v commutent, c’est-à-dire que u o v = v o u. Démontrer qu’il existe une base commune de diagonalisation.',
        statementMath: [
          'u \\circ v = v \\circ u, \\quad u \\in \\mathcal{D}(E), \\; v \\in \\mathcal{D}(E)',
          '\\exists \\mathcal{B} \\text{ base de } E \\; / \\; \\text{Mat}_{\\mathcal{B}}(u) \\text{ et } \\text{Mat}_{\\mathcal{B}}(v) \\text{ sont diagonales}',
        ],
        hints: [
          'Montrez d’abord que chaque sous-espace propre E_lambda(u) de u est stable par v.',
          'Considérez la restriction v|_{E_lambda(u)} et justifiez qu’elle reste diagonalisable.',
          'Recollez les bases de diagonalisation des sous-espaces stables pour former une base globale de E.',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Stabilité des sous-espaces propres',
            content:
              'Soit x in E_lambda(u), on a u(v(x)) = (u o v)(x) = (v o u)(x) = v(lambda x) = lambda v(x). Donc v(x) in E_lambda(u). Le sous-espace propre E_lambda(u) est stable par v.',
            math: '\\forall \\lambda \\in \\text{Sp}(u), \\quad v\\big(E_\\lambda(u)\\big) \\subseteq E_\\lambda(u)',
          },
          {
            stepTitle: 'Étape 2 : Diagonalisabilité des endomorphismes induits',
            content:
              'Puisque v est diagonalisable, il admet un polynôme annulateur Q scindé à racines simples. Ce même Q annule l’endomorphisme induit v_lambda, qui est donc diagonalisable.',
            math: 'Q(v) = 0 \\implies Q(v_{|E_\\lambda(u)}) = 0 \\implies v_{|E_\\lambda(u)} \\text{ diagonalisable}',
          },
          {
            stepTitle: 'Étape 3 : Concaténation de la base adaptée',
            content:
              'Pour chaque lambda, il existe une base B_lambda de E_lambda(u) formée de vecteurs propres de v. La réunion de ces bases forme une base de E formée de vecteurs propres communs à u et v.',
          },
        ],
      },
      {
        id: 'exo-math-3',
        refCode: 'EXO-TSI-MATH-092',
        source: 'Extrait CNC TSI 2023 — Épreuve Commune',
        difficultyStars: 2,
        title: 'Caractérisation par les multiplicités géométriques et algébriques',
        statement:
          'Soit M une matrice carrée d’ordre 3 dont le polynôme caractéristique est chi_M(X) = (X - 2)^2 (X + 1). Donner une condition nécessaire et suffisante portant sur le rang de (M - 2 I_3) pour que M soit diagonalisable.',
        statementMath: [
          '\\chi_M(X) = (X - 2)^2(X + 1)',
          'M \\in \\mathcal{M}_3(\\mathbb{R}) \\text{ est diagonalisable } \\iff \\dim \\ker(M - 2I_3) = 2',
        ],
        hints: [
          'Rappelez la condition de diagonalisabilité : la dimension de chaque sous-espace propre doit être égale à la multiplicité algébrique.',
          'Utilisez le théorème du rang pour lier dim ker(M - 2 I_3) et rg(M - 2 I_3).',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Analyse des multiplicités algébriques',
            content:
              'La valeur propre 2 a pour multiplicité algébrique m_2 = 2. La valeur propre -1 a pour multiplicité m_{-1} = 1 (donc son sous-espace propre est toujours de dimension 1).',
          },
          {
            stepTitle: 'Étape 2 : Condition sur le rang',
            content:
              'M est diagonalisable ssi dim ker(M - 2 I_3) = 2. Par le théorème du rang : rg(M - 2 I_3) = 3 - dim ker(M - 2 I_3) = 3 - 2 = 1.',
            math: 'M \\in \\mathcal{D}_3(\\mathbb{R}) \\iff \\text{rg}(M - 2I_3) = 1',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-math-1',
        questionText:
          'Soit u un endomorphisme d’un R-espace vectoriel de dimension n. Laquelle des assertions suivantes est une condition nécessaire et suffisante pour que u soit diagonalisable sur R ?',
        questionMath: 'u \\in \\mathcal{L}(E), \\quad \\dim(E) = n',
        options: [
          { id: 'opt-A', label: 'A', math: '\\chi_u(X) \\text{ est scindé sur } \\mathbb{R}' },
          { id: 'opt-B', label: 'B', math: '\\pi_u(X) \\text{ est scindé à racines simples sur } \\mathbb{R}' },
          { id: 'opt-C', label: 'C', math: '\\operatorname{Tr}(u) = n \\; \\text{ et } \\; \\det(u) \\neq 0' },
          { id: 'opt-D', label: 'D', math: '\\forall \\lambda \\in \\text{Sp}(u), \\; \\dim \\ker(u - \\lambda \\text{id}_E) = 1' },
        ],
        correctOptionId: 'opt-B',
        explanation:
          'Théorème fondamental de réduction : Un endomorphisme u est diagonalisable sur un corps K si et seulement si son polynôme minimal pi_u est scindé à racines simples sur K. La condition A n’est que nécessaire.',
        explanationMath: 'u \\in \\mathcal{D}(E) \\iff \\pi_u(X) = \\prod_{i=1}^p (X - \\lambda_i), \\quad \\lambda_i \\text{ distincts}',
      },
    ],
  },

  // ==============================
  // MATHÉMATIQUES — COURS 2
  // ==============================
  {
    id: 'maths-series',
    concoursId: 'cnc',
    subjectId: 'maths',
    chapterNumber: 2,
    title: 'Séries Entières, Rayon de Convergence & Séries de Fourier',
    subTitle: 'Analyse Réelle et Complexe • CNC MP / PSI',
    stream: 'CNC MP / PSI',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 3,
    summary: 'Règle de d’Alembert, lemme d’Abel, développement en série entière et formule de Parseval sur les polynômes trigonométriques.',
    pdfInfo: {
      fileName: 'CNC_MP_2023_Series_Entieres_Fourier.pdf',
      officialTitle: 'CONCOURS NATIONAL COMMUN — FILIÈRE MP',
      epreuve: 'Épreuve de Mathématiques II',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Rayon de convergence et lemme d’Abel',
        content:
          'Pour toute série entière sum a_n z^n, il existe un unique R dans [0, +inf] tel que la série converge absolument pour |z| < R et diverge grossièrement pour |z| > R.',
        mathFormula: 'R = \\sup \\{ r \\ge 0 \\; : \\; (|a_n| r^n)_{n \\in \\mathbb{N}} \\text{ est bornée} \\}',
        theorems: [
          {
            title: 'Lemme d’Abel Fondamental',
            content:
              'S’il existe z_0 != 0 tel que la suite (|a_n| |z_0|^n) soit bornée, alors pour tout z tel que |z| < |z_0|, la série sum a_n z^n converge absolument.',
            math: '|z| < |z_0| \\implies \\sum_{n=0}^{+\\infty} a_n z^n \\text{ converge absolument}',
          },
        ],
      },
      {
        title: 'II. Séries de Fourier et Identité de Parseval',
        content:
          'Pour une fonction 2pi-périodique continue par morceaux sur R, les coefficients de Fourier complexes c_n(f) satisfont l’égalité d’énergie de Parseval.',
        mathFormula: '\\frac{1}{2\\pi} \\int_0^{2\\pi} |f(t)|^2 \\, dt = \\sum_{n=-\\infty}^{+\\infty} |c_n(f)|^2',
      },
    ],
    exercises: [
      {
        id: 'exo-series-1',
        refCode: 'EXO-MP-MATH-310',
        source: 'Extrait CNC MP 2023 — Mathématiques II',
        difficultyStars: 3,
        title: 'Calcul du rayon de convergence et de la somme d’une série lacunaire',
        statement:
          'Déterminer le rayon de convergence R de la série entière sum_{n=1}^{+inf} (n^2 / 2^n) * x^{2n}, puis expliciter sa somme pour x dans ]-R, R[.',
        statementMath: ['S(x) = \\sum_{n=1}^{+\\infty} \\frac{n^2}{2^n} x^{2n}'],
        hints: [
          'Posez le changement de variable u = x^2 / 2 pour vous ramener à une série entière usuelle sum n^2 u^n.',
          'Exprimez sum n^2 u^n à l’aide des dérivées successives de la série géométrique sum u^n.',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Rayon de convergence',
            content:
              'Par la règle de d’Alembert sur la variable u = x^2/2, le rayon par rapport à u est R_u = 1. Donc x^2/2 < 1 <=> |x| < sqrt(2). Le rayon est R = sqrt(2).',
            math: 'R = \\sqrt{2}',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-series-1',
        questionText:
          'Quel est le rayon de convergence R de la série entière sum_{n=0}^{+inf} n! * z^n ?',
        questionMath: '\\sum_{n=0}^{+\\infty} n! \\, z^n',
        options: [
          { id: 'opt-A', label: 'A', math: 'R = +\\infty' },
          { id: 'opt-B', label: 'B', math: 'R = 1' },
          { id: 'opt-C', label: 'C', math: 'R = 0' },
          { id: 'opt-D', label: 'D', math: 'R = e' },
        ],
        correctOptionId: 'opt-C',
        explanation:
          'Par d’Alembert, |a_{n+1}/a_n| = (n+1)! / n! = n+1 -> +inf. Donc le rayon est R = 1 / (+inf) = 0.',
      },
    ],
  },

  // ==============================
  // PHYSIQUE & CHIMIE — COURS 1
  // ==============================
  {
    id: 'phys-maxwell',
    concoursId: 'cnc',
    subjectId: 'physique',
    chapterNumber: 1,
    title: 'Électromagnétisme : Équations de Maxwell & Propagation d’Ondes',
    subTitle: 'Électrodynamique Fondamentale • CNC MP / PSI',
    stream: 'CNC MP / PSI',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 4,
    summary: 'Les 4 équations de Maxwell locales, l’équation de d’Alembert, le vecteur de Poynting et la réflexion des ondes planes sur les conducteurs.',
    pdfInfo: {
      fileName: 'CNC_PSI_2023_Electromagnetisme_Maxwell.pdf',
      officialTitle: 'CONCOURS NATIONAL COMMUN — FILIÈRE PSI & MP',
      epreuve: 'Épreuve de Physique I',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Les 4 Équations de Maxwell locales',
        content:
          'Dans un milieu de permittivité epsilon_0 et perméabilité mu_0, les champs vectoriels E et B obéissent aux 4 équations locales fondamentales de Maxwell :',
        theorems: [
          {
            title: 'Maxwell-Gauss & Maxwell-Thomson',
            content: 'Flux du champ électrique et conservation du flux magnétique :',
            math: '\\vec{\\nabla} \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}, \\qquad \\vec{\\nabla} \\cdot \\vec{B} = 0',
          },
          {
            title: 'Maxwell-Faraday & Maxwell-Ampère',
            content: 'Induction électromagnétique et terme de courant de déplacement de Maxwell :',
            math: '\\vec{\\nabla} \\wedge \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}, \\qquad \\vec{\\nabla} \\wedge \\vec{B} = \\mu_0 \\vec{j} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}',
          },
        ],
        trap: {
          title: 'Piège Fréquent du Concours CNC en Physique',
          content:
            'Dans le vide (rho = 0 et j = 0), ne pas oublier que l’application du rotationnel à Maxwell-Faraday combinée à la formule du double produit vectoriel conduit directement à l’équation de d’Alembert.',
          math: '\\Delta \\vec{E} - \\frac{1}{c^2} \\frac{\\partial^2 \\vec{E}}{\\partial t^2} = \\vec{0}, \\quad c = \\frac{1}{\\sqrt{\\varepsilon_0 \\mu_0}}',
        },
      },
    ],
    exercises: [
      {
        id: 'exo-phys-1',
        refCode: 'EXO-PSI-PHYS-101',
        source: 'Extrait CNC PSI 2023 — Physique I',
        difficultyStars: 3,
        title: 'Structure d’une Onde Plane Progressive Monochromatique (OPPM)',
        statement:
          'Une OPPM de pulsation omega et de vecteur d’onde k = k u_z se propage dans le vide selon l’axe (Oz). Le champ électrique est polarisé rectilignement selon (Ox) : E(z,t) = E_0 cos(omega t - k z) u_x. Déterminer l’expression du champ magnétique B(z,t) et le vecteur de Poynting moyen.',
        hints: [
          'Utilisez la relation de structure issue de l’équation de Maxwell-Faraday : B = (k ^ E) / omega.',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Calcul du champ magnétique associé',
            content:
              'Dans une OPPM dans le vide, B est orthogonal à E et à la direction de propagation k. On a B(z,t) = (E_0 / c) cos(omega t - k z) u_y.',
            math: '\\vec{B}(z,t) = \\frac{E_0}{c} \\cos(\\omega t - k z) \\, \\vec{u}_y',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-phys-1',
        questionText:
          'Dans une onde plane progressive monochromatique se propageant dans le vide selon le vecteur k, quelle relation lie E et B à chaque instant ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\\vec{B} = \\frac{\\vec{k} \\wedge \\vec{E}}{\\omega}' },
          { id: 'opt-B', label: 'B', math: '\\vec{E} = \\frac{\\vec{k} \\wedge \\vec{B}}{\\omega}' },
          { id: 'opt-C', label: 'C', math: '\\vec{B} = c \\, \\vec{E}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'Dans le vide, B = (k ^ E) / omega.',
      },
    ],
  },

  // ==============================
  // SCIENCES INDUSTRIELLES (SI) — COURS 1
  // ==============================
  {
    id: 'si-slci',
    concoursId: 'cnc',
    subjectId: 'si',
    chapterNumber: 1,
    title: 'Systèmes Asservis Linéaires Continus (SLCI) & Correction',
    subTitle: 'Automatique & Modélisation • CNC PSI / TSI',
    stream: 'CNC PSI / TSI',
    durationEstimate: '3h 30 de travail',
    difficultyStars: 3,
    summary: 'Transformée de Laplace, fonction de transfert en boucle ouverte et fermée, marges de stabilité (phase et gain) et réglage des correcteurs PI/PID.',
    pdfInfo: {
      fileName: 'CNC_PSI_2022_SI_SLCI_Correcteurs.pdf',
      officialTitle: 'CONCOURS NATIONAL COMMUN — FILIÈRE PSI & TSI',
      epreuve: 'Épreuve de Sciences Industrielles',
      session: 'Session 2022',
      duration: '4 heures',
      totalPages: 3,
    },
    theorySections: [
      {
        title: 'I. Fonction de Transfert en Boucle Fermée & Critères de Stabilité',
        content:
          'Pour un système asservi à retour unitaire de chaîne directe C(p)*G(p), la fonction de transfert en boucle fermée H_BF(p) détermine la stabilité et la rapidité du système.',
        mathFormula: 'H_{BF}(p) = \\frac{C(p) G(p)}{1 + C(p) G(p)}',
      },
    ],
    exercises: [
      {
        id: 'exo-si-1',
        refCode: 'EXO-PSI-SI-204',
        source: 'Extrait CNC PSI 2022 — Sciences Industrielles',
        difficultyStars: 3,
        title: 'Dimensionnement d’un correcteur PI pour axe numérique',
        statement:
          'Soit un procédé de transfert G(p) = 4 / (1 + 0.2 p). On insère en amont un correcteur C(p) = K_p (1 + T_i p) / (T_i p). Régler T_i par compensation de pôle et déterminer K_p pour obtenir une marge de phase de 45°.',
        hints: [
          'La méthode de compensation de pôle consiste à poser T_i = 0.2 s pour annuler le pôle dominant.',
        ],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Compensation de pôle',
            content:
              'En posant T_i = 0.2 s, le facteur (1 + T_i p) au numérateur compense exactement le pôle (1 + 0.2 p).',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-si-1',
        questionText:
          'Quel est le principal avantage de l’ajout d’une action intégrale (1 / Ti p) dans la boucle d’asservissement ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\\text{Annuler l’erreur statique vis-à-vis d’un échelon}' },
          { id: 'opt-B', label: 'B', math: '\\text{Augmenter la marge de phase à toutes les fréquences}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'L’action intégrale annule l’erreur statique.',
      },
    ],
  },

  // ==============================
  // INFORMATIQUE & ALGO — COURS 1
  // ==============================
  {
    id: 'info-graphes',
    concoursId: 'cnc',
    subjectId: 'info',
    chapterNumber: 1,
    title: 'Algorithmes de Graphes & Recherche de Plus Courts Chemins',
    subTitle: 'Algorithmique & Structures • CNC MP / PSI / TSI',
    stream: 'CNC MP / PSI / TSI',
    durationEstimate: '3h 00 de travail',
    difficultyStars: 3,
    summary: 'Représentations mémoires (matrices et listes d’adjacence), parcours BFS/DFS, algorithme de Dijkstra avec file de priorité et complexité.',
    pdfInfo: {
      fileName: 'CNC_2023_Info_Commune_Graphes.pdf',
      officialTitle: 'CONCOURS NATIONAL COMMUN — TOUTES FILIÈRES',
      epreuve: 'Épreuve Commune d’Informatique',
      session: 'Session 2023',
      duration: '3 heures',
      totalPages: 3,
    },
    theorySections: [
      {
        title: 'I. Représentation et Parcours de Graphes',
        content:
          'Un graphe G = (V, E) peut être stocké sous forme de matrice d’adjacence (coût mémoire O(|V|^2)) ou de listes d’adjacence (coût mémoire O(|V| + |E|)).',
        mathFormula: 'G = (V, E), \\quad |V| = n, \\; |E| = m',
      },
    ],
    exercises: [
      {
        id: 'exo-info-1',
        refCode: 'EXO-COMMUN-INFO-105',
        source: 'Extrait CNC 2023 — Épreuve Commune d’Informatique',
        difficultyStars: 2,
        title: 'Parcours en Largeur (BFS) et Plus Court Chemin en nombre d’arêtes',
        statement:
          'Écrire une fonction Python bfs_distances(adj, s) qui prend en paramètre un dictionnaire d’adjacence et un sommet source s, et renvoie un dictionnaire associant à chaque sommet accessible sa distance minimale en nombre d’arêtes par rapport à s.',
        hints: ['Utilisez la structure de file First-In First-Out (collections.deque).'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Implémentation',
            content: 'Initialisation de la file et exploration des voisins.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-info-1',
        questionText:
          'Quelle est la complexité temporelle optimale de l’algorithme de Dijkstra sur un graphe G=(V, E) avec tas binaire ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\\mathcal{O}(|E| + |V| \\log |V|)' },
          { id: 'opt-B', label: 'B', math: '\\mathcal{O}(|V|^2)' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'O((|V| + |E|) log |V|) avec tas binaire.',
      },
    ],
  },

  // ==========================================================================
  // CONCOURS COMMUN MINES-PONTS (MINES)
  // ==========================================================================
  {
    id: 'mines-maths-prehilb',
    concoursId: 'mines',
    subjectId: 'maths',
    chapterNumber: 1,
    title: 'Espaces Préhilbertiens Réels & Endomorphismes Symétriques',
    subTitle: 'Algèbre Bilinéaire & Géométrie • Mines-Ponts MP / PSI',
    stream: 'Mines-Ponts MP / PSI',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 4,
    summary: 'Produit scalaire, procédé d’orthonormalisation de Gram-Schmidt, théorème spectral, matrices symétriques définies positives et inégalité de Cauchy-Schwarz.',
    pdfInfo: {
      fileName: 'Mines_Ponts_2023_Maths_1_MP.pdf',
      officialTitle: 'CONCOURS COMMUN MINES-PONTS — FILIÈRE MP',
      epreuve: 'Épreuve de Mathématiques I',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Produit scalaire et Théorème Spectral',
        content:
          'Soit E un espace euclidien de dimension n. Tout endomorphisme symétrique u de E est diagonalisable dans une base orthonormée de vecteurs propres.',
        mathFormula: '\forall x, y \in E, \quad \langle u(x), y \rangle = \langle x, u(y) \rangle \implies \exists \mathcal{B}_{\text{bon}}, \; [u]_{\mathcal{B}} = \text{diag}(\lambda_1, \dots, \lambda_n)',
      },
    ],
    exercises: [
      {
        id: 'exo-mines-maths-1',
        refCode: 'EXO-MINES-MATHS-2023',
        source: 'Mines-Ponts MP 2023 — Problème I',
        difficultyStars: 4,
        title: 'Racine carrée d’une matrice symétrique positive',
        statement:
          'Soit A dans S_n^+(R). Montrer qu’il existe une unique matrice R dans S_n^+(R) telle que R^2 = A. Étudier la continuité de l’application A -> R.',
        hints: ['Diagonalisez A dans une base orthonormée et utilisez l’unicité des valeurs propres positives.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Existence',
            content: 'A = P D P^T avec D = diag(lambda_i >= 0). On pose R = P diag(sqrt(lambda_i)) P^T.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-mines-maths-1',
        questionText: 'Si A est symétrique définie positive, que vaut le déterminant de son inverse A^{-1} ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\det(A^{-1}) = \frac{1}{\det(A)} > 0' },
          { id: 'opt-B', label: 'B', math: '\det(A^{-1}) < 0' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'det(A^{-1}) = 1 / det(A) et toutes les valeurs propres de A sont strictement positives.',
      },
    ],
  },
  {
    id: 'mines-phys-thermo',
    concoursId: 'mines',
    subjectId: 'physique',
    chapterNumber: 1,
    title: 'Thermodynamique des Systèmes Ouverts & Transferts Thermiques',
    subTitle: 'Physique Macroscopique • Concours Commun Mines-Ponts',
    stream: 'Mines-Ponts MP / PSI',
    durationEstimate: '3h 30 de travail',
    difficultyStars: 4,
    summary: 'Bilans de masse, d’énergie et d’entropie en écoulement stationnaire, enthalpie totale, tuyères et premier principe industriel.',
    pdfInfo: {
      fileName: 'Mines_Ponts_2023_Physique_1.pdf',
      officialTitle: 'CONCOURS COMMUN MINES-PONTS — PHYSIQUE I',
      epreuve: 'Épreuve de Physique I',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 5,
    },
    theorySections: [
      {
        title: 'I. Premier Principe Industriel en Régime Stationnaire',
        content:
          'Pour un système ouvert traversé par un débit massique D_m, la variation d’enthalpie totale est égale à la somme de la puissance utile et thermique échangées.',
        mathFormula: '\Delta h_t = w_u + q, \quad h_t = h + \frac{1}{2}v^2 + gz',
      },
    ],
    exercises: [
      {
        id: 'exo-mines-phys-1',
        refCode: 'EXO-MINES-PHYS-2023',
        source: 'Mines-Ponts 2023 — Écoulement dans une tuyère supersonique',
        difficultyStars: 3,
        title: 'Rendement isentropique d’une turbine à gaz',
        statement:
          'Déterminer le travail massique utile fourni par une turbine à gaz adiabatique fonctionnant en régime permanent entre la pression P_1 = 12 bar et P_2 = 1 bar.',
        hints: ['Utilisez la relation de Laplace pour une détente isentropique d’un gaz parfait.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Bilan Enthalpique',
            content: 'w_u = c_p (T_2 - T_1) avec T_2 / T_1 = (P_2 / P_1)^{(gamma-1)/gamma}.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-mines-phys-1',
        questionText: 'Dans un écoulement stationnaire sans échange thermique ni travail utile, que conserve le fluide ?',
        options: [
          { id: 'opt-A', label: 'A', math: 'h_t = h + \frac{v^2}{2} + gz = \text{cte}' },
          { id: 'opt-B', label: 'B', math: 'T = \text{cte}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'Enthalpie totale massique constante par le 1er principe pour système ouvert stationnaire.',
      },
    ],
  },
  {
    id: 'mines-si-torseurs',
    concoursId: 'mines',
    subjectId: 'si',
    chapterNumber: 1,
    title: 'Cinématique 3D & Torseurs d’Action Mécanique',
    subTitle: 'Sciences de l’Ingénieur • Concours Commun Mines-Ponts PSI',
    stream: 'Mines-Ponts PSI',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 4,
    summary: 'Champ des vecteurs vitesse, formule de dérivation vectorielle, torseur cinématique, torseur d’action mécanique et liaison équivalente.',
    pdfInfo: {
      fileName: 'Mines_Ponts_2023_SI_PSI.pdf',
      officialTitle: 'CONCOURS COMMUN MINES-PONTS — FILIÈRE PSI',
      epreuve: 'Sciences Industrielles de l’Ingénieur',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 6,
    },
    theorySections: [
      {
        title: 'I. Champ des Vecteurs Vitesse (Relation de Varignon)',
        content:
          'Le champ des vitesses d’un solide indéformable S par rapport à un repère R est un torseur de résultante Omega(S/R).',
        mathFormula: '\vec{V}(B \in S/R) = \vec{V}(A \in S/R) + \vec{\Omega}(S/R) \wedge \vec{AB}',
      },
    ],
    exercises: [
      {
        id: 'exo-mines-si-1',
        refCode: 'EXO-MINES-SI-2023',
        source: 'Mines-Ponts PSI 2023 — Robot Sphérique Parallèle',
        difficultyStars: 4,
        title: 'Détermination du torseur cinématique d’un mécanisme spatial',
        statement:
          'Exprimer la vitesse du centre de l’effecteur par composition des vitesses au point d’attache du bras articulé.',
        hints: ['Appliquez la formule de composition des vitesses V(M en 2/0) = V(M en 2/1) + V(M en 1/0).'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Torseur cinématique',
            content: 'Dérivation des vecteurs positions dans les repères mobiles.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-mines-si-1',
        questionText: 'Comment calcule-t-on l’invariant scalaire d’un torseur cinématique ?',
        options: [
          { id: 'opt-A', label: 'A', math: 'I = \vec{\Omega} \cdot \vec{V}(A)' },
          { id: 'opt-B', label: 'B', math: 'I = \|\vec{\Omega}\|^2 + \|\vec{V}(A)\|^2' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'L’automoment I = Omega . V(A) est indépendant du point A choisi.',
      },
    ],
  },
  {
    id: 'mines-info-dyn',
    concoursId: 'mines',
    subjectId: 'info',
    chapterNumber: 1,
    title: 'Programmation Dynamique & Flots Maximaux',
    subTitle: 'Informatique Théorique • Concours Commun Mines-Ponts',
    stream: 'Mines-Ponts MP / PSI',
    durationEstimate: '3h 30 de travail',
    difficultyStars: 4,
    summary: 'Sous-structure optimale, chevauchement des sous-problèmes, algorithme de Ford-Fulkerson, coupe minimale et applications aux réseaux.',
    pdfInfo: {
      fileName: 'Mines_Ponts_2023_Info_Commune.pdf',
      officialTitle: 'CONCOURS COMMUN MINES-PONTS — INFORMATIQUE',
      epreuve: 'Épreuve Commune d’Informatique',
      session: 'Session 2023',
      duration: '3 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Principe de Bellman et Sous-structure Optimale',
        content:
          'Une solution optimale à un problème contient en elle-même des solutions optimales aux sous-problèmes correspondants.',
        mathFormula: 'OPT(i, w) = \max(OPT(i-1, w), \; v_i + OPT(i-1, w - w_i))',
      },
    ],
    exercises: [
      {
        id: 'exo-mines-info-1',
        refCode: 'EXO-MINES-INFO-2023',
        source: 'Mines-Ponts 2023 — Algorithme de Flot & Couplage Maximum',
        difficultyStars: 4,
        title: 'Résolution du Problème du Sac à Dos par Tabulation',
        statement:
          'Écrire une fonction Python knapsack(valeurs, poids, W) renvoyant la valeur maximale et la liste des objets sélectionnés en complexité O(n W).',
        hints: ['Créez une matrice de taille (n+1) x (W+1) initialisée à 0.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Remplissage',
            content: 'Double boucle for i in range(1, n+1) et for w in range(W+1).',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-mines-info-1',
        questionText: 'Quel théorème relie le flot maximum dans un réseau à la coupe minimale ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\text{Max-Flow} = \text{Min-Cut}' },
          { id: 'opt-B', label: 'B', math: '\text{Max-Flow} < \text{Min-Cut}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'Théorème fondamental de Ford-Fulkerson : valeur du flot max = capacité de la coupe min.',
      },
    ],
  },

  // ==========================================================================
  // CONCOURS CENTRALE-SUPÉLEC (CENTRALE)
  // ==========================================================================
  {
    id: 'centrale-maths-fourier',
    concoursId: 'centrale',
    subjectId: 'maths',
    chapterNumber: 1,
    title: 'Séries de Fourier & Projections Orthogonales',
    subTitle: 'Analyse Harmonique & Espaces L2 • Concours Centrale MP / PSI',
    stream: 'Centrale MP / PSI',
    durationEstimate: '4h 30 de travail',
    difficultyStars: 4,
    summary: 'Coefficients trigonométriques et exponentiels de Fourier, théorème de Dirichlet, théorème de Parseval, inégalité de Bessel et applications aux sommes de séries.',
    pdfInfo: {
      fileName: 'Centrale_2023_Maths_1_MP.pdf',
      officialTitle: 'CONCOURS CENTRALE-SUPÉLEC — FILIÈRE MP',
      epreuve: 'Épreuve de Mathématiques I',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Égalité de Parseval et Convergence Quadratique',
        content:
          'Pour toute fonction f continue par morceaux et 2pi-périodique, la série de Fourier converge en moyenne quadratique vers f.',
        mathFormula: '\frac{1}{2\pi} \int_0^{2\pi} |f(t)|^2 \, dt = \sum_{n=-\infty}^{+\infty} |c_n(f)|^2 = a_0^2 + \frac{1}{2} \sum_{n=1}^\infty (a_n^2 + b_n^2)',
      },
    ],
    exercises: [
      {
        id: 'exo-centrale-maths-1',
        refCode: 'EXO-CENTRALE-MATHS-2023',
        source: 'Centrale MP 2023 — Calculs des sommes zeta(2) et zeta(4)',
        difficultyStars: 3,
        title: 'Développement en série de Fourier de l’onde triangulaire',
        statement:
          'Soit f la fonction 2pi-périodique paire définie sur [0, pi] par f(x) = x. Calculer ses coefficients de Fourier et en déduire la somme sum_{n=1}^infty 1/(2n-1)^2.',
        hints: ['f étant paire, tous les coefficients b_n sont nuls. Intégrez par parties pour a_n.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Coefficients',
            content: 'a_0 = pi/2 et a_n = 2/(pi n^2) [(-1)^n - 1].',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-centrale-maths-1',
        questionText: 'Sous quelles conditions le théorème de Dirichlet assure-t-il la convergence ponctuelle de la série de Fourier ?',
        options: [
          { id: 'opt-A', label: 'A', math: 'f \text{ est } C^1 \text{ par morceaux sur } [0, 2\pi]' },
          { id: 'opt-B', label: 'B', math: 'f \text{ est seulement mesurable}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'La régularité C^1 par morceaux garantit la convergence vers (f(x+) + f(x-))/2.',
      },
    ],
  },
  {
    id: 'centrale-phys-ondes',
    concoursId: 'centrale',
    subjectId: 'physique',
    chapterNumber: 1,
    title: 'Optique Ondulatoire & Interférences à Deux Ondes',
    subTitle: 'Optique Physique • Concours Centrale-Supélec MP / PSI',
    stream: 'Centrale MP / PSI',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 3,
    summary: 'Cohérence spatiale et temporelle, formule de Fresnel, fentes d’Young, coin d’air, anneaux de Newton et contraste des franges.',
    pdfInfo: {
      fileName: 'Centrale_2023_Physique_1.pdf',
      officialTitle: 'CONCOURS CENTRALE-SUPÉLEC — PHYSIQUE I',
      epreuve: 'Épreuve de Physique I',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 5,
    },
    theorySections: [
      {
        title: 'I. Formule des Interférences de Fresnel',
        content:
          'La superposition de deux ondes monochromatiques cohérentes de même pulsation donne un éclairement fonction du déphasage delta.',
        mathFormula: 'I(M) = I_1 + I_2 + 2 \sqrt{I_1 I_2} \cos(\Delta\phi(M)), \quad \Delta\phi(M) = \frac{2\pi}{\lambda_0} \delta(M)',
      },
    ],
    exercises: [
      {
        id: 'exo-centrale-phys-1',
        refCode: 'EXO-CENTRALE-PHYS-2023',
        source: 'Centrale 2023 — Interféromètre de Michelson',
        difficultyStars: 3,
        title: 'Mesure de l’écart de longueur d’onde du doublet du Sodium',
        statement:
          'Expliquer le phénomène de brouillage des franges obtenu dans un Michelson éclairé par une lampe au sodium (lambda_1 = 589.0 nm, lambda_2 = 589.6 nm).',
        hints: ['Le brouillage apparaît lorsque les franges brillantes de lambda_1 coïncident avec les franges sombres de lambda_2.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Condition de brouillage',
            content: "delta = (2k+1) lambda_1 / 2 = k' lambda_2, d’où delta_brouillage = lambda^2 / (2 Delta lambda).",
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-centrale-phys-1',
        questionText: 'Dans les fentes d’Young distantes de a, quelle est l’interfrange i à distance D ?',
        options: [
          { id: 'opt-A', label: 'A', math: 'i = \frac{\lambda D}{a}' },
          { id: 'opt-B', label: 'B', math: 'i = \frac{\lambda a}{D}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'i = lambda D / a, proportionnel à la longueur d’onde et à la distance d’observation.',
      },
    ],
  },
  {
    id: 'centrale-si-bode',
    concoursId: 'centrale',
    subjectId: 'si',
    chapterNumber: 1,
    title: 'Modélisation Multiphysique & Critères de Routh/Nyquist',
    subTitle: 'Automatique & Systèmes • Concours Centrale-Supélec PSI',
    stream: 'Centrale PSI',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 4,
    summary: 'Fonctions de transfert en boucle fermée, critère algébrique de Routh, marges de gain et de phase sur diagrammes de Bode et Black, correcteurs PID.',
    pdfInfo: {
      fileName: 'Centrale_2023_SI_PSI.pdf',
      officialTitle: 'CONCOURS CENTRALE-SUPÉLEC — FILIÈRE PSI',
      epreuve: 'Sciences Industrielles',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 6,
    },
    theorySections: [
      {
        title: 'I. Stabilité en Boucle Fermée (Critère du Revers)',
        content:
          'Un système asservi à retour unitaire est stable en boucle fermée si le lieu de Nyquist de sa FTBO laisse le point critique (-1, 0) à sa gauche en parcourant les pulsations croissantes.',
        mathFormula: 'H_{BF}(p) = \frac{FTBO(p)}{1 + FTBO(p)}, \quad 1 + FTBO(p) = 0',
      },
    ],
    exercises: [
      {
        id: 'exo-centrale-si-1',
        refCode: 'EXO-CENTRALE-SI-2023',
        source: 'Centrale PSI 2023 — Exosquelette d’assistance motrice',
        difficultyStars: 3,
        title: 'Dimensionnement d’un correcteur à avance de phase',
        statement:
          'Régler les paramètres a et T du correcteur C(p) = (1 + a T p)/(1 + T p) avec a > 1 pour obtenir une marge de phase de 45° à la pulsation de coupure omega_c = 30 rad/s.',
        hints: ['L’avance de phase maximale phi_max = arcsin((a-1)/(a+1)) est atteinte à omega_m = 1/(T sqrt(a)).'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Calcul de a',
            content: 'On choisit phi_max = 45° - M_phi_initiale, puis T = 1 / (omega_c sqrt(a)).',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-centrale-si-1',
        questionText: 'Quel est le rôle principal d’une action dérivée dans un correcteur PID ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\text{Améliorer la stabilité et le temps de réponse}' },
          { id: 'opt-B', label: 'B', math: '\text{Annuler l’erreur statique}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'L’action dérivée anticipe les variations et apporte de l’amortissement.',
      },
    ],
  },
  {
    id: 'centrale-info-arbres',
    concoursId: 'centrale',
    subjectId: 'info',
    chapterNumber: 1,
    title: 'Arbres Binaires de Recherche & Algorithmes Gloutons',
    subTitle: 'Structures de Données • Concours Centrale-Supélec',
    stream: 'Centrale MP / PSI',
    durationEstimate: '3h 30 de travail',
    difficultyStars: 3,
    summary: 'Définition récursive des ABR, algorithmes d’insertion et de suppression, rotation AVL, équilibrage, codage optimal de Huffman et algorithmes gloutons.',
    pdfInfo: {
      fileName: 'Centrale_2023_Informatique.pdf',
      officialTitle: 'CONCOURS CENTRALE-SUPÉLEC — INFORMATIQUE',
      epreuve: 'Épreuve Commune d’Informatique',
      session: 'Session 2023',
      duration: '3 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Propriété d’Arbre Binaire de Recherche (ABR)',
        content:
          'Pour tout nœud x, les clés du sous-arbre gauche sont <= cle(x), et les clés du sous-arbre droit sont >= cle(x). Le parcours infixe donne un ordre croissant.',
        mathFormula: '\forall y \in SousArbreGauche(x), \; cle(y) \le cle(x) \le cle(z), \; \forall z \in SousArbreDroit(x)',
      },
    ],
    exercises: [
      {
        id: 'exo-centrale-info-1',
        refCode: 'EXO-CENTRALE-INFO-2023',
        source: 'Centrale 2023 — Compression de Texte & Codage de Huffman',
        difficultyStars: 3,
        title: 'Construction de l’Arbre de Huffman',
        statement:
          'Écrire une fonction Python huffman_tree(frequences) utilisant une file de priorité heapq pour construire l’arbre binaire de compression optimale.',
        hints: ['Extrayez à chaque étape les deux nœuds de plus faible fréquence et créez leur nœud parent.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Fusion',
            content: 'while len(heap) > 1: n1 = heappop(heap); n2 = heappop(heap); heappush(heap, Node(n1, n2)).',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-centrale-info-1',
        questionText: 'Quel est le coût moyen de recherche d’une clé dans un ABR équilibré à N éléments ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\mathcal{O}(\log N)' },
          { id: 'opt-B', label: 'B', math: '\mathcal{O}(N)' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'La hauteur d’un ABR équilibré est en O(log N).',
      },
    ],
  },

  // ==========================================================================
  // CONCOURS COMMUNS INP (CCINP / CCP)
  // ==========================================================================
  {
    id: 'ccinp-maths-diag',
    concoursId: 'ccinp',
    subjectId: 'maths',
    chapterNumber: 1,
    title: 'Diagonalisation & Trigonalisation Matricielle',
    subTitle: 'Algèbre Linéaire • Concours Communs INP (CCINP) MP / PSI',
    stream: 'CCINP MP / PSI',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 3,
    summary: 'Polynôme caractéristique, recherche des sous-espaces propres, condition nécessaire et suffisante de diagonalisation, trigonalisation et théorème de Cayley-Hamilton.',
    pdfInfo: {
      fileName: 'CCINP_2023_Maths_1_MP.pdf',
      officialTitle: 'CONCOURS COMMUNS INP (CCINP) — FILIÈRE MP',
      epreuve: 'Mathématiques I',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Critère Fondamental de Diagonalisation',
        content:
          'Une matrice A dans M_n(K) est diagonalisable si et seulement si son polynôme caractéristique est scindé sur K et pour toute valeur propre lambda, la multiplicité géométrique égale la multiplicité algébrique.',
        mathFormula: '\dim\ker(A - \lambda I_n) = m_\lambda, \quad \sum_{\lambda \in \text{Sp}(A)} \dim\ker(A - \lambda I_n) = n',
      },
    ],
    exercises: [
      {
        id: 'exo-ccinp-maths-1',
        refCode: 'EXO-CCINP-MATHS-2023',
        source: 'CCINP MP 2023 — Calcul des puissances A^k',
        difficultyStars: 2,
        title: 'Diagonalisation d’une matrice à coefficients réels',
        statement:
          'Soit A = ((1, 2), (2, 1)). Déterminer ses valeurs propres, une base de vecteurs propres, la matrice de passage P et en déduire l’expression de A^k pour tout entier k.',
        hints: ['Calculez chi_A(X) = det(X I_2 - A) = (X-3)(X+1).'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Diagonalisation',
            content: 'Valeurs propres 3 et -1. P = ((1, 1), (1, -1)), A^k = P diag(3^k, (-1)^k) P^{-1}.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-ccinp-maths-1',
        questionText: 'Que garantit le théorème de Cayley-Hamilton pour toute matrice carrée A ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\chi_A(A) = 0_{M_n(K)}' },
          { id: 'opt-B', label: 'B', math: 'A \text{ est inversible}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'Toute matrice annule son propre polynôme caractéristique.',
      },
    ],
  },
  {
    id: 'ccinp-phys-induction',
    concoursId: 'ccinp',
    subjectId: 'physique',
    chapterNumber: 1,
    title: 'Induction Électromagnétique & Circuits RLC Couplés',
    subTitle: 'Électromagnétisme • Concours Communs INP (CCINP)',
    stream: 'CCINP MP / PSI',
    durationEstimate: '3h 30 de travail',
    difficultyStars: 3,
    summary: 'Loi de Faraday-Lenz, flux magnétique, inductance propre L et mutuelle M, fem induite, oscillations forcées et résonance de tension.',
    pdfInfo: {
      fileName: 'CCINP_2023_Physique_MP.pdf',
      officialTitle: 'CONCOURS COMMUNS INP — PHYSIQUE',
      epreuve: 'Épreuve de Physique',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Loi de Faraday et Bilan Énergétique',
        content:
          'Toute variation du flux magnétique à travers un circuit fermé engendre une force électromotrice induite s’opposant par ses effets à la cause qui lui a donné naissance.',
        mathFormula: 'e(t) = -\frac{d\Phi(t)}{dt}, \quad \Phi = \iint_S \vec{B} \cdot d\vec{S}',
      },
    ],
    exercises: [
      {
        id: 'exo-ccinp-phys-1',
        refCode: 'EXO-CCINP-PHYS-2023',
        source: 'CCINP 2023 — Freinage par courants de Foucault',
        difficultyStars: 3,
        title: 'Mouvement d’une spire conductrice dans un champ magnétique non uniforme',
        statement:
          'Établir l’équation différentielle du mouvement d’une spire rectangulaire tombant dans un champ B orthogonal et déterminer sa vitesse limite de chute.',
        hints: ['Associez la loi de Faraday pour la fem induite, la loi d’Ohm, et la force de Laplace freinante.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Force de Laplace',
            content: 'm dv/dt = m g - (B^2 L^2 / R) v, d’où v_lim = m g R / (B^2 L^2).',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-ccinp-phys-1',
        questionText: 'Quelle est l’unité de l’inductance propre L dans le système international ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\text{Henry (H)}' },
          { id: 'opt-B', label: 'B', math: '\text{Tesla (T)}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'L’inductance s’exprime en Henry (H = Wb/A).',
      },
    ],
  },
  {
    id: 'ccinp-si-schemas',
    concoursId: 'ccinp',
    subjectId: 'si',
    chapterNumber: 1,
    title: 'Schémas-Blocs & Diagrammes de Bode et Black',
    subTitle: 'Automatique Linéaire • Concours Communs INP PSI',
    stream: 'CCINP PSI',
    durationEstimate: '3h 30 de travail',
    difficultyStars: 3,
    summary: 'Règles d’algèbre des schémas-blocs, fonctions de transfert en boucle ouverte et fermée, réponses fréquentielles asymptotiques et dépassement indiciel.',
    pdfInfo: {
      fileName: 'CCINP_2023_SI_PSI.pdf',
      officialTitle: 'CONCOURS COMMUNS INP — SCIENCES INDUSTRIELLES',
      epreuve: 'Sciences Industrielles de l’Ingénieur',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 5,
    },
    theorySections: [
      {
        title: 'I. Formule de Black pour la Boucle Fermée',
        content:
          'Pour un système à retour unitaire de chaîne directe C(p) G(p), la fonction de transfert en boucle fermée s’exprime simplement en fonction de la FTBO.',
        mathFormula: 'H_{BF}(p) = \frac{C(p)G(p)}{1 + C(p)G(p)}',
      },
    ],
    exercises: [
      {
        id: 'exo-ccinp-si-1',
        refCode: 'EXO-CCINP-SI-2023',
        source: 'CCINP PSI 2023 — Asservissement d’un axe numérique',
        difficultyStars: 2,
        title: 'Identification des paramètres d’un système du 2nd ordre',
        statement:
          'À partir de la réponse indicielle présentant un premier dépassement D1 = 16% au temps t1 = 0.2 s, identifier le coefficient d’amortissement xi et la pulsation propre omega_0.',
        hints: ['Utilisez la formule du dépassement D1 = exp(-pi xi / sqrt(1 - xi^2)) et du pseudo-temps t1 = pi / (omega_0 sqrt(1 - xi^2)).'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Amortissement',
            content: 'D1 = 16% correspond à xi = 0.5. Alors omega_0 = pi / (t1 sqrt(0.75)) = 18.1 rad/s.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-ccinp-si-1',
        questionText: 'Pour quelle valeur du coefficient d’amortissement xi observe-t-on le temps de réponse à 5% le plus court sans oscillation excessive ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\\xi \\approx 0.7' },
          { id: 'opt-B', label: 'B', math: '\\xi = 0.1' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'xi = 0.7 offre le compromis optimal de rapidité et d’amortissement.',
      },
    ],
  },
  {
    id: 'ccinp-info-hachage',
    concoursId: 'ccinp',
    subjectId: 'info',
    chapterNumber: 1,
    title: 'Dictionnaires, Tables de Hachage & Parcours BFS/DFS',
    subTitle: 'Algorithmique & Données • Concours Communs INP',
    stream: 'CCINP MP / PSI',
    durationEstimate: '3h 00 de travail',
    difficultyStars: 2,
    summary: 'Tables de hachage, résolution des collisions par chaînage ou adressage ouvert, graphes, composantes connexes et détection de cycles.',
    pdfInfo: {
      fileName: 'CCINP_2023_Informatique.pdf',
      officialTitle: 'CONCOURS COMMUNS INP — INFORMATIQUE',
      epreuve: 'Épreuve Commune d’Informatique',
      session: 'Session 2023',
      duration: '3 heures',
      totalPages: 3,
    },
    theorySections: [
      {
        title: 'I. Complexité des Tables de Hachage',
        content:
          'Sous l’hypothèse de hachage uniforme simple, les opérations d’insertion, recherche et suppression s’effectuent en temps moyen constant O(1).',
        mathFormula: 'T_{\text{recherche}} = \mathcal{O}(1 + \alpha), \quad \alpha = \frac{n}{m} \text{ (facteur de charge)}',
      },
    ],
    exercises: [
      {
        id: 'exo-ccinp-info-1',
        refCode: 'EXO-CCINP-INFO-2023',
        source: 'CCINP 2023 — Détection de cycles dans un graphe orienté',
        difficultyStars: 2,
        title: 'Algorithme de détection de cycles par coloration DFS',
        statement:
          'Écrire une fonction Python has_cycle(adj) utilisant un dictionnaire d’états (BLANC, GRIS, NOIR) pour déterminer si un graphe orienté contient un cycle.',
        hints: ['Un arc arrière vers un sommet d’état GRIS révèle la présence d’un circuit.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : DFS récursif',
            content: 'Si couleur[voisin] == GRIS: return True.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-ccinp-info-1',
        questionText: 'Quelle est la complexité temporelle du parcours complet d’un graphe G=(V, E) représenté par listes d’adjacence ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\mathcal{O}(|V| + |E|)' },
          { id: 'opt-B', label: 'B', math: '\mathcal{O}(|V| \times |E|)' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'Chaque sommet et chaque arête sont visités un nombre constant de fois.',
      },
    ],
  },

  // ==========================================================================
  // ÉCOLE POLYTECHNIQUE & ENS (X - ENS)
  // ==========================================================================
  {
    id: 'xens-maths-spectral',
    concoursId: 'x-ens',
    subjectId: 'maths',
    chapterNumber: 1,
    title: 'Théorème Spectral & Décomposition Polaire',
    subTitle: 'Algèbre Fondamentale • École Polytechnique & ENS MP',
    stream: 'X - ENS MP / PSI',
    durationEstimate: '5h 00 de travail',
    difficultyStars: 4,
    summary: 'Endomorphismes normaux, compacité du groupe orthogonal O(n), décomposition polaire M = OS, décomposition en valeurs singulières (SVD) et calcul fonctionnel continu.',
    pdfInfo: {
      fileName: 'X_ENS_2023_Maths_A_MP.pdf',
      officialTitle: 'CONCOURS POLYTECHNIQUE - ENS — FILIÈRE MP',
      epreuve: 'Épreuve de Mathématiques A',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 5,
    },
    theorySections: [
      {
        title: 'I. Décomposition Polaire dans GL_n(R)',
        content:
          'Pour toute matrice M dans GL_n(R), il existe un unique couple (O, S) dans O(n) x S_n^{++}(R) tel que M = O * S. L’application (O, S) -> O*S est un homéomorphisme.',
        mathFormula: 'M = O \cdot S, \quad O \in \mathcal{O}(n), \; S = \sqrt{M^T M} \in \mathcal{S}_n^{++}(\mathbb{R})',
      },
    ],
    exercises: [
      {
        id: 'exo-xens-maths-1',
        refCode: 'EXO-XENS-MATHS-2023',
        source: 'Polytechnique MP 2023 — Problème d’Algèbre',
        difficultyStars: 4,
        title: 'Sous-espaces stables par un endomorphisme symétrique',
        statement:
          'Soit u un endomorphisme autoadjoint d’un espace euclidien E. Montrer que tout sous-espace F stable par u admet son orthogonal F^\perp stable par u.',
        hints: ['Utilisez la définition <u(x), y> = <x, u(y)> pour x dans F et y dans F^perp.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Orthogonalité',
            content: 'Soit y dans F^perp. Pour tout x dans F, <x, u(y)> = <u(x), y> = 0 car u(x) in F. Donc u(y) in F^perp.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-xens-maths-1',
        questionText: 'Quel est l’ensemble des matrices symétriques réelles dont toutes les valeurs propres valent +1 ou -1 ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\mathcal{S}_n(\mathbb{R}) \cap \mathcal{O}(n) \text{ (symétries orthogonales)}' },
          { id: 'opt-B', label: 'B', math: '\{I_n, -I_n\}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'Une matrice symétrique dont les valeurs propres sont +/-1 est orthogonale (symétrie orthogonale).',
      },
    ],
  },
  {
    id: 'xens-phys-quantique',
    concoursId: 'x-ens',
    subjectId: 'physique',
    chapterNumber: 1,
    title: 'Mécanique Quantique & Puits de Potentiel Finis',
    subTitle: 'Physique Fondamentale • École Polytechnique & ENS',
    stream: 'X - ENS MP / PC',
    durationEstimate: '4h 30 de travail',
    difficultyStars: 4,
    summary: 'Équation de Schrödinger indépendante du temps, quantification de l’énergie, états liés, effet tunnel, barrières de potentiel et relations d’indétermination de Heisenberg.',
    pdfInfo: {
      fileName: 'X_ENS_2023_Physique_MP.pdf',
      officialTitle: 'CONCOURS POLYTECHNIQUE — PHYSIQUE',
      epreuve: 'Épreuve de Physique',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 6,
    },
    theorySections: [
      {
        title: 'I. Équation de Schrödinger Stationnaire',
        content:
          'Pour une particule de masse m dans un potentiel stationnaire V(x), les fonctions d’onde propres d’énergie E vérifient l’équation aux valeurs propres de l’Hamiltonien.',
        mathFormula: '-\frac{\hbar^2}{2m} \frac{d^2 \psi(x)}{dx^2} + V(x) \psi(x) = E \psi(x), \quad \int_{-\infty}^{+\infty} |\psi(x)|^2 \, dx = 1',
      },
    ],
    exercises: [
      {
        id: 'exo-xens-phys-1',
        refCode: 'EXO-XENS-PHYS-2023',
        source: 'Polytechnique MP 2023 — Effet Tunnel & Décroissance Alpha',
        difficultyStars: 4,
        title: 'Coefficient de transmission à travers une barrière rectangulaire',
        statement:
          'Calculer le coefficient de transmission T d’une particule d’énergie E < V_0 à travers une barrière de hauteur V_0 et de largeur a.',
        hints: ['Appliquez la continuité de la fonction d’onde et de sa dérivée aux deux interfaces x = 0 et x = a.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Raccordement',
            content: 'T = (1 + (V_0^2 sinh^2(k2 a)) / (4 E (V_0 - E)))^{-1} avec k2 = sqrt(2m(V_0-E))/hbar.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-xens-phys-1',
        questionText: 'Quelle est la relation d’indétermination de Heisenberg pour la position x et l’impulsion p_x ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\Delta x \cdot \Delta p_x \ge \frac{\hbar}{2}' },
          { id: 'opt-B', label: 'B', math: '\Delta x \cdot \Delta p_x = 0' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'Inégalité fondamentale Delta x . Delta p >= hbar / 2.',
      },
    ],
  },
  {
    id: 'xens-si-lagrange',
    concoursId: 'x-ens',
    subjectId: 'si',
    chapterNumber: 1,
    title: 'Dynamique Analytique & Équations de Lagrange',
    subTitle: 'Mécanique Théorique • École Polytechnique & ENS PSI',
    stream: 'X - ENS PSI',
    durationEstimate: '4h 30 de travail',
    difficultyStars: 4,
    summary: 'Coordonnées généralisées, énergie cinétique, fonction de Lagrange L = T - V, forces généralisées, intégrales premières et principe de moindre action.',
    pdfInfo: {
      fileName: 'ENS_2023_SI_PSI.pdf',
      officialTitle: 'CONCOURS ENS PARIS-SACLAY — FILIÈRE PSI',
      epreuve: 'Sciences Industrielles',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 6,
    },
    theorySections: [
      {
        title: 'I. Équations d’Euler-Lagrange',
        content:
          'Pour un système mécanique holonome sans frottement à n degrés de liberté q_i, les équations du mouvement s’écrivent sous forme variationnelle.',
        mathFormula: '\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{q}_i} \right) - \frac{\partial L}{\partial q_i} = Q_i^{\text{nc}}, \quad L = T - V',
      },
    ],
    exercises: [
      {
        id: 'exo-xens-si-1',
        refCode: 'EXO-XENS-SI-2023',
        source: 'ENS PSI 2023 — Pendule Double Chaotique',
        difficultyStars: 4,
        title: 'Mise en équation du pendule double articulé',
        statement:
          'Exprimer le lagrangien du système constitué de deux tiges rigides articulées dans le plan vertical et établir les équations non-linéaires couplées du mouvement.',
        hints: ['Calculez T = T_1 + T_2 et V = V_1 + V_2 en fonction des angles theta_1 et theta_2.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Lagrangien',
            content: 'Dérivation par rapport à theta_1, theta_2 et leurs vitesses angulaires.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-xens-si-1',
        questionText: 'Si le lagrangien L ne dépend pas explicitement d’une coordonnée q_k (coordonnée cyclique), quelle quantité est conservée ?',
        options: [
          { id: 'opt-A', label: 'A', math: 'p_k = \frac{\partial L}{\partial \dot{q}_k} = \text{cte} \text{ (moment conjugué)}' },
          { id: 'opt-B', label: 'B', math: 'q_k = \text{cte}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'Théorème de Noether : l’invariance par translation selon q_k implique la conservation du moment p_k.',
      },
    ],
  },
  {
    id: 'xens-info-complexite',
    concoursId: 'x-ens',
    subjectId: 'info',
    chapterNumber: 1,
    title: 'NP-Complétude & Réductions Polynomiales',
    subTitle: 'Informatique Fondamentale • ENS Ulm / Lyon / Saclay',
    stream: 'ENS Info / MP',
    durationEstimate: '4h 00 de travail',
    difficultyStars: 4,
    summary: 'Machine de Turing, classes P et NP, réductions de Karp en temps polynomial, théorème de Cook-Levin, 3-SAT, CLIQUE, VERTEX-COVER et TSP.',
    pdfInfo: {
      fileName: 'ENS_2023_Informatique_Fondamentale.pdf',
      officialTitle: 'CONCOURS ENS ULM - LYON - SACLAY',
      epreuve: 'Épreuve d’Informatique Fondamentale',
      session: 'Session 2023',
      duration: '4 heures',
      totalPages: 4,
    },
    theorySections: [
      {
        title: 'I. Définition de la Classe NP et NP-complétude',
        content:
          'Un problème de décision appartient à NP s’il admet un certificat vérifiable en temps polynomial par un algorithme déterministe. Il est NP-complet s’il est dans NP et si tout problème de NP s’y réduit polynomialement.',
        mathFormula: "L \\in \\text{NP-complet} \\iff (L \\in \\text{NP}) \\; \\land \\; (\\forall L' \\in \\text{NP}, \\; L' \\le_p L)",
      },
    ],
    exercises: [
      {
        id: 'exo-xens-info-1',
        refCode: 'EXO-XENS-INFO-2023',
        source: 'ENS Ulm 2023 — Réduction de 3-SAT à CLIQUE',
        difficultyStars: 4,
        title: 'Réduction polynomiale de 3-SAT vers CLIQUE',
        statement:
          'Décrire précisément la construction du graphe G_phi associé à une formule 3-CNF phi à k clauses, tel que G_phi possède une k-clique si et seulement si phi est satisfaisable.',
        hints: ['Créez 3 sommets par clause (un pour chaque littéral), et reliez deux sommets s’ils appartiennent à des clauses distinctes et ne sont pas négations l’un de l’autre.'],
        solutionSteps: [
          {
            stepTitle: 'Étape 1 : Construction',
            content: 'Le graphe possède 3k sommets. Une k-clique choisit exactement un littéral vrai par clause sans contradiction.',
          },
        ],
      },
    ],
    qcmQuestions: [
      {
        id: 'qcm-xens-info-1',
        questionText: 'Quel est le premier problème formellement démontré NP-complet par le théorème de Cook-Levin ?',
        options: [
          { id: 'opt-A', label: 'A', math: '\text{SAT (Satisfiabilité booléenne)}' },
          { id: 'opt-B', label: 'B', math: '\text{Tri rapide (QuickSort)}' },
        ],
        correctOptionId: 'opt-A',
        explanation: 'Le problème SAT a été démontré NP-complet par Stephen Cook en 1971 et Leonid Levin.',
      },
    ],
  },

]
// --------------------------------------------------------------------------
// 3. DATA: OFFICIAL CPGE COMPETITION EXAM PAPERS (CNC, MINES, CENTRALE, CCINP, X-ENS)
// --------------------------------------------------------------------------
export const CONCOURS_EXAMS_DATABASE: ConcoursExamItem[] = [
  // =========================================================================
  // 1. CNC (CONCOURS NATIONAL COMMUN — MAROC)
  // =========================================================================
  {
    id: 'cnc-2024-math-1',
    concoursId: 'cnc',
    subjectId: 'maths',
    year: 2024,
    session: 'Session Principale 2024',
    stream: 'MP & PSI',
    title: 'CNC 2024 — Mathématiques I',
    subtitle: 'Étude spectrale des endomorphismes de rang 1, commutant et exponentielle matricielle',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR (CNC 2024)',
    description: '4 parties progressives : Propriétés spectrales des opérateurs de rang 1 (u² = Tr(u)·u), dimension et base du commutant C(u), calcul explicite de l’exponentielle exp(tu), décomposition polaire et norme de Schur.',
    questions: [
      { id: 'q1', label: 'Q1. Trace et endomorphisme de rang 1', part: 'Partie I', points: 1, done: false },
      { id: 'q2', label: 'Q2. Formule fondamentale u² = Tr(u)·u', part: 'Partie I', points: 1.5, done: false },
      { id: 'q3', label: 'Q3. Polynôme minimal et spectre Sp(u)', part: 'Partie I', points: 1.5, done: false },
      { id: 'q4', label: 'Q4. Condition nécessaire et suffisante de diagonalisabilité', part: 'Partie I', points: 1.5, done: false },
      { id: 'q5', label: 'Q5. Décomposition spectrale et projecteur associé', part: 'Partie I', points: 1.5, done: false },
      { id: 'q6', label: 'Q6. Structure et base du commutant C(u)', part: 'Partie II', points: 1.5, done: false },
      { id: 'q7', label: 'Q7. Dimension de C(u) égale à n² - n + 1', part: 'Partie II', points: 1.5, done: false },
      { id: 'q8', label: 'Q8. Équation matricielle X² = u lorsque Tr(u) ≠ 0', part: 'Partie II', points: 1.5, done: false },
      { id: 'q9', label: 'Q9. Étude de l’équation X² = u dans le cas nilpotent', part: 'Partie II', points: 1.5, done: false },
      { id: 'q10', label: 'Q10. Calcul explicite de la série de l’exponentielle exp(tu)', part: 'Partie III', points: 1.5, done: false },
      { id: 'q11', label: 'Q11. Sous-groupe à un paramètre {exp(tu), t ∈ ℝ}', part: 'Partie III', points: 1, done: false },
      { id: 'q12', label: 'Q12. Résolution du système différentiel X’(t) = u(X(t))', part: 'Partie III', points: 1.5, done: false },
      { id: 'q13', label: 'Q13. Dérivée directionnelle et différentielle de exp en 0', part: 'Partie III', points: 1, done: false },
      { id: 'q14', label: 'Q14. Matrice de Gram et norme subordonnée ||u||₂', part: 'Partie IV', points: 1, done: false },
      { id: 'q15', label: 'Q15. Adjoint u* et projection orthogonale sur Im(u)', part: 'Partie IV', points: 1, done: false },
      { id: 'q16', label: 'Q16. Décomposition polaire et synthèse', part: 'Partie IV', points: 1, done: false },
    ],
  },
  {
    id: 'cnc-2023-math-2',
    concoursId: 'cnc',
    subjectId: 'maths',
    year: 2023,
    session: 'Session Principale 2023',
    stream: 'MP',
    title: 'CNC 2023 — Mathématiques II',
    subtitle: 'Séries entières, transformée de Laplace discrète et équations différentielles linéaires',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR (CNC 2023)',
    description: 'Rayon de convergence de séries génératrices, inversion de transformée discrète, comportement asymptotique aux bords et application aux systèmes différentiels couplés.',
  },
  {
    id: 'cnc-2022-math-1',
    concoursId: 'cnc',
    subjectId: 'maths',
    year: 2022,
    session: 'Session Principale 2022',
    stream: 'TSI & PSI',
    title: 'CNC 2022 — Mathématiques I',
    subtitle: 'Espaces préhilbertiens réels, matrices symétriques positives et formes quadratiques',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 3,
    totalPages: 4,
    institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR (CNC 2022)',
    description: 'Inégalités de Cauchy-Schwarz et de Hadamard, décomposition de Cholesky A = L L^T, quotient de Rayleigh et approximation par moindres carrés.',
  },
  {
    id: 'cnc-2024-phys-1',
    concoursId: 'cnc',
    subjectId: 'physique',
    year: 2024,
    session: 'Session Principale 2024',
    stream: 'MP & PSI',
    title: 'CNC 2024 — Physique I',
    subtitle: 'Électrodynamique classique, ondes guidées en guide rectangulaire et cavité résonante',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR (CNC 2024)',
    description: 'Modes TE et TM, fréquence de coupure, dissipation ohmique pariétale, facteur de qualité d’une cavité hyperfréquence et transmission d’énergie RF.',
  },
  {
    id: 'cnc-2023-phys-2',
    concoursId: 'cnc',
    subjectId: 'physique',
    year: 2023,
    session: 'Session Principale 2023',
    stream: 'MP & PSI',
    title: 'CNC 2023 — Physique II & Chimie',
    subtitle: 'Thermodynamique industrielle : cycle combiné turbine gaz-vapeur et pyrométallurgie',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 3,
    totalPages: 4,
    institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR (CNC 2023)',
    description: 'Bilans exergétiques, cycle de Rankine avec surchauffe, détente isentropique et diagrammes d’Ellingham pour la réduction du fer et du zinc.',
  },
  {
    id: 'cnc-2024-si-1',
    concoursId: 'cnc',
    subjectId: 'si',
    year: 2024,
    session: 'Session Principale 2024',
    stream: 'PSI & TSI',
    title: 'CNC 2024 — Sciences Industrielles',
    subtitle: 'Étude et asservissement d’un robot chirurgical mini-invasif télé-opéré à retour d’effort',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 5,
    institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR (CNC 2024)',
    description: 'Cinématique analytique directe et inverse, modèle dynamique par formalisme de Lagrange, synthèse de correcteurs PID et PIDF avec rejet de perturbation.',
  },
  {
    id: 'cnc-2023-si-1',
    concoursId: 'cnc',
    subjectId: 'si',
    year: 2023,
    session: 'Session Principale 2023',
    stream: 'MP',
    title: 'CNC 2023 — Sciences Industrielles',
    subtitle: 'Modélisation cinématique et dynamique d’un banc d’essai d’éolienne offshore flottante',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 3,
    totalPages: 4,
    institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR (CNC 2023)',
    description: 'Torseurs d’actions mécaniques de houle, matrice d’inertie d’un flotteur cylindrique, réponse fréquentielle et stabilité de pitch/roll.',
  },
  {
    id: 'cnc-2024-info-1',
    concoursId: 'cnc',
    subjectId: 'info',
    year: 2024,
    session: 'Session Principale 2024',
    stream: 'MP & PSI',
    title: 'CNC 2024 — Informatique & Algorithmique',
    subtitle: 'Graphes orientés pondérés, plus court chemin de Dijkstra et flot maximal de Ford-Fulkerson',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR (CNC 2024)',
    description: 'Représentation par listes d’adjacence, file de priorité par tas binaire, algorithme d’Edmonds-Karp en O(V E²), application à l’optimisation du réseau de transport national.',
  },
  {
    id: 'cnc-2023-info-1',
    concoursId: 'cnc',
    subjectId: 'info',
    year: 2023,
    session: 'Session Principale 2023',
    stream: 'TSI & PSI',
    title: 'CNC 2023 — Informatique & Programmation',
    subtitle: 'Programmation dynamique, distance d’édition de Levenshtein et arbres préfixes (Trie)',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 3,
    totalPages: 4,
    institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR (CNC 2023)',
    description: 'Structures en arbre de recherche, mémoïsation descendante et tabulaire ascendante, analyse de complexité spatiale et temporelle, implémentation Python.',
  },

  // =========================================================================
  // 2. MINES-PONTS (CONCOURS COMMUN MINES-PONTS — FRANCE)
  // =========================================================================
  {
    id: 'mines-2024-math-1',
    concoursId: 'mines',
    subjectId: 'maths',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP',
    title: 'Mines-Ponts 2024 — Mathématiques I',
    subtitle: 'Espaces vectoriels normés, théorème de Baire et sous-espaces invariants d’opérateurs',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 5,
    totalPages: 4,
    institution: 'CONCOURS COMMUN MINES-PONTS — SESSION 2024',
    description: 'Espaces de Banach, théorème de Banach-Steinhaus, spectre d’un opérateur continu, lemme de Riesz et propriétés topologiques fines.',
  },
  {
    id: 'mines-2023-math-2',
    concoursId: 'mines',
    subjectId: 'maths',
    year: 2023,
    session: 'Session 2023',
    stream: 'MP & PC',
    title: 'Mines-Ponts 2023 — Mathématiques II',
    subtitle: 'Intégrales dépendant d’un paramètre, formule sommatoire d’Euler-Maclaurin et fonction Zêta',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'CONCOURS COMMUN MINES-PONTS — SESSION 2023',
    description: 'Prolongement méromorphe de la fonction Zêta de Riemann, équation fonctionnelle, nombres de Bernoulli et estimation asymptotique de sommes partielles.',
  },
  {
    id: 'mines-2024-phys-1',
    concoursId: 'mines',
    subjectId: 'physique',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP & PC',
    title: 'Mines-Ponts 2024 — Physique I',
    subtitle: 'Physique quantique : puits de potentiel couplés, oscillation de Rabi et effet tunnel résonant',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'CONCOURS COMMUN MINES-PONTS — SESSION 2024',
    description: 'Équation de Schrödinger 1D, matrice de transfert de barrières quantiques, levée de dégénérescence et application au qubit supraconducteur.',
  },
  {
    id: 'mines-2024-si-1',
    concoursId: 'mines',
    subjectId: 'si',
    year: 2024,
    session: 'Session 2024',
    stream: 'PSI',
    title: 'Mines-Ponts 2024 — Sciences Industrielles',
    subtitle: 'Contrôle actif d’un exosquelette d’assistance à la marche pour patients hémiplégiques',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'CONCOURS COMMUN MINES-PONTS — SESSION 2024',
    description: 'Modèle biomécanique multi-corps rigides, équations de Gibbs-Appell, compensation de gravité et commande par impédance mécanique.',
  },
  {
    id: 'mines-2024-info-1',
    concoursId: 'mines',
    subjectId: 'info',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP, PC & PSI',
    title: 'Mines-Ponts 2024 — Informatique Commune',
    subtitle: 'Compression entropique de Huffman et structures de hachage par sondage quadratique',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'CONCOURS COMMUN MINES-PONTS — SESSION 2024',
    description: 'Arbres de décision optimaux, codage préfixe à longueur variable, gestion des collisions et théorèmes d’entropie de Shannon.',
  },

  // =========================================================================
  // 3. CENTRALE-SUPÉLEC (FRANCE)
  // =========================================================================
  {
    id: 'centrale-2024-math-1',
    concoursId: 'centrale',
    subjectId: 'maths',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP & PSI',
    title: 'Centrale-Supélec 2024 — Mathématiques I',
    subtitle: 'Probabilités discrètes, marches aléatoires sur les graphes et temps d’atteinte stationnaire',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'CONCOURS CENTRALE-SUPÉLEC — SESSION 2024',
    description: 'Chaînes de Markov irréductibles apériodiques, matrice de transition stochastique, temps de retour, inégalité de trou spectral et algorithme PageRank.',
  },
  {
    id: 'centrale-2023-math-2',
    concoursId: 'centrale',
    subjectId: 'maths',
    year: 2023,
    session: 'Session 2023',
    stream: 'MP',
    title: 'Centrale-Supélec 2023 — Mathématiques II',
    subtitle: 'Calcul différentiel, géométrie des sous-variétés et multiplicateur de Lagrange',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'CONCOURS CENTRALE-SUPÉLEC — SESSION 2023',
    description: 'Théorème d’inversion locale, immersion et submersion, extrema liés, courbure géodésique et application à l’optimisation sous contraintes quadratiques.',
  },
  {
    id: 'centrale-2024-phys-1',
    concoursId: 'centrale',
    subjectId: 'physique',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP & PSI',
    title: 'Centrale-Supélec 2024 — Physique & Chimie',
    subtitle: 'Ondes acoustiques non linéaires et effets thermo-acoustiques dans les milieux poreux',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'CONCOURS CENTRALE-SUPÉLEC — SESSION 2024',
    description: 'Équations d’Euler compressibles linéarisées, impédance acoustique spécifique, onde de choc faible et pompes à chaleur thermo-acoustiques sans fluide frigorigène.',
  },
  {
    id: 'centrale-2024-si-1',
    concoursId: 'centrale',
    subjectId: 'si',
    year: 2024,
    session: 'Session 2024',
    stream: 'PSI',
    title: 'Centrale-Supélec 2024 — Sciences Industrielles',
    subtitle: 'Stabilisation multivariable et navigation inertielle d’un drone quadrirotor en environnement perturbé',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 5,
    institution: 'CONCOURS CENTRALE-SUPÉLEC — SESSION 2024',
    description: 'Angles d’Euler (lacet, tangage, roulis), commande linéaire quadratique (LQR), filtre de Kalman discret et découplage dynamique des 4 axes rotoriques.',
  },
  {
    id: 'centrale-2024-info-1',
    concoursId: 'centrale',
    subjectId: 'info',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP & TSI',
    title: 'Centrale-Supélec 2024 — Informatique',
    subtitle: 'Algorithme heuristique A*, recherche de chemins optimaux et automates d’états finis',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 4,
    totalPages: 4,
    institution: 'CONCOURS CENTRALE-SUPÉLEC — SESSION 2024',
    description: 'Heuristiques admissibles et cohérentes, déterminisation d’automates finis non déterministes (AFN vers AFD), minimisation de Hopcroft et expression rationnelle.',
  },

  // =========================================================================
  // 4. CCINP (CONCOURS COMMUNS INP / EX-CCP — FRANCE)
  // =========================================================================
  {
    id: 'ccinp-2024-math-1',
    concoursId: 'ccinp',
    subjectId: 'maths',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP',
    title: 'CCINP 2024 — Mathématiques I',
    subtitle: 'Algèbre bilinéaire, matrices circulantes et diagonalisation dans les espaces hermitiens',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 3,
    totalPages: 4,
    institution: 'CONCOURS COMMUNS INP (CCINP) — SESSION 2024',
    description: 'Endomorphisme de décalage, base de Fourier discrète, valeurs propres d’une matrice circulante, théorème spectral pour les matrices normales.',
  },
  {
    id: 'ccinp-2023-math-2',
    concoursId: 'ccinp',
    subjectId: 'maths',
    year: 2023,
    session: 'Session 2023',
    stream: 'MP & PSI',
    title: 'CCINP 2023 — Mathématiques II',
    subtitle: 'Séries de Fourier, équation de la chaleur 1D et convergence uniforme',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 3,
    totalPages: 4,
    institution: 'CONCOURS COMMUNS INP (CCINP) — SESSION 2023',
    description: 'Théorème de Dirichlet et de Parseval, séparation de variables, unicité de la solution par principe du maximum et dissipation de l’énergie thermique.',
  },
  {
    id: 'ccinp-2024-phys-1',
    concoursId: 'ccinp',
    subjectId: 'physique',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP & PSI',
    title: 'CCINP 2024 — Physique',
    subtitle: 'Interférométrie optique : interféromètre de Michelson et spectrométrie par transformée de Fourier',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 3,
    totalPages: 4,
    institution: 'CONCOURS COMMUNS INP (CCINP) — SESSION 2024',
    description: 'Franges d’égale inclinaison et d’égale épaisseur, cohérence temporelle et spatiale, calcul de l’interférogramme et résolution spectrale du doublet jaune du sodium.',
  },
  {
    id: 'ccinp-2024-si-1',
    concoursId: 'ccinp',
    subjectId: 'si',
    year: 2024,
    session: 'Session 2024',
    stream: 'PSI',
    title: 'CCINP 2024 — Sciences Industrielles',
    subtitle: 'Asservissement de position et de vitesse d’une table d’usinage de précision 3 axes',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 3,
    totalPages: 4,
    institution: 'CONCOURS COMMUNS INP (CCINP) — SESSION 2024',
    description: 'Schéma-blocs fonctionnels, marges de phase et de gain dans les diagrammes de Bode et Black-Nichols, compensation d’avance de phase.',
  },
  {
    id: 'ccinp-2024-info-1',
    concoursId: 'ccinp',
    subjectId: 'info',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP & PSI',
    title: 'CCINP 2024 — Informatique Commune',
    subtitle: 'Algorithmes de parcours de graphes (BFS/DFS), détection de cycles et tri topologique',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 3,
    totalPages: 4,
    institution: 'CONCOURS COMMUNS INP (CCINP) — SESSION 2024',
    description: 'Arbre couvrant de poids minimal (Kruskal avec structure Union-Find), détection de composantes fortement connexes (Kosaraju), complexité asymptotique.',
  },

  // =========================================================================
  // 5. X - ENS (ÉCOLE POLYTECHNIQUE & ENS — FRANCE)
  // =========================================================================
  {
    id: 'xens-2024-math-1',
    concoursId: 'x-ens',
    subjectId: 'maths',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP',
    title: 'X - ENS 2024 — Mathématiques A',
    subtitle: 'Groupes compacts, algèbres de Lie et représentations irréductibles de SO(3) et SU(2)',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 5,
    totalPages: 4,
    institution: 'ÉCOLE POLYTECHNIQUE & ÉCOLES NORMALES SUPÉRIEURES (X-ENS 2024)',
    description: 'Application exponentielle sur les matrices antisymétriques, revêtement à deux feuillets de SO(3) par SU(2), décomposition en harmoniques sphériques.',
  },
  {
    id: 'xens-2023-math-2',
    concoursId: 'x-ens',
    subjectId: 'maths',
    year: 2023,
    session: 'Session 2023',
    stream: 'MP',
    title: 'X - ENS 2023 — Mathématiques B',
    subtitle: 'Théorie de la mesure, espaces L^p, injection de Sobolev et distributions tempérées',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 5,
    totalPages: 4,
    institution: 'ÉCOLE POLYTECHNIQUE & ÉCOLES NORMALES SUPÉRIEURES (X-ENS 2023)',
    description: 'Densité de l’espace de Schwartz S(ℝ), convolution régularisante, dérivation au sens des distributions et problème aux limites elliptique.',
  },
  {
    id: 'xens-2024-phys-1',
    concoursId: 'x-ens',
    subjectId: 'physique',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP & PC',
    title: 'X - ENS 2024 — Physique',
    subtitle: 'Condensats de Bose-Einstein : équation de Gross-Pitaevskii, vortex quantiques et superfluidité',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 5,
    totalPages: 4,
    institution: 'ÉCOLE POLYTECHNIQUE & ÉCOLES NORMALES SUPÉRIEURES (X-ENS 2024)',
    description: 'Statistique quantique de Bose, température critique de condensation, équation non linéaire de Gross-Pitaevskii, quantification de la circulation et critère de Landau.',
  },
  {
    id: 'xens-2024-si-1',
    concoursId: 'x-ens',
    subjectId: 'si',
    year: 2024,
    session: 'Session 2024',
    stream: 'PSI',
    title: 'X - ENS 2024 — Sciences Industrielles',
    subtitle: 'Modélisation non linéaire aéroélastique et commande prédictive robuste d’un lanceur spatial réutilisable',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 5,
    totalPages: 5,
    institution: 'ÉCOLE POLYTECHNIQUE & ÉCOLES NORMALES SUPÉRIEURES (X-ENS 2024)',
    description: 'Guidage par poussée vectorielle (gimbaling), instabilité de flottement (flutter), formulation hamiltonienne des équations de vol et commande par platitude différentielle.',
  },
  {
    id: 'xens-2024-info-1',
    concoursId: 'x-ens',
    subjectId: 'info',
    year: 2024,
    session: 'Session 2024',
    stream: 'MP Option Info',
    title: 'X - ENS 2024 — Informatique Fondamentale',
    subtitle: 'Complexité algorithmique descriptive, réductions polynomiales et classes P, NP et PSPACE',
    durationHours: 4,
    durationString: 'Durée : 4 heures',
    difficultyStars: 5,
    totalPages: 4,
    institution: 'ÉCOLE POLYTECHNIQUE & ÉCOLES NORMALES SUPÉRIEURES (X-ENS 2024)',
    description: 'Machine de Turing alternante, théorème de Savitch, problème QBF (Quantified Boolean Formula) PSPACE-complet et jeux combinatoires à deux joueurs.',
  },
]


// Helper to style official exam papers badges and borders
function getEpreuveBadgeStyle(badge: string) {
  if (badge.startsWith('MATH')) {
    return {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      borderAccent: 'border-t-indigo-500 dark:border-t-indigo-400',
      glow: 'hover:shadow-indigo-500/10',
      tag: 'Mathématiques',
      icon: Calculator,
    }
  }
  if (badge.startsWith('PHYS')) {
    return {
      bg: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30',
      borderAccent: 'border-t-sky-500 dark:border-t-sky-400',
      glow: 'hover:shadow-sky-500/10',
      tag: 'Physique',
      icon: Lightning,
    }
  }
  if (badge.startsWith('CHIM')) {
    return {
      bg: 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
      borderAccent: 'border-t-teal-500 dark:border-t-teal-400',
      glow: 'hover:shadow-teal-500/10',
      tag: 'Chimie',
      icon: Flask,
    }
  }
  if (badge.startsWith('SI')) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      borderAccent: 'border-t-amber-500 dark:border-t-amber-400',
      glow: 'hover:shadow-amber-500/10',
      tag: 'Sciences Industrielles',
      icon: Gear,
    }
  }
  if (['ARABE', 'ANGLAIS', 'FRANÇAIS'].includes(badge)) {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
      borderAccent: 'border-t-rose-500 dark:border-t-rose-400',
      glow: 'hover:shadow-rose-500/10',
      tag: 'Langues vivantes',
      icon: Books,
    }
  }
  return {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    borderAccent: 'border-t-purple-500 dark:border-t-purple-400',
    glow: 'hover:shadow-purple-500/10',
    tag: 'Informatique',
    icon: TerminalWindow,
  }
}

// --------------------------------------------------------------------------
// MAIN MULTI-PAGE COMPONENT (NO PIPELINE)
// Page 1: 'matieres'    -> Choix de la Matière
// Page 2: 'courses'     -> Liste des Cours de la Matière choisie
// Page 3: 'cours'       -> Page dédiée du Cours (Théorie & Synthèse PDF/Interactive)
// Page 4: 'td'          -> Page dédiée des TD (Pochettes 3D Glass Folders & Exercices)
// --------------------------------------------------------------------------
export function CourseExerciseQcmDoubleMode({
  onNavigateToDashboard,
  onNavigateToContact,
  onNavigateToLogin,
  hideNavbar = false,
  initialSection = 'cours',
  initialConcoursId = 'cnc',
  initialSubjectId = 'maths',
  initialCourseId = 'maths-reduc',
}: {
  onNavigateToDashboard: () => void
  onNavigateToContact: () => void
  onNavigateToLogin?: () => void
  hideNavbar?: boolean
  initialSection?: 'cours' | 'annales' | 'qcm' | 'concours' | 'matieres'
  initialConcoursId?: ConcoursId
  initialSubjectId?: 'maths' | 'physique' | 'si' | 'info'
  initialCourseId?: string
}) {
  // Active concours state
  const [selectedConcoursId, setSelectedConcoursId] = useState<ConcoursId>(initialConcoursId)

  // Level state: 'sup' (1ère Année CPGE) vs 'spe' (2ème Année CPGE)
  const [selectedLevel, setSelectedLevel] = useState<'sup' | 'spe'>('spe')

  // Flow context: 'cours' (Cours & Exercices de cours) vs 'concours' (Annales et Concours)
  const [currentFlow, setCurrentFlow] = useState<'cours' | 'concours'>(
    initialSection === 'annales' ? 'concours' : 'cours'
  )

  // Navigation: distinct full pages
  // - In 'concours': 'concours' (5 Concours Hub) -> 'concours_detail' (Sessions & Épreuves au sein du concours) -> 'exam'
  // - In 'cours': 'niveaux' (Choix du niveau SUP / SPÉ) -> 'matieres' (4 Matières) -> 'courses' (Chapitres) -> 'cours' (Théorie) / 'td' (Exercices de cours)
  const [currentPage, setCurrentPage] = useState<
    'concours' | 'concours_detail' | 'niveaux' | 'matieres' | 'courses' | 'cours' | 'td' | 'exam' | 'qcm'
  >(
    initialSection === 'annales' ? 'concours' : (initialSection === 'qcm' ? 'qcm' : 'niveaux')
  )
  const [examInitialMode, setExamInitialMode] = useState<ExamViewerMode>('normal')
  const [selectedSessionYear, setSelectedSessionYear] = useState<number | null>(null)
  const [selectedEpreuveMatiere, setSelectedEpreuveMatiere] = useState<'all' | ConcoursEpreuveFull['matiereId']>('all')
  const [selectedConcoursExam, setSelectedConcoursExam] = useState<ConcoursEpreuveFull | null>(null)
  const [examSearchFilter, setExamSearchFilter] = useState<string>('')

  function toConcoursExamItem(ep: ConcoursEpreuveFull): ConcoursExamItem {
    return {
      id: ep.id,
      concoursId: ep.concoursId,
      subjectId: ep.matiereId,
      year: ep.year,
      session: ep.sessionLabel,
      stream: ep.streams.join(' & '),
      title: ep.title,
      subtitle: ep.subtitle,
      durationHours: ep.durationHours,
      durationString: ep.durationString,
      difficultyStars: ep.difficultyStars,
      totalPages: ep.totalPages,
      institution: ep.officialHeader.institution,
      description: ep.description,
      questions: ep.questions,
      pdfUrl: ep.pdfUrl,
      corrigeUrl: ep.corrigeUrl,
    }
  }
  const selectedConcoursExamItem = useMemo(
    () => (selectedConcoursExam ? toConcoursExamItem(selectedConcoursExam) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedConcoursExam]
  )

  const [selectedSubjectId, setSelectedSubjectId] = useState<'maths' | 'physique' | 'si' | 'info'>(initialSubjectId)
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId)
  const [selectedExamId, setSelectedExamId] = useState<string>('cnc-2024-math-1')

  // Sub-mode inside "cours" page: 'interactive' | 'pdf'
  const [activeCourseMode, setActiveCourseMode] = useState<'interactive' | 'pdf'>('interactive')

  // PDF Viewer controls
  const [pdfZoom, setPdfZoom] = useState<number>(100)
  const [pdfPage, setPdfPage] = useState<number>(1)
  const [isPdfFullscreen, setIsPdfFullscreen] = useState<boolean>(false)

  // Interactive Exercises State
  const [unlockedHints, setUnlockedHints] = useState<Record<string, number>>({})
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({})
  const [exerciseEvaluations, setExerciseEvaluations] = useState<Record<string, 'mastered' | 'with_help' | 'review'>>({
    'exo-math-1': 'mastered',
  })
  const [reportedErratum, setReportedErratum] = useState<string | null>(null)

  // QCM Flash Adaptatif State (Projet 15)
  const [currentQcmIdx, setCurrentQcmIdx] = useState<number>(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false)
  const [qcmTimerSeconds, setQcmTimerSeconds] = useState<number>(105)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true)
  const [masteryScore, setMasteryScore] = useState<number>(68)
  const [spacedRepetitionAdded, setSpacedRepetitionAdded] = useState<boolean>(false)

  // Dedicated Banque QCM State (Choix de la Matière -> Lancement Immédiat)
  const [activeQcmSubject, setActiveQcmSubject] = useState<'maths' | 'physique' | 'si' | 'info' | null>(null)
  const [subjectQcmIdx, setSubjectQcmIdx] = useState<number>(0)
  const [subjectQcmSelectedOpt, setSubjectQcmSelectedOpt] = useState<string | null>(null)
  const [subjectQcmIsSubmitted, setSubjectQcmIsSubmitted] = useState<boolean>(false)
  const [subjectQcmScore, setSubjectQcmScore] = useState<number>(0)
  const [subjectQcmTimer, setSubjectQcmTimer] = useState<number>(90)
  const [subjectQcmTimerActive, setSubjectQcmTimerActive] = useState<boolean>(true)
  const [subjectQcmCompleted, setSubjectQcmCompleted] = useState<boolean>(false)

  // Timer for QCM session
  useEffect(() => {
    if (currentPage !== 'qcm' || !activeQcmSubject || !subjectQcmTimerActive || subjectQcmCompleted) return
    const interval = setInterval(() => {
      setSubjectQcmTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [currentPage, activeQcmSubject, subjectQcmTimerActive, subjectQcmCompleted])

  const subjectQcmQuestions = useMemo(() => {
    if (!activeQcmSubject) return []
    const matchingCourses = COURSES_DATABASE.filter((c) => c.subjectId === activeQcmSubject)
    const questions = matchingCourses.flatMap((c) => c.qcmQuestions)
    return questions.length > 0 ? questions : COURSES_DATABASE[0].qcmQuestions
  }, [activeQcmSubject])

  const currentSubjectActiveQcm = subjectQcmQuestions[subjectQcmIdx] || subjectQcmQuestions[0]

  const handleStartQcmSubject = (subjectId: 'maths' | 'physique' | 'si' | 'info') => {
    setActiveQcmSubject(subjectId)
    setSubjectQcmIdx(0)
    setSubjectQcmSelectedOpt(null)
    setSubjectQcmIsSubmitted(false)
    setSubjectQcmScore(0)
    setSubjectQcmTimer(90)
    setSubjectQcmTimerActive(true)
    setSubjectQcmCompleted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectSubjectQcmOption = (optId: string) => {
    if (subjectQcmIsSubmitted || !currentSubjectActiveQcm) return
    setSubjectQcmSelectedOpt(optId)
    setSubjectQcmIsSubmitted(true)
    setSubjectQcmTimerActive(false)
    if (optId === currentSubjectActiveQcm.correctOptionId) {
      setSubjectQcmScore((prev) => prev + 1)
    }
  }

  const handleNextSubjectQcm = () => {
    if (subjectQcmIdx + 1 < subjectQcmQuestions.length) {
      setSubjectQcmIdx((prev) => prev + 1)
      setSubjectQcmSelectedOpt(null)
      setSubjectQcmIsSubmitted(false)
      setSubjectQcmTimer(90)
      setSubjectQcmTimerActive(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setSubjectQcmCompleted(true)
    }
  }

  const handleResetSubjectQcm = () => {
    setSubjectQcmIdx(0)
    setSubjectQcmSelectedOpt(null)
    setSubjectQcmIsSubmitted(false)
    setSubjectQcmScore(0)
    setSubjectQcmTimer(90)
    setSubjectQcmTimerActive(true)
    setSubjectQcmCompleted(false)
  }

  // Current Concours, Subject and Course objects
  const currentConcours = CONCOURS_LIST.find((c) => c.id === selectedConcoursId) || CONCOURS_LIST[0]
  const currentConcoursMeta = CONCOURS_METADATA_CONFIG[selectedConcoursId] || CONCOURS_METADATA_CONFIG.cnc

  const currentSubject = SUBJECTS.find((s) => s.id === selectedSubjectId) || SUBJECTS[0]
  const activeSubjectCourses = COURSES_DATABASE.filter(
    (c) => c.subjectId === selectedSubjectId && (c.level || 'spe') === selectedLevel
  )

  const currentCourse =
    COURSES_DATABASE.find((c) => c.id === selectedCourseId) ||
    activeSubjectCourses[0] ||
    COURSES_DATABASE[0]

  // Exams for Annales flow
  const subjectExams = CONCOURS_EXAMS_DATABASE.filter(
    (e) => e.concoursId === selectedConcoursId && e.subjectId === selectedSubjectId
  )
  const activeSubjectExams = subjectExams.length > 0
    ? subjectExams
    : CONCOURS_EXAMS_DATABASE.filter((e) => e.concoursId === selectedConcoursId)

  const currentExam =
    CONCOURS_EXAMS_DATABASE.find((e) => e.id === selectedExamId) ||
    activeSubjectExams[0] ||
    CONCOURS_EXAMS_DATABASE[0]

  useEffect(() => {
    if (initialSection === 'annales') {
      setCurrentFlow('concours')
      setCurrentPage('concours')
    } else if (initialSection === 'cours') {
      setCurrentFlow('cours')
      setCurrentPage('niveaux')
    } else if (initialSection === 'qcm') {
      setCurrentFlow('cours')
      setCurrentPage('qcm')
    }
  }, [initialSection])

  // Navigation handlers
  const handleSelectLevel = (level: 'sup' | 'spe') => {
    setSelectedLevel(level)
    const firstCourse = COURSES_DATABASE.find(
      (c) => c.subjectId === selectedSubjectId && (c.level || 'spe') === level
    )
    if (firstCourse) setSelectedCourseId(firstCourse.id)
  }

  const handleChooseLevelAndEnterMatieres = (level: 'sup' | 'spe') => {
    setSelectedLevel(level)
    const firstCourse = COURSES_DATABASE.find(
      (c) => c.subjectId === selectedSubjectId && (c.level || 'spe') === level
    )
    if (firstCourse) setSelectedCourseId(firstCourse.id)
    setCurrentPage('matieres')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectConcours = (concoursId: ConcoursId) => {
    setSelectedConcoursId(concoursId)
    setSelectedSessionYear(null)
    setCurrentPage('concours_detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenSubjectCourses = (subjectId: 'maths' | 'physique' | 'si' | 'info') => {
    setSelectedSubjectId(subjectId)
    const firstCourse = COURSES_DATABASE.find(
      (c) => c.subjectId === subjectId && (c.level || 'spe') === selectedLevel
    )
    if (firstCourse) setSelectedCourseId(firstCourse.id)
    const firstExam = CONCOURS_EXAMS_DATABASE.find(
      (e) => e.subjectId === subjectId && e.concoursId === selectedConcoursId
    )
    if (firstExam) setSelectedExamId(firstExam.id)
    setCurrentPage('courses')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenCoursePart = (courseId: string, part: 'cours' | 'td') => {
    setSelectedCourseId(courseId)
    setCurrentPage(part)
    setPdfPage(1)
    setCurrentQcmIdx(0)
    setSelectedOption(null)
    setIsAnswerSubmitted(false)
    setSpacedRepetitionAdded(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handlers for hints and solutions
  const toggleHint = (exoId: string, totalHints: number) => {
    setUnlockedHints((prev) => {
      const current = prev[exoId] || 0
      const next = current < totalHints ? current + 1 : current
      return { ...prev, [exoId]: next }
    })
  }

  const toggleSolution = (exoId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [exoId]: !prev[exoId],
    }))
  }

  const handleEvaluation = (exoId: string, rating: 'mastered' | 'with_help' | 'review') => {
    setExerciseEvaluations((prev) => ({
      ...prev,
      [exoId]: rating,
    }))
  }

  // QCM Selection & Verification
  const currentQcmList = currentCourse.qcmQuestions.length > 0 ? currentCourse.qcmQuestions : COURSES_DATABASE[0].qcmQuestions
  const activeQcm = currentQcmList[currentQcmIdx % currentQcmList.length]

  const handleSelectOption = (optId: string) => {
    if (isAnswerSubmitted) return
    setSelectedOption(optId)
    setIsAnswerSubmitted(true)
    setIsTimerRunning(false)
    if (optId === activeQcm.correctOptionId) {
      setMasteryScore((prev) => Math.min(100, prev + 6))
    } else {
      setMasteryScore((prev) => Math.max(20, prev - 4))
    }
  }

  const handleNextQcm = () => {
    setSelectedOption(null)
    setIsAnswerSubmitted(false)
    setSpacedRepetitionAdded(false)
    setQcmTimerSeconds(105)
    setIsTimerRunning(true)
    setCurrentQcmIdx((prev) => (prev + 1) % currentQcmList.length)
  }

  return (
    <div className="learning-shell study-shell min-h-screen bg-transparent text-[#172033] dark:text-[#eaf2ff]">
      

      {/* Standalone Header if needed */}
      {!hideNavbar && (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 text-[#101b33] shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-[#101b33] dark:text-white dark:shadow-[0_8px_24px_rgba(16,27,51,.12)]">
          <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="flex items-center gap-2.5 transition hover:opacity-90"
              title="Retour au Tableau de bord"
            >
              <NexoraLogo size={34} showText />
            </button>
            <div className="flex shrink-0 items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </header>
      )}

      {/* ====================================================================== */}
      {/* PAGE 0 : PORTAIL PRINCIPAL DES 5 GRANDS CONCOURS CPGE                  */}
      {/* ====================================================================== */}
      {currentPage === 'concours' && (() => {
        return (
          <main className="relative mx-auto max-w-[1580px] px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            {/* Header with Switch to Cours */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3978F6]/30 bg-[#3978F6]/10 px-3 py-1 font-mono text-xs font-bold text-[#2866dc] dark:text-[#8db5ff]">
                  <GraduationCap size={15} weight="bold" />
                  <span>ANNALES OFFICIELLES CPGE</span>
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Les 5 Grandes Maisons de Concours d’Ingénieurs
                </span>
              </div>

              {/* Quick switch to Cours & TD */}
              <button
                type="button"
                onClick={() => {
                  setCurrentFlow('cours')
                  setCurrentPage('niveaux')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-[#2866dc] transition hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-[#8db5ff]"
              >
                <BookOpen size={15} weight="bold" />
                <span>Accéder aux Cours & TD (SUP & SPÉ)</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>

            {/* Portal Title & Hero Intro */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#172033] dark:text-white">
                Portail des Grands Concours d'Ingénieurs
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                Sélectionnez un concours ci-dessous pour entrer dans son espace dédié, explorer ses <strong>sessions d'annales officielles</strong> (2024, 2023, 2022...) et lancer les épreuves en <strong>Double Mode</strong> (Visionnage Normal ou Mode Concours sous surveillance 4h).
              </p>
            </div>

            {/* The 5 Concours Entrance Cards (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {CONCOURS_LIST.map((concours) => {
                const epreuves = CONCOURS_ANNALES_DATABASE.filter((ep) => ep.concoursId === concours.id)
                const years = Array.from(new Set(epreuves.map((ep) => ep.year))).sort((a, b) => b - a)

                return (
                  <div
                    key={concours.id}
                    className="group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 border border-slate-200/90 bg-white/80 shadow-md hover:shadow-2xl hover:border-[#3978F6]/60 dark:border-white/10 dark:bg-[#101b33]/80 backdrop-blur-md"
                  >
                    <div>
                      {/* Top Bar with School Logo and Country Pill */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-sm border border-slate-200/90 transition-transform duration-300 group-hover:scale-105 dark:bg-white/95 ${concours.logoBorderDark} ${concours.logoDarkGlow}`}
                        >
                          <img
                            src={concours.logoUrl}
                            alt={concours.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold uppercase ${concours.badgeBg}`}>
                          {concours.country}
                        </span>
                      </div>

                      {/* Concours Name & Stream */}
                      <span className="font-mono text-xs font-bold uppercase text-[#3978F6] dark:text-[#7ba9ff]">
                        {concours.shortName} • {concours.streams}
                      </span>
                      <h3 className="mt-1 text-xl font-bold text-[#172033] dark:text-white group-hover:text-[#3978F6] dark:group-hover:text-[#7ba9ff] transition-colors leading-snug">
                        {concours.name}
                      </h3>

                      <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {concours.description}
                      </p>

                      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-300">Écoles cibles :</strong> {concours.targetSchools}
                      </div>

                      {/* Stats Badges */}
                      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/10 font-mono text-xs">
                        <span className="rounded-lg bg-slate-100 dark:bg-white/5 px-2.5 py-1 font-bold text-slate-700 dark:text-slate-300">
                          {years.length} sessions (
                          {years.length > 5 ? `${years[years.length - 1]} → ${years[0]}` : years.join(', ')})
                        </span>
                        <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 font-bold text-[#2866dc] dark:text-[#8db5ff]">
                          {epreuves.length} épreuves officielles
                        </span>
                      </div>
                    </div>

                    {/* Entrance Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectConcours(concours.id)}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3978F6] to-[#2563eb] px-4 py-3 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
                    >
                      <span>Entrer dans les Annales {concours.shortName}</span>
                      <ArrowRight size={14} weight="bold" />
                    </button>
                  </div>
                )
              })}
            </div>
          </main>
        )
      })()}

      {/* ====================================================================== */}
      {/* PAGE 0.5 : AU SEIN DU CONCOURS SÉLECTIONNÉ (SESSIONS & ÉPREUVES)        */}
      {/* ====================================================================== */}
      {currentPage === 'concours_detail' && (() => {
        const currentConcoursEpreuves = CONCOURS_ANNALES_DATABASE.filter(
          (ep) => ep.concoursId === selectedConcoursId
        )
        const distinctYears = Array.from(
          new Set(currentConcoursEpreuves.map((ep) => ep.year))
        ).sort((a, b) => b - a)

        const activeSessionEpreuves =
          selectedSessionYear !== null
            ? currentConcoursEpreuves.filter((ep) => {
                if (ep.year !== selectedSessionYear) return false
                if (selectedEpreuveMatiere !== 'all' && ep.matiereId !== selectedEpreuveMatiere) return false
                if (examSearchFilter.trim()) {
                  const q = examSearchFilter.toLowerCase()
                  const matchTitle = ep.title.toLowerCase().includes(q)
                  const matchBadge = ep.epreuveBadge.toLowerCase().includes(q)
                  const matchTopic = ep.keyTopics.some((t) => t.toLowerCase().includes(q))
                  if (!matchTitle && !matchBadge && !matchTopic) return false
                }
                return true
              })
            : []

        return (
          <main className="relative mx-auto max-w-[1580px] px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            {/* Top Bar with Return to All Concours & Quick Switcher */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('concours')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#3978F6] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#122240] dark:text-slate-200"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Tous les Concours</span>
                </button>

                <nav className="flex items-center gap-1.5 text-xs font-semibold text-[#71809A] dark:text-[#91a9c8]">
                  <button
                    type="button"
                    onClick={() => setCurrentPage('concours')}
                    className="hover:text-[#3978F6]"
                  >
                    Concours CPGE
                  </button>
                  <CaretRight size={12} weight="bold" />
                  <span className="font-bold text-[#172033] dark:text-white">{currentConcours.shortName}</span>
                  <CaretRight size={12} weight="bold" />
                  <span className="font-bold text-[#3978F6] dark:text-[#74a5ff]">Sessions & Épreuves</span>
                </nav>
              </div>

              {/* Quick Switcher Between the 5 Concours */}
              <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-1 text-xs dark:border-white/10 dark:bg-[#101f3c]">
                {CONCOURS_LIST.map((c) => {
                  const isActive = c.id === selectedConcoursId
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedConcoursId(c.id)
                        setSelectedSessionYear(null)
                      }}
                      className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-bold transition whitespace-nowrap text-xs ${
                        isActive
                          ? 'bg-white text-[#3978F6] shadow-sm dark:bg-[#1a2f55] dark:text-white'
                          : 'text-slate-600 hover:text-black dark:text-slate-300 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white p-0.5 overflow-hidden shadow-2xs dark:bg-white/95">
                        <img src={c.logoUrl} alt="" className="h-full w-full object-contain" />
                      </div>
                      <span>{c.shortName}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected Concours Overview Hero Banner */}
            <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white/95 via-slate-50/80 to-blue-50/40 p-6 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-gradient-to-br dark:from-[#101f3c] dark:via-[#0c172d] dark:to-[#081020] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5 max-w-3xl">
                  {/* Large Official Concours Logo */}
                  <div
                    className={`flex size-18 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/90 dark:bg-white/95 ${currentConcours.logoBorderDark} ${currentConcours.logoDarkGlow}`}
                  >
                    <img
                      src={currentConcours.logoUrl}
                      alt={currentConcours.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="rounded-full bg-blue-500/15 px-3 py-0.5 font-mono text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                        {currentConcours.shortName} • {currentConcours.country}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Filières : {currentConcours.streams}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white">
                      Annales Officielles — {currentConcours.name}
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {currentConcours.description}
                    </p>
                    <p className="mt-2 text-[11.5px] text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">Écoles intégrées :</strong> {currentConcours.targetSchools}
                    </p>
                  </div>
                </div>

                {/* Quick stats badges */}
                <div className="flex shrink-0 flex-wrap gap-3 sm:flex-nowrap">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 text-center shadow-xs dark:border-white/10 dark:bg-white/5 min-w-[110px]">
                    <span className="block font-mono text-xl font-bold text-[#3978F6] dark:text-[#7ba9ff]">
                      {distinctYears.length}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Sessions
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 text-center shadow-xs dark:border-white/10 dark:bg-white/5 min-w-[110px]">
                    <span className="block font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {currentConcoursEpreuves.length}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Épreuves
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 text-center shadow-xs dark:border-white/10 dark:bg-white/5 min-w-[110px]">
                    <span className="block font-mono text-xl font-bold text-purple-600 dark:text-purple-400">
                      2 Modes
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Libre / Concours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* IF NO SESSION SELECTED: DISPLAY SESSIONS AS INTERACTIVE BUTTONS/CARDS */}
            {selectedSessionYear === null ? (
              <section className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                      <CalendarCheck size={14} weight="bold" />
                      <span>SESSIONS DU CONCOURS {currentConcours.shortName}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {distinctYears.length} sessions d'annales officielles
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white">
                    Sélectionnez une Session d'Épreuves
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Chaque bouton ci-dessous ouvre l'ensemble des épreuves officielles (Maths, Physique, SI, Informatique) de la session sélectionnée.
                  </p>
                </div>

                {/* Grid of Session Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {distinctYears.map((yr) => {
                    const yearEpreuves = currentConcoursEpreuves.filter((ep) => ep.year === yr)

                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          setSelectedSessionYear(yr)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white/90 p-7 text-left shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#3978F6] hover:shadow-xl dark:border-white/10 dark:bg-[#101b33]/80 dark:hover:border-blue-400 cursor-pointer"
                      >
                        {/* Top subtle accent gradient line */}
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#3978F6] via-sky-400 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 font-mono text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                              <CalendarCheck size={15} weight="bold" />
                              <span>SESSION {yr}</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                              {currentConcours.shortName}
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#3978F6] dark:group-hover:text-[#7ba9ff] transition-colors">
                            Session Officielle {yr}
                          </h3>
                          <p className="mt-1 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            Filières {currentConcours.streams}
                          </p>

                          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Épreuves écrites officielles posées au concours {currentConcours.name} lors de la session {yr}, avec barèmes et simulation chronométrée.
                          </p>

                          {/* Matières pills in this session */}
                          <div className="mt-5 flex flex-wrap gap-1.5">
                            {yearEpreuves.map((ep) => (
                              <span
                                key={ep.id}
                                className="rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1 font-mono text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                              >
                                {ep.epreuveBadge}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Action Area */}
                        <div className="mt-7 pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                            {yearEpreuves.length} épreuves officielles
                          </span>
                          <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3978F6] to-[#2563eb] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all group-hover:shadow-md group-hover:brightness-110">
                            <span>Voir les épreuves {yr}</span>
                            <ArrowRight size={13} weight="bold" className="transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            ) : (
              /* IF A SESSION IS SELECTED: DISPLAY THE ÉPREUVES OF THIS SESSION WITH SESSION BUTTONS AT THE TOP */
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Session Navigation Bar & Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#101b33]/60">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSessionYear(null)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#3978F6] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#122240] dark:text-slate-200"
                    >
                      <ArrowLeft size={14} weight="bold" />
                      <span>Changer de Session</span>
                    </button>

                    <nav className="flex items-center gap-1.5 text-xs font-semibold text-[#71809A] dark:text-[#91a9c8]">
                      <button
                        type="button"
                        onClick={() => setSelectedSessionYear(null)}
                        className="hover:text-[#3978F6]"
                      >
                        Sessions {currentConcours.shortName}
                      </button>
                      <CaretRight size={12} weight="bold" />
                      <span className="font-bold text-[#3978F6] dark:text-[#74a5ff]">
                        Session {selectedSessionYear}
                      </span>
                      <CaretRight size={12} weight="bold" />
                      <span className="font-bold text-[#172033] dark:text-white">Épreuves</span>
                    </nav>
                  </div>

                  {/* Buttons for each Session to switch directly */}
                  <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-1 text-xs dark:border-white/10 dark:bg-[#101f3c]">
                    <span className="px-2 font-mono text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Session :
                    </span>
                    {distinctYears.map((yr) => {
                      const isActive = selectedSessionYear === yr
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setSelectedSessionYear(yr)}
                          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold transition whitespace-nowrap ${
                            isActive
                              ? 'bg-[#3978F6] text-white shadow-xs'
                              : 'text-slate-600 hover:text-black dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          <CalendarCheck size={13} weight={isActive ? 'fill' : 'bold'} />
                          <span>Session {yr}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Active Session Title Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-white/10">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="rounded-full bg-blue-500/15 px-3 py-0.5 font-mono text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                        {currentConcours.shortName} • Session {selectedSessionYear}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Filières {currentConcours.streams}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white">
                      Épreuves Officielles — Session {selectedSessionYear}
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      Consultez les sujets en <strong>Visionnage Normal</strong> (zoom, corrigés pas à pas) ou lancez le <strong>Mode Concours</strong> sous conditions officielles.
                    </p>
                  </div>

                  <span className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-1.5 font-mono text-xs font-bold text-slate-700 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    {activeSessionEpreuves.length} épreuve(s) officielle(s)
                  </span>
                </div>

                {/* Filter by Matière & Search bar */}
                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#101b33]/60">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Matière Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mr-1">
                        Matière :
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedEpreuveMatiere('all')}
                        className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                          selectedEpreuveMatiere === 'all'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                        }`}
                      >
                        Toutes les épreuves
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedEpreuveMatiere('maths')}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition ${
                          selectedEpreuveMatiere === 'maths'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300'
                        }`}
                      >
                        <Calculator size={13} weight="bold" />
                        <span>Mathématiques (Maths 1 & 2)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedEpreuveMatiere('physique')}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition ${
                          selectedEpreuveMatiere === 'physique'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300'
                        }`}
                      >
                        <Lightning size={13} weight="bold" />
                        <span>Physique & Chimie</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedEpreuveMatiere('si')}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition ${
                          selectedEpreuveMatiere === 'si'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300'
                        }`}
                      >
                        <Gear size={13} weight="bold" />
                        <span>Sciences Industrielles (SI)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedEpreuveMatiere('info')}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition ${
                          selectedEpreuveMatiere === 'info'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-300'
                        }`}
                      >
                        <TerminalWindow size={13} weight="bold" />
                        <span>Informatique</span>
                      </button>
                      {currentConcoursEpreuves.some((ep) => ep.matiereId === 'langues') && (
                        <button
                          type="button"
                          onClick={() => setSelectedEpreuveMatiere('langues')}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition ${
                            selectedEpreuveMatiere === 'langues'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300'
                          }`}
                        >
                          <Books size={13} weight="bold" />
                          <span>Langues vivantes</span>
                        </button>
                      )}
                    </div>

                    {/* Search input */}
                    <div className="relative min-w-[240px] max-w-sm">
                      <input
                        type="text"
                        value={examSearchFilter}
                        onChange={(e) => setExamSearchFilter(e.target.value)}
                        placeholder="Filtrer par thème, mot-clé..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-[#3978F6] focus:outline-hidden dark:border-white/10 dark:bg-[#122240] dark:text-white dark:placeholder-slate-500"
                      />
                      {examSearchFilter && (
                        <button
                          type="button"
                          onClick={() => setExamSearchFilter('')}
                          className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          <span className="font-bold text-xs">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Responsive Grid of Epreuves for the selected session */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {activeSessionEpreuves.map((ep) => {
                        const styleMeta = getEpreuveBadgeStyle(ep.epreuveBadge)
                        const IconEpreuve = styleMeta.icon

                        return (
                          <div
                            key={ep.id}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:bg-[#101b33]/80 ${styleMeta.borderAccent} border-t-4`}
                          >
                            {/* Card Top: Epreuve Badge, Filières, Duration */}
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 font-mono text-xs font-bold tracking-wide ${styleMeta.bg}`}
                                  >
                                    <IconEpreuve size={14} weight="bold" />
                                    <span>{ep.epreuveBadge}</span>
                                  </span>
                                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {ep.streams.join(' • ')}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                                    <Clock size={12} weight="bold" />
                                    <span>{ep.durationHours}h00</span>
                                  </span>
                                  <div className="flex text-amber-500 text-xs" title={`Difficulté : ${ep.difficultyStars}/5`}>
                                    {Array.from({ length: ep.difficultyStars }).map((_, i) => (
                                      <Star key={i} size={11} weight="fill" />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Title & Subtitle */}
                              <div className="mt-4">
                                <h3 className="text-base font-bold leading-snug text-[#172033] transition group-hover:text-[#3978F6] dark:text-white dark:group-hover:text-[#7ba9ff]">
                                  {ep.title}
                                </h3>
                                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  {ep.subtitle}
                                </p>
                              </div>

                              {/* Description summary */}
                              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                                {ep.description}
                              </p>

                              {/* Key Topics tags */}
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {ep.keyTopics.map((topic, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600 dark:border-white/5 dark:bg-white/5 dark:text-slate-400"
                                  >
                                    #{topic}
                                  </span>
                                ))}
                              </div>

                              {/* Coefficients & Question Stats */}
                              <div className="mt-4 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-white/5 dark:bg-white/5">
                                {!ep.pdfUrl && (
                                  <div className="flex items-center justify-between font-mono text-slate-600 dark:text-slate-300">
                                    <span>Coefficients :</span>
                                    <span className="font-bold text-slate-800 dark:text-white">
                                      MP: {ep.coeffMP ?? '-'} • PSI: {ep.coeffPSI ?? '-'} • TSI: {ep.coeffTSI ?? '-'}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between font-mono text-slate-500 dark:text-slate-400">
                                  <span>{ep.pdfUrl ? 'Documents :' : 'Structure :'}</span>
                                  <span>
                                    {ep.pdfUrl
                                      ? `Énoncé ${ep.totalPages} p.${ep.corrigeUrl ? ` • Corrigé ${ep.corrigePages ?? ''} p.` : ''}`
                                      : `${ep.questions.length} questions • Barème /20`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Dual Mode Buttons: Visionnage Normal & Mode Concours */}
                            <div className="mt-5 space-y-2 border-t border-slate-200/80 pt-4 dark:border-white/10">
                              <div className="grid grid-cols-2 gap-2">
                                {/* Button 1: Normal Free Viewer */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedConcoursExam(ep)
                                    setExamInitialMode('normal')
                                    setCurrentPage('exam')
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                  }}
                                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-800 shadow-xs transition hover:border-[#3978F6] hover:bg-slate-50 hover:text-[#3978F6] active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                                  title="Consulter le sujet en mode libre avec zoom, LaTeX et corrigé pas à pas"
                                >
                                  <Eye size={14} weight="bold" />
                                  <span>Visionnage Normal</span>
                                </button>

                                {/* Button 2: Strict Concours Simulation */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedConcoursExam(ep)
                                    setExamInitialMode('concours')
                                    setCurrentPage('exam')
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                  }}
                                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3978F6] to-[#1e54c9] px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:from-[#2e6ce8] hover:to-[#1746ad] hover:shadow-lg active:scale-[0.98]"
                                  title={`Lancer l’épreuve en conditions réelles (${ep.durationHours}h) avec chronomètre officiel, anti-triche et brouillon virtuel`}
                                >
                                  <Clock size={14} weight="bold" />
                                  <span>Mode Concours ({ep.durationHours}h)</span>
                                </button>
                              </div>

                              {ep.pdfUrl && (
                                <div className="grid grid-cols-2 gap-2">
                                  <a
                                    href={ep.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300"
                                  >
                                    <FilePdf size={14} weight="bold" />
                                    <span>Énoncé PDF</span>
                                  </a>
                                  {ep.corrigeUrl ? (
                                    <a
                                      href={ep.corrigeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                                    >
                                      <FilePdf size={14} weight="bold" />
                                      <span>Corrigé PDF</span>
                                    </a>
                                  ) : (
                                    <span className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs font-bold text-slate-400 dark:border-white/10">
                                      Corrigé indisponible
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white p-0.5 overflow-hidden shadow-2xs dark:bg-white/95">
                                  <img src={currentConcours.logoUrl} alt="" className="h-full w-full object-contain" />
                                </div>
                                <span>Épreuve officielle {currentConcours.shortName} • Session {selectedSessionYear}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

              {activeSessionEpreuves.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-white/10">
                  <WarningCircle size={36} className="mx-auto text-slate-400 mb-3" />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    Aucune épreuve trouvée pour ces filtres
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Essayez de réinitialiser vos filtres de matière ou de recherche.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEpreuveMatiere('all')
                      setExamSearchFilter('')
                    }}
                    className="mt-4 rounded-xl bg-[#3978F6] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#2866dc]"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}

              {/* Return to sessions list button */}
              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSessionYear(null)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#3978F6] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#122240] dark:text-slate-200"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Choisir une autre session ({currentConcours.shortName})</span>
                </button>
              </div>
            </div>
          )}
          </main>
        )
      })()}

      {/* ====================================================================== */}
      {/* PAGE 1 : SÉLECTION DU NIVEAU CPGE (SUP / SPÉ)                          */}
      {/* ====================================================================== */}
      {currentPage === 'niveaux' && (
        <main className="relative mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 animate-in fade-in duration-300">
          {/* Top Bar Header */}
          <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-slate-200/80 pb-5 dark:border-white/10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-[#2866dc] dark:text-[#8db5ff]">
              <BookOpen size={15} weight="bold" />
              <span>COURS & TD CPGE</span>
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Portail des Programmes Académiques Préparatoires
            </span>
          </div>

          {/* Section Hero Headline */}
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#172033] dark:text-white">
              Sélectionnez votre Année CPGE
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Choisissez votre cycle d’études pour accéder directement aux matières, cours magistraux, fiches de synthèse et séances de travaux dirigés.
            </p>
          </div>

          {/* The 2 Prominent 3D Level Boxes: SUP vs SPÉ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Box 1: NIVEAU SUP */}
            <div
              onClick={() => handleChooseLevelAndEnterMatieres('sup')}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-white/95 via-blue-50/40 to-indigo-50/60 p-7 sm:p-9 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-500/70 dark:border-blue-500/20 dark:bg-gradient-to-br dark:from-[#111c33] dark:via-[#0c1629] dark:to-[#081020] cursor-pointer"
            >
              {/* Top Accent Gradient Line */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-600" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3.5 py-1 font-mono text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    <GraduationCap size={16} weight="bold" />
                    <span>1ÈRE ANNÉE CPGE</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    Tronc Commun
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Niveau SUP
                </h2>
                <p className="mt-1 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  Filières MPSI • PCSI • PTSI • TSI 1
                </p>

                <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Acquisition des fondements mathématiques et scientifiques : analyse réelle, nombres complexes, dérivation & formules de Taylor, mécanique newtonienne, cinématique du solide et algorithmique fondamentale en Python.
                </p>

                {/* Matières Pills Preview */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-xl border border-blue-200/80 bg-blue-50/80 px-2.5 py-1 font-mono text-xs font-bold text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                    Mathématiques (Algèbre & Analyse)
                  </span>
                  <span className="rounded-xl border border-sky-200/80 bg-sky-50/80 px-2.5 py-1 font-mono text-xs font-bold text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                    Physique-Chimie (Mécanique & Optique)
                  </span>
                  <span className="rounded-xl border border-teal-200/80 bg-teal-50/80 px-2.5 py-1 font-mono text-xs font-bold text-teal-800 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
                    Sciences Industrielles (Cinématique)
                  </span>
                  <span className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 font-mono text-xs font-bold text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                    Informatique (Algorithmique Python)
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  4 matières • Cours & TD
                </span>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:shadow-lg group-hover:shadow-blue-500/35"
                >
                  <span>Entrer en SUP</span>
                  <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Box 2: NIVEAU SPÉ */}
            <div
              onClick={() => handleChooseLevelAndEnterMatieres('spe')}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-white/95 via-purple-50/40 to-violet-50/60 p-7 sm:p-9 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-purple-500/70 dark:border-purple-500/20 dark:bg-gradient-to-br dark:from-[#150d27] dark:via-[#0c1629] dark:to-[#081020] cursor-pointer"
            >
              {/* Top Accent Gradient Line */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-violet-600" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-3.5 py-1 font-mono text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    <Trophy size={16} weight="bold" />
                    <span>2ÈME ANNÉE CPGE</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    Année des Concours
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Niveau SPÉ
                </h2>
                <p className="mt-1 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                  Filières MP • PSI • PC • TSI 2
                </p>

                <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Approfondissement théorique et préparation intensive aux concours d'ingénieurs : réduction des endomorphismes, séries entières & séries de Fourier, espaces préhilbertiens, électromagnétisme & Maxwell, systèmes asservis (SLCI) et algorithmique de graphes.
                </p>

                {/* Matières Pills Preview */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-xl border border-purple-200/80 bg-purple-50/80 px-2.5 py-1 font-mono text-xs font-bold text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300">
                    Mathématiques (Algèbre & Analyse II)
                  </span>
                  <span className="rounded-xl border border-blue-200/80 bg-blue-50/80 px-2.5 py-1 font-mono text-xs font-bold text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                    Physique-Chimie (Électromagnétisme & Thermo)
                  </span>
                  <span className="rounded-xl border border-teal-200/80 bg-teal-50/80 px-2.5 py-1 font-mono text-xs font-bold text-teal-800 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
                    Sciences Industrielles (SLCI & Dynamique)
                  </span>
                  <span className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 font-mono text-xs font-bold text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                    Informatique (Graphes & Dynamique)
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  4 matières • Cours & TD
                </span>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/25 transition-all group-hover:from-purple-500 group-hover:to-violet-500 group-hover:shadow-lg group-hover:shadow-purple-500/35"
                >
                  <span>Entrer en SPÉ</span>
                  <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================== */}
      {/* PAGE 1.5 : MATIÈRES DE COURS DU NIVEAU SÉLECTIONNÉ (SUP / SPÉ)         */}
      {/* ====================================================================== */}
      {currentPage === 'matieres' && (
        <main className="relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-300">
          {/* Top Bar Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage('niveaux')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#3978F6] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#122240] dark:text-slate-200"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Changer de Niveau (SUP / SPÉ)</span>
              </button>

              <nav className="flex items-center gap-1.5 text-xs font-semibold text-[#71809A] dark:text-[#91a9c8]">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('niveaux')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="hover:text-[#3978F6]"
                >
                  Programme CPGE
                </button>
                <CaretRight size={12} weight="bold" />
                <span className="font-bold text-[#3978F6] dark:text-[#74a5ff]">
                  Niveau {selectedLevel === 'sup' ? 'SUP (1ère Année)' : 'SPÉ (2ème Année)'}
                </span>
                <CaretRight size={12} weight="bold" />
                <span className="font-bold text-[#172033] dark:text-white">Matières</span>
              </nav>
            </div>

            {/* Quick Segmented Toggle Between SUP and SPÉ */}
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100 p-1 text-xs dark:border-white/10 dark:bg-[#101f3c]">
              <button
                type="button"
                onClick={() => handleSelectLevel('sup')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition ${
                  selectedLevel === 'sup'
                    ? 'bg-white text-blue-600 shadow-xs dark:bg-[#1a2f55] dark:text-blue-300'
                    : 'text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <GraduationCap size={14} weight="bold" />
                <span>Niveau SUP</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectLevel('spe')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition ${
                  selectedLevel === 'spe'
                    ? 'bg-white text-purple-600 shadow-xs dark:bg-[#2e1065] dark:text-purple-300'
                    : 'text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Trophy size={14} weight="bold" />
                <span>Niveau SPÉ</span>
              </button>
            </div>
          </div>

          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-[#eaf2ff]">
              Matières du Programme — Niveau {selectedLevel === 'sup' ? 'SUP (1ère Année)' : 'SPÉ (2ème Année)'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#71809A] dark:text-[#91a9c8] max-w-2xl">
              Filières {selectedLevel === 'sup' ? 'MPSI • PCSI • PTSI • TSI 1' : 'MP • PSI • PC • TSI 2'} — Chaque matière est organisée en <strong>cours théoriques</strong> (théorèmes, formules LaTeX et fiches) et en <strong>séances de TD</strong> (exercices d’annales résolus et QCM).
            </p>
          </div>

          {/* Responsive 4-Column Grid of tactile Glassmorphic Folder Cards (configured for level) */}
          <GlassmorphicFolderCards
            level={selectedLevel}
            onSelectSubject={handleOpenSubjectCourses}
          />
        </main>
      )}

      {/* ====================================================================== */}
      {/* PAGE 2 : LISTE DES CHAPITRES DE COURS PAR MATIÈRE                      */}
      {/* ====================================================================== */}
      {currentPage === 'courses' && (
        <main className="relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-300">
          {/* Header & Back Button to Matières */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage('matieres')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#3978F6] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#122240] dark:text-slate-200"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Retour aux Matières ({selectedLevel.toUpperCase()})</span>
              </button>

              <nav className="flex items-center gap-1.5 text-xs font-semibold text-[#71809A] dark:text-[#91a9c8]">
                <button type="button" onClick={() => setCurrentPage('matieres')} className="hover:text-[#3978F6]">
                  Niveau {selectedLevel === 'sup' ? 'SUP' : 'SPÉ'}
                </button>
                <CaretRight size={12} weight="bold" />
                <span className="font-bold text-[#172033] dark:text-white">{currentSubject.name}</span>
                <CaretRight size={12} weight="bold" />
                <span className="font-bold text-[#3978F6] dark:text-[#74a5ff]">Chapitres de Cours</span>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#3978F6]/15 px-3 py-1 text-xs font-bold text-[#2866dc] dark:bg-[#3978F6]/30 dark:text-[#9cc0ff]">
                {activeSubjectCourses.length} chapitre{activeSubjectCourses.length > 1 ? 's' : ''} disponible{activeSubjectCourses.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-[#eaf2ff]">
              Chapitres de {currentSubject.name} — Niveau {selectedLevel === 'sup' ? 'SUP (1ère Année)' : 'SPÉ (2ème Année)'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#71809A] dark:text-[#91a9c8]">
              Sélectionnez un chapitre pour ouvrir sa Partie Cours (théorie, théorèmes et fiches) ou sa Partie TD (exercices d’application et QCM d’évaluation).
            </p>
          </div>

          {/* GRID OF COURSES CHAPTERS */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {activeSubjectCourses.map((c) => (
              <div
                key={c.id}
                className="glowing-card rounded-3xl p-6 shadow-xl border border-slate-200/90 dark:border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#3978F6]/15 px-2.5 py-1 text-xs font-bold text-[#2866dc] dark:bg-[#3978F6]/30 dark:text-[#9cc0ff]">
                      Chapitre {c.chapterNumber} • {c.stream}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 4 }).map((_, s) => (
                        <Star
                          key={s}
                          size={14}
                          weight={s < c.difficultyStars ? 'fill' : 'regular'}
                          className={s < c.difficultyStars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                        />
                      ))}
                    </div>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-[#172033] dark:text-white leading-snug">
                    {c.title}
                  </h2>
                  <p className="mt-1 text-xs text-[#71809A] dark:text-[#91a9c8]">
                    {c.subTitle}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {c.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock size={14} weight="bold" />
                      <span>{c.durationEstimate}</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckSquare size={14} weight="bold" />
                      <span>{c.exercises.length} exercices d’annales</span>
                    </span>
                  </div>
                </div>

                {/* 2 Clear Action Buttons: Ouvrir Cours vs Ouvrir TD */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200/80 pt-4 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => handleOpenCoursePart(c.id, 'cours')}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#3978F6]/40 bg-[#3978F6]/10 px-4 py-3 text-xs font-bold text-[#2866dc] transition hover:bg-[#3978F6] hover:text-white dark:text-[#8db5ff]"
                  >
                    <BookOpen size={16} weight="bold" />
                    <span>Ouvrir Partie Cours</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenCoursePart(c.id, 'td')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3978F6] to-[#2563eb] px-4 py-3 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
                  >
                    <Lightning size={16} weight="fill" className="text-amber-300" />
                    <span>Ouvrir Partie TD</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ====================================================================== */}
      {/* PAGE 3 : PARTIE COURS (DEDICATED FULL-PAGE COURSE THEORY & PDF)         */}
      {/* ====================================================================== */}
      {currentPage === 'cours' && (
        <main className="relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-300">
          {/* Top Navigation Bar of the Course Page */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage('courses')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#3978F6] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#122240] dark:text-slate-200"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Retour aux Chapitres ({currentSubject.name})</span>
              </button>

              <nav className="flex items-center gap-1.5 text-xs font-semibold text-[#71809A] dark:text-[#91a9c8]">
                <button type="button" onClick={() => setCurrentPage('matieres')} className="hover:text-[#3978F6]">
                  Niveau {selectedLevel === 'sup' ? 'SUP' : 'SPÉ'}
                </button>
                <CaretRight size={12} weight="bold" />
                <button type="button" onClick={() => setCurrentPage('courses')} className="hover:text-[#3978F6]">
                  {currentSubject.name}
                </button>
                <CaretRight size={12} weight="bold" />
                <button type="button" onClick={() => setCurrentPage('courses')} className="hover:text-[#3978F6]">
                  Chapitre {currentCourse.chapterNumber}
                </button>
                <CaretRight size={12} weight="bold" />
                <span className="font-bold text-[#3978F6] dark:text-[#74a5ff]">Partie Cours</span>
              </nav>
            </div>

            {/* Switch to TD Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenCoursePart(currentCourse.id, 'td')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3978F6] to-[#2563eb] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-110"
              >
                <span>Aller à la Partie TD</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </div>

          {/* Course Title Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rounded-md border border-[#3978F6]/30 bg-[#3978F6]/10 px-2.5 py-0.5 text-xs font-bold text-[#2866dc] dark:text-[#8db5ff]">
                {currentCourse.stream} • Chapitre {currentCourse.chapterNumber}
              </span>
              <h1 className="mt-1 text-xl sm:text-3xl font-bold text-[#172033] dark:text-white">
                {currentCourse.title}
              </h1>
            </div>

            {/* Sub-mode switcher inside Cours: Fiche Interactive vs Planche PDF */}
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100 p-1 text-xs dark:border-white/10 dark:bg-[#101f3c]">
              <button
                type="button"
                onClick={() => setActiveCourseMode('interactive')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition ${
                  activeCourseMode === 'interactive'
                    ? 'bg-white text-[#3978F6] shadow-sm dark:bg-[#1e3256] dark:text-white'
                    : 'text-slate-600 hover:text-black dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <Lightning size={14} weight="fill" className="text-amber-400" />
                <span>Fiche Interactive KaTeX</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCourseMode('pdf')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition ${
                  activeCourseMode === 'pdf'
                    ? 'bg-white text-[#3978F6] shadow-sm dark:bg-[#1e3256] dark:text-white'
                    : 'text-slate-600 hover:text-black dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <FilePdf size={14} weight="bold" />
                <span>Planche PDF Officielle</span>
              </button>
            </div>
          </div>

          {/* Interactive Course Mode */}
          {activeCourseMode === 'interactive' && (
            <div className="space-y-6">
              {/* Objectives */}
              <div className="glowing-card rounded-2xl p-5 shadow-lg border border-[#3978F6]/25">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-[#3978F6]/15 text-[#3978F6]">
                    <GraduationCap size={18} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#172033] dark:text-white">
                      Objectifs & Compétences Clés CNC
                    </h2>
                    <p className="text-xs text-[#71809A] dark:text-[#91a9c8]">
                      Exigible aux épreuves écrites et orales du Concours National Commun
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
                  {currentCourse.summary}
                </p>
              </div>

              {/* Course Theory Sections */}
              {currentCourse.theorySections.map((sec, secIdx) => (
                <article key={secIdx} className="glowing-card rounded-2xl p-6 shadow-lg space-y-4">
                  <h2 className="border-l-4 border-[#3978F6] pl-3 text-sm sm:text-base font-bold text-[#172033] dark:text-white">
                    {sec.title}
                  </h2>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-justify text-slate-700 dark:text-slate-300">
                    {sec.content}
                  </p>

                  {sec.mathFormula && (
                    <div className="my-3 rounded-xl border border-slate-200/90 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
                      <MathFormula math={sec.mathFormula} block />
                    </div>
                  )}

                  {/* Theorems */}
                  {sec.theorems && sec.theorems.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {sec.theorems.map((th, thIdx) => (
                        <div
                          key={thIdx}
                          className="rounded-xl border border-blue-400/30 bg-blue-500/5 p-4 dark:border-blue-500/20 dark:bg-blue-500/5"
                        >
                          <p className="font-bold text-xs sm:text-[13px] text-blue-900 dark:text-blue-300">
                            {th.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                            {th.content}
                          </p>
                          {th.math && (
                            <div className="my-2">
                              <MathFormula math={th.math} block />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trap Warning */}
                  {sec.trap && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                        <WarningCircle size={17} weight="fill" className="text-amber-500" />
                        <span>{sec.trap.title}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                        {sec.trap.content}
                      </p>
                      {sec.trap.math && (
                        <div className="my-2">
                          <MathFormula math={sec.trap.math} block />
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}

              {/* Bottom Call to Action: Go to TD Page */}
              <div className="rounded-2xl bg-gradient-to-r from-[#101b33] via-[#16274a] to-[#101b33] p-6 text-white shadow-xl border border-[#3978F6]/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold">
                    Prêt pour les Travaux Dirigés&nbsp;?
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Ouvrez la page dédiée aux TD pour vous entraîner sur les {currentCourse.exercises.length} exercices d’annales CNC avec les pochettes 3D.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCoursePart(currentCourse.id, 'td')}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3978F6] to-[#2563eb] px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:brightness-110 active:scale-95"
                >
                  <Lightning size={16} weight="fill" className="text-amber-300" />
                  <span>Ouvrir la Page des TD</span>
                  <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* PDF Mode (Planche de Cours) */}
          {activeCourseMode === 'pdf' && (
            <div className="space-y-4">
              <div className="glass-container flex flex-wrap items-center justify-between gap-3 rounded-xl p-3 shadow-md">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#172033] dark:text-white">Planche PDF de Cours :</span>
                  <span className="rounded bg-slate-200/60 px-2 py-0.5 font-mono text-xs font-semibold dark:bg-white/10">
                    {currentCourse.pdfInfo.fileName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.max(60, z - 10))}
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
                    title="Zoom arrière"
                  >
                    <MagnifyingGlassMinus size={15} weight="bold" />
                  </button>
                  <span className="font-mono text-xs font-bold text-[#172033] dark:text-white min-w-12 text-center">
                    {pdfZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.min(180, z + 10))}
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
                    title="Zoom avant"
                  >
                    <MagnifyingGlassPlus size={15} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
                    title="Imprimer la planche"
                  >
                    <Printer size={15} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Rendered Course Sheet */}
              <div
                className={`mx-auto max-w-4xl rounded-2xl border border-slate-300/80 bg-white p-8 text-black shadow-2xl dark:bg-[#0c1628] dark:text-[#f1f5f9] dark:border-white/15 ${
                  isPdfFullscreen ? 'fixed inset-4 z-50 overflow-y-auto max-w-none' : ''
                }`}
                style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}
              >
                <div className="border-b-2 border-black pb-4 text-center dark:border-white/30">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Royaume du Maroc — Ministère de l’Enseignement Supérieur
                  </p>
                  <h2 className="mt-1 text-base font-bold tracking-tight sm:text-lg">
                    {currentCourse.pdfInfo.officialTitle}
                  </h2>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {currentCourse.pdfInfo.epreuve} • {currentCourse.pdfInfo.session} • Durée : {currentCourse.pdfInfo.duration}
                  </p>
                </div>

                <div className="mt-6 space-y-6 text-xs sm:text-[13px] leading-relaxed">
                  {currentCourse.theorySections.map((sec, idx) => (
                    <div key={idx}>
                      <h3 className="border-l-4 border-[#3978F6] pl-3 text-sm font-bold text-[#172033] dark:text-white">
                        {sec.title}
                      </h3>
                      <p className="mt-2 text-justify">{sec.content}</p>
                      {sec.mathFormula && <MathFormula math={sec.mathFormula} block />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ====================================================================== */}
      {/* PAGE 4 : PARTIE TD (DEDICATED FULL-PAGE TD WITH 3D GLASS FOLDERS)      */}
      {/* ====================================================================== */}
      {currentPage === 'td' && (
        <main className="relative mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-300">
          {/* Top Navigation Bar of the TD Page */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage('courses')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#3978F6] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#122240] dark:text-slate-200"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Retour aux Chapitres ({currentSubject.name})</span>
              </button>

              <nav className="flex items-center gap-1.5 text-xs font-semibold text-[#71809A] dark:text-[#91a9c8]">
                <button type="button" onClick={() => setCurrentPage('matieres')} className="hover:text-[#3978F6]">
                  Niveau {selectedLevel === 'sup' ? 'SUP' : 'SPÉ'}
                </button>
                <CaretRight size={12} weight="bold" />
                <button type="button" onClick={() => setCurrentPage('courses')} className="hover:text-[#3978F6]">
                  {currentSubject.name}
                </button>
                <CaretRight size={12} weight="bold" />
                <button type="button" onClick={() => setCurrentPage('courses')} className="hover:text-[#3978F6]">
                  Chapitre {currentCourse.chapterNumber}
                </button>
                <CaretRight size={12} weight="bold" />
                <span className="font-bold text-[#3978F6] dark:text-[#74a5ff]">
                  Partie TD (Exercices & QCM)
                </span>
              </nav>
            </div>

            {/* Switch to Cours Button */}
            <button
              type="button"
              onClick={() => handleOpenCoursePart(currentCourse.id, 'cours')}
              className="flex items-center gap-2 rounded-xl border border-[#3978F6]/40 bg-[#3978F6]/10 px-4 py-2 text-xs font-bold text-[#2866dc] transition hover:bg-[#3978F6] hover:text-white dark:text-[#8db5ff]"
            >
              <BookOpen size={14} weight="bold" />
              <span>Consulter la Partie Cours</span>
            </button>
          </div>

          {/* TD Header Title */}
          <div className="mb-6">
            <span className="rounded-md border border-[#3978F6]/30 bg-[#3978F6]/10 px-2.5 py-0.5 text-xs font-bold text-[#2866dc] dark:text-[#8db5ff]">
              Travaux Dirigés Officiels • {currentCourse.stream}
            </span>
            <h1 className="mt-1 text-xl sm:text-3xl font-bold text-[#172033] dark:text-white">
              TD — {currentCourse.title.replace(/^Chapitre \d+ — /, '')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#71809A] dark:text-[#91a9c8]">
              Planches d’exercices d’annales CNC avec indications méthodologiques, corrigés pas à pas et évaluation adaptative.
            </p>
          </div>

          {/* TD Grid: Exercises Column (left) + Adaptive QCM (right) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.65fr_1fr]">
            {/* Exercises List */}
            <div className="space-y-6">
              {currentCourse.exercises.map((exo) => {
                const hintCount = unlockedHints[exo.id] || 0
                const isSolOpen = revealedSolutions[exo.id] || false
                const currentEval = exerciseEvaluations[exo.id]

                return (
                  <article
                    key={exo.id}
                    id={exo.id}
                    className="glowing-card relative overflow-hidden rounded-2xl p-5 shadow-lg transition"
                  >
                    {/* Header: Ref, Source, Difficulty, Erratum */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-white/10">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#3978F6]/15 px-2 py-0.5 font-mono text-xs font-bold text-[#2866dc] dark:bg-[#3978F6]/30 dark:text-[#9cc0ff]">
                          {exo.refCode}
                        </span>
                        <span className="text-xs font-bold text-[#172033] dark:text-[#eaf2ff]">
                          {exo.source}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5" title={`Difficulté : ${exo.difficultyStars}/4`}>
                          {Array.from({ length: 4 }).map((_, sIdx) => (
                            <Star
                              key={sIdx}
                              size={14}
                              weight={sIdx < exo.difficultyStars ? 'fill' : 'regular'}
                              className={sIdx < exo.difficultyStars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setReportedErratum(exo.id)
                            setTimeout(() => setReportedErratum(null), 3000)
                          }}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-[#71809A] transition hover:border-rose-400 hover:text-rose-600 dark:border-white/10 dark:text-[#91a9c8] dark:hover:text-rose-400"
                        >
                          <Flag size={12} weight="bold" />
                          <span>{reportedErratum === exo.id ? 'Erratum transmis !' : 'Signaler'}</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-[#172033] dark:text-white">
                      {exo.title}
                    </h3>

                    {/* Statement with KaTeX */}
                    <div className="mt-2.5 rounded-xl border border-slate-200/80 bg-white/70 p-4 text-xs sm:text-[13px] leading-relaxed dark:border-white/10 dark:bg-white/5">
                      <p className="font-medium">{exo.statement}</p>
                      {exo.statementMath && exo.statementMath.length > 0 && (
                        <div className="my-2 space-y-1.5 text-center">
                          {exo.statementMath.map((m, mIdx) => (
                            <MathFormula key={mIdx} math={m} block />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Progressive hints & Solutions */}
                    <div className="mt-4 space-y-3">
                      {/* Indications */}
                      <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3.5 transition dark:border-amber-400/20 dark:bg-amber-500/5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Lightbulb size={18} weight="fill" className="text-amber-500" />
                            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                              Indications méthodologiques ({hintCount}/{exo.hints.length})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleHint(exo.id, exo.hints.length)}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600 active:scale-95"
                          >
                            <Lightbulb size={13} weight="bold" />
                            <span>
                              {hintCount === 0
                                ? 'Débloquer une indication'
                                : hintCount < exo.hints.length
                                ? 'Débloquer indice suivant'
                                : 'Tous les indices débloqués'}
                            </span>
                          </button>
                        </div>

                        {hintCount > 0 && (
                          <div className="mt-3 space-y-2 border-t border-amber-300/40 pt-2.5 dark:border-amber-500/20">
                            {exo.hints.slice(0, hintCount).map((hint, hIdx) => (
                              <div key={hIdx} className="flex items-start gap-2 text-xs text-amber-950 dark:text-amber-200">
                                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                                  {hIdx + 1}
                                </span>
                                <p className="leading-snug">{hint}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Corrigé détaillé */}
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 transition dark:border-emerald-500/20 dark:bg-emerald-500/5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} weight="fill" className="text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                              Corrigé détaillé pas à pas
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleSolution(exo.id)}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                          >
                            <Eye size={13} weight="bold" />
                            <span>{isSolOpen ? 'Masquer la solution' : 'Voir le corrigé détaillé'}</span>
                          </button>
                        </div>

                        {isSolOpen && (
                          <div className="mt-3 space-y-3 border-t border-emerald-500/30 pt-3 text-xs leading-relaxed dark:border-emerald-500/20">
                            {exo.solutionSteps.map((step, sIdx) => (
                              <div key={sIdx} className="rounded-lg bg-white/70 p-3 dark:bg-white/5">
                                <p className="font-bold text-emerald-800 dark:text-emerald-300">
                                  {step.stepTitle}
                                </p>
                                <p className="mt-1 text-slate-800 dark:text-slate-200">{step.content}</p>
                                {step.math && <MathFormula math={step.math} block />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Auto-évaluation */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3 dark:border-white/10">
                      <span className="text-xs font-semibold text-[#71809A] dark:text-[#91a9c8]">
                        Auto-évaluation de l’exercice :
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEvaluation(exo.id, 'mastered')}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            currentEval === 'mastered'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'border border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                          }`}
                        >
                          <Check size={14} weight="bold" />
                          <span>Maîtrisé</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEvaluation(exo.id, 'with_help')}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            currentEval === 'with_help'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'border border-amber-500/40 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30'
                          }`}
                        >
                          <Sparkle size={14} weight="bold" />
                          <span>Avec aide</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEvaluation(exo.id, 'review')}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            currentEval === 'review'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'border border-rose-500/40 text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30'
                          }`}
                        >
                          <ArrowsCounterClockwise size={14} weight="bold" />
                          <span>À revoir</span>
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* QCM Flash Adaptatif (Projet 15) */}
            <aside id="qcm-section" className="space-y-5">
              <div className="glowing-card sticky top-24 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#3978F6] to-[#8db5ff] text-white shadow-xs">
                      <Brain size={16} weight="fill" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#172033] dark:text-white">
                        QCM Flash Adaptatif
                      </h3>
                      <p className="text-xs text-[#71809A] dark:text-[#91a9c8]">
                        Projet 15 • Contrôle de connaissances
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                    Niveau 3/4 (Avancé)
                  </span>
                </div>

                {/* Score & Chrono */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#3978F6]/25 bg-[#3978F6]/10 p-3 dark:bg-[#3978F6]/15">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2866dc] dark:text-[#8db5ff]">
                      <span>Maîtrise</span>
                      <MathFormula math="M(u,c)" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-[#101b33] dark:text-white">
                        {masteryScore}%
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 dark:bg-amber-500/15">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
                      <span>Chronomètre</span>
                      <Clock size={13} weight="bold" />
                    </div>
                    <div className="mt-1">
                      <span className="font-mono text-xl font-bold text-amber-900 dark:text-amber-200">
                        01:45
                      </span>
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="mt-5 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-xs dark:border-white/10 dark:bg-white/5">
                  <p className="font-semibold text-[#172033] dark:text-white leading-relaxed">
                    {activeQcm.questionText}
                  </p>
                  {activeQcm.questionMath && (
                    <div className="my-2">
                      <MathFormula math={activeQcm.questionMath} block />
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="mt-4 space-y-2.5">
                  {activeQcm.options.map((opt) => {
                    const isSelected = selectedOption === opt.id
                    const isCorrect = opt.id === activeQcm.correctOptionId
                    let btnStyle = 'border-slate-200 hover:border-[#3978F6] dark:border-white/10 dark:hover:border-[#3978F6]'

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 shadow-sm'
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-300'
                      } else {
                        btnStyle = 'opacity-50 border-slate-200 dark:border-white/10'
                      }
                    } else if (isSelected) {
                      btnStyle = 'border-[#3978F6] bg-[#3978F6]/10'
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        disabled={isAnswerSubmitted}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${btnStyle}`}
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white">
                          {opt.label}
                        </span>
                        <div className="flex-1 overflow-x-auto text-xs">
                          <MathFormula math={opt.math} />
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Explication */}
                {isAnswerSubmitted && (
                  <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-950 dark:text-emerald-200">
                    <p className="font-bold">{activeQcm.explanation}</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* ====================================================================== */}
      {/* PAGE : BANQUE QCM CPGE PAR MATIÈRE (LANCEMENT IMMÉDIAT)                */}
      {/* ====================================================================== */}
      {currentPage === 'qcm' && (
        <main className="relative mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 animate-in fade-in duration-300">
          {!activeQcmSubject ? (
            /* STEP 1: CHOIX DE LA MATIÈRE */
            <div>
              {/* Header */}
              <div className="mb-8 border-b border-slate-200/80 pb-6 dark:border-white/10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-[#2866dc] dark:text-[#8db5ff]">
                  <Sparkle size={15} weight="bold" />
                  <span>BANQUE OFFICIELLE DE QCM CPGE</span>
                </span>
                <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[#172033] dark:text-white">
                  Banque QCM Adaptatif par Matière
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Sélectionnez votre discipline pour démarrer immédiatement votre entraînement interactif avec chronomètre, barème et correction détaillée pas-à-pas.
                </p>
              </div>

              {/* Grid of 4 Subjects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Mathématiques */}
                <div
                  onClick={() => handleStartQcmSubject('maths')}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-blue-500/30 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-500/80 hover:shadow-blue-500/20 dark:border-blue-500/20 dark:bg-[#0c1628]/90 cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex size-13 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      <Calculator size={28} weight="bold" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Algèbre & Analyse
                      </span>
                      <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        Mathématiques
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        Réduction d’endomorphismes, espaces préhilbertiens, séries entières, probabilités et topologie.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {COURSES_DATABASE.filter((c) => c.subjectId === 'maths').flatMap((c) => c.qcmQuestions).length} questions
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition">
                      <span>Démarrer</span>
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </div>
                </div>

                {/* 2. Physique & Chimie */}
                <div
                  onClick={() => handleStartQcmSubject('physique')}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/30 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-emerald-500/80 hover:shadow-emerald-500/20 dark:border-emerald-500/20 dark:bg-[#0c1628]/90 cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex size-13 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Lightning size={28} weight="bold" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Ondes & Thermodynamique
                      </span>
                      <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        Physique & Chimie
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        Électromagnétisme, régimes transitoires, optique ondulatoire et cinétique chimique.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {COURSES_DATABASE.filter((c) => c.subjectId === 'physique').flatMap((c) => c.qcmQuestions).length} questions
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition">
                      <span>Démarrer</span>
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </div>
                </div>

                {/* 3. Sciences Industrielles */}
                <div
                  onClick={() => handleStartQcmSubject('si')}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-500/30 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-500/80 hover:shadow-amber-500/20 dark:border-amber-500/20 dark:bg-[#0c1628]/90 cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex size-13 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <Gear size={28} weight="bold" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Automatique & SLCI
                      </span>
                      <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                        Sciences Industrielles
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        Stabilité des systèmes continus, diagrammes de Bode/Black, cinématique 3D et liaisons.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {COURSES_DATABASE.filter((c) => c.subjectId === 'si').flatMap((c) => c.qcmQuestions).length} questions
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition">
                      <span>Démarrer</span>
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </div>
                </div>

                {/* 4. Informatique */}
                <div
                  onClick={() => handleStartQcmSubject('info')}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-purple-500/30 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-purple-500/80 hover:shadow-purple-500/20 dark:border-purple-500/20 dark:bg-[#0c1628]/90 cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex size-13 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                      <TerminalWindow size={28} weight="bold" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Graphes & Complexité
                      </span>
                      <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                        Informatique
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        Algorithmes gloutons, programmation dynamique, graphes, bases SQL et récursivité.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {COURSES_DATABASE.filter((c) => c.subjectId === 'info').flatMap((c) => c.qcmQuestions).length} questions
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition">
                      <span>Démarrer</span>
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: SESSION DE QCM EN COURS POUR LA MATIÈRE SÉLECTIONNÉE */
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Top Navigation & Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveQcmSubject(null)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Changer de matière</span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span className="size-2 rounded-full bg-blue-500 animate-ping" />
                    <span>
                      {activeQcmSubject === 'maths'
                        ? 'Mathématiques'
                        : activeQcmSubject === 'physique'
                        ? 'Physique & Chimie'
                        : activeQcmSubject === 'si'
                        ? 'Sciences Industrielles'
                        : 'Informatique'}
                    </span>
                  </span>

                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-white/10 dark:bg-white/5">
                    <Clock size={13} weight="bold" className="text-amber-500" />
                    <span>
                      {Math.floor(subjectQcmTimer / 60)}:
                      {(subjectQcmTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                  style={{
                    width: `${Math.round(((subjectQcmIdx + 1) / subjectQcmQuestions.length) * 100)}%`,
                  }}
                />
              </div>

              {subjectQcmCompleted ? (
                /* ÉCRAN DE FIN DE SESSION */
                <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 sm:p-10 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/90 space-y-6">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                    <Trophy size={36} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Session QCM Terminée !
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Vous avez répondu à l'ensemble des questions de cette série.
                    </p>
                  </div>

                  <div className="mx-auto max-w-xs rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Score Final</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {subjectQcmScore} / {subjectQcmQuestions.length}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {Math.round((subjectQcmScore / Math.max(1, subjectQcmQuestions.length)) * 100)}% de réussite
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleResetSubjectQcm}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition cursor-pointer"
                    >
                      <ArrowsCounterClockwise size={15} weight="bold" />
                      <span>Recommencer cette série</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQcmSubject(null)}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 transition cursor-pointer"
                    >
                      <span>Choisir une autre matière</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* QUESTION ACTIVE */
                <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/90 space-y-6">
                  {/* Question Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold">
                      Question {subjectQcmIdx + 1} sur {subjectQcmQuestions.length}
                    </span>
                    <span className="rounded-md bg-blue-500/10 px-2 py-0.5 font-bold text-blue-600 dark:text-blue-400">
                      Niveau Concours CPGE
                    </span>
                  </div>

                  {/* Question Text */}
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentSubjectActiveQcm?.questionText}
                    {currentSubjectActiveQcm?.questionMath && (
                      <div className="mt-3 p-2 bg-slate-50 dark:bg-black/30 rounded-xl">
                        <MathFormula math={currentSubjectActiveQcm.questionMath} block />
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentSubjectActiveQcm?.options.map((opt) => {
                      const isSelected = subjectQcmSelectedOpt === opt.id
                      const isCorrect = opt.id === currentSubjectActiveQcm.correctOptionId
                      let optClasses =
                        'border-slate-200/90 bg-slate-50/70 hover:border-blue-500/50 hover:bg-blue-50/30 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'

                      if (subjectQcmIsSubmitted) {
                        if (isCorrect) {
                          optClasses =
                            'border-emerald-500 bg-emerald-50/90 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200 ring-1 ring-emerald-500'
                        } else if (isSelected && !isCorrect) {
                          optClasses =
                            'border-rose-500 bg-rose-50/90 text-rose-950 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200 ring-1 ring-rose-500'
                        } else {
                          optClasses = 'border-slate-200/60 opacity-50 dark:border-white/5'
                        }
                      } else if (isSelected) {
                        optClasses =
                          'border-blue-500 bg-blue-50/80 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200 ring-1 ring-blue-500'
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={subjectQcmIsSubmitted}
                          onClick={() => handleSelectSubjectQcmOption(opt.id)}
                          className={`w-full text-left rounded-2xl border p-4 text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-between gap-3 ${optClasses}`}
                        >
                          <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white font-bold text-xs text-slate-700 shadow-2xs dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                              {opt.label || opt.id.toUpperCase()}
                            </span>
                            <div className="flex-1 overflow-x-auto">
                              <MathFormula math={opt.math} />
                            </div>
                          </div>
                          {subjectQcmIsSubmitted && isCorrect && (
                            <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          {subjectQcmIsSubmitted && isSelected && !isCorrect && (
                            <WarningCircle size={18} weight="fill" className="text-rose-600 dark:text-rose-400 shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Explanation & Next Button */}
                  {subjectQcmIsSubmitted && (
                    <div className="space-y-4 pt-2">
                      <div className="rounded-2xl border border-blue-500/30 bg-blue-50/70 p-4 text-xs text-slate-800 dark:border-blue-500/20 dark:bg-blue-950/30 dark:text-slate-200">
                        <p className="font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                          <CheckCircle size={15} weight="fill" />
                          <span>Explication Détaillée :</span>
                        </p>
                        <p className="leading-relaxed">{currentSubjectActiveQcm.explanation}</p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleNextSubjectQcm}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                        >
                          <span>
                            {subjectQcmIdx + 1 < subjectQcmQuestions.length
                              ? 'Question Suivante'
                              : 'Voir mes Résultats Finaux'}
                          </span>
                          <ArrowRight size={14} weight="bold" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ====================================================================== */}
      {/* PAGE 5 : ÉPREUVE CONCOURS BLANC TYPE CPGE (DOUBLE MODE PDF)            */}
      {/* ====================================================================== */}
      {currentPage === 'exam' && (
        <main className="relative mx-auto max-w-[1700px] px-2 py-4 sm:px-4 lg:px-6 animate-in fade-in duration-300">
          <ConcoursPdfExamViewer
            exam={selectedConcoursExamItem ?? currentExam}
            initialMode={examInitialMode}
            onBack={() => {
              setCurrentPage('concours_detail')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </main>
      )}

      {/* Footer */}
      {!hideNavbar && (
        <Footer
          onNavigateToContactAdmin={onNavigateToContact}
          onNavigateToExoPdf={() => {}}
        />
      )}
    </div>
  )
}
