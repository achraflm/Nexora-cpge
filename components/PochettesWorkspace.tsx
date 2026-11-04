'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder,
  FolderOpen,
  FolderPlus,
  FileText,
  FilePdf,
  Plus,
  DotsThree,
  ArrowLeft,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  Sparkle,
  DownloadSimple,
  UploadSimple,
  Paperclip,
  Trash,
  PencilSimple,
  Star,
  CaretRight,
  CaretDown,
  BookOpen,
  Calculator,
  Atom,
  Gear,
  Terminal,
  Trophy,
  Copy,
  Check,
  Eye,
  Lightning,
  Funnel,
  X,
  ShareNetwork,
} from '@phosphor-icons/react'
import { MathFormula } from '@/components/MathFormula'

// --------------------------------------------------------------------------
// TYPES & DATA STRUCTURES
// --------------------------------------------------------------------------

export type SubjectCategory = 'maths' | 'physique' | 'si' | 'info' | 'concours'

export type PageStatus = 'À réviser' | 'En cours' | 'Maîtrisé' | 'Validé CNC'

export interface AttachedPdfDoc {
  id: string
  name: string
  size: string
  type: 'énoncé' | 'corrigé' | 'rapport'
  year?: string
  concours?: string
  url?: string
}

export interface NotionPage {
  id: string
  folderId: string
  subfolderId: string
  title: string
  emoji: string
  subject: SubjectCategory
  subjectLabel: string
  status: PageStatus
  difficulty: 1 | 2 | 3 | 4
  targetConcours: string[]
  updatedAt: string
  callout?: string
  contentMarkdown: string
  latexFormulas: string[]
  attachedPdfs: AttachedPdfDoc[]
}

export interface SubFolder {
  id: string
  name: string
  icon?: string
}

export interface PochetteFolder {
  id: string
  title: string
  subtitle: string
  subject: SubjectCategory
  subjectLabel: string
  fileCountText: string
  accentColor: string
  gradient: string
  meshOrbs: string[]
  tag: string
  createdAt: string
  subfolders: SubFolder[]
}

// --------------------------------------------------------------------------
// INITIAL SEED DATA
// --------------------------------------------------------------------------

const INITIAL_POCHETTES: PochetteFolder[] = [
  {
    id: 'f-maths-reduc',
    title: 'TD — Réduction des Endomorphismes',
    subtitle: 'Polynôme minimal, sous-espaces stables & Dunford',
    subject: 'maths',
    subjectLabel: 'Mathématiques',
    fileCountText: '3 énoncés CNC • 5 corrigés',
    accentColor: '#6366f1',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #1e1b4b 100%)',
    meshOrbs: ['#818cf8', '#a855f7', '#4f46e5'],
    tag: 'MATH',
    createdAt: '18 Octobre 2026',
    subfolders: [
      { id: 'sub-m1', name: 'Cours & Théorèmes Clés' },
      { id: 'sub-m2', name: 'Exercices Incontournables CNC' },
      { id: 'sub-m3', name: 'Annales Récentes MP & PSI' },
    ],
  },
  {
    id: 'f-cnc-corriges',
    title: 'Corrigés & Rapports CNC',
    subtitle: 'Rapports de jury & méthodologie des épreuves officielles',
    subject: 'concours',
    subjectLabel: 'Concours CNC',
    fileCountText: '8 corrigés • 4 rapports CNC',
    accentColor: '#f59e0b',
    gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 35%, #b45309 70%, #292524 100%)',
    meshOrbs: ['#fbbf24', '#f97316', '#d97706'],
    tag: 'CNC',
    createdAt: '15 Octobre 2026',
    subfolders: [
      { id: 'sub-c1', name: 'Rapports de Jury 2022-2025' },
      { id: 'sub-c2', name: 'Barèmes & Conseils de Rédaction' },
      { id: 'sub-c3', name: 'Sujets Concours Blancs' },
    ],
  },
  {
    id: 'f-phys-ondes',
    title: 'Physique — Électromagnétisme & Ondes',
    subtitle: 'Équations de Maxwell, induction & guides d’ondes',
    subject: 'physique',
    subjectLabel: 'Physique & Chimie',
    fileCountText: '4 fiches KaTeX • 2 sujets Mines',
    accentColor: '#0284c7',
    gradient: 'linear-gradient(135deg, #082f49 0%, #0369a1 35%, #0284c7 70%, #0c4a6e 100%)',
    meshOrbs: ['#38bdf8', '#06b6d4', '#0284c7'],
    tag: 'PHYS',
    createdAt: '16 Octobre 2026',
    subfolders: [
      { id: 'sub-p1', name: 'Synthèse Maxwell & Énergie' },
      { id: 'sub-p2', name: 'Problèmes d’Induction & Bilans' },
      { id: 'sub-p3', name: 'Optique Ondulatoire' },
    ],
  },
  {
    id: 'f-info-graphes',
    title: 'Informatique — Graphes & Dijkstra',
    subtitle: 'Parcours BFS/DFS, plus courts chemins & programmation dynamique',
    subject: 'info',
    subjectLabel: 'Informatique',
    fileCountText: '6 scripts Python • 3 fiches',
    accentColor: '#10b981',
    gradient: 'linear-gradient(135deg, #022c22 0%, #065f46 35%, #059669 70%, #064e3b 100%)',
    meshOrbs: ['#34d399', '#10b981', '#059669'],
    tag: 'INFO',
    createdAt: '12 Octobre 2026',
    subfolders: [
      { id: 'sub-i1', name: 'Algorithmes de Graphes' },
      { id: 'sub-i2', name: 'Complexité & Optimisation' },
      { id: 'sub-i3', name: 'Bases de Données SQL' },
    ],
  },
  {
    id: 'f-si-automatique',
    title: 'SII — Asservissements & Réponses Fréquentielles',
    subtitle: 'Schémas blocs, diagrammes de Bode & marges de stabilité',
    subject: 'si',
    subjectLabel: 'Sciences Industrielles',
    fileCountText: '4 fiches • 2 TD CNC',
    accentColor: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #2e1065 0%, #581c87 35%, #7e22ce 70%, #3b0764 100%)',
    meshOrbs: ['#a855f7', '#c084fc', '#7c3aed'],
    tag: 'SII',
    createdAt: '10 Octobre 2026',
    subfolders: [
      { id: 'sub-s1', name: 'Critère du Revers & Marges' },
      { id: 'sub-s2', name: 'Correcteurs PID & Avance de Phase' },
      { id: 'sub-s3', name: 'Cinématique 3D & Torseurs' },
    ],
  },
  {
    id: 'f-elite-mines',
    title: 'Mines-Ponts & X-ENS — Sujets d’Élite',
    subtitle: 'Sélection d’épreuves pour la préparation aux concours parisiens',
    subject: 'concours',
    subjectLabel: 'Concours Communs',
    fileCountText: '6 énoncés • 3 corrigés types',
    accentColor: '#ec4899',
    gradient: 'linear-gradient(135deg, #500724 0%, #831843 35%, #be185d 70%, #700732 100%)',
    meshOrbs: ['#f472b6', '#fb7185', '#db2777'],
    tag: 'ÉLITE',
    createdAt: '08 Octobre 2026',
    subfolders: [
      { id: 'sub-e1', name: 'Maths 1 & 2 Mines-Ponts MP' },
      { id: 'sub-e2', name: 'Physique X-ENS Ulm' },
      { id: 'sub-e3', name: 'Questions Ouvertes & Oraux' },
    ],
  },
]

