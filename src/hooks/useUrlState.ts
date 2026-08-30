import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Read/write a single query-string param. Keeps filter + pagination state in the
 * URL so links are shareable and reload doesn't reset the view.
 */
export function useUrlParam(key: string, fallback = '') {
  const [params, setParams] = useSearchParams()
  const value = params.get(key) ?? fallback

  const setValue = useCallback(
    (next: string | number | null) => {
      setParams(
        prev => {
          const p = new URLSearchParams(prev)
          if (next === null || next === '' || next === undefined) p.delete(key)
          else p.set(key, String(next))
          // reset page when a non-page filter changes
          if (key !== 'page') p.delete('page')
          return p
        },
        { replace: true }
      )
    },
    [key, setParams]
  )

  return [value, setValue] as const
}

export function useUrlNumber(key: string, fallback = 0) {
  const [raw, setRaw] = useUrlParam(key, String(fallback))
  const n = Number.parseInt(raw, 10)
  return [Number.isNaN(n) ? fallback : n, setRaw] as const
}
