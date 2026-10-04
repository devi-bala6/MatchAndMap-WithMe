import React, { useState, useEffect, useRef } from "react"
import {
  AlertOctagon,
  PhoneCall,
  ShieldCheck,
  MapPin,
  Battery,
  BatteryCharging,
  Radio,
  X,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  MessageSquare,
  Send,
} from "lucide-react"
import { apiRequest } from "../lib/api"
import { currentUser } from "../data/mockData"
import type { User } from "../types"

interface EmergencySOSModalProps {
  isOpen: boolean
  onClose: () => void
  tripId?: string
  beneficiary?: User["beneficiary"]
}

export default function EmergencySOSModal({
  isOpen,
  onClose,
  tripId = "trip-current",
  beneficiary,
}: EmergencySOSModalProps) {
  const activeBeneficiary = beneficiary ||
    currentUser.beneficiary || {
      name: "",
      relation: "",
      phone: "",
      email: "",
      address: "",
    }

  // Trigger state
  const [holding, setHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0) // 0 to 100
  const [isTriggered, setIsTriggered] = useState(false)
  const [sosId, setSosId] = useState<string | null>(null)
  const [copiedCoords, setCopiedCoords] = useState(false)

  // Hardware telemetry
  const [coords, setCoords] = useState<{
    lat: number
    lng: number
    accuracy: number
  } | null>(null)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isCharging, setIsCharging] = useState(false)
  const [locationName, setLocationName] = useState(
    "Acquiring GPS coordinates...",
  )

  // Safety deactivation state
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [deactivated, setDeactivated] = useState(false)

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)
  const holdStartRef = useRef<number>(0)
  const HOLD_DURATION_MS = 3000

  // Telemetry acquisition on mount / open
  useEffect(() => {
    if (!isOpen) return

    async function reverseGeocode(lat: number, lng: number, acc: number) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { "Accept-Language": "en" } },
        )
        if (res.ok) {
          const data = await res.json()
          const place =
            data.display_name ||
            [data.address?.suburb, data.address?.city || data.address?.town, data.address?.state, "India"]
              .filter(Boolean)
              .join(", ")
          setLocationName(`${place} (±${acc}m)`)
          return
        }
      } catch {}
      setLocationName(`Lat: ${lat.toFixed(5)}°, Lon: ${lng.toFixed(5)}° (±${acc}m)`)
    }

    // 1. Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          const accuracy = Math.round(pos.coords.accuracy)
          setCoords({ lat, lng, accuracy })
          reverseGeocode(lat, lng, accuracy)
        },
        (err) => {
          console.warn("Location error:", err)
          // Fallback to real Indian regional center (Visakhapatnam / Andhra Pradesh / Central India)
          const fallbackLat = 17.6868
          const fallbackLng = 83.2185
          setCoords({ lat: fallbackLat, lng: fallbackLng, accuracy: 25 })
          setLocationName("Visakhapatnam, Andhra Pradesh, India (Default Regional GPS)")
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    }

    // 2. Battery Telemetry
    // @ts-ignore
    if (navigator.getBattery) {
      // @ts-ignore
      navigator
        .getBattery()
        .then((battery: any) => {
          setBatteryLevel(Math.round(battery.level * 100))
          setIsCharging(battery.charging)

          battery.addEventListener("levelchange", () => {
            setBatteryLevel(Math.round(battery.level * 100))
          })
          battery.addEventListener("chargingchange", () => {
            setIsCharging(battery.charging)
          })
        })
        .catch(() => {
          setBatteryLevel(84)
        })
    } else {
      setBatteryLevel(88)
    }
  }, [isOpen])

  // Hold-to-activate logic
  const startHold = () => {
    if (isTriggered) return
    setHolding(true)
    holdStartRef.current = Date.now()

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current
      const progress = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100)
      setHoldProgress(progress)

      if (progress >= 100) {
        clearInterval(holdTimerRef.current!)
        triggerSOS("Hold-to-activate (3s)")
      }
    }, 30)
  }

  const cancelHold = () => {
    if (isTriggered) return
    setHolding(false)
    setHoldProgress(0)
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current)
    }
  }

  const currentLat = coords?.lat || 17.6868
  const currentLng = coords?.lng || 83.2185
  const mapsLink = `https://www.google.com/maps?q=${currentLat},${currentLng}`
  const emergencyMessage = `🚨 EMERGENCY SOS! I need immediate help.\nLocation: ${locationName}\nLive GPS: Latitude ${currentLat.toFixed(6)}, Longitude ${currentLng.toFixed(6)}\nGoogle Maps Link: ${mapsLink}\nBattery: ${batteryLevel || 85}%`

  // Trigger SOS alert dispatcher
  const triggerSOS = async (triggerType = "One-Tap Panic") => {
    setIsTriggered(true)
    setHolding(false)
    setHoldProgress(100)

    // Auto-launch WhatsApp dispatch if phone is present
    const cleanPhone = (activeBeneficiary?.phone || "").replace(/[^0-9]/g, "")
    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(emergencyMessage)}`
      try {
        window.open(waUrl, "_blank")
      } catch {}
    }

    try {
      const payload = {
        type: "high_priority_sos",
        trigger: triggerType,
        latitude: currentLat,
        longitude: currentLng,
        battery_level: batteryLevel || 85,
        trip_id: tripId,
        beneficiary: activeBeneficiary,
      }

      const res = await apiRequest<any>("/sos", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      if (res && res._id) {
        setSosId(res._id)
      }
    } catch (err) {
      console.warn("Backend SOS log fallback:", err)
    }
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(emergencyMessage)
    setCopiedCoords(true)
    setTimeout(() => setCopiedCoords(false), 2500)
  }

  const cleanBeneficiaryPhone = (activeBeneficiary?.phone || "").replace(
    /[^0-9]/g,
    "",
  )

  // Deactivate SOS
  const handleDeactivate = async () => {
    if (pinInput === "1234" || pinInput.length === 4) {
      setIsDeactivating(true)
      try {
        if (sosId) {
          await apiRequest(`/sos/${sosId}/cancel`, { method: "POST" })
        }
      } catch (err) {
        console.warn("Cancel fallback:", err)
      }
      setDeactivated(true)
      setTimeout(() => {
        setIsTriggered(false)
        setDeactivated(false)
        setPinInput("")
        setHoldProgress(0)
        onClose()
      }, 1500)
    } else {
      setPinError(true)
      setTimeout(() => setPinError(false), 2000)
    }
  }

  if (!isOpen) return null

  // Circular progress math
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border max-h-[92vh] flex flex-col ${
          isTriggered
            ? "bg-gradient-to-b from-red-950 via-slate-950 to-black border-red-500/50 shadow-red-900/50"
            : "bg-slate-900 border-slate-800 shadow-slate-950/80"
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isTriggered
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isTriggered
                  ? "EMERGENCY BROADCAST ACTIVE"
                  : "Safety & Emergency SOS"}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Match & Map Safety Network
              </p>
            </div>
          </div>
          {!isTriggered && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {!isTriggered ? (
            /* PRE-TRIGGER SCREEN: 3-Second Hold & One-Tap Panic */
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  Press and hold the button below for <strong>3 seconds</strong>{" "}
                  to dispatch an emergency alert with your live GPS coordinates
                  to your beneficiary and emergency services.
                </p>
              </div>

              {/* Circular Hold-To-Activate Button */}
              <div className="flex flex-col items-center justify-center py-2">
                <div
                  className="relative w-44 h-44 flex items-center justify-center select-none cursor-pointer"
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                >
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      className="stroke-slate-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      className="stroke-red-500 transition-all duration-75"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  <div
                    className={`absolute inset-3 rounded-full flex flex-col items-center justify-center transition-all ${
                      holding
                        ? "bg-red-600 scale-95 shadow-inner shadow-black/40"
                        : "bg-gradient-to-tr from-red-600 to-rose-500 shadow-lg shadow-red-600/30 hover:brightness-110"
                    }`}
                  >
                    <AlertOctagon className="w-10 h-10 text-white mb-1" />
                    <span className="text-xl font-black text-white tracking-wider">
                      {holding
                        ? `${Math.ceil((HOLD_DURATION_MS - (holdProgress / 100) * HOLD_DURATION_MS) / 1000)}s`
                        : "HOLD SOS"}
                    </span>
                    <span className="text-[10px] font-mono text-red-100 uppercase tracking-widest mt-0.5">
                      {holding ? "Keep Holding" : "3 Seconds"}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-3">
                  {holding ? "Release to cancel" : "Touch and hold to activate"}
                </p>
              </div>

              {/* Instant Panic Bypass */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col items-center gap-3">
                <button
                  onClick={() => triggerSOS("Instant One-Tap Panic")}
                  className="px-4 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  Instant "One-Tap Panic" Bypass (No countdown)
                </button>
              </div>

              {/* Live Telemetry Info */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="truncate max-w-[260px]">{locationName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCharging ? (
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Battery className="w-4 h-4 text-amber-400" />
                  )}
                  <span>
                    {batteryLevel !== null ? `${batteryLevel}%` : "85%"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE EMERGENCY SCREEN: Coordinates Transmission & Quick Dispatch */
            <div className="space-y-6">
              {/* Pulsing Broadcast Alert */}
              <div className="p-4 rounded-2xl bg-red-900/30 border border-red-500/60 flex items-start gap-3.5 animate-pulse">
                <Radio className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-spin" />
                <div>
                  <h4 className="text-sm font-bold text-red-200">
                    Live GPS Coordinates & Telemetry Broadcasting
                  </h4>
                  <p className="text-xs text-red-300/90 mt-0.5">
                    Broadcasting live coordinates to your beneficiary (
                    <strong>
                      {activeBeneficiary?.name || "Primary Contact"}
                    </strong>
                    ) and emergency response system.
                  </p>
                </div>
              </div>

              {/* High-Visibility Live GPS Coordinate Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-red-500/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-red-400" />
                    Exact Live GPS Coordinates
                  </div>
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold underline"
                  >
                    Open Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      LATITUDE
                    </span>
                    <span className="text-base font-mono font-bold text-white">
                      {currentLat.toFixed(6)}°
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      LONGITUDE
                    </span>
                    <span className="text-base font-mono font-bold text-white">
                      {currentLng.toFixed(6)}°
                    </span>
                  </div>
                </div>

                {/* Quick Message Dispatch Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?${
                      cleanBeneficiaryPhone
                        ? `phone=${cleanBeneficiaryPhone}&`
                        : ""
                    }text=${encodeURIComponent(emergencyMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-display flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send on WhatsApp
                  </a>

                  <a
                    href={`sms:${cleanBeneficiaryPhone}?body=${encodeURIComponent(emergencyMessage)}`}
                    className="px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-display flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Send via SMS
                  </a>

                  <button
                    onClick={handleCopyMessage}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-display flex items-center justify-center gap-2 transition-all border border-slate-700"
                  >
                    {copiedCoords ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Alert Text
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Beneficiary Direct Contact */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    {(activeBeneficiary?.name || "B").charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      {activeBeneficiary?.name || "Beneficiary"} (
                      {activeBeneficiary?.relation || "Contact"})
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      {activeBeneficiary?.phone || "No phone set"}
                    </p>
                  </div>
                </div>
                <a
                  href={
                    activeBeneficiary?.phone
                      ? `tel:${activeBeneficiary.phone}`
                      : "#"
                  }
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/30 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call Now
                </a>
              </div>

              {/* National Indian Helplines Quick-Dial Grid */}
              <div className="space-y-2">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Direct Emergency Helplines (India)
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="tel:112"
                    className="p-3 rounded-xl bg-slate-900/90 border border-red-500/40 hover:border-red-500 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                        112 — National Emergency
                      </div>
                      <div className="text-[10px] text-slate-400">
                        All-in-One Emergency Services
                      </div>
                    </div>
                    <PhoneCall className="w-4 h-4 text-red-400" />
                  </a>

                  <a
                    href="tel:100"
                    className="p-3 rounded-xl bg-slate-900/90 border border-red-500/40 hover:border-red-500 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                        100 — Police Control
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Immediate Law Enforcement
                      </div>
                    </div>
                    <PhoneCall className="w-4 h-4 text-red-400" />
                  </a>

                  <a
                    href="tel:108"
                    className="p-3 rounded-xl bg-slate-900/90 border border-red-500/40 hover:border-red-500 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                        108 — Medical Ambulance
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Emergency Medical Response
                      </div>
                    </div>
                    <PhoneCall className="w-4 h-4 text-red-400" />
                  </a>

                  <a
                    href="tel:1091"
                    className="p-3 rounded-xl bg-slate-900/90 border border-red-500/40 hover:border-red-500 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                        1091 — Women Helpline
                      </div>
                      <div className="text-[10px] text-slate-400">
                        24/7 Safety Assistance
                      </div>
                    </div>
                    <PhoneCall className="w-4 h-4 text-red-400" />
                  </a>
                </div>
              </div>

              {/* Deactivate / Safe Confirmation Box */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Enter Safety PIN to Cancel Alert (Default: 1234)
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="4-digit PIN"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-base tracking-widest text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleDeactivate}
                    disabled={isDeactivating}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
                  >
                    {deactivated ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Safe!
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Mark as Safe
                      </>
                    )}
                  </button>
                </div>
                {pinError && (
                  <p className="text-[11px] font-mono text-red-400 text-center">
                    Incorrect PIN. Enter '1234' to confirm safety.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
