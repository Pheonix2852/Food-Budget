import prisma from '@/lib/prisma'
// AddUserForm removed: users are added via Clerk sign-in + admin approval
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { safeGetAuth } from '@/lib/safeGetAuth'
import { headers } from 'next/headers'

type SimpleUser = { id: string; name: string; createdAt: Date }
async function deleteUser(userId: string) {
  "use server";
  // Use Next's headers() to provide a proper headers object to Clerk
  const a: any = safeGetAuth({ headers: headers() } as any)
  const authId = a.userId || null
  // require admin on server before deleting
  if (!authId) throw new Error('Unauthorized')
  const user = await prisma.user.findFirst({ where: { authId } })
  if (!user || (user as any).role !== 'ADMIN') throw new Error('Forbidden')

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/setup");
  redirect("/setup");
}

// Server component wrapper to show Delete button only to admins.
async function ServerDeleteButton({ userId }: { userId: string }) {
  const a: any = safeGetAuth({ headers: headers() } as any)
  const authId = a.userId || null
  if (!authId) return null
  const caller = await prisma.user.findFirst({ where: { authId } })
  if (!caller || (caller as any).role !== 'ADMIN') return null

  return (
    <form action={deleteUser.bind(null, userId)}>
      <Button type="submit" variant="destructive" size="sm">
        Delete
      </Button>
    </form>
  )
}

export default async function SetupPage() {
  const users = (await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, createdAt: true },
  })) as SimpleUser[]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-center">Setup</h1>

      <div className="max-w-3xl mx-auto">
        <div className="rounded-md bg-yellow-50 p-4 mb-4 border border-yellow-200">
          <p className="text-sm text-yellow-800 text-center">
            Users are created by signing in via the sign-in page. New accounts remain in "pending" until an admin approves them from the Admin Requests page.
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <Card key={u.id} className="gradient-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                <Avatar>
                  <AvatarFallback>
                    {u.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <h3 className="font-medium">{u.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {/* Delete button visible only to admins */}
                <ServerDeleteButton userId={u.id} />
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && (
          <Card className="col-span-full gradient-card">
            <CardContent className="p-6 text-center text-muted-foreground">
              No users yet. Add your first user above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
