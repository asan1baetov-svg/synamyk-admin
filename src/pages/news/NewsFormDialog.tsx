import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCreateNewsMutation, useUpdateNewsMutation, useGetNewsQuery } from '@/services'
import type { AdminNewsListItem, NewsPayload, NewsType } from '@/types/api'
import { extractErrorMessage } from '@/lib/errors'
import { toServerDateTime, parseServerDate } from '@/lib/datetime'
import { Dialog, Button, Input, Field, Select } from '@/components/ui'
import { BilingualProvider, BilingualField, ImageUploader } from '@/components/common'

const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function NewsFormDialog({
  open,
  onClose,
  item,
}: {
  open: boolean
  onClose: () => void
  item: AdminNewsListItem | null
}) {
  const editing = Boolean(item)
  const { data: full } = useGetNewsQuery(item?.id ?? 0, { skip: !item })
  const [createNews, { isLoading: creating }] = useCreateNewsMutation()
  const [updateNews, { isLoading: updating }] = useUpdateNewsMutation()

  const [title, setTitle] = useState('')
  const [titleKy, setTitleKy] = useState('')
  const [content, setContent] = useState('')
  const [contentKy, setContentKy] = useState('')
  const [type, setType] = useState<NewsType>('NEWS')
  const [publishedAt, setPublishedAt] = useState(toLocalInput(new Date()))
  const [coverKey, setCoverKey] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (editing && full) {
      setTitle(full.title)
      setTitleKy(full.titleKy ?? '')
      setContent(full.content)
      setContentKy(full.contentKy ?? '')
      setType(full.type)
      setPublishedAt(toLocalInput(parseServerDate(full.publishedAt)))
      setCoverKey(full.coverImageUrl ?? null)
      setCoverPreview(full.coverImageUrl ?? null)
    } else if (!editing) {
      setTitle('')
      setTitleKy('')
      setContent('')
      setContentKy('')
      setType('NEWS')
      setPublishedAt(toLocalInput(new Date()))
      setCoverKey(null)
      setCoverPreview(null)
    }
  }, [open, editing, full])

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Заголовок и текст обязательны')
      return
    }
    const payload: NewsPayload = {
      title,
      titleKy: titleKy || undefined,
      content,
      contentKy: contentKy || undefined,
      type,
      coverImageUrl: coverKey ?? undefined,
      publishedAt: toServerDateTime(new Date(publishedAt)),
    }
    try {
      if (editing && item) {
        await updateNews({ id: item.id, body: payload }).unwrap()
        toast.success('Новость обновлена')
      } else {
        await createNews(payload).unwrap()
        toast.success('Новость создана')
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
      title={editing ? 'Редактировать новость' : 'Новая новость'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} loading={creating || updating}>
            {editing ? 'Сохранить' : 'Опубликовать'}
          </Button>
        </>
      }
    >
      <BilingualProvider>
        <div className="space-y-4">
          <div className="rounded-md bg-info-soft px-3 py-2 text-xs text-info">
            Лента новостей публичная — доступна без авторизации всем.
          </div>

          <BilingualField
            label="Заголовок"
            required
            ru={title}
            ky={titleKy}
            onRu={setTitle}
            onKy={setTitleKy}
          >
            {({ value, onChange }) => (
              <Input value={value} onChange={e => onChange(e.target.value)} />
            )}
          </BilingualField>

          <BilingualField
            label="Текст"
            required
            ru={content}
            ky={contentKy}
            onRu={setContent}
            onKy={setContentKy}
          >
            {({ value, onChange }) => (
              <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-border-input px-3 py-2 text-sm outline-none focus:border-primary"
              />
            )}
          </BilingualField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Тип">
              <Select value={type} onChange={e => setType(e.target.value as NewsType)}>
                <option value="NEWS">Новость</option>
                <option value="ARTICLE">Статья</option>
                <option value="ANNOUNCEMENT">Объявление</option>
              </Select>
            </Field>
            <Field label="Дата публикации" required>
              <Input
                type="datetime-local"
                value={publishedAt}
                onChange={e => setPublishedAt(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Обложка">
            <ImageUploader
              type="NEWS_COVER"
              value={coverKey}
              previewUrl={coverPreview}
              onChange={(key, url) => {
                setCoverKey(key)
                setCoverPreview(url ?? null)
              }}
            />
          </Field>
        </div>
      </BilingualProvider>
    </Dialog>
  )
}
