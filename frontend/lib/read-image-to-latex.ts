import { imageToLatexLimits, type LatexTranscription } from './image-to-latex'
import { compileStudyWork, isCompleteStudyWork } from './study-work-latex'

export const acceptedImages = ['image/jpeg', 'image/png', 'image/webp']

export async function visionIsConfigured(signal?: AbortSignal) {
  const response = await fetch('/api/image-to-latex', { cache: 'no-store', signal })
  return response.ok && (await response.json()).configured === true
}

export function imageFileError(file: File) {
  if (!acceptedImages.includes(file.type)) return 'Choisissez un fichier JPEG, PNG ou WebP.'
  if (file.size > imageToLatexLimits.fileBytes) return 'Le fichier dépasse 15 Mo.'
  return null
}

class LargeImageRegion extends Error {}
class UnreadableImageRegion extends Error {}

function imageCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('La préparation de l’image est indisponible dans ce navigateur.')
  context.fillStyle = '#fff'
  context.imageSmoothingQuality = 'high'
  context.fillRect(0, 0, width, height)
  return { canvas, context }
}

function splitRow(bitmap: ImageBitmap, top: number, height: number) {
  const width = 128
  const rows = 96
  const band = Math.max(2, Math.round(height * 0.24))
  const start = top + Math.floor((height - band) / 2)
  const { context } = imageCanvas(width, rows)
  context.drawImage(bitmap, 0, start, bitmap.width, band, 0, 0, width, rows)
  const { data } = context.getImageData(0, 0, width, rows)
  // Prefer a blank line near the middle to avoid cutting through an equation.
  let best = rows / 2
  let min = Infinity
  for (let y = 1; y < rows - 1; y++) {
    let ink = Math.abs(y - rows / 2) * 0.2
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4
      if (data[index] + data[index + 1] + data[index + 2] < 510) ink++
    }
    if (ink < min) {
      min = ink
      best = y
    }
  }
  return start + Math.round(best * band / rows)
}

async function transcribeRegion(bitmap: ImageBitmap, top: number, height: number, signal: AbortSignal): Promise<LatexTranscription> {
  signal.throwIfAborted()
  const ratio = Math.min(1, imageToLatexLimits.edge / Math.max(bitmap.width, height))
  const width = Math.max(1, Math.round(bitmap.width * ratio))
  const scaledHeight = Math.max(1, Math.round(height * ratio))
  const { canvas, context } = imageCanvas(width, scaledHeight)
  context.drawImage(bitmap, 0, top, bitmap.width, height, 0, 0, width, scaledHeight)
  const jpeg = (quality: number) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
  let image = await jpeg(0.96)
  if (image && image.size > imageToLatexLimits.uploadBytes) image = await jpeg(0.86)
  if (!image) throw new Error('Cette image ne peut pas être lue.')
  if (image.size > imageToLatexLimits.uploadBytes) throw new LargeImageRegion()
  signal.throwIfAborted()
  const response = await fetch('/api/image-to-latex', {
    method: 'POST', headers: { 'Content-Type': image.type }, body: image, signal,
  })
  const result = await response.json().catch(() => null) as (LatexTranscription & { message?: string; code?: string }) | null
  if (result?.code === 'TRANSCRIPTION_TOO_LONG' || response.status === 504) throw new LargeImageRegion()
  if (result?.code === 'IMAGE_UNREADABLE') throw new UnreadableImageRegion(result.message)
  if (!response.ok || !result?.latex) throw new Error(result?.message ?? 'La transcription a échoué. Réessayez.')
  return result.status === 'ok' && !isCompleteStudyWork(result.latex, result.status, compileStudyWork(result.latex))
    ? { ...result, status: 'partial' } : result
}

export async function readImageToLatex(file: File, signal: AbortSignal): Promise<LatexTranscription> {
  const decoded = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null)
  if (!decoded) throw new Error('Cette image ne peut pas être lue.')
  const bitmap = decoded
  async function read(top: number, bottom: number, depth: number): Promise<LatexTranscription[]> {
    const height = bottom - top
    let firstPass: LatexTranscription | undefined
    try {
      firstPass = await transcribeRegion(bitmap, top, height, signal)
      if (firstPass.status !== 'partial' || height < 900 || depth === 2) return [firstPass]
    } catch (error) {
      if (error instanceof UnreadableImageRegion) {
        if (height < 650 || depth === 2) return [{ latex: '[Zone illisible]', status: 'unreadable' }]
      } else if (error instanceof LargeImageRegion) {
        if (height < 200 || depth === 2) return [{ latex: '[Zone trop dense pour être transcrite]', status: 'unreadable' }]
      } else {
        throw error
      }
    }
    const middle = splitRow(bitmap, top, height)
    const bands = [...await read(top, middle, depth + 1), ...await read(middle, bottom, depth + 1)]
    // Keep the original reading when a zoomed pass loses context.
    return firstPass && bands.some(band => band.status !== 'ok') ? [firstPass] : bands
  }

  try {
    const middle = bitmap.height > 2048 && bitmap.height > bitmap.width * 1.25 ? splitRow(bitmap, 0, bitmap.height) : 0
    const results = middle ? [...await read(0, middle, 1), ...await read(middle, bitmap.height, 1)] : await read(0, bitmap.height, 0)
    if (results.every(item => item.status === 'unreadable')) throw new Error('Aucune zone de la page n’a pu être transcrite.')
    return {
      latex: results.map(item => item.latex).join('\n\n'),
      status: results.every(item => item.status === 'ok') ? 'ok' : results.some(item => item.status === 'limited') ? 'limited' : 'partial',
    }
  } finally {
    bitmap.close()
  }
}
