import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ScheduleClient from '@/components/ScheduleClient'
import AddExtraMealForm from '@/components/AddExtraMealForm'
export const dynamic = "force-dynamic";

type SimpleUser = { id: string; name: string }

export default async function SchedulePage() {
  const users = (await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  })) as SimpleUser[]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Meal Schedule</h1>
      
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Regular Schedule</TabsTrigger>
          <TabsTrigger value="extra">Extra Meals</TabsTrigger>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
