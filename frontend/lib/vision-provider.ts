import type { LatexTranscription } from './image-to-latex'

export type VisionProvider = (input: {
  image: Uint8Array
  mimeType: 'image/jpeg'
  width: number
  height: number
  signal: AbortSignal
}) => Promise<LatexTranscription>

export function getVisionProvider(): VisionProvider | undefined {
  // Return your transcription function here. Keep model calls and credentials on the server.
  return undefined
}
