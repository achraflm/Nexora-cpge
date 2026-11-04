import { createServiceApp, startService } from '@cnc/common'
import { config } from './config'
import { router } from './routes'

/** auth-user-service (CDC 3.1 - service 1) : comptes, JWT, profils CPGE. */
const app = createServiceApp({ name: 'auth-user-service', internalSecret: config.internalSecret, router })
startService(app, 'auth-user-service', config.port)
