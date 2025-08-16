import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getMonthArchive } from '@/lib/archive'
import { formatCurrency } from '@/lib/money'

export const dynamic = "force-dynamic"

export default async function ArchiveDetailPage({
  params
}: {
  params: { year: string; month: string }
}) {
  const year = parseInt(params.year, 10)
  const month = parseInt(params.month, 10)

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    notFound()
  }

  const archiveData = await getMonthArchive(year, month)
  
  if (!archiveData) {
    notFound()
  }

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long' })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {monthName} {year} Archive
        </h1>
        <Badge variant="outline" className="text-xs">
          Archive
        </Badge>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Grocery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(archiveData.summary.totalGrocery)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{archiveData.summary.totalPoints}</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cost per Point
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(archiveData.summary.costPerPoint)}
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">User Summary</TabsTrigger>
          <TabsTrigger value="groceries">Groceries</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archiveData.summary.userSummaries.map((user) => (
              <Card key={user.userId} className="gradient-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-semibold">{user.name}</div>
                    </div>
                    <div className="text-sm text-gray-600">{user.points} pts</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Personal Spend</span>
                      <span>{formatCurrency(user.personalSpend)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Food Cost</span>
                      <span>{formatCurrency(user.foodCost)}</span>
                    </div>
                    <div className="h-px bg-gray-100 my-2" />
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-500">Balance</span>
                      <span className={user.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(user.balance)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="groceries">
          <div className="space-y-4">
            {archiveData.groceries.length === 0 ? (
              <Card className="gradient-card">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No grocery data available for this month.
                </CardContent>
              </Card>
            ) : (
              archiveData.groceries.map((g: any) => (
                <Card key={g.id} className="gradient-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{g.item}</div>
                      <div className="text-sm text-muted-foreground space-x-2">
                        <span>{new Date(g.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{g.paid ? 'Paid' : 'Not Paid'}</span>
                        {g.user?.name && (
                          <>
                            <span>•</span>
                            <span>by {g.user.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-lg">{formatCurrency(g.amount)}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="meals">
          <div className="space-y-4">
            {archiveData.schedules.length === 0 && archiveData.extras.length === 0 ? (
              <Card className="gradient-card">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No meal data available for this month.
                </CardContent>
              </Card>
            ) : (
              <>
                <h3 className="text-lg font-semibold">Regular Schedules</h3>
                {archiveData.schedules.length === 0 ? (
                  <Card className="gradient-card">
                    <CardContent className="p-4 text-center text-muted-foreground">
                      No regular schedule data for this month.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {archiveData.schedules.map((s: any) => (
                      <Card key={s.id} className="gradient-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{s.user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(s.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className={`py-1 px-2 rounded text-center ${s.breakfast ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800/20 dark:text-gray-400'}`}>
                              Breakfast
                            </div>
                            <div className={`py-1 px-2 rounded text-center ${s.lunch ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800/20 dark:text-gray-400'}`}>
                              Lunch
                            </div>
                            <div className={`py-1 px-2 rounded text-center ${s.dinner ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800/20 dark:text-gray-400'}`}>
                              Dinner
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <h3 className="text-lg font-semibold mt-6">Extra Meals</h3>
                {archiveData.extras.length === 0 ? (
                  <Card className="gradient-card">
                    <CardContent className="p-4 text-center text-muted-foreground">
                      No extra meals for this month.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {archiveData.extras.map((e: any) => (
                      <Card key={e.id} className="gradient-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{e.user?.name ?? 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(e.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>{e.type}</Badge>
                              <div className="text-sm text-muted-foreground">+{e.pointsAdded ?? 0} pts</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
