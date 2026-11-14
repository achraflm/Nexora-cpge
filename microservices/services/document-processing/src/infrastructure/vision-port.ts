// Adapter contract for a future Python worker. No implementation or job consumer yet.
export interface VisionWorkerConfiguration {
  transport: 'http' | 'rabbitmq'
  endpoint: string
  timeoutMs: number
}
