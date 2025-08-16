import { Suspense } from 'react'
import { Separator } from "@/components/ui/separator"
import TodayMealCount from '@/components/TodayMealCount'
import { getTodayMealCount } from '@/lib/mealcount'
import Menu from '@/components/Menu'

export const dynamic = "force-dynamic"

export default async function MenuPage() {
  const mealCount = await getTodayMealCount()
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Menu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Suspense fallback={<div>Loading today's meal count...</div>}>
            <TodayMealCount mealCount={mealCount} />
          </Suspense>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Weekly Menu</h2>
          <Menu />
        </div>
      </div>
    </div>
  )
}
