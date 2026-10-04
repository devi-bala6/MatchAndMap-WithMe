import { useState, useEffect, Component } from "react"
import type { ReactNode } from "react"
import type { View, User } from "./types"
import { apiRequest } from "./lib/api"

const BG: Record<string, string> = {
  landing:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80",
  login:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
  register:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
  dashboard:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
  "my-trips":
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80",
  "browse-trips":
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=80",
  buddies:
    "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1920&q=80",
  chat: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1920&q=80",
  recommendations:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  itinerary:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80",
  reviews:
    "https://images.unsplash.com/photo-1476514525535-ce74f45814ce?auto=format&fit=crop&w=1920&q=80",
  profile:
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80",
  sos: "https://images.unsplash.com/photo-1516571748831-5d81767bfa88?auto=format&fit=crop&w=1920&q=80",
  weather:
    "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80",
  admin:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
}
import Sidebar from "./components/Sidebar"
import TopBar from "./components/TopBar"
import MobileNav from "./components/MobileNav"
import Landing from "./pages/Landing"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import Trips from "./pages/Trips"
import BrowseTrips from "./pages/BrowseTrips"
import Buddies from "./pages/Buddies"
import Chat from "./pages/Chat"
import Profile from "./pages/Profile"
import SOS from "./pages/SOS"
import Weather from "./pages/Weather"
import Reviews from "./pages/Reviews"
import Itinerary from "./pages/Itinerary"
import Recommendations from "./pages/Recommendations"
import Admin from "./pages/Admin"
import MapView from "./pages/MapView"

class ErrorBoundary extends Component<{ children: ReactNode }, {
  error: string | null
}> {
  state: { error: string | null } = { error: null }

  static getDerivedStateFromError(e: Error): { error: string } {
    return { error: e.message }
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#080d1a",
            color: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            padding: 40,
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ color: "#f87171", fontSize: 18, marginBottom: 8 }}>
              Render Error
            </p>
            <p style={{ color: "#475569", fontSize: 13 }}>{this.state.error}</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const APP_VIEWS: View[] = [
  "dashboard",
  "my-trips",
  "browse-trips",
  "map",
  "buddies",
  "recommendations",
  "chat",
  "itinerary",
  "reviews",
  "profile",
  "sos",
  "weather",
  "admin",
]

const ECO_BG = [
  "https://images.unsplash.com/photo-1771149149933-b1242e80a4ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1920",
  "https://images.unsplash.com/photo-1766671965063-aa71cdd8a255?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1920",
  "https://images.unsplash.com/photo-1686890363911-635fb164ab96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1920",
]

