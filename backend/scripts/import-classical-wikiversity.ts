import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { problemInput, stages, publicationErrors } from '../services/catalog-course-service/src/classical-policy'

const origin = 'http://localhost:3000'
const license = 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr'
const directory = new URL('../content/classical/wikiversity/', import.meta.url)
const entries = [
  {
    key: 'gauss',
    title: 'Intégrale gaussienne',
    slug: 'Int%C3%A9grale_de_Gauss',
    revision: 815606,
    description: 'Quatre parties pour retrouver la valeur de l’intégrale de Gauss à partir d’une intégrale à paramètre et d’une identité différentielle.',
    minutes: 75,
  },
  {
    key: 'gamma',
    title: 'Fonction gamma d’Euler',
    slug: 'Fonction_Gamma_et_formule_de_Stirling',
    revision: 961608,
    description: 'Trois parties pour étudier la convergence de la fonction Gamma et établir la formule asymptotique de Stirling. La valeur de l’intégrale de Gauss intervient dans la dernière partie.',
    minutes: 100,
  },
  {
    key: 'cinetique',
    title: 'Cinétique d’une réaction en chaîne',
    slug: '',
    revision: 831185,
    description: 'Six questions pour identifier les étapes d’un mécanisme radicalaire, établir sa loi de vitesse et étudier l’effet de l’irradiation.',
    minutes: 45,
    subject: 'CHEM',
    chapter: 'Cinétique chimique',
    prerequisites: ['Vitesses de réaction', 'Actes élémentaires'],
    sourceName: 'Wikiversité — Cinétique chimique',
    sourceUrl: 'https://fr.wikiversity.org/wiki/Cin%C3%A9tique_chimique/Exercices/M%C3%A9canisme_chimique',
    curriculum: 'Programme MPSI : cinétique chimique et mécanismes réactionnels.',
  },
  {
    key: 'compte',
    title: 'Le compte est bon',
    slug: '',
    revision: 0,
    description: 'Construire progressivement un solveur pour atteindre un entier cible. Le problème passe du tirage des plaques à la recherche récursive des opérations.',
    minutes: 100,
    subject: 'INFO',
    chapter: 'Récursivité et parcours d’arbres',
    prerequisites: ['Listes Python', 'Boucles', 'Fonctions récursives'],
    sourceName: 'Exo7 — Python au lycée, tome 2',
    sourceUrl: 'https://exo7math.github.io/python2-exo7/',
    documents: {
      enonce: 'https://exo7math.github.io/python2-exo7/chiffres/chiffres.pdf',
      correction: 'https://github.com/exo7math/python2-exo7/blob/master/chiffres/chiffres.py',
    },
    author: 'Arnaud Bodin',
    terms: 'CC BY-NC-SA 4.0',
    termsUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr',
    curriculum: 'Programme CPGE : programmation Python, récursivité et parcours d’un arbre de recherche.',
  },
]

let cookie = ''
async function api<T>(path: string, method = 'GET', data?: object): Promise<T> {
  const multipart = data instanceof FormData
  const response = await fetch(origin + path, {
    method,
    headers: { Origin: origin, Cookie: cookie, ...(multipart ? {} : { 'Content-Type': 'application/json' }) },
    body: multipart ? data : data ? JSON.stringify(data) : undefined,
  })
  if (path === '/api/auth/login') cookie = response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
  const result = await response.json()
  assert.ok(response.ok, JSON.stringify(result))
  return result
}

type Resource = {id: string; revision: number; title: string}
type Row = {id: string; revision: number; title: string; state: typeof stages[number]; subject: {code: string}}

