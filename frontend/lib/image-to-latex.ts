export const imageToLatexLimits = {
  fileBytes: 15 * 1024 * 1024,
  uploadBytes: 5 * 1024 * 1024,
  edge: 2560,
  latexChars: 130_000,
}

export type LatexTranscription = {
  latex: string
  status: 'ok' | 'partial' | 'limited' | 'unreadable'
}
