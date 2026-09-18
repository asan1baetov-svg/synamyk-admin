import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Pencil,
  Copy,
  EyeOff,
  Eye,
  Play,
  Shapes,
  BookOpenText,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useListQuestionsQuery,
  useGetTestQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useListPassagesQuery,
} from '@/services'
import type { AdminQuestion } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { extractErrorMessage } from '@/lib/errors'
import { questionToPayload, comparisonAnswerOf, COMPARISON_ANSWERS } from '@/lib/question'
import { useUrlParam } from '@/hooks/useUrlState'
import {
  PageHeader,
  ConfirmDialog,
  SortableList,
  EmptyState,
  SearchInput,
} from '@/components/common'
import { Button, Badge, Select, Skeleton, Dialog, SegmentedControl, Tabs } from '@/components/ui'
import { MathText } from '@/components/math'
import { QuestionEditor } from './QuestionEditor'
import { StudentQuestionPreview } from './StudentQuestionPreview'
import { PassagesTab } from './PassagesTab'

export function QuestionsPage() {
  const { testId, subTestId } = useParams()
  const tId = Number(testId)
  const sId = Number(subTestId)
  const navigate = useNavigate()

  const { data: questions, isLoading } = useListQuestionsQuery(sId)
  const { data: test } = useGetTestQuery(tId)
  const { data: passages = [] } = useListPassagesQuery(sId)
  const subTest = test?.subTests.find(s => s.id === sId)
  useDocumentTitle(subTest ? `Вопросы — ${subTest.title}` : 'Вопросы')

  const [updateQuestion] = useUpdateQuestionMutation()
  const [deleteQuestion] = useDeleteQuestionMutation()

  const [tab, setTab] = useUrlParam('tab', 'questions')
  const [search, setSearch] = useState('')
  const [section, setSection] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<AdminQuestion | null>(null)
  const [duplicating, setDuplicating] = useState(false)
  const [toHide, setToHide] = useState<AdminQuestion | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLang, setPreviewLang] = useState<'ru' | 'ky'>('ru')
  const [previewIdx, setPreviewIdx] = useState(0)
  const [ordered, setOrdered] = useState<AdminQuestion[] | null>(null)

  const sorted = useMemo(
    () => (questions ? [...questions] : []).sort((a, b) => a.orderIndex - b.orderIndex),
    [questions]
  )
  const list = ordered ?? sorted

  const sections = useMemo(
    () =>
      Array.from(
        new Set(
          (questions ?? []).map(q => q.sectionName?.trim()).filter((x): x is string => Boolean(x))
        )
      ),
    [questions]
  )

  const filtered = list.filter(q => {
    if (section && q.sectionName !== section) return false
    if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPoints = list.reduce((s, q) => s + (q.pointValue ?? 0), 0)

  const persistOrder = async (next: AdminQuestion[]) => {
    setOrdered(next)
    const changed = next.map((q, i) => ({ q, idx: i })).filter(({ q, idx }) => q.orderIndex !== idx)
    try {
      for (const { q, idx } of changed) {
        await updateQuestion({
          questionId: q.id,
          subTestId: sId,
          testId: tId,
          body: questionToPayload(q, idx),
        }).unwrap()
      }
      if (changed.length) toast.success(`Порядок обновлён (${changed.length})`)
      setOrdered(null)
    } catch (err) {
      toast.error(extractErrorMessage(err))
      setOrdered(null)
    }
  }

  const openNew = () => {
    setEditing(null)
    setDuplicating(false)
    setEditorOpen(true)
  }
  const openEdit = (q: AdminQuestion) => {
    setEditing(q)
    setDuplicating(false)
    setEditorOpen(true)
  }
  const openDuplicate = (q: AdminQuestion) => {
    setEditing(q)
    setDuplicating(true)
    setEditorOpen(true)
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(`/tests/${tId}`)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> К тесту
      </button>

      <PageHeader
        title={subTest ? `Раздел: ${subTest.title}` : 'Вопросы'}
        description={
          isLoading ? undefined : (
            <>
              Вопросов: {list.length} · Суммарно баллов: {totalPoints}
              {subTest && ` · Время: ${subTest.durationMinutes} мин`}
              {subTest && ` · Баллы ОРТ: ${subTest.maxScore != null ? subTest.maxScore : 'авто'}`}
            </>
          )
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setPreviewIdx(0)
                setPreviewOpen(true)
              }}
              disabled={list.length === 0}
            >
              <Play size={14} /> Предпросмотр подтеста
            </Button>
            <Button onClick={openNew}>
              <Plus size={15} /> Добавить вопрос
            </Button>
          </>
        }
      />

      <Tabs
        tabs={[
          { value: 'questions', label: `Вопросы (${list.length})` },
          { value: 'passages', label: `Тексты (${passages.filter(p => p.active).length})` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'passages' ? (
        <PassagesTab subTestId={sId} passages={passages} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Поиск по тексту…" />
            <Select value={section} onChange={e => setSection(e.target.value)} className="w-56">
              <option value="">Все темы</option>
              {sections.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Пока нет вопросов"
              description="Добавьте первый вопрос — с текстом, формулами и вариантами ответов."
              action={
                <Button onClick={openNew}>
                  <Plus size={15} /> Добавить первый вопрос
                </Button>
              }
            />
          ) : (
            <SortableList
              items={filtered}
              getId={q => q.id}
              onReorder={next => {
                // reorder only meaningful when unfiltered
                if (section || search) {
                  toast.message('Снимите фильтры, чтобы менять порядок')
                  return
                }
                persistOrder(next)
              }}
              renderItem={(q, handle) => (
                <div className="flex gap-3 rounded-md border border-border bg-white p-3">
                  <div className="pt-1">{handle}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">№{q.orderIndex + 1}</span>
                      {q.sectionName && <Badge tone="neutral">{q.sectionName}</Badge>}
                      <span>{q.pointValue} балл(ов)</span>
                      <span>{q.options.length} вар.</span>
                      {q.questionType === 'COMPARISON' ? (
                        <Badge tone="primary">сравнение</Badge>
                      ) : (
                        q.options.filter(o => o.isCorrect).length > 1 && (
                          <Badge tone="info">несколько ответов</Badge>
                        )
                      )}
                      {q.figure && (
                        <Badge tone="neutral">
                          <Shapes size={11} className="mr-1" /> чертёж
                        </Badge>
                      )}
                      {q.passageId != null && (
                        <Badge tone="neutral">
                          <BookOpenText size={11} className="mr-1" />
                          {passages.find(p => p.id === q.passageId)?.title || 'текст'}
                        </Badge>
                      )}
                      {!q.active && <Badge tone="neutral">скрыт</Badge>}
                    </div>
                    <MathText block value={q.text} className="text-sm" />
                    {q.questionType === 'COMPARISON' && (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5">
                          А: <MathText value={q.columnA ?? ''} />
                        </span>
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5">
                          Б: <MathText value={q.columnB ?? ''} />
                        </span>
                        <span className="rounded bg-success-soft px-1.5 py-0.5 text-success">
                          ✓{' '}
                          {COMPARISON_ANSWERS.find(a => a.value === comparisonAnswerOf(q))?.label ??
                            '—'}
                        </span>
                      </div>
                    )}
                    <div
                      className={`mt-1 flex flex-wrap gap-2 ${q.questionType === 'COMPARISON' ? 'hidden' : ''}`}
                    >
                      {q.options.map(o => (
                        <span
                          key={o.id}
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${
                            o.isCorrect
                              ? 'bg-success-soft text-success'
                              : 'bg-neutral-100 text-muted-foreground'
                          }`}
                        >
                          {o.isCorrect && '✓'} {o.label}: <MathText value={o.text} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(q)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openDuplicate(q)}>
                      <Copy size={14} />
                    </Button>
                    {q.active ? (
                      <Button size="sm" variant="ghost" onClick={() => setToHide(q)}>
                        <EyeOff size={14} />
                      </Button>
                    ) : (
                      <span title="Вернуть через API нельзя">
                        <Eye size={14} className="m-2 text-neutral-300" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            />
          )}
        </>
      )}

      <QuestionEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        subTestId={sId}
        testId={tId}
        question={editing}
        duplicate={duplicating}
        nextOrderIndex={list.length}
        sections={sections}
        passages={passages}
      />

      {/* subtest preview */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Предпросмотр подтеста"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <SegmentedControl<'ru' | 'ky'>
              options={[
                { value: 'ru', label: 'RU' },
                { value: 'ky', label: 'KY' },
              ]}
              value={previewLang}
              onChange={setPreviewLang}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={previewIdx <= 0}
                onClick={() => setPreviewIdx(i => i - 1)}
              >
                Назад
              </Button>
              <span className="text-xs text-muted-foreground">
                {previewIdx + 1} / {list.length}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={previewIdx >= list.length - 1}
                onClick={() => setPreviewIdx(i => i + 1)}
              >
                Вперёд
              </Button>
            </div>
          </div>
        }
      >
        {list[previewIdx] && (
          <StudentQuestionPreview
            q={{
              ...list[previewIdx],
              passage: (() => {
                const p = passages.find(x => x.id === list[previewIdx].passageId)
                if (!p) return null
                const ky = previewLang === 'ky'
                return {
                  title: (ky && p.titleKy) || p.title,
                  text: (ky && p.textKy) || p.text,
                }
              })(),
              options: list[previewIdx].options.slice().sort((a, b) => a.orderIndex - b.orderIndex),
            }}
            lang={previewLang}
            index={previewIdx + 1}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={Boolean(toHide)}
        onClose={() => setToHide(null)}
        onConfirm={async () => {
          if (!toHide) return
          try {
            await deleteQuestion({
              questionId: toHide.id,
              subTestId: sId,
              testId: tId,
            }).unwrap()
            toast.success('Вопрос скрыт')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setToHide(null)
          }
        }}
        title="Скрыть вопрос?"
        description="Вопрос перестанет показываться ученикам. Вернуть его через админку нельзя."
        confirmLabel="Скрыть"
        destructive
      />
    </div>
  )
}
