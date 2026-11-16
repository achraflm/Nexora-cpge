import { currentUser, requireUser } from '@cnc/common'
import { Router } from 'express'
import { z } from 'zod'
import * as auth from './auth.service'
import { accessSchema, accountListSchema, accountStatusSchema, changePasswordSchema, createAccountSchema, loginSchema,
  refreshSchema, registerSchema, updateAccountSchema, updateProfileSchema } from './schemas'
import { toPublicUser } from './user-mapper'
import * as users from './users.service'

/**
 * Routes HTTP du service. Chaque handler : valide (Zod) -> appelle le service -> repond.
 * Chemins vus par le frontend (via la gateway) : /api/auth/... et /api/users/...
 */
export const router = Router()
router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next() })

router.post('/internal/access', async (req, res) => {
  await users.checkAccess(accessSchema.parse(req.body))
  res.status(204).end()
})

router.post('/auth/session', async (req, res) => {
  res.json(await auth.getSession(refreshSchema.parse(req.body).refreshToken))
})

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
  res.json(await users.updateProfile(currentUser(req).id, updateProfileSchema.parse(req.body), true))
})

router.patch('/users/me/password', requireUser(), async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
  await auth.changePassword(currentUser(req).id, currentPassword, newPassword)
  res.status(204).end()
})

router.patch('/users/me/deactivate', requireUser('STUDENT'), async (req, res) => {
  const actor = currentUser(req)
  await users.setAccountStatus(actor.id, false, actor)
  res.status(204).end()
})

// ---- Back-office (ADMIN) --------------------------------------------------
router.get('/users', requireUser('ADMIN'), async (req, res) => {
  res.json(await users.listUsers(accountListSchema.parse(req.query)))
})

router.post('/users', requireUser('ADMIN'), async (req, res) => {
  res.status(201).json(toPublicUser(await users.createAccount(createAccountSchema.parse(req.body))))
})

router.get('/users/:id', requireUser('ADMIN'), async (req, res) => {
  res.json(await users.getUser(z.uuid().parse(req.params.id)))
})

router.patch('/users/:id', requireUser('ADMIN'), async (req, res) => {
  res.json(await users.updateProfile(z.uuid().parse(req.params.id), updateAccountSchema.parse(req.body), false))
})

router.patch('/users/:id/status', requireUser('ADMIN'), async (req, res) => {
  const { active } = accountStatusSchema.parse(req.body)
  res.json(await users.setAccountStatus(z.uuid().parse(req.params.id), active, currentUser(req)))
})
