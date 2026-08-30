import type { MathfieldElement, MathfieldElementAttributes } from 'mathlive'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': DetailedHTMLProps<
        HTMLAttributes<MathfieldElement> & Partial<MathfieldElementAttributes>,
        MathfieldElement
      >
    }
  }
}
