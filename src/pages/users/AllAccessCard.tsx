import { useState } from 'react'
import { toast } from 'sonner'
import {
  useGrantAllAccessMutation,
  useRevokeAllAccessMutation,
  useListProductsQuery,
} from '@/services'
import type { ProductCode } from '@/types/api'
import { extractErrorMessage } from '@/lib/errors'
import { fromLocalInput } from '@/lib/schedule'
import { ConfirmDialog } from '@/components/common'
import { Button, Card, CardBody, CardHeader, SegmentedControl } from '@/components/ui'

const PRODUCTS: { code: ProductCode; fallback: string }[] = [
  { code: 'ALL_TESTS', fallback: 'Все тесты' },
  { code: 'ALL_TEXTS', fallback: 'Все тексты' },
]

type Preset = '30' | '90' | '365' | 'forever' | 'date'

/**
 * Manual grant of the catalogue products. The API has no "list user's all-access"
 * endpoint, so the card only grants / revokes — it can't show the current state.
 */
export function AllAccessCard({ userId, userName }: { userId: number; userName: string }) {
  const { data: products } = useListProductsQuery()
  const [grant, { isLoading: granting }] = useGrantAllAccessMutation()
  const [revoke, { isLoading: revoking }] = useRevokeAllAccessMutation()
  const [preset, setPreset] = useState<Preset>('forever')
  const [date, setDate] = useState('')
  const [toRevoke, setToRevoke] = useState<ProductCode | null>(null)

  const titleOf = (code: ProductCode) =>
    products?.find(p => p.code === code)?.title ?? PRODUCTS.find(p => p.code === code)!.fallback

  const doGrant = async (product: ProductCode) => {
    if (preset === 'date' && !date) {
      toast.error('Выберите дату окончания')
      return
    }
    try {
      await grant({
        userId,
        product,
        durationDays: preset === 'forever' || preset === 'date' ? null : Number(preset),
        expiresAt: preset === 'date' ? fromLocalInput(date) : null,
      }).unwrap()
      toast.success(`«${titleOf(product)}» выдан`)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader
        title="Все тесты / все тексты"
        description="Выдача продукта вручную. Повторная выдача перезаписывает срок."
      />
      <CardBody className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<Preset>
            options={[
              { value: '30', label: '30 дн' },
              { value: '90', label: '90 дн' },
              { value: '365', label: 'Год' },
              { value: 'forever', label: 'Бессрочно' },
              { value: 'date', label: 'До даты' },
            ]}
            value={preset}
            onChange={setPreset}
          />
          {preset === 'date' && (
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="h-9 rounded-md border border-border-input px-2 text-sm"
            />
          )}
        </div>
        <div className="space-y-2">
          {PRODUCTS.map(({ code }) => (
            <div key={code} className="flex flex-wrap items-center gap-2">
              <span className="w-32 text-sm font-medium">{titleOf(code)}</span>
              <Button size="sm" onClick={() => doGrant(code)} loading={granting}>
                Выдать
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setToRevoke(code)}>
                Отозвать
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          API не отдаёт текущие выдачи этих продуктов — проверить статус можно в приложении
          пользователя или по платежам.
        </p>
      </CardBody>

      <ConfirmDialog
        open={toRevoke != null}
        onClose={() => setToRevoke(null)}
        onConfirm={async () => {
          if (!toRevoke) return
          try {
            await revoke({ userId, product: toRevoke }).unwrap()
            toast.success('Доступ отозван')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setToRevoke(null)
          }
        }}
        title={`Отозвать «${toRevoke ? titleOf(toRevoke) : ''}»?`}
        description={`${userName} потеряет доступ, даже если он был куплен.`}
        confirmLabel="Отозвать"
        destructive
        loading={revoking}
      />
    </Card>
  )
}
