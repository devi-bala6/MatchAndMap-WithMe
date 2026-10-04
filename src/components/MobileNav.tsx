import { useState } from "react"
import {
  Compass,
  MapPin,
  Users,
  MessageSquare,
  ShieldAlert,
  User,
  Plane,
  Grid,
  Map,
  Sparkles,
  Calendar,
  Star,
  CloudSun,
  Leaf,
  X,
  Lock,
} from "lucide-react"
import type { View } from "../types"

interface MobileNavProps {
  current: View
  onNav: (v: View) => void
  unreadCount?: number
  role?: string
}

export default function MobileNav({
  current,
  onNav,
  unreadCount = 0,
  role = "user",
}: MobileNavProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const primaryItems = [
    {
      view: "dashboard" as View,
      icon: <Compass className="w-5 h-5" />,
      label: "Home",
    },
    {
      view: "my-trips" as View,
      icon: <Plane className="w-5 h-5" />,
      label: "Trips",
    },
    {
      view: "buddies" as View,
      icon: <Users className="w-5 h-5" />,
      label: "Buddies",
    },
    {
      view: "chat" as View,
      icon: (
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </div>
      ),
      label: "Chat",
    },
    {
      view: "more" as const,
      icon: <Grid className="w-5 h-5" />,
      label: "All Apps",
    },
  ]

  const allFeatures: {
    view: View
    icon: React.ReactNode
    title: string
    desc: string
    color: string
    badge?: string
  }[] = [
    {
      view: "map",
      icon: <Map className="w-5 h-5" />,
      title: "Live GPS Map",
      desc: "Real-time travel tracking & safety zones",
      color: "#0ea5e9",
      badge: "LIVE",
    },
    {
      view: "recommendations",
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI Recommendations",
      desc: "Curated Indian destinations & hidden gems",
      color: "#a855f7",
      badge: "AI",
    },
    {
      view: "itinerary",
      icon: <Calendar className="w-5 h-5" />,
      title: "Itinerary Planner",
      desc: "Day-by-day smart schedule & food spots",
      color: "#3b82f6",
    },
    {
      view: "browse-trips",
      icon: <MapPin className="w-5 h-5" />,
      title: "Browse Trips",
      desc: "Discover & join group community trips",
      color: "#10b981",
    },
    {
      view: "reviews",
      icon: <Star className="w-5 h-5" />,
      title: "Reviews & Ratings",
      desc: "Community feedback & traveller trust",
      color: "#f59e0b",
    },
    {
      view: "weather",
      icon: <CloudSun className="w-5 h-5" />,
      title: "Live Weather",
      desc: "Destination forecast & mountain alerts",
      color: "#06b6d4",
    },
    {
      view: "sos",
      icon: <ShieldAlert className="w-5 h-5" />,
      title: "Emergency SOS",
      desc: "1-tap distress signal & safe hotspots",
      color: "#ef4444",
      badge: "SAFETY",
    },
    {
      view: "profile",
      icon: <User className="w-5 h-5" />,
      title: "Profile & Beneficiary",
      desc: "Personal settings & emergency contact",
      color: "#ec4899",
    },
  ]

  if (role === "admin") {
    allFeatures.unshift({
      view: "admin",
      icon: <Lock className="w-5 h-5" />,
      title: "Admin Panel",
      desc: "Platform moderation & analytics",
      color: "#6366f1",
      badge: "ADMIN",
    })
  }

  function handleSelect(v: View) {
    onNav(v)
    setShowMoreMenu(false)
  }

  const isMoreActive =
    current === "map" ||
    current === "recommendations" ||
    current === "itinerary" ||
    current === "reviews" ||
    current === "weather" ||
    current === "sos" ||
    current === "profile" ||
    current === "admin"

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 px-3 py-2 flex items-center justify-between shadow-2xl safe-area-inset-bottom"
        aria-label="Mobile Navigation"
      >
        {primaryItems.map((item) => {
          const isItemActive =
            item.view === "more" ? isMoreActive || showMoreMenu : current === item.view

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.view === "more") {
                  setShowMoreMenu((prev) => !prev)
                } else {
                  handleSelect(item.view)
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isItemActive
                  ? "text-cyan-400 font-bold bg-cyan-500/10 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-center">{item.icon}</div>
              <span className="text-[10px] mt-1 font-display tracking-tight leading-none font-semibold">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* All Features Slide-Up Sheet */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowMoreMenu(false)}
          />

          <div className="relative z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Sheet Handle & Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">
                    All Match & Map Features
                  </h3>
                  <p className="font-mono text-[11px] text-slate-400">
                    Select any tool or feature below
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Features List */}
            <div className="p-4 overflow-y-auto max-h-[65vh] grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-20">
              {allFeatures.map((item) => {
                const isActive = current === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => handleSelect(item.view)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all ${
                      isActive
                        ? "bg-slate-800/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30"
                        : "bg-slate-950/60 border-slate-800 hover:bg-slate-800/50"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${item.color}18`,
                        color: item.color,
                        border: `1px solid ${item.color}35`,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-xs text-slate-100 truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                            style={{
                              background: `${item.color}22`,
                              color: item.color,
                              border: `1px solid ${item.color}40`,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

