"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Hospital } from "@/lib/types"
import { getHospitalStatus, getStatusColor } from "@/lib/types"
import { cn } from "@/lib/utils"

async function fetchHospitals(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")

  if (error) throw error
  return data as Hospital[]
}

function formatStatusBadge(load: number) {
  if (load >= 100) return "Full"
  if (load >= 80) return "High Load"
  return "Available"
}

export default function AdminPortalPage() {
  const [supabase] = useState(() => createClient())
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [edits, setEdits] = useState<Record<string, { available_beds: number; available_icu: number; load_percentage: number }>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [lastRefresh, setLastRefresh] = useState(() => new Date().toLocaleTimeString())

  const { data: hospitals, isLoading, mutate } = useSWR("admin-hospitals", () => fetchHospitals(supabase), {
    refreshInterval: 10000,
    onSuccess: () => setLastRefresh(new Date().toLocaleTimeString()),
  })

  useEffect(() => {
    const channel = supabase
      .channel("hospital-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hospitals" },
        () => {
          mutate()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, mutate])

  const sortedHospitals = useMemo(() => {
    if (!hospitals) return []
    const list = [...hospitals]

    if (emergencyMode) {
      return list.sort((a, b) => {
        const icuDelta = b.available_icu - a.available_icu
        if (icuDelta !== 0) return icuDelta
        return a.distance - b.distance
      })
    }

    return list.sort((a, b) => a.load_percentage - b.load_percentage)
  }, [hospitals, emergencyMode])

  const chartData = useMemo(() => {
    return sortedHospitals.map((hospital) => ({
      name: hospital.name.split(" ")[0],
      load: hospital.load_percentage,
      beds: hospital.available_beds,
    }))
  }, [sortedHospitals])

  function getEditValue(hospital: Hospital) {
    return edits[hospital.id] ?? {
      available_beds: hospital.available_beds,
      available_icu: hospital.available_icu,
      load_percentage: hospital.load_percentage,
    }
  }

  async function handleSave(hospital: Hospital) {
    const edit = edits[hospital.id]
    if (!edit) return
    setSavingId(hospital.id)
    setError("")

    const { error: updateError } = await supabase
      .from("hospitals")
      .update({
        available_beds: edit.available_beds,
        available_icu: edit.available_icu,
        load_percentage: edit.load_percentage,
      })
      .eq("id", hospital.id)

    setSavingId(null)
    if (updateError) {
      setError("Unable to save hospital updates. Try again.")
      return
    }

    await mutate()
  }

  async function handleSimulate() {
    if (!hospitals) return
    setSavingId("simulation")
    setError("")

    const updates = hospitals.map((hospital) => {
      const icuChange = emergencyMode ? Math.floor(Math.random() * 5) - 1 : Math.floor(Math.random() * 3)
      const loadChange = emergencyMode ? Math.floor(Math.random() * 16) - 8 : Math.floor(Math.random() * 21) - 10
      return {
        id: hospital.id,
        available_beds: Math.max(0, hospital.available_beds - Math.floor(Math.random() * 6)),
        available_icu: Math.max(0, hospital.available_icu - icuChange),
        load_percentage: Math.min(100, Math.max(0, hospital.load_percentage + loadChange)),
      }
    })

    await Promise.all(
      updates.map((update) =>
        supabase
          .from("hospitals")
          .update({
            available_beds: update.available_beds,
            available_icu: update.available_icu,
            load_percentage: update.load_percentage,
          })
          .eq("id", update.id),
      ),
    )

    setSavingId(null)
    await mutate()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Admin Portal</p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Hospital Operations & Capacity Control</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Manage bed availability, ICU capacity, and load metrics in real time.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 rounded-3xl border border-border bg-background px-4 py-3">
              <span className={cn(
                "inline-flex h-2.5 w-2.5 rounded-full",
                emergencyMode ? "bg-status-full" : "bg-status-available",
              )} />
              <span className="text-sm font-medium">{emergencyMode ? "Emergency mode active" : "Normal operations"}</span>
            </div>
            <Button variant="secondary" onClick={() => setEmergencyMode((value) => !value)}>
              {emergencyMode ? "Disable Emergency Mode" : "Enable Emergency Mode"}
            </Button>
            <Button variant="ghost" onClick={handleSimulate} disabled={savingId === "simulation"}>
              {savingId === "simulation" ? "Simulating…" : "Run Simulation"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-3xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.64fr_0.36fr]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Load Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip />
                    <Bar dataKey="load" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {sortedHospitals.map((hospital) => {
            const savedValues = getEditValue(hospital)
            return (
              <Card key={hospital.id} className="border-border">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>{hospital.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{hospital.location} · {hospital.distance.toFixed(1)} km</p>
                    </div>
                    <div className={cn(
                      "rounded-2xl border border-border px-3 py-2 text-sm font-semibold",
                      getStatusColor(getHospitalStatus(savedValues.load_percentage)),
                    )}>
                      {formatStatusBadge(savedValues.load_percentage)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`beds-${hospital.id}`}>Available beds</Label>
                    <Input
                      id={`beds-${hospital.id}`}
                      type="number"
                      value={savedValues.available_beds}
                      min={0}
                      onChange={(event) =>
                        setEdits((prev) => ({
                          ...prev,
                          [hospital.id]: { ...savedValues, available_beds: Number(event.target.value) },
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`icu-${hospital.id}`}>Available ICU</Label>
                    <Input
                      id={`icu-${hospital.id}`}
                      type="number"
                      value={savedValues.available_icu}
                      min={0}
                      onChange={(event) =>
                        setEdits((prev) => ({
                          ...prev,
                          [hospital.id]: { ...savedValues, available_icu: Number(event.target.value) },
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`load-${hospital.id}`}>Load %</Label>
                    <Input
                      id={`load-${hospital.id}`}
                      type="number"
                      value={savedValues.load_percentage}
                      min={0}
                      max={100}
                      onChange={(event) =>
                        setEdits((prev) => ({
                          ...prev,
                          [hospital.id]: { ...savedValues, load_percentage: Number(event.target.value) },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      className="w-full"
                      onClick={() => handleSave(hospital)}
                      disabled={savingId === hospital.id}
                    >
                      {savingId === hospital.id ? <Spinner className="h-4 w-4" /> : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border bg-background p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Hospital count</span>
                  <span>{hospitals?.length ?? 0}</span>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-background p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Emergency status</span>
                  <Switch checked={emergencyMode} onCheckedChange={setEmergencyMode} />
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
                <p>Priority mode</p>
                <p className="mt-2 text-foreground">
                  {emergencyMode
                    ? "Emergency mode is active: ICU and proximity are prioritized."
                    : "Normal mode is active: hospitals are sorted by lowest load."}
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
                <p>Last refresh</p>
                <p className="mt-2 text-foreground">{lastRefresh}</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
