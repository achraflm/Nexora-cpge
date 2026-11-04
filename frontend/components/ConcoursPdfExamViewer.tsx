"use client"

import * as React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  Shield,
  AlertTriangle,
  Eye,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  FileText,
  CheckCircle,
  Play,
  Pause,
  PenTool,
  Flag,
  RotateCcw,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  X,
  FileCheck,
  CheckSquare,
} from "lucide-react"
import { MathFormula } from "@/components/MathFormula"
import { DocumentStudio, type StudioDocument } from "@/components/document-studio"

// ============================================================================
// TYPES & DATA
// ============================================================================

export type ExamViewerMode = "normal" | "concours"
export type ExamPhase = "prep" | "active" | "submitted"

export interface ExamQuestionCheck {
  id: string
  label: string
  part: string
  points: number
  done: boolean
}

export interface InfractionRecord {
  id: string
  timestamp: string
  reason: string
}

// ============================================================================
// OFFICIAL CNC MATHEMATIQUES I MP EXAM DATA (TYPICAL CPGE)
// ============================================================================

export const CONCOURS_EXAM_LOGOS: Record<string, string> = {
  cnc: "/logos/concours/cnc.png",
  mines: "/logos/concours/mines.png",
  centrale: "/logos/concours/centrale.webp",
  ccinp: "/logos/concours/ccinp.png",
  "x-ens": "/logos/concours/x-ens.jpg",
}

export const CONCOURS_EXAM_GLOWS: Record<string, string> = {
  cnc: "dark:shadow-[0_0_16px_rgba(57,120,246,0.35)] dark:border-blue-400/40",
  mines: "dark:shadow-[0_0_16px_rgba(239,68,68,0.35)] dark:border-red-400/40",
  centrale: "dark:shadow-[0_0_16px_rgba(234,179,8,0.35)] dark:border-amber-400/40",
  ccinp: "dark:shadow-[0_0_16px_rgba(147,51,234,0.35)] dark:border-purple-400/40",
  "x-ens": "dark:shadow-[0_0_16px_rgba(59,130,246,0.35)] dark:border-blue-400/40",
}

const EXAM_METADATA = {
  institution: "ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR",
  concours: "CONCOURS NATIONAL COMMUN (CNC) — SESSION 2024",
  stream: "FILIÈRE : MP & PSI",
  subject: "ÉPREUVE DE MATHÉMATIQUES I",
  durationString: "Durée : 4 heures",
  totalDurationSeconds: 4 * 3600, // 14400s
  prepDurationSeconds: 5 * 60, // 300s
  instructions: [
    "L’usage de tout document, calculatrice ou matériel électronique est formellement interdit.",
    "La qualité de la rédaction, la clarté et la rigueur des raisonnements interviendront pour une part essentielle dans l’appréciation des copies.",
    "Les candidats sont invités à encadrer leurs résultats définitifs.",
    "Si, au cours de l’épreuve, un candidat repère ce qui lui semble être une erreur d’énoncé, il le signalera sur sa copie et poursuivra en expliquant les raisons des initiatives qu’il a été amené à prendre.",
  ],
}

const EXAM_QUESTIONS: ExamQuestionCheck[] = [
  { id: "q1", label: "Q1. Trace et endomorphisme de rang 1", part: "Partie I", points: 1, done: false },
  { id: "q2", label: "Q2. Formule fondamentale u² = Tr(u)·u", part: "Partie I", points: 1.5, done: false },
  { id: "q3", label: "Q3. Polynôme minimal et spectre Sp(u)", part: "Partie I", points: 1.5, done: false },
  { id: "q4", label: "Q4. Condition nécessaire et suffisante de diagonalisabilité", part: "Partie I", points: 1.5, done: false },
  { id: "q5", label: "Q5. Décomposition spectrale et projecteur associé", part: "Partie I", points: 1.5, done: false },
  { id: "q6", label: "Q6. Structure et base du commutant C(u)", part: "Partie II", points: 1.5, done: false },
  { id: "q7", label: "Q7. Dimension de C(u) égale à n² - n + 1", part: "Partie II", points: 1.5, done: false },
  { id: "q8", label: "Q8. Équation matricielle X² = u lorsque Tr(u) ≠ 0", part: "Partie II", points: 1.5, done: false },
  { id: "q9", label: "Q9. Étude de l'équation X² = u dans le cas nilpotent", part: "Partie II", points: 1.5, done: false },
  { id: "q10", label: "Q10. Calcul explicite de la série de l'exponentielle exp(t u)", part: "Partie III", points: 1.5, done: false },
  { id: "q11", label: "Q11. Sous-groupe à un paramètre {exp(t u), t ∈ ℝ}", part: "Partie III", points: 1, done: false },
  { id: "q12", label: "Q12. Résolution du système différentiel X'(t) = u(X(t))", part: "Partie III", points: 1.5, done: false },
  { id: "q13", label: "Q13. Dérivée directionnelle et différentielle de exp en 0", part: "Partie III", points: 1, done: false },
  { id: "q14", label: "Q14. Matrice de Gram et norme subordonnée ||u||₂", part: "Partie IV", points: 1, done: false },
  { id: "q15", label: "Q15. Adjoint u* et projection orthogonale sur Im(u)", part: "Partie IV", points: 1, done: false },
  { id: "q16", label: "Q16. Décomposition polaire et synthèse", part: "Partie IV", points: 1, done: false },
]

