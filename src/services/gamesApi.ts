import { baseApi } from './baseApi'
import type { GameQuestionPayload, GameReport, GameTest, GameTestPayload } from '@/types/api'

export const gamesApi = baseApi.injectEndpoints({
  endpoints: b => ({
    listGames: b.query<GameTest[], void>({
      query: () => '/api/admin/game-tests',
      providesTags: ['Game'],
    }),
    getGame: b.query<GameTest, number>({
      query: id => `/api/admin/game-tests/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Game', id }],
    }),
    createGame: b.mutation<GameTest, GameTestPayload>({
      query: body => ({ url: '/api/admin/game-tests', method: 'POST', body }),
      invalidatesTags: ['Game'],
    }),
    updateGame: b.mutation<GameTest, { id: number; body: GameTestPayload }>({
      query: ({ id, body }) => ({
        url: `/api/admin/game-tests/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Game', id }, 'Game'],
    }),
    deleteGame: b.mutation<void, number>({
      query: id => ({ url: `/api/admin/game-tests/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Game'],
    }),
    addGameQuestion: b.mutation<GameTest, { gameId: number; body: GameQuestionPayload }>({
      query: ({ gameId, body }) => ({
        url: `/api/admin/game-tests/${gameId}/questions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { gameId }) => [{ type: 'Game', id: gameId }, 'Game'],
    }),
    deleteGameQuestion: b.mutation<void, { questionId: number; gameId: number }>({
      query: ({ questionId }) => ({
        url: `/api/admin/game-tests/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { gameId }) => [{ type: 'Game', id: gameId }, 'Game'],
    }),
    gameReport: b.query<GameReport, number>({
      query: id => `/api/admin/game-tests/${id}/report`,
      providesTags: ['GameReport'],
    }),
  }),
})

export const {
  useListGamesQuery,
  useGetGameQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useAddGameQuestionMutation,
  useDeleteGameQuestionMutation,
  useGameReportQuery,
} = gamesApi
