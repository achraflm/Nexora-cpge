import { z } from 'zod'

export const resourceFilters = z.object({
  subject: z.enum(['MATH', 'PHYS', 'SI', 'INFO']).optional(),
  level: z.enum(['SUP', 'SPE']).optional(),
  type: z.enum(['COURSE', 'TD']).optional(),
}).strict()

export const resourceSample = z.array(z.object({
  subject: z.enum(['MATH', 'PHYS', 'SI', 'INFO']),
  level: z.enum(['SUP', 'SPE']),
  type: z.enum(['COURSE', 'TD']),
  category: z.string().min(1),
  title: z.string().min(1),
  sourceUrl: z.url().refine(value => {
    const url = new URL(value)
    return url.protocol === 'https:' && ['elearning-cpge.com', 'www.elearning-cpge.com'].includes(url.hostname)
  }, 'Lien source HTTPS attendu'),
  sourceName: z.literal('eLearning.CPGE'),
  orderIndex: z.number().int().positive(),
  localPdfUrl: z.string().regex(/^\/cours\/[a-z0-9-]+\.pdf$/).nullable(),
  pdfSourceUrl: z.url().optional(),
  downloadStatus: z.enum(['available', 'unavailable', 'access_denied']),
})).superRefine((resources, ctx) => {
  const urls = resources.map(resource => resource.sourceUrl.replace('://www.', '://'))
  if (new Set(urls).size !== urls.length) ctx.addIssue({ code: 'custom', message: 'URL source dupliquee' })
})

// Shared by the import and its verification; sourceUrl is the database's unique key.
export function resourceUpserts(input: unknown) {
  return resourceSample.parse(input).map(resource => ({
    where: { sourceUrl: resource.sourceUrl },
    create: resource,
    update: resource,
  }))
}