try {
  await api('/api/auth/login', 'POST', {
    email: process.env.IMPORT_ADMIN_EMAIL || 'admin.demo@example.test',
    password: process.env.IMPORT_ADMIN_PASSWORD || 'Nexora-Admin-2026!',
  })
  const { problems } = await api<{problems: Row[]}>('/api/classical-problems')
  const { resources } = await api<{resources: Resource[]}>('/api/resources')
  for (const entry of entries) {
    const subject = entry.subject ?? 'MATH'
    const level = subject === 'MATH' ? 'SPE' : 'SUP'
    const sourceName = entry.sourceName ?? 'Wikiversité — Intégration de Riemann'
    const author = entry.author ?? 'Contributeurs et contributrices de Wikiversité'
    const terms = entry.terms ?? 'CC BY-SA 4.0'
    const termsUrl = entry.termsUrl ?? license
    const existing = problems.find(row => row.subject.code === subject && row.title === entry.title)
    if (existing?.state === 'PUBLISHED') continue

    const sourceUrl = entry.sourceUrl ?? 'https://fr.wikiversity.org/wiki/Int%C3%A9gration_de_Riemann/Devoir/' + entry.slug
    async function upload(kind: 'enonce' | 'correction') {
      const title = `${entry.title} — ${entry.author ? 'Exo7' : 'Wikiversité'} — ${kind}`
      const prior = resources.find(resource => resource.title === title)
      if (prior) return prior
      const form = new FormData()
      const filename = `${entry.key}-${kind}.pdf`
      form.append('file', new Blob([await readFile(new URL(filename, directory))], {type: 'application/pdf'}), filename)
      form.append('metadata', JSON.stringify({
        title, description: `Document original de ${sourceName}. ${terms}.`,
        track: level === 'SUP' ? 'MPSI' : 'MP', level, subject, type: 'TD', status: 'DRAFT', allowDownload: false,
      }))
      return api<Resource>('/api/resources', 'POST', form)
    }

    function source(resource: Resource, kind: 'enonce' | 'correction') {
      const documentUrl = entry.documents?.[kind] ?? 'https://fr.wikiversity.org/w/index.php?oldid=' + entry.revision
      return {
        sourceName, author, sourceUrl, documentUrl,
        locator: kind === 'enonce' ? 'Énoncé original' : entry.documents ? 'Code de correction publié par l’auteur' : 'Solution publiée avec l’énoncé',
        verifiedAt: '2026-11-16',
        evidence: 'Version originale inspectée. Le texte et les formules proviennent de la page citée. La mise en page PDF sépare énoncé et corrigé.',
        format: 'PDF', license: terms,
        licenseEvidence: `${sourceUrl} · Licence indiquée en bas de la page source · ${termsUrl}`,
        access: 'LOCAL', resourceId: resource.id, resourceRevision: resource.revision, originalConfirmed: true,
      }
    }

    const input = problemInput.parse({
      title: entry.title, subject, level, tracks: ['MP'],
      chapterLabel: entry.chapter ?? 'Intégrales dépendant d’un paramètre', difficulty: 'ADVANCED',
      problemType: 'CLASSICAL_PROBLEM', correctionStatus: 'AUTHOR_PUBLISHED',
      metadata: {
        description: entry.description, topic: entry.title, estimatedMinutes: entry.minutes,
        prerequisites: entry.prerequisites ?? ['Intégrales impropres', 'Intégrales à paramètre', 'Changements de variable'],
        statement: source(await upload('enonce'), 'enonce'),
        correction: source(await upload('correction'), 'correction'),
        curriculumEvidence: entry.curriculum ?? 'Programme marocain de MP, analyse : intégrales généralisées et études d’intégrales dépendant d’un paramètre.',
        nonCompetitionEvidence: `Problème pédagogique publié dans ${sourceName}.`,
        copyrightReviewed: true,
        editorialNote: 'Énoncé et corrigé importés depuis la source citée. Mise en page PDF sans réécriture.',
      },
    })
    assert.deepEqual(publicationErrors(input, 'PUBLISHED'), [])
    let row = existing && existing.state === 'DISCOVERED'
      ? await api<Row>(`/api/classical-problems/${existing.id}`, 'PATCH', { revision: existing.revision, problem: input })
      : existing ?? await api<Row>('/api/classical-problems', 'POST', input)
    for (const state of stages.slice(1, 8)) {
      if (stages.indexOf(state) <= stages.indexOf(row.state)) continue
      row = await api<Row>(`/api/classical-problems/${row.id}/review`, 'POST', {
        revision: row.revision, state,
        note: `Vérification des documents originaux, de la séparation énoncé/corrigé et de la licence ${terms}.`,
      })
    }
    console.log(row.state, row.title)
  }
} finally {
  if (cookie) await api('/api/auth/logout', 'POST', {}).catch(() => {})
}
