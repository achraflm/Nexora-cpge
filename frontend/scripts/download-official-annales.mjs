// Télécharge les ÉNONCÉS officiels de la filière MP des concours français absents de l'application
// (Centrale-Supélec, Mines-Ponts, CCINP), directement depuis les sites des organisateurs :
//   - Centrale-Supélec : https://www.concours-centrale-supelec.fr/sujets-rapports
//   - Mines-Ponts (CCMP) : https://concoursminesponts.fr/annales/  (archives .zip par année)
//   - CCINP            : https://www.concours-commun-inp.fr/fr/epreuves/annales/annales-mp.html
// Les PDF sont enregistrés dans public/annales/<concours>/mp/<matiere>/ et le manifeste
// lib/official-annales-manifest.json est (re)généré. Les fichiers déjà présents ne sont pas retéléchargés.
//
// Licences : les sujets CCMP sont diffusés sous licence CC BY-NC-ND 4.0 (attribution obligatoire,
// pas d'usage commercial, pas de modification). L'attribution est stockée dans le manifeste.
//
// Usage : node scripts/download-official-annales.mjs [centrale] [mines] [ccinp]
import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = path.join(ROOT, 'public')
const MANIFEST = path.join(ROOT, 'lib', 'official-annales-manifest.json')
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const CONCOURS = {
  centrale: {
    prefix: 'CENTRALE',
    source: 'https://www.concours-centrale-supelec.fr/sujets-rapports',
    attribution: 'Sujet officiel © Concours Centrale-Supélec',
  },
  mines: {
    prefix: 'MINES',
    source: 'https://concoursminesponts.fr/annales/',
    attribution: 'Sujet propriété du Concours Commun Mines Ponts (CCMP)',
    licence: { name: 'CC BY-NC-ND 4.0', url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr' },
  },
  ccinp: {
    prefix: 'CCINP',
    source: 'https://www.concours-commun-inp.fr/fr/epreuves/annales/annales-mp.html',
    attribution: 'Sujet officiel © Concours Commun INP (CCINP)',
  },
}

/** Épreuves reconnues : code → méta (dossier, slug de fichier, libellé, badge) */
function epreuve(code, label) {
  const base = {
    'maths-1': { matiere: 'maths', folder: 'maths', slug: 'Maths_1', label: 'Mathématiques I', badge: 'MATH 1' },
    'maths-2': { matiere: 'maths', folder: 'maths', slug: 'Maths_2', label: 'Mathématiques II', badge: 'MATH 2' },
    'physique-1': { matiere: 'physique', folder: 'physique', slug: 'Physique_1', label: 'Physique I', badge: 'PHYS 1' },
    'physique-2': { matiere: 'physique', folder: 'physique', slug: 'Physique_2', label: 'Physique II', badge: 'PHYS 2' },
    chimie: { matiere: 'physique', folder: 'chimie', slug: 'Chimie', label: 'Chimie', badge: 'CHIMIE' },
    si: { matiere: 'si', folder: 'si', slug: 'SII', label: "Sciences Industrielles de l'Ingénieur", badge: 'SII' },
    info: { matiere: 'info', folder: 'info', slug: 'Informatique', label: 'Informatique', badge: 'INFO' },
    francais: { matiere: 'langues', folder: 'langues', slug: 'Francais', label: 'Français', badge: 'FRANÇAIS' },
    anglais: { matiere: 'langues', folder: 'langues', slug: 'Langues', label: 'Langues vivantes', badge: 'LANGUES' },
  }[code]
  return { code, ...base, ...(label ? { label } : {}) }
}

const norm = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&([a-zA-Z])(acute|grave|circ|uml|cedil);/g, '$1')
    .replace(/&#?[a-z0-9]+;/gi, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

async function fetchRetry(url, asBuffer = false, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: UA })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return asBuffer ? Buffer.from(await res.arrayBuffer()) : await res.text()
    } catch (e) {
      if (i === tries) throw e
      await sleep(1500 * i)
    }
  }
}

