import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCreateGameMutation, useUpdateGameMutation } from '@/services'
import type { GameTest, GameTestPayload } from '@/types/api'
import { extractErrorMessage } from '@/lib/errors'
import { Dialog, Button, Input, Field } from '@/components/ui'

export function GameFormDialog({
  open,
  onClose,
  game,
}: {
  open: boolean
  onClose: () => void
  game: GameTest | null
}) {
  const editing = Boolean(game)
  const [createGame, { isLoading: creating }] = useCreateGameMutation()
  const [updateGame, { isLoading: updating }] = useUpdateGameMutation()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(30)
  const [questionsPerGame, setQuestionsPerGame] = useState(10)

  useEffect(() => {
    if (!open) return
    setTitle(game?.title ?? '')
    setDescription(game?.description ?? '')
    setTimeLimitSeconds(game?.timeLimitSeconds ?? 30)
    setQuestionsPerGame(game?.questionsPerGame ?? 10)
  }, [open, game])

  const submit = async () => {
    if (!title.trim()) {
      toast.error('Название обязательно')
      return
    }
    if (timeLimitSeconds < 5) {
      toast.error('Минимум 5 секунд на вопрос')
      return
    }
    const body: GameTestPayload = {
      title,
      description: description || undefined,
      timeLimitSeconds,
      questionsPerGame,
    }
    try {
      if (editing && game) {
        await updateGame({ id: game.id, body }).unwrap()
        toast.success('Игровой тест обновлён')
      } else {
        await createGame(body).unwrap()
        toast.success('Игровой тест создан')
      }
      onClose()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Редактировать игровой тест' : 'Новый игровой тест'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} loading={creating || updating}>
            {editing ? 'Сохранить' : 'Создать'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Название" required>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </Field>
        <Field label="Описание">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border-input px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Секунд на ОДИН вопрос" hint="минимум 5">
            <Input
              type="number"
              min={5}
              value={timeLimitSeconds}
              onChange={e => setTimeLimitSeconds(Number(e.target.value) || 0)}
            />
          </Field>
          <Field
            label="Вопросов за игру"
            hint="0 = все. Порядок вопросов и вариантов сервер перемешивает в каждой игре"
          >
            <Input
              type="number"
              min={0}
              value={questionsPerGame}
              onChange={e => setQuestionsPerGame(Number(e.target.value) || 0)}
            />
          </Field>
        </div>
      </div>
    </Dialog>
  )
}
