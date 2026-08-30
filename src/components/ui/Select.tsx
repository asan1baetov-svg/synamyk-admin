import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-border-input bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-70',
        className
      )}
      {...rest}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'
