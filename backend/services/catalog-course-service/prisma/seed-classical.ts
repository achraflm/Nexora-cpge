import '@cnc/common'
import { readFile } from 'node:fs/promises'
import { prisma } from '../src/db'
import { problemInput } from '../src/classical-policy'

// Idempotent, research-only import. Never overwrites an administrator's work.
const candidates=JSON.parse(await readFile(new URL('../../../../docs/classical-candidates.json',import.meta.url),'utf8'))
const names={MATH:'Mathématiques',PHYS:'Physique',CHEM:'Chimie',SI:'Sciences industrielles',INFO:'Informatique'} as const
try {
  for(const [code,name] of Object.entries(names))await prisma.subject.upsert({where:{code:code as keyof typeof names},create:{code:code as keyof typeof names,name,coeffMP:0,coeffPSI:0,coeffTSI:0},update:{}})
  let inserted=0
  for(const candidate of candidates) {
    const {subject,...data}=problemInput.parse(candidate.problem)
    const subjectRow=await prisma.subject.findUniqueOrThrow({where:{code:subject}})
    const existing=await prisma.classicProblem.findUnique({where:{id:candidate.id},select:{id:true}})
    if(!existing){await prisma.classicProblem.create({data:{id:candidate.id,...data,subjectId:subjectRow.id,state:'DISCOVERED'}});inserted++}
  }
  console.log(`${inserted} candidats ajoutés en brouillon ; aucune publication automatique.`)
} finally {await prisma.$disconnect()}
