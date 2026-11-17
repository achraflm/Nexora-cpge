import type { LatexTranscription } from './image-to-latex'

export const studyWorkKinds = { td: 'TD', concours: 'Concours', probleme: 'Problème' } as const
export type StudyWorkTarget = { kind: keyof typeof studyWorkKinds; resourceId: string }

export type StudyWorkFolder = StudyWorkTarget & {
  title: string | null
  imageExtension: 'jpg' | 'png' | 'webp' | null
  updatedAt: string
  hasLatex: boolean
}

export type StudyWorkStatus = Exclude<LatexTranscription['status'], 'unreadable'>
export type StudyWork = StudyWorkFolder & { latex: string; transcriptionStatus: StudyWorkStatus | null }

function workQuery({ kind, resourceId }: StudyWorkTarget) {
  return new URLSearchParams({ kind, resourceId }).toString()
}

export function workApiUrl(target: StudyWorkTarget) {
  return '/api/study-work?' + workQuery(target)
}

export function workFolderUrl(target: StudyWorkTarget) {
  return '/pochettes/copie?' + workQuery(target)
}

export function workTitle(work: StudyWorkFolder) {
  return work.title ?? 'Copie de ' + (work.kind === 'td' ? studyWorkKinds.td : studyWorkKinds[work.kind].toLowerCase())
}

export function workImageName(work: StudyWorkFolder) {
  return work.imageExtension ? 'photo-de-la-copie.' + work.imageExtension : null
}

export function workLatexBody(latex: string) {
  const mathBlocks = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\r\n]+\$|\\begin\{(?:equation|align|gather|multline|tabular)\*?\}[\s\S]*?\\end\{(?:equation|align|gather|multline|tabular)\*?\})/g
  const mathCommand = /\\(?:frac|dfrac|tfrac|sqrt|sum|int|iint|oint|lim|prod|log|sin|cos|tan|Omega|omega|alpha|beta|gamma|theta|pi|lambda|mu|mathrm|mathbf|vec|infty)\b/
  const equation = /^[\w\\()[\]{}^_+,' .-]{1,32}=/
  return latex.trim().split(mathBlocks).map((part, index) => {
    if (index % 2) return part
    return part.replace(/^[^\r\n]+$/gm, line => {
      const expression = line.trim()
      const command = mathCommand.exec(expression)
      const bareFormula = (command && (command.index === 0 || equation.test(expression))) ||
        (equation.test(expression) && /[_^]/.test(expression))
      return bareFormula ? '\\[' + expression + '\\]' : line
    })
  }).join('')
}

export function workTex(work: StudyWork) {
  const latex = workLatexBody(work.latex)
  if (/\\begin\s*\{document\}/.test(latex)) return latex
  return String.raw`\documentclass[a4paper,11pt]{article}
\usepackage[T1]{fontenc}
\usepackage{amsmath,amssymb,booktabs}
\begin{document}
${latex}
\end{document}
`
}
