'use client'

import { useState } from 'react'
import {
  X,
  Check,
  CheckCircle,
  WarningCircle,
  LockKey,
  User,
  GraduationCap,
  Sparkle,
  FileText,
  Clock,
  ArrowRight,
  FloppyDisk,
  Lightning,
  Buildings,
  Phone,
  Envelope,
  CheckSquare,
  Square,
  Plus,
  Trash,
  CalendarCheck,
  Fire,
  Star,
  SignOut,
  FolderOpen,
  FilePdf,
  FileCode,
  DownloadSimple,
  Eye,
  UploadSimple,
  Paperclip,
  NotePencil,
  Tag,
  CaretRight,
  BookOpen,
  MagnifyingGlass,
  Image as ImageIcon,
} from '@phosphor-icons/react'
import { MathFormula } from './MathFormula'

export interface StudentTaskItem {
  id: string
  title: string
  subject: string
  dueDate: string
  priority: 'HAUTE' | 'MOYENNE' | 'NORMALE'
  completed: boolean
}

export interface PushedDoc {
  id: string
  name: string
  size: string
  type: 'pdf' | 'code' | 'image' | 'text'
  pushedAt: string
}

export interface StudentFolderReport {
  id: string
  title: string
  matiere: 'Mathématiques' | 'Physique & Chimie' | 'Sciences Industrielles' | 'Informatique'
  category: 'Corrigé Personnel' | 'Rapport de Khôlle' | 'Fiche de Synthèse' | 'Compte-Rendu DM'
  date: string
  score?: string
  teacher?: string
  contentLatex?: string
  pushedDocuments: PushedDoc[]
  tags: string[]
}

export interface StudentAccountProfile {
  nom: string
  prenom: string
  email: string
  telephone: string
  lycee: string
  filiere: 'MP' | 'PSI' | 'PC' | 'TSI'
  niveau: 'SUP (1re année)' | 'SPÉ (2e année)'
  avatarInitials: string
  notificationsKhollaires: boolean
  alertesAnnales: boolean
}

interface StudentDrawerProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToFiches?: () => void
  onLogout?: () => void
  initialTab?: 'todo' | 'fiches' | 'compte'
}

const INITIAL_FOLDERS: StudentFolderReport[] = [
  {
    id: 'fld-1',
    title: 'Dossier CNC 2025 Maths I — Endomorphismes de Rang 1',
    matiere: 'Mathématiques',
    category: 'Corrigé Personnel',
    date: '18 Octobre 2026',
    score: '19/20',
    teacher: 'M. Mansouri',
    contentLatex: 'u^2 = \\mathrm{Tr}(u) \\cdot u, \\quad E = \\ker(u) \\oplus \\mathrm{Im}(u)',
    pushedDocuments: [
      {
        id: 'doc-1',
        name: 'Corrige_Manuscrit_Maths1_CNC2025.pdf',
        size: '2.8 Mo',
        type: 'pdf',
        pushedAt: '18 Oct 18:30',
      },
      {
        id: 'doc-2',
        name: 'Notes_Polynome_Minimal_u.pdf',
        size: '1.2 Mo',
        type: 'pdf',
        pushedAt: '18 Oct 18:35',
      },
    ],
    tags: ['CNC 2025', 'Algèbre', 'Théorème Spectral'],
  },
  {
    id: 'fld-2',
    title: 'Rapport Khôlle Physique — Guides d\'Ondes & Cavités',
    matiere: 'Physique & Chimie',
    category: 'Rapport de Khôlle',
    date: '15 Octobre 2026',
    score: '17/20',
    teacher: 'Mme. Benjelloun',
    contentLatex: '\\omega_c = \\frac{\\pi c}{a}, \\quad \\vec{E}_t = \\vec{0}',
    pushedDocuments: [
      {
        id: 'doc-3',
        name: 'Scan_Kholle_Physique_Semaine5.pdf',
        size: '1.4 Mo',
        type: 'pdf',
        pushedAt: '15 Oct 14:10',
      },
      {
        id: 'doc-4',
        name: 'Schema_Vecteur_Poynting.png',
        size: '780 Ko',
        type: 'image',
        pushedAt: '15 Oct 14:15',
      },
    ],
    tags: ['Khôlle', 'Ondes Guidées', 'Poynting'],
  },
  {
    id: 'fld-3',
    title: 'Dossier Capstone Projet 15 — Pipeline Churn R (Zéro Leakage)',
    matiere: 'Informatique',
    category: 'Compte-Rendu DM',
    date: 'Aujourd’hui à 18:42',
    score: '18.5/20',
    teacher: 'Dr. Karim Mansouri',
    contentLatex: 'z_v = \\frac{x_v - \\mu_{\\text{train}}}{\\sigma_{\\text{train}}}, \\quad \\text{AUC} = 0.842',
    pushedDocuments: [
      {
        id: 'doc-5',
        name: 'pipeline_telco_churn_v2.R',
        size: '14.2 Ko',
        type: 'code',
        pushedAt: 'Aujourd’hui 18:35',
      },
      {
        id: 'doc-6',
        name: 'Rapport_Validation_5Fold.pdf',
        size: '1.9 Mo',
        type: 'pdf',
        pushedAt: 'Aujourd’hui 18:38',
      },
    ],
    tags: ['Capstone', 'Machine Learning', 'ROC-AUC'],
  },
]

