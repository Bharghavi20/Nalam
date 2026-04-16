"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import type { Hospital } from "@/lib/types"

interface LoadChartProps {
  hospitals: Hospital[]
}

// Generate mock time-series data based on current hospital loads
function generateChartData(hospitals: Hospital[]) {
  const times = ["10:00", "10:15", "10:30", "10:45", "11:00"]
  
  return times.map((time, index) => {
    const dataPoint: Record<string, string | number> = { time }
    
    hospitals.forEach((hospital) => {
      // Create some variance around the current load percentage
      const variance = Math.sin(index * 0.5) * 15 + Math.random() * 10
      const value = Math.max(0, Math.min(100, hospital.load_percentage + variance - 10))
      dataPoint[hospital.name.split(" ")[0]] = Math.round(value)
    })
    
    return dataPoint
  })
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
]

export function LoadChart({ hospitals }: LoadChartProps) {
  const data = generateChartData(hospitals)
  const hospitalNames = hospitals.map((h) => h.name.split(" ")[0])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Live Load Distribution</CardTitle>
        <Select defaultValue="1h">
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last 1 Hour</SelectItem>
            <SelectItem value="6h">Last 6 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4">
          {hospitalNames.map((name, index) => (
            <div key={name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
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
              />
              {hospitalNames.map((name, index) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
