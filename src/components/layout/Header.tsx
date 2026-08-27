import { ChevronLeft, ChevronRight, Bell, User, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Box, IconButton, TextField, Button } from '@mui/material'
import { SearchBar } from '@/components/shared/SearchBar'

interface HeaderProps {
  searchPlaceholder?: string
  createLabel?: string
  onCreateClick?: () => void
}

export function Header({ searchPlaceholder = 'Поиск...', createLabel, onCreateClick }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#ffffff',
        color: '#000',
        boxShadow: 'none',
        borderBottom: '1px solid #e8ecf0',
        zIndex: 100,
      }}
    >
      <Toolbar
        sx={{
          height: 64,
          padding: '0 24px',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
      >
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: '#6b7280' }}>
            <ChevronLeft size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => navigate(1)} sx={{ color: '#6b7280' }}>
            <ChevronRight size={16} />
          </IconButton>
        </Box>

        {/* Search */}
        <Box sx={{ flex: 1, maxWidth: '512px' }}>
          <SearchBar placeholder={searchPlaceholder} />
        </Box>

        {/* Right side */}
        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small" sx={{ color: '#6b7280' }}>
            <Bell size={16} />
          </IconButton>

          {createLabel && (
            <Button
              variant="contained"
              startIcon={<Plus size={14} />}
              onClick={onCreateClick}
              sx={{
                backgroundColor: '#3b6ff0',
                textTransform: 'none',
                fontSize: '14px',
                padding: '6px 16px',
                '&:hover': {
                  backgroundColor: '#2d5ed4',
                },
              }}
            >
              {createLabel}
            </Button>
          )}

          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#e8ecf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            <User size={15} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
