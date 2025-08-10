"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export const dynamic = "force-dynamic";

export default function AddUserForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add user')
      }

      toast({
        title: "Success!",
        description: "User has been added successfully.",
        duration: 5000,
      })

      setName("")
      router.refresh()

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Enter user name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="bg-background text-foreground"
        disabled={loading}
      />

      <Button 
        type="submit" 
        disabled={loading || !name.trim()}
        className="w-full sm:w-auto"
      >
        {loading ? "Adding..." : "Add User"}
      </Button>
    </form>
  )
}