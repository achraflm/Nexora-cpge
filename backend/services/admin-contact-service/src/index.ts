import { createServiceApp, portEnv, requireEnv, startService } from '@cnc/common'
import router from './tickets'

const app = createServiceApp({ name: 'admin-contact-service', internalSecret: requireEnv('INTERNAL_SECRET'), router })
startService(app, 'admin-contact-service', portEnv('CONTACT_PORT', 4005))
