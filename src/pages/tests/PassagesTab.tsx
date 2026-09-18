import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, EyeOff } from 'lucide-react'
import {
  useCreatePassageMutation,
  useUpdatePassageMutation,
  useDeletePassageMutation,
} from '@/services'
import type { Passage, PassagePayload } from '@/types/api'
import { extractErrorMessage } from '@/lib/errors'
import { ConfirmDialog, EmptyState, ImageUploader, SortableList } from '@/components/common'
import { Badge, Button, Dialog, Field, Input, SegmentedControl, Textarea } from '@/components/ui'
import { PassageBlock } from './StudentQuestionPreview'

const toPayload = (p: Passage, orderIndex = p.orderIndex): PassagePayload => ({
  title: p.title ?? undefined,
  titleKy: p.titleKy ?? undefined,
  text: p.text,
  textKy: p.textKy ?? undefined,
  imageUrl: p.imageUrl ?? undefined,
  orderIndex,
})

/** «Тексты» tab of a section: reading passages that questions can be linked to. */
export function PassagesTab({ subTestId, passages }: { subTestId: number; passages: Passage[] }) {
  const [updatePassage] = useUpdatePassageMutation()
  const [deletePassage, { isLoading: hiding }] = useDeletePassageMutation()
  const [editing, setEditing] = useState<Passage | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [toHide, setToHide] = useState<Passage | null>(null)
  const [ordered, setOrdered] = useState<Passage[] | null>(null)

  const sorted = [...passages].sort((a, b) => a.orderIndex - b.orderIndex)
  const list = ordered ?? sorted

  const persistOrder = async (next: Passage[]) => {
    setOrdered(next)
    const changed = next.map((p, i) => ({ p, i })).filter(({ p, i }) => p.orderIndex !== i)
    try {
      for (const { p, i } of changed) {
        await updatePassage({ passageId: p.id, subTestId, body: toPayload(p, i) }).unwrap()
      }
      if (changed.length) toast.success('Порядок текстов обновлён')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setOrdered(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Тексты для «Окуу жана түшүнүү»: вопросы привязываются к тексту в форме вопроса.
        </p>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus size={15} /> Добавить текст
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Пока нет текстов"
          description="Добавьте текст — каждая строка с новой строки, приложение нумерует каждую 5-ю."
        />
      ) : (
        <SortableList
          items={list}
          getId={p => p.id}
          onReorder={next => persistOrder(next)}
          renderItem={(p, handle) => (
            <div className="flex gap-3 rounded-md border border-border bg-white p-3">
              <div className="pt-1">{handle}</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-sm font-semibold text-foreground">
                    {p.title || 'Без названия'}
                  </span>
                  <Badge tone={p.questionCount > 0 ? 'primary' : 'neutral'}>
                    вопросов: {p.questionCount}
                  </Badge>
                  <span>{p.text.split('\n').length} строк</span>
                  {!p.textKy && <Badge tone="warning">нет KY</Badge>}
                  {!p.active && <Badge tone="neutral">скрыт</Badge>}
                </div>
                <p className="line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">
                  {p.text}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(p)
                    setFormOpen(true)
                  }}
                >
                  <Pencil size={14} />
                </Button>
                {p.active && (
                  <Button size="sm" variant="ghost" onClick={() => setToHide(p)}>
                    <EyeOff size={14} />
                  </Button>
                )}
              </div>
            </div>
          )}
        />
      )}

      <PassageFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        subTestId={subTestId}
        passage={editing}
        nextOrder={list.length}
      />

      <ConfirmDialog
        open={Boolean(toHide)}
        onClose={() => setToHide(null)}
        onConfirm={async () => {
          if (!toHide) return
          try {
            await deletePassage({ passageId: toHide.id, subTestId }).unwrap()
            toast.success('Текст скрыт')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setToHide(null)
          }
        }}
        title="Скрыть текст?"
        description={`Привязанные вопросы (${toHide?.questionCount ?? 0}) сохранят связь для истории, но в новых прохождениях текст не покажется.`}
        confirmLabel="Скрыть"
        destructive
        loading={hiding}
      />
    </div>
  )
}

