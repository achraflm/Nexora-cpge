"use client"

import * as React from "react"
import { motion, type Variants } from "framer-motion"
import {
  Calculator,
  Atom,
  Cog,
  Terminal,
  ArrowUpRight,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react"

// ============================================================================
// TYPES & DATA DEFINITIONS
// ============================================================================

export type ConcoursId = "cnc" | "mines" | "centrale" | "ccinp" | "x-ens"

export type SubjectFolderId = "maths" | "physique" | "si" | "info"

export interface SubjectFolderData {
  id: SubjectFolderId
  name: string
  shortCode: "MATH" | "PHYS" | "SI" | "INFO"
  coeffs: string
  topics: string
  chaptersCountText: string
  pdfHeaderName?: string
  examBodyWatermark?: string
  concoursLogoUrl?: string
  icon: React.ComponentType<{ className?: string }>
  theme: {
    // Layer 1 Mesh Gradient & Accents
    meshGradient: string
    meshOrbs: string[]
    tabTag: string
    // Pill & Accents
    pillBg: string
    pillText: string
    pillBorder: string
    // Squircle Button
    buttonIconColor: string
    buttonBorder: string
    buttonGlow: string
  }
}

export const BASE_SUBJECT_TEMPLATES: Record<
  SubjectFolderId,
  {
    name: string
    shortCode: "MATH" | "PHYS" | "SI" | "INFO"
    topics: string
    icon: React.ComponentType<{ className?: string }>
    theme: {
      meshGradient: string
      meshOrbs: string[]
      pillBg: string
      pillText: string
      pillBorder: string
      buttonIconColor: string
      buttonBorder: string
      buttonGlow: string
    }
  }
> = {
  maths: {
    name: "Mathématiques",
    shortCode: "MATH",
    topics:
      "Algèbre linéaire, réduction, analyse réelle et complexe, séries et espaces euclidiens",
    icon: Calculator,
    theme: {
      meshGradient:
        "linear-gradient(135deg, #3730a3 0%, #4f46e5 35%, #7c3aed 70%, #2e1065 100%)",
      meshOrbs: ["#818cf8", "#c084fc", "#4338ca"],
      pillBg: "bg-indigo-500/15 dark:bg-indigo-400/20",
      pillText: "text-indigo-700 dark:text-indigo-300",
      pillBorder: "border-indigo-500/30 dark:border-indigo-400/30",
      buttonIconColor: "text-indigo-600 dark:text-indigo-400",
      buttonBorder: "border-indigo-200/50 dark:border-indigo-400/20",
      buttonGlow: "rgba(99, 102, 241, 0.35)",
    },
  },
  physique: {
    name: "Physique & Chimie",
    shortCode: "PHYS",
    topics:
      "Électromagnétisme, thermodynamique, optique ondulatoire et bilans énergétiques",
    icon: Atom,
    theme: {
      meshGradient:
        "linear-gradient(135deg, #0369a1 0%, #0284c7 35%, #0ea5e9 70%, #082f49 100%)",
      meshOrbs: ["#38bdf8", "#67e8f9", "#0284c7"],
      pillBg: "bg-sky-500/15 dark:bg-sky-400/20",
      pillText: "text-sky-700 dark:text-sky-300",
      pillBorder: "border-sky-500/30 dark:border-sky-400/30",
      buttonIconColor: "text-sky-600 dark:text-sky-400",
      buttonBorder: "border-sky-200/50 dark:border-sky-400/20",
      buttonGlow: "rgba(14, 165, 233, 0.35)",
    },
  },
  si: {
    name: "Sciences Industrielles (SI)",
    shortCode: "SI",
    topics:
      "Systèmes asservis linéaires (SLCI), cinématique 3D, torseurs et dynamique",
    icon: Cog,
    theme: {
      meshGradient:
        "linear-gradient(135deg, #047857 0%, #059669 35%, #0d9488 70%, #022c22 100%)",
      meshOrbs: ["#34d399", "#2dd4bf", "#047857"],
      pillBg: "bg-emerald-500/15 dark:bg-emerald-400/20",
      pillText: "text-emerald-700 dark:text-emerald-300",
      pillBorder: "border-emerald-500/30 dark:border-emerald-400/30",
      buttonIconColor: "text-emerald-600 dark:text-emerald-400",
      buttonBorder: "border-emerald-200/50 dark:border-emerald-400/20",
      buttonGlow: "rgba(16, 185, 129, 0.35)",
    },
  },
  info: {
    name: "Informatique & Algorithmique",
    shortCode: "INFO",
    topics:
      "Algorithmique de graphes, programmation dynamique, structures et complexité",
    icon: Terminal,
    theme: {
      meshGradient:
        "linear-gradient(135deg, #b45309 0%, #d97706 35%, #f59e0b 70%, #451a03 100%)",
      meshOrbs: ["#fbbf24", "#fb923c", "#d97706"],
      pillBg: "bg-amber-500/15 dark:bg-amber-400/20",
      pillText: "text-amber-700 dark:text-amber-300",
      pillBorder: "border-amber-500/30 dark:border-amber-400/30",
      buttonIconColor: "text-amber-600 dark:text-amber-400",
      buttonBorder: "border-amber-200/50 dark:border-amber-400/20",
      buttonGlow: "rgba(245, 158, 11, 0.35)",
    },
  },
}

export const CONCOURS_METADATA_CONFIG: Record<
  ConcoursId,
  {
    prefix: string
    officialName: string
    pdfFile: string
    watermark: string
    logoUrl: string
    coeffs: Record<SubjectFolderId, string>
    chapters: Record<SubjectFolderId, string>
  }
> = {
  cnc: {
    prefix: "CNC",
    officialName: "Concours National Commun (Maroc)",
    pdfFile: "Annales CNC 2025.pdf",
    watermark: "Royaume du Maroc • CNC",
    logoUrl: "/logos/concours/cnc.png",
    coeffs: {
      maths: "MP: 12 • PSI: 10 • TSI: 10",
      physique: "MP: 10 • PSI: 11 • TSI: 9",
      si: "MP: 5 • PSI: 9 • TSI: 11",
      info: "MP: 5 • PSI: 4 • TSI: 4",
    },
    chapters: {
      maths: "2 chapitres complets",
      physique: "1 chapitre complet",
      si: "1 chapitre complet",
      info: "1 chapitre complet",
    },
  },
  mines: {
    prefix: "MINES",
    officialName: "Concours Commun Mines-Ponts",
    pdfFile: "Mines-Ponts 2024 MP.pdf",
    watermark: "Mines-Ponts • ParisTech",
    logoUrl: "/logos/concours/mines.png",
    coeffs: {
      maths: "MP: 11 • PSI: 9 • TSI: 8",
      physique: "MP: 10 • PSI: 11 • TSI: 9",
      si: "MP: 4 • PSI: 8 • TSI: 10",
      info: "MP: 5 • PSI: 3 • TSI: 3",
    },
    chapters: {
      maths: "2 chapitres complets",
      physique: "1 chapitre complet",
      si: "1 chapitre complet",
      info: "1 chapitre complet",
    },
  },
  centrale: {
    prefix: "CENTRALE",
    officialName: "Concours Centrale-Supélec",
    pdfFile: "Centrale-Supelec 2024.pdf",
    watermark: "Concours Centrale-Supélec",
    logoUrl: "/logos/concours/centrale.webp",
    coeffs: {
      maths: "MP: 12 • PSI: 9 • TSI: 9",
      physique: "MP: 10 • PSI: 11 • TSI: 9",
      si: "MP: 4 • PSI: 9 • TSI: 10",
      info: "MP: 5 • PSI: 4 • TSI: 4",
    },
    chapters: {
      maths: "2 chapitres complets",
      physique: "1 chapitre complet",
      si: "1 chapitre complet",
      info: "1 chapitre complet",
    },
  },
  ccinp: {
    prefix: "CCINP",
    officialName: "Concours Communs INP (CCP)",
    pdfFile: "CCINP 2024 MP.pdf",
    watermark: "Concours Communs INP (ex-CCP)",
    logoUrl: "/logos/concours/ccinp.png",
    coeffs: {
      maths: "MP: 10 • PSI: 9 • TSI: 8",
      physique: "MP: 9 • PSI: 10 • TSI: 8",
      si: "MP: 4 • PSI: 8 • TSI: 10",
      info: "MP: 4 • PSI: 3 • TSI: 3",
    },
    chapters: {
      maths: "2 chapitres complets",
      physique: "1 chapitre complet",
      si: "1 chapitre complet",
      info: "1 chapitre complet",
    },
  },
  "x-ens": {
    prefix: "X-ENS",
    officialName: "École Polytechnique & ENS",
    pdfFile: "Polytechnique-ENS 2024.pdf",
    watermark: "École Polytechnique • ENS Ulm",
    logoUrl: "/logos/concours/x-ens.jpg",
    coeffs: {
      maths: "MP: 15 • PSI: 10 • PC: 10",
      physique: "MP: 12 • PSI: 14 • PC: 15",
      si: "MP: 3 • PSI: 10 • TSI: -",
      info: "MP: 6 • PSI: 3 • INFO: 10",
    },
    chapters: {
      maths: "2 chapitres complets",
      physique: "1 chapitre complet",
      si: "1 chapitre complet",
      info: "1 chapitre complet",
    },
  },
}

export type CpgeLevel = "sup" | "spe"

export const CPGE_LEVEL_METADATA_CONFIG: Record<
  CpgeLevel,
  {
    prefix: string
    officialName: string
    pdfFile: string
    watermark: string
    coeffs: Record<SubjectFolderId, string>
    chapters: Record<SubjectFolderId, string>
    topics: Record<SubjectFolderId, string>
  }
> = {
  sup: {
    prefix: "SUP",
    officialName: "Programme Officiel CPGE 1ère Année (SUP)",
    pdfFile: "Cours_CPGE_1ere_Annee_SUP.pdf",
    watermark: "CPGE 1ère Année • MPSI / PCSI / PTSI / TSI-1",
    coeffs: {
      maths: "MPSI: 10 • PCSI: 8 • PTSI: 6 • TSI: 8",
      physique: "MPSI: 8 • PCSI: 10 • PTSI: 8 • TSI: 8",
      si: "PTSI: 10 • PCSI: 6 • MPSI: 4 • TSI: 8",
      info: "MPSI: 4 • PCSI: 4 • PTSI: 4 • TSI: 4",
    },
    chapters: {
      maths: "2 chapitres complets (Cours + TD)",
      physique: "1 chapitre complet (Cours + TD)",
      si: "1 chapitre complet (Cours + TD)",
      info: "1 chapitre complet (Cours + TD)",
    },
    topics: {
      maths: "Nombres complexes, trigonométrie, analyse réelle, dérivation, Taylor-Young",
      physique: "Mécanique du point matériel, oscillateurs harmoniques amortis, résonance",
      si: "Modélisation cinématique, liaisons normalisées, degrés de liberté, torseurs",
      info: "Bases Python, récursivité, algorithmes de tri (fusion, insertion), complexité",
    },
  },
  spe: {
    prefix: "SPÉ",
    officialName: "Programme Officiel CPGE 2ème Année (SPÉ)",
    pdfFile: "Cours_CPGE_2eme_Annee_SPE.pdf",
    watermark: "CPGE 2ème Année • MP / PSI / PC / TSI-2",
    coeffs: {
      maths: "MP: 12 • PSI: 10 • TSI: 10",
      physique: "MP: 10 • PSI: 11 • TSI: 9",
      si: "MP: 5 • PSI: 9 • TSI: 11",
      info: "MP: 5 • PSI: 4 • TSI: 4",
    },
    chapters: {
      maths: "4 chapitres complets (Cours + TD)",
      physique: "3 chapitres complets (Cours + TD)",
      si: "3 chapitres complets (Cours + TD)",
      info: "3 chapitres complets (Cours + TD)",
    },
    topics: {
      maths: "Réduction des endomorphismes, séries entières, analyse de Fourier, espaces préhilbertiens",
      physique: "Électromagnétisme de Maxwell, thermodynamique des systèmes ouverts, optique ondulatoire",
      si: "Systèmes asservis linéaires continus (SLCI), Bode/Nyquist, cinématique 3D & torseurs",
      info: "Algorithmique de graphes, programmation dynamique, structures arborescentes et flots",
    },
  },
}

export function getSubjectFoldersForLevel(level: CpgeLevel = "spe"): SubjectFolderData[] {
  const config = CPGE_LEVEL_METADATA_CONFIG[level] || CPGE_LEVEL_METADATA_CONFIG.spe
  const subjectIds: SubjectFolderId[] = ["maths", "physique", "si", "info"]

  return subjectIds.map((id) => {
    const template = BASE_SUBJECT_TEMPLATES[id]
    return {
      id,
      name: template.name,
      shortCode: template.shortCode,
      coeffs: config.coeffs[id],
      topics: config.topics[id] || template.topics,
      chaptersCountText: config.chapters[id],
      pdfHeaderName: config.pdfFile,
      examBodyWatermark: config.watermark,
      concoursLogoUrl: undefined,
      icon: template.icon,
      theme: {
        ...template.theme,
        tabTag: `${config.prefix} · ${template.shortCode}`,
      },
    }
  })
}

export function getSubjectFoldersForConcours(
  concoursId: ConcoursId = "cnc"
): SubjectFolderData[] {
  const config = CONCOURS_METADATA_CONFIG[concoursId] || CONCOURS_METADATA_CONFIG.cnc
  const subjectIds: SubjectFolderId[] = ["maths", "physique", "si", "info"]

  return subjectIds.map((id) => {
    const template = BASE_SUBJECT_TEMPLATES[id]
    return {
      id,
      name: template.name,
      shortCode: template.shortCode,
      coeffs: config.coeffs[id],
      topics: template.topics,
      chaptersCountText: config.chapters[id],
      pdfHeaderName: config.pdfFile,
      examBodyWatermark: config.watermark,
      concoursLogoUrl: config.logoUrl,
      icon: template.icon,
      theme: {
        ...template.theme,
        tabTag: `${config.prefix} · ${template.shortCode}`,
      },
    }
  })
}

export const SUBJECT_FOLDERS: SubjectFolderData[] = getSubjectFoldersForConcours("cnc")

// ============================================================================
// FRAMER MOTION SPRINGS & VARIANTS
// ============================================================================

const cardContainerVariants: Variants = {
  rest: {
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
  hover: {
    y: -3,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
}

// Layer 2 Back Sheet: Tilted at -4deg resting, fans upward & outward on hover
const backSheetVariants: Variants = {
  rest: {
    y: 0,
    x: 0,
    rotate: -2,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
  hover: {
    y: -20, // fans upward (-translate-y-4)
    x: -8, // fans outward to left
    rotate: -3, // rotate extra outward (-3deg)
    scale: 1.02,
    transition: { type: "spring", stiffness: 280, damping: 20 },
  },
}

// Layer 2 Front Sheet: Tilted at +2deg resting, fans upward & outward on hover
const frontSheetVariants: Variants = {
  rest: {
    y: 0,
    x: 0,
    rotate: 2,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
  hover: {
    y: -16, // fans upward
    x: 8, // fans outward to right
    rotate: 3, // rotate extra outward (+3deg)
    scale: 1.03,
    transition: { type: "spring", stiffness: 280, damping: 20 },
  },
}

// Tactile Squircle Button Hover & Press Animation
const squircleButtonVariants: Variants = {
  rest: {
    scale: 1,
    rotate: 0,
    boxShadow:
      "0 8px 16px -4px rgba(0,0,0,0.25), inset 0 1.5px 1px rgba(255,255,255,0.45)",
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  hover: {
    scale: 1.03,
    rotate: 2,
    boxShadow:
      "0 14px 24px -4px rgba(0,0,0,0.32), inset 0 2px 1.5px rgba(255,255,255,0.65)",
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
  tap: {
    scale: 0.94,
    rotate: -1,
    transition: { type: "spring", stiffness: 500, damping: 20 },
  },
}

const arrowIconVariants: Variants = {
  rest: {
    scale: 1,
    x: 0,
    y: 0,
  },
  hover: {
    scale: 1.25,
    x: 1.5,
    y: -1.5,
    transition: { type: "spring", stiffness: 450, damping: 18 },
  },
}

// ============================================================================
// SHARED SVG CLIP-PATHS DEFINITION
// ============================================================================
export function SharedFolderSvgDefs() {
  return (
    <svg
      width="0"
      height="0"
      className="absolute pointer-events-none opacity-0 select-none overflow-hidden"
      aria-hidden="true"
    >
      <defs>
        {/* Layer 1 Silhouette: Top-Right Tab */}
        <clipPath id="folder-back-plate-clip" clipPathUnits="objectBoundingBox">
          <path d="M 0,0.12 C 0,0.07 0.03,0.07 0.07,0.07 L 0.46,0.07 C 0.52,0.07 0.54,0 0.60,0 L 0.93,0 C 0.97,0 1,0.03 1,0.07 L 1,0.93 C 1,0.97 0.97,1 0.93,1 L 0.07,1 C 0.03,1 0,0.97 0,0.93 Z" />
        </clipPath>

        {/* Layer 3 Silhouette: Top-Left Tab + Lower Right Lip */}
        <clipPath id="folder-front-pocket-clip" clipPathUnits="objectBoundingBox">
          <path d="M 0,0.07 C 0,0.03 0.03,0 0.07,0 L 0.44,0 C 0.50,0 0.52,0.11 0.58,0.11 L 0.93,0.11 C 0.97,0.11 1,0.15 1,0.19 L 1,0.93 C 1,0.97 0.97,1 0.93,1 L 0.07,1 C 0.03,1 0,0.97 0,0.93 Z" />
        </clipPath>

        {/* Specular linear gradient for top glass refraction */}
        <linearGradient id="specular-glass-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="42%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="58%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.95)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ============================================================================
// SINGLE GLASSMORPHIC FOLDER CARD COMPONENT
// ============================================================================

export interface GlassmorphicFolderCardProps {
  data: SubjectFolderData
  onClick?: () => void
  priority?: boolean
}

export function GlassmorphicFolderCard({
  data,
  onClick,
}: GlassmorphicFolderCardProps) {
  const Icon = data.icon
  const pdfFileName = data.pdfHeaderName || "Annales CNC 2025.pdf"
  const watermarkText = data.examBodyWatermark || "Royaume du Maroc • CNC"

  return (
    <motion.div
      variants={cardContainerVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.()
        }
      }}
      className="subject-folder group relative h-[420px] w-full select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3978f6] focus-visible:ring-offset-2 rounded-3xl"
      style={{ perspective: "1200px" }}
      aria-label={`Ouvrir la pochette de ${data.name}`}
    >
      {/* ================================================================== */}
      {/* LAYER 1 — THE BACK FOLDER PLATE (z-0)                               */}
      {/* ================================================================== */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-3xl shadow-xl transition-shadow duration-300 group-hover:shadow-2xl"
        style={{
          clipPath: "url(#folder-back-plate-clip)",
          WebkitClipPath: "url(#folder-back-plate-clip)",
          background: data.theme.meshGradient,
        }}
      >
        {/* Floating Glowing Mesh Orbs */}
        <div
          className="absolute -top-12 -right-10 h-44 w-44 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: data.theme.meshOrbs[0] }}
        />
        <div
          className="absolute top-20 -left-12 h-48 w-48 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{ backgroundColor: data.theme.meshOrbs[1] }}
        />
        <div
          className="absolute bottom-6 right-8 h-40 w-40 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: data.theme.meshOrbs[2] }}
        />

        {/* Abstract Micro Geometric Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />

        {/* Top-Right Asymmetric Tab Watermark */}
        <div className="absolute top-2.5 right-6 flex items-center gap-1.5 opacity-90 select-none pointer-events-none">
          <span className="font-mono text-[10px] font-bold tracking-widest text-white/90 uppercase drop-shadow-sm">
            {data.theme.tabTag}
          </span>
          <div className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
        </div>

        {/* Subtle Top Specular Edge Sheen on Back Tab */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/30 via-white/50 to-white/10" />
      </div>

      {/* ================================================================== */}
      {/* LAYER 2 — STACKED INNER DOCUMENT SHEETS (z-10)                      */}
      {/* ================================================================== */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-visible">
        {/* BACK SHEET: Tilted at -4deg resting */}
        <motion.div
          variants={backSheetVariants}
          className="absolute top-8 left-4 right-8 h-[225px] rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/85 dark:border-white/15 p-4 shadow-[0_6px_16px_rgba(0,0,0,0.12)] flex flex-col justify-between"
          style={{ transformOrigin: "bottom left" }}
        >
          {/* Header with PDF file name */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                {data.concoursLogoUrl ? (
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-white p-0.5 overflow-hidden shadow-2xs dark:bg-white/95">
                    <img src={data.concoursLogoUrl} alt="" className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                )}
                <span className="font-mono text-[10.5px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                  {pdfFileName}
                </span>
              </div>
              <span className="rounded bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-600 dark:text-rose-400">
                OFFICIEL
              </span>
            </div>

            {/* Faux Document Rule Lines */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-8 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="h-1.5 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800/80" />
              <div className="h-1.5 w-5/6 rounded-full bg-slate-100 dark:bg-slate-800/80" />
              <div className="h-1.5 w-3/4 rounded-full bg-slate-200/80 dark:bg-slate-800/60" />
            </div>
          </div>

          {/* Watermark Footprint */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 font-mono text-[9px] text-slate-400 dark:text-slate-500">
            <span>{watermarkText}</span>
            <span>MP • PSI • TSI</span>
          </div>
        </motion.div>

        {/* FRONT SHEET: Tilted at +2deg resting */}
        <motion.div
          variants={frontSheetVariants}
          className="absolute top-12 left-7 right-5 h-[225px] rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/15 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.16)] flex flex-col justify-between"
          style={{ transformOrigin: "bottom right" }}
        >
          <div>
            {/* Subject Metadata in Monospace font */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="font-mono text-[10.5px] font-bold tracking-tight text-amber-600 dark:text-amber-400">
                Coefficients : {data.coeffs}
              </span>
              {data.concoursLogoUrl ? (
                <div className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-white p-0.5 overflow-hidden shadow-2xs dark:bg-white/95">
                  <img src={data.concoursLogoUrl} alt="" className="h-full w-full object-contain" />
                </div>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </div>

            {/* Subject Topics & Faux Document Lines */}
            <div className="mt-2.5">
              <p className="line-clamp-2 text-[10.5px] font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                {data.topics}
              </p>
              <div className="mt-3 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-slate-200/90 dark:bg-slate-700/80" />
                <div className="h-1.5 w-4/5 rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500">
            <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
            <span>Fiches théoriques & Synthèses</span>
          </div>
        </motion.div>
      </div>

      {/* ================================================================== */}
      {/* LAYER 3 — FROSTED GLASS FRONT POCKET (z-20)                         */}
      {/* ================================================================== */}
      <div
        className="absolute inset-x-0 bottom-0 top-[132px] z-20 flex flex-col justify-between p-6 sm:p-7 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-all duration-300"
        style={{
          clipPath: "url(#folder-front-pocket-clip)",
          WebkitClipPath: "url(#folder-front-pocket-clip)",
        }}
      >
        {/* Glassmorphic Background with Crisp Frosted Blur */}
        <div className="absolute inset-0 -z-10 backdrop-blur-xl bg-gradient-to-b from-white/65 via-white/85 to-white/95 dark:from-slate-900/65 dark:via-slate-900/85 dark:to-slate-950/95" />

        {/* 1px Specular Inner Top Border along Exact Lip Contour */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none -z-5"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 0,7 C 0,3 3,0 7,0 L 44,0 C 50,0 52,11 58,11 L 93,11 C 97,11 100,15 100,19"
            fill="none"
            stroke="url(#specular-glass-gradient)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Crisp 1px Specular Border fallback */}
        <div className="absolute inset-x-0 top-0 h-[1px] border-t border-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:border-white/25 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />

        {/* Top Section inside Pocket: Subject Icon & Pill Badge */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Subject Icon inside tactile squircle */}
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-105"
              style={{ background: data.theme.meshGradient }}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Pill Badge (MATH, PHYS, SI, INFO) */}
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold tracking-wider uppercase shadow-xs ${data.theme.pillBg} ${data.theme.pillText} ${data.theme.pillBorder}`}
            >
              {data.shortCode}
            </span>
          </div>

          {data.concoursLogoUrl ? (
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-1 shadow-2xs backdrop-blur-xs dark:border-white/25 dark:bg-white/95">
              <div className="flex size-4 shrink-0 items-center justify-center overflow-hidden">
                <img src={data.concoursLogoUrl} alt="" className="h-full w-full object-contain" />
              </div>
              <span className="font-mono text-[10px] font-bold tracking-wider text-slate-800 dark:text-slate-900">CPGE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <Layers className="h-3.5 w-3.5 opacity-60" />
              <span className="font-semibold">CPGE</span>
            </div>
          )}
        </div>

        {/* Bottom Section: Title, Monospace Chapter Count & 3D Squircle Button */}
        <div className="flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0 pr-1">
            {/* Bold tracking-tight Title */}
            <h3 className="text-xl font-bold tracking-tight text-[#172033] dark:text-white transition-colors duration-200 group-hover:text-[#3978f6] dark:group-hover:text-[#7ba9ff]">
              {data.name}
            </h3>

            {/* Chapter Count in Monospace Font */}
            <div className="mt-1.5 flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{data.chaptersCountText}</span>
            </div>
          </div>

          {/* Bottom-Right Tactile 3D Skeuomorphic Squircle Button */}
          <motion.div
            variants={squircleButtonVariants}
            whileTap="tap"
            className={`group/btn relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 ${data.theme.buttonBorder}`}
            style={{
              boxShadow:
                "inset 0 1.5px 1px rgba(255,255,255,0.45), 0 8px 16px -4px rgba(0,0,0,0.25)",
            }}
            aria-label={`Accéder aux cours de ${data.name}`}
          >
            {/* Button Inner Radial Highlight */}
            <div className="absolute inset-0 rounded-2xl bg-radial from-white/40 to-transparent pointer-events-none opacity-60 dark:opacity-20" />

            {/* Tactile Arrow Icon that scales on hover */}
            <motion.div variants={arrowIconVariants} className={data.theme.buttonIconColor}>
              <ArrowUpRight className="h-5 w-5 stroke-[2.4]" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// RESPONSIVE 4-COLUMN GRID OF GLASSMORPHIC FOLDER CARDS
// ============================================================================

export interface GlassmorphicFolderCardsProps {
  onSelectSubject?: (subjectId: SubjectFolderId) => void
  concoursId?: ConcoursId
  level?: CpgeLevel
  subjects?: SubjectFolderData[]
  className?: string
}

export function GlassmorphicFolderCards({
  onSelectSubject,
  concoursId = "cnc",
  level,
  subjects,
  className = "",
}: GlassmorphicFolderCardsProps) {
  const displayedSubjects =
    subjects || (level ? getSubjectFoldersForLevel(level) : getSubjectFoldersForConcours(concoursId))

  return (
    <div className={`relative w-full ${className}`}>
      {/* Embed Shared SVG ClipPath Definitions */}
      <SharedFolderSvgDefs />

      {/* Responsive 4-Column Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-7">
        {displayedSubjects.map((subject) => (
          <GlassmorphicFolderCard
            key={subject.id}
            data={subject}
            onClick={() => onSelectSubject?.(subject.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default GlassmorphicFolderCards
