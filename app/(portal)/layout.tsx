"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const { role, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setHydrated(true)
  }, [])

  const navItems = useMemo(() => {
    if (!hydrated) return []

    return role === "admin"
      ? [
          { href: "/admin", label: "Dashboard" },
          { href: "/admin", label: "Hospitals" },
          { href: "/admin", label: "Simulation" },
          { href: "/admin", label: "Analytics" },
        ]
      : role === "user"
        ? [
            { href: "/user", label: "Home" },
            { href: "/user", label: "Find Hospital" },
            { href: "/user", label: "SOS" },
            { href: "/user", label: "History" },
          ]
        : []
  }, [hydrated, role])
    ? [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin", label: "Hospitals" },
        { href: "/admin", label: "Simulation" },
        { href: "/admin", label: "Analytics" },
      ]
    : role === "user"
      ? [
          { href: "/user", label: "Home" },
          { href: "/user", label: "Find Hospital" },
          { href: "/user", label: "SOS" },
          { href: "/user", label: "History" },
        ]
      : []

  useEffect(() => {
    if (!pathname) return

    const isAdminRoute = pathname.startsWith("/admin")
    const isUserRoute = pathname.startsWith("/user")

    if (!role) {
      if (isAdminRoute || isUserRoute) {
        router.replace("/login")
      }
      return
    }

    if (pathname === "/login") {
      router.replace(role === "admin" ? "/admin" : "/user")
      return
    }

    if (isAdminRoute && role !== "admin") {
      router.replace("/user")
    }

    if (isUserRoute && role !== "user") {
      router.replace("/admin")
    }
  }, [pathname, role, router])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-72 border-r border-border bg-card p-6">
        <div className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Nalam</p>
          <h1 className="text-2xl font-semibold">Hospital Load Balancer</h1>
          <p className="text-sm text-muted-foreground">
            Live routing, emergency response and hospital capacity management.
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href + item.label} href={item.href} className="block rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="block rounded-2xl border border-border bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20">
            Change role
          </Link>
        </nav>

        {role ? (
          <div className="mt-8 rounded-[2rem] border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{role === "admin" ? "Admin" : "User"}</p>
            <Button variant="secondary" className="mt-4 w-full" onClick={logout}>
              Logout
            </Button>
          </div>
        ) : null}
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
