// Configurations distinctes des deux expériences de lecture de Document Studio.
// Les règles de sécurité de l'examen (chrono, infractions, verrouillage du corrigé)
// restent gérées par la logique métier (ConcoursPdfExamViewer) ; ces options ne
// pilotent que l'interface du lecteur.

export type StudioMode = "study" | "exam"
export type StudioLayout = "continuous" | "single" | "spread"
export type ZoomMode = "custom" | "fit-width" | "fit-page"
export type SidebarPanel = "pages" | "search" | "bookmarks"

export interface StudioModeConfig {
  /** Sidebar ouverte par défaut (sur grand écran) */
  sidebarDefaultOpen: boolean
  panels: SidebarPanel[]
  allowSearch: boolean
  allowBookmarks: boolean
  allowDownload: boolean
  allowTextSelection: boolean
  allowLayoutSwitch: boolean
  /** Fullscreen géré par le lecteur (en examen, le conteneur parent s'en charge) */
  ownFullscreen: boolean
  /** "bar" : barre d'outils complète ; "dock" : dock flottant minimal */
  toolbar: "bar" | "dock"
}

export const STUDIO_MODES: Record<StudioMode, StudioModeConfig> = {
  study: {
    sidebarDefaultOpen: true,
    panels: ["pages", "search", "bookmarks"],
    allowSearch: true,
    allowBookmarks: true,
    allowDownload: true,
    allowTextSelection: true,
    allowLayoutSwitch: true,
    ownFullscreen: true,
    toolbar: "bar",
  },
  exam: {
    sidebarDefaultOpen: false,
    panels: ["pages"],
    allowSearch: false,
    allowBookmarks: false,
    allowDownload: false,
    allowTextSelection: false,
    allowLayoutSwitch: false,
    ownFullscreen: false,
    toolbar: "dock",
  },
}

export const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4]
export const MIN_SCALE = 0.25
export const MAX_SCALE = 5
