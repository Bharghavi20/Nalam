"use client"

import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Play, RefreshCw } from "lucide-react"
import type { Hospital } from "@/lib/types"
import { cn } from "@/lib/utils"

async function fetchHospitals(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase.from("hospitals").select("*").order("name")
  if (error) throw error
  return data as Hospital[]
}

interface SimulationLog {
  time: string
  message: string
  type: "info" | "warning" | "success"
}

export default function SimulationPage() {
  const [supabase] = useState(() => createClient())
  const { data: hospitals, mutate } = useSWR("sim-hospitals", () => fetchHospitals(supabase))
  const [patientCount, setPatientCount] = useState("50")
  const [scenario, setScenario] = useState("road-accident")
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<SimulationLog[]>([])

  async function runSimulation() {
    setIsRunning(true)
    setLogs([])

    const count = parseInt(patientCount) || 50

    // Simulate the emergency surge
    setLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        message: `Starting ${scenario.replace("-", " ")} simulation with ${count} patients...`,
        type: "info",
      },
    ])

    await new Promise((r) => setTimeout(r, 1000))

    // Simulate load increase
    if (hospitals) {
      for (const hospital of hospitals) {
        const loadIncrease = Math.floor(Math.random() * 20) + 5
        const newLoad = Math.min(100, hospital.load_percentage + loadIncrease)
        const bedsUsed = Math.floor(loadIncrease / 5)
        const newAvailable = Math.max(0, hospital.available_beds - bedsUsed)

        await supabase
          .from("hospitals")
          .update({
            load_percentage: newLoad,
            available_beds: newAvailable,
          })
          .eq("id", hospital.id)

        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
            message: `${hospital.name} load increased to ${newLoad}%`,
            type: newLoad >= 90 ? "warning" : "info",
          },
        ])

        await new Promise((r) => setTimeout(r, 500))
      }
    }

    // Re-route patients simulation
    setLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        message: `Re-routing ${Math.floor(count * 0.3)} patients to available hospitals`,
        type: "info",
      },
    ])

    await new Promise((r) => setTimeout(r, 1000))

    setLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        message: "System stabilized",
        type: "success",
      },
    ])

    await mutate()
    setIsRunning(false)
  }

  async function resetSimulation() {
    setIsRunning(true)
    setLogs([])

    // Reset hospitals to original state
    const originalData = [
      { name: "Apollo Hospitals", available_beds: 32, load_percentage: 64 },
      { name: "Kauvery Hospital", available_beds: 12, load_percentage: 86 },
      { name: "Sri Ramachandra", available_beds: 0, load_percentage: 100 },
      { name: "Government GH", available_beds: 45, load_percentage: 38 },
    ]

    for (const data of originalData) {
      await supabase
        .from("hospitals")
        .update({
          available_beds: data.available_beds,
          load_percentage: data.load_percentage,
        })
        .eq("name", data.name)
    }

    setLogs([
      {
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        message: "System reset to default state",
        type: "success",
      },
    ])

    await mutate()
    setIsRunning(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Simulation Mode</h1>
        <p className="text-sm text-muted-foreground">
          Test how the system adapts to sudden changes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Simulate Real-time Changes</CardTitle>
            <CardDescription>
              Test how the system adapts to sudden changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="patients">Number of Patients</Label>
                <Input
                  id="patients"
                  type="number"
                  value={patientCount}
                  onChange={(e) => setPatientCount(e.target.value)}
                  min="1"
                  max="200"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scenario">Scenario</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="road-accident">Road Accident Surge</SelectItem>
                    <SelectItem value="natural-disaster">Natural Disaster</SelectItem>
                    <SelectItem value="epidemic">Epidemic Outbreak</SelectItem>
                    <SelectItem value="festival-crowd">Festival Crowd Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2"
                onClick={runSimulation}
                disabled={isRunning}
              >
                {isRunning ? <Spinner className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                Start Simulation
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={resetSimulation}
                disabled={isRunning}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Simulation Logs */}
            {logs.length > 0 && (
              <div className="mt-4 space-y-2 rounded-lg border bg-muted/50 p-4">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 text-muted-foreground">{log.time}</span>
                    <span
                      className={cn(
                        log.type === "warning" && "text-status-high-load",
                        log.type === "success" && "text-status-available"
                      )}
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Hospital Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hospitals?.map((hospital) => {
                const status =
                  hospital.load_percentage >= 100
                    ? "FULL"
                    : hospital.load_percentage >= 80
                    ? "HIGH LOAD"
                    : "AVAILABLE"

                return (
                  <div
                    key={hospital.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{hospital.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {hospital.available_beds} beds available
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-lg font-semibold",
                          status === "AVAILABLE" && "text-status-available",
                          status === "HIGH LOAD" && "text-status-high-load",
                          status === "FULL" && "text-status-full"
                        )}
                      >
                        {hospital.load_percentage}%
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          status === "AVAILABLE" &&
                            "bg-status-available/10 text-status-available border-status-available/20",
                          status === "HIGH LOAD" &&
                            "bg-status-high-load/10 text-status-high-load border-status-high-load/20",
                          status === "FULL" &&
                            "bg-status-full/10 text-status-full border-status-full/20"
                        )}
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
