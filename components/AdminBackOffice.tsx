'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ShieldCheck,
  Books,
  Scroll,
  Sparkle,
  Lifebuoy,
  Gauge,
  Plus,
  Trash,
  PencilSimple,
  CheckCircle,
  Clock,
  FilePdf,
  UploadSimple,
  Eye,
  Star,
  Fire,
  WarningCircle,
  ChatCircleDots,
  PaperPlaneTilt,
  Check,
  X,
  List,
  MagnifyingGlass,
  Funnel,
  ArrowRight,
  ArrowsClockwise,
  GraduationCap,
  CaretRight,
  CaretDown,
  Lightning,
  DownloadSimple,
  Paperclip,
  FileCode,
  FileText,
  Image as ImageIcon,
  User,
  Buildings,
  PaperPlaneRight,
} from '@phosphor-icons/react'
import { Bold, Italic, Code as CodeIcon, Copy, FolderOpen as LucideFolderOpen, Quote } from 'lucide-react'
import { MathFormula } from './MathFormula'
import { NexoraLogo } from './NexoraLogo'
import { ThemeToggle } from './ThemeToggle'
import { Footer } from './Footer'
import { ConfirmRemoval, useUiFeedback } from './UiFeedback'
import { CNC_MP_ANNALES } from '@/lib/cnc-annales-pdf'

// --------------------------------------------------------------------------
// TYPES & DATA STRUCTURES
// --------------------------------------------------------------------------

export interface SubjectConfig {
  id: string
  name: string
  code: string
  color: string
  coeffs: { MP: number; PSI: number; TSI: number }
  chaptersCount: number
}

export interface CourseChapter {
  id: string
  subjectId: string
  title: string
  order: number
  lessons: CourseLesson[]
}

export interface CourseLesson {
  id: string
  chapterId: string
  title: string
  contentLatex: string
  summarySheetUrl?: string
  summarySheetName?: string
  exercisesCount: number
}

export interface AdminExercise {
  id: string
  lessonId: string
  refCode: string
  title: string
  annaleSource: string
  difficulty: number // 1 to 4
  statementLatex: string
  hints: string[]
  solutionSteps: { stepTitle: string; content: string; math?: string }[]
}

export interface AdminCatalogCourse {
  id: string
  year: 'sup' | 'spe'
  subjectId: 'maths' | 'physique' | 'si' | 'info'
  title: string
  coursePdf: string | null
  tdPdf: string | null
  addedAt: string
}

export interface PublishedAnnale {
  id: string
  concoursId?: 'cnc' | 'mines' | 'centrale' | 'ccinp' | 'x-ens'
  year: number
  stream: 'MP' | 'PSI' | 'TSI'
  subject: string
  duration: string // '3h' or '4h'
  statementPdf: string
  officialSolutionPdf?: string
  juryReportPdf?: string
  downloadsCount: number
  status: 'PUBLISHED' | 'DRAFT'
  publishedAt: string
}

export interface AdminQcmQuestion {
  id: string
  lessonId: string
  lessonTitle: string
  statementLatex: string
  difficulty: number // 1 to 4
  targetTimeSeconds: number
  choices: {
    id: string
    label: string
    latex: string
    isCorrect: boolean
    distractorComment: string
  }[]
  explanationLatex: string
  successRate: number // ex: 68%
}

export interface AttachedDoc {
  id: string
  name: string
  size: string
  type: 'pdf' | 'code' | 'image' | 'archive'
  contentSnippet?: string
}

export interface StudentMessageItem {
  id: string
  sender: 'student' | 'admin' | 'internal_note'
  senderName: string
  senderRole?: string
  content: string
  math?: string
  code?: string
  timestamp: string
  attachments?: AttachedDoc[]
}

export interface StudentConversation {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  studentStream: 'MP' | 'PSI' | 'TSI'
  studentYear: string
  studentCenter: string
  ticketId: string
  subject: string
  unread: boolean
  status: 'pending' | 'in_progress' | 'resolved'
  priority: 'normal' | 'high'
  lastMessageDate: string
  lastMessageSnippet: string
  messages: StudentMessageItem[]
}

// --------------------------------------------------------------------------
// INITIAL SEED DATA
// --------------------------------------------------------------------------

const INITIAL_SUBJECTS: SubjectConfig[] = [
  { id: 'maths', name: 'Mathématiques', code: 'MATH', color: 'from-blue-600 to-indigo-600', coeffs: { MP: 12, PSI: 10, TSI: 10 }, chaptersCount: 14 },
  { id: 'physique', name: 'Physique & Chimie', code: 'PHYS', color: 'from-cyan-600 to-blue-600', coeffs: { MP: 10, PSI: 11, TSI: 9 }, chaptersCount: 16 },
  { id: 'si', name: 'Sciences Industrielles (SI)', code: 'SI', color: 'from-emerald-600 to-teal-600', coeffs: { MP: 5, PSI: 9, TSI: 11 }, chaptersCount: 10 },
  { id: 'info', name: 'Informatique & Algorithmique', code: 'INFO', color: 'from-amber-600 to-orange-600', coeffs: { MP: 5, PSI: 4, TSI: 4 }, chaptersCount: 8 },
]

const INITIAL_CHAPTERS: CourseChapter[] = [
  {
    id: 'chap-1',
    subjectId: 'maths',
    title: 'Chapitre 1 — Réduction des endomorphismes & Espaces préhilbertiens',
    order: 1,
    lessons: [
      {
        id: 'les-1',
        chapterId: 'chap-1',
        title: 'Valeurs propres, polynôme caractéristique et minimal',
        contentLatex: '\\text{Soit } u \\in \\mathcal{L}(E). \\text{ Le polynome caracteristique est defini par } \\chi_u(X) = \\det(X \\text{id}_E - u). \\newline \\text{Theoreme de Cayley-Hamilton : } \\chi_u(u) = 0_{\\mathcal{L}(E)}.',
        summarySheetName: 'Fiche_Synthese_Reduction_CNC_2026.pdf',
        summarySheetUrl: '/docs/fiche-reduction.pdf',
        exercisesCount: 6,
      },
      {
        id: 'les-2',
        chapterId: 'chap-1',
        title: 'Diagonalisation et trigonalisation',
        contentLatex: 'u \\in \\mathcal{D}(E) \\iff \\pi_u(X) = \\prod_{i=1}^p (X - \\lambda_i) \\text{ scinde a racines simples sur } \\mathbb{K}.',
        summarySheetName: 'Fiche_Synthese_Diagonalisation.pdf',
        summarySheetUrl: '/docs/fiche-diag.pdf',
        exercisesCount: 5,
      },
    ],
  },
  {
    id: 'chap-2',
    subjectId: 'maths',
    title: 'Chapitre 2 — Séries entières & Séries de Fourier',
    order: 2,
    lessons: [
      {
        id: 'les-3',
        chapterId: 'chap-2',
        title: 'Rayon de convergence et règle de d’Alembert',
        contentLatex: 'R = \\sup \\{ r \\ge 0 \\; : \\; (|a_n| r^n)_{n \\in \\mathbb{N}} \\text{ est bornee} \\}.',
        summarySheetName: 'Fiche_Synthese_Series_Entieres.pdf',
        exercisesCount: 4,
      },
    ],
  },
]

const INITIAL_EXERCISES: AdminExercise[] = [
  {
    id: 'exo-1',
    lessonId: 'les-1',
    refCode: 'EXO-MP-MATH-204',
    title: 'Décomposition spectrale et diagonalisabilité d’un projecteur généralisé',
    annaleSource: 'Extrait CNC MP 2022 — Mathématiques I',
    difficulty: 3,
    statementLatex: 'Soit E un \\mathbb{C}-espace vectoriel de dimension finie n \\ge 1. On suppose que P(X) = (X-1)(X-2)(X-3) annule u.',
    hints: [
      'Examinez les racines du polynôme annulateur P(X) dans C (sont-elles simples ?).',
      'Appliquez le lemme des noyaux pour scinder l’espace E en somme directe de sous-espaces caractéristiques.',
    ],
    solutionSteps: [
      {
        stepTitle: 'Étape 1 : Lemme des noyaux',
        content: 'Les polynômes (X-1), (X-2) et (X-3) sont deux à deux premiers entre eux.',
        math: 'E = \\ker(u - \\text{id}) \\oplus \\ker(u - 2\\text{id}) \\oplus \\ker(u - 3\\text{id})',
      },
      {
        stepTitle: 'Étape 2 : Conclusion sur la diagonalisabilité',
        content: 'u admet un polynôme annulateur scindé à racines simples sur C, donc u est diagonalisable.',
      },
    ],
  },
]

const INITIAL_CATALOG_COURSES: AdminCatalogCourse[] = [
  // SPÉ - Maths
  {
    id: 'course-spe-maths-1',
    year: 'spe',
    subjectId: 'maths',
    title: 'Réduction des Endomorphismes & Espaces Préhilbertiens',
    coursePdf: 'Cours_Reduction_Endomorphismes_SPE.pdf',
    tdPdf: 'TD_Planche1_Diagonalisation_Trigonalisation.pdf',
    addedAt: '15 Jan 2026',
  },
  {
    id: 'course-spe-maths-2',
    year: 'spe',
    subjectId: 'maths',
    title: 'Topologie des Espaces Vectoriels Normés',
    coursePdf: 'Cours_Topologie_EVN_SPE.pdf',
    tdPdf: 'TD_Planche2_Suites_Compacite.pdf',
    addedAt: '22 Jan 2026',
  },
  {
    id: 'course-spe-maths-3',
    year: 'spe',
    subjectId: 'maths',
    title: 'Séries Entières & Intégrales à Paramètre',
    coursePdf: 'Cours_Series_Entieres_SPE.pdf',
    tdPdf: 'TD_Planche3_Rayon_Convergence.pdf',
    addedAt: '03 Fév 2026',
  },
  // SPÉ - Physique
  {
    id: 'course-spe-phys-1',
    year: 'spe',
    subjectId: 'physique',
    title: 'Électromagnétisme — Équations de Maxwell & Propagation',
    coursePdf: 'Cours_Electromagnetisme_Maxwell.pdf',
    tdPdf: 'TD_Ondes_EM_Vide_Conducteurs.pdf',
    addedAt: '10 Jan 2026',
  },
  {
    id: 'course-spe-phys-2',
    year: 'spe',
    subjectId: 'physique',
    title: 'Thermodynamique Statistique & Transferts Thermiques',
    coursePdf: 'Cours_Diffusion_Thermique.pdf',
    tdPdf: 'TD_Conduction_Rayonnement.pdf',
    addedAt: '18 Jan 2026',
  },
  // SPÉ - SI
  {
    id: 'course-spe-si-1',
    year: 'spe',
    subjectId: 'si',
    title: 'Automatique Continue — Stabilité & Précision des SLCI',
    coursePdf: 'Cours_SLCI_Performances.pdf',
    tdPdf: 'TD_Correcteurs_Bode_Black.pdf',
    addedAt: '12 Jan 2026',
  },
  // SPÉ - Info
  {
    id: 'course-spe-info-1',
    year: 'spe',
    subjectId: 'info',
    title: 'Algorithmique Avancée — Graphes & Programmation Dynamique',
    coursePdf: 'Cours_Graphes_Dijkstra_AStar.pdf',
    tdPdf: 'TD_Graphes_Python_Complexite.pdf',
    addedAt: '14 Jan 2026',
  },
  // SUP - Maths
  {
    id: 'course-sup-maths-1',
    year: 'sup',
    subjectId: 'maths',
    title: 'Polynômes, Fractions Rationnelles & Nombres Complexes',
    coursePdf: 'Cours_Polynomes_Fractions_SUP.pdf',
    tdPdf: 'TD_Division_Euclidienne_Racines.pdf',
    addedAt: '05 Sep 2025',
  },
  {
    id: 'course-sup-maths-2',
    year: 'sup',
    subjectId: 'maths',
    title: 'Calcul Différentiel & Développements Limités',
    coursePdf: 'Cours_DL_Taylor_Young_SUP.pdf',
    tdPdf: 'TD_Equivalents_Asymptotiques.pdf',
    addedAt: '20 Sep 2025',
  },
  // SUP - Physique
  {
    id: 'course-sup-phys-1',
    year: 'sup',
    subjectId: 'physique',
    title: 'Oscillateur Harmonique & Régimes Transitoires RLC',
    coursePdf: 'Cours_Oscillateurs_RLC_SUP.pdf',
    tdPdf: 'TD_Circuit_Second_Ordre.pdf',
    addedAt: '15 Sep 2025',
  },
  // SUP - SI
  {
    id: 'course-sup-si-1',
    year: 'sup',
    subjectId: 'si',
    title: 'Cinématique du Point et du Solide — Liaisons Mécaniques',
    coursePdf: 'Cours_Liaisons_Mecaniques_SUP.pdf',
    tdPdf: 'TD_Torseurs_Cinematiques.pdf',
    addedAt: '18 Sep 2025',
  },
  // SUP - Info
  {
    id: 'course-sup-info-1',
    year: 'sup',
    subjectId: 'info',
    title: 'Bases de l’Algorithmique & Tris en Python',
    coursePdf: 'Cours_Algorithmique_Tris_SUP.pdf',
    tdPdf: 'TD_Tris_Fusion_Rapide.pdf',
    addedAt: '22 Sep 2025',
  },
]

// Annales réelles CNC MP (toutes matières, 2000 → 2025) avec PDF stockés dans /public/annales
const CNC_REAL_ANNALES: PublishedAnnale[] = CNC_MP_ANNALES.map((ep) => ({
  id: `ann-${ep.id}`,
  concoursId: 'cnc',
  year: ep.year,
  stream: 'MP',
  subject: ep.title.replace(/^CNC MP \d{4} — /, ''),
  duration: `${ep.durationHours}h`,
  statementPdf: ep.pdfUrl!,
  officialSolutionPdf: ep.corrigeUrl,
  downloadsCount: 0,
  status: 'PUBLISHED',
  publishedAt: `Session ${ep.year}`,
}))

