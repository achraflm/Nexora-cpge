export const RESOURCE_SUBJECTS={MATH:'Mathématiques',PHYS:'Physique-Chimie',INFO:'Informatique',SI:"Sciences Industrielles de l’Ingénieur (SII)"} as const
export interface EducationalResource {
  id:string;title:string;description:string;track:'MPSI'|'MP';level:'SUP'|'SPE';type:'COURSE'|'TD';status:'DRAFT'|'PUBLISHED';allowDownload:boolean;
  subject:{code:keyof typeof RESOURCE_SUBJECTS;name:string};originalName:string;format:string;bytes:number;createdAt:string;importedBy:string;
  conversion:'PENDING'|'PROCESSING'|'READY'|'FAILED';conversionError:string|null;companions:{name:string;bytes:number}[];
}
export async function resourceRequest(path='',options:RequestInit={}) {
  const response=await fetch(`/api/resources${path}`,options)
  if(!response.ok){const error=await response.json().catch(()=>({}));throw new Error(error.message || 'La demande a échoué.')}
  return response.status===204?null:response.json()
}
