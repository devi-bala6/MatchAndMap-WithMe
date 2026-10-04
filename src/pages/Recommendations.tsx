import { useEffect, useState } from "react"
import {
  recommendations,
  matchProfiles,
  trendingPlacesByHashtag,
} from "../data/mockData"
import type { Recommendation, User } from "../types"
import Avatar from "../components/Avatar"
import PlaceImage from "../components/PlaceImage"

const seasons = [
  {
    label: "Oct-Feb (Winter)",
    icon: "❄️",
    color: "#38bdf8",
    desc: "Hill stations, Rajasthan, Kerala",
  },
  {
    label: "Mar-Jun (Summer)",
    icon: "☀️",
    color: "#f59e0b",
    desc: "Ladakh, Spiti, high Himalayas open",
  },
  {
    label: "Jul-Sep (Monsoon)",
    icon: "🌧️",
    color: "#22c55e",
    desc: "Kerala, Meghalaya, Western Ghats",
  },
]

const trendingHashtags = [
  "#SpendInIndia",
  "#DiscoverIndia",
  "#EcoTravel",
  "#TrainJourneyIndia",
  "#HimalayanTrekker",
  "#SouthIndiaCircuit",
  "#IncredibleIndia",
  "#OffbeatIndia",
]

function RecommendationCard({
  rec,
  onSelect,
}: {
  rec: Recommendation
  onSelect: (r: Recommendation) => void
}) {
  return (
    <button
      type="button"
      className="trip-card w-full p-0 text-left font-display focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
      onClick={() => onSelect(rec)}
      aria-label={`View details for ${rec.title}`}
    >
      <div className="relative aspect-video bg-slate-950">
        <PlaceImage
          destination={rec.title}
          state={rec.state}
          alt={rec.title}
          className="w-full h-full object-cover"
          fallback={rec.image}
        />
        <div className="absolute top-3 right-3 flex gap-1.5">
          {rec.ecoFriendly && (
            <span
              className="inline-flex items-center rounded-full px-3 py-1.5 font-display text-xs font-bold shadow-lg"
              style={{
                background: "rgba(220,252,231,0.97)",
                color: "#166534",
                border: "1px solid rgba(255,255,255,0.8)",
              }}
            >
              🌿 Eco-friendly
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3
              className="font-display font-bold text-xl leading-snug"
              style={{ color: "#f8fafc" }}
            >
              {rec.title}
            </h3>
            <p
              className="mt-1 font-display font-medium text-sm"
              style={{ color: "#cbd5e1" }}
            >
              {rec.state}, India
            </p>
          </div>
          <span
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-display text-sm font-bold"
            style={{ background: "rgba(245,158,11,0.13)", color: "#fbbf24" }}
          >
            ★ {rec.rating}
          </span>
        </div>
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ color: "#cbd5e1" }}
        >
          {rec.subtitle}
        </p>
        <div
          className="flex items-start gap-2.5 p-3.5 rounded-lg mb-4"
          style={{
            background: "rgba(14,165,233,0.09)",
            border: "1px solid rgba(14,165,233,0.22)",
          }}
        >
          <span style={{ color: "#38bdf8", flexShrink: 0, marginTop: 1 }}>
            ⬡
          </span>
          <p className="text-sm leading-relaxed" style={{ color: "#dbeafe" }}>
            {rec.matchReason}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span
            className="font-display text-xs font-semibold uppercase"
            style={{ color: "#94a3b8" }}
          >
            Estimated budget
          </span>
          <span
            className="font-display text-sm font-bold text-right"
            style={{ color: "#fbbf24" }}
          >
            {rec.budgetRange}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {rec.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full px-2.5 py-1 font-display text-xs font-semibold"
              style={{
                background: "rgba(14,165,233,0.12)",
                color: "#7dd3fc",
                border: "1px solid rgba(56,189,248,0.2)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

function DestinationModal({
  rec,
  onClose,
  onPlan,
}: {
  rec: Recommendation
  onClose: () => void
  onPlan: () => void
}) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 580 }}>
        <button
          onClick={onClose}
          className="mb-4 font-mono text-xs"
          style={{ color: "#475569" }}
        >
          ← Back
        </button>
        <div
          className="relative rounded-xl overflow-hidden mb-5"
          style={{ height: 200 }}
        >
          <PlaceImage
            destination={rec.title}
            state={rec.state}
            alt={rec.title}
            className="w-full h-full object-cover"
            style={{ opacity: 0.75 }}
            fallback={rec.image}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(8,13,26,0.95) 0%, transparent 50%)",
            }}
          />
          <div className="absolute bottom-4 left-4">
            <h2
              className="font-display font-black text-3xl"
              style={{ color: "#e2e8f0" }}
            >
              {rec.title}
            </h2>
            <p className="font-mono text-sm" style={{ color: "#64748b" }}>
              {rec.state}
            </p>
          </div>
          {rec.ecoFriendly && (
            <div className="absolute top-3 right-3 badge badge-green">
              🌿 Eco-Friendly Destination
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "BUDGET RANGE", value: rec.budgetRange },
            { label: "RATING", value: `★ ${rec.rating}` },
            { label: "STATE", value: rec.state },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-xl"
              style={{ background: "#141e35", border: "1px solid #1a2845" }}
            >
              <p
                className="font-mono text-xs mb-0.5"
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

        <div className="mb-5">
          <p className="font-mono text-xs mb-2" style={{ color: "#0ea5e9" }}>
            WHY WE RECOMMEND THIS
          </p>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            {rec.matchReason}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {rec.tags.map((t) => (
            <span key={t} className="badge badge-cyan">
              {t}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">
            Close
          </button>
          <button onClick={onPlan} className="btn-primary flex-1">
            Plan This Trip
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Recommendations({
  user,
  onPlanTrip,
}: {
  user?: User | null
  onPlanTrip: () => void
}) {
  const [selected, setSelected] = useState<Recommendation | null>(null)
  const [filterEco, setFilterEco] = useState(false)
  const [filterBudget, setFilterBudget] = useState("all")
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null)

  const userInterests =
    user?.interests && user.interests.length > 0
      ? user.interests.slice(0, 3).join(", ")
      : "Adventure, Nature, Culture"

  const filtered = recommendations.filter((r) => {
    if (filterEco && !r.ecoFriendly) return false
    if (
      filterBudget === "budget" &&
      !r.budgetRange.includes("8,000") &&
      !r.budgetRange.includes("10,000") &&
      !r.budgetRange.includes("12,000") &&
      !r.budgetRange.includes("15,000") &&
      !r.budgetRange.includes("18,000")
    )
      return false
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <p
          className="font-display font-bold text-sm uppercase mb-1 sm:mb-2"
          style={{ color: "#a855f7" }}
        >
          PERSONALISED FOR YOU
        </p>
        <h2
          className="font-display font-black text-2xl sm:text-3xl"
          style={{ color: "#e2e8f0" }}
        >
          Recommendations
        </h2>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#64748b" }}>
          Curated for Indian travellers · Based on your interests in{" "}
          {userInterests}
        </p>
      </div>

      {/* Season guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {seasons.map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl"
            style={{ background: "#0d1525", border: `1px solid ${s.color}25` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{s.icon}</span>
              <p
                className="font-display font-semibold text-sm"
                style={{ color: s.color }}
              >
                {s.label}
              </p>
            </div>
            <p className="text-xs" style={{ color: "#64748b" }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Trending companion matches */}
      <div
        className="p-5 rounded-2xl mb-8"
        style={{ background: "#0d1525", border: "1px solid #1a2845" }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-xs" style={{ color: "#0ea5e9" }}>
            COMPANION RECOMMENDATIONS
          </p>
          <span className="badge badge-cyan">Based on your matches</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {matchProfiles.slice(0, 4).map((m) => (
            <div
              key={m.user.id}
              className="flex-shrink-0 flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "#141e35",
                border: "1px solid #1a2845",
                width: 240,
              }}
            >
              <Avatar name={m.user.name} size={44} />
              <div className="min-w-0">
                <p
                  className="font-display font-semibold text-sm truncate"
                  style={{ color: "#e2e8f0" }}
                >
                  {m.user.name}
                </p>
                <p
                  className="font-mono text-xs truncate"
                  style={{ color: "#475569" }}
                >
                  {m.user.city}, {m.user.state}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="font-mono text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background:
                        m.compatibility >= 90
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(14,165,233,0.15)",
                      color: m.compatibility >= 90 ? "#4ade80" : "#38bdf8",
                    }}
                  >
                    {m.compatibility}% match
                  </span>
                  {m.user.ecoScore >= 85 && (
                    <span className="badge badge-green" style={{ fontSize: 9 }}>
                      🌿
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
        <p className="font-mono text-xs" style={{ color: "#475569" }}>
          FILTER:
        </p>
        <button
          onClick={() => setFilterEco(!filterEco)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-display font-semibold text-sm transition-all"
          style={
            filterEco
              ? {
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "#4ade80",
                }
              : {
                  background: "#0d1525",
                  border: "1px solid #1a2845",
                  color: "#64748b",
                }
          }
        >
          🌿 Eco-Friendly Only
        </button>
        {["all", "budget", "mid-range"].map((b) => (
          <button
            key={b}
            onClick={() => setFilterBudget(b)}
            className="px-4 py-2 rounded-lg font-display font-semibold text-sm transition-all"
            style={
              filterBudget === b
                ? { background: "#0ea5e9", color: "#080d1a" }
                : {
                    background: "#0d1525",
                    border: "1px solid #1a2845",
                    color: "#64748b",
                  }
            }
          >
            {b === "all"
              ? "All Budgets"
              : b === "budget"
                ? "Budget"
                : "Mid-Range"}
          </button>
        ))}
        <span
          className="font-mono text-xs ml-auto"
          style={{ color: "#475569" }}
        >
          {filtered.length} destinations
        </span>
      </div>

      {/* Destination grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {filtered.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} onSelect={setSelected} />
        ))}
      </div>

      {/* Trending hashtags */}
      <div
        className="p-5 rounded-2xl mb-5"
        style={{ background: "#0d1525", border: "1px solid #1a2845" }}
      >
        <p className="font-mono text-xs mb-4" style={{ color: "#a855f7" }}>
          TRENDING IN INDIA
        </p>
        <div className="flex flex-wrap gap-2">
          {trendingHashtags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setActiveHashtag((current) => (current === tag ? null : tag))
              }
              aria-pressed={activeHashtag === tag}
              className="px-3 py-1.5 rounded-full font-mono text-xs transition-all"
              style={{
                background:
                  activeHashtag === tag
                    ? "rgba(168,85,247,0.28)"
                    : "rgba(168,85,247,0.1)",
                border: `1px solid ${
                  activeHashtag === tag
                    ? "rgba(192,132,252,0.8)"
                    : "rgba(168,85,247,0.2)"
                }`,
                color: activeHashtag === tag ? "#f3e8ff" : "#c084fc",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {activeHashtag && (
        <section aria-live="polite" className="mb-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3
                className="font-display font-bold text-xl"
                style={{ color: "#f8fafc" }}
              >
                More places for {activeHashtag}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
                Additional destinations not shown in the recommendations above
              </p>
            </div>
            <span
              className="font-display text-sm font-medium"
              style={{ color: "#94a3b8" }}
            >
              {(trendingPlacesByHashtag[activeHashtag] || []).length} more places
            </span>
          </div>
          <div className="grid max-w-5xl grid-cols-1 sm:grid-cols-2 gap-6 mx-auto">
            {(trendingPlacesByHashtag[activeHashtag] || []).map((rec) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                onSelect={setSelected}
              />
            ))}
          </div>
        </section>
      )}

      {selected && (
        <DestinationModal
          rec={selected}
          onClose={() => setSelected(null)}
          onPlan={() => {
            setSelected(null)
            onPlanTrip()
          }}
        />
      )}
    </div>
  )
}
