import { useEffect, useState } from "react"
import type { Review, User } from "../types"
import Avatar from "../components/Avatar"
import { apiRequest } from "../lib/api"

function mapReview(value: any): Review {
  const fromObj = typeof value.fromUser === "object" && value.fromUser !== null ? value.fromUser : null
  return {
    id: (value.id || value._id || "").toString(),
    fromUserId: fromObj?._id?.toString() || value.fromUserId || (typeof value.fromUser === "string" ? value.fromUser : ""),
    fromUserName: fromObj?.name || value.fromUserName || "Traveler",
    fromUserAvatar: fromObj?.avatar || value.fromUserAvatar || "",
    toUserId: (value.toUserId || "").toString(),
    toUserName: value.toUserName || "Travel Companion",
    tripId: (value.tripId || value.trip?._id || value.trip || "").toString(),
    tripDestination: value.tripDestination || "Recent Trip",
    rating: Number(value.rating) || 5,
    ecoRating: Number(value.ecoRating) || 4,
    tags: Array.isArray(value.tags) ? value.tags : [],
    comment: value.comment || "",
    date: value.createdAt
      ? new Date(value.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : value.date || new Date().toLocaleDateString(),
  }
}

function StarRating({
  value,
  onChange,
  size = 20,
}: {
  value: number
  onChange?: (v: number) => void
  size?: number
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            fontSize: size,
            color: star <= (hovered || value) ? "#f59e0b" : "#1a2845",
            background: "none",
            border: "none",
            cursor: onChange ? "pointer" : "default",
            padding: 0,
            lineHeight: 1,
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="stat-card" style={{ padding: 24, borderRadius: 16 }}>
      <div className="flex items-start gap-4 mb-4">
        <Avatar name={review.fromUserName} size={48} radius={12} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span
                className="font-display font-bold text-base"
                style={{ color: "#e2e8f0" }}
              >
                {review.fromUserName}
              </span>
              {review.toUserName && (
                <span className="font-mono text-xs ml-2 text-slate-400">
                  → for <span className="text-cyan-400 font-semibold">{review.toUserName}</span>
                </span>
              )}
            </div>
            <span className="font-mono text-xs" style={{ color: "#475569" }}>
              {review.date}
            </span>
          </div>
          <p className="font-mono text-xs mb-2" style={{ color: "#0ea5e9" }}>
            📍 Trip to {review.tripDestination || "Destination"}
          </p>
          <div className="flex items-center gap-4">
            <div>
              <p
                className="font-mono text-xs mb-0.5"
                style={{ color: "#475569" }}
              >
                OVERALL
              </p>
              <StarRating value={review.rating} size={16} />
            </div>
            <div>
              <p
                className="font-mono text-xs mb-0.5"
                style={{ color: "#22c55e" }}
              >
                ECO BEHAVIOUR
              </p>
              <StarRating value={review.ecoRating} size={16} />
            </div>
          </div>
        </div>
      </div>

      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "#94a3b8", fontStyle: "italic" }}
      >
        "{review.comment}"
      </p>

      <div className="flex flex-wrap gap-2">
        {review.tags.map((tag) => (
          <span key={tag} className="badge badge-cyan">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function WriteReviewModal({
  currentUser,
  onClose,
  onSubmit,
}: {
  currentUser?: User | null
  onClose: () => void
  onSubmit: (r: Partial<Review>) => void | Promise<void>
}) {
  const [selectedUser, setSelectedUser] = useState("")
  const [rating, setRating] = useState(0)
  const [ecoRating, setEcoRating] = useState(0)
  const [comment, setComment] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [companions, setCompanions] = useState<{
    id: string
    name: string
    city?: string
    state?: string
  }[]>([])

  useEffect(() => {
    async function loadCompanions() {
      try {
        const matches = await apiRequest<any[]>("/buddies").catch(() => [])
        if (Array.isArray(matches)) {
          const list = matches
            .map((m: any) => ({
              id: m.user?.id || m.user?._id || "",
              name: m.user?.name || "Traveler",
              city: m.user?.city || "",
              state: m.user?.state || "",
            }))
            .filter((u: any) => u.id && u.id !== currentUser?.id)
          setCompanions(list)
        }
      } catch {}
    }
    loadCompanions()
  }, [currentUser?.id])

  const tagOptions = [
    "Reliable",
    "Eco-conscious",
    "Responsible",
    "Helpful",
    "Punctual",
    "Great company",
    "Adventure-ready",
    "Budget-smart",
    "Culturally sensitive",
    "Knowledgeable",
  ]

  function handleSubmit() {
    if (!selectedUser || !rating || !comment) return
    const companion = companions.find((u) => u.id === selectedUser)
    onSubmit({
      fromUserId: currentUser?.id || "",
      fromUserName: currentUser?.name || "You",
      fromUserAvatar: currentUser?.avatar || "",
      toUserId: selectedUser,
      toUserName: companion?.name || "Travel Companion",
      rating,
      ecoRating: ecoRating || 3,
      tags,
      comment,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      tripDestination: "Recent trip",
    })
    onClose()
  }

  return (
    <div
      className="modal-overlay p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal w-full max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-display font-bold text-2xl"
            style={{ color: "#e2e8f0" }}
          >
            Write a Review
          </h2>
          <button onClick={onClose} style={{ color: "#475569", fontSize: 20 }}>
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Travel Companion
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a companion...</option>
              {companions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.city ? `— ${u.city}` : ""}{" "}
                  {u.state ? `, ${u.state}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p
                className="font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Overall Rating
              </p>
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>
            <div>
              <p
                className="font-display font-medium text-sm mb-2"
                style={{ color: "#22c55e" }}
              >
                Eco Behaviour
              </p>
              <StarRating value={ecoRating} onChange={setEcoRating} size={28} />
            </div>
          </div>

          <div>
            <p
              className="font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setTags((prev) =>
                      prev.includes(t)
                        ? prev.filter((x) => x !== t)
                        : [...prev, t],
                    )
                  }
                  className="badge transition-all"
                  style={
                    tags.includes(t)
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
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your experience travelling with this person..."
              style={{ resize: "vertical", minHeight: 100 }}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary flex-1"
              disabled={!selectedUser || !rating || !comment}
              style={{
                opacity: !selectedUser || !rating || !comment ? 0.5 : 1,
              }}
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Reviews({ user }: { user?: User | null }) {
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [tab, setTab] = useState<"received" | "given" | "all">("all")
  const [showWrite, setShowWrite] = useState(false)
  const currentUserId = user?.id || ""

  useEffect(() => {
    let cancelled = false

    apiRequest<any[]>("/reviews")
      .then((savedReviews) => {
        if (
          !cancelled &&
          Array.isArray(savedReviews) &&
          savedReviews.length > 0
        ) {
          setMyReviews(savedReviews.map(mapReview))
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  const avgRating = myReviews.length
    ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(
        1,
      )
    : "0.0"
  const avgEco = myReviews.length
    ? (
        myReviews.reduce((s, r) => s + r.ecoRating, 0) / myReviews.length
      ).toFixed(1)
    : "0.0"
  const visibleReviews = myReviews.filter((review) => {
    if (tab === "received") return review.toUserId === currentUserId
    if (tab === "given") return review.fromUserId === currentUserId
    return true
  })

  async function handleNewReview(data: Partial<Review>) {
    const r: Review = {
      id: `r-${Date.now()}`,
      fromUserId: data.fromUserId || user?.id || "",
      fromUserName: data.fromUserName || user?.name || "Traveler",
      fromUserAvatar: data.fromUserAvatar || user?.avatar || "",
      toUserId: data.toUserId || "",
      toUserName: data.toUserName || "Travel Companion",
      tripId: `t-${Date.now()}`,
      tripDestination: data.tripDestination || "Travel Expedition",
      rating: data.rating || 5,
      ecoRating: data.ecoRating || 4,
      tags: data.tags || [],
      comment: data.comment || "",
      date:
        data.date ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
    }
    try {
      const savedReview = await apiRequest<any>("/reviews", {
        method: "POST",
        body: JSON.stringify(r),
      })
      setMyReviews((prev) => [mapReview(savedReview), ...prev])
    } catch {
      window.alert(
        "Review could not be saved. Check that the backend is running.",
      )
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <p
            className="font-display font-bold text-sm uppercase mb-1 sm:mb-2"
            style={{ color: "#f59e0b" }}
          >
            REVIEWS & RATINGS
          </p>
          <h2
            className="font-display font-black text-2xl sm:text-3xl"
            style={{ color: "#e2e8f0" }}
          >
            Travel Reviews
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#64748b" }}>
            Honest feedback from the Match&Map community
          </p>
        </div>
        <button
          onClick={() => setShowWrite(true)}
          className="btn-primary w-full sm:w-auto"
        >
          + Write a Review
        </button>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          {
            label: "Overall Rating",
            value: avgRating,
            icon: "★",
            color: "#f59e0b",
            sub: `${myReviews.length} reviews`,
          },
          {
            label: "Eco Score",
            value: avgEco,
            icon: "🌿",
            color: "#22c55e",
            sub: "Eco behaviour avg",
          },
          {
            label: "Trips Reviewed",
            value: myReviews.length,
            icon: "✈",
            color: "#0ea5e9",
            sub: "Across India",
          },
          {
            label: "Top Tag",
            value: "Reliable",
            icon: "⬡",
            color: "#a855f7",
            sub: "Most given tag",
          },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs" style={{ color: "#475569" }}>
                {s.label}
              </span>
              <span
                className="flex items-center justify-center"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: `${s.color}1a`,
                  fontSize: 14,
                }}
              >
                {s.icon}
              </span>
            </div>
            <div
              className="font-display font-black text-3xl mb-0.5"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="font-mono text-xs" style={{ color: "#475569" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Reviewer profile summary */}
      <div
        className="flex items-center gap-5 p-5 rounded-2xl mb-8"
        style={{
          background: "linear-gradient(135deg, #0d1525, #141e35)",
          border: "1px solid #1a2845",
        }}
      >
        <Avatar name={user?.name || "Traveler"} size={72} radius={16} />
        <div className="flex-1">
          <p
            className="font-display font-bold text-xl mb-1"
            style={{ color: "#e2e8f0" }}
          >
            {user?.name || "Traveler"}
          </p>
          <div className="flex items-center gap-3 mb-2">
            <StarRating value={user?.rating ?? 5.0} size={16} />
            <span className="font-mono text-sm" style={{ color: "#f59e0b" }}>
              {user?.rating ?? 5.0}
            </span>
            <span className="font-mono text-xs" style={{ color: "#475569" }}>
              ({user?.reviewCount ?? 0} reviews)
            </span>
          </div>
          <div className="flex gap-2">
            <span className="badge badge-green">
              🌿 Eco Score: {user?.ecoScore ?? 85}/100
            </span>
            {(user?.verified ?? true) && (
              <span className="badge badge-cyan">
                ✓ Verified Indian Traveller
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs mb-1" style={{ color: "#475569" }}>
            COMMUNITY TRUST
          </p>
          <div
            className="font-display font-black text-4xl"
            style={{ color: "#0ea5e9" }}
          >
            A+
          </div>
          <p className="font-mono text-xs" style={{ color: "#475569" }}>
            Top 8% on platform
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 mb-6"
        style={{ borderBottom: "1px solid #1a2845" }}
      >
        {(["received", "given", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-3 font-display font-semibold text-sm transition-all capitalize"
            style={
              tab === t
                ? {
                    color: "#f59e0b",
                    borderBottom: "2px solid #f59e0b",
                    marginBottom: -1,
                  }
                : {
                    color: "#64748b",
                    borderBottom: "2px solid transparent",
                    marginBottom: -1,
                  }
            }
          >
            {t === "received"
              ? "Reviews I Received"
              : t === "given"
                ? "Reviews I Wrote"
                : "All Reviews"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {visibleReviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
        {visibleReviews.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⭐</div>
            <p
              className="font-display font-bold text-lg"
              style={{ color: "#e2e8f0" }}
            >
              No reviews yet
            </p>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              Complete a trip to receive your first review.
            </p>
          </div>
        )}
      </div>

      {showWrite && (
        <WriteReviewModal
          currentUser={user}
          onClose={() => setShowWrite(false)}
          onSubmit={handleNewReview}
        />
      )}
    </div>
  )
}
