import { createServiceApp, notImplemented, portEnv, requireEnv, requireUser, startService } from '@cnc/common'
import { Router } from 'express'

/**
 * catalog-course-service (CDC 3.1 - service 2) — Sprint 2.
 * Matieres, chapitres Sup/Spe, lecons, exercices double mode, ouvrages de reference.
 * Squelette : les routes prevues sont declarees et repondent 501 en attendant le code.
 */
const router = Router()
const todo = notImplemented('Sprint 2')

// Consultation (tout etudiant connecte ; aucune restriction Sup/Spe).
router.get('/catalog/subjects', todo)
router.get('/catalog/chapters', todo) // ?subject=MATH&level=SUP|SPE&filiere=MP
router.get('/catalog/chapters/:id', todo)
router.get('/catalog/lessons/:id', todo)
router.get('/catalog/lessons/:id/exercises', todo) // ?mode=PDF|BIBMATH
router.get('/catalog/exercises/:id', todo)
router.post('/catalog/exercises/:id/attempts', todo) // auto-evaluation -> evenement analytics
router.get('/catalog/books', todo) // ?subject&filiere&level
router.get('/catalog/books/:id', todo)

// Back-office (UC12).
router.post('/catalog/:entity', requireUser('ADMIN'), todo) // chapters | lessons | exercises | books
router.patch('/catalog/:entity/:id', requireUser('ADMIN'), todo)
router.delete('/catalog/:entity/:id', requireUser('ADMIN'), todo)

const app = createServiceApp({ name: 'catalog-course-service', internalSecret: requireEnv('INTERNAL_SECRET'), router })
startService(app, 'catalog-course-service', portEnv('CATALOG_PORT', 4002))
