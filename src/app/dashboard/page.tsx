import { getMonthStats } from '@/lib/stats'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date()
  const { monthlyGrocery, totalPoints, costPerPoint, perUser } = await getMonthStats(
    now.getUTCFullYear(),
    now.getUTCMonth(),
  )
  const fmt = (n: number) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="gradient-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Grocery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(monthlyGrocery)}</div>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>
        <Card className="gradient-card sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost per Point
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(costPerPoint)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perUser.map((u) => (
          <Card key={u.userId} className="gradient-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{u.name}</div>
                <div className="text-sm text-gray-600">{u.points} pts</div>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Personal Spend</span>
                  <span>{fmt(u.personalSpend)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Food Cost</span>
                  <span>{fmt(u.foodCost)}</span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between font-medium">
                  <span className="text-gray-500">Balance</span>
                  <span className={u.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {fmt(u.balance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {perUser.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No users yet. Add users in Setup to get started.
          </div>
        )}
      </div>
    </div>
  )
}
