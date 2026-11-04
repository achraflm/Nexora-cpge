// Énoncés officiels — Filière MP — Centrale-Supélec, Mines-Ponts (CCMP) et CCINP.
// Les PDF sont stockés dans /public/annales/<concours>/mp/<matiere>/ et listés dans
// official-annales-manifest.json (généré par scripts/download-official-annales.mjs).
import type { ConcoursEpreuveFull } from './concours-annales-database'
import manifest from './official-annales-manifest.json'

type ConcoursId = 'centrale' | 'mines' | 'ccinp'

interface ManifestEntry {
  concours: ConcoursId
  year: number
  matiere: ConcoursEpreuveFull['matiereId']
  code: ConcoursEpreuveFull['epreuveCode']
  label: string
  badge: string
  sujet: { url: string; pages: number; size: number }
  source: string
  attribution: string
  licence?: { name: string; url: string }
}

const MATIERE_NAMES: Record<ConcoursEpreuveFull['matiereId'], string> = {
  maths: 'Mathématiques',
  physique: 'Physique & Chimie',
  si: "Sciences Industrielles de l'Ingénieur",
  info: 'Informatique',
  langues: 'Langues & Français',
}

const CONCOURS_META: Record<ConcoursId, { name: string; short: string; institution: string }> = {
  centrale: { name: 'Concours Centrale-Supélec', short: 'Centrale-Supélec', institution: 'CONCOURS CENTRALE-SUPÉLEC' },
  mines: { name: 'Concours Commun Mines-Ponts', short: 'Mines-Ponts', institution: 'CONCOURS COMMUN MINES-PONTS' },
  ccinp: { name: 'Concours Commun INP (CCINP)', short: 'CCINP', institution: 'CONCOURS COMMUN INP (CCINP)' },
}

/** Durées indicatives (h) — la durée exacte figure en en-tête de chaque sujet */
function durationHours(m: ManifestEntry): number {
  const optionInfo = /option/i.test(m.label)
  switch (m.concours) {
    case 'centrale':
      if (m.code === 'info' && !optionInfo) return 3
      return 4
    case 'mines':
      if (m.code === 'chimie') return 1.5
      if (m.code === 'si') return 4
      if (m.code === 'info') return optionInfo ? 3 : m.year >= 2023 ? 2 : 1.5
      if (m.code === 'anglais') return 1.5
      return 3
    case 'ccinp':
      if (m.code === 'chimie') return 2
      if (m.code === 'info') return 3
      return 4
  }
}

const formatDuration = (h: number) =>
  Number.isInteger(h) ? `${h} heures` : `${Math.floor(h)} h ${Math.round((h % 1) * 60)}`

function buildEntry(m: ManifestEntry): ConcoursEpreuveFull {
  const meta = CONCOURS_META[m.concours]
  const hours = durationHours(m)
  const duration = `Durée : ${formatDuration(hours)}`
  const credit = m.licence ? `${m.attribution} — licence ${m.licence.name}` : m.attribution
  return {
    id: `${m.concours}-${m.year}-${m.code}`,
    concoursId: m.concours,
    concoursName: meta.name,
    year: m.year,
    sessionLabel: `Session ${m.year}`,
    matiereId: m.matiere,
    matiereName: MATIERE_NAMES[m.matiere],
    epreuveCode: m.code,
    epreuveBadge: m.badge,
    title: `${meta.short} MP ${m.year} — ${m.label}`,
    subtitle: `Filière MP • Session officielle ${m.year} • Énoncé officiel`,
    streams: ['MP'],
    durationHours: hours,
    durationString: duration,
    difficultyStars: m.matiere === 'langues' ? 3 : m.concours === 'ccinp' ? 3 : 4,
    totalPages: m.sujet.pages || 1,
    description: `Sujet officiel de l'épreuve « ${m.label} » du ${meta.name}, filière MP, session ${m.year} (${m.sujet.pages} page${
      m.sujet.pages > 1 ? 's' : ''
    }). ${credit}.`,
    keyTopics: [meta.short, `MP ${m.year}`, m.label],
    officialHeader: {
      institution: meta.institution,
      concours: `${meta.institution} — SESSION ${m.year}`,
      epreuve: `ÉPREUVE DE ${m.label.toUpperCase()} — MP`,
      session: `Session ${m.year}`,
      duration,
    },
    questions: [],
    pdfUrl: m.sujet.url,
  }
}

const ORDER = ['maths-1', 'maths-2', 'physique-1', 'physique-2', 'chimie', 'si', 'info', 'francais', 'anglais']

/** Toutes les épreuves officielles Centrale / Mines-Ponts / CCINP (MP) avec PDF réels */
export const OFFICIAL_MP_ANNALES: ConcoursEpreuveFull[] = (manifest as ManifestEntry[])
  .map(buildEntry)
  .sort((a, b) => b.year - a.year || ORDER.indexOf(a.epreuveCode) - ORDER.indexOf(b.epreuveCode))

/** Concours couverts par des PDF officiels (leurs épreuves fictives sont remplacées) */
export const OFFICIAL_CONCOURS_IDS = new Set(OFFICIAL_MP_ANNALES.map((e) => e.concoursId))