const INITIAL_ANNALES: PublishedAnnale[] = [
  ...CNC_REAL_ANNALES,
  {
    id: 'ann-2023-psi-m1',
    concoursId: 'cnc',
    year: 2023,
    stream: 'PSI',
    subject: 'Physique I (Mécanique & Thermodynamique)',
    duration: '4h',
    statementPdf: 'CNC_2023_PSI_Physique_1_Enonce.pdf',
    officialSolutionPdf: 'CNC_2023_PSI_Physique_1_Corrige.pdf',
    downloadsCount: 980,
    status: 'PUBLISHED',
    publishedAt: '05 Oct 2023',
  },
  {
    id: 'ann-mines-2024-mp-m1',
    concoursId: 'mines',
    year: 2024,
    stream: 'MP',
    subject: 'Mathématiques I (Mines-Ponts)',
    duration: '4h',
    statementPdf: 'MINES_2024_MP_Maths_1_Enonce.pdf',
    officialSolutionPdf: 'MINES_2024_MP_Maths_1_Corrige.pdf',
    downloadsCount: 1840,
    status: 'PUBLISHED',
    publishedAt: '15 Oct 2024',
  },
  {
    id: 'ann-centrale-2024-mp-m1',
    concoursId: 'centrale',
    year: 2024,
    stream: 'MP',
    subject: 'Mathématiques 1 (Centrale-Supélec)',
    duration: '4h',
    statementPdf: 'CENTRALE_2024_MP_Maths_1_Enonce.pdf',
    officialSolutionPdf: 'CENTRALE_2024_MP_Maths_1_Corrige.pdf',
    downloadsCount: 1620,
    status: 'PUBLISHED',
    publishedAt: '18 Oct 2024',
  },
  {
    id: 'ann-ccinp-2024-mp-m1',
    concoursId: 'ccinp',
    year: 2024,
    stream: 'MP',
    subject: 'Mathématiques 1 (CCINP)',
    duration: '4h',
    statementPdf: 'CCINP_2024_MP_Maths_1_Enonce.pdf',
    officialSolutionPdf: 'CCINP_2024_MP_Maths_1_Corrige.pdf',
    downloadsCount: 1290,
    status: 'PUBLISHED',
    publishedAt: '22 Oct 2024',
  },
  {
    id: 'ann-xens-2024-mp-m1',
    concoursId: 'x-ens',
    year: 2024,
    stream: 'MP',
    subject: 'Mathématiques A (X / ENS)',
    duration: '4h',
    statementPdf: 'XENS_2024_MP_Maths_A_Enonce.pdf',
    downloadsCount: 2310,
    status: 'PUBLISHED',
    publishedAt: '28 Oct 2024',
  },
]

const INITIAL_QCMS: AdminQcmQuestion[] = [
  {
    id: 'qcm-adm-1',
    lessonId: 'les-2',
    lessonTitle: 'Diagonalisation et trigonalisation',
    statementLatex: 'Soit u \\in \\mathcal{L}(E) avec \\dim(E) = n. Quelle condition est NÉCESSAIRE ET SUFFISANTE pour que u soit diagonalisable sur \\mathbb{K} ?',
    difficulty: 3,
    targetTimeSeconds: 90,
    choices: [
      {
        id: 'opt-A',
        label: 'A',
        latex: '\\chi_u(X) \\text{ est scindé sur } \\mathbb{K}',
        isCorrect: false,
        distractorComment: 'Faux : condition nécessaire mais non suffisante (contre-exemple : nilpotente non nulle).',
      },
      {
        id: 'opt-B',
        label: 'B',
        latex: '\\pi_u(X) \\text{ est scindé à racines simples sur } \\mathbb{K}',
        isCorrect: true,
        distractorComment: 'Vrai : théorème fondamental de diagonalisabilité via le polynôme minimal.',
      },
      {
        id: 'opt-C',
        label: 'C',
        latex: '\\text{Tr}(u) = n \\; \\text{ et } \\; \\det(u) \\neq 0',
        isCorrect: false,
        distractorComment: 'Faux : ces invariants scalaires ne renseignent pas sur la dimension des sous-espaces propres.',
      },
      {
        id: 'opt-D',
        label: 'D',
        latex: 'u \\text{ admet exactement } n \\text{ valeurs propres distinctes}',
        isCorrect: false,
        distractorComment: 'Faux : c’est une condition suffisante, mais pas nécessaire (penser à l’identité id_E).',
      },
    ],
    explanationLatex: 'u \\in \\mathcal{D}(E) \\iff \\pi_u(X) = \\prod_{i=1}^p (X - \\lambda_i) \\text{ avec } \\lambda_i \\neq \\lambda_j.',
    successRate: 72,
  },
]

const INITIAL_STUDENT_CONVERSATIONS: StudentConversation[] = [
  {
    id: 'conv-1',
    studentId: 'usr_cpge_2026_01',
    studentName: 'Achraf Lemrani',
    studentEmail: 'achraf.lemrani@cpge-cnc.ma',
    studentStream: 'MP',
    studentYear: '2e année Spé',
    studentCenter: 'Lycée Omar Ibn Al-Khattab (Rabat)',
    ticketId: 'NX-2026-084',
    subject: 'Question de méthode — Normalisation des données',
    unread: false,
    status: 'in_progress',
    priority: 'normal',
    lastMessageDate: 'Aujourd’hui à 18:42',
    lastMessageSnippet: 'Bonjour Achraf. Excellente initiative d’avoir attaché votre script R...',
    messages: [
      {
        id: 'msg-achraf-1',
        sender: 'student',
        senderName: 'Achraf Lemrani',
        senderRole: 'Étudiant CPGE — Filière MP',
        content:
          "Bonjour Monsieur Mansouri, j'ai une question sur l'exercice 19.4 concernant la validation croisée 5-Fold. Pourriez-vous me confirmer si la démarche de normalisation standard appliquée dans mon script joint n'introduit aucun data leakage ?",
        timestamp: '18:35',
        attachments: [
          {
            id: 'att-achraf-1',
            name: 'pipeline_telco_churn_v2.R',
            size: '14.2 Ko',
            type: 'code',
          },
          {
            id: 'att-achraf-2',
            name: 'Fiche_Methodologique_Normalisation.pdf',
            size: '1.2 Mo',
            type: 'pdf',
          },
        ],
      },
      {
        id: 'msg-achraf-2',
        sender: 'admin',
        senderName: 'Dr. Karim Mansouri',
        senderRole: 'Responsable Pédagogique & Agrégé CPGE',
        content:
          "Bonjour Achraf. Excellente initiative d'avoir joint votre script et votre fiche méthodologique.\n\nAprès examen de votre démarche, le raisonnement est mathématiquement rigoureux : calculer mu_j et sigma_j exclusivement sur tr (le pli d'entraînement) avant d'appliquer la transformation à va élimine tout risque de data leakage. C'est parfaitement conforme aux exigences du programme CNC.",
        math: '\\text{tr}\\$x_j \\leftarrow \\frac{\\text{tr}\\$x_j - \\mu_{\\text{tr}}}{\\sigma_{\\text{tr}}}, \\quad \\text{va}\\$x_j \\leftarrow \\frac{\\text{va}\\$x_j - \\mu_{\\text{tr}}}{\\sigma_{\\text{tr}}}',
        timestamp: '18:42',
      },
    ],
  },
  {
    id: 'conv-2',
    studentId: 'usr_cpge_2026_02',
    studentName: 'Salma Benjelloun',
    studentEmail: 'salma.b@cpge.ma',
    studentStream: 'PSI',
    studentYear: '2e année Spé',
    studentCenter: 'Lycée Moulay Youssef (Rabat)',
    ticketId: 'NX-2026-088',
    subject: 'Condition aux limites conducteur parfait (Physique I CNC 2023)',
    unread: true,
    status: 'pending',
    priority: 'high',
    lastMessageDate: 'Aujourd’hui à 17:15',
    lastMessageSnippet: 'Monsieur le professeur, lors de la résolution de l’annale CNC PSI 2023...',
    messages: [
      {
        id: 'msg-salma-1',
        sender: 'student',
        senderName: 'Salma Benjelloun',
        senderRole: 'Étudiante CPGE — Filière PSI',
        content:
          "Monsieur le professeur, lors de la résolution de l'annale CNC PSI 2023, j'ai un doute sur la condition aux limites pour le champ magnétique au niveau du conducteur parfait avec nappe de courant surfacique. Pourriez-vous examiner mon calcul joint ?",
        math: '\\vec{B}_2 - \\vec{B}_1 = \\mu_0 \\vec{j}_s \\wedge \\vec{n}_{1 \\to 2}',
        timestamp: '17:15',
        attachments: [
          {
            id: 'att-salma-1',
            name: 'Fiche_Discontinuite_Conducteur.pdf',
            size: '2.4 Mo',
            type: 'pdf',
          },
          {
            id: 'att-salma-2',
            name: 'Schema_Spire_Induction.png',
            size: '850 Ko',
            type: 'image',
          },
        ],
      },
    ],
  },
  {
    id: 'conv-3',
    studentId: 'usr_cpge_2026_03',
    studentName: 'Yassine Tazi',
    studentEmail: 'y.tazi@cpge.ma',
    studentStream: 'TSI',
    studentYear: '2e année Spé',
    studentCenter: 'Lycée Mohammed V (Casablanca)',
    ticketId: 'NX-2026-092',
    subject: 'Formule de Willis train épicycloïdal (SI Concours 2022)',
    unread: true,
    status: 'pending',
    priority: 'normal',
    lastMessageDate: 'Hier à 16:40',
    lastMessageSnippet: 'Bonjour Monsieur, pourriez-vous vérifier la formule de Willis que j’ai appliquée...',
    messages: [
      {
        id: 'msg-tazi-1',
        sender: 'student',
        senderName: 'Yassine Tazi',
        senderRole: 'Étudiant CPGE — Filière TSI',
        content:
          "Bonjour Monsieur, pourriez-vous vérifier la formule de Willis que j'ai appliquée pour le réducteur du robot industriel ? J'ai attaché ma feuille de calcul et le schéma cinématique annoté.",
        math: '\\frac{\\omega_{1/0} - \\omega_{ps/0}}{\\omega_{4/0} - \\omega_{ps/0}} = (-1)^p \\prod \\frac{Z_{\\text{menantes}}}{Z_{\\text{menees}}}',
        timestamp: 'Hier 16:40',
        attachments: [
          {
            id: 'att-tazi-1',
            name: 'Schema_Cinematique_Willis_Tazi.pdf',
            size: '1.1 Mo',
            type: 'pdf',
          },
        ],
      },
    ],
  },
  {
    id: 'conv-4',
    studentId: 'usr_cpge_2026_04',
    studentName: 'Othmane Idrissi',
    studentEmail: 'o.idrissi@cpge.ma',
    studentStream: 'MP',
    studentYear: '1re année Sup',
    studentCenter: 'Lycée Ibn Timiya (Marrakech)',
    ticketId: 'NX-2026-075',
    subject: 'Polynômes de Lagrange & Projecteurs spectraux',
    unread: false,
    status: 'resolved',
    priority: 'normal',
    lastMessageDate: '14 Octobre 2026',
    lastMessageSnippet: 'Bonjour Othmane. Si la question est de type Déduire, la décomposition suffit...',
    messages: [
      {
        id: 'msg-othmane-1',
        sender: 'student',
        senderName: 'Othmane Idrissi',
        senderRole: 'Étudiant CPGE — Filière MP',
        content:
          "Bonjour Dr. Mansouri, est-il nécessaire au CNC de redémontrer que les projecteurs spectraux commutent deux à deux, ou peut-on l'admettre si le polynôme est scindé à racines simples ?",
        timestamp: '14 Octobre 10:20',
      },
      {
        id: 'msg-othmane-2',
        sender: 'admin',
        senderName: 'Dr. Karim Mansouri',
        senderRole: 'Responsable Pédagogique & Agrégé CPGE',
        content:
          "Bonjour Othmane. Si la question est de type 'Déduire', la décomposition suffit. En revanche, pour 'Montrer que', il est recommandé d'écrire l'expression polynomiale de p_i via les polynômes interpolateurs de Lagrange L_i(u).",
        math: 'p_i = \\prod_{j \\neq i} \\frac{u - \\lambda_j \\text{id}_E}{\\lambda_i - \\lambda_j}',
        timestamp: '14 Octobre 11:05',
      },
    ],
  },
]

const SAMPLE_R_CODE = `# ==============================================================================
# PIPELINE CPGE MP/PSI INFORMATIQUE — DATA MINING & MACHINE LEARNING
# Fichier : pipeline_telco_churn_v2.R
# Étudiant : Achraf Lemrani (Lycée Omar Ibn Al-Khattab)
# ==============================================================================
library(tidyverse)
library(caret)
library(pROC)

# 1. Chargement et vérification des dimensions du dataset CPGE
telco_df <- read.csv("telco_churn_clean.csv", stringsAsFactors = FALSE)
set.seed(2026)

# 2. Stratification K-Fold pour préserver le ratio Churner (85% / 15%)
folds <- createFolds(telco_df$Churn, k = 5, list = TRUE, returnTrain = FALSE)
auc_results <- c()

for (k in seq_along(folds)) {
  val_idx   <- folds[[k]]
  train_set <- telco_df[-val_idx, ]
  val_set   <- telco_df[val_idx, ]

  # Standardisation stricte calibrée sur train_set uniquement (0 data leakage)
  mu_tenure <- mean(train_set$tenure, na.rm = TRUE)
  sd_tenure <- sd(train_set$tenure, na.rm = TRUE)

  train_set$tenure_scaled <- (train_set$tenure - mu_tenure) / sd_tenure
  val_set$tenure_scaled   <- (val_set$tenure - mu_tenure) / sd_tenure

  fit_model <- glm(Churn ~ tenure_scaled + MonthlyCharges, data = train_set, family = binomial)
  preds     <- predict(fit_model, newdata = val_set, type = "response")
  auc_results[k] <- as.numeric(auc(roc(val_set$Churn, preds, quiet = TRUE)))
}

cat("Validation croisée achevée. AUC moyen =", mean(auc_results), "\\n")`

// --------------------------------------------------------------------------
// MAIN ADMIN BACK-OFFICE COMPONENT
// --------------------------------------------------------------------------

