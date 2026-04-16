"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStoredRole } from "@/hooks/use-auth"

export function useRequireRole(requiredRole: string) {
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return
    const role = getStoredRole()
    if (!role) {
      router.replace("/login")
      return
    }
    if (role !== requiredRole) {
      router.replace(role === "admin" ? "/admin" : "/user")
      return
    }
    setReady(true)
  }, [router, requiredRole])

  return ready
}
