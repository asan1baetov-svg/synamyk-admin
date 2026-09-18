import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ExternalLink, EyeOff, FileUp, Pencil, Plus, X } from 'lucide-react'
import {
  useListReadingTextsQuery,
  useCreateReadingTextMutation,
  useUpdateReadingTextMutation,
  useDeleteReadingTextMutation,
  useUploadTextPdfMutation,
} from '@/services'
import type { ReadingText, ReadingTextPayload } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { extractErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/datetime'
import { ConfirmDialog, EmptyState, PageHeader, SortableList } from '@/components/common'
import {
  Badge,
  Button,
  Dialog,
  Field,
  Input,
  SegmentedControl,
  Skeleton,
  Switch,
  Textarea,
} from '@/components/ui'

const toPayload = (t: ReadingText, orderIndex = t.orderIndex): ReadingTextPayload => ({
  title: t.title,
  titleKy: t.titleKy ?? undefined,
  content: t.content ?? undefined,
  contentKy: t.contentKy ?? undefined,
  pdfUrl: t.pdfKey ?? undefined,
  free: t.free,
  orderIndex,
  active: t.active,
})

/** «Тексттер» library — texts bought via the ALL_TEXTS product (or marked free). */
export function ReadingTextsPage() {
  useDocumentTitle('Библиотека текстов')
  const { data: texts, isLoading } = useListReadingTextsQuery()
  const [updateText] = useUpdateReadingTextMutation()
  const [deleteText, { isLoading: hiding }] = useDeleteReadingTextMutation()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ReadingText | null>(null)
  const [toHide, setToHide] = useState<ReadingText | null>(null)
  const [ordered, setOrdered] = useState<ReadingText[] | null>(null)

  const sorted = [...(texts ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)
  const list = ordered ?? sorted

  const persistOrder = async (next: ReadingText[]) => {
    setOrdered(next)
    const changed = next.map((t, i) => ({ t, i })).filter(({ t, i }) => t.orderIndex !== i)
    try {
      for (const { t, i } of changed) {
        await updateText({ id: t.id, body: toPayload(t, i) }).unwrap()
      }
      if (changed.length) toast.success('Порядок обновлён')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setOrdered(null)
    }
  }

  const toggleFree = async (t: ReadingText, free: boolean) => {
    try {
      await updateText({ id: t.id, body: { ...toPayload(t), free } }).unwrap()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Библиотека текстов"
        description="Раздел «Тексттер» в приложении. Открывается покупкой «Все тексты»; бесплатные видны всем."
        actions={
          <Button onClick={openNew}>
            <Plus size={15} /> Добавить текст
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title="Пока нет текстов"
          description="Добавьте текст вручную или загрузите PDF."
          action={
            <Button onClick={openNew}>
              <Plus size={15} /> Добавить первый текст
            </Button>
          }
        />
      ) : (
        <SortableList
          items={list}
          getId={t => t.id}
          onReorder={next => persistOrder(next)}
          renderItem={(t, handle) => (
            <div className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2.5">
              {handle}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium">{t.title}</span>
                  {t.free ? (
                    <Badge tone="success">Бесплатный</Badge>
                  ) : (
                    <Badge tone="warning">Платный</Badge>
                  )}
                  {t.pdfKey && <Badge tone="info">PDF</Badge>}
                  {!t.active && <Badge tone="neutral">Скрыт</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.content ? `${t.content.length.toLocaleString('ru-RU')} симв.` : 'без текста'} ·{' '}
                  {formatDate(t.createdAt)}
                </p>
              </div>
              {t.pdfUrl && (
                <a
                  href={t.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink size={12} /> Открыть PDF
                </a>
              )}
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Switch checked={t.free} onChange={v => toggleFree(t, v)} label="Бесплатный" />
                бесплатно
              </label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(t)
                  setFormOpen(true)
                }}
              >
                <Pencil size={14} />
              </Button>
              {t.active && (
                <Button size="sm" variant="ghost" onClick={() => setToHide(t)}>
                  <EyeOff size={14} />
                </Button>
              )}
            </div>
          )}
        />
      )}

      <ReadingTextFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        text={editing}
        nextOrder={list.length}
      />

      <ConfirmDialog
        open={Boolean(toHide)}
        onClose={() => setToHide(null)}
        onConfirm={async () => {
          if (!toHide) return
          try {
            await deleteText(toHide.id).unwrap()
            toast.success('Текст скрыт')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setToHide(null)
          }
        }}
        title="Скрыть текст?"
        description="Текст пропадёт из приложения. Вернуть можно в форме редактирования (флаг «Показывать»)."
        confirmLabel="Скрыть"
        destructive
        loading={hiding}
      />
    </div>
  )
}

function ReadingTextFormDialog({
  open,
  onClose,
  text,
  nextOrder,
}: {
  open: boolean
  onClose: () => void
  text: ReadingText | null
  nextOrder: number
}) {
  const [createText, { isLoading: creating }] = useCreateReadingTextMutation()
  const [updateText, { isLoading: updating }] = useUpdateReadingTextMutation()
  const [uploadPdf, { isLoading: uploading }] = useUploadTextPdfMutation()
  const fileRef = useRef<HTMLInputElement>(null)

  const [lang, setLang] = useState<'ru' | 'ky'>('ru')
  const [title, setTitle] = useState('')
  const [titleKy, setTitleKy] = useState('')
  const [content, setContent] = useState('')
  const [contentKy, setContentKy] = useState('')
  const [pdfKey, setPdfKey] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [free, setFree] = useState(false)
  const [active, setActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setLang('ru')
    setTitle(text?.title ?? '')
    setTitleKy(text?.titleKy ?? '')
    setContent(text?.content ?? '')
    setContentKy(text?.contentKy ?? '')
    setPdfKey(text?.pdfKey ?? null)
    setPdfName(text?.pdfKey ? (text.pdfKey.split('/').pop() ?? null) : null)
    setFree(text?.free ?? false)
    setActive(text?.active ?? true)
    setErrors({})
  }, [open, text])

  const onPdf = async (file: File) => {
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      toast.error('Только PDF')
      return
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.error('PDF больше 30 МБ')
      return
    }
    try {
      const res = await uploadPdf(file).unwrap()
      setPdfKey(res.key)
      setPdfName(file.name)
      setErrors(e => ({ ...e, body: '' }))
      toast.success('PDF загружен')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const save = async () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Название обязательно'
    if (!content.trim() && !pdfKey) errs.body = 'Нужен текст (RU) или PDF'
    setErrors(errs)
    if (Object.keys(errs).length) {
      setLang('ru')
      return
    }
    const body: ReadingTextPayload = {
      title: title.trim(),
      titleKy: titleKy.trim() || undefined,
      content: content.trim() ? content : undefined,
      contentKy: contentKy.trim() ? contentKy : undefined,
      pdfUrl: pdfKey ?? undefined,
      free,
      orderIndex: text?.orderIndex ?? nextOrder,
      active,
    }
    try {
      if (text) {
        await updateText({ id: text.id, body }).unwrap()
        toast.success('Текст сохранён')
      } else {
        await createText(body).unwrap()
        toast.success('Текст добавлен')
      }
      onClose()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={text ? 'Редактировать текст' : 'Новый текст'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={save} loading={creating || updating} disabled={uploading}>
            Сохранить
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SegmentedControl<'ru' | 'ky'>
          options={[
            { value: 'ru', label: 'RU' },
            { value: 'ky', label: titleKy || contentKy ? 'KY ✓' : 'KY' },
          ]}
          value={lang}
          onChange={setLang}
        />
        <Field
          label="Название"
          required={lang === 'ru'}
          error={lang === 'ru' ? errors.title : undefined}
        >
          <Input
            value={lang === 'ru' ? title : titleKy}
            onChange={e => (lang === 'ru' ? setTitle : setTitleKy)(e.target.value)}
          />
        </Field>
        <Field
          label="Текст"
          hint={
            lang === 'ky'
              ? 'Если не заполнить, покажется русский текст'
              : 'Можно оставить пустым, если загружен PDF'
          }
          error={lang === 'ru' ? errors.body || undefined : undefined}
        >
          <Textarea
            value={lang === 'ru' ? content : contentKy}
            onChange={e => (lang === 'ru' ? setContent : setContentKy)(e.target.value)}
            rows={12}
          />
        </Field>

        <Field label="PDF (до 30 МБ)">
          <div className="flex flex-wrap items-center gap-2">
            {pdfKey ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-sm">
                {pdfName ?? pdfKey}
                {text?.pdfUrl && pdfKey === text.pdfKey && (
                  <a href={text.pdfUrl} target="_blank" rel="noreferrer" className="text-primary">
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPdfKey(null)
                    setPdfName(null)
                  }}
                  className="text-muted-foreground hover:text-error"
                  aria-label="Убрать PDF"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              loading={uploading}
            >
              <FileUp size={14} /> {pdfKey ? 'Заменить PDF' : 'Загрузить PDF'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) void onPdf(f)
                e.target.value = ''
              }}
            />
          </div>
        </Field>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={free} onChange={setFree} label="Бесплатный" />
            Бесплатный (виден без покупки)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={active} onChange={setActive} label="Показывать" />
            Показывать в приложении
          </label>
        </div>
      </div>
    </Dialog>
  )
}
