// Télécharge tous les sujets et corrigés du CNC (filière MP) disponibles sur AlloSchool
// pour toutes les matières de https://www.alloschool.com/category/concours-mp :
//   Mathématiques, Physique & Chimie, Sciences Industrielles (SII), Informatique, Langues vivantes.
// Les PDF sont enregistrés dans public/annales/cnc/mp/<matiere>/ et le manifeste
// lib/cnc-annales-manifest.json est (re)généré. Les fichiers déjà présents ne sont pas retéléchargés.
//
// Usage : node scripts/download-cnc-annales.mjs
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_BASE = path.join(ROOT, 'public', 'annales', 'cnc', 'mp')
const MANIFEST = path.join(ROOT, 'lib', 'cnc-annales-manifest.json')
const SITE = 'https://www.alloschool.com'

const COURSES = [
  'concours-mathematiques-mp',
  'concours-physique-et-chimie-mp',
  'concours-sciences-industrielles-mp',
  'concours-informatique-mp',
  'concours-langues-vivantes-mp',
]

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchRetry(url, asBuffer = false, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: UA })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return asBuffer ? Buffer.from(await res.arrayBuffer()) : await res.text()
    } catch (e) {
      if (i === tries) throw e
      await sleep(1000 * i)
    }
  }
}

async function exists(p) {
  try { return (await fs.stat(p)).size > 1000 } catch { return false }
}

/** Associe le libellé AlloSchool (« Physique 1 », « SII », « Anglais »…) à une épreuve de l'application */
function classifySubject(raw) {
  const s = raw.replace(/\s+/g, ' ').trim()
  let m
  if ((m = s.match(/^Maths?\s*(\d)?$/i))) {
    const n = Number(m[1] || 1)
    return { matiere: 'maths', code: `maths-${n}`, slug: `Maths_${n}`, label: `Mathématiques ${n === 1 ? 'I' : 'II'}`, badge: `MATH ${n}` }
  }
  if ((m = s.match(/^Physique\s*(\d)?$/i))) {
    const n = Number(m[1] || 1)
    return { matiere: 'physique', code: `physique-${n}`, slug: `Physique_${n}`, label: `Physique ${n === 1 ? 'I' : 'II'}`, badge: `PHYS ${n}`, folder: 'physique' }
  }
  if (/^Chimie$/i.test(s)) return { matiere: 'physique', code: 'chimie', slug: 'Chimie', label: 'Chimie', badge: 'CHIMIE', folder: 'chimie' }
  if (/^S\.?I\.?I?\.?$/i.test(s)) return { matiere: 'si', code: 'si', slug: 'SII', label: "Sciences Industrielles de l'Ingénieur", badge: 'SII' }
  if (/^Informatique$/i.test(s)) return { matiere: 'info', code: 'info', slug: 'Informatique', label: 'Informatique', badge: 'INFO' }
  if (/^Arabe$/i.test(s)) return { matiere: 'langues', code: 'arabe', slug: 'Arabe', label: 'Arabe', badge: 'ARABE' }
  if (/^Anglais$/i.test(s)) return { matiere: 'langues', code: 'anglais', slug: 'Anglais', label: 'Anglais', badge: 'ANGLAIS' }
  if (/^Fran[cç]ais$/i.test(s)) return { matiere: 'langues', code: 'francais', slug: 'Francais', label: 'Français', badge: 'FRANÇAIS' }
  return null
}

/** « CNC MP 2015 Physique 2 - Corrigé » → { year, subject, kind } */
function parseTitle(title) {
  const t = title.replace(/\s*-\s*AlloSchool\s*$/i, '').replace(/\s+/g, ' ').trim()
  const m = t.match(/^CNC(?:\s+MP)?\s+(\d{4})\s+(.+)$/i)
  if (!m) return null
  let rest = m[2]
  const kind = /corrig/i.test(rest) ? 'corrige' : 'sujet'
  rest = rest.replace(/[-–]?\s*(Epreuve|Épreuve|Sujet|Corrig[ée]e?)\s*$/i, '').replace(/[-–]\s*$/, '').trim()
  return { year: Number(m[1]), subject: rest, kind, title: t }
}

