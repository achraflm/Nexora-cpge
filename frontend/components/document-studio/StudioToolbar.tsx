"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Download,
  Ellipsis,
  ExternalLink,
  File,
  Lock,
  Maximize2,
  Minimize2,
  PanelLeft,
  Rows3,
  Scan,
  Search,
  StretchHorizontal,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import type { StudioLayout, StudioModeConfig, ZoomMode } from "./modes"
import { ZOOM_STEPS } from "./modes"

export interface StudioDocument {
  id: string
  label: string
  url: string
  locked?: boolean
  lockedReason?: string
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export function ToolButton({
  label,
  shortcut,
  onClick,
  disabled,
  active,
  children,
  className = "",
  tipUp = false,
}: {
  label: string
  shortcut?: string
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  children: ReactNode
  className?: string
  tipUp?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      data-active={active ? "true" : undefined}
      className={`ds-btn ds-tip ${tipUp ? "ds-tip-up" : ""} ${className}`}
    >
      {children}
      <span className="ds-tip-label" role="tooltip">
        {label}
        {shortcut && <kbd>{shortcut}</kbd>}
      </span>
    </button>
  )
}

export function Menu({
  trigger,
  children,
  align = "end",
  up = false,
  label,
}: {
  trigger: (open: boolean) => ReactNode
  children: (close: () => void) => ReactNode
  align?: "start" | "end" | "center"
  up?: boolean
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const pos =
    align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="ds-btn"
        data-active={open ? "true" : undefined}
      >
        {trigger(open)}
      </button>
      {open && (
        <div
          role="menu"
          className={`ds-menu absolute z-50 min-w-[210px] ${pos} ${up ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+6px)]"} animate-in fade-in zoom-in-95 duration-100`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon,
  label,
  hint,
  active,
  disabled,
  onSelect,
}: {
  icon?: ReactNode
  label: string
  hint?: string
  active?: boolean
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      data-active={active ? "true" : undefined}
      onClick={onSelect}
      className="ds-menu-item"
    >
      <span className="flex w-4 shrink-0 justify-center opacity-80">{icon}</span>
      <span className="flex-1">{label}</span>
      {active && <Check className="h-3.5 w-3.5" />}
      {hint && !active && <span className="ds-muted font-mono text-[10.5px]">{hint}</span>}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Contrôles partagés
// ---------------------------------------------------------------------------

export interface ToolbarState {
  page: number
  numPages: number
  zoom: number
  zoomMode: ZoomMode
  layout: StudioLayout
  sidebarOpen: boolean
  isFullscreen: boolean
  isBookmarked: boolean
  searchOpen: boolean
  compact: boolean
}

export interface ToolbarActions {
  goTo: (page: number) => void
  prev: () => void
  next: () => void
  zoomIn: () => void
  zoomOut: () => void
  setZoom: (z: number) => void
  setZoomMode: (m: ZoomMode) => void
  setLayout: (l: StudioLayout) => void
  toggleSidebar: () => void
  toggleFullscreen: () => void
  toggleBookmark: () => void
  openSearch: () => void
}

function PageField({ page, numPages, goTo, dark = false }: { page: number; numPages: number; goTo: (p: number) => void; dark?: boolean }) {
  const [draft, setDraft] = useState(String(page))
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!editing) setDraft(String(page))
  }, [page, editing])

  const commit = () => {
    const n = parseInt(draft, 10)
    if (!Number.isNaN(n)) goTo(Math.min(Math.max(1, n), numPages))
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-1.5 text-[12.5px] tabular-nums">
      <input
        aria-label="Numéro de page"
        inputMode="numeric"
        value={draft}
        onFocus={(e) => {
          setEditing(true)
          e.currentTarget.select()
        }}
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit()
            e.currentTarget.blur()
          }
          if (e.key === "Escape") {
            setEditing(false)
            e.currentTarget.blur()
          }
        }}
        className={`ds-input w-10 ${dark ? "bg-white/[0.04]" : ""}`}
      />
      <span className="ds-muted">/ {numPages || "–"}</span>
    </div>
  )
}

