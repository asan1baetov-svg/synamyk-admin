import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useCreateQuestionMutation, useUpdateQuestionMutation } from '@/services'
import type { AdminQuestion, QuestionPayload } from '@/types/api'
import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
import { validateLatex } from '@/lib/latex'
import { Dialog, Button, Input, Field, SegmentedControl } from '@/components/ui'
import { SortableList, ImageUploader } from '@/components/common'
import { MathField } from '@/components/math'
import { StudentQuestionPreview } from './StudentQuestionPreview'

const LABELS = ['А', 'Б', 'В', 'Г', 'Д', 'Е']
type Lang = 'ru' | 'ky'

interface OptionDraft {
  key: string
  label: string
  text: string
  textKy: string
  isCorrect: boolean
}

interface Draft {
  sectionName: string
  sectionNameKy: string
  text: string
  textKy: string
  imageUrl: string | null
  explanation: string
  explanationKy: string
  pointValue: number
  answerType: 'one' | 'many'
  options: OptionDraft[]
}

const uid = () => Math.random().toString(36).slice(2)

const emptyOption = (label: string): OptionDraft => ({
  key: uid(),
  label,
  text: '',
  textKy: '',
  isCorrect: false,
})

function relabel(options: OptionDraft[]): OptionDraft[] {
  return options.map((o, i) => ({ ...o, label: LABELS[i] ?? o.label }))
}

function draftFromQuestion(q?: AdminQuestion | null): Draft {
  if (!q) {
    return {
      sectionName: '',
      sectionNameKy: '',
      text: '',
      textKy: '',
      imageUrl: null,
      explanation: '',
      explanationKy: '',
      pointValue: 1,
      answerType: 'one',
      options: [emptyOption('А'), emptyOption('Б')],
    }
  }
  const correctCount = q.options.filter(o => o.isCorrect).length
  return {
    sectionName: q.sectionName ?? '',
    sectionNameKy: q.sectionNameKy ?? '',
    text: q.text ?? '',
    textKy: q.textKy ?? '',
    imageUrl: q.imageUrl ?? null,
    explanation: q.explanation ?? '',
    explanationKy: q.explanationKy ?? '',
    pointValue: q.pointValue ?? 1,
    answerType: correctCount > 1 ? 'many' : 'one',
    options: q.options
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((o, i) => ({
        key: uid(),
        label: o.label || LABELS[i] || '',
        text: o.text ?? '',
        textKy: o.textKy ?? '',
        isCorrect: o.isCorrect,
      })),
  }
}

function collectLatexErrors(d: Draft, lang: Lang): string[] {
  const errs: string[] = []
  const check = (label: string, value: string) => {
    for (const e of validateLatex(value)) {
      errs.push(`${label}: ${e.message.replace(/^KaTeX parse error:\s*/, '')}`)
    }
  }
  check('Текст вопроса', lang === 'ru' ? d.text : d.textKy || d.text)
  d.options.forEach((o, i) =>
    check(`Вариант ${o.label || i + 1}`, lang === 'ru' ? o.text : o.textKy || o.text)
  )
  if (d.explanation || d.explanationKy)
    check('Пояснение', lang === 'ru' ? d.explanation : d.explanationKy || d.explanation)
  return errs
}

function validate(d: Draft): string[] {
  const errs: string[] = []
  if (!d.text.trim()) errs.push('Текст вопроса обязателен')
  if (d.options.length < 2 || d.options.length > 6) errs.push('Вариантов должно быть от 2 до 6')
  if (d.options.some(o => !o.text.trim())) errs.push('У каждого варианта должен быть текст')
  const correct = d.options.filter(o => o.isCorrect).length
  if (correct < 1) errs.push('Отметьте хотя бы один правильный ответ')
  if (d.answerType === 'one' && correct !== 1)
    errs.push('При типе «один правильный» должен быть ровно один верный вариант')
  const labels = d.options.map(o => o.label.trim())
  if (labels.some(l => !l)) errs.push('У всех вариантов должна быть метка')
  if (new Set(labels).size !== labels.length) errs.push('Метки вариантов не уникальны')
  if (d.pointValue < 1) errs.push('Баллы: минимум 1')
  errs.push(...collectLatexErrors(d, 'ru'))
  return errs
}

