'use client'

import { useState } from 'react'
import {
  FileText,
  FilePdf,
  FileCode,
  Image as ImageIcon,
  Plus,
  Trash,
  PencilSimple,
  CheckCircle,
  Clock,
  DownloadSimple,
  Eye,
  MagnifyingGlass,
  ArrowLeft,
  CaretRight,
  Sparkle,
  GraduationCap,
  NotePencil,
  BookOpen,
  Paperclip,
  Printer,
  X,
  Check,
  Star,
  FolderOpen,
  Atom,
  Gear,
  TerminalWindow,
  Tag,
  Lightning,
  UploadSimple,
} from '@phosphor-icons/react'
import { MathFormula } from './MathFormula'
import { SilkShader } from './SilkShader'
import { ThemeToggle } from './ThemeToggle'
import { NexoraLogo } from './NexoraLogo'

export type PochetteCategory =
  | 'Corrigé Personnel'
  | 'Rapport de Khôlle'
  | 'Fiche de Synthèse'
  | 'Compte-Rendu DM'

export interface PushedDoc {
  id: string
  name: string
  size: string
  type: 'pdf' | 'code' | 'image' | 'text'
  pushedAt: string
}

export interface StudentPochette {
  id: string
  title: string
  category: PochetteCategory
  matiere: 'Mathématiques' | 'Physique & Chimie' | 'Sciences Industrielles' | 'Informatique'
  date: string
  score?: string // e.g. "19/20"
  teacher?: string // e.g. "M. Mansouri"
  contentLatex?: string
  pushedDocuments: PushedDoc[]
  tags: string[]
}

