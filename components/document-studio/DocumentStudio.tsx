"use client"

// ============================================================================
// Document Studio — lecteur PDF de la plateforme
// ----------------------------------------------------------------------------
// - Rendu pdf.js (canvas HiDPI + couche texte sélectionnable)
// - Lazy rendering : seules les pages proches de la zone visible sont rendues
// - Dispositions : continu, page par page, double page
// - Zoom libre / ajusté largeur / page entière, Ctrl + molette
// - Sidebar contextuelle : miniatures, recherche, signets
// - Deux expériences : Study Mode (complet) et Exam Mode (immersif, minimal)
// Le changement de mode ne démonte pas le lecteur : page, zoom et position
// de lecture sont conservés.
// ============================================================================

import "./document-studio.css"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { FileWarning, RotateCw } from "lucide-react"
import { MAX_SCALE, MIN_SCALE, STUDIO_MODES, ZOOM_STEPS, type SidebarPanel, type StudioLayout, type StudioMode, type ZoomMode } from "./modes"
import { CSS_UNITS, describePdfError, getPageText, normalizeForSearch, openPdf, type PDFDocumentProxy } from "./pdf-engine"
import { PdfPageView, type PageSize } from "./PdfPageView"
import { StudioSidebar, type SearchResult, type SearchState } from "./StudioSidebar"
import { ExamDock, StudyToolbar, type StudioDocument, type ToolbarActions, type ToolbarState } from "./StudioToolbar"
import { readLastPosition, saveLastPosition, useBookmarks, useReadingPreferences } from "./useReadingPreferences"
import { useVisiblePages } from "./useVisiblePages"

export type { StudioDocument } from "./StudioToolbar"
export type { StudioMode } from "./modes"

export interface DocumentStudioProps {
  mode: StudioMode
  documents: StudioDocument[]
  activeDocumentId: string
  onDocumentChange?: (id: string) => void
  title?: string
  /** Contenu affiché à la place des pages (ex. phase de préparation d'examen) — le document reste chargé */
  concealed?: ReactNode
  onPageChange?: (page: number, numPages: number) => void
  /** Reprendre à la dernière page lue (Study Mode) */
  rememberPosition?: boolean
  className?: string
}

const EMPTY_SEARCH: SearchState = { query: "", results: [], running: false, scannedPages: 0, activeIndex: 0 }
const EXAM_DOCK_SPACE = 84
const MAX_READING_WIDTH = 1100

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable
}

