import { createServiceApp, notImplemented, portEnv, requireEnv, requireUser, startService } from '@cnc/common'
import { Router } from 'express'

/**
 * exam-submission-service (CDC 3.1 - service 3) — Sprint 3.
 * Banque de problemes, annales CNC 2010-2026, chronometre, "Mes Problemes Rediges" (UC06, UC07).
 */
const router = Router()
const todo = notImplemented('Sprint 3')

router.get('/exams', todo) // ?kind=CNC_ANNALE|PROBLEM&year&filiere&epreuve
router.get('/exams/:id', todo) // sans solution/bareme tant que non soumis
router.post('/exams/:id/sessions', todo) // UC07 etape 1 : demarrer une redaction (avec ou sans chrono)
router.post('/exams/sessions/:sessionId/submit', todo) // UC07 etapes 3-4 : soumettre -> archiver -> debloquer corrige
router.patch('/exams/submissions/:id', todo) // UC07 etape 5 : note d'auto-evaluation + notes perso
router.get('/exams/submissions/mine', todo) // portefeuille "Mes Problemes Rediges"

router.post('/exams', requireUser('ADMIN'), todo) // UC12 : publier une annale / un probleme
router.patch('/exams/:id', requireUser('ADMIN'), todo)

const app = createServiceApp({ name: 'exam-submission-service', internalSecret: requireEnv('INTERNAL_SECRET'), router })
startService(app, 'exam-submission-service', portEnv('EXAM_PORT', 4003))
