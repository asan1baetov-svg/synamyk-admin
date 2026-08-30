import { forwardRef } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const base =
  'w-full rounded-md border border-border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 outline-none transition-colors focus:border-primary disabled:bg-neutral-50 disabled:opacity-70 aria-[invalid=true]:border-error'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => <input ref={ref} className={cn(base, className)} {...rest} />
)
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...rest }, ref) => (
  <textarea ref={ref} className={cn(base, 'min-h-[80px] resize-y', className)} {...rest} />
))
Textarea.displayName = 'Textarea'

export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
