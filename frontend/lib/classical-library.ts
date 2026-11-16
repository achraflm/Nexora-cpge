export const CLASSIC_SUBJECTS={MATH:'Mathématiques',PHYS:'Physique',CHEM:'Chimie',SI:'Sciences industrielles',INFO:'Informatique'} as const
export const DIFFICULTIES={EASY:'Accessible',INTERMEDIATE:'Intermédiaire',ADVANCED:'Avancé',VERY_ADVANCED:'Très avancé'} as const
export const PROBLEM_TYPES={CLASSICAL_EXERCISE:'Exercice classique',CLASSICAL_PROBLEM:'Problème classique',FUNDAMENTAL_CHALLENGE:'Défi fondamental'} as const
export const PROGRESS_LABELS={NOT_STARTED:'Non commencé',IN_PROGRESS:'En cours',STATEMENT_COMPLETED:'Énoncé terminé',CORRECTION_CONSULTED:'Corrigé consulté',MASTERED:'Maîtrisé',TO_REVIEW:'À revoir'} as const
export const CORRECTION_LABELS={OFFICIAL:'Corrigé officiel attesté',AUTHOR_PUBLISHED:'Publié par l’auteur',TEACHER_PUBLISHED:'Publié par un enseignant',UNVERIFIED:'Authenticité non vérifiée',NO_CORRECTION:'Corrigé indisponible',PENDING_VERIFICATION:'Corrigé en attente de vérification'} as const
export const STAGE_LABELS={DISCOVERED:'Repéré',SOURCE_VERIFIED:'Source vérifiée',STATEMENT_VERIFIED:'Énoncé vérifié',CORRECTION_FOUND:'Corrigé trouvé',CORRECTION_VERIFIED:'Corrigé vérifié',COPYRIGHT_REVIEWED:'Droits examinés',APPROVED:'Approuvé',PUBLISHED:'Publié',REJECTED:'Rejeté'} as const
export interface ClassicSource {
  sourceName:string;sourceUrl:string;documentUrl:string|null;author:string;institution:string;publicationDate:string|null;verifiedAt:string|null;evidence:string;locator:string;format:'PDF'|'WEB'|'CODE';license:string;licenseEvidence:string;access:'LINK_ONLY'|'EMBED'|'LOCAL';resourceId?:string|null;resourceRevision?:number|null;originalConfirmed:boolean;officialEvidence:string
}
export interface ClassicMetadata {
  description:string;subchapter:string;topic:string;estimatedMinutes:number;prerequisites:string[];statement:ClassicSource;correction:ClassicSource|null;curriculumEvidence:string;nonCompetitionEvidence:string;copyrightReviewed:boolean;editorialNote?:string
}
export interface ClassicProgress {
  status:keyof typeof PROGRESS_LABELS;favorite:boolean;saved:boolean;notes:string;bookmarks:{document:'statement'|'correction';page:number;note:string}[]
}
export interface ClassicProblem {
  id:string;title:string;subject:{code:keyof typeof CLASSIC_SUBJECTS};level:'SUP'|'SPE';tracks:string[];chapterId:string|null;chapterLabel:string;difficulty:keyof typeof DIFFICULTIES;problemType:keyof typeof PROBLEM_TYPES;correctionStatus:keyof typeof CORRECTION_LABELS;metadata:ClassicMetadata;state:keyof typeof STAGE_LABELS;revision:number;correctionAvailable:boolean;progress:ClassicProgress|null
}
export async function classicRequest(path='',method='GET',body?:unknown,signal?:AbortSignal) {
  const response=await fetch(`/api/classical-problems${path}`,{method,signal,cache:'no-store',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined})
  const data=await response.json()
  if(!response.ok)throw new Error(data.details?.[0]?.message || data.message || 'La demande a échoué.')
  return data
}
export const emptyProgress:ClassicProgress={status:'NOT_STARTED',favorite:false,saved:false,notes:'',bookmarks:[]}
export const emptySource:ClassicSource={sourceName:'',sourceUrl:'',documentUrl:null,author:'',institution:'',publicationDate:null,verifiedAt:null,evidence:'',locator:'',format:'PDF',license:'Droits non établis ; lien externe uniquement.',licenseEvidence:'',access:'LOCAL',originalConfirmed:false,officialEvidence:''}
