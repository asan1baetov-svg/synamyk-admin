import { Avatar } from '@mui/material'

interface UserAvatarProps {
  name: string
  size?: number
}

export function UserAvatar({ name, size = 32 }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        backgroundColor: '#e8ecf4',
        color: '#94a3b8',
        fontWeight: 600,
      }}
    >
      {initials}
    </Avatar>
  )
}