export function DocumentStudio({
  mode,
  documents,
  activeDocumentId,
  onDocumentChange,
  title,
  concealed,
  onPageChange,
  rememberPosition = false,
  className = "",
}: DocumentStudioProps) {
  const config = STUDIO_MODES[mode]
  const activeDoc =
    documents.find((d) => d.id === activeDocumentId && !d.locked) ?? documents.find((d) => !d.locked) ?? documents[0]
  const url = activeDoc.url

  // ------------------------------------------------------------------------
  // Chargement du document
  // ------------------------------------------------------------------------
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [progress, setProgress] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [reloadToken, setReloadToken] = useState(0)
  const [sizes, setSizes] = useState<PageSize[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const numPages = doc?.numPages ?? 0

  /** Position de lecture : page en haut de l'écran + fraction déjà défilée */
  const anchorRef = useRef<{ page: number; ratio: number }>({ page: 1, ratio: 0 })
  const rememberRef = useRef(rememberPosition)
  rememberRef.current = rememberPosition
  const concealedRef = useRef(Boolean(concealed))
  concealedRef.current = Boolean(concealed)

  useEffect(() => {
    let cancelled = false
    let destroy: (() => void) | null = null
    setStatus("loading")
    setDoc(null)
    setProgress(null)
    setSizes([])
    ;(async () => {
      try {
        const opened = await openPdf(url, (r) => !cancelled && setProgress(r))
        destroy = () => void opened.task.destroy()
        const pdf = await opened.promise
        if (cancelled) return
        const first = await pdf.getPage(1)
        const vp = first.getViewport({ scale: 1 })
        const base: PageSize = { width: vp.width, height: vp.height }
        if (cancelled) return
        const stored = rememberRef.current ? readLastPosition(url) : null
        const startPage = stored && stored <= pdf.numPages ? stored : 1
        anchorRef.current = { page: startPage, ratio: 0 }
        setSizes(Array.from({ length: pdf.numPages }, () => base))
        setCurrentPage(startPage)
        setDoc(pdf)
        setStatus("ready")
        // Dimensions réelles de chaque page en arrière-plan (formats mixtes)
        const all: PageSize[] = [base]
        for (let i = 2; i <= pdf.numPages; i++) {
          const v = (await pdf.getPage(i)).getViewport({ scale: 1 })
          if (cancelled) return
          all.push({ width: v.width, height: v.height })
        }
        if (all.some((s) => Math.abs(s.width - base.width) > 0.5 || Math.abs(s.height - base.height) > 0.5)) setSizes(all)
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(describePdfError(err))
          setStatus("error")
        }
      }
    })()
    return () => {
      cancelled = true
      destroy?.()
    }
  }, [url, reloadToken])

  // ------------------------------------------------------------------------
  // Préférences, dimensions, responsive
  // ------------------------------------------------------------------------
  const { prefs, update } = useReadingPreferences()
  const layout: StudioLayout = prefs.layout
  const rootRef = useRef<HTMLDivElement>(null)
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [rootWidth, setRootWidth] = useState(1200)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(([e]) => setRootWidth(e.contentRect.width))
    ro.observe(root)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!scrollEl) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setViewport((v) => (Math.abs(v.w - width) < 1 && Math.abs(v.h - height) < 1 ? v : { w: width, h: height }))
    })
    ro.observe(scrollEl)
    return () => ro.disconnect()
  }, [scrollEl])

  const compact = rootWidth < 820
  const overlaySidebar = rootWidth < 1024
  const [overlayOpen, setOverlayOpen] = useState(false)
  const sidebarVisible = overlaySidebar ? overlayOpen : prefs.sidebarOpen[mode]
  const panel: SidebarPanel = config.panels.includes(prefs.panel) ? prefs.panel : config.panels[0]

  // ------------------------------------------------------------------------
  // Zoom
  // ------------------------------------------------------------------------
  const pad = compact ? 16 : 32
  const gap = layout === "spread" ? 16 : 0
  const bottomSpace = config.toolbar === "dock" ? EXAM_DOCK_SPACE : 0

  const { fitWidth, fitPage } = useMemo(() => {
    if (!sizes.length || viewport.w === 0) return { fitWidth: 1, fitPage: 1 }
    const maxW = Math.max(...sizes.map((s) => s.width))
    const ref = sizes[0]
    const cols = layout === "spread" ? 2 : 1
    // Largeur de lecture confortable : on n'étire pas une page au-delà de ~1100 px
    const available = Math.min(viewport.w - pad * 2 - gap, cols * MAX_READING_WIDTH + gap)
    const fw = available / (cols * maxW * CSS_UNITS)
    const fh = (viewport.h - pad * 2 - bottomSpace) / (ref.height * CSS_UNITS)
    return { fitWidth: fw, fitPage: Math.min(fw, fh) }
  }, [sizes, viewport.w, viewport.h, pad, gap, layout, bottomSpace])

  const rawZoom = prefs.zoomMode === "fit-width" ? fitWidth : prefs.zoomMode === "fit-page" ? fitPage : prefs.scale
  // Quantification : évite de re-rendre les pages pour des variations d'un pixel
  const zoom = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(rawZoom * 100) / 100))
  const renderScale = Math.round(zoom * CSS_UNITS * 1000) / 1000
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  const setZoom = useCallback((z: number) => update({ zoomMode: "custom", scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, z)) }), [update])
  const zoomIn = useCallback(() => {
    const z = zoomRef.current
    setZoom(ZOOM_STEPS.find((s) => s > z + 0.001) ?? z * 1.15)
  }, [setZoom])
  const zoomOut = useCallback(() => {
    const z = zoomRef.current
    setZoom([...ZOOM_STEPS].reverse().find((s) => s < z - 0.001) ?? z / 1.15)
  }, [setZoom])
  const setZoomMode = useCallback((m: ZoomMode) => update({ zoomMode: m }), [update])

  // ------------------------------------------------------------------------
  // Pages, lazy rendering et suivi de la page courante
  // ------------------------------------------------------------------------
  const rows: number[][] = useMemo(() => {
    if (!numPages) return []
    if (layout === "single") return [[Math.min(currentPage, numPages)]]
    if (layout === "spread") {
      const r: number[][] = []
      for (let i = 1; i <= numPages; i += 2) r.push(i + 1 <= numPages ? [i, i + 1] : [i])
      return r
    }
    return Array.from({ length: numPages }, (_, i) => [i + 1])
  }, [numPages, layout, currentPage])

  const { visible, register } = useVisiblePages(scrollEl, "150% 0px", [layout, numPages])
  const pageEls = useRef(new Map<number, HTMLDivElement>())
  const registerPage = useCallback(
    (n: number, el: HTMLElement | null) => {
      if (el) pageEls.current.set(n, el as HTMLDivElement)
      else pageEls.current.delete(n)
      register(n, el)
    },
    [register]
  )

  const measure = useCallback(() => {
    const el = scrollEl
    // Document masqué (préparation d'examen) ou pages pas encore montées : on conserve la position
    if (!el || layout === "single" || !numPages || concealedRef.current || !pageEls.current.size) return
    const top = el.scrollTop
    const probe = top + el.clientHeight * 0.3
    let current = 1
    let anchor = 1
    for (let n = 1; n <= numPages; n++) {
      const p = pageEls.current.get(n)
      if (!p) continue
      if (p.offsetTop <= probe) current = n
      if (p.offsetTop <= top + 1) anchor = n
      if (p.offsetTop > probe) break
    }
    const a = pageEls.current.get(anchor)
    anchorRef.current = { page: anchor, ratio: a ? Math.max(0, (top - a.offsetTop) / a.offsetHeight) : 0 }
    setCurrentPage(current)
  }, [scrollEl, layout, numPages])

  const rafRef = useRef(0)
  const onScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      measure()
    })
  }, [measure])

  // Restaure la position de lecture après un changement de zoom, de disposition ou de taille
  useLayoutEffect(() => {
    const el = scrollEl
    if (!el || !doc || viewport.w === 0) return
    if (layout === "single") {
      el.scrollTop = 0
      return
    }
    const { page, ratio } = anchorRef.current
    const target = pageEls.current.get(page)
    if (target) el.scrollTop = target.offsetTop + ratio * target.offsetHeight - (ratio === 0 ? pad / 2 : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderScale, layout, sizes, doc, scrollEl, viewport.w === 0, Boolean(concealed)])

  const goTo = useCallback(
    (page: number) => {
      if (!numPages) return
      const p = Math.min(Math.max(1, Math.round(page)), numPages)
      anchorRef.current = { page: p, ratio: 0 }
      setCurrentPage(p)
      if (layout === "single") {
        if (scrollEl) scrollEl.scrollTop = 0
        return
      }
      const el = pageEls.current.get(p)
      if (el && scrollEl) scrollEl.scrollTop = el.offsetTop - pad / 2
    },
    [numPages, layout, scrollEl, pad]
  )

  const step = useCallback(
    (dir: 1 | -1) => {
      if (layout === "spread") {
        const rowStart = currentPage % 2 === 1 ? currentPage : currentPage - 1
        goTo(rowStart + dir * 2)
      } else goTo(currentPage + dir)
    },
    [layout, currentPage, goTo]
  )

  useEffect(() => {
    if (numPages) onPageChange?.(currentPage, numPages)
  }, [currentPage, numPages, onPageChange])

  useEffect(() => {
    if (!rememberPosition || !numPages) return
    const t = setTimeout(() => saveLastPosition(url, currentPage), 600)
    return () => clearTimeout(t)
  }, [rememberPosition, url, currentPage, numPages])

  // Ctrl + molette / pincement trackpad = zoom
  useEffect(() => {
    if (!scrollEl) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setZoom(zoomRef.current * Math.exp(-e.deltaY * 0.0025))
    }
    scrollEl.addEventListener("wheel", onWheel, { passive: false })
    return () => scrollEl.removeEventListener("wheel", onWheel)
  }, [scrollEl, setZoom])

  // ------------------------------------------------------------------------
  // Recherche
  // ------------------------------------------------------------------------
  const [search, setSearch] = useState<SearchState>(EMPTY_SEARCH)
  const [searchFocusToken, setSearchFocusToken] = useState(0)

  useEffect(() => setSearch(EMPTY_SEARCH), [url])

  useEffect(() => {
    const q = search.query.trim()
    if (!doc || q.length < 2 || !config.allowSearch) {
      setSearch((s) => (s.results.length || s.running ? { ...s, results: [], running: false, scannedPages: 0 } : s))
      return
    }
    let cancelled = false
    const needle = normalizeForSearch(q)
    const timer = setTimeout(async () => {
      const results: SearchResult[] = []
      setSearch((s) => ({ ...s, running: true, scannedPages: 0, results: [], activeIndex: 0 }))
      for (let p = 1; p <= doc.numPages; p++) {
        const text = await getPageText(doc, p)
        if (cancelled) return
        const hay = normalizeForSearch(text)
        let idx = hay.indexOf(needle)
        while (idx >= 0 && results.length < 500) {
          const flat = (s: string) => s.replace(/\s+/g, " ")
          results.push({
            page: p,
            before: (idx > 40 ? "…" : "") + flat(text.slice(Math.max(0, idx - 40), idx)),
            match: flat(text.slice(idx, idx + q.length)),
            after: flat(text.slice(idx + q.length, idx + q.length + 60)),
          })
          idx = hay.indexOf(needle, idx + needle.length)
        }
        if (p % 4 === 0 || p === doc.numPages) {
          const snapshot = results.slice()
          setSearch((s) => ({ ...s, results: snapshot, scannedPages: p }))
        }
      }
      if (!cancelled) setSearch((s) => ({ ...s, running: false }))
    }, 220)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [search.query, doc, config.allowSearch])

  const selectResult = useCallback(
    (i: number) => {
      const r = search.results[i]
      if (!r) return
      setSearch((s) => ({ ...s, activeIndex: i }))
      goTo(r.page)
      if (overlaySidebar) setOverlayOpen(false)
    },
    [search.results, goTo, overlaySidebar]
  )

  const stepResult = useCallback(
    (dir: 1 | -1) => {
      const n = search.results.length
      if (!n) return
      const i = (search.activeIndex + dir + n) % n
      setSearch((s) => ({ ...s, activeIndex: i }))
      goTo(search.results[i].page)
    },
    [search.results, search.activeIndex, goTo]
  )

  const highlight = config.allowSearch && search.query.trim().length >= 2 ? search.query.trim() : undefined

  // ------------------------------------------------------------------------
  // Sidebar, signets, plein écran
  // ------------------------------------------------------------------------
  const toggleSidebar = useCallback(() => {
    if (overlaySidebar) setOverlayOpen((o) => !o)
    else update((p) => ({ sidebarOpen: { ...p.sidebarOpen, [mode]: !p.sidebarOpen[mode] } }))
  }, [overlaySidebar, update, mode])

  const openPanel = useCallback(
    (p: SidebarPanel) => {
      update({ panel: p })
      if (overlaySidebar) setOverlayOpen(true)
      else update((prev) => ({ sidebarOpen: { ...prev.sidebarOpen, [mode]: true } }))
    },
    [overlaySidebar, update, mode]
  )

  const openSearch = useCallback(() => {
    if (!config.allowSearch) return
    openPanel("search")
    setSearchFocusToken((t) => t + 1)
  }, [config.allowSearch, openPanel])

  const { bookmarks, toggle: toggleBookmarkPage } = useBookmarks(url)
  const toggleBookmark = useCallback(() => {
    if (config.allowBookmarks) toggleBookmarkPage(currentPage)
  }, [config.allowBookmarks, toggleBookmarkPage, currentPage])

  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])
  const toggleFullscreen = useCallback(() => {
    if (!config.ownFullscreen) return
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void rootRef.current?.requestFullscreen?.().catch(() => {})
  }, [config.ownFullscreen])

  const setLayout = useCallback(
    (l: StudioLayout) => {
      anchorRef.current = { page: currentPage, ratio: 0 }
      update({ layout: l })
    },
    [update, currentPage]
  )

  // ------------------------------------------------------------------------
  // Raccourcis clavier (désactivés pendant la saisie : brouillon, réponses…)
  // ------------------------------------------------------------------------
  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {})
  keyHandlerRef.current = (e: KeyboardEvent) => {
    if (status !== "ready" || concealed) return
    const mod = e.ctrlKey || e.metaKey
    if (mod) {
      if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        zoomIn()
      } else if (e.key === "-") {
        e.preventDefault()
        zoomOut()
      } else if (e.key === "0") {
        e.preventDefault()
        setZoomMode("fit-width")
      } else if (e.key.toLowerCase() === "f" && config.allowSearch && !isTypingTarget(e.target)) {
        e.preventDefault()
        openSearch()
      }
      return
    }
    if (e.altKey || isTypingTarget(e.target)) return
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault()
        step(1)
        break
      case "ArrowLeft":
        e.preventDefault()
        step(-1)
        break
      case "PageDown":
        if (layout === "single") {
          e.preventDefault()
          step(1)
        }
        break
      case "PageUp":
        if (layout === "single") {
          e.preventDefault()
          step(-1)
        }
        break
      case "Home":
        e.preventDefault()
        goTo(1)
        break
      case "End":
        e.preventDefault()
        goTo(numPages)
        break
      case "w":
      case "W":
        setZoomMode("fit-width")
        break
      case "p":
      case "P":
        setZoomMode("fit-page")
        break
      case "s":
      case "S":
        toggleSidebar()
        break
      case "b":
      case "B":
        toggleBookmark()
        break
      case "f":
      case "F":
        toggleFullscreen()
        break
      case "Escape":
        if (overlaySidebar && overlayOpen) setOverlayOpen(false)
        break
    }
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyHandlerRef.current(e)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Focus du canevas pour que les flèches haut/bas fassent défiler le document
  useEffect(() => {
    if (status === "ready" && scrollEl && !isTypingTarget(document.activeElement)) scrollEl.focus({ preventScroll: true })
  }, [status, scrollEl])

  // ------------------------------------------------------------------------
  // Rendu
  // ------------------------------------------------------------------------
  const toolbarState: ToolbarState = {
    page: currentPage,
    numPages,
    zoom,
    zoomMode: prefs.zoomMode,
    layout,
    sidebarOpen: sidebarVisible,
    isFullscreen,
    isBookmarked: bookmarks.includes(currentPage),
    searchOpen: sidebarVisible && panel === "search",
    compact,
  }
  const actions: ToolbarActions = {
    goTo,
    prev: () => step(-1),
    next: () => step(1),
    zoomIn,
    zoomOut,
    setZoom,
    setZoomMode,
    setLayout,
    toggleSidebar,
    toggleFullscreen,
    toggleBookmark,
    openSearch,
  }

  const navigateFromSidebar = useCallback(
    (p: number) => {
      goTo(p)
      if (overlaySidebar) setOverlayOpen(false)
    },
    [goTo, overlaySidebar]
  )

  const isExam = mode === "exam"
  const showPages = status === "ready" && doc && !concealed && viewport.w > 0

  return (
    <div
      ref={rootRef}
      className={`ds-root ${isExam ? "ds-exam" : ""} relative flex h-full min-h-0 w-full flex-col overflow-hidden ${className}`}
      onContextMenu={isExam ? (e) => e.preventDefault() : undefined}
      data-mode={mode}
    >
      {config.toolbar === "bar" && (
        <StudyToolbar
          state={toolbarState}
          actions={actions}
          config={config}
          title={title}
          documents={documents}
          activeDocument={activeDoc}
          onDocumentChange={onDocumentChange}
        />
      )}

      <div className="relative flex min-h-0 flex-1">
        {sidebarVisible && doc && status === "ready" && !concealed && (
          <>
            {overlaySidebar && (
              <button
                type="button"
                aria-label="Fermer le panneau"
                onClick={() => setOverlayOpen(false)}
                className="absolute inset-0 z-30 bg-black/25 backdrop-blur-[1px] animate-in fade-in duration-150"
              />
            )}
            <StudioSidebar
              doc={doc}
              sizes={sizes}
              numPages={numPages}
              currentPage={currentPage}
              panels={config.panels}
              panel={panel}
              onPanelChange={(p) => update({ panel: p })}
              onNavigate={navigateFromSidebar}
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmarkPage}
              search={search}
              onSearchQuery={(q) => setSearch((s) => ({ ...s, query: q }))}
              onSelectResult={selectResult}
              onStepResult={stepResult}
              searchFocusToken={searchFocusToken}
              overlay={overlaySidebar}
              onClose={() => setOverlayOpen(false)}
            />
          </>
        )}

        <div className="relative min-w-0 flex-1">
          {isExam && numPages > 0 && !concealed && (
            <div className="absolute inset-x-0 top-0 z-20 h-[2px] bg-white/[0.04]" aria-hidden="true">
              <div
                className="h-full bg-[var(--ds-accent)] transition-[width] duration-300 ease-out"
                style={{ width: `${(currentPage / numPages) * 100}%` }}
              />
            </div>
          )}

          <div
            ref={setScrollEl}
            tabIndex={0}
            role="document"
            aria-label={title ?? activeDoc.label}
            onScroll={onScroll}
            className={`ds-canvas-bg ds-scroll absolute inset-0 overflow-auto outline-none ${isExam ? "select-none" : ""}`}
          >
            {showPages && (
              <div
                className="relative mx-auto flex w-max min-w-full flex-col items-center"
                style={{ padding: pad, paddingBottom: pad + bottomSpace, gap: layout === "single" ? 0 : compact ? 14 : 22 }}
              >
                {rows.map((row) => (
                  <div key={row.join("-")} className="flex items-start" style={{ gap }}>
                    {row.map((n) => (
                      <PdfPageView
                        key={`${url}-${n}`}
                        doc={doc}
                        pageNumber={n}
                        scale={renderScale}
                        size={sizes[n - 1] ?? sizes[0]}
                        active={layout === "single" || visible.has(n) || n === currentPage}
                        textLayer={config.allowTextSelection}
                        highlight={highlight}
                        registerRef={registerPage}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}

            {status === "loading" && <LoadingState progress={progress} exam={isExam} />}
            {status === "error" && (
              <ErrorState message={errorMsg} url={config.allowDownload ? url : undefined} onRetry={() => setReloadToken((t) => t + 1)} />
            )}
            {concealed && status !== "error" && <div className="flex h-full items-center justify-center p-6">{concealed}</div>}
          </div>

          {config.toolbar === "dock" && status === "ready" && !concealed && (
            <ExamDock state={toolbarState} actions={actions} documents={documents} activeDocument={activeDoc} onDocumentChange={onDocumentChange} />
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// États de chargement / erreur
// ---------------------------------------------------------------------------

function LoadingState({ progress, exam }: { progress: number | null; exam: boolean }) {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-6 p-8" role="status" aria-live="polite">
      <div className="relative h-[180px] w-[128px]">
        <div className={`ds-page ds-page-placeholder absolute inset-0 translate-x-3 translate-y-3 opacity-50`} />
        <div className="ds-page ds-page-placeholder absolute inset-0" />
      </div>
      <div className="w-56 text-center">
        <p className="text-[13px] font-medium">{exam ? "Préparation de l’énoncé" : "Ouverture du document"}</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--ds-hover)]">
          <div
            className={`h-full rounded-full bg-[var(--ds-accent)] transition-[width] duration-200 ${progress === null ? "w-1/3 animate-pulse" : ""}`}
            style={progress !== null ? { width: `${Math.max(6, progress * 100)}%` } : undefined}
          />
        </div>
        <p className="ds-muted mt-2 text-[11px] tabular-nums">{progress !== null ? `${Math.round(progress * 100)} %` : "Chargement…"}</p>
      </div>
    </div>
  )
}

function ErrorState({ message, url, onRetry }: { message: string; url?: string; onRetry: () => void }) {
  return (
    <div className="flex h-full min-h-[360px] items-center justify-center p-8" role="alert">
      <div className="ds-panel max-w-sm rounded-2xl border p-6 text-center shadow-sm">
        <FileWarning className="mx-auto h-8 w-8 text-amber-500" />
        <p className="mt-3 text-[14px] font-semibold">Document indisponible</p>
        <p className="ds-muted mt-1 text-[12.5px] leading-relaxed">{message}</p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button type="button" onClick={onRetry} className="ds-btn border border-[var(--ds-chrome-border)] px-3">
            <RotateCw className="h-3.5 w-3.5" />
            Réessayer
          </button>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="ds-btn px-3 text-[var(--ds-accent)]">
              Ouvrir le fichier
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
