import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import {
  useCreateSubTestMutation,
  useUpdateSubTestMutation,
  useUpdateSubTestScheduleMutation,
} from '@/services'
import type { AdminSubTest, SchedulePayload, SubTestPayload } from '@/types/api'
import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
import { Dialog, Button, Input, Field, Switch } from '@/components/ui'
import { BilingualProvider, BilingualField, FreeWindowEditor } from '@/components/common'

const schema = z
  .object({
    title: z.string().min(1, 'Обязательное поле'),
    titleKy: z.string().optional(),
    levelName: z.string().min(1, 'Обязательное поле'),
    levelNameKy: z.string().optional(),
    levelOrder: z.number().int().min(0),
    durationMinutes: z.number().int().min(1, 'Минимум 1 минута'),
    isPaid: z.boolean(),
    price: z.number().min(0, 'Не меньше 0'),
  })
  .refine(v => !v.isPaid || v.price > 0, {
    message: 'Платный подтест должен иметь цену больше 0',
    path: ['price'],
  })
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  testId: number
  subTest?: AdminSubTest | null
  nextOrder?: number
}

export function SubTestFormDialog({ open, onClose, testId, subTest, nextOrder }: Props) {
  const editing = Boolean(subTest)
  const [createSubTest, { isLoading: creating }] = useCreateSubTestMutation()
  const [updateSubTest, { isLoading: updating }] = useUpdateSubTestMutation()
  const [updateSchedule, { isLoading: savingSchedule }] = useUpdateSubTestScheduleMutation()

  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      levelName: '',
      levelOrder: 0,
      durationMinutes: 20,
      isPaid: false,
      price: 0,
    },
  })

  const isPaid = watch('isPaid')

  useEffect(() => {
    if (!open) return
    reset({
      title: subTest?.title ?? '',
      titleKy: subTest?.titleKy ?? '',
      levelName: subTest?.levelName ?? '',
      levelNameKy: subTest?.levelNameKy ?? '',
      levelOrder: subTest?.levelOrder ?? nextOrder ?? 0,
      durationMinutes: subTest?.durationMinutes ?? 20,
      isPaid: subTest?.isPaid ?? false,
      price: subTest?.price ?? 0,
    })
  }, [open, subTest, nextOrder, reset])

  const onSubmit = async (values: FormValues) => {
    const body: SubTestPayload = {
      title: values.title,
      titleKy: values.titleKy || undefined,
      levelName: values.levelName,
      levelNameKy: values.levelNameKy || undefined,
      levelOrder: values.levelOrder,
      isPaid: values.isPaid,
      price: values.isPaid ? values.price : 0,
      durationMinutes: values.durationMinutes,
    }
    try {
      if (editing && subTest) {
        await updateSubTest({ subTestId: subTest.id, testId, body }).unwrap()
        toast.success('Подтест обновлён')
      } else {
        await createSubTest({ testId, body }).unwrap()
        toast.success('Подтест создан')
      }
      onClose()
    } catch (err) {
      const fe = extractFieldErrors(err)
      if (fe) {
        Object.entries(fe).forEach(([k, v]) => setError(k as keyof FormValues, { message: v }))
      }
      toast.error(extractErrorMessage(err))
    }
  }

  const saveSchedule = async (body: SchedulePayload) => {
    if (!subTest) return
    try {
      await updateSchedule({ subTestId: subTest.id, testId, body }).unwrap()
      toast.success('Бесплатный период сохранён')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Редактировать подтест' : 'Новый подтест'}
      size="md"
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
          {!editing && (
            <div className="flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Пользователям с активным доступом к этому тесту придёт push-уведомление о новом
              подтесте.
            </div>
          )}

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
            label="Название уровня"
            required
            ru={watch('levelName') ?? ''}
            ky={watch('levelNameKy') ?? ''}
            onRu={v => setValue('levelName', v)}
            onKy={v => setValue('levelNameKy', v)}
            error={errors.levelName?.message}
          >
            {({ value, onChange }) => (
              <Input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="1-уровень"
              />
            )}
          </BilingualField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Порядок" error={errors.levelOrder?.message}>
              <Input type="number" min={0} {...register('levelOrder', { valueAsNumber: true })} />
            </Field>
            <Field label="Длительность, мин" required error={errors.durationMinutes?.message}>
              <Input
                type="number"
                min={1}
                {...register('durationMinutes', { valueAsNumber: true })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Платный подтест">
              <div className="flex h-9 items-center">
                <Switch
                  checked={isPaid}
                  onChange={v => setValue('isPaid', v, { shouldValidate: true })}
                />
              </div>
            </Field>
            <Field label="Цена подтеста, сом" error={errors.price?.message}>
              <Input
                type="number"
                min={0}
                step="0.01"
                disabled={!isPaid}
                {...register('price', { valueAsNumber: true })}
              />
            </Field>
          </div>

          {editing && subTest && (
            <Field label="Бесплатный период">
              <FreeWindowEditor
                freeFrom={subTest.freeFrom}
                freeUntil={subTest.freeUntil}
                saving={savingSchedule}
                onSave={saveSchedule}
              />
            </Field>
          )}
        </form>
      </BilingualProvider>
    </Dialog>
  )
}
