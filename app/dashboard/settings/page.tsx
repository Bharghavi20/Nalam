"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Database, RefreshCw, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Database Connection
            </CardTitle>
            <CardDescription>
              Supabase real-time database connection status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-available opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-status-available" />
                </div>
                <span className="text-sm font-medium">Connected to Supabase</span>
              </div>
              <Badge variant="outline" className="bg-status-available/10 text-status-available border-status-available/20">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4" />
              Real-time Updates
            </CardTitle>
            <CardDescription>
              Configure automatic data refresh settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh data every 10 seconds
                </p>
              </div>
              <Switch id="auto-refresh" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="live-charts">Live Charts</Label>
                <p className="text-sm text-muted-foreground">
                  Update charts in real-time with incoming data
                </p>
              </div>
              <Switch id="live-charts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure alert and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="critical-alerts">Critical Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when hospitals reach critical load
                </p>
              </div>
              <Switch id="critical-alerts" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-requests">New Patient Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified for new patient allocation requests
                </p>
              </div>
              <Switch id="new-requests" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Security
            </CardTitle>
            <CardDescription>
              Application security and access settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                This is a demo application. In production, authentication and role-based access control would be implemented here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
