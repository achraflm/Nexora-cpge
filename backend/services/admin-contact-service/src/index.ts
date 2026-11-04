import { createServiceApp, notImplemented, portEnv, requireEnv, requireUser, startService } from '@cnc/common'
import { Router } from 'express'

/**
 * admin-contact-service (CDC 3.1 - service 5) — Sprint 4.
 * Tickets Contact Admin, signalement d'errata, notifications (UC08, UC11, diagramme 4.3.2).
 */
const router = Router()
const todo = notImplemented('Sprint 4')

// Etudiant
router.post('/contact/tickets', todo) // { category, targetEntityRef?, messageBody } -> status OPEN
router.get('/contact/tickets/mine', todo)
router.get('/contact/tickets/:id', todo)
router.get('/contact/notifications', todo)
router.patch('/contact/notifications/:id/read', todo)

// Administrateur (UC11)
router.get('/contact/admin/tickets', requireUser('ADMIN'), todo) // ?status&category
router.patch('/contact/admin/tickets/:id', requireUser('ADMIN'), todo) // IN_PROGRESS
router.post('/contact/admin/tickets/:id/reply', requireUser('ADMIN'), todo) // adminReply -> RESOLVED + notification + e-mail

const app = createServiceApp({ name: 'admin-contact-service', internalSecret: requireEnv('INTERNAL_SECRET'), router })
startService(app, 'admin-contact-service', portEnv('CONTACT_PORT', 4005))
