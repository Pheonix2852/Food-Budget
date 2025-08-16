"use server"

import prisma from './prisma'
import { todayISO, parseYmdUTC } from './date'

export type MealCountSummary = {
  date: string
  breakfast: number
  lunch: number
  dinner: number
  breakfastNames?: string[]
  lunchNames?: string[]
  dinnerNames?: string[]
}

export async function getMealCountForDate(ymd: string): Promise<MealCountSummary> {
  const dateStr = ymd
  const day = parseYmdUTC(dateStr)

  if (!day) throw new Error(`Invalid date: ${dateStr}`)

  const nextDate = new Date(day)
  nextDate.setUTCDate(nextDate.getUTCDate() + 1)

  // Get all regular schedules for the provided day (range query)
  const schedules = await prisma.mealSchedule.findMany({
    where: { date: { gte: day, lt: nextDate } }
  })

  // Get extras for the day
  const extras = await prisma.extraMeal.findMany({
    where: { date: { gte: day, lt: nextDate } }
  })

  let breakfast = 0
  let lunch = 0
  let dinner = 0

  const scheduleByUser = new Map<string, { breakfast: boolean; lunch: boolean; dinner: boolean }>()
  for (const s of schedules) {
    scheduleByUser.set(s.userId, { breakfast: !!s.breakfast, lunch: !!s.lunch, dinner: !!s.dinner })
  }

  const users = await prisma.user.findMany({ select: { id: true, name: true } })

  // Fetch BatchMeal entries that cover this day and build a set of userIds to exclude
  const batchesRaw: any[] = await prisma.$queryRaw`SELECT "userId" FROM "BatchMeal" WHERE "startDate" <= ${day} AND "endDate" >= ${day}`
  const batchUserSet = new Set<string>((batchesRaw || []).map(b => b.userId))

  const breakfastSet = new Set<string>()
  const lunchSet = new Set<string>()
  const dinnerSet = new Set<string>()

  for (const u of users) {
  if (batchUserSet.has(u.id)) continue // user is on batch day -> skip
    const s = scheduleByUser.get(u.id)
    if (s) {
      if (s.breakfast) { breakfast++; breakfastSet.add(u.name) }
      if (s.lunch) { lunch++; lunchSet.add(u.name) }
      if (s.dinner) { dinner++; dinnerSet.add(u.name) }
    } else {
      // default all ON
      breakfast++; lunch++; dinner++
      breakfastSet.add(u.name); lunchSet.add(u.name); dinnerSet.add(u.name)
    }
  }

  const userNameById = new Map(users.map(u => [u.id, u.name]))
  for (const extra of extras) {
    const uname = userNameById.get(extra.userId) || 'Unknown'
  // ignore extras from batched users
  if (batchUserSet.has(extra.userId)) continue
  if (extra.type === 'Breakfast') { breakfast++; breakfastSet.add(uname) }
  if (extra.type === 'Lunch') { lunch++; lunchSet.add(uname) }
  if (extra.type === 'Dinner') { dinner++; dinnerSet.add(uname) }
  }

  return {
    date: dateStr,
    breakfast,
    lunch,
    dinner,
    breakfastNames: Array.from(breakfastSet),
    lunchNames: Array.from(lunchSet),
    dinnerNames: Array.from(dinnerSet)
  }
}

export async function getTodayMealCount(): Promise<MealCountSummary> {
  const today = todayISO()
  return getMealCountForDate(today)
}
