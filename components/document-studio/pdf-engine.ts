"use client"

// Couche d'accès à pdf.js : chargement paresseux de la bibliothèque (côté client uniquement),
// configuration du worker et des ressources statiques copiées dans /public/pdfjs.
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  PageViewport,
  RenderTask,
} from "pdfjs-dist"

export type { PDFDocumentProxy, PDFPageProxy, PageViewport, RenderTask }

type PdfJsModule = typeof import("pdfjs-dist")

/** 1 point PDF (1/72 in) = 96/72 pixels CSS : 100 % de zoom = taille réelle du document */
export const CSS_UNITS = 96 / 72

const ASSETS = "/pdfjs"
let pdfjsPromise: Promise<PdfJsModule> | null = null

export function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = `${ASSETS}/pdf.worker.min.mjs`
      return mod
    })
    pdfjsPromise.catch(() => {
      pdfjsPromise = null
    })
  }
  return pdfjsPromise
}

export interface OpenedPdf {
  task: PDFDocumentLoadingTask
  promise: Promise<PDFDocumentProxy>
}

export async function openPdf(url: string, onProgress?: (ratio: number | null) => void): Promise<OpenedPdf> {
  const pdfjs = await loadPdfJs()
  const task = pdfjs.getDocument({
    url,
    cMapUrl: `${ASSETS}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${ASSETS}/standard_fonts/`,
    wasmUrl: `${ASSETS}/wasm/`,
    iccUrl: `${ASSETS}/iccs/`,
  })
  if (onProgress) {
    task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
      onProgress(total > 0 ? Math.min(1, loaded / total) : null)
    }
  }
  return { task, promise: task.promise }
}

export function isRenderCancel(err: unknown): boolean {
  return !!err && typeof err === "object" && (err as { name?: string }).name === "RenderingCancelledException"
}

/** Messages d'erreur lisibles pour l'utilisateur */
export function describePdfError(err: unknown): string {
  const name = (err as { name?: string })?.name
  const status = (err as { status?: number })?.status
  if (name === "InvalidPDFException") return "Le fichier est endommagé ou n'est pas un PDF valide."
  if (name === "PasswordException") return "Ce document est protégé par un mot de passe."
  if (name === "ResponseException" || name === "MissingPDFException" || status === 404)
    return "Le document est introuvable ou momentanément indisponible."
  return "Le document n'a pas pu être chargé."
}

/** Cache léger du contenu texte (recherche, surlignage) par document */
const textCache = new WeakMap<PDFDocumentProxy, Map<number, Promise<string>>>()

export function getPageText(doc: PDFDocumentProxy, pageNumber: number): Promise<string> {
  let perDoc = textCache.get(doc)
  if (!perDoc) {
    perDoc = new Map()
    textCache.set(doc, perDoc)
  }
  let p = perDoc.get(pageNumber)
  if (!p) {
    p = doc
      .getPage(pageNumber)
      .then((page) => page.getTextContent())
      .then((content) =>
        content.items
          .map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : "") : ""))
          .join("")
      )
      .catch(() => "")
    perDoc.set(pageNumber, p)
  }
  return p
}

/** Normalisation insensible à la casse et aux accents (é = e) */
export function normalizeForSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}
