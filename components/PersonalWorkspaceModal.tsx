'use client'

import { useState } from 'react'
import {
  X,
  Check,
  CheckCircle,
  WarningCircle,
  PencilSimple,
  Trash,
  Plus,
  LockKey,
  User,
  GraduationCap,
  Sparkle,
  FileText,
  NotePencil,
  Clock,
  ArrowRight,
  FolderOpen,
  Eye,
  DownloadSimple,
  FloppyDisk,
  Lightning,
  Star,
  Buildings,
} from '@phosphor-icons/react'
import { MathFormula } from './MathFormula'

export interface PersonalFile {
  id: string
  title: string
  category: 'Corrigé Personnel' | 'Rapport de Devoir' | 'Fiche de Synthèse' | 'Bloc-notes QCM'
  matiere: 'Mathématiques' | 'Physique' | 'SI' | 'Informatique'
  date: string
  content: string
  tags: string[]
}

export interface UserAccountData {
  fullName: string
  email: string
  filiere: 'MP' | 'PSI' | 'PC' | 'TSI'
  niveau: 'SUP' | 'SPÉ'
  center: string
  avatarInitials: string
}

interface PersonalWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
  user?: UserAccountData
  onUpdateUser?: (updated: UserAccountData) => void
  onNavigateToLogin?: () => void
}

const INITIAL_USER: UserAccountData = {
  fullName: 'Achraf Lemrani',
  email: 'achraf.lemrani@cpge.ma',
  filiere: 'MP',
  niveau: 'SPÉ',
  center: 'Lycée Moulay Youssef (Rabat)',
  avatarInitials: 'AL',
}

const INITIAL_FILES: PersonalFile[] = [
  {
    id: 'file-1',
    title: 'Corrigé Personnel — CNC 2024 Maths 1 (Endomorphismes de rang 1)',
    category: 'Corrigé Personnel',
    matiere: 'Mathématiques',
    date: '18 Octobre 2026',
    content: `## Remarques personnelles sur l'épreuve
1. La décomposition $E = \\ker(u) \\oplus \\mathrm{Im}(u)$ n'est valable que lorsque $\\mathrm{Tr}(u) \\neq 0$.
2. Formule clef pour la réduction :
$$u^2 = \\mathrm{Tr}(u) \\cdot u$$
3. Attention au piège de la question 4.b : bien vérifier la séparabilité du polynôme minimal avant de conclure à la diagonalisabilité.`,
    tags: ['CNC 2024', 'Endomorphismes', 'Algèbre Linéaire'],
  },
  {
    id: 'file-2',
    title: 'Rapport de Devoir — Mécanique Vibratoire & Amortisseurs',
    category: 'Rapport de Devoir',
    matiere: 'Physique',
    date: '15 Octobre 2026',
    content: `## Bilan des points faibles identifiés
- Manque de rapidité sur la mise en équations par Lagrange.
- Rappel du terme de dissipation de Rayleigh :
$$\\mathcal{D} = \\frac{1}{2} d \\dot{x}^2$$
- Conseil du professeur : toujours vérifier l'homogénéité dimensionnelle de la pulsation propre $\\omega_0 = \\sqrt{k/m}$.`,
    tags: ['DM 2', 'Lagrange', 'Oscillateurs'],
  },
  {
    id: 'file-3',
    title: 'Fiche Méthodologique — Dérivation sous le signe somme',
    category: 'Fiche de Synthèse',
    matiere: 'Mathématiques',
    date: '12 Octobre 2026',
    content: `## Théorème d'interversion dérivation / intégrale
Pour $F(x) = \\int_I f(x, t) dt$ :
1. Continuité par morceaux sur $I$ pour tout $x$.
2. Dérivabilité par rapport à $x$.
3. Hypothèse de domination sur tout segment : $|\\frac{\\partial f}{\\partial x}(x, t)| \\le \\varphi(t)$ avec $\\varphi$ intégrable.`,
    tags: ['Analyse', 'Intégrales à paramètres', 'Théorèmes clefs'],
  },
]

