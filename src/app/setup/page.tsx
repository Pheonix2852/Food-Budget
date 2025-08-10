import prisma from '@/lib/prisma'
import AddUserForm from '@/components/AddUserForm'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

type SimpleUser = { id: string; name: string; createdAt: Date }
async function deleteUser(userId: string) {
  "use server";
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/setup");
  redirect("/setup");
}

export default async function SetupPage() {
  const users = (await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, createdAt: true },
  })) as SimpleUser[]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-center">Setup</h1>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Add User</CardTitle>
        </CardHeader>
        <CardContent>
          <AddUserForm />
        </CardContent>
      </Card>

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
                <form action={deleteUser.bind(null, u.id)}>
                  <Button type="submit" variant="destructive" size="sm">
                    Delete
                  </Button>
                </form>
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
