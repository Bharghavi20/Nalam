"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Plus, Smartphone, Trash2 } from "lucide-react"
import type { Hospital } from "@/lib/types"
import { cn } from "@/lib/utils"

function stripAnsiCodes(value: string) {
  return value.replace(/\x1b\[[0-9;]*m/g, "").trim()
}

const SOS_API_URL = process.env.NEXT_PUBLIC_SOS_API_URL ?? "http://localhost:8000"

interface Contact {
  id: string
  name: string
  phone: string
}

interface EmergencySOSProps {
  hospitals: Hospital[] | undefined
  selectedHospital: Hospital | null
  online: boolean
}

const CONTACTS_KEY = "nalam-emergency-contacts"

function getStoredContacts() {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(CONTACTS_KEY)
    return raw ? (JSON.parse(raw) as Contact[]) : []
  } catch {
    return []
  }
}

export function EmergencySOS({ hospitals, selectedHospital, online }: EmergencySOSProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [messageSent, setMessageSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const statusText = sending
    ? "Sending emergency alert..."
    : sendError
      ? "Backend failed, fallback SMS prepared."
      : messageSent
        ? "Confirmation sent."
        : "Tap send to launch your SMS app."

  useEffect(() => {
    setContacts(getStoredContacts())
  }, [])

  const contact = useMemo(
    () => contacts.find((item) => item.id === selectedContactId) ?? contacts[0],
    [contacts, selectedContactId],
  )

  const hospital = selectedHospital ?? hospitals?.[0] ?? null

  function saveContacts(next: Contact[]) {
    setContacts(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(next))
    }
  }

  function addContact() {
    if (!name.trim() || !phone.trim()) {
      toast({ title: "Contact incomplete", description: "Add both a name and phone number." })
      return
    }
    const next = [
      { id: crypto.randomUUID(), name: name.trim(), phone: phone.trim() },
      ...contacts,
    ]
    saveContacts(next)
    setName("")
    setPhone("")
    setSelectedContactId(next[0].id)
    toast({ title: "Contact saved", description: "Emergency contact was added." })
  }

  function removeContact(contactId: string) {
    const next = contacts.filter((item) => item.id !== contactId)
    saveContacts(next)
    if (selectedContactId === contactId) {
      setSelectedContactId(next[0]?.id ?? null)
    }
    toast({ title: "Contact removed", description: "Emergency contact deleted." })
  }

  async function sendSOS() {
    if (!hospital) {
      toast({ title: "No hospital selected", description: "Please select a hospital recommendation first." })
      return
    }

    if (!navigator.geolocation) {
      toast({ title: "Location unavailable", description: "Geolocation is not supported in this browser." })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`
        const destination = `${hospital.name} (${hospital.location})`
        const phoneTarget = contact ? contact.phone : ""
        const smsBody = `🚨 Emergency! I am at ${coords}. Heading to ${destination}. Please help.`
        const smsUrl = phoneTarget ? `sms:${phoneTarget}?body=${encodeURIComponent(smsBody)}` : `sms:?body=${encodeURIComponent(smsBody)}`

        let backendError: string | null = null

        if (online) {
          try {
            setSending(true)
            setSendError(null)

            const response = await fetch(`${SOS_API_URL}/sos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contact_name: contact?.name ?? "Emergency contact",
                contact_phone: phoneTarget,
                hospital_name: hospital.name,
                hospital_location: hospital.location,
                user_location: `${hospital.location}`,
                user_coordinates: coords,
              }),
            })

            if (response.ok) {
              setMessageSent(true)
              toast({
                title: "SOS backend triggered",
                description: `Emergency alert sent to ${contact ? contact.name : "your contact"}.`,
              })
              return
            }

            const errorData = await response.json().catch(() => null)
            backendError = errorData?.detail ?? "Unable to send SOS via backend."
            setSendError(backendError)
          } catch (error) {
            backendError = stripAnsiCodes((error as Error)?.message ?? "Failed to contact SOS backend.")
            setSendError(backendError)
          } finally {
            setSending(false)
          }
        }

        if (!online || backendError) {
          window.open(smsUrl, "_blank")
          setMessageSent(true)
          toast({
            title: "SOS fallback sent",
            description: `Emergency alert prepared for ${contact ? contact.name : "your default contact"}.`,
          })
        }
      },
      () => {
        toast({ title: "Location denied", description: "Allow location access to send an SOS message." })
      },
      { timeout: 10000 },
    )
  }

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="fixed bottom-6 right-6 z-50 inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-white shadow-[0_16px_40px_rgba(239,68,68,0.22)] transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-destructive/25"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-30" />
            <span className="relative text-lg font-black">SOS</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Emergency SOS</DialogTitle>
            <DialogDescription>
              Send an emergency alert to your selected contact with location and hospital details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5">
            <div className="rounded-3xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Emergency destination</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {hospital ? `${hospital.name} · ${hospital.location}` : "No hospital selected"}
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-background p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Emergency contacts</p>
                  <p className="mt-1 text-sm text-foreground">
                    {contact ? `Selected contact: ${contact.name}` : "Select or add a contact."}
                  </p>
                </div>
                <span className={cn(
                  "inline-flex h-3.5 w-3.5 rounded-full",
                  online ? "bg-emerald-500" : "bg-slate-400",
                )}
                />
              </div>

              <div className="mt-4 grid gap-3">
                {contacts.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedContactId(item.id)}
                    className={cn(
                      "flex items-center justify-between rounded-3xl border px-4 py-3 text-left transition hover:border-primary/50",
                      selectedContactId === item.id ? "border-primary bg-primary/5" : "border-border bg-background",
                    )}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.phone}</p>
                    </div>
                    <Trash2
                      className="h-4 w-4 text-destructive"
                      onClick={(event) => {
                        event.stopPropagation()
                        removeContact(item.id)
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    value={name}
                    placeholder="Ambulance contact"
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={phone}
                    placeholder="+91 98765 43210"
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </div>
              <Button type="button" className="mt-4 w-full" onClick={addContact}>
                <Plus className="mr-2 h-4 w-4" /> Add contact
              </Button>
            </div>

            <div className="rounded-3xl border border-border bg-background p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Ready to send</p>
                  <p className="mt-1 text-foreground">{statusText}</p>
                  {sendError ? <p className="mt-1 text-sm text-destructive">{sendError}</p> : null}
                </div>
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button type="button" className="mt-4 w-full" onClick={sendSOS} disabled={sending}>
                {sending ? "Sending..." : "Send SOS message"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => {}}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
