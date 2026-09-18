import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CalendarClock } from 'lucide-react'
import {
  useListProductsQuery,
  useUpdateProductMutation,
  useAppConfigQuery,
  useSetOrtExamDateMutation,
} from '@/services'
import type { Product } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { extractErrorMessage } from '@/lib/errors'
import { formatDT } from '@/lib/datetime'
import { formatMoney } from '@/lib/format'
import { fromLocalInput, toLocalInput } from '@/lib/schedule'
import { PageHeader } from '@/components/common'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  Skeleton,
  Switch,
} from '@/components/ui'

export function ProductsPage() {
  useDocumentTitle('Продукты')
  const { data: products, isLoading } = useListProductsQuery()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Продукты"
        description="«Все тесты» и «Все тексты» — покупки, открывающие весь каталог. Выдать вручную можно на карточке пользователя."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading || !products
          ? [0, 1].map(i => <Skeleton key={i} className="h-64 w-full" />)
          : products.map(p => <ProductCard key={p.code} product={p} />)}
      </div>

      <ExamDateCard />
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [updateProduct, { isLoading }] = useUpdateProductMutation()
  const [price, setPrice] = useState(String(product.price ?? 0))
  const [oldPrice, setOldPrice] = useState(product.oldPrice != null ? String(product.oldPrice) : '')
  const [active, setActive] = useState(Boolean(product.available))

  useEffect(() => {
    setPrice(String(product.price ?? 0))
    setOldPrice(product.oldPrice != null ? String(product.oldPrice) : '')
    setActive(Boolean(product.available))
  }, [product])

  const priceNum = Number(price)
  const oldNum = oldPrice.trim() === '' ? null : Number(oldPrice)
  const priceError =
    !Number.isFinite(priceNum) || priceNum < 0
      ? 'Цена ≥ 0'
      : active && priceNum <= 0
        ? 'Чтобы продавать, цена должна быть больше 0'
        : null
  const oldError = oldNum != null && (!Number.isFinite(oldNum) || oldNum < 0) ? 'Цена ≥ 0' : null
  const dirty =
    priceNum !== product.price ||
    oldNum !== (product.oldPrice ?? null) ||
    active !== Boolean(product.available)

  const save = async () => {
    if (priceError || oldError) return
    try {
      await updateProduct({
        code: product.code,
        body: { price: priceNum, oldPrice: oldNum, active },
      }).unwrap()
      toast.success(`«${product.title}» сохранён`)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            {product.title}
            {product.available ? (
              <Badge tone="success">Продаётся</Badge>
            ) : (
              <Badge tone="neutral">Не продаётся</Badge>
            )}
          </span>
        }
        description={product.code}
        action={
          <Button
            size="sm"
            onClick={save}
            loading={isLoading}
            disabled={!dirty || Boolean(priceError || oldError)}
          >
            Сохранить
          </Button>
        }
      />
      <CardBody className="space-y-4">
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}
        {product.features && product.features.length > 0 && (
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {product.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Цена, сом" required error={priceError ?? undefined}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </Field>
          <Field
            label="Старая цена, сом"
            hint="Зачёркнутая цена в приложении"
            error={oldError ?? undefined}
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              value={oldPrice}
              placeholder="—"
              onChange={e => setOldPrice(e.target.value)}
            />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={active} onChange={setActive} label="Продаётся" />
          Продаётся
        </label>
        <p className="text-xs text-muted-foreground">
          Сейчас: {formatMoney(product.price)}
          {product.oldPrice != null && <> (было {formatMoney(product.oldPrice)})</>}
        </p>
      </CardBody>
    </Card>
  )
}

function ExamDateCard() {
  const { data: config, isLoading } = useAppConfigQuery()
  const [setExamDate, { isLoading: saving }] = useSetOrtExamDateMutation()
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(toLocalInput(config?.ortExamDate))
  }, [config?.ortExamDate])

  const save = async (date: string | null) => {
    try {
      await setExamDate(date).unwrap()
      toast.success(date ? 'Дата ОРТ сохранена' : 'Дата ОРТ сброшена')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const days =
    config?.secondsUntilExam != null
      ? `${Math.floor(config.secondsUntilExam / 86400)} күн ${Math.floor((config.secondsUntilExam % 86400) / 3600)} саат калды`
      : null

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <CalendarClock size={16} /> Дата ОРТ
          </span>
        }
        description="Счётчик «N күн M саат калды» на главном экране приложения. Время — Бишкек."
      />
      <CardBody className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-9 w-72" />
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <input
              type="datetime-local"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="h-9 rounded-md border border-border-input px-2 text-sm"
            />
            <Button
              size="sm"
              onClick={() => save(fromLocalInput(value))}
              loading={saving}
              disabled={!value || value === toLocalInput(config?.ortExamDate)}
            >
              Сохранить
            </Button>
            {config?.ortExamDate && (
              <Button size="sm" variant="ghost" onClick={() => save(null)} disabled={saving}>
                Убрать дату
              </Button>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Сейчас: {config?.ortExamDate ? formatDT(config.ortExamDate) : 'не задана'}
          {days && config?.secondsUntilExam ? ` · ${days}` : ''}
        </p>
      </CardBody>
    </Card>
  )
}
