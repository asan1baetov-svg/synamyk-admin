const nf = new Intl.NumberFormat('ru-RU')

export const formatNumber = (n?: number | null): string => (n == null ? '—' : nf.format(n))

/** Money in KGS (сом). Backend amounts are plain decimals. */
export const formatMoney = (n?: number | null): string => (n == null ? '—' : `${nf.format(n)} сом`)

export const formatPercent = (n?: number | null): string => (n == null ? '—' : `${Math.round(n)}%`)

/** Phone "996700123456" -> "+996 700 123 456" */
export const formatPhone = (phone?: string | null): string => {
  if (!phone) return '—'
  const d = phone.replace(/\D/g, '')
  if (d.length !== 12) return phone
  return `+${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`
}

/** "996 (700) 12-34-56" mask -> "996700123456" */
export const stripPhone = (masked: string): string =>
  masked.replace(/\D/g, '').replace(/^0+/, '').slice(0, 12)

export const initials = (name?: string | null): string => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}
