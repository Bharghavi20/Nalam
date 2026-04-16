"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Building2, CheckCircle2 } from "lucide-react"
import type { ActivityLog } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ActivityFeedProps {
  activities: ActivityLog[]
}

function getActivityIcon(eventType: string) {
  switch (eventType) {
    case "patient_request":
      return UserPlus
    case "hospital_update":
      return Building2
    case "patient_allocated":
      return CheckCircle2
    default:
      return Building2
  }
}

function getActivityStyle(eventType: string) {
  switch (eventType) {
    case "patient_request":
      return { bg: "bg-primary/10", color: "text-primary" }
    case "hospital_update":
      return { bg: "bg-status-high-load/10", color: "text-status-high-load" }
    case "patient_allocated":
      return { bg: "bg-status-available/10", color: "text-status-available" }
    default:
      return { bg: "bg-muted", color: "text-muted-foreground" }
  }
}

function getActivityBadge(eventType: string) {
  switch (eventType) {
    case "patient_request":
      return { label: "New", className: "bg-primary/10 text-primary border-primary/20" }
    case "patient_allocated":
      return { label: "Success", className: "bg-status-available/10 text-status-available border-status-available/20" }
    default:
      return null
  }
}

function formatActivityDescription(activity: ActivityLog) {
  const { metadata, event_type } = activity
  
  switch (event_type) {
    case "patient_request":
      return `${metadata.time || ""} · ${metadata.severity || ""} · ${metadata.location || ""}`
    case "hospital_update":
      return `${metadata.time || ""} · ${metadata.hospital || ""} · Beds: ${metadata.beds_change || ""}`
    case "patient_allocated":
      return `${metadata.time || ""} · ${metadata.hospital || ""} → Patient #${metadata.patient_id || ""}`
    default:
      return ""
  }
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <Link
          href="/requests"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.event_type)
          const style = getActivityStyle(activity.event_type)
          const badge = getActivityBadge(activity.event_type)

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", style.bg)}>
                <Icon className={cn("h-4 w-4", style.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {formatActivityDescription(activity)}
                </p>
              </div>
              {badge && (
                <Badge variant="outline" className={cn("shrink-0 text-xs", badge.className)}>
                  {badge.label}
                </Badge>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
