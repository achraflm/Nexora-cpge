import { createServiceApp, notImplemented, portEnv, requireEnv, startService } from '@cnc/common'
import { Router } from 'express'

/**
 * analytics-streak-service (CDC 3.1 - service 4) — Sprint 4.
 * Journal d'activite, Streak quotidien (UC09), statistiques du Dashboard (UC03).
 * La regle de calcul du Streak est deja codee et testee dans streak.ts.
 */
const router = Router()
const todo = notImplemented('Sprint 4')

// Evenement d'activite (lecon lue, exercice resolu, probleme redige, QCM valide) :
// upsert DailyActivityLog + updateStreak() dans une transaction, puis invalidation du cache Redis.
router.post('/analytics/activities', todo)
router.get('/analytics/me/streak', todo) // currentStreak, longestStreak
router.get('/analytics/me/heatmap', todo) // ?year=2026
router.get('/analytics/me/subjects', todo) // radar + progression par matiere (Sup/Spe)
router.get('/analytics/me/summary', todo) // compteurs du Dashboard

const app = createServiceApp({ name: 'analytics-streak-service', internalSecret: requireEnv('INTERNAL_SECRET'), router })
startService(app, 'analytics-streak-service', portEnv('ANALYTICS_PORT', 4004))
