import prisma from './prisma'
import type { User } from '@prisma/client'

export async function getSessionUserByAuthId(authId: string | null, email?: string | null): Promise<(User & { authId?: string | null }) | null> {
  if (!authId && !email) return null
  if (authId) {
    const user = await prisma.user.findFirst({ where: { authId } })
    if (user) return user as User
  }
  if (email) {
  const byEmail = await prisma.user.findFirst({ where: { email } })
    if (byEmail) {
      if (authId) {
  await prisma.user.update({ where: { id: byEmail.id }, data: { authId } })
      }
      return { ...byEmail, authId } as User & { authId?: string | null }
    }
  }
  return null
}

export async function requireUserByAuthId(authId: string | null, email?: string | null) {
  const user = await getSessionUserByAuthId(authId, email)
  if (!user || (user as any).approved !== true) throw new Error('Not approved')
  return user as User & { authId?: string | null }
}

export async function requireAdminByAuthId(authId: string | null, email?: string | null) {
  const user = await requireUserByAuthId(authId, email)
  if ((user as any).role !== 'ADMIN') throw new Error('Not authorized')
  return user as User & { authId?: string | null }
}
