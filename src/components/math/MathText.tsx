import { useMemo } from 'react'
import { parseSegments, renderLatexFragment } from '@/lib/latex'
import { cn } from '@/lib/utils'

/**
 * Renders DB content: text stays as-is, $...$ / $$...$$ become KaTeX.
 * Use everywhere platform content is displayed.
 */
export function MathText({
  value,
  className,
  block,
}: {
  value?: string | null
  className?: string
  /** render as a block element (preserves line breaks) */
  block?: boolean
}) {
  const html = useMemo(() => {
    if (!value) return ''
    return parseSegments(value)
      .map(seg => {
        if (seg.type === 'text') {
          return escapeHtml(seg.value).replace(/\n/g, '<br/>')
        }
        return renderLatexFragment(seg.value, seg.type === 'block')
      })
      .join('')
  }, [value])

  if (!value) return <span className={cn('text-neutral-400', className)}>—</span>

  const Tag = block ? 'div' : 'span'
  return <Tag className={cn('katex-host', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
