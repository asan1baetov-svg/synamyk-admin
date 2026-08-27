const API_BASE = 'https://synamyk-production.up.railway.app/api/admin'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
})

export interface User {
  id: number
  fullName: string
  phone: string
  email: string
  avatarUrl: string
  regionName: string
  role: string
  active: boolean
  phoneVerified: boolean
  registeredAt: string
  totalScore: number
}

export interface UsersResponse {
  totalElements: number
  totalPages: number
  pageable: any
  size: number
  content: User[]
  number: number
  sort: any
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export interface GameTest {
  id: number
  title: string
  description: string
  timeLimitSeconds: number
  questionsPerGame: number
  active: boolean
  questionCount: number
  questions: Question[]
}

export interface Question {
  id: number
  text: string
  imageUrl: string
  orderIndex: number
  active: boolean
  options: Option[]
}

export interface Option {
  id: number
  text: string
  correct: boolean
  orderIndex: number
}

export interface TestQuestion {
  text: string
  textKy?: string
  sectionName?: string
  sectionNameKy?: string
  imageUrl?: string
  explanation?: string
  explanationKy?: string
  orderIndex: number
  pointValue: number
  options: Array<{
    label: string
    text: string
    textKy?: string
    isCorrect: boolean
    orderIndex: number
  }>
}

export interface SubTest {
  id: number
  title: string
  titleKy?: string
  levelName: string
  levelNameKy?: string
  levelOrder: number
  isPaid: boolean
  durationMinutes: number
  questionCount: number
  active: boolean
}

export interface Test {
  id: number
  title: string
  titleKy?: string
  description: string
  descriptionKy?: string
  iconUrl?: string
  price: number
  active: boolean
  subTests?: SubTest[]
  subject?: string
  questionCount?: number
  attemptsCount?: number
  createdAt?: string
}

export interface TestsResponse {
  totalElements: number
  totalPages: number
  pageable: any
  size: number
  content: Test[]
  number: number
  sort: any
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export interface Video {
  id: number
  title: string
  thumbnailUrl: string
  subject: string
  duration: string
  viewCount: number
  createdAt: string
  active: boolean
  testId: number
}

export interface VideosResponse {
  totalElements: number
  totalPages: number
  pageable: any
  size: number
  content: Video[]
  number: number
  sort: any
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export interface News {
  id: number
  title: string
  coverImageUrl: string
  type: string
  viewCount: number
  authorName: string
  publishedAt: string
  active: boolean
  content?: string
  contentKey?: string
}

export interface NewsResponse {
  totalElements: number
  totalPages: number
  pageable: any
  size: number
  content: News[]
  number: number
  sort: any
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export const api = {
  games: {
    list: async () => {
      const response = await fetch(`${API_BASE}/game-tests`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to fetch games')
      return response.json() as Promise<GameTest[]>
    },

    getOne: async (id: number) => {
      const response = await fetch(`${API_BASE}/game-tests/${id}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to fetch game')
      return response.json() as Promise<GameTest>
    },

    update: async (id: number, data: Partial<GameTest>) => {
      const response = await fetch(`${API_BASE}/game-tests/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update game')
      return response.json()
    },

    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/game-tests/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to delete game')
    },
  },
  users: {
    list: async (page: number = 0, size: number = 20, search?: string, active?: boolean, role?: string) => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      })
      if (search) params.append('search', search)
      if (active !== undefined) params.append('active', active.toString())
      if (role) params.append('role', role)

      const response = await fetch(`${API_BASE}/users/list_2?${params}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json() as Promise<UsersResponse>
    },

    getOne: async (id: number) => {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json() as Promise<User>
    },

    update: async (id: number, data: Partial<User>) => {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update user')
      return response.json()
    },

    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to delete user')
    },

    export: async (search?: string, active?: boolean, role?: string) => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (active !== undefined) params.append('active', active.toString())
      if (role) params.append('role', role)

      const response = await fetch(`${API_BASE}/users/export?${params}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to export users')
      return response.blob()
    },
  },
}