const INITIAL_PAGES: NotionPage[] = [
  {
    id: 'page-1',
    folderId: 'f-maths-reduc',
    subfolderId: 'sub-m1',
    title: 'Polynôme Minimal et Théorème de Cayley-Hamilton — Méthode CNC',
    emoji: 'M',
    subject: 'maths',
    subjectLabel: 'Mathématiques',
    status: 'Validé CNC',
    difficulty: 4,
    targetConcours: ['CNC MP/PSI', 'Mines-Ponts', 'Centrale'],
    updatedAt: '19 Octobre 2026',
    callout:
      'Astuce du Jury CNC : Si la question est formulée sous la forme « En déduire que... », ne recalculer jamais le polynôme caractéristique ! Utilisez directement le fait que le polynôme minimal divise tout polynôme annulateur non nul.',
    contentMarkdown: `### 1. Définition et Propriétés Fondamentales
Soit $E$ un $\\mathbb{K}$-espace vectoriel de dimension finie $n \\ge 1$, et $u \\in \\mathcal{L}(E)$.
L'idéal annulateur de $u$ est non trivial et engendré par un unique polynôme unitaire $\\pi_u(X)$ appelé **polynôme minimal** de $u$.

- $\\pi_u(X)$ est le polynôme unitaire de plus petit degré annulant $u$.
- Tout polynôme $P \\in \\mathbb{K}[X]$ annulant $u$ est un multiple de $\\pi_u(X)$ :
$$P(u) = 0 \\iff \\pi_u(X) \\mid P(X)$$

### 2. Théorème de Cayley-Hamilton
Le polynôme caractéristique $\\chi_u(X) = \\det(XI - u)$ est un polynôme annulateur pour $u$ :
$$\\chi_u(u) = 0_{\\mathcal{L}(E)}$$
Par conséquent, on a la relation de divisibilité canonique :
$$\\pi_u(X) \\mid \\chi_u(X)$$

### 3. Critère de Diagonalisabilité Absolu
Un endomorphisme $u$ est diagonalisable sur $\\mathbb{K}$ si et seulement si son polynôme minimal $\\pi_u(X)$ est **scindé à racines simples** sur $\\mathbb{K}$ :
$$\\pi_u(X) = \\prod_{k=1}^r (X - \\lambda_k) \\quad \\text{avec } \\lambda_i \\ne \\lambda_j$$`,
    latexFormulas: [
      '\\chi_u(X) = \\det(XI - u) = X^n - \\mathrm{Tr}(u) X^{n-1} + \\dots + (-1)^n \\det(u)',
      '\\pi_u(X) \\mid \\chi_u(X) \\quad \\text{et} \\quad \\mathrm{Sp}(u) = \\mathrm{Rac}(\\pi_u)',
      'E = \\bigoplus_{\\lambda \\in \\mathrm{Sp}(u)} \\ker(u - \\lambda \\mathrm{id}_E) \\iff \\pi_u \\text{ est scindé à racines simples}',
    ],
    attachedPdfs: [
      {
        id: 'pdf-cnc-2024-m1',
        name: 'CNC_2024_Maths1_MP_Enonce.pdf',
        size: '1.4 Mo',
        type: 'énoncé',
        year: '2024',
        concours: 'CNC',
      },
      {
        id: 'pdf-cnc-2024-rep',
        name: 'Rapport_Jury_CNC_2024_Maths.pdf',
        size: '850 Ko',
        type: 'rapport',
        year: '2024',
        concours: 'CNC',
      },
      {
        id: 'pdf-corr-cayley',
        name: 'Corrige_Officiel_Dunford_Cayley.pdf',
        size: '2.1 Mo',
        type: 'corrigé',
        year: '2024',
        concours: 'CNC',
      },
    ],
  },
  {
    id: 'page-2',
    folderId: 'f-maths-reduc',
    subfolderId: 'sub-m2',
    title: 'Décomposition de Dunford & Calcul des Puissances $A^k$',
    emoji: 'P',
    subject: 'maths',
    subjectLabel: 'Mathématiques',
    status: 'En cours',
    difficulty: 3,
    targetConcours: ['CNC MP', 'Centrale'],
    updatedAt: '17 Octobre 2026',
    callout:
      'Remarque Algèbre : La décomposition $A = D + N$ avec $DN = ND$ et $N^p = 0$ permet d’appliquer la formule du binôme de Newton pour calculer $A^k$ sans diagonalisation explicite si $\\chi_A$ est seulement scindé.',
    contentMarkdown: `### Méthode Pratique pour Calculer $A^k$ via Dunford
1. Vérifier que $\\chi_A(X)$ est scindé sur $\\mathbb{K}$.
2. Déterminer la matrice diagonale $D$ et nilpotente $N$ telles que :
$$A = D + N \\quad \\text{avec } DN = ND \\text{ et } N^p = 0 \\quad (p \\le n)$$
3. Appliquer le binôme de Newton pour tout $k \\ge p$ :
$$A^k = (D + N)^k = \\sum_{j=0}^{p-1} \\binom{k}{j} D^{k-j} N^j$$`,
    latexFormulas: [
      'A = D + N, \\quad DN = ND, \\quad N^{\\mathrm{deg}(\\pi)} = 0',
      'A^k = \\sum_{j=0}^{\\min(k, p-1)} \\binom{k}{j} D^{k-j} N^j',
    ],
    attachedPdfs: [
      {
        id: 'pdf-dunford-ex',
        name: 'TD_Dunford_Calcul_Puissances.pdf',
        size: '920 Ko',
        type: 'énoncé',
        year: '2025',
        concours: 'CNC',
      },
    ],
  },
  {
    id: 'page-3',
    folderId: 'f-phys-ondes',
    subfolderId: 'sub-p1',
    title: 'Équations de Maxwell & Propagation des Ondes Électromagnétiques (OEM)',
    emoji: 'PC',
    subject: 'physique',
    subjectLabel: 'Physique & Chimie',
    status: 'Validé CNC',
    difficulty: 4,
    targetConcours: ['CNC MP/PSI', 'Mines-Ponts'],
    updatedAt: '18 Octobre 2026',
    callout:
      'Rapport CNC Physique : N’oubliez jamais d’expliciter la symétrie du problème avant d’appliquer le théorème d’Ampère ou le théorème de Gauss. Le vecteur de Poynting $\\vec{\\Pi}$ est systématiquement demandé.',
    contentMarkdown: `### 1. Formulations Locales de Maxwell
Dans un milieu linéaire, homogène et isotrope :
$$\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}, \\quad \\nabla \\cdot \\vec{B} = 0$$
$$\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}, \\quad \\nabla \\times \\vec{B} = \\mu_0 \\vec{j} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}$$

### 2. Équation de D'Alembert dans le Vide
En l'absence de charges et de courants ($\\rho = 0$, $\\vec{j} = \\vec{0}$) :
$$\\Delta \\vec{E} - \\frac{1}{c^2} \\frac{\\partial^2 \\vec{E}}{\\partial t^2} = \\vec{0} \\quad \\text{avec } c = \\frac{1}{\\sqrt{\\varepsilon_0 \\mu_0}}$$

### 3. Bilan d'Énergie et Vecteur de Poynting
Le flux d'énergie électromagnétique à travers une surface fermée est régi par :
$$\\vec{\\Pi} = \\frac{\\vec{E} \\times \\vec{B}}{\\mu_0}, \\quad \\frac{\\partial u_{em}}{\\partial t} + \\nabla \\cdot \\vec{\\Pi} = -\\vec{j} \\cdot \\vec{E}$$`,
    latexFormulas: [
      '\\vec{\\Pi} = \\frac{\\vec{E} \\times \\vec{B}}{\\mu_0}',
      'u_{em} = \\frac{1}{2} \\varepsilon_0 E^2 + \\frac{1}{2\\mu_0} B^2',
      '\\Delta \\vec{B} - \\frac{1}{c^2} \\frac{\\partial^2 \\vec{B}}{\\partial t^2} = \\vec{0}',
    ],
    attachedPdfs: [
      {
        id: 'pdf-maxwell-mines',
        name: 'Mines_2024_Physique_MP_Enonce.pdf',
        size: '2.1 Mo',
        type: 'énoncé',
        year: '2024',
        concours: 'Mines',
      },
      {
        id: 'pdf-ondes-corr',
        name: 'Corrige_Officiel_Ondes_2024.pdf',
        size: '1.2 Mo',
        type: 'corrigé',
        year: '2024',
        concours: 'CNC',
      },
    ],
  },
  {
    id: 'page-4',
    folderId: 'f-info-graphes',
    subfolderId: 'sub-i1',
    title: 'Algorithme de Dijkstra et Complexité avec Tas Binaire (`heapq`)',
    emoji: 'I',
    subject: 'info',
    subjectLabel: 'Informatique',
    status: 'Maîtrisé',
    difficulty: 3,
    targetConcours: ['CNC MP/PSI/TSI'],
    updatedAt: '14 Octobre 2026',
    callout:
      'Piège Fréquent CNC Info : L’utilisation d’un tableau simple pour trouver le sommet de distance minimale induit une complexité en $\\mathcal{O}(|S|^2)$. Avec le module `heapq`, on atteint $\\mathcal{O}((|S| + |A|) \\log |S|)$.',
    contentMarkdown: `### Implémentation Optimale en Python 3
\`\`\`python
import heapq

def dijkstra(graphe, depart):
    distances = {sommet: float('inf') for sommet in graphe}
    distances[depart] = 0
    file_prio = [(0, depart)]
    predecesseurs = {depart: None}

    while file_prio:
        d_u, u = heapq.heappop(file_prio)
        if d_u > distances[u]:
            continue

        for v, poids in graphe[u]:
            nouvelle_dist = d_u + poids
            if nouvelle_dist < distances[v]:
                distances[v] = nouvelle_dist
                predecesseurs[v] = u
                heapq.heappush(file_prio, (nouvelle_dist, v))

    return distances, predecesseurs
\`\`\``,
    latexFormulas: [
      '\\mathcal{O}((|S| + |A|) \\log |S|) \\quad \\text{avec file de priorité binaire}',
    ],
    attachedPdfs: [
      {
        id: 'pdf-info-cnc23',
        name: 'CNC_2023_Informatique_MP_Enonce.pdf',
        size: '980 Ko',
        type: 'énoncé',
        year: '2023',
        concours: 'CNC',
      },
    ],
  },
  {
    id: 'page-5',
    folderId: 'f-cnc-corriges',
    subfolderId: 'sub-c1',
    title: 'Synthèse des Rapports de Jury CNC 2022-2025 — Épreuves Écrites',
    emoji: 'C',
    subject: 'concours',
    subjectLabel: 'Concours CNC',
    status: 'Validé CNC',
    difficulty: 4,
    targetConcours: ['CNC Tous Groupes'],
    updatedAt: '15 Octobre 2026',
    callout:
      'Règle d’Or du Concours : La rigueur de justification prime sur la vitesse. Tout résultat parachuté sans preuve ou théorème nommé vaut 0 point à la question.',
    contentMarkdown: `### Recommandations Officielles des Présidents de Jury
1. **Lisibilité et présentation** : Encadrez vos résultats finaux à la règle. Ne sautez pas plus d’une ligne entre les questions.
2. **Nommer les théorèmes** : Mentionnez impérativement « D’après le théorème de convergence dominée... », « Par le théorème de Fubini... », etc.
3. **Vérifier les hypothèses** : Continuité par morceaux, intégrabilité, compacité, ouvert/fermé.
4. **Calcul différentiel** : Explicitez toujours la classe $\\mathcal{C}^1$ ou $\\mathcal{C}^2$ avant de dériver.`,
    latexFormulas: [
      '\\lim_{n \\to \\infty} \\int_I f_n(t)\\,\\mathrm{d}t = \\int_I \\lim_{n \\to \\infty} f_n(t)\\,\\mathrm{d}t',
    ],
    attachedPdfs: [
      {
        id: 'pdf-cnc-rep-compil',
        name: 'Compilation_Rapports_CNC_2022_2025.pdf',
        size: '4.8 Mo',
        type: 'rapport',
        year: '2025',
        concours: 'CNC',
      },
    ],
  },
]

