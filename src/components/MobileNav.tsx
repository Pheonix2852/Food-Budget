"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type NavigationItem = {
  label: string
  href: string
}

export function MobileNav({ navigation }: { navigation: readonly NavigationItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
              href={item.href as any}
              onClick={() => setOpen(false)}
              className="text-lg font-medium text-white/90 hover:text-white hover-gradient rounded-md px-3 py-2 transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
