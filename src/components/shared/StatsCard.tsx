import type { ReactNode } from 'react'
import { Card, CardContent, Box, Typography } from '@mui/material'

interface StatsCardProps {
  icon: ReactNode
  value: string
  label: string
  sub: string
  iconBg: string
}

export function StatsCard({ icon, value, label, sub, iconBg }: StatsCardProps) {
  const bgColorMap: Record<string, string> = {
    'bg-green-50': '#f0fdf4',
    'bg-teal-50': '#f0fdfa',
    'bg-purple-50': '#faf5ff',
    'bg-orange-50': '#fffbeb',
  }

  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid #edf0f5',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            backgroundColor: bgColorMap[iconBg] || bgColorMap['bg-green-50'],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#0f172a',
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              marginTop: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              marginTop: '4px',
              fontSize: '12px',
              color: '#94a3b8',
            }}
          >
            {sub}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