// --------------------------------------------------------------------------
// PROPS
// --------------------------------------------------------------------------

export interface PochettesWorkspaceProps {
  onBackToDashboard?: () => void
}

// --------------------------------------------------------------------------
// COMPONENT
// --------------------------------------------------------------------------

export function PochettesWorkspace({ onBackToDashboard }: PochettesWorkspaceProps) {
  // Navigation & View mode
  const [activeView, setActiveView] = useState<'folders' | 'workspace'>('folders')
  const [selectedFolderId, setSelectedFolderId] = useState<string>('f-maths-reduc')
  const [selectedPageId, setSelectedPageId] = useState<string>('page-1')

  // Data states
  const [folders, setFolders] = useState<PochetteFolder[]>(INITIAL_POCHETTES)
  const [pages, setPages] = useState<NotionPage[]>(INITIAL_PAGES)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<'all' | SubjectCategory>('all')

  // Modals & Panels
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [showNewPageModal, setShowNewPageModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isEditingContent, setIsEditingContent] = useState(false)

  // New folder form state
  const [newFolderTitle, setNewFolderTitle] = useState('')
  const [newFolderSubtitle, setNewFolderSubtitle] = useState('')
  const [newFolderSubject, setNewFolderSubject] = useState<SubjectCategory>('maths')
  const [newFolderColor, setNewFolderColor] = useState('#6366f1')

  // Active items
  const activeFolder = folders.find((f) => f.id === selectedFolderId) || folders[0]
  const activePage = pages.find((p) => p.id === selectedPageId) || pages[0]

  // Filtered folders
  const filteredFolders = folders.filter((f) => {
    const matchesSubject = subjectFilter === 'all' || f.subject === subjectFilter
    const matchesSearch =
      searchQuery.trim() === '' ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSubject && matchesSearch
  })

  // Open Notion workspace for a given folder
  const handleOpenFolder = (folderId: string) => {
    setSelectedFolderId(folderId)
    // Find first page of that folder, or default
    const firstPage = pages.find((p) => p.folderId === folderId)
    if (firstPage) {
      setSelectedPageId(firstPage.id)
    } else {
      // create a default page if empty
      const newP: NotionPage = {
        id: `page-${Date.now()}`,
        folderId,
        subfolderId: 'sub-def',
        title: 'Nouvelle Fiche de Synthèse',
        emoji: 'F',
        subject: 'maths',
        subjectLabel: 'Mathématiques',
        status: 'En cours',
        difficulty: 2,
        targetConcours: ['CNC MP'],
        updatedAt: 'Aujourd’hui',
        contentMarkdown: `### Introduction & Objectifs de la séance\nRédigez ici vos synthèses, démonstrations clés et théorèmes au format Markdown et LaTeX.`,
        latexFormulas: ['\\forall x \\in \\mathbb{R}, \\quad e^x \\ge 1 + x'],
        attachedPdfs: [],
      }
      setPages((prev) => [...prev, newP])
      setSelectedPageId(newP.id)
    }
    setActiveView('workspace')
  }

  // Handle Create Folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderTitle.trim()) return

    const subjectLabels: Record<SubjectCategory, { label: string; tag: string; gradient: string; orbs: string[] }> = {
      maths: {
        label: 'Mathématiques',
        tag: 'MATH',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #1e1b4b 100%)',
        orbs: ['#818cf8', '#a855f7', '#4f46e5'],
      },
      physique: {
        label: 'Physique & Chimie',
        tag: 'PHYS',
        gradient: 'linear-gradient(135deg, #082f49 0%, #0369a1 35%, #0284c7 70%, #0c4a6e 100%)',
        orbs: ['#38bdf8', '#06b6d4', '#0284c7'],
      },
      si: {
        label: 'Sciences Industrielles',
        tag: 'SII',
        gradient: 'linear-gradient(135deg, #2e1065 0%, #581c87 35%, #7e22ce 70%, #3b0764 100%)',
        orbs: ['#a855f7', '#c084fc', '#7c3aed'],
      },
      info: {
        label: 'Informatique',
        tag: 'INFO',
        gradient: 'linear-gradient(135deg, #022c22 0%, #065f46 35%, #059669 70%, #064e3b 100%)',
        orbs: ['#34d399', '#10b981', '#059669'],
      },
      concours: {
        label: 'Concours Communs',
        tag: 'CNC',
        gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 35%, #b45309 70%, #292524 100%)',
        orbs: ['#fbbf24', '#f97316', '#d97706'],
      },
    }

    const conf = subjectLabels[newFolderSubject]
    const newF: PochetteFolder = {
      id: `f-custom-${Date.now()}`,
      title: newFolderTitle.trim(),
      subtitle: newFolderSubtitle.trim() || 'Dossier personnalisé de travail',
      subject: newFolderSubject,
      subjectLabel: conf.label,
      fileCountText: '0 document • 1 fiche',
      accentColor: newFolderColor,
      gradient: conf.gradient,
      meshOrbs: conf.orbs,
      tag: conf.tag,
      createdAt: 'À l’instant',
      subfolders: [
        { id: `sub-init-${Date.now()}`, name: 'Fiches Générales' },
      ],
    }

    // Also create initial page
    const newP: NotionPage = {
      id: `page-init-${Date.now()}`,
      folderId: newF.id,
      subfolderId: newF.subfolders[0].id,
      title: `Page Initiale — ${newFolderTitle.trim()}`,
      emoji: 'D',
      subject: newFolderSubject,
      subjectLabel: conf.label,
      status: 'En cours',
      difficulty: 2,
      targetConcours: ['CNC MP/PSI'],
      updatedAt: 'À l’instant',
      contentMarkdown: `### Bienvenue dans votre nouvelle Pochette !\nCommencez à ajouter vos énoncés, synthèses et formules KaTeX.`,
      latexFormulas: [],
      attachedPdfs: [],
    }

    setFolders((prev) => [newF, ...prev])
    setPages((prev) => [newP, ...prev])
    setShowNewFolderModal(false)
    setNewFolderTitle('')
    setNewFolderSubtitle('')
  }

  // Handle Add New Page in current folder
  const handleAddNewPage = () => {
    const newPage: NotionPage = {
      id: `page-${Date.now()}`,
      folderId: activeFolder.id,
      subfolderId: activeFolder.subfolders[0]?.id || 'sub-gen',
      title: 'Nouvelle Note de Synthèse',
      emoji: 'F',
      subject: activeFolder.subject,
      subjectLabel: activeFolder.subjectLabel,
      status: 'À réviser',
      difficulty: 3,
      targetConcours: ['CNC MP/PSI'],
      updatedAt: 'À l’instant',
      contentMarkdown: `### Nouvelle fiche de synthèse\nNotez vos démonstrations clés et définitions ici.`,
      latexFormulas: [],
      attachedPdfs: [],
    }
    setPages((prev) => [newPage, ...prev])
    setSelectedPageId(newPage.id)
  }

  // Handle PDF Upload to active page
  const handleUploadPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const newDoc: AttachedPdfDoc = {
      id: `pdf-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} Mo`,
      type: file.name.toLowerCase().includes('corr') ? 'corrigé' : 'énoncé',
      year: '2025',
      concours: 'CNC',
    }

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePage.id
          ? {
              ...p,
              attachedPdfs: [...p.attachedPdfs, newDoc],
              updatedAt: 'À l’instant',
            }
          : p
      )
    )
    alert(`Le document « ${file.name} » a été rattaché avec succès à cette fiche !`)
  }

  // Update Page Field
  const updateActivePage = (fields: Partial<NotionPage>) => {
    setPages((prev) =>
      prev.map((p) => (p.id === activePage.id ? { ...p, ...fields, updatedAt: 'À l’instant' } : p))
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f3f6fc] text-slate-800 dark:bg-[#070b14] dark:text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-200">
      {/* SVG Clip Path Definitions for 3D Glass Folders */}
      <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="folder-tab-back" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.11 C 0,0.06 0.03,0.06 0.07,0.06 L 0.44,0.06 C 0.50,0.06 0.52,0 0.58,0 L 0.93,0 C 0.97,0 1,0.03 1,0.06 L 1,0.94 C 1,0.97 0.97,1 0.93,1 L 0.07,1 C 0.03,1 0,0.97 0,0.94 Z" />
          </clipPath>
          <clipPath id="folder-front-pocket" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.06 C 0,0.02 0.03,0 0.07,0 L 0.42,0 C 0.48,0 0.50,0.09 0.56,0.09 L 0.93,0.09 C 0.97,0.09 1,0.13 1,0.17 L 1,0.94 C 1,0.98 0.97,1 0.93,1 L 0.07,1 C 0.03,1 0,0.98 0,0.94 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ==================================================================== */}
      {/* VIEW A: 3D GLASS FOLDERS GRID                                        */}
      {/* ==================================================================== */}
      {activeView === 'folders' && (
        <div className="flex-1 flex flex-col">
          {/* Sub-Header / Action Bar */}
          <div className="border-b border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#0a0f1d]/80 px-6 py-8 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Espace Étudiant • Nexora CPGE
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Synchronisation Cloud active</span>
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <FolderOpen size={30} weight="fill" className="text-indigo-600 dark:text-indigo-400" />
                    <span>Mes Pochettes de Révision 3D</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    Organisez vos fiches de cours, énoncés CNC et synthèses rédigées dans des dossiers interactifs en verre 3D, puis accédez à votre espace de travail Notion.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewFolderModal(true)}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-[#3978F6] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 transition cursor-pointer"
                  >
                    <Plus size={16} weight="bold" />
                    <span>Nouvelle Pochette</span>
                  </button>
                </div>
              </div>

              {/* Filter Pills & Search Bar */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Subject filter chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {[
                    { id: 'all', label: 'Toutes les pochettes', count: folders.length },
                    { id: 'maths', label: 'Mathématiques', count: folders.filter((f) => f.subject === 'maths').length },
                    { id: 'physique', label: 'Physique-Chimie', count: folders.filter((f) => f.subject === 'physique').length },
                    { id: 'si', label: 'SII', count: folders.filter((f) => f.subject === 'si').length },
                    { id: 'info', label: 'Informatique', count: folders.filter((f) => f.subject === 'info').length },
                    { id: 'concours', label: 'Concours CNC', count: folders.filter((f) => f.subject === 'concours').length },
                  ].map((tab) => {
                    const isSelected = subjectFilter === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSubjectFilter(tab.id as typeof subjectFilter)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'border border-slate-200/80 bg-white/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`rounded-full px-1.5 py-0.2 text-xs ${isSelected ? 'bg-black/25 text-white' : 'bg-slate-200/70 text-slate-700 dark:bg-black/20 dark:text-slate-300'}`}>
                          {tab.count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Quick Search in folders */}
                <div className="relative w-full sm:w-72">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <MagnifyingGlass size={16} weight="bold" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une pochette..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3D Glass Folders Grid */}
          <div className="mx-auto max-w-7xl px-6 py-10 w-full flex-1">
            {filteredFolders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 py-16 text-center">
                <Folder size={44} weight="thin" className="text-slate-400 dark:text-slate-500" />
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">Aucune pochette trouvée</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Essayez un autre mot-clé ou créez une nouvelle pochette.</p>
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(true)}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  <Plus size={14} weight="bold" />
                  <span>Créer une Pochette</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {filteredFolders.map((folder) => {
                  return (
                    <motion.div
                      key={folder.id}
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => handleOpenFolder(folder.id)}
                      className="group relative h-[380px] w-full cursor-pointer select-none rounded-3xl focus:outline-none"
                    >
                      {/* =================================================== */}
                      {/* LAYER 1: BACK FOLDER PLATE WITH SVG TAB CUTOUT      */}
                      {/* =================================================== */}
                      <div
                        className="absolute inset-0 z-0 overflow-hidden rounded-3xl shadow-xl transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] dark:group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                        style={{
                          clipPath: 'url(#folder-tab-back)',
                          WebkitClipPath: 'url(#folder-tab-back)',
                          background: folder.gradient,
                        }}
                      >
                        {/* Mesh Glowing Orbs inside folder back */}
                        <div
                          className="absolute -top-12 -right-8 h-44 w-44 rounded-full opacity-60 blur-3xl pointer-events-none"
                          style={{ backgroundColor: folder.meshOrbs[0] }}
                        />
                        <div
                          className="absolute top-16 -left-10 h-48 w-48 rounded-full opacity-45 blur-2xl pointer-events-none"
                          style={{ backgroundColor: folder.meshOrbs[1] }}
                        />

                        {/* Top Tab Label */}
                        <div className="absolute top-1 right-5 flex items-center gap-1.5 font-mono text-xs font-bold text-white/90">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{folder.tag}</span>
                        </div>
                      </div>

                      {/* =================================================== */}
                      {/* LAYER 2: STACKED DOCUMENT SHEETS WITH TILT EFFECT   */}
                      {/* =================================================== */}
                      <div className="pointer-events-none absolute inset-x-0 top-6 bottom-0 z-10 px-4">
                        {/* Back Document Sheet (Tilted Left) */}
                        <div
                          className="absolute top-4 left-6 right-8 h-[170px] rounded-xl bg-white/95 dark:bg-slate-800/90 border border-slate-200/90 dark:border-white/10 p-3 shadow-md transition-transform duration-300 group-hover:-translate-y-4 group-hover:-rotate-3 group-hover:scale-102"
                          style={{ transform: 'rotate(-1.5deg)' }}
                        >
                          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                            <span className="truncate max-w-[140px] font-bold text-slate-800 dark:text-slate-300">
                              {folder.subfolders[0]?.name || 'Énoncé & Fiches'}
                            </span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold">CNC 2025</span>
                          </div>
                          <div className="mt-2 space-y-1.5 opacity-50 dark:opacity-40">
                            <div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-600" />
                            <div className="h-1.5 w-4/5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <div className="h-1.5 w-3/5 rounded-full bg-slate-200 dark:bg-slate-700" />
                          </div>
                        </div>

                        {/* Front Document Sheet (Tilted Right) */}
                        <div
                          className="absolute top-8 left-9 right-5 h-[175px] rounded-xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/15 p-3.5 shadow-xl transition-transform duration-300 group-hover:-translate-y-7 group-hover:rotate-2 group-hover:scale-103"
                          style={{ transform: 'rotate(1.5deg)' }}
                        >
                          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-1.5 text-xs font-mono">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[160px]">
                              {folder.subtitle}
                            </span>
                            <FilePdf size={14} className="text-rose-500 dark:text-rose-400 shrink-0" weight="fill" />
                          </div>
                          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                            Synthèse rédigée avec formules KaTeX, méthode du jury et corrigés officiels.
                          </p>
                          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-white/5 pt-1.5">
                            <span>Formules KaTeX</span>
                            <span>{folder.subjectLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* =================================================== */}
                      {/* LAYER 3: 3D FROSTED GLASS FRONT POCKET              */}
                      {/* =================================================== */}
                      <div
                        className="absolute inset-x-0 bottom-0 top-[110px] z-20 flex flex-col justify-between p-6 shadow-2xl backdrop-blur-xl bg-white/40 border border-white/60 dark:bg-white/10 dark:border-white/20 rounded-b-3xl transition-all duration-300 group-hover:border-white/80 group-hover:bg-white/55 dark:group-hover:border-white/35 dark:group-hover:bg-white/15"
                        style={{
                          clipPath: 'url(#folder-front-pocket)',
                          WebkitClipPath: 'url(#folder-front-pocket)',
                        }}
                      >
                        {/* Top decorative glass edge inside pocket */}
                        <div className="pt-3 flex items-center justify-between">
                          <span className="rounded-full bg-white/70 dark:bg-white/10 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-900 dark:text-white border border-white/80 dark:border-white/15 shadow-xs">
                            {folder.subjectLabel}
                          </span>
                          <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {folder.createdAt}
                          </span>
                        </div>

                        {/* Bottom Row: Title + Count (Left) & Squircle Action (Right) */}
                        <div className="flex items-end justify-between gap-3 pt-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                              {folder.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
                              <FileText size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" weight="bold" />
                              <span>{folder.fileCountText}</span>
                            </div>
                          </div>

                          {/* Floating Squircle Action Button (Bottom Right) */}
                          <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/70 text-slate-800 shadow-lg backdrop-blur-md transition-all duration-200 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:border-indigo-400 group-hover:text-white dark:border-white/30 dark:bg-white/15 dark:text-white"
                            title="Ouvrir dans l'espace Notion"
                          >
                            <Sparkle size={18} weight="fill" className="text-amber-500 dark:text-amber-300 group-hover:text-white" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW B: NOTION-LIKE WORKSPACE                                         */}
      {/* ==================================================================== */}
      {activeView === 'workspace' && (
        <div className="flex-1 flex flex-col h-[calc(100vh-62px)] overflow-hidden bg-[#f8fafc] dark:bg-[#090d16]">
          {/* Notion Header / Breadcrumbs Bar */}
          <div className="h-14 shrink-0 border-b border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-[#0c1220] px-6 flex items-center justify-between backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('folders')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Pochettes 3D</span>
              </button>

              <span className="text-slate-400 dark:text-slate-500">/</span>

              {/* Breadcrumb Path */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeFolder.title}</span>
                <span className="text-slate-400 dark:text-slate-500">/</span>
                <span className="font-semibold text-slate-800 dark:text-white truncate max-w-xs">{activePage.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
                title="Basculer l'arborescence latérale"
              >
                <BookOpen size={14} weight="bold" />
                <span>{isSidebarOpen ? 'Masquer Arborescence' : 'Afficher Arborescence'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditingContent(!isEditingContent)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  isEditingContent
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                <PencilSimple size={14} weight="bold" />
                <span>{isEditingContent ? 'Mode Lecture & Aperçu' : 'Éditer en Markdown'}</span>
              </button>
            </div>
          </div>

          {/* Main Notion Split-Pane */}
          <div className="flex-1 flex overflow-hidden">
            {/* Notion Sidebar (Arborescence) */}
            {isSidebarOpen && (
              <div className="w-72 shrink-0 border-r border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#090d16] flex flex-col justify-between overflow-hidden">
                <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
                  {/* Folder Title */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
                        style={{ backgroundColor: activeFolder.accentColor }}
                      >
                        {activeFolder.tag.slice(0, 2)}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[150px]">
                        {activeFolder.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddNewPage}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition"
                      title="Ajouter une page"
                    >
                      <Plus size={15} weight="bold" />
                    </button>
                  </div>

                  {/* Arborescence des matières & sous-dossiers */}
                  <div className="mt-4 space-y-4 text-xs">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 block mb-1">
                        Sous-Dossiers Thématiques
                      </span>
                      <div className="space-y-0.5">
                        {activeFolder.subfolders.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 cursor-pointer font-medium"
                          >
                            <Folder size={14} weight="fill" className="text-amber-500 dark:text-amber-400/80" />
                            <span className="truncate">{sub.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between px-2 mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Fiches & Corrigés ({pages.filter((p) => p.folderId === activeFolder.id).length})
                        </span>
                        <button
                          type="button"
                          onClick={handleAddNewPage}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-bold"
                        >
                          <Plus size={11} />
                          <span>Page</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        {pages
                          .filter((p) => p.folderId === activeFolder.id)
                          .map((p) => {
                            const isSelected = p.id === activePage.id
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedPageId(p.id)}
                                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold dark:bg-indigo-600/20 dark:text-white dark:border-indigo-500/30'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span>{p.emoji}</span>
                                  <span className="truncate text-xs">{p.title}</span>
                                </div>
                                <span
                                  className={`size-2 rounded-full shrink-0 ${
                                    p.status === 'Validé CNC'
                                      ? 'bg-emerald-500'
                                      : p.status === 'Maîtrisé'
                                      ? 'bg-indigo-500'
                                      : p.status === 'En cours'
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                />
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-slate-200/80 bg-slate-50 dark:border-white/10 dark:bg-black/20 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Nexora Notion CPGE</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">v2.4 Pro</span>
                </div>
              </div>
            )}

            {/* Central Notion Canvas */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin bg-white dark:bg-[#090d16]">
              <div className="mx-auto max-w-4xl space-y-8">
                {/* Cover & Icon Selector */}
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-3xl shadow-sm dark:bg-white/10 dark:border-white/20 backdrop-blur-md">
                    {activePage.emoji}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={activePage.title}
                      onChange={(e) => updateActivePage({ title: e.target.value })}
                      className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white focus:outline-none border-b border-transparent hover:border-slate-300 dark:hover:border-white/20 focus:border-indigo-500 transition pb-1"
                      placeholder="Titre de la fiche ou du corrigé..."
                    />
                  </div>
                </div>

                {/* Notion Properties Database Box */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.02] p-5 space-y-3.5 backdrop-blur-sm shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {/* Matière Property */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Matière
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 font-bold text-indigo-700 dark:text-indigo-300">
                          {activePage.subjectLabel}
                        </span>
                      </div>
                    </div>

                    {/* Statut Property */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Statut Révision
                      </span>
                      <select
                        value={activePage.status}
                        onChange={(e) => updateActivePage({ status: e.target.value as PageStatus })}
                        className="rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-black/40 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="À réviser">À réviser</option>
                        <option value="En cours">En cours</option>
                        <option value="Maîtrisé">Maîtrisé</option>
                        <option value="Validé CNC">Validé CNC</option>
                      </select>
                    </div>

                    {/* Difficulté Property */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Niveau Difficulté
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateActivePage({ difficulty: star as 1 | 2 | 3 | 4 })}
                            className="cursor-pointer"
                          >
                            <Star
                              size={15}
                              weight={star <= activePage.difficulty ? 'fill' : 'regular'}
                              className={star <= activePage.difficulty ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Concours Cible */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Concours Cible
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-bold block pt-1">
                        {activePage.targetConcours.join(' • ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Callout Box (Jury CNC / Tips) */}
                {activePage.callout && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50/80 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 p-5 text-xs sm:text-sm leading-relaxed shadow-sm">
                    {activePage.callout}
                  </div>
                )}

                {/* Notion Document Content: Either Markdown Editor or Live Render */}
                {isEditingContent ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Édition Markdown &amp; Formules LaTeX ($...$ ou $$...$$)</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">Support KaTeX Direct</span>
                    </div>
                    <textarea
                      rows={14}
                      value={activePage.contentMarkdown}
                      onChange={(e) => updateActivePage({ contentMarkdown: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-5 font-mono text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none leading-relaxed dark:border-white/10 dark:bg-black/40 dark:text-slate-100 dark:placeholder-slate-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-6 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {/* Rendered content */}
                    <div className="prose max-w-none space-y-4 dark:prose-invert">
                      {activePage.contentMarkdown.split('\n\n').map((block, idx) => {
                        if (block.startsWith('### ')) {
                          return (
                            <h3 key={idx} className="text-lg font-bold text-slate-900 border-b border-slate-200 dark:text-white dark:border-white/10 pb-2 mt-6">
                              {block.replace('### ', '')}
                            </h3>
                          )
                        }
                        if (block.startsWith('```')) {
                          return (
                            <pre key={idx} className="rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 dark:border-white/10 dark:bg-black/60 dark:text-emerald-300 overflow-x-auto">
                              <code>{block.replace(/```python|```/g, '').trim()}</code>
                            </pre>
                          )
                        }
                        return (
                          <p key={idx} className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                            {block}
                          </p>
                        )
                      })}
                    </div>

                    {/* KaTeX Math Blocks */}
                    {activePage.latexFormulas.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Lightning size={14} weight="fill" className="text-amber-500 dark:text-amber-400" />
                          <span>Formules &amp; Démonstrations Clés (KaTeX)</span>
                        </span>

                        <div className="space-y-2.5">
                          {activePage.latexFormulas.map((formula, fIdx) => (
                            <div
                              key={fIdx}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner dark:border-white/10 dark:bg-black/40 text-slate-900 dark:text-white"
                            >
                              <div className="overflow-x-auto py-1">
                                <MathFormula math={formula} block />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(formula)
                                  alert('Formule LaTeX copiée !')
                                }}
                                className="flex items-center gap-1.5 shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer self-end sm:self-auto"
                                title="Copier le code LaTeX"
                              >
                                <Copy size={13} />
                                <span>Copier LaTeX</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Attached CNC PDFs & Documents Section */}
                <div className="pt-8 border-t border-slate-200 dark:border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FilePdf size={18} weight="fill" className="text-rose-500 dark:text-rose-400" />
                        <span>Sujets &amp; Corrigés CNC Rattachés ({activePage.attachedPdfs.length})</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Importez vos énoncés officiels et rapports de jury au format PDF.
                      </p>
                    </div>

                    {/* Import PDF Trigger */}
                    <label className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-[#3978F6] px-3.5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer">
                      <UploadSimple size={15} weight="bold" />
                      <span>Importer un PDF CNC</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleUploadPdf}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* PDFs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activePage.attachedPdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-indigo-400 dark:border-white/10 dark:bg-black/30 dark:hover:border-white/20"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400">
                            <FilePdf size={22} weight="fill" />
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                              {pdf.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {pdf.size} • {pdf.type.toUpperCase()} • {pdf.year}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => alert(`Téléchargement du document CNC : ${pdf.name}`)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition"
                            title="Télécharger"
                          >
                            <DownloadSimple size={15} weight="bold" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: NOUVELLE POCHETTE 3D                                          */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {showNewFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/20 dark:bg-[#0e1424] text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <FolderPlus size={20} weight="fill" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Créer une Nouvelle Pochette 3D</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ajoutez un dossier thématique avec fiches et documents.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Titre du Dossier *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFolderTitle}
                    onChange={(e) => setNewFolderTitle(e.target.value)}
                    placeholder="Ex: TD — Réduction de Jordan & Dunford"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sous-titre / Thématique
                  </label>
                  <input
                    type="text"
                    value={newFolderSubtitle}
                    onChange={(e) => setNewFolderSubtitle(e.target.value)}
                    placeholder="Ex: Analyse matricielle, spectres & applications CNC"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Matière
                    </label>
                    <select
                      value={newFolderSubject}
                      onChange={(e) => setNewFolderSubject(e.target.value as SubjectCategory)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
                    >
                      <option value="maths">Mathématiques</option>
                      <option value="physique">Physique-Chimie</option>
                      <option value="si">Sciences Industrielles</option>
                      <option value="info">Informatique</option>
                      <option value="concours">Concours CNC</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Couleur d’accent
                    </label>
                    <div className="flex items-center gap-2 pt-1.5">
                      {['#6366f1', '#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewFolderColor(c)}
                          className={`size-6 rounded-full transition ${
                            newFolderColor === c ? 'ring-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowNewFolderModal(false)}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-[#3978F6] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110"
                  >
                    Créer la Pochette
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PochettesWorkspace
