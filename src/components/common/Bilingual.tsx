import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Lang = 'ru' | 'ky'

const LangCtx = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
} | null>(null)

/** Wrap a form so every BilingualField switches RU/KY together. */
export function BilingualProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ru')
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>
}

export function useBilingual(local?: { lang: Lang; setLang: (l: Lang) => void }) {
  const ctx = useContext(LangCtx)
  return ctx ?? local!
}

export function LangTabs({ kyFilled, className }: { kyFilled?: boolean; className?: string }) {
  const ctx = useContext(LangCtx)
  if (!ctx) return null
  return (
    <div
      className={cn('inline-flex rounded-md border border-border bg-neutral-50 p-0.5', className)}
    >
      {(['ru', 'ky'] as Lang[]).map(l => (
        <button
          key={l}
          type="button"
          onClick={() => ctx.setLang(l)}
          className={cn(
            'flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium transition-colors',
            ctx.lang === l
              ? 'bg-white text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {l === 'ru' ? 'RU' : 'KY'}
          {l === 'ky' && (
            <span
              className={cn('h-1.5 w-1.5 rounded-full', kyFilled ? 'bg-success' : 'bg-neutral-300')}
            />
          )}
        </button>
      ))}
    </div>
  )
}

interface BilingualFieldProps {
  label?: string
  required?: boolean
  ru: string
  ky: string
  onRu: (v: string) => void
  onKy: (v: string) => void
  error?: string
  /** Render the actual input for the currently active language. */
  children: (props: { lang: Lang; value: string; onChange: (v: string) => void }) => ReactNode
  /** Local tab state when no BilingualProvider is present. */
  standalone?: boolean
}

export function BilingualField({
  label,
  required,
  ru,
  ky,
  onRu,
  onKy,
  error,
  children,
  standalone,
}: BilingualFieldProps) {
  const [localLang, setLocalLang] = useState<Lang>('ru')
  const ctx = useContext(LangCtx)
  const lang = standalone || !ctx ? localLang : ctx.lang
  const setLang = standalone || !ctx ? setLocalLang : ctx.setLang

  const value = lang === 'ru' ? ru : ky
  const onChange = lang === 'ru' ? onRu : onKy

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="ml-0.5 text-error">*</span>}
          </label>
        )}
        {(standalone || !ctx) && (
          <div className="inline-flex rounded-md border border-border bg-neutral-50 p-0.5">
            {(['ru', 'ky'] as Lang[]).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  'flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors',
                  lang === l
                    ? 'bg-white text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {l === 'ru' ? 'RU' : 'KY'}
                {l === 'ky' && (
                  <span
                    className={cn('h-1.5 w-1.5 rounded-full', ky ? 'bg-success' : 'bg-neutral-300')}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {children({ lang, value, onChange })}
      {lang === 'ky' && (
        <p className="text-xs text-muted-foreground">
          Если не заполнить, пользователю покажется русский текст.
        </p>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
