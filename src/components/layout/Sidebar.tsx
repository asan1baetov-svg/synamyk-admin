import { NavLink } from 'react-router-dom'
import { Box, Drawer, List, ListItemButton, ListItemIcon, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledListItemButton = styled(ListItemButton)(() => ({
  borderRadius: '12px',
  margin: '4px 0',
  padding: '10px 16px',
  transition: 'all 0.2s',
  '&.active': {
    backgroundColor: '#eff4ff',
    color: '#3b6ff0',
    fontWeight: 600,
    '& .MuiListItemIcon-root': {
      color: '#3b6ff0',
      minWidth: 24,
    },
  },
  '& .MuiListItemIcon-root': {
    minWidth: 24,
    color: '#94a3b8',
  },
  '&:hover': {
    backgroundColor: '#f4f6fb',
    color: '#334155',
  },
}))

const SectionLabel = styled(Typography)(() => ({
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#b0bac9',
  padding: '16px 16px 4px 16px',
  margin: 0,
}))

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    to: '/users',
    label: 'Пользователи',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

const contentItems = [
  {
    to: '/tests',
    label: 'Тесты',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/videos',
    label: 'Видеоуроки',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 9l5 3-5 3V9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const feedItems = [
  {
    to: '/news',
    label: 'Новости',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M18 14h-8M15 18h-5M10 6h8v4h-8z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/rating',
    label: 'Рейтинг',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/payments',
    label: 'Платежи Finik',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M8 11V7a4 4 0 0 1 8 0v4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/games',
    label: 'Онлайн-игры',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

const systemItems = [
  {
    to: '/settings',
    label: 'Настройки',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    to: '/roles',
    label: 'Роли админов',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

type NavItemDef = { to: string; label: string; icon: React.ReactNode }

function NavItem({ to, label, icon }: NavItemDef) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        textDecoration: 'none',
        color: 'inherit',
      })}
    >
      {({ isActive }) => (
        <StyledListItemButton
          className={isActive ? 'active' : ''}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
        >
          <ListItemIcon>{icon}</ListItemIcon>
          <Typography sx={{ fontSize: '13.5px', fontWeight: 'inherit' }}>
            {label}
          </Typography>
        </StyledListItemButton>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 224,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 224,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #edf0f5',
          overflowY: 'auto',
          position: 'sticky',
          top: 0,
          height: '100vh',
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #edf0f5', display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ color: '#3b6ff0', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
          Synamyk
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
          /admin
        </Typography>
      </Box>

      <List sx={{ flex: 1, p: '16px 0' }}>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        <SectionLabel>Контент</SectionLabel>
        {contentItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        <SectionLabel>Лента</SectionLabel>
        {feedItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        <SectionLabel>Система</SectionLabel>
        {systemItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </List>
    </Drawer>
  )
}
