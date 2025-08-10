import './globals.css'
import { Poppins } from 'next/font/google'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

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
  { label: 'Setup', href: '/setup' },
] as const

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
        <nav className="sticky top-0 z-50 border-b shadow-lg bg-gradient-dark backdrop-blur supports-[backdrop-filter]:bg-gradient-dark/95">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-2xl font-bold text-gradient"
              >
                <span className="text-white">🍽️</span>
                <span className="hidden sm:inline">Food Budget</span>
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
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </div>

              {/* Mobile Navigation */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white/90 hover:text-white hover-gradient"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="bg-gradient-dark border-l-0"
                >
                  <nav className="flex flex-col gap-4 mt-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-lg font-medium text-white/90 hover:text-white hover-gradient rounded-md px-3 py-2 transition-all duration-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>

        <main className="max-w-screen-xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
