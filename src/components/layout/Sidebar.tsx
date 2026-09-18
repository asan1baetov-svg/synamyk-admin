import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  Newspaper,
  Video,
  Users,
  KeyRound,
  CreditCard,
  BarChart3,
  PieChart,
  Radar,
  Megaphone,
  Trophy,
  FileText,
  Library,
  Package,
  School,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useActiveSessionsQuery } from '@/services'

interface Item {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: number
}

function NavItem({ to, label, icon: Icon, end, badge }: Item) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors',
          isActive
            ? 'bg-primary-soft text-primary'
            : 'text-muted-foreground hover:bg-neutral-100 hover:text-foreground'
        )
      }
    >
      <Icon size={17} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

function Section({ label }: { label: string }) {
  return (
    <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
      {label}
    </p>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: sessions } = useActiveSessionsQuery(undefined, {
    pollingInterval: 15000,
  })
  const activeCount = sessions?.length ?? 0

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-white transition-transform duration-200',
          'lg:sticky lg:top-0 lg:z-auto lg:w-56 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-1 border-b border-border px-4 py-4">
          <span className="text-lg font-extrabold tracking-tight text-primary">Synamyk</span>
          <span className="text-sm font-medium text-neutral-400">/admin</span>
          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-neutral-100 lg:hidden"
            aria-label="Закрыть меню"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-2">
          <NavItem to="/" end label="Дашборд" icon={LayoutDashboard} />

          <Section label="Контент" />
          <NavItem to="/tests" label="Тесты" icon={BookOpen} />
          <NavItem to="/games" label="Игровые тесты" icon={Gamepad2} />
          <NavItem to="/news" label="Новости" icon={Newspaper} />
          <NavItem to="/videos" label="Видеоуроки" icon={Video} />
          <NavItem to="/texts" label="Библиотека текстов" icon={Library} />

          <Section label="Пользователи" />
          <NavItem to="/users" label="Список" icon={Users} />
          <NavItem to="/access" label="Доступы к тестам" icon={KeyRound} />
          <NavItem to="/schools" label="Школы" icon={School} />

          <Section label="Финансы" />
          <NavItem to="/payments" label="Платежи" icon={CreditCard} />
          <NavItem to="/products" label="Продукты и дата ОРТ" icon={Package} />

          <Section label="Отчёты" />
          <NavItem to="/reports/overview" label="Сводка" icon={FileText} />
          <NavItem to="/reports/tests" label="По тестам" icon={BarChart3} />
          <NavItem to="/reports/payments" label="По оплатам" icon={PieChart} />
          <NavItem to="/reports/active" label="Сейчас проходят" icon={Radar} badge={activeCount} />

          <Section label="Коммуникации" />
          <NavItem to="/notifications" label="Push-рассылки" icon={Megaphone} />

          <Section label="Рейтинг" />
          <NavItem to="/rating" label="Рейтинг" icon={Trophy} />
        </nav>
      </aside>
    </>
  )
}
