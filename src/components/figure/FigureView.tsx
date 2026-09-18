import { useMemo, useRef } from 'react'
import type { MouseEvent } from 'react'
import type { Figure, FigureElement, FigurePoint } from '@/types/api'
import { compileExpression, cssColor, elementExtent, isNum, isPt } from '@/lib/figure'

const INK = '#1f2937'
const GRID = '#e5e7eb'
const AXIS = '#6b7280'
const MAX_W = 420
const MAX_H = 420

interface View {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  scale: number
  w: number
  h: number
}

/** Uniform scale that fits [xMin..xMax]×[yMin..yMax] into MAX_W×MAX_H. */
function fit(xMin: number, xMax: number, yMin: number, yMax: number): View {
  const scale = Math.min(MAX_W / (xMax - xMin), MAX_H / (yMax - yMin))
  return { xMin, xMax, yMin, yMax, scale, w: (xMax - xMin) * scale, h: (yMax - yMin) * scale }
}

function computeView(f: Figure): View {
  if (
    f.type === 'COORDINATE_PLANE' &&
    [f.xMin, f.xMax, f.yMin, f.yMax].every(isNum) &&
    f.xMin! < f.xMax! &&
    f.yMin! < f.yMax!
  ) {
    return fit(f.xMin!, f.xMax!, f.yMin!, f.yMax!)
  }
  // GEOMETRY: bounding box of everything + 10% padding
  const pts = f.elements.flatMap(elementExtent)
  if (pts.length === 0) return fit(-1, 5, -1, 5)
  let x0 = Math.min(...pts.map(p => p[0]))
  let x1 = Math.max(...pts.map(p => p[0]))
  let y0 = Math.min(...pts.map(p => p[1]))
  let y1 = Math.max(...pts.map(p => p[1]))
  if (x1 - x0 < 1e-9) {
    x0 -= 1
    x1 += 1
  }
  if (y1 - y0 < 1e-9) {
    y0 -= 1
    y1 += 1
  }
  const px = (x1 - x0) * 0.1
  const py = (y1 - y0) * 0.1
  return fit(x0 - px, x1 + px, y0 - py, y1 + py)
}

function niceStep(range: number, target = 10): number {
  const raw = range / target
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const n = raw / mag
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag
}

const fmt = (n: number) => String(Math.round(n * 1000) / 1000)

interface Props {
  figure: Figure
  className?: string
  /** editor hook: click on the canvas → world coordinates */
  onCanvasClick?: (p: FigurePoint) => void
  /** snap step for clicks (world units) */
  crosshair?: boolean
}

/**
 * Renders a question figure as SVG — same conventions as the mobile app:
 * X to the right, Y up; GEOMETRY is fitted to its bounding box with 10% padding.
 */
