import { createServiceApp, notImplemented, portEnv, requireEnv, requireUser, startService } from '@cnc/common'
import { Router } from 'express'
import { prisma } from './db'
import { resourceFilters } from './external-resources'
import { educationalResources } from './educational-resources'
import { recoverConversions } from './resource-converter'
import { classicalProblems } from './classical-problems'
import { publishedCourses } from './published-courses'
import { chapterMaterials } from './chapter-materials'

/**
 * catalog-course-service (CDC 3.1 - service 2) — Sprint 2.
 * Matieres, chapitres Sup/Spe, lecons, exercices double mode, ouvrages de reference.
 * Catalogue externe disponible ; les routes de contenus natifs restent au Sprint 2.
 */
const router = Router()
const todo = notImplemented('Sprint 2')
router.use('/catalog/educational-resources', educationalResources)
router.use('/catalog/classical-problems', classicalProblems)
router.use('/catalog/chapter-materials', chapterMaterials)

// Consultation (tout etudiant connecte ; aucune restriction Sup/Spe).
router.get('/catalog/resources', async (req, res) => {
  const where = resourceFilters.parse(req.query)
  const resources = await prisma.externalResource.findMany({
    where,
    orderBy: [{ subject: 'asc' }, { level: 'asc' }, { orderIndex: 'asc' }, { sourceUrl: 'asc' }],
  })
  res.json({ resources, total: resources.length })
})
router.get('/catalog/subjects', todo)
router.use('/catalog', publishedCourses)
router.get('/catalog/chapters/:id', todo)
router.get('/catalog/lessons/:id', todo)
router.get('/catalog/lessons/:id/exercises', todo) // ?mode=PDF|BIBMATH
router.get('/catalog/exercises/:id', todo)
router.get('/catalog/books', todo) // ?subject&filiere&level
router.get('/catalog/books/:id', todo)

// Back-office (UC12).
router.post('/catalog/:entity', requireUser('ADMIN'), todo) // chapters | lessons | exercises | books
router.patch('/catalog/:entity/:id', requireUser('ADMIN'), todo)
router.delete('/catalog/:entity/:id', requireUser('ADMIN'), todo)

const app = createServiceApp({ name: 'catalog-course-service', internalSecret: requireEnv('INTERNAL_SECRET'), router })
startService(app, 'catalog-course-service', portEnv('CATALOG_PORT', 4002))
void recoverConversions().catch(console.error)
