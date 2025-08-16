"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MealCountSummary } from '@/lib/mealcount'

interface TodayMealCountProps {
  mealCount: MealCountSummary
}

export default function TodayMealCount({ mealCount: initial }: TodayMealCountProps) {
  const [mealCount, setMealCount] = useState<MealCountSummary>(initial)
  const [loading, setLoading] = useState(false)

  // Format date as "Day, Month Date"
  const formattedDate = new Date(mealCount.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  useEffect(() => {
    // fetch counts for client's local date to ensure local date alignment
    const local = new Date()
    const yyyy = local.getFullYear()
    const mm = String(local.getMonth() + 1).padStart(2, '0')
    const dd = String(local.getDate()).padStart(2, '0')
    const localYmd = `${yyyy}-${mm}-${dd}`

    if (localYmd !== initial.date) {
      setLoading(true)
      fetch(`/api/mealcount?date=${localYmd}`)
        .then(r => r.json())
        .then((data) => {
          if (!data?.error) setMealCount(data)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [initial])

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="text-lg">Today's Meal Count{loading ? ' • updating' : ''}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            {formattedDate}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 text-center">
              <div className="text-sm font-medium text-muted-foreground">Breakfast</div>
              <div className="text-3xl font-bold">{mealCount.breakfast}</div>
              <div className="mt-2">
                {(() => {
                  const names = mealCount.breakfastNames ?? []
                  const show = names.slice(0, 10)
                  const more = names.length - show.length
                  return names.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No one</div>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {show.map((name) => (
                        <div key={name} className="inline-flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{name.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[8rem]">{name}</span>
                        </div>
                      ))}
                      {more > 0 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5">+{more} more</div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
            
            <div className="space-y-2 text-center">
              <div className="text-sm font-medium text-muted-foreground">Lunch</div>
              <div className="text-3xl font-bold">{mealCount.lunch}</div>
              <div className="mt-2">
                {(() => {
                  const names = mealCount.lunchNames ?? []
                  const show = names.slice(0, 10)
                  const more = names.length - show.length
                  return names.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No one</div>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {show.map((name) => (
                        <div key={name} className="inline-flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{name.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[8rem]">{name}</span>
                        </div>
                      ))}
                      {more > 0 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5">+{more} more</div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
            
            <div className="space-y-2 text-center">
              <div className="text-sm font-medium text-muted-foreground">Dinner</div>
              <div className="text-3xl font-bold">{mealCount.dinner}</div>
              <div className="mt-2">
                {(() => {
                  const names = mealCount.dinnerNames ?? []
                  const show = names.slice(0, 10)
                  const more = names.length - show.length
                  return names.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No one</div>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {show.map((name) => (
                        <div key={name} className="inline-flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{name.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[8rem]">{name}</span>
                        </div>
                      ))}
                      {more > 0 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/5">+{more} more</div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
