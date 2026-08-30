/**
 * The backend returns three shapes of errors:
 *  1. Business error (AppException / RuntimeException) — HTTP 400:
 *       { "success": false, "message": "Тест не найден." }
 *  2. Validation error (@Valid) — HTTP 400, flat object field -> message:
 *       { "title": "must not be blank", "options": "size must be between 2 and 6" }
 *  3. Auth — HTTP 401 / 403, body may be empty.
 */

export interface FieldErrors {
  [field: string]: string
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Extract the RTK Query error payload regardless of wrapper shape. */
export function getErrorData(error: unknown): unknown {
  if (!error) return undefined
  if (isPlainObject(error) && 'data' in error) return (error as { data: unknown }).data
  return error
}

export function getErrorStatus(error: unknown): number | string | undefined {
  if (isPlainObject(error) && 'status' in error) {
    const s = (error as { status: unknown }).status
    if (typeof s === 'number' || typeof s === 'string') return s
  }
  return undefined
}

/**
 * Returns a flat { field: message } map when the error is a validation error
 * (shape 2), otherwise null. Use to route messages into form fields.
 */
export function extractFieldErrors(error: unknown): FieldErrors | null {
  const data = getErrorData(error)
  if (!isPlainObject(data)) return null
  if ('message' in data || 'success' in data) return null
  const entries = Object.entries(data).filter(([, v]) => typeof v === 'string') as [
    string,
    string,
  ][]
  if (entries.length === 0) return null
  return Object.fromEntries(entries)
}

export function extractErrorMessage(error: unknown): string {
  const status = getErrorStatus(error)
  const data = getErrorData(error)

  if (isPlainObject(data)) {
    if (typeof data.message === 'string' && data.message) return data.message
    const fieldErrors = extractFieldErrors(error)
    if (fieldErrors) {
      return Object.entries(fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('\n')
    }
  }

  if (typeof data === 'string' && data) return data
  if (status === 401) return 'Требуется авторизация'
  if (status === 403) return 'Недостаточно прав'
  if (status === 'FETCH_ERROR') return 'Нет связи с сервером'
  if (status === 'TIMEOUT_ERROR') return 'Превышено время ожидания ответа'
  return 'Не удалось выполнить запрос'
}
