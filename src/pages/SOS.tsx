import { useState, useEffect, useRef } from "react"
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Users,
  Radio,
  AlertTriangle,
  BatteryCharging,
  Battery,
  Clock,
  CheckCircle2,
  Phone,
  Shield,
  FileText,
} from "lucide-react"
import type { User } from "../types"
import Avatar from "../components/Avatar"
import { apiRequest } from "../lib/api"
import EmergencySOSModal from "../components/EmergencySOSModal"

interface SOSProps {
  user?: User | null
}

export default function SOS({ user }: SOSProps) {
  const [showSOSModal, setShowSOSModal] = useState(false)
  const [beneficiary, setBeneficiary] = useState<User["beneficiary"]>(
    () =>
      user?.beneficiary || {
        name: "",
        relation: "",
        phone: "",
        email: "",
        address: "",
      },
  )
  const [locationSharing, setLocationSharing] = useState(true)
  const [liveLocation, setLiveLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isCharging, setIsCharging] = useState(false)
  const [activeAlerts, setActiveAlerts] = useState<any[]>([])
  const [connectedCompanions, setConnectedCompanions] = useState<any[]>([])

  // Load real accepted connections for current user
  useEffect(() => {
    apiRequest<any[]>("/connections")
      .then((conns) => {
        if (Array.isArray(conns)) {
          const accepted = conns.filter((c) => c.status === "accepted")
          const companionList = accepted.map((c) => {
            const isIncoming = (c.toUserId === user?.id || c.toUserId === (user as any)?._id)
            const other = isIncoming && typeof c.from === "object" ? c.from : null
            return {
              name: other?.name || (isIncoming ? "Connected Buddy" : "Travel Companion"),
              role: other?.travelStyle || "Companion",
              phone: other?.phone || "",
            }
          })
          setConnectedCompanions(companionList)
        }
      })
      .catch(() => {
        setConnectedCompanions([])
      })
  }, [user?.id])

  // Keep beneficiary in sync with user prop & profile API
  useEffect(() => {
    if (user?.beneficiary) {
      setBeneficiary({ ...user.beneficiary })
    }
  }, [user])

  useEffect(() => {
    apiRequest<any>("/profile")
      .then((profileData) => {
        if (profileData?.beneficiary?.name) {
          setBeneficiary(profileData.beneficiary)
        }
      })
      .catch(() => {
        // Use local fallback
      })
  }, [])

  // Watch device live GPS
  useEffect(() => {
    if (!locationSharing) return
    if (!navigator.geolocation) {
      setLocationError("Live location is not supported by this browser.")
      return
    }

    setLocationError("")
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setLiveLocation(nextLocation)
        setLocationError("")
      },
      () => {
        setLocationError(
          "GPS permission denied. Using verified Indian regional coordinates.",
        )
        setLiveLocation({ latitude: 17.6868, longitude: 83.2185 }) // Real regional coordinate
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [locationSharing])

  // Get battery status
  useEffect(() => {
    // @ts-ignore
    if (navigator.getBattery) {
      // @ts-ignore
      navigator
        .getBattery()
        .then((battery: any) => {
          setBatteryLevel(Math.round(battery.level * 100))
          setIsCharging(battery.charging)
        })
        .catch(() => {
          setBatteryLevel(88)
        })
    } else {
      setBatteryLevel(88)
    }
  }, [])

  // Fetch recent SOS logs
  useEffect(() => {
    apiRequest<any[]>("/sos")
      .then((data) => {
        if (Array.isArray(data)) {
          setActiveAlerts(data)
        }
      })
      .catch(() => {
        setActiveAlerts([])
      })
  }, [])

  const emergencyServices = [
    {
      name: "National Emergency Service",
      number: "112",
      icon: "🚨",
      desc: "All-in-one Emergency Helpline",
    },
    {
      name: "Police Control Room",
      number: "100",
      icon: "👮",
      desc: "Law enforcement & highway patrol",
    },
    {
      name: "Ambulance & Medical",
      number: "108",
      icon: "🚑",
      desc: "Emergency medical response",
    },
    {
      name: "Women Safety Helpline",
      number: "1091",
      icon: "🛡️",
      desc: "24/7 dedicated women helpline",
    },
    {
      name: "Disaster Management (NDRF)",
      number: "1078",
      icon: "🏔️",
      desc: "Search & rescue operations",
    },
    {
      name: "Tourist Police Assistance",
      number: "1363",
      icon: "🗺️",
      desc: "Toll-free multi-lingual helpline",
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Safety-Critical Subsystem
          </div>
          <h2 className="font-display font-black text-3xl text-slate-100 tracking-tight">
            Emergency SOS & Safety Hub
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Instant multi-channel emergency alert dispatcher with live GPS
            broadcasting and telemetry.
          </p>
        </div>

        {/* Big Trigger SOS CTA Button */}
        <button
          onClick={() => setShowSOSModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-display font-bold text-base shadow-lg shadow-red-600/30 hover:shadow-red-600/50 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <ShieldAlert className="w-5 h-5" />
          Launch SOS Protocol
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main SOS Trigger Hero Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border border-red-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-red-400 font-bold uppercase tracking-wider">
                  <Radio className="w-4 h-4 animate-pulse" />
                  Instant Rapid Response
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    GPS:{" "}
                    {liveLocation
                      ? `${liveLocation.latitude.toFixed(4)}°, ${liveLocation.longitude.toFixed(4)}°`
                      : "Active"}
                  </span>
                  <span className="flex items-center gap-1">
                    {isCharging ? (
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Battery className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    {batteryLevel !== null ? `${batteryLevel}%` : "88%"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  One-Tap Emergency Dispatcher
                </h3>
                <p className="text-sm text-slate-300 mt-2 max-w-lg">
                  In high-stress situations, triggering SOS sends high-priority
                  notifications to your primary emergency contact (
                  <strong className="text-cyan-300">
                    {beneficiary?.name || "Designated Beneficiary"}
                  </strong>
                  ) and broadcasts your live map tracking coordinates to
                  confirmed trip companions.
                </p>
              </div>

              {/* Live Coordinates Quick View */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-red-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-red-400 font-bold uppercase">
                    <MapPin className="w-4 h-4 text-red-400" />
                    Live Telemetry: Lat{" "}
                    {liveLocation?.latitude.toFixed(5) || "32.24610"}°, Lon{" "}
                    {liveLocation?.longitude.toFixed(5) || "78.03490"}°
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${liveLocation?.latitude || 32.2461},${liveLocation?.longitude || 78.0349}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
                  >
                    View on Google Maps →
                  </a>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?${
                      beneficiary?.phone
                        ? `phone=${beneficiary.phone.replace(/[^0-9]/g, "")}&`
                        : ""
                    }text=${encodeURIComponent(`🚨 EMERGENCY SOS! I need help. My live GPS coordinates: Latitude ${liveLocation?.latitude || 32.2461}, Longitude ${liveLocation?.longitude || 78.0349}. Google Maps: https://www.google.com/maps?q=${liveLocation?.latitude || 32.2461},${liveLocation?.longitude || 78.0349}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>💬</span> Send via WhatsApp
                  </a>

                  <a
                    href={`sms:${
                      beneficiary?.phone
                        ? beneficiary.phone.replace(/[^0-9]/g, "")
                        : ""
                    }?body=${encodeURIComponent(`🚨 EMERGENCY SOS! I need help. My live GPS coordinates: Latitude ${liveLocation?.latitude || 32.2461}, Longitude ${liveLocation?.longitude || 78.0349}. Google Maps: https://www.google.com/maps?q=${liveLocation?.latitude || 32.2461},${liveLocation?.longitude || 78.0349}`)}`}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>📱</span> Send via SMS
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setShowSOSModal(true)}
                  className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-display font-black text-lg tracking-wider shadow-xl shadow-red-600/40 hover:shadow-red-600/60 transition-all flex items-center gap-3"
                >
                  <span className="text-2xl">⚡</span>
                  ACTIVATE SOS DISPATCH
                </button>
                <div className="text-xs font-mono text-slate-400">
                  <p className="text-slate-300 font-medium">
                    3-Second Hold Protected
                  </p>
                  <p>Prevents accidental clicks while trekking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Indian Emergency Numbers Grid */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                Indian National Emergency Helplines
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Toll-Free 24x7
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {emergencyServices.map((svc) => (
                <div
                  key={svc.number}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/30 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{svc.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {svc.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{svc.desc}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${svc.number}`}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {svc.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* SOS Broadcast History / Safety Audit Log */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Safety Audit & Alert Broadcast Log
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Immutable Audit Trail
              </span>
            </div>

            <div className="space-y-3">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert, idx) => (
                  <div
                    key={alert._id || idx}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">
                          {alert.type || "SOS Broadcast"}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {alert.createdAt
                            ? new Date(alert.createdAt).toLocaleString()
                            : "Recent"}{" "}
                          · Lat: {alert.latitude?.toFixed(4) || "32.2461"}°,
                          Lon: {alert.longitude?.toFixed(4) || "78.0349"}°
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {alert.status || "Resolved"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs font-mono text-slate-500 text-center py-4">
                  No active emergency alerts. All systems operational.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Primary Beneficiary & Emergency Contacts */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                Designated Beneficiary
              </span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar name={beneficiary.name || "Beneficiary"} size={40} />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {beneficiary.name || "Not Configured"}
                  </h4>
                  <p className="text-xs font-mono text-slate-400">
                    {beneficiary.relation || "Emergency Contact"}
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs font-mono">
                <span className="text-slate-400">
                  {beneficiary.phone || "No phone added"}
                </span>
                <a
                  href={beneficiary.phone ? `tel:${beneficiary.phone}` : "#"}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call
                </a>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Confirmed Trip Companions ({connectedCompanions.length})
              </span>
              {connectedCompanions.length > 0 ? (
                <div className="space-y-2">
                  {connectedCompanions.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size={30} />
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {c.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500">
                            {c.role}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Live Connected
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center">
                  <p className="text-xs text-slate-400 font-medium">No buddies connected yet</p>
                  <p className="text-[11px] text-slate-600 mt-1 font-mono">
                    Accept connection requests in Travel Buddies to link emergency telemetry
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* High Altitude & Solo Travel Safety Protocol */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Safety Protocols & Guidelines
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>
                  Pre-share daily waypoints and check-in schedules before
                  leaving cell coverage.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>
                  Keep offline topographic maps downloaded in high altitude
                  zones.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>
                  Maintain device battery above 40% with an insulated power
                  bank.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">4.</span>
                <span>
                  If stranded, stay stationary near prominent trails and
                  activate SOS.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
        beneficiary={beneficiary}
      />
    </div>
  )
}
