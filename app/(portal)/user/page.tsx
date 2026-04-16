"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { Activity } from "lucide-react"
import { PatientForm } from "@/components/requests/patient-form"
import { RecommendationCard } from "@/components/requests/recommendation-card"
import { EmergencySOS } from "@/components/requests/emergency-sos"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { toast } from "@/hooks/use-toast"
import type { Hospital } from "@/lib/types"
import { buildRecommendationExplanation, getAmbulanceEta, scoreHospital } from "@/lib/utils"

const RouteMapClient = ({ origin, destination }: { origin: { lat: number; lng: number } | null; destination: { lat: number; lng: number } | null }) => {
  const [RouteMap, setRouteMap] = useState<ComponentType<{ origin: { lat: number; lng: number } | null; destination: { lat: number; lng: number } | null }> | null>(null)

  useEffect(() => {
    import("@/components/requests/route-map").then((mod) => {
      setRouteMap(() => mod.RouteMap)
    })
  }, [])

  if (!RouteMap) {
    return (
      <div className="rounded-[2rem] border border-border bg-card p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Loading map...</p>
        <p className="mt-2">Please wait while the route preview initializes.</p>
      </div>
    )
  }

  return <RouteMap origin={origin} destination={destination} />
}

interface UserForm {
  location: string
  condition_type: string
  severity: string
}

interface RecommendationResult {
  hospital_id: string
  hospital_name: string
  distance: number
  available_beds: number
  available_icu: number
  load_percentage: number
  explanation: string
  score: number
  confidence: number
  eta: string
}

const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Sholinganallur": { lat: 12.9420, lng: 80.2280 },
  "OMR": { lat: 12.9110, lng: 80.2290 },
  "Porur": { lat: 13.0433, lng: 80.1648 },
  "Tambaram": { lat: 12.9231, lng: 80.1277 },
  "Manapakkam": { lat: 12.9946, lng: 80.2059 },
  "Adyar": { lat: 12.9941, lng: 80.2534 },
  "Vadapalani": { lat: 13.0442, lng: 80.2104 },
  "Guindy": { lat: 13.0100, lng: 80.2146 },
}

function getCachedHospitals() {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem("nalam-hospitals")
    return raw ? (JSON.parse(raw) as Hospital[]) : null
  } catch {
    return null
  }
}

