"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { setStoredRole } from "@/hooks/use-auth"

const roles = [
  { value: "user", label: "User Portal" },
  { value: "admin", label: "Admin Portal" },
]

export default function LoginPage() {
  const [role, setRole] = useState("user")
  const router = useRouter()

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStoredRole(role)
    router.push(role === "admin" ? "/admin" : "/user")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-lg border border-border bg-card">
        <CardHeader>
          <CardTitle>Welcome to Nalam</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick your role to continue: User for hospital discovery, Admin to manage capacity.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="grid gap-3">
              {roles.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-3xl border border-border bg-background px-4 py-4">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm font-semibold">{option.label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2 rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
              <p className="font-semibold">Role privileges</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>User can request hospital recommendations and trigger SOS alerts.</li>
                <li>Admin can simulate hospital updates, change capacity, and observe live charts.</li>
              </ul>
            </div>

            <Button type="submit" className="w-full">
              Continue as {role === "admin" ? "Admin" : "User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
