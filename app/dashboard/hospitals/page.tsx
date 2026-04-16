"use client"

import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, HeartPulse, TrendingUp } from "lucide-react"
import type { Hospital } from "@/lib/types"
import { getHospitalStatus } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

async function fetchHospitals(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .order("name")

  if (error) throw error
  return data as Hospital[]
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

function getLoadColor(load: number) {
  if (load >= 100) return "text-status-full"
  if (load >= 80) return "text-status-high-load"
  return "text-status-available"
}

export default function HospitalsPage() {
  const [supabase] = useState(() => createClient())
  const { data: hospitals, isLoading } = useSWR("all-hospitals", () => fetchHospitals(supabase), {
    refreshInterval: 10000,
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hospitals</h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage all connected hospitals in the network
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {hospitals?.map((hospital) => {
          const status = getHospitalStatus(hospital.load_percentage)
          return (
            <Card key={hospital.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl",
                      status === "AVAILABLE" ? "bg-status-available/10" :
                      status === "HIGH LOAD" ? "bg-status-high-load/10" : "bg-status-full/10"
                    )}>
                      🏥
                    </div>
                    <div>
                      <CardTitle className="text-lg">{hospital.name}</CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {hospital.location} · {hospital.distance} km
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-xs font-medium", getStatusBadgeStyle(status))}>
                    {status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
                  <div className="text-center">
                    <Bed className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-2xl font-semibold">
                      {hospital.available_beds}
                      <span className="text-sm text-muted-foreground">/{hospital.total_beds}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Beds Available</p>
                  </div>
                  <div className="text-center">
                    <HeartPulse className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-2xl font-semibold">
                      {hospital.available_icu}
                      <span className="text-sm text-muted-foreground">/{hospital.icu_beds}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">ICU Available</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className={cn("mt-1 text-2xl font-semibold", getLoadColor(hospital.load_percentage))}>
                      {hospital.load_percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">Current Load</p>
                  </div>
                </div>

                {hospital.specialization && hospital.specialization.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialization.map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