export function PersonalWorkspaceModal({
  isOpen,
  onClose,
  user = INITIAL_USER,
  onUpdateUser,
  onNavigateToLogin,
}: PersonalWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<'workspace' | 'settings' | 'qcm'>('workspace')
  const [userData, setUserData] = useState<UserAccountData>(user)
  const [isEditingAccount, setIsEditingAccount] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState<UserAccountData>(user)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Personal Files State
  const [files, setFiles] = useState<PersonalFile[]>(INITIAL_FILES)
  const [selectedFile, setSelectedFile] = useState<PersonalFile | null>(INITIAL_FILES[0])
  const [fileFilter, setFileFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreatingFile, setIsCreatingFile] = useState(false)

  // New file form
  const [newFileTitle, setNewFileTitle] = useState('')
  const [newFileCategory, setNewFileCategory] = useState<PersonalFile['category']>('Corrigé Personnel')
  const [newFileMatiere, setNewFileMatiere] = useState<PersonalFile['matiere']>('Mathématiques')
  const [newFileContent, setNewFileContent] = useState('')
  const [newFileTags, setNewFileTags] = useState('')

  // QCM Quick Practice State
  const [qcmAnswer, setQcmAnswer] = useState<number | null>(null)
  const [qcmSubmitted, setQcmSubmitted] = useState(false)

  if (!isOpen) return null

  // Account editing handlers
  const handleStartEdit = () => {
    setEditForm(userData)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError(null)
    setIsEditingAccount(true)
  }

  const handlePreSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.')
      return
    }
    setPasswordError(null)
    setShowConfirmModal(true)
  }

  const handleConfirmSave = () => {
    setUserData(editForm)
    if (onUpdateUser) onUpdateUser(editForm)
    setShowConfirmModal(false)
    setIsEditingAccount(false)
    setSaveSuccessMessage('Informations de compte mises à jour avec succès !')
    setTimeout(() => setSaveSuccessMessage(null), 4000)
  }

  // Personal Files handlers
  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFileTitle.trim()) return

    const newDoc: PersonalFile = {
      id: `file-${Date.now()}`,
      title: newFileTitle.trim(),
      category: newFileCategory,
      matiere: newFileMatiere,
      date: "Aujourd'hui",
      content: newFileContent.trim() || 'Notes en cours de rédaction...',
      tags: newFileTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    setFiles([newDoc, ...files])
    setSelectedFile(newDoc)
    setIsCreatingFile(false)
    setNewFileTitle('')
    setNewFileContent('')
    setNewFileTags('')
  }

  const handleDeleteFile = (id: string) => {
    if (confirm('Supprimer ce document de votre espace personnel ?')) {
      const remaining = files.filter((f) => f.id !== id)
      setFiles(remaining)
      if (selectedFile?.id === id) {
        setSelectedFile(remaining[0] || null)
      }
    }
  }

  const filteredFiles = files.filter((f) => {
    if (fileFilter !== 'all' && f.category !== fileFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = f.title.toLowerCase().includes(q)
      const matchContent = f.content.toLowerCase().includes(q)
      const matchTag = f.tags.some((t) => t.toLowerCase().includes(q))
      if (!matchTitle && !matchContent && !matchTag) return false
    }
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex h-[92vh] max-h-[880px] w-full max-w-[1240px] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-[#f8fafc] text-slate-800 shadow-2xl dark:border-white/10 dark:bg-[#0c1424] dark:text-white">
        {/* Top Header of Personal Workspace */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 py-4 dark:border-white/10 dark:bg-[#101b33]">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3978F6] to-indigo-600 text-white font-black text-sm shadow-md">
              {userData.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {userData.fullName}
                </h2>
                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  Filière {userData.filiere} • {userData.niveau}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userData.center} • {userData.email}
              </p>
            </div>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1 text-xs dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition ${
                activeTab === 'workspace'
                  ? 'bg-white text-[#3978F6] shadow-xs dark:bg-[#1a2f55] dark:text-white'
                  : 'text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <FolderOpen size={15} weight={activeTab === 'workspace' ? 'fill' : 'bold'} />
              <span>Fichiers & Rapports ({files.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qcm')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition ${
                activeTab === 'qcm'
                  ? 'bg-white text-purple-600 shadow-xs dark:bg-purple-900/40 dark:text-purple-300'
                  : 'text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Sparkle size={15} weight={activeTab === 'qcm' ? 'fill' : 'bold'} />
              <span>Entraînement QCM</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition ${
                activeTab === 'settings'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <User size={15} weight={activeTab === 'settings' ? 'fill' : 'bold'} />
              <span>Paramètres du Compte</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition"
            title="Fermer"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMessage && (
          <div className="flex items-center gap-2 bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle size={16} weight="bold" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Tab 1: PERSONAL WORKSPACE (FICHIERS, CORRIGÉS & RAPPORTS) */}
        {activeTab === 'workspace' && (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left Sidebar: List of Student Files */}
            <div className="w-full sm:w-80 md:w-96 shrink-0 border-r border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-[#091120] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Mes Documents Personnels
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreatingFile(true)}
                    className="flex items-center gap-1 rounded-xl bg-[#3978F6] px-2.5 py-1 text-xs font-bold text-white shadow-xs transition hover:bg-blue-600"
                  >
                    <Plus size={13} weight="bold" />
                    <span>Nouveau</span>
                  </button>
                </div>

                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un rapport, corrigé..."
                  className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {['all', 'Corrigé Personnel', 'Rapport de Devoir', 'Fiche de Synthèse'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFileFilter(cat)}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                        fileFilter === cat
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      {cat === 'all' ? 'Tous' : cat}
                    </button>
                  ))}
                </div>

                {/* Files List */}
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-360px)] pr-1">
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFile?.id === file.id
                    return (
                      <div
                        key={file.id}
                        onClick={() => {
                          setSelectedFile(file)
                          setIsCreatingFile(false)
                        }}
                        className={`group cursor-pointer rounded-2xl p-3 border transition ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20'
                            : 'border-slate-200/70 bg-white hover:border-slate-300 dark:border-white/5 dark:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="rounded-md bg-blue-500/15 px-1.5 py-0.2 font-mono text-[9px] font-bold text-blue-700 dark:text-blue-300">
                            {file.category}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{file.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {file.title}
                        </h4>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{file.matiere}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFile(file.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-700 transition"
                            title="Supprimer"
                          >
                            <Trash size={13} weight="bold" />
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {filteredFiles.length === 0 && (
                    <p className="text-center py-6 text-xs text-slate-400">
                      Aucun document trouvé.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 text-center">
                <span className="font-mono text-[11px] text-slate-400">
                  {files.length} document(s) sauvegardé(s) localement
                </span>
              </div>
            </div>

            {/* Right Main Panel: Document Reader or Creator */}
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0c1424]">
              {isCreatingFile ? (
                /* CREATE NEW FILE FORM */
                <form onSubmit={handleCreateFile} className="max-w-2xl mx-auto space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-white/10">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Rédiger un Nouveau Document Personnel
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsCreatingFile(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    >
                      Annuler
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Titre du document *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFileTitle}
                      onChange={(e) => setNewFileTitle(e.target.value)}
                      placeholder="ex: Corrigé personnel DM 4 — Réduction matricielle"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Catégorie
                      </label>
                      <select
                        value={newFileCategory}
                        onChange={(e) => setNewFileCategory(e.target.value as PersonalFile['category'])}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="Corrigé Personnel">Corrigé Personnel</option>
                        <option value="Rapport de Devoir">Rapport de Devoir</option>
                        <option value="Fiche de Synthèse">Fiche de Synthèse</option>
                        <option value="Bloc-notes QCM">Bloc-notes QCM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Matière
                      </label>
                      <select
                        value={newFileMatiere}
                        onChange={(e) => setNewFileMatiere(e.target.value as PersonalFile['matiere'])}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="Mathématiques">Mathématiques</option>
                        <option value="Physique">Physique & Chimie</option>
                        <option value="SI">Sciences Industrielles (SI)</option>
                        <option value="Informatique">Informatique</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mots-clés / Tags (séparés par virgules)
                    </label>
                    <input
                      type="text"
                      value={newFileTags}
                      onChange={(e) => setNewFileTags(e.target.value)}
                      placeholder="CNC 2024, Démonstration, Remarques"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contenu & Notes (Formules LaTeX $...$ supportées)
                    </label>
                    <textarea
                      rows={8}
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      placeholder="Rédigez vos étapes de résolution, théorèmes clefs ou remarques..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingFile(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                    >
                      <FloppyDisk size={14} weight="bold" />
                      <span>Enregistrer le Document</span>
                    </button>
                  </div>
                </form>
              ) : selectedFile ? (
                /* READ SELECTED FILE */
                <div className="max-w-3xl mx-auto space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-white/10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                          {selectedFile.category}
                        </span>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {selectedFile.matiere} • {selectedFile.date}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        {selectedFile.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(selectedFile.id)}
                        className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300"
                      >
                        <Trash size={13} weight="bold" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFile.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:border-white/5 dark:bg-white/5 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Content viewer */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 dark:border-white/5 dark:bg-white/5">
                    <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedFile.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <FolderOpen size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Sélectionnez un document ou créez-en un nouveau.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: QCM TRAINER & AUTO-ÉVALUATION (MASQUÉ DANS LE WORKSPACE) */}
        {activeTab === 'qcm' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white dark:bg-[#0c1424]">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-b border-slate-200/80 pb-4 dark:border-white/10">
                <span className="rounded-full bg-purple-500/15 px-3 py-0.5 font-mono text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  ESPACE PERSONNEL • ENTRAÎNEMENT QCM
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  Banque Personnelle de QCM Adaptatif
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Testez vos réflexes sur les questions types des concours sans pression et suivez votre taux de maîtrise.
                </p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 dark:border-white/10 dark:bg-white/5 text-center">
                  <span className="block font-mono text-2xl font-black text-purple-600 dark:text-purple-400">
                    84%
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Taux de Maîtrise</span>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 dark:border-white/10 dark:bg-white/5 text-center">
                  <span className="block font-mono text-2xl font-black text-blue-600 dark:text-blue-400">
                    36
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">QCM Résolus</span>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 dark:border-white/10 dark:bg-white/5 text-center">
                  <span className="block font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    12 Jours
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Série Active</span>
                </div>
              </div>

              {/* Sample Interactive Question */}
              <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-50/30 to-white p-6 dark:from-purple-950/20 dark:to-transparent dark:border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
                    Question d'auto-évaluation rapide (Maths — Réduction)
                  </span>
                  <span className="font-mono text-xs text-slate-500">Chrono suggéré : 90s</span>
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  {'Soit A ∈ M_n(R) telle que A³ = A. Laquelle des assertions suivantes est toujours vraie ?'}
                </p>

                <div className="mt-4 space-y-2">
                  {[
                    { id: 0, text: 'A est obligatoirement inversible.' },
                    { id: 1, text: 'A est diagonalisable dans M_n(R).', correct: true },
                    { id: 2, text: 'A est nécessairement la matrice nulle ou l’identité.' },
                    { id: 3, text: 'Le spectre de A est exactement {-1, 0, 1}.' },
                  ].map((opt) => {
                    const isSelected = qcmAnswer === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setQcmAnswer(opt.id)
                          setQcmSubmitted(true)
                        }}
                        className={`w-full rounded-2xl p-3.5 text-left text-xs font-semibold border transition ${
                          qcmSubmitted
                            ? opt.correct
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : isSelected
                              ? 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-300'
                              : 'border-slate-200 bg-white opacity-60 dark:border-white/5 dark:bg-white/5'
                            : isSelected
                            ? 'border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-950/30 dark:text-purple-200'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{['A', 'B', 'C', 'D'][opt.id]}.</span>
                          <span>{opt.text}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {qcmSubmitted && (
                  <div className="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
                    <strong>Explication :</strong> {'Le polynôme P(X) = X³ - X = X(X-1)(X+1) annule A. Comme P est scindé à racines simples sur R, la matrice A est diagonalisable.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: PARAMÈTRES DU COMPTE (MODIFICATION AVEC CONFIRMATION) */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white dark:bg-[#0c1424]">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-white/10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Paramètres du Compte Étudiant
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Gérez votre identité, votre filière d'inscription CPGE et votre mot de passe de connexion.
                  </p>
                </div>

                {!isEditingAccount ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 rounded-2xl bg-[#3978F6] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-600"
                  >
                    <PencilSimple size={15} weight="bold" />
                    <span>Modifier mes informations</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingAccount(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"
                  >
                    Annuler l'édition
                  </button>
                )}
              </div>

              {/* READ-ONLY VIEW */}
              {!isEditingAccount ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Nom Complet</span>
                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{userData.fullName}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Adresse Email</span>
                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{userData.email}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Filière CPGE</span>
                      <p className="mt-1 text-sm font-black text-blue-600 dark:text-blue-400">Filière {userData.filiere}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Niveau d'Études</span>
                      <p className="mt-1 text-sm font-black text-purple-600 dark:text-purple-400">
                        {userData.niveau === 'SUP' ? '1ère Année (SUP)' : '2ème Année (SPÉ)'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Établissement / Centre CPGE</span>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{userData.center}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Mot de Passe</span>
                      <p className="mt-1 text-sm font-mono text-slate-500">••••••••••••</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Changer le mot de passe
                    </button>
                  </div>

                  {onNavigateToLogin && (
                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={onNavigateToLogin}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300"
                      >
                        Changer de session / Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* EDIT FORM WITH CONFIRMATION */
                <form onSubmit={handlePreSave} className="space-y-4">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-700 dark:text-blue-300">
                    Modifiez vos champs ci-dessous. Vous devrez confirmer ces modifications avant leur enregistrement.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nom Complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Adresse Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Filière CPGE *
                      </label>
                      <select
                        value={editForm.filiere}
                        onChange={(e) =>
                          setEditForm({ ...editForm, filiere: e.target.value as UserAccountData['filiere'] })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="MP">MP (Mathématiques & Physique)</option>
                        <option value="PSI">PSI (Physique & Sc. de l'Ingénieur)</option>
                        <option value="PC">PC (Physique-Chimie)</option>
                        <option value="TSI">TSI (Technologie & Sc. Industrielles)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Niveau CPGE *
                      </label>
                      <select
                        value={editForm.niveau}
                        onChange={(e) =>
                          setEditForm({ ...editForm, niveau: e.target.value as UserAccountData['niveau'] })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="SUP">SUP (1ère Année CPGE)</option>
                        <option value="SPÉ">SPÉ (2ème Année CPGE)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lycée / Centre CPGE
                    </label>
                    <input
                      type="text"
                      value={editForm.center}
                      onChange={(e) => setEditForm({ ...editForm, center: e.target.value })}
                      placeholder="ex: Lycée Moulay Youssef (Rabat)"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  {/* Password section */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 space-y-3">
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Changement de Mot de Passe (laisser vide si inchangé)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nouveau mot de passe"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmer le mot de passe"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                    </div>
                    {passwordError && (
                      <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditingAccount(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                    >
                      <FloppyDisk size={14} weight="bold" />
                      <span>Enregistrer avec Confirmation</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION POPUP MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#101b33]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300">
                <WarningCircle size={24} weight="bold" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Confirmer les modifications ?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Validation des paramètres du compte
                </p>
              </div>
            </div>

            <div className="my-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-xs text-slate-700 dark:bg-white/5 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Filière choisie :</strong> Filière {editForm.filiere} ({editForm.niveau})
              </p>
              <p>
                <strong>Nom :</strong> {editForm.fullName}
              </p>
              <p>
                <strong>Email :</strong> {editForm.email}
              </p>
              {newPassword && (
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Le mot de passe sera mis à jour.
                </p>
              )}
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Ces modifications adapteront automatiquement les coefficients et la progression de vos modules.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex items-center gap-1.5 rounded-xl bg-[#3978F6] px-5 py-2 text-xs font-black text-white shadow-md hover:bg-blue-600"
              >
                <Check size={14} weight="bold" />
                <span>Confirmer & Appliquer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