export function AdminBackOffice({
  onNavigateToStudentView,
  onLogout,
}: {
  onNavigateToStudentView?: () => void
  onLogout?: () => void
}) {
  // Navigation tabs: overview | messages | catalog | annales | qcm
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'catalog' | 'annales' | 'qcm'>('overview')
  const { notify, feedback } = useUiFeedback()
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [pendingRemoval, setPendingRemoval] = useState<{ id: string; title: string; kind: 'course' | 'document' } | null>(null)
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false)
  const clearError = (field: string) => setFormErrors((previous) => ({ ...previous, [field]: '' }))
  const validateFields = (fields: Record<string, string>) => {
    const errors = Object.fromEntries(Object.entries(fields).filter(([, message]) => message))
    setFormErrors(errors)
    const first = Object.keys(errors)[0]
    if (first) document.getElementById(first)?.focus()
    return !first
  }
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [activeTab])
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState<boolean>(false)

  // Module Messages (Boîte de Réception Haute Densité) State
  const [conversations, setConversations] = useState<StudentConversation[]>(INITIAL_STUDENT_CONVERSATIONS)
  const [selectedConvId, setSelectedConvId] = useState<string>(INITIAL_STUDENT_CONVERSATIONS[0].id)
  const [messageSearchQuery, setMessageSearchQuery] = useState<string>('')
  const [messageFilter, setMessageFilter] = useState<'ALL' | 'UNREAD' | 'RESOLVED' | 'MP' | 'PSI' | 'TSI'>('ALL')
  const [studentReplyInput, setStudentReplyInput] = useState<string>('')
  const [replyAttachDocName, setReplyAttachDocName] = useState<string>('')
  const [composerTab, setComposerTab] = useState<'reply' | 'internal' | 'preview'>('reply')
  const [previewDocModal, setPreviewDocModal] = useState<AttachedDoc | null>(null)
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false)
  const [isRightInspectorOpen, setIsRightInspectorOpen] = useState<boolean>(true)
  const [inspectedDoc, setInspectedDoc] = useState<AttachedDoc | null>(
    INITIAL_STUDENT_CONVERSATIONS[0].messages[0].attachments?.[0] || null
  )
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Listen for ⌘K / Ctrl+K shortcut to focus message search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (activeTab === 'messages') {
          e.preventDefault()
          searchInputRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab])

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0]

  const handleSelectConversation = (convId: string) => {
    if (window.matchMedia('(max-width: 639px)').matches) {
      setIsRightInspectorOpen(false)
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    }
    setMobileConversationOpen(true)
    setSelectedConvId(convId)
    // Marquer comme lu
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread: false } : c))
    )
    const targetConv = conversations.find((c) => c.id === convId)
    const firstAttach = targetConv?.messages.flatMap((m) => m.attachments || [])[0]
    if (firstAttach) {
      setInspectedDoc(firstAttach)
    }
  }

  const handleMarkAllAsRead = () => {
    setConversations((prev) => prev.map((c) => ({ ...c, unread: false })))
  }

  const handleUpdateStatus = (convId: string, newStatus: 'pending' | 'in_progress' | 'resolved') => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, status: newStatus } : c))
    )
  }

  const handleUpdatePriority = (convId: string, newPriority: 'normal' | 'high') => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, priority: newPriority } : c))
    )
  }

  const insertFormatting = (prefix: string, suffix: string = '') => {
    setStudentReplyInput((prev) => `${prev}${prefix}${suffix}`)
  }

  const handleSendStudentReply = (e?: React.FormEvent, forceResolve?: boolean) => {
    if (e) e.preventDefault()
    if (!studentReplyInput.trim() && !replyAttachDocName) return

    setIsSendingReply(true)
    setTimeout(() => {
      setIsSendingReply(false)
      const isInternal = composerTab === 'internal'

      // Detect KaTeX formulas within $$...$$
      const mathMatch = studentReplyInput.match(/\$\$([\s\S]*?)\$\$/)
      const mathFormula = mathMatch ? mathMatch[1].trim() : undefined
      const cleanContent = studentReplyInput.replace(/\$\$[\s\S]*?\$\$/, '').trim() || studentReplyInput.trim()

      const newReplyItem: StudentMessageItem = {
        id: `msg-reply-${Date.now()}`,
        sender: isInternal ? 'internal_note' : 'admin',
        senderName: isInternal ? 'Note Interne Pédagogique' : 'Dr. Karim Mansouri',
        senderRole: isInternal ? 'Usage Interne Enseignants' : 'Responsable Pédagogique & Agrégé CPGE',
        content: cleanContent || (isInternal ? 'Note interne enregistrée.' : 'Document correctif officiel joint ci-dessous.'),
        math: mathFormula,
        timestamp: 'À l’instant',
        attachments: replyAttachDocName
          ? [
              {
                id: `att-reply-${Date.now()}`,
                name: replyAttachDocName,
                size: '1.2 Mo',
                type: 'pdf',
              },
            ]
          : undefined,
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? {
                ...c,
                unread: false,
                status: forceResolve ? 'resolved' : isInternal ? c.status : 'in_progress',
                lastMessageDate: 'À l’instant',
                lastMessageSnippet: (cleanContent || studentReplyInput.trim()).slice(0, 100),
                messages: [...c.messages, newReplyItem],
              }
            : c
        )
      )

      setStudentReplyInput('')
      setReplyAttachDocName('')
      if (composerTab === 'preview') setComposerTab('reply')
    }, 350)
  }

  // Step-by-step UX Course & TD Upload flow (Catalogue)
  const [catalogYear, setCatalogYear] = useState<'sup' | 'spe'>('spe')
  const [catalogSubjectId, setCatalogSubjectId] = useState<'maths' | 'physique' | 'si' | 'info'>('maths')
  const [catalogCourses, setCatalogCourses] = useState<AdminCatalogCourse[]>(INITIAL_CATALOG_COURSES)
  const [newCourseName, setNewCourseName] = useState<string>('')
  const [newCoursePdf, setNewCoursePdf] = useState<string>('')
  const [newTdPdf, setNewTdPdf] = useState<string>('')

  const handleAddCatalogCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFields({ 'course-name': !newCourseName.trim() ? 'Indiquez le nom du cours.' : '', 'course-pdf': !newCoursePdf ? 'Sélectionnez le PDF du cours.' : '' })) return

    const newCourseItem: AdminCatalogCourse = {
      id: `course-${catalogYear}-${catalogSubjectId}-${Date.now()}`,
      year: catalogYear,
      subjectId: catalogSubjectId,
      title: newCourseName.trim(),
      coursePdf: newCoursePdf || `${newCourseName.trim().replace(/\s+/g, '_')}_Cours.pdf`,
      tdPdf: newTdPdf || null,
      addedAt: 'À l’instant',
    }

    setCatalogCourses([newCourseItem, ...catalogCourses])
    setNewCourseName('')
    setNewCoursePdf('')
    setNewTdPdf('')
    notify('Le cours a été ajouté au catalogue de démonstration.')
  }

  const handleDeleteCatalogCourse = (id: string) => {
    const course = catalogCourses.find((item) => item.id === id)
    if (course) setPendingRemoval({ id, title: course.title, kind: 'course' })
  }

  // 5 Concours Types Selector State
  const [selectedAdminConcours, setSelectedAdminConcours] = useState<'cnc' | 'mines' | 'centrale' | 'ccinp' | 'x-ens'>('cnc')

  // Module A (Catalog) State
  const [subjects] = useState<SubjectConfig[]>(INITIAL_SUBJECTS)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('maths')
  const [chapters, setChapters] = useState<CourseChapter[]>(INITIAL_CHAPTERS)
  const [selectedChapterId, setSelectedChapterId] = useState<string>('chap-1')
  const [selectedLessonId, setSelectedLessonId] = useState<string>('les-1')
  const [exercises, setExercises] = useState<AdminExercise[]>(INITIAL_EXERCISES)

  // Lesson KaTeX Editor State
  const [lessonLatexContent, setLessonLatexContent] = useState<string>(
    '\\text{Soit } u \\in \\mathcal{L}(E). \\text{ Le polynome caracteristique est defini par } \\chi_u(X) = \\det(X \\text{id}_E - u). \\newline \\text{Theoreme de Cayley-Hamilton : } \\chi_u(u) = 0_{\\mathcal{L}(E)}.'
  )
  const [uploadedSummaryPdf, setUploadedSummaryPdf] = useState<string>('Fiche_Synthese_Reduction_CNC_2026.pdf')
  const [isSavedAlert, setIsSavedAlert] = useState<boolean>(false)

  // Module B (Annales) State
  const [annalesList, setAnnalesList] = useState<PublishedAnnale[]>(INITIAL_ANNALES)
  const [newAnnaleYear, setNewAnnaleYear] = useState<number>(2025)
  const [newAnnaleStream, setNewAnnaleStream] = useState<'MP' | 'PSI' | 'TSI'>('MP')
  const [newAnnaleSubject, setNewAnnaleSubject] = useState<string>('Mathématiques I')
  const [newAnnaleDuration, setNewAnnaleDuration] = useState<string>('4h')
  const [uploadedStatement, setUploadedStatement] = useState<string>('')
  const [uploadedSolution, setUploadedSolution] = useState<string>('')
  const [uploadedJuryReport, setUploadedJuryReport] = useState<string>('')
  const [annaleFilterStream, setAnnaleFilterStream] = useState<string>('ALL')

  // Module C (QCM) State
  const [qcmList, setQcmList] = useState<AdminQcmQuestion[]>(INITIAL_QCMS)
  const [qcmStatement, setQcmStatement] = useState<string>(
    'Soit A \\in \\mathcal{M}_n(\\mathbb{R}) telle que A^2 = A. Quelle est la trace de A ?'
  )
  const [qcmDifficulty, setQcmDifficulty] = useState<number>(2)
  const [qcmTargetTime, setQcmTargetTime] = useState<number>(75)
  const [qcmChoices, setQcmChoices] = useState([
    { id: 'opt-A', label: 'A', latex: '\\text{Tr}(A) = \\text{rg}(A)', isCorrect: true, distractorComment: 'Correct : Un projecteur est diagonalisable et ses valeurs propres sont 0 et 1.' },
    { id: 'opt-B', label: 'B', latex: '\\text{Tr}(A) = n', isCorrect: false, distractorComment: 'Faux : Vrai uniquement si A = I_n.' },
    { id: 'opt-C', label: 'C', latex: '\\text{Tr}(A) = 0', isCorrect: false, distractorComment: 'Faux : Vrai uniquement si A = 0.' },
    { id: 'opt-D', label: 'D', latex: '\\text{Tr}(A) = \\det(A)', isCorrect: false, distractorComment: 'Faux : Aucune relation générale d’égalité entre trace et déterminant pour un projecteur.' },
  ])
  const [qcmExplanation, setQcmExplanation] = useState<string>(
    'Un projecteur vérifie X^2 - X = 0. Ses valeurs propres sont dans {0, 1}, donc sa trace est la somme de ses valeurs propres, c’est-à-dire le rang de A.'
  )

  // Helper: Current selected Chapter & Lesson
  const currentChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0]
  const currentLesson = currentChapter?.lessons.find((l) => l.id === selectedLessonId) || currentChapter?.lessons[0]

  // Handler: Save Lesson LaTeX
  const handleSaveLesson = () => {
    setIsSavedAlert(true)
    setTimeout(() => setIsSavedAlert(false), 2500)
  }

  // Handler: Publish new Annale
  const handlePublishAnnale = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFields({ 'annale-subject': !newAnnaleSubject.trim() ? 'Indiquez le nom de l’épreuve.' : '', 'annale-pdf': !uploadedStatement ? 'Sélectionnez le PDF de l’énoncé.' : '' })) return
    const newEntry: PublishedAnnale = {
      id: `ann-${selectedAdminConcours}-${newAnnaleYear}-${newAnnaleStream.toLowerCase()}-${Date.now()}`,
      concoursId: selectedAdminConcours,
      year: newAnnaleYear,
      stream: newAnnaleStream,
      subject: newAnnaleSubject,
      duration: newAnnaleDuration,
      statementPdf: uploadedStatement || `${selectedAdminConcours.toUpperCase()}_${newAnnaleYear}_${newAnnaleStream}_${newAnnaleSubject.replace(/\s+/g, '_')}_Enonce.pdf`,
      officialSolutionPdf: uploadedSolution || undefined,
      downloadsCount: 0,
      status: 'PUBLISHED',
      publishedAt: 'À l’instant',
    }
    setAnnalesList([newEntry, ...annalesList])
    setUploadedStatement('')
    setUploadedSolution('')
    notify(`Annale ${selectedAdminConcours.toUpperCase()} ${newAnnaleYear} (${newAnnaleStream}) ajoutée à la liste de démonstration.`)
  }

  // Handler: Create QCM Question
  const handleCreateQcm = (e: React.FormEvent) => {
    e.preventDefault()
    const newQcm: AdminQcmQuestion = {
      id: `qcm-adm-${Date.now()}`,
      lessonId: selectedLessonId,
      lessonTitle: currentLesson?.title || 'Leçon sélectionnée',
      statementLatex: qcmStatement,
      difficulty: qcmDifficulty,
      targetTimeSeconds: qcmTargetTime,
      choices: qcmChoices,
      explanationLatex: qcmExplanation,
      successRate: 0,
    }
    setQcmList([newQcm, ...qcmList])
    notify('Question ajoutée à la banque de QCM de démonstration.')
  }

  // --------------------------------------------------------------------------
  // Document Upload Feature (Cours, TD, Concours)
  // --------------------------------------------------------------------------
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false)
  const uploadDialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = uploadDialogRef.current
    if (showUploadModal) dialog?.showModal()
    return () => dialog?.close()
  }, [showUploadModal])
  const [docType, setDocType] = useState<'COURS' | 'TD' | 'CONCOURS'>('COURS')
  const [docTitle, setDocTitle] = useState<string>('')
  const [docSubject, setDocSubject] = useState<string>('Mathématiques')
  const [docLevel, setDocLevel] = useState<string>('Spé (2e année)')
  const [docStream, setDocStream] = useState<string>('MP')
  const [docFileName, setDocFileName] = useState<string>('')
  const [docFileSize, setDocFileSize] = useState<string>('2.4 Mo')
  const [uploadedDocsList, setUploadedDocsList] = useState<{
    id: string
    title: string
    type: 'COURS' | 'TD' | 'CONCOURS'
    subject: string
    level: string
    stream: string
    fileName: string
    fileSize: string
    date: string
  }[]>([
    {
      id: 'doc-1',
      title: 'Polycopié de Cours — Espaces Préhilbertiens & Réduction',
      type: 'COURS',
      subject: 'Mathématiques',
      level: 'Spé (2e année)',
      stream: 'MP / PSI',
      fileName: 'Cours_Hilbert_Reduction_2026.pdf',
      fileSize: '3.4 Mo',
      date: 'Hier à 16:30',
    },
    {
      id: 'doc-2',
      title: 'TD 04 — Séries entières & Formule de Stirling',
      type: 'TD',
      subject: 'Mathématiques',
      level: 'Spé (2e année)',
      stream: 'MP',
      fileName: 'TD04_Series_Stirling.pdf',
      fileSize: '1.2 Mo',
      date: '15 Octobre 2026',
    },
    {
      id: 'doc-3',
      title: 'Épreuve Concours CNC Mathématiques I (Session 2025)',
      type: 'CONCOURS',
      subject: 'Mathématiques',
      level: 'Session 2025',
      stream: 'MP',
      fileName: 'CNC_2025_Math1_MP_Officiel.pdf',
      fileSize: '2.1 Mo',
      date: '12 Octobre 2026',
    },
  ])

  const handleUploadDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFields({ 'document-title': !docTitle.trim() ? 'Indiquez le titre du document.' : '' })) return

    const newDoc = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      type: docType,
      subject: docSubject,
      level: docLevel,
      stream: docStream,
      fileName: docFileName.trim() || `${docType.toLowerCase()}_${docSubject.toLowerCase()}_${Date.now()}.pdf`,
      fileSize: docFileSize || '1.8 Mo',
      date: 'À l’instant',
    }

    setUploadedDocsList([newDoc, ...uploadedDocsList])
    setDocTitle('')
    setDocFileName('')
    setShowUploadModal(false)
    notify(`« ${newDoc.title} » a été ajouté à la liste de démonstration.`)
  }

  return (
    <div className="learning-shell admin-shell min-h-screen bg-transparent text-[#172033] dark:text-[#eaf2ff] selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP NAVBAR ADMIN (100% Identical UI to Student Task Bar)        */}
      {/* ------------------------------------------------------------------ */}
      <header className="app-navbar sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 text-[#101b33] shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-[#101b33]/95 dark:text-white dark:shadow-[0_8px_24px_rgba(16,27,51,.12)]">
        {/* Combined Single Unified Navigation Bar */}
        <div className="app-navbar-inner mx-auto flex h-[62px] max-w-[1600px] items-center justify-between px-3 sm:px-6 gap-3">
          {/* LEFT: Logo Nexora + Admin Central Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('overview')
                setMobileMenuOpen(false)
              }}
              className="flex items-center text-left transition hover:opacity-90 cursor-pointer"
              title="Retour au Tableau de bord Admin"
            >
              <NexoraLogo size={32} showText className="pr-1" />
            </button>
            <span className="hidden 2xl:inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-300 border border-amber-500/30">
              <ShieldCheck size={13} weight="bold" />
              <span>Back-Office</span>
            </span>
          </div>

          {/* CENTER: Navigation Items (5 Onglets Admin Épurés, Badge '15' sur QCM) */}
          <nav className="hidden xl:flex min-w-0 items-center justify-center gap-1" aria-label="Navigation principale administration">
            {[
              { id: 'overview' as const, label: 'Tableau de bord', icon: Gauge },
              { id: 'messages' as const, label: 'Messages', icon: ChatCircleDots },
              { id: 'catalog' as const, label: 'Cours & TD', icon: Books },
              { id: 'annales' as const, label: 'Annales', icon: Scroll },
              { id: 'qcm' as const, label: 'QCM', icon: Sparkle, hasBadge: '' },
            ].map(({ id, label, icon: Icon, hasBadge }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActiveTab(id)
                    setMobileMenuOpen(false)
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-[62px] shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-[#3978F6] text-[#3978F6] dark:border-[#3978F6] dark:text-white'
                      : 'border-transparent text-[#64748b] hover:border-slate-300 hover:text-[#101b33] dark:text-[#aab8d0] dark:hover:text-white'
                  }`}
                >
                  <Icon size={16} weight={isActive ? 'fill' : 'bold'} className="shrink-0" />
                  <span>{label}</span>
                  {hasBadge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        isActive
                          ? 'bg-[#3978F6] text-white shadow-xs'
                          : 'bg-[#3978F6]/15 text-[#2866dc] dark:bg-[#3978F6]/30 dark:text-[#9cc0ff]'
                      }`}
                    >
                      {hasBadge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* RIGHT: Actions Admin (Upload, Switch Vue Étudiant, Thème, Streak & Profil) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Document Upload CTA */}
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3978F6] px-2.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
              title="Ajouter un document"
            >
              <UploadSimple size={14} weight="bold" />
              <span className="hidden sm:inline">Document</span>
            </button>

            {/* Quick Switch to Student View */}
            {onNavigateToStudentView && (
              <button
                type="button"
                onClick={onNavigateToStudentView}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-500/20 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-white cursor-pointer"
                title="Basculer vers la Vue Étudiant"
              >
                <ShieldCheck size={14} weight="bold" />
                <span className="hidden sm:inline">Vue Étudiant</span>
              </button>
            )}

            <ThemeToggle />

            {/* Admin Profile with Interactive Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-slate-200/60 dark:hover:bg-white/10 text-left cursor-pointer"
                title="Menu Administrateur"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#3978F6] to-indigo-600 text-xs font-bold text-white shadow-xs shrink-0">
                  KM
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white hidden lg:inline">
                  Dr. Karim Mansouri
                </span>
                <CaretDown size={12} weight="bold" className="text-slate-400 shrink-0" />
              </button>

              {/* Popover Dropdown */}
              {isAdminMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101b33] z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10">
                    <p className="text-xs font-bold text-[#101b33] dark:text-white">Dr. Karim Mansouri</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">karim.mansouri@cpge.ma</p>
                    <span className="mt-1.5 inline-block rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-xs font-bold uppercase text-amber-600 dark:text-amber-300">
                      Rôle : Administrateur Central
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminMenuOpen(false)
                        setShowUploadModal(true)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
                    >
                      <UploadSimple size={14} weight="bold" className="text-[#3978F6]" />
                      <span>Uploader un document</span>
                    </button>
                    {onNavigateToStudentView && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdminMenuOpen(false)
                          onNavigateToStudentView()
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
                      >
                        <Eye size={14} weight="bold" className="text-indigo-500" />
                        <span>Basculer vers Vue Étudiant</span>
                      </button>
                    )}
                  </div>
                  {onLogout && (
                    <div className="border-t border-slate-100 dark:border-white/10 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdminMenuOpen(false)
                          onLogout()
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      >
                        <X size={14} weight="bold" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="app-menu-trigger flex size-9 shrink-0 items-center justify-center rounded-lg text-[#64748b] hover:bg-black/5 dark:text-[#c4d0e4] dark:hover:bg-white/10 xl:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-navigation"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div id="admin-mobile-navigation" className="app-mobile-menu border-t border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1426]/95 xl:hidden animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1">
              {[
                { id: 'overview' as const, label: 'Tableau de bord', icon: Gauge },
                { id: 'messages' as const, label: 'Messages', icon: ChatCircleDots },
                { id: 'catalog' as const, label: 'Cours & TD', icon: Books },
                { id: 'annales' as const, label: 'Annales', icon: Scroll },
                { id: 'qcm' as const, label: 'QCM', icon: Sparkle, hasBadge: '' },
              ].map(({ id, label, icon: Icon, hasBadge }) => {
                const isActive = activeTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActiveTab(id)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-[#3978F6] text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} weight={isActive ? 'fill' : 'bold'} />
                      <span>{label}</span>
                    </div>
                    {hasBadge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#3978F6]/15 text-[#3978F6] dark:bg-[#3978F6]/30 dark:text-white'
                        }`}
                      >
                        {hasBadge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* ================================================================ */}
      {/* TAB 2: MESSAGERIE & BOÎTE DE RÉCEPTION HAUTE DENSITÉ (SPLIT-PANE)  */}
      {/* ================================================================ */}
      {activeTab === 'messages' && (
        <div className={`admin-messages ${mobileConversationOpen ? 'conversation-open' : 'list-open'} w-full h-[calc(100vh-62px)] flex flex-col overflow-hidden bg-[#09090b] text-slate-100 font-sans`}>
          {/* Top Compact Bar (h-14 border-b border-white/10 px-6) */}
          <div className="h-14 shrink-0 border-b border-white/10 px-6 flex items-center justify-between bg-[#0c0e14]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-xs">
                  <ChatCircleDots size={18} weight="fill" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Messages étudiants</span>
                    <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-xs font-mono text-indigo-300">
                      {conversations.filter((c) => c.status !== 'resolved').length} à traiter
                    </span>
                    {conversations.filter((c) => c.unread).length > 0 && (
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-mono text-amber-300">
                        {conversations.filter((c) => c.unread).length} non lus
                      </span>
                    )}
                  </h2>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-white/10 text-xs text-slate-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Espace Administration • Concours CNC 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsRightInspectorOpen(!isRightInspectorOpen)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isRightInspectorOpen && inspectedDoc
                    ? 'border-indigo-500/40 bg-indigo-600/20 text-indigo-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Basculer le panneau latéral d'inspection des documents"
              >
                <Eye size={14} weight="bold" />
                <span className="hidden sm:inline">Inspecteur Pièces</span>
              </button>

              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition cursor-pointer"
              >
                <CheckCircle size={14} weight="bold" />
                <span>Tout marquer comme lu</span>
              </button>
            </div>
          </div>

          {/* Split-Pane 3 Panels Container */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* ------------------------------------------------------------ */}
            {/* PANNEAU GAUCHE : LISTE DES TICKETS HAUTE DENSITÉ (w-80 / w-96) */}
            {/* ------------------------------------------------------------ */}
            <div className="admin-ticket-list w-80 lg:w-96 shrink-0 border-r border-white/10 flex flex-col bg-[#09090b] h-full overflow-hidden">
              {/* Fixed Search Header & Filter Pills */}
              <div className="p-3.5 border-b border-white/10 bg-[#09090b] space-y-2.5 shrink-0">
                {/* Search Bar with ⌘K */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <MagnifyingGlass size={15} weight="bold" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    placeholder="Rechercher étudiant, réf, lycée..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-9 pr-12 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-black/50 focus:outline-none transition"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                    <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-xs text-slate-400">
                      ⌘K
                    </kbd>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1 text-xs">
                  {[
                    { id: 'ALL' as const, label: 'Tous', count: conversations.length },
                    {
                      id: 'UNREAD' as const,
                      label: 'À traiter',
                      count: conversations.filter((c) => c.status !== 'resolved' || c.unread).length,
                    },
                    {
                      id: 'RESOLVED' as const,
                      label: 'Résolus',
                      count: conversations.filter((c) => c.status === 'resolved').length,
                    },
                    { id: 'MP' as const, label: 'MP', count: conversations.filter((c) => c.studentStream === 'MP').length },
                    { id: 'PSI' as const, label: 'PSI', count: conversations.filter((c) => c.studentStream === 'PSI').length },
                    { id: 'TSI' as const, label: 'TSI', count: conversations.filter((c) => c.studentStream === 'TSI').length },
                  ].map((f) => {
                    const isSelected = messageFilter === f.id
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setMessageFilter(f.id)}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className="opacity-70 text-xs">({f.count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 divide-y divide-white/5">
                {conversations
                  .filter((c) => {
                    if (messageFilter === 'UNREAD') return c.unread || c.status !== 'resolved'
                    if (messageFilter === 'RESOLVED') return c.status === 'resolved'
                    if (messageFilter === 'MP' || messageFilter === 'PSI' || messageFilter === 'TSI') {
                      return c.studentStream === messageFilter
                    }
                    return true
                  })
                  .filter((c) => {
                    if (!messageSearchQuery.trim()) return true
                    const q = messageSearchQuery.toLowerCase()
                    return (
                      c.studentName.toLowerCase().includes(q) ||
                      c.subject.toLowerCase().includes(q) ||
                      c.ticketId.toLowerCase().includes(q) ||
                      c.studentCenter.toLowerCase().includes(q) ||
                      c.studentStream.toLowerCase().includes(q)
                    )
                  })
                  .map((conv) => {
                    const isSelected = selectedConvId === conv.id
                    const totalAttach = conv.messages.reduce(
                      (sum, m) => sum + (m.attachments?.length || 0),
                      0
                    )

                    return (
                      <div
                        key={conv.id}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSelectConversation(conv.id) } }}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`group relative p-3.5 transition cursor-pointer ${
                          isSelected
                            ? 'border-l-2 border-indigo-500 bg-white/[0.04] text-white'
                            : 'border-l-2 border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-slate-200'
                        }`}
                      >
                        {/* Row 1: Avatar, Name, Stream Badge, Ref */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-[#3978F6] text-xs font-bold text-white shadow-xs">
                              {conv.studentName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                              {conv.studentName}
                            </span>
                            <span className="rounded bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.2 font-mono text-xs font-bold text-indigo-300 shrink-0">
                              {conv.studentStream}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-slate-500 shrink-0">
                            {conv.ticketId}
                          </span>
                        </div>

                        {/* Row 2: Status & Priority badges */}
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-bold border ${
                                conv.status === 'resolved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : conv.status === 'in_progress'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {conv.status === 'resolved' ? 'Résolu' : conv.status === 'in_progress' ? 'Répondu' : 'En attente'}
                            </span>
                            {conv.priority === 'high' && (
                              <span className="rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 text-xs font-bold">
                                Haute
                              </span>
                            )}
                          </div>
                          {totalAttach > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                              <Paperclip size={11} />
                              <span>{totalAttach}</span>
                            </span>
                          )}
                        </div>

                        {/* Row 3: Bold Truncated Subject */}
                        <p className="mt-1.5 text-xs font-bold truncate text-slate-100">
                          {conv.subject}
                        </p>

                        {/* Row 4: Snippet */}
                        <p className="mt-0.5 text-xs text-slate-400 line-clamp-1 leading-relaxed">
                          {conv.lastMessageSnippet}
                        </p>

                        {/* Row 5: Date and Unread dot */}
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 font-mono">
                          <span>{conv.lastMessageDate}</span>
                          {conv.unread && (
                            <span className="size-2 rounded-full bg-blue-500 shadow-none" />
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* PANNEAU CENTRAL : FIL DE DISCUSSION & ÉDITEUR (flex-1)        */}
            {/* ------------------------------------------------------------ */}
            <div className="admin-conversation flex-1 flex flex-col h-full bg-[#0c0e14] min-w-0 overflow-hidden">
              <button type="button" className="mobile-ticket-back" onClick={() => setMobileConversationOpen(false)}>← Tous les messages</button>
              {/* A. Fixed Ticket Header */}
              <div className="h-16 shrink-0 border-b border-white/10 px-6 flex items-center justify-between bg-[#0c0e14]/90 backdrop-blur-md">
                <div className="min-w-0 pr-4">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {activeConversation.subject}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    <span className="font-semibold text-slate-200">{activeConversation.studentName}</span>
                    <span className="mx-1.5 opacity-40">•</span>
                    <span>{activeConversation.studentCenter}</span>
                    <span className="mx-1.5 opacity-40">•</span>
                    <span className="text-indigo-400 font-mono">Filière {activeConversation.studentStream} ({activeConversation.studentYear})</span>
                    <span className="mx-1.5 opacity-40">•</span>
                    <span className="font-mono text-slate-400">Réf: {activeConversation.ticketId}</span>
                  </p>
                </div>

                {/* Actions Admin à droite */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status Selector */}
                  <select
                    value={activeConversation.status}
                    onChange={(e) => handleUpdateStatus(activeConversation.id, e.target.value as any)}
                    className="rounded-xl border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                    title="Changer le statut du ticket"
                  >
                    <option value="pending">En attente</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolu</option>
                  </select>

                  {/* Priority Selector */}
                  <select
                    value={activeConversation.priority}
                    onChange={(e) => handleUpdatePriority(activeConversation.id, e.target.value as any)}
                    className="rounded-xl border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                    title="Changer la priorité"
                  >
                    <option value="normal">Priorité Normale</option>
                    <option value="high">Priorité Haute</option>
                  </select>

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const files = activeConversation.messages.flatMap((m) => m.attachments || [])
                      if (files.length === 0) notify('Aucune pièce jointe sur cette conversation.')
                      else notify(`Aperçu de démonstration — téléchargement de ${files.length} pièce(s) : ${files.map((f) => f.name).join(', ')}`)
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    title="Télécharger les pièces jointes"
                  >
                    <DownloadSimple size={14} weight="bold" />
                    <span className="hidden xl:inline">Télécharger pièces</span>
                  </button>
                </div>
              </div>

              {/* B. Scrollable Message Thread */}
              <div className="admin-thread flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                {activeConversation.messages.map((msg) => {
                  if (msg.sender === 'student') {
                    return (
                      <div key={msg.id} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-[#3978F6] text-xs font-bold text-white shadow-xs">
                            {msg.senderName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-200">{msg.senderName}</span>
                          <span className="rounded bg-indigo-500/10 text-indigo-400 px-2 py-0.2 text-xs font-mono">
                            Étudiant CPGE — {activeConversation.studentStream}
                          </span>
                          <span className="opacity-40">•</span>
                          <span className="font-mono text-slate-500">{msg.timestamp}</span>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-5 shadow-sm text-slate-200 text-xs sm:text-sm leading-relaxed">
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Math KaTeX block */}
                          {msg.math && (
                            <div className="my-3.5 rounded-lg border border-white/10 bg-black/40 p-4 font-mono shadow-inner">
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
                                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                                  <Lightning size={13} weight="fill" />
                                  <span>Formule &amp; Démarche KaTeX</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.math || '')
                                    notify('Formule LaTeX copiée !')
                                  }}
                                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Copy size={12} />
                                  <span>Copier LaTeX</span>
                                </button>
                              </div>
                              <div className="py-1 overflow-x-auto">
                                <MathFormula math={msg.math} block />
                              </div>
                            </div>
                          )}

                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-bold">
                                Pièces jointes pédagogiques ({msg.attachments.length}) :
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {msg.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs hover:border-white/20 transition"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                                        {att.type === 'pdf' ? (
                                          <FilePdf size={18} weight="fill" className="text-rose-400" />
                                        ) : att.type === 'code' ? (
                                          <FileCode size={18} weight="fill" className="text-emerald-400" />
                                        ) : (
                                          <ImageIcon size={18} weight="fill" className="text-amber-400" />
                                        )}
                                      </div>
                                      <div className="truncate">
                                        <span className="font-bold text-slate-200 block truncate">{att.name}</span>
                                        <span className="text-xs text-slate-400 font-mono">{att.size}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInspectedDoc(att)
                                          setIsRightInspectorOpen(true)
                                        }}
                                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition cursor-pointer"
                                        title="Ouvrir dans l'inspecteur latéral"
                                      >
                                        <Eye size={12} weight="bold" />
                                        <span>Aperçu</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => notify(`Aperçu de démonstration — téléchargement de : ${att.name}`)}
                                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                                        title="Télécharger le fichier"
                                      >
                                        <DownloadSimple size={13} weight="bold" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  if (msg.sender === 'admin') {
                    return (
                      <div key={msg.id} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-xs font-bold text-white shadow-xs">
                              KM
                            </div>
                            <span className="font-bold text-slate-100">{msg.senderName}</span>
                            <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                              Réponse Officielle • Administration Pédagogique
                            </span>
                          </div>
                          <span className="font-mono text-slate-500">{msg.timestamp}</span>
                        </div>

                        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 shadow-sm text-slate-100 text-xs sm:text-sm leading-relaxed">
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Math KaTeX */}
                          {msg.math && (
                            <div className="my-3.5 rounded-lg border border-indigo-500/20 bg-black/40 p-4 font-mono shadow-inner">
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
                                <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                                  <Lightning size={13} weight="fill" />
                                  <span>Formule &amp; Justification KaTeX Officielle</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.math || '')
                                    notify('Formule LaTeX copiée !')
                                  }}
                                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Copy size={12} />
                                  <span>Copier LaTeX</span>
                                </button>
                              </div>
                              <div className="py-1 overflow-x-auto">
                                <MathFormula math={msg.math} block />
                              </div>
                            </div>
                          )}

                          {/* Attached files */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                              <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 block font-bold">
                                Corrigé officiel joint ({msg.attachments.length}) :
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {msg.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-black/30 px-3 py-1.5 text-xs text-indigo-200"
                                  >
                                    <FilePdf size={16} weight="fill" className="text-rose-400" />
                                    <span className="font-bold">{att.name}</span>
                                    <span className="text-slate-400 font-mono text-xs">({att.size})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  // Internal Note
                  return (
                    <div key={msg.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                            Note Interne • Visible uniquement par les professeurs / admins
                          </span>
                        </div>
                        <span className="font-mono text-slate-500">{msg.timestamp}</span>
                      </div>

                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm text-amber-200 text-xs sm:text-sm leading-relaxed">
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* C. Functional Fixed Reply Composer */}
              <div className="admin-composer shrink-0 border-t border-white/10 bg-[#0c0e14] p-4 space-y-3">
                {/* Composer Tabs */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setComposerTab('reply')}
                      className={`rounded-lg px-3 py-1 font-bold transition cursor-pointer ${
                        composerTab === 'reply'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Répondre
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerTab('internal')}
                      className={`rounded-lg px-3 py-1 font-bold transition cursor-pointer ${
                        composerTab === 'internal'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Note interne
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerTab('preview')}
                      className={`rounded-lg px-3 py-1 font-bold transition cursor-pointer ${
                        composerTab === 'preview'
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Aperçu
                    </button>
                  </div>

                  {/* Shortcuts hint */}
                  <span className="hidden sm:inline text-xs font-mono text-slate-500">
                    Envoyer : <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">Ctrl + Entrée</kbd>
                  </span>
                </div>

                {/* Rich Editing Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-slate-300 text-xs">
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
                      title="Gras"
                    >
                      <Bold size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*')}
                      className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
                      title="Italique"
                    >
                      <Italic size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('```r\n', '\n```')}
                      className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
                      title="Bloc de Code"
                    >
                      <CodeIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('$$\n', '\n$$')}
                      className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition font-mono font-bold"
                      title="Formule Mathématique KaTeX"
                    >
                      $\sum$
                    </button>

                    <div className="h-4 w-[1px] bg-white/10 mx-1" />

                    {/* File attachment upload trigger */}
                    <label className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer">
                      <Paperclip size={14} />
                      <span>Joindre corrigé</span>
                      <input
                        type="file"
                        accept=".pdf,.R,.py"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) setReplyAttachDocName(f.name)
                        }}
                      />
                    </label>
                  </div>

                  {/* Canned Responses Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setStudentReplyInput((prev) => `${prev}${prev ? '\n\n' : ''}${e.target.value}`)
                          e.target.value = ''
                        }
                      }}
                      className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Modèles de réponse CNC...</option>
                      <option value="Bonjour. Votre démarche est mathématiquement rigoureuse et validée sans incohérence. Le raisonnement respecte parfaitement les exigences du programme officiel CNC.">
                        Validation de démarche
                      </option>
                      <option value="Attention au risque de data leakage : veillez à ajuster les paramètres de standardisation (moyenne et écart-type) exclusivement sur le pli d'entraînement.">
                        Précision Data Leakage
                      </option>
                      <option value="Pour cette question, veuillez vous référer directement à l'annale officielle CNC 2024 Mathématiques I (Partie B, question 4).">
                        Renvoi corrigé CNC 2024
                      </option>
                      <option value="Rappel de cours CNC : Un endomorphisme u est diagonalisable si et seulement si son polynôme minimal est scindé à racines simples sur K.">
                        Rappel diagonalisation
                      </option>
                      <option value="Recommandation du jury : Encadrez systématiquement vos résultats finaux et citez expressément les théorèmes utilisés (ex : Lemme des noyaux).">
                        Conseil de jury CNC
                      </option>
                    </select>
                  </div>
                </div>

                {/* Input or Live Preview Area */}
                {composerTab === 'preview' ? (
                  <div className="min-h-[90px] rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200">
                    <span className="text-xs font-mono text-indigo-400 block mb-2 uppercase font-bold">
                      Aperçu en Direct KaTeX :
                    </span>
                    {studentReplyInput.trim() ? (
                      <div className="space-y-2">
                        <p className="whitespace-pre-wrap">{studentReplyInput}</p>
                        {studentReplyInput.includes('$$') && (
                          <div className="mt-2 py-1">
                            <MathFormula
                              math={studentReplyInput.match(/\$\$([\s\S]*?)\$\$/)?.[1] || ''}
                              block
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Tapez du texte ou une formule pour voir le rendu.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={3}
                    value={studentReplyInput}
                    onChange={(e) => setStudentReplyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        handleSendStudentReply(e)
                      }
                    }}
                    placeholder={
                      composerTab === 'internal'
                        ? "Rédigez une note interne (visible uniquement par les professeurs & administrateurs)..."
                        : "Rédigez votre réponse pédagogique (Markdown & LaTeX supportés : utilisez $...$ ou $$...$$)..."
                    }
                    className={`w-full rounded-2xl border p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition leading-relaxed ${
                      composerTab === 'internal'
                        ? 'border-amber-500/30 bg-amber-500/5 focus:border-amber-500'
                        : 'border-white/10 bg-black/40 focus:border-indigo-500'
                    }`}
                  />
                )}

                {/* Composer Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
                      <Lightning size={13} weight="fill" className="text-amber-400" />
                      <span>Formules mathématiques</span>
                    </span>

                    {replyAttachDocName && (
                      <div className="flex items-center gap-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-xs text-indigo-300">
                        <Paperclip size={12} />
                        <span className="truncate max-w-[140px]">{replyAttachDocName}</span>
                        <button
                          type="button"
                          onClick={() => setReplyAttachDocName('')}
                          className="hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => handleSendStudentReply(e, true)}
                      disabled={isSendingReply || (!studentReplyInput.trim() && !replyAttachDocName)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition disabled:opacity-50 cursor-pointer"
                    >
                      Envoyer et résoudre
                    </button>

                    <button
                      type="button"
                      onClick={handleSendStudentReply}
                      disabled={isSendingReply || (!studentReplyInput.trim() && !replyAttachDocName)}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-[#3978F6] px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                    >
                      <PaperPlaneTilt size={14} weight="bold" />
                      <span>Envoyer la réponse</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* PANNEAU DROIT : INSPECTEUR DE PIÈCES JOINTES (w-[420px])     */}
            {/* ------------------------------------------------------------ */}
            {isRightInspectorOpen && inspectedDoc && (
              <div className="admin-inspector w-[420px] shrink-0 border-l border-white/10 flex flex-col bg-[#09090b] h-full overflow-hidden">
                {/* Inspector Header */}
                <div className="h-14 shrink-0 border-b border-white/10 px-4 flex items-center justify-between bg-[#0c0e14]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                      {inspectedDoc.type === 'pdf' ? (
                        <FilePdf size={16} weight="fill" className="text-rose-400" />
                      ) : inspectedDoc.type === 'code' ? (
                        <FileCode size={16} weight="fill" className="text-emerald-400" />
                      ) : (
                        <ImageIcon size={16} weight="fill" className="text-amber-400" />
                      )}
                    </div>
                    <span className="font-bold text-xs text-white truncate max-w-[220px]">
                      {inspectedDoc.name}
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-xs text-slate-300 shrink-0">
                      {inspectedDoc.size}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRightInspectorOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title="Fermer l'inspecteur"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Inspector Content */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin space-y-4">
                  {inspectedDoc.type === 'code' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-white/10">
                        <span className="font-mono text-emerald-400 font-bold">R Script • v4.3</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(SAMPLE_R_CODE)
                            notify('Code copié !')
                          }}
                          className="flex items-center gap-1 hover:text-white transition text-xs"
                        >
                          <Copy size={12} />
                          <span>Copier</span>
                        </button>
                      </div>

                      <pre className="rounded-xl border border-white/10 bg-black/60 p-3.5 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                        <code>{SAMPLE_R_CODE}</code>
                      </pre>

                      {/* Console output simulation */}
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-emerald-300 text-xs font-mono space-y-1">
                        <span className="font-bold text-xs block text-emerald-400">
                          &gt; Console R Linter :
                        </span>
                        <p className="text-xs text-emerald-200">
                          [OK] 0 Data Leakage détecté. Standardisation strictement isolée sur pli Train.
                        </p>
                      </div>
                    </div>
                  ) : inspectedDoc.type === 'pdf' ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-3">
                        <div className="border-b border-white/10 pb-2">
                          <span className="font-mono text-xs text-rose-400 font-bold uppercase block">
                            Document Pédagogique PDF
                          </span>
                          <h4 className="font-bold text-white text-sm mt-0.5">
                            {inspectedDoc.name}
                          </h4>
                        </div>

                        <p className="text-slate-300 leading-relaxed text-xs">
                          Fiche de synthèse détaillant les formules de passage et la prévention du data leakage en validation croisée CPGE.
                        </p>

                        <div className="rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-center">
                          <MathFormula
                            math="\hat{x}_{ij} = \frac{x_{ij} - \mu_j^{(\text{train})}}{\sigma_j^{(\text{train})}}"
                            block
                          />
                        </div>

                        <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-white/5">
                          <p>• Règle 1 : Ne jamais inclure les observations du pli de test.</p>
                          <p>• Règle 2 : Réappliquer les mêmes invariants scalaires.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Image / Vector Diagram */
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center space-y-3">
                      <span className="font-mono text-xs text-amber-400 font-bold uppercase block">
                        Schéma Technique
                      </span>
                      <div className="h-44 rounded-xl border border-dashed border-white/20 bg-black/40 flex items-center justify-center p-4">
                        <MathFormula
                          math="\vec{B}_2 - \vec{B}_1 = \mu_0 \, \vec{j}_s \wedge \vec{n}_{1 \to 2}"
                          block
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        Illustration de la relation de passage du champ magnétique aux limites d'un conducteur parfait.
                      </p>
                    </div>
                  )}
                </div>

                {/* Inspector Footer */}
                <div className="p-3 border-t border-white/10 bg-[#0c0e14] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      insertFormatting(`\n> En référence au document « ${inspectedDoc.name} » :\n`)
                    }}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    <Quote size={13} />
                    <span>Citer dans la réponse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => notify(`Aperçu de démonstration — téléchargement de : ${inspectedDoc.name}`)}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition cursor-pointer"
                  >
                    <DownloadSimple size={13} weight="bold" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Container for Other Tabs (Overview, Catalog, Annales, QCM) */}
      {activeTab !== 'messages' && (
        <main className="mx-auto max-w-[1440px] px-5 lg:px-8 py-6 sm:py-8">
        {/* ================================================================ */}
        {/* TAB 1: VUE D'ENSEMBLE (OVERVIEW / KPIS)                           */}
        {/* ================================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="admin-welcome">
              <div>
                <p className="ui-eyebrow">Administration</p>
                <h1>Votre espace de travail</h1>
                <p className="ui-page-description">{conversations.filter((c) => c.status !== 'resolved').length} demandes à traiter · Vos contenus à portée de main.</p>
              </div>
              <div className="admin-quick-actions">
                <button type="button" className="ui-button-primary" onClick={() => setActiveTab('messages')}><ChatCircleDots size={18} /> Traiter les demandes</button>
                <button type="button" className="ui-button-secondary" onClick={() => { setActiveTab('catalog'); requestAnimationFrame(() => document.getElementById('course-name')?.focus()) }}><Plus size={17} /> Ajouter un cours</button>
                <button type="button" className="ui-button-secondary" onClick={() => setActiveTab('annales')}><UploadSimple size={17} /> Publier une annale</button>
              </div>
            </div>

            {/* Middle Section: Recent Messages & Fast Actions */}
            <div className="admin-priority-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Student Support Messages */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/90">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ChatCircleDots size={18} weight="fill" className="text-blue-600 dark:text-blue-400" />
                    <span>Demandes à traiter</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('messages')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Tous les messages ({conversations.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {[...conversations].sort((a, b) => Number(a.status === 'resolved') - Number(b.status === 'resolved') || Number(b.priority === 'high') - Number(a.priority === 'high') || Number(b.unread) - Number(a.unread)).slice(0, 3).map((c) => (
                    <button type="button"
                      key={c.id}
                      onClick={() => {
                        handleSelectConversation(c.id)
                        setActiveTab('messages')
                      }}
                      className="admin-request-row w-full text-left cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:border-blue-500/40 hover:bg-slate-100/80 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-300">{c.ticketId}</span>
                          <span className="rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 px-2 py-0.5 text-xs font-bold">
                            {c.studentStream} • {c.studentYear}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{c.subject}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Par {c.studentName} ({c.studentCenter})</p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                          c.status !== 'resolved'
                            ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        }`}
                      >
                        {c.status === 'resolved' ? 'Résolu' : c.status === 'pending' ? 'À traiter' : 'En cours'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <section className="ui-publication-summary">
                <div>
                  <p className="ui-eyebrow">Contenus pédagogiques</p>
                  <h2>Les annales en un regard</h2>
                  <dl>
                    <div><dt>Sujets publiés</dt><dd>{annalesList.filter((a) => a.status === 'PUBLISHED').length}</dd></div>
                    <div><dt>Avec un corrigé</dt><dd>{annalesList.filter((a) => a.officialSolutionPdf).length}</dd></div>
                    <div><dt>Concours représentés</dt><dd>{new Set(annalesList.map((a) => a.concoursId || 'cnc')).size}</dd></div>
                  </dl>
                </div>
                <button type="button" className="ui-button-secondary" onClick={() => setActiveTab('annales')}>Gérer les annales <ArrowRight size={16} /></button>
              </section>
            </div>

            {/* KPI Cards */}
            <div className="admin-kpis grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Étudiants', val: '1,428', sub: '+18 cette semaine', icon: GraduationCap, color: 'text-blue-600 dark:text-blue-400' },
                {
                  label: 'Messages',
                  val: `${conversations.length}`,
                  sub: `${conversations.filter((c) => c.status !== 'resolved').length} demandes à traiter`,
                  icon: ChatCircleDots,
                  color: 'text-cyan-600 dark:text-cyan-400',
                },
                { label: 'Exercices', val: '386', sub: 'Sur 4 matières', icon: Books, color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Questions QCM', val: '512', sub: 'Taux réussite moy. 67%', icon: Sparkle, color: 'text-amber-600 dark:text-amber-400' },
                {
                  label: 'Documents',
                  val: `${uploadedDocsList.length + 42}`,
                  sub: 'Cours, TD & Concours',
                  icon: FileText,
                  color: 'text-emerald-600 dark:text-emerald-400',
                },
              ].map((kpi, idx) => {
                const Icon = kpi.icon
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/90 transition-all hover:border-slate-300 dark:hover:border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</p>
                      <Icon size={20} weight="bold" className={kpi.color} />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{kpi.val}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{kpi.sub}</p>
                  </div>
                )
              })}
            </div>

          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: CATALOGUE DES COURS & TRAVAUX DIRIGÉS (TD)                */}
        {/* ================================================================ */}
        {activeTab === 'catalog' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Books size={22} weight="fill" className="text-blue-600 dark:text-blue-400" />
                  <span>Cours & travaux dirigés</span>
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Gestion centralisée des cours théoriques et fiches de TD par niveau d'études et discipline CPGE.
                </p>
              </div>
            </div>

            {/* STEP 1: SÉLECTION DE L'ANNÉE CPGE */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-[#0c1628]/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
                  <span>Niveau d’études</span>
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {catalogYear === 'sup' ? '1ère Année CPGE' : '2ème Année CPGE'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCatalogYear('sup')}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition cursor-pointer ${
                    catalogYear === 'sup'
                      ? 'border-blue-500 bg-blue-50/80 shadow-none ring-1 ring-blue-500 dark:bg-blue-600/15'
                      : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      <GraduationCap size={22} weight="bold" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">1ère Année — SUP</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Filières MPSI • PCSI • PTSI • TSI 1</p>
                    </div>
                  </div>
                  {catalogYear === 'sup' && <CheckCircle size={20} weight="fill" className="text-blue-600 dark:text-blue-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCatalogYear('spe')}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition cursor-pointer ${
                    catalogYear === 'spe'
                      ? 'border-blue-500 bg-blue-50/80 shadow-none ring-1 ring-blue-500 dark:bg-blue-600/15'
                      : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                      <GraduationCap size={22} weight="bold" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">2ème Année — SPÉ</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Filières MP • PSI • PC • TSI 2</p>
                    </div>
                  </div>
                  {catalogYear === 'spe' && <CheckCircle size={20} weight="fill" className="text-blue-600 dark:text-blue-400" />}
                </button>
              </div>
            </div>

            {/* STEP 2: SÉLECTION DE LA MATIÈRE */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-[#0c1628]/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
                  <span>Matière</span>
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {catalogCourses.filter((c) => c.year === catalogYear && c.subjectId === catalogSubjectId).length} cours enregistrés
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'maths' as const, name: 'Mathématiques', code: 'MATHS', desc: 'Algèbre, Analyse, Probabilités' },
                  { id: 'physique' as const, name: 'Physique & Chimie', code: 'PHYS', desc: 'EM, Thermodynamique, Ondes' },
                  { id: 'si' as const, name: 'Sciences Industrielles (SI)', code: 'SI', desc: 'Automatique, SLCI, Cinématique' },
                  { id: 'info' as const, name: 'Informatique & Algorithmique', code: 'INFO', desc: 'Algorithmes, Graphes, SQL' },
                ].map((sub) => {
                  const isSelected = catalogSubjectId === sub.id
                  const count = catalogCourses.filter((c) => c.year === catalogYear && c.subjectId === sub.id).length
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setCatalogSubjectId(sub.id)}
                      className={`text-left rounded-xl border p-4 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/90 shadow-none ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-600/15'
                          : 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{sub.code}</span>
                        <span className="rounded-full bg-slate-200/70 dark:bg-white/10 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          {count} cours
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{sub.name}</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{sub.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* STEP 3: AFFICHAGE DE L'EXISTANT */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-lg dark:border-white/10 dark:bg-[#0c1628]/90">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-200/80 pb-3 dark:border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</span>
                    <span>Cours disponibles</span>
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Niveau : {catalogYear.toUpperCase()} • Matière : {catalogSubjectId === 'maths' ? 'Mathématiques' : catalogSubjectId === 'physique' ? 'Physique & Chimie' : catalogSubjectId === 'si' ? 'Sciences Industrielles' : 'Informatique'}
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                  {catalogCourses.filter((c) => c.year === catalogYear && c.subjectId === catalogSubjectId).length} cours trouvé(s)
                </span>
              </div>

              {catalogCourses.filter((c) => c.year === catalogYear && c.subjectId === catalogSubjectId).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aucun cours enregistré pour cette combinaison. Utilisez le formulaire ci-dessous pour ajouter le premier cours.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table aria-label="Catalogue des cours" className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-slate-500 dark:border-white/10 dark:text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-2.5 px-3">Nom du Cours</th>
                        <th className="py-2.5 px-3">Document Cours (PDF)</th>
                        <th className="py-2.5 px-3">Document TD (PDF)</th>
                        <th className="py-2.5 px-3">Date d'Ajout</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 dark:divide-white/10">
                      {catalogCourses
                        .filter((c) => c.year === catalogYear && c.subjectId === catalogSubjectId)
                        .map((course) => (
                          <tr key={course.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition">
                            <td data-label="Nom du Cours" className="py-3 px-3 font-bold text-slate-900 dark:text-white max-w-xs">
                              {course.title}
                            </td>
                            <td data-label="Document Cours (PDF)" className="py-3 px-3">
                              {course.coursePdf ? (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
                                  <FilePdf size={14} weight="fill" className="text-rose-500 shrink-0" />
                                  <span className="truncate max-w-[170px]">{course.coursePdf}</span>
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Non renseigné</span>
                              )}
                            </td>
                            <td data-label="Document TD (PDF)" className="py-3 px-3">
                              {course.tdPdf ? (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                                  <FilePdf size={14} weight="fill" className="text-emerald-500 shrink-0" />
                                  <span className="truncate max-w-[170px]">{course.tdPdf}</span>
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Aucun TD rattaché</span>
                              )}
                            </td>
                            <td data-label="Date d'Ajout" className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                              {course.addedAt}
                            </td>
                            <td data-label="Actions" className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => notify(`Aperçu de démonstration — téléchargement des documents du cours : ${course.title}`)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                                  title="Télécharger / Consulter"
                                >
                                  <DownloadSimple size={15} weight="bold" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCatalogCourse(course.id)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                                  title="Supprimer ce cours"
                                >
                                  <Trash size={15} weight="bold" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* STEP 4: AJOUT ET UPLOAD SÉPARÉ */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/90">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-white/10">
                <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">4</span>
                <span>Ajouter un cours</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                Saisissez l'intitulé officiel du cours puis déposez séparément les documents de Cours magistral (PDF) et de Travaux Dirigés (PDF).
              </p>

              <form noValidate onSubmit={handleAddCatalogCourse} className="space-y-5">
                <fieldset className="ui-form-section"><legend>Informations</legend>

                {/* Nom du cours */}
                <div>
                  <label htmlFor="course-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nom du cours <span className="text-blue-500">*</span>
                  </label>
                  <input id="course-name" aria-invalid={!!formErrors['course-name']} aria-describedby={formErrors['course-name'] ? 'course-name-error' : undefined}
                    type="text"
                    required
                    value={newCourseName}
                    onChange={(e) => { setNewCourseName(e.target.value); clearError('course-name') }}
                    placeholder="Ex: Espaces Préhilbertiens et Théorème Spectral"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-[#070b14] dark:text-white"
                  />
                  {formErrors['course-name'] && <p id="course-name-error" className="ui-field-error" role="alert">{formErrors['course-name']}</p>}
                </div>

                </fieldset>
                <fieldset className="ui-form-section"><legend>Documents</legend>
                {/* 2 Zones d'Upload Séparées : Cours (PDF) & TD (PDF) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Zone Upload 1: Cours (PDF) */}
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center dark:border-slate-700 dark:bg-white/[0.02]">
                    <FilePdf size={28} weight="duotone" className="mx-auto text-blue-500 dark:text-blue-400" />
                    <p className="mt-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      1. Document de Cours (PDF) <span className="text-blue-500">*</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {newCoursePdf || 'Planche de cours théorique (.pdf)'}
                    </p>
                    <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-500/20 dark:bg-blue-600/20 dark:text-blue-300 dark:hover:bg-blue-600/30 transition">
                      <UploadSimple size={14} weight="bold" className="mr-1.5" />
                      <span>{newCoursePdf ? 'Remplacer le Cours' : 'Parcourir le Cours'}</span>
                      <input id="course-pdf" aria-invalid={!!formErrors['course-pdf']} aria-describedby={formErrors['course-pdf'] ? 'course-pdf-error' : undefined}
                        type="file"
                        accept=".pdf"
                        className="sr-only"
                        onChange={(e) => { setNewCoursePdf(e.target.files?.[0]?.name || ''); clearError('course-pdf') }}
                      />
                    </label>
                    {formErrors['course-pdf'] && <p id="course-pdf-error" className="ui-field-error" role="alert">{formErrors['course-pdf']}</p>}
                  </div>

                  {/* Zone Upload 2: TD (PDF) */}
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center dark:border-slate-700 dark:bg-white/[0.02]">
                    <FilePdf size={28} weight="duotone" className="mx-auto text-emerald-500 dark:text-emerald-400" />
                    <p className="mt-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      2. Document de TD (PDF)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {newTdPdf || 'Planche d’exercices / énoncés de TD (.pdf)'}
                    </p>
                    <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-600/20 dark:text-emerald-300 dark:hover:bg-emerald-600/30 transition">
                      <UploadSimple size={14} weight="bold" className="mr-1.5" />
                      <span>{newTdPdf ? 'Remplacer le TD' : 'Parcourir le TD'}</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="sr-only"
                        onChange={(e) => setNewTdPdf(e.target.files?.[0]?.name || '')}
                      />
                    </label>
                  </div>
                </div>

                </fieldset>
                <div className="ui-form-actions"><span className="ui-form-hint">Publication dans le catalogue de démonstration</span>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 cursor-pointer"
                  >
                    <Plus size={15} weight="bold" />
                    <span>Publier le cours</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: MODULE B — PUBLICATION ANNALES CONCOURS                   */}
        {/* ================================================================ */}
        {activeTab === 'annales' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scroll size={20} weight="fill" className="text-blue-600 dark:text-blue-400" />
                  <span>Publication des Annales & Problèmes Officiels</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dépôt, indexation et gestion des sujets et corrigés officiels des concours CPGE.
                </p>
              </div>
            </div>

            {/* SÉLECTEUR DES 5 CONCOURS */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-[#0c1628]/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Sélectionnez le Type de Concours (5 Concours Officiels)
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">
                  Concours actif : {selectedAdminConcours.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { id: 'cnc' as const, name: 'CNC (Maroc)', tag: 'Concours Maroc', flag: 'MA' },
                  { id: 'mines' as const, name: 'Mines-Ponts', tag: 'Grandes Écoles', flag: 'FR' },
                  { id: 'centrale' as const, name: 'Centrale-Supélec', tag: 'Groupe Centrale', flag: 'FR' },
                  { id: 'ccinp' as const, name: 'CCINP', tag: 'Polytech & INP', flag: 'FR' },
                  { id: 'x-ens' as const, name: 'Polytechnique / ENS', tag: 'Élite Recherche', flag: 'FR' },
                ].map((c) => {
                  const isSelected = selectedAdminConcours === c.id
                  const count = annalesList.filter((a) => (a.concoursId || 'cnc') === c.id).length
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedAdminConcours(c.id)}
                      className={`text-left rounded-xl border p-3.5 transition cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/90 shadow-none ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-600/15'
                          : 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{c.flag}</span>
                        <span className="text-xs font-bold rounded bg-slate-200/70 dark:bg-white/10 px-1.5 py-0.5 text-slate-700 dark:text-slate-300">
                          {count}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{c.tag}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Publication Form */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/90">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-white/10">
                <Plus size={16} weight="bold" className="text-blue-600 dark:text-blue-400" />
                <span>Publier un nouveau sujet de concours — {selectedAdminConcours.toUpperCase()}</span>
              </h3>

              <form noValidate onSubmit={handlePublishAnnale} className="space-y-4">
                <fieldset className="ui-form-section"><legend>Informations</legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Année */}
                  <div>
                    <label htmlFor="annale-year" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Session / Année <span className="text-blue-500">*</span>
                    </label>
                    <select id="annale-year"
                      value={newAnnaleYear}
                      onChange={(e) => setNewAnnaleYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-[#070b14] dark:text-white"
                    >
                      {Array.from({ length: 17 }).map((_, idx) => {
                        const yr = 2026 - idx
                        return (
                          <option key={yr} value={yr}>
                            Session {yr}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  {/* Filière */}
                  <div>
                    <label htmlFor="annale-stream" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Filière CPGE <span className="text-blue-500">*</span>
                    </label>
                    <select id="annale-stream"
                      value={newAnnaleStream}
                      onChange={(e) => setNewAnnaleStream(e.target.value as 'MP' | 'PSI' | 'TSI')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-[#070b14] dark:text-white"
                    >
                      <option value="MP">MP (Maths-Physique)</option>
                      <option value="PSI">PSI (Physique & SI)</option>
                      <option value="TSI">TSI (Techno & SI)</option>
                    </select>
                  </div>

                  {/* Matière */}
                  <div>
                    <label htmlFor="annale-subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Épreuve / Matière <span className="text-blue-500">*</span>
                    </label>
                    <input id="annale-subject" aria-invalid={!!formErrors['annale-subject']} aria-describedby={formErrors['annale-subject'] ? 'annale-subject-error' : undefined}
                      type="text"
                      required
                      value={newAnnaleSubject}
                      onChange={(e) => { setNewAnnaleSubject(e.target.value); clearError('annale-subject') }}
                      placeholder="Ex: Mathématiques I"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-[#070b14] dark:text-white"
                    />
                  {formErrors['annale-subject'] && <p id="annale-subject-error" className="ui-field-error" role="alert">{formErrors['annale-subject']}</p>}
                  </div>

                  {/* Durée */}
                  <div>
                    <label htmlFor="annale-duration" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Durée de l’épreuve <span className="text-blue-500">*</span>
                    </label>
                    <select id="annale-duration"
                      value={newAnnaleDuration}
                      onChange={(e) => setNewAnnaleDuration(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-[#070b14] dark:text-white"
                    >
                      <option value="4h">4 heures (Épreuve principale)</option>
                      <option value="3h">3 heures (Épreuve courte)</option>
                    </select>
                  </div>
                </div>

                </fieldset>
                <fieldset className="ui-form-section"><legend>Documents</legend>
                {/* 2 Zones d'Upload Uniquement : 1. Énoncé Officiel (Obligatoire) & 2. Corrigé Détaillé (Optionnel) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* 1. Énoncé Officiel PDF */}
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center dark:border-slate-700 dark:bg-white/[0.02]">
                    <FilePdf size={26} weight="duotone" className="mx-auto text-blue-500 dark:text-blue-400" />
                    <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                      1. Énoncé Officiel PDF <span className="text-blue-500">*</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {uploadedStatement || 'Sélectionner le sujet officiel (.pdf)'}
                    </p>
                    <label className="mt-2.5 inline-flex cursor-pointer rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-500/20 dark:bg-blue-600/20 dark:text-blue-300 dark:hover:bg-blue-600/30 transition">
                      <span>{uploadedStatement ? 'Remplacer l’énoncé' : 'Parcourir l’énoncé'}</span>
                      <input id="annale-pdf" aria-invalid={!!formErrors['annale-pdf']} aria-describedby={formErrors['annale-pdf'] ? 'annale-pdf-error' : undefined}
                        type="file"
                        accept=".pdf"
                        className="sr-only"
                        onChange={(e) => { setUploadedStatement(e.target.files?.[0]?.name || ''); clearError('annale-pdf') }}
                      />
                    </label>
                    {formErrors['annale-pdf'] && <p id="annale-pdf-error" className="ui-field-error" role="alert">{formErrors['annale-pdf']}</p>}
                  </div>

                  {/* 2. Corrigé Détaillé PDF (Optionnel) */}
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center dark:border-slate-700 dark:bg-white/[0.02]">
                    <FilePdf size={26} weight="duotone" className="mx-auto text-emerald-500 dark:text-emerald-400" />
                    <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                      2. Corrigé Détaillé PDF <span className="text-xs font-normal text-slate-400">(Optionnel)</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {uploadedSolution || 'Corrigé officiel ou rédigé (.pdf)'}
                    </p>
                    <label className="mt-2.5 inline-flex cursor-pointer rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-600/20 dark:text-emerald-300 dark:hover:bg-emerald-600/30 transition">
                      <span>{uploadedSolution ? 'Remplacer le corrigé' : 'Parcourir le corrigé'}</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="sr-only"
                        onChange={(e) => setUploadedSolution(e.target.files?.[0]?.name || '')}
                      />
                    </label>
                  </div>
                </div>

                </fieldset>
                <div className="ui-form-actions"><span className="ui-form-hint">Publication dans le catalogue de démonstration</span>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 cursor-pointer"
                  >
                    <UploadSimple size={15} weight="bold" />
                    <span>Publier l’Annale dans le Catalogue</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Published Annales Table */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/90">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Annales Publiées sur la Plateforme — {selectedAdminConcours.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sujets et solutions indexés pour ce concours
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Filtrer par filière :</span>
                  {['ALL', 'MP', 'PSI', 'TSI'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAnnaleFilterStream(st)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                        annaleFilterStream === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table aria-label="Liste des contenus" className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-slate-500 dark:border-white/10 dark:text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-2.5 px-3">Session</th>
                      <th className="py-2.5 px-3">Filière</th>
                      <th className="py-2.5 px-3">Épreuve</th>
                      <th className="py-2.5 px-3">Durée</th>
                      <th className="py-2.5 px-3">Documents Rattachés</th>
                      <th className="py-2.5 px-3">Téléchargements</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-white/10">
                    {annalesList
                      .filter(
                        (a) =>
                          (a.concoursId || 'cnc') === selectedAdminConcours &&
                          (annaleFilterStream === 'ALL' || a.stream === annaleFilterStream)
                      )
                      .map((ann) => (
                        <tr key={ann.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition">
                          <td data-label="Session" className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                            {selectedAdminConcours.toUpperCase()} {ann.year}
                          </td>
                          <td data-label="Filière" className="py-3 px-3">
                            <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-300">
                              {ann.stream}
                            </span>
                          </td>
                          <td data-label="Épreuve" className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{ann.subject}</td>
                          <td data-label="Durée" className="py-3 px-3 text-slate-500 dark:text-slate-400">{ann.duration}</td>
                          <td data-label="Documents Rattachés" className="py-3 px-3">
                            <div className="flex items-center gap-1.5 text-xs">
                              {ann.statementPdf && (
                                <a
                                  href={ann.statementPdf.startsWith('/') ? ann.statementPdf : undefined}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 px-1.5 py-0.5 font-semibold"
                                >
                                  Énoncé
                                </a>
                              )}
                              {ann.officialSolutionPdf ? (
                                <a
                                  href={ann.officialSolutionPdf.startsWith('/') ? ann.officialSolutionPdf : undefined}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 px-1.5 py-0.5 font-semibold"
                                >
                                  Corrigé
                                </a>
                              ) : (
                                <span className="rounded bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 text-xs">
                                  Sans corrigé
                                </span>
                              )}
                            </div>
                          </td>
                          <td data-label="Téléchargements" className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">{ann.downloadsCount} dl</td>
                          <td data-label="Actions" className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => ann.statementPdf.startsWith('/') ? window.open(ann.statementPdf, '_blank') : notify(`Aperçu de démonstration — téléchargement de l'énoncé${ann.officialSolutionPdf ? ' et du corrigé' : ''} ${selectedAdminConcours.toUpperCase()} ${ann.year} (${ann.stream})`)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                              title="Télécharger l'annale"
                            >
                              <DownloadSimple size={16} weight="bold" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {annalesList.filter((a) => (a.concoursId || 'cnc') === selectedAdminConcours).length === 0 && (
                      <tr>
                        <td data-label="Session" colSpan={7} className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                          Aucune annale publiée pour ce concours pour l'instant. Utilisez le formulaire ci-dessus pour publier le premier sujet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: MODULE C — GESTION DE LA BANQUE DE QCM (Projet 15)        */}
        {/* ================================================================ */}
        {/* ================================================================ */}
        {/* TAB 4: MODULE C — GESTION DE LA BANQUE DE QCM (Projet 15)        */}
        {/* ================================================================ */}
        {activeTab === 'qcm' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkle size={20} weight="fill" className="text-amber-500 dark:text-amber-400" />
                  <span>Banque de QCM</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Création de questions de test rapide avec temps cible, 4 choix avec analyse détaillée des distracteurs.
                </p>
              </div>
            </div>

            {/* QCM Creation Form */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/90">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200/80 pb-3 dark:border-white/10 flex items-center gap-2">
                <Plus size={16} weight="bold" className="text-amber-500 dark:text-amber-400" />
                <span>Créer une question de QCM Adaptatif</span>
              </h3>

              <form onSubmit={handleCreateQcm} className="space-y-5">
                {/* Statement Input & Live Math Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Énoncé de la question (Code LaTeX) <span className="text-blue-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={qcmStatement}
                      onChange={(e) => setQcmStatement(e.target.value)}
                      placeholder="Tapez l'énoncé mathématique ici..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-mono text-slate-900 outline-none focus:border-amber-500 focus:bg-white dark:border-white/10 dark:bg-[#070b14] dark:text-white dark:focus:border-amber-400"
                    />
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-50/40 p-4 dark:border-amber-500/20 dark:bg-white/[0.02]">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                      <Eye size={14} weight="bold" />
                      <span>Prévisualisation KaTeX de la question</span>
                    </span>
                    <div className="min-h-[60px] text-slate-900 dark:text-slate-100 text-xs sm:text-sm py-2">
                      <MathFormula math={qcmStatement} block />
                    </div>
                  </div>
                </div>

                {/* Difficulty & Target Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Niveau de difficulté (1 à 4)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setQcmDifficulty(lvl)}
                          className={`flex-1 rounded-xl border py-2 text-xs font-bold transition cursor-pointer ${
                            qcmDifficulty === lvl
                              ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:border-amber-400 dark:bg-amber-500/20 dark:text-amber-300 ring-1 ring-amber-500/30'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                          }`}
                        >
                          Niveau {lvl}/4
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Temps cible en secondes (Chronomètre)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={30}
                        max={300}
                        step={15}
                        value={qcmTargetTime}
                        onChange={(e) => setQcmTargetTime(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-amber-500 focus:bg-white dark:border-white/10 dark:bg-[#070b14] dark:text-white font-mono"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        secondes ({Math.floor(qcmTargetTime / 60)}m {qcmTargetTime % 60}s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Choices: A, B, C, D with Distractor Analysis */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    4 Choix de réponses & Analyse des distracteurs <span className="text-blue-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {qcmChoices.map((c, idx) => (
                      <div
                        key={c.id}
                        className={`rounded-xl border p-3.5 transition ${
                          c.isCorrect
                            ? 'border-emerald-500/40 bg-emerald-50/50 dark:border-emerald-500/50 dark:bg-emerald-500/10'
                            : 'border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                            <input
                              type="radio"
                              name="qcm-correct"
                              checked={c.isCorrect}
                              onChange={() => {
                                setQcmChoices((prev) =>
                                  prev.map((item, i) => ({
                                    ...item,
                                    isCorrect: i === idx,
                                  }))
                                )
                              }}
                              className="size-4 accent-emerald-500 cursor-pointer"
                            />
                            <span
                              className={`rounded-md px-2 py-0.5 font-mono text-xs ${
                                c.isCorrect
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white'
                              }`}
                            >
                              Choix {c.label}
                            </span>
                            {c.isCorrect && (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                (Bonne Réponse)
                              </span>
                            )}
                          </label>

                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              value={c.latex}
                              onChange={(e) => {
                                const val = e.target.value
                                setQcmChoices((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, latex: val } : item))
                                )
                              }}
                              placeholder="Formule LaTeX du choix..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#070b14] dark:text-white dark:focus:border-blue-400"
                            />
                          </div>
                        </div>

                        {/* Commentaire sur le distracteur */}
                        <div className="mt-2 pl-6">
                          <input
                            type="text"
                            value={c.distractorComment}
                            onChange={(e) => {
                              const val = e.target.value
                              setQcmChoices((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, distractorComment: val } : item
                                )
                              )}
                            }
                            placeholder="Commentaire pédagogique sur ce distracteur (piège classique du CNC)..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-100/70 px-3 py-1 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-[#050810] dark:text-slate-300 dark:placeholder-slate-500 dark:focus:border-slate-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explication globale */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Explication KaTeX détaillée de la solution
                  </label>
                  <textarea
                    rows={2}
                    value={qcmExplanation}
                    onChange={(e) => setQcmExplanation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-mono text-slate-900 outline-none focus:border-amber-500 focus:bg-white dark:border-white/10 dark:bg-[#070b14] dark:text-white dark:focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 cursor-pointer"
                  >
                    <Plus size={15} weight="bold" />
                    <span>Ajouter à la Banque de QCM Adaptatif</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Questions Pool List */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/90">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Questions Actives dans la Banque ({qcmList.length})
              </h3>

              <div className="space-y-3">
                {qcmList.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition hover:border-amber-500/40 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-amber-500/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-300">{q.id}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300">{q.lessonTitle}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono">{q.targetTimeSeconds}s</span>
                        <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          Niveau {q.difficulty}/4
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 text-slate-900 dark:text-slate-100">
                      <MathFormula math={q.statementLatex} block />
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.choices.map((c) => (
                        <div
                          key={c.id}
                          className={`rounded-lg px-2.5 py-1.5 flex items-start gap-2 ${
                            c.isCorrect
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'bg-white border border-slate-200/70 text-slate-700 dark:bg-white/[0.04] dark:border-white/5 dark:text-slate-300'
                          }`}
                        >
                          <span className="font-mono font-bold">{c.label}.</span>
                          <div className="min-w-0">
                            <MathFormula math={c.latex} />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.distractorComment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL : UPLOAD DE DOCUMENTS (COURS, TD, CONCOURS)                  */}
      {/* ------------------------------------------------------------------ */}
      {showUploadModal && (
        <dialog ref={uploadDialogRef} className="ui-upload-dialog" aria-labelledby="upload-dialog-title" onCancel={() => setShowUploadModal(false)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0e192e] dark:text-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#3978F6]/15 text-[#3978F6]">
                  <UploadSimple size={22} weight="bold" />
                </div>
                <div>
                  <h3 id="upload-dialog-title" className="text-base font-bold text-slate-900 dark:text-white">
                    Ajouter un document
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Spécifiez le type exact (Cours, TD ou Concours) et rattachez vos fichiers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fermer la fenêtre" onClick={() => setShowUploadModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form noValidate onSubmit={handleUploadDocumentSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-thin">
              {/* Type Selection Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  1. Type de Document <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'COURS' as const,
                      label: 'Cours & Synthèses',
                      desc: 'Polycopiés, fiches de synthèse, cours magistraux',
                      icon: Books,
                      activeColor: 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400',
                    },
                    {
                      id: 'TD' as const,
                      label: 'Travaux Dirigés (TD)',
                      desc: 'Feuilles d’exercices, TD encadrés, devoirs',
                      icon: FileText,
                      activeColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    },
                    {
                      id: 'CONCOURS' as const,
                      label: 'Concours & Annales',
                      desc: 'Épreuves officielles, corrigés, rapports',
                      icon: Scroll,
                      activeColor: 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400',
                    },
                  ].map((item) => {
                    const isSelected = docType === item.id
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDocType(item.id)}
                        className={`flex flex-col items-center justify-center p-3 text-center rounded-2xl border-2 transition cursor-pointer ${
                          isSelected
                            ? item.activeColor
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <Icon size={22} weight={isSelected ? 'fill' : 'bold'} className="mb-1.5" />
                        <span className="text-xs font-bold">{item.label}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {item.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Document Title */}
              <div>
                <label htmlFor="document-title" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Titre officiel du Document <span className="text-rose-500">*</span>
                </label>
                <input id="document-title" aria-invalid={!!formErrors['document-title']} aria-describedby={formErrors['document-title'] ? 'document-title-error' : undefined}
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => { setDocTitle(e.target.value); clearError('document-title') }}
                  placeholder="Ex : TD 05 — Réduction de Jordan et endomorphismes nilpotents"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#3978F6] focus:outline-none focus:ring-1 focus:ring-[#3978F6] dark:border-white/15 dark:bg-black/30 dark:text-white dark:placeholder-slate-500"
                />
                  {formErrors['document-title'] && <p id="document-title-error" className="ui-field-error" role="alert">{formErrors['document-title']}</p>}
              </div>

              {/* Metadata row: Matière, Niveau, Filière */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="document-subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Matière / Module
                  </label>
                  <select id="document-subject"
                    value={docSubject}
                    onChange={(e) => setDocSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-white/15 dark:bg-[#070b14] dark:text-white"
                  >
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique & Chimie">Physique & Chimie</option>
                    <option value="Sciences Industrielles (SII)">Sciences Industrielles (SII)</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Français & Philosophie">Français & Philosophie</option>
                    <option value="Anglais">Anglais</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="document-level" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Niveau / Session
                  </label>
                  <select id="document-level"
                    value={docLevel}
                    onChange={(e) => setDocLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-white/15 dark:bg-[#070b14] dark:text-white"
                  >
                    <option value="Spé (2e année)">Spé (2e année)</option>
                    <option value="Sup (1re année)">Sup (1re année)</option>
                    <option value="Session Concours 2026">Session Concours 2026</option>
                    <option value="Session Concours 2025">Session Concours 2025</option>
                    <option value="Session Concours 2024">Session Concours 2024</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="document-stream" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Filière
                  </label>
                  <select id="document-stream"
                    value={docStream}
                    onChange={(e) => setDocStream(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-white/15 dark:bg-[#070b14] dark:text-white"
                  >
                    <option value="Toutes filières">Toutes filières</option>
                    <option value="MP">MP</option>
                    <option value="PSI">PSI</option>
                    <option value="PC">PC</option>
                    <option value="TSI">TSI</option>
                  </select>
                </div>
              </div>

              {/* File Attachment Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fichier source (PDF, ZIP, LaTeX)
                </label>
                <label className="ui-upload-zone flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-white/15 dark:bg-black/20 cursor-pointer">
                  <input type="file" accept=".pdf,.zip,.tex" className="sr-only" aria-label="Sélectionner le fichier du document" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) { setDocFileName(file.name); setDocFileSize(`${(file.size / 1024 / 1024).toFixed(1)} Mo`) }
                  }} />
                  <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/15 text-[#3978F6] mb-2">
                    <FilePdf size={24} weight="fill" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {docFileName ? docFileName : 'Choisir un fichier'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Formats acceptés : PDF officiel, archive .ZIP, scripts LaTeX (.tex)
                  </p>
                  {docFileName && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Check size={12} weight="bold" /> Fichier prêt ({docFileSize})
                    </span>
                  )}
                </label>
              </div>

              {/* Previously Uploaded Documents List */}
              <div className="border-t border-slate-200 dark:border-white/10 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
                  Documents Récemment Ajoutés ({uploadedDocsList.length}) :
                </span>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {uploadedDocsList.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-xs font-bold uppercase ${
                            doc.type === 'COURS'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : doc.type === 'TD'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {doc.type}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {doc.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
                        <span>{doc.fileSize}</span>
                        <button
                          type="button"
                          onClick={() => setPendingRemoval({ id: doc.id, title: doc.title, kind: 'document' })}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Supprimer ce document"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3978F6] to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  <CheckCircle size={15} weight="bold" />
                  <span>Ajouter le document</span>
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Document Preview Modal */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#0c1628] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/10 text-[#3978F6] dark:bg-blue-500/20">
                  {previewDocModal.type === 'pdf' ? (
                    <FilePdf size={26} weight="fill" className="text-rose-500" />
                  ) : previewDocModal.type === 'code' ? (
                    <FileCode size={26} weight="fill" className="text-emerald-500" />
                  ) : (
                    <ImageIcon size={26} weight="fill" className="text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                      {previewDocModal.name}
                    </h3>
                    <span className="rounded-md bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-300">
                      {previewDocModal.type === 'pdf' ? 'Document Numérisé PDF' : previewDocModal.type === 'code' ? 'Code Source R/CPGE' : 'Schéma Graphique'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Taille : {previewDocModal.size} • Certifié conforme aux normes CPGE CNC
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => notify(`Aperçu de démonstration — téléchargement de : ${previewDocModal.name}`)}
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
                  title="Télécharger le document"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>Télécharger</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
                  title="Fermer la prévisualisation"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
            </div>

            {/* Document Body View */}
            <div className="my-4 flex-1 overflow-y-auto pr-1 scrollbar-thin">
              {previewDocModal.type === 'pdf' ? (
                /* Educational Reference Document */
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 text-slate-800 shadow-sm dark:border-white/10 dark:bg-[#101b33] dark:text-slate-100 font-sans">
                  {/* Official Header */}
                  <div className="border-b-2 border-slate-200 pb-4 dark:border-white/20 text-center font-sans">
                    <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                      Nexora CPGE • Plateforme Pédagogique &amp; Scientifique
                    </p>
                    <h2 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      NOTE MÉTHODOLOGIQUE &amp; SUPPORT PÉDAGOGIQUE
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>Module : Mathématiques &amp; Modélisation</span>
                      <span>•</span>
                      <span>Filière : CPGE MP / PSI</span>
                      <span>•</span>
                      <span>Document de référence pédagogique</span>
                    </div>
                  </div>

                  {/* Document Content */}
                  <div className="mt-6 space-y-5 text-sm sm:text-base leading-relaxed">
                    <p className="font-bold text-blue-700 dark:text-blue-300">
                      Fiche — Démonstration de non-fuite d&apos;information (Data Leakage) dans le partitionnement K-Fold
                    </p>

                    <p>
                      Soit un ensemble d&apos;apprentissage global <MathFormula math="D = \{(x_i, y_i)\}_{i=1}^N" /> partitionné en <MathFormula math="K=5" /> plis disjoints <MathFormula math="D_1, \dots, D_K" />. Pour un pli de validation fixé <MathFormula math="k \in \{1,\dots, K\}" />, nous définissons les indices d&apos;entraînement <MathFormula math="I_{\text{train}}^{(k)} = D \setminus D_k" /> et de validation <MathFormula math="I_{\text{val}}^{(k)} = D_k" />.
                    </p>

                    {/* KaTeX Math Step 1 */}
                    <div className="my-4 rounded-2xl bg-blue-50/60 p-4 border border-blue-200 dark:bg-black/40 dark:border-blue-400/20 font-sans">
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">
                        Étape 1 : Estimation des moments empiriques restreinte au pli d&apos;entraînement
                      </p>
                      <MathFormula
                        math="\hat{\mu}_{\text{train}} = \frac{1}{|I_{\text{train}}^{(k)}|} \sum_{i \in I_{\text{train}}^{(k)}} x_i, \quad \hat{\sigma}_{\text{train}}^2 = \frac{1}{|I_{\text{train}}^{(k)}| - 1} \sum_{i \in I_{\text{train}}^{(k)}} (x_i - \hat{\mu}_{\text{train}})^2"
                        block
                      />
                    </div>

                    <p>
                      La transformation de centrage et réduction appliquée aux observations du pli de validation <MathFormula math="x_j \in I_{\text{val}}^{(k)}" /> s&apos;écrit rigoureusement :
                    </p>

                    {/* KaTeX Math Step 2 */}
                    <div className="my-4 rounded-2xl bg-blue-50/60 p-4 border border-blue-200 dark:bg-black/40 dark:border-blue-400/20 font-sans">
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">
                        Étape 2 : Standardisation sans injection des paramètres du pli de test
                      </p>
                      <MathFormula
                        math="z_j = \frac{x_j - \hat{\mu}_{\text{train}}}{\hat{\sigma}_{\text{train}}}, \quad \forall j \in I_{\text{val}}^{(k)}"
                        block
                      />
                    </div>

                    <p>
                      Puisque <MathFormula math="(\hat{\mu}_{\text{train}}, \hat{\sigma}_{\text{train}})" /> sont des fonctions mesurables définies uniquement sur <MathFormula math="\sigma(I_{\text{train}}^{(k)})" />, la distribution conditionnelle <MathFormula math="\mathcal{L}(z_j \mid I_{\text{train}}^{(k)})" /> ne dépend d&apos;aucun paramètre global pré-calculé. Il y a donc <strong>absence absolue de data leakage</strong>.
                    </p>
                  </div>

                  {/* Pedagogical Reference Footer */}
                  <div className="mt-8 border-t-2 border-slate-200 dark:border-white/10 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Validation Pédagogique :
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Document conforme aux exigences et standards des concours scientifiques CPGE.
                      </p>
                    </div>
                    <div className="rounded-xl bg-blue-500/15 border border-blue-500/30 px-3 py-1.5 text-blue-600 dark:text-blue-300 font-bold text-xs">
                      Nexora CPGE
                    </div>
                  </div>
                </div>
              ) : previewDocModal.type === 'code' ? (
                /* Simulated R Code Editor */
                <div className="rounded-2xl border border-slate-800 bg-[#0d1117] text-slate-200 p-5 font-mono text-xs shadow-inner">
                  {/* Editor Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-rose-500 inline-block" />
                      <span className="size-3 rounded-full bg-amber-500 inline-block" />
                      <span className="size-3 rounded-full bg-emerald-500 inline-block" />
                      <span className="ml-2 font-bold text-slate-400">{previewDocModal.name}</span>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      R version 4.3.2 (CPGE CNC Kernel)
                    </span>
                  </div>

                  {/* Code Lines */}
                  <div className="space-y-1 leading-relaxed overflow-x-auto">
                    <p className="text-slate-500"># ==============================================================================</p>
                    <p className="text-slate-500"># CAPSTONE CNC 2026 : PIPELINE MODÉLISATION CHURN SANS DATA LEAKAGE</p>
                    <p className="text-slate-500"># Auteur : Achraf Lemrani (Filière MP) — Superviseur : Dr. Karim Mansouri</p>
                    <p className="text-slate-500"># ==============================================================================</p>
                    <p><span className="text-purple-400">library</span>(tidyverse)</p>
                    <p><span className="text-purple-400">library</span>(caret)</p>
                    <p><span className="text-purple-400">library</span>(pROC)</p>
                    <br />
                    <p className="text-slate-500"># 1. Chargement et vérification des dimensions du dataset CPGE</p>
                    <p>telco_df &lt;- <span className="text-blue-400">read.csv</span>(<span className="text-amber-300">&quot;telco_churn_clean.csv&quot;</span>, stringsAsFactors = <span className="text-orange-400">FALSE</span>)</p>
                    <p><span className="text-blue-400">set.seed</span>(<span className="text-orange-400">2026</span>)</p>
                    <br />
                    <p className="text-slate-500"># 2. Stratification K-Fold pour préserver le ratio Churner (85% / 15%)</p>
                    <p>folds &lt;- <span className="text-blue-400">createFolds</span>(telco_df$Churn, k = <span className="text-orange-400">5</span>, list = <span className="text-orange-400">TRUE</span>, returnTrain = <span className="text-orange-400">FALSE</span>)</p>
                    <p>auc_results &lt;- <span className="text-blue-400">c</span>()</p>
                    <br />
                    <p className="text-purple-400">for</p> (k <span className="text-purple-400">in</span> <span className="text-blue-400">seq_along</span>(folds)) &#123;
                    <p className="pl-4">val_idx   &lt;- folds[[k]]</p>
                    <p className="pl-4">train_set &lt;- telco_df[-val_idx, ]</p>
                    <p className="pl-4">val_set   &lt;- telco_df[val_idx, ]</p>
                    <br />
                    <p className="pl-4 text-emerald-400"># Standardisation stricte calibrée sur train_set uniquement</p>
                    <p className="pl-4">mu_tenure &lt;- <span className="text-blue-400">mean</span>(train_set$tenure, na.rm = <span className="text-orange-400">TRUE</span>)</p>
                    <p className="pl-4">sd_tenure &lt;- <span className="text-blue-400">sd</span>(train_set$tenure, na.rm = <span className="text-orange-400">TRUE</span>)</p>
                    <br />
                    <p className="pl-4">train_set$tenure_scaled &lt;- (train_set$tenure - mu_tenure) / sd_tenure</p>
                    <p className="pl-4">val_set$tenure_scaled   &lt;- (val_set$tenure - mu_tenure) / sd_tenure</p>
                    <br />
                    <p className="pl-4">fit_model &lt;- <span className="text-blue-400">glm</span>(Churn ~ tenure_scaled + MonthlyCharges, data = train_set, family = binomial)</p>
                    <p className="pl-4">preds     &lt;- <span className="text-blue-400">predict</span>(fit_model, newdata = val_set, type = <span className="text-amber-300">&quot;response&quot;</span>)</p>
                    <p className="pl-4">auc_results[k] &lt;- <span className="text-blue-400">as.numeric</span>(<span className="text-blue-400">auc</span>(<span className="text-blue-400">roc</span>(val_set$Churn, preds, quiet = <span className="text-orange-400">TRUE</span>)))</p>
                    <p>&#125;</p>
                    <br />
                    <p className="text-emerald-400"><span className="text-blue-400">cat</span>(<span className="text-amber-300">&quot;Validation croisée achevée. AUC moyen =&quot;</span>, <span className="text-blue-400">mean</span>(auc_results), <span className="text-amber-300">&quot;\n&quot;</span>)</p>
                  </div>

                  {/* Terminal Execution Output */}
                  <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-emerald-300">
                    <p className="font-bold flex items-center gap-1.5 text-xs">
                      <CheckCircle size={15} weight="fill" />
                      <span>Console Output R :</span>
                    </p>
                    <p className="mt-1 font-mono text-xs">
                      &gt; Validation croisée achevée. AUC moyen = 0.8427
                      <br />
                      &gt; [CPGE LINTER] : 0 data leakage, convergence en 4 itérations Newton-Raphson.
                    </p>
                  </div>
                </div>
              ) : (
                /* Simulated Physics Vector Diagram */
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-white/5">
                  <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm dark:bg-[#101b33] border border-slate-200 dark:border-white/10">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                      Schéma de Continuité à l&apos;Interface Métal / Vide — ARQS
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      Illustration de la relation de passage du champ magnétique avec nappe de courant <MathFormula math="\vec{j}_s" />
                    </p>

                    <div className="my-6 flex justify-center">
                      <div className="relative w-72 h-44 border-2 border-dashed border-blue-500/40 rounded-xl flex items-center justify-center bg-blue-50/50 dark:bg-blue-950/20">
                        <span className="absolute top-2 left-3 text-xs font-bold text-blue-600 dark:text-blue-400">Milieu 1 (Conducteur)</span>
                        <div className="w-full h-0.5 bg-blue-500" />
                        <span className="absolute bottom-2 left-3 text-xs font-bold text-slate-500">Milieu 2 (Vide)</span>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-xs font-bold text-rose-500 font-mono">
                            <MathFormula math="\vec{B}_2 - \vec{B}_1 = \mu_0 \, \vec{j}_s \wedge \vec{n}" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-black/30 p-3 rounded-xl">
                      <MathFormula math="\vec{B}_2 - \vec{B}_1 = \mu_0 \, \vec{j}_s \wedge \vec{n}_{1 \to 2}" block />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Visualisation Haute Résolution CPGE • Format vectoriel sécurisé
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    notify(`Aperçu de démonstration — téléchargement de : ${previewDocModal.name}`)
                    setPreviewDocModal(null)
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3978F6] to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  <DownloadSimple size={15} weight="bold" />
                  <span>Télécharger le Fichier Original</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedback}
      {pendingRemoval && (
        <ConfirmRemoval
          title={pendingRemoval.title}
          onCancel={() => setPendingRemoval(null)}
          onConfirm={() => {
            if (pendingRemoval.kind === 'course') setCatalogCourses((items) => items.filter((item) => item.id !== pendingRemoval.id))
            else setUploadedDocsList((items) => items.filter((item) => item.id !== pendingRemoval.id))
            setPendingRemoval(null)
            notify('Le contenu a été retiré de la liste.')
          }}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}
