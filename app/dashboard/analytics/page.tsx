"use client"

import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import type { Hospital, PatientRequest } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"
import { TrendingUp, TrendingDown, Users, Building2 } from "lucide-react"

async function fetchAnalyticsData(supabase: ReturnType<typeof createClient>) {
  const [hospitalsRes, requestsRes] = await Promise.all([
    supabase.from("hospitals").select("*"),
    supabase.from("patient_requests").select("*"),
  ])

  return {
    hospitals: (hospitalsRes.data || []) as Hospital[],
    requests: (requestsRes.data || []) as PatientRequest[],
  }
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [supabase] = useState(() => createClient())
  const { data, isLoading } = useSWR("analytics-data", () => fetchAnalyticsData(supabase), {
    refreshInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const { hospitals = [], requests = [] } = data || {}

  // Calculate metrics
  const avgLoad = hospitals.length > 0
    ? Math.round(hospitals.reduce((sum, h) => sum + h.load_percentage, 0) / hospitals.length)
    : 0

  const totalAllocations = requests.filter((r) => r.status === "allocated").length
  const allocationRate = requests.length > 0
    ? Math.round((totalAllocations / requests.length) * 100)
    : 0

  // Hospital utilization data for bar chart
  const utilizationData = hospitals.map((h) => ({
    name: h.name.split(" ")[0],
    load: h.load_percentage,
  }))

  // Severity distribution for pie chart
  const severityCounts = requests.reduce(
    (acc, r) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const severityData = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Hospital performance and patient allocation insights
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="7d">7D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Load</p>
                <p className="mt-1 text-3xl font-semibold">{avgLoad}%</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-status-full">
                  <TrendingDown className="h-3 w-3" />
                  -5.2%
                </div>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Allocations</p>
                <p className="mt-1 text-3xl font-semibold">{totalAllocations}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-status-available">
                  <TrendingUp className="h-3 w-3" />
                  +12.8%
                </div>
              </div>
              <div className="rounded-lg bg-status-available/10 p-2.5">
                <Users className="h-5 w-5 text-status-available" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Allocation Rate</p>
                <p className="mt-1 text-3xl font-semibold">{allocationRate}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Success rate</p>
              </div>
              <div className="rounded-lg bg-status-high-load/10 p-2.5">
                <TrendingUp className="h-5 w-5 text-status-high-load" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="mt-1 text-3xl font-semibold">{requests.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">All time</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hospital Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${value}%`, "Load"]}
                  />
                  <Bar dataKey="load" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
