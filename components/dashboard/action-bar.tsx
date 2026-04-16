"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { FlaskConical } from "lucide-react"
import Link from "next/link"

interface ActionBarProps {
  autoRefresh: boolean
  onToggleAutoRefresh: (value: boolean) => void
}

export function ActionBar({ autoRefresh, onToggleAutoRefresh }: ActionBarProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Hospital Load Balancer</h1>
        <p className="text-sm text-muted-foreground">
          Real-time monitoring & intelligent patient allocation across hospitals
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/simulation">
          <Button variant="outline" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Simulate Emergency Surge
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Switch
            id="auto-refresh"
            checked={autoRefresh}
            onCheckedChange={onToggleAutoRefresh}
          />
          <Label htmlFor="auto-refresh" className="text-sm">
            Auto Refresh: <span className={autoRefresh ? "text-status-available" : "text-muted-foreground"}>
              {autoRefresh ? "On" : "Off"}
            </span>
          </Label>
        </div>
      </div>
    </div>
  )
}