function ZoomMenu({ state, actions, up = false }: { state: ToolbarState; actions: ToolbarActions; up?: boolean }) {
  return (
    <Menu
      label="Options de zoom"
      up={up}
      align="center"
      trigger={() => (
        <span className="flex min-w-[52px] items-center justify-center gap-1 tabular-nums">
          {Math.round(state.zoom * 100)}%
          <ChevronDown className="h-3 w-3 opacity-60" />
        </span>
      )}
    >
      {(close) => (
        <>
          <MenuItem
            icon={<StretchHorizontal className="h-3.5 w-3.5" />}
            label="Ajuster à la largeur"
            hint="W"
            active={state.zoomMode === "fit-width"}
            onSelect={() => {
              actions.setZoomMode("fit-width")
              close()
            }}
          />
          <MenuItem
            icon={<Scan className="h-3.5 w-3.5" />}
            label="Page entière"
            hint="P"
            active={state.zoomMode === "fit-page"}
            onSelect={() => {
              actions.setZoomMode("fit-page")
              close()
            }}
          />
          <div className="my-1 h-px bg-[var(--ds-chrome-border)]" />
          <div className="grid grid-cols-3 gap-1 p-1">
            {ZOOM_STEPS.filter((z) => z >= 0.5 && z <= 3).map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => {
                  actions.setZoom(z)
                  close()
                }}
                data-active={state.zoomMode === "custom" && Math.abs(state.zoom - z) < 0.005 ? "true" : undefined}
                className="ds-btn h-7 text-[12px] tabular-nums"
              >
                {Math.round(z * 100)}%
              </button>
            ))}
          </div>
        </>
      )}
    </Menu>
  )
}

const LAYOUTS: { id: StudioLayout; label: string; icon: ReactNode; hint: string }[] = [
  { id: "continuous", label: "Défilement continu", icon: <Rows3 className="h-3.5 w-3.5" />, hint: "" },
  { id: "single", label: "Page par page", icon: <File className="h-3.5 w-3.5" />, hint: "" },
  { id: "spread", label: "Double page", icon: <Columns2 className="h-3.5 w-3.5" />, hint: "" },
]

