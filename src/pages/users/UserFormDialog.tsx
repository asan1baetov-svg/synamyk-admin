import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useUpdateUserMutation } from '@/services'
import type { AdminUser } from '@/types/api'
import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
import { Dialog, Button, Input, Field, Select, Switch } from '@/components/ui'
import { ConfirmDialog } from '@/components/common'

const schema = z.object({
  firstName: z.string().min(1, 'Обязательное поле'),
  lastName: z.string().optional(),
  email: z.string().email('Некорректный e-mail').or(z.literal('')).optional(),
  phone: z.string().regex(/^996\d{9}$/, 'Формат: 996XXXXXXXXX'),
})
type FormValues = z.infer<typeof schema>

export function UserFormDialog({
  open,
  onClose,
  user,
}: {
  open: boolean
  onClose: () => void
  user: AdminUser | null
}) {
  const [updateUser, { isLoading }] = useUpdateUserMutation()
  const [active, setActive] = useState(true)
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER')
  const [roleConfirm, setRoleConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open || !user) return
    const [first, ...rest] = user.fullName.trim().split(/\s+/)
    reset({
      firstName: first ?? '',
      lastName: rest.join(' '),
      email: user.email ?? '',
      phone: user.phone ?? '',
    })
    setActive(user.active)
    setRole(user.role)
  }, [open, user, reset])

  const submit = async (values: FormValues) => {
    if (!user) return
    if (role === 'ADMIN' && user.role !== 'ADMIN' && !roleConfirm) {
      setRoleConfirm(true)
      return
    }
    try {
      await updateUser({
        id: user.id,
        data: {
          firstName: values.firstName,
          lastName: values.lastName || undefined,
          email: values.email || undefined,
          phone: values.phone,
          active,
          role,
        },
      }).unwrap()
      toast.success('Пользователь обновлён')
      setRoleConfirm(false)
      onClose()
    } catch (err) {
      const fe = extractFieldErrors(err)
      if (fe)
        Object.entries(fe).forEach(([k, v]) => setError(k as keyof FormValues, { message: v }))
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title="Редактировать пользователя"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSubmit(submit)} loading={isLoading}>
              Сохранить
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Имя" required error={errors.firstName?.message}>
              <Input {...register('firstName')} />
            </Field>
            <Field label="Фамилия" error={errors.lastName?.message}>
              <Input {...register('lastName')} />
            </Field>
          </div>
          <Field label="Телефон" required error={errors.phone?.message}>
            <Input {...register('phone')} placeholder="996700123456" />
          </Field>
          <Field label="E-mail" error={errors.email?.message}>
            <Input type="email" {...register('email')} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Роль">
              <Select value={role} onChange={e => setRole(e.target.value as 'USER' | 'ADMIN')}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </Select>
            </Field>
            <Field label="Активен">
              <div className="pt-1.5">
                <Switch checked={active} onChange={setActive} />
              </div>
            </Field>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={roleConfirm}
        onClose={() => setRoleConfirm(false)}
        onConfirm={handleSubmit(submit)}
        title="Выдать права администратора?"
        description="Роль ADMIN даёт полный доступ ко всей админ-панели: пользователи, платежи, рассылки, сброс рейтинга. Убедитесь, что это доверенное лицо."
        confirmLabel="Сделать администратором"
        destructive
        confirmWord="ADMIN"
      />
    </>
  )
}
