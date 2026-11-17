import { createServiceApp, currentUser, requireUser, portEnv, requireEnv, startService } from '@cnc/common'
import { dashboard } from './dashboard'
import { activityInput, recordActivity } from './activities'
import { Router } from 'express'
import { z } from 'zod'

/**
 * analytics-streak-service (CDC 3.1 - service 4) — Sprint 4.
 * Journal d'activite, Streak quotidien (UC09), statistiques du Dashboard (UC03).
 * La regle de calcul du Streak est deja codee et testee dans streak.ts.
 */
const router = Router()
router.use('/analytics', (_req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-store')
  next()
})
router.post('/analytics/activities', requireUser('STUDENT'), async (req, res) => {
  await recordActivity(currentUser(req).id, activityInput.parse(req.body))
  res.sendStatus(204)
})
router.get('/analytics/me/streak', requireUser(), async (req, res) => {
  res.json((await dashboard(currentUser(req).id)).streak)
})
router.get('/analytics/me/heatmap', requireUser(), async (req, res) => {
  const requestedYear = z.coerce.number().int().min(1900).max(9999).optional().parse(req.query.year)
  const { year, heatmap } = await dashboard(currentUser(req).id, requestedYear)
  res.json({ year, heatmap })
})
router.get('/analytics/me/subjects', requireUser(), async (req, res) => {
  res.json((await dashboard(currentUser(req).id)).subjects)
})
router.get('/analytics/me/summary', requireUser(), async (req, res) => {
  res.json(await dashboard(currentUser(req).id))
})

const app = createServiceApp({ name: 'analytics-streak-service', internalSecret: requireEnv('INTERNAL_SECRET'), router })
startService(app, 'analytics-streak-service', portEnv('ANALYTICS_PORT', 4004))
