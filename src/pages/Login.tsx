import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useLoginMutation } from '@/services'
import { saveAuth, clearAuth } from '@/lib/auth'
import { extractErrorMessage } from '@/lib/errors'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const schema = z.object({
  phoneDigits: z.string().regex(/^\d{9}$/, 'Введите 9 цифр номера'),
  password: z.string().min(1, 'Введите пароль'),
})
type FormValues = z.infer<typeof schema>

function formatMask(digits: string): string {
  const d = digits.slice(0, 9)
  let out = '+996'
  if (d.length > 0) out += ` (${d.slice(0, 3)}`
  if (d.length >= 3) out += ')'
  if (d.length > 3) out += ` ${d.slice(3, 5)}`
  if (d.length > 5) out += `-${d.slice(5, 7)}`
  if (d.length > 7) out += `-${d.slice(7, 9)}`
  return out
}

export function Login() {
  useDocumentTitle('Вход')
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [notAdmin, setNotAdmin] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phoneDigits: '', password: '' },
  })

  const phoneDigits = watch('phoneDigits')

  const onSubmit = async (values: FormValues) => {
    setNotAdmin(false)
    try {
      const res = await login({
        phone: `996${values.phoneDigits}`,
        password: values.password,
      }).unwrap()

      if (res.role !== 'ADMIN') {
        clearAuth()
        setNotAdmin(true)
        return
      }
      saveAuth(res)
      toast.success('Добро пожаловать')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm"
      >
        <h1 className="text-center text-2xl font-bold text-foreground-strong">Synamyk Admin</h1>
        <p className="mt-1 mb-6 text-center text-sm text-muted-foreground">
          Вход в административную панель
        </p>

        {notAdmin && (
          <div className="mb-4 rounded-md bg-error-soft px-3 py-2 text-sm text-error">
            Доступ только для администраторов
          </div>
        )}

        <label className="mb-1 block text-sm font-medium text-foreground">Номер телефона</label>
        <input
          inputMode="numeric"
          autoComplete="tel"
          value={formatMask(phoneDigits)}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '')
            // drop leading country code if user pasted a full number
            const national = digits.startsWith('996') ? digits.slice(3) : digits
            setValue('phoneDigits', national.slice(0, 9), { shouldValidate: true })
          }}
          placeholder="+996 (___) __-__-__"
          className="w-full rounded-md border border-border-input px-3 py-2 text-sm outline-none focus:border-primary"
        />
        {errors.phoneDigits && (
          <p className="mt-1 text-xs text-error">{errors.phoneDigits.message}</p>
        )}

        <label className="mt-4 mb-1 block text-sm font-medium text-foreground">Пароль</label>
        <input
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className="w-full rounded-md border border-border-input px-3 py-2 text-sm outline-none focus:border-primary"
        />
        {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {isLoading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
