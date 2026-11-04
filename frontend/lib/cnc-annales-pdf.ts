// Annales officielles CNC — Filière MP — toutes matières disponibles
// (Mathématiques, Physique, Chimie, SII, Informatique, Langues vivantes).
// Les PDF (énoncés + corrigés) sont stockés dans /public/annales/cnc/mp/<matiere>/
// et listés dans cnc-annales-manifest.json (généré par scripts/download-cnc-annales.mjs).
import type { ConcoursEpreuveFull } from './concours-annales-database'
import manifest from './cnc-annales-manifest.json'

interface ManifestDoc {
  url: string
  pages: number
  size: number
}

interface ManifestEntry {
  year: number
  matiere: ConcoursEpreuveFull['matiereId']
  code: ConcoursEpreuveFull['epreuveCode']
  label: string
  badge: string
  sujet?: ManifestDoc
  corrige?: ManifestDoc
}

const MATIERE_NAMES: Record<ConcoursEpreuveFull['matiereId'], string> = {
  maths: 'Mathématiques',
  physique: 'Physique & Chimie',
  si: "Sciences Industrielles de l'Ingénieur",
  info: 'Informatique',
  langues: 'Langues vivantes',
}

const DURATION_HOURS: Partial<Record<ConcoursEpreuveFull['epreuveCode'], number>> = {
  chimie: 2,
  info: 2,
  arabe: 3,
  anglais: 3,
  francais: 4,
}

function buildEntry(m: ManifestEntry, singleEpreuveYear: boolean): ConcoursEpreuveFull | null {
  if (!m.sujet) return null
  // Une seule épreuve dans la matière cette année-là (ex. 2020, session COVID) : pas de numérotation
  const numbered = /-(1|2)$/.test(m.code)
  const label = numbered && singleEpreuveYear ? m.label.replace(/\s+I{1,2}$/, '') : m.label
  const badge = numbered && singleEpreuveYear ? m.badge.replace(/\s+\d$/, '') : m.badge
  const hours = DURATION_HOURS[m.code] ?? 4

  return {
    id: `cnc-${m.year}-${m.code}`,
    concoursId: 'cnc',
    concoursName: 'Concours National Commun (CNC)',
    year: m.year,
    sessionLabel: `Session ${m.year}`,
    matiereId: m.matiere,
    matiereName: MATIERE_NAMES[m.matiere],
    epreuveCode: m.code,
    epreuveBadge: badge,
    title: `CNC MP ${m.year} — ${label}`,
    subtitle: `Filière MP • Session officielle ${m.year}${m.corrige ? ' • Énoncé + corrigé' : ''}`,
    streams: ['MP'],
    durationHours: hours,
    durationString: `Durée : ${hours} heures`,
    difficultyStars: m.matiere === 'langues' ? 3 : 4,
    totalPages: m.sujet.pages || 1,
    description: `Sujet officiel de l'épreuve de ${label} du Concours National Commun, filière MP, session ${m.year} (${m.sujet.pages} page${m.sujet.pages > 1 ? 's' : ''})${
      m.corrige ? `, accompagné de son corrigé (${m.corrige.pages} pages).` : '.'
    }`,
    keyTopics: ['CNC', `MP ${m.year}`, label, ...(m.corrige ? ['Corrigé'] : [])],
    officialHeader: {
      institution: 'ROYAUME DU MAROC — MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR',
      concours: `CONCOURS NATIONAL COMMUN (CNC) — SESSION ${m.year}`,
      epreuve: `ÉPREUVE DE ${label.toUpperCase()}`,
      session: `Session ${m.year}`,
      duration: `Durée : ${hours} heures`,
    },
    questions: [],
    pdfUrl: m.sujet.url,
    corrigeUrl: m.corrige?.url,
    corrigePages: m.corrige?.pages,
  }
}

const entries = manifest as ManifestEntry[]

function isSingle(m: ManifestEntry): boolean {
  const family = m.code.replace(/-\d$/, '')
  return entries.filter((e) => e.year === m.year && e.code.replace(/-\d$/, '') === family).length === 1
}

const ORDER = ['maths-1', 'maths-2', 'physique-1', 'physique-2', 'chimie', 'si', 'info', 'francais', 'anglais', 'arabe']

/** Toutes les épreuves CNC MP avec PDF réels */
export const CNC_MP_ANNALES: ConcoursEpreuveFull[] = entries
  .map((m) => buildEntry(m, isSingle(m)))
  .filter((e): e is ConcoursEpreuveFull => e !== null)
  .sort((a, b) => b.year - a.year || ORDER.indexOf(a.epreuveCode) - ORDER.indexOf(b.epreuveCode))
