'use client'

import { MathFormula } from './MathFormula'
import type { PublishedSource } from '@/lib/published-courses'
import type { ReactNode } from 'react'

export function PublishedSourceCredit({ source, children }: { source: PublishedSource; children?: ReactNode }) {
  return <div className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
    <details>
      <summary className="cursor-pointer">Crédits et licences</summary>
      <p className="mt-2">
        Adaptation de {source.author} ·{' '}
        <a className="underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.book}</a> ·{' '}
        <a className="underline" href={source.licenseUrl} target="_blank" rel="noopener noreferrer">{source.license}</a>
      </p>
      {children}
    </details>
    {source.attributionUrl && <p className="mt-1">Download for free at <a className="break-all underline" href={source.attributionUrl} target="_blank" rel="noopener noreferrer">{source.attributionUrl}</a>.</p>}
  </div>
}

export function CourseLatex({ value, className = '' }: { value: string; className?: string }) {
  const tokens = value.split(/(\$\$[\s\S]+?\$\$|\$[^$\r\n]+\$)/g)
  return <div className={`whitespace-pre-line break-words ${className}`}>
    {tokens.map((token, index) => {
      if (index % 2 === 0) return token
      const display = token.startsWith('$$')
      const delimiterLength = display ? 2 : 1
      return <MathFormula key={index} math={token.slice(delimiterLength, -delimiterLength).trim()} block={display} />
    })}
  </div>
}
