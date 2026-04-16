"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { HospitalOverview } from "@/components/dashboard/hospital-overview"
import { LoadChart } from "@/components/dashboard/load-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ActionBar } from "@/components/dashboard/action-bar"
import type { Hospital, PatientRequest, ActivityLog } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

async function fetchDashboardData(supabase: ReturnType<typeof createClient>) {
  const [hospitalsRes, requestsRes, activitiesRes] = await Promise.all([
    supabase.from("hospitals").select("*").order("load_percentage", { ascending: true }),
    supabase.from("patient_requests").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  return {
    hospitals: (hospitalsRes.data || []) as Hospital[],
    requests: (requestsRes.data || []) as PatientRequest[],
    activities: (activitiesRes.data || []) as ActivityLog[],
  }
}

export default function DashboardPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [supabase] = useState(() => createClient())

  const { data, isLoading, mutate } = useSWR(
    "dashboard-data",
    () => fetchDashboardData(supabase),
    {
      refreshInterval: autoRefresh ? 10000 : 0,
      revalidateOnFocus: true,
    }
  )

  // Set up real-time subscriptions
  useEffect(() => {
    const hospitalsChannel = supabase
      .channel("hospitals-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hospitals" },
        () => {
          mutate()
        }
      )
      .subscribe()

    const requestsChannel = supabase
      .channel("requests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patient_requests" },
        () => {
          mutate()
        }
      )
      .subscribe()

    const activityChannel = supabase
      .channel("activity-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_log" },
        () => {
          mutate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(hospitalsChannel)
      supabase.removeChannel(requestsChannel)
      supabase.removeChannel(activityChannel)
    }
  }, [mutate])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const { hospitals = [], requests = [], activities = [] } = data || {}

  return (
    <div className="space-y-6">
      <ActionBar autoRefresh={autoRefresh} onToggleAutoRefresh={setAutoRefresh} />
      
      <StatsCards hospitals={hospitals} requests={requests} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <HospitalOverview hospitals={hospitals} />
        <div className="space-y-6">
          <LoadChart hospitals={hospitals} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}
