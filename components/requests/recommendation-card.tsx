import { HeartPulse, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecommendationCardProps {
  result: {
    hospital_name: string
    distance: number
    available_beds: number
    available_icu: number
    load_percentage: number
    explanation: string
    confidence: number
    eta: string
  }
  request: {
    location: string
    condition_type: string
    severity: string
  }
}

export function RecommendationCard({ result, request }: RecommendationCardProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-primary/10 p-4 text-primary">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recommended Hospital</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">{result.hospital_name}</h2>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-background p-5">
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="mt-2 text-xl font-semibold">{result.distance.toFixed(1)} km</p>
            </div>
            <div className="rounded-3xl border border-border bg-background p-5">
              <p className="text-sm text-muted-foreground">Load</p>
              <p className="mt-2 text-xl font-semibold">{result.load_percentage}%</p>
            </div>
            <div className="rounded-3xl border border-border bg-background p-5">
              <p className="text-sm text-muted-foreground">Confidence</p>
              <p className="mt-2 text-xl font-semibold">{result.confidence}%</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background p-5">
              <p className="text-sm text-muted-foreground">Ambulance ETA</p>
              <p className="mt-2 text-xl font-semibold">{result.eta}</p>
            </div>
            <div className="rounded-3xl border border-border bg-background p-5">
              <p className="text-sm text-muted-foreground">Explanation</p>
              <p className="mt-3 text-base leading-7 text-foreground">{result.explanation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patient request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-foreground">
            <div className="rounded-3xl bg-primary/10 p-3 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requested area</p>
              <h3 className="mt-1 text-lg font-semibold">{request.location || "Current area"}</h3>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Condition type</p>
            <p className="mt-2 text-base font-semibold text-foreground">{request.condition_type}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Severity</p>
            <p className="mt-2 text-base font-semibold text-foreground">{request.severity}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
