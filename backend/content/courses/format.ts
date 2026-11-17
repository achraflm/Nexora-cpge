export interface CourseSource {
  book: string
  author: string
  url: string
  license: 'CC BY 4.0' | 'CC BY-SA 4.0'
  licenseUrl: string
  attributionUrl?: string
}

export interface Section {
  title: string
  latex: string
}

export interface ExerciseContent {
  ref: string
  title: string
  locator?: string
  url?: string
  difficulty: number
  statement: string
  hints: string[]
  solution: Section[]
}

export interface CourseContent {
  slug: string
  subject: 'MATH' | 'PHYS' | 'SI'
  level: 'SUP' | 'SPE'
  title: string
  domain: string
  summary: string
  minutes: number
  legacyId?: string
  source?: CourseSource
  sections: Section[]
  exercises: ExerciseContent[]
  quiz: { question: string; answers: [string, string, string]; correct: number; explanation: string }[]
}

export const latex = String.raw

export function sectionsLatex(sections: Section[]) {
  return sections.map(section => '\\section*{' + section.title + '}\n' + section.latex.trim()).join('\n\n')
}

export function pdfUrl(slug: string, file: string) {
  return `/cours-prototype/${slug}/${file}.pdf`
}
