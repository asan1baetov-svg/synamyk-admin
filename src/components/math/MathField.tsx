import { useEffect, useMemo, useRef, useState } from 'react'
import { FunctionSquare, ChevronDown } from 'lucide-react'
import { Dialog, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { parseSegments, validateLatex, pushRecentFormula } from '@/lib/latex'
import { MathText } from './MathText'
import { MathToolbar } from './MathToolbar'
import { MathLiveInput, type MathLiveHandle } from './MathLiveInput'

export type MathMode = 'text+math' | 'math'

interface MathFieldProps {
  value: string
  onChange: (v: string) => void
  /** localStorage key suffix for remembering the chosen mode per field type */
  fieldType: string
  defaultMode?: MathMode
  placeholder?: string
  error?: string
  rows?: number
  id?: string
}

const modeKey = (t: string) => `math:mode:${t}`
const toolbarKey = (t: string) => `math:toolbar:${t}`

/** Pull the inner LaTeX out of a `$...$` / `$$...$$` wrapped string. */
function toInnerLatex(value: string): string {
  const segs = parseSegments(value)
  if (segs.length === 1 && segs[0].type !== 'text') return segs[0].value
  return value.replace(/^\$\$?|\$\$?$/g, '')
}

export function MathField({
  value,
  onChange,
  fieldType,
  defaultMode = 'text+math',
  placeholder,
  error,
  rows = 3,
  id,
}: MathFieldProps) {
  const [mode, setMode] = useState<MathMode>(() => {
    try {
      const saved = localStorage.getItem(modeKey(fieldType))
      if (saved === 'math' || saved === 'text+math') return saved
    } catch {
      /* ignore */
    }
    return defaultMode
  })

  useEffect(() => {
    try {
      localStorage.setItem(modeKey(fieldType), mode)
    } catch {
      /* ignore */
    }
  }, [mode, fieldType])

  // Formula toolbar is collapsed by default — it's noisy stacked across many fields.
  const [toolbarOpen, setToolbarOpen] = useState(() => {
    try {
      return localStorage.getItem(toolbarKey(fieldType)) === '1'
    } catch {
      return false
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(toolbarKey(fieldType), toolbarOpen ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [toolbarOpen, fieldType])

  const debounced = useDebounce(value, 150)
  const latexErrors = useMemo(() => validateLatex(debounced), [debounced])

  /* ---------- math mode ---------- */
  const mathRef = useRef<MathLiveHandle>(null)
  const inner = mode === 'math' ? toInnerLatex(value) : ''

  /* ---------- text mode ---------- */
  const taRef = useRef<HTMLTextAreaElement>(null)
  const caretRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLatex, setModalLatex] = useState('')
  const modalFieldRef = useRef<MathLiveHandle>(null)

  const rememberCaret = () => {
    const ta = taRef.current
    if (ta) caretRef.current = { start: ta.selectionStart, end: ta.selectionEnd }
  }

  const insertFormulaIntoText = (latex: string) => {
    const clean = latex.trim()
    if (!clean) {
      setModalOpen(false)
      return
    }
    const wrapped = `$${clean}$`
    const { start, end } = caretRef.current
    const next = value.slice(0, start) + wrapped + value.slice(end)
    onChange(next)
    pushRecentFormula(clean)
    setModalOpen(false)
    setModalLatex('')
    requestAnimationFrame(() => {
      const ta = taRef.current
      if (ta) {
        const pos = start + wrapped.length
        ta.focus()
        ta.setSelectionRange(pos, pos)
      }
    })
  }

  const handleToolbarInsert = (latex: string) => {
    if (mode === 'math') {
      mathRef.current?.insert(latex)
      return
    }
    if (!modalOpen) {
      rememberCaret()
      setModalLatex('')
      setModalOpen(true)
      requestAnimationFrame(() => modalFieldRef.current?.insert(latex))
    } else {
      modalFieldRef.current?.insert(latex)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setToolbarOpen(o => !o)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
            toolbarOpen
              ? 'border-primary bg-primary-soft text-primary'
              : 'border-border bg-white text-muted-foreground hover:text-foreground'
          )}
        >
          <FunctionSquare size={13} />
          Формулы
          <ChevronDown
            size={13}
            className={cn('transition-transform', toolbarOpen && 'rotate-180')}
          />
        </button>

        <div className="inline-flex rounded-md border border-border bg-neutral-50 p-0.5 text-xs">
          {(
            [
              ['text+math', 'Текст + формулы'],
              ['math', 'Формула'],
            ] as [MathMode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'flex items-center gap-1 rounded px-2 py-1 font-medium transition-colors',
                mode === m
                  ? 'bg-white text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FunctionSquare size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {toolbarOpen && (
        <div className="rounded-md border border-border bg-neutral-50/60 p-2">
          <MathToolbar onInsert={handleToolbarInsert} />
        </div>
      )}

      {mode === 'math' ? (
        <MathLiveInput
          ref={mathRef}
          value={inner}
          ariaLabel="Формула"
          onChange={latex => onChange(latex ? `$${latex}$` : '')}
        />
      ) : (
        <div className="space-y-1.5">
          <textarea
            id={id}
            ref={taRef}
            value={value}
            rows={rows}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            onSelect={rememberCaret}
            onKeyUp={rememberCaret}
            onClick={rememberCaret}
            className="w-full rounded-md border border-border-input bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              rememberCaret()
              setModalLatex('')
              setModalOpen(true)
            }}
          >
            <FunctionSquare size={14} /> Вставить формулу
          </Button>
        </div>
      )}

      {/* live preview */}
      <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm">
        <span className="mr-2 text-xs font-medium uppercase text-muted-foreground">
          Предпросмотр:
        </span>
        <MathText value={value || ''} />
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
      {latexErrors.length > 0 && (
        <ul className="space-y-0.5 text-xs text-error">
          {latexErrors.map((e, i) => (
            <li key={i}>
              Ошибка в формуле <code className="font-mono">{e.fragment}</code>:{' '}
              {e.message.replace(/^KaTeX parse error:\s*/, '')}
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Формула"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => insertFormulaIntoText(modalLatex)}>Вставить</Button>
          </>
        }
      >
        <div className="space-y-3">
          <MathToolbar onInsert={latex => modalFieldRef.current?.insert(latex)} />
          <MathLiveInput
            ref={modalFieldRef}
            value={modalLatex}
            autoFocus
            ariaLabel="Ввод формулы"
            onChange={setModalLatex}
            onEnter={() => insertFormulaIntoText(modalLatex)}
          />
          <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm">
            <span className="mr-2 text-xs font-medium uppercase text-muted-foreground">
              Предпросмотр:
            </span>
            <MathText value={modalLatex ? `$${modalLatex}$` : ''} />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