const INITIAL_POCHETTES: StudentPochette[] = [
  {
    id: 'poch-1',
    title: 'Pochette CNC 2025 Maths I — Endomorphismes de Rang 1',
    category: 'Corrigé Personnel',
    matiere: 'Mathématiques',
    date: '18 Octobre 2026',
    score: '19/20',
    teacher: 'M. Mansouri',
    contentLatex: `Remarques méthodologiques sur l'épreuve :
1. Décomposition spectrale : $E = \\ker(u) \\oplus \\mathrm{Im}(u)$ lorsque $\\mathrm{Tr}(u) \\neq 0$.
2. Formule clef pour la réduction :
$$u^2 = \\mathrm{Tr}(u) \\cdot u$$
3. Polynôme minimal : $\\pi_u(X) = X(X - \\mathrm{Tr}(u))$ est scindé à racines simples si $\\mathrm{Tr}(u) \\neq 0$.`,
    pushedDocuments: [
      {
        id: 'pdoc-1',
        name: 'Corrige_Manuscrit_Maths1_CNC2025.pdf',
        size: '2.8 Mo',
        type: 'pdf',
        pushedAt: '18 Oct 18:30',
      },
      {
        id: 'pdoc-2',
        name: 'Notes_Polynome_Minimal_u.pdf',
        size: '1.2 Mo',
        type: 'pdf',
        pushedAt: '18 Oct 18:35',
      },
    ],
    tags: ['CNC 2025', 'Algèbre Linéaire', 'Théorème Spectral'],
  },
  {
    id: 'poch-2',
    title: 'Pochette Khôlle Physique — Ondes Guidées & Cavités Résonnantes',
    category: 'Rapport de Khôlle',
    matiere: 'Physique & Chimie',
    date: '15 Octobre 2026',
    score: '17/20',
    teacher: 'Mme. Benjelloun',
    contentLatex: `Bilan de la khôlle :
- Conditions aux limites conducteur parfait : $\\mathbf{E}_t = \\mathbf{0}$.
- Pulsation de coupure du mode fondamental $\\mathrm{TE}_{10}$ :
$$\\omega_c = \\frac{\\pi c}{a}$$
- Vecteur de Poynting moyen : $\\langle \\boldsymbol{\\Pi} \\rangle = \\frac{1}{2} \\mathrm{Re}(\\mathbf{E} \\times \\mathbf{H}^*)$`,
    pushedDocuments: [
      {
        id: 'pdoc-3',
        name: 'Scan_Kholle_Physique_Semaine5.pdf',
        size: '1.4 Mo',
        type: 'pdf',
        pushedAt: '15 Oct 14:10',
      },
      {
        id: 'pdoc-4',
        name: 'Schema_Vecteur_Poynting.png',
        size: '780 Ko',
        type: 'image',
        pushedAt: '15 Oct 14:15',
      },
    ],
    tags: ['Khôlle', 'Ondes Guidées', 'Poynting'],
  },
  {
    id: 'poch-3',
    title: 'Pochette Fiche Méthode — Inégalités & Espaces Préhilbertiens',
    category: 'Fiche de Synthèse',
    matiere: 'Mathématiques',
    date: '12 Octobre 2026',
    contentLatex: `Inégalités fondamentales à connaître par cœur :
- Cauchy-Schwarz : $|\\langle x, y \\rangle| \\le \\|x\\| \\cdot \\|y\\|$ avec égalité ssi $(x, y)$ est liée.
- Minkowski : $\\|x + y\\| \\le \\|x\\| + \\|y\\|$
- Identité du parallélogramme :
$$\\|x + y\\|^2 + \\|x - y\\|^2 = 2(\\|x\\|^2 + \\|y\\|^2)$$`,
    pushedDocuments: [
      {
        id: 'pdoc-5',
        name: 'Fiche_Prehilbertien_Formulaire.pdf',
        size: '850 Ko',
        type: 'pdf',
        pushedAt: '12 Oct 11:20',
      },
    ],
    tags: ['Formulaire', 'Espaces Euclidiens', 'Norme'],
  },
  {
    id: 'poch-4',
    title: 'Pochette DM 2 SII — Modélisation Robot Delta 3D',
    category: 'Compte-Rendu DM',
    matiere: 'Sciences Industrielles',
    date: '08 Octobre 2026',
    score: '16.5/20',
    teacher: 'M. Tazi',
    contentLatex: `Synthèse cinématique 3D :
- Écriture du torseur cinématique au centre de la nacelle :
$$\\{\\mathcal{V}(S/R_0)\\} = \\begin{Bmatrix} \\boldsymbol{\\Omega}(S/R_0) \\\\ \\mathbf{V}(P \\in S/R_0) \\end{Bmatrix}$$
- Fermeture géométrique par chaîne fermée de liaisons rotules.`,
    pushedDocuments: [
      {
        id: 'pdoc-6',
        name: 'CR_DM2_Robot_Delta_SII.pdf',
        size: '3.1 Mo',
        type: 'pdf',
        pushedAt: '08 Oct 09:15',
      },
    ],
    tags: ['DM 2', 'Torseurs', 'Cinématique 3D'],
  },
  {
    id: 'poch-5',
    title: 'Pochette Capstone Projet 15 — Pipeline Churn R (Zéro Data Leakage)',
    category: 'Compte-Rendu DM',
    matiere: 'Informatique',
    date: 'Aujourd’hui à 18:42',
    score: '18.5/20',
    teacher: 'Dr. Karim Mansouri',
    contentLatex: `Pipeline de validation croisée sans fuite d'information :
$$z_v = \\frac{x_v - \\mu_{\\text{train}}}{\\sigma_{\\text{train}}}, \\quad \\text{AUC} = 0.842$$`,
    pushedDocuments: [
      {
        id: 'pdoc-7',
        name: 'pipeline_telco_churn_v2.R',
        size: '14.2 Ko',
        type: 'code',
        pushedAt: 'Aujourd’hui 18:35',
      },
      {
        id: 'pdoc-8',
        name: 'Rapport_Validation_5Fold.pdf',
        size: '1.9 Mo',
        type: 'pdf',
        pushedAt: 'Aujourd’hui 18:38',
      },
    ],
    tags: ['Capstone', 'Machine Learning', 'ROC-AUC'],
  },
]