function PassageFormDialog({
  open,
  onClose,
  subTestId,
  passage,
  nextOrder,
}: {
  open: boolean
  onClose: () => void
  subTestId: number
  passage: Passage | null
  nextOrder: number
}) {
  const [createPassage, { isLoading: creating }] = useCreatePassageMutation()
  const [updatePassage, { isLoading: updating }] = useUpdatePassageMutation()
  const [lang, setLang] = useState<'ru' | 'ky'>('ru')
  const [title, setTitle] = useState('')
  const [titleKy, setTitleKy] = useState('')
  const [text, setText] = useState('')
  const [textKy, setTextKy] = useState('')
  const [imageKey, setImageKey] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLang('ru')
    setTitle(passage?.title ?? '')
    setTitleKy(passage?.titleKy ?? '')
    setText(passage?.text ?? '')
    setTextKy(passage?.textKy ?? '')
    setImageKey(passage?.imageUrl ?? null)
    setImagePreview(passage?.imageUrl ?? null)
    setError(null)
  }, [open, passage])

  const save = async () => {
    if (!text.trim()) {
      setError('Текст обязателен (RU)')
      setLang('ru')
      return
    }
    const body: PassagePayload = {
      title: title.trim() || undefined,
      titleKy: titleKy.trim() || undefined,
      text,
      textKy: textKy.trim() ? textKy : undefined,
      imageUrl: imageKey ?? undefined,
      orderIndex: passage?.orderIndex ?? nextOrder,
    }
    try {
      if (passage) {
        await updatePassage({ passageId: passage.id, subTestId, body }).unwrap()
        toast.success('Текст сохранён')
      } else {
        await createPassage({ subTestId, body }).unwrap()
        toast.success('Текст добавлен')
      }
      onClose()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const current = lang === 'ru' ? text : textKy
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={passage ? 'Редактировать текст' : 'Новый текст'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={save} loading={creating || updating}>
            Сохранить
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <SegmentedControl<'ru' | 'ky'>
            options={[
              { value: 'ru', label: 'RU' },
              { value: 'ky', label: textKy.trim() ? 'KY ✓' : 'KY' },
            ]}
            value={lang}
            onChange={setLang}
          />
          <Field label="Заголовок">
            <Input
              value={lang === 'ru' ? title : titleKy}
              onChange={e => (lang === 'ru' ? setTitle : setTitleKy)(e.target.value)}
            />
          </Field>
          <Field
            label="Текст"
            required={lang === 'ru'}
            error={error ?? undefined}
            hint={
              lang === 'ky'
                ? 'Если не заполнить, покажется русский текст'
                : 'Каждая строка — с новой строки (Enter). Приложение нумерует каждую 5-ю строку.'
            }
          >
            <Textarea
              value={current}
              onChange={e => {
                ;(lang === 'ru' ? setText : setTextKy)(e.target.value)
                setError(null)
              }}
              rows={18}
              className="font-mono text-[13px] leading-6"
            />
          </Field>
          <Field label="Изображение (необязательно)">
            <ImageUploader
              type="QUESTION_IMAGE"
              value={imageKey}
              previewUrl={imagePreview}
              onChange={(key, url) => {
                setImageKey(key)
                setImagePreview(url ?? null)
              }}
            />
          </Field>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Предпросмотр — как в приложении
          </p>
          {current.trim() || text.trim() ? (
            <PassageBlock
              title={lang === 'ru' ? title : titleKy || title}
              text={lang === 'ru' ? text : textKy || text}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Введите текст слева.</p>
          )}
          {passage && (
            <p className="text-xs text-muted-foreground">
              Привязано вопросов: {passage.questionCount}
            </p>
          )}
        </div>
      </div>
    </Dialog>
  )
}
