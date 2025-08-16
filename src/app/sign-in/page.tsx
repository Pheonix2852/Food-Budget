"use client"

import React from 'react'
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6">
  <SignIn routing="hash" />
      </div>
    </div>
  )
}
