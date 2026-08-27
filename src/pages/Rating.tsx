import { useState } from 'react'
import { RotateCcw, Settings } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { Select } from '@/components/ui/Select'
import { UserAvatar } from '@/components/shared/UserAvatar'

interface RatingUser {
  id: number
  name: string
  place: number
  score: number
  pvp: number
}

const mockRating: RatingUser[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: 'Даниар Р.',
  place: 1,
  score: 752,
  pvp: 45,
}))

const periodOptions = [
  { value: '', label: 'Период' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]
const typeOptions = [
  { value: '', label: 'Тип' },
  { value: 'score', label: 'По баллам' },
  { value: 'pvp', label: 'PvP' },
]
const subjectOptions = [
  { value: '', label: 'Предмет' },
  { value: 'math', label: 'Математика' },
  { value: 'logic', label: 'Логика' },
]
const sortOptions = [
  { value: '', label: 'Сортировка' },
  { value: 'asc', label: 'По возрастанию' },
  { value: 'desc', label: 'По убыванию' },
]

export function Rating() {
  const [page, setPage] = useState(1)

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'name',
      header: 'Пользователь',
      render: row => (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={row.name as string} />
          <span className="font-medium text-[#1e293b]">{row.name as string}</span>
        </div>
      ),
    },
    { key: 'place', header: 'Место' },
    { key: 'score', header: 'Баллы' },
    { key: 'pvp', header: 'Победы PvP' },
    {
      key: 'actions',
      header: 'Действия',
      width: '110px',
      render: () => <ActionButtons onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />,
    },
  ]

  return (
    <Layout searchPlaceholder="Поиск по заголовку или тексту">
      {/* Title + filters on same line */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="text-[22px] font-bold text-[#0f172a] tracking-tight mr-auto">
          Рейтинг пользователей
        </h1>
        <Select options={periodOptions} defaultValue="" />
        <Select options={typeOptions} defaultValue="" />
        <Select options={subjectOptions} defaultValue="" />
        <Select options={sortOptions} defaultValue="" />
      </div>

      {/* Table + side panel */}
      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <DataTable
            columns={columns}
            data={mockRating as unknown as Record<string, unknown>[]}
            currentPage={page}
            totalPages={20}
            onPageChange={setPage}
            keyField="id"
          />
        </div>

        {/* Side panel */}
        <div className="w-44 shrink-0 flex flex-col gap-3 pt-1">
          <button className="text-sm font-medium text-[#3b6ff0] hover:text-[#2d5ed4] text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5">
            <RotateCcw size={14} />
            Сбросить рейтинг
          </button>
          <button className="w-full rounded-xl bg-[#3b6ff0] py-2.5 text-sm font-semibold text-white hover:bg-[#2d5ed4] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-[#3b6ff0]/20">
            <Settings size={15} />
            Настройки
          </button>
        </div>
      </div>
    </Layout>
  )
}
