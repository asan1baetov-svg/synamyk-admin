/** Spring Data Page<T> wrapper. */
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export type Role = 'ADMIN' | 'USER'

/* ─────────────────────────── Upload ─────────────────────────── */

export type UploadType =
  | 'AVATAR'
  | 'NEWS_COVER'
  | 'VIDEO_THUMBNAIL'
  | 'TEST_ICON'
  | 'QUESTION_IMAGE'

export interface UploadResponse {
  /** presigned, lives 1 hour — for display only */
  url: string
  /** persist THIS into iconUrl/imageUrl/coverImageUrl/thumbnailUrl */
  objectKey: string
}

/* ─────────────────────────── Tests ─────────────────────────── */

export interface AdminTestListItem {
  id: number
  title: string
  iconUrl?: string | null
  subject?: string | null
  price: number
  questionCount: number
  attemptsCount: number
  createdAt: string
  active: boolean
}

export interface AdminSubTest {
  id: number
  title: string
  titleKy?: string | null
  levelName: string
  levelNameKy?: string | null
  levelOrder: number
  isPaid: boolean
  /** price to unlock only this sub-test */
  price: number
  durationMinutes: number
  questionCount: number
  active: boolean
  /** free-window: content is free for everyone while now is inside [freeFrom, freeUntil) */
  freeFrom?: string | null
  freeUntil?: string | null
}

export interface AdminTest {
  id: number
  title: string
  titleKy?: string | null
  description?: string | null
  descriptionKy?: string | null
  iconUrl?: string | null
  /** bundle price — one payment unlocks all paid sub-tests */
  price: number
  active: boolean
  freeFrom?: string | null
  freeUntil?: string | null
  /** NOT present in AdminTestResponse — only in list rows */
  subject?: string | null
  subTests: AdminSubTest[]
}

export interface TestPayload {
  title: string
  titleKy?: string
  description?: string
  descriptionKy?: string
  iconUrl?: string
  subject?: string
  price: number
}

export interface PricingSubTestEntry {
  subTestId: number
  isPaid: boolean
  price: number
}

export interface PricingPayload {
  /** bundle price for the whole test */
  price: number
  /** full list of the test's sub-tests — omitted ones become isPaid=false, price=0 */
  subTests: PricingSubTestEntry[]
}

export interface SchedulePayload {
  freeFrom: string | null
  freeUntil: string | null
}

export interface SubTestPayload {
  title: string
  titleKy?: string
  levelName: string
  levelNameKy?: string
  levelOrder: number
  isPaid: boolean
  price: number
  durationMinutes: number
}

/* ─────────────────────────── Questions ─────────────────────────── */

export interface AdminQuestionOption {
  id: number
  label: string
  text: string
  textKy?: string | null
  isCorrect: boolean
  orderIndex: number
}

export interface AdminQuestion {
  id: number
  sectionName?: string | null
  sectionNameKy?: string | null
  text: string
  textKy?: string | null
  imageUrl?: string | null
  explanation?: string | null
  explanationKy?: string | null
  orderIndex: number
  pointValue: number
  active: boolean
  options: AdminQuestionOption[]
}

export interface QuestionOptionPayload {
  label: string
  text: string
  textKy?: string
  isCorrect: boolean
  orderIndex: number
}

export interface QuestionPayload {
  text: string
  textKy?: string
  sectionName?: string
  sectionNameKy?: string
  imageUrl?: string
  explanation?: string
  explanationKy?: string
  orderIndex: number
  pointValue: number
  options: QuestionOptionPayload[]
}

/* ─────────────────────────── Users ─────────────────────────── */

export interface AdminUser {
  id: number
  fullName: string
  phone: string
  email?: string | null
  avatarUrl?: string | null
  regionName?: string | null
  role: Role
  active: boolean
  phoneVerified: boolean
  registeredAt: string
  totalScore: number
}

export interface UserUpdatePayload {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  active?: boolean
  role?: Role
}

/* ─────────────────────────── Access ─────────────────────────── */

export type AccessStatus = 'PERMANENT' | 'ACTIVE' | 'EXPIRED'

export interface AccessGrant {
  id: number
  userId: number
  userName: string
  userPhone: string
  testId: number
  testTitle: string
  /** null for a test-level grant, set for a single sub-test grant */
  subTestId?: number | null
  subTestTitle?: string | null
  grantedAt: string
  expiresAt?: string | null
  status: AccessStatus
}

export interface AccessGrantPayload {
  userId: number
  /** exactly one of testId / subTestId */
  testId?: number
  subTestId?: number
  durationDays?: number | null
  durationHours?: number | null
  expiresAt?: string | null
}

/* ─────────────────────────── Payments ─────────────────────────── */

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'

export interface AdminPayment {
  id: number
  transactionId: string
  user: {
    id: number
    fullName: string
    phone: string
    avatarUrl?: string | null
  }
  amount: number
  paymentMethod: string
  status: PaymentStatus
  date: string
  earnedPoints: number
  testTitle: string
  /** null = whole-test (bundle) purchase; set = single sub-test purchase */
  subTestId?: number | null
  subTestTitle?: string | null
}

/* ─────────────────────────── Reports ─────────────────────────── */

export type ReportPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface ActiveSessionEntry {
  sessionId: number
  userId: number
  userName: string
  userPhone: string
  testId: number
  testTitle: string
  subTestId: number
  subTestTitle: string
  startedAt: string
  currentIndex: number
  totalQuestions: number
  remainingSeconds: number
}

