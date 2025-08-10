import prisma from '@/lib/prisma'
import AddGroceryForm from '@/components/AddGroceryForm'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function formatCurrency(cents: number, currency = 'INR', locale = 'en-IN') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format((cents || 0) / 100)
}

type GroceryListItem = {
  id: string
  item: string
  amount: number
  paid: boolean
  date: Date
  user: { id: string; name: string } | null
}

type SimpleUser = { id: string; name: string }

export default async function GroceriesPage() {
  const items = (await prisma.grocery.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      item: true,
      amount: true,
      paid: true,
      date: true,
      user: { select: { id: true, name: true } },
    },
  })) as GroceryListItem[]

  const users = (await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  })) as SimpleUser[]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Groceries</h1>
      
      <Card className="gradient-card">
        <CardContent className="p-6">
          <AddGroceryForm users={users} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {items.map((g) => (
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
        ))}
        {items.length === 0 && (
          <Card className="gradient-card">
            <CardContent className="p-6 text-center text-muted-foreground">
              No groceries yet. Add your first grocery item above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
