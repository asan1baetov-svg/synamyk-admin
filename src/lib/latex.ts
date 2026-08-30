import katex from 'katex'

export type Segment =
  | { type: 'text'; value: string }
  | { type: 'inline'; value: string }
  | { type: 'block'; value: string }

/**
 * Split a stored string into text / inline-formula / block-formula segments.
 * Convention: $...$ = inline, $$...$$ = block, \$ = literal dollar sign.
 * An unmatched $ is treated as literal text (not a delimiter).
 */
export function parseSegments(input: string): Segment[] {
  const segments: Segment[] = []
  let text = ''
  let i = 0

  const pushText = () => {
    if (text) segments.push({ type: 'text', value: text })
    text = ''
  }

  while (i < input.length) {
    const ch = input[i]

    if (ch === '\\' && input[i + 1] === '$') {
      text += '$'
      i += 2
      continue
    }

    if (ch === '$') {
      const isBlock = input[i + 1] === '$'
      const delim = isBlock ? '$$' : '$'
      const start = i + delim.length
      // find closing delimiter, skipping escaped \$
      let j = start
      let close = -1
      while (j < input.length) {
        if (input[j] === '\\') {
          j += 2
          continue
        }
        if (isBlock) {
          if (input[j] === '$' && input[j + 1] === '$') {
            close = j
            break
          }
        } else if (input[j] === '$') {
          close = j
          break
        }
        j++
      }

      if (close === -1) {
        // no closing delimiter — literal
        text += ch
        i++
        continue
      }

      pushText()
      segments.push({
        type: isBlock ? 'block' : 'inline',
        value: input.slice(start, close),
      })
      i = close + delim.length
      continue
    }

    text += ch
    i++
  }

  pushText()
  return segments
}

export interface LatexError {
  fragment: string
  message: string
  displayMode: boolean
}

/** Validate every formula fragment. Returns [] when all compile. */
export function validateLatex(input: string): LatexError[] {
  const errors: LatexError[] = []
  for (const seg of parseSegments(input)) {
    if (seg.type === 'text') continue
    const displayMode = seg.type === 'block'
    try {
      katex.renderToString(seg.value, {
        throwOnError: true,
        strict: false,
        trust: false,
        displayMode,
      })
    } catch (e) {
      errors.push({
        fragment: seg.value,
        message: e instanceof Error ? e.message : String(e),
        displayMode,
      })
    }
  }
  return errors
}

/** Render one fragment to an HTML string, never throwing. */
export function renderLatexFragment(value: string, displayMode: boolean): string {
  try {
    return katex.renderToString(value, {
      throwOnError: false,
      strict: false,
      trust: false,
      displayMode,
    })
  } catch {
    return `<span style="color:#d9211d">${escapeHtml(value)}</span>`
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/* ─────────────── recent formulas (localStorage) ─────────────── */

const RECENT_KEY = 'math:recent'
const RECENT_MAX = 10

export function getRecentFormulas(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function pushRecentFormula(latex: string) {
  const trimmed = latex.trim()
  if (!trimmed) return
  try {
    const list = getRecentFormulas().filter(x => x !== trimmed)
    list.unshift(trimmed)
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)))
  } catch {
    /* ignore */
  }
}