function DocumentTabs({
  documents,
  activeId,
  onChange,
  variant,
}: {
  documents: StudioDocument[]
  activeId: string
  onChange?: (id: string) => void
  variant: "light" | "dark"
}) {
  if (documents.length < 2) return null
  return (
    <div
      role="tablist"
      aria-label="Documents"
      className={`flex items-center rounded-[10px] p-0.5 ${variant === "dark" ? "bg-white/[0.05]" : "bg-[var(--ds-hover)]"}`}
    >
      {documents.map((d) => {
        const active = d.id === activeId
        return (
          <button
            key={d.id}
            role="tab"
            type="button"
            aria-selected={active}
            disabled={d.locked}
            title={d.locked ? d.lockedReason : undefined}
            onClick={() => onChange?.(d.id)}
            className={`flex h-7 items-center gap-1.5 rounded-[8px] px-2.5 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${
              active
                ? variant === "dark"
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "bg-white text-[var(--ds-text)] shadow-[0_1px_2px_rgba(15,23,42,0.12)] dark:bg-white/10"
                : "ds-muted hover:text-[var(--ds-text)]"
            }`}
          >
            {d.locked && <Lock className="h-3 w-3" />}
            {d.label}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Study Mode : barre d'outils complète
// ---------------------------------------------------------------------------

export function StudyToolbar({
  state,
  actions,
  config,
  title,
  documents,
  activeDocument,
  onDocumentChange,
}: {
  state: ToolbarState
  actions: ToolbarActions
  config: StudioModeConfig
  title?: string
  documents: StudioDocument[]
  activeDocument: StudioDocument
  onDocumentChange?: (id: string) => void
}) {
  const { compact } = state
  return (
    <div className="ds-chrome relative z-30 flex h-12 shrink-0 items-center gap-1 border-b px-2 sm:px-3">
      {/* Gauche : panneau, document */}
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <ToolButton label={state.sidebarOpen ? "Masquer le panneau" : "Afficher le panneau"} shortcut="S" onClick={actions.toggleSidebar} active={state.sidebarOpen}>
          <PanelLeft className="h-4 w-4" />
        </ToolButton>
        <div className="ds-divider hidden sm:block" />
        {documents.length > 1 ? (
          <DocumentTabs documents={documents} activeId={activeDocument.id} onChange={onDocumentChange} variant="light" />
        ) : (
          title && <span className="hidden truncate px-1 text-[12.5px] font-medium md:block">{title}</span>
        )}
      </div>

      {/* Centre : navigation */}
      <div className="flex shrink-0 items-center gap-0.5">
        <ToolButton label="Page précédente" shortcut="←" onClick={actions.prev} disabled={state.page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </ToolButton>
        <PageField page={state.page} numPages={state.numPages} goTo={actions.goTo} />
        <ToolButton label="Page suivante" shortcut="→" onClick={actions.next} disabled={state.page >= state.numPages}>
          <ChevronRight className="h-4 w-4" />
        </ToolButton>
      </div>

      {/* Droite : zoom, affichage, outils */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-0.5">
        {!compact && (
          <>
            <ToolButton label="Zoom arrière" shortcut="Ctrl −" onClick={actions.zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </ToolButton>
            <ZoomMenu state={state} actions={actions} />
            <ToolButton label="Zoom avant" shortcut="Ctrl +" onClick={actions.zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </ToolButton>
            <div className="ds-divider" />
            {config.allowLayoutSwitch && (
              <Menu
                label="Disposition"
                trigger={() => (
                  <span className="flex items-center gap-1">
                    {LAYOUTS.find((l) => l.id === state.layout)?.icon}
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </span>
                )}
              >
                {(close) => (
                  <>
                    <div className="ds-menu-label">Disposition</div>
                    {LAYOUTS.map((l) => (
                      <MenuItem
                        key={l.id}
                        icon={l.icon}
                        label={l.label}
                        active={state.layout === l.id}
                        onSelect={() => {
                          actions.setLayout(l.id)
                          close()
                        }}
                      />
                    ))}
                  </>
                )}
              </Menu>
            )}
          </>
        )}
        {config.allowSearch && (
          <ToolButton label="Rechercher" shortcut="Ctrl F" onClick={actions.openSearch} active={state.searchOpen}>
            <Search className="h-4 w-4" />
          </ToolButton>
        )}
        {config.allowBookmarks && !compact && (
          <ToolButton label={state.isBookmarked ? "Retirer le signet" : "Ajouter un signet"} shortcut="B" onClick={actions.toggleBookmark} active={state.isBookmarked}>
            {state.isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </ToolButton>
        )}
        {config.ownFullscreen && !compact && (
          <ToolButton label={state.isFullscreen ? "Quitter le plein écran" : "Plein écran"} shortcut="F" onClick={actions.toggleFullscreen}>
            {state.isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </ToolButton>
        )}
        <Menu label="Plus d'actions" trigger={() => <Ellipsis className="h-4 w-4" />}>
          {(close) => (
            <>
              {compact && (
                <>
                  <div className="ds-menu-label">Zoom</div>
                  <MenuItem icon={<ZoomIn className="h-3.5 w-3.5" />} label="Zoom avant" onSelect={actions.zoomIn} />
                  <MenuItem icon={<ZoomOut className="h-3.5 w-3.5" />} label="Zoom arrière" onSelect={actions.zoomOut} />
                  <MenuItem
                    icon={<StretchHorizontal className="h-3.5 w-3.5" />}
                    label="Ajuster à la largeur"
                    active={state.zoomMode === "fit-width"}
                    onSelect={() => {
                      actions.setZoomMode("fit-width")
                      close()
                    }}
                  />
                  <MenuItem
                    icon={<Scan className="h-3.5 w-3.5" />}
                    label="Page entière"
                    active={state.zoomMode === "fit-page"}
                    onSelect={() => {
                      actions.setZoomMode("fit-page")
                      close()
                    }}
                  />
                  {config.allowLayoutSwitch && (
                    <>
                      <div className="ds-menu-label">Disposition</div>
                      {LAYOUTS.map((l) => (
                        <MenuItem
                          key={l.id}
                          icon={l.icon}
                          label={l.label}
                          active={state.layout === l.id}
                          onSelect={() => {
                            actions.setLayout(l.id)
                            close()
                          }}
                        />
                      ))}
                    </>
                  )}
                  {config.allowBookmarks && (
                    <MenuItem
                      icon={<Bookmark className="h-3.5 w-3.5" />}
                      label={state.isBookmarked ? "Retirer le signet" : "Ajouter un signet"}
                      onSelect={() => {
                        actions.toggleBookmark()
                        close()
                      }}
                    />
                  )}
                  {config.ownFullscreen && (
                    <MenuItem
                      icon={<Maximize2 className="h-3.5 w-3.5" />}
                      label={state.isFullscreen ? "Quitter le plein écran" : "Plein écran"}
                      onSelect={() => {
                        actions.toggleFullscreen()
                        close()
                      }}
                    />
                  )}
                  <div className="my-1 h-px bg-[var(--ds-chrome-border)]" />
                </>
              )}
              <div className="ds-menu-label">Document</div>
              {config.allowDownload && (
                <a href={activeDocument.url} download className="ds-menu-item" onClick={close}>
                  <span className="flex w-4 justify-center opacity-80">
                    <Download className="h-3.5 w-3.5" />
                  </span>
                  Télécharger le PDF
                </a>
              )}
              <a href={activeDocument.url} target="_blank" rel="noopener noreferrer" className="ds-menu-item" onClick={close}>
                <span className="flex w-4 justify-center opacity-80">
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
                Ouvrir dans un nouvel onglet
              </a>
              <div className="ds-menu-label mt-1">Raccourcis</div>
              <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-2.5 pb-1.5 text-[11.5px]">
                {[
                  ["Page suivante / précédente", "→ ←"],
                  ["Première / dernière page", "Début Fin"],
                  ["Zoom", "Ctrl + / −"],
                  ["Largeur / page entière", "W  P"],
                  ["Panneau latéral", "S"],
                  ["Rechercher", "Ctrl F"],
                ].map(([a, b]) => (
                  <div key={a} className="contents">
                    <span className="ds-muted">{a}</span>
                    <span className="font-mono text-[10.5px]">{b}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Exam Mode : dock flottant minimal
// ---------------------------------------------------------------------------

export function ExamDock({
  state,
  actions,
  documents,
  activeDocument,
  onDocumentChange,
}: {
  state: ToolbarState
  actions: ToolbarActions
  documents: StudioDocument[]
  activeDocument: StudioDocument
  onDocumentChange?: (id: string) => void
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-3">
      <div className="ds-chrome pointer-events-auto flex items-center gap-0.5 rounded-2xl border p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.75)]">
        <ToolButton tipUp label={state.sidebarOpen ? "Masquer les pages" : "Afficher les pages"} shortcut="S" onClick={actions.toggleSidebar} active={state.sidebarOpen}>
          <PanelLeft className="h-4 w-4" />
        </ToolButton>
        {documents.length > 1 && (
          <>
            <div className="ds-divider" />
            <DocumentTabs documents={documents} activeId={activeDocument.id} onChange={onDocumentChange} variant="dark" />
          </>
        )}
        <div className="ds-divider" />
        <ToolButton tipUp label="Page précédente" shortcut="←" onClick={actions.prev} disabled={state.page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </ToolButton>
        <PageField page={state.page} numPages={state.numPages} goTo={actions.goTo} dark />
        <ToolButton tipUp label="Page suivante" shortcut="→" onClick={actions.next} disabled={state.page >= state.numPages}>
          <ChevronRight className="h-4 w-4" />
        </ToolButton>
        <div className="ds-divider" />
        <ToolButton tipUp label="Zoom arrière" shortcut="Ctrl −" onClick={actions.zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </ToolButton>
        <ZoomMenu state={state} actions={actions} up />
        <ToolButton tipUp label="Zoom avant" shortcut="Ctrl +" onClick={actions.zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </ToolButton>
      </div>
    </div>
  )
}
