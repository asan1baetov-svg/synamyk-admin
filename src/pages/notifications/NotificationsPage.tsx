import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bell, Send, AlertTriangle } from 'lucide-react'
import {
  useBroadcastMutation,
  useGetBroadcastQuery,
  useListBroadcastsQuery,
  useCancelBroadcastMutation,
  usePushStatusQuery,
  useListTestsQuery,
} from '@/services'
import type { BroadcastAudience, BroadcastDataType, BroadcastPayload } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUrlNumber } from '@/hooks/useUrlState'
import { extractErrorMessage } from '@/lib/errors'
import { toServerDateTime } from '@/lib/datetime'
import { formatDT } from '@/lib/datetime'
import { PageHeader } from '@/components/common'
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Field,
  Select,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui'

const AUDIENCES: { value: BroadcastAudience; label: string }[] = [
  { value: 'ALL', label: 'Все пользователи' },
  { value: 'USER_IDS', label: 'Список ID' },
  { value: 'PLATFORM', label: 'Платформа' },
  { value: 'PURCHASED_TEST', label: 'Купившие тест' },
  { value: 'INACTIVE_DAYS', label: 'Неактивные N дней' },
]

const DATA_TYPES: BroadcastDataType[] = ['NONE', 'TEST', 'SUB_TEST', 'GAME', 'BROADCAST']

