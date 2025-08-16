import './globals.css'
import { Poppins } from 'next/font/google'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MobileNav } from '@/components/MobileNav'
import DateRefreshClient from '@/components/DateRefreshClient'
import RegisterAfterSignIn from '@/components/RegisterAfterSignIn'
import AppProviders from '@/components/AppProviders'
import RequireAuth from '@/components/RequireAuth'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

const navigation = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Groceries', href: '/groceries' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Menu', href: '/menu' },
  { label: 'Archives', href: '/archives' },
  { label: 'Setup', href: '/setup' },
]

export const metadata: Metadata = {
  title: 'Food Budget',
  description: 'Points-based shared food budget calculator',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("dark", poppins.variable)}>
      <body className={cn("min-h-screen font-sans", poppins.className)}>
        <AppProviders publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || null}>
          <nav className="sticky top-0 z-50 border-b shadow-lg bg-gradient-dark backdrop-blur supports-[backdrop-filter]:bg-gradient-dark/95">
            <div className="max-w-screen-xl mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-gradient"
                >
                  <span className="text-white text-2xl">🍽️</span>
                  <span className="inline text-sm sm:text-xl md:text-2xl">Food Budget</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                  {navigation.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      asChild
                      className="text-white/90 hover:text-white hover-gradient transition-all duration-200"
                    >
                      <Link href={item.href as any}>{item.label}</Link>
                    </Button>
                  ))}
                </div>

                {/* Mobile Navigation */}
                <div className="flex items-center gap-2">
                  <MobileNav navigation={navigation} />
                </div>

                {/* Right-side user area (single copy) */}
                <div className="ml-2">
                  <SignedIn>
                    <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8' } }} />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton>
                      <Button variant="ghost" className="text-white/90">Sign in</Button>
                    </SignInButton>
                  </SignedOut>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-screen-xl mx-auto px-4 py-8">
            <DateRefreshClient />
            {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? <RegisterAfterSignIn /> : null}
            <RequireAuth />
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  )
}
