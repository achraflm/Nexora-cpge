import { createServiceApp, notImplemented, portEnv, requireEnv, requireUser, startService } from '@cnc/common'
import { Router } from 'express'

/**
 * adaptive-qcm-service (CDC 3.1 - service 6, Projet 15) — Sprint 5.
 * Les formules du CDC 6.2 sont deja codees et testees dans adaptive-engine.ts.
 */
const router = Router()
const todo = notImplemented('Sprint 5')

router.post('/qcm/sessions', todo) // { chapterId } -> initialise M(u,c) et D, renvoie la 1re question
router.post('/qcm/sessions/:id/answers', todo) // { questionId, choiceId, timeSpentSec } -> correction + question suivante
router.post('/qcm/sessions/:id/finish', todo) // score, weak_lessons_json, evenement Streak
router.get('/qcm/flash', todo) // "QCM Flash Quotidien" : questions dues (nextReviewDate <= aujourd'hui)
router.get('/qcm/mastery', todo) // indices de maitrise par chapitre

router.post('/qcm/questions', requireUser('ADMIN'), todo)
router.patch('/qcm/questions/:id', requireUser('ADMIN'), todo)

const app = createServiceApp({ name: 'adaptive-qcm-service', internalSecret: requireEnv('INTERNAL_SECRET'), router })
startService(app, 'adaptive-qcm-service', portEnv('QCM_PORT', 4006))
