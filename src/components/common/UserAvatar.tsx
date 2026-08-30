import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

export function UserAvatar({
  name,
  src,
  size = 32,
  className,
}: {
  name?: string | null
  src?: string | null
  size?: number
  className?: string
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        style={{ width: size, height: size }}
        className={cn('rounded-full object-cover', className)}
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={cn(
        'flex items-center justify-center rounded-full bg-neutral-200 font-medium uppercase text-neutral-600',
        className
      )}
    >
      {initials(name)}
    </div>
  )
}
