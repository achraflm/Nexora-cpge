import '@cnc/common'
import { readFile } from 'node:fs/promises'
import { prisma } from '../src/db'
import { resourceUpserts } from '../src/external-resources'

// Same small selection and local PDF paths as the frontend prototype.
const sampleUrl = new URL('../../../../frontend/lib/catalog-sample.json', import.meta.url)

try {
  const sample = JSON.parse(await readFile(sampleUrl, 'utf8'))
  const operations = resourceUpserts(sample)
  await prisma.$transaction(operations.map(operation => prisma.externalResource.upsert(operation)))
  console.log(`Catalogue : ${operations.length} documents ajoutes ou mis a jour avec leur disponibilite PDF.`)
} finally {
  await prisma.$disconnect()
}
