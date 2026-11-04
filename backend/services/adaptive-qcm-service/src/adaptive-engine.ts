/**
 * Moteur adaptatif du QCM (CDC 6.2) — logique pure, sans base de donnees.
 *
 *   M_{k+1} = clamp_[0,100]( M_k + alpha * S_k * omega(D_k) * phi(t_k) )
 *   S_k      = +1 si exacte, -1.2 si erronee
 *   omega(D) = 1 + 0.25 (D - 1)
 *   phi(t)   = max(0.5, min(1.3, T_cible / t))
 */

export const INITIAL_MASTERY = 50
/** alpha n'est pas fixe par le CDC : pas de base de l'ajustement (points de maitrise). */
export const ALPHA = 5
export const MIN_DIFFICULTY = 1
export const MAX_DIFFICULTY = 4
/** Intervalles de repetition espacee en jours (CDC 6.2.1). */
export const REVIEW_INTERVALS = [1, 3, 7, 21] as const

const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x))

export function difficultyWeight(difficulty: number): number {
  return 1 + 0.25 * (difficulty - 1)
}

export function speedFactor(timeSpentSec: number, targetTimeSec: number): number {
  if (timeSpentSec <= 0) return 1.3
  return clamp(targetTimeSec / timeSpentSec, 0.5, 1.3)
}

export interface AnswerInput {
  mastery: number
  correct: boolean
  difficulty: number
  timeSpentSec: number
  targetTimeSec: number
}

export function updateMastery({ mastery, correct, difficulty, timeSpentSec, targetTimeSec }: AnswerInput): number {
  const s = correct ? 1 : -1.2
  const delta = ALPHA * s * difficultyWeight(difficulty) * speedFactor(timeSpentSec, targetTimeSec)
  return clamp(mastery + delta, 0, 100)
}

/**
 * Selection adaptative : juste ET rapide (t <= T_cible) -> D+1 ;
 * juste mais lent -> D inchange ; erreur -> D-1.
 */
export function nextDifficulty(difficulty: number, correct: boolean, timeSpentSec: number, targetTimeSec: number): number {
  if (!correct) return Math.max(MIN_DIFFICULTY, difficulty - 1)
  if (timeSpentSec <= targetTimeSec) return Math.min(MAX_DIFFICULTY, difficulty + 1)
  return difficulty
}

export interface ReviewState {
  step: number
  intervalDays: number
  nextReviewDate: string
}

/**
 * Repetition espacee : une erreur (re)place la question a J+1 ;
 * une bonne reponse en revision avance d'un cran (J+3, J+7, J+21).
 * Retourne null quand la question est maitrisee (sortie de la file).
 */
export function scheduleReview(previousStep: number | null, correct: boolean, today: string): ReviewState | null {
  let step: number
  if (!correct) step = 0
  else if (previousStep === null) return null // jamais ratee : pas de revision
  else step = previousStep + 1

  if (step >= REVIEW_INTERVALS.length) return null
  const intervalDays = REVIEW_INTERVALS[step]
  const date = new Date(`${today}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + intervalDays)
  return { step, intervalDays, nextReviewDate: date.toISOString().slice(0, 10) }
}