export function FigureView({ figure, className, onCanvasClick, crosshair }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const v = useMemo(() => computeView(figure), [figure])
  const sx = (x: number) => (x - v.xMin) * v.scale
  const sy = (y: number) => (v.yMax - y) * v.scale
  const P = (p: FigurePoint) => `${sx(p[0])},${sy(p[1])}`

  const isPlane = figure.type === 'COORDINATE_PLANE'
  const showGrid = isPlane && figure.showGrid !== false
  const showAxes = isPlane && figure.showAxes !== false
  const step =
    isPlane && isNum(figure.gridStep) && figure.gridStep > 0
      ? figure.gridStep
      : niceStep(v.xMax - v.xMin)
  const tooDense = (v.xMax - v.xMin) / step > 60 || (v.yMax - v.yMin) / step > 60
  const labelEvery = Math.max(1, Math.ceil((v.xMax - v.xMin) / step / 12))

  const gridLines: React.ReactNode[] = []
  const ticks: React.ReactNode[] = []
  if (isPlane && !tooDense) {
    const xs: number[] = []
    for (let x = Math.ceil(v.xMin / step) * step; x <= v.xMax + 1e-9; x += step) xs.push(x)
    const ys: number[] = []
    for (let y = Math.ceil(v.yMin / step) * step; y <= v.yMax + 1e-9; y += step) ys.push(y)
    if (showGrid) {
      xs.forEach((x, i) =>
        gridLines.push(
          <line
            key={`gx${i}`}
            x1={sx(x)}
            x2={sx(x)}
            y1={0}
            y2={v.h}
            stroke={GRID}
            strokeWidth={1}
          />
        )
      )
      ys.forEach((y, i) =>
        gridLines.push(
          <line
            key={`gy${i}`}
            y1={sy(y)}
            y2={sy(y)}
            x1={0}
            x2={v.w}
            stroke={GRID}
            strokeWidth={1}
          />
        )
      )
    }
    if (showAxes) {
      const ax = Math.min(Math.max(0, v.yMin), v.yMax) // y of the x-axis
      const ay = Math.min(Math.max(0, v.xMin), v.xMax) // x of the y-axis
      xs.forEach((x, i) => {
        if (Math.abs(x) < 1e-9 || i % labelEvery) return
        ticks.push(
          <text
            key={`tx${i}`}
            x={sx(x)}
            y={sy(ax) + 13}
            fontSize={10}
            textAnchor="middle"
            fill={AXIS}
          >
            {fmt(x)}
          </text>
        )
      })
      ys.forEach((y, i) => {
        if (Math.abs(y) < 1e-9 || i % labelEvery) return
        ticks.push(
          <text
            key={`ty${i}`}
            x={sx(ay) - 4}
            y={sy(y) + 3}
            fontSize={10}
            textAnchor="end"
            fill={AXIS}
          >
            {fmt(y)}
          </text>
        )
      })
    }
  }

  const axes = showAxes ? (
    <g stroke={AXIS} strokeWidth={1.3} fill="none">
      {v.yMin <= 0 && v.yMax >= 0 && (
        <line x1={0} x2={v.w} y1={sy(0)} y2={sy(0)} markerEnd="url(#fig-axis-arrow)" />
      )}
      {v.xMin <= 0 && v.xMax >= 0 && (
        <line x1={sx(0)} x2={sx(0)} y1={v.h} y2={0} markerEnd="url(#fig-axis-arrow)" />
      )}
      {v.yMin <= 0 && v.yMax >= 0 && figure.xLabel && (
        <text
          x={v.w - 4}
          y={sy(0) - 6}
          fontSize={12}
          textAnchor="end"
          fill={AXIS}
          stroke="none"
          fontStyle="italic"
        >
          {figure.xLabel}
        </text>
      )}
      {v.xMin <= 0 && v.xMax >= 0 && figure.yLabel && (
        <text x={sx(0) + 6} y={12} fontSize={12} fill={AXIS} stroke="none" fontStyle="italic">
          {figure.yLabel}
        </text>
      )}
      {v.xMin <= 0 && v.xMax >= 0 && v.yMin <= 0 && v.yMax >= 0 && (
        <text x={sx(0) - 4} y={sy(0) + 13} fontSize={10} textAnchor="end" fill={AXIS} stroke="none">
          0
        </text>
      )}
    </g>
  ) : null

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!onCanvasClick || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * v.w
    const py = ((e.clientY - r.top) / r.height) * v.h
    onCanvasClick([v.xMin + px / v.scale, v.yMax - py / v.scale])
  }

  // far-away extension length for LINE / RAY
  const far = (v.xMax - v.xMin + v.yMax - v.yMin) * 4

  return (
    <svg
      ref={svgRef}
      viewBox={`-2 -2 ${v.w + 4} ${v.h + 4}`}
      width="100%"
      style={{ maxWidth: v.w + 4, cursor: crosshair ? 'crosshair' : undefined }}
      className={className}
      onClick={handleClick}
      role="img"
      aria-label="Чертёж"
    >
      <defs>
        <clipPath id="fig-clip">
          <rect x={0} y={0} width={v.w} height={v.h} />
        </clipPath>
        <marker
          id="fig-axis-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={AXIS} />
        </marker>
      </defs>
      <rect x={0} y={0} width={v.w} height={v.h} fill="#fff" />
      {gridLines}
      {axes}
      {ticks}
      <g clipPath="url(#fig-clip)">
        {figure.elements.map((el, i) => (
          <ElementShape key={i} i={i} el={el} v={v} sx={sx} sy={sy} P={P} far={far} />
        ))}
      </g>
    </svg>
  )
}

