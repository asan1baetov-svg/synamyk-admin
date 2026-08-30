import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import {
  useListAccessByTestQuery,
  useListAccessByUserQuery,
  useRevokeAccessMutation,
  useListTestsQuery,
} from '@/services'
import type { AccessGrant } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { extractErrorMessage } from '@/lib/errors'
import { PageHeader, ConfirmDialog } from '@/components/common'
import { Card, CardHeader, CardBody, Select, Badge, Button, Input } from '@/components/ui'
import { formatDT } from '@/lib/datetime'
import { formatPhone } from '@/lib/format'
import { AccessGrantForm } from './AccessGrantForm'

function StatusBadge({ status }: { status: AccessGrant['status'] }) {
  if (status === 'PERMANENT') return <Badge tone="info">Бессрочный</Badge>
  if (status === 'ACTIVE') return <Badge tone="success">Активен</Badge>
  return <Badge tone="neutral">Истёк</Badge>
}

export function AccessPage() {
  useDocumentTitle('Доступы к тестам')
  const [mode, setMode] = useState<'test' | 'user'>('test')
  const [testId, setTestId] = useState<number | undefined>()
  const [userId, setUserId] = useState<number | undefined>()
  const [userIdInput, setUserIdInput] = useState('')
  const [revoke, setRevoke] = useState<AccessGrant | null>(null)

  const { data: tests } = useListTestsQuery({ size: 200 })
  const { data: byTest, isFetching: loadingTest } = useListAccessByTestQuery(testId!, {
    skip: mode !== 'test' || !testId,
  })
  const { data: byUser, isFetching: loadingUser } = useListAccessByUserQuery(userId!, {
    skip: mode !== 'user' || !userId,
  })
  const [revokeAccess, { isLoading: revoking }] = useRevokeAccessMutation()

  const grants = mode === 'test' ? byTest : byUser
  const loading = mode === 'test' ? loadingTest : loadingUser

  return (
    <div className="space-y-6">
      <PageHeader
        title="Доступы к тестам"
        description="Ручная выдача и отзыв доступа к платным тестам"
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader title="Выдать доступ" />
          <CardBody>
            <AccessGrantForm onGranted={() => toast.success('Обновите список ниже')} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Выданные доступы"
            action={
              <div className="flex items-center gap-2">
                <Select
                  value={mode}
                  onChange={e => setMode(e.target.value as 'test' | 'user')}
                  className="w-40"
                >
                  <option value="test">По тесту</option>
                  <option value="user">По пользователю</option>
                </Select>
                {mode === 'test' ? (
                  <Select
                    value={testId ?? ''}
                    onChange={e => setTestId(Number(e.target.value) || undefined)}
                    className="w-56"
                  >
                    <option value="">— тест —</option>
                    {tests?.content.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault()
                      setUserId(Number(userIdInput) || undefined)
                    }}
                    className="flex gap-1"
                  >
                    <Input
                      placeholder="ID пользователя"
                      value={userIdInput}
                      onChange={e => setUserIdInput(e.target.value)}
                      className="w-32"
                    />
                    <Button size="sm" type="submit">
                      OK
                    </Button>
                  </form>
                )}
              </div>
            }
          />
          <CardBody className="p-0">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Загрузка…</p>
            ) : !grants || grants.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                {(mode === 'test' && !testId) || (mode === 'user' && !userId)
                  ? 'Выберите тест или пользователя.'
                  : 'Нет выданных доступов.'}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50 text-left text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-2">Пользователь</th>
                    <th className="px-4 py-2">Тест</th>
                    <th className="px-4 py-2">Выдан</th>
                    <th className="px-4 py-2">Истекает</th>
                    <th className="px-4 py-2">Статус</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {grants.map(g => (
                    <tr key={g.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2">
                        {g.userName}
                        <div className="text-xs text-muted-foreground">
                          {formatPhone(g.userPhone)}
                        </div>
                      </td>
                      <td className="px-4 py-2">{g.testTitle}</td>
                      <td className="px-4 py-2">{formatDT(g.grantedAt)}</td>
                      <td className="px-4 py-2">{formatDT(g.expiresAt)}</td>
                      <td className="px-4 py-2">
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setRevoke(g)}>
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(revoke)}
        onClose={() => setRevoke(null)}
        onConfirm={async () => {
          if (!revoke) return
          try {
            await revokeAccess({
              userId: revoke.userId,
              testId: revoke.testId,
            }).unwrap()
            toast.success('Доступ отозван')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setRevoke(null)
          }
        }}
        title="Отозвать доступ?"
        description={`${revoke?.userName} потеряет доступ к «${revoke?.testTitle}».`}
        confirmLabel="Отозвать"
        destructive
        loading={revoking}
      />
    </div>
  )
}
