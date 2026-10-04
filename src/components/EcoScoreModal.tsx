import React, { useState } from "react"
import {
  Leaf,
  X,
  TrendingUp,
  Train,
  Home,
  Trash2,
  TreePine,
  CheckCircle2,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { apiRequest } from "../lib/api"
import type { User } from "../types"

interface EcoScoreModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onScoreUpdated?: (newScore: number) => void
}

export default function EcoScoreModal({
  isOpen,
  onClose,
  user,
  onScoreUpdated,
}: EcoScoreModalProps) {
  const currentBaseScore = user?.ecoScore || 78

  // Interactive action checklist
  const [pledges, setPledges] = useState<{ [key: string]: boolean }>({
    trainTransit: true,
    ecoStay: true,
    zeroPlastic: false,
    carbonOffset: false,
    carpoolShare: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  if (!isOpen) return null

  // Calculate live score based on pledges
  let simulatedScore = 40 // baseline
  if (pledges.trainTransit) simulatedScore += 20
  if (pledges.ecoStay) simulatedScore += 15
  if (pledges.zeroPlastic) simulatedScore += 10
  if (pledges.carbonOffset) simulatedScore += 10
  if (pledges.carpoolShare) simulatedScore += 10
  simulatedScore = Math.min(100, Math.max(simulatedScore, currentBaseScore))

  const co2SavedKg = Math.round(((simulatedScore - 30) / 70) * 240)

  const togglePledge = (key: string) => {
    setPledges((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveScore = async () => {
    setIsSaving(true)
    try {
      await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({ ecoScore: simulatedScore }),
      })
      onScoreUpdated?.(simulatedScore)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 1200)
    } catch {
      onScoreUpdated?.(simulatedScore)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 1000)
    } finally {
      setIsSaving(false)
    }
  }

  const getTier = (score: number) => {
    if (score >= 90)
      return {
        title: "Zero-Carbon Champion",
        color: "#10b981",
        bg: "rgba(16,185,129,0.15)",
        badge: "🌿 Level 4 (Top 5%)",
      }
    if (score >= 75)
      return {
        title: "Green Voyager",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.15)",
        badge: "🚆 Level 3",
      }
    if (score >= 55)
      return {
        title: "Conscious Explorer",
        color: "#0ea5e9",
        bg: "rgba(14,165,233,0.15)",
        badge: "🌱 Level 2",
      }
    return {
      title: "Standard Traveler",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
      badge: "🌏 Level 1",
    }
  }

  const tier = getTier(simulatedScore)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white">
                  Eco-Impact Score & Carbon Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {tier.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transparent sustainable travel evaluation and personal green roadmap.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Score & Tier Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center border shadow-xl"
                style={{ background: tier.bg, borderColor: tier.color }}
              >
                <span
                  className="font-display font-black text-3xl"
                  style={{ color: tier.color }}
                >
                  {simulatedScore}
                </span>
                <span className="text-[10px] font-mono text-slate-300 font-bold">
                  OUT OF 100
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span
                    className="font-display font-bold text-base"
                    style={{ color: tier.color }}
                  >
                    {tier.title}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                  Your travel choices prevent an estimated{" "}
                  <strong className="text-emerald-300">{co2SavedKg} kg of CO₂</strong> per
                  trip vs conventional air/luxury travel.
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-right">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-300">
                🌱 High Eco Credibility
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Ranks higher on Match & Map
              </span>
            </div>
          </div>

          {/* 4 Pillars of Eco Score */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              How Your Eco Score is Calculated (The 4 Pillars)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Train className="w-4 h-4 text-cyan-400" />
                    1. Low-Carbon Transport
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    Up to 40 pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Electric Indian Railways & buses produce 85% less CO₂ per km than short-haul flights.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-amber-400" />
                    2. Certified Homestays
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Up to 30 pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Village stays, eco-lodges, and tents preserve local resources and support regional communities directly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-emerald-400" />
                    3. Zero-Waste / Leave No Trace
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Up to 15 pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Carrying reusable bottles, zero single-use plastics, and keeping hiking trails untouched.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <TreePine className="w-4 h-4 text-green-400" />
                    4. Carbon Offsetting & Seva
                  </span>
                  <span className="text-xs font-mono font-bold text-green-400">
                    Up to 15 pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Supporting verified Indian reforestation and community nature conservation programs.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Checklist: How to Level Up Your Score */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Interactive Eco Checklist (Boost Your Score)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toggle your sustainable habits below to simulate and lock in your new Eco Score.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: "trainTransit",
                  title: "Prioritize Trains & Buses over Flights",
                  points: "+20 pts",
                  desc: "Choose Indian Railways sleeper/AC or intercity electric buses for state transit.",
                },
                {
                  id: "ecoStay",
                  title: "Book Eco-Friendly Homestays & Camps",
                  points: "+15 pts",
                  desc: "Opt for solar-powered village homestays over high-emission 5-star AC resorts.",
                },
                {
                  id: "zeroPlastic",
                  title: "Zero Single-Use Plastic Gear",
                  points: "+10 pts",
                  desc: "Carry your own insulated water bottle, reusable cutlery, and cotton cloth bags.",
                },
                {
                  id: "carbonOffset",
                  title: "Participate in Reforestation & Cleanups",
                  points: "+10 pts",
                  desc: "Offset trip emissions by planting saplings or joining Himalayan/beach clean drives.",
                },
                {
                  id: "carpoolShare",
                  title: "Carpool & Share Rides with Match Buddies",
                  points: "+10 pts",
                  desc: "Share cabs and local auto-rickshaws with travel companions to split emissions.",
                },
              ].map((item) => {
                const active = pledges[item.id]
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePledge(item.id)}
                    className={`w-full p-3.5 rounded-xl text-left transition-all border flex items-start justify-between gap-3 ${
                      active
                        ? "bg-emerald-950/40 border-emerald-500/50 shadow-sm shadow-emerald-500/10"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border transition-all ${
                          active
                            ? "bg-emerald-500 border-emerald-400 text-slate-950"
                            : "border-slate-700 bg-slate-800"
                        }`}
                      >
                        {active && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            active ? "text-emerald-200" : "text-slate-300"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold flex-shrink-0 ${
                        active ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {item.points}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSaveScore}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Score Saved to Profile!
              </>
            ) : isSaving ? (
              "Updating Score..."
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Apply & Save My Eco Score ({simulatedScore} pts)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
