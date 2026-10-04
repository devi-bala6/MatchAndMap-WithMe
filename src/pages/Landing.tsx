import { useState } from "react"
import type { View } from "../types"
import Logo from "../components/Logo"
import Avatar from "../components/Avatar"
import PlaceImage from "../components/PlaceImage"

interface LandingProps {
  onNav: (v: View) => void
  onBrowseTrips: (destination?: string) => void
}

const features = [
  {
    icon: "⬡",
    title: "Smart Matching",
    desc: "AI compatibility scores based on interests, budget, travel style, and hobbies — built for Indian travellers.",
    color: "#0ea5e9",
  },
  {
    icon: "💬",
    title: "Real-time Chat",
    desc: "Connect instantly. Group chats for every trip, end-to-end encrypted.",
    color: "#22c55e",
  },
  {
    icon: "⚡",
    title: "Emergency SOS",
    desc: "One-tap SOS broadcasts your live GPS to your beneficiary and travel companions instantly.",
    color: "#ef4444",
  },
  {
    icon: "📍",
    title: "Live Location",
    desc: "Share real-time location with companions and trusted family during every journey.",
    color: "#f59e0b",
  },
  {
    icon: "🌿",
    title: "Eco-Friendly Travel",
    desc: "Carbon footprint tracking, eco badges, and green travel tips for every Indian destination.",
    color: "#22c55e",
  },
  {
    icon: "🗓️",
    title: "Itinerary Planner",
    desc: "AI-generated day-by-day plans with local food, eco stays, and hidden gems across India.",
    color: "#a855f7",
  },
  {
    icon: "⭐",
    title: "Reviews & Ratings",
    desc: "Honest reviews from verified Indian travellers. Eco behaviour rated separately.",
    color: "#f59e0b",
  },
  {
    icon: "🔐",
    title: "JWT Authentication",
    desc: "Bank-grade security. Verified Aadhaar-linked profiles for trust and safety.",
    color: "#06b6d4",
  },
]

const destinations = [
  {
    name: "Spiti Valley",
    state: "Himachal Pradesh",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=700&fit=crop&auto=format",
    travelers: 127,
    eco: true,
  },
  {
    name: "Meghalaya",
    state: "Meghalaya",
    img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Dawki_River%2C_Meghalaya%2C_India.jpg/1280px-Dawki_River%2C_Meghalaya%2C_India.jpg",
    travelers: 84,
    eco: true,
  },
  {
    name: "Leh-Ladakh",
    state: "Ladakh",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=700&fit=crop&auto=format",
    travelers: 213,
    eco: false,
  },
  {
    name: "Kerala Backwaters",
    state: "Kerala",
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=800&fit=crop&auto=format",
    travelers: 176,
    eco: true,
  },
]

const testimonials = [
  {
    name: "Trekker from Maharashtra",
    city: "Mumbai",
    quote:
      "Matching with verified travel buddies sharing the same budget and travel style makes planning long journeys across India completely hassle-free.",
    trip: "Valley of Flowers & Kedarnath",
  },
  {
    name: "Solo Explorer from Kerala",
    city: "Kochi",
    quote:
      "The instant SOS and live GPS telemetry sharing with family gave full peace of mind during high-altitude Himalayan routes.",
    trip: "Spiti Valley & Ladakh Circuit",
  },
  {
    name: "Heritage Traveler from Tamil Nadu",
    city: "Chennai",
    quote:
      "Mutual connection requests and verified companion profiles make community travel safe, authentic, and fun.",
    trip: "Rajasthan Circuit & Varanasi",
  },
]

const stats = [
  { value: "18,420", label: "Verified Indian Travellers" },
  { value: "5,612", label: "Companions Matched" },
  { value: "28", label: "States Covered" },
  { value: "4.8★", label: "Average Rating" },
]

