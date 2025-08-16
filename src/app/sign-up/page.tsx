"use client"

import React from 'react'
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6">
  <SignUp routing="hash" />
      </div>
    </div>
  )
}
