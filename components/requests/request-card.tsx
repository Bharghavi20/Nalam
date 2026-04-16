"use client"

import { MapPin, Heart, AlertTriangle, Activity, Brain } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PatientRequest } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RequestCardProps {
  request: PatientRequest
}

function getConditionIcon(conditionType: string) {
  switch (conditionType) {
    case "Cardiac":
      return Heart
    case "Accident":
      return AlertTriangle
    case "Neuro":
      return Brain
    default:
      return Activity
  }
}

function getSeverityStyle(severity: string) {
  switch (severity) {
    case "Critical":
      return { bg: "bg-status-full/10", text: "text-status-full", border: "border-status-full/20" }
    case "Medium":
      return { bg: "bg-status-high-load/10", text: "text-status-high-load", border: "border-status-high-load/20" }
    case "Low":
      return { bg: "bg-status-available/10", text: "text-status-available", border: "border-status-available/20" }
    default:
      return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted" }
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "allocated":
      return "bg-status-allocated text-white"
    case "pending":
      return "bg-status-pending text-white"
    case "closed":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function RequestCard({ request }: RequestCardProps) {
  const Icon = getConditionIcon(request.condition_type)
  const severityStyle = getSeverityStyle(request.severity)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", severityStyle.bg)}>
              <Icon className={cn("h-5 w-5", severityStyle.text)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-semibold", severityStyle.text)}>
                  {request.patient_id}
                </span>
                <Badge variant="outline" className={cn("text-xs", severityStyle.bg, severityStyle.text, severityStyle.border)}>
                  {request.severity} · {request.condition_type}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {request.location}
              </div>
            </div>
          </div>
          <Badge className={cn("shrink-0 uppercase text-xs", getStatusStyle(request.status))}>
            {request.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
