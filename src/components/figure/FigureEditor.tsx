import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Braces, MousePointerClick, Plus, Trash2, X } from 'lucide-react'
import type { Figure, FigureElement, FigureElementKind, FigurePoint } from '@/types/api'
import {
  KIND_LABELS,
  KIND_ORDER,
  defaultElement,
  defaultFigure,
  isNum,
  validateFigure,
} from '@/lib/figure'
import { Button, SegmentedControl } from '@/components/ui'
import { cn } from '@/lib/utils'
import { FigureView } from './FigureView'

/* ─────────────── small inputs ─────────────── */

const inputCls =
  'h-8 rounded-md border border-border-input bg-white px-2 text-sm outline-none focus:border-primary'

/** Number input that keeps the raw text while typing ("-", "1.", "") and commits valid numbers. */
function NumInput({
  value,
  onChange,
  placeholder,
  className,
  optional,
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder?: string
  className?: string
  optional?: boolean
}) {
  const [text, setText] = useState(value == null ? '' : String(value))
  useEffect(() => {
    // sync external changes (click-to-add, JSON import) unless it's the same number
    setText(prev =>
      Number(prev.replace(',', '.')) === value && prev !== ''
        ? prev
        : value == null
          ? ''
          : String(value)
    )
  }, [value])
  return (
    <input
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      onChange={e => {
        const t = e.target.value
        setText(t)
        if (t.trim() === '') {
          if (optional) onChange(undefined)
          return
        }
        const n = Number(t.replace(',', '.'))
        if (Number.isFinite(n)) onChange(n)
      }}
      className={cn(inputCls, 'w-16', className)}
    />
  )
}

function PointInput({
  label,
  value,
  onChange,
}: {
  label?: string
  value: FigurePoint | undefined
  onChange: (p: FigurePoint) => void
}) {
  const [x, y] = value ?? [0, 0]
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {label && <span className="w-12 shrink-0">{label}</span>}(
      <NumInput value={x} onChange={v => onChange([v ?? 0, y])} className="w-14" />
      ;
      <NumInput value={y} onChange={v => onChange([x, v ?? 0])} className="w-14" />)
    </span>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string | undefined
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <input
      value={value ?? ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className={cn(inputCls, className)}
    />
  )
}

/** Color swatch + text; accepts #RRGGBB / #AARRGGBB. */
function ColorInput({
  value,
  onChange,
  placeholder = '#RRGGBB',
}: {
  value: string | undefined
  onChange: (v: string | undefined) => void
  placeholder?: string
}) {
  const rgb =
    value && /^#[0-9a-fA-F]{6}$/.test(value)
      ? value
      : value?.length === 9
        ? `#${value.slice(3)}`
        : '#000000'
  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="color"
        value={rgb}
        onChange={e => {
          // keep alpha if the value had one
          const alpha = value?.length === 9 ? value.slice(1, 3) : ''
          onChange(alpha ? `#${alpha}${e.target.value.slice(1)}` : e.target.value)
        }}
        className="h-8 w-8 cursor-pointer rounded border border-border-input bg-white p-0.5"
      />
      <input
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value || undefined)}
        className={cn(inputCls, 'w-24 font-mono text-xs')}
      />
    </span>
  )
}

/* ─────────────── element editor ─────────────── */

