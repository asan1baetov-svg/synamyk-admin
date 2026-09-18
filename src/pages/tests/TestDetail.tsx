import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, EyeOff, Plus, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetTestQuery,
  useDeleteTestMutation,
  useDeleteSubTestMutation,
  useUpdateSubTestMutation,
  useUpdatePricingMutation,
  useUpdateTestScheduleMutation,
  useSetSubTestPaidMutation,
} from '@/services'
import type { AdminSubTest, SchedulePayload } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { extractErrorMessage } from '@/lib/errors'
import { formatMoney } from '@/lib/format'
import { freeWindowLabel } from '@/lib/schedule'
import {
  PageHeader,
  ConfirmDialog,
  SortableList,
  EmptyState,
  FreeWindowEditor,
} from '@/components/common'
import { Button, Badge, Card, CardHeader, CardBody, Input, Switch, Skeleton } from '@/components/ui'
import { TestFormDialog } from './TestFormDialog'
import { SubTestFormDialog } from './SubTestFormDialog'

interface SubRow {
  id: number
  isPaid: boolean
  price: number
}

export function TestDetail() {
  const { testId } = useParams()
  const id = Number(testId)
  const navigate = useNavigate()
  const { data: test, isLoading } = useGetTestQuery(id)
  useDocumentTitle(test ? test.title : 'Тест')

  const [deleteTest, { isLoading: hiding }] = useDeleteTestMutation()
  const [deleteSubTest] = useDeleteSubTestMutation()
  const [updateSubTest] = useUpdateSubTestMutation()
  const [updatePricing, { isLoading: savingPricing }] = useUpdatePricingMutation()
  const [updateSchedule, { isLoading: savingSchedule }] = useUpdateTestScheduleMutation()
  const [setPaid] = useSetSubTestPaidMutation()

  const [editOpen, setEditOpen] = useState(false)
  const [hideOpen, setHideOpen] = useState(false)
  const [subFormOpen, setSubFormOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<AdminSubTest | null>(null)
  const [subToHide, setSubToHide] = useState<AdminSubTest | null>(null)

  const [bundlePrice, setBundlePrice] = useState(0)
  const [subRows, setSubRows] = useState<Record<number, SubRow>>({})
  const [orderedSubs, setOrderedSubs] = useState<AdminSubTest[]>([])

  useEffect(() => {
    if (!test) return
    setBundlePrice(test.price)
    setSubRows(
      Object.fromEntries(
        test.subTests.map(s => [s.id, { id: s.id, isPaid: s.isPaid, price: s.price ?? 0 }])
      )
    )
    setOrderedSubs([...test.subTests].sort((a, b) => a.levelOrder - b.levelOrder))
  }, [test])

  if (isLoading || !test) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const savePricing = async () => {
    const rows = Object.values(subRows)
    const bad = rows.find(r => r.isPaid && r.price <= 0)
    if (bad) {
      const st = test.subTests.find(s => s.id === bad.id)
      toast.error(`Платный подтест «${st?.title}» должен иметь цену больше 0`)
      return
    }
    try {
      await updatePricing({
        id,
        body: {
          price: bundlePrice,
          subTests: rows.map(r => ({
            subTestId: r.id,
            isPaid: r.isPaid,
            price: r.isPaid ? r.price : 0,
          })),
        },
      }).unwrap()
      toast.success('Монетизация сохранена')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const saveTestSchedule = async (body: SchedulePayload) => {
    try {
      await updateSchedule({ id, body }).unwrap()
      toast.success('Бесплатный период сохранён')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const togglePaidRow = async (sub: AdminSubTest, next: boolean) => {
    if (next && (subRows[sub.id]?.price ?? sub.price ?? 0) <= 0) {
      toast.error('Сначала задайте цену подтеста в блоке «Монетизация»')
      return
    }
    try {
      await setPaid({ subTestId: sub.id, paid: next, testId: id }).unwrap()
      setSubRows(prev => ({
        ...prev,
        [sub.id]: { ...prev[sub.id], isPaid: next },
      }))
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const persistOrder = async (next: AdminSubTest[]) => {
    setOrderedSubs(next)
    const changed = next
      .map((s, i) => ({ s, order: i + 1 }))
      .filter(({ s, order }) => s.levelOrder !== order)
    try {
      for (const { s, order } of changed) {
        await updateSubTest({
          subTestId: s.id,
          testId: id,
          body: {
            title: s.title,
            titleKy: s.titleKy ?? undefined,
            levelName: s.levelName,
            levelNameKy: s.levelNameKy ?? undefined,
            levelOrder: order,
            isPaid: s.isPaid,
            price: s.price ?? 0,
            durationMinutes: s.durationMinutes,
            maxScore: s.maxScore ?? null,
            iconUrl: s.iconUrl ?? undefined,
          },
        }).unwrap()
      }
      if (changed.length) toast.success('Порядок обновлён')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/tests')}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> К списку тестов
      </button>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {test.iconUrl && (
              <img src={test.iconUrl} alt="" className="h-9 w-9 rounded object-cover" />
            )}
            {test.title}
            {test.active ? (
              <Badge tone="success">Активен</Badge>
            ) : (
              <Badge tone="neutral">Скрыт</Badge>
            )}
          </span>
        }
        description={
          <>
            {test.titleKy && <>{test.titleKy} · </>}
            Макс. балл ОРТ: {test.maxScore ?? 245} · Разделов: {test.subTests.length} ·{' '}
            {test.subTests.reduce((n, s) => n + s.durationMinutes, 0)} мин ·{' '}
            {test.subTests.reduce((n, s) => n + s.questionCount, 0)} вопр.
          </>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={14} /> Редактировать
            </Button>
            {test.active && (
              <Button variant="danger" onClick={() => setHideOpen(true)}>
                <EyeOff size={14} /> Скрыть тест
              </Button>
            )}
          </>
        }
      />

      {/* Monetization */}
      <Card>
        <CardHeader
          title="Монетизация"
          description="Bundle открывает все платные подтесты сразу. У каждого подтеста может быть своя цена для отдельной покупки."
          action={
            <Button size="sm" onClick={savePricing} loading={savingPricing}>
              Сохранить
            </Button>
          }
        />
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Цена всего теста (bundle), сом</label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={bundlePrice}
              onChange={e => setBundlePrice(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-xs text-muted-foreground">0 = без bundle</span>
          </div>

          {test.subTests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет подтестов</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50 text-left text-xs uppercase text-muted-foreground">
                    <th className="px-3 py-2">Подтест</th>
                    <th className="px-3 py-2">Платный</th>
                    <th className="px-3 py-2">Цена подтеста, сом</th>
                  </tr>
                </thead>
                <tbody>
                  {test.subTests.map(s => {
                    const row = subRows[s.id] ?? {
                      id: s.id,
                      isPaid: s.isPaid,
                      price: s.price ?? 0,
                    }
                    return (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2">
                          {s.title}
                          <span className="ml-2 text-xs text-muted-foreground">{s.levelName}</span>
                        </td>
                        <td className="px-3 py-2">
                          <Switch
                            checked={row.isPaid}
                            onChange={v =>
                              setSubRows(prev => ({
                                ...prev,
                                [s.id]: { ...row, isPaid: v },
                              }))
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            disabled={!row.isPaid}
                            value={row.isPaid ? row.price : ''}
                            placeholder="—"
                            onChange={e =>
                              setSubRows(prev => ({
                                ...prev,
                                [s.id]: {
                                  ...row,
                                  price: Number(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-28"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Полная перезапись: подтесты без галочки станут бесплатными (цена 0).
          </p>
        </CardBody>
      </Card>

      {/* Free window */}
      <Card>
        <CardHeader
          title="Бесплатный период теста"
          description="Пока текущее время внутри окна — тест бесплатен для всех пользователей."
        />
        <CardBody>
          <FreeWindowEditor
            freeFrom={test.freeFrom}
            freeUntil={test.freeUntil}
            saving={savingSchedule}
            onSave={saveTestSchedule}
          />
        </CardBody>
      </Card>

      {/* Sub-tests */}
      <Card>
        <CardHeader
          title={`Разделы (${test.subTests.length})`}
          description="Тест проходится целиком: разделы идут подряд в порядке списка, у каждого свой таймер."
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditingSub(null)
                setSubFormOpen(true)
              }}
            >
              <Plus size={14} /> Добавить раздел
            </Button>
          }
        />
        <CardBody>
          {orderedSubs.length === 0 ? (
            <EmptyState
              title="Пока нет подтестов"
              description="Подтест — это уровень внутри теста со своей длительностью и вопросами."
            />
          ) : (
            <SortableList
              items={orderedSubs}
              getId={s => s.id}
              onReorder={next => persistOrder(next)}
              renderItem={(s, handle) => {
                const win = freeWindowLabel(s.freeFrom, s.freeUntil)
                return (
                  <div className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2.5">
                    {handle}
                    {s.iconUrl ? (
                      <img src={s.iconUrl} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-neutral-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium">{s.title}</span>
                        {s.isPaid ? (
                          <Badge tone="warning">Платный · {formatMoney(s.price)}</Badge>
                        ) : (
                          <Badge tone="success">Бесплатный</Badge>
                        )}
                        {win && <Badge tone="info">{win}</Badge>}
                        {!s.active && <Badge tone="neutral">Скрыт</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.levelName} · {s.questionCount} вопр. · {s.durationMinutes} мин · Баллы
                        ОРТ: {s.maxScore != null ? s.maxScore : 'авто'}
                      </p>
                    </div>
                    <Switch
                      checked={s.isPaid}
                      onChange={v => togglePaidRow(s, v)}
                      label="Платный"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/tests/${id}/sub-tests/${s.id}/questions`)}
                    >
                      <ListChecks size={14} /> Вопросы и тексты
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingSub(s)
                        setSubFormOpen(true)
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    {s.active && (
                      <Button size="sm" variant="ghost" onClick={() => setSubToHide(s)}>
                        <EyeOff size={14} />
                      </Button>
                    )}
                  </div>
                )
              }}
            />
          )}
        </CardBody>
      </Card>

      <TestFormDialog open={editOpen} onClose={() => setEditOpen(false)} test={test} />
      <SubTestFormDialog
        open={subFormOpen}
        onClose={() => setSubFormOpen(false)}
        testId={id}
        subTest={editingSub}
        nextOrder={orderedSubs.length + 1}
      />

      <ConfirmDialog
        open={hideOpen}
        onClose={() => setHideOpen(false)}
        onConfirm={async () => {
          try {
            await deleteTest(id).unwrap()
            toast.success('Тест скрыт')
            navigate('/tests')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          }
        }}
        title="Скрыть тест?"
        description="Тест станет недоступен ученикам. Данные сохранятся, но вернуть тест через админку нельзя."
        confirmLabel="Скрыть"
        destructive
        loading={hiding}
      />

      <ConfirmDialog
        open={Boolean(subToHide)}
        onClose={() => setSubToHide(null)}
        onConfirm={async () => {
          if (!subToHide) return
          try {
            await deleteSubTest({ subTestId: subToHide.id, testId: id }).unwrap()
            toast.success('Подтест скрыт')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setSubToHide(null)
          }
        }}
        title="Скрыть подтест?"
        description="Вернуть скрытый подтест через админку нельзя."
        confirmLabel="Скрыть"
        destructive
      />
    </div>
  )
}
