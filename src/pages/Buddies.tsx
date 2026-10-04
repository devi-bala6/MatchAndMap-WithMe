import { useState, useEffect } from "react"
import type { MatchProfile, User, View } from "../types"
import Avatar from "../components/Avatar"
import { apiRequest } from "../lib/api"
import {
  Check,
  Clock,
  MessageSquare,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react"

interface BuddiesProps {
  user?: User
  onNav?: (view: View) => void
}

interface ConnectionRecord {
  _id?: string
  id?: string
  from: any
  toUserId: string
  status: "pending" | "accepted" | "rejected" | string
}

type ConnectionState = "none" | "pending_outgoing" | "pending_incoming" | "connected"

function getConnectionState(
  userId: string,
  currentUserId: string,
  connections: ConnectionRecord[],
): { state: ConnectionState record?: ConnectionRecord } {
  for (const c of connections) {
    const fromId = typeof c.from === "object" ? c.from._id || c.from.id : c.from
    const toId = c.toUserId

    if (c.status === "accepted") {
      if (
        (fromId === currentUserId && toId === userId) ||
        (fromId === userId && toId === currentUserId)
      ) {
        return { state: "connected", record: c }
      }
    } else if (c.status === "pending") {
      if (fromId === currentUserId && toId === userId) {
        return { state: "pending_outgoing", record: c }
      }
      if (fromId === userId && toId === currentUserId) {
        return { state: "pending_incoming", record: c }
      }
    }
  }
  return { state: "none" }
}

function UserDetailModal({
  match,
  connectionState,
  onClose,
  onConnect,
  onAccept,
  onDecline,
  onChat,
}: {
  match: MatchProfile
  connectionState: ConnectionState
  onClose: () => void
  onConnect: () => void
  onAccept: () => void
  onDecline: () => void
  onChat?: () => void
}) {
  const u = match.user

  return (
    <div
      className="modal-overlay p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal w-full max-w-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="mb-4 font-mono text-xs hover:text-white transition-colors"
          style={{ color: "#94a3b8" }}
        >
          ← Back
        </button>

        {/* Profile header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative flex-shrink-0">
            <Avatar name={u.name} size={90} radius={16} />
            {u.verified && (
              <span
                className="absolute -bottom-1 -right-1 flex items-center justify-center font-mono text-xs"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#0ea5e9",
                  color: "#080d1a",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2
                className="font-display font-bold text-2xl"
                style={{ color: "#e2e8f0" }}
              >
                {u.name}
              </h2>
              <div
                className="font-mono text-sm font-bold px-3 py-1 rounded-full"
                style={{
                  background:
                    match.compatibility >= 90
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(14,165,233,0.15)",
                  color: match.compatibility >= 90 ? "#4ade80" : "#38bdf8",
                }}
              >
                {match.compatibility}% match
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="font-mono text-xs" style={{ color: "#475569" }}>
                {u.age} · {u.nationality} · {u.gender} · ★ {u.rating}
              </p>
              {u.verified && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
              {u.bio}
            </p>
          </div>
        </div>

        {/* Compatibility breakdown */}
        <div
          className="p-4 rounded-xl mb-5"
          style={{
            background: "rgba(14,165,233,0.05)",
            border: "1px solid rgba(14,165,233,0.15)",
          }}
        >
          <p
            className="font-mono text-xs mb-3 font-semibold"
            style={{ color: "#0ea5e9" }}
          >
            COMPATIBILITY BREAKDOWN
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span
                  className="font-display text-xs font-medium"
                  style={{ color: "#94a3b8" }}
                >
                  Overall Compatibility
                </span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: "#0ea5e9" }}
                >
                  {match.compatibility}%
                </span>
              </div>
              <div
                className="h-2 rounded-full"
                style={{ background: "#1a2845" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${match.compatibility}%`,
                    background: "linear-gradient(90deg, #0ea5e9, #22c55e)",
                  }}
                />
              </div>
            </div>
            <div>
              <p
                className="font-mono text-xs mb-1.5"
                style={{ color: "#475569" }}
              >
                SHARED INTERESTS
              </p>
              <div className="flex flex-wrap gap-1.5">
                {match.sharedInterests.map((i) => (
                  <span key={i} className="badge badge-cyan">
                    {i}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p
                className="font-mono text-xs mb-1.5"
                style={{ color: "#475569" }}
              >
                SHARED HOBBIES
              </p>
              <div className="flex flex-wrap gap-1.5">
                {match.sharedHobbies.map((h) => (
                  <span key={h} className="badge badge-purple">
                    {h}
                  </span>
                ))}
              </div>
            </div>
            {match.matchReasons && match.matchReasons.length > 0 && (
              <div>
                <p
                  className="font-mono text-xs mb-1.5"
                  style={{ color: "#0ea5e9" }}
                >
                  WHY YOU MATCH
                </p>
                <ul className="space-y-1 text-xs text-slate-300">
                  {match.matchReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Matched trip */}
        {match.destination && (
          <div
            className="p-4 rounded-xl mb-5"
            style={{
              background: "rgba(245,158,11,0.05)",
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <p className="font-mono text-xs mb-2" style={{ color: "#f59e0b" }}>
              MATCHING TRIP
            </p>
            <p className="font-display font-bold" style={{ color: "#e2e8f0" }}>
              {match.destination}
            </p>
            <p className="font-mono text-xs" style={{ color: "#64748b" }}>
              {match.dates}
            </p>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "BUDGET TYPE", value: u.budget },
            { label: "TRAVEL STYLE", value: u.travelStyle },
            { label: "LANGUAGES", value: u.languages.slice(0, 2).join(", ") },
            { label: "TRIPS COMPLETED", value: `${u.tripsCount} trips` },
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

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">
            Close
          </button>
          {connectionState === "connected" && (
            <button
              onClick={() => {
                onClose()
                if (onChat) onChat()
              }}
              className="btn-primary flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 font-semibold"
            >
              <MessageSquare size={16} /> Open Chat
            </button>
          )}
          {connectionState === "pending_outgoing" && (
            <button
              disabled
              className="flex-1 py-2.5 px-4 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 bg-slate-800/80 text-amber-300 border border-amber-500/30 cursor-not-allowed"
            >
              <Clock size={16} /> Request Pending
            </button>
          )}
          {connectionState === "pending_incoming" && (
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => {
                  onDecline()
                  onClose()
                }}
                className="btn-outline py-2.5 px-3 flex items-center justify-center gap-1 text-xs text-rose-400 border-rose-500/30"
              >
                <X size={14} /> Decline
              </button>
              <button
                onClick={() => {
                  onAccept()
                  onClose()
                }}
                className="btn-primary flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold"
              >
                <Check size={14} /> Accept Request
              </button>
            </div>
          )}
          {connectionState === "none" && (
            <button
              onClick={() => {
                onConnect()
                onClose()
              }}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <UserPlus size={16} /> Send Connect Request
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchCard({
  match,
  connectionState,
  onView,
  onConnect,
  onAccept,
  onChat,
}: {
  match: MatchProfile
  connectionState: ConnectionState
  onView: (m: MatchProfile) => void
  onConnect: (userId: string) => void
  onAccept: (userId: string) => void
  onChat?: () => void
}) {
  const u = match.user

  return (
    <div
      className="match-card stat-card cursor-pointer group flex flex-col justify-between"
      style={{ padding: 0, overflow: "hidden" }}
      onClick={() => onView(match)}
    >
      {/* Compatibility bar at top */}
      <div>
        <div
          className="h-1.5"
          style={{
            background:
              match.compatibility >= 90
                ? "linear-gradient(90deg, #22c55e, #4ade80)"
                : match.compatibility >= 80
                  ? "linear-gradient(90deg, #0ea5e9, #38bdf8)"
                  : "linear-gradient(90deg, #f59e0b, #fbbf24)",
          }}
        />

        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <Avatar name={u.name} size={60} radius={12} />
              {u.verified && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center font-mono"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#0ea5e9",
                    color: "#080d1a",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3
                  className="font-display font-bold text-base truncate group-hover:text-cyan-400 transition-colors"
                  style={{ color: "#e2e8f0" }}
                >
                  {u.name}
                </h3>
                <span
                  className="font-mono text-xs font-bold ml-2 flex-shrink-0 px-2 py-0.5 rounded"
                  style={{
                    background:
                      match.compatibility >= 90
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(14,165,233,0.15)",
                    color: match.compatibility >= 90 ? "#4ade80" : "#38bdf8",
                  }}
                >
                  {match.compatibility}%
                </span>
              </div>
              <p className="font-mono text-xs" style={{ color: "#475569" }}>
                {u.age} · {u.nationality} · ★ {u.rating}
              </p>
              <p className="font-mono text-xs" style={{ color: "#64748b" }}>
                {u.travelStyle} · {u.budget}
              </p>
            </div>
          </div>

          <p
            className="text-xs leading-relaxed mb-4 line-clamp-2"
            style={{ color: "#64748b" }}
          >
            {u.bio}
          </p>

          {/* Shared interests */}
          <div className="mb-3">
            <p
              className="font-mono text-xs mb-1.5"
              style={{ color: "#475569" }}
            >
              SHARED INTERESTS
            </p>
            <div className="flex flex-wrap gap-1">
              {match.sharedInterests.slice(0, 3).map((i) => (
                <span key={i} className="badge badge-cyan">
                  {i}
                </span>
              ))}
              {match.sharedInterests.length > 3 && (
                <span className="badge badge-gray">
                  +{match.sharedInterests.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Destination */}
          {match.destination && (
            <div
              className="p-2.5 rounded-lg mb-4"
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.15)",
              }}
            >
              <p className="font-mono text-xs" style={{ color: "#f59e0b" }}>
                📍 {match.destination}
              </p>
              <p className="font-mono text-xs" style={{ color: "#64748b" }}>
                {match.dates}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Button Footer */}
      <div className="px-5 pb-5 pt-0" onClick={(e) => e.stopPropagation()}>
        {connectionState === "connected" && (
          <button
            onClick={() => {
              if (onChat) onChat()
              else onView(match)
            }}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs transition-all flex items-center justify-center gap-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
          >
            <MessageSquare size={14} /> ✓ Connected · Chat Now
          </button>
        )}

        {connectionState === "pending_outgoing" && (
          <button
            disabled
            className="w-full py-2.5 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 bg-slate-800 text-amber-300 border border-amber-500/20 cursor-default"
          >
            <Clock size={14} /> ⏳ Request Sent (Pending)
          </button>
        )}

        {connectionState === "pending_incoming" && (
          <button
            onClick={() => onAccept(u.id)}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Check size={14} /> Accept Connection Request
          </button>
        )}

        {connectionState === "none" && (
          <button
            onClick={() => onConnect(u.id)}
            className="w-full py-2.5 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-950/30"
          >
            <UserPlus size={14} /> Connect
          </button>
        )}
      </div>
    </div>
  )
}

export default function Buddies({ user, onNav }: BuddiesProps) {
  const currentUserId = user?.id || ""
  const [profiles, setProfiles] = useState<MatchProfile[]>([])
  const [selected, setSelected] = useState<MatchProfile | null>(null)
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    budget: "all",
    travelStyle: "all",
    minMatch: 0,
  })

  // Load real registered buddies and connections from backend API
  useEffect(() => {
    let isMounted = true
    async function fetchBuddiesAndConnections() {
      try {
        setLoading(true)
        const [liveMatches, liveConnections] = await Promise.all([
          apiRequest<MatchProfile[]>("/buddies").catch(() => []),
          apiRequest<ConnectionRecord[]>("/connections").catch(() => []),
        ])

        if (isMounted) {
          if (Array.isArray(liveMatches)) {
            setProfiles(liveMatches)
          } else {
            setProfiles([])
          }

          if (Array.isArray(liveConnections)) {
            setConnections(liveConnections)
          }
        }
      } catch {
        if (isMounted) {
          setProfiles([])
          setConnections([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchBuddiesAndConnections()
    return () => {
      isMounted = false
    }
  }, [user?.id, user?.email])

  async function handleSendRequest(targetUserId: string) {
    // Optimistic state update
    const optimisticRecord: ConnectionRecord = {
      _id: `temp_${Date.now()}`,
      from: currentUserId,
      toUserId: targetUserId,
      status: "pending",
    }
    setConnections((prev) => [
      ...prev.filter((c) => c.toUserId !== targetUserId),
      optimisticRecord,
    ])
    setActionNotice("Connection request sent! Waiting for acceptance.")
    setTimeout(() => setActionNotice(null), 3500)

    try {
      const created = await apiRequest<ConnectionRecord>("/connections", {
        method: "POST",
        body: JSON.stringify({ toUserId: targetUserId }),
      })
      if (created) {
        setConnections((prev) =>
          prev.map((c) => (c._id === optimisticRecord._id ? created : c)),
        )
      }
    } catch (err) {
      console.warn("Connection request failed to persist to server:", err)
    }
  }

  async function handleAcceptRequest(targetUserIdOrConnId: string) {
    // Find matching connection record
    const record = connections.find(
      (c) =>
        c._id === targetUserIdOrConnId ||
        c.id === targetUserIdOrConnId ||
        ((typeof c.from === "object" ? c.from._id || c.from.id : c.from) ===
          targetUserIdOrConnId &&
          c.toUserId === currentUserId),
    )

    const connId = record?._id || record?.id || targetUserIdOrConnId

    // Optimistic update
    setConnections((prev) =>
      prev.map((c) => {
        const fromId =
          typeof c.from === "object" ? c.from._id || c.from.id : c.from
        if (
          c._id === connId ||
          c.id === connId ||
          (fromId === targetUserIdOrConnId && c.toUserId === currentUserId)
        ) {
          return { ...c, status: "accepted" }
        }
        return c
      }),
    )

    setActionNotice("Connection accepted! Chat is now unlocked.")
    setTimeout(() => setActionNotice(null), 4000)

    try {
      await apiRequest(`/connections/${connId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "accepted" }),
      })
    } catch (err) {
      console.warn("Failed to update connection status on server:", err)
    }
  }

  async function handleDeclineRequest(targetUserIdOrConnId: string) {
    const record = connections.find(
      (c) =>
        c._id === targetUserIdOrConnId ||
        c.id === targetUserIdOrConnId ||
        ((typeof c.from === "object" ? c.from._id || c.from.id : c.from) ===
          targetUserIdOrConnId &&
          c.toUserId === currentUserId),
    )
    const connId = record?._id || record?.id || targetUserIdOrConnId

    setConnections((prev) =>
      prev.map((c) => {
        const fromId =
          typeof c.from === "object" ? c.from._id || c.from.id : c.from
        if (
          c._id === connId ||
          c.id === connId ||
          (fromId === targetUserIdOrConnId && c.toUserId === currentUserId)
        ) {
          return { ...c, status: "rejected" }
        }
        return c
      }),
    )

    try {
      await apiRequest(`/connections/${connId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "rejected" }),
      })
    } catch (err) {
      console.warn("Failed to decline connection:", err)
    }
  }

  const incomingRequests = connections.filter((c) => {
    const isToMe = c.toUserId === currentUserId
    return isToMe && c.status === "pending"
  })

  const filtered = profiles.filter((m) => {
    const budgetMatch =
      filters.budget === "all" || m.user.budget === filters.budget
    const styleMatch =
      filters.travelStyle === "all" ||
      m.user.travelStyle === filters.travelStyle
    const matchScore = m.compatibility >= filters.minMatch
    return budgetMatch && styleMatch && matchScore
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Action toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-display font-medium flex items-center gap-2 animate-fade-in shadow-xl">
          <UserCheck size={16} className="text-cyan-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <p
          className="font-display font-bold text-sm uppercase mb-1 sm:mb-2"
          style={{ color: "#22c55e" }}
        >
          AI-POWERED MATCHING
        </p>
        <h2
          className="font-display font-black text-2xl sm:text-3xl"
          style={{ color: "#e2e8f0" }}
        >
          Find Travel Buddies
        </h2>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#64748b" }}>
          {filtered.length} travelers matched to your profile (
          {user?.name || "Traveler"}) · connect to unlock direct chat
        </p>
      </div>

      {/* Incoming Connection Requests Banner */}
      {incomingRequests.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-display font-bold text-sm sm:text-base text-amber-300">
                Incoming Connection Requests ({incomingRequests.length})
              </h3>
            </div>
            <span className="font-mono text-xs text-amber-400/80">
              Action required to chat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {incomingRequests.map((req) => {
              const sender = typeof req.from === "object" ? req.from : null
              const senderId = sender?._id || sender?.id || req.from
              const senderName = sender?.name || "Fellow Traveler"
              const senderEmail = sender?.email || ""
              const matchProfile = profiles.find((p) => p.user.id === senderId)

              return (
                <div
                  key={req._id || req.id || senderId}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={senderName} size={42} radius={10} />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-slate-200 truncate">
                        {senderName}
                      </p>
                      <p className="font-mono text-xs text-slate-400 truncate">
                        {matchProfile
                          ? `${matchProfile.compatibility}% Match`
                          : senderEmail || "Wants to connect"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleDeclineRequest(req._id || senderId)}
                      title="Decline"
                      className="p-2 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 transition-all text-xs"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req._id || senderId)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/30"
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

      {/* Filters */}
      <div
        className="p-4 sm:p-5 rounded-2xl flex flex-wrap gap-4 sm:gap-5 items-end"
        style={{ background: "#0d1525", border: "1px solid #1a2845" }}
      >
        <div>
          <label
            className="block font-mono text-xs mb-2"
            style={{ color: "#475569" }}
          >
            BUDGET TYPE
          </label>
          <div className="flex gap-2">
            {["all", "budget", "mid-range", "luxury"].map((b) => (
              <button
                key={b}
                onClick={() => setFilters((f) => ({ ...f, budget: b }))}
                className="px-3 py-1.5 rounded-lg font-display font-semibold text-xs transition-all"
                style={
                  filters.budget === b
                    ? { background: "#0ea5e9", color: "#080d1a" }
                    : {
                        background: "#141e35",
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

        <div>
          <label
            className="block font-mono text-xs mb-2"
            style={{ color: "#475569" }}
          >
            TRAVEL STYLE
          </label>
          <div className="flex gap-2">
            {["all", "Adventure", "Cultural"].map((s) => (
              <button
                key={s}
                onClick={() => setFilters((f) => ({ ...f, travelStyle: s }))}
                className="px-3 py-1.5 rounded-lg font-display font-semibold text-xs transition-all"
                style={
                  filters.travelStyle === s
                    ? { background: "#22c55e", color: "#080d1a" }
                    : {
                        background: "#141e35",
                        border: "1px solid #1a2845",
                        color: "#64748b",
                      }
                }
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="block font-mono text-xs mb-2"
            style={{ color: "#475569" }}
          >
            MIN COMPATIBILITY: {filters.minMatch}%
          </label>
          <input
            type="range"
            min={0}
            max={90}
            step={10}
            value={filters.minMatch}
            onChange={(e) =>
              setFilters((f) => ({ ...f, minMatch: Number(e.target.value) }))
            }
            style={{ width: 160, accentColor: "#0ea5e9" }}
          />
        </div>

        <div className="ml-auto">
          <p className="font-mono text-xs" style={{ color: "#475569" }}>
            {filtered.length} match{filtered.length !== 1 ? "es" : ""} found
          </p>
        </div>
      </div>

      {/* Match grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((m) => {
          const connInfo = getConnectionState(
            m.user.id,
            currentUserId,
            connections,
          )
          return (
            <MatchCard
              key={m.user.id}
              match={m}
              connectionState={connInfo.state}
              onView={setSelected}
              onConnect={handleSendRequest}
              onAccept={handleAcceptRequest}
              onChat={() => onNav && onNav("chat")}
            />
          )
        })}
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display font-medium text-sm text-slate-400">
            Finding compatible travel buddies...
          </p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 px-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 max-w-md mx-auto my-6">
          <div className="text-4xl mb-3">🧭</div>
          <p
            className="font-display font-bold text-base mb-1"
            style={{ color: "#e2e8f0" }}
          >
            {profiles.length === 0
              ? "No other registered travelers yet"
              : "No matches for current filters"}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
            {profiles.length === 0
              ? "When another traveler creates an account, they will automatically appear here with full compatibility matching."
              : "Try widening your budget or travel style filters above."}
          </p>
        </div>
      )}

      {selected && (
        <UserDetailModal
          match={selected}
          connectionState={
            getConnectionState(selected.user.id, currentUserId, connections)
              .state
          }
          onClose={() => setSelected(null)}
          onConnect={() => handleSendRequest(selected.user.id)}
          onAccept={() => handleAcceptRequest(selected.user.id)}
          onDecline={() => handleDeclineRequest(selected.user.id)}
          onChat={() => onNav && onNav("chat")}
        />
      )}
    </div>
  )
}
