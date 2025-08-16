"use server"

import prisma from './prisma'
import { startOfMonth, subMonths, endOfMonth, addDays } from 'date-fns'
import { computeMonthlyStats, isMealKind } from './stats'

const MEAL_POINTS: Record<string, number> = {
  BREAKFAST: 1,
  LUNCH: 2,
  DINNER: 2,
}

export type ArchivedMonth = {
  year: number
  month: number
  label: string
  available: boolean
}

export type MonthlyArchive = {
  groceries: any[]
  schedules: any[]
  extras: any[]
  summary: {
    totalGrocery: number
    totalPoints: number
    costPerPoint: number
    userSummaries: {
      userId: string
      name: string
      points: number
      personalSpend: number
      foodCost: number
      balance: number
    }[]
  }
}

/**
 * Archives data from the previous month.
 * This should be run at the beginning of each month.
 */
export async function archiveLastMonth() {
  const today = new Date()
  const lastMonth = subMonths(today, 1)
  await archiveMonth(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth() /* 0-based */, { cleanup: true })
}

/**
 * Archive a specific month.
 * @param year full year (e.g. 2025)
 * @param month0 zero-based month (0 = January, 11 = December)
 * @param options.cleanup whether to delete source data after archiving
 */
export async function archiveMonth(year: number, month0: number, options: { cleanup?: boolean } = {}) {
  const cleanup = options.cleanup ?? false
  const monthDate = new Date(Date.UTC(year, month0, 1))
  const startDate = startOfMonth(monthDate)
  const endDate = endOfMonth(monthDate)

  const groceries = await prisma.grocery.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    include: { user: { select: { id: true, name: true } } }
  })

  const schedules = await prisma.mealSchedule.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    include: { user: { select: { id: true, name: true } } }
  })

  const extras = await prisma.extraMeal.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    include: { user: { select: { id: true, name: true } } }
  })

  // Use computeMonthlyStats to get accurate points and monetary values
  const users = await prisma.user.findMany({ select: { id: true, name: true, createdAt: true } })

  const groceriesForStats = groceries.map((g: any) => ({
    id: g.id,
    item: g.item,
    amount: g.amount,
    paid: g.paid,
    date: new Date(g.date),
    userId: g.userId ?? g.user?.id ?? null,
  }))

  const schedulesForStats = schedules.map((s: any) => ({
    id: s.id,
    userId: s.userId,
    date: new Date(s.date),
    breakfast: !!s.breakfast,
    lunch: !!s.lunch,
    dinner: !!s.dinner,
  }))

  const extrasForStats = extras.map((e: any) => ({
    id: e.id,
    userId: e.userId,
    date: new Date(e.date),
    type: isMealKind(e.type) ? e.type : 'BREAKFAST'
  }))

  // Prepare extras for archive JSON with points added
  const extrasForArchive = extras.map((e: any) => ({
    id: e.id,
    user: e.user ? { id: e.user.id, name: e.user.name } : undefined,
    date: e.date,
    type: isMealKind(e.type) ? e.type : 'BREAKFAST',
    pointsAdded: MEAL_POINTS[isMealKind(e.type) ? e.type : 'BREAKFAST'] || 0,
  }))

  const stats = computeMonthlyStats({
    users: users as any,
    groceries: groceriesForStats,
    schedules: schedulesForStats,
    extras: extrasForStats,
    month: monthDate,
    now: endDate,
  })

  const userSummaries = stats.users.map(u => ({
    userId: u.userId,
    name: u.name,
    points: u.points,
    personalSpend: u.personalSpendCents,
    foodCost: u.foodCostCents,
    balance: u.balanceCents,
  }))

  // Create the archive record using computed stats
  try {
    await prisma.monthlyArchive.create({
      data: {
        year: year,
        month: month0,
        data: JSON.stringify({
          groceries,
          schedules,
          extras: extrasForArchive,
          summary: {
            totalGrocery: stats.totalGroceryCents,
            totalPoints: stats.totalPoints,
            costPerPoint: stats.costPerPointCents,
            userSummaries,
          }
        })
      }
    })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      console.warn(`Archive for ${year}-${month0} already exists`)
    } else {
      throw err
    }
  }

  if (cleanup) {
    await cleanupAfterArchive(startDate, endDate)
  }
}

/**
 * Calculate user summaries based on the given data.
 * This is a simplified version - you might want to reuse your existing logic.
 */
async function calculateUserSummaries(groceries: any[], schedules: any[], extras: any[]) {
  const users = await prisma.user.findMany()
  const userMap = new Map(users.map(u => [u.id, { ...u, points: 0, personalSpend: 0 }]))
  
  // Calculate points and spending
  // This would use your existing logic from stats.ts
  
  return Array.from(userMap.values()).map(u => ({
    userId: u.id,
    name: u.name,
    points: u.points || 0,
    personalSpend: u.personalSpend || 0,
    foodCost: 0, // Calculate based on points and cost per point
    balance: 0 // Calculate personalSpend - foodCost
  }))
}

/**
 * Delete old data after it has been archived.
 */
async function cleanupAfterArchive(startDate: Date, endDate: Date) {
  // Delete all groceries from the specified period
  await prisma.grocery.deleteMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  })
  
  // Delete all meal schedules from the specified period
  await prisma.mealSchedule.deleteMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  })
  
  // Delete all extra meals from the specified period
  await prisma.extraMeal.deleteMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  })
}

/**
 * Gets a list of available archived months
 */
export async function getAvailableArchives(): Promise<ArchivedMonth[]> {
  const archives = await prisma.monthlyArchive.findMany({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ]
  })
  
  const today = new Date()
  const now = new Date()

  return archives.map(archive => {
    const archiveDate = new Date(archive.year, archive.month, 1)
    const archiveEndDate = endOfMonth(archiveDate)
    const expiry = addDays(archiveEndDate, 5)
    const isAvailable = now.getTime() <= expiry.getTime()
    
    return {
      year: archive.year,
      month: archive.month,
      label: archiveDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      available: isAvailable
    }
  })
}

/**
 * Gets a specific month's archive
 */
export async function getMonthArchive(year: number, month: number): Promise<MonthlyArchive | null> {
  const archive = await prisma.monthlyArchive.findFirst({
    where: {
      year,
      month
    }
  })
  
  if (!archive || !archive.data) return null
  
  try {
    return JSON.parse(archive.data.toString()) as MonthlyArchive
  } catch (error) {
    console.error("Error parsing archive data:", error)
    return null
  }
}
