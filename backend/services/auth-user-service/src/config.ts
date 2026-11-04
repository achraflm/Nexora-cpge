import { optionalEnv, portEnv, requireEnv } from '@cnc/common'

/** Configuration du service, lue une seule fois au demarrage. */
export const config = {
  port: portEnv('AUTH_PORT', 4001),
  internalSecret: requireEnv('INTERNAL_SECRET'),
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET'),
  accessTokenTtl: optionalEnv('ACCESS_TOKEN_TTL', '15m'),
  refreshTokenTtlDays: Number(optionalEnv('REFRESH_TOKEN_TTL_DAYS', '30')),
  bcryptRounds: 12,
}