function saveHospitalsCache(hospitals: Hospital[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem("nalam-hospitals", JSON.stringify(hospitals))
}

async function fetchHospitals(supabase: ReturnType<typeof createClient>, online: boolean) {
  if (!online) {
    const cache = getCachedHospitals()
    if (cache) return cache
    throw new Error("Offline and no cached hospital data available")
  }

  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .order("distance", { ascending: true })

  if (error) throw error
  saveHospitalsCache(data as Hospital[])
  return data as Hospital[]
}

function computeConfidence(best: { hospital: Hospital; score: number }, hospitals: Hospital[], emergencyMode: boolean, severity: string) {
  const scores = hospitals
    .map((hospital) => scoreHospital(hospital, emergencyMode, severity))
    .sort((a, b) => b - a)

  const gap = scores[0] - (scores[1] ?? scores[0])
  return Math.min(99, Math.max(70, Math.round(80 + gap * 3)))
}

function createRecommendationResult(hospital: Hospital, hospitals: Hospital[], emergencyMode: boolean, severity: string) {
  const score = scoreHospital(hospital, emergencyMode, severity)
  return {
    hospital_id: hospital.id,
    hospital_name: hospital.name,
    distance: hospital.distance,
    available_beds: hospital.available_beds,
    available_icu: hospital.available_icu,
    load_percentage: hospital.load_percentage,
    explanation: buildRecommendationExplanation(hospital, emergencyMode),
    score: Number(score.toFixed(2)),
    confidence: computeConfidence({ hospital, score }, hospitals, emergencyMode, severity),
    eta: getAmbulanceEta(hospital.distance),
  }
}

export default function UserPortalPage() {
  const [supabase] = useState(() => createClient())
  const [form, setForm] = useState<UserForm>({
    location: "",
    condition_type: "Accident",
    severity: "Critical",
  })
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Live hospital status updates are streaming below.")
  const [cacheCount, setCacheCount] = useState(0)
  const online = useOnlineStatus()
  const prevHospitalsRef = useRef<Hospital[] | null>(null)

  const { data: hospitals, isValidating, mutate } = useSWR(
    ["user-hospitals", online],
    () => fetchHospitals(supabase, online),
    {
      refreshInterval: 10000,
      onSuccess(data) {
        setCacheCount(data.length)
        if (online) saveHospitalsCache(data)
      },
    },
  )

  const selectedHospital = useMemo(() => {
    if (!result || !hospitals) return null
    return hospitals.find((hospital) => hospital.id === result.hospital_id) ?? null
  }, [result, hospitals])

  const originCoordinates = useMemo(() => {
    if (!form.location) return LOCATION_COORDINATES["Guindy"]
    return LOCATION_COORDINATES[form.location] ?? LOCATION_COORDINATES["Guindy"]
  }, [form.location])

  const destinationCoordinates = useMemo(() => {
    if (!selectedHospital) return null
    return LOCATION_COORDINATES[selectedHospital.location] ?? null
  }, [selectedHospital])

  useEffect(() => {
    const channel = supabase
      .channel("hospital-live-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hospitals" },
        () => {
          mutate()
          setStatusMessage("Updated hospital availability in real time.")
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, mutate])

  useEffect(() => {
    if (!hospitals || !prevHospitalsRef.current) {
      prevHospitalsRef.current = hospitals ?? null
      return
    }

    hospitals.forEach((hospital) => {
      const previous = prevHospitalsRef.current?.find((item) => item.id === hospital.id)
      if (!previous) return

      if (previous.load_percentage < 100 && hospital.load_percentage >= 100) {
        toast({
          title: "Hospital became full",
          description: `${hospital.name} is now full. Looking for the next best hospital.`,
        })
      }

      if (previous.available_icu === 0 && hospital.available_icu > 0) {
        toast({
          title: "ICU availability updated",
          description: `${hospital.name} now has ICU beds available.`,
        })
      }

      if (previous.load_percentage < 80 && hospital.load_percentage >= 80) {
        toast({
          title: "High load detected",
          description: `${hospital.name} moved into high load range.`,
        })
      }
    })

    prevHospitalsRef.current = hospitals
  }, [hospitals])

  const computeBestRecommendation = useCallback(
    (hospitalData: Hospital[]) => {
      const ranked = hospitalData.map((hospital) => ({
        hospital,
        score: scoreHospital(hospital, emergencyMode, form.severity),
      }))

      const best = ranked.reduce((top, current) => (current.score > top.score ? current : top), ranked[0])
      return { ranked, best }
    },
    [emergencyMode, form.severity],
  )

  useEffect(() => {
    if (!result || !hospitals) return

    const selected = hospitals.find((hospital) => hospital.id === result.hospital_id)
    if (!selected) return

    if (selected.load_percentage > 90 || selected.available_icu === 0) {
      const { best } = computeBestRecommendation(hospitals)
      if (best && best.hospital.id !== result.hospital_id) {
        setResult(createRecommendationResult(best.hospital, hospitals, emergencyMode, form.severity))
        setStatusMessage("Auto re-routed to a safer hospital based on live updates.")
        toast({
          title: "Auto re-routing activated",
          description: `Your recommendation moved to ${best.hospital.name} because the previous hospital is no longer optimal.`,
        })
      }
    }
  }, [result, hospitals, emergencyMode, computeBestRecommendation])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const hospitalData = await fetchHospitals(supabase, online)
      if (!hospitalData || hospitalData.length === 0) {
        throw new Error("No hospital data available.")
      }

      const { ranked, best } = computeBestRecommendation(hospitalData)
      setResult(createRecommendationResult(best.hospital, hospitalData, emergencyMode, form.severity))
      setStatusMessage("Recommendation created from the latest hospital data.")
    } catch (err) {
      setError("Unable to load hospital recommendations. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <PatientForm
        form={form}
        emergencyMode={emergencyMode}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onFormChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
        onToggleEmergency={setEmergencyMode}
        hospitals={hospitals}
        isOffline={!online}
        cacheCount={cacheCount}
        isValidating={isValidating}
        onRefresh={() => mutate()}
        statusMessage={statusMessage}
      />

      {result ? (
        <>
          <RecommendationCard
            result={result}
            request={form}
          />
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 gap-y-4 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Route preview</p>
                <h2 className="text-xl font-semibold text-foreground">Live mapping & ambulance ETA</h2>
                <p className="mt-2 text-sm text-muted-foreground">🚑 Ambulance arriving in {result.eta.toLowerCase()}</p>
              </div>
              <div className="rounded-3xl bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
                {result.eta}
              </div>
            </div>
            <RouteMapClient origin={originCoordinates} destination={destinationCoordinates} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">Origin</p>
                <p className="mt-2 text-base font-semibold text-foreground">{form.location || "Current location"}</p>
              </div>
              <div className="rounded-3xl border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {selectedHospital ? `${selectedHospital.name} · ${selectedHospital.location}` : "No hospital selected"}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <section className="rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <p>Submit the form to receive the best hospital recommendation for your request.</p>
          </div>
        </section>
      )}

      <EmergencySOS hospitals={hospitals} selectedHospital={selectedHospital} online={online} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Live hospital data</p>
              <p className="mt-2 text-sm text-muted-foreground">{statusMessage}</p>
            </div>
            <button className="rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground transition hover:bg-muted" onClick={() => mutate()}>
              Refresh now
            </button>
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
                    <p className="mt-1 text-xs text-muted-foreground">{hospital.location} · {hospital.distance.toFixed(1)} km</p>
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
