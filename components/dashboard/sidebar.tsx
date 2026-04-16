"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  FlaskConical,
  Settings,
} from "lucide-react"

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Hospitals", href: "/dashboard/hospitals", icon: Building2 },
  { name: "Patient Requests", href: "/dashboard/requests", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Simulation", href: "/dashboard/simulation", icon: FlaskConical },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <Image
          src="/images/nalam-logo.png"
          alt="Nalam Logo"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">Nalam</h1>
          <p className="text-xs text-muted-foreground">Hospital Load Balancer</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Connection Status */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-available opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-available" />
          </span>
          <span className="text-xs font-medium text-status-available">Live Updates</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Connected to Supabase</p>
      </div>
    </aside>
  )
}
