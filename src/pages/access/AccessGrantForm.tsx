import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  useGrantAccessMutation,
  useListTestsQuery,
  useListUsersQuery,
  useGetTestQuery,
} from '@/services'
import type { AccessGrantPayload } from '@/types/api'
import { extractErrorMessage } from '@/lib/errors'
import { useDebounce } from '@/hooks/useDebounce'
import { Button, Input, Field, Select, SegmentedControl } from '@/components/ui'
import { formatPhone, formatMoney } from '@/lib/format'
import { toServerDateTime } from '@/lib/datetime'

type Preset = '1' | '7' | '30' | '90' | 'permanent' | 'custom'
type Scope = 'test' | 'subtest'

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
  const [userQuery, setUserQuery] = useState('')
  const debouncedUser = useDebounce(userQuery, 300)
  const [userId, setUserId] = useState<number | undefined>(presetUserId)
  const [scope, setScope] = useState<Scope>('test')
  const [testId, setTestId] = useState<number | undefined>(presetTestId)
  const [subTestId, setSubTestId] = useState<number | undefined>()
  const [preset, setPreset] = useState<Preset>('30')
  const [customDate, setCustomDate] = useState('')

  const { data: userResults } = useListUsersQuery(
    { search: debouncedUser || undefined, size: 8 },
    { skip: Boolean(presetUserId) || debouncedUser.length < 2 }
  )
  const { data: tests } = useListTestsQuery({ size: 200, active: true })
  const { data: testDetail } = useGetTestQuery(testId!, {
    skip: scope !== 'subtest' || !testId,
  })

  const [grantAccess, { isLoading }] = useGrantAccessMutation()

  const testOptions = useMemo(() => tests?.content ?? [], [tests])

  const submit = async () => {
    if (!userId) {
      toast.error('Выберите пользователя')
      return
    }
    if (scope === 'test' && !testId) {
      toast.error('Выберите тест')
      return
    }
    if (scope === 'subtest' && !subTestId) {
      toast.error('Выберите подтест')
      return
    }

    const body: AccessGrantPayload = scope === 'test' ? { userId, testId } : { userId, subTestId }

    if (preset === 'custom') {
      if (!customDate) {
        toast.error('Укажите дату')
        return
      }
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

  return (
    <div className="space-y-4">
      {presetUserId ? (
        <Field label="Пользователь">
          <Input value={presetUserLabel ?? `ID ${presetUserId}`} disabled />
        </Field>
      ) : (
        <Field label="Пользователь">
          <Input
            value={userQuery}
            onChange={e => {
              setUserQuery(e.target.value)
              setUserId(undefined)
            }}
            placeholder="Поиск по имени или телефону…"
          />
          {userResults && userResults.content.length > 0 && !userId && (
            <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-border">
              {userResults.content.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setUserId(u.id)
                    setUserQuery(`${u.fullName} · ${formatPhone(u.phone)}`)
                  }}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-100"
                >
                  {u.fullName} · {formatPhone(u.phone)}
                </button>
              ))}
            </div>
          )}
        </Field>
      )}

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
    </div>
  )
}
