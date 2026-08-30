import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import 'mathlive'
import type { MathfieldElement } from 'mathlive'
import { cn } from '@/lib/utils'

export interface MathLiveHandle {
  insert: (latex: string) => void
  focus: () => void
  getValue: () => string
}

interface Props {
  value: string
  onChange: (latex: string) => void
  onEnter?: () => void
  autoFocus?: boolean
  className?: string
  ariaLabel?: string
}

export const MathLiveInput = forwardRef<MathLiveHandle, Props>(
  ({ value, onChange, onEnter, autoFocus, className, ariaLabel }, ref) => {
    const elRef = useRef<MathfieldElement | null>(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange
    const onEnterRef = useRef(onEnter)
    onEnterRef.current = onEnter

    useImperativeHandle(ref, () => ({
      insert: (latex: string) => {
        const mf = elRef.current
        if (!mf) return
        mf.executeCommand?.(['insert', latex])
        mf.focus()
      },
      focus: () => elRef.current?.focus(),
      getValue: () => elRef.current?.value ?? '',
    }))

    useEffect(() => {
      const mf = elRef.current
      if (!mf) return

      // Configure once mounted.
      try {
        mf.mathVirtualKeyboardPolicy = 'manual'
        mf.smartMode = true
        mf.smartFence = true
      } catch {
        /* older/newer API differences — non-fatal */
      }

      const handleInput = () => onChangeRef.current(mf.value)
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && onEnterRef.current) {
          e.preventDefault()
          onEnterRef.current()
        }
      }
      mf.addEventListener('input', handleInput)
      mf.addEventListener('keydown', handleKeydown)

      if (autoFocus) mf.focus()

      return () => {
        mf.removeEventListener('input', handleInput)
        mf.removeEventListener('keydown', handleKeydown)
      }
    }, [autoFocus])

    // Sync value in from props without clobbering the cursor.
    useEffect(() => {
      const mf = elRef.current
      if (mf && mf.value !== value) {
        mf.value = value
      }
    }, [value])

    return (
      <math-field
        ref={elRef as never}
        aria-label={ariaLabel}
        class={cn(
          'block w-full rounded-md border border-border-input bg-white px-3 py-2 text-base outline-none focus-within:border-primary',
          className
        )}
      >
        {value}
      </math-field>
    )
  }
)
MathLiveInput.displayName = 'MathLiveInput'
