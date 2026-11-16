import { z } from 'zod'

export const subjects = ['MATH','PHYS','CHEM','SI','INFO'] as const
export const correctionStatuses = ['OFFICIAL','AUTHOR_PUBLISHED','TEACHER_PUBLISHED','UNVERIFIED','NO_CORRECTION','PENDING_VERIFICATION'] as const
export const stages = ['DISCOVERED','SOURCE_VERIFIED','STATEMENT_VERIFIED','CORRECTION_FOUND','CORRECTION_VERIFIED','COPYRIGHT_REVIEWED','APPROVED','PUBLISHED','REJECTED'] as const
export const verifiedCorrections = new Set<string>(['OFFICIAL','AUTHOR_PUBLISHED','TEACHER_PUBLISHED'])
const text = z.string().trim().max(4000)
export const externalUrl = z.string().max(2000).refine(value => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      !/^(localhost|.*\.localhost|.*\.local|.*\.internal|[\d.]+|\[.*\])$/i.test(url.hostname) && url.hostname.includes('.')
  } catch { return false }
}, 'Une URL HTTPS publique sans identifiants est requise.')
export const sourceSchema = z.object({
  sourceName: z.string().trim().min(1).max(200), sourceUrl: externalUrl,
  documentUrl: externalUrl.nullable().default(null), author: text.default(''), institution: text.default(''),
  publicationDate: z.iso.date().nullable().default(null), verifiedAt: z.iso.date().nullable().default(null),
  evidence: text.default(''), locator: z.string().max(300).default(''),
  format: z.enum(['PDF','WEB','CODE']).default('WEB'),
  license: text.default('Droits non établis ; lien externe uniquement.'),
  licenseEvidence: text.default(''), access: z.enum(['LINK_ONLY','EMBED','LOCAL']).default('LINK_ONLY'),
  resourceId:z.uuid().nullable().default(null), resourceRevision:z.number().int().positive().nullable().default(null),
  originalConfirmed: z.boolean().default(false), officialEvidence: text.default(''),
}).strict()
export const problemInput = z.object({
  title: z.string().trim().min(1).max(200), subject: z.enum(subjects), level: z.enum(['SUP','SPE']),
  tracks: z.array(z.enum(['MP','PSI','PC','TSI'])).max(4).refine(v=>new Set(v).size===v.length).default([]),
  chapterId: z.uuid().nullable().default(null), chapterLabel: z.string().trim().min(1).max(200),
  difficulty: z.enum(['EASY','INTERMEDIATE','ADVANCED','VERY_ADVANCED']),
  problemType: z.enum(['CLASSICAL_EXERCISE','CLASSICAL_PROBLEM','FUNDAMENTAL_CHALLENGE']),
  correctionStatus: z.enum(correctionStatuses).default('PENDING_VERIFICATION'),
  metadata: z.object({
    description: text, subchapter: text.default(''), topic: text.default(''),
    estimatedMinutes: z.number().int().min(5).max(600), prerequisites: z.array(z.string().max(200)).max(20),
    statement: sourceSchema, correction: sourceSchema.nullable().default(null),
    curriculumEvidence: text.default(''), nonCompetitionEvidence: text.default(''),
    copyrightReviewed: z.boolean().default(false), editorialNote: text.default(''),
  }).strict(),
}).strict()
export type ProblemInput = z.infer<typeof problemInput>
export const progressInput = z.object({
  status:z.enum(['NOT_STARTED','IN_PROGRESS','STATEMENT_COMPLETED','CORRECTION_CONSULTED','MASTERED','TO_REVIEW']).optional(),
  favorite:z.boolean().optional(), saved:z.boolean().optional(), notes:z.string().max(20000).optional(),
  bookmarks:z.array(z.object({document:z.enum(['statement','correction']),page:z.number().int().min(1).max(10000),note:z.string().max(1000)}).strict()).max(100).optional(),
}).strict()

function validSource(source:z.infer<typeof sourceSchema> | null) {
  return !!source && !!(source.access==='LOCAL'?source.resourceId:source.documentUrl) && !!source.verifiedAt && !!source.evidence && source.originalConfirmed && !!(source.author || source.institution)
}
export function correctionAvailable(problem: Pick<ProblemInput,'correctionStatus'|'metadata'>) {
  return verifiedCorrections.has(problem.correctionStatus) && validSource(problem.metadata.correction) &&
    (problem.correctionStatus !== 'OFFICIAL' || !!problem.metadata.correction?.officialEvidence)
}
export function publicationErrors(problem:ProblemInput, target:string) {
  const issues:string[]=[]
  const index=stages.indexOf(target as typeof stages[number])
  if(target==='REJECTED' || target==='DISCOVERED')return issues
  if(index>=1 && (!problem.metadata.statement.sourceUrl || !problem.metadata.statement.sourceName))issues.push('Source de l’énoncé requise.')
  if(index>=2 && (!validSource(problem.metadata.statement) || !problem.metadata.nonCompetitionEvidence))issues.push('Vérifiez l’énoncé, son attribution et son origine hors concours.')
  if(target==='CORRECTION_FOUND' && !(problem.metadata.correction?.documentUrl || problem.metadata.correction?.resourceId))issues.push('Document du corrigé requis.')
  if(target==='CORRECTION_VERIFIED' && !correctionAvailable(problem))issues.push('Authenticité du corrigé non établie.')
  if(index>=5) {
    if(!problem.metadata.copyrightReviewed || !problem.metadata.statement.license)issues.push('Contrôle des droits requis.')
    for(const source of [problem.metadata.statement,problem.metadata.correction]) {
      if(source?.access==='EMBED' && (!source.licenseEvidence || source.format!=='PDF'))issues.push('La lecture intégrée exige un PDF et une preuve d’autorisation.')
      if(source?.access==='LOCAL' && (!source.licenseEvidence || source.format!=='PDF' || !source.resourceId || !source.resourceRevision))issues.push('Le PDF local exige un document original identifié et une autorisation de réhébergement.')
    }
    if(verifiedCorrections.has(problem.correctionStatus) && !correctionAvailable(problem))issues.push('Le statut du corrigé doit correspondre aux preuves disponibles.')
  }
  if(index>=6 && (!problem.tracks.length || !problem.metadata.curriculumEvidence))issues.push('Validez les filières à partir du programme.')
  if(index>=6 && problem.metadata.statement.access!=='LOCAL')issues.push('Importez le PDF de l’énoncé pour permettre sa lecture sur le site.')
  if(index>=6 && correctionAvailable(problem) && problem.metadata.correction?.access!=='LOCAL')issues.push('Importez également le PDF du corrigé avant publication.')
  return issues
}

export function transitionAllowed(from:string,to:string) {
  if(to==='REJECTED' || to==='DISCOVERED')return true
  if(from==='STATEMENT_VERIFIED' && to==='COPYRIGHT_REVIEWED')return true // publication sans corrigé
  return from!=='REJECTED' && stages.indexOf(to as any)===stages.indexOf(from as any)+1 && to!=='REJECTED'
}

// A pending correction is never leaked to a student through the metadata API.
export function publicMetadata(problem:Pick<ProblemInput,'correctionStatus'|'metadata'>) {
  const {editorialNote,...metadata}=problem.metadata
  return {...metadata,correction:correctionAvailable(problem)?metadata.correction:null}
}
