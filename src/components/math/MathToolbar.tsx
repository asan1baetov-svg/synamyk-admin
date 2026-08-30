import { useEffect, useRef, useState } from 'react'
import { Keyboard, Clock, LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MATH_GROUPS, MATH_TEMPLATES } from './toolbar'
import { getRecentFormulas } from '@/lib/latex'

function Popover({
  label,
  icon,
  children,
  wide,
}: {
  label: React.ReactNode
  icon?: React.ReactNode
  children: (close: () => void) => React.ReactNode
  wide?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex h-7 items-center gap-1 rounded border border-border bg-white px-2 text-xs font-medium text-foreground hover:bg-neutral-50',
          open && 'border-primary text-primary'
        )}
      >
        {icon}
        {label}
      </button>
      {open && (
        <div
          className={cn(
            'absolute left-0 top-8 z-30 rounded-md border border-border bg-white p-2 shadow-lg',
            wide ? 'w-64' : 'w-auto'
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export function MathToolbar({ onInsert }: { onInsert: (latex: string) => void }) {
  const recent = getRecentFormulas()

  return (
    <div className="flex flex-wrap items-center gap-1">
      {MATH_GROUPS.map(group => (
        <Popover key={group.id} label={group.label}>
          {close => (
            <div className="flex max-w-[240px] flex-wrap gap-1">
              {group.buttons.map(b => (
                <button
                  key={b.latex}
                  type="button"
                  title={b.tooltip}
                  onClick={() => {
                    onInsert(b.latex)
                    close()
                  }}
                  className="min-w-8 rounded border border-border bg-white px-2 py-1 text-sm hover:bg-primary-soft hover:text-primary"
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </Popover>
      ))}

      <Popover label="Шаблоны" icon={<LayoutTemplate size={13} />} wide>
        {close => (
          <div className="flex flex-col gap-0.5">
            {MATH_TEMPLATES.map(t => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  onInsert(t.latex)
                  close()
                }}
                className="rounded px-2 py-1.5 text-left text-xs hover:bg-neutral-100"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </Popover>

      {recent.length > 0 && (
        <Popover label="Недавние" icon={<Clock size={13} />} wide>
          {close => (
            <div className="flex flex-col gap-0.5">
              {recent.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onInsert(r)
                    close()
                  }}
                  className="truncate rounded px-2 py-1.5 text-left font-mono text-[11px] hover:bg-neutral-100"
                  title={r}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </Popover>
      )}

      <button
        type="button"
        title="Виртуальная клавиатура"
        onClick={() => {
          const vk = window.mathVirtualKeyboard
          if (!vk) return
          if (vk.visible) vk.hide()
          else vk.show()
        }}
        className="flex h-7 items-center rounded border border-border bg-white px-2 text-foreground hover:bg-neutral-50"
      >
        <Keyboard size={14} />
      </button>
    </div>
  )
}
