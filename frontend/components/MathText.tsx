'use client'

import { Fragment } from 'react'
import { MathFormula } from './MathFormula'

/**
 * Affiche un texte contenant des formules LaTeX en ligne délimitées par `$...$`.
 * Les segments entre dollars sont rendus avec KaTeX, le reste en texte normal.
 */
export function MathText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/(\$[^$]+\$)/g)
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.length > 2 && part.startsWith('$') && part.endsWith('$') ? (
          <MathFormula key={i} math={part.slice(1, -1)} />
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </span>
  )
}
