import Link from 'next/link'

export default function PendingPage() {
  return (
    <div className="max-w-screen-md mx-auto py-16">
      <h1 className="text-2xl font-bold">Access pending</h1>
      <p className="mt-4">Your account is awaiting approval by the admin. The admin will approve or reject your request.</p>
      <p className="mt-4">Please wait or contact the admin for faster approval.</p>
      <p className="mt-6"><Link href="/">Return home</Link></p>
    </div>
  )
}
