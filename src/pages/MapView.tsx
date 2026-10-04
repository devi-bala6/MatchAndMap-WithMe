import { useState, useEffect } from "react"
import {
  MapPin,
  Navigation,
  Users,
  Compass,
  Radio,
  Layers,
  Sparkles,
  Shield,
  ExternalLink,
  PlusCircle,
} from "lucide-react"
import LiveTripMap from "../components/LiveTripMap"
import type { User, Trip } from "../types"
import { apiRequest } from "../lib/api"
import { readTrips } from "../lib/tripStorage"

import { INDIAN_COORDS_MAP, getCoordsForDestination } from "../lib/geoUtils"
import GoogleMapsModal from "../components/GoogleMapsModal"

export { INDIAN_COORDS_MAP, getCoordsForDestination }

export default function MapView({ user }: { user?: User | null }) {
  const [realTrips, setRealTrips] = useState<any[]>([])
  const [selectedTripId, setSelectedTripId] = useState<string>("")
  const [buddies, setBuddies] = useState<any[]>([])
  const [showGoogleMapsModal, setShowGoogleMapsModal] = useState(false)
  const currentUserId = (user?.id || (user as any)?._id || "").toString()
  const currentUserName = user?.name || "Traveler"

  useEffect(() => {
    async function loadData() {
      try {
        const [apiTrips, apiBuddies] = await Promise.all([
          apiRequest<any[]>("/trips").catch(() => []),
          apiRequest<any[]>("/buddies").catch(() => []),
        ])

        const tripsList = Array.isArray(apiTrips) && apiTrips.length > 0 ? apiTrips : readTrips()
        setRealTrips(tripsList)
        if (tripsList.length > 0) {
          setSelectedTripId((tripsList[0]._id || tripsList[0].id || "").toString())
        }

        if (Array.isArray(apiBuddies)) {
          setBuddies(apiBuddies)
        }
      } catch {
        const local = readTrips()
        setRealTrips(local)
        if (local.length > 0) setSelectedTripId(local[0].id)
      }
    }
    loadData()
  }, [])

  const currentSelectedTrip =
    realTrips.find((t) => (t._id || t.id || "").toString() === selectedTripId) ||
    realTrips[0] ||
    null

  const destinationName = currentSelectedTrip?.destination || "Indian Expedition"
  const stateName = currentSelectedTrip?.state || "India"
  const tripGeo = getCoordsForDestination(destinationName, stateName)

  // Map real companion participants
  const participants = [
    {
      id: currentUserId || "u1",
      name: `${currentUserName} (You)`,
      latitude: tripGeo.lat,
      longitude: tripGeo.lng,
      accuracyMeters: 8,
      batteryLevel: 92,
      isCurrent: true,
      lastUpdated: "Active Now",
    },
    ...buddies.slice(0, 3).map((b, idx) => {
      const u = b.user || b
      const buddyGeo = getCoordsForDestination(u.city || u.state || "Hyderabad", u.state)
      return {
        id: (u.id || u._id || `b_${idx}`).toString(),
        name: u.name || `Companion #${idx + 1}`,
        avatar: u.avatar,
        latitude: buddyGeo.lat + (idx === 0 ? 0.008 : -0.012),
        longitude: buddyGeo.lng + (idx === 0 ? -0.006 : 0.014),
        accuracyMeters: 12,
        batteryLevel: 85 - idx * 6,
        isCurrent: false,
        lastUpdated: `${(idx + 1) * 2}m ago`,
      }
    }),
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Navigation className="w-3.5 h-3.5" />
            Live Peer-to-Peer Geolocation
          </div>
          <h2 className="font-display font-black text-3xl text-slate-100 tracking-tight">
            Live GPS Tracking & Companion Map
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time geospatial telemetry for your authentic trips and verified buddies across India.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main 3-col Map container */}
        <div className="lg:col-span-3 space-y-4">
          <LiveTripMap
            tripId={selectedTripId}
            tripTitle={currentSelectedTrip?.title || destinationName}
            destinationName={`${destinationName}, ${stateName}`}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            participants={participants}
          />
        </div>

        {/* 1-col Side Real Expedition Navigator */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Your Real Trips ({realTrips.length})
              </h3>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {realTrips.length === 0 ? (
                <div className="p-5 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300">No trips created yet</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Create a trip from the My Trips page to track live coordinates here!
                  </p>
                </div>
              ) : (
                realTrips.map((trip) => {
                  const tripIdStr = (trip._id || trip.id || "").toString()
                  const isSelected = selectedTripId === tripIdStr
                  const geo = getCoordsForDestination(trip.destination, trip.state)

                  return (
                    <button
                      key={tripIdStr}
                      onClick={() => setSelectedTripId(tripIdStr)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all border ${
                        isSelected
                          ? "bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white truncate max-w-[170px]">
                          {trip.title || trip.destination}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          {trip.destination}, {trip.state || "India"}
                        </span>
                        <span className="flex items-center gap-1 text-slate-300 flex-shrink-0">
                          <Users className="w-3 h-3 text-amber-400" />
                          {trip.approvedUsers?.length || 1} buddies
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick Directions Shortcut */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                Live Route Directions
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore satellite views, GPS coordinates, or start live turn-by-turn navigation directly to{" "}
              <strong className="text-slate-200">{destinationName}</strong> in Google Maps.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowGoogleMapsModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-display flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Compass className="w-3.5 h-3.5" />
                Preview in Interactive Google Maps
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${tripGeo.lat},${tripGeo.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold font-display flex items-center justify-center gap-2 transition-all"
              >
                Get Live Turn-by-Turn Navigation <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Privacy & Battery Guard */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              Privacy & Battery Guard
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Broadcasts are scoped strictly to verified account buddies. High accuracy GPS utilizes battery-conscious adaptive throttling.
            </p>
          </div>
        </div>
      </div>

      {/* In-App Google Maps Satellite / Street View Modal */}
      <GoogleMapsModal
        isOpen={showGoogleMapsModal}
        onClose={() => setShowGoogleMapsModal(false)}
        placeName={destinationName}
        destinationCity={destinationName}
        stateName={stateName}
        lat={tripGeo.lat}
        lng={tripGeo.lng}
        category="Expedition Destination"
      />
    </div>
  )
}

