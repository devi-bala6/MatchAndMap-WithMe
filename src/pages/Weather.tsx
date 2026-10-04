import { useState, useEffect } from "react"
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  Compass,
  AlertCircle,
  Sparkles,
  Plane,
} from "lucide-react"
import WeatherWidget from "../components/WeatherWidget"
import type { User, Trip } from "../types"
import { readTrips } from "../lib/tripStorage"
import { apiRequest } from "../lib/api"

export default function Weather({ user }: { user?: User | null }) {
  const [userTrips, setUserTrips] = useState<Trip[]>([])

  useEffect(() => {
    async function loadTrips() {
      try {
        const liveTrips = await apiRequest<Trip[]>("/trips").catch(() => [])
        if (Array.isArray(liveTrips) && liveTrips.length > 0) {
          setUserTrips(liveTrips)
          return
        }
      } catch {}
      setUserTrips(readTrips())
    }
    loadTrips()
  }, [])

  const userDestinations = userTrips.map((t) => t.destination).filter(Boolean)

  const initialDest =
    userDestinations.length > 0 ? userDestinations[0] : "Spiti Valley"

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <CloudSun className="w-3.5 h-3.5" />
            Meteorological Intelligence
          </div>
          <h2 className="font-display font-black text-3xl text-slate-100 tracking-tight">
            Destination Weather & Forecasts
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time atmospheric telemetry and 5-day predictive forecasts for
            your created trips and any Indian destination.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main 2-column Weather Widget */}
        <div className="lg:col-span-2 space-y-6">
          <WeatherWidget
            initialDestination={initialDest}
            userDestinations={userDestinations}
          />

          {/* Regional Microclimates Overview */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Indian Travel Microclimate Insights
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Seasonal Guidelines
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  region: "Himalayan High Passes (Ladakh / Spiti)",
                  status: "Sub-Zero Nights",
                  badge: "Winter Gear",
                  desc: "Clear skies during the day with sharp drop in nighttime temps. High-altitude passes experience seasonal cold drafts.",
                  color: "border-sky-500/30 text-sky-300 bg-sky-500/10",
                },
                {
                  region: "Western Ghats & Coastal (Goa / Munnar)",
                  status: "Lush & Breezy",
                  badge: "Moderate",
                  desc: "Pleasant tropical conditions with breezy evenings. Ideal for beach expeditions and spice plantation walks.",
                  color:
                    "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
                },
                {
                  region: "Thar Desert & Heritage (Jaisalmer / Jaipur)",
                  status: "Sunny & Dry",
                  badge: "Sun Protection",
                  desc: "Clear daytime skies with pleasant northern breeze. Sun protection recommended; evenings cool down comfortably.",
                  color: "border-amber-500/30 text-amber-300 bg-amber-500/10",
                },
                {
                  region: "Northeastern Highlands (Meghalaya)",
                  status: "Mist & Waterfalls",
                  badge: "Waterproof Layer",
                  desc: "Living root bridges and canyon waterfalls at peak flow with intermittent mountain drizzle.",
                  color:
                    "border-purple-500/30 text-purple-300 bg-purple-500/10",
                },
              ].map((item) => (
                <div
                  key={item.region}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      {item.region}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.color}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Packing Checklist & Weather Advisory */}
        <div className="space-y-6">
          {/* AI Travel Packing Advisory */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Smart Packing Advisory
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Layered Outerwear",
                  tip: "Windproof & waterproof shell jacket for variable drafts.",
                },
                {
                  title: "UV Eye Protection",
                  tip: "Polarized sunglasses for high-altitude sunlight and glare.",
                },
                {
                  title: "Hydration & Electrolytes",
                  tip: "Insulated thermos bottle for long journey legs.",
                },
                {
                  title: "Electronics Care",
                  tip: "Keep portable power banks handy during cold temperatures.",
                },
              ].map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1"
                >
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {rec.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Health Index */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Environmental Health Index
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300">
                    UV Index Guidelines
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                    Moderate 4-6
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  SPF 30+ recommended between 11 AM and 3 PM on open trails.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300">
                    Air Quality Rating
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    Good AQI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Clear mountain and coastal air. Excellent conditions for
                  outdoor exploration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