export default function App() {
  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return "landing"
    try {
      const savedUser = localStorage.getItem("travel_companion_user")
      return savedUser ? "dashboard" : "landing"
    } catch {
      return "landing"
    }
  })
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const saved = localStorage.getItem("travel_companion_user")
      if (!saved) return null
      const parsed = JSON.parse(saved)
      const realId = (parsed._id || parsed.id || "").toString()
      return { ...parsed, id: realId, _id: realId }
    } catch {
      return null
    }
  })
  const [ecoMode, setEcoMode] = useState(false)
  const [ecoBgIdx, setEcoBgIdx] = useState(0)
  const [pendingDestination, setPendingDestination] = useState<string | null>(
    null,
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("travel_companion_token")
    if (token) {
      apiRequest<{ user: any }>("/auth/me")
        .then((res) => {
          if (res?.user) {
            const u = res.user
            const realId = (u.id || u._id || "").toString()
            const normalized: User = { ...u, id: realId, _id: realId }
            setUser(normalized)
            try {
              localStorage.setItem("travel_companion_user", JSON.stringify(normalized))
            } catch {}
          }
        })
        .catch(() => {})
    }
  }, [])

  function handleLogin(authenticatedUser: User) {
    const realId = (authenticatedUser.id || (authenticatedUser as any)._id || `u_${Date.now()}`).toString()
    const finalUser: User = {
      id: realId,
      _id: realId,
      name: authenticatedUser.name || "Traveler",
      email: authenticatedUser.email || "",
      age: authenticatedUser.age ?? 25,
      gender: authenticatedUser.gender || "Other",
      nationality: authenticatedUser.nationality || "Indian",
      state: authenticatedUser.state || "",
      city: authenticatedUser.city || "",
      bio: authenticatedUser.bio || "",
      interests: authenticatedUser.interests || [],
      hobbies: authenticatedUser.hobbies || [],
      languages: authenticatedUser.languages || ["English", "Hindi"],
      budget: authenticatedUser.budget || "mid-range",
      travelStyle: authenticatedUser.travelStyle || "Adventure",
      tripsCount: authenticatedUser.tripsCount ?? 0,
      rating: authenticatedUser.rating ?? 5.0,
      reviewCount: authenticatedUser.reviewCount ?? 0,
      verified: authenticatedUser.verified ?? true,
      joinedDate:
        authenticatedUser.joinedDate ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      role: authenticatedUser.role || "user",
      phone: authenticatedUser.phone || "",
      ecoScore: authenticatedUser.ecoScore ?? 85,
      beneficiary: authenticatedUser.beneficiary || {
        name: "",
        relation: "",
        phone: "",
        email: "",
        address: "",
      },
      ...authenticatedUser,
    }
    setUser(finalUser)
    try {
      localStorage.setItem("travel_companion_user", JSON.stringify(finalUser))
    } catch {}
    if (finalUser.role === "admin") {
      setView("admin")
    } else {
      setView(pendingDestination !== null ? "browse-trips" : "dashboard")
    }
  }

  function handleRegister(authenticatedUser: User) {
    const realId = (authenticatedUser.id || (authenticatedUser as any)._id || `u_${Date.now()}`).toString()
    const finalUser: User = {
      id: realId,
      _id: realId,
      name: authenticatedUser.name || "Traveler",
      email: authenticatedUser.email || "",
      age: authenticatedUser.age ?? 25,
      gender: authenticatedUser.gender || "Other",
      nationality: authenticatedUser.nationality || "Indian",
      state: authenticatedUser.state || "",
      city: authenticatedUser.city || "",
      bio: authenticatedUser.bio || "",
      interests: authenticatedUser.interests || [],
      hobbies: authenticatedUser.hobbies || [],
      languages: authenticatedUser.languages || ["English", "Hindi"],
      budget: authenticatedUser.budget || "mid-range",
      travelStyle: authenticatedUser.travelStyle || "Adventure",
      tripsCount: 0,
      rating: 5.0,
      reviewCount: 0,
      verified: true,
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      role: "user",
      phone: authenticatedUser.phone || "",
      ecoScore: 85,
      beneficiary: authenticatedUser.beneficiary || {
        name: "",
        relation: "",
        phone: "",
        email: "",
        address: "",
      },
      ...authenticatedUser,
    }
    setUser(finalUser)
    try {
      localStorage.setItem("travel_companion_user", JSON.stringify(finalUser))
    } catch {}
    setView(pendingDestination !== null ? "browse-trips" : "dashboard")
  }

  function handleLogout() {
    localStorage.removeItem("travel_companion_token")
    localStorage.removeItem("travel_companion_user")
    setUser(null)
    setPendingDestination(null)
    setMobileMenuOpen(false)
    setView("landing")
  }

  function handleBrowseTrips(destination?: string) {
    setPendingDestination(destination ?? "")
    setView(user ? "browse-trips" : "login")
  }

  function handleNav(v: View) {
    if (APP_VIEWS.includes(v) && !user) {
      setView("login")
      return
    }
    if (v !== "browse-trips") setPendingDestination(null)
    setView(v)
    setEcoMode(false)
    setMobileMenuOpen(false)
  }

  function handleEcoMode(active: boolean) {
    setEcoMode(active)
    if (active) setEcoBgIdx((i) => (i + 1) % ECO_BG.length)
  }

  const bgImage = ecoMode ? ECO_BG[ecoBgIdx] : (BG[view] ?? BG.dashboard)

  function renderContent() {
    if (!user) {
      if (view === "login")
        return (
          <Auth
            mode="login"
            onNav={handleNav}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )
      if (view === "register")
        return (
          <Auth
            mode="register"
            onNav={handleNav}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )
      return <Landing onNav={handleNav} onBrowseTrips={handleBrowseTrips} />
    }
    return (
      <div className="flex min-h-screen w-full bg-transparent">
        {/* Sidebar for desktop and mobile drawer overlay */}
        <Sidebar
          current={view}
          onNav={handleNav}
          user={user}
          onLogout={handleLogout}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <TopBar
            view={view}
            user={user}
            onNav={handleNav}
            onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
          />

          <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 bg-transparent pb-24 md:pb-6 w-full">
            {view === "dashboard" && (
              <Dashboard user={user} onNav={handleNav} />
            )}
            {view === "my-trips" && (
              <Trips user={user} onEcoMode={handleEcoMode} />
            )}
            {view === "browse-trips" && (
              <BrowseTrips
                user={user}
                onEcoMode={handleEcoMode}
                initialSearch={pendingDestination ?? ""}
              />
            )}
            {view === "map" && <MapView user={user} />}
            {view === "buddies" && <Buddies user={user} onNav={handleNav} />}
            {view === "recommendations" && (
              <Recommendations
                user={user}
                onPlanTrip={() => handleNav("itinerary")}
              />
            )}
            {view === "chat" && <Chat user={user} />}
            {view === "itinerary" && <Itinerary user={user} />}
            {view === "reviews" && <Reviews user={user} />}
            {view === "profile" && (
              <Profile
                user={user}
                onUpdateUser={(updated) => {
                  setUser(updated)
                  try {
                    localStorage.setItem(
                      "travel_companion_user",
                      JSON.stringify(updated),
                    )
                  } catch {}
                }}
              />
            )}
            {view === "sos" && <SOS user={user} />}
            {view === "weather" && <Weather user={user} />}
            {view === "admin" && user?.role === "admin" && <Admin />}
            {view === "admin" && user?.role !== "admin" && (
              <div className="flex items-center justify-center h-full">
                <p className="font-display font-bold text-xl text-slate-200">
                  Access Denied
                </p>
              </div>
            )}
          </main>

          {/* Bottom Navigation for mobile users */}
          <MobileNav current={view} onNav={handleNav} role={user?.role} />
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          background: "#080d1a",
        }}
      >
        {/* Per-view background — key forces remount + fade-in on every view change */}
        <div
          key={bgImage}
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            animation: "bgFadeIn 0.7s ease forwards",
            zIndex: 0,
          }}
        />
        {/* Dark overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,13,26,0.65)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
          {renderContent()}
        </div>
      </div>
    </ErrorBoundary>
  )
}
