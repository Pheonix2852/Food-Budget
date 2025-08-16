import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ScheduleClient from '@/components/ScheduleClient'
import AddExtraMealForm from '@/components/AddExtraMealForm'
import BatchMealForm from '@/components/BatchMealForm'
import BatchMealList from '@/components/BatchMealList'
import AdminDisabledWrapper from '@/components/AdminDisabledWrapper'
import { getMonthDays } from '@/lib/date'
import { getAuth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { requireAdminByAuthId } from '@/lib/auth'
export const dynamic = "force-dynamic";

type SimpleUser = { id: string; name: string }

export default async function SchedulePage() {
  // Server-side: check if current request is from an admin so we can render the tab trigger conditionally
  let isAdmin = false
  try {
  const a: any = getAuth({ headers: headers() } as any)
    const authId = a?.userId || null
    const email = (a?.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a?.user?.primaryEmailAddress?.emailAddress || null
    await requireAdminByAuthId(authId, email)
    isAdmin = true
  } catch (e) {
    isAdmin = false
  }

  const users = (await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  })) as SimpleUser[]

  // Fetch batch meals with user names
  const batchesRaw: any[] = await prisma.$queryRaw`SELECT b.id, b."userId", u.name as "userName", to_char(b."startDate", 'YYYY-MM-DD') as "startDate", to_char(b."endDate", 'YYYY-MM-DD') as "endDate" FROM "BatchMeal" b JOIN "User" u ON u.id = b."userId" ORDER BY b."startDate" DESC`
  const batches = batchesRaw.map(b => ({ id: b.id, userId: b.userId, userName: b.userName, startDate: b.startDate, endDate: b.endDate }))

  // Fetch extras for the current month
  const { year, month0 } = getMonthDays()
  const start = new Date(Date.UTC(year, month0, 1))
  const end = new Date(Date.UTC(year, month0 + 1, 0, 23, 59, 59, 999))

  const extrasRaw = await prisma.extraMeal.findMany({
    where: { date: { gte: start, lte: end } },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { date: 'asc' }
  })
  const POINTS: Record<string, number> = { BREAKFAST: 1, LUNCH: 2, DINNER: 2 }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Meal Schedule</h1>
      <Card className="border">
        <CardHeader>
          <CardTitle>How this page works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div><strong>Regular Schedule</strong> — Manage your recurring meal attendance. These entries determine points accrued on regular days.</div>
            <div><strong>Extra Meals</strong> — Add one-off extra meals (breakfast/lunch/dinner). Extras add points for that date and are shown in the list below.</div>
            <div><strong>Batch Meal</strong> — Use this when someone is on a full-day batch (meals provided); batch meals exclude those days from point counting.</div>
            <div><strong>Disabled Meals</strong> — (Admin only) Admins can disable points for a meal or an entire day for all users; this subtracts the appropriate points for that date.</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Regular Schedule</TabsTrigger>
            <TabsTrigger value="extra">Extra Meals</TabsTrigger>
            <TabsTrigger value="batch">Batch Meal</TabsTrigger>
            {isAdmin && <TabsTrigger value="disabled">Disabled Meals</TabsTrigger>}
          </TabsList>
        
        <TabsContent value="schedule">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Regular Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleClient users={users} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="extra">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Add Extra Meal</CardTitle>
            </CardHeader>
            <CardContent>
              <AddExtraMealForm users={users} />
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Extra Meals (this month)</h3>
                {extrasRaw.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No upcoming extra meals.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {extrasRaw.map((e: any) => (
                      <div key={e.id} className="p-3 border rounded flex items-center justify-between">
                        <div>
                          <div className="font-medium">{e.user.name}</div>
                          <div className="text-sm text-muted-foreground">{new Date(e.date).toLocaleDateString()}</div>
                        </div>
                        <div className="text-sm flex items-center gap-2">
                          <div className="px-2 py-1 rounded bg-accent/10">{e.type}</div>
                          <div className="text-muted-foreground">+{POINTS[e.type] || 0} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Batch Meal</CardTitle>
            </CardHeader>
            <CardContent>
              <BatchMealForm users={users} />
              <div className="mt-4">
                <BatchMealList batches={batches} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disabled">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Disabled Meals (admin only)</CardTitle>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                // Admins get the client admin UI
                <AdminDisabledWrapper />
              ) : (
                // Non-admins see an error styled with the same Card pattern
                <div className="p-4 rounded border border-red-200 bg-red-50">
                  <div className="text-red-700 font-semibold">Not authorized</div>
                  <div className="text-sm text-red-600">You do not have permission to view Disabled Meals.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
