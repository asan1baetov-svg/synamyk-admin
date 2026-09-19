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
} from '@/services'
import type { AdminSubTest, SchedulePayload } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { extractErrorMessage } from '@/lib/errors'
import { formatMoney } from '@/lib/format'
import {
  PageHeader,
  ConfirmDialog,
  SortableList,
  EmptyState,
  FreeWindowEditor,
} from '@/components/common'
import { Button, Badge, Card, CardHeader, CardBody, Input, Skeleton } from '@/components/ui'
import { TestFormDialog } from './TestFormDialog'
import { SubTestFormDialog } from './SubTestFormDialog'

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

  const [editOpen, setEditOpen] = useState(false)
  const [hideOpen, setHideOpen] = useState(false)
  const [subFormOpen, setSubFormOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<AdminSubTest | null>(null)
  const [subToHide, setSubToHide] = useState<AdminSubTest | null>(null)

  const [price, setPrice] = useState(0)
  const [orderedSubs, setOrderedSubs] = useState<AdminSubTest[]>([])

  useEffect(() => {
    if (!test) return
    setPrice(test.price)
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
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Цена не может быть отрицательной')
      return
    }
    try {
      await updatePricing({ id, body: { price } }).unwrap()
      toast.success('Цена сохранена')
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

      {/* Price */}
      <Card>
        <CardHeader
          title="Цена"
          description="Покупается только тест целиком — одна оплата открывает все разделы."
          action={
            <Button
              size="sm"
              onClick={savePricing}
              loading={savingPricing}
              disabled={price === test.price}
            >
              Сохранить
            </Button>
          }
        />
        <CardBody>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-muted-foreground">Цена теста, сом</label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-xs text-muted-foreground">
              0 = бесплатный · сейчас {formatMoney(test.price)}
            </span>
          </div>
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
              title="Пока нет разделов"
              description="Раздел — часть теста со своим таймером, вопросами и текстами."
            />
          ) : (
            <SortableList
              items={orderedSubs}
              getId={s => s.id}
              onReorder={next => persistOrder(next)}
              renderItem={(s, handle) => {
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
                        {!s.active && <Badge tone="neutral">Скрыт</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.levelName} · {s.questionCount} вопр. · {s.durationMinutes} мин · Баллы
                        ОРТ: {s.maxScore != null ? s.maxScore : 'авто'}
                      </p>
                    </div>
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
            toast.success('Раздел скрыт')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setSubToHide(null)
          }
        }}
        title="Скрыть раздел?"
        description="Вернуть скрытый раздел через админку нельзя."
        confirmLabel="Скрыть"
        destructive
      />
    </div>
  )
}
