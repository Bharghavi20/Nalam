import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Hospital } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scoreHospital(hospital: Hospital, emergencyMode: boolean, severity: string = "Medium") {
  if (hospital.available_beds <= 0) return -999
  if (severity === "Critical" && hospital.available_icu <= 0) return -999

  const baseScore =
    hospital.available_beds * 0.4 +
    hospital.available_icu * 0.3 -
    hospital.distance * 0.2 -
    hospital.load_percentage * 0.1

  const emergencyBonus = emergencyMode
    ? hospital.available_icu * 0.15 + Math.max(0, 12 - hospital.distance) * 0.2
    : 0

  const severityBonus = severity === "Critical" ? 15 : severity === "Medium" ? 8 : 0

  return Number((baseScore + emergencyBonus + severityBonus).toFixed(2))
}

export function buildRecommendationExplanation(hospital: Hospital, emergencyMode: boolean) {
  const details = []

  details.push(`It has ${hospital.available_icu} available ICU bed${hospital.available_icu === 1 ? "" : "s"}`)
  details.push(`and ${hospital.available_beds} available general bed${hospital.available_beds === 1 ? "" : "s"}`)
  details.push(`with a current load of ${hospital.load_percentage}%`)
  details.push(`at ${hospital.distance.toFixed(1)} km away`)

  const mode = emergencyMode
    ? "Emergency mode prioritizes ICU capacity and proximity for critical routes."
    : "Normal mode balances bed availability, ICU capacity, distance, and load."

  return `Recommended because ${details.join(", ")} and this hospital has the strongest combined score. ${mode}`
}

export function getTravelEta(distance: number) {
  return `${Math.max(2, Math.round(distance * 2))} mins`
}

export function getAmbulanceEta(distance: number) {
  return `🚑 Ambulance arriving in ${Math.max(3, Math.round(distance * 2))} mins`
}
