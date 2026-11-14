import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { Type } from '@nestjs/common'
import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url(),
  RABBITMQ_URL: z.string().url(),
  MINIO_ENDPOINT: z.string().url(),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(8),
})
export async function bootstrap(module: Type<unknown>, databaseRequired = true) {
  const result = schema.safeParse(process.env)
  if (!result.success) throw new Error('Invalid environment keys: ' + result.error.issues.map(issue => issue.path.join('.')).join(', '))
  if (databaseRequired && !result.data.DATABASE_URL) throw new Error('DATABASE_URL is required')
  const app = await NestFactory.create(module)
  app.enableShutdownHooks()
  await app.listen(result.data.PORT, '0.0.0.0')
}
export interface EventEnvelope<T> {
  id: string
  type: string
  version: number
  occurredAt: string
  correlationId: string
  payload: T
}
