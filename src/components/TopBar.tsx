import { useState, useEffect } from "react"
import type { View, User } from "../types"
import Avatar from "./Avatar"
import Logo from "./Logo"
import EcoScoreModal from "./EcoScoreModal"
import {
  Menu,
  ShieldAlert,
  Leaf,
  Bell,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  Sparkles,
} from "lucide-react"
import { apiRequest } from "../lib/api"

interface TopBarProps {
  view: View
  user?: User | null
  onNav: (v: View) => void
  onToggleMobileMenu?: () => void
}

const titles: Record<string, { title: string subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Your travel overview" },
  "my-trips": { title: "My Trips", subtitle: "Manage your planned journeys" },
  "browse-trips": {
    title: "Browse Trips",
    subtitle: "Discover trips by fellow Indian travellers",
  },
  buddies: {
    title: "Travel Buddies",
    subtitle: "Find your perfect yatra companion",
  },
  recommendations: {
    title: "Recommendations",
    subtitle: "Curated destinations just for you",
  },
  chat: { title: "Messages", subtitle: "Real-time conversations" },
  itinerary: {
    title: "Itinerary Planner",
    subtitle: "Day-by-day plans with eco tips",
  },
  reviews: {
    title: "Reviews & Ratings",
    subtitle: "Honest feedback from the community",
  },
  weather: {
    title: "Weather",
    subtitle: "Destination weather & travel advisories",
  },
  sos: {
    title: "Emergency SOS",
    subtitle: "Safety tools & emergency contacts",
  },
  profile: {
    title: "My Profile",
    subtitle: "Account settings & beneficiary info",
  },
  admin: { title: "Admin Panel", subtitle: "Match&Map platform management" },
}

interface NotificationItem {
  id: string | number
  title: string
  subtitle: string
  time: string
  read?: boolean
}

export default function TopBar({
  view,
  user,
  onNav,
  onToggleMobileMenu,
}: TopBarProps) {
  const info = titles[view] ?? { title: "Match&Map with me", subtitle: "" }
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isEcoModalOpen, setIsEcoModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    async function loadNotifications() {
      if (!user?.id) return
      try {
        const [apiNotifs, connList] = await Promise.all([
          apiRequest<any[]>("/notifications").catch(() => []),
          apiRequest<any[]>("/connections").catch(() => []),
        ])

        const formatted: NotificationItem[] = []
        const seenIds = new Set<string>()

        if (Array.isArray(apiNotifs)) {
          for (const n of apiNotifs) {
            const id = (n._id || n.id || `notif_${Math.random()}`).toString()
            seenIds.add(id)
            formatted.push({
              id,
              title: n.title || "Notification",
              subtitle: n.message || n.subtitle || "",
              time: n.createdAt
                ? new Date(n.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent",
              read: n.read || Boolean(n.readAt),
            })
          }
        }

        // Incoming connection requests (fallback if not in apiNotifs)
        if (Array.isArray(connList)) {
          const pendingIncoming = connList.filter((c: any) => {
            const toId = (c.toUserId || "").toString()
            return (toId === user.id || toId === (user as any)._id) && c.status === "pending"
          })

          for (const req of pendingIncoming) {
            const reqId = (req._id || req.id || "").toString()
            if (!seenIds.has(reqId)) {
              seenIds.add(reqId)
              const senderName =
                typeof req.from === "object" && req.from !== null
                  ? req.from.name || "A traveler"
                  : "A traveler"
              formatted.push({
                id: reqId || `req_${Date.now()}`,
                title: "New Buddy Request",
                subtitle: `${senderName} sent you a travel companion request.`,
                time: "Pending",
              })
            }
          }
        }

        setNotifications(formatted)
      } catch {}
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 8000)
    return () => clearInterval(interval)
  }, [user?.id, (user as any)?._id])

  const userName = user?.name || "Traveler"
  const ecoScore = user?.ecoScore ?? 85

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile menu toggle hamburger */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 focus:outline-none transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <button onClick={() => onNav("dashboard")} className="flex-shrink-0 md:hidden hover:opacity-85 transition-opacity" title="Back to Dashboard">
            <Logo size={32} showText={false} />
          </button>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-base sm:text-xl text-slate-100 truncate">
              {info.title}
            </h1>
            <p className="font-mono text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block">
              {info.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* SOS quick button */}
        <button
          onClick={() => onNav("sos")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs font-bold hover:bg-red-500/20 transition-all shadow-sm"
          title="Emergency SOS Hub"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden xs:inline font-bold">SOS</span>
        </button>

        {/* Eco score badge (Clickable to open breakdown & improvement hub) */}
        <button
          onClick={() => setIsEcoModalOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] sm:text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer shadow-sm"
          title="Click to view Eco Score breakdown & boost your score"
        >
          <Leaf className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Eco</span>
          <span>{user?.ecoScore ?? ecoScore}</span>
        </button>

        <EcoScoreModal
          isOpen={isEcoModalOpen}
          onClose={() => setIsEcoModalOpen(false)}
          user={user}
        />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen((open) => !open)}
            aria-label="Toggle notifications"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 sm:top-12 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 text-slate-100 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  Notifications ({notifications.length})
                </span>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-slate-400 hover:text-white text-base leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-70" />
                    <p className="text-xs text-slate-300 font-semibold">
                      All caught up!
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      No pending alerts or notifications.
                    </p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        const title = item.title.toLowerCase()
                        if (title.includes("buddy") || title.includes("connection")) {
                          onNav("buddies")
                        } else if (title.includes("trip") || title.includes("join")) {
                          onNav("my-trips")
                        } else if (title.includes("review")) {
                          onNav("reviews")
                        } else if (title.includes("message") || title.includes("chat")) {
                          onNav("chat")
                        }
                        apiRequest(`/notifications/${item.id}/read`, { method: "PUT" }).catch(() => {})
                        setIsNotificationsOpen(false)
                      }}
                      className="p-3.5 hover:bg-slate-900/60 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="text-slate-200 text-xs font-semibold">
                          {item.title}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar button */}
        <button
          onClick={() => onNav("profile")}
          className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <Avatar name={userName} size={28} />
          <span className="font-display text-xs font-semibold text-slate-200 hidden md:inline truncate max-w-[100px]">
            {userName.split(" ")[0]}
          </span>
        </button>
      </div>
    </header>
  )
}
