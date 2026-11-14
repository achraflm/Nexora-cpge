import { Controller, Get, Module } from '@nestjs/common'
@Controller('health')
class HealthController {
  @Get()
  check() { return { status: 'ok', service: 'communication' } }
}
@Module({ controllers: [HealthController] })
export class AppModule {}
