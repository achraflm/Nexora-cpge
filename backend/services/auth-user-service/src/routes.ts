import { currentUser, requireUser } from '@cnc/common'
import { Router } from 'express'
import * as auth from './auth.service'
import { loginSchema, refreshSchema, registerSchema, updateProfileSchema } from './schemas'
import * as users from './users.service'

/**
 * Routes HTTP du service. Chaque handler : valide (Zod) -> appelle le service -> repond.
 * Chemins vus par le frontend (via la gateway) : /api/auth/... et /api/users/...
 */
export const router = Router()

// ---- Authentification (publique) ------------------------------------------
router.post('/auth/register', async (req, res) => {
  res.status(201).json(await auth.register(registerSchema.parse(req.body)))
})

router.post('/auth/login', async (req, res) => {
  res.json(await auth.login(loginSchema.parse(req.body)))
})

router.post('/auth/refresh', async (req, res) => {
  res.json(await auth.refresh(refreshSchema.parse(req.body).refreshToken))
})

router.post('/auth/logout', async (req, res) => {
  await auth.logout(refreshSchema.parse(req.body).refreshToken)
  res.status(204).end()
})

// ---- Profil (utilisateur connecte) ----------------------------------------
router.get('/users/me', requireUser(), async (req, res) => {
  res.json(await users.getUser(currentUser(req).id))
})

router.patch('/users/me', requireUser(), async (req, res) => {
  res.json(await users.updateProfile(currentUser(req).id, updateProfileSchema.parse(req.body)))
})

// ---- Back-office (ADMIN) --------------------------------------------------
router.get('/users', requireUser('ADMIN'), async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))
  res.json(await users.listUsers(page, pageSize))
})