// ---------------------------------------------------------------------------
// Lecture minimale des archives ZIP (store / deflate), récursive pour les zip imbriqués
// ---------------------------------------------------------------------------
function readZip(buf, prefix = '') {
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 70000); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('archive ZIP invalide')
  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  const out = []
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break
    const method = buf.readUInt16LE(p + 10)
    const compSize = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const local = buf.readUInt32LE(p + 42)
    const name = prefix + buf.subarray(p + 46, p + 46 + nameLen).toString('latin1')
    p += 46 + nameLen + extraLen + commentLen
    if (name.endsWith('/') || /__MACOSX|\/\.|^\./.test(name)) continue
    const lName = buf.readUInt16LE(local + 26)
    const lExtra = buf.readUInt16LE(local + 28)
    const start = local + 30 + lName + lExtra
    const raw = buf.subarray(start, start + compSize)
    const getData = () => (method === 0 ? Buffer.from(raw) : zlib.inflateRawSync(raw))
    if (/\.zip$/i.test(name)) {
      try { out.push(...readZip(getData(), name + '/')) } catch { /* zip imbriqué illisible */ }
    } else {
      out.push({ name, getData })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Comptage des pages (pdfjs-dist est déjà une dépendance du projet)
// ---------------------------------------------------------------------------
let pdfjs
async function countPages(buf) {
  try {
    pdfjs ??= await import('pdfjs-dist/legacy/build/pdf.mjs')
    const task = pdfjs.getDocument({ data: Uint8Array.from(buf), verbosity: 0, isEvalSupported: false })
    const n = (await task.promise).numPages
    await task.destroy()
    return n
  } catch (e) {
    if (process.env.DEBUG) console.warn(`  (pdfjs : ${e.message})`)
    return (buf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length || 1
  }
}

// ---------------------------------------------------------------------------
// Collecte des candidats par concours : { concours, year, ep, priority, url | getData }
// ---------------------------------------------------------------------------
async function collectCentrale() {
  const SITE = 'https://www.concours-centrale-supelec.fr'
  const html = await fetchRetry(CONCOURS.centrale.source)
  const tabs = [...html.matchAll(/id="tab-(\d+-\d+)"[^>]*>\s*([^<]*?)\s*<\/button>/g)]
  const mp = tabs.find((t) => t[2] === 'MP')
  if (!mp) throw new Error('onglet MP introuvable')
  const start = html.indexOf(`id="tab-content-${mp[1]}"`)
  const end = html.indexOf('role="tabpanel"', start + 50)
  const pane = html.slice(start, end < 0 ? undefined : end)
  const out = []
  for (const section of pane.split(/<h2>/).slice(1)) {
    const secTitle = norm(section.slice(0, section.indexOf('<')))
    if (secTitle.startsWith('rapport')) continue
    for (const item of section.split(/class="accordion-button[^"]*"/).slice(1)) {
      const title = norm(item.slice(item.indexOf('>') + 1, item.indexOf('</button>')))
      let ep, priority = 1
      if (/^mathematiques 1/.test(title)) ep = epreuve('maths-1')
      else if (/^mathematiques 2/.test(title)) ep = epreuve('maths-2')
      else if (/^physique-chimie 1/.test(title)) ep = epreuve('physique-1', 'Physique-Chimie I')
      else if (/^physique-chimie 2/.test(title)) ep = epreuve('physique-2', 'Physique-Chimie II')
      else if (/sciences industrielles/.test(title)) ep = epreuve('si')
      else if (/^informatique/.test(title)) ep = epreuve('info', 'Informatique (tronc commun)')
      else if (/^option informatique/.test(title)) { ep = epreuve('info', 'Option informatique'); priority = 2 }
      else if (/^langues vivantes/.test(title)) ep = epreuve('anglais')
      else if (/^redaction/.test(title)) ep = epreuve('francais', 'Rédaction')
      if (!ep) { console.warn(`⚠ Centrale : épreuve ignorée « ${title} »`); continue }
      for (const m of item.matchAll(/href="([^"]+\.pdf)"[^>]*>\s*(\d{4})\s*<\/a>/g)) {
        out.push({ concours: 'centrale', year: Number(m[2]), ep, priority, url: new URL(m[1], SITE).href })
      }
    }
  }
  return out
}

async function collectCcinp() {
  const SITE = 'https://www.concours-commun-inp.fr'
  const html = await fetchRetry(CONCOURS.ccinp.source)
  const out = []
  for (const part of html.split(/<h3[^>]*>/).slice(1)) {
    const title = norm(part.slice(0, part.indexOf('</h3>')))
    const ym = title.match(/^session (20\d\d)/)
    if (!ym) continue
    const ecrits = part.split(/<h4[^>]*>/).find((x) => /crites/.test(norm(x.slice(0, 120)))) || ''
    for (const para of ecrits.split(/<p[^>]*>/).slice(1)) {
      const label = norm(para.split('<a')[0]).replace(/\s*:\s*$/, '')
      const sujet = [...para.matchAll(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].find((x) => /^sujet/.test(norm(x[2])))
      if (!sujet) continue
      let ep
      if (label === 'mathematiques 1') ep = epreuve('maths-1')
      else if (label === 'mathematiques 2') ep = epreuve('maths-2')
      else if (label === 'physique 1') ep = epreuve('physique-1')
      else if (label === 'physique 2') ep = epreuve('physique-2')
      else if (label === 'physique') ep = epreuve('physique-1', 'Physique')
      else if (/^physique ?- ?chimie$/.test(label)) ep = epreuve('physique-2', 'Physique-Chimie')
      else if (label === 'chimie') ep = epreuve('chimie')
      else if (label === 'informatique') ep = epreuve('info')
      else if (label === 'sciences industrielles') ep = epreuve('si')
      if (!ep) { console.warn(`⚠ CCINP ${ym[1]} : épreuve ignorée « ${label} »`); continue }
      out.push({ concours: 'ccinp', year: Number(ym[1]), ep, priority: 1, url: new URL(sujet[1].replace(/&amp;/g, '&'), SITE).href })
    }
  }
  return out
}

/** Classe un fichier d'une archive CCMP pour la filière MP (null si hors MP / document annexe) */
function classifyMines(name) {
  const file = name.split('/').pop()
  const b = norm(file).replace(/\.pdf$/, '')
  const full = norm(name)
  if (!/\.pdf$/i.test(file)) return null
  if (/feuille|reponse|(^|[-_ ])dr([-_ ]|$)|annexe|rapport/.test(b)) return null
  if (/mpi/.test(b)) return null
  if (/fran.{0,4}ais/.test(b)) return { ep: epreuve('francais'), priority: 1 }
  if (/langue/.test(b)) return { ep: epreuve('anglais'), priority: 1 }
  if (/ipt|commune|mp-pc-psi|pour-tous/.test(b)) return { ep: epreuve('info', 'Informatique (tronc commun)'), priority: 1 }
  const isMp = /(^|[^a-z])mp([^a-z]|$)/.test(b) || /(^|\/)mp(-\d{4})?\//.test(full)
  if (!isMp || /(^|[^a-z])(psi|pc|tsi)([^a-z]|$)/.test(b)) return null
  const num = (b.match(/mp[-_ ]*([12])(?![0-9])/) || b.match(/(?:math|maths|physique)[-_ ]*([12])(?![0-9])/) || [])[1]
  if (/math/.test(b)) return num ? { ep: epreuve(`maths-${num}`), priority: 1 } : null
  if (/phys/.test(b)) return num ? { ep: epreuve(`physique-${num}`), priority: 1 } : null
  if (/chimie/.test(b)) return { ep: epreuve('chimie'), priority: 1 }
  if (/info/.test(b)) return { ep: epreuve('info', 'Option informatique'), priority: 2 }
  if (/(^|[^a-z])si([^a-z]|$)/.test(b)) return { ep: epreuve('si'), priority: /sujet|enonce/.test(b) ? 1 : 2 }
  // ex. « Sujets-2023/SI/SI-MP-2023/MP.pdf » : la matière n'apparaît que dans le dossier
  if (/(^|\/)si[^/]*\//.test(full)) return { ep: epreuve('si'), priority: 3 }
  return null
}

async function collectMines() {
  const html = await fetchRetry(CONCOURS.mines.source)
  const zips = [...html.matchAll(/href="([^"]+\.zip)"[^>]*>\s*(\d{4})\s*<\/a>/g)].map((m) => ({ url: m[1], year: Number(m[2]) }))
  const out = []
  for (const z of zips) {
    let entries
    try {
      console.log(`… CCMP ${z.year} : téléchargement de l'archive`)
      entries = readZip(await fetchRetry(z.url, true))
    } catch (e) {
      console.error(`✘ CCMP ${z.year} : ${e.message}`)
      continue
    }
    for (const entry of entries) {
      const c = classifyMines(entry.name)
      if (!c) continue
      out.push({ concours: 'mines', year: z.year, ep: c.ep, priority: c.priority, getData: entry.getData, origin: entry.name })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
async function exists(p) {
  try { return (await fs.stat(p)).size > 1000 } catch { return false }
}

const wanted = process.argv.slice(2).filter((a) => a in CONCOURS)
const selected = wanted.length ? wanted : Object.keys(CONCOURS)
const collectors = { centrale: collectCentrale, mines: collectMines, ccinp: collectCcinp }

let previous = []
try { previous = JSON.parse(await fs.readFile(MANIFEST, 'utf8')) } catch { /* premier lancement */ }
const manifest = previous.filter((e) => !selected.includes(e.concours))

let downloaded = 0
let skipped = 0
for (const id of selected) {
  console.log(`\n=== ${id.toUpperCase()} (filière MP)`)
  let candidates
  try {
    candidates = await collectors[id]()
  } catch (e) {
    console.error(`✘ ${id} : ${e.message}`)
    manifest.push(...previous.filter((x) => x.concours === id))
    continue
  }
  // meilleure source par (année, épreuve)
  const best = new Map()
  for (const c of candidates.sort((a, b) => a.priority - b.priority)) {
    const key = `${c.year}|${c.ep.code}`
    if (!best.has(key)) best.set(key, c)
  }
  const meta = CONCOURS[id]
  for (const c of [...best.values()].sort((a, b) => a.year - b.year)) {
    const fileName = `${meta.prefix}_MP_${c.year}_${c.ep.slug}_Enonce.pdf`
    const rel = `annales/${id}/mp/${c.ep.folder}/${fileName}`
    const dest = path.join(PUBLIC, ...rel.split('/'))
    await fs.mkdir(path.dirname(dest), { recursive: true })
    try {
      let buf
      if (await exists(dest)) {
        buf = await fs.readFile(dest)
        skipped++
      } else {
        buf = c.getData ? c.getData() : await fetchRetry(c.url, true)
        if (buf.subarray(0, 1024).indexOf('%PDF') < 0) throw new Error('fichier non-PDF')
        await fs.writeFile(dest, buf)
        downloaded++
        if (c.url) await sleep(250)
      }
      manifest.push({
        concours: id,
        year: c.year,
        matiere: c.ep.matiere,
        code: c.ep.code,
        label: c.ep.label,
        badge: c.ep.badge,
        sujet: { url: `/${rel}`, pages: await countPages(buf), size: buf.length },
        source: c.url || `${meta.source} (archive ${c.year} : ${c.origin})`,
        attribution: meta.attribution,
        ...(meta.licence ? { licence: meta.licence } : {}),
      })
      console.log(`✔ ${meta.prefix} MP ${c.year} — ${c.ep.label}`)
    } catch (e) {
      console.error(`✘ ${meta.prefix} MP ${c.year} — ${c.ep.label} : ${e.message}`)
    }
  }
}

const ORDER = ['maths-1', 'maths-2', 'physique-1', 'physique-2', 'chimie', 'si', 'info', 'francais', 'anglais']
manifest.sort((a, b) => a.concours.localeCompare(b.concours) || a.year - b.year || ORDER.indexOf(a.code) - ORDER.indexOf(b.code))
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

const stats = {}
for (const e of manifest) {
  stats[e.concours] ??= { epreuves: 0, sessions: new Set() }
  stats[e.concours].epreuves++
  stats[e.concours].sessions.add(e.year)
}
console.log(`\nTéléchargés : ${downloaded} • déjà présents : ${skipped}`)
console.table(Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, { epreuves: v.epreuves, sessions: `${Math.min(...v.sessions)} → ${Math.max(...v.sessions)}` }])))
console.log(`Manifeste → ${path.relative(ROOT, MANIFEST)}`)
