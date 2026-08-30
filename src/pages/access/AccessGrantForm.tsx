import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown, X } from 'lucide-react'
import {
  useGrantAccessMutation,
  useListTestsQuery,
  useListUsersQuery,
  useGetTestQuery,
  useUpdateTestScheduleMutation,
  useUpdateSubTestScheduleMutation,
} from '@/services'
import type { AccessGrantPayload, SchedulePayload } from '@/types/api'
import { extractErrorMessage } from '@/lib/errors'
import { useDebounce } from '@/hooks/useDebounce'
import { Button, Input, Field, Select, SegmentedControl } from '@/components/ui'
import { FreeWindowEditor } from '@/components/common'
import { formatPhone, formatMoney } from '@/lib/format'
import { toServerDateTime } from '@/lib/datetime'
import { cn } from '@/lib/utils'

type Preset = '1' | '7' | '30' | '90' | 'permanent' | 'custom'
type Scope = 'test' | 'subtest'
type Audience = 'user' | 'all'

/* ── searchable user dropdown ─────────────────────────────────── */
function UserSelect({
  value,
  label,
  onChange,
}: {
  value?: number
  label: string
  onChange: (id: number | undefined, label: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const debounced = useDebounce(q, 250)
  const ref = useRef<HTMLDivElement>(null)
  const { data, isFetching } = useListUsersQuery(
    { search: debounced || undefined, size: 20 },
    { skip: !open }
  )

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
          'flex h-9 w-full items-center justify-between rounded-md border border-border-input bg-white px-3 text-sm',
          value ? 'text-foreground' : 'text-neutral-400'
        )}
      >
        <span className="truncate">{value ? label : 'Выберите пользователя'}</span>
        <span className="flex items-center gap-1">
          {value && (
            <X
              size={14}
              className="text-muted-foreground hover:text-foreground"
              onClick={e => {
                e.stopPropagation()
                onChange(undefined, '')
              }}
            />
          )}
          <ChevronDown size={14} className="text-muted-foreground" />
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-white shadow-lg">
          <div className="p-2">
            <Input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Имя или телефон…"
            />
          </div>
          <div className="max-h-56 overflow-y-auto pb-1">
            {isFetching && <p className="px-3 py-2 text-xs text-muted-foreground">Загрузка…</p>}
            {data?.content.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onChange(u.id, `${u.fullName} · ${formatPhone(u.phone)}`)
                  setOpen(false)
                }}
                className={cn(
                  'block w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-100',
                  u.id === value && 'bg-primary-soft text-primary'
                )}
              >
                {u.fullName}
                <span className="ml-2 text-xs text-muted-foreground">{formatPhone(u.phone)}</span>
              </button>
            ))}
            {data && data.content.length === 0 && !isFetching && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Не найдено</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── main form ───────────────────────────────────────────────── */
export function AccessGrantForm({
  presetUserId,
  presetUserLabel,
  presetTestId,
  onGranted,
}: {
  presetUserId?: number
  presetUserLabel?: string
  presetTestId?: number
  onGranted?: () => void
}) {
  const [audience, setAudience] = useState<Audience>('user')
  const [userId, setUserId] = useState<number | undefined>(presetUserId)
  const [userLabel, setUserLabel] = useState(presetUserLabel ?? '')
  const [scope, setScope] = useState<Scope>('test')
  const [testId, setTestId] = useState<number | undefined>(presetTestId)
  const [subTestId, setSubTestId] = useState<number | undefined>()
  const [preset, setPreset] = useState<Preset>('30')
  const [customDate, setCustomDate] = useState('')

  const { data: tests } = useListTestsQuery({ size: 200, active: true })
  const { data: testDetail } = useGetTestQuery(testId!, { skip: !testId })

  const [grantAccess, { isLoading }] = useGrantAccessMutation()
  const [updateTestSchedule, { isLoading: savingTestWin }] = useUpdateTestScheduleMutation()
  const [updateSubTestSchedule, { isLoading: savingSubWin }] = useUpdateSubTestScheduleMutation()

  const testOptions = useMemo(() => tests?.content ?? [], [tests])
  const pickedSub = testDetail?.subTests.find(s => s.id === subTestId)

  const submit = async () => {
    if (!userId) {
      toast.error('Выберите пользователя')
      return
    }
    if (scope === 'test' && !testId) return toast.error('Выберите тест')
    if (scope === 'subtest' && !subTestId) return toast.error('Выберите подтест')

    const body: AccessGrantPayload = scope === 'test' ? { userId, testId } : { userId, subTestId }

    if (preset === 'custom') {
      if (!customDate) return toast.error('Укажите дату')
      body.expiresAt = toServerDateTime(new Date(`${customDate}T23:59:59`))
    } else if (preset !== 'permanent') {
      body.durationDays = Number(preset)
    }
    try {
      await grantAccess(body).unwrap()
      toast.success('Доступ выдан')
      onGranted?.()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const saveWindow = async (win: SchedulePayload) => {
    try {
      if (scope === 'test') {
        if (!testId) {
          toast.error('Выберите тест')
          return
        }
        await updateTestSchedule({ id: testId, body: win }).unwrap()
      } else {
        if (!subTestId || !testId) {
          toast.error('Выберите подтест')
          return
        }
        await updateSubTestSchedule({ subTestId, testId, body: win }).unwrap()
      }
      toast.success('Бесплатный период сохранён')
      onGranted?.()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const targetSelectors = (
    <>
      <Field label="Тип доступа">
        <SegmentedControl<Scope>
          options={[
            { value: 'test', label: 'Весь тест' },
            { value: 'subtest', label: 'Подтест' },
          ]}
          value={scope}
          onChange={v => {
            setScope(v)
            setSubTestId(undefined)
          }}
        />
      </Field>

      <Field label="Тест">
        <Select
          value={testId ?? ''}
          onChange={e => {
            setTestId(Number(e.target.value) || undefined)
            setSubTestId(undefined)
          }}
          disabled={Boolean(presetTestId)}
        >
          <option value="">— выберите тест —</option>
          {testOptions.map(t => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </Select>
      </Field>

      {scope === 'subtest' && (
        <Field label="Подтест">
          <Select
            value={subTestId ?? ''}
            onChange={e => setSubTestId(Number(e.target.value) || undefined)}
            disabled={!testId}
          >
            <option value="">— выберите подтест —</option>
            {testDetail?.subTests.map(s => (
              <option key={s.id} value={s.id}>
                {s.title}
                {s.isPaid ? ` · ${formatMoney(s.price)}` : ' · бесплатный'}
              </option>
            ))}
          </Select>
        </Field>
      )}
    </>
  )

  return (
    <div className="space-y-4">
      {!presetUserId && (
        <Field label="Кому">
          <SegmentedControl<Audience>
            options={[
              { value: 'user', label: 'Пользователю' },
              { value: 'all', label: 'Всем (на период)' },
            ]}
            value={audience}
            onChange={setAudience}
          />
        </Field>
      )}

      {audience === 'user' ? (
        <>
          {presetUserId ? (
            <Field label="Пользователь">
              <Input value={userLabel || `ID ${presetUserId}`} disabled />
            </Field>
          ) : (
            <Field label="Пользователь">
              <UserSelect
                value={userId}
                label={userLabel}
                onChange={(id, lbl) => {
                  setUserId(id)
                  setUserLabel(lbl)
                }}
              />
            </Field>
          )}

          {targetSelectors}

          <Field label="Срок доступа">
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ['1', '1 день'],
                  ['7', '7 дней'],
                  ['30', '30 дней'],
                  ['90', '90 дней'],
                  ['permanent', 'Бессрочно'],
                  ['custom', 'Своя дата'],
                ] as [Preset, string][]
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPreset(v)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    preset === v
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {preset === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="mt-2 h-9 rounded-md border border-border-input px-2 text-sm"
              />
            )}
          </Field>

          <Button onClick={submit} loading={isLoading}>
            Выдать доступ
          </Button>
        </>
      ) : (
        <>
          <div className="rounded-md bg-info-soft px-3 py-2 text-xs text-info">
            «Всем» = бесплатный период. Тест/подтест станет бесплатным для всех пользователей
            (включая будущих), пока текущее время внутри окна. Индивидуальные строки доступа не
            создаются.
          </div>

          {targetSelectors}

          <Field label="Бесплатный период">
            <FreeWindowEditor
              freeFrom={scope === 'test' ? testDetail?.freeFrom : pickedSub?.freeFrom}
              freeUntil={scope === 'test' ? testDetail?.freeUntil : pickedSub?.freeUntil}
              saving={savingTestWin || savingSubWin}
              onSave={saveWindow}
            />
          </Field>
        </>
      )}
    </div>
  )
}
