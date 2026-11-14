import { Controller, Get, Module, Param, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
const services = ['identity', 'academic-content', 'communication', 'student-analytics', 'document-processing', 'adaptive-qcm']
@Controller('health')
class HealthController {
  @Get()
  check() { return { status: 'ok', service: 'gateway' } }
  @Get(':service')
  async serviceHealth(@Param('service') service: string) {
    const index = services.indexOf(service)
    if (index < 0) throw new NotFoundException()
    const host = process.env.SERVICE_HOST_MODE === 'docker' ? service : 'localhost'
    try {
      const response = await fetch(`http://${host}:${5101 + index}/health`, { signal: AbortSignal.timeout(3000) })
      if (!response.ok) throw new Error('Unavailable')
      return await response.json()
    } catch {
      throw new ServiceUnavailableException('Service unavailable')
    }
  }
}
@Module({ controllers: [HealthController] })
export class AppModule {}
