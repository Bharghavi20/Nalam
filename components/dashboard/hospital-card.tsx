"use client"

import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Hospital } from "@/lib/types"
import { getHospitalStatus, getStatusColor } from "@/lib/types"
import { cn } from "@/lib/utils"

interface HospitalCardProps {
  hospital: Hospital
  onViewDetails?: () => void
}

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "bg-status-available/10 text-status-available border-status-available/20"
    case "HIGH LOAD":
      return "bg-status-high-load/10 text-status-high-load border-status-high-load/20"
    case "FULL":
      return "bg-status-full/10 text-status-full border-status-full/20"
    default:
      return ""
  }
}

export function HospitalCard({ hospital, onViewDetails }: HospitalCardProps) {
  const status = getHospitalStatus(hospital.load_percentage)
  const statusColor = getStatusColor(status)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Hospital Icon & Info */}
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              status === "AVAILABLE" ? "bg-status-available/10" :
              status === "HIGH LOAD" ? "bg-status-high-load/10" : "bg-status-full/10"
            )}>
              <span className="text-xl">🏥</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{hospital.name}</h3>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {hospital.location} · {hospital.distance} km
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <Badge
            variant="outline"
            className={cn("shrink-0 text-xs font-medium", getStatusBadgeStyle(status))}
          >
            {status}
          </Badge>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Beds</p>
            <p className="text-sm font-semibold">
              <span className={statusColor}>{hospital.available_beds}</span>
              <span className="text-muted-foreground">/{hospital.total_beds}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ICU</p>
            <p className="text-sm font-semibold">
              <span className={statusColor}>{hospital.available_icu}</span>
              <span className="text-muted-foreground">/{hospital.icu_beds}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Load</p>
            <p className={cn("text-sm font-semibold", statusColor)}>
              {hospital.load_percentage}%
            </p>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={onViewDetails}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
