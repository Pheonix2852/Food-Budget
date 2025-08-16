import prisma from '@/lib/prisma'

export type MealKind = 'BREAKFAST' | 'LUNCH' | 'DINNER'
export type DisabledType = MealKind | 'FULL_DAY'

export const isMealKind = (v: string): v is MealKind => v === 'BREAKFAST' || v === 'LUNCH' || v === 'DINNER'

export interface User {
  id: string
  name: string
  createdAt: Date
}

export interface Grocery {
  item: string
  amount: number // cents
  paid: boolean
  date: Date
  userId?: string | null
}

export interface MealSchedule {
  id: string
  userId: string
  date: Date
  breakfast: boolean
  lunch: boolean
  dinner: boolean
}

export interface ExtraMeal {
  id: string
  userId: string
  date: Date
  type: MealKind
}

export interface DisabledMealEntry {
  id: string
  date: Date
  type: DisabledType
}

export interface UserMonthlyBreakdown {
  userId: string
  name: string
  points: number
  personalSpendCents: number
  foodCostCents: number
  balanceCents: number
}

export interface MonthlyStats {
  monthKey: string
  totalGroceryCents: number
  totalPoints: number
  costPerPointCents: number
  users: UserMonthlyBreakdown[]
}

const MEAL_POINTS: Record<MealKind, number> = {
  BREAKFAST: 1,
  LUNCH: 2,
  DINNER: 2,
}

const ymd = (d: Date) => {
  const dt = new Date(d)
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(
    dt.getUTCDate(),
  ).padStart(2, '0')}`
}

const monthKeyOf = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`

const startOfMonthUTC = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
const endOfMonthUTC = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999))

const clampDateToMonth = (date: Date, month: Date) => {
  const start = startOfMonthUTC(month)
  const end = endOfMonthUTC(month)
  return new Date(Math.min(Math.max(date.getTime(), start.getTime()), end.getTime()))
}

const daysInRangeUTC = (start: Date, end: Date): string[] => {
  const result: string[] = []
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
  const endTime = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
  while (d.getTime() <= endTime) {
    result.push(ymd(d))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return result
}

function parseYmd(ymdStr: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymdStr)
  if (!m) return new Date(0)
  const [, y, mo, d] = m
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
}

function roundToCents(n: number) {
  return Math.round(n)
}

function pointsFromScheduleEntry(entry?: Pick<MealSchedule, 'breakfast' | 'lunch' | 'dinner'>) {
  const breakfast = entry?.breakfast ?? true
  const lunch = entry?.lunch ?? true
  const dinner = entry?.dinner ?? true
  let pts = 0
  if (breakfast) pts += MEAL_POINTS.BREAKFAST
  if (lunch) pts += MEAL_POINTS.LUNCH
  if (dinner) pts += MEAL_POINTS.DINNER
  return pts
}

export function computeMonthlyStats(params: {
  users: User[]
  groceries: Grocery[]
  schedules: MealSchedule[]
  extras: ExtraMeal[]
  disabled?: DisabledMealEntry[]
  batches?: { userId: string; startDate: Date; endDate: Date }[]
  now?: Date
  month?: Date
}): MonthlyStats {
  const now = params.now ?? new Date()
  const month = params.month ?? now
  const monthKey = monthKeyOf(month)

  

  const groceriesInMonth = params.groceries.filter((g) => monthKeyOf(g.date) === monthKey)
  const schedulesInMonth = params.schedules.filter((s) => monthKeyOf(s.date) === monthKey)
  const extrasInMonth = params.extras.filter((e) => monthKeyOf(e.date) === monthKey)
  const disabledInMonth = (params.disabled || []).filter((d) => monthKeyOf(d.date) === monthKey)

  

  const todayInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const lastCountDay = clampDateToMonth(todayInMonth, month)

  const scheduleByUserDate = new Map<string, MealSchedule>()
  for (const s of schedulesInMonth) {
    scheduleByUserDate.set(`${s.userId}|${ymd(s.date)}`, s)
  }

  const totalGroceryCents = groceriesInMonth.reduce((sum, g) => sum + (g.amount || 0), 0)

  const userPointMap = new Map<string, number>()
  const userPersonalSpendMap = new Map<string, number>()
  for (const u of params.users) {
    userPointMap.set(u.id, 0)
    userPersonalSpendMap.set(u.id, 0)
  }

  for (const g of groceriesInMonth) {
    if (g.paid && g.userId) {
      userPersonalSpendMap.set(g.userId, (userPersonalSpendMap.get(g.userId) || 0) + g.amount)
    }
  }

  for (const u of params.users) {
    const accrualStart = new Date(Math.max(startOfMonthUTC(month).getTime(), u.createdAt.getTime()))
    const dayKeys = daysInRangeUTC(accrualStart, lastCountDay)
    let points = 0

    for (const dayKey of dayKeys) {
      // skip days covered by a batch meal for this user
      const dayDate = parseYmd(dayKey)
      const hasBatch = (params.batches || []).some((b) => b.userId === u.id && dayDate >= b.startDate && dayDate <= b.endDate)
      if (hasBatch) continue
      const schedule = scheduleByUserDate.get(`${u.id}|${dayKey}`)
      // When a scheduled meal falls on a disabled meal entry, skip those meal points
      const disabledForDate = disabledInMonth.filter((d) => ymd(d.date) === dayKey).map((d) => d.type)
      // Start with default scheduled meals = all true (user opted-in), then overlay any saved schedule
      const entry = {
        breakfast: true,
        lunch: true,
        dinner: true,
      }
      if (schedule) {
        entry.breakfast = !!schedule.breakfast
        entry.lunch = !!schedule.lunch
        entry.dinner = !!schedule.dinner
      }
      if (disabledForDate.includes('FULL_DAY') || disabledForDate.includes('BREAKFAST')) entry.breakfast = false
      if (disabledForDate.includes('FULL_DAY') || disabledForDate.includes('LUNCH')) entry.lunch = false
      if (disabledForDate.includes('FULL_DAY') || disabledForDate.includes('DINNER')) entry.dinner = false
      points += pointsFromScheduleEntry(entry)
    }

    const userExtras = extrasInMonth.filter((e) => e.userId === u.id && e.date.getTime() <= lastCountDay.getTime())
    for (const ex of userExtras) {
      if (isMealKind(ex.type)) {
        // skip extra meal points if that meal was disabled on that date (or full day disabled)
        const disabled = disabledInMonth.some((d) => ymd(d.date) === ymd(ex.date) && (d.type === ex.type || d.type === 'FULL_DAY'))
        if (!disabled) points += MEAL_POINTS[ex.type]
      }
    }

    userPointMap.set(u.id, points)
  }

  const totalPoints = Array.from(userPointMap.values()).reduce((a, b) => a + b, 0)
  const costPerPointCents = totalPoints > 0 ? Math.round(totalGroceryCents / totalPoints) : 0

  const usersBreakdown: UserMonthlyBreakdown[] = params.users.map((u) => {
    const points = userPointMap.get(u.id) || 0
    const personalSpendCents = userPersonalSpendMap.get(u.id) || 0
    const foodCostCents = roundToCents(points * costPerPointCents)
    const balanceCents = personalSpendCents - foodCostCents
    return {
      userId: u.id,
      name: u.name,
      points,
      personalSpendCents,
      foodCostCents,
      balanceCents,
    }
  })

  return {
    monthKey,
    totalGroceryCents,
    totalPoints,
    costPerPointCents,
    users: usersBreakdown,
  }
}

