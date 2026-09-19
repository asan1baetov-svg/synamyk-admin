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
  durationMinutes: number
  questionCount: number
  active: boolean
  /** explicit ОРТ points of the section; null = proportional share of test.maxScore */
  maxScore?: number | null
  /** presigned URL in responses; objectKey on write */
  iconUrl?: string | null
}

export interface AdminTest {
  id: number
  title: string
  titleKy?: string | null
  description?: string | null
  descriptionKy?: string | null
  iconUrl?: string | null
  /** price of the whole test — the only thing that can be bought */
  price: number
  /** ОРТ max score of the whole test (default 245) */
  maxScore?: number | null
  active: boolean
  /** free-window: the test is free for everyone while now is inside [freeFrom, freeUntil) */
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
  maxScore?: number
}

export interface PricingPayload {
  /** price of the whole test; 0 = free */
  price: number
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
  durationMinutes: number
  /** null = auto (proportional share of test.maxScore) */
  maxScore?: number | null
  iconUrl?: string
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

export type QuestionType = 'STANDARD' | 'COMPARISON'

export type ComparisonAnswer = 'A_GREATER' | 'B_GREATER' | 'EQUAL' | 'UNDETERMINED'

export interface AdminQuestion {
  id: number
  questionType?: QuestionType | null
  columnA?: string | null
  columnAKy?: string | null
  columnB?: string | null
  columnBKy?: string | null
  figure?: Figure | null
  passageId?: number | null
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
  /** optional only for COMPARISON + comparisonAnswer (server generates the 4 standard options) */
  options?: QuestionOptionPayload[]
  questionType: QuestionType
  columnA?: string
  columnAKy?: string
  columnB?: string
  columnBKy?: string
  comparisonAnswer?: ComparisonAnswer
  figure: Figure | null
  passageId: number | null
}

/* ─────────────────────────── Reading passages (inside a section) ─────────────────────────── */

export interface Passage {
  id: number
  subTestId: number
  title?: string | null
  titleKy?: string | null
  /** one line per line — the app numbers every 5th */
  text: string
  textKy?: string | null
  imageUrl?: string | null
  orderIndex: number
  active: boolean
  questionCount: number
}

export interface PassagePayload {
  title?: string
  titleKy?: string
  text: string
  textKy?: string
  imageUrl?: string
  orderIndex: number
}

/* ─────────────────────────── Figure (coordinate plane / geometry) ─────────────────────────── */

export type FigureType = 'COORDINATE_PLANE' | 'GEOMETRY'

export type FigurePoint = [number, number]

export type FigureElementKind =
  | 'POINT'
  | 'TEXT'
  | 'SEGMENT'
  | 'LINE'
  | 'RAY'
  | 'VECTOR'
  | 'POLYGON'
  | 'POLYLINE'
  | 'CIRCLE'
  | 'ARC'
  | 'ANGLE'
  | 'FUNCTION'

/** Loose shape: which fields are required depends on `kind` (see lib/figure.ts). */
export interface FigureElement {
  kind: FigureElementKind
  x?: number
  y?: number
  text?: string
  from?: FigurePoint
  to?: FigurePoint
  points?: FigurePoint[]
  labels?: string[]
  center?: FigurePoint
  radius?: number
  startAngle?: number
  endAngle?: number
  vertex?: FigurePoint
  right?: boolean
  expression?: string
  xFrom?: number
  xTo?: number
  label?: string
  color?: string
  fill?: string
  dashed?: boolean
}

export interface Figure {
  type: FigureType
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  gridStep?: number
  showGrid?: boolean
  showAxes?: boolean
  xLabel?: string
  yLabel?: string
  elements: FigureElement[]
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
  grantedAt: string
  expiresAt?: string | null
  status: AccessStatus
}

export interface AccessGrantPayload {
  userId: number
  testId: number
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
  /** test title, or the product title for ALL_TESTS / ALL_TEXTS purchases */
  testTitle: string
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
  figure?: Figure | null
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
  figure?: Figure | null
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

/* ─────────────────────────── Products & settings ─────────────────────────── */

export type ProductCode = 'ALL_TESTS' | 'ALL_TEXTS'

export interface Product {
  code: ProductCode
  title: string
  description?: string | null
  price: number
  oldPrice?: number | null
  /** true = on sale */
  available: boolean
  owned?: boolean
  features?: string[] | null
}

export interface ProductPayload {
  price: number
  oldPrice?: number | null
  active: boolean
}

export interface AppConfig {
  ortExamDate?: string | null
  secondsUntilExam?: number | null
  ortMaxScore?: number | null
  ortThresholdScore?: number | null
  schoolRatingMinStudents?: number | null
}

export interface AllAccessPayload {
  userId: number
  product: ProductCode
  durationDays?: number | null
  expiresAt?: string | null
}

/* ─────────────────────────── Reading library («Тексттер») ─────────────────────────── */

export interface ReadingText {
  id: number
  title: string
  titleKy?: string | null
  content?: string | null
  contentKy?: string | null
  /** stored key — send it back as pdfUrl */
  pdfKey?: string | null
  /** presigned, temporary */
  pdfUrl?: string | null
  free: boolean
  orderIndex: number
  active: boolean
  createdAt: string
}

export interface ReadingTextPayload {
  title: string
  titleKy?: string
  content?: string
  contentKy?: string
  /** key from POST /api/admin/texts/pdf, or an external URL */
  pdfUrl?: string
  free: boolean
  orderIndex: number
  active: boolean
}

/* ─────────────────────────── Regions, districts, schools ─────────────────────────── */

export interface Region {
  id: number
  name: string
  nameKy?: string | null
}

export interface District {
  id: number
  regionId: number
  name: string
  nameKy?: string | null
  active: boolean
}

export interface DistrictPayload {
  regionId: number
  name: string
  nameKy?: string
  active: boolean
}

export interface School {
  id: number
  districtId: number
  name: string
  nameKy?: string | null
  active: boolean
}

export interface SchoolPayload {
  districtId: number
  name: string
  nameKy?: string
  active: boolean
}
