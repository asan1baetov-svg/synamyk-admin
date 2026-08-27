import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
  searchPlaceholder?: string
  createLabel?: string
  onCreateClick?: () => void
}

export function Layout({ children, searchPlaceholder, createLabel, onCreateClick }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6fa' }}>
      <Sidebar />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Header
          searchPlaceholder={searchPlaceholder}
          createLabel={createLabel}
          onCreateClick={onCreateClick}
        />
        <Box
          component="main"
          sx={{ flex: 1, p: 4, overflow: 'auto' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
