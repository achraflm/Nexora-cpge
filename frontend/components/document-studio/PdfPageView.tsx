"use client"

import { memo, useEffect, useRef, useState } from "react"
import { getPageText, isRenderCancel, loadPdfJs, normalizeForSearch, type PDFDocumentProxy, type RenderTask } from "./pdf-engine"

export interface PageSize {
  width: number
  height: number
}

interface PdfPageViewProps {
  doc: PDFDocumentProxy
  pageNumber: number
  /** Échelle CSS finale (inclut la conversion points → pixels) */
  scale: number
  size: PageSize
  /** Rendre réellement la page (sinon simple emplacement réservé) */
  active: boolean
  textLayer: boolean
  highlight?: string
  className?: string
  registerRef?: (page: number, el: HTMLDivElement | null) => void
}

const MAX_CANVAS_PIXELS = 16_000_000

function PdfPageViewBase({
  doc,
  pageNumber,
  scale,
  size,
  active,
  textLayer,
  highlight,
  className = "",
  registerRef,
}: PdfPageViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const textHostRef = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(false)
  const [error, setError] = useState(false)
  const [textVersion, setTextVersion] = useState(0)

  const width = Math.floor(size.width * scale)
  const height = Math.floor(size.height * scale)

  // Rendu du canvas : le nouveau rendu est préparé hors écran puis échangé (pas de flash au zoom)
  useEffect(() => {
    if (!active) {
      // Libère la mémoire des pages éloignées de la zone visible
      const host = canvasHostRef.current
      if (host) host.replaceChildren()
      if (textHostRef.current) textHostRef.current.replaceChildren()
      setRendered(false)
      return
    }
    let cancelled = false
    let task: RenderTask | null = null
    let textLayerInstance: { cancel: () => void } | null = null

    ;(async () => {
      try {
        const page = await doc.getPage(pageNumber)
        if (cancelled) return
        const viewport = page.getViewport({ scale })
        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
        let outputScale = Math.min(dpr, 2.5)
        const pixels = viewport.width * viewport.height * outputScale * outputScale
        if (pixels > MAX_CANVAS_PIXELS) outputScale = Math.sqrt(MAX_CANVAS_PIXELS / (viewport.width * viewport.height))

        const canvas = document.createElement("canvas")
        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.className = "ds-canvas"
        task = page.render({
          canvas,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
        })
        await task.promise
        if (cancelled) return
        canvasHostRef.current?.replaceChildren(canvas)
        setRendered(true)
        setError(false)

        if (textLayer && textHostRef.current) {
          const pdfjs = await loadPdfJs()
          if (cancelled) return
          const host = textHostRef.current
          host.replaceChildren()
          const tl = new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: host, viewport })
          textLayerInstance = tl
          await tl.render()
          if (!cancelled) setTextVersion((v) => v + 1)
        }
      } catch (err) {
        if (!cancelled && !isRenderCancel(err)) setError(true)
      }
    })()

    return () => {
      cancelled = true
      task?.cancel()
      textLayerInstance?.cancel()
    }
  }, [doc, pageNumber, scale, active, textLayer])

  // Surlignage des occurrences de la recherche dans la couche texte
  useEffect(() => {
    const host = textHostRef.current
    if (!host) return
    host.querySelectorAll("mark.ds-hit").forEach((m) => {
      const parent = m.parentNode
      if (!parent) return
      parent.replaceChild(document.createTextNode(m.textContent || ""), m)
      parent.normalize()
    })
    host.querySelectorAll(".ds-hit-span").forEach((s) => s.classList.remove("ds-hit-span"))
    const q = highlight?.trim()
    if (!q || q.length < 2) return
    const qLower = q.toLowerCase()
    const qNorm = normalizeForSearch(q)
    host.querySelectorAll<HTMLSpanElement>(":scope span:not(.markedContent)").forEach((span) => {
      const text = span.textContent || ""
      if (!text) return
      const lower = text.toLowerCase()
      let idx = lower.indexOf(qLower)
      if (idx >= 0 && span.childNodes.length === 1 && span.firstChild?.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment()
        let last = 0
        while (idx >= 0) {
          frag.append(text.slice(last, idx))
          const mark = document.createElement("mark")
          mark.className = "ds-hit"
          mark.textContent = text.slice(idx, idx + q.length)
          frag.append(mark)
          last = idx + q.length
          idx = lower.indexOf(qLower, last)
        }
        frag.append(text.slice(last))
        span.replaceChildren(frag)
      } else if (normalizeForSearch(text).includes(qNorm)) {
        span.classList.add("ds-hit-span")
      }
    })
  }, [highlight, textVersion])

  // Pré-chargement du texte pour la recherche quand la page devient visible
  useEffect(() => {
    if (active && textLayer) void getPageText(doc, pageNumber)
  }, [active, doc, pageNumber, textLayer])

  return (
    <div
      ref={(el) => {
        wrapperRef.current = el
        registerRef?.(pageNumber, el)
      }}
      data-page={pageNumber}
      className={`ds-page relative shrink-0 bg-white ${className}`}
      style={
        {
          width,
          height,
          "--scale-factor": scale,
          "--total-scale-factor": scale,
          "--scale-round-x": "1px",
          "--scale-round-y": "1px",
        } as React.CSSProperties
      }
      aria-label={`Page ${pageNumber}`}
    >
      <div ref={canvasHostRef} className="absolute inset-0" />
      {textLayer && <div ref={textHostRef} className="textLayer" />}
      {!rendered && (
        <div className="ds-page-placeholder absolute inset-0 flex items-center justify-center">
          {error ? (
            <span className="text-xs font-medium text-neutral-400">Impossible d’afficher la page {pageNumber}</span>
          ) : (
            <span className="font-mono text-[11px] tracking-wider text-neutral-300">{pageNumber}</span>
          )}
        </div>
      )}
    </div>
  )
}

export const PdfPageView = memo(PdfPageViewBase)