export function PersonalReportsHub({
  onBackToDashboard,
  hideHeader = false,
}: {
  onBackToDashboard: () => void
  hideHeader?: boolean
}) {
  const [pochettes, setPochettes] = useState<StudentPochette[]>(INITIAL_POCHETTES)
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | PochetteCategory>('ALL')
  const [selectedMatiere, setSelectedMatiere] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Create Pochette Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<PochetteCategory>('Corrigé Personnel')
  const [newMatiere, setNewMatiere] = useState<'Mathématiques' | 'Physique & Chimie' | 'Sciences Industrielles' | 'Informatique'>('Mathématiques')
  const [newScore, setNewScore] = useState('')
  const [newTeacher, setNewTeacher] = useState('')
  const [newContentLatex, setNewContentLatex] = useState('')
  const [newTags, setNewTags] = useState('')

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<PushedDoc | null>(null)

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filter logic
  const filteredPochettes = pochettes.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory
    const matchMat = selectedMatiere === 'ALL' || p.matiere === selectedMatiere
    const matchSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.contentLatex && p.contentLatex.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.pushedDocuments.some((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCat && matchMat && matchSearch
  })

  // Pochette Handlers
  const handleOpenCreateModal = () => {
    setNewTitle('')
    setNewCategory('Corrigé Personnel')
    setNewMatiere('Mathématiques')
    setNewScore('')
    setNewTeacher('')
    setNewContentLatex('')
    setNewTags('')
    setIsCreateModalOpen(true)
  }

  const handleCreatePochetteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      alert('Veuillez renseigner un titre pour la pochette.')
      return
    }

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const newPoch: StudentPochette = {
      id: `poch-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      matiere: newMatiere,
      date: 'Aujourd’hui',
      score: newScore.trim() || undefined,
      teacher: newTeacher.trim() || undefined,
      contentLatex: newContentLatex.trim() || undefined,
      pushedDocuments: [],
      tags: tagsArray.length > 0 ? tagsArray : [newMatiere, newCategory],
    }

    setPochettes([newPoch, ...pochettes])
    setIsCreateModalOpen(false)
    showToast(`Pochette « ${newPoch.title} » créée avec succès ! Vous pouvez maintenant y poser vos documents rédigés.`)
  }

  const handleDeletePochette = (pochetteId: string) => {
    const pochette = pochettes.find((p) => p.id === pochetteId)
    const name = pochette ? pochette.title : 'cette pochette'
    if (confirm(`Voulez-vous vraiment supprimer la pochette « ${name} » et tous les documents qu'elle contient ?`)) {
      setPochettes((prev) => prev.filter((p) => p.id !== pochetteId))
      showToast('Pochette supprimée avec succès.')
    }
  }

  // Push / Deposit Document to Pochette
  const handlePushDocToPochette = (pochetteId: string, files: FileList | null) => {
    if (!files || files.length === 0) return
    const newDocs: PushedDoc[] = Array.from(files).map((f) => {
      let type: 'pdf' | 'code' | 'image' | 'text' = 'text'
      const ext = f.name.split('.').pop()?.toLowerCase() || ''
      if (ext === 'pdf') type = 'pdf'
      else if (['r', 'py', 'tex', 'cpp', 'js', 'ts'].includes(ext)) type = 'code'
      else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) type = 'image'

      return {
        id: `pdoc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} Mo` : `${Math.round(f.size / 1024)} Ko`,
        type,
        pushedAt: 'À l’instant',
      }
    })

    setPochettes((prev) =>
      prev.map((poch) =>
        poch.id === pochetteId
          ? { ...poch, pushedDocuments: [...newDocs, ...poch.pushedDocuments] }
          : poch
      )
    )
    showToast(`${newDocs.length} document(s) rédigé(s) posé(s) dans la pochette avec succès !`)
  }

  const handleRemoveDocFromPochette = (pochetteId: string, docId: string) => {
    setPochettes((prev) =>
      prev.map((poch) =>
        poch.id === pochetteId
          ? { ...poch, pushedDocuments: poch.pushedDocuments.filter((d) => d.id !== docId) }
          : poch
      )
    )
    showToast('Document retiré de la pochette.')
  }

  const matiereTheme = (mat: string) => {
    switch (mat) {
      case 'Mathématiques':
        return {
          pill: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          tabBg: 'from-blue-500/20 via-blue-500/10 to-transparent border-blue-400/40 text-blue-600 dark:text-blue-300',
          borderHover: 'hover:border-blue-500/60',
          icon: GraduationCap,
        }
      case 'Physique & Chimie':
        return {
          pill: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
          tabBg: 'from-purple-500/20 via-purple-500/10 to-transparent border-purple-400/40 text-purple-600 dark:text-purple-300',
          borderHover: 'hover:border-purple-500/60',
          icon: Atom,
        }
      case 'Sciences Industrielles':
        return {
          pill: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          tabBg: 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-400/40 text-emerald-600 dark:text-emerald-300',
          borderHover: 'hover:border-emerald-500/60',
          icon: Gear,
        }
      case 'Informatique':
        return {
          pill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          tabBg: 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-400/40 text-amber-600 dark:text-amber-300',
          borderHover: 'hover:border-amber-500/60',
          icon: TerminalWindow,
        }
      default:
        return {
          pill: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border-slate-200',
          tabBg: 'from-slate-500/20 via-slate-500/10 to-transparent border-slate-400/40 text-slate-600 dark:text-slate-300',
          borderHover: 'hover:border-slate-400',
          icon: BookOpen,
        }
    }
  }

  const totalDocumentsPushed = pochettes.reduce((sum, p) => sum + p.pushedDocuments.length, 0)

  return (
    <div className="learning-shell min-h-screen bg-[#f3f6fc] text-[#172033] dark:bg-[#050a14] dark:text-[#eaf2ff] transition-colors duration-200">
      <SilkShader />

      {/* Ambient glowing glassmorphic orbs */}
      <div className="glass-glow-ambient -top-40 -left-40 size-[550px] bg-[#3978F6]/20 dark:bg-[#3978F6]/30" />
      <div className="glass-glow-ambient top-1/3 -right-40 size-[500px] bg-[#06b6d4]/15 dark:bg-[#06b6d4]/25" />
      <div className="glass-glow-ambient -bottom-40 left-1/3 size-[600px] bg-[#8b5cf6]/15 dark:bg-[#8b5cf6]/25" />

      {/* Top Glass Header */}
      {!hideHeader && (
        <div className="relative z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl dark:border-white/15 dark:bg-[#0b162c]/80">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-900 dark:border-white/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25 cursor-pointer"
              >
                <ArrowLeft size={15} weight="bold" />
                <span>Retour Tableau de bord</span>
              </button>

              <div className="hidden h-5 w-px bg-slate-300 dark:bg-white/20 sm:block" />

              <div className="flex items-center gap-2 text-xs">
                <NexoraLogo size={22} />
                <span className="rounded-lg bg-[#3978F6] px-2 py-0.5 font-bold text-white shadow-xs">
                  Espace Étudiant
                </span>
                <CaretRight size={12} className="text-slate-400 dark:text-white/40" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Mes Pochettes de Documents Rédigés
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Container */}
      <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-8 sm:px-8 space-y-8">
        {/* Hero Banner — Glassmorphism Pochettes */}
        <div className="glass-container rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3978F6]/40 bg-[#3978F6]/15 px-3 py-1 text-xs font-bold text-[#1d4ed8] dark:text-[#b9d5ff]">
                <FolderOpen size={15} weight="fill" />
                <span>Classeur Glassmorphism • Pochettes de Rangement</span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-[#0f172a] dark:text-white">
                Mes Pochettes de Documents Rédigés
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Chaque pochette regroupe vos copies manuscrites scannées, fiches de révision, comptes-rendus de khôlles et scripts R/Python.
                Vous pouvez <strong>créer des pochettes</strong>, <strong>y poser vos documents rédigés</strong> ou <strong>supprimer les pochettes</strong> devenues inutiles.
              </p>
            </div>

            {/* Create CTA Button & Stats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3978F6] to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 transition cursor-pointer"
              >
                <Plus size={16} weight="bold" />
                <span>Créer une Nouvelle Pochette</span>
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 text-xs dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-[#3978F6] dark:text-[#7ba9ff]">
                    {pochettes.length}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">pochettes</span>
                </div>
                <div className="h-4 w-px bg-slate-300 dark:bg-white/20" />
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {totalDocumentsPushed}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">documents posés</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-200/80 dark:border-white/10 pt-4">
            {[
              { id: 'ALL', label: 'Toutes les Pochettes' },
              { id: 'Corrigé Personnel', label: 'Corrigés Personnels' },
              { id: 'Rapport de Khôlle', label: 'Rapports de Khôlles' },
              { id: 'Fiche de Synthèse', label: 'Fiches de Synthèse' },
              { id: 'Compte-Rendu DM', label: 'Comptes-Rendus DM' },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer ${
                    isActive
                      ? 'bg-[#3978F6] text-white shadow-md'
                      : 'border border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white hover:text-slate-900 dark:border-white/15 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Search bar & Matière selector */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="relative sm:col-span-8">
              <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre de pochette, document posé ou notion (ex: Cauchy-Schwarz, CNC, Poynting)..."
                className="w-full rounded-xl border border-slate-200/80 bg-white/80 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#3978F6] focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-white/80 p-2 text-xs text-slate-800 dark:border-white/10 dark:bg-[#0c1830] dark:text-white cursor-pointer"
              >
                <option value="ALL">Toutes les Matières</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Physique & Chimie">Physique & Chimie</option>
                <option value="Sciences Industrielles">Sciences Industrielles (SII)</option>
                <option value="Informatique">Informatique (Python / R)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pochettes Grid (Physical Folder Design with Glassmorphism) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {filteredPochettes.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-white/15">
              <FolderOpen size={44} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Aucune pochette trouvée
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Créez votre première pochette de documents ou ajustez vos critères de recherche.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#3978F6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                <span>Créer une pochette</span>
              </button>
            </div>
          ) : (
            filteredPochettes.map((poch, index) => {
              const theme = matiereTheme(poch.matiere)
              const MatIcon = theme.icon

              return (
                <div key={poch.id} className="group relative flex flex-col">
                  {/* Flap / Rabat Supérieur de la Pochette */}
                  <div
                    className={`flex items-center justify-between gap-3 rounded-t-3xl border-t border-x bg-gradient-to-r ${theme.tabBg} px-5 py-2.5 backdrop-blur-xl shadow-xs`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-white/10 shadow-xs">
                        <FolderOpen size={16} weight="fill" className="text-[#3978F6] dark:text-[#7ba9ff]" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider truncate">
                        Pochette #{index + 1}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${theme.pill} flex items-center gap-1 shrink-0`}>
                        <MatIcon size={12} weight="bold" />
                        <span>{poch.matiere}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-lg bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {poch.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeletePochette(poch.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition cursor-pointer"
                        title="Supprimer cette pochette"
                      >
                        <Trash size={15} weight="bold" />
                      </button>
                    </div>
                  </div>

                  {/* Pochette Main Body (Glassmorphism Container) */}
                  <div
                    className={`flex-1 rounded-b-3xl rounded-tr-3xl border border-slate-200/90 bg-white/80 p-6 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:shadow-2xl dark:border-white/10 dark:bg-[#0c1830]/80 space-y-4 ${theme.borderHover}`}
                  >
                    {/* Header: Title, Date, Score */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-white/10">
                      <div className="max-w-md">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#3978F6] transition dark:text-white">
                          {poch.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400 font-mono flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>{poch.date}</span>
                          {poch.teacher && (
                            <>
                              <span>•</span>
                              <span>Validé par : <strong>{poch.teacher}</strong></span>
                            </>
                          )}
                        </p>
                      </div>

                      {poch.score && (
                        <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {poch.score}
                        </span>
                      )}
                    </div>

                    {/* Synthesis & KaTeX Formula (if any) */}
                    {poch.contentLatex && (
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 p-3.5 text-xs text-slate-800 dark:border-blue-400/20 dark:bg-black/30 dark:text-slate-200 space-y-1.5">
                        <p className="text-xs font-sans font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                          Notes &amp; Démarche de Synthèse :
                        </p>
                        <div className="overflow-x-auto py-1">
                          <MathFormula math={poch.contentLatex} block />
                        </div>
                      </div>
                    )}

                    {/* Deposited Documents Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Paperclip size={14} weight="bold" className="text-[#3978F6]" />
                          <span>Documents posés dans la pochette ({poch.pushedDocuments.length})</span>
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          Copies manuscrites, scans, scripts R
                        </span>
                      </div>

                      {poch.pushedDocuments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-white/10">
                          Aucun document n&apos;a encore été posé dans cette pochette.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {poch.pushedDocuments.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-xs transition hover:border-[#3978F6] dark:border-white/10 dark:bg-white/[0.03]"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 shadow-xs">
                                  {doc.type === 'pdf' ? (
                                    <FilePdf size={20} weight="fill" className="text-rose-500" />
                                  ) : doc.type === 'code' ? (
                                    <FileCode size={20} weight="fill" className="text-emerald-500" />
                                  ) : (
                                    <ImageIcon size={20} weight="fill" className="text-amber-500" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">
                                    {doc.name}
                                  </p>
                                  <p className="text-xs text-slate-400 font-mono">
                                    {doc.size} • Déposé {doc.pushedAt}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="flex items-center gap-1 rounded-xl bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-[#3978F6] hover:bg-blue-500/20 dark:text-blue-300 transition cursor-pointer"
                                  title="Consulter ce document"
                                >
                                  <Eye size={13} weight="bold" />
                                  <span>Consulter</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`Téléchargement de la pièce : ${doc.name}`)
                                  }}
                                  className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                                  title="Télécharger"
                                >
                                  <DownloadSimple size={14} weight="bold" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocFromPochette(poch.id, doc.id)}
                                  className="rounded-xl p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                  title="Retirer ce document de la pochette"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interactive Dropzone: Poser un document rédigé */}
                    <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#3978F6]/35 bg-blue-50/30 p-4 hover:bg-blue-50/60 dark:border-blue-500/25 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 transition cursor-pointer group">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-[#3978F6]/15 text-[#3978F6] group-hover:scale-110 transition">
                        <UploadSimple size={20} weight="bold" />
                      </div>
                      <span className="mt-2 text-xs font-bold text-[#101b33] dark:text-white">
                        Poser un document rédigé dans cette pochette
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center mt-0.5">
                        Glissez-déposez ou cliquez pour choisir (PDF manuscrit, scan, script R, LaTeX...)
                      </span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handlePushDocToPochette(poch.id, e.target.files)}
                      />
                    </label>

                    {/* Tags & Delete Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-white/10 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {poch.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePochette(poch.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash size={13} />
                        <span>Supprimer la pochette</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL : CRÉER UNE NOUVELLE POCHETTE                                */}
      {/* ------------------------------------------------------------------ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0e192e] dark:text-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#3978F6]/15 text-[#3978F6]">
                  <FolderOpen size={22} weight="bold" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Créer une Nouvelle Pochette de Rangement
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Définissez la pochette dans laquelle vous pourrez ensuite poser vos copies et synthèses.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePochetteSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Catégorie de la pochette <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as PochetteCategory)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white cursor-pointer"
                  >
                    <option value="Corrigé Personnel">Corrigé Personnel</option>
                    <option value="Rapport de Khôlle">Rapport de Khôlle</option>
                    <option value="Fiche de Synthèse">Fiche de Synthèse</option>
                    <option value="Compte-Rendu DM">Compte-Rendu DM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Matière CPGE <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newMatiere}
                    onChange={(e) => setNewMatiere(e.target.value as typeof newMatiere)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white cursor-pointer"
                  >
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique & Chimie">Physique & Chimie</option>
                    <option value="Sciences Industrielles">Sciences Industrielles (SII)</option>
                    <option value="Informatique">Informatique (Python / R)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Titre de la pochette <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex : Pochette CNC 2026 Maths II — Séries Entières & Transformée de Laplace"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#3978F6] focus:outline-none dark:border-white/15 dark:bg-black/30 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Note obtenue ou barème (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    placeholder="Ex : 19/20 ou Validé"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enseignant ou Khôlleur (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    placeholder="Ex : M. Mansouri"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Démarche clé ou Formule KaTeX (optionnel)
                </label>
                <textarea
                  rows={4}
                  value={newContentLatex}
                  onChange={(e) => setNewContentLatex(e.target.value)}
                  placeholder="Rédigez vos remarques ou formules en notation LaTeX (ex: $$u^2 = \mathrm{Tr}(u) \cdot u$$)..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mots-clés / Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Ex : CNC 2026, Laplace, Séries Entières"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3978F6] to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  <CheckCircle size={15} weight="bold" />
                  <span>Créer la Pochette</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL : APERÇU / VISUALISATION DU DOCUMENT POSÉ                     */}
      {/* ------------------------------------------------------------------ */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e192e] dark:text-white overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
                  {previewDoc.type === 'pdf' ? (
                    <FilePdf size={22} weight="fill" className="text-rose-500" />
                  ) : previewDoc.type === 'code' ? (
                    <FileCode size={22} weight="fill" className="text-emerald-500" />
                  ) : (
                    <ImageIcon size={22} weight="fill" className="text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {previewDoc.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Taille : {previewDoc.size} • Posé le {previewDoc.pushedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Téléchargement de : ${previewDoc.name}`)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#3978F6] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>Télécharger</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Modal Content Preview */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin text-xs sm:text-sm">
              {previewDoc.type === 'pdf' ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-black/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Rendu de copie manuscrite &amp; scan haute résolution
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      Scan certifié CPGE
                    </span>
                  </div>
                  <div className="space-y-3 font-serif text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      Extrait du corrigé rédigé :
                    </p>
                    <p>
                      Soit <MathFormula math="E" /> un <MathFormula math="\mathbb{K}" />-espace vectoriel de dimension finie <MathFormula math="n \ge 1" /> et <MathFormula math="u \in \mathcal{L}(E)" /> tel que <MathFormula math="\mathrm{rg}(u) = 1" />.
                    </p>
                    <p>
                      Il existe une forme linéaire non nulle <MathFormula math="\varphi \in E^*" /> et un vecteur non nul <MathFormula math="v_0 \in E" /> tels que pour tout <MathFormula math="x \in E" /> :
                    </p>
                    <div className="py-1">
                      <MathFormula math="u(x) = \varphi(x) \cdot v_0" block />
                    </div>
                    <p>
                      On a alors <MathFormula math="u^2(x) = u(\varphi(x) v_0) = \varphi(x) u(v_0) = \varphi(x) \varphi(v_0) v_0 = \varphi(v_0) u(x)" />.
                    </p>
                    <div className="py-1">
                      <MathFormula math="u^2 = \mathrm{Tr}(u) \cdot u \quad \text{car } \mathrm{Tr}(u) = \varphi(v_0)" block />
                    </div>
                  </div>
                </div>
              ) : previewDoc.type === 'code' ? (
                <div className="rounded-2xl border border-slate-200 bg-[#0b1220] p-4 text-emerald-400 font-mono text-xs overflow-x-auto dark:border-white/10">
                  <pre>{`# ==============================================================================
# Pipeline R — Évaluation ROC-AUC & Modélisation
# ==============================================================================
library(pROC)
library(caret)

evaluate_model <- function(y_true, y_prob) {
  roc_curve <- roc(y_true, y_prob)
  auc_val <- auc(roc_curve)
  return(list(auc = as.numeric(auc_val), curve = roc_curve))
}`}</pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-white/10 dark:bg-white/5 text-center space-y-3">
                  <div className="size-16 rounded-3xl bg-blue-500/10 text-[#3978F6] flex items-center justify-center">
                    <FileText size={36} weight="duotone" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {previewDoc.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                      Fiche rédigée stockée dans votre pochette sécurisée.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 px-6 py-3.5 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition cursor-pointer"
              >
                Fermer l&apos;aperçu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-fadeIn">
          <CheckCircle size={18} weight="fill" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
