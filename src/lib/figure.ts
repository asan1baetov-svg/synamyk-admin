import type { Figure, FigureElement, FigureElementKind, FigurePoint } from '@/types/api'

/* ─────────────── function expressions ───────────────
 * Same whitelist the server enforces: x, numbers, + - * / ^ ( ),
 * sin cos tan cot sqrt abs log ln exp pi e. Implicit multiplication
 * ("2x", "3(x+1)", "x sin x") is accepted, `log` is base 10.
 */

type Tok =
  | { t: 'num'; v: number }
  | { t: 'x' }
  | { t: 'fn'; v: string }
  | { t: 'op'; v: string }
  | { t: '(' }
  | { t: ')' }

const FUNCS = ['sqrt', 'sin', 'cos', 'tan', 'cot', 'abs', 'log', 'ln', 'exp']

function tokenize(src: string): Tok[] {
  const s = src.replace(/,/g, '.').replace(/\s+/g, '')
  const out: Tok[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (/[0-9.]/.test(c)) {
      let j = i
      while (j < s.length && /[0-9.]/.test(s[j])) j++
      const v = Number(s.slice(i, j))
      if (Number.isNaN(v)) throw new Error(`Неверное число «${s.slice(i, j)}»`)
      out.push({ t: 'num', v })
      i = j
      continue
    }
    const fn = FUNCS.find(f => s.startsWith(f, i))
    if (fn) {
      out.push({ t: 'fn', v: fn })
      i += fn.length
      continue
    }
    if (s.startsWith('pi', i)) {
      out.push({ t: 'num', v: Math.PI })
      i += 2
      continue
    }
    if (c === 'e') {
      out.push({ t: 'num', v: Math.E })
      i++
      continue
    }
    if (c === 'x') {
      out.push({ t: 'x' })
      i++
      continue
    }
    if ('+-*/^'.includes(c)) {
      out.push({ t: 'op', v: c })
      i++
      continue
    }
    if (c === '(' || c === ')') {
      out.push({ t: c })
      i++
      continue
    }
    throw new Error(`Недопустимый символ «${c}»`)
  }
  return out
}

type Node = (x: number) => number

/** Compiles an expression to f(x). Throws with a Russian message on syntax errors. */
export function compileExpression(src: string): Node {
  const toks = tokenize(src)
  let p = 0
  const peek = () => toks[p]
  const startsFactor = (k?: Tok) =>
    !!k && (k.t === 'num' || k.t === 'x' || k.t === 'fn' || k.t === '(')

  // expr := term (('+'|'-') term)*
  const expr = (): Node => {
    let left = term()
    for (;;) {
      const k = peek()
      if (k?.t === 'op' && (k.v === '+' || k.v === '-')) {
        p++
        const r = term()
        const l = left
        left = k.v === '+' ? x => l(x) + r(x) : x => l(x) - r(x)
      } else return left
    }
  }
  // term := unary (('*'|'/'|implicit) unary)*
  const term = (): Node => {
    let left = unary()
    for (;;) {
      const k = peek()
      if (k?.t === 'op' && (k.v === '*' || k.v === '/')) {
        p++
        const r = unary()
        const l = left
        left = k.v === '*' ? x => l(x) * r(x) : x => l(x) / r(x)
      } else if (startsFactor(k)) {
        const r = power()
        const l = left
        left = x => l(x) * r(x)
      } else return left
    }
  }
  // unary := ('-'|'+') unary | power
  const unary = (): Node => {
    const k = peek()
    if (k?.t === 'op' && (k.v === '-' || k.v === '+')) {
      p++
      const u = unary()
      return k.v === '-' ? x => -u(x) : u
    }
    return power()
  }
  // power := atom ('^' unary)?   (right-assoc)
  const power = (): Node => {
    const base = atom()
    const k = peek()
    if (k?.t === 'op' && k.v === '^') {
      p++
      const e = unary()
      return x => Math.pow(base(x), e(x))
    }
    return base
  }
  const atom = (): Node => {
    const k = toks[p++]
    if (!k) throw new Error('Выражение оборвалось')
    if (k.t === 'num') return () => k.v
    if (k.t === 'x') return x => x
    if (k.t === '(') {
      const e = expr()
      if (toks[p++]?.t !== ')') throw new Error('Не закрыта скобка')
      return e
    }
    if (k.t === 'fn') {
      const arg = peek()?.t === '(' ? atom() : power()
      const f: (v: number) => number = {
        sqrt: Math.sqrt,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        cot: (v: number) => 1 / Math.tan(v),
        abs: Math.abs,
        log: Math.log10,
        ln: Math.log,
        exp: Math.exp,
      }[k.v]!
      return x => f(arg(x))
    }
    throw new Error('Неожиданный символ в выражении')
  }

  if (toks.length === 0) throw new Error('Пустое выражение')
  const fn = expr()
  if (p < toks.length) throw new Error('Лишние символы в конце выражения')
  return fn
}

