"use client"

import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { RequestCard } from "@/components/requests/request-card"
import { NewRequestDialog } from "@/components/requests/new-request-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PatientRequest } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

async function fetchRequests(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("patient_requests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as PatientRequest[]
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [supabase] = useState(() => createClient())
  const { data: requests, isLoading, mutate } = useSWR("patient-requests", () => fetchRequests(supabase), {
    refreshInterval: 10000,
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const filteredRequests = requests?.filter((r) => {
    if (activeTab === "all") return true
    return r.status === activeTab
  }) || []

  const counts = {
    all: requests?.length || 0,
    pending: requests?.filter((r) => r.status === "pending").length || 0,
    allocated: requests?.filter((r) => r.status === "allocated").length || 0,
    closed: requests?.filter((r) => r.status === "closed").length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Patient Requests</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track patient allocation requests
          </p>
        </div>
        <NewRequestDialog onRequestCreated={() => mutate()} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All <span className="ml-1.5 text-xs text-muted-foreground">({counts.all})</span>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending <span className="ml-1.5 text-xs text-muted-foreground">({counts.pending})</span>
              </TabsTrigger>
              <TabsTrigger value="allocated">
                Allocated <span className="ml-1.5 text-xs text-muted-foreground">({counts.allocated})</span>
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed <span className="ml-1.5 text-xs text-muted-foreground">({counts.closed})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No requests found
            </div>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
