export type Role = 'ADMIN' | 'USER'

export interface AuthResponse {
  token: string
  refreshToken: string
  userId: number
  phone: string
  role: Role
}

export interface AuthSession {
  userId: number
  phone: string
  role: Role
}

const TOKEN = 'token'
const REFRESH = 'refreshToken'
const SESSION = 'session'

export const getToken = () => localStorage.getItem(TOKEN)
export const getRefreshToken = () => localStorage.getItem(REFRESH)

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function saveAuth(data: AuthResponse) {
  localStorage.setItem(TOKEN, data.token)
  localStorage.setItem(REFRESH, data.refreshToken)
  localStorage.setItem(
    SESSION,
    JSON.stringify({ userId: data.userId, phone: data.phone, role: data.role })
  )
}

export function clearAuth() {
  localStorage.removeItem(TOKEN)
  localStorage.removeItem(REFRESH)
  localStorage.removeItem(SESSION)
}

export const isAuthenticated = () => Boolean(getToken())
export const isAdmin = () => getSession()?.role === 'ADMIN'