// Server-side helper used by the dashboard page
export async function getMonthStats(year: number, monthZeroBased: number) {
  const monthDate = new Date(Date.UTC(year, monthZeroBased, 1))
  const start = startOfMonthUTC(monthDate)
  const end = endOfMonthUTC(monthDate)
  const [users, groceries, schedules, extras, disabledRows, batchesRaw] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.grocery.findMany({
      where: { date: { gte: start, lte: end } },
      select: { id: true, item: true, amount: true, paid: true, date: true, userId: true },
    }),
    prisma.mealSchedule.findMany({
      where: { date: { gte: start, lte: end } },
      select: { id: true, userId: true, date: true, breakfast: true, lunch: true, dinner: true },
    }),
    prisma.extraMeal.findMany({
      where: { date: { gte: start, lte: end } },
      select: { id: true, userId: true, date: true, type: true },
    }),
    prisma.disabledMeal.findMany({ where: { date: { gte: start, lte: end } }, select: { id: true, date: true, type: true } }),
    // Use raw query to fetch BatchMeal entries (avoid needing regenerated Prisma client types here)
    prisma.$queryRaw`SELECT id, "userId", "startDate", "endDate" FROM "BatchMeal" WHERE "startDate" <= ${end} AND "endDate" >= ${start}`,
  ])
  

  // Cast extras.type to MealKind where valid
  interface PrismaExtraMeal {
    id: string
    userId: string
    date: Date
    type: string
  }

  const extrasCast: ExtraMeal[] = (extras as any[])
    .map((e: PrismaExtraMeal): ExtraMeal => ({
      ...e,
      type: isMealKind(e.type) ? e.type : ('BREAKFAST' as MealKind),
    }))

  // Map typed Prisma rows to DisabledMealEntry
  const disabledCast: DisabledMealEntry[] = (Array.isArray(disabledRows) ? disabledRows : []).map((d: any) => ({
    id: d.id,
    date: new Date(d.date),
    type: d.type === 'FULL_DAY' ? 'FULL_DAY' : (isMealKind(d.type) ? d.type : ('BREAKFAST' as MealKind)),
  }))

  

  // Convert raw batch rows to typed batch objects
  const batchesArr: any[] = Array.isArray(batchesRaw) ? batchesRaw : (batchesRaw ? [batchesRaw] : [])
  const batches = (batchesArr || []).map((b: any) => ({
    userId: b.userId,
    startDate: new Date(b.startDate),
    endDate: new Date(b.endDate),
  }))

  const stats = computeMonthlyStats({
    users: users as User[],
    groceries: groceries as Grocery[],
    schedules: schedules as MealSchedule[],
    extras: extrasCast,
    disabled: disabledCast,
    batches,
    month: monthDate,
  })
  

  // Convert cents to currency units for UI
  return {
    monthlyGrocery: stats.totalGroceryCents / 100,
    totalPoints: stats.totalPoints,
    costPerPoint: stats.costPerPointCents / 100,
    perUser: stats.users.map((u) => ({
      userId: u.userId,
      name: u.name,
      points: u.points,
      personalSpend: u.personalSpendCents / 100,
      foodCost: u.foodCostCents / 100,
      balance: u.balanceCents / 100,
    })),
  }
}
