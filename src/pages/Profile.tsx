import { useState, useEffect } from "react"
import type { User } from "../types"
import Avatar from "../components/Avatar"
import { apiRequest } from "../lib/api"

const INTERESTS = [
  "Photography",
  "Street Food",
  "History",
  "Architecture",
  "Hiking",
  "Diving",
  "Art",
  "Music",
  "Markets",
  "Wellness",
  "Astronomy",
  "Wildlife",
  "Cooking",
  "Reading",
]
const HOBBIES = [
  "Rock Climbing",
  "Journaling",
  "Yoga",
  "Cooking",
  "Surfing",
  "Painting",
  "Sketching",
  "Dancing",
  "Reading",
  "Gaming",
]

interface ProfileProps {
  user: User
  onUpdateUser?: (updated: User) => void
}

export default function Profile({ user, onUpdateUser }: ProfileProps) {
  const [tab, setTab] =
    useState<"profile" | "beneficiary" | "security" | "preferences">("profile")
  const [profile, setProfile] = useState({ ...user })
  const [beneficiary, setBeneficiary] = useState({ ...user.beneficiary })
  const [saved, setSaved] = useState(false)
  const [locationSharing, setLocationSharing] = useState(true)
  const [emergencyAlerts, setEmergencyAlerts] = useState(true)
  const [shareWithBeneficiary, setShareWithBeneficiary] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error" | "idle"
    message: string
  }>({ type: "idle", message: "" })
  const [locationStatus, setLocationStatus] = useState<{
    type: "success" | "error" | "idle"
    message: string
  }>({ type: "idle", message: "" })

  useEffect(() => {
    setProfile({ ...user })
    if (user.beneficiary) {
      setBeneficiary({ ...user.beneficiary })
    }
  }, [user])

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: "error",
        message: "Geolocation is not supported in this browser.",
      })
      return
    }

    setLocationStatus({ type: "idle", message: "" })

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            { headers: { Accept: "application/json" } },
          )
          const data = await response.json()
          const address = data?.address ?? {}
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            "Current location"
          const state = address.state || "Current state"

          setProfile((p) => ({ ...p, city, state }))
          setLocationStatus({
            type: "success",
            message: `Location updated: ${city}, ${state}`,
          })
        } catch {
          setLocationStatus({
            type: "error",
            message:
              "Location detected, but the city/state could not be resolved.",
          })
        }
      },
      () => {
        setLocationStatus({
          type: "error",
          message:
            "Location access was denied. Please allow browser location access.",
        })
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    )
  }

  function toggleInterest(item: string, field: "interests" | "hobbies" | "languages") {
    setProfile((p) => {
      const list = Array.isArray(p[field]) ? (p[field] as string[]) : []
      return {
        ...p,
        [field]: list.includes(item)
          ? list.filter((x) => x !== item)
          : [...list, item],
      }
    })
  }

  async function handleSave() {
    try {
      let updated = { ...profile }
      if (tab === "profile") {
        const res = await apiRequest<any>("/profile", {
          method: "PATCH",
          body: JSON.stringify(profile),
        })
        if (res && typeof res === "object") {
          updated = { ...updated, ...res }
        }
      } else if (tab === "beneficiary") {
        const res = await apiRequest<any>("/profile/beneficiary", {
          method: "PATCH",
          body: JSON.stringify(beneficiary),
        })
        updated.beneficiary = { ...beneficiary }
        if (res?.beneficiary) {
          updated.beneficiary = { ...res.beneficiary }
        }
      } else if (tab === "preferences") {
        const res = await apiRequest<any>("/profile", {
          method: "PATCH",
          body: JSON.stringify({
            languages: profile.languages,
            locationSharing,
            emergencyAlerts,
            shareWithBeneficiary,
          }),
        }).catch(() => null)
        if (res && typeof res === "object") {
          updated = { ...updated, ...res }
        }
      }

      setProfile(updated)
      if (onUpdateUser) {
        onUpdateUser(updated)
      }
      try {
        localStorage.setItem("travel_companion_user", JSON.stringify(updated))
      } catch {}
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      window.alert(
        "Changes could not be saved. Check that the backend is running.",
      )
    }
  }

  async function handlePasswordUpdate() {
    setPasswordStatus({ type: "idle", message: "" })

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordStatus({
        type: "error",
        message: "Please fill in all password fields.",
      })
      return
    }

    if (newPassword.length < 8) {
      setPasswordStatus({
        type: "error",
        message: "New password must be at least 8 characters long.",
      })
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({
        type: "error",
        message: "New passwords do not match.",
      })
      return
    }

    try {
      const response = await apiRequest<{ message: string }>(
        "/profile/password",
        {
          method: "PATCH",
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmNewPassword,
          }),
        },
      )

      setPasswordStatus({ type: "success", message: response.message })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Password update failed."
      setPasswordStatus({ type: "error", message })
    }
  }

  const tabs = [
    { id: "profile", label: "Profile Info" },
    { id: "beneficiary", label: "Beneficiary" },
    { id: "security", label: "Security" },
    { id: "preferences", label: "Preferences" },
  ] as const

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p
          className="font-display font-bold text-sm uppercase mb-1 sm:mb-2"
          style={{ color: "#0ea5e9" }}
        >
          MY ACCOUNT
        </p>
        <h2
          className="font-display font-black text-2xl sm:text-3xl"
          style={{ color: "#e2e8f0" }}
        >
          Profile & Settings
        </h2>
      </div>

      {/* Profile header card */}
      <div
        className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl mb-6 text-center sm:text-left overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(13, 21, 37, 0.85), rgba(20, 30, 53, 0.85))",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        }}
      >
        <div className="relative shrink-0">
          <Avatar name={profile.name} size={88} radius={16} />
          {profile.verified && (
            <span
              className="absolute -bottom-1 -right-1 flex items-center justify-center font-mono text-xs font-bold"
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#0ea5e9",
                color: "#080d1a",
              }}
            >
              ✓
            </span>
          )}
        </div>
        <div className="flex-1 w-full">
          <h3
            className="font-display font-bold text-xl sm:text-2xl mb-1"
            style={{ color: "#e2e8f0" }}
          >
            {profile.name}
          </h3>
          <p className="font-mono text-xs mb-3 break-words" style={{ color: "#94a3b8" }}>
            {profile.age} · {profile.nationality} · {profile.gender} · Joined{" "}
            {profile.joinedDate}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <span style={{ color: "#f59e0b" }}>★</span>
              <span
                className="font-mono text-xs sm:text-sm font-semibold"
                style={{ color: "#f59e0b" }}
              >
                {profile.rating}
              </span>
              <span className="font-mono text-[11px]" style={{ color: "#64748b" }}>
                rating
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(14,165,233,0.1)",
                border: "1px solid rgba(14,165,233,0.2)",
              }}
            >
              <span
                className="font-mono text-xs sm:text-sm font-semibold"
                style={{ color: "#0ea5e9" }}
              >
                {profile.tripsCount}
              </span>
              <span className="font-mono text-[11px]" style={{ color: "#64748b" }}>
                trips
              </span>
            </div>
            <div
              className={`badge text-[11px] sm:text-xs ${
                profile.verified ? "badge-green" : "badge-amber"
              }`}
            >
              {profile.verified ? "✓ Verified" : "⏳ Pending"}
            </div>
            <div className="badge badge-purple text-[11px] sm:text-xs">JWT Secured</div>
          </div>
        </div>
        <div className="text-center sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 shrink-0">
          <p className="font-mono text-[11px] mb-0.5" style={{ color: "#475569" }}>
            MEMBER SINCE
          </p>
          <p className="font-display font-bold text-sm sm:text-base" style={{ color: "#e2e8f0" }}>
            {profile.joinedDate}
          </p>
          <p className="font-mono text-[11px] mt-0.5" style={{ color: "#0ea5e9" }}>
            {profile.role.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div
        className="flex gap-1 mb-6 overflow-x-auto whitespace-nowrap pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
        style={{ borderBottom: "1px solid #1a2845" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-display font-semibold text-xs sm:text-sm transition-all shrink-0"
            style={
              tab === t.id
                ? {
                    color: "#0ea5e9",
                    borderBottom: "2px solid #0ea5e9",
                    marginBottom: -1,
                  }
                : {
                    color: "#64748b",
                    borderBottom: "2px solid transparent",
                    marginBottom: -1,
                  }
            }
          >
            {t.label}
            {t.id === "beneficiary" && (
              <span className="ml-2 badge badge-amber" style={{ fontSize: 10 }}>
                Required
              </span>
            )}
          </button>
        ))}
      </div>

      {/* PROFILE INFO TAB */}
      {tab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Full Name
              </label>
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Phone
              </label>
              <input
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block font-display font-medium text-sm mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  Age
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, age: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <label
                  className="block font-display font-medium text-sm mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  Gender
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, gender: e.target.value }))
                  }
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Nationality
              </label>
              <input
                value={profile.nationality}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, nationality: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Budget Type
              </label>
              <select
                value={profile.budget}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    budget: e.target.value as User["budget"],
                  }))
                }
              >
                <option value="budget">Budget</option>
                <option value="mid-range">Mid-Range</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, bio: e.target.value }))
                }
                style={{ resize: "vertical", minHeight: 100 }}
              />
            </div>

            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleInterest(i, "interests")}
                    className="badge transition-all"
                    style={
                      profile.interests.includes(i)
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
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Hobbies
              </label>
              <div className="flex flex-wrap gap-2">
                {HOBBIES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleInterest(h, "hobbies")}
                    className="badge transition-all"
                    style={
                      profile.hobbies.includes(h)
                        ? {
                            background: "rgba(168,85,247,0.2)",
                            color: "#c084fc",
                            border: "1px solid rgba(168,85,247,0.4)",
                          }
                        : {
                            background: "rgba(100,116,139,0.1)",
                            color: "#64748b",
                            border: "1px solid #1a2845",
                          }
                    }
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Languages Spoken
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "English",
                  "Hindi",
                  "Tamil",
                  "Telugu",
                  "Kannada",
                  "Malayalam",
                  "Bengali",
                  "Marathi",
                  "Gujarati",
                  "Punjabi",
                  "Spanish",
                  "French",
                  "German",
                  "Japanese",
                ].map((lang) => {
                  const isSelected = (profile.languages || []).includes(lang)
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleInterest(lang, "languages")}
                      className="badge transition-all cursor-pointer select-none flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
                      style={
                        isSelected
                          ? {
                              background: "rgba(34,197,94,0.2)",
                              color: "#4ade80",
                              border: "1px solid rgba(34,197,94,0.4)",
                            }
                          : {
                              background: "rgba(100,116,139,0.1)",
                              color: "#64748b",
                              border: "1px solid #1a2845",
                            }
                      }
                    >
                      <span>{lang}</span>
                      <span style={{ fontSize: 10, fontWeight: 700 }}>
                        {isSelected ? "✓" : "+"}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col gap-3">
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 sm:p-4"
              style={{
                background: "rgba(14,165,233,0.06)",
                border: "1px solid rgba(14,165,233,0.2)",
              }}
            >
              <div>
                <p
                  className="font-display font-semibold text-sm"
                  style={{ color: "#e2e8f0" }}
                >
                  Current Location
                </p>
                <p className="font-mono text-xs mt-0.5" style={{ color: "#64748b" }}>
                  {profile.city && profile.state
                    ? `${profile.city}, ${profile.state}`
                    : "Location not set yet"}
                </p>
              </div>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="btn-primary px-4 py-2.5 text-xs w-full sm:w-auto text-center"
              >
                📍 Use my current location
              </button>
            </div>

            {locationStatus.type !== "idle" && (
              <div
                className="px-4 py-3 rounded-lg font-mono text-xs break-words"
                style={{
                  background:
                    locationStatus.type === "success"
                      ? "rgba(34,197,94,0.08)"
                      : "rgba(239,68,68,0.1)",
                  border:
                    locationStatus.type === "success"
                      ? "1px solid rgba(34,197,94,0.2)"
                      : "1px solid rgba(239,68,68,0.2)",
                  color:
                    locationStatus.type === "success" ? "#4ade80" : "#f87171",
                }}
              >
                {locationStatus.message}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={handleSave} className="btn-primary px-8 w-full sm:w-auto">
                {saved ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BENEFICIARY TAB */}
      {tab === "beneficiary" && (
        <div>
          <div
            className="p-4 rounded-xl mb-6 flex gap-3 items-start"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <p
                className="font-display font-semibold text-sm mb-1"
                style={{ color: "#fbbf24" }}
              >
                Why this matters
              </p>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                In an emergency, TravelMate automatically shares your full trip
                details, current location, and companion information with your
                designated beneficiary. Keep this updated at all times.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Beneficiary Full Name *
              </label>
              <input
                value={beneficiary.name}
                onChange={(e) =>
                  setBeneficiary((b) => ({ ...b, name: e.target.value }))
                }
                placeholder="Priya Mehta"
              />
            </div>
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Relation *
              </label>
              <select
                value={beneficiary.relation}
                onChange={(e) =>
                  setBeneficiary((b) => ({ ...b, relation: e.target.value }))
                }
              >
                <option>Sister</option>
                <option>Brother</option>
                <option>Mother</option>
                <option>Father</option>
                <option>Spouse</option>
                <option>Friend</option>
                <option>Guardian</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Phone Number *
              </label>
              <input
                value={beneficiary.phone}
                onChange={(e) =>
                  setBeneficiary((b) => ({ ...b, phone: e.target.value }))
                }
                placeholder="+91 98765 00001"
              />
            </div>
            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Email Address *
              </label>
              <input
                type="email"
                value={beneficiary.email}
                onChange={(e) =>
                  setBeneficiary((b) => ({ ...b, email: e.target.value }))
                }
                placeholder="beneficiary@email.com"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Home Address
              </label>
              <input
                value={beneficiary.address}
                onChange={(e) =>
                  setBeneficiary((b) => ({ ...b, address: e.target.value }))
                }
                placeholder="42 MG Road, Bangalore, Karnataka 560001"
              />
            </div>
          </div>

          {/* What gets shared */}
          <div
            className="mt-6 p-4 sm:p-5 rounded-xl"
            style={{ background: "#0d1525", border: "1px solid #1a2845" }}
          >
            <p className="font-mono text-xs mb-3 font-semibold" style={{ color: "#0ea5e9" }}>
              WHAT GETS SHARED IN AN EMERGENCY
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {[
                "Your full name and photo",
                "Current GPS coordinates",
                "Active trip destination & dates",
                "Travel companion names & photos",
                "Companion contact details",
                "Hotel/accommodation info",
                "Emergency contact of companions",
                "Last known check-in time",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  style={{ color: "#94a3b8" }}
                >
                  <span className="shrink-0 font-bold" style={{ color: "#4ade80" }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={handleSave} className="btn-primary px-8 w-full sm:w-auto">
              {saved ? "✓ Saved!" : "Update Beneficiary"}
            </button>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {tab === "security" && (
        <div className="max-w-lg flex flex-col gap-5">
          <div
            className="p-4 rounded-xl flex gap-3"
            style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <span>🔒</span>
            <div>
              <p
                className="font-display font-semibold text-sm"
                style={{ color: "#4ade80" }}
              >
                JWT Authentication Active
              </p>
              <p className="font-mono text-xs" style={{ color: "#475569" }}>
                Token expires: 2026-10-11 · Auto-refresh enabled
              </p>
            </div>
          </div>

          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {passwordStatus.type !== "idle" && (
            <div
              className="px-4 py-3 rounded-lg font-mono text-xs"
              style={{
                background:
                  passwordStatus.type === "success"
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(239,68,68,0.1)",
                border:
                  passwordStatus.type === "success"
                    ? "1px solid rgba(34,197,94,0.2)"
                    : "1px solid rgba(239,68,68,0.2)",
                color:
                  passwordStatus.type === "success" ? "#4ade80" : "#f87171",
              }}
            >
              {passwordStatus.message}
            </div>
          )}

          <div
            className="p-4 rounded-xl"
            style={{ background: "#0d1525", border: "1px solid #1a2845" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p
                className="font-display font-semibold text-sm"
                style={{ color: "#e2e8f0" }}
              >
                Two-Factor Authentication
              </p>
              <span className="badge badge-green">Enabled</span>
            </div>
            <p className="text-xs" style={{ color: "#64748b" }}>
              2FA via authenticator app is active on your account.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePasswordUpdate}
            className="btn-primary"
          >
            Update Password
          </button>

          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              border: "1px solid rgba(248, 113, 113, 0.25)",
              background: "rgba(127, 29, 29, 0.15)",
            }}
          >
            <p
              className="font-display font-semibold text-sm mb-3"
              style={{ color: "#fca5a5" }}
            >
              Permanent account removal
            </p>
            <button className="btn-danger text-sm px-4 py-2">
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* PREFERENCES TAB */}
      {tab === "preferences" && (
        <div className="max-w-lg flex flex-col gap-5">
          {[
            {
              label: "Live Location Sharing",
              desc: "Share real-time GPS with approved travel companions during active trips.",
              value: locationSharing,
              setter: setLocationSharing,
              color: "#22c55e",
            },
            {
              label: "Emergency Alerts",
              desc: "Allow TravelMate to send SOS alerts on your behalf in emergencies.",
              value: emergencyAlerts,
              setter: setEmergencyAlerts,
              color: "#ef4444",
            },
            {
              label: "Share Details with Beneficiary",
              desc: "Automatically send trip & companion info to your beneficiary when you check in.",
              value: shareWithBeneficiary,
              setter: setShareWithBeneficiary,
              color: "#f59e0b",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl flex items-center gap-4"
              style={{ background: "#0d1525", border: "1px solid #1a2845" }}
            >
              <div className="flex-1">
                <p
                  className="font-display font-semibold text-sm mb-0.5"
                  style={{ color: "#e2e8f0" }}
                >
                  {item.label}
                </p>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  {item.desc}
                </p>
              </div>
              <button
                onClick={() => item.setter(!item.value)}
                className="flex-shrink-0 relative transition-all"
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 13,
                  background: item.value ? item.color : "#1a2845",
                  padding: 3,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#fff",
                    transform: item.value
                      ? "translateX(22px)"
                      : "translateX(0)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
            </div>
          ))}

          <div>
            <label
              className="block font-display font-medium text-sm mb-2"
              style={{ color: "#94a3b8" }}
            >
              Preferred Languages (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "English",
                "Hindi",
                "Tamil",
                "Telugu",
                "Kannada",
                "Malayalam",
                "Bengali",
                "Marathi",
                "Gujarati",
                "Punjabi",
                "Spanish",
                "French",
                "German",
                "Japanese",
                "Mandarin",
                "Portuguese",
              ].map((lang) => {
                const isSelected = (profile.languages || []).includes(lang)
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleInterest(lang, "languages")}
                    className="badge transition-all cursor-pointer select-none flex items-center gap-1.5 py-1.5 px-3 font-semibold text-xs"
                    style={
                      isSelected
                        ? {
                            background: "rgba(14,165,233,0.25)",
                            color: "#38bdf8",
                            border: "1px solid rgba(14,165,233,0.5)",
                            boxShadow: "0 0 10px rgba(14,165,233,0.2)",
                          }
                        : {
                            background: "rgba(100,116,139,0.1)",
                            color: "#64748b",
                            border: "1px solid #1a2845",
                          }
                    }
                  >
                    <span>{lang}</span>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary mt-2">
            {saved ? "✓ Saved!" : "Save Preferences"}
          </button>
        </div>
      )}
    </div>
  )
}
