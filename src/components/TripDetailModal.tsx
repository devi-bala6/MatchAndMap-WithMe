import { useState } from "react"
import {
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  Calendar,
  Clock,
  Wallet,
  Leaf,
  Sparkles,
  Users,
  Check,
  X,
  MessageSquare,
  Utensils,
  Sun,
  ShieldCheck,
  Share2,
  Train,
  Plane,
  Bus,
  Car,
  ChevronRight,
  Info,
} from "lucide-react"
import type { Trip } from "../types"
import Avatar from "./Avatar"
import PlaceImage from "./PlaceImage"
import GoogleMapsModal from "./GoogleMapsModal"
import { getCoordsForDestination } from "../lib/geoUtils"
import { getDestinationIntelligence } from "../lib/destinationDetails"

interface TripDetailModalProps {
  trip: Trip
  currentUserId: string
  onClose: () => void
  onRequest?: (id: string) => void
  onApprove?: (userId: string) => void
  onReject?: (userId: string) => void
  onOpenChat?: (userId: string) => void
  isOwner?: boolean
}

const budgetColors: Record<string, string> = {
  budget: "#22c55e",
  "mid-range": "#0ea5e9",
  luxury: "#f59e0b",
}

export default function TripDetailModal({
  trip,
  currentUserId,
  onClose,
  onRequest,
  onApprove,
  onReject,
  onOpenChat,
  isOwner = false,
}: TripDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "food" | "eco" | "companions">("overview")
  const [showMap, setShowMap] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const hostName = trip.userName || "Traveler"
  const alreadyRequested = currentUserId
    ? trip.requestedUsers?.includes(currentUserId)
    : false
  const alreadyApproved = currentUserId
    ? trip.approvedUsers?.includes(currentUserId)
    : false

  const tripGeo = getCoordsForDestination(trip.destination, trip.state)
  const intel = getDestinationIntelligence(trip.destination, trip.state)

  const remainingSpots = Math.max(
    0,
    (trip.maxCompanions || 4) - (trip.approvedUsers || []).length,
  )

  const totalCompanions = trip.maxCompanions || 4
  const filledCount = (trip.approvedUsers || []).length
  const fillPercentage = Math.min(100, Math.round((filledCount / totalCompanions) * 100))

  function handleJoinClick() {
    if (onRequest) {
      onRequest(trip.id)
      setRequestSent(true)
    }
  }

  function handleShareTrip() {
    if (navigator.share) {
      navigator
        .share({
          title: `Trip to ${trip.destination} with ${hostName}`,
          text: `Join this ${trip.ecoFriendly ? "eco-friendly " : ""}trip to ${trip.destination} (${trip.duration || 3} days) on Match&Map!`,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Trip link copied to clipboard!")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/70 z-10">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 hover:text-white transition-colors"
          >
            ← Back to trips
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareTrip}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
              title="Share Trip"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Panoramic Hero Section */}
          <div className="relative rounded-2xl overflow-hidden min-h-[190px] sm:min-h-[220px] shadow-lg border border-slate-800">
            <PlaceImage
              destination={trip.destination}
              state={trip.state}
              alt={trip.destination}
              className="w-full h-full object-cover absolute inset-0"
              fallback={trip.image}
              style={{ opacity: 0.65 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            {/* Badges on Top */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10">
              <div className="flex flex-wrap gap-1.5">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 font-display text-xs font-bold shadow-md uppercase tracking-wider"
                  style={{
                    background: "rgba(15,23,42,0.85)",
                    color: budgetColors[trip.budget as keyof typeof budgetColors] || "#0ea5e9",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {trip.budget}
                </span>
                {trip.ecoFriendly && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-xs font-bold bg-emerald-500/90 text-slate-950 shadow-md">
                    🌿 Eco-Certified
                  </span>
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-950/85 text-cyan-400 border border-cyan-500/30">
                {trip.status.toUpperCase()}
              </span>
            </div>

            {/* Destination Title on Bottom */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-100 tracking-tight">
                {trip.destination}
              </h2>
              <p className="font-mono text-xs sm:text-sm text-cyan-300/90 mt-0.5">
                {trip.state ? `${trip.state}, India` : "India"} · GPS: {tripGeo.lat.toFixed(2)}° N, {tripGeo.lng.toFixed(2)}° E
              </p>
            </div>
          </div>

          {/* GPS & Navigation Action Strip */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/25 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Altitude: <strong>{tripGeo.elevation}</strong> · Ideal: <strong>{intel.bestSeason}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Compass className="w-3.5 h-3.5" /> Interactive Map
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${tripGeo.lat},${tripGeo.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" /> Directions <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 4 Core Parameter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                DATES
              </div>
              <p className="font-display font-bold text-xs sm:text-sm text-slate-200 truncate">
                {trip.startDate
                  ? new Date(trip.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Flexible"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                DURATION
              </div>
              <p className="font-display font-bold text-xs sm:text-sm text-slate-200">
                {trip.duration || 3} Days
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                TOTAL BUDGET
              </div>
              <p className="font-display font-bold text-xs sm:text-sm text-emerald-400">
                ₹{(trip.budgetAmount || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
                <Leaf className="w-3.5 h-3.5 text-teal-400" />
                FOOTPRINT
              </div>
              <p className="font-display font-bold text-xs sm:text-sm text-teal-300">
                ~{trip.carbonKg || 25} kg CO₂
              </p>
            </div>
          </div>

          {/* Host Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={hostName} size={44} radius={12} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-bold text-sm text-slate-100 truncate">
                    {hostName}
                  </p>
                  <span className="badge badge-green text-[10px]">✓ Verified Host</span>
                </div>
                <p className="font-mono text-xs text-slate-400 mt-0.5">
                  Trip Organizer & Guide · Rating: ★ 4.9
                </p>
              </div>
            </div>

            {onOpenChat && trip.userId && trip.userId !== currentUserId && (
              <button
                type="button"
                onClick={() => onOpenChat(trip.userId)}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </button>
            )}
          </div>

          {/* Navigation Tabs for In-Depth Details */}
          <div className="flex gap-1 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
            {[
              { id: "overview", label: "📖 Overview", icon: Info },
              { id: "itinerary", label: "🗺️ Key Attractions", icon: MapPin },
              { id: "food", label: "🍲 Food Guide", icon: Utensils },
              { id: "eco", label: "🌿 Eco & Weather", icon: Leaf },
              { id: "companions", label: `👥 Companions (${filledCount}/${totalCompanions})`, icon: Users },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 font-display font-semibold text-xs transition-all shrink-0 rounded-t-xl ${
                  activeTab === t.id
                    ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 border-b-2 border-transparent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="font-mono text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
                  About this journey
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {trip.description ||
                    `Join fellow travellers for a wonderful journey to ${trip.destination}. This journey focuses on authentic local interactions, respectful nature exploration, and scenic spots.`}
                </p>
              </div>

              {/* Trip Interests Tags */}
              {Array.isArray(trip.interests) && trip.interests.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
                    Trip Interests & Vibes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trip.interests.map((i) => (
                      <span key={i} className="badge badge-cyan text-xs py-1 px-2.5">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Estimated Daily Cost Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="font-mono text-xs text-cyan-400 mb-3 font-bold uppercase tracking-wider">
                  Daily Budget Estimate Per Person
                </p>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] font-mono text-slate-400">Stay / Homestay</p>
                    <p className="font-display font-bold text-sm text-slate-200 mt-0.5">
                      ~₹{intel.dailyBudgetEstimate.stay}/day
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] font-mono text-slate-400">Food & Meals</p>
                    <p className="font-display font-bold text-sm text-slate-200 mt-0.5">
                      ~₹{intel.dailyBudgetEstimate.food}/day
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] font-mono text-slate-400">Local Travel</p>
                    <p className="font-display font-bold text-sm text-slate-200 mt-0.5">
                      ~₹{intel.dailyBudgetEstimate.localTravel}/day
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEY ATTRACTIONS */}
          {activeTab === "itinerary" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider">
                Top Landmark Stops & Highlights in {trip.destination}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {intel.attractions.map((attraction, idx) => (
                  <div
                    key={attraction}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-display font-medium text-slate-200">
                      {attraction}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FOOD GUIDE */}
          {activeTab === "food" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                Must-Try Local Cuisines & Street Flavors
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {intel.famousFoods.map((food) => (
                  <div
                    key={food}
                    className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/20 flex items-center gap-2.5"
                  >
                    <span className="text-lg">🍲</span>
                    <span className="text-xs sm:text-sm font-display font-medium text-slate-200">
                      {food}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ECO & WEATHER */}
          {activeTab === "eco" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase mb-1.5">
                  <Leaf className="w-4 h-4" /> Sustainable Travel Advisory
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {intel.ecoTip}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono uppercase mb-1.5">
                  <Sun className="w-4 h-4" /> Best Season & Weather Guidelines
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-1">
                  <strong>Best Period:</strong> {intel.bestSeason}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {intel.weatherAdvice}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: COMPANIONS & SPOTS */}
          {activeTab === "companions" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-slate-400">
                    Spots Filled: <strong>{filledCount} of {totalCompanions}</strong>
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {remainingSpots > 0 ? `${remainingSpots} spot${remainingSpots > 1 ? "s" : ""} left` : "Trip Full"}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>

              {/* Host and Approved Companions */}
              <div className="space-y-2.5">
                <p className="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Confirmed Traveling Group
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <Avatar name={hostName} size={36} radius={10} />
                  <div className="flex-1">
                    <p className="font-display font-bold text-xs text-slate-200">{hostName}</p>
                    <p className="font-mono text-[11px] text-amber-400">👑 Host & Organizer</p>
                  </div>
                </div>

                {(trip.approvedUsers || []).map((uid, index) => (
                  <div
                    key={uid}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800"
                  >
                    <Avatar name={`Traveler ${index + 1}`} size={36} radius={10} />
                    <div className="flex-1">
                      <p className="font-display font-bold text-xs text-slate-200">
                        Confirmed Companion #{index + 1}
                      </p>
                      <p className="font-mono text-[11px] text-emerald-400">✓ Verified Companion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            {remainingSpots > 0 ? `✨ ${remainingSpots} spots remaining for this adventure` : "🔒 Trip capacity reached"}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1 sm:flex-initial text-xs py-2.5 px-5"
            >
              Close
            </button>

            {/* Request to Join / Status buttons */}
            {trip.userId === currentUserId ? (
              <span className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-display text-xs font-bold">
                👑 Your Trip
              </span>
            ) : alreadyApproved ? (
              <span className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-display text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> You're Confirmed
              </span>
            ) : alreadyRequested || requestSent ? (
              <span className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-display text-xs font-bold">
                ⏳ Request Pending
              </span>
            ) : remainingSpots <= 0 ? (
              <button disabled className="btn-primary opacity-50 cursor-not-allowed text-xs py-2.5 px-6">
                Trip Full
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoinClick}
                className="btn-primary flex-1 sm:flex-initial text-xs py-2.5 px-6 font-bold shadow-lg shadow-cyan-500/25"
              >
                Request to Join Trip ✈
              </button>
            )}
          </div>
        </div>

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
      </div>
    </div>
  )
}
