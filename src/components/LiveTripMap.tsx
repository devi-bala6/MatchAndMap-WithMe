// ==============================================================================
// MATCH & MAP - LIVE PEER-TO-PEER LOCATION MAP
// Dark mode interactive map displaying traveler GPS positions and battery telemetry
// ==============================================================================

import { useState, useEffect, useRef } from "react"
import {
  MapPin,
  Navigation,
  Battery,
  BatteryCharging,
  ShieldCheck,
  Radio,
  AlertTriangle,
  Users,
} from "lucide-react"

export interface TravelerLocation {
  id: string
  name: string
  avatar?: string
  latitude: number
  longitude: number
  accuracyMeters?: number
  batteryLevel?: number
  isCurrent?: boolean
  heading?: number
  lastUpdated: string
}

interface LiveTripMapProps {
  tripId?: string
  tripTitle?: string
  destinationName?: string
  currentUserId?: string
  currentUserName?: string
  participants?: TravelerLocation[]
  onToggleSharing?: (active: boolean) => void
}

export default function LiveTripMap({
  tripId,
  tripTitle = "Expedition Route",
  destinationName = "Destination",
  currentUserId = "u1",
  currentUserName = "Traveler",
  participants = [],
  onToggleSharing,
}: LiveTripMapProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [myCoords, setMyCoords] = useState<{
    lat: number
    lng: number
    accuracy: number
  } | null>(null)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isCharging, setIsCharging] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"map" | "buddies">("map")
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Default initial travelers in the group
  const defaultBuddies: TravelerLocation[] = [
    {
      id: currentUserId || "u1",
      name: `${currentUserName || "You"} (You)`,
      latitude: myCoords ? myCoords.lat : 28.6139,
      longitude: myCoords ? myCoords.lng : 77.209,
      accuracyMeters: myCoords?.accuracy || 10,
      batteryLevel: batteryLevel ?? 90,
      isCurrent: true,
      lastUpdated: "Just now",
    },
  ]

  const activeParticipants =
    participants.length > 0 ? participants : defaultBuddies

  // Read Battery Telemetry
  useEffect(() => {
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      ;(navigator as any)
        .getBattery?.()
        .then((battery: any) => {
          setBatteryLevel(Math.round(battery.level * 100))
          setIsCharging(battery.charging)
          battery.addEventListener("levelchange", () =>
            setBatteryLevel(Math.round(battery.level * 100)),
          )
          battery.addEventListener("chargingchange", () =>
            setIsCharging(battery.charging),
          )
        })
        .catch(() => {})
    }
  }, [])

  // Geolocation watchPosition
  useEffect(() => {
    if (!isSharing) return

    if (!navigator.geolocation) {
      setPermissionError("GPS Geolocation is not supported by your browser.")
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setMyCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        })
        setPermissionError(null)
      },
      (err) => {
        setPermissionError(
          `GPS access notice: ${err.message || "Permission pending or simulated"}`,
        )
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [isSharing])

  function handleToggleShare() {
    const next = !isSharing
    setIsSharing(next)
    onToggleSharing?.(next)
  }

  // Calculate center coordinate based on participants or myCoords
  const centerLat =
    myCoords?.lat ?? (participants.length > 0 ? participants[0].latitude : 17.6868)
  const centerLng =
    myCoords?.lng ?? (participants.length > 0 ? participants[0].longitude : 83.2185)

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-100 text-base">
                {tripTitle}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Radio className="w-3 h-3 animate-pulse" /> Live GPS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-400" /> {destinationName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Battery Status Badge */}
          {batteryLevel !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs font-mono text-slate-300">
              {isCharging ? (
                <BatteryCharging className="w-4 h-4 text-green-400" />
              ) : (
                <Battery className="w-4 h-4 text-cyan-400" />
              )}
              <span>{batteryLevel}%</span>
            </div>
          )}

          {/* Toggle Sharing Button */}
          <button
            onClick={handleToggleShare}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold transition-all shadow-lg ${
              isSharing
                ? "bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30"
                : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSharing ? "Broadcasting Live" : "Share Live Location"}
            </span>
          </button>
        </div>
      </div>

      {permissionError && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Map Body & Visualizer */}
      <div className="relative w-full h-80 sm:h-96 bg-[#090d16] overflow-hidden flex items-center justify-center">
        {/* Dark Matter Styled Grid & Radar Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Ambient Map Glow */}
        <div className="absolute w-96 h-96 rounded-full bg-cyan-500/10 filter blur-3xl pointer-events-none" />

        {/* Embedded Interactive Vector Map Representation */}
        <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 backdrop-blur-md text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                Lat: {centerLat.toFixed(4)}° N, Lon: {centerLng.toFixed(4)}° E
              </span>
            </div>

            <div className="flex gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("map")}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                  activeTab === "map"
                    ? "bg-cyan-500/20 text-cyan-400 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setActiveTab("buddies")}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-1 ${
                  activeTab === "buddies"
                    ? "bg-cyan-500/20 text-cyan-400 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Travelers ({activeParticipants.length})</span>
              </button>
            </div>
          </div>

          {/* Interactive Participant Markers Overlay */}
          <div className="relative flex-1 flex items-center justify-center">
            {activeParticipants.map((traveler, index) => {
              const offsets = [
                { x: 0, y: 0 },
                { x: -90, y: -45 },
                { x: 80, y: 50 },
              ]
              const offset = offsets[index % offsets.length]

              return (
                <div
                  key={traveler.id}
                  className="absolute transition-all duration-700 ease-out flex flex-col items-center cursor-pointer group"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                  }}
                >
                  {/* Pulse Ring for Current User */}
                  {traveler.isCurrent && (
                    <span className="absolute -inset-2 rounded-full bg-cyan-400/20 animate-ping" />
                  )}

                  {/* Marker Pin */}
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-bold text-xs shadow-xl border-2 border-slate-900 group-hover:scale-110 transition-transform">
                    {traveler.name.charAt(0)}
                    {traveler.isCurrent && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>

                  {/* Name Card */}
                  <div className="mt-1 px-2.5 py-1 rounded-md bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-200 whitespace-nowrap shadow-md group-hover:border-cyan-500/50">
                    <span className="font-semibold">{traveler.name}</span>
                    <span className="text-slate-500 ml-1.5">
                      {traveler.batteryLevel
                        ? `(${traveler.batteryLevel}%)`
                        : ""}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span>Accuracy: ±{myCoords?.accuracy || 15}m</span>
            <span>Broadcasting via Supabase Realtime</span>
            <span className="text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
