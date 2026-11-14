import { bootstrap } from '@cnc/runtime'
import { AppModule } from './app.module'
bootstrap(AppModule, true).catch(error => { console.error(error); process.exitCode = 1 })
