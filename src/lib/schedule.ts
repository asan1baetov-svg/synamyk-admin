import { parseServerDate, formatDate } from './datetime'

/** Human label for a free-window (freeFrom / freeUntil), Bishkek time. */
export function freeWindowLabel(
  freeFrom?: string | null,
  freeUntil?: string | null
): string | null {
  if (!freeFrom && !freeUntil) return null
  if (freeFrom && freeUntil) return `Бесплатно ${formatDate(freeFrom)} – ${formatDate(freeUntil)}`
  if (freeUntil) return `Бесплатно до ${formatDate(freeUntil)}`
  return `Бесплатно с ${formatDate(freeFrom)}`
}

/** Is the free-window active right now? */
export function isFreeNow(
  freeFrom?: string | null,
  freeUntil?: string | null,
  now: Date = new Date()
): boolean {
  if (!freeFrom && !freeUntil) return false
  const afterStart = !freeFrom || now >= parseServerDate(freeFrom)
  const beforeEnd = !freeUntil || now < parseServerDate(freeUntil)
  return afterStart && beforeEnd
}

/** "2026-09-01T00:00:00" (server, no zone) -> "2026-09-01T00:00" for datetime-local input */
export function toLocalInput(server?: string | null): string {
  if (!server) return ''
  return server.slice(0, 16)
}

/** datetime-local value -> server string with seconds, or null */
export function fromLocalInput(v: string): string | null {
  if (!v) return null
  return v.length === 16 ? `${v}:00` : v
}
