import type {
  AdminQuestion,
  AdminQuestionOption,
  ComparisonAnswer,
  QuestionOptionPayload,
  QuestionPayload,
} from '@/types/api'

export const COMPARISON_ANSWERS: { value: ComparisonAnswer; label: string; short: string }[] = [
  { value: 'A_GREATER', label: 'Колонка А больше', short: 'А больше' },
  { value: 'B_GREATER', label: 'Колонка Б больше', short: 'Б больше' },
  { value: 'EQUAL', label: 'Равны', short: 'Равны' },
  { value: 'UNDETERMINED', label: 'Невозможно определить', short: 'Нельзя определить' },
]

/** The 4 standard options the server generates for a COMPARISON question (same order/text). */
const STANDARD_COMPARISON: { label: string; text: string; textKy: string }[] = [
  { label: 'А', text: 'Колонка А больше', textKy: 'Колонка А чоң' },
  { label: 'Б', text: 'Колонка Б больше', textKy: 'Колонка Б чоң' },
  { label: 'В', text: 'Равны', textKy: 'Тең' },
  { label: 'Г', text: 'Невозможно определить', textKy: 'Аныктоо мүмкүн эмес' },
]

const sortOptions = (opts: AdminQuestionOption[]) =>
  opts.slice().sort((a, b) => a.orderIndex - b.orderIndex)

/** Which comparison answer is marked correct (by position of the standard options). */
export function comparisonAnswerOf(q: Pick<AdminQuestion, 'options'>): ComparisonAnswer | null {
  const idx = sortOptions(q.options).findIndex(o => o.isCorrect)
  return COMPARISON_ANSWERS[idx]?.value ?? null
}

/**
 * Options to send for a COMPARISON question on update.
 * Options merge by position on the server, so we resend the existing 4 rows
 * (keeping their ids and any admin wording) and only move the correct flag.
 */
export function comparisonOptions(
  answer: ComparisonAnswer,
  existing?: AdminQuestionOption[]
): QuestionOptionPayload[] {
  const correctIdx = COMPARISON_ANSWERS.findIndex(a => a.value === answer)
  const base =
    existing && existing.length === 4
      ? sortOptions(existing).map(o => ({ label: o.label, text: o.text, textKy: o.textKy ?? '' }))
      : STANDARD_COMPARISON
  return base.map((o, i) => ({
    label: o.label,
    text: o.text,
    textKy: o.textKy || undefined,
    isCorrect: i === correctIdx,
    orderIndex: i,
  }))
}

/**
 * Full PUT body rebuilt from a server question — PUT is a full replacement, so every
 * field (incl. figure / passage / comparison columns) must be sent back or it is wiped.
 */
export function questionToPayload(q: AdminQuestion, orderIndex = q.orderIndex): QuestionPayload {
  return {
    text: q.text,
    textKy: q.textKy ?? undefined,
    sectionName: q.sectionName ?? undefined,
    sectionNameKy: q.sectionNameKy ?? undefined,
    imageUrl: q.imageUrl ?? undefined,
    explanation: q.explanation ?? undefined,
    explanationKy: q.explanationKy ?? undefined,
    orderIndex,
    pointValue: q.pointValue,
    questionType: q.questionType === 'COMPARISON' ? 'COMPARISON' : 'STANDARD',
    columnA: q.columnA ?? undefined,
    columnAKy: q.columnAKy ?? undefined,
    columnB: q.columnB ?? undefined,
    columnBKy: q.columnBKy ?? undefined,
    figure: q.figure ?? null,
    passageId: q.passageId ?? null,
    options: sortOptions(q.options).map((o, i) => ({
      label: o.label,
      text: o.text,
      textKy: o.textKy ?? undefined,
      isCorrect: o.isCorrect,
      orderIndex: i,
    })),
  }
}
