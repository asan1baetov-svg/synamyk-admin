import { MathText } from '@/components/math'
import type { Lang } from '@/components/common'

export interface PreviewOption {
  label: string
  text: string
  textKy?: string | null
  isCorrect: boolean
}

export interface PreviewQuestion {
  text: string
  textKy?: string | null
  imageUrl?: string | null
  explanation?: string | null
  explanationKy?: string | null
  pointValue: number
  options: PreviewOption[]
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
  const multi = q.options.filter(o => o.isCorrect).length > 1
  const pick = (ru: string, ky?: string | null) => (lang === 'ky' && ky ? ky : ru)

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {index != null ? `Вопрос ${index}` : 'Вопрос'} ·{' '}
          {multi ? 'несколько ответов' : 'один ответ'}
        </span>
        <span className="text-xs text-muted-foreground">{q.pointValue} балл(ов)</span>
      </div>

      <MathText block value={pick(q.text, q.textKy)} className="text-[15px] leading-relaxed" />

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
