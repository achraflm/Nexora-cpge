export type UserRole = 'STUDENT' | 'ADMIN'
export type CpgeStream = 'MP*' | 'MP' | 'PSI*' | 'PSI' | 'TSI'
export type CpgeYear = '1re année Sup' | '2e année Spé'

export interface UserProfile {
  id: string
  name: string
  username?: string
  email: string
  role: UserRole
  stream?: CpgeStream
  year?: CpgeYear
  center?: string
  token?: string
  avatarUrl?: string
  bio?: string
  targetConcours?: string[]
}

export const DEMO_STUDENT: UserProfile = {
  id: 'usr_cpge_2026_01',
  name: 'Achraf Lemrani',
  username: 'achraf',
  email: 'achraf.lemrani@cpge.ma',
  role: 'STUDENT',
  stream: 'MP',
  year: '2e année Spé',
  center: 'Lycée Moulay Youssef (Rabat)',
  avatarUrl: '',
  bio: 'Objectif Concours CNC 2026 — Filière MP*',
  targetConcours: ['CNC Maroc', 'Mines-Ponts', 'Centrale-Supélec'],
  token: 'mock_jwt_token_student_achraf_mp_2026',
}

export const DEMO_ADMIN: UserProfile = {
  id: 'adm_learning_001',
  name: 'Dr. Karim Mansouri',
  email: 'admin@learning-cnc.ma',
  role: 'ADMIN',
  center: 'Direction des Concours & Agrégation',
  token: 'mock_jwt_token_admin_dr_karim_2026',
}

export const CPGE_CENTERS = [
  'Lycée Omar Ibn Al-Khattab (Rabat)',
  'Lycée Moulay Youssef (Rabat)',
  'Lycée Mohammed V (Casablanca)',
  'Lycée Ibn Timiya (Marrakech)',
  'Lycée Reda Slaoui (Agadir)',
  'Lycée Moulay Idriss (Fès)',
  'Autre centre CPGE',
]


// Ce cache ne sert qu'à l'affichage. La session et les rôles sont vérifiés côté serveur.
let profileCache: UserProfile | null = null
export function getStoredUser(): UserProfile | null { return profileCache }
export function saveUserSession(user: UserProfile) {
  profileCache = { ...user, token: undefined }
  if (typeof window !== 'undefined') window.localStorage.removeItem('learning_cnc_user_session')
}
export function clearUserSession() { profileCache = null }

export async function authenticateBrowser(action: 'login' | 'register', input: Record<string, unknown>): Promise<UserProfile> {
  const response = await fetch(`/api/auth/${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.details?.[0]?.message || data.message || 'Connexion impossible.')
  saveUserSession(data.user)
  return data.user
}

export async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  })
  if (!response.ok && response.status !== 401) {
    window.alert('Déconnexion impossible. Réessayez lorsque le service sera disponible.')
    return
  }
  clearUserSession()
  window.location.assign('/login')
}
