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
  useSetSubTestPaidMutation,
} from '@/services'
import type { AdminSubTest } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { extractErrorMessage } from '@/lib/errors'
import { PageHeader, ConfirmDialog, SortableList, EmptyState } from '@/components/common'
import { Button, Badge, Card, CardHeader, CardBody, Input, Switch, Skeleton } from '@/components/ui'
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
  const [setPaid] = useSetSubTestPaidMutation()

  const [editOpen, setEditOpen] = useState(false)
  const [hideOpen, setHideOpen] = useState(false)
  const [subFormOpen, setSubFormOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<AdminSubTest | null>(null)
  const [subToHide, setSubToHide] = useState<AdminSubTest | null>(null)

  const [price, setPrice] = useState(0)
  const [paidIds, setPaidIds] = useState<number[]>([])
  const [orderedSubs, setOrderedSubs] = useState<AdminSubTest[]>([])

  useEffect(() => {
    if (!test) return
    setPrice(test.price)
    setPaidIds(test.subTests.filter(s => s.isPaid).map(s => s.id))
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
    try {
      await updatePricing({ id, body: { price, paidSubTestIds: paidIds } }).unwrap()
      toast.success('Монетизация сохранена')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const togglePaidRow = async (sub: AdminSubTest, next: boolean) => {
    try {
      await setPaid({ subTestId: sub.id, paid: next, testId: id }).unwrap()
      setPaidIds(prev => (next ? [...prev, sub.id] : prev.filter(x => x !== sub.id)))
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
            durationMinutes: s.durationMinutes,
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
        description={test.titleKy || undefined}
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
          description="Одна оплата открывает все платные подтесты этого теста."
          action={
            <Button size="sm" onClick={savePricing} loading={savingPricing}>
              Сохранить
            </Button>
          }
        />
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Цена теста, сом</label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-xs text-muted-foreground">0 = бесплатный тест</span>
          </div>
          <div className="divide-y divide-border rounded-md border border-border">
            {test.subTests.length === 0 && (
              <p className="px-3 py-3 text-sm text-muted-foreground">Нет подтестов</p>
            )}
            {test.subTests.map(s => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={paidIds.includes(s.id)}
                  onChange={e =>
                    setPaidIds(prev =>
                      e.target.checked ? [...prev, s.id] : prev.filter(x => x !== s.id)
                    )
                  }
                />
                <span className="flex-1">{s.title}</span>
                <span className="text-xs text-muted-foreground">{s.levelName}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Полная перезапись: подтесты без галочки станут бесплатными.
          </p>
        </CardBody>
      </Card>

      {/* Sub-tests */}
      <Card>
        <CardHeader
          title={`Подтесты (${test.subTests.length})`}
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditingSub(null)
                setSubFormOpen(true)
              }}
            >
              <Plus size={14} /> Добавить подтест
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
              renderItem={(s, handle) => (
                <div className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2.5">
                  {handle}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{s.title}</span>
                      {s.isPaid ? (
                        <Badge tone="warning">Платный</Badge>
                      ) : (
                        <Badge tone="success">Бесплатный</Badge>
                      )}
                      {!s.active && <Badge tone="neutral">Скрыт</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.levelName} · {s.questionCount} вопр. · {s.durationMinutes} мин
                    </p>
                  </div>
                  <Switch checked={s.isPaid} onChange={v => togglePaidRow(s, v)} label="Платный" />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/tests/${id}/sub-tests/${s.id}/questions`)}
                  >
                    <ListChecks size={14} /> Вопросы
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
              )}
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
