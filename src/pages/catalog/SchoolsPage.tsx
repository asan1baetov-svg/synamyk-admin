import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ListPlus, Pencil, Plus } from 'lucide-react'
import {
  useListRegionsQuery,
  useListDistrictsQuery,
  useCreateDistrictMutation,
  useUpdateDistrictMutation,
  useListSchoolsQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useBulkCreateSchoolsMutation,
} from '@/services'
import type { District, School } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUrlNumber, useUrlParam } from '@/hooks/useUrlState'
import { extractErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'
import { EmptyState, PageHeader, Pagination, SearchInput } from '@/components/common'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  Field,
  Input,
  Select,
  Skeleton,
  Switch,
  Textarea,
} from '@/components/ui'

/** Regions → districts → schools. Feeds the in-app school rating. */
export function SchoolsPage() {
  useDocumentTitle('Школы')
  const { data: regions, isLoading: regionsLoading } = useListRegionsQuery()
  const [regionId, setRegionId] = useUrlNumber('region', 0)
  const [districtId, setDistrictId] = useUrlNumber('district', 0)

  // default to the first region
  useEffect(() => {
    if (!regionId && regions?.length) setRegionId(regions[0].id)
  }, [regionId, regions, setRegionId])

  const { data: districts, isFetching: districtsLoading } = useListDistrictsQuery(regionId, {
    skip: !regionId,
  })
  const district = districts?.find(d => d.id === districtId) ?? null

  const [districtForm, setDistrictForm] = useState<{ open: boolean; district: District | null }>({
    open: false,
    district: null,
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Школы"
        description="Справочник для рейтинга школ. Школа попадает в рейтинг, когда в ней ≥ 3 зарегистрированных ученика."
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Регион</span>
        {regionsLoading ? (
          <Skeleton className="h-9 w-64" />
        ) : (
          <Select
            value={regionId || ''}
            onChange={e => {
              setRegionId(Number(e.target.value))
              setDistrictId(null)
            }}
            className="w-72"
          >
            {regions?.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader
            title={`Районы (${districts?.length ?? 0})`}
            action={
              <Button
                size="sm"
                disabled={!regionId}
                onClick={() => setDistrictForm({ open: true, district: null })}
              >
                <Plus size={14} /> Район
              </Button>
            }
          />
          <CardBody className="p-2">
            {districtsLoading && !districts ? (
              <div className="space-y-1">
                {[0, 1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : !districts || districts.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">В регионе пока нет районов.</p>
            ) : (
              <ul className="space-y-0.5">
                {districts.map(d => (
                  <li key={d.id}>
                    <div
                      className={cn(
                        'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                        d.id === districtId ? 'bg-primary-soft text-primary' : 'hover:bg-neutral-50'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setDistrictId(d.id)}
                        className="min-w-0 flex-1 truncate text-left"
                      >
                        {d.name}
                      </button>
                      {!d.active && <Badge tone="neutral">скрыт</Badge>}
                      <button
                        type="button"
                        onClick={() => setDistrictForm({ open: true, district: d })}
                        className="text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
                        aria-label="Редактировать район"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {district ? (
          <SchoolsPanel district={district} />
        ) : (
          <Card>
            <EmptyState title="Выберите район" description="Слева — список районов региона." />
          </Card>
        )}
      </div>

      <NameDialog
        open={districtForm.open}
        onClose={() => setDistrictForm({ open: false, district: null })}
        title={districtForm.district ? 'Редактировать район' : 'Новый район'}
        initial={districtForm.district}
        kind="district"
        parentId={regionId}
      />
    </div>
  )
}

function SchoolsPanel({ district }: { district: District }) {
  const [search, setSearch] = useUrlParam('q', '')
  const [activeFilter, setActiveFilter] = useUrlParam('active', '')
  const [page, setPage] = useUrlNumber('page', 0)
  const { data, isFetching } = useListSchoolsQuery({
    districtId: district.id,
    search: search || undefined,
    active: activeFilter === '' ? undefined : activeFilter === 'true',
    page,
    size: 50,
  })
  const [updateSchool] = useUpdateSchoolMutation()
  const [form, setForm] = useState<{ open: boolean; school: School | null }>({
    open: false,
    school: null,
  })
  const [bulkOpen, setBulkOpen] = useState(false)

  const toggle = async (s: School, active: boolean) => {
    try {
      await updateSchool({
        id: s.id,
        body: { districtId: s.districtId, name: s.name, nameKy: s.nameKy ?? undefined, active },
      }).unwrap()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader
        title={`Школы: ${district.name}`}
        description={data ? `Всего: ${data.totalElements}` : undefined}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setBulkOpen(true)}>
              <ListPlus size={14} /> Импорт списком
            </Button>
            <Button size="sm" onClick={() => setForm({ open: true, school: null })}>
              <Plus size={14} /> Школа
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск школы…" />
        <Select
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value)}
          className="w-40"
        >
          <option value="">Все</option>
          <option value="true">Активные</option>
          <option value="false">Скрытые</option>
        </Select>
      </div>
      {isFetching && !data ? (
        <div className="space-y-1 p-4">
          {[0, 1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="Школ не найдено"
          description="Добавьте школу или импортируйте список — по одной на строку."
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-2">Название</th>
              <th className="px-4 py-2">KY</th>
              <th className="px-4 py-2">Активна</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {data.content.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{s.nameKy || '—'}</td>
                <td className="px-4 py-2">
                  <Switch checked={s.active} onChange={v => toggle(s, v)} label="Активна" />
                </td>
                <td className="px-4 py-2 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setForm({ open: true, school: s })}
                  >
                    <Pencil size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data && (
        <Pagination
          page={data.number}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPageChange={setPage}
        />
      )}

      <NameDialog
        open={form.open}
        onClose={() => setForm({ open: false, school: null })}
        title={form.school ? 'Редактировать школу' : 'Новая школа'}
        initial={form.school}
        kind="school"
        parentId={district.id}
      />
      <BulkDialog open={bulkOpen} onClose={() => setBulkOpen(false)} district={district} />
    </Card>
  )
}

/** Shared create/edit dialog for a district or a school (name, nameKy, active). */
function NameDialog({
  open,
  onClose,
  title,
  initial,
  kind,
  parentId,
}: {
  open: boolean
  onClose: () => void
  title: string
  initial: { id: number; name: string; nameKy?: string | null; active: boolean } | null
  kind: 'district' | 'school'
  parentId: number
}) {
  const [createDistrict, { isLoading: cd }] = useCreateDistrictMutation()
  const [updateDistrict, { isLoading: ud }] = useUpdateDistrictMutation()
  const [createSchool, { isLoading: cs }] = useCreateSchoolMutation()
  const [updateSchool, { isLoading: us }] = useUpdateSchoolMutation()
  const [name, setName] = useState('')
  const [nameKy, setNameKy] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setNameKy(initial?.nameKy ?? '')
    setActive(initial?.active ?? true)
    setError(null)
  }, [open, initial])

  const save = async () => {
    if (!name.trim()) {
      setError('Название обязательно')
      return
    }
    const base = { name: name.trim(), nameKy: nameKy.trim() || undefined, active }
    try {
      if (kind === 'district') {
        const body = { ...base, regionId: parentId }
        if (initial) await updateDistrict({ id: initial.id, body }).unwrap()
        else await createDistrict(body).unwrap()
      } else {
        const body = { ...base, districtId: parentId }
        if (initial) await updateSchool({ id: initial.id, body }).unwrap()
        else await createSchool(body).unwrap()
      }
      toast.success('Сохранено')
      onClose()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={save} loading={cd || ud || cs || us}>
            Сохранить
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Название (RU)" required error={error ?? undefined}>
          <Input value={name} onChange={e => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Название (KY)" hint="Если не заполнить, покажется русское">
          <Input value={nameKy} onChange={e => setNameKy(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={active} onChange={setActive} label="Активен" />
          {active ? 'Показывается в приложении' : 'Скрыт'}
        </label>
      </div>
    </Dialog>
  )
}

function BulkDialog({
  open,
  onClose,
  district,
}: {
  open: boolean
  onClose: () => void
  district: District
}) {
  const [bulk, { isLoading }] = useBulkCreateSchoolsMutation()
  const [text, setText] = useState('')
  useEffect(() => {
    if (open) setText('')
  }, [open])

  const names = Array.from(
    new Set(
      text
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
    )
  )

  const submit = async () => {
    if (names.length === 0) return
    try {
      const res = await bulk({ districtId: district.id, names }).unwrap()
      const skipped = names.length - res.created
      toast.success(
        `Добавлено школ: ${res.created}${skipped > 0 ? ` · пропущено дублей: ${skipped}` : ''}`
      )
      onClose()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Импорт школ: ${district.name}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} loading={isLoading} disabled={names.length === 0}>
            Добавить {names.length || ''}
          </Button>
        </>
      }
    >
      <Field
        label="По одной школе на строку"
        hint="Школы с уже существующим названием будут пропущены."
      >
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={14}
          placeholder={'СШ №1 им. А. Осмонова\nСШ №2\nГимназия №5'}
        />
      </Field>
    </Dialog>
  )
}
