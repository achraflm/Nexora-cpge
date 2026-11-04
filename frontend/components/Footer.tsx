'use client'

import { NexoraLogo } from './NexoraLogo'
import {
  ShieldCheck,
  GraduationCap,
  Code,
  Sparkle,
  ArrowUpRight,
  Heart,
  Circle,
} from '@phosphor-icons/react'

interface FooterProps {
  onNavigateToExoPdf?: () => void
  onNavigateToContactAdmin?: () => void
  onSelectModule?: (mod: string) => void
}

export function Footer({ onNavigateToExoPdf, onNavigateToContactAdmin, onSelectModule }: FooterProps) {
  return (
    <footer className="relative z-10 mt-12 w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#070e1d]/85">
      {/* Top glowing accent line */}
      <div className="glowing-divider" />

      <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <NexoraLogo size={36} showText />
            <p className="max-w-md text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <strong>Nexora</strong> vous accompagne en classes préparatoires : cours, exercices et annales pour avancer à votre rythme et préparer les concours.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Prototype interactif
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-white/80 px-2.5 py-0.5 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                <ShieldCheck size={13} weight="bold" className="text-[#3978F6]" />
                Préparation CPGE
              </span>
            </div>
          </div>

          {/* Quick Links / Modules */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Modules & Cours
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onNavigateToExoPdf || (() => { window.location.href = '/?tab=cours' })}
                  className="flex items-center gap-1 text-slate-600 transition hover:text-[#3978F6] dark:text-slate-400 dark:hover:text-[#6b9bff]"
                >
                  <span>Cours & exercices</span>
                  <ArrowUpRight size={12} weight="bold" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateToExoPdf || (() => { window.location.href = '/?tab=cours' })}
                  className="flex items-center gap-1 text-slate-600 transition hover:text-[#3978F6] dark:text-slate-400 dark:hover:text-[#6b9bff]"
                >
                  <span>Mathématiques & physique</span>
                  <ArrowUpRight size={12} weight="bold" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateToExoPdf || (() => { window.location.href = '/?tab=cours' })}
                  className="flex items-center gap-1 text-slate-600 transition hover:text-[#3978F6] dark:text-slate-400 dark:hover:text-[#6b9bff]"
                >
                  <span>Sciences industrielles & informatique</span>
                  <ArrowUpRight size={12} weight="bold" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateToContactAdmin || (() => { window.location.href = '/?tab=contact' })}
                  className="flex items-center gap-1 font-semibold text-[#3978F6] transition hover:underline dark:text-[#6b9bff]"
                >
                  <span>Contacter l’administration</span>
                  <ArrowUpRight size={12} weight="bold" />
                </button>
              </li>
            </ul>
          </div>

          {/* Technologies & Frameworks */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Écosystème Pédagogique
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <GraduationCap size={14} weight="bold" className="text-[#3978F6]" />
                <span>Concours National Commun (CNC)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Code size={14} weight="bold" className="text-emerald-600 dark:text-emerald-400" />
                <span>Filières MP, PSI et TSI</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkle size={14} weight="bold" className="text-amber-500" />
                <span>Cours et exercices expliqués</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={14} weight="bold" className="text-purple-500" />
                <span>Suivi de votre progression</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-slate-800 dark:text-slate-200">Nexora Platform</strong>. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Conçu pour l&apos;excellence académique
            </span>
            <span>•</span>
            <span>Filières MP / PSI / TSI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
