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

const AUTH_STORAGE_KEY = 'learning_cnc_user_session'

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveUserSession(user: UserProfile) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } catch (err) {
    console.error('Failed to save session', err)
  }
}

export function clearUserSession() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (err) {
    console.error('Failed to clear session', err)
  }
}