function ElementFields({
  el,
  set,
}: {
  el: FigureElement
  set: (patch: Partial<FigureElement>) => void
}) {
  switch (el.kind) {
    case 'POINT':
    case 'TEXT':
      return (
        <div className="flex flex-wrap items-center gap-2">
          <PointInput
            label="Коорд."
            value={[el.x ?? 0, el.y ?? 0]}
            onChange={([x, y]) => set({ x, y })}
          />
          {el.kind === 'TEXT' && (
            <TextInput
              value={el.text}
              onChange={text => set({ text })}
              placeholder="Текст"
              className="w-40"
            />
          )}
        </div>
      )
    case 'SEGMENT':
    case 'LINE':
    case 'RAY':
    case 'VECTOR':
      return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <PointInput
            label={el.kind === 'VECTOR' ? 'Начало' : 'Точка 1'}
            value={el.from}
            onChange={from => set({ from })}
          />
          <PointInput
            label={el.kind === 'VECTOR' ? 'Конец' : 'Точка 2'}
            value={el.to}
            onChange={to => set({ to })}
          />
        </div>
      )
    case 'POLYGON':
    case 'POLYLINE': {
      const pts = el.points ?? []
      const labels = el.labels ?? []
      return (
        <div className="space-y-1">
          {pts.map((p, j) => (
            <div key={j} className="flex items-center gap-2">
              <PointInput
                label={`${j + 1}.`}
                value={p}
                onChange={np => set({ points: pts.map((q, k) => (k === j ? np : q)) })}
              />
              {el.kind === 'POLYGON' && (
                <TextInput
                  value={labels[j]}
                  placeholder="метка"
                  className="w-16"
                  onChange={l => {
                    const next = pts.map((_, k) => labels[k] ?? '')
                    next[j] = l
                    set({ labels: next })
                  }}
                />
              )}
              <button
                type="button"
                disabled={pts.length <= 2}
                onClick={() =>
                  set({
                    points: pts.filter((_, k) => k !== j),
                    labels: el.labels?.filter((_, k) => k !== j),
                  })
                }
                className="text-muted-foreground hover:text-error disabled:opacity-30"
                aria-label="Удалить точку"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const last = pts[pts.length - 1] ?? [0, 0]
              set({ points: [...pts, [last[0] + 1, last[1]]] })
            }}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus size={12} /> точка
          </button>
        </div>
      )
    }
    case 'CIRCLE':
    case 'ARC':
      return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <PointInput label="Центр" value={el.center} onChange={center => set({ center })} />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            R <NumInput value={el.radius} onChange={radius => set({ radius })} />
          </span>
          {el.kind === 'ARC' && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              от <NumInput value={el.startAngle} onChange={startAngle => set({ startAngle })} />° до{' '}
              <NumInput value={el.endAngle} onChange={endAngle => set({ endAngle })} />°
            </span>
          )}
        </div>
      )
    case 'ANGLE':
      return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <PointInput label="Вершина" value={el.vertex} onChange={vertex => set({ vertex })} />
          <PointInput label="Луч 1" value={el.from} onChange={from => set({ from })} />
          <PointInput label="Луч 2" value={el.to} onChange={to => set({ to })} />
          <label className="inline-flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={Boolean(el.right)}
              onChange={e => set({ right: e.target.checked })}
            />
            прямой
          </label>
        </div>
      )
    case 'FUNCTION':
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">y =</span>
          <TextInput
            value={el.expression}
            onChange={expression => set({ expression })}
            placeholder="x^2 - 2*x + 1"
            className="w-52 font-mono"
          />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            x от{' '}
            <NumInput
              optional
              value={el.xFrom}
              onChange={xFrom => set({ xFrom })}
              placeholder="мин"
            />
            до{' '}
            <NumInput optional value={el.xTo} onChange={xTo => set({ xTo })} placeholder="макс" />
          </span>
        </div>
      )
  }
}

/* ─────────────── main editor ─────────────── */

interface Props {
  value: Figure | null
  onChange: (f: Figure | null) => void
}

