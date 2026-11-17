import katex from 'katex'
import { chapterLatexSections } from './chapter-latex'
import type { LatexTranscription } from './image-to-latex'
import { workLatexBody } from './study-work'

type Part = { text: string } | { html: string; display: boolean } | { error: true }
type Section = { title: Part[]; content: Part[] }
type Block = { sections: Section[] } | { rows: Section[][][] }
export type CompiledStudyWork = { blocks: Block[]; valid: boolean }

// Delimiters that survive as raw text signal an unfinished expression. KaTeX
// catches invalid commands and unbalanced braces inside complete expressions.
const math = /(?<!\\)(\$\$)([\s\S]*?)\$\$|(?<![\\$])(\$)(?!\$)((?:\\.|[^$\\\r\n])+?)\$(?!\$)/g
const rawLatex = /(?<!\\)\$|\\(?:[\[\]()]|[a-zA-Z]+)/
const rawCommands = /\\[,;:! ]|\\quad\b|\\qquad\b/g
const markers = /\[(?:[^\]\r\n]*illisible|zone trop dense[^\]\r\n]*)\]|_\s*\{\s*\\square\s*\}/i
const tabularStart = /\\begin\{tabular\}\s*(?:\[[^\]\r\n]*\]\s*)?\{(?:[^{}]|\{[^{}]*\})*\}/
const tabularEnd = '\\end{tabular}'

function readTable(source: string) {
  const rows: string[][] = []
  let row: string[] = []
  let start = 0
  let braces = 0
  let environments = 0
  for (let i = 0; i < source.length; i++) {
    const token = source[i]
    if (token === '\\') {
      const scope = source.startsWith('\\begin{', i) ? 1 : source.startsWith('\\end{', i) ? -1 : 0
      environments += scope
      if (source[i + 1] === '\\' && !braces && !environments) {
        row.push(source.slice(start, i))
        if (row.some(cell => cell.trim())) rows.push(row)
        row = []
        i++
        const spacing = source.slice(i + 1).match(/^\[[^\]\r\n]{0,48}\]/)?.[0]
        if (spacing) i += spacing.length
        start = i + 1
      } else if (i < source.length - 1) {
        i++
      }
    } else if (token === '{') {
      braces++
    } else if (token === '}') {
      braces--
    } else if (token === '&' && !braces && !environments) {
      row.push(source.slice(start, i))
      start = i + 1
    }
  }
  row.push(source.slice(start))
  if (row.some(cell => cell.trim())) rows.push(row)
  return rows
}

export function compileStudyWork(latex: string): CompiledStudyWork {
  let valid = true
  let hasContent = false
  const blocks: Block[] = []

  function parseParts(value: string): Part[] {
    const parts: Part[] = []
    let cursor = 0

    function addText(value: string) {
      const plain = value.replace(rawCommands, ' ')
      // A TeX escape is allowed for a literal character in prose.
      const unescaped = plain.replace(/\\([$\\{}])/g, '$1')
      if (rawLatex.test(plain)) {
        valid = false
        parts.push({ error: true })
      } else if (unescaped) {
        hasContent ||= Boolean(unescaped.trim())
        parts.push({ text: unescaped })
      }
    }

    for (const match of value.matchAll(math)) {
      addText(value.slice(cursor, match.index))
      const display = Boolean(match[1])
      try {
        const expression = (match[2] ?? match[4]).trim()
        if (!expression) throw new Error('Empty expression')
        const html = katex.renderToString(expression, { displayMode: display, throwOnError: true, strict: 'ignore', trust: false, maxSize: 24 })
        hasContent = true
        parts.push({ html, display })
      } catch {
        valid = false
        parts.push({ error: true })
      }
      cursor = match.index + match[0].length
    }
    addText(value.slice(cursor))
    return parts
  }

  function sections(source: string): Section[] {
    return chapterLatexSections(source).map(section => ({ title: parseParts(section.title), content: parseParts(section.content) }))
  }

  let body = workLatexBody(latex)
  const document = body.match(/\\begin\s*\{document\}([\s\S]*?)\\end\s*\{document\}/)
  if (document) body = document[1]
  body = body.replace(/(?<!\\)%[^\r\n]*/g, '')
    .replace(/\\(?:begin\{table\*?\}(?:\[[^\]]*\])?|end\{table\*?\}|centering\b)/g, '')

  for (let start = tabularStart.exec(body); start; start = tabularStart.exec(body)) {
    const end = body.indexOf(tabularEnd, start.index + start[0].length)
    if (end === -1) break
    blocks.push({ sections: sections(body.slice(0, start.index)) })
    const contents = body.slice(start.index + start[0].length, end)
      .replace(/\\(?:hline|toprule|midrule|bottomrule)\b/g, '')
      .replace(/\\(?:cline|hhline)\{[^{}]*\}/g, '')
    blocks.push({ rows: readTable(contents).map(row => row.map(sections)) })
    body = body.slice(end + tabularEnd.length)
  }
  blocks.push({ sections: sections(body) })
  return { blocks, valid: valid && hasContent }
}

export function hasUnreadableStudyWork(latex: string) {
  return markers.test(latex)
}

export function isCompleteStudyWork(latex: string, status: LatexTranscription['status'] | null | undefined, rendering: CompiledStudyWork) {
  return (status == null || status === 'ok') && rendering.valid && !hasUnreadableStudyWork(latex)
}
