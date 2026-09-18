import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetGameQuery,
  useDeleteGameMutation,
  useAddGameQuestionMutation,
  useDeleteGameQuestionMutation,
  useGameReportQuery,
} from '@/services'
import type { Figure, GameOption } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { extractErrorMessage } from '@/lib/errors'
import { formatDT } from '@/lib/datetime'
import { cleanFigure, validateFigure } from '@/lib/figure'
import { PageHeader, ConfirmDialog } from '@/components/common'
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, Dialog } from '@/components/ui'
import { MathField, MathText } from '@/components/math'
import { FigureEditor, FigureView } from '@/components/figure'
import { GameFormDialog } from './GameFormDialog'

export function GameDetail() {
  const { gameId } = useParams()
  const id = Number(gameId)
  const navigate = useNavigate()
  const { data: game, isLoading } = useGetGameQuery(id)
  useDocumentTitle(game ? game.title : 'Игровой тест')

  const [deleteGame] = useDeleteGameMutation()
  const [addQuestion, { isLoading: adding }] = useAddGameQuestionMutation()
  const [deleteQuestion] = useDeleteGameQuestionMutation()

  const [editOpen, setEditOpen] = useState(false)
  const [hideOpen, setHideOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [qToDelete, setQToDelete] = useState<number | null>(null)

  const { data: report } = useGameReportQuery(id, { skip: !reportOpen })

  // add-question form
  const [text, setText] = useState('')
  const [figure, setFigure] = useState<Figure | null>(null)
  const [options, setOptions] = useState<GameOption[]>([
    { text: '', correct: true },
    { text: '', correct: false },
  ])

  if (isLoading || !game) return <Skeleton className="h-40 w-full" />

  const resetForm = () => {
    setText('')
    setFigure(null)
    setOptions([
      { text: '', correct: true },
      { text: '', correct: false },
    ])
  }

  const submitQuestion = async () => {
    if (!text.trim()) {
      toast.error('Введите текст вопроса')
      return
    }
    if (options.some(o => !o.text.trim())) {
      toast.error('Заполните все варианты')
      return
    }
    if (options.filter(o => o.correct).length !== 1) {
      toast.error('Должен быть ровно один правильный ответ')
      return
    }
    const figureErrors = validateFigure(figure)
    if (figureErrors.length) {
      toast.error(`Чертёж: ${figureErrors[0]}`)
      return
    }
    try {
      await addQuestion({
        gameId: id,
        body: {
          text,
          orderIndex: game.questions?.length ?? 0,
          figure: cleanFigure(figure),
          options,
        },
      }).unwrap()
      toast.success('Вопрос добавлен')
      resetForm()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/games')}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> К списку
      </button>

      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {game.title}
            {game.active ? (
              <Badge tone="success">Активен</Badge>
            ) : (
              <Badge tone="neutral">Скрыт</Badge>
            )}
          </span>
        }
        description={`${game.timeLimitSeconds} сек/вопрос · ${
          game.questionsPerGame === 0 ? 'все вопросы' : `${game.questionsPerGame} за игру`
        }`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setReportOpen(true)}>
              <BarChart3 size={14} /> Отчёт
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={14} /> Редактировать
            </Button>
            {game.active && (
              <Button variant="danger" onClick={() => setHideOpen(true)}>
                Скрыть
              </Button>
            )}
          </>
        }
      />

      <Card>
        <CardHeader title={`Вопросы (${game.questions?.length ?? 0})`} />
        <CardBody className="space-y-2">
          {(game.questions ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Пока нет вопросов.</p>
          )}
          {(game.questions ?? []).map(q => (
            <div key={q.id} className="flex items-start gap-3 rounded-md border border-border p-3">
              <div className="min-w-0 flex-1">
                <MathText block value={q.text} className="text-sm font-medium" />
                {q.figure && (
                  <div className="mt-2 max-w-xs rounded border border-border p-1">
                    <FigureView figure={q.figure} />
                  </div>
                )}
                <div className="mt-1 flex flex-wrap gap-2">
                  {q.options.map((o, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${
                        o.correct
                          ? 'bg-success-soft text-success'
                          : 'bg-neutral-100 text-muted-foreground'
                      }`}
                    >
                      {o.correct && '✓'}
                      <MathText value={o.text} />
                    </span>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => q.id && setQToDelete(q.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Добавить вопрос"
          description="Порядок вопросов и вариантов перемешивается сервером в каждой игре. Формулы — в $...$."
        />
        <CardBody className="space-y-3">
          <div>
            <p className="mb-1 text-sm font-medium">Текст вопроса</p>
            <MathField
              fieldType="game-question"
              value={text}
              onChange={setText}
              placeholder="Чему равно $\frac{10+20+30}{3}$?"
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Чертёж (необязательно)</p>
            <FigureEditor value={figure} onChange={setFigure} />
          </div>
          <div className="space-y-3">
            {options.map((o, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  type="radio"
                  name="game-correct"
                  className="mt-3"
                  checked={o.correct}
                  onChange={() =>
                    setOptions(prev => prev.map((x, j) => ({ ...x, correct: j === i })))
                  }
                />
                <div className="flex-1">
                  <MathField
                    fieldType="game-option"
                    defaultMode="math"
                    value={o.text}
                    onChange={v =>
                      setOptions(prev => prev.map((x, j) => (j === i ? { ...x, text: v } : x)))
                    }
                    placeholder={`Вариант ${i + 1}`}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-1"
                  disabled={options.length <= 2}
                  onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={options.length >= 6}
              onClick={() => setOptions(prev => [...prev, { text: '', correct: false }])}
            >
              <Plus size={14} /> Вариант
            </Button>
            <Button size="sm" onClick={submitQuestion} loading={adding}>
              Добавить вопрос
            </Button>
          </div>
        </CardBody>
      </Card>

      <GameFormDialog open={editOpen} onClose={() => setEditOpen(false)} game={game} />

      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Отчёт по игровому тесту"
        size="lg"
      >
        {!report ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Игр: {report.totalGames} · Игроков: {report.totalPlayers}
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2">Когда</th>
                  <th className="py-2">Игрок 1</th>
                  <th className="py-2">Игрок 2</th>
                  <th className="py-2">Счёт</th>
                  <th className="py-2">Победитель</th>
                </tr>
              </thead>
              <tbody>
                {report.games.map(g => (
                  <tr key={g.roomId} className="border-b border-border last:border-0">
                    <td className="py-2">{formatDT(g.playedAt)}</td>
                    <td className="py-2">{g.player1Name}</td>
                    <td className="py-2">{g.player2Name}</td>
                    <td className="py-2">
                      {g.player1Score} : {g.player2Score}
                    </td>
                    <td className="py-2">{g.winnerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={hideOpen}
        onClose={() => setHideOpen(false)}
        onConfirm={async () => {
          try {
            await deleteGame(id).unwrap()
            toast.success('Игровой тест скрыт')
            navigate('/games')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          }
        }}
        title="Скрыть игровой тест?"
        description="Вернуть через админку нельзя."
        confirmLabel="Скрыть"
        destructive
      />

      <ConfirmDialog
        open={qToDelete != null}
        onClose={() => setQToDelete(null)}
        onConfirm={async () => {
          if (qToDelete == null) return
          try {
            await deleteQuestion({ questionId: qToDelete, gameId: id }).unwrap()
            toast.success('Вопрос удалён')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setQToDelete(null)
          }
        }}
        title="Удалить вопрос?"
        confirmLabel="Удалить"
        destructive
      />
    </div>
  )
}