async function getCncElementIds(course) {
  const html = await fetchRetry(`${SITE}/course/${course}`)
  const section = html
    .split(/<li id="sections-/)
    .slice(1)
    .find((s) => /National Commun|\bCNC\b/i.test((s.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || ''))
  if (!section) return []
  return [...new Set([...section.matchAll(/element\/(\d+)/g)].map((m) => m[1]))]
}

async function inspectElement(id) {
  const html = await fetchRetry(`${SITE}/element/${id}`)
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || ''
  const pdf = (html.match(/href="(https:\/\/www\.alloschool\.com\/assets\/documents\/[^"]+\.pdf)"/i) || [])[1]
  const pages = (html.match(/<figure /g) || []).length
  return { id, title, pdf, pages }
}

const entries = new Map() // clé : year|code
let downloaded = 0
let skipped = 0

for (const course of COURSES) {
  const ids = await getCncElementIds(course)
  console.log(`\n=== ${course} : ${ids.length} documents CNC`)
  for (const id of ids) {
    let el
    try {
      el = await inspectElement(id)
    } catch (e) {
      console.error(`✘ élément ${id} : ${e.message}`)
      continue
    }
    const parsed = parseTitle(el.title)
    const subj = parsed && classifySubject(parsed.subject)
    if (!parsed || !subj || !el.pdf) {
      console.warn(`⚠ ignoré ${id} « ${el.title} »${el.pdf ? '' : ' (pas de PDF)'}`)
      continue
    }
    const folder = subj.folder || subj.matiere
    const fileName = `CNC_MP_${parsed.year}_${subj.slug}_${parsed.kind === 'corrige' ? 'Corrige' : 'Enonce'}.pdf`
    const dest = path.join(PUBLIC_BASE, folder, fileName)
    await fs.mkdir(path.dirname(dest), { recursive: true })

    const key = `${parsed.year}|${subj.code}`
    const entry = entries.get(key) || {
      year: parsed.year,
      matiere: subj.matiere,
      code: subj.code,
      label: subj.label,
      badge: subj.badge,
    }
    if (entry[parsed.kind]) {
      console.warn(`⚠ doublon ignoré ${id} « ${parsed.title} »`)
      continue
    }
    try {
      if (await exists(dest)) {
        skipped++
      } else {
        const buf = await fetchRetry(el.pdf, true)
        if (buf.subarray(0, 4).toString() !== '%PDF') throw new Error('fichier non-PDF')
        await fs.writeFile(dest, buf)
        downloaded++
        await sleep(200)
      }
      entry[parsed.kind] = {
        url: `/annales/cnc/mp/${folder}/${fileName}`,
        pages: el.pages,
        size: (await fs.stat(dest)).size,
      }
      entries.set(key, entry)
      console.log(`✔ ${parsed.title}`)
    } catch (e) {
      console.error(`✘ ${parsed.title} : ${e.message}`)
    }
  }
}

const manifest = [...entries.values()]
  .filter((e) => e.sujet)
  .sort((a, b) => a.matiere.localeCompare(b.matiere) || a.year - b.year || a.code.localeCompare(b.code))

const orphans = [...entries.values()].filter((e) => !e.sujet)
for (const o of orphans) console.warn(`⚠ corrigé sans énoncé : ${o.year} ${o.label}`)

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

const byMatiere = {}
for (const e of manifest) {
  byMatiere[e.matiere] ??= { epreuves: 0, corriges: 0 }
  byMatiere[e.matiere].epreuves++
  if (e.corrige) byMatiere[e.matiere].corriges++
}
console.log(`\nTéléchargés : ${downloaded} • déjà présents : ${skipped}`)
console.table(byMatiere)
console.log(`Manifeste → ${path.relative(ROOT, MANIFEST)}`)
