export interface Hospital {
  id: string
  name: string
  location: string
  distance: number
  total_beds: number
  available_beds: number
  icu_beds: number
  available_icu: number
  load_percentage: number
  specialization: string[]
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
}

export interface PatientRequest {
  id: string
  patient_id: string
  location: string
  condition_type: 'Cardiac' | 'Accident' | 'General' | 'Neuro'
  severity: 'Low' | 'Medium' | 'Critical'
  status: 'pending' | 'allocated' | 'closed'
  allocated_hospital_id: string | null
  created_at: string
  updated_at: string
  hospital?: Hospital
}

export interface ActivityLog {
  id: string
  event_type: string
  description: string
  metadata: {
    patient_id?: string
    hospital?: string
    severity?: string
    location?: string
    time?: string
    beds_change?: string
  }
  created_at: string
}

export type HospitalStatus = 'AVAILABLE' | 'HIGH LOAD' | 'FULL'

export function getHospitalStatus(loadPercentage: number): HospitalStatus {
  if (loadPercentage >= 100) return 'FULL'
  if (loadPercentage >= 80) return 'HIGH LOAD'
  return 'AVAILABLE'
}

export function getStatusColor(status: HospitalStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'text-status-available'
    case 'HIGH LOAD':
      return 'text-status-high-load'
    case 'FULL':
      return 'text-status-full'
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Critical':
      return 'text-status-full'
    case 'Medium':
      return 'text-status-high-load'
    case 'Low':
      return 'text-status-available'
    default:
      return 'text-muted-foreground'
  }
}

export function getRequestStatusColor(status: string): string {
  switch (status) {
    case 'allocated':
      return 'bg-status-allocated text-white'
    case 'pending':
      return 'bg-status-pending text-white'
    case 'closed':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}
