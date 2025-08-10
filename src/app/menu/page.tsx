"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const days = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]
const meals = ["Breakfast", "Lunch", "Dinner"]

export default function FoodMenuPage() {
  const [menu, setMenu] = useState<Record<string, Record<string, string>>>({})
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ day: string, meal: string } | null>(null)
  const [input, setInput] = useState("")

  function handleCellClick(day: string, meal: string) {
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
    <main className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Weekly Food Menu</h1>
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
                  className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap"
                >
                  {meal}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="even:bg-slate-900/40 odd:bg-slate-800/30">
                <td className="font-semibold px-2 sm:px-4 py-2 sm:py-3 text-white whitespace-nowrap">{day}</td>
                {meals.map((meal) => (
                  <td key={meal} className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                    <Button
                      variant="ghost"
                      className="w-full rounded bg-slate-800/60 text-slate-200 py-2 text-xs sm:text-sm font-medium shadow-inner min-w-[80px] sm:min-w-[100px] hover:bg-indigo-900/60 transition"
                      onClick={() => handleCellClick(day, meal)}
                    >
                      {menu[day]?.[meal] ? (
                        <span>{menu[day][meal]}</span>
                      ) : (
                        <span className="opacity-60">Add {meal}</span>
                      )}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${editing.meal} for ${editing.day}` : "Edit Menu"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSave()
            }}
            className="space-y-4"
          >
            <Input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter menu item"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={!input.trim()} className="w-full sm:w-auto">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}