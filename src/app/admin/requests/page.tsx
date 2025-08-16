import { requireAdminByAuthId } from '@/lib/auth'
import { safeGetAuth } from '@/lib/safeGetAuth'
import { headers } from 'next/headers'
import AdminRequestsClient from '@/components/AdminRequestsClient'

export default async function AdminRequestsPage() {
  const a: any = safeGetAuth({ headers: headers() } as any)
  const authId = a?.userId || null
  const email = (a?.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a?.user?.primaryEmailAddress?.emailAddress || null
  try {
    await requireAdminByAuthId(authId, email)
  } catch (err: any) {
    // Not authorized - show not found to hide page
    return <div className="max-w-screen-lg mx-auto py-12">Not found</div>
  }

  return <AdminRequestsClient />
}