function ElementShape({
  el,
  i,
  v,
  sx,
  sy,
  P,
  far,
}: {
  el: FigureElement
  i: number
  v: View
  sx: (x: number) => number
  sy: (y: number) => number
  P: (p: FigurePoint) => string
  far: number
}) {
  const stroke = cssColor(el.color, INK)
  const dash = el.dashed ? '6 4' : undefined
  const common = { stroke, strokeWidth: 1.8, strokeDasharray: dash, fill: 'none' }
  const label = (x: number, y: number, text?: string, dx = 6, dy = -6) =>
    text ? (
      <text x={sx(x) + dx} y={sy(y) + dy} fontSize={13} fill={stroke} fontStyle="italic">
        {text}
      </text>
    ) : null

  switch (el.kind) {
    case 'POINT':
      if (!isNum(el.x) || !isNum(el.y)) return null
      return (
        <g>
          <circle cx={sx(el.x)} cy={sy(el.y)} r={3.5} fill={stroke} />
          {label(el.x, el.y, el.label)}
        </g>
      )
    case 'TEXT':
      if (!isNum(el.x) || !isNum(el.y)) return null
      return (
        <text x={sx(el.x)} y={sy(el.y)} fontSize={13} fill={stroke}>
          {el.text}
        </text>
      )
    case 'SEGMENT':
    case 'LINE':
    case 'RAY':
    case 'VECTOR': {
      if (!isPt(el.from) || !isPt(el.to)) return null
      let [a, b] = [el.from, el.to]
      const dx = b[0] - a[0]
      const dy = b[1] - a[1]
      const len = Math.hypot(dx, dy) || 1
      const ux = dx / len
      const uy = dy / len
      if (el.kind === 'LINE') {
        a = [a[0] - ux * far, a[1] - uy * far]
        b = [b[0] + ux * far, b[1] + uy * far]
      } else if (el.kind === 'RAY') {
        b = [b[0] + ux * far, b[1] + uy * far]
      }
      const markerId = `fig-vec-${i}`
      const mid: FigurePoint = [(el.from[0] + el.to[0]) / 2, (el.from[1] + el.to[1]) / 2]
      return (
        <g>
          {el.kind === 'VECTOR' && (
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 z" fill={stroke} />
              </marker>
            </defs>
          )}
          <line
            x1={sx(a[0])}
            y1={sy(a[1])}
            x2={sx(b[0])}
            y2={sy(b[1])}
            {...common}
            markerEnd={el.kind === 'VECTOR' ? `url(#${markerId})` : undefined}
          />
          {label(mid[0], mid[1], el.label)}
        </g>
      )
    }
    case 'POLYGON':
    case 'POLYLINE': {
      const pts = (el.points ?? []).filter(isPt)
      if (pts.length < 2) return null
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
      const Tag = el.kind === 'POLYGON' ? 'polygon' : 'polyline'
      return (
        <g>
          <Tag
            points={pts.map(P).join(' ')}
            {...common}
            fill={el.kind === 'POLYGON' ? cssColor(el.fill, 'none') : 'none'}
          />
          {el.labels?.map((l, j) => {
            const p = pts[j]
            if (!l || !p) return null
            // push the label away from the centroid
            const ox = sx(p[0]) - sx(cx)
            const oy = sy(p[1]) - sy(cy)
            const ol = Math.hypot(ox, oy) || 1
            return (
              <text
                key={j}
                x={sx(p[0]) + (ox / ol) * 12}
                y={sy(p[1]) + (oy / ol) * 12 + 4}
                fontSize={13}
                textAnchor="middle"
                fill={stroke}
                fontStyle="italic"
              >
                {l}
              </text>
            )
          })}
          {el.label && label(cx, cy, el.label, 0, 4)}
        </g>
      )
    }
    case 'CIRCLE':
      if (!isPt(el.center) || !isNum(el.radius)) return null
      return (
        <g>
          <circle
            cx={sx(el.center[0])}
            cy={sy(el.center[1])}
            r={el.radius * v.scale}
            {...common}
            fill={cssColor(el.fill, 'none')}
          />
          {label(el.center[0], el.center[1], el.label)}
        </g>
      )
    case 'ARC': {
      if (!isPt(el.center) || !isNum(el.radius) || !isNum(el.startAngle) || !isNum(el.endAngle))
        return null
      const [cx, cy] = el.center
      const r = el.radius
      const a0 = (el.startAngle * Math.PI) / 180
      const a1 = (el.endAngle * Math.PI) / 180
      let sweep = el.endAngle - el.startAngle
      sweep = ((sweep % 360) + 360) % 360 || 360
      const large = sweep > 180 ? 1 : 0
      const x0 = sx(cx + r * Math.cos(a0))
      const y0 = sy(cy + r * Math.sin(a0))
      const x1 = sx(cx + r * Math.cos(a1))
      const y1 = sy(cy + r * Math.sin(a1))
      // math CCW = SVG sweep-flag 0 (Y is flipped)
      const d =
        sweep >= 360
          ? `M ${sx(cx + r)} ${sy(cy)} A ${r * v.scale} ${r * v.scale} 0 1 0 ${sx(cx - r)} ${sy(cy)} A ${r * v.scale} ${r * v.scale} 0 1 0 ${sx(cx + r)} ${sy(cy)}`
          : `M ${x0} ${y0} A ${r * v.scale} ${r * v.scale} 0 ${large} 0 ${x1} ${y1}`
      const mid = a0 + (sweep * Math.PI) / 360
      return (
        <g>
          <path d={d} {...common} />
          {label(cx + r * Math.cos(mid), cy + r * Math.sin(mid), el.label)}
        </g>
      )
    }
    case 'ANGLE': {
      if (!isPt(el.vertex) || !isPt(el.from) || !isPt(el.to)) return null
      const V = el.vertex
      // work in screen space so the marker size is constant in pixels
      const vx = sx(V[0])
      const vy = sy(V[1])
      const dir = (p: FigurePoint) => {
        const dx = sx(p[0]) - vx
        const dy = sy(p[1]) - vy
        const l = Math.hypot(dx, dy) || 1
        return [dx / l, dy / l] as const
      }
      const [ax, ay] = dir(el.from)
      const [bx, by] = dir(el.to)
      const R = 18
      let shape: React.ReactNode
      if (el.right) {
        const s = 11
        shape = (
          <path
            d={`M ${vx + ax * s} ${vy + ay * s} L ${vx + (ax + bx) * s} ${vy + (ay + by) * s} L ${vx + bx * s} ${vy + by * s}`}
            {...common}
            strokeWidth={1.4}
          />
        )
      } else {
        const cross = ax * by - ay * bx
        const angle = Math.acos(Math.max(-1, Math.min(1, ax * bx + ay * by)))
        shape = (
          <path
            d={`M ${vx + ax * R} ${vy + ay * R} A ${R} ${R} 0 ${angle > Math.PI ? 1 : 0} ${cross > 0 ? 1 : 0} ${vx + bx * R} ${vy + by * R}`}
            {...common}
            strokeWidth={1.4}
          />
        )
      }
      const mx = ax + bx
      const my = ay + by
      const ml = Math.hypot(mx, my) || 1
      return (
        <g>
          {shape}
          {el.label && (
            <text
              x={vx + (mx / ml) * (R + 12)}
              y={vy + (my / ml) * (R + 12) + 4}
              fontSize={12}
              textAnchor="middle"
              fill={stroke}
            >
              {el.label}
            </text>
          )}
        </g>
      )
    }
    case 'FUNCTION': {
      let f: (x: number) => number
      try {
        f = compileExpression(el.expression ?? '')
      } catch {
        return null
      }
      const x0 = isNum(el.xFrom) ? Math.max(el.xFrom, v.xMin) : v.xMin
      const x1 = isNum(el.xTo) ? Math.min(el.xTo, v.xMax) : v.xMax
      if (x0 >= x1) return null
      const N = 600
      const yRange = v.yMax - v.yMin
      let d = ''
      let penDown = false
      let prevY: number | null = null
      for (let k = 0; k <= N; k++) {
        const x = x0 + ((x1 - x0) * k) / N
        const y = f(x)
        const ok = Number.isFinite(y) && Math.abs(y - v.yMin) < yRange * 50
        // break the path on asymptotes (huge jump between samples)
        const jump = prevY != null && ok && Math.abs(y - prevY) > yRange * 2
        if (!ok || jump) {
          penDown = false
          prevY = ok ? y : null
          if (!ok) continue
        }
        d += `${penDown ? 'L' : 'M'} ${sx(x).toFixed(2)} ${sy(y).toFixed(2)} `
        penDown = true
        prevY = y
      }
      const lx = x1 - (x1 - x0) * 0.08
      const ly = f(lx)
      return (
        <g>
          <path d={d} {...common} stroke={cssColor(el.color, '#1976D2')} strokeWidth={2} />
          {el.label && Number.isFinite(ly) && label(lx, ly, el.label, 0, -8)}
        </g>
      )
    }
    default:
      return null
  }
}