export function NotificationsPage() {
  useDocumentTitle('Push-рассылки')
  const { data: status, isLoading: statusLoading } = usePushStatusQuery()
  const { data: tests } = useListTestsQuery({ size: 200 })
  const [page, setPage] = useUrlNumber('page', 0)
  const { data: history } = useListBroadcastsQuery({ page, size: 10 })
  const [broadcast, { isLoading: sending }] = useBroadcastMutation()
  const [cancelBroadcast] = useCancelBroadcastMutation()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [titleKy, setTitleKy] = useState('')
  const [bodyKy, setBodyKy] = useState('')
  const [audience, setAudience] = useState<BroadcastAudience>('ALL')
  const [audienceRef, setAudienceRef] = useState('')
  const [dataType, setDataType] = useState<BroadcastDataType>('NONE')
  const [dataEntityId, setDataEntityId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  const [activeId, setActiveId] = useState<number | null>(null)
  const [activeFinished, setActiveFinished] = useState(false)
  const { data: active } = useGetBroadcastQuery(activeId!, {
    skip: activeId == null,
    pollingInterval: activeId != null && !activeFinished ? 2000 : 0,
  })

  useEffect(() => {
    setActiveFinished(Boolean(active && !['PENDING', 'SENDING'].includes(active.status)))
  }, [active])

  const resetForm = () => {
    setTitle('')
    setBody('')
    setTitleKy('')
    setBodyKy('')
    setAudience('ALL')
    setAudienceRef('')
    setDataType('NONE')
    setDataEntityId('')
    setScheduledAt('')
  }

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Заголовок и текст обязательны')
      return
    }
    if (audience !== 'ALL' && !audienceRef.trim()) {
      toast.error('Для этой аудитории нужен параметр')
      return
    }
    const payload: BroadcastPayload = {
      title,
      body,
      titleKy: titleKy || undefined,
      bodyKy: bodyKy || undefined,
      audience,
      audienceRef: audience === 'ALL' ? null : audienceRef.trim(),
      dataType,
      dataEntityId: dataType === 'NONE' ? null : Number(dataEntityId) || null,
      scheduledAt: scheduledAt ? toServerDateTime(new Date(scheduledAt)) : null,
    }
    try {
      const res = await broadcast(payload).unwrap()
      toast.success(`Рассылка №${res.broadcastId} создана`)
      setActiveId(res.broadcastId)
      resetForm()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const refFieldForAudience = () => {
    switch (audience) {
      case 'ALL':
        return null
      case 'USER_IDS':
        return (
          <Field label="ID пользователей через запятую" required>
            <Input
              value={audienceRef}
              onChange={e => setAudienceRef(e.target.value)}
              placeholder="12,45,78"
            />
          </Field>
        )
      case 'PLATFORM':
        return (
          <Field label="Платформа" required>
            <Select value={audienceRef} onChange={e => setAudienceRef(e.target.value)}>
              <option value="">— выбрать —</option>
              <option value="ANDROID">ANDROID</option>
              <option value="IOS">IOS</option>
              <option value="WEB">WEB</option>
            </Select>
          </Field>
        )
      case 'PURCHASED_TEST':
        return (
          <Field label="Тест" required>
            <Select value={audienceRef} onChange={e => setAudienceRef(e.target.value)}>
              <option value="">— выбрать —</option>
              {tests?.content.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </Select>
          </Field>
        )
      case 'INACTIVE_DAYS':
        return (
          <Field label="Дней неактивности" required>
            <Input
              type="number"
              min={1}
              value={audienceRef}
              onChange={e => setAudienceRef(e.target.value)}
              placeholder="7"
            />
          </Field>
        )
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Push-рассылки" description="Отправка уведомлений в приложение" />

      {!statusLoading && status && !status.firebaseEnabled && (
        <div className="flex items-center gap-2 rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
          <AlertTriangle size={16} />
          Push-уведомления не настроены на сервере. Немедленная отправка вернёт ошибку — можно
          только запланировать.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Новая рассылка" />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Заголовок (RU)" required>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </Field>
              <Field label="Заголовок (KY)">
                <Input value={titleKy} onChange={e => setTitleKy(e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Текст (RU)" required>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border-input px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Текст (KY)">
                <textarea
                  value={bodyKy}
                  onChange={e => setBodyKy(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border-input px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Аудитория">
                <Select
                  value={audience}
                  onChange={e => {
                    setAudience(e.target.value as BroadcastAudience)
                    setAudienceRef('')
                  }}
                >
                  {AUDIENCES.map(a => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              </Field>
              {refFieldForAudience()}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Deep-link тип">
                <Select
                  value={dataType}
                  onChange={e => setDataType(e.target.value as BroadcastDataType)}
                >
                  {DATA_TYPES.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
              {dataType !== 'NONE' && (
                <Field label="ID сущности">
                  <Input
                    type="number"
                    value={dataEntityId}
                    onChange={e => setDataEntityId(e.target.value)}
                  />
                </Field>
              )}
            </div>

            <Field label="Запланировать на" hint="Пусто — отправить сразу">
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
              />
            </Field>

            <Button onClick={submit} loading={sending} disabled={sending}>
              <Send size={14} /> {scheduledAt ? 'Запланировать' : 'Отправить'}
            </Button>
          </CardBody>
        </Card>

        {/* phone preview + push status */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Как увидит пользователь" />
            <CardBody>
              <div className="rounded-xl border border-border bg-neutral-50 p-3">
                <div className="flex items-start gap-2 rounded-lg bg-white p-3 shadow-sm">
                  <div className="mt-0.5 rounded bg-primary/10 p-1.5 text-primary">
                    <Bell size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {title || 'Заголовок уведомления'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {body || 'Текст уведомления появится здесь'}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Состояние Push" />
            <CardBody className="space-y-1 text-sm">
              {statusLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : status ? (
                <>
                  <Row label="Firebase" value={status.firebaseEnabled ? 'вкл' : 'выкл'} />
                  <Row label="Всего токенов" value={String(status.totalTokens)} />
                  <Row label="Пользователей с токеном" value={String(status.usersWithToken)} />
                  <Row label="Запланировано" value={String(status.scheduledBroadcasts)} />
                  <Row label="Последняя" value={formatDT(status.lastBroadcastAt)} />
                </>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* active broadcast progress */}
      {active && (
        <Card>
          <CardHeader
            title={`Рассылка №${active.id}`}
            action={<Badge tone="info">{active.status}</Badge>}
          />
          <CardBody>
            {['PENDING', 'SENDING'].includes(active.status) ? (
              <p className="text-sm text-muted-foreground">Отправляется…</p>
            ) : active.recipientCount == null ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              <p className="text-sm">
                Получателей: {active.recipientCount} · Успешно: {active.successCount} · Ошибок:{' '}
                {active.failureCount}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {/* history */}
      <Card>
        <CardHeader title="История рассылок" />
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50 text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Заголовок</th>
                <th className="px-4 py-2">Аудитория</th>
                <th className="px-4 py-2">Статус</th>
                <th className="px-4 py-2">Создана</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {history?.content.map(h => (
                <tr key={h.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">{h.id}</td>
                  <td className="px-4 py-2">{h.title}</td>
                  <td className="px-4 py-2">{h.audience}</td>
                  <td className="px-4 py-2">
                    <Badge tone="neutral">{h.status}</Badge>
                  </td>
                  <td className="px-4 py-2">{formatDT(h.createdAt)}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setActiveId(h.id)}>
                        Открыть
                      </Button>
                      {h.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            try {
                              await cancelBroadcast(h.id).unwrap()
                              toast.success('Рассылка отменена')
                            } catch (err) {
                              toast.error(extractErrorMessage(err))
                            }
                          }}
                        >
                          Отменить
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!history || history.content.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Пока нет рассылок
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {history && history.totalPages > 1 && (
            <div className="flex justify-end gap-2 border-t border-border px-4 py-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 0}
                onClick={() => setPage(page - 1)}
              >
                Назад
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= history.totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Вперёд
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
