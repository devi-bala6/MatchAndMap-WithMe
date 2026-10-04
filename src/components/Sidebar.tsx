import type { View, User } from "../types"
import Logo from "./Logo"
import Avatar from "./Avatar"
import { X } from "lucide-react"

interface SidebarProps {
  current: View
  onNav: (v: View) => void
  user: User
  onLogout: () => void
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

const navItems = [
  { view: "dashboard" as View, icon: "◈", label: "Dashboard" },
  { view: "my-trips" as View, icon: "✈", label: "My Trips" },
  { view: "browse-trips" as View, icon: "🌍", label: "Browse Trips" },
  { view: "map" as View, icon: "🗺️", label: "Live GPS Map" },
  { view: "buddies" as View, icon: "⬡", label: "Travel Buddies" },
  { view: "recommendations" as View, icon: "💡", label: "Recommendations" },
  { view: "chat" as View, icon: "💬", label: "Messages" },
  { view: "itinerary" as View, icon: "🗓️", label: "Itinerary Planner" },
  { view: "reviews" as View, icon: "⭐", label: "Reviews & Ratings" },
  { view: "weather" as View, icon: "◎", label: "Weather" },
  { view: "sos" as View, icon: "⚡", label: "Emergency SOS" },
  { view: "profile" as View, icon: "◉", label: "My Profile" },
]

export default function Sidebar({
  current,
  onNav,
  user,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  function handleItemClick(v: View) {
    onNav(v)
    if (onCloseMobile) onCloseMobile()
  }

  const sidebarContent = (
    <aside className="flex flex-col w-64 md:w-60 min-h-screen h-full flex-shrink-0 border-r border-slate-800/80 bg-slate-950/95 md:bg-slate-950/90 backdrop-blur-2xl z-30">
      {/* Logo and close button on mobile */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80">
        <Logo size={36} showText={true} textSize="sm" />
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Avatar name={user.name} size={36} />
            {user.verified && (
              <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center font-mono text-[8px] font-bold w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950">
                ✓
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm truncate text-slate-100">
              {user.name}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="font-mono text-xs truncate text-slate-400">
                {user.city || user.state || "India"}
              </p>
              {user.ecoScore >= 85 && <span className="text-[10px]">🌿</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {(user.role === "admin"
          ? [
              { view: "admin" as View, icon: "⬛", label: "Admin Panel" },
              ...navItems,
            ]
          : navItems
        ).map(({ view, icon, label }) => {
          const isActive = current === view
          return (
            <button
              key={view}
              onClick={() => handleItemClick(view)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-display font-semibold transition-all text-left w-full min-h-10 ${
                isActive
                  ? "text-slate-50 bg-gradient-to-r from-amber-500/20 via-sky-500/10 to-transparent border-l-4 border-amber-400 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent"
              }`}
            >
              <span
                className={`flex items-center justify-center text-sm w-7 h-7 rounded-lg flex-shrink-0 ${
                  isActive
                    ? "text-amber-300 bg-amber-500/20"
                    : "text-slate-400 bg-slate-800/40"
                }`}
              >
                {icon}
              </span>
              <span className="truncate flex-1">{label}</span>
              {view === "sos" && (
                <span className="ml-auto font-mono px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  SOS
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Eco Score meter */}
      <div className="px-4 py-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-xs text-slate-400">Eco Score</span>
          <span className="font-mono text-xs font-bold text-emerald-400">
            🌿 {user.ecoScore}/100
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
            style={{ width: `${user.ecoScore}%` }}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="px-2 pb-3">
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-medium w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <span>⎋</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 animate-in slide-in-from-left duration-250 flex h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