/* ─────────────── validation (mirrors FigureValidator on the server) ─────────────── */

const COLOR_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const EXPR_RE = /^(?:[0-9x.,+\-*/^()\s]|sin|cos|tan|cot|sqrt|abs|log|ln|exp|pi|e)+$/

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isPt = (v: unknown): v is FigurePoint =>
  Array.isArray(v) && v.length === 2 && isNum(v[0]) && isNum(v[1])

export function validateFigure(f: Figure | null | undefined): string[] {
  if (!f) return []
  const errs: string[] = []
  if (f.type !== 'COORDINATE_PLANE' && f.type !== 'GEOMETRY') {
    errs.push('Тип чертежа: COORDINATE_PLANE или GEOMETRY')
    return errs
  }
  if (f.type === 'COORDINATE_PLANE') {
    if (![f.xMin, f.xMax, f.yMin, f.yMax].every(isNum)) errs.push('Задайте диапазоны осей')
    else if (f.xMin! >= f.xMax! || f.yMin! >= f.yMax!) errs.push('Нужно xMin < xMax и yMin < yMax')
    if (f.gridStep != null && !(isNum(f.gridStep) && f.gridStep > 0)) errs.push('Шаг сетки > 0')
  }
  const els = f.elements ?? []
  if (els.length > 300) errs.push('Не больше 300 элементов')
  els.forEach((el, i) => {
    const at = `Элемент ${i + 1} (${KIND_LABELS[el.kind] ?? el.kind})`
    switch (el.kind) {
      case 'POINT':
      case 'TEXT':
        if (!isNum(el.x) || !isNum(el.y)) errs.push(`${at}: x и y обязательны`)
        if (el.kind === 'TEXT' && !el.text?.trim()) errs.push(`${at}: текст обязателен`)
        break
      case 'SEGMENT':
      case 'LINE':
      case 'RAY':
      case 'VECTOR':
        if (!isPt(el.from) || !isPt(el.to)) errs.push(`${at}: задайте обе точки`)
        break
      case 'POLYGON':
      case 'POLYLINE':
        if (!el.points || el.points.length < 2) errs.push(`${at}: минимум 2 точки`)
        else if (!el.points.every(isPt)) errs.push(`${at}: все точки должны быть [x, y]`)
        break
      case 'CIRCLE':
      case 'ARC':
        if (!isPt(el.center)) errs.push(`${at}: центр обязателен`)
        if (!(isNum(el.radius) && el.radius > 0)) errs.push(`${at}: радиус > 0`)
        if (el.kind === 'ARC' && (!isNum(el.startAngle) || !isNum(el.endAngle)))
          errs.push(`${at}: начальный и конечный угол обязательны`)
        break
      case 'ANGLE':
        if (!isPt(el.vertex) || !isPt(el.from) || !isPt(el.to))
          errs.push(`${at}: вершина и две точки обязательны`)
        break
      case 'FUNCTION': {
        const expr = el.expression ?? ''
        if (!expr.trim() || expr.length > 200 || !EXPR_RE.test(expr)) {
          errs.push(
            `${at}: допустимы x, числа, + - * / ^ ( ) и sin cos tan cot sqrt abs log ln exp pi e`
          )
        } else {
          try {
            compileExpression(expr)
          } catch (e) {
            errs.push(`${at}: ${(e as Error).message}`)
          }
        }
        if (isNum(el.xFrom) && isNum(el.xTo) && el.xFrom >= el.xTo) errs.push(`${at}: xFrom < xTo`)
        break
      }
      default:
        errs.push(`${at}: неизвестный тип`)
    }
    for (const key of ['color', 'fill'] as const) {
      const c = el[key]
      if (c != null && c !== '' && !COLOR_RE.test(c))
        errs.push(`${at}: ${key} — #RRGGBB или #AARRGGBB`)
    }
  })
  return errs
}

/** Drop empty optional strings so the payload stays clean. */
export function cleanFigure(f: Figure | null): Figure | null {
  if (!f) return null
  const elements = f.elements.map(el => {
    const out: FigureElement = { ...el }
    for (const k of ['label', 'color', 'fill', 'text'] as const) {
      if (out[k] === '') delete out[k]
    }
    if (out.labels && out.labels.every(l => !l)) delete out.labels
    if (!out.dashed) delete out.dashed
    if (!out.right) delete out.right
    return out
  })
  if (f.type === 'GEOMETRY') {
    return { type: 'GEOMETRY', elements }
  }
  return { ...f, elements }
}

