import { getSession } from '@/lib/server-auth'
import { imageToLatexLimits, type LatexTranscription } from '@/lib/image-to-latex'
import { getVisionProvider } from '@/lib/vision-provider'

export const runtime = 'nodejs'
export const maxDuration = 210

const headers = { 'Cache-Control': 'private, no-store' }
const response = (message: string, status: number, code?: string) => Response.json({ message, code }, { status, headers })

export function GET() {
  return Response.json({ configured: Boolean(getVisionProvider()) }, { headers })
}

function jpegDimensions(image: Buffer) {
  if (image.length < 4 || image.readUInt16BE(0) !== 0xffd8 || image.readUInt16BE(image.length - 2) !== 0xffd9) return null
  let offset = 2
  while (offset + 4 < image.length && image[offset] === 0xff) {
    while (image[offset] === 0xff) offset++
    if (offset + 2 >= image.length) return null
    const marker = image[offset++]
    if (marker === 0xda || marker === 0xd9) break
    const length = image.readUInt16BE(offset)
    if (length < 2 || offset + length > image.length) return null
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker) && length >= 8) {
      return { width: image.readUInt16BE(offset + 5), height: image.readUInt16BE(offset + 3) }
    }
    offset += length
  }
  return null
}

async function readImage(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) return null
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) return Buffer.concat(chunks, length)
      length += value.byteLength
      if (length > imageToLatexLimits.uploadBytes) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== (process.env.APP_ORIGIN || 'http://localhost:3000') ||
    request.headers.get('sec-fetch-site') === 'cross-site') return response('Origine refusée.', 403)
  const session = await getSession().catch(() => undefined)
  if (session === undefined) return response('Le service de connexion est indisponible.', 503)
  if (!session) return response('Connectez-vous pour transcrire une image.', 401)
  const provider = getVisionProvider()
  if (!provider) return response('La lecture automatique n’est pas encore configurée.', 503, 'VISION_NOT_CONFIGURED')
  if (request.headers.get('content-type') !== 'image/jpeg') return response('Format de l’image non reconnu.', 415)
  if (Number(request.headers.get('content-length')) > imageToLatexLimits.uploadBytes) return response('Image trop volumineuse.', 413)

  const image = await readImage(request).catch(() => null)
  if (!image) return response('Image absente ou trop volumineuse.', 413)
  const dimensions = jpegDimensions(image)
  if (!dimensions || !dimensions.width || !dimensions.height ||
    Math.max(dimensions.width, dimensions.height) > imageToLatexLimits.edge) return response('Image illisible ou trop grande.', 400)

  const timeout = AbortSignal.timeout(180_000)
  try {
    const signal = AbortSignal.any([timeout, request.signal])
    const draft = await provider({ image, mimeType: 'image/jpeg', ...dimensions, signal })
    if (draft?.status === 'unreadable') return response('Le modèle n’a pas pu lire l’image. Essayez une photo plus nette.', 422, 'IMAGE_UNREADABLE')
    if (typeof draft?.latex === 'string' && draft.latex.length > 32_000) {
      return response('Cette zone nécessite plusieurs passes de transcription.', 422, 'TRANSCRIPTION_TOO_LONG')
    }
    if (!draft || !['ok', 'partial', 'limited'].includes(draft.status) || typeof draft.latex !== 'string' || !draft.latex.trim()) {
      return response('La transcription reçue est incomplète. Essayez avec une image recadrée.', 502)
    }
    const latex = draft.latex.trim()
    const status = draft.status === 'ok' && /\[illisible\]|_\s*\{\s*\\square\s*\}/i.test(latex) ? 'partial' : draft.status
    return Response.json({ latex, status } satisfies LatexTranscription, { headers })
  } catch {
    if (timeout.aborted) return response('La transcription a pris trop de temps. Essayez avec une image recadrée.', 504)
    return response('Le service de vision est momentanément indisponible.', 503)
  }
}
