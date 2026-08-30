import { useCallback, useRef, useState } from 'react'
import { UploadCloud, X, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useUploadImageMutation } from '@/services'
import { extractErrorMessage } from '@/lib/errors'
import type { UploadType } from '@/types/api'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  type: UploadType
  /** objectKey stored on the entity */
  value?: string | null
  /** presigned URL from a read response, or an external URL */
  previewUrl?: string | null
  onChange: (objectKey: string | null, previewUrl?: string | null) => void
  className?: string
}

const MAX_BYTES = 10 * 1024 * 1024

export function ImageUploader({
  type,
  value,
  previewUrl,
  onChange,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [uploadImage, { isLoading }] = useUploadImageMutation()

  const preview = previewUrl || (value && /^https?:\/\//.test(value) ? value : null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Только изображения')
        return
      }
      if (file.size > MAX_BYTES) {
        toast.error('Файл больше 10 МБ')
        return
      }
      try {
        const res = await uploadImage({ file, type }).unwrap()
        onChange(res.objectKey, res.url)
      } catch (err) {
        toast.error(extractErrorMessage(err))
      }
    },
    [onChange, type, uploadImage]
  )

  return (
    <div className={cn('space-y-2', className)}>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt=""
            className="h-32 w-32 rounded-md border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => {
              onChange(null, null)
              setUrlInput('')
            }}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow ring-1 ring-border hover:bg-neutral-50"
            aria-label="Удалить изображение"
          >
            <X size={14} />
          </button>
        </div>
      ) : urlMode ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="https://example.com/pic.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
          />
          <Button
            size="sm"
            type="button"
            onClick={() => {
              if (!/^https?:\/\//.test(urlInput)) {
                toast.error('Введите корректный URL')
                return
              }
              onChange(urlInput, urlInput)
              setUrlMode(false)
            }}
          >
            OK
          </Button>
          <Button size="sm" variant="ghost" type="button" onClick={() => setUrlMode(false)}>
            Отмена
          </Button>
        </div>
      ) : (
        <div
          onDragOver={e => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex h-32 w-full max-w-md cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-sm text-muted-foreground transition-colors',
            dragOver && 'border-primary bg-primary-soft/40'
          )}
        >
          <UploadCloud size={22} />
          {isLoading ? (
            <span>Загрузка…</span>
          ) : (
            <>
              <span>Перетащите изображение или нажмите</span>
              <span className="text-xs">до 10 МБ</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {!preview && !urlMode && (
        <button
          type="button"
          onClick={() => setUrlMode(true)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <LinkIcon size={12} /> Вставить ссылку вручную
        </button>
      )}
    </div>
  )
}
