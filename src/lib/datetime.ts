import { format, formatDistanceToNowStrict } from 'date-fns'
import { ru } from 'date-fns/locale'
import { SERVER_TZ_OFFSET } from './config'

/**
 * Server sends LocalDateTime without zone: "2026-08-27T16:05:11.482".
 * It represents Asia/Bishkek (UTC+6). Parse it explicitly as such so the
 * displayed time is correct regardless of the admin's browser timezone.
 */
export const parseServerDate = (s: string): Date =>
  new Date(s.includes('+') || s.endsWith('Z') ? s : `${s}${SERVER_TZ_OFFSET}`)

export const formatDT = (s?: string | null): string =>
  s ? format(parseServerDate(s), 'dd.MM.yyyy HH:mm') : '—'

export const formatDate = (s?: string | null): string =>
  s ? format(parseServerDate(s), 'dd.MM.yyyy') : '—'

export const formatRelative = (s?: string | null): string =>
  s ? formatDistanceToNowStrict(parseServerDate(s), { addSuffix: true, locale: ru }) : '—'

/** For sending back to the server: no zone suffix. "2026-09-01T10:00:00" */
export const toServerDateTime = (d: Date): string => format(d, "yyyy-MM-dd'T'HH:mm:ss")

/** Filter params dateFrom / dateTo — date only. */
export const toServerDate = (d: Date): string => format(d, 'yyyy-MM-dd')

/** Seconds -> "mm:ss" for countdowns. */
export const formatDuration = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${String(rem).padStart(2, '0')}`
}
