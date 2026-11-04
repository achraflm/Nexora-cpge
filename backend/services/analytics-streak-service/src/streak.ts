/**
 * Moteur de Streak (CDC 4.3.1, diagramme d'activite 1) — logique pure, sans base de donnees.
 *
 *   Delta = jour courant - lastActiveDate (en jours calendaires)
 *   Delta = 0  -> maintien (deja actif aujourd'hui)
 *   Delta = 1  -> currentStreak + 1
 *   Delta > 1  -> reinitialisation a 1
 *   longestStreak = max(longestStreak, currentStreak)
 *
 * Les dates sont des chaines "YYYY-MM-DD" exprimees dans le fuseau de l'etudiant
 * (Africa/Casablanca) : le calcul ne depend donc pas du fuseau du serveur.
 */
export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Nombre de jours calendaires entre deux dates "YYYY-MM-DD". */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS)
}

export function updateStreak(state: StreakState, today: string): StreakState {
  if (state.lastActiveDate === null) {
    return { currentStreak: 1, longestStreak: Math.max(1, state.longestStreak), lastActiveDate: today }
  }

  const delta = daysBetween(state.lastActiveDate, today)
  if (delta < 0) throw new Error('Activite anterieure a la derniere activite enregistree')
  if (delta === 0) return state

  const currentStreak = delta === 1 ? state.currentStreak + 1 : 1
  return {
    currentStreak,
    longestStreak: Math.max(state.longestStreak, currentStreak),
    lastActiveDate: today,
  }
}

/** Date locale "YYYY-MM-DD" d'un instant, dans un fuseau donne. */
export function localDate(instant: Date, timeZone = 'Africa/Casablanca'): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant)
}
