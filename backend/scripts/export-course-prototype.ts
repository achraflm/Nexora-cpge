import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { coursePrototype } from '../content/courses/prototype'
import { sectionsLatex, type CourseSource } from '../content/courses/format'

const sources = fileURLToPath(new URL('../content/courses/latex/', import.meta.url))
const output = fileURLToPath(new URL('../../frontend/public/cours-prototype/', import.meta.url))
const temporary = await mkdtemp(join(tmpdir(), 'nexora-course-prototype-'))

function document(title: string, context: string, body: string, source?: CourseSource, locator = '') {
  const footer = source?.attributionUrl ? String.raw`\makeatletter
\def\@oddfoot{\footnotesize Download for free at \url{${source.attributionUrl}}.\hfil\thepage}
\let\@evenfoot\@oddfoot
\makeatother` : ''
  const credits = source ? String.raw`\bigskip
{\footnotesize Adaptation française par Nexora CPGE. Source : ${source.author},
\href{${source.url.replace(/[%#]/g, character => '\\' + character)}}{\textit{${source.book}}}${locator ? ', ' + locator : ''}.
\href{${source.licenseUrl}}{${source.license}}.}` : ''
  return String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{amsmath,amssymb,xcolor}
\usepackage[margin=25mm]{geometry}
\usepackage[colorlinks=true,urlcolor=blue]{hyperref}
\definecolor{nexorablue}{HTML}{2459B5}
\setlength{\parindent}{0pt}
\setlength{\parskip}{7pt}
\setlength{\emergencystretch}{2em}
\renewcommand{\familydefault}{\sfdefault}
\begin{document}
${footer}
{\small\bfseries\color{nexorablue} NEXORA CPGE}\par
{\small ${context}}\par
{\LARGE\bfseries ${title}}\par
\vspace{0.25em}\hrule\vspace{0.6em}

${body.replace(/\$\$([\s\S]+?)\$\$/g, '\\[$1\\]')}

${credits}
\end{document}
`
}

async function exportDocument(slug: string, name: string, source: string) {
  const texDir = join(sources, slug)
  const pdfDir = join(output, slug)
  const tex = join(texDir, name + '.tex')
  const pdf = join(pdfDir, name + '.pdf')
  const [previousSource, previousPdf] = await Promise.all([
    readFile(tex, 'utf8').catch(() => null),
    readFile(pdf).catch(() => null),
  ])
  if (previousSource === source && previousPdf?.subarray(0, 5).toString() === '%PDF-') return
  await Promise.all([mkdir(texDir, { recursive: true }), mkdir(pdfDir, { recursive: true })])
  const buildSource = join(temporary, name + '.tex')
  await writeFile(buildSource, source, 'utf8')
  const compiled = spawnSync('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${temporary}`, buildSource],
    { encoding: 'utf8', env: { ...process.env, SOURCE_DATE_EPOCH: '1794787200' } })
  if (compiled.status !== 0) throw new Error(`${name}: ${compiled.error ?? (compiled.stdout + compiled.stderr).slice(-4000)}`)
  const log = await readFile(join(temporary, name + '.log'), 'utf8')
  if (log.includes('Overfull \\hbox')) throw new Error(`Une ligne dépasse dans ${name}.\n${log.match(/Overfull \\hbox[^\r\n]*[\s\S]{0,160}/)?.[0] ?? ''}`)
  await copyFile(join(temporary, name + '.pdf'), pdf)
  await copyFile(buildSource, tex)
}

try {
  for (const course of coursePrototype) {
    const stream = course.level === 'SUP' ? 'MPSI' : 'MP'
    await exportDocument(course.slug, 'cours', document(course.title, stream + ' / Cours', sectionsLatex(course.sections), course.source))
    for (const exercise of course.exercises) {
      const source = course.source && exercise.url ? { ...course.source, url: exercise.url } : undefined
      const context = stream + ' / ' + exercise.ref
      await exportDocument(course.slug, exercise.ref + '-enonce', document(exercise.title, context + ' / Énoncé', exercise.statement, source, exercise.locator))
      await exportDocument(course.slug, exercise.ref + '-corrige', document(exercise.title, context + ' / Corrigé', sectionsLatex(exercise.solution), source, exercise.locator))
    }
    console.log(course.title + ' : cours et ' + course.exercises.length + ' exercices exportés.')
  }
} finally {
  // pdflatex creates only auxiliary files in this task-owned directory.
  if (temporary.startsWith(join(tmpdir(), 'nexora-course-prototype-'))) await rm(temporary, { recursive: true, force: true })
}
