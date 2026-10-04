import { useEffect, useState } from "react"
import {
  MapPin,
  LayoutGrid,
  Map as MapIcon,
  Leaf,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react"
import type { Trip, User } from "../types"
import Avatar from "../components/Avatar"
import PlaceImage from "../components/PlaceImage"
import LiveTripMap from "../components/LiveTripMap"
import { readTrips } from "../lib/tripStorage"
import { apiRequest } from "../lib/api"

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

const budgetColors = {
  budget: "#22c55e",
  "mid-range": "#0ea5e9",
  luxury: "#f59e0b",
}

function deduplicateTrips(tripList: any[]): Trip[] {
  const seen = new Set<string>()
  const unique: Trip[] = []

  for (const t of tripList) {
    if (!t || (!t.id && !t._id) || !t.destination) continue
    const tripId = (t.id || t._id).toString()
    const key = `${tripId}_${(t.destination || "").toLowerCase().trim()}`
    if (!seen.has(key) && !seen.has(tripId)) {
      seen.add(key)
      seen.add(tripId)
      unique.push({
        id: tripId,
        userId: t.userId || (typeof t.owner === "object" ? t.owner?._id || t.owner?.id : t.owner) || "",
        userName: t.userName || (typeof t.owner === "object" ? t.owner?.name : "") || "Traveler",
        userAvatar: t.userAvatar || (typeof t.owner === "object" ? t.owner?.avatar : "") || "",
        destination: t.destination,
        state: t.state || "",
        image: t.image || "",
        startDate: t.startDate || "",
        endDate: t.endDate || "",
        duration: t.duration || 3,
        budget: t.budget || "mid-range",
        budgetAmount: t.budgetAmount || 0,
        ecoFriendly: Boolean(t.ecoFriendly),
        carbonKg: t.carbonKg || 25,
        transport: t.transport || "Train",
        companions: t.companions || 0,
        maxCompanions: t.maxCompanions || 4,
        interests: Array.isArray(t.interests) ? t.interests : [],
        ecoPlaces: Array.isArray(t.ecoPlaces) ? t.ecoPlaces : [],
        description: t.description || "",
        status: t.status || "open",
        requestedUsers: (t.requestedUsers || []).map((u: any) =>
          typeof u === "object" && u !== null ? (u._id || u.id || "").toString() : u.toString()
        ),
        approvedUsers: (t.approvedUsers || []).map((u: any) =>
          typeof u === "object" && u !== null ? (u._id || u.id || "").toString() : u.toString()
        ),
      })
    }
  }
  return unique
}

import TripDetailModal from "../components/TripDetailModal"


export default function BrowseTrips({
  user,
  onEcoMode,
  initialSearch = "",
}: {
  user?: User | null
  onEcoMode?: (active: boolean) => void
  initialSearch?: string
}) {
  const currentUserId = user?.id || ""
  const [trips, setTrips] = useState<Trip[]>(() =>
    deduplicateTrips(readTrips()),
  )
  const [selected, setSelected] = useState<Trip | null>(null)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const saved = window.localStorage.getItem("travel-companion-favorites")
      return saved ? JSON.parse(saved) as string[] : []
    } catch {
      return []
    }
  })
  const [filter, setFilter] = useState({
    budget: "all",
    search: initialSearch,
    eco: "all" as "all" | "devotional" | "eco" | "normal",
  })

  useEffect(() => {
    async function loadTrips() {
      try {
        const liveTrips = await apiRequest<Trip[]>("/trips").catch(() => [])
        if (Array.isArray(liveTrips) && liveTrips.length > 0) {
          setTrips(deduplicateTrips(liveTrips))
          return
        }
      } catch {}
      setTrips(deduplicateTrips(readTrips()))
    }
    loadTrips()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "travel-companion-favorites",
        JSON.stringify(favorites),
      )
    }
  }, [favorites])

  function setEcoFilter(val: "all" | "devotional" | "eco" | "normal") {
    setFilter((f) => ({ ...f, eco: val }))
    onEcoMode?.(val === "eco")
  }

  function toggleFavorite(tripId: string) {
    setFavorites((prev) =>
      prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : [...prev, tripId],
    )
  }

  async function handleRequest(tripId: string) {
    if (!currentUserId) {
      setActionNotice("Please log in to send a trip request.")
      setTimeout(() => setActionNotice(null), 3500)
      return
    }

    // Optimistic UI update
    setTrips((ts) =>
      ts.map((t) =>
        t.id === tripId
          ? {
              ...t,
              requestedUsers: [...(t.requestedUsers || []), currentUserId],
            }
          : t,
      ),
    )
    setActionNotice("Join request sent to trip host!")
    setTimeout(() => setActionNotice(null), 3500)

    try {
      await apiRequest(`/trips/${tripId}/join-requests`, {
        method: "POST",
        body: JSON.stringify({
          message: "Hi! I would love to join your trip.",
        }),
      })
    } catch (err) {
      console.warn("Trip join request could not be persisted:", err)
    }
  }

  const filtered = trips.filter((t) => {
    const matchBudget = filter.budget === "all" || t.budget === filter.budget

    const searchText = (filter.search || "").trim().toLowerCase()

    const searchable = [
      t.destination,
      t.state,
      t.description,
      t.transport,
      t.budget,
      ...(t.interests || []),
      ...(t.ecoPlaces ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    const normalizedSearch = searchText
      .replace(/\s+/g, " ")
      .replace(/[^a-z0-9\s]/gi, "")

    const normalizedSearchable = searchable
      .replace(/\s+/g, " ")
      .replace(/[^a-z0-9\s]/gi, "")

    const matchSearch =
      !normalizedSearch || normalizedSearchable.includes(normalizedSearch)

    const interests = t.interests || []
    const matchEco =
      filter.eco === "all" ||
      (filter.eco === "devotional" &&
        (interests.includes("Spiritual") ||
          interests.includes("Devotional"))) ||
      (filter.eco === "eco" && t.ecoFriendly) ||
      (filter.eco === "normal" && !t.ecoFriendly)

    return matchBudget && matchSearch && matchEco
  })

  const shortlist = trips.filter((trip) => favorites.includes(trip.id))
  const visibleTrips = showSavedOnly
    ? filtered.filter((trip) => favorites.includes(trip.id))
    : filtered

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-cyan-500/90 text-slate-950 font-display font-bold text-sm shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      <div>
        <p
          className="font-display font-bold text-sm uppercase mb-1 sm:mb-2"
          style={{ color: "#22c55e" }}
        >
          DISCOVER TRIPS
        </p>
        <h2
          className="font-display font-black text-2xl sm:text-3xl"
          style={{ color: "#e2e8f0" }}
        >
          Browse Active Trips
        </h2>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#64748b" }}>
          {trips.length} authentic trips open ·{" "}
          {trips.filter((t) => t.ecoFriendly).length} eco-certified
        </p>
      </div>

      {/* Search + budget filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            value={filter.search}
            onChange={(e) =>
              setFilter((f) => ({ ...f, search: e.target.value }))
            }
            placeholder="Search by destination, state, or keywords..."
            style={{ width: "100%" }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "budget", "mid-range", "luxury"].map((b) => (
            <button
              key={b}
              onClick={() => setFilter((f) => ({ ...f, budget: b }))}
              className="px-3.5 py-2 rounded-xl font-display font-semibold text-xs sm:text-sm transition-all"
              style={
                filter.budget === b
                  ? { background: "#0ea5e9", color: "#080d1a" }
                  : {
                      background: "#0d1525",
                      border: "1px solid #1a2845",
                      color: "#64748b",
                    }
              }
            >
              {b === "all" ? "All" : b.charAt(0).toUpperCase() + b.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="font-mono text-xs text-slate-500 mr-1 flex-shrink-0">
            SHORTLIST:
          </span>
          <button
            onClick={() => setShowSavedOnly(false)}
            className="px-3.5 py-1.5 rounded-xl font-display font-semibold text-xs sm:text-sm transition-all flex-shrink-0"
            style={
              !showSavedOnly
                ? { background: "#0ea5e9", color: "#080d1a" }
                : {
                    background: "#0d1525",
                    border: "1px solid #1a2845",
                    color: "#64748b",
                  }
            }
          >
            All Trips
          </button>
          <button
            onClick={() => setShowSavedOnly(true)}
            className="px-3.5 py-1.5 rounded-xl font-display font-semibold text-xs sm:text-sm transition-all flex-shrink-0"
            style={
              showSavedOnly
                ? {
                    background: "rgba(245,158,11,0.18)",
                    border: "1px solid rgba(245,158,11,0.45)",
                    color: "#fbbf24",
                  }
                : {
                    background: "#0d1525",
                    border: "1px solid #1a2845",
                    color: "#64748b",
                  }
            }
          >
            ⭐ Saved ({favorites.length})
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              viewMode === "grid"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              viewMode === "map"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Live Map Radar
          </button>
        </div>
      </div>

      {/* Eco filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-slate-500 mr-1">
          TRIP TYPE:
        </span>
        {([
          { key: "all", label: "All Trips", icon: "🌏" },
          { key: "devotional", label: "Devotional & Spiritual", icon: "🛕" },
          { key: "eco", label: "Eco-Friendly", icon: "🌿" },
          { key: "normal", label: "Regular", icon: "✈" },
        ] as const).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setEcoFilter(opt.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-semibold text-xs transition-all"
            style={
              filter.eco === opt.key
                ? opt.key === "devotional"
                  ? {
                      background: "rgba(245,158,11,0.2)",
                      border: "1px solid rgba(245,158,11,0.5)",
                      color: "#fbbf24",
                    }
                  : opt.key === "eco"
                    ? {
                        background: "rgba(34,197,94,0.2)",
                        border: "1px solid rgba(34,197,94,0.5)",
                        color: "#4ade80",
                      }
                    : opt.key === "normal"
                      ? {
                          background: "rgba(14,165,233,0.2)",
                          border: "1px solid rgba(14,165,233,0.4)",
                          color: "#38bdf8",
                        }
                      : {
                          background: "#0ea5e9",
                          color: "#080d1a",
                          border: "1px solid #0ea5e9",
                        }
                : {
                    background: "#0d1525",
                    border: "1px solid #1a2845",
                    color: "#64748b",
                  }
            }
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
        <span className="font-mono text-xs ml-auto text-slate-500 hidden sm:inline">
          {visibleTrips.length} result{visibleTrips.length !== 1 ? "s" : ""}
        </span>
      </div>

      {shortlist.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
              SHORTLISTED TRIPS
            </p>
            <span className="font-mono text-xs text-slate-400">
              {shortlist.length} saved
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {shortlist.slice(0, 3).map((trip) => (
              <button
                key={trip.id}
                onClick={() => setSelected(trip)}
                className="text-left rounded-xl p-3"
                style={{
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid #1a2845",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="font-display font-bold text-lg"
                    style={{ color: "#e2e8f0" }}
                  >
                    {trip.destination}
                  </span>
                  <span className="text-sm">⭐</span>
                </div>
                <p className="font-mono text-xs" style={{ color: "#64748b" }}>
                  {trip.state || "India"} · {trip.duration || 3} days
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map View Mode */}
      {viewMode === "map" ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs font-mono text-cyan-300">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Showing Live Geolocation Radar for {visibleTrips.length} Trips
            </span>
            <span className="text-slate-400">CartoDB Dark Matter</span>
          </div>
          <LiveTripMap
            tripId={visibleTrips[0]?.id || "trip-general-1"}
            currentUserId={currentUserId}
            currentUserName={user?.name || "Traveler"}
          />
        </div>
      ) : (
        /* Trip grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleTrips.map((trip) => {
            const hostName = trip.userName || "Traveler"
            const alreadyRequested = currentUserId
              ? (trip.requestedUsers || []).includes(currentUserId)
              : false
            const spotsLeft = Math.max(
              0,
              (trip.maxCompanions || 4) - (trip.approvedUsers || []).length,
            )

            return (
              <div
                key={trip.id}
                className="trip-card cursor-pointer"
                onClick={() => setSelected(trip)}
              >
                <div className="relative h-40">
                  <PlaceImage
                    destination={trip.destination}
                    state={trip.state}
                    alt={trip.destination}
                    className="w-full h-full object-cover"
                    fallback={trip.image}
                    style={{ opacity: 0.7 }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(8,13,26,1) 0%, transparent 60%)",
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span
                      className="badge"
                      style={{
                        background: `${budgetColors[(trip.budget as keyof typeof budgetColors)] || "#0ea5e9"}1a`,
                        color:
                          budgetColors[
                            (trip.budget as keyof typeof budgetColors)
                          ] || "#0ea5e9",
                      }}
                    >
                      {trip.budget || "mid-range"}
                    </span>
                    {trip.ecoFriendly && (
                      <span
                        className="badge badge-green"
                        style={{ fontSize: 10 }}
                      >
                        🌿 Eco
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(trip.id)
                    }}
                    className="absolute top-3 right-3 font-mono text-xs px-2 py-1 rounded"
                    style={{
                      background: "rgba(8,13,26,0.7)",
                      color: favorites.includes(trip.id)
                        ? "#fbbf24"
                        : "#e2e8f0",
                      border: favorites.includes(trip.id)
                        ? "1px solid rgba(245,158,11,0.4)"
                        : "1px solid rgba(148,163,184,0.25)",
                    }}
                  >
                    {favorites.includes(trip.id) ? "★ Saved" : "☆ Save"}
                  </button>
                  <div
                    className="absolute top-12 right-3 font-mono text-xs px-2 py-1 rounded"
                    style={{
                      background: "rgba(8,13,26,0.7)",
                      color: "#94a3b8",
                    }}
                  >
                    {trip.duration || 3}d
                  </div>
                </div>

                <div className="p-4">
                  {/* Host */}
                  {hostName && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar name={hostName} size={24} />
                      <span
                        className="font-mono text-xs truncate max-w-[120px]"
                        style={{ color: "#64748b" }}
                      >
                        {hostName}
                      </span>
                      <span
                        className="ml-auto font-mono text-xs"
                        style={{ color: "#f59e0b" }}
                      >
                        ★ 5.0
                      </span>
                    </div>
                  )}

                  <h3
                    className="font-display font-bold text-xl mb-0.5 truncate"
                    style={{ color: "#e2e8f0" }}
                  >
                    {trip.destination}
                  </h3>
                  <p
                    className="font-mono text-xs mb-3 truncate"
                    style={{ color: "#475569" }}
                  >
                    {trip.state || "India"}
                  </p>

                  <div className="flex justify-between mb-3">
                    <div>
                      <p
                        className="font-mono text-xs"
                        style={{ color: "#475569" }}
                      >
                        FROM
                      </p>
                      <p
                        className="font-display font-semibold text-sm"
                        style={{ color: "#e2e8f0" }}
                      >
                        {trip.startDate
                          ? new Date(trip.startDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "Flexible"}
                      </p>
                    </div>
                    <div>
                      <p
                        className="font-mono text-xs"
                        style={{ color: "#475569" }}
                      >
                        BUDGET
                      </p>
                      <p
                        className="font-display font-semibold text-sm"
                        style={{ color: "#0ea5e9" }}
                      >
                        ₹{(trip.budgetAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p
                        className="font-mono text-xs"
                        style={{ color: "#475569" }}
                      >
                        SPOTS
                      </p>
                      <p
                        className="font-display font-semibold text-sm"
                        style={{
                          color: spotsLeft <= 1 ? "#f59e0b" : "#e2e8f0",
                        }}
                      >
                        {spotsLeft} left
                      </p>
                    </div>
                  </div>

                  {Array.isArray(trip.interests) &&
                    trip.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {trip.interests.slice(0, 3).map((i) => (
                          <span key={i} className="badge badge-cyan">
                            {i}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Carbon / eco info strip */}
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg mb-3"
                    style={
                      trip.ecoFriendly
                        ? {
                            background: "rgba(34,197,94,0.06)",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }
                        : {
                            background: "rgba(100,116,139,0.06)",
                            border: "1px solid #1a2845",
                          }
                    }
                  >
                    <span
                      className="font-mono text-xs"
                      style={{
                        color: trip.ecoFriendly ? "#4ade80" : "#64748b",
                      }}
                    >
                      {trip.ecoFriendly ? "🌿 Eco-certified" : "✈ Regular trip"}
                    </span>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "#475569" }}
                    >
                      ~{trip.carbonKg || 25} kg CO₂
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!alreadyRequested) handleRequest(trip.id)
                    }}
                    className="w-full py-2 rounded-lg font-display font-semibold text-sm transition-all"
                    style={
                      alreadyRequested
                        ? {
                            background: "rgba(34,197,94,0.1)",
                            color: "#4ade80",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }
                        : { background: "#0ea5e9", color: "#080d1a" }
                    }
                  >
                    {alreadyRequested ? "✓ Request Sent" : "Request to Join"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {visibleTrips.length === 0 && (
        <div className="text-center py-24">
          <div className="text-4xl mb-3">🌍</div>
          <p
            className="font-display font-bold text-lg"
            style={{ color: "#e2e8f0" }}
          >
            No trips found
          </p>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Try adjusting your search query or filter criteria.
          </p>
        </div>
      )}

      {selected && (
        <TripDetailModal
          trip={selected}
          currentUserId={currentUserId}
          onClose={() => setSelected(null)}
          onRequest={(id) => {
            handleRequest(id)
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}