function toPayload(d: Draft, orderIndex: number): QuestionPayload {
  return {
    text: d.text,
    textKy: d.textKy || undefined,
    sectionName: d.sectionName || undefined,
    sectionNameKy: d.sectionNameKy || undefined,
    imageUrl: d.imageUrl || undefined,
    explanation: d.explanation || undefined,
    explanationKy: d.explanationKy || undefined,
    orderIndex,
    pointValue: d.pointValue,
    options: d.options.map((o, i) => ({
      label: o.label,
      text: o.text,
      textKy: o.textKy || undefined,
      isCorrect: o.isCorrect,
      orderIndex: i,
    })),
  }
}

interface Props {
  open: boolean
  onClose: () => void
  subTestId: number
  testId: number
  /** editing target; null = new */
  question: AdminQuestion | null
  /** for a new question */
  nextOrderIndex: number
  /** section suggestions from the loaded list */
  sections: string[]
  /** true when opened via "duplicate" (question has data but no id) */
  duplicate?: boolean
}

export function QuestionEditor({
  open,
  onClose,
  subTestId,
  testId,
  question,
  nextOrderIndex,
  sections,
  duplicate,
}: Props) {
  const editing = Boolean(question && !duplicate)
  const draftKey = `draft:question:${subTestId}:${question && !duplicate ? question.id : 'new'}`

  const [d, setD] = useState<Draft>(() => draftFromQuestion(question))
  const [lang, setLang] = useState<Lang>('ru')
  const [dirty, setDirty] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [explanationOpen, setExplanationOpen] = useState(false)
  const [orderIndex, setOrderIndex] = useState(nextOrderIndex)
  const textFieldWrapRef = useRef<HTMLDivElement>(null)

  const [createQuestion, { isLoading: creating }] = useCreateQuestionMutation()
  const [updateQuestion, { isLoading: updating }] = useUpdateQuestionMutation()
  const saving = creating || updating

  const set = useCallback((patch: Partial<Draft>) => {
    setD(prev => ({ ...prev, ...patch }))
    setDirty(true)
  }, [])

  // (re)initialise when opened
  useEffect(() => {
    if (!open) return
    setD(draftFromQuestion(question))
    setLang('ru')
    setDirty(false)
    setShowErrors(false)
    setOrderIndex(editing && question ? question.orderIndex : nextOrderIndex)
    setExplanationOpen(Boolean(question?.explanation || question?.explanationKy))
    // offer draft restore
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const restore = window.confirm('Найден несохранённый черновик этого вопроса. Восстановить?')
        if (restore) {
          setD(JSON.parse(raw) as Draft)
          setDirty(true)
        } else {
          localStorage.removeItem(draftKey)
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // autosave draft
  useEffect(() => {
    if (!open || !dirty) return
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(d))
      } catch {
        /* ignore */
      }
    }, 600)
    return () => clearTimeout(t)
  }, [d, dirty, open, draftKey])

  // warn on unload
  useEffect(() => {
    if (!open) return
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [open, dirty])

  const errors = useMemo(() => validate(d), [d])
  const canSave = errors.length === 0

  const doSave = async (): Promise<AdminQuestion | null> => {
    setShowErrors(true)
    if (!canSave) {
      toast.error('Исправьте ошибки перед сохранением')
      return null
    }
    try {
      const payload = toPayload(d, orderIndex)
      let result: AdminQuestion
      if (editing && question) {
        result = await updateQuestion({
          questionId: question.id,
          subTestId,
          testId,
          body: payload,
        }).unwrap()
        toast.success('Вопрос сохранён')
      } else {
        result = await createQuestion({ subTestId, testId, body: payload }).unwrap()
        toast.success('Вопрос создан')
      }
      localStorage.removeItem(draftKey)
      setDirty(false)
      return result
    } catch (err) {
      const fe = extractFieldErrors(err)
      if (fe) toast.error(Object.values(fe).join('\n'))
      else toast.error(extractErrorMessage(err))
      return null
    }
  }

  const handleClose = () => {
    if (dirty && !window.confirm('Есть несохранённые изменения. Закрыть без сохранения?')) return
    onClose()
  }

  const saveAndClose = async () => {
    const r = await doSave()
    if (r) onClose()
  }

  const saveAndNext = async () => {
    const r = await doSave()
    if (!r) return
    // keep section + points, reset the rest, bump order
    setD({
      sectionName: d.sectionName,
      sectionNameKy: d.sectionNameKy,
      text: '',
      textKy: '',
      imageUrl: null,
      explanation: '',
      explanationKy: '',
      pointValue: d.pointValue,
      answerType: d.answerType,
      options: [emptyOption('А'), emptyOption('Б')],
    })
    setOrderIndex(n => n + 1)
    setDirty(false)
    setShowErrors(false)
    requestAnimationFrame(() =>
      textFieldWrapRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus()
    )
  }

  // hotkeys
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        void saveAndNext()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void saveAndClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, d, orderIndex])

  const setOption = (key: string, patch: Partial<OptionDraft>) => {
    setD(prev => ({
      ...prev,
      options: prev.options.map(o => (o.key === key ? { ...o, ...patch } : o)),
    }))
    setDirty(true)
  }

  const setCorrect = (key: string, value: boolean) => {
    setD(prev => ({
      ...prev,
      options: prev.options.map(o => {
        if (prev.answerType === 'one') {
          return { ...o, isCorrect: o.key === key }
        }
        return o.key === key ? { ...o, isCorrect: value } : o
      }),
    }))
    setDirty(true)
  }

  const addOption = () => {
    if (d.options.length >= 6) return
    set({ options: relabel([...d.options, emptyOption('')]) })
  }

  const removeOption = (key: string) => {
    if (d.options.length <= 2) return
    set({ options: relabel(d.options.filter(o => o.key !== key)) })
  }

  const previewQuestion = {
    text: lang === 'ru' ? d.text : d.textKy || d.text,
    textKy: d.textKy,
    imageUrl: d.imageUrl,
    explanation: lang === 'ru' ? d.explanation : d.explanationKy || d.explanation,
    explanationKy: d.explanationKy,
    pointValue: d.pointValue,
    options: d.options.map(o => ({
      label: o.label,
      text: lang === 'ru' ? o.text : o.textKy || o.text,
      isCorrect: o.isCorrect,
    })),
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={editing ? 'Редактирование вопроса' : 'Новый вопрос'}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Ctrl+S — сохранить · Ctrl+Enter — сохранить и следующий
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Отмена
            </Button>
            {!editing && (
              <Button variant="secondary" onClick={saveAndNext} loading={saving}>
                Сохранить и создать следующий
              </Button>
            )}
            <Button onClick={saveAndClose} loading={saving}>
              Сохранить
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SegmentedControl<Lang>
              options={[
                { value: 'ru', label: 'RU' },
                { value: 'ky', label: 'KY' },
              ]}
              value={lang}
              onChange={setLang}
            />
            <span className="text-xs text-muted-foreground">orderIndex: {orderIndex}</span>
          </div>

          <Field label="Раздел">
            <Input
              list="section-suggestions"
              value={lang === 'ru' ? d.sectionName : d.sectionNameKy}
              onChange={e =>
                set(
                  lang === 'ru'
                    ? { sectionName: e.target.value }
                    : { sectionNameKy: e.target.value }
                )
              }
              placeholder="1-часть: Математика"
            />
            <datalist id="section-suggestions">
              {sections.map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>

          <div ref={textFieldWrapRef}>
            <Field label="Текст вопроса" required>
              <MathField
                fieldType="question-text"
                value={lang === 'ru' ? d.text : d.textKy}
                onChange={v => set(lang === 'ru' ? { text: v } : { textKy: v })}
                placeholder="Найдите значение $\frac{3}{4} + \sqrt{16}$"
              />
            </Field>
          </div>

          <Field label="Изображение (необязательно)">
            <ImageUploaderLazy value={d.imageUrl} onChange={key => set({ imageUrl: key })} />
          </Field>

          <Field label="Тип ответа">
            <SegmentedControl<'one' | 'many'>
              options={[
                { value: 'one', label: 'Один правильный' },
                { value: 'many', label: 'Несколько правильных' },
              ]}
              value={d.answerType}
              onChange={v => {
                if (v === 'one') {
                  // keep only the first correct
                  const firstCorrect = d.options.find(o => o.isCorrect)?.key
                  set({
                    answerType: 'one',
                    options: d.options.map(o => ({
                      ...o,
                      isCorrect: o.key === firstCorrect,
                    })),
                  })
                } else {
                  set({ answerType: 'many' })
                }
              }}
            />
          </Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Варианты ответов</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={addOption}
                disabled={d.options.length >= 6}
              >
                <Plus size={14} /> Добавить
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Порядок вариантов важен: сервер сопоставляет их по позиции. Если по вопросу уже
              проходили тест, вариант, который выбирали ученики, удалить нельзя — только
              отредактировать его текст.
            </p>

            <SortableList
              items={d.options}
              getId={o => o.key}
              onReorder={next => set({ options: relabel(next) })}
              renderItem={(o, handle) => (
                <div className="rounded-md border border-border bg-white p-2">
                  <div className="flex items-center gap-2">
                    {handle}
                    <input
                      type={d.answerType === 'one' ? 'radio' : 'checkbox'}
                      checked={o.isCorrect}
                      onChange={e => setCorrect(o.key, e.target.checked)}
                      title="Правильный ответ"
                    />
                    <input
                      value={o.label}
                      onChange={e => setOption(o.key, { label: e.target.value })}
                      className="w-10 rounded border border-border-input px-1.5 py-1 text-center text-sm"
                    />
                    <span className="flex-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeOption(o.key)}
                      disabled={d.options.length <= 2}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="mt-2 pl-8">
                    <MathField
                      fieldType="option-text"
                      defaultMode="math"
                      value={lang === 'ru' ? o.text : o.textKy}
                      onChange={v => setOption(o.key, lang === 'ru' ? { text: v } : { textKy: v })}
                    />
                  </div>
                </div>
              )}
            />
          </div>

          <Field label="Баллы за верный ответ">
            <Input
              type="number"
              min={1}
              value={d.pointValue}
              onChange={e => set({ pointValue: Math.max(1, Number(e.target.value) || 1) })}
              className="w-24"
            />
          </Field>

          <div>
            <button
              type="button"
              onClick={() => setExplanationOpen(o => !o)}
              className="flex items-center gap-1 text-sm font-medium text-foreground"
            >
              {explanationOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Пояснение
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (используется ИИ при разборе ошибок ученика)
              </span>
            </button>
            {explanationOpen && (
              <div className="mt-2">
                <MathField
                  fieldType="question-explanation"
                  value={lang === 'ru' ? d.explanation : d.explanationKy}
                  onChange={v => set(lang === 'ru' ? { explanation: v } : { explanationKy: v })}
                />
              </div>
            )}
          </div>

          {showErrors && errors.length > 0 && (
            <ul className="space-y-0.5 rounded-md bg-error-soft p-3 text-xs text-error">
              {errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          )}
        </div>

        {/* preview */}
        <div className="lg:border-l lg:border-border lg:pl-6">
          <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">
            Предпросмотр — как увидит ученик
          </p>
          <div className="rounded-lg border border-border p-4">
            <StudentQuestionPreview q={previewQuestion} lang={lang} />
          </div>
        </div>
      </div>
    </Dialog>
  )
}

/* Local wrapper so the editor file stays self-contained. */
function ImageUploaderLazy({
  value,
  onChange,
}: {
  value: string | null
  onChange: (key: string | null) => void
}) {
  const [preview, setPreview] = useState<string | null>(
    value && /^https?:\/\//.test(value) ? value : null
  )
  return (
    <ImageUploader
      type="QUESTION_IMAGE"
      value={value}
      previewUrl={preview}
      onChange={(key, url) => {
        onChange(key)
        setPreview(url ?? null)
      }}
    />
  )
}
