"use client"

import { Building2, Bed, HeartPulse, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Hospital, PatientRequest } from "@/lib/types"

interface StatsCardsProps {
  hospitals: Hospital[]
  requests: PatientRequest[]
}

export function StatsCards({ hospitals, requests }: StatsCardsProps) {
  const totalBeds = hospitals.reduce((sum, h) => sum + h.available_beds, 0)
  const totalIcu = hospitals.reduce((sum, h) => sum + h.available_icu, 0)
  const activeRequests = requests.filter(
    (r) => r.status === "pending" || r.status === "allocated"
  ).length

  const stats = [
    {
      label: "Total Hospitals",
      value: hospitals.length,
      subLabel: "Active in Network",
      icon: Building2,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Total Beds Available",
      value: totalBeds,
      subLabel: "Across All Hospitals",
      icon: Bed,
      iconBg: "bg-status-available/10",
      iconColor: "text-status-available",
    },
    {
      label: "ICU Beds Available",
      value: totalIcu,
      subLabel: "Critical Care",
      icon: HeartPulse,
      iconBg: "bg-status-high-load/10",
      iconColor: "text-status-high-load",
    },
    {
      label: "Active Patient Requests",
      value: activeRequests,
      subLabel: "Last 1 Hour",
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.subLabel}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
