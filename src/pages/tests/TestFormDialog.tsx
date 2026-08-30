import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCreateTestMutation, useUpdateTestMutation, useTestSubjectsQuery } from '@/services'
import type { AdminTest, TestPayload } from '@/types/api'
import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
import { Dialog, Button, Input, Field } from '@/components/ui'
import { BilingualProvider, BilingualField, ImageUploader } from '@/components/common'

const schema = z.object({
  title: z.string().min(1, 'Обязательное поле'),
  titleKy: z.string().optional(),
  description: z.string().optional(),
  descriptionKy: z.string().optional(),
  subject: z.string().optional(),
  price: z.number().min(0, 'Не меньше 0'),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  /** present = edit mode */
  test?: AdminTest | null
  /** subject fallback from the list row (AdminTestResponse has no subject) */
  subjectHint?: string
}

export function TestFormDialog({ open, onClose, test, subjectHint }: Props) {
  const editing = Boolean(test)
  const { data: subjects } = useTestSubjectsQuery()
  const [createTest, { isLoading: creating }] = useCreateTestMutation()
  const [updateTest, { isLoading: updating }] = useUpdateTestMutation()
  const [iconKey, setIconKey] = useState<string | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', price: 0 },
  })

  useEffect(() => {
    if (!open) return
    reset({
      title: test?.title ?? '',
      titleKy: test?.titleKy ?? '',
      description: test?.description ?? '',
      descriptionKy: test?.descriptionKy ?? '',
      subject: test?.subject ?? subjectHint ?? '',
      price: test?.price ?? 0,
    })
    setIconKey(test?.iconUrl ?? null)
    setIconPreview(test?.iconUrl ?? null)
  }, [open, test, subjectHint, reset])

  const onSubmit = async (values: FormValues) => {
    const payload: TestPayload = {
      title: values.title,
      titleKy: values.titleKy || undefined,
      description: values.description || undefined,
      descriptionKy: values.descriptionKy || undefined,
      subject: values.subject || undefined,
      price: values.price,
      iconUrl: iconKey ?? undefined,
    }
    try {
      if (editing && test) {
        await updateTest({ id: test.id, body: payload }).unwrap()
        toast.success('Тест обновлён')
      } else {
        await createTest(payload).unwrap()
        toast.success('Тест создан')
      }
      onClose()
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([k, v]) =>
          setError(k as keyof FormValues, { message: v })
        )
      }
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Редактировать тест' : 'Новый тест'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={creating || updating}>
            {editing ? 'Сохранить' : 'Создать'}
          </Button>
        </>
      }
    >
      <BilingualProvider>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <BilingualField
            label="Название"
            required
            ru={watch('title') ?? ''}
            ky={watch('titleKy') ?? ''}
            onRu={v => setValue('title', v)}
            onKy={v => setValue('titleKy', v)}
            error={errors.title?.message}
          >
            {({ value, onChange }) => (
              <Input value={value} onChange={e => onChange(e.target.value)} />
            )}
          </BilingualField>

          <BilingualField
            label="Описание"
            ru={watch('description') ?? ''}
            ky={watch('descriptionKy') ?? ''}
            onRu={v => setValue('description', v)}
            onKy={v => setValue('descriptionKy', v)}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Предмет" hint="0 в цене = бесплатный тест">
              <Input list="subject-list" {...register('subject')} />
              <datalist id="subject-list">
                {subjects?.map(s => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="Цена, сом" required error={errors.price?.message}>
              <Input
                type="number"
                step="0.01"
                min={0}
                {...register('price', { valueAsNumber: true })}
              />
            </Field>
          </div>

          <Field label="Иконка">
            <ImageUploader
              type="TEST_ICON"
              value={iconKey}
              previewUrl={iconPreview}
              onChange={(key, url) => {
                setIconKey(key)
                setIconPreview(url ?? null)
              }}
            />
          </Field>
        </form>
      </BilingualProvider>
    </Dialog>
  )
}
