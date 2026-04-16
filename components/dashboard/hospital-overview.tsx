"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HospitalCard } from "./hospital-card"
import type { Hospital } from "@/lib/types"

interface HospitalOverviewProps {
  hospitals: Hospital[]
}

export function HospitalOverview({ hospitals }: HospitalOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Hospital Overview (Live)</CardTitle>
        <Link
          href="/hospitals"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All Hospitals →
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {hospitals.map((hospital) => (
          <HospitalCard key={hospital.id} hospital={hospital} />
        ))}
      </CardContent>
    </Card>
  )
}