export function FigureEditor({ value, onChange }: Props) {
  const [jsonOpen, setJsonOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [pointMode, setPointMode] = useState(false)

  if (!value) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border p-3">
        <span className="text-sm text-muted-foreground">Чертежа нет.</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onChange(defaultFigure('COORDINATE_PLANE'))}
        >
          <Plus size={14} /> Координатная плоскость
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onChange(defaultFigure('GEOMETRY'))}>
          <Plus size={14} /> Геометрия
        </Button>
      </div>
    )
  }

  const f = value
  const errors = validateFigure(f)
  const isPlane = f.type === 'COORDINATE_PLANE'
  const set = (patch: Partial<Figure>) => onChange({ ...f, ...patch })
  const setEl = (i: number, patch: Partial<FigureElement>) =>
    set({ elements: f.elements.map((el, j) => (j === i ? { ...el, ...patch } : el)) })
  const moveEl = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= f.elements.length) return
    const next = [...f.elements]
    ;[next[i], next[j]] = [next[j], next[i]]
    set({ elements: next })
  }
  const addEl = (kind: FigureElementKind) =>
    set({ elements: [...f.elements, defaultElement(kind)] })

  const snap = (n: number) => {
    const s = (isPlane && isNum(f.gridStep) && f.gridStep > 0 ? f.gridStep : 1) / 2
    return Math.round(Math.round(n / s) * s * 1000) / 1000
  }
  const nextPointLabel = () => {
    const used = new Set(f.elements.filter(e => e.kind === 'POINT').map(e => e.label))
    for (const c of 'ABCDEFGHKLMNOPQRSTUVWXYZ') if (!used.has(c)) return c
    return ''
  }

  const openJson = () => {
    setJsonText(JSON.stringify(f, null, 2))
    setJsonError(null)
    setJsonOpen(true)
  }
  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText) as Figure
      if (!parsed || typeof parsed !== 'object') throw new Error('Ожидается объект')
      if (!Array.isArray(parsed.elements)) parsed.elements = []
      const errs = validateFigure(parsed)
      if (errs.length) throw new Error(errs[0])
      onChange(parsed)
      setJsonOpen(false)
    } catch (e) {
      setJsonError((e as Error).message)
    }
  }

  return (
    <div className="@container space-y-3 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl<Figure['type']>
          options={[
            { value: 'COORDINATE_PLANE', label: 'Координатная плоскость' },
            { value: 'GEOMETRY', label: 'Геометрия' },
          ]}
          value={f.type}
          onChange={type =>
            type === f.type
              ? undefined
              : onChange(
                  type === 'GEOMETRY'
                    ? { type, elements: f.elements }
                    : { ...defaultFigure('COORDINATE_PLANE'), elements: f.elements }
                )
          }
        />
        <span className="flex-1" />
        <Button size="sm" variant="ghost" onClick={openJson}>
          <Braces size={14} /> JSON
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
          <Trash2 size={14} /> Убрать чертёж
        </Button>
      </div>

      <div className="grid gap-4 @3xl:grid-cols-2">
        {/* form */}
        <div className="min-w-0 space-y-3">
          {isPlane && (
            <div className="space-y-2 rounded-md bg-neutral-50 p-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  x: <NumInput value={f.xMin} onChange={xMin => set({ xMin })} /> …{' '}
                  <NumInput value={f.xMax} onChange={xMax => set({ xMax })} />
                </span>
                <span className="inline-flex items-center gap-1">
                  y: <NumInput value={f.yMin} onChange={yMin => set({ yMin })} /> …{' '}
                  <NumInput value={f.yMax} onChange={yMax => set({ yMax })} />
                </span>
                <span className="inline-flex items-center gap-1">
                  шаг:{' '}
                  <NumInput optional value={f.gridStep} onChange={gridStep => set({ gridStep })} />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={f.showGrid !== false}
                    onChange={e => set({ showGrid: e.target.checked })}
                  />
                  сетка
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={f.showAxes !== false}
                    onChange={e => set({ showAxes: e.target.checked })}
                  />
                  оси
                </label>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  подписи осей:
                  <TextInput
                    value={f.xLabel}
                    onChange={xLabel => set({ xLabel })}
                    className="w-12"
                  />
                  <TextInput
                    value={f.yLabel}
                    onChange={yLabel => set({ yLabel })}
                    className="w-12"
                  />
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {KIND_ORDER.map(k => (
              <button
                key={k}
                type="button"
                onClick={() => addEl(k)}
                className="inline-flex items-center gap-0.5 rounded border border-border px-2 py-0.5 text-xs hover:border-primary hover:text-primary"
              >
                <Plus size={11} /> {KIND_LABELS[k]}
              </button>
            ))}
          </div>

          {f.elements.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Добавьте элементы кнопками выше или кликом по превью.
            </p>
          )}

          <div className="space-y-2">
            {f.elements.map((el, i) => (
              <div key={i} className="space-y-2 rounded-md border border-border p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">
                    {i + 1}. {KIND_LABELS[el.kind] ?? el.kind}
                  </span>
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={() => moveEl(i, -1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Вверх"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveEl(i, 1)}
                    disabled={i === f.elements.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Вниз"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => set({ elements: f.elements.filter((_, j) => j !== i) })}
                    className="text-muted-foreground hover:text-error"
                    aria-label="Удалить элемент"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <ElementFields el={el} set={patch => setEl(i, patch)} />
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
                  {el.kind !== 'TEXT' && (
                    <TextInput
                      value={el.label}
                      onChange={label => setEl(i, { label })}
                      placeholder="подпись"
                      className="w-20"
                    />
                  )}
                  <span className="inline-flex items-center gap-1">
                    цвет <ColorInput value={el.color} onChange={color => setEl(i, { color })} />
                  </span>
                  {(el.kind === 'POLYGON' || el.kind === 'CIRCLE') && (
                    <span className="inline-flex items-center gap-1">
                      заливка{' '}
                      <ColorInput
                        value={el.fill}
                        onChange={fill => setEl(i, { fill })}
                        placeholder="#AARRGGBB"
                      />
                    </span>
                  )}
                  {el.kind !== 'POINT' && el.kind !== 'TEXT' && (
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={Boolean(el.dashed)}
                        onChange={e => setEl(i, { dashed: e.target.checked })}
                      />
                      пунктир
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* preview */}
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase text-muted-foreground">Превью</span>
            <button
              type="button"
              onClick={() => setPointMode(m => !m)}
              className={cn(
                'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs',
                pointMode
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-border text-muted-foreground'
              )}
            >
              <MousePointerClick size={12} /> Режим «Точка»
            </button>
          </div>
          <div className="rounded-md border border-border bg-white p-2">
            <FigureView
              figure={f}
              crosshair={pointMode}
              onCanvasClick={
                pointMode
                  ? ([x, y]) =>
                      set({
                        elements: [
                          ...f.elements,
                          { kind: 'POINT', x: snap(x), y: snap(y), label: nextPointLabel() },
                        ],
                      })
                  : undefined
              }
            />
          </div>
          {pointMode && (
            <p className="text-xs text-muted-foreground">
              Клик по превью добавляет точку (координаты округляются до половины шага сетки).
            </p>
          )}
          {errors.length > 0 && (
            <ul className="space-y-0.5 rounded-md bg-error-soft p-2 text-xs text-error">
              {errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {jsonOpen && (
        <div className="space-y-2 rounded-md border border-border bg-neutral-50 p-2">
          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            rows={12}
            spellCheck={false}
            className="w-full rounded-md border border-border-input bg-white p-2 font-mono text-xs outline-none focus:border-primary"
          />
          {jsonError && <p className="text-xs text-error">{jsonError}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={applyJson}>
              Применить
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void navigator.clipboard?.writeText(jsonText)}
            >
              Копировать
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setJsonOpen(false)}>
              Закрыть
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
