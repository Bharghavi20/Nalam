"use client"

import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Coordinates {
  lat: number
  lng: number
}

interface RouteMapProps {
  origin: Coordinates | null
  destination: Coordinates | null
}

const defaultCenter: Coordinates = { lat: 12.9716, lng: 80.2510 }
const mapContainerStyle = {
  width: "100%",
  height: "320px",
}

const routeOptions = {
  color: "#22c55e",
  weight: 5,
  opacity: 0.8,
}

const markerIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const ambulanceIcon = L.divIcon({
  html: "🚑",
  className: "ambulance-marker",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function AutoFitMap({ origin, destination }: RouteMapProps) {
  const map = useMap()

  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds([origin, destination])
      map.fitBounds(bounds, { padding: [40, 40] })
      return
    }

    map.setView(origin ?? defaultCenter, 12)
  }, [origin, destination, map])

  return null
}

export function RouteMap({ origin, destination }: RouteMapProps) {
  const path = useMemo(() => {
    return origin && destination ? [origin, destination] : []
  }, [origin, destination])

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (path.length < 2) {
      return
    }

    setProgress(0)
    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = current + 0.01
        return next >= 1 ? 0 : next
      })
    }, 300)

    return () => window.clearInterval(interval)
  }, [path])

  const ambulancePosition = useMemo(() => {
    if (path.length < 2) return null
    const [start, end] = path
    return {
      lat: start.lat + (end.lat - start.lat) * progress,
      lng: start.lng + (end.lng - start.lng) * progress,
    }
  }, [path, progress])

  if (!origin || !destination) {
    return (
      <div className="rounded-[2rem] border border-border bg-card p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Route preview unavailable</p>
        <p className="mt-2">Complete your request and select a hospital to view the live route.</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={origin}
      zoom={12}
      scrollWheelZoom={false}
      style={mapContainerStyle}
      className="rounded-[2rem] overflow-hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AutoFitMap origin={origin} destination={destination} />
      <Marker position={origin} icon={markerIcon}>
        <Popup>Your location</Popup>
      </Marker>
      <Marker position={destination} icon={markerIcon}>
        <Popup>Hospital destination</Popup>
      </Marker>
      {ambulancePosition ? (
        <Marker position={ambulancePosition} icon={ambulanceIcon}>
          <Popup>Ambulance en route</Popup>
        </Marker>
      ) : null}
      {path.length === 2 ? <Polyline positions={path} pathOptions={routeOptions} /> : null}
    </MapContainer>
  )
}