/* ─────────────── colors ─────────────── */

/** "#RRGGBB" / "#AARRGGBB" (Android order, alpha first) → CSS color. */
export function cssColor(c: string | undefined, fallback: string): string {
  if (!c || !COLOR_RE.test(c)) return fallback
  if (c.length === 7) return c
  const a = parseInt(c.slice(1, 3), 16) / 255
  const r = parseInt(c.slice(3, 5), 16)
  const g = parseInt(c.slice(5, 7), 16)
  const b = parseInt(c.slice(7, 9), 16)
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`
}

/* ─────────────── metadata / defaults ─────────────── */

export const KIND_LABELS: Record<FigureElementKind, string> = {
  POINT: 'Точка',
  SEGMENT: 'Отрезок',
  LINE: 'Прямая',
  RAY: 'Луч',
  VECTOR: 'Вектор',
  POLYGON: 'Многоугольник',
  POLYLINE: 'Ломаная',
  CIRCLE: 'Окружность',
  ARC: 'Дуга',
  ANGLE: 'Угол',
  FUNCTION: 'Функция',
  TEXT: 'Текст',
}

export const KIND_ORDER: FigureElementKind[] = [
  'POINT',
  'SEGMENT',
  'LINE',
  'RAY',
  'VECTOR',
  'POLYGON',
  'POLYLINE',
  'CIRCLE',
  'ARC',
  'ANGLE',
  'FUNCTION',
  'TEXT',
]

export function defaultElement(kind: FigureElementKind): FigureElement {
  switch (kind) {
    case 'POINT':
      return { kind, x: 1, y: 1, label: 'A' }
    case 'TEXT':
      return { kind, x: 0, y: 0, text: 'текст' }
    case 'SEGMENT':
    case 'LINE':
    case 'RAY':
    case 'VECTOR':
      return { kind, from: [0, 0], to: [3, 2] }
    case 'POLYGON':
      return {
        kind,
        points: [
          [0, 0],
          [4, 0],
          [0, 3],
        ],
        labels: ['A', 'B', 'C'],
      }
    case 'POLYLINE':
      return {
        kind,
        points: [
          [0, 0],
          [2, 2],
          [4, 1],
        ],
      }
    case 'CIRCLE':
      return { kind, center: [0, 0], radius: 2 }
    case 'ARC':
      return { kind, center: [0, 0], radius: 2, startAngle: 0, endAngle: 90 }
    case 'ANGLE':
      return { kind, vertex: [0, 0], from: [3, 0], to: [0, 3] }
    case 'FUNCTION':
      return { kind, expression: 'x^2 - 2*x + 1', color: '#1976D2' }
  }
}

export function defaultFigure(type: Figure['type']): Figure {
  if (type === 'GEOMETRY') {
    return {
      type,
      elements: [
        {
          kind: 'POLYGON',
          points: [
            [0, 0],
            [4, 0],
            [0, 3],
          ],
          labels: ['A', 'B', 'C'],
        },
        { kind: 'ANGLE', vertex: [0, 0], from: [4, 0], to: [0, 3], right: true },
      ],
    }
  }
  return {
    type,
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    gridStep: 1,
    showGrid: true,
    showAxes: true,
    xLabel: 'x',
    yLabel: 'y',
    elements: [],
  }
}

/** All world-space points an element touches — used for the GEOMETRY bounding box. */
export function elementExtent(el: FigureElement): FigurePoint[] {
  switch (el.kind) {
    case 'POINT':
    case 'TEXT':
      return isNum(el.x) && isNum(el.y) ? [[el.x, el.y]] : []
    case 'SEGMENT':
    case 'LINE':
    case 'RAY':
    case 'VECTOR':
      return [el.from, el.to].filter(isPt)
    case 'POLYGON':
    case 'POLYLINE':
      return (el.points ?? []).filter(isPt)
    case 'CIRCLE':
    case 'ARC':
      if (!isPt(el.center) || !isNum(el.radius)) return []
      return [
        [el.center[0] - el.radius, el.center[1] - el.radius],
        [el.center[0] + el.radius, el.center[1] + el.radius],
      ]
    case 'ANGLE':
      return [el.vertex, el.from, el.to].filter(isPt)
    default:
      return []
  }
}

export { isNum, isPt }
