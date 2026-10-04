import { useState, useEffect } from "react"
import type { Trip, User } from "../types"
import Avatar from "../components/Avatar"
import PlaceImage from "../components/PlaceImage"
import { apiRequest } from "../lib/api"
import { readTrips, writeTrips } from "../lib/tripStorage"
import {
  DESTINATION_IMAGE_FALLBACK,
  getDestinationImage,
} from "../lib/destinationImage.js"
import { Check, UserCheck, X, MapPin, Navigation, ExternalLink, Compass } from "lucide-react"
import GoogleMapsModal from "../components/GoogleMapsModal"
import { getCoordsForDestination } from "../lib/geoUtils"

const INTERESTS_LIST = [
  "Photography",
  "Street Food",
  "History",
  "Architecture",
  "Hiking",
  "Diving",
  "Art",
  "Music",
  "Markets",
  "Wellness",
  "Astronomy",
  "Wildlife",
]

const budgetColors = {
  budget: "#22c55e",
  "mid-range": "#0ea5e9",
  luxury: "#f59e0b",
}

const statusColors = {
  open: "#22c55e",
  full: "#f59e0b",
  completed: "#64748b",
  cancelled: "#ef4444",
}

function TripCard({
  trip,
  onSelect,
}: {
  trip: Trip
  onSelect: (t: Trip) => void
}) {
  const requestedCount = trip.requestedUsers?.length || 0
  const approvedCount = trip.approvedUsers?.length || 0

  return (
    <div className="trip-card cursor-pointer" onClick={() => onSelect(trip)}>
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        <PlaceImage
          destination={trip.destination}
          state={trip.state}
          alt={trip.destination}
          className="w-full h-full object-cover"
          fallback={trip.image}
        />
        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 font-display text-xs font-bold shadow-lg"
            style={{
              background: "rgba(240,249,255,0.97)",
              color: budgetColors[trip.budget as keyof typeof budgetColors] || "#0ea5e9",
              border: "1px solid rgba(255,255,255,0.75)",
            }}
          >
            {trip.budget.replace(/\b\w/g, (letter) => letter.toUpperCase())}
          </span>
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 font-display text-xs font-bold shadow-lg"
            style={{
              background:
                trip.status === "open"
                  ? "rgba(220,252,231,0.97)"
                  : "rgba(255,255,255,0.97)",
              color:
                trip.status === "open"
                  ? "#166534"
                  : statusColors[trip.status as keyof typeof statusColors] || "#64748b",
              border: "1px solid rgba(255,255,255,0.75)",
            }}
          >
            {trip.status.replace(/\b\w/g, (letter) => letter.toUpperCase())}
          </span>
          {trip.ecoFriendly && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs font-bold shadow-lg"
              style={{
                background: "rgba(220,252,231,0.97)",
                color: "#166534",
                border: "1px solid rgba(255,255,255,0.75)",
              }}
            >
              🌿 Eco-friendly
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3
              className="font-display font-bold text-lg"
              style={{ color: "#e2e8f0" }}
            >
              {trip.destination}
            </h3>
            <p className="font-mono text-xs" style={{ color: "#475569" }}>
              {trip.state}
            </p>
          </div>
          <div className="text-right">
            <p
              className="font-display font-bold text-sm"
              style={{ color: "#0ea5e9" }}
            >
              ₹{(trip.budgetAmount || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-3">
          <div>
            <p className="font-mono text-xs" style={{ color: "#475569" }}>
              DATES
            </p>
            <p
              className="font-display text-xs font-medium"
              style={{ color: "#94a3b8" }}
            >
              {trip.startDate
                ? `${new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${new Date(trip.endDate || trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Flexible Dates"}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs" style={{ color: "#475569" }}>
              DURATION
            </p>
            <p
              className="font-display text-xs font-medium"
              style={{ color: "#94a3b8" }}
            >
              {trip.duration || 3} days
            </p>
          </div>
          <div>
            <p className="font-mono text-xs" style={{ color: "#475569" }}>
              SPOTS
            </p>
            <p
              className="font-display text-xs font-medium"
              style={{ color: "#94a3b8" }}
            >
              {(trip.approvedUsers || []).length}/{trip.maxCompanions || 4} filled
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {(trip.interests || []).slice(0, 3).map((i) => (
            <span key={i} className="badge badge-cyan">
              {i}
            </span>
          ))}
          {(trip.interests || []).length > 3 && (
            <span className="badge badge-gray">
              +{(trip.interests || []).length - 3}
            </span>
          )}
        </div>

        {/* Pending requests highlight */}
        {requestedCount > 0 && (
          <div
            className="mt-2 p-2.5 rounded-xl flex items-center justify-between gap-2"
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.35)",
            }}
          >
            <span className="font-mono text-xs font-bold" style={{ color: "#fbbf24" }}>
              🔔 {requestedCount} pending request{requestedCount > 1 ? "s" : ""}
            </span>
            <span className="font-mono text-[10px] text-amber-300 underline">
              Click to review
            </span>
          </div>
        )}

        {/* Approved companions */}
        {approvedCount > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: "#4ade80" }}>
              ✓ {approvedCount} confirmed companion{approvedCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function CreateTripModal({
  onClose,
  onCreate,
  onEcoMode,
}: {
  onClose: () => void
  onCreate: (t: Partial<Trip>) => void
  onEcoMode?: (active: boolean) => void
}) {
  const [form, setForm] = useState({
    destination: "",
    state: "",
    startDate: "",
    endDate: "",
    budget: "mid-range" as Trip["budget"],
    budgetAmount: "",
    maxCompanions: "3",
    description: "",
    interests: [] as string[],
    ecoFriendly: false,
  })

  function toggleInterest(i: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i)
        ? f.interests.filter((x) => x !== i)
        : [...f.interests, i],
    }))
  }

  function handleCreate() {
    if (!form.destination || !form.startDate || !form.endDate) return
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    const duration = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    )
    onCreate({
      destination: form.destination,
      state: form.state,
      startDate: form.startDate,
      endDate: form.endDate,
      duration,
      budget: form.budget,
      budgetAmount: Number(form.budgetAmount) || 0,
      maxCompanions: Number(form.maxCompanions),
      description: form.description,
      interests: form.interests,
      ecoFriendly: form.ecoFriendly,
      carbonKg: form.ecoFriendly ? 20 : 80,
      status: "open",
      companions: 0,
      requestedUsers: [],
      approvedUsers: [],
    })
    onClose()
  }

  return (
    <div
      className="modal-overlay p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-display font-bold text-2xl"
            style={{ color: "#e2e8f0" }}
          >
            Create New Trip
          </h2>
          <button onClick={onClose} style={{ color: "#475569", fontSize: 20 }}>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Destination
            </label>
            <input
              value={form.destination}
              onChange={(e) =>
                setForm((f) => ({ ...f, destination: e.target.value }))
              }
              placeholder="e.g. Manali, Goa, Rishikesh"
            />
          </div>
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              State
            </label>
            <input
              value={form.state}
              onChange={(e) =>
                setForm((f) => ({ ...f, state: e.target.value }))
              }
              placeholder="e.g. Himachal Pradesh"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
            />
          </div>
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              End Date
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Budget Type
            </label>
            <select
              value={form.budget}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  budget: e.target.value as Trip["budget"],
                }))
              }
            >
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-Range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Amount (₹)
            </label>
            <input
              type="number"
              value={form.budgetAmount}
              onChange={(e) =>
                setForm((f) => ({ ...f, budgetAmount: e.target.value }))
              }
              placeholder="15000"
            />
          </div>
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Max Companions
            </label>
            <select
              value={form.maxCompanions}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxCompanions: e.target.value }))
              }
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label
            className="block font-display font-medium text-sm mb-2"
            style={{ color: "#94a3b8" }}
          >
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_LIST.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleInterest(i)}
                className="badge transition-all"
                style={
                  form.interests.includes(i)
                    ? {
                        background: "rgba(14,165,233,0.2)",
                        color: "#38bdf8",
                        border: "1px solid rgba(14,165,233,0.4)",
                      }
                    : {
                        background: "rgba(100,116,139,0.1)",
                        color: "#64748b",
                        border: "1px solid #1a2845",
                      }
                }
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Eco toggle */}
        <div className="mb-4">
          <p
            className="font-display font-medium text-sm mb-3"
            style={{ color: "#94a3b8" }}
          >
            Trip Type
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, ecoFriendly: false }))
                onEcoMode?.(false)
              }}
              className="flex items-start gap-3 p-4 rounded-xl transition-all text-left"
              style={
                !form.ecoFriendly
                  ? {
                      background: "rgba(14,165,233,0.1)",
                      border: "2px solid #0ea5e9",
                    }
                  : { background: "#0d1525", border: "2px solid #1a2845" }
              }
            >
              <span className="text-2xl mt-0.5">✈</span>
              <div>
                <p
                  className="font-display font-bold text-sm"
                  style={{ color: !form.ecoFriendly ? "#38bdf8" : "#64748b" }}
                >
                  Regular Trip
                </p>
                <p
                  className="font-mono text-xs mt-0.5"
                  style={{ color: "#475569" }}
                >
                  Standard companion journey
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, ecoFriendly: true }))
                onEcoMode?.(true)
              }}
              className="flex items-start gap-3 p-4 rounded-xl transition-all text-left"
              style={
                form.ecoFriendly
                  ? {
                      background: "rgba(34,197,94,0.1)",
                      border: "2px solid #22c55e",
                    }
                  : { background: "#0d1525", border: "2px solid #1a2845" }
              }
            >
              <span className="text-2xl mt-0.5">🌿</span>
              <div>
                <p
                  className="font-display font-bold text-sm"
                  style={{ color: form.ecoFriendly ? "#4ade80" : "#64748b" }}
                >
                  Eco-Friendly Trip
                </p>
                <p
                  className="font-mono text-xs mt-0.5"
                  style={{ color: "#475569" }}
                >
                  Eco stays, low-carbon transport pledge
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label
            className="block font-display font-medium text-sm mb-2"
            style={{ color: "#94a3b8" }}
          >
            Trip Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Describe your trip plans and what kind of companion you are looking for..."
            style={{ resize: "vertical", minHeight: 80 }}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">
            Cancel
          </button>
          <button onClick={handleCreate} className="btn-primary flex-1">
            Create Trip
          </button>
        </div>
      </div>
    </div>
  )
}

function TripDetailModal({
  trip,
  onClose,
  onApprove,
  onReject,
}: {
  trip: Trip
  onClose: () => void
  onApprove: (userId: string) => void
  onReject: (userId: string) => void
}) {
  const requestedUsers = trip.requestedUsers || []
  const requestedUsersDetails = (trip as any).requestedUsersDetails || []
  const approvedUsers = trip.approvedUsers || []
  const approvedUsersDetails = (trip as any).approvedUsersDetails || []

  const [showMap, setShowMap] = useState(false)
  const tripGeo = getCoordsForDestination(trip.destination, trip.state)

  return (
    <div
      className="modal-overlay p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h2
            className="font-display font-bold text-2xl"
            style={{ color: "#e2e8f0" }}
          >
            {trip.destination}, {trip.state}
          </h2>
          <button onClick={onClose} style={{ color: "#475569", fontSize: 20 }}>
            ✕
          </button>
        </div>

        <div
          className="relative rounded-xl overflow-hidden mb-6"
          style={{ height: 160 }}
        >
          <PlaceImage
            destination={trip.destination}
            state={trip.state}
            alt={trip.destination}
            className="w-full h-full object-cover"
            fallback={trip.image}
            style={{ opacity: 0.6 }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            {
              label: "DATES",
              value: trip.startDate
                ? `${new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${new Date(trip.endDate || trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}`
                : "Flexible Dates",
            },
            { label: "DURATION", value: `${trip.duration || 3} days` },
            {
              label: "BUDGET",
              value: `₹${(trip.budgetAmount || 0).toLocaleString()}`,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-xl"
              style={{ background: "#141e35", border: "1px solid #1a2845" }}
            >
              <p
                className="font-mono text-xs mb-1"
                style={{ color: "#475569" }}
              >
                {s.label}
              </p>
              <p
                className="font-display font-semibold text-sm"
                style={{ color: "#e2e8f0" }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Google Maps Interactive Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              GPS: {tripGeo.lat.toFixed(4)}° N, {tripGeo.lng.toFixed(4)}° E ({tripGeo.elevation})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMap(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5" /> Preview Google Map
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${tripGeo.lat},${tripGeo.lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5" /> Directions <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "#94a3b8" }}
        >
          {trip.description || `Trip to ${trip.destination}.`}
        </p>

        {/* Google Maps In-App Preview Modal */}
        <GoogleMapsModal
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          placeName={trip.destination}
          destinationCity={trip.destination}
          stateName={trip.state}
          lat={tripGeo.lat}
          lng={tripGeo.lng}
          category="Trip Destination"
        />

        {/* Pending Requests */}
        {requestedUsers.length > 0 && (
          <div className="mb-6">
            <p className="font-mono text-xs mb-3 font-bold" style={{ color: "#f59e0b" }}>
              🔔 PENDING JOIN REQUESTS ({requestedUsers.length})
            </p>
            <div className="flex flex-col gap-3">
              {requestedUsers.map((uid) => {
                const detail = requestedUsersDetails.find(
                  (d: any) => d.id === uid || d._id === uid
                )
                const travelerName = detail?.name || `Traveler #${uid.slice(-4)}`
                const travelerLocation = detail?.city
                  ? `${detail.city}${detail.state ? `, ${detail.state}` : ""}`
                  : detail?.email || "Wants to join your trip"

                return (
                  <div
                    key={uid}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 shadow-md"
                  >
                    <Avatar name={travelerName} size={42} radius={10} />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-display font-bold text-sm truncate"
                        style={{ color: "#e2e8f0" }}
                      >
                        {travelerName}
                      </p>
                      <p
                        className="font-mono text-xs truncate"
                        style={{ color: "#94a3b8" }}
                      >
                        {travelerLocation}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => onReject(uid)}
                        className="p-2 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 transition-all text-xs"
                        title="Decline Request"
                      >
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => onApprove(uid)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <Check size={14} /> Accept
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Approved companions */}
        {approvedUsers.length > 0 && (
          <div>
            <p className="font-mono text-xs mb-3 font-bold" style={{ color: "#4ade80" }}>
              ✓ CONFIRMED COMPANIONS ({approvedUsers.length})
            </p>
            <div className="flex flex-col gap-2">
              {approvedUsers.map((uid) => {
                const detail = approvedUsersDetails.find(
                  (d: any) => d.id === uid || d._id === uid
                )
                const travelerName = detail?.name || `Companion #${uid.slice(-4)}`

                return (
                  <div
                    key={uid}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: "#141e35",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    <Avatar name={travelerName} size={36} radius={8} />
                    <div>
                      <p
                        className="font-display font-semibold text-sm"
                        style={{ color: "#e2e8f0" }}
                      >
                        {travelerName}
                      </p>
                    </div>
                    <span className="ml-auto badge badge-green">Confirmed</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button onClick={onClose} className="btn-outline w-full mt-6">
          Close
        </button>
      </div>
    </div>
  )
}

export default function Trips({
  user,
  onEcoMode,
}: {
  user?: User | null
  onEcoMode?: (active: boolean) => void
}) {
  const currentUserId = (user?.id || (user as any)?._id || "").toString()
  const [trips, setTrips] = useState<Trip[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Trip | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserTrips() {
      if (!currentUserId) return
      try {
        const liveTrips = await apiRequest<Trip[]>("/trips").catch(() => [])
        if (Array.isArray(liveTrips)) {
          const myTrips = liveTrips.filter(
            (t: any) => {
              const tripOwnerId = (t.userId || t.owner?._id || t.owner || "").toString()
              const isOwner = tripOwnerId === currentUserId
              const isApproved = Array.isArray(t.approvedUsers) && t.approvedUsers.some(
                (uid: any) => (typeof uid === "object" ? uid._id || uid.id : uid).toString() === currentUserId
              )
              return isOwner || isApproved
            }
          )
          setTrips(myTrips)
          writeTrips(liveTrips)
        }
      } catch {}
    }
    loadUserTrips()
    const interval = setInterval(loadUserTrips, 10000)
    return () => clearInterval(interval)
  }, [currentUserId])

  const persistTrips = (nextTrips: Trip[]) => {
    setTrips(nextTrips)
    writeTrips(nextTrips)
  }

  async function handleCreate(data: Partial<Trip>) {
    const destination = data.destination ?? ""
    const state = data.state ?? ""
    const image = await getDestinationImage(destination, state)
    const tripPayload = {
      destination,
      state,
      image: image || DESTINATION_IMAGE_FALLBACK,
      startDate: data.startDate ?? "",
      endDate: data.endDate ?? "",
      duration: data.duration ?? 0,
      budget: data.budget ?? "mid-range",
      budgetAmount: data.budgetAmount ?? 0,
      ecoFriendly: data.ecoFriendly ?? false,
      carbonKg: data.carbonKg ?? (data.ecoFriendly ? 20 : 80),
      transport: "Train",
      maxCompanions: data.maxCompanions ?? 3,
      interests: data.interests ?? [],
      description: data.description ?? "",
      status: "open",
    }

    try {
      const savedTrip = await apiRequest<any>("/trips", {
        method: "POST",
        body: JSON.stringify(tripPayload),
      })

      const newTrip: Trip = {
        id: (savedTrip?.id || savedTrip?._id || `t-${Date.now()}`).toString(),
        userId: currentUserId || "u1",
        userName: user?.name || "Traveler",
        userAvatar: user?.avatar || "",
        destination: savedTrip?.destination || tripPayload.destination,
        state: savedTrip?.state || tripPayload.state,
        image: savedTrip?.image || tripPayload.image,
        startDate: savedTrip?.startDate || tripPayload.startDate,
        endDate: savedTrip?.endDate || tripPayload.endDate,
        duration: savedTrip?.duration || tripPayload.duration,
        budget: savedTrip?.budget || tripPayload.budget,
        budgetAmount: savedTrip?.budgetAmount || tripPayload.budgetAmount,
        ecoFriendly: savedTrip?.ecoFriendly ?? tripPayload.ecoFriendly,
        carbonKg: savedTrip?.carbonKg ?? tripPayload.carbonKg,
        transport: savedTrip?.transport || tripPayload.transport,
        companions: 0,
        maxCompanions: savedTrip?.maxCompanions ?? tripPayload.maxCompanions,
        interests: savedTrip?.interests || tripPayload.interests,
        description: savedTrip?.description || tripPayload.description,
        status: "open",
        requestedUsers: [],
        approvedUsers: [],
      }

      persistTrips([newTrip, ...trips])
      setActionNotice(`Trip to ${newTrip.destination} created successfully!`)
      setTimeout(() => setActionNotice(null), 3500)
    } catch {
      window.alert("Trip could not be saved. Check that the backend is running.")
    }
  }

  async function handleApprove(tripId: string, targetUserId: string) {
    // Optimistic UI state update
    setTrips((ts) =>
      ts.map((t) =>
        t.id === tripId
          ? {
              ...t,
              requestedUsers: (t.requestedUsers || []).filter((id) => id !== targetUserId),
              requestedUsersDetails: ((t as any).requestedUsersDetails || []).filter(
                (d: any) => (d.id || d._id) !== targetUserId
              ),
              approvedUsers: [...(t.approvedUsers || []), targetUserId],
            }
          : t,
      )
    )

    setSelected((prev) =>
      prev?.id === tripId
        ? {
            ...prev,
            requestedUsers: (prev.requestedUsers || []).filter((id) => id !== targetUserId),
            requestedUsersDetails: ((prev as any).requestedUsersDetails || []).filter(
              (d: any) => (d.id || d._id) !== targetUserId
            ),
            approvedUsers: [...(prev.approvedUsers || []), targetUserId],
          }
        : prev,
    )

    setActionNotice("Trip join request accepted! Companion confirmed.")
    setTimeout(() => setActionNotice(null), 4000)

    try {
      await apiRequest(`/trips/${tripId}/approve-user/${targetUserId}`, {
        method: "PUT",
      })
    } catch (err) {
      console.warn("Approval API error:", err)
    }
  }

  async function handleReject(tripId: string, targetUserId: string) {
    setTrips((ts) =>
      ts.map((t) =>
        t.id === tripId
          ? {
              ...t,
              requestedUsers: (t.requestedUsers || []).filter((id) => id !== targetUserId),
              requestedUsersDetails: ((t as any).requestedUsersDetails || []).filter(
                (d: any) => (d.id || d._id) !== targetUserId
              ),
            }
          : t,
      )
    )

    setSelected((prev) =>
      prev?.id === tripId
        ? {
            ...prev,
            requestedUsers: (prev.requestedUsers || []).filter((id) => id !== targetUserId),
            requestedUsersDetails: ((prev as any).requestedUsersDetails || []).filter(
              (d: any) => (d.id || d._id) !== targetUserId
            ),
          }
        : prev,
    )

    try {
      await apiRequest(`/trips/${tripId}/reject-user/${targetUserId}`, {
        method: "PUT",
      })
    } catch (err) {
      console.warn("Reject API error:", err)
    }
  }

  // Aggregate all pending requests across all hosted trips
  const allPendingRequests = trips.flatMap((t) => {
    const details = (t as any).requestedUsersDetails || []
    const ids = t.requestedUsers || []
    return ids.map((uid: string) => {
      const found = details.find((d: any) => d.id === uid || d._id === uid)
      return {
        tripId: t.id,
        tripDestination: t.destination,
        tripState: t.state,
        userId: uid,
        userName: found?.name || `Traveler #${uid.slice(-4)}`,
        userEmail: found?.email || "",
        userCity: found?.city || "",
        userState: found?.state || "",
        userAvatar: found?.avatar || "",
      }
    })
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-display font-medium flex items-center gap-2 animate-fade-in shadow-xl">
          <UserCheck size={16} className="text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p
            className="font-display font-bold text-sm uppercase mb-1 sm:mb-2"
            style={{ color: "#0ea5e9" }}
          >
            MY TRIPS
          </p>
          <h2
            className="font-display font-black text-2xl sm:text-3xl"
            style={{ color: "#e2e8f0" }}
          >
            Trip Management
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#64748b" }}>
            {trips.length} trip{trips.length !== 1 ? "s" : ""} planned · {allPendingRequests.length} pending join request{allPendingRequests.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary w-full sm:w-auto"
        >
          + Create New Trip
        </button>
      </div>

      {/* Prominent Incoming Trip Join Requests Banner */}
      {allPendingRequests.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-display font-bold text-sm sm:text-base text-amber-300">
                Incoming Trip Join Requests ({allPendingRequests.length})
              </h3>
            </div>
            <span className="font-mono text-xs text-amber-400/80">
              Review and approve companions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {allPendingRequests.map((req) => (
              <div
                key={`${req.tripId}_${req.userId}`}
                className="p-3.5 rounded-xl bg-slate-900/95 border border-amber-500/25 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={req.userName} size={42} radius={10} />
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm text-slate-200 truncate">
                      {req.userName}
                    </p>
                    <p className="font-mono text-xs text-cyan-400 truncate">
                      Wants to join: <span className="font-bold">{req.tripDestination}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleReject(req.tripId, req.userId)}
                    title="Decline Request"
                    className="p-2 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 transition-all text-xs"
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={() => handleApprove(req.tripId, req.userId)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/30"
                  >
                    <Check size={14} /> Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trips.length === 0 ? (
        <div
          className="text-center py-20 p-6"
          style={{ border: "1px dashed #1a2845", borderRadius: 16 }}
        >
          <div className="text-5xl mb-4">✈️</div>
          <p
            className="font-display font-bold text-xl mb-2"
            style={{ color: "#e2e8f0" }}
          >
            No trips planned yet
          </p>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Create your first trip or request to join fellow travelers on Browse Trips.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onSelect={setSelected} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTripModal
          onClose={() => {
            setShowCreate(false)
            onEcoMode?.(false)
          }}
          onCreate={handleCreate}
          onEcoMode={onEcoMode}
        />
      )}

      {selected && (
        <TripDetailModal
          trip={selected}
          onClose={() => setSelected(null)}
          onApprove={(uid) => handleApprove(selected.id, uid)}
          onReject={(uid) => handleReject(selected.id, uid)}
        />
      )}
    </div>
  )
}
