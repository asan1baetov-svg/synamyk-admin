/** Backend base URL. Override with VITE_API_URL in .env. */
export const API_URL: string =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'https://synamyk-production.up.railway.app'

export const API_ADMIN = `${API_URL}/api/admin`
export const API_AUTH = `${API_URL}/api/auth`
export const API_UPLOAD = `${API_URL}/api/upload`

/** Server timezone — Asia/Bishkek (UTC+6). Dates come without offset. */
export const SERVER_TZ_OFFSET = '+06:00'