export interface TestReportRow {
  testId: number
  testTitle: string
  subTestId: number
  subTestTitle: string
  attempts: number
  completed: number
  distinctUsers: number
  avgPercent: number | null
  completionRate: number
}

export interface TestReportResponse {
  from: string
  to: string
  totalAttempts: number
  totalCompleted: number
  rows: TestReportRow[]
}

export interface PaymentReportResponse {
  from: string
  to: string
  totalRevenue: number
  completedCount: number
  byStatus: { status: PaymentStatus; count: number; amount: number }[]
  byTest: { testId: number; testTitle: string; count: number; revenue: number }[]
  byMonth: { month: string; count: number; revenue: number }[]
}

export interface OverviewReportResponse {
  from: string
  to: string
  registrations: number
  activeUsers: number
  sessionsStarted: number
  sessionsCompleted: number
  revenue: number
  byMonth: {
    month: string
    registrations: number
    sessionsStarted: number
    sessionsCompleted: number
    revenue: number
  }[]
}

/* ─────────────────────────── Notifications ─────────────────────────── */

export type BroadcastAudience = 'ALL' | 'USER_IDS' | 'PLATFORM' | 'PURCHASED_TEST' | 'INACTIVE_DAYS'

export type BroadcastDataType = 'NONE' | 'TEST' | 'SUB_TEST' | 'GAME' | 'BROADCAST'

export type BroadcastStatus = 'PENDING' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED'

export interface BroadcastPayload {
  title: string
  body: string
  titleKy?: string
  bodyKy?: string
  audience: BroadcastAudience
  audienceRef?: string | null
  dataType: BroadcastDataType
  dataEntityId?: number | null
  scheduledAt?: string | null
}

export interface BroadcastCreateResponse {
  broadcastId: number
  status: BroadcastStatus
  audience: BroadcastAudience
  scheduledAt?: string | null
  createdAt: string
}

export interface BroadcastDetail {
  id: number
  status: BroadcastStatus
  title: string
  body: string
  titleKy?: string | null
  bodyKy?: string | null
  audience: BroadcastAudience
  audienceRef?: string | null
  dataType: BroadcastDataType
  dataEntityId?: number | null
  sentByName: string
  recipientCount: number | null
  successCount: number | null
  failureCount: number | null
  scheduledAt?: string | null
  startedAt?: string | null
  finishedAt?: string | null
  createdAt: string
}

export interface BroadcastHistoryEntry {
  id: number
  status: BroadcastStatus
  title: string
  audience: BroadcastAudience
  scheduledAt?: string | null
  createdAt: string
  recipientCount?: number | null
  successCount?: number | null
}

export interface PushStatusResponse {
  firebaseEnabled: boolean
  totalTokens: number
  byPlatform: Record<string, number>
  usersWithToken: number
  scheduledBroadcasts: number
  lastBroadcastAt?: string | null
}

/* ─────────────────────────── News ─────────────────────────── */

export type NewsType = 'NEWS' | 'ARTICLE' | 'ANNOUNCEMENT'

export interface AdminNewsListItem {
  id: number
  title: string
  coverImageUrl?: string | null
  type: NewsType
  viewCount: number
  authorName: string
  publishedAt: string
  active: boolean
}

export interface AdminNews extends AdminNewsListItem {
  titleKy?: string | null
  content: string
  contentKy?: string | null
}

export interface NewsPayload {
  title: string
  titleKy?: string
  coverImageUrl?: string
  content: string
  contentKy?: string
  type: NewsType
  publishedAt: string
}

/* ─────────────────────────── Videos ─────────────────────────── */

export interface AdminVideoListItem {
  id: number
  title: string
  thumbnailUrl?: string | null
  subject?: string | null
  duration?: string | null
  viewCount: number
  createdAt: string
  active: boolean
  testId?: number | null
}

export interface AdminVideo extends AdminVideoListItem {
  titleKy?: string | null
  description?: string | null
  descriptionKy?: string | null
  videoUrl: string
  orderIndex: number
  durationSeconds: number
}

export interface VideoPayload {
  title: string
  titleKy?: string
  description?: string
  descriptionKy?: string
  thumbnailUrl?: string
  videoUrl: string
  testId?: number | null
  orderIndex: number
  durationSeconds: number
}

/* ─────────────────────────── Game tests ─────────────────────────── */

export interface GameOption {
  id?: number
  text: string
  correct: boolean
}

export interface GameQuestion {
  id?: number
  text: string
  imageUrl?: string | null
  orderIndex: number
  active?: boolean
  options: GameOption[]
}

export interface GameTest {
  id: number
  title: string
  description?: string | null
  timeLimitSeconds: number
  questionsPerGame: number
  active: boolean
  questionCount: number
  questions?: GameQuestion[]
}

export interface GameTestPayload {
  title: string
  description?: string
  timeLimitSeconds: number
  questionsPerGame: number
  questions?: GameQuestion[]
}

export interface GameQuestionPayload {
  text: string
  imageUrl?: string
  orderIndex: number
  options: GameOption[]
}

export interface GameReportRow {
  roomId: number
  playedAt: string
  player1Name: string
  player2Name: string
  player1Score: number
  player2Score: number
  winnerName: string
  totalQuestions: number
}

export interface GameReport {
  gameTestId: number
  gameTestTitle: string
  totalGames: number
  totalPlayers: number
  games: GameReportRow[]
}

/* ─────────────────────────── Rating ─────────────────────────── */

export interface RatingEntry {
  userId: number
  fullName: string
  phone: string
  avatarUrl?: string | null
  rank: number
  totalPoints: number
  pvpWins: number
}
