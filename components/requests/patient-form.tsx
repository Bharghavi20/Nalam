"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { MapPin } from "lucide-react"
import type { Hospital } from "@/lib/types"
import { LiveIndicator } from "@/components/requests/live-indicator"
import { OfflineBanner } from "@/components/requests/offline-banner"

interface PatientFormProps {
  form: {
    location: string
    condition_type: string
    severity: string
  }
  emergencyMode: boolean
  loading: boolean
  error: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  onFormChange: (field: keyof PatientFormProps["form"], value: string) => void
  onToggleEmergency: (value: boolean) => void
  hospitals: Hospital[] | undefined
  isOffline: boolean
  cacheCount: number
  isValidating: boolean
  onRefresh: () => void
  statusMessage: string
}

const conditions = ["Accident", "Cardiac", "General", "Neuro"]
const severities = ["Low", "Medium", "Critical"]

export function PatientForm({
  form,
  emergencyMode,
  loading,
  error,
  onSubmit,
  onFormChange,
  onToggleEmergency,
  hospitals,
  isOffline,
  cacheCount,
  isValidating,
  onRefresh,
  statusMessage,
}: PatientFormProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">User Portal</p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Find the best hospital for your emergency.</h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="rounded-3xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              Live hospital availability from Supabase
            </div>
            <LiveIndicator online={!isOffline} />
          </div>
        </div>
        {isOffline ? <OfflineBanner /> : null}
        {isOffline && cacheCount > 0 ? (
          <div className="rounded-[1.75rem] border border-border bg-card p-4 text-sm text-foreground">
            Cached hospital set loaded ({cacheCount} hospitals). Data will refresh automatically when online.
          </div>
        ) : null}

        <form className="grid gap-6" onSubmit={onSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={form.location}
                onValueChange={(value) => onFormChange("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {(hospitals?.map((hospital) => hospital.location) ?? ["Guindy", "OMR", "Porur", "Adyar"]).filter(
                    (value, index, array) => array.indexOf(value) === index,
                  ).map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="condition-type">Condition type</Label>
              <Select
                value={form.condition_type}
                onValueChange={(value) => onFormChange("condition_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={form.severity} onValueChange={(value) => onFormChange("severity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severities.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Emergency mode</p>
                  <p className="text-xs text-muted-foreground">Prioritize ICU availability and proximity.</p>
                </div>
                <Switch checked={emergencyMode} onCheckedChange={onToggleEmergency} />
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? <Spinner className="h-4 w-4" /> : "Find Best Hospital"}
              </Button>
            </div>
          </div>

          {error ? (
            <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </form>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Live hospital data</p>
              <p className="mt-2 text-sm text-muted-foreground">{statusMessage}</p>
            </div>
            <Button variant="secondary" onClick={onRefresh}>
              Refresh now
            </Button>
          </div>

          <div className="mt-6 grid gap-4">
            {isValidating ? (
              <div className="rounded-3xl border border-border bg-background p-5 text-sm text-muted-foreground">
                Updating hospitals in real time...
              </div>
            ) : null}

            {(hospitals || []).slice(0, 6).map((hospital) => (
              <div key={hospital.id} className="rounded-3xl border border-border bg-background p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{hospital.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {hospital.location} · {hospital.distance.toFixed(1)} km
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {hospital.load_percentage}% load
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-card p-3 text-sm text-muted-foreground">
                    Beds: {hospital.available_beds}/{hospital.total_beds}
                  </div>
                  <div className="rounded-3xl bg-card p-3 text-sm text-muted-foreground">
                    ICU: {hospital.available_icu}/{hospital.icu_beds}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6">
          <div className="rounded-3xl bg-primary/10 p-5 text-sm text-primary">
            <p className="font-semibold">Live outputs</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your recommendation uses the latest hospital availability and load data from Supabase.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Active hospitals</p>
              <p className="mt-2 text-lg font-semibold">{(hospitals || []).length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Highest load</p>
              <p className="mt-2 text-lg font-semibold">
                {hospitals?.reduce((max, hospital) => (hospital.load_percentage > max ? hospital.load_percentage : max), 0) ?? 0}%
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
