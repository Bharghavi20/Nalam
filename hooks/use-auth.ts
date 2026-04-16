"use client"

import { useEffect, useState } from "react"

const ROLE_KEY = "nalam-role"

export function getStoredRole() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ROLE_KEY)
}

export function setStoredRole(role: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ROLE_KEY, role)
}

export function clearStoredRole() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(ROLE_KEY)
}

export function useAuth() {
  const [role, setRole] = useState<string | null>(() => getStoredRole())

  useEffect(() => {
    if (typeof window === "undefined") return
    setRole(getStoredRole())
  }, [])

  function logout() {
    clearStoredRole()
    setRole(null)
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  return {
    role,
    isAuthenticated: Boolean(role),
    logout,
  }
}
