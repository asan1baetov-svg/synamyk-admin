import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { formatPhone } from '@/lib/format'
import { UserAvatar } from '@/components/common/UserAvatar'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { session, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-white px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-neutral-100 lg:hidden"
        aria-label="Меню"
      >
        <Menu size={18} />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <UserAvatar name={session?.phone} size={28} />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {formatPhone(session?.phone)}
        </span>
      </div>
      <button
        onClick={logout}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
      >
        <LogOut size={15} />
        <span className="hidden sm:inline">Выйти</span>
      </button>
    </header>
  )
}
