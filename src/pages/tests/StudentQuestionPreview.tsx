import { MathText } from '@/components/math'
import { FigureView } from '@/components/figure'
import type { Lang } from '@/components/common'
import type { Figure, QuestionType } from '@/types/api'

export interface PreviewOption {
  label: string
  text: string
  textKy?: string | null
  isCorrect: boolean
}

export interface PreviewQuestion {
  questionType?: QuestionType | null
  columnA?: string | null
  columnAKy?: string | null
  columnB?: string | null
  columnBKy?: string | null
  figure?: Figure | null
  /** already resolved to the preview language */
  passage?: { title?: string | null; text: string } | null
  text: string
  textKy?: string | null
  imageUrl?: string | null
  explanation?: string | null
  explanationKy?: string | null
  pointValue: number
  options: PreviewOption[]
}

/** Reading passage the way the app shows it: one line per line, every 5th line numbered. */
export function PassageBlock({ title, text }: { title?: string | null; text: string }) {
  const lines = text.split('\n')
  return (
    <div className="max-h-72 overflow-y-auto rounded-md border border-border bg-neutral-50 p-3 text-sm">
      {title && <p className="mb-2 font-semibold">{title}</p>}
      <div className="grid grid-cols-[2rem_1fr] gap-x-2">
        {lines.map((line, i) => (
          <div key={i} className="contents">
            <span className="select-none text-right text-xs leading-6 text-muted-foreground">
              {(i + 1) % 5 === 0 ? i + 1 : ''}
            </span>
            <span className="leading-6">{line || ' '}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Renders a question the way a student sees it (with formulas, image, options). */
export function StudentQuestionPreview({
  q,
  lang = 'ru',
  showCorrect = true,
  index,
}: {
  q: PreviewQuestion
  lang?: Lang
  showCorrect?: boolean
  index?: number
}) {
  const comparison = q.questionType === 'COMPARISON'
  const multi = !comparison && q.options.filter(o => o.isCorrect).length > 1
  const pick = (ru?: string | null, ky?: string | null) => (lang === 'ky' && ky ? ky : (ru ?? ''))

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {index != null ? `Вопрос ${index}` : 'Вопрос'} ·{' '}
          {comparison ? 'сравнение' : multi ? 'несколько ответов' : 'один ответ'}
        </span>
        <span className="text-xs text-muted-foreground">{q.pointValue} балл(ов)</span>
      </div>

      {q.passage && <PassageBlock title={q.passage.title} text={q.passage.text} />}

      <MathText block value={pick(q.text, q.textKy)} className="text-[15px] leading-relaxed" />

      {comparison && (
        <div className="grid grid-cols-2 overflow-hidden rounded-md border border-border text-sm">
          <div className="border-b border-r border-border bg-neutral-50 px-3 py-1.5 text-center text-xs font-semibold uppercase text-muted-foreground">
            Колонка А
          </div>
          <div className="border-b border-border bg-neutral-50 px-3 py-1.5 text-center text-xs font-semibold uppercase text-muted-foreground">
            Колонка Б
          </div>
          <div className="border-r border-border px-3 py-3 text-center">
            <MathText value={pick(q.columnA, q.columnAKy)} />
          </div>
          <div className="px-3 py-3 text-center">
            <MathText value={pick(q.columnB, q.columnBKy)} />
          </div>
        </div>
      )}

      {q.figure && (
        <div className="rounded-md border border-border p-2">
          <FigureView figure={q.figure} />
        </div>
      )}

      {q.imageUrl && (
        <img
          src={q.imageUrl}
          alt=""
          className="max-h-64 rounded-md border border-border object-contain"
        />
      )}

      <div className="space-y-2">
        {q.options.map((o, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
              showCorrect && o.isCorrect ? 'border-success bg-success-soft' : 'border-border'
            }`}
          >
            <span className="font-semibold text-muted-foreground">{o.label}.</span>
            <MathText value={pick(o.text, o.textKy)} />
          </div>
        ))}
      </div>

      {q.explanation && (
        <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm">
          <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Пояснение</p>
          <MathText block value={pick(q.explanation, q.explanationKy)} />
        </div>
      )}
    </div>
  )
}
