import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout() {
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  // close the mobile drawer on navigation
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setNavOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