export interface ConcoursExamItem {
  id: string
  concoursId: string
  subjectId: string
  year: number
  session: string
  stream: string
  title: string
  subtitle: string
  durationHours: number
  durationString: string
  difficultyStars: number
  totalPages: number
  institution?: string
  description: string
  questions?: ExamQuestionCheck[]
  /** PDF réel de l'énoncé (si disponible, remplace la feuille simulée) */
  pdfUrl?: string
  /** PDF réel du corrigé */
  corrigeUrl?: string
}

export interface ConcoursPdfExamViewerProps {
  onBack?: () => void
  initialMode?: ExamViewerMode
  candidateName?: string
  tableNumber?: string
  className?: string
  exam?: ConcoursExamItem
}

export function ConcoursPdfExamViewer({
  onBack,
  initialMode = "normal",
  candidateName = "Achraf Lemrani",
  tableNumber = "2024-MP-0428",
  className = "",
  exam,
}: ConcoursPdfExamViewerProps) {
  const activeMeta = exam
    ? {
        institution: exam.institution || EXAM_METADATA.institution,
        concours: `${exam.title} (${exam.session})`,
        stream: exam.stream,
        subject: exam.title,
        durationString: exam.durationString,
        totalDurationSeconds: exam.durationHours * 3600,
        prepDurationSeconds: 5 * 60,
        instructions: EXAM_METADATA.instructions,
      }
    : EXAM_METADATA

  const concoursKey = exam?.concoursId || "cnc"
  const activeConcoursLogo = CONCOURS_EXAM_LOGOS[concoursKey] || CONCOURS_EXAM_LOGOS.cnc
  const activeConcoursGlow = CONCOURS_EXAM_GLOWS[concoursKey] || CONCOURS_EXAM_GLOWS.cnc

  // Mode: normal (free viewing) vs concours (strict full-focus exam conditions)
  const [viewerMode, setViewerMode] = useState<ExamViewerMode>(initialMode)
  const [examPhase, setExamPhase] = useState<ExamPhase>(initialMode === "concours" ? "prep" : "active")

  // Timers
  const [timeRemaining, setTimeRemaining] = useState<number>(activeMeta.totalDurationSeconds)
  const [prepRemaining, setPrepRemaining] = useState<number>(activeMeta.prepDurationSeconds)
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false)

  // PDF Page & Zoom
  const [currentPageNum, setCurrentPageNum] = useState<number>(1)
  const [zoomLevel, setZoomLevel] = useState<number>(100)

  // Fullscreen
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Candidate tools
  const [scratchNotes, setScratchNotes] = useState<string>("")
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false)
  const hasRealPdf = Boolean(exam?.pdfUrl)
  const [questionsCheck, setQuestionsCheck] = useState<ExamQuestionCheck[]>(
    hasRealPdf ? exam?.questions ?? [] : exam?.questions || EXAM_QUESTIONS
  )
  // Document affiché lorsque de vrais PDF sont disponibles
  const [activeDoc, setActiveDoc] = useState<"enonce" | "corrige">("enonce")
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false)

  // Restrictions & Security tracking
  const [infractions, setInfractions] = useState<InfractionRecord[]>([])

  // Sync when exam or initialMode changes
  useEffect(() => {
    setViewerMode(initialMode)
    if (initialMode === "concours") {
      setExamPhase("prep")
      setPrepRemaining(300)
      setTimeRemaining(activeMeta.totalDurationSeconds)
    } else {
      setExamPhase("active")
    }
    setCurrentPageNum(1)
    setActiveDoc("enonce")
    if (exam?.pdfUrl) {
      setQuestionsCheck(exam.questions ?? [])
    } else if (exam?.questions && exam.questions.length > 0) {
      setQuestionsCheck(exam.questions)
    } else {
      setQuestionsCheck(EXAM_QUESTIONS)
    }
  }, [initialMode, exam, activeMeta.totalDurationSeconds])
  const [showInfractionAlert, setShowInfractionAlert] = useState<boolean>(false)
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false)
  const [showSoluceUnlocked, setShowSoluceUnlocked] = useState<boolean>(false)

  // --------------------------------------------------------------------------
  // TIMER TICKER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (viewerMode !== "concours" || examPhase === "submitted" || isTimerPaused) return

    const interval = setInterval(() => {
      if (examPhase === "prep") {
        setPrepRemaining((prev) => {
          if (prev <= 1) {
            setExamPhase("active")
            return 0
          }
          return prev - 1
        })
      } else if (examPhase === "active") {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setExamPhase("submitted")
            setShowSubmitModal(true)
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [viewerMode, examPhase, isTimerPaused])

  // --------------------------------------------------------------------------
  // FOCUS LOSS / WINDOW BLUR DETECTION (RESTRICTIONS CONCOURS)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (viewerMode !== "concours" || examPhase !== "active") return

    const handleFocusLoss = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("fr-FR")
      const newRecord: InfractionRecord = {
        id: String(Date.now()),
        timestamp: timeStr,
        reason: "Perte de focus de la fenêtre d'examen / changement d'application",
      }

      setInfractions((prev) => [...prev, newRecord])
      setShowInfractionAlert(true)
      setTimeout(() => setShowInfractionAlert(false), 5000)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleFocusLoss()
      }
    }

    // Cliquer dans le lecteur PDF (iframe) déclenche un "blur" de la fenêtre : ce n'est pas une sortie d'épreuve
    const handleWindowBlur = () => {
      setTimeout(() => {
        if (document.activeElement?.tagName === "IFRAME" && !document.hidden) return
        handleFocusLoss()
      }, 0)
    }

    window.addEventListener("blur", handleWindowBlur)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("blur", handleWindowBlur)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [viewerMode, examPhase])

  // --------------------------------------------------------------------------
  // FULLSCREEN TOGGLE
  // --------------------------------------------------------------------------
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen()
          setIsFullscreen(true)
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
          setIsFullscreen(false)
        }
      }
    } catch {
      setIsFullscreen(!isFullscreen)
    }
  }

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    const secs = totalSec % 60
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const completedQuestionsCount = questionsCheck.filter((q) => q.done).length

  // Le corrigé est verrouillé en Mode Concours tant que la copie n'est pas rendue
  const corrigeLocked = viewerMode === "concours" && examPhase !== "submitted"

  // Documents proposés au lecteur Document Studio (énoncé + corrigé verrouillable)
  const studioDocuments = useMemo<StudioDocument[]>(() => {
    if (!exam?.pdfUrl) return []
    const docs: StudioDocument[] = [{ id: "enonce", label: "Énoncé", url: exam.pdfUrl }]
    if (exam.corrigeUrl)
      docs.push({
        id: "corrige",
        label: "Corrigé",
        url: exam.corrigeUrl,
        locked: corrigeLocked,
        lockedReason: "Le corrigé est verrouillé pendant l'épreuve. Rendez votre copie pour le débloquer.",
      })
    return docs
  }, [exam?.pdfUrl, exam?.corrigeUrl, corrigeLocked])

  const [studioProgress, setStudioProgress] = useState({ page: 1, total: 0 })
  const handleStudioPage = useCallback((page: number, total: number) => setStudioProgress({ page, total }), [])

  // Switch to Mode Concours
  const handleLaunchConcoursMode = () => {
    setActiveDoc("enonce")
    setViewerMode("concours")
    setExamPhase("prep")
    setPrepRemaining(300)
    setTimeRemaining(activeMeta.totalDurationSeconds)
    setInfractions([])
    setShowSoluceUnlocked(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Skip prep and start exam immediately
  const handleStartExamNow = () => {
    setExamPhase("active")
  }

  // Submit Exam
  const handleConfirmSubmit = () => {
    setExamPhase("submitted")
    setShowSubmitModal(false)
    setShowSoluceUnlocked(true)
  }

  const toggleQuestionDone = (id: string) => {
    setQuestionsCheck((prev) =>
      prev.map((q) => (q.id === id ? { ...q, done: !q.done } : q))
    )
  }

  return (
    <div
      ref={containerRef}
      className={`w-full transition-colors duration-300 ${
        hasRealPdf && viewerMode === "concours"
          ? // Exam Mode : environnement plein écran, isolé du reste de la plateforme
            "fixed inset-0 z-[70] flex h-dvh flex-col overflow-hidden"
          : hasRealPdf
            ? "relative flex flex-col"
            : "relative min-h-screen"
      } ${
        viewerMode === "concours"
          ? "bg-[#090d16] text-[#eaf2ff]"
          : "bg-[#f8fafc] text-[#172033] dark:bg-[#070b14] dark:text-[#eaf2ff]"
      } ${className}`}
    >
      {/* ==================================================================== */}
      {/* TOP HEADER BAR (ADAPTS TO NORMAL VS CONCOURS)                        */}
      {/* ==================================================================== */}
      <header
        className={`sticky top-0 z-40 shrink-0 border-b backdrop-blur-xl transition-all duration-300 ${
          viewerMode === "concours"
            ? "border-amber-500/25 bg-[#0b1220]/95 text-white shadow-xl"
            : "border-slate-200/90 bg-white/90 text-[#172033] shadow-xs dark:border-white/10 dark:bg-[#0b1426]/90 dark:text-white"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1700px] items-center justify-between gap-3 px-3 sm:px-6">
          {/* Left: Back & Title */}
          <div className="flex min-w-0 items-center gap-3">
            {onBack && viewerMode === "normal" && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-[#3978f6] hover:text-[#3978f6] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Retour</span>
              </button>
            )}

            {onBack && viewerMode === "concours" && (
              <button
                type="button"
                onClick={() => {
                  if (examPhase === "submitted" || window.confirm("Voulez-vous vraiment quitter le mode concours ? L'épreuve en cours sera abandonnée.")) {
                    onBack()
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition"
                title="Quitter l'épreuve et revenir aux concours"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden md:inline">Quitter l'Épreuve</span>
              </button>
            )}

            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className={`relative hidden size-9 shrink-0 sm:flex items-center justify-center rounded-xl bg-white p-1 border border-slate-200/90 shadow-md transition-all dark:bg-white/95 ${activeConcoursGlow}`}
              >
                <img
                  src={activeConcoursLogo}
                  alt={exam?.concoursId || "Concours"}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-sm font-black tracking-tight">
                    {activeMeta.subject}
                  </h1>
                  <span
                    className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase xl:inline ${
                      viewerMode === "concours"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {viewerMode === "concours" ? "MODE CONCOURS FULL FOCUS" : "VISIONNAGE NORMAL"}
                  </span>
                </div>
                <p className="hidden truncate text-[11px] text-slate-500 dark:text-slate-400 md:block">
                  {activeMeta.concours} • {activeMeta.stream}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Chronometer if in Concours Mode */}
          {viewerMode === "concours" && examPhase !== "submitted" && (
            <div className="flex items-center gap-3">
              {examPhase === "prep" ? (
                <div className="flex items-center gap-2 rounded-2xl bg-amber-500/15 px-3.5 py-1.5 border border-amber-500/30 animate-pulse">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <div className="text-center">
                    <span className="block text-[9px] uppercase font-bold text-amber-400">
                      Phase de Préparation (Lecture)
                    </span>
                    <span className="font-mono text-sm font-black text-amber-300">
                      {formatTime(prepRemaining)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartExamNow}
                    className="ml-2 rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-black text-black hover:bg-amber-400"
                  >
                    Débuter
                  </button>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-2.5 rounded-2xl px-4 py-1.5 border transition-all ${
                    timeRemaining <= 900
                      ? "border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse"
                      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <div className="text-center">
                    <span className="hidden text-[9px] uppercase font-bold text-slate-300 lg:block">
                      Temps Restant (Sur {exam?.durationHours ?? 4}h)
                    </span>
                    <span className="font-mono text-base font-black tracking-wider">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  {timeRemaining <= 900 && (
                    <span className="inline-flex items-center gap-1 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                      <AlertTriangle className="size-3 text-white animate-pulse" strokeWidth={2} />
                      <span>&lt; 15 min !</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right: Actions and Mode Switcher */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {viewerMode === "normal" ? (
              <button
                type="button"
                onClick={handleLaunchConcoursMode}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 px-4 py-2 text-xs font-black text-white shadow-md hover:brightness-110 active:scale-95 transition"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Lancer en Mode Concours</span>
                <span className="sm:hidden">Mode Concours</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* Scratchpad Toggle */}
                <button
                  type="button"
                  onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    isScratchpadOpen
                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                  title="Ouvrir le brouillon virtuel"
                >
                  <PenTool className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Brouillon</span>
                </button>

                {/* Question Checklist Toggle */}
                <button
                  type="button"
                  onClick={() => setIsChecklistOpen(!isChecklistOpen)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    isChecklistOpen
                      ? "border-blue-400 bg-blue-400/20 text-blue-300"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                  title="Suivi de pointage des questions"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">
                    {completedQuestionsCount}/{questionsCheck.length}
                  </span>
                </button>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                  title="Plein écran / Sortir du plein écran"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>

                {/* Submit button */}
                {examPhase !== "submitted" ? (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 text-xs font-black shadow-md transition"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span className="whitespace-nowrap">
                      Rendre<span className="hidden lg:inline"> la Copie</span>
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewerMode("normal")}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-black shadow-md transition"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Mode Normal</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Infraction Warning Alert Banner (if focus lost in concours mode) */}
        <AnimatePresence>
          {showInfractionAlert && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-rose-500/50 bg-rose-950/90 text-rose-200 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 animate-bounce" />
              <span>
                Avertissement de surveillance : Sortie de l'épreuve détectée ! Cette interruption a été enregistrée au procès-verbal ({infractions.length} infraction{infractions.length > 1 ? "s" : ""}).
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ==================================================================== */}
      {/* MAIN EXAM WORKSPACE                                                  */}
      {/* ==================================================================== */}
      {hasRealPdf && studioDocuments.length > 0 ? (
        <div
          className={`flex flex-col ${viewerMode === "concours" ? "min-h-0 flex-1" : ""}`}
          style={viewerMode === "concours" ? undefined : { height: "calc(100dvh - 4rem)" }}
        >
          {/* Exam Mode : bandeau de statut compact (candidat, progression du temps, pages, incidents) */}
          {viewerMode === "concours" && (
            <div className="relative flex h-9 shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0b0e13] px-4 text-[11.5px] text-slate-400 sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <Shield className="h-3.5 w-3.5 shrink-0 text-amber-400/90" />
                <span className="truncate">
                  <span className="text-slate-200">{candidateName}</span>
                  <span className="mx-1.5 text-slate-600">·</span>
                  Table <span className="font-mono text-slate-300">{tableNumber}</span>
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-4 tabular-nums">
                {studioProgress.total > 0 && (
                  <span>
                    Page <span className="text-slate-200">{studioProgress.page}</span> / {studioProgress.total}
                  </span>
                )}
                {examPhase === "active" && (
                  <span className="hidden sm:inline">
                    {Math.round(((activeMeta.totalDurationSeconds - timeRemaining) / activeMeta.totalDurationSeconds) * 100)} % du temps écoulé
                  </span>
                )}
                <span className={infractions.length > 0 ? "text-rose-400" : "text-emerald-400/80"}>
                  {infractions.length} incident{infractions.length > 1 ? "s" : ""}
                </span>
              </div>
              {examPhase !== "prep" && (
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.04]">
                  <div
                    className={`h-full transition-[width] duration-1000 ease-linear ${timeRemaining <= 900 ? "bg-rose-500" : "bg-amber-400/70"}`}
                    style={{
                      width: `${examPhase === "submitted" ? 100 : ((activeMeta.totalDurationSeconds - timeRemaining) / activeMeta.totalDurationSeconds) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Copie rendue : accès au corrigé */}
          {showSoluceUnlocked && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-2 text-xs text-emerald-200 sm:px-6">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Copie rendue — {infractions.length} incident(s) consigné(s).
                {exam?.corrigeUrl ? " Le corrigé officiel est maintenant disponible." : " Aucun corrigé n'est disponible pour cette épreuve."}
              </span>
              {exam?.corrigeUrl && (
                <button
                  type="button"
                  onClick={() => setActiveDoc("corrige")}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-500"
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  Afficher le corrigé
                </button>
              )}
            </div>
          )}

          <div className="relative min-h-0 flex-1">
            <DocumentStudio
              mode={viewerMode === "concours" ? "exam" : "study"}
              documents={studioDocuments}
              activeDocumentId={activeDoc}
              onDocumentChange={(id) => setActiveDoc(id === "corrige" ? "corrige" : "enonce")}
              title={activeMeta.subject}
              onPageChange={handleStudioPage}
              rememberPosition={viewerMode === "normal"}
              concealed={
                viewerMode === "concours" && examPhase === "prep" ? (
                  <div className="max-w-sm text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      <Lock className="h-5 w-5 text-amber-400" />
                    </div>
                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400/90">Temps de préparation</p>
                    <p className="mt-2 font-mono text-4xl font-semibold tabular-nums text-white">{formatTime(prepRemaining)}</p>
                    <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                      L'énoncé sera dévoilé à la fin du temps de préparation. Installez-vous, préparez vos feuilles et votre brouillon.
                    </p>
                    <button
                      type="button"
                      onClick={handleStartExamNow}
                      className="mt-6 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-black transition hover:bg-amber-300"
                    >
                      Commencer l'épreuve maintenant
                    </button>
                  </div>
                ) : undefined
              }
            />
          </div>
        </div>
      ) : (
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Mode Concours Banner: Candidate Identity & Rules */}
        {viewerMode === "concours" && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-amber-200 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Épreuve sous Surveillance Officielle • Conditions Strictes CPGE
                </p>
                <p className="text-[11px] text-amber-200/80">
                  Candidat : <strong className="text-white">{candidateName}</strong> • Table : <strong className="font-mono text-white">{tableNumber}</strong> • Concours : <strong className="text-white">{activeMeta.concours}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-[11px]">
                {completedQuestionsCount} / {questionsCheck.length} questions cochées
              </span>
              <span
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-bold ${
                  infractions.length > 0
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                {infractions.length} incident{infractions.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Normal Mode Banner: Invitation to launch concours mode */}
        {viewerMode === "normal" && (
          <div className="mb-6 rounded-2xl border border-blue-500/25 bg-blue-500/5 p-5 dark:border-blue-500/20 dark:bg-blue-950/20 flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-0.5 text-xs font-black text-[#2866dc] dark:text-[#8db5ff] mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Épreuve Type de Concours CPGE</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-[#172033] dark:text-white">
                Sujet Officiel : {activeMeta.concours} — {activeMeta.subject}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#71809A] dark:text-[#91a9c8]">
                Vous êtes en <strong>Visionnage Normal</strong> (lecture libre, navigation par page et zoom). Vous pouvez basculer en <strong>Mode Concours</strong> à tout moment pour vous tester en conditions réelles avec décompte officiel de 4h, immersion plein écran, détection anti-dispersion et verrouillage des corrigés.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLaunchConcoursMode}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-500/25 transition hover:scale-105 active:scale-95"
            >
              <Shield className="h-4 w-4" />
              <span>Démarrer l'Épreuve en Mode Concours (4h)</span>
            </button>
          </div>
        )}

        {/* Controls Toolbar: Page selector, Zoom, Paper Theme */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-xs dark:border-white/10 dark:bg-[#101b33]/80 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
              Page :
            </span>
            {Array.from({ length: exam?.totalPages || 4 }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPageNum(pageNum)}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition ${
                  currentPageNum === pageNum
                    ? "bg-[#3978F6] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
              >
                Page {pageNum} / {exam?.totalPages || 4}
              </button>
            ))}
          </div>

          {/* Paper Zoom controls */}
          <div className="flex items-center gap-3">

            {/* Zoom */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                title="Zoomer en arrière"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center font-mono text-xs font-bold">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(180, z + 10))}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                title="Zoomer en avant"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Print */}
            {viewerMode === "normal" && (
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                title="Imprimer le sujet"
              >
                <Printer className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* THE REALISTIC EXAM SHEET PAPER                                     */}
        {/* ================================================================== */}
        <div className="overflow-x-auto pb-12 flex justify-center">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            className="relative min-h-[1150px] w-full max-w-[880px] rounded-2xl p-8 sm:p-12 shadow-2xl transition-all duration-300 border bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-800 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
          >
            {/* Candidate Watermark in Concours Mode */}
            {viewerMode === "concours" && (
              <div
                className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-[0.06] flex items-center justify-center rotate-[-30deg]"
                aria-hidden="true"
              >
                <p className="font-mono text-3xl font-black tracking-widest text-center leading-loose">
                  CONCOURS OFFICIEL • CANDIDAT : {candidateName.toUpperCase()}
                  <br />
                  TABLE N° {tableNumber} • FILIÈRE MP • {activeMeta.concours}
                </p>
              </div>
            )}

            {/* Official Header (Only on Page 1) */}
            {currentPageNum === 1 && (
              <div className="border-b-2 border-black dark:border-white pb-6 text-center mb-8">
                {/* Official School Insignia Badge */}
                <div
                  className="mx-auto mb-3.5 flex size-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-md border border-neutral-300 dark:border-neutral-700 dark:bg-white"
                >
                  <img
                    src={activeConcoursLogo}
                    alt={activeMeta.concours}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200">
                  <span>{activeMeta.stream}</span>
                  <span>Session Officielle</span>
                  <span>{activeMeta.durationString}</span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-widest text-black dark:text-white">
                    {activeMeta.institution}
                  </p>
                  <h2 className="mt-2 text-xl sm:text-2xl font-black tracking-tight uppercase text-black dark:text-white">
                    {activeMeta.concours}
                  </h2>
                  <p className="mt-1 text-sm font-extrabold uppercase text-neutral-900 dark:text-neutral-100">
                    {activeMeta.subject} — {activeMeta.durationString}
                  </p>
                </div>

                {/* Official Warning Box */}
                <div className="mt-5 rounded-xl border border-neutral-400 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 p-3.5 text-left text-[11px] leading-relaxed text-black dark:text-white">
                  <p className="font-bold underline mb-1 text-black dark:text-white">Consignes officielles aux candidats :</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10.5px] text-neutral-900 dark:text-neutral-100 font-medium">
                    {activeMeta.instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Page Header on Pages 2, 3, 4 */}
            {currentPageNum > 1 && (
              <div className="border-b border-neutral-400 dark:border-neutral-700 pb-3 mb-6 flex items-center justify-between text-xs font-mono text-neutral-900 dark:text-neutral-200">
                <span className="flex items-center gap-2">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-white p-0.5 shadow-2xs dark:bg-white/95">
                    <img src={activeConcoursLogo} alt="" className="h-full w-full object-contain" />
                  </span>
                  <span>{activeMeta.concours} — {activeMeta.stream}</span>
                </span>
                <span>Page {currentPageNum} sur {exam?.totalPages || 4}</span>
              </div>
            )}

            {/* ================================================================ */}
            {/* PAGE CONTENT SWITCHER                                            */}
            {/* ================================================================ */}
            <div className="space-y-6 text-xs sm:text-[13px] leading-relaxed text-neutral-900 dark:text-neutral-100">
              {/* -------------------- PAGE 1 -------------------- */}
              {currentPageNum === 1 && (
                <div>
                  <div className="mb-4 text-center">
                    <h3 className="text-base font-black uppercase tracking-wide text-black dark:text-white">
                      {exam?.subtitle ? `Problème : ${exam.subtitle}` : "Problème : Étude spectrale des endomorphismes de rang 1 et exponentielle matricielle"}
                    </h3>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 italic mt-0.5">
                      Dans tout le problème, E désigne un K-espace vectoriel de dimension finie n ≥ 2 (avec K = ℝ ou ℂ).
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="border-l-4 border-black dark:border-white pl-3 text-sm font-black text-black dark:text-white uppercase mb-3">
                      Partie I : Propriétés spectrales des opérateurs de rang 1
                    </h4>
                    <p className="text-justify mb-3 text-neutral-900 dark:text-neutral-100">
                      Soit u un endomorphisme non nul de E tel que rk(u) = 1.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <p className="font-bold text-black dark:text-white">1. Trace et droite image :</p>
                        <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                          Montrer qu'il existe un unique scalaire λ₀ ∈ K tel que pour tout x ∈ Im(u), u(x) = λ₀ x. Justifier que ce scalaire est la trace de l'endomorphisme u, notée Tr(u).
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-black dark:text-white">2. Relation algébrique fondamentale :</p>
                        <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                          Établir l'identité algébrique remarquable :
                        </p>
                        <MathFormula math="u^2 = \text{Tr}(u) \cdot u" block />
                      </div>

                      <div>
                        <p className="font-bold text-black dark:text-white">3. Polynôme annulateur et spectre :</p>
                        <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                          En déduire un polynôme annulateur de u scindé sur K. Déterminer l'ensemble des valeurs propres Sp(u) dans les deux cas possibles : Tr(u) = 0 et Tr(u) ≠ 0.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-black dark:text-white">4. Critère de diagonalisabilité :</p>
                        <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                          Démontrer que u est diagonalisable si et seulement si Tr(u) ≠ 0. Préciser dans ce cas les sous-espaces propres associés.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-black dark:text-white">5. Projecteur spectral :</p>
                        <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                          Lorsque Tr(u) ≠ 0, expliciter l'endomorphisme p = (1 / Tr(u)) · u. Montrer que p est un projecteur sur Im(u) parallèlement à ker(u).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- PAGE 2 -------------------- */}
              {currentPageNum === 2 && (
                <div>
                  <h4 className="border-l-4 border-black dark:border-white pl-3 text-sm font-black text-black dark:text-white uppercase mb-3">
                    Partie II : Commutant et équations matricielles quadratiques
                  </h4>
                  <p className="text-justify mb-3 text-neutral-900 dark:text-neutral-100">
                    On note C(u) = &#123; v ∈ L(E) : u ∘ v = v ∘ u &#125; le commutant de u.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-black dark:text-white">6. Stabilité du noyau et de l'image :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        Montrer que tout endomorphisme v ∈ C(u) laisse stables ker(u) et Im(u). En déduire qu'il existe un scalaire α_v tel que la restriction de v à Im(u) soit l'homothétie de rapport α_v.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-black dark:text-white">7. Dimension du commutant :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        En choisissant une base adaptée à la décomposition de E, établir que :
                      </p>
                      <MathFormula math="\dim C(u) = n^2 - n + 1" block />
                    </div>

                    <div>
                      <p className="font-bold text-black dark:text-white">8. Résolution de X² = u dans le cas non nilpotent :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        On suppose dans cette question que K = ℂ et que Tr(u) = α ≠ 0. Déterminer l'ensemble de tous les endomorphismes X ∈ L(E) vérifiant :
                      </p>
                      <MathFormula math="X^2 = u" block />
                      <p className="text-justify mt-1 text-[11px] text-neutral-700 dark:text-neutral-300">
                        (Indication : on pourra montrer que X commute nécessairement avec u).
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-black dark:text-white">9. Résolution dans le cas nilpotent Tr(u) = 0 :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        On suppose désormais que Tr(u) = 0 (u est alors nilpotent d'échelon 2). Démontrer que l'équation X² = u n'admet aucune solution dans L(E).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- PAGE 3 -------------------- */}
              {currentPageNum === 3 && (
                <div>
                  <h4 className="border-l-4 border-black dark:border-white pl-3 text-sm font-black text-black dark:text-white uppercase mb-3">
                    Partie III : Exponentielle matricielle et systèmes différentiels
                  </h4>
                  <p className="text-justify mb-3 text-neutral-900 dark:text-neutral-100">
                    Pour t ∈ ℝ, on considère l'endomorphisme exp(t u) défini par la série normalement convergente de l'exponentielle.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-black dark:text-white">10. Formule fermée de l'exponentielle :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        En utilisant l'identité {"u^k = (Tr u)^{k-1} · u"} pour tout k ≥ 1, établir que pour tout t ∈ ℝ :
                      </p>
                      <MathFormula math="\exp(t u) = \text{Id}_E + \left( \sum_{k=1}^\infty \frac{t^k (\text{Tr}(u))^{k-1}}{k!} \right) u = \text{Id}_E + \frac{e^{t \text{Tr}(u)} - 1}{\text{Tr}(u)} u" block />
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        Que vaut cette expression lorsque Tr(u) = 0 ?
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-black dark:text-white">11. Propriété de groupe à un paramètre :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        Vérifier directement à l'aide de la formule précédente que pour tous s, t ∈ ℝ :
                      </p>
                      <MathFormula math="\exp((s + t) u) = \exp(s u) \circ \exp(t u)" block />
                    </div>

                    <div>
                      <p className="font-bold text-black dark:text-white">12. Application au système différentiel linéaire :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        Résoudre de manière explicite le problème de Cauchy vectoriel :
                      </p>
                      <MathFormula math="X'(t) = u\big(X(t)\big), \quad X(0) = X_0 \in E" block />
                    </div>

                    <div>
                      <p className="font-bold text-black dark:text-white">13. Dérivée directionnelle :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        Montrer que l'application t ↦ exp(t u) est indéfiniment dérivable sur ℝ et calculer sa dérivée première en t = 0.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- PAGE 4 -------------------- */}
              {currentPageNum === 4 && (
                <div>
                  <h4 className="border-l-4 border-black dark:border-white pl-3 text-sm font-black text-black dark:text-white uppercase mb-3">
                    Partie IV : Extension euclidienne et décomposition polaire
                  </h4>
                  <p className="text-justify mb-3 text-neutral-900 dark:text-neutral-100">
                    On suppose dans cette dernière partie que E est un espace euclidien réel muni du produit scalaire canonique ⟨·, ·⟩ et de la norme euclidienne associée ||·||.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-black dark:text-white">14. Représentation dyadique et norme subordonnée :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        Puisque rk(u) = 1, il existe deux vecteurs non nuls a, b ∈ E tels que pour tout x ∈ E, u(x) = ⟨a, x⟩ b. Établir que la norme subordonnée de u vaut :
                      </p>
                      <MathFormula math="\|u\|_2 = \|a\| \cdot \|b\|" block />
                    </div>

                    <div>
                      <p className="font-bold text-black dark:text-white">15. Endomorphisme adjoint u* :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        Expliciter l'adjoint u* en fonction des vecteurs a et b. À quelle condition géométrique sur a et b l'endomorphisme u est-il autoadjoint (symétrique) ?
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-black dark:text-white">16. Décomposition en valeurs singulières (SVD) de rang 1 :</p>
                      <p className="text-justify mt-1 text-neutral-900 dark:text-neutral-100">
                        En déduire l'unique valeur singulière non nulle σ₁ de u ainsi que la décomposition polaire de u.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 border-t-2 border-black dark:border-white pt-4 text-center font-bold text-xs uppercase tracking-widest text-black dark:text-white">
                    — Fin de l'épreuve de Concours —
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Page Numbering Footer */}
            <div className="mt-12 border-t border-neutral-300 dark:border-neutral-800 pt-3 flex items-center justify-between text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
              <span>{activeMeta.concours}</span>
              <span>Page {currentPageNum} / {exam?.totalPages || 4}</span>
              <span>{activeMeta.subject}</span>
            </div>
          </div>
        </div>

        {/* Post-Submission / Soluce Unlocked Section */}
        {showSoluceUnlocked && (
          <div className="my-8 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-emerald-200 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-base font-black text-white">
                  Copie Rendu avec Succès — Corrigé Officiel Déverrouillé !
                </h3>
                <p className="text-xs text-emerald-300">
                  Votre épreuve a été clôturée. Vous avez complété {completedQuestionsCount} questions sur {questionsCheck.length} avec {infractions.length} incident(s) consigné(s).
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-black/30 p-4 border border-emerald-500/20 text-xs font-mono space-y-2">
              <p className="text-emerald-300 font-bold">Points Clés du Corrigé CNC :</p>
              <p>• Q2 : Pour tout x ∈ E, u(x) ∈ Im(u), donc u(u(x)) = λ₀ u(x) = Tr(u) u(x).</p>
              <p>• Q4 : Le polynôme P(X) = X(X - Tr(u)) est annulateur. Si Tr(u) ≠ 0, P est scindé à racines simples 0 et Tr(u), donc u est diagonalisable.</p>
              <p>• Q7 : dim C(u) = 1 + (n - 1) + (n - 1)² = n² - n + 1 par théorème du rang appliqué aux blocs.</p>
              <p>{"• Q10 : exp(t u) = Id + (e^{t Tr(u)} - 1)/Tr(u) · u, et si Tr(u) = 0, exp(t u) = Id + t u (nilpotence)."}</p>
            </div>
          </div>
        )}
      </main>
      )}

      {/* ==================================================================== */}
      {/* CANDIDATE SCRATCHPAD DRAWER (COLLAPSIBLE)                            */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isScratchpadOpen && (
          <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            className="fixed top-16 right-0 bottom-0 z-50 w-full sm:w-[380px] border-l border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/95 flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-black text-[#172033] dark:text-white">
                  Feuille de Brouillon Virtuelle
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScratchpadOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Posez ici vos calculs intermédiaires, lemmes et brouillons sans quitter l'écran.
            </p>

            <textarea
              value={scratchNotes}
              onChange={(e) => setScratchNotes(e.target.value)}
              placeholder="Ex: Q2: u(x) in Vect(b) => u^2(x) = u(lambda b) = lambda^2 b = Tr(u) u(x)..."
              className="mt-3 flex-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-[#3978f6] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 resize-none"
            />

            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{scratchNotes.length} caractères</span>
              <button
                type="button"
                onClick={() => setScratchNotes("")}
                className="hover:text-rose-500"
              >
                Effacer le brouillon
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* QUESTION POINTAGE CHECKLIST DRAWER                                   */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isChecklistOpen && (
          <motion.div
            initial={{ x: -380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -380, opacity: 0 }}
            className="fixed top-16 left-0 bottom-0 z-50 w-full sm:w-[380px] border-r border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628]/95 flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[#3978f6]" />
                <h3 className="text-sm font-black text-[#172033] dark:text-white">
                  Tableau de Pointage ({completedQuestionsCount}/{questionsCheck.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChecklistOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Cochez les questions au fur et à mesure de votre progression.
            </p>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              {questionsCheck.map((q) => (
                <div
                  key={q.id}
                  onClick={() => toggleQuestionDone(q.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition select-none ${
                    q.done
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200/80 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={q.done}
                      onChange={() => {}}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{q.label}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {q.part}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold shrink-0">
                    {q.points} pt{q.points > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* MODAL DE REMISE DE COPIE (CONFIRMATION & PROCÈS-VERBAL)               */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#0c1628]"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-white/10">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600">
                  <Flag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Rendre la Copie — Clôture de l'Épreuve
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Procès-verbal de composition de Concours
                  </p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="my-5 space-y-3 rounded-2xl bg-slate-50 p-4 font-mono text-xs text-slate-700 dark:bg-white/5 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Candidat :</span>
                  <strong className="text-slate-900 dark:text-white">{candidateName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>N° de Table :</span>
                  <strong>{tableNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Temps écoulé :</span>
                  <strong className="text-blue-600 dark:text-blue-400">
                    {formatTime(activeMeta.totalDurationSeconds - timeRemaining)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Questions traitées :</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {completedQuestionsCount} / {questionsCheck.length}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Infractions constatées :</span>
                  <strong
                    className={
                      infractions.length > 0 ? "text-rose-600" : "text-emerald-600"
                    }
                  >
                    {infractions.length} incident{infractions.length > 1 ? "s" : ""}
                  </strong>
                </div>
              </div>

              {infractions.length > 0 && (
                <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[11px] text-rose-300">
                  <p className="font-bold">Détail des sorties d'écran :</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    {infractions.map((inf) => (
                      <li key={inf.id}>
                        {inf.timestamp} : {inf.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                En confirmant la remise de votre copie, l'épreuve sera scellée. Le <strong>corrigé officiel détaillé</strong> et le barème prévisionnel seront immédiatement déverrouillés.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  Continuer l'Épreuve
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2 text-xs font-black text-white shadow-md hover:brightness-110"
                >
                  Confirmer et Rendre ma Copie
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConcoursPdfExamViewer
