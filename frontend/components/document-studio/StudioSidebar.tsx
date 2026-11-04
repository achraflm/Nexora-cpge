"use client"

import { memo, useEffect, useRef, useState } from "react"
import { Bookmark, LayoutGrid, LoaderCircle, Search, Star, X } from "lucide-react"
import type { SidebarPanel } from "./modes"
import { PdfPageView, type PageSize } from "./PdfPageView"
import type { PDFDocumentProxy } from "./pdf-engine"
import { useVisiblePages } from "./useVisiblePages"

export interface SearchResult {
  page: number
  before: string
  match: string
  after: string
}

export interface SearchState {
  query: string
  results: SearchResult[]
  running: boolean
  scannedPages: number
  activeIndex: number
}

const THUMB_WIDTH = 116

const PANEL_META: Record<SidebarPanel, { label: string; icon: typeof LayoutGrid }> = {
  pages: { label: "Pages", icon: LayoutGrid },
  search: { label: "Recherche", icon: Search },
  bookmarks: { label: "Signets", icon: Bookmark },
}

// ---------------------------------------------------------------------------
// Miniatures (rendu paresseux)
// ---------------------------------------------------------------------------

const Thumbnails = memo(function Thumbnails({
  doc,
  sizes,
  numPages,
  currentPage,
  bookmarks,
  onSelect,
}: {
  doc: PDFDocumentProxy
  sizes: PageSize[]
  numPages: number
  currentPage: number
  bookmarks: number[]
  onSelect: (page: number) => void
}) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const { visible, register, elements } = useVisiblePages(root, "300px 0px", [numPages])

  // Garde la miniature active dans le champ de vision
  useEffect(() => {
    const el = elements.get(currentPage)
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [currentPage, elements])

  return (
    <div ref={setRoot} className="ds-scroll flex-1 overflow-y-auto px-3 py-4">
      <div className="flex flex-col items-center gap-5">
        {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => {
          const size = sizes[n - 1] ?? sizes[0]
          const scale = THUMB_WIDTH / size.width
          const active = n === currentPage
          return (
            <button
              key={n}
              type="button"
              onClick={() => onSelect(n)}
              data-active={active ? "true" : undefined}
              aria-label={`Aller à la page ${n}`}
              aria-current={active ? "page" : undefined}
              className="ds-thumb-btn group flex flex-col items-center gap-1.5"
            >
              <div className="ds-thumb relative">
                <PdfPageView
                  doc={doc}
                  pageNumber={n}
                  scale={scale}
                  size={size}
                  active={visible.has(n)}
                  textLayer={false}
                  registerRef={register}
                />
                {bookmarks.includes(n) && (
                  <Star className="absolute right-1 top-1 h-3.5 w-3.5 fill-amber-400 text-amber-500 drop-shadow" />
                )}
              </div>
              <span className={`text-[11px] tabular-nums ${active ? "font-semibold text-[var(--ds-accent)]" : "ds-muted"}`}>{n}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
})

// ---------------------------------------------------------------------------
// Recherche
// ---------------------------------------------------------------------------

function SearchPanel({
  search,
  numPages,
  onQueryChange,
  onSelectResult,
  onStep,
  autoFocusToken,
}: {
  search: SearchState
  numPages: number
  onQueryChange: (q: string) => void
  onSelectResult: (index: number) => void
  onStep: (dir: 1 | -1) => void
  autoFocusToken: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [autoFocusToken])

  const pagesWithHits = new Set(search.results.map((r) => r.page)).size

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-3 pb-2 pt-3">
        <div className="relative">
          <Search className="ds-muted pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="search"
            value={search.query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                onStep(e.shiftKey ? -1 : 1)
              }
            }}
            placeholder="Rechercher dans le document"
            className="ds-input h-8 w-full pl-8 pr-7 text-left"
          />
          {search.query && (
            <button
              type="button"
              aria-label="Effacer"
              onClick={() => onQueryChange("")}
              className="ds-muted absolute right-2 top-1/2 -translate-y-1/2 hover:text-[var(--ds-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="ds-muted mt-2 flex h-4 items-center gap-1.5 text-[11px]">
          {search.running && <LoaderCircle className="h-3 w-3 animate-spin" />}
          {search.query.trim().length >= 2 ? (
            search.running ? (
              <span>
                Analyse… {search.scannedPages}/{numPages} pages
              </span>
            ) : search.results.length ? (
              <span>
                {search.results.length} résultat{search.results.length > 1 ? "s" : ""} sur {pagesWithHits} page{pagesWithHits > 1 ? "s" : ""}
                {" · "}
                <span className="tabular-nums">
                  {search.activeIndex + 1}/{search.results.length}
                </span>
              </span>
            ) : (
              <span>Aucun résultat (le texte d’un PDF scanné n’est pas indexable)</span>
            )
          ) : (
            <span>Saisissez au moins 2 caractères · Entrée pour naviguer</span>
          )}
        </div>
      </div>
      <div className="ds-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {search.results.map((r, i) => (
          <button
            key={`${r.page}-${i}`}
            type="button"
            onClick={() => onSelectResult(i)}
            data-active={i === search.activeIndex ? "true" : undefined}
            className="ds-menu-item block w-full py-2 data-[active=true]:bg-[var(--ds-active)]"
          >
            <span className="ds-muted mb-0.5 block text-[10.5px] font-semibold uppercase tracking-wide">Page {r.page}</span>
            <span className="line-clamp-2 text-[12px] leading-snug">
              {r.before}
              <mark className="rounded-sm bg-amber-300/60 px-0.5 text-inherit">{r.match}</mark>
              {r.after}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Signets
// ---------------------------------------------------------------------------

function BookmarksPanel({
  bookmarks,
  currentPage,
  onSelect,
  onToggle,
}: {
  bookmarks: number[]
  currentPage: number
  onSelect: (p: number) => void
  onToggle: (p: number) => void
}) {
  return (
    <div className="ds-scroll flex-1 overflow-y-auto p-2">
      <button type="button" onClick={() => onToggle(currentPage)} className="ds-menu-item mb-2 justify-center border border-dashed border-[var(--ds-chrome-border)]">
        <Star className="h-3.5 w-3.5" />
        {bookmarks.includes(currentPage) ? `Retirer la page ${currentPage}` : `Marquer la page ${currentPage}`}
      </button>
      {bookmarks.length === 0 ? (
        <p className="ds-muted px-3 py-6 text-center text-[12px] leading-relaxed">
          Aucun signet pour ce document.
          <br />
          Appuyez sur <kbd className="rounded bg-[var(--ds-hover)] px-1 font-mono text-[10.5px]">B</kbd> pour marquer la page courante.
        </p>
      ) : (
        bookmarks.map((p) => (
          <div key={p} className="group flex items-center">
            <button type="button" onClick={() => onSelect(p)} data-active={p === currentPage ? "true" : undefined} className="ds-menu-item flex-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>Page {p}</span>
            </button>
            <button
              type="button"
              aria-label={`Retirer le signet de la page ${p}`}
              onClick={() => onToggle(p)}
              className="ds-btn h-7 min-w-7 opacity-0 group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export function StudioSidebar({
  doc,
  sizes,
  numPages,
  currentPage,
  panels,
  panel,
  onPanelChange,
  onNavigate,
  bookmarks,
  onToggleBookmark,
  search,
  onSearchQuery,
  onSelectResult,
  onStepResult,
  searchFocusToken,
  overlay,
  onClose,
}: {
  doc: PDFDocumentProxy
  sizes: PageSize[]
  numPages: number
  currentPage: number
  panels: SidebarPanel[]
  panel: SidebarPanel
  onPanelChange: (p: SidebarPanel) => void
  onNavigate: (page: number) => void
  bookmarks: number[]
  onToggleBookmark: (p: number) => void
  search: SearchState
  onSearchQuery: (q: string) => void
  onSelectResult: (i: number) => void
  onStepResult: (dir: 1 | -1) => void
  searchFocusToken: number
  overlay: boolean
  onClose: () => void
}) {
  const activePanel = panels.includes(panel) ? panel : panels[0]

  return (
    <aside
      aria-label="Navigation du document"
      className={`ds-panel flex h-full min-h-0 w-[260px] shrink-0 flex-col border-r ${
        overlay ? "absolute inset-y-0 left-0 z-40 shadow-2xl animate-in slide-in-from-left-4 duration-200" : ""
      }`}
    >
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-[var(--ds-chrome-border)] px-2">
        {panels.length > 1 ? (
          panels.map((p) => {
            const Icon = PANEL_META[p].icon
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPanelChange(p)}
                data-active={activePanel === p ? "true" : undefined}
                className="ds-btn h-8 flex-1 text-[12px]"
              >
                <Icon className="h-3.5 w-3.5" />
                {PANEL_META[p].label}
              </button>
            )
          })
        ) : (
          <span className="ds-muted px-2 text-[11px] font-semibold uppercase tracking-wider">{PANEL_META[activePanel].label}</span>
        )}
        {overlay && (
          <button type="button" aria-label="Fermer le panneau" onClick={onClose} className="ds-btn ml-auto h-8">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {activePanel === "pages" && (
        <Thumbnails doc={doc} sizes={sizes} numPages={numPages} currentPage={currentPage} bookmarks={bookmarks} onSelect={onNavigate} />
      )}
      {activePanel === "search" && (
        <SearchPanel
          search={search}
          numPages={numPages}
          onQueryChange={onSearchQuery}
          onSelectResult={onSelectResult}
          onStep={onStepResult}
          autoFocusToken={searchFocusToken}
        />
      )}
      {activePanel === "bookmarks" && (
        <BookmarksPanel bookmarks={bookmarks} currentPage={currentPage} onSelect={onNavigate} onToggle={onToggleBookmark} />
      )}
    </aside>
  )
}
