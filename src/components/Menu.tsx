"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const days = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]
const meals = ["Breakfast", "Lunch", "Dinner"]

export default function Menu() {
  const [menu, setMenu] = useState<Record<string, Record<string, string>>>({})
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ day: string, meal: string } | null>(null)
  const [input, setInput] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/status', { credentials: 'include' })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          setIsAdmin(data.role === 'ADMIN')
        } else {
          setIsAdmin(false)
        }
      } catch (e) {
        setIsAdmin(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  function handleCellClick(day: string, meal: string) {
    if (!isAdmin) return
    setEditing({ day, meal })
    setInput(menu[day]?.[meal] || "")
    setOpen(true)
  }

  function handleSave() {
    if (editing) {
      setMenu((prev) => ({
        ...prev,
        [editing.day]: {
          ...prev[editing.day],
          [editing.meal]: input,
        }
      }))
    }
    setOpen(false)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[500px] w-full border-separate border-spacing-0 rounded-lg shadow-lg bg-background/80 text-xs sm:text-sm">
        <thead>
          <tr>
            <th className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white px-2 sm:px-4 py-2 sm:py-3 rounded-tl-lg whitespace-nowrap">
              Day
            </th>
            {meals.map((meal) => (
              <th
                key={meal}
                className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white px-2 sm:px-4 py-2 sm:py-3 last:rounded-tr-lg whitespace-nowrap"
              >
                {meal}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => (
            <tr key={day}>
              <td
                className={`border px-2 sm:px-4 py-2 sm:py-3 font-medium ${dayIndex === days.length - 1 ? "rounded-bl-lg" : ""
                  }`}
              >
                {day}
              </td>
              {meals.map((meal, mealIndex) => {
                const isLastColumn = mealIndex === meals.length - 1
                const isLastRow = dayIndex === days.length - 1
                const value = menu[day]?.[meal] || ""
                return (
                  <td
                    key={`${day}-${meal}`}
                      className={`border px-2 sm:px-4 py-2 sm:py-3 ${isAdmin ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : 'bg-transparent'} ${isLastRow && isLastColumn ? "rounded-br-lg" : ""}`}
                      onClick={() => handleCellClick(day, meal)}
                      aria-disabled={!isAdmin}
                  >
                      {value ? (
                        <div className="min-h-[40px] whitespace-pre-wrap break-words">
                          {value}
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center h-10 ${isAdmin ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          <span className="text-xs">{isAdmin ? 'Click to add' : '—'}</span>
                        </div>
                      )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? `${editing.day} ${editing.meal}` : "Edit Menu"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Enter menu items..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] resize-y"
              autoFocus
            />
            <Button onClick={handleSave} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
