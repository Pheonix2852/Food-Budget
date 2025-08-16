"use client"

import { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'

export default function AppProviders({ children, publishableKey }: { children: ReactNode; publishableKey?: string | null }) {
  if (!publishableKey) return <>{children}</>
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
}