const INITIAL_TASKS: StudentTaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Réviser le Théorème Spectral et les Projecteurs Orthogonaux',
    subject: 'Mathématiques',
    dueDate: 'Aujourd’hui à 18h',
    priority: 'HAUTE',
    completed: true,
  },
  {
    id: 'tsk-2',
    title: 'Terminer le DM 3 de Physique : Cavités Résonnantes & Ondes Guidées',
    subject: 'Physique',
    dueDate: 'Demain à 12h',
    priority: 'HAUTE',
    completed: false,
  },
  {
    id: 'tsk-3',
    title: 'Préparer la khôlle de SII : Correcteurs à avance de phase',
    subject: 'SII',
    dueDate: 'Jeudi 16h',
    priority: 'MOYENNE',
    completed: false,
  },
  {
    id: 'tsk-4',
    title: 'Faire 20 QCM de réduction et polynôme minimal',
    subject: 'Informatique',
    dueDate: 'Vendredi',
    priority: 'NORMALE',
    completed: true,
  },
  {
    id: 'tsk-5',
    title: 'Ficher le chapitre sur l’entropie et les cycles combinés',
    subject: 'Physique',
    dueDate: 'Samedi',
    priority: 'NORMALE',
    completed: false,
  },
]

export function StudentDrawer({
  isOpen,
  onClose,
  onNavigateToFiches,
  onLogout,
  initialTab = 'todo',
}: StudentDrawerProps) {
  const [activeTab, setActiveTab] = useState<'todo' | 'fiches' | 'compte'>(initialTab)

  // Tasks state
  const [tasks, setTasks] = useState<StudentTaskItem[]>(INITIAL_TASKS)
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'ACTIVE' | 'DONE'>('ALL')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskSubject, setNewTaskSubject] = useState('Mathématiques')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'HAUTE' | 'MOYENNE' | 'NORMALE'>('MOYENNE')
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)

  // Folders & Reports state (Forme d'un classeur/dossier où tu pousses des documents)
  const [folders, setFolders] = useState<StudentFolderReport[]>(INITIAL_FOLDERS)
  const [folderMatiereFilter, setFolderMatiereFilter] = useState<string>('ALL')
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>('')
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false)
  const [previewDocModal, setPreviewDocModal] = useState<PushedDoc | null>(null)

  // New folder form state
  const [newFolderTitle, setNewFolderTitle] = useState('')
  const [newFolderMatiere, setNewFolderMatiere] = useState<'Mathématiques' | 'Physique & Chimie' | 'Sciences Industrielles' | 'Informatique'>('Mathématiques')
  const [newFolderCategory, setNewFolderCategory] = useState<'Corrigé Personnel' | 'Rapport de Khôlle' | 'Fiche de Synthèse' | 'Compte-Rendu DM'>('Corrigé Personnel')
  const [newFolderScore, setNewFolderScore] = useState('')
  const [newFolderLatex, setNewFolderLatex] = useState('')
  const [newFolderTagInput, setNewFolderTagInput] = useState('')

  // Push Document to Folder Handler
  const handlePushDocToFolder = (folderId: string, files: FileList | null) => {
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

    setFolders((prev) =>
      prev.map((fld) =>
        fld.id === folderId
          ? { ...fld, pushedDocuments: [...newDocs, ...fld.pushedDocuments] }
          : fld
      )
    )
    showToast(`${newDocs.length} document(s) rédigé(s) posé(s) dans la pochette avec succès !`)
  }

  // Remove Document from Folder Handler
  const handleRemoveDocFromFolder = (folderId: string, docId: string) => {
    setFolders((prev) =>
      prev.map((fld) =>
        fld.id === folderId
          ? { ...fld, pushedDocuments: fld.pushedDocuments.filter((d) => d.id !== docId) }
          : fld
      )
    )
    showToast('Document retiré de la pochette.')
  }

  // Delete Pochette Handler
  const handleDeleteFolder = (folderId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette pochette et tous les documents qu’elle contient ?')) {
      setFolders((prev) => prev.filter((fld) => fld.id !== folderId))
      showToast('Pochette supprimée avec succès.')
    }
  }

  // Create Pochette Handler
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderTitle.trim()) {
      alert('Veuillez renseigner un nom pour la pochette.')
      return
    }

    const newFld: StudentFolderReport = {
      id: `fld-${Date.now()}`,
      title: newFolderTitle.trim(),
      matiere: newFolderMatiere,
      category: newFolderCategory,
      date: 'Aujourd’hui',
      score: newFolderScore.trim() || undefined,
      contentLatex: newFolderLatex.trim() || undefined,
      pushedDocuments: [],
      tags: newFolderTagInput.split(',').map((t) => t.trim()).filter(Boolean),
    }

    setFolders([newFld, ...folders])
    setNewFolderTitle('')
    setNewFolderLatex('')
    setNewFolderScore('')
    setNewFolderTagInput('')
    setShowNewFolderModal(false)
    showToast('Nouvelle pochette créée ! Vous pouvez maintenant y poser vos documents rédigés.')
  }

  // Account profile state
  const [profile, setProfile] = useState<StudentAccountProfile>({
    nom: 'Lemrani',
    prenom: 'Achraf',
    email: 'achraf.lemrani@cpge.ma',
    telephone: '+212 6 12 34 56 78',
    lycee: 'Lycée Moulay Youssef (Rabat)',
    filiere: 'MP',
    niveau: 'SPÉ (2e année)',
    avatarInitials: 'AL',
    notificationsKhollaires: true,
    alertesAnnales: true,
  })

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  if (!isOpen) return null

  // Task Handlers
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const newTask: StudentTaskItem = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      dueDate: newTaskDueDate.trim() || 'À planifier',
      priority: newTaskPriority,
      completed: false,
    }

    setTasks([newTask, ...tasks])
    setNewTaskTitle('')
    setNewTaskDueDate('')
    setShowAddTaskForm(false)
    showToast('Nouvelle tâche ajoutée à votre planning CPGE !')
  }

  // Account Handlers
  const handleSaveProfileClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword && newPassword !== confirmPassword) {
      alert('Le nouveau mot de passe et sa confirmation ne correspondent pas.')
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmProfileChanges = () => {
    setShowConfirmModal(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    showToast('Profil et paramètres du compte enregistrés avec succès !')
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Computed stats for tasks
  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'ACTIVE') return !t.completed
    if (taskFilter === 'DONE') return t.completed
    return true
  })

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <aside className="w-screen max-w-2xl transform border-l border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-[#0b1426]/95 flex flex-col">
          {/* Top Header */}
          <div className="border-b border-slate-200/80 p-5 dark:border-white/10 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3978F6] to-indigo-600 text-sm font-extrabold text-white shadow-md">
                  {profile.avatarInitials}
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {profile.prenom} {profile.nom}
                  </h2>
                  <p className="text-[11px] font-mono text-[#3978F6] dark:text-[#7ba9ff]">
                    CPGE — {profile.filiere} ({profile.niveau}) • Lycée Moulay Youssef
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
                title="Fermer le panneau"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Sub-Tabs: To-Do vs Fiches & Dossiers vs Compte */}
            <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 text-xs dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('todo')}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold transition cursor-pointer ${
                  activeTab === 'todo'
                    ? 'bg-white text-[#3978F6] shadow-sm dark:bg-[#162544] dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <CalendarCheck size={15} weight="bold" />
                <span className="truncate">To-Do ({tasks.filter((t) => !t.completed).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fiches')}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold transition cursor-pointer ${
                  activeTab === 'fiches'
                    ? 'bg-white text-[#3978F6] shadow-sm dark:bg-[#162544] dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FolderOpen size={15} weight="bold" />
                <span className="truncate">Mes Pochettes ({folders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('compte')}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold transition cursor-pointer ${
                  activeTab === 'compte'
                    ? 'bg-white text-[#3978F6] shadow-sm dark:bg-[#162544] dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <User size={15} weight="bold" />
                <span className="truncate">Mon Compte</span>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-5">
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: CHOSES À FAIRE (TO-DO LIST CPGE)                       */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'todo' && (
              <div className="space-y-4">
                {/* Progress Card */}
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 dark:border-blue-500/30 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Fire size={16} weight="fill" className="text-amber-500" />
                      Objectifs & Devoirs CPGE
                    </span>
                    <span className="font-mono font-bold text-[#3978F6] dark:text-[#7ba9ff]">
                      {completedCount} / {totalCount} faits ({progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3978F6] to-indigo-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Filter and Add Button Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setTaskFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        taskFilter === 'ALL'
                          ? 'bg-[#3978F6] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      Toutes ({tasks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter('ACTIVE')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        taskFilter === 'ACTIVE'
                          ? 'bg-[#3978F6] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      À faire ({tasks.filter((t) => !t.completed).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter('DONE')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        taskFilter === 'DONE'
                          ? 'bg-[#3978F6] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      Faites ({completedCount})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                    className="flex items-center gap-1 rounded-xl bg-[#3978F6] px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
                  >
                    <Plus size={13} weight="bold" />
                    <span>Nouvelle tâche</span>
                  </button>
                </div>

                {/* Add Task Form (Inline) */}
                {showAddTaskForm && (
                  <form
                    onSubmit={handleAddNewTask}
                    className="rounded-2xl border border-blue-500/30 bg-white p-3.5 shadow-md dark:border-white/10 dark:bg-[#111f38] space-y-3 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Ajouter une chose à faire
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddTaskForm(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Ex : Réviser le cours d'électromagnétisme..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#3978F6] focus:outline-none dark:border-white/15 dark:bg-black/30 dark:text-white"
                    />

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <select
                        value={newTaskSubject}
                        onChange={(e) => setNewTaskSubject(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white p-1.5 text-xs text-slate-800 dark:border-white/15 dark:bg-black/40 dark:text-white"
                      >
                        <option value="Mathématiques">Maths</option>
                        <option value="Physique">Physique</option>
                        <option value="SII">SII</option>
                        <option value="Informatique">Info</option>
                        <option value="Français">Français</option>
                        <option value="Anglais">Anglais</option>
                      </select>

                      <input
                        type="text"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        placeholder="Échéance (ex: Ce soir)"
                        className="rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 placeholder-slate-400 dark:border-white/15 dark:bg-black/40 dark:text-white"
                      />

                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as typeof newTaskPriority)}
                        className="rounded-xl border border-slate-300 bg-white p-1.5 text-xs text-slate-800 dark:border-white/15 dark:bg-black/40 dark:text-white"
                      >
                        <option value="HAUTE">Haute</option>
                        <option value="MOYENNE">Moyenne</option>
                        <option value="NORMALE">Normale</option>
                      </select>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="rounded-xl bg-[#3978F6] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition"
                      >
                        Enregistrer la tâche
                      </button>
                    </div>
                  </form>
                )}

                {/* Task List */}
                <div className="space-y-2">
                  {filteredTasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                      Aucune tâche dans cette vue. Ajoutez-en une !
                    </div>
                  ) : (
                    filteredTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-start justify-between gap-3 rounded-2xl border p-3 transition ${
                          t.completed
                            ? 'border-slate-200/60 bg-slate-50/70 opacity-70 dark:border-white/5 dark:bg-white/[0.02]'
                            : 'border-slate-200 bg-white shadow-xs hover:border-[#3978F6]/50 dark:border-white/10 dark:bg-white/5'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(t.id)}
                            className="mt-0.5 text-slate-400 hover:text-[#3978F6] dark:hover:text-white transition cursor-pointer"
                          >
                            {t.completed ? (
                              <CheckSquare size={18} weight="fill" className="text-emerald-500" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>

                          <div className="min-w-0">
                            <p
                              className={`text-xs font-semibold leading-snug ${
                                t.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {t.title}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.2 font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                {t.subject}
                              </span>
                              <span className="text-slate-400 font-mono flex items-center gap-0.5">
                                <Clock size={11} /> {t.dueDate}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.2 font-black text-[9px] ${
                                  t.priority === 'HAUTE'
                                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                    : t.priority === 'MOYENNE'
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {t.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(t.id)}
                          className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 p-1"
                          title="Supprimer la tâche"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick shortcut to Personal Workspace Pochettes */}
                {onNavigateToFiches && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveTab('fiches')}
                      className="w-full flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs font-bold text-[#3978F6] hover:bg-blue-500/10 dark:text-[#7ba9ff] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen size={16} weight="bold" />
                        <span>Ouvrir mes Pochettes de Documents ({folders.length})</span>
                      </div>
                      <ArrowRight size={14} weight="bold" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: MES POCHETTES DE DOCUMENTS (GLASSMORPHISME & DÉPÔT)    */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'fiches' && (
              <div className="space-y-5 animate-in fade-in">
                {/* Header Banner Glassmorphic */}
                <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-transparent p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.03] backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#3978F6]/15 border border-[#3978F6]/30 px-2.5 py-0.5 text-[10.5px] font-bold text-[#3978F6] dark:text-[#7ba9ff] mb-1">
                        <FolderOpen size={13} weight="fill" />
                        <span>Pochettes Personnelles Glassmorphism</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Mes Pochettes de Documents Rédigés
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
                        Classeur personnel en verre : créez vos pochettes thématiques, posez directement vos copies manuscrites scannées, corrigés rédigés et scripts R, ou supprimez les pochettes.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNewFolderModal(!showNewFolderModal)}
                        className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#3978F6] to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                      >
                        <Plus size={14} weight="bold" />
                        <span>Nouvelle Pochette</span>
                      </button>

                      {onNavigateToFiches && (
                        <button
                          type="button"
                          onClick={onNavigateToFiches}
                          className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20 transition cursor-pointer"
                          title="Agrandir en plein écran"
                        >
                          <Eye size={14} weight="bold" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Matière Filters */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10 text-xs">
                    {['ALL', 'Mathématiques', 'Physique & Chimie', 'Informatique'].map((mat) => (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => setFolderMatiereFilter(mat)}
                        className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                          folderMatiereFilter === mat
                            ? 'bg-[#3978F6] text-white shadow-xs'
                            : 'bg-white/60 text-slate-600 hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                        }`}
                      >
                        {mat === 'ALL' ? 'Toutes les Pochettes' : mat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form: Create New Folder / Pochette (Accordion) */}
                {showNewFolderModal && (
                  <form
                    onSubmit={handleCreateFolder}
                    className="rounded-3xl border border-blue-500/40 bg-white p-5 shadow-xl dark:border-white/15 dark:bg-[#0f1d38] space-y-3.5 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <FolderOpen size={18} weight="bold" className="text-[#3978F6]" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Créer une Nouvelle Pochette de Rangement
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewFolderModal(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nom de la Pochette
                      </label>
                      <input
                        type="text"
                        required
                        value={newFolderTitle}
                        onChange={(e) => setNewFolderTitle(e.target.value)}
                        placeholder="Ex : Pochette CNC 2026 Mathématiques II — Séries Entières"
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#3978F6] focus:outline-none dark:border-white/15 dark:bg-black/30 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Matière CPGE
                        </label>
                        <select
                          value={newFolderMatiere}
                          onChange={(e) => setNewFolderMatiere(e.target.value as typeof newFolderMatiere)}
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/40 dark:text-white"
                        >
                          <option value="Mathématiques">Mathématiques</option>
                          <option value="Physique & Chimie">Physique &amp; Chimie</option>
                          <option value="Sciences Industrielles">Sciences Industrielles (SII)</option>
                          <option value="Informatique">Informatique (Python / R)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Catégorie du document
                        </label>
                        <select
                          value={newFolderCategory}
                          onChange={(e) => setNewFolderCategory(e.target.value as typeof newFolderCategory)}
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/40 dark:text-white"
                        >
                          <option value="Corrigé Personnel">Corrigé Personnel (Annales/DS)</option>
                          <option value="Rapport de Khôlle">Rapport de Khôlle</option>
                          <option value="Fiche de Synthèse">Fiche de Synthèse / Formulaire</option>
                          <option value="Compte-Rendu DM">Compte-Rendu DM / Capstone</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Note obtenue / Mention (optionnel)
                        </label>
                        <input
                          type="text"
                          value={newFolderScore}
                          onChange={(e) => setNewFolderScore(e.target.value)}
                          placeholder="Ex : 19/20 ou Validé"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 placeholder-slate-400 dark:border-white/15 dark:bg-black/40 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Mots-clés / Tags (séparés par virgules)
                        </label>
                        <input
                          type="text"
                          value={newFolderTagInput}
                          onChange={(e) => setNewFolderTagInput(e.target.value)}
                          placeholder="Ex : CNC 2026, Stirling, Séries"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 placeholder-slate-400 dark:border-white/15 dark:bg-black/40 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Formule KaTeX clef ou notes de synthèse
                      </label>
                      <input
                        type="text"
                        value={newFolderLatex}
                        onChange={(e) => setNewFolderLatex(e.target.value)}
                        placeholder="Ex : \sum_{n=0}^\infty a_n z^n = f(z)"
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 placeholder-slate-400 font-mono dark:border-white/15 dark:bg-black/40 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowNewFolderModal(false)}
                        className="rounded-xl border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 transition cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3978F6] to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                      >
                        <CheckCircle size={15} weight="bold" />
                        <span>Créer la Pochette</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Pochettes (Forme d'une pochette / chemise en glassmorphism où l'on pose des documents) */}
                <div className="space-y-5">
                  {folders
                    .filter((fld) => {
                      if (folderMatiereFilter === 'ALL') return true
                      return fld.matiere === folderMatiereFilter
                    })
                    .map((fld, idx) => (
                      <div key={fld.id} className="group relative">
                        {/* Physical Pochette Flap / Tab Top */}
                        <div className="flex items-center justify-between gap-2 rounded-t-2xl border-t border-x border-blue-400/40 bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent px-4 py-2 w-full font-bold text-xs text-[#3978F6] dark:text-[#7ba9ff] shadow-xs backdrop-blur-md">
                          <div className="flex items-center gap-2 min-w-0">
                            <FolderOpen size={14} weight="fill" />
                            <span className="uppercase tracking-wider text-[11px] font-black">Pochette #{idx + 1}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-700 dark:text-slate-200 font-semibold">{fld.matiere}</span>
                            <span className="rounded-md bg-white/70 dark:bg-white/10 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                              {fld.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-slate-400">
                              {fld.pushedDocuments.length} doc{fld.pushedDocuments.length > 1 ? 's' : ''} posé{fld.pushedDocuments.length > 1 ? 's' : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteFolder(fld.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"
                              title="Supprimer la pochette"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Pochette Main Container in Glassmorphism */}
                        <div className="rounded-b-3xl rounded-tr-3xl border border-slate-200/90 bg-white/75 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#101b33]/60 space-y-4 transition-all hover:border-[#3978F6]/60">
                          {/* Top Row: Title, Date, Score */}
                          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-white/10">
                            <div>
                              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                                {fld.title}
                              </h4>
                              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                Mis à jour le {fld.date} {fld.teacher && `• Validé par ${fld.teacher}`}
                              </p>
                            </div>

                            {fld.score && (
                              <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                                {fld.score}
                              </span>
                            )}
                          </div>

                          {/* KaTeX Formula Box (if any) */}
                          {fld.contentLatex && (
                            <div className="rounded-2xl border border-blue-500/25 bg-blue-50/50 p-3 text-xs dark:bg-black/30 dark:border-blue-400/20">
                              <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                                Formule &amp; Démarche Clé :
                              </p>
                              <div className="overflow-x-auto py-1">
                                <MathFormula math={fld.contentLatex} block />
                              </div>
                            </div>
                          )}

                          {/* Pushed Documents in this Pochette */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                              <span className="flex items-center gap-1.5">
                                <Paperclip size={14} weight="bold" className="text-[#3978F6]" />
                                <span>Documents posés dans cette pochette ({fld.pushedDocuments.length})</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                Format manuscrit, code R ou PDF
                              </span>
                            </div>

                            {fld.pushedDocuments.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic py-1">
                                Aucun document posé pour l&apos;instant. Utilisez la zone ci-dessous pour ajouter vos scans ou scripts.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                {fld.pushedDocuments.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-xs dark:border-white/10 dark:bg-black/30 transition hover:border-[#3978F6]"
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
                                        <p className="text-[10px] text-slate-400 font-mono">
                                          {doc.size} • {doc.pushedAt}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setPreviewDocModal(doc)}
                                        className="flex items-center gap-1 rounded-xl bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-[#3978F6] hover:bg-blue-500/20 dark:text-blue-300 transition cursor-pointer"
                                        title="Voir l'aperçu du document"
                                      >
                                        <Eye size={13} weight="bold" />
                                        <span>Aperçu</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          alert(`Téléchargement de : ${doc.name}`)
                                        }}
                                        className="rounded-xl p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                                        title="Télécharger"
                                      >
                                        <DownloadSimple size={14} weight="bold" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveDocFromFolder(fld.id, doc.id)}
                                        className="rounded-xl p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
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

                          {/* Poser Document Zone (Dropzone Interactive) */}
                          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#3978F6]/35 bg-blue-50/30 p-3.5 hover:bg-blue-50/60 dark:border-blue-500/25 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 transition cursor-pointer group">
                            <UploadSimple size={20} weight="bold" className="text-[#3978F6] group-hover:scale-110 transition" />
                            <span className="mt-1 text-xs font-bold text-[#101b33] dark:text-white">
                              Poser un document rédigé dans cette pochette
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              Glissez-déposez ou cliquez (PDF manuscrit, script R, LaTeX...)
                            </span>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => handlePushDocToFolder(fld.id, e.target.files)}
                            />
                          </label>

                          {/* Footer Tags & Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {fld.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteFolder(fld.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition cursor-pointer"
                            >
                              <Trash size={13} />
                              <span>Supprimer la pochette</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: MON COMPTE & PARAMÈTRES ÉTENDUS                        */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'compte' && (
              <form onSubmit={handleSaveProfileClick} className="space-y-4 text-xs">
                {/* Identity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.prenom}
                      onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.nom}
                      onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Adresse Email Institutionnelle
                  </label>
                  <div className="relative">
                    <Envelope size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro de Téléphone
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={profile.telephone}
                      onChange={(e) => setProfile({ ...profile, telephone: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                    />
                  </div>
                </div>

                {/* Lycée / Centre */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lycée / Centre de Classes Préparatoires
                  </label>
                  <div className="relative">
                    <Buildings size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={profile.lycee}
                      onChange={(e) => setProfile({ ...profile, lycee: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                    />
                  </div>
                </div>

                {/* Filière & Niveau */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Filière CPGE
                    </label>
                    <select
                      value={profile.filiere}
                      onChange={(e) => setProfile({ ...profile, filiere: e.target.value as typeof profile.filiere })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/40 dark:text-white"
                    >
                      <option value="MP">MP (Maths-Physique)</option>
                      <option value="PSI">PSI (Physique-SI)</option>
                      <option value="PC">PC (Physique-Chimie)</option>
                      <option value="TSI">TSI (Technologie-SI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Niveau d’Études
                    </label>
                    <select
                      value={profile.niveau}
                      onChange={(e) => setProfile({ ...profile, niveau: e.target.value as typeof profile.niveau })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-800 dark:border-white/15 dark:bg-black/40 dark:text-white"
                    >
                      <option value="SPÉ (2e année)">2e année (Spé)</option>
                      <option value="SUP (1re année)">1re année (Sup)</option>
                    </select>
                  </div>
                </div>

                {/* Password Change Sub-section */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-white/5 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                    <LockKey size={15} weight="bold" className="text-[#3978F6]" />
                    <span>Sécurité & Modification du mot de passe</span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                      Mot de passe actuel (optionnel si non modifié)
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nouveau MDP"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                        Confirmation
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmer"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-white/15 dark:bg-black/30 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3978F6] to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                  >
                    <FloppyDisk size={16} weight="bold" />
                    <span>Enregistrer les modifications</span>
                  </button>
                </div>

                {/* Logout option */}
                {onLogout && (
                  <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 text-center">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition cursor-pointer"
                    >
                      <SignOut size={15} weight="bold" />
                      <span>Se déconnecter de la session</span>
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#0f1d38] space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-500/15 text-[#3978F6]">
              <WarningCircle size={28} weight="fill" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Confirmer les modifications ?
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Vos informations ({profile.prenom} {profile.nom}, filière {profile.filiere}, lycée {profile.lycee}) seront mises à jour sur votre espace CPGE.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border border-slate-300 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmProfileChanges}
                className="flex-1 rounded-xl bg-[#3978F6] py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Glassmorphic Preview Modal */}
      {previewDocModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-white/20 bg-white/95 dark:bg-[#0c172d]/95 backdrop-blur-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-white/10 bg-slate-50/80 dark:bg-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
                    previewDocModal.type === 'pdf'
                      ? 'bg-rose-500/15 text-rose-500'
                      : previewDocModal.type === 'code'
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : previewDocModal.type === 'image'
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-blue-500/15 text-blue-500'
                  }`}
                >
                  {previewDocModal.type === 'pdf' ? (
                    <FilePdf size={22} weight="bold" />
                  ) : previewDocModal.type === 'code' ? (
                    <FileCode size={22} weight="bold" />
                  ) : previewDocModal.type === 'image' ? (
                    <ImageIcon size={22} weight="bold" />
                  ) : (
                    <FileText size={22} weight="bold" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {previewDocModal.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {previewDocModal.type.toUpperCase()} • {previewDocModal.size} • Ajouté le {previewDocModal.pushedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => alert(`Téléchargement direct de : ${previewDocModal.name}`)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#3978F6] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
                  title="Télécharger le fichier"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span className="hidden sm:inline">Télécharger</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 dark:text-slate-300 transition cursor-pointer"
                  title="Fermer"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {previewDocModal.type === 'pdf' ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40 font-serif text-slate-800 dark:text-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10 font-sans text-xs">
                    <span className="font-bold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
                      Document Numérisé CPGE
                    </span>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Vérifié Conforme
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-sans">Concours National Commun & Grandes Écoles</p>
                    <h4 className="text-base font-bold mt-1 text-slate-900 dark:text-white font-sans">
                      {previewDocModal.name.replace('.pdf', '')}
                    </h4>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5 space-y-3 font-sans text-xs">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Extrait de rédaction & Formules clés :</p>
                    <div className="p-3 bg-white dark:bg-black/30 rounded-lg border border-slate-200/60 dark:border-white/5 space-y-2">
                      <div className="text-[12px] text-slate-600 dark:text-slate-300">
                        1. Diagonalisation et projection spectrale :
                      </div>
                      <div className="py-1 text-center">
                        <MathFormula math="P^{-1} A P = \operatorname{diag}(\lambda_1, \dots, \lambda_n) \implies e^{tA} = P \, \operatorname{diag}(e^{t\lambda_1}, \dots, e^{t\lambda_n}) \, P^{-1}" block />
                      </div>
                      <div className="text-[12px] text-slate-600 dark:text-slate-300">
                        2. Convergence de l'intégrale généralisée :
                      </div>
                      <div className="py-1 text-center">
                        <MathFormula math="\int_0^{+\infty} \frac{\sin(t)}{t} \, \mathrm{d}t = \frac{\pi}{2}" block />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans pt-2 border-t border-slate-100 dark:border-white/5">
                    <span>Page 1 / 4 (Aperçu rapide)</span>
                    <span className="italic">Nexos Learning • Archive Personnelle</span>
                  </div>
                </div>
              ) : previewDocModal.type === 'code' ? (
                <div className="rounded-2xl border border-slate-800 bg-[#0d1117] p-4 text-xs font-mono text-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400 inline-block" />
                      {previewDocModal.name}
                    </span>
                    <span>R / Python Quant Script</span>
                  </div>
                  <pre className="overflow-x-auto p-2 leading-relaxed text-slate-300 text-[11px]">
{`# ==============================================================================
# Simulation de trajectoire stochastique & Valorisation Optionnelle
# ==============================================================================

monte_carlo_pricing <- function(S0 = 100, K = 105, r = 0.03, sigma = 0.22, T = 1.0, N_sim = 20000) {
  dt <- T
  drift <- (r - 0.5 * sigma^2) * dt
  vol <- sigma * sqrt(dt)
  
  # Tirage gaussien standard
  Z <- rnorm(N_sim)
  ST <- S0 * exp(drift + vol * Z)
  
  # Payoff Call Européen
  payoffs <- pmax(ST - K, 0)
  discounted_price <- exp(-r * T) * mean(payoffs)
  std_error <- exp(-r * T) * (sd(payoffs) / sqrt(N_sim))
  
  return(list(
    prix = round(discounted_price, 4),
    erreur_standard = round(std_error, 5),
    nb_trajectoires = N_sim
  ))
}

# Exécution de validation
res <- monte_carlo_pricing(S0 = 100, K = 100, r = 0.05, sigma = 0.2, T = 0.5)
print(paste("Prix estimé :", res$prix, "+/-", res$erreur_standard))`}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-white/10 dark:bg-white/5 text-center space-y-3">
                  <div className="size-16 rounded-3xl bg-blue-500/10 text-[#3978F6] flex items-center justify-center">
                    <FileText size={36} weight="duotone" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {previewDocModal.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                      Fiche de synthèse personnelle stockée dans votre classeur sécurisé Nexos. Ce fichier est prêt à être exporté ou imprimé.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200/80 px-6 py-3.5 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Emplacement : Fiches & Rapports Étudiant
              </span>
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="rounded-xl border border-slate-300 px-4 py-1.5 font-bold text-slate-700 hover:bg-slate-200 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={18} weight="fill" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
