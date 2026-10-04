import { useEffect, useState } from "react"
import {
  Compass,
  MapPin,
  Leaf,
  ShieldAlert,
  CloudSun,
  Flame,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Activity,
  PlusCircle,
  Users,
} from "lucide-react"
import type { View, User, MatchProfile } from "../types"
import Avatar from "../components/Avatar"
import { getNextTrip, readTrips } from "../lib/tripStorage"
import { calculateTripEcoScore, getEcoTier } from "../lib/ecoCalculator"
import WeatherWidget from "../components/WeatherWidget"
import EmergencySOSModal from "../components/EmergencySOSModal"
import EcoScoreModal from "../components/EcoScoreModal"
import PlaceImage from "../components/PlaceImage"
import { apiRequest } from "../lib/api"

interface DashboardProps {
  user: User
  onNav: (v: View) => void
}

export default function Dashboard({ user, onNav }: DashboardProps) {
  const [savedTripsCount, setSavedTripsCount] = useState(0)
  const [plannedTrips, setPlannedTrips] = useState(() => readTrips())
  const [buddies, setBuddies] = useState<MatchProfile[]>([])
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [showSOSModal, setShowSOSModal] = useState(false)
  const [showEcoModal, setShowEcoModal] = useState(false)
  const [selectedEcoTransport, setSelectedEcoTransport] =
    useState<"train" | "bus" | "carpool" | "flight">("train")

  useEffect(() => {
    function syncSavedTrips() {
      if (typeof window === "undefined") return
      try {
        const saved = JSON.parse(
          window.localStorage.getItem("travel-companion-favorites") || "[]",
        )
        setSavedTripsCount(Array.isArray(saved) ? saved.length : 0)
      } catch {
        setSavedTripsCount(0)
      }
    }

    syncSavedTrips()
    window.addEventListener("storage", syncSavedTrips)
    return () => window.removeEventListener("storage", syncSavedTrips)
  }, [])

  useEffect(() => {
    function syncTrips() {
      setPlannedTrips(readTrips())
    }

    syncTrips()
    window.addEventListener("storage", syncTrips)
    return () => window.removeEventListener("storage", syncTrips)
  }, [])

  useEffect(() => {
    async function loadSocialData() {
      try {
        const [liveMatches, liveConns] = await Promise.all([
          apiRequest<MatchProfile[]>("/buddies").catch(() => []),
          apiRequest<any[]>("/connections").catch(() => []),
        ])

        if (Array.isArray(liveMatches)) {
          setBuddies(liveMatches)
        }
        if (Array.isArray(liveConns)) {
          setConnectionsCount(
            liveConns.filter((c) => c.status === "accepted").length,
          )
        }
      } catch {}
    }
    loadSocialData()
  }, [user.id])

  const nextTrip = getNextTrip(plannedTrips)
  const topMatches = buddies.slice(0, 3)

  const daysToTrip = nextTrip
    ? Math.ceil(
        (new Date(nextTrip.startDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0

  // Calculate dynamic eco impact
  const ecoCalculation = calculateTripEcoScore({
    distanceKm: 750,
    transportMode: selectedEcoTransport,
    durationNights: nextTrip?.duration || 6,
    accommodationType: "homestay",
    carbonOffset: true,
  })
  const ecoTier = getEcoTier(ecoCalculation.ecoScore)

  const stats = [
    {
      label: "Trips Planned",
      value: plannedTrips.length,
      icon: "✈",
      color: "#0ea5e9",
      suffix: "",
    },
    {
      label: "Eco Score",
      value: `${ecoCalculation.ecoScore}/100`,
      icon: "🌿",
      color: "#10b981",
      suffix: "",
    },
    {
      label: "Saved Trips",
      value: savedTripsCount,
      icon: "⭐",
      color: "#f59e0b",
      suffix: "",
    },
    {
      label: "Buddy Matches",
      value: buddies.length,
      icon: "⬡",
      color: "#22c55e",
      suffix: "",
    },
    {
      label: "Connections",
      value: connectionsCount,
      icon: "💬",
      color: "#a855f7",
      suffix: "",
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Travel Intelligence Hub
          </div>
          <h2 className="font-display font-black text-3xl text-slate-100 tracking-tight">
            Good day, {user.name ? user.name.split(" ")[0] : "Traveler"}. 🌏
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            You have{" "}
            <strong className="text-cyan-300">
              {buddies.length} companion matches
            </strong>
            ,{" "}
            <strong className="text-emerald-300">
              {ecoCalculation.ecoScore} Eco-Score
            </strong>
            , and <strong>{plannedTrips.length} active trips</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNav("my-trips")}
            className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-display flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create Trip
          </button>
          <button
            onClick={() => setShowSOSModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold font-display flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            Emergency SOS
          </button>
        </div>
      </div>

      {/* 5-Column Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-slate-400">
                {s.label}
              </span>
              <span
                className="flex items-center justify-center text-sm w-8 h-8 rounded-lg"
                style={{
                  background: `${s.color}1a`,
                  color: s.color,
                }}
              >
                {s.icon}
              </span>
            </div>
            <div
              className="font-display font-black text-3xl"
              style={{ color: s.color }}
            >
              {s.value}
              {s.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Next Trip & Eco Score Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Trip Card */}
        {nextTrip ? (
          <div
            className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col justify-between"
            style={{ minHeight: 280 }}
          >
            <PlaceImage
              destination={nextTrip.destination}
              state={nextTrip.state}
              fallback={nextTrip.image}
              alt={nextTrip.destination}
              className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

            <div className="relative z-10 p-7 flex flex-col justify-between h-full space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2 inline-block">
                    NEXT CONFIRMED EXPEDITION
                  </span>
                  <h3 className="font-display font-black text-3xl text-white tracking-tight">
                    {nextTrip.destination}
                  </h3>
                  <p className="font-mono text-xs text-slate-400 mt-1">
                    {nextTrip.state}, India ·{" "}
                    {nextTrip.transport || "Planned route"}
                  </p>
                </div>

                <div className="px-4 py-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-center">
                  <span className="font-display font-black text-2xl text-cyan-400 block">
                    {daysToTrip > 0 ? daysToTrip : "Active"}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {daysToTrip > 0 ? "days to departure" : "journey underway"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex gap-6">
                  <div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase">
                      DATES
                    </p>
                    <p className="font-display font-semibold text-xs text-slate-200 mt-0.5">
                      {new Date(nextTrip.startDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}{" "}
                      –{" "}
                      {new Date(nextTrip.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase">
                      BUDGET
                    </p>
                    <p className="font-display font-semibold text-xs text-slate-200 mt-0.5">
                      ₹{nextTrip.budgetAmount?.toLocaleString() || "15,000"}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase">
                      COMPANIONS
                    </p>
                    <p className="font-display font-semibold text-xs text-emerald-400 mt-0.5">
                      {nextTrip.approvedUsers?.length || 0}/
                      {nextTrip.maxCompanions || 4} Joined
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNav("my-trips")}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                >
                  Manage Trip <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-7 flex flex-col justify-between shadow-2xl space-y-5"
            style={{ minHeight: 280 }}
          >
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3 inline-block">
                START YOUR JOURNEY
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Plan Your First Adventure
              </h3>
              <p className="text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
                Create a custom trip plan, choose dates, budget, and travel
                preferences to match with compatible travel companions across
                India.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => onNav("my-trips")}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-950/30"
              >
                <PlusCircle className="w-4 h-4" /> Create New Trip
              </button>
              <button
                onClick={() => onNav("browse-trips")}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-semibold text-xs transition-all border border-slate-700"
              >
                Browse Community Trips
              </button>
            </div>
          </div>
        )}

        {/* Eco Score & Carbon Footprint Engine Widget */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Eco-Impact Engine
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {ecoTier.label}
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black text-white">
                {ecoCalculation.ecoScore}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                -{ecoCalculation.savingsVsBaselinePercent}% CO₂ vs Flights
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Estimated footprint:{" "}
              <strong className="text-slate-200">
                {ecoCalculation.totalCo2Kg} kg CO₂
              </strong>{" "}
              (saved {ecoCalculation.co2SavedKg} kg).
            </p>
          </div>

          {/* Transport Mode Simulator */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Simulate Travel Transport Mode:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(["train", "bus", "carpool", "flight"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedEcoTransport(m)}
                  className={`py-1.5 rounded-lg text-[10px] font-mono font-bold capitalize transition-all border ${
                    selectedEcoTransport === m
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                      : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Verified Eco Homestay</span>
            <span className="text-emerald-400 font-bold">+15 Pts Bonus</span>
          </div>

          <button
            onClick={() => setShowEcoModal(true)}
            className="w-full py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 font-display font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Leaf className="w-3.5 h-3.5" />
            View Full Breakdown & Boost My Score
          </button>
        </div>
      </div>

      <EcoScoreModal
        isOpen={showEcoModal}
        onClose={() => setShowEcoModal(false)}
        user={user}
      />

      {/* Live Destination Weather Widget & Top Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Weather Widget */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-amber-400" />
              Live Destination Weather
            </h3>
            <button
              onClick={() => onNav("weather")}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 font-semibold"
            >
              Full Forecast →
            </button>
          </div>
          <WeatherWidget
            initialDestination={nextTrip?.destination || "Kedarnath"}
            compact={true}
          />
        </div>

        {/* Top Matches & Recent Chats */}
        <div className="space-y-6">
          {/* Top Matches Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Companion Matches
                </p>
                <h4 className="text-base font-bold text-white mt-0.5">
                  Top Matched Buddies
                </h4>
              </div>
              <button
                onClick={() => onNav("buddies")}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                See all {buddies.length} →
              </button>
            </div>

            <div className="space-y-2.5">
              {topMatches.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
                  <p className="text-xs font-semibold text-slate-300 mb-1">
                    No other registered travelers yet
                  </p>
                  <p className="text-[11px] text-slate-500">
                    When new travelers register accounts, their compatibility
                    match score will appear here.
                  </p>
                </div>
              ) : (
                topMatches.map((m) => (
                  <div
                    key={m.user.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={m.user.name} size={38} />
                      <div>
                        <p className="text-xs font-bold text-slate-100">
                          {m.user.name}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {m.user.travelStyle} · {m.user.budget}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {m.compatibility}% Match
                      </span>
                      <button
                        onClick={() => onNav("buddies")}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title="View Profile"
                      >
                        👥
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal Trigger */}
      <EmergencySOSModal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
        beneficiary={user.beneficiary}
      />
    </div>
  )
}
