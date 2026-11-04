'use client'

import { useEffect, useState } from 'react'
import katex from 'katex'

interface MathFormulaProps {
  math: string
  block?: boolean
  className?: string
}

export function MathFormula({ math, block = false, className = '' }: MathFormulaProps) {
  const [rendered, setRendered] = useState<string>('')

  useEffect(() => {
    try {
      const html = katex.renderToString(math, {
        throwOnError: false,
        displayMode: block,
      })
      setRendered(html)
    } catch {
      setRendered(math)
    }
  }, [math, block])

  if (!rendered) {
    return <span className={`inline-block font-mono text-xs opacity-70 ${className}`}>{math}</span>
  }

  return (
    <span
      className={`math-render ${block ? 'my-2 block overflow-x-auto text-center' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
}
