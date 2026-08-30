import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useGetVideoQuery,
  useListTestsQuery,
} from '@/services'
import type { AdminVideoListItem, VideoPayload } from '@/types/api'
import { extractErrorMessage } from '@/lib/errors'
import { youtubeId, youtubeThumb } from '@/lib/youtube'
import { Dialog, Button, Input, Field, Select } from '@/components/ui'
import { BilingualProvider, BilingualField, ImageUploader } from '@/components/common'

export function VideoFormDialog({
  open,
  onClose,
  item,
}: {
  open: boolean
  onClose: () => void
  item: AdminVideoListItem | null
}) {
  const editing = Boolean(item)
  const { data: full } = useGetVideoQuery(item?.id ?? 0, { skip: !item })
  const { data: tests } = useListTestsQuery({ size: 200 })
  const [createVideo, { isLoading: creating }] = useCreateVideoMutation()
  const [updateVideo, { isLoading: updating }] = useUpdateVideoMutation()

  const [title, setTitle] = useState('')
  const [titleKy, setTitleKy] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionKy, setDescriptionKy] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [testId, setTestId] = useState<number | ''>('')
  const [orderIndex, setOrderIndex] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [thumbKey, setThumbKey] = useState<string | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (editing && full) {
      setTitle(full.title)
      setTitleKy(full.titleKy ?? '')
      setDescription(full.description ?? '')
      setDescriptionKy(full.descriptionKy ?? '')
      setVideoUrl(full.videoUrl)
      setTestId(full.testId ?? '')
      setOrderIndex(full.orderIndex)
      setDurationSeconds(full.durationSeconds)
      setThumbKey(full.thumbnailUrl ?? null)
      setThumbPreview(full.thumbnailUrl ?? null)
    } else if (!editing) {
      setTitle('')
      setTitleKy('')
      setDescription('')
      setDescriptionKy('')
      setVideoUrl('')
      setTestId('')
      setOrderIndex(0)
      setDurationSeconds(0)
      setThumbKey(null)
      setThumbPreview(null)
    }
  }, [open, editing, full])

  const ytId = youtubeId(videoUrl)

  const submit = async () => {
    if (!title.trim() || !videoUrl.trim()) {
      toast.error('Название и ссылка обязательны')
      return
    }
    const payload: VideoPayload = {
      title,
      titleKy: titleKy || undefined,
      description: description || undefined,
      descriptionKy: descriptionKy || undefined,
      videoUrl,
      testId: testId === '' ? null : Number(testId),
      orderIndex,
      durationSeconds,
      thumbnailUrl: thumbKey ?? undefined,
    }
    try {
      if (editing && item) {
        await updateVideo({ id: item.id, body: payload }).unwrap()
        toast.success('Видео обновлено')
      } else {
        await createVideo(payload).unwrap()
        toast.success('Видео добавлено')
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
      title={editing ? 'Редактировать видео' : 'Новое видео'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} loading={creating || updating}>
            {editing ? 'Сохранить' : 'Добавить'}
          </Button>
        </>
      }
    >
      <BilingualProvider>
        <div className="space-y-4">
          <BilingualField
            label="Название"
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
            label="Описание"
            ru={description}
            ky={descriptionKy}
            onRu={setDescription}
            onKy={setDescriptionKy}
          >
            {({ value, onChange }) => (
              <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border-input px-3 py-2 text-sm outline-none focus:border-primary"
              />
            )}
          </BilingualField>

          <Field label="Ссылка на видео (YouTube)" required>
            <Input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
            />
          </Field>

          {ytId && (
            <div className="space-y-2">
              <div className="aspect-video w-full max-w-md overflow-hidden rounded-md border border-border">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  className="h-full w-full"
                  allowFullScreen
                  title="preview"
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setThumbKey(youtubeThumb(ytId))
                  setThumbPreview(youtubeThumb(ytId))
                }}
              >
                Взять обложку из YouTube
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Привязка к тесту">
              <Select
                value={testId}
                onChange={e => setTestId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">— нет —</option>
                {tests?.content.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Порядок">
              <Input
                type="number"
                value={orderIndex}
                onChange={e => setOrderIndex(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Длительность, сек">
              <Input
                type="number"
                value={durationSeconds}
                onChange={e => setDurationSeconds(Number(e.target.value) || 0)}
              />
            </Field>
          </div>

          <Field label="Обложка">
            <ImageUploader
              type="VIDEO_THUMBNAIL"
              value={thumbKey}
              previewUrl={thumbPreview}
              onChange={(key, url) => {
                setThumbKey(key)
                setThumbPreview(url ?? null)
              }}
            />
          </Field>
        </div>
      </BilingualProvider>
    </Dialog>
  )
}
