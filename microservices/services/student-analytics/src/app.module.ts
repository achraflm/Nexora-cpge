import { Controller, Get, Module } from '@nestjs/common'
@Controller('health')
class HealthController {
  @Get()
  check() { return { status: 'ok', service: 'student-analytics' } }
}
@Module({ controllers: [HealthController] })
export class AppModule {}
