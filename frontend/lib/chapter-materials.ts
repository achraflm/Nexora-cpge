import type { programmeSubjects } from './cpge-programme'
import type { CourseDocument } from './pdf-course-chapters'

export interface ChapterMaterial {
  id: string
  subject: keyof typeof programmeSubjects
  level: 'SUP' | 'SPE'
  chapterTitle: string
  type: 'COURSE' | 'TD'
  title: string
  format: 'LATEX' | 'PDF'
  status: 'PUBLISHED' | 'DRAFT'
  latex: string | null
  fileName: string | null
  revision: number
}

const endpoint = '/api/resources/chapters'

export async function chapterMaterialRequest<T>(path = '', options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint + path, { cache: 'no-store', ...options })
  if (response.status === 204) return undefined as T
  const result = await response.json().catch(() => null)
  if (!response.ok) throw new Error(result?.message || 'Le contenu du chapitre est momentanément indisponible.')
  return result
}

export function chapterMaterialPdf(item: ChapterMaterial): CourseDocument {
  const url = `${endpoint}/${item.id}/file`
  return {
    subject: item.subject, level: item.level, type: item.type,
    title: item.title, category: item.chapterTitle, sourceName: '', sourceUrl: url, localPdfUrl: url,
    orderIndex: 0, pdfSourceUrl: '', downloadStatus: 'available',
  }
}
