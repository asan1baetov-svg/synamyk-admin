import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useGetUserQuery, useListAccessByUserQuery, useRevokeAccessMutation } from '@/services'
import type { AccessGrant } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { extractErrorMessage } from '@/lib/errors'
import { PageHeader, ConfirmDialog, UserAvatar } from '@/components/common'
import { Card, CardHeader, CardBody, Badge, Button, Skeleton } from '@/components/ui'
import { formatDT, formatDate } from '@/lib/datetime'
import { formatPhone } from '@/lib/format'
import { UserFormDialog } from './UserFormDialog'
import { AccessGrantForm } from '@/pages/access/AccessGrantForm'

export function UserDetail() {
  const { userId } = useParams()
  const id = Number(userId)
  const navigate = useNavigate()
  const { data: user, isLoading } = useGetUserQuery(id)
  useDocumentTitle(user ? user.fullName : 'Пользователь')

  const { data: grants } = useListAccessByUserQuery(id)
  const [revokeAccess, { isLoading: revoking }] = useRevokeAccessMutation()
  const [edit, setEdit] = useState(false)
  const [revoke, setRevoke] = useState<AccessGrant | null>(null)

  if (isLoading || !user) {
    return <Skeleton className="h-40 w-full" />
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/users')}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> К списку
      </button>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <UserAvatar name={user.fullName} src={user.avatarUrl} size={36} />
            {user.fullName}
            {user.role === 'ADMIN' && <Badge tone="primary">ADMIN</Badge>}
            {!user.active && <Badge tone="neutral">Отключён</Badge>}
          </span>
        }
        actions={
          <Button variant="secondary" onClick={() => setEdit(true)}>
            <Pencil size={14} /> Редактировать
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Профиль" />
          <CardBody>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Телефон</dt>
              <dd>{formatPhone(user.phone)}</dd>
              <dt className="text-muted-foreground">E-mail</dt>
              <dd>{user.email || '—'}</dd>
              <dt className="text-muted-foreground">Регион</dt>
              <dd>{user.regionName || '—'}</dd>
              <dt className="text-muted-foreground">Телефон подтверждён</dt>
              <dd>{user.phoneVerified ? 'Да' : 'Нет'}</dd>
              <dt className="text-muted-foreground">Баллы</dt>
              <dd>{user.totalScore}</dd>
              <dt className="text-muted-foreground">Регистрация</dt>
              <dd>{formatDate(user.registeredAt)}</dd>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Выдать доступ к тесту" />
          <CardBody>
            <AccessGrantForm
              presetUserId={user.id}
              presetUserLabel={`${user.fullName} · ${formatPhone(user.phone)}`}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title={`Доступы (${grants?.length ?? 0})`} />
        <CardBody className="p-0">
          {!grants || grants.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Нет выданных доступов.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50 text-left text-xs uppercase text-muted-foreground">
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
                    <td className="px-4 py-2">{g.testTitle}</td>
                    <td className="px-4 py-2">{formatDT(g.grantedAt)}</td>
                    <td className="px-4 py-2">{formatDT(g.expiresAt)}</td>
                    <td className="px-4 py-2">
                      {g.status === 'PERMANENT' ? (
                        <Badge tone="info">Бессрочный</Badge>
                      ) : g.status === 'ACTIVE' ? (
                        <Badge tone="success">Активен</Badge>
                      ) : (
                        <Badge tone="neutral">Истёк</Badge>
                      )}
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

      <UserFormDialog open={edit} onClose={() => setEdit(false)} user={user} />

      <ConfirmDialog
        open={Boolean(revoke)}
        onClose={() => setRevoke(null)}
        onConfirm={async () => {
          if (!revoke) return
          try {
            await revokeAccess({ userId: revoke.userId, testId: revoke.testId }).unwrap()
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
