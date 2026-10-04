import {
  Compass,
  MapPin,
  Users,
  MessageSquare,
  ShieldAlert,
  User,
  Plane,
} from "lucide-react"
import type { View } from "../types"

interface MobileNavProps {
  current: View
  onNav: (v: View) => void
  unreadCount?: number
}

export default function MobileNav({
  current,
  onNav,
  unreadCount = 0,
}: MobileNavProps) {
  const items: { view: View icon: React.ReactNode label: string }[] = [
    {
      view: "dashboard",
      icon: <Compass className="w-5 h-5" />,
      label: "Home",
    },
    {
      view: "browse-trips",
      icon: <MapPin className="w-5 h-5" />,
      label: "Browse",
    },
    {
      view: "my-trips",
      icon: <Plane className="w-5 h-5" />,
      label: "Trips",
    },
    {
      view: "buddies",
      icon: <Users className="w-5 h-5" />,
      label: "Buddies",
    },
    {
      view: "chat",
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
      view: "sos",
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      label: "SOS",
    },
    {
      view: "profile",
      icon: <User className="w-5 h-5" />,
      label: "Profile",
    },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-inset-bottom"
      aria-label="Mobile Navigation"
    >
      {items.map(({ view, icon, label }) => {
        const isActive = current === view
        return (
          <button
            key={view}
            type="button"
            onClick={() => onNav(view)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[48px] ${
              isActive
                ? view === "sos"
                  ? "text-red-400 font-bold"
                  : "text-amber-400 font-bold bg-amber-500/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-center">{icon}</div>
            <span
              className={`text-[10px] mt-0.5 font-display tracking-tight leading-none ${
                isActive ? "font-bold" : "font-medium"
              }`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
