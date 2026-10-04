import React, { useState } from "react"
import {
  MapPin,
  Navigation,
  ExternalLink,
  X,
  Compass,
  Layers,
  Clock,
  Car,
  Footprints,
  Train,
  CheckCircle2,
} from "lucide-react"

interface GoogleMapsModalProps {
  isOpen: boolean
  onClose: () => void
  placeName: string
  destinationCity: string
  stateName?: string
  lat?: number
  lng?: number
  address?: string
  category?: string
  timing?: string
  specialty?: string
}

export default function GoogleMapsModal({
  isOpen,
  onClose,
  placeName,
  destinationCity,
  stateName = "India",
  lat,
  lng,
  address,
  category = "Landmark Attraction",
  timing,
  specialty,
}: GoogleMapsModalProps) {
  const [mapType, setMapType] = useState<"m" | "k">("m") // 'm' for roadmap, 'k' for satellite
  const [travelMode, setTravelMode] = useState<"driving" | "transit" | "walking">("driving")

  if (!isOpen) return null

  // Clean canonical search term for Google Maps
  const fullSearchQuery = `${placeName}, ${destinationCity}, ${stateName}, India`
  const encodedQuery = encodeURIComponent(fullSearchQuery)

  // Embed URL using official Google Maps embed interface
  const embedUrl = lat && lng && !isNaN(lat) && !isNaN(lng)
    ? `https://maps.google.com/maps?q=${lat},${lng}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${encodedQuery}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`

  // Live Navigation Direction URL
  const directionsUrl = lat && lng && !isNaN(lat) && !isNaN(lng)
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${travelMode}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}&travelmode=${travelMode}`

  const openAppUrl = lat && lng && !isNaN(lat) && !isNaN(lng)
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl bg-slate-900 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-base sm:text-lg text-white truncate">
                  {placeName}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">
                📍 {address || `${destinationCity}, ${stateName}, India`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Satellite / Map Toggle */}
            <div className="hidden sm:flex bg-slate-900 border border-slate-700 p-1 rounded-xl text-xs font-mono">
              <button
                onClick={() => setMapType("m")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  mapType === "m"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setMapType("k")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  mapType === "k"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Satellite
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Google Map Frame */}
        <div className="relative w-full h-80 sm:h-[420px] bg-slate-950">
          <iframe
            title={`Google Map - ${placeName}`}
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating Live Coordinates Badge */}
          {lat && lng && (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-[11px] font-mono text-cyan-300 shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
              </span>
            </div>
          )}
        </div>

        {/* Location Details & Quick Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/95 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              {specialty && (
                <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                  ⭐ {specialty}
                </p>
              )}
              {timing && (
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Visiting Hours: {timing}
                </p>
              )}
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Google Maps Location & Authentic Indian Circuit
              </div>
            </div>

            {/* Travel Mode Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono text-slate-300">
              <button
                onClick={() => setTravelMode("driving")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  travelMode === "driving"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Driving Directions"
              >
                <Car className="w-3.5 h-3.5" /> Drive
              </button>
              <button
                onClick={() => setTravelMode("transit")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  travelMode === "transit"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Public Transit"
              >
                <Train className="w-3.5 h-3.5" /> Transit
              </button>
              <button
                onClick={() => setTravelMode("walking")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  travelMode === "walking"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Walking Route"
              >
                <Footprints className="w-3.5 h-3.5" /> Walk
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <a
              href={openAppUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-all border border-slate-700"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              View Place in Google Maps <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-display font-black flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Navigation className="w-4 h-4" />
              Start Live Navigation in Google Maps <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
