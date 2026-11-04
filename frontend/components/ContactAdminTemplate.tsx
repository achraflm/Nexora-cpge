'use client'

import { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react'
import {
  Paperclip,
  PaperPlaneRight,
  ArrowLeft,
  FilePdf,
  FileText,
  FileCode,
  Image as ImageIcon,
  Archive,
  X,
  Sparkle,
  CheckCircle,
  Clock,
  User,
  ShieldCheck,
  SidebarSimple,
  ArrowsClockwise,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Info,
  WarningCircle,
  DownloadSimple,
  GraduationCap,
  CaretDown,
  MagnifyingGlass,
  Plus,
  Eye,
  Lightning,
} from '@phosphor-icons/react'
import { NexoraLogo } from './NexoraLogo'
import { ThemeToggle } from './ThemeToggle'
import { MathFormula } from './MathFormula'
import { Footer } from './Footer'

export interface AttachedFile {
  id: string
  name: string
  size: string
  type: string
  url?: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'admin'
  senderName: string
  senderRole?: string
  avatar?: string
  content: string
  math?: string
  codeSnippet?: string
  timestamp: string
  attachments?: AttachedFile[]
  status?: 'sent' | 'delivered' | 'read'
  ticketId?: string
}

interface TicketItem {
  id: string
  title: string
  category: 'Pédagogique' | 'Technique'
  status: 'Résolu' | 'En cours' | 'Nouveau'
  date: string
  lastMessage: string
  unread?: boolean
}

export function ContactAdminTemplate({
  onBackToDashboard,
  hideHeader = false,
}: {
  onBackToDashboard: () => void
  hideHeader?: boolean
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentTicketId, setCurrentTicketId] = useState('NX-2026-084')
  const [department, setDepartment] = useState<'pedagogique' | 'technique'>('pedagogique')
  const [inputText, setInputText] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const tickets: TicketItem[] = [
    {
      id: 'NX-2026-084',
      title: 'Validation & Relecture Capstone R Churn',
      category: 'Pédagogique',
      status: 'En cours',
      date: 'Aujourd’hui, 18:42',
      lastMessage: 'Bonjour Achraf, j’ai bien reçu votre pipeline R...',
    },
    {
      id: 'NX-2026-079',
      title: 'Question Ex 19.4 — Seuil optimal & Coûts',
      category: 'Pédagogique',
      status: 'Résolu',
      date: 'Hier, 15:20',
      lastMessage: 'La solution analytique avec McNemar est conforme.',
    },
    {
      id: 'NX-2026-061',
      title: 'Recommandation méthodologique colle de Mathématiques',
      category: 'Pédagogique',
      status: 'Résolu',
      date: '12 Octobre',
      lastMessage: 'Fiche méthode sur les projecteurs spectraux transmise.',
    },
    {
      id: 'NX-2026-042',
      title: 'Rendu LaTeX des matrices de corrélation',
      category: 'Technique',
      status: 'Résolu',
      date: '04 Octobre',
      lastMessage: 'Le cache CDN a été purgé avec succès.',
    },
  ]

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      senderName: 'Achraf Lemrani',
      senderRole: 'Étudiant CPGE — Filière MP',
      content:
        "Bonjour Monsieur Mansouri, j'ai rédigé ma proposition de solution pour l'exercice 19.4 et j'ai commencé le pipeline du Capstone Telco Churn. Pourriez-vous vérifier si ma normalisation standard dans la validation croisée 5-Fold n'introduit aucun data leakage ?",
      timestamp: '18:35',
      attachments: [
        {
          id: 'att-1',
          name: 'pipeline_telco_churn_v2.R',
          size: '14.2 Ko',
          type: 'code',
        },
        {
          id: 'att-2',
          name: 'Scan_Copie_Ex19_4_Manuscrit.pdf',
          size: '1.8 Mo',
          type: 'pdf',
        },
      ],
      status: 'read',
    },
    {
      id: 'msg-2',
      sender: 'admin',
      senderName: 'Dr. Karim Mansouri',
      senderRole: 'Responsable Pédagogique & Agrégé CPGE',
      content:
        "Bonjour Achraf. Excellente initiative d'avoir attaché votre script R et le scan de votre rédaction manuscrite.\n\nAprès examen de votre code, votre démarche est mathématiquement rigoureuse : calculer $\\mu_j$ et $\\sigma_j$ exclusivement sur `tr` (le pli d'entraînement) avant d'appliquer la transformation à `va` élimine tout risque de data leakage. C'est exactement ce qu'exige le jury du CNC.",
      math: '\\text{tr}\\$x_j \\leftarrow \\frac{\\text{tr}\\$x_j - \\mu_{\\text{tr}}}{\\sigma_{\\text{tr}}}, \\quad \\text{va}\\$x_j \\leftarrow \\frac{\\text{va}\\$x_j - \\mu_{\\text{tr}}}{\\sigma_{\\text{tr}}}',
      timestamp: '18:42',
      ticketId: 'NX-2026-084',
    },
  ])

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Auto-resize textarea
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }

  // File Upload Handlers
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    addFiles(files)
  }

  const addFiles = (files: File[]) => {
    const newAttachments: AttachedFile[] = files.map((file) => {
      let type = 'file'
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (['pdf'].includes(ext)) type = 'pdf'
      else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) type = 'image'
      else if (['r', 'py', 'tex', 'js', 'ts', 'cpp'].includes(ext)) type = 'code'
      else if (['zip', 'tar', 'gz'].includes(ext)) type = 'archive'

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo` : `${Math.round(file.size / 1024)} Ko`,
        type,
        url: URL.createObjectURL(file),
      }
    })
    setAttachedFiles((prev) => [...prev, ...newAttachments])
  }

  const removeAttachment = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // Drag and Drop
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  // Send message
  const handleSendMessage = () => {
    if (!inputText.trim() && attachedFiles.length === 0) return

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'Achraf Lemrani',
      senderRole: 'Étudiant CPGE — Filière MP',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      status: 'delivered',
    }

    setMessages((prev) => [...prev, newMsg])
    setInputText('')
    setAttachedFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Simulate Admin / AI Pedagogical Response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const adminReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'admin',
        senderName: department === 'pedagogique' ? 'Dr. Karim Mansouri' : 'Support Technique Nexora',
        senderRole: department === 'pedagogique' ? 'Responsable Pédagogique CPGE' : 'Ingénieur Plateforme',
        content:
          department === 'pedagogique'
            ? "Merci pour votre transmission. Vos documents ont été enregistrés sous le ticket #" + currentTicketId + ". Un professeur référent procède à l'annotation de votre copie et vous retournera les remarques méthodologiques sous 15 minutes."
            : "Nous avons bien pris note de votre signalement technique. Nos équipes vérifient le chargement des dépendances KaTeX et le rendu interactif.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ticketId: currentTicketId,
      }
      setMessages((prev) => [...prev, adminReply])
    }, 1400)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const promptSuggestions = [
    {
      title: 'Soumettre une copie manuscrite (Scan PDF)',
      desc: 'Transmettre un scan d’exercice ou de devoir pour double-correction annotée.',
      category: 'Pédagogique',
      filesHint: 'Joindre un scan .pdf ou .jpg',
      text: 'Bonjour, je vous transmets ma copie scannée de l’exercice 19.3. Pourriez-vous vérifier ma démonstration sur la décomposition de l’erreur de test ?',
    },
    {
      title: 'Revue de code R — Capstone Telco Churn',
      desc: 'Faire relire vos scripts de modélisation et matrices de confusion.',
      category: 'Pédagogique',
      filesHint: 'Joindre votre fichier .R',
      text: 'Bonjour, voici mon script R pour la sélection du seuil optimal par matrice de coût. J’aimerais savoir si la fonction find_optimal_threshold() est optimisée.',
    },
    {
      title: 'Question de cours ou méthode de résolution',
      desc: 'Demander un éclaircissement sur une démonstration ou un théorème du programme.',
      category: 'Pédagogique',
      text: 'Bonjour, pourriez-vous m’éclairer sur l’hypothèse de complétude dans le théorème de projection sur un convexe fermé en dimension infinie ?',
    },
    {
      title: 'Signalement d’un bug d’affichage ou KaTeX',
      desc: 'Informer l’équipe technique d’un problème d’affichage sur votre navigateur.',
      category: 'Technique',
      text: 'Bonjour, j’ai constaté un décalage d’affichage sur le composant de visualisation radar en mode sombre.',
    },
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FilePdf size={20} weight="fill" className="text-rose-500" />
      case 'image':
        return <ImageIcon size={20} weight="fill" className="text-emerald-500" />
      case 'code':
        return <FileCode size={20} weight="fill" className="text-amber-500" />
      case 'archive':
        return <Archive size={20} weight="fill" className="text-purple-500" />
      default:
        return <FileText size={20} weight="fill" className="text-blue-500" />
    }
  }

  return (
    <div
      className="learning-shell student-messages relative flex min-h-screen flex-col bg-transparent text-[#172033] dark:text-[#eaf2ff]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      

      {/* Drag Overlay Notice */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#3978F6]/20 backdrop-blur-md">
          <div className="glass-container flex flex-col items-center gap-3 rounded-2xl p-8 text-center shadow-2xl">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#3978F6]/20 text-[#3978F6]">
              <Paperclip size={36} weight="bold" />
            </div>
            <h3 className="text-lg font-bold text-[#101b33] dark:text-white">
              Déposez vos documents ici
            </h3>
            <p className="text-xs text-[#64748b] dark:text-[#91a9c8]">
              Formats acceptés : PDF, PNG, JPG, script R, Python, LaTeX (.tex) ou archive ZIP.
            </p>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      {hideHeader ? (
        <div className="border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-xl sm:px-6 dark:border-white/10 dark:bg-[#0b1426]/70">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-[#edf4ff] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#101f3c] dark:text-[#eaf2ff]"
                title="Afficher/Masquer le panneau des tickets"
              >
                <SidebarSimple size={16} weight="bold" />
                <span className="hidden sm:inline">Tickets & Conversations</span>
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#101b33] dark:text-white">
                  Contact Administration & Support
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-[#3978F6]/15 px-2 py-0.5 text-xs font-bold text-[#2866dc] dark:bg-[#3978F6]/30 dark:text-[#9cc0ff]">
                  Assistance Directe
                </span>
              </div>
            </div>

            {/* Department Selector */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 text-xs dark:border-white/10 dark:bg-[#0e1b33]">
              <button
                type="button"
                onClick={() => setDepartment('pedagogique')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                  department === 'pedagogique'
                    ? 'bg-white text-[#3978F6] shadow-xs dark:bg-[#1b2b48] dark:text-white'
                    : 'text-[#64748b] hover:text-[#172033] dark:text-[#91a9c8] dark:hover:text-white'
                }`}
              >
                <GraduationCap size={14} weight="bold" />
                <span>Pédagogique</span>
              </button>
              <button
                type="button"
                onClick={() => setDepartment('technique')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                  department === 'technique'
                    ? 'bg-white text-[#3978F6] shadow-xs dark:bg-[#1b2b48] dark:text-white'
                    : 'text-[#64748b] hover:text-[#172033] dark:text-[#91a9c8] dark:hover:text-white'
                }`}
              >
                <Clock size={14} weight="bold" />
                <span>Technique</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] dark:text-[#4ade80]">
              <span className="size-2 rounded-full bg-[#16a34a] animate-pulse" />
              <span>Admin en ligne (réponse &lt; 15 min)</span>
            </div>
          </div>
        </div>
      ) : (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1426]/90">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
            {/* Left: Brand + Back to Dashboard */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#172033] shadow-xs transition hover:bg-[#edf4ff] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#101f3c] dark:text-[#eaf2ff] dark:hover:bg-[#1a2d4f]"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>Tableau de bord</span>
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />

              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex size-9 items-center justify-center rounded-lg text-[#64748b] hover:bg-black/5 dark:text-[#aab8d0] dark:hover:bg-white/10"
                title="Afficher/Masquer le panneau des tickets"
              >
                <SidebarSimple size={18} weight="bold" />
              </button>

              <div className="flex items-center gap-2">
                <NexoraLogo size={28} showText={false} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xs sm:text-sm font-bold tracking-tight text-[#101b33] dark:text-white">
                      Contact Administration & Encadrement
                    </h1>
                    <span className="hidden sm:inline-flex rounded-full bg-[#3978F6]/15 px-2 py-0.5 text-xs font-bold text-[#2866dc] dark:bg-[#3978F6]/30 dark:text-[#9cc0ff]">
                      Assistance Directe
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Selector */}
            <div className="hidden md:flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 text-xs dark:border-white/10 dark:bg-[#0e1b33]">
              <button
                type="button"
                onClick={() => setDepartment('pedagogique')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                  department === 'pedagogique'
                    ? 'bg-white text-[#3978F6] shadow-xs dark:bg-[#1b2b48] dark:text-white'
                    : 'text-[#64748b] hover:text-[#172033] dark:text-[#91a9c8] dark:hover:text-white'
                }`}
              >
                <GraduationCap size={14} weight="bold" />
                <span>Support Pédagogique (CPGE)</span>
              </button>
              <button
                type="button"
                onClick={() => setDepartment('technique')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                  department === 'technique'
                    ? 'bg-white text-[#3978F6] shadow-xs dark:bg-[#1b2b48] dark:text-white'
                    : 'text-[#64748b] hover:text-[#172033] dark:text-[#91a9c8] dark:hover:text-white'
                }`}
              >
                <Clock size={14} weight="bold" />
                <span>Support Technique</span>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] dark:text-[#4ade80]">
                <span className="size-2 rounded-full bg-[#16a34a] animate-pulse" />
                <span>Admin en ligne (réponse &lt; 15 min)</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>
      )}

      {/* Main Layout Container: Sidebar + Gemini Chat Canvas */}
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 overflow-hidden">
        {/* Left Sidebar: Gemini Conversation / Ticket History */}
        <aside
          className={`glass-container absolute inset-y-0 left-0 z-20 flex w-72 flex-col border-r transition-all duration-300 lg:static ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
          }`}
        >
          {/* New Chat Button */}
          <div className="p-3.5">
            <button
              type="button"
              onClick={() => {
                setMessages([
                  {
                    id: 'msg-welcome',
                    sender: 'admin',
                    senderName: 'Nexora Administration',
                    senderRole: 'Accueil & Support',
                    content:
                      'Nouvelle session ouverte avec l’administration. Posez votre question ou joignez vos copies manuscrites et scripts de code ci-dessous.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ticketId: `NX-2026-${Math.floor(100 + Math.random() * 900)}`,
                  },
                ])
                setCurrentTicketId(`NX-2026-${Math.floor(100 + Math.random() * 900)}`)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3978F6] to-[#2563eb] px-4 py-2.5 text-xs font-bold text-white shadow-none transition hover:brightness-110"
            >
              <Plus size={15} weight="bold" />
              <span>Nouvelle demande / Ticket</span>
            </button>
          </div>

          {/* Ticket list */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 scrollbar-thin">
            <p className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#71809A] dark:text-[#91a9c8]">
              Échanges récents
            </p>
            {tickets.map((t) => {
              const isSelected = t.id === currentTicketId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCurrentTicketId(t.id)}
                  className={`w-full text-left rounded-xl p-2.5 transition text-xs ${
                    isSelected
                      ? 'bg-[#3978F6]/15 border border-[#3978F6]/40 text-[#172033] dark:text-white shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#526484] dark:text-[#94a3b8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-[#3978F6] dark:text-[#74a5ff]">
                      #{t.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.2 rounded-full ${
                        t.status === 'En cours'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="font-semibold truncate text-[#172033] dark:text-[#eaf2ff]">{t.title}</p>
                  <p className="mt-0.5 text-xs truncate text-[#71809A] dark:text-[#91a9c8]">{t.lastMessage}</p>
                </button>
              )
            })}
          </div>

          {/* Admin Team Information Footer inside Sidebar */}
          <div className="border-t border-slate-200/80 p-3.5 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#3978F6]/15 text-[#3978F6]">
                <ShieldCheck size={18} weight="bold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#172033] dark:text-white">Équipe Pédagogique MP</p>
                <p className="text-xs text-[#71809A] dark:text-[#91a9c8]">3 Agrégés & Coordinateurs</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canvas: Gemini Stream with Messages & Bottom Floating Input */}
        <section className="relative flex flex-1 flex-col overflow-hidden">
          {/* Ticket Context Header */}
          <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/40 px-4 py-2 text-xs backdrop-blur-md dark:border-white/5 dark:bg-[#0b1426]/40">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#3978F6] dark:text-[#74a5ff]">
                Ticket #{currentTicketId}
              </span>
              <span className="text-[#64748b] dark:text-[#91a9c8]">•</span>
              <span className="text-[#64748b] dark:text-[#91a9c8]">
                Département :{' '}
                <strong className="text-[#101b33] dark:text-white">
                  {department === 'pedagogique'
                    ? 'Support Pédagogique (CPGE & Devoirs)'
                    : 'Support Technique & Plateforme'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748b] dark:text-[#91a9c8]">
              <Clock size={13} weight="bold" />
              <span>Dernière activité : Il y a 3 min</span>
            </div>
          </div>

          {/* Scrollable Chat Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 space-y-6 scrollbar-thin">
            {/* Gemini Hero Welcome State (if conversation is fresh) */}
            {messages.length <= 2 && (
              <div className="mx-auto max-w-3xl pt-2 pb-4 text-center">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3978F6] via-[#60a5fa] to-[#38bdf8] text-white shadow-none mb-3 animate-pulse">
                  <Sparkle size={30} weight="fill" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101b33] dark:text-white">
                  Bonjour Achraf, comment l’administration peut vous aider ?
                </h2>
                <p className="mt-1.5 text-xs text-[#64748b] dark:text-[#91a9c8] max-w-xl mx-auto">
                  Posez vos questions ou joignez vos documents (copies manuscrites scannées, scripts R de Capstone, énoncés d’annales) pour un accompagnement direct.
                </p>

                {/* 4 Gemini Quick Suggestion Cards */}
                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
                  {promptSuggestions.map((sugg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setInputText(sugg.text)
                        if (textareaRef.current) textareaRef.current.focus()
                      }}
                      className="glass-container group relative rounded-xl p-3 text-left transition hover:border-[#3978F6] hover:shadow-none"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[#3978F6] dark:text-[#74a5ff] mb-1">
                        <span>{sugg.category}</span>
                        {sugg.filesHint && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <Paperclip size={11} /> {sugg.filesHint}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#172033] group-hover:text-[#3978F6] dark:text-[#eaf2ff] transition">
                        {sugg.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#64748b] dark:text-[#91a9c8]">
                        {sugg.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Bubble Thread */}
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user'

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0">
                      {isUser ? (
                        <div className="flex size-9 items-center justify-center rounded-full bg-[#3978F6] text-xs font-bold text-white shadow-none">
                          AL
                        </div>
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#1e3a8a] to-[#3978F6] p-1.5 shadow-none">
                          <NexoraLogo size={22} showText={false} />
                        </div>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      {/* Name & Role Header */}
                      <div className="flex items-center gap-2 mb-1.5 px-2 text-xs text-[#71809A] dark:text-[#91a9c8]">
                        <span className="font-bold text-[#101b33] dark:text-[#eaf2ff]">{msg.senderName}</span>
                        {msg.senderRole && (
                          <span className="hidden sm:inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                            {msg.senderRole}
                          </span>
                        )}
                        <span className="text-xs font-mono flex items-center gap-1">
                          <Clock size={11} />
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Main Message Bubble - Elevated Readability & Typography */}
                      <div
                        className={`message-bubble rounded-2xl p-5 text-[14px] leading-[1.7] shadow-sm transition-all ${
                          isUser
                            ? 'message-bubble-user text-white rounded-tr-xs border border-blue-400/20'
                            : 'message-bubble-admin text-[#172033] dark:text-[#eaf2ff] rounded-tl-xs border border-slate-200/90 dark:border-white/10'
                        }`}
                      >
                        {/* Text */}
                        <div className="whitespace-pre-line">{msg.content}</div>

                        {/* KaTeX Math Box (if any) with Copy LaTeX button */}
                        {msg.math && (
                          <div className={`my-3.5 rounded-2xl p-3.5 border ${
                            isUser
                              ? 'bg-black/35 border-white/20 text-white'
                              : 'bg-blue-50/70 border-blue-200/70 text-blue-950 dark:bg-black/40 dark:border-blue-500/20 dark:text-blue-100'
                          }`}>
                            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-black/10 dark:border-white/10 text-xs font-bold">
                              <span className="flex items-center gap-1.5">
                                <Lightning size={13} weight="fill" className="text-amber-400" />
                                <span>Formule & Démarche KaTeX</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.math || '')
                                  alert('Formule LaTeX copiée dans le presse-papier !')
                                }}
                                className="text-xs hover:underline cursor-pointer opacity-90 hover:opacity-100"
                                title="Copier le code LaTeX"
                              >
                                Copier LaTeX
                              </button>
                            </div>
                            <div className="overflow-x-auto py-1">
                              <MathFormula math={msg.math} block />
                            </div>
                          </div>
                        )}

                        {/* Display Attached Documents with Dual Preview & Download Actions */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/20 dark:border-white/10 space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                              Documents joints ({msg.attachments.length}) :
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {msg.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className={`flex items-center justify-between gap-2 rounded-2xl p-3 transition border ${
                                    isUser
                                      ? 'bg-white/15 hover:bg-white/25 border-white/25 text-white'
                                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-[#3978F6] text-[#172033] dark:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/20 dark:bg-white/10 shadow-xs">
                                      {getFileIcon(att.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-bold">{att.name}</p>
                                      <p className="text-xs opacity-75 font-mono">{att.size}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewFile(att)}
                                      className="flex items-center gap-1 rounded-lg bg-blue-500/20 px-2 py-1 text-xs font-bold text-white hover:bg-blue-500/30 transition cursor-pointer"
                                      title="Aperçu du document"
                                    >
                                      <Eye size={13} weight="bold" />
                                      <span>Aperçu</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => alert(`Téléchargement de ${att.name}`)}
                                      className="p-1 rounded-md hover:bg-white/20 transition cursor-pointer"
                                      title="Télécharger"
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

                      {/* Admin Message Action Bar (Copy / Feedback) */}
                      {!isUser && (
                        <div className="mt-1 flex items-center gap-2 px-1 text-xs text-[#71809A] dark:text-[#91a9c8]">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-1 hover:text-[#3978F6] transition"
                            title="Copier la réponse"
                          >
                            <Copy size={13} />
                            <span>{copiedId === msg.id ? 'Copié !' : 'Copier'}</span>
                          </button>
                          <span>•</span>
                          <button type="button" className="hover:text-emerald-500 transition" title="Réponse utile">
                            <ThumbsUp size={13} />
                          </button>
                          <button type="button" className="hover:text-rose-500 transition" title="À clarifier">
                            <ThumbsDown size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Typing Animation */}
              {isTyping && (
                <div className="flex gap-3 items-center">
                  <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#1e3a8a] to-[#3978F6] p-1.5 shadow-none">
                    <NexoraLogo size={22} showText={false} />
                  </div>
                  <div className="glass-container flex items-center gap-1.5 rounded-2xl px-4 py-3 shadow-md">
                    <span className="text-xs text-[#64748b] dark:text-[#91a9c8] mr-1">
                      L’équipe administrative prépare une réponse
                    </span>
                    <span className="size-1.5 rounded-full bg-[#3978F6] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-1.5 rounded-full bg-[#3978F6] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-1.5 rounded-full bg-[#3978F6] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Gemini Floating Input Pill at Bottom */}
          <div className="sticky bottom-0 z-20 w-full px-4 pb-4 pt-2">
            <div className="mx-auto max-w-3xl">
              {/* Attached Files Preview Bar (Before Sending) */}
              {attachedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2 rounded-xl border border-[#3978F6]/30 bg-white/90 p-2.5 backdrop-blur-xl shadow-lg dark:bg-[#0b1426]/90">
                  {attachedFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-white/10 dark:bg-[#15233e]"
                    >
                      {getFileIcon(f.type)}
                      <span className="max-w-[160px] truncate font-medium text-[#172033] dark:text-white">
                        {f.name}
                      </span>
                      <span className="text-xs text-[#64748b] dark:text-[#91a9c8]">({f.size})</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(f.id)}
                        className="text-[#64748b] hover:text-rose-500 transition ml-1"
                        title="Retirer"
                      >
                        <X size={13} weight="bold" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-dashed border-[#3978F6]/40 px-2.5 py-1 text-xs font-semibold text-[#3978F6] hover:bg-[#3978F6]/10 transition"
                  >
                    <Plus size={13} weight="bold" />
                    <span>Ajouter un autre fichier</span>
                  </button>
                </div>
              )}

              {/* The Gemini Input Pill */}
              <div className="glass-panel relative flex flex-col rounded-3xl border border-[#3978F6]/35 bg-white/80 p-2 shadow-[0_10px_35px_-5px_rgba(57,120,246,0.25)] backdrop-blur-2xl transition focus-within:border-[#3978F6] focus-within:shadow-[0_10px_40px_-5px_rgba(57,120,246,0.4)] dark:bg-[#0b162c]/90">
                {/* Hidden Native File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.tex,.R,.py,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question à l’administration ou glissez vos documents (scan de copie, script R, PDF)..."
                  rows={1}
                  className="w-full resize-none bg-transparent px-4 py-2.5 text-xs sm:text-[13px] text-[#172033] outline-none placeholder:text-[#94a3b8] dark:text-[#eaf2ff] max-h-36"
                />

                {/* Input Bar Footer Controls (Paperclip Attachment + Send Button — sans partie vocale) */}
                <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-0.5">
                  <div className="flex items-center gap-1.5">
                    {/* Document Attachment Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#526484] shadow-xs transition hover:border-[#3978F6] hover:bg-[#edf4ff] hover:text-[#3978F6] dark:border-white/10 dark:bg-[#12213e] dark:text-[#cbd5e1] dark:hover:bg-[#1c325c]"
                    >
                      <Paperclip size={15} weight="bold" className="text-[#3978F6]" />
                      <span>Joindre un document</span>
                    </button>

                    <span className="hidden sm:inline text-xs text-[#71809A] dark:text-[#91a9c8]">
                      (PDF, scans, R, Python, TeX)
                    </span>
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() && attachedFiles.length === 0}
                    className={`flex size-9 items-center justify-center rounded-full transition ${
                      inputText.trim() || attachedFiles.length > 0
                        ? 'bg-gradient-to-r from-[#3978F6] to-[#2563eb] text-white shadow-none hover:scale-105 active:scale-95'
                        : 'bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-slate-600 cursor-not-allowed'
                    }`}
                    title="Envoyer le message (Entrée)"
                  >
                    <PaperPlaneRight size={16} weight="fill" />
                  </button>
                </div>
              </div>

              {/* Bottom Notice */}
              <p className="mt-2 text-center text-xs text-[#71809A] dark:text-[#91a9c8]">
                Les échanges sont confidentiels et traités sous 15 minutes par les professeurs agrégés et le secrétariat Nexora.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#0c1628] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/10 text-[#3978F6] dark:bg-blue-500/20">
                  {getFileIcon(previewFile.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#172033] dark:text-white truncate max-w-md">
                      {previewFile.name}
                    </h3>
                    <span className="rounded-md bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-300">
                      {previewFile.type === 'pdf' ? 'Copie Manuscrite PDF' : previewFile.type === 'code' ? 'Script R/Python' : 'Document Attaché'}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] dark:text-[#91a9c8] font-mono mt-0.5">
                    {previewFile.size} • Rattaché au ticket #{currentTicketId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Téléchargement de ${previewFile.name} initié.`)
                  }}
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
                  title="Télécharger une copie"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>Télécharger</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-black/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
                  title="Fermer la prévisualisation"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
            </div>

            {/* Document Preview Content */}
            <div className="my-4 flex-1 overflow-y-auto pr-1 scrollbar-thin">
              {previewFile.type === 'pdf' || previewFile.name.endsWith('.pdf') ? (
                /* Simulated Handwritten Exam Copy with KaTeX */
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 text-slate-800 shadow-sm dark:border-white/10 dark:bg-[#101b33] dark:text-slate-100 font-serif">
                  {/* Official Header */}
                  <div className="border-b-2 border-slate-200 pb-4 dark:border-white/20 text-center font-sans">
                    <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                      Royaume du Maroc — Ministère de l&apos;Éducation Nationale
                    </p>
                    <h2 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      CONCOURS NATIONAL COMMUN (CNC) — COPIE MANUSCRITE SOUMISE
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>Épreuve : Modélisation & Mathématiques</span>
                      <span>•</span>
                      <span>Filière : MP (Spé)</span>
                      <span>•</span>
                      <span>Centre : Lycée Omar Ibn Al-Khattab</span>
                    </div>
                  </div>

                  {/* Candidate Status */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-sans text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 dark:bg-white/5 dark:border-white/10">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Document : </span>
                      <strong className="text-slate-900 dark:text-white">{previewFile.name}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle size={16} weight="fill" />
                      <span>Transmis et horodaté</span>
                    </div>
                  </div>

                  {/* Mathematical Content */}
                  <div className="mt-6 space-y-5 text-sm sm:text-base leading-relaxed">
                    <p className="font-sans font-bold text-blue-700 dark:text-blue-300">
                      Exercice 19.4 — Vérification de l&apos;indépendance statistique des plis de validation
                    </p>

                    <p>
                      Pour éviter tout data leakage dans notre pipeline de validation croisée 5-Fold, nous isolons strictement l&apos;étape de standardisation.
                    </p>

                    <div className="my-4 rounded-2xl bg-blue-50/60 p-4 border border-blue-200 dark:bg-black/40 dark:border-blue-400/20 font-sans">
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">
                        Formule appliquée aux observations :
                      </p>
                      <MathFormula
                        math="\hat{\mu}_{\text{train}} = \frac{1}{|D_{\text{train}}|} \sum_{i \in D_{\text{train}}} x_i, \quad z_v = \frac{x_v - \hat{\mu}_{\text{train}}}{\hat{\sigma}_{\text{train}}}"
                        block
                      />
                    </div>

                    <p>
                      Le calcul de <MathFormula math="\hat{\mu}" /> et <MathFormula math="\hat{\sigma}" /> n&apos;implique aucune observation du pli de validation <MathFormula math="D_{\text{val}}" />, assurant l&apos;absence totale de fuite de données.
                    </p>
                  </div>
                </div>
              ) : previewFile.type === 'code' || previewFile.name.endsWith('.R') || previewFile.name.endsWith('.py') ? (
                /* Simulated Code Editor */
                <div className="rounded-2xl border border-slate-800 bg-[#0d1117] text-slate-200 p-5 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-rose-500 inline-block" />
                      <span className="size-3 rounded-full bg-amber-500 inline-block" />
                      <span className="size-3 rounded-full bg-emerald-500 inline-block" />
                      <span className="ml-2 font-bold text-slate-400">{previewFile.name}</span>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Script R / CPGE Capstone
                    </span>
                  </div>

                  <div className="space-y-1 leading-relaxed overflow-x-auto">
                    <p className="text-slate-500"># Pipeline Capstone Telco Churn - Projet 15</p>
                    <p><span className="text-purple-400">library</span>(tidyverse)</p>
                    <p><span className="text-purple-400">library</span>(caret)</p>
                    <p><span className="text-purple-400">library</span>(pROC)</p>
                    <br />
                    <p>folds &lt;- <span className="text-blue-400">createFolds</span>(telco_df$Churn, k = <span className="text-orange-400">5</span>, list = <span className="text-orange-400">TRUE</span>)</p>
                    <p>mu_tr &lt;- <span className="text-blue-400">mean</span>(tr$tenure, na.rm = <span className="text-orange-400">TRUE</span>)</p>
                    <p>sd_tr &lt;- <span className="text-blue-400">sd</span>(tr$tenure, na.rm = <span className="text-orange-400">TRUE</span>)</p>
                    <p>tr$tenure &lt;- (tr$tenure - mu_tr) / sd_tr</p>
                    <p>va$tenure &lt;- (va$tenure - mu_tr) / sd_tr</p>
                  </div>
                </div>
              ) : (
                /* Fallback info */
                <div className="my-6 rounded-2xl border border-[#3978F6]/20 bg-[#edf4ff]/50 p-8 text-center dark:bg-[#102342]/50">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#3978F6]/15 text-[#3978F6] mb-3">
                    <FileText size={32} weight="bold" />
                  </div>
                  <h4 className="text-sm font-bold text-[#172033] dark:text-[#eaf2ff]">
                    {previewFile.name}
                  </h4>
                  <p className="mt-1 text-xs text-[#64748b] dark:text-[#91a9c8]">
                    Document vérifié et rattaché au ticket #{currentTicketId}.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-white/10 shrink-0">
              <span className="text-xs text-[#64748b] dark:text-[#91a9c8]">
                Visualisation CPGE sécurisée
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5 cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Téléchargement de ${previewFile.name} initié.`)
                    setPreviewFile(null)
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#3978F6] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#2563eb] cursor-pointer"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>Télécharger une copie</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {!hideHeader && (
        <Footer onSelectModule={(mod) => {
          if (mod === 'dashboard') onBackToDashboard()
        }} />
      )}
    </div>
  )
}
