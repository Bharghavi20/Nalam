"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

interface NewRequestDialogProps {
  onRequestCreated: () => void
}

export function NewRequestDialog({ onRequestCreated }: NewRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    patient_id: "",
    location: "",
    condition_type: "",
    severity: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.patient_id || !form.location || !form.condition_type || !form.severity) {
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // Create patient request
      await supabase.from("patient_requests").insert({
        patient_id: form.patient_id,
        location: form.location,
        condition_type: form.condition_type,
        severity: form.severity,
        status: "pending",
      })

      // Log activity
      await supabase.from("activity_log").insert({
        event_type: "patient_request",
        description: "New Patient Request",
        metadata: {
          patient_id: form.patient_id,
          severity: form.severity,
          location: form.location,
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
      })

      setForm({ patient_id: "", location: "", condition_type: "", severity: "" })
      setOpen(false)
      onRequestCreated()
    } catch (error) {
      console.error("Error creating request:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Patient Request</DialogTitle>
          <DialogDescription>
            Enter patient details to create a new allocation request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient_id">Patient ID</Label>
              <Input
                id="patient_id"
                placeholder="e.g., P128"
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., OMR, Tambaram"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="condition_type">Condition Type</Label>
              <Select
                value={form.condition_type}
                onValueChange={(value) => setForm({ ...form, condition_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiac">Cardiac</SelectItem>
                  <SelectItem value="Accident">Accident</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Neuro">Neuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={form.severity}
                onValueChange={(value) => setForm({ ...form, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : "Create Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