export default function Landing({ onNav, onBrowseTrips }: LandingProps) {
  const [selectedDestination, setSelectedDestination] =
    useState<typeof destinations[number] | null>(null)

  return (
    <div
      style={{
        background: "transparent",
        minHeight: "100vh",
        color: "#e2e8f0",
      }}
    >
      {/* NAV */}
      <nav
        className="flex flex-wrap items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 sticky top-0 z-40 gap-3"
        style={{
          background: "rgba(8,13,26,0.75)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Logo size={36} showText={true} textSize="md" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNav("login")}
            className="font-display font-medium text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-slate-300 hover:text-white"
          >
            Sign In
          </button>
          <button
            onClick={() => onNav("register")}
            className="btn-primary text-xs sm:text-sm px-3.5 py-1.5 sm:px-5 sm:py-2"
          >
            Join Free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative flex flex-col items-center text-center px-4 sm:px-6 py-16 sm:py-24 map-grid"
        style={{ minHeight: "80vh", justifyContent: "center" }}
      >
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "min(600px, 90vw)",
            height: "min(600px, 90vw)",
            top: "0%",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 font-mono text-[11px] sm:text-xs font-semibold"
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b",
            }}
          >
            🇮🇳 BUILT EXCLUSIVELY FOR INDIAN TRAVELLERS
          </div>

          <h1
            className="font-display font-black leading-tight mb-6"
            style={{
              fontSize: "clamp(32px, 5.5vw, 76px)",
              letterSpacing: "-0.03em",
            }}
          >
            <span
              style={{
                background: "linear-gradient(90deg, #22c55e, #4ade80)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Match&amp;Map
            </span>{" "}
            with me.
            <br />
            <span className="text-slate-100 text-[0.7em] block sm:inline mt-1">
              Explore Bharat together.
            </span>
          </h1>

          <p
            className="text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto px-2"
            style={{
              color: "#fcd34d",
              textShadow:
                "0 0 32px rgba(251,191,36,0.55), 0 0 8px rgba(245,158,11,0.4), 0 2px 10px rgba(0,0,0,0.7)",
              fontWeight: 500,
            }}
          >
            Match&Map with me connects Indian solo travellers by destination,
            interests, budget, and hobbies. From Ladakh to Lakshadweep — find
            verified companions for every corner of India.
          </p>

          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <button
              onClick={() => onNav("register")}
              className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3"
            >
              Start Matching Free
            </button>
            <button
              onClick={() => onNav("login")}
              className="btn-outline text-sm sm:text-base px-6 sm:px-8 py-3"
            >
              Explore Trips →
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto w-full px-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center p-3 rounded-xl bg-slate-950/40 border border-slate-800/40"
            >
              <div className="font-display font-black text-2xl sm:text-3xl text-amber-400">
                {s.value}
              </div>
              <div className="font-mono text-[10px] sm:text-xs mt-1 text-slate-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="px-4 sm:px-8 py-14 sm:py-20 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <p className="font-mono text-xs mb-1 sm:mb-2 text-amber-400 font-bold tracking-wider uppercase">
                TRENDING THIS SEASON
              </p>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-100">
                Popular destinations
              </h2>
            </div>
            <button
              onClick={() => onBrowseTrips()}
              className="font-display text-sm font-semibold text-amber-400 hover:text-amber-300 text-left sm:text-right"
            >
              View all trips →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {destinations.map((d) => (
              <button
                key={d.name}
                type="button"
                onClick={() => setSelectedDestination(d)}
                aria-label={`Explore trips to ${d.name}`}
                className="trip-card w-full p-0 text-left overflow-hidden h-64 group"
              >
                <div className="relative h-full">
                  <PlaceImage
                    destination={d.name}
                    state={d.state}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallback={d.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  {d.eco && (
                    <div className="absolute top-3 right-3 badge badge-green text-[10px]">
                      🌿 Eco
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-display font-bold text-base text-slate-100">
                      {d.name}
                    </p>
                    <p className="font-mono text-xs text-slate-400">
                      {d.state}
                    </p>
                    <p className="font-mono text-xs mt-1 text-amber-400 font-semibold">
                      {d.travelers} companions seeking
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 sm:px-8 py-14 sm:py-20 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="font-mono text-xs mb-2 text-amber-400 font-bold uppercase tracking-wider">
              PLATFORM FEATURES
            </p>
            <h2 className="font-display font-black text-2xl sm:text-4xl mb-3 sm:mb-4 text-slate-100">
              Everything for the Indian traveller.
            </h2>
            <p className="text-sm sm:text-base max-w-xl mx-auto text-slate-400">
              From matching to monitoring — Match&amp;Map with me covers every
              kilometre of your journey across India.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <div key={i} className="stat-card p-5 sm:p-6 rounded-2xl">
                <div
                  className="flex items-center justify-center text-xl mb-4 w-12 h-12 rounded-xl"
                  style={{
                    background: `${f.color}1a`,
                    border: `1px solid ${f.color}25`,
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-base mb-2 text-slate-100">
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECO SECTION */}
      <section
        className="px-4 sm:px-8 py-14 sm:py-16 border-t border-slate-800/80"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-left">
            <p className="font-mono text-xs mb-2 text-emerald-400 font-bold uppercase tracking-wider">
              ECO-CONSCIOUS TRAVEL
            </p>
            <h2 className="font-display font-black text-2xl sm:text-4xl mb-4 leading-tight text-slate-100">
              Travel green.
              <br />
              <span className="text-emerald-400">Leave India beautiful.</span>
            </h2>
            <p className="text-sm sm:text-base mb-6 leading-relaxed text-slate-400">
              Every trip on Match&amp;Map with me shows its carbon footprint. We
              promote train travel, eco-certified homestays, and companions who
              pick up what they do not drop.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                "Carbon footprint displayed on every trip",
                "Eco score rating for all travellers",
                "Green stay & transport recommendations",
                "Leave No Trace pledge for all members",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs sm:text-sm text-slate-300"
                >
                  <span className="text-emerald-400 font-bold">✓</span> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-96 flex-shrink-0">
            {[
              {
                value: "42%",
                label: "of trips are eco-certified",
                color: "#22c55e",
              },
              {
                value: "Train",
                label: "preferred transport choice",
                color: "#0ea5e9",
              },
              {
                value: "88%",
                label: "of users follow LNT pledge",
                color: "#f59e0b",
              },
              {
                value: "2.1T",
                label: "carbon saved via shared trips",
                color: "#a855f7",
              },
            ].map((s) => (
              <div key={s.label} className="stat-card text-center p-4 sm:p-5">
                <div
                  className="font-display font-black text-2xl sm:text-3xl mb-1"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 sm:px-8 py-14 sm:py-20 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="font-mono text-xs mb-2 text-purple-400 font-bold uppercase tracking-wider">
              YATRI STORIES
            </p>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-100">
              Real matches, real memories.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="stat-card p-5 sm:p-7 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar name={t.name} size={44} />
                    <div>
                      <p className="font-display font-semibold text-sm text-slate-100">
                        {t.name}
                      </p>
                      <p className="font-mono text-xs text-slate-400">
                        {t.city}
                      </p>
                      <p className="font-mono text-[11px] text-amber-400 font-semibold">
                        {t.trip}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-300 italic">
                    "{t.quote}"
                  </p>
                </div>
                <div className="mt-4 font-mono text-xs text-amber-400 font-bold">
                  ★★★★★
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-4 sm:px-8 py-16 sm:py-24 text-center border-t border-slate-800/80"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <p className="font-mono text-xs mb-3 text-amber-400 font-bold uppercase tracking-wider">
            🇮🇳 FOR INDIANS, BY INDIANS
          </p>
          <h2 className="font-display font-black text-3xl sm:text-5xl mb-4 sm:mb-6 leading-tight text-slate-100">
            Bharat is vast.
            <br />
            Travel it together.
          </h2>
          <p className="text-sm sm:text-base mb-8 text-slate-400">
            18,420 verified Indian travellers. 28 states covered. Free forever.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNav("register")}
              className="btn-amber text-sm sm:text-base px-6 sm:px-10 py-3 rounded-xl font-bold"
            >
              Join Free — Match&Map with me
            </button>
            <button
              onClick={() => onNav("login")}
              className="btn-outline text-sm sm:text-base px-6 sm:px-10 py-3 rounded-xl"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 text-center sm:text-left">
        <div className="flex items-center gap-2 sm:gap-3">
          <Logo size={26} showText={true} textSize="sm" />
          <span className="font-mono text-[11px] text-slate-500">
            · Made in India · © 2026
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
          {["Privacy", "Terms", "Safety", "Help", "Blog"].map((l) => (
            <span
              key={l}
              className="font-display text-xs cursor-pointer text-slate-400 hover:text-slate-200"
            >
              {l}
            </span>
          ))}
        </div>
      </footer>

      {selectedDestination && (
        <div
          className="modal-overlay z-50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDestination(null)
            }
          }}
        >
          <div className="modal w-full max-w-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-display font-bold text-xs uppercase mb-1 text-amber-400">
                  Trending destination
                </p>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-100">
                  {selectedDestination.name}
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
                  {selectedDestination.state}, India
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDestination(null)}
                aria-label="Close destination details"
                className="font-display text-2xl text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-4 bg-slate-950">
              <PlaceImage
                destination={selectedDestination.name}
                state={selectedDestination.state}
                alt={`${selectedDestination.name}, ${selectedDestination.state}`}
                className="w-full h-full object-cover"
                fallback={selectedDestination.img}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <div>
                <p className="font-display font-bold text-sm text-slate-200">
                  {selectedDestination.travelers} companions seeking trips here
                </p>
                {selectedDestination.eco && (
                  <p className="mt-0.5 text-xs text-emerald-400 font-semibold">
                    🌿 Eco-friendly certified route
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  onBrowseTrips(selectedDestination.name)
                  setSelectedDestination(null)
                }}
                className="btn-primary w-full sm:w-auto flex-shrink-0"
              >
                Browse trips →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
