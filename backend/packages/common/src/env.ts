import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Charge le fichier backend/.env (unique pour tous les services).
 * Ce fichier se trouve 3 niveaux au-dessus de packages/common/src.
 */
const ENV_FILE = resolve(import.meta.dirname, '../../../.env')
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE)

/** Lit une variable obligatoire ; arrete le service si elle manque. */
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name} (voir backend/.env.example)`)
  }
  return value
}

/** Lit une variable optionnelle avec une valeur par defaut. */
export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback
}

export function portEnv(name: string, fallback: number): number {
  const port = Number(process.env[name] ?? fallback)
  if (!Number.isInteger(port) || port <= 0) throw new Error(`Port invalide pour ${name}`)
  return port
}
