import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
  filters?: ReactNode
}

export function PageHeader({ title, actions, filters }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '-0.5px' }}>
          {title}
        </Typography>
        {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{actions}</Box>}
      </Box>
      {filters && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>{filters}</Box>}
    </Box>
  )
}
