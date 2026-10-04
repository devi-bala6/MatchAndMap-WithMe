import { useState } from "react"
import type { View } from "../types"
import { apiRequest } from "../lib/api"
import Logo from "../components/Logo"

interface AuthProps {
  mode: "login" | "register"
  onNav: (v: View) => void
  onLogin: (user: any) => void
  onRegister: (user: any) => void
}

export default function Auth({ mode, onNav, onLogin, onRegister }: AuthProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetStage, setResetStage] = useState<"email" | "otp" | "newPassword">(
    "email",
  )
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const isLogin = mode === "login"

  function resetForgotState() {
    setIsForgotPassword(false)
    setResetStage("email")
    setOtp("")
    setNewPassword("")
    setNewPasswordConfirm("")
    setSuccess("")
    setError("")
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()

    if (!cleanEmail || !password) {
      setError("Please fill in all required fields.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    if (!isLogin && cleanName.length < 2) {
      setError("Please enter your full name (at least 2 characters).")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    if (!isLogin && password !== confirm) {
      setError("Passwords do not match. Please re-enter your password.")
      return
    }

    setLoading(true)

    try {
      const result = await apiRequest<{ token: string; user: any }>(
        isLogin ? "/auth/login" : "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: cleanName || undefined,
            email: cleanEmail,
            password,
          }),
        },
      )
      localStorage.setItem("travel_companion_token", result.token)
      localStorage.setItem("travel_companion_user", JSON.stringify(result.user))
      if (isLogin) onLogin(result.user)
      else onRegister(result.user)
    } catch (requestError: any) {
      console.error("Authentication error:", requestError)
      let msg = requestError?.message || "Authentication failed. Please check your credentials."
      if (isLogin && (msg.toLowerCase().includes("invalid email") || msg.toLowerCase().includes("invalid credentials"))) {
        msg = "No account found with this email or incorrect password. Please click 'Create account' below to register first."
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email) {
      setError("Please enter your email address.")
      return
    }

    try {
      const result = await apiRequest<{ message: string debugOtp?: string }>(
        "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      )

      const otpMessage = result.debugOtp ? ` Demo OTP: ${result.debugOtp}` : ""
      setSuccess(`${result.message}${otpMessage}`)
      setResetStage("otp")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send reset code",
      )
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code sent to your email.")
      return
    }

    try {
      const result = await apiRequest<{ message: string }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      })
      setSuccess(result.message)
      setResetStage("newPassword")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to verify OTP",
      )
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (newPassword !== newPasswordConfirm) {
      setError("New passwords do not match.")
      return
    }

    try {
      const result = await apiRequest<{ message: string }>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({ email, otp, password: newPassword }),
        },
      )
      setSuccess(result.message)
      setPassword("")
      setNewPassword("")
      setNewPasswordConfirm("")
      setOtp("")
      setTimeout(() => {
        setIsForgotPassword(false)
        setResetStage("email")
      }, 1500)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset password",
      )
    }
  }

  if (isLogin && isForgotPassword) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#080d1a" }}
      >
        <div
          className="w-full max-w-md rounded-2xl border p-7"
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            borderColor: "rgba(148, 163, 184, 0.18)",
          }}
        >
          <div className="mb-6">
            <p className="font-mono text-xs mb-2" style={{ color: "#0ea5e9" }}>
              PASSWORD RESET
            </p>
            <h2
              className="font-display font-bold text-3xl"
              style={{ color: "#e2e8f0" }}
            >
              {resetStage === "email"
                ? "Forgot password"
                : resetStage === "otp"
                  ? "Verify your code"
                  : "Set a new password"}
            </h2>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg font-mono text-xs"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-4 px-4 py-3 rounded-lg font-mono text-xs"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#4ade80",
              }}
            >
              {success}
            </div>
          )}

          {resetStage === "email" && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label
                  className="block font-display font-medium text-sm mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full py-3 text-base"
              >
                Send reset code
              </button>
            </form>
          )}

          {resetStage === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label
                  className="block font-display font-medium text-sm mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  6-digit OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full py-3 text-base"
              >
                Verify OTP
              </button>
            </form>
          )}

          {resetStage === "newPassword" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label
                  className="block font-display font-medium text-sm mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  New password
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
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full py-3 text-base"
              >
                Reset password
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={resetForgotState}
              className="font-display font-semibold text-sm"
              style={{ color: "#0ea5e9" }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#080d1a" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          width: 480,
          background: "linear-gradient(135deg, #0d1525 0%, #080d1a 100%)",
          borderRight: "1px solid #1a2845",
        }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 map-grid opacity-60" />

        {/* Glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 400,
            height: 400,
            bottom: "10%",
            left: "-20%",
            background:
              "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        <div className="relative z-10">
          <button
            onClick={() => onNav("landing")}
            className="flex items-center gap-3"
          >
            <Logo size={42} showText={true} textSize="md" />
          </button>
        </div>

        <div className="relative z-10">
          <p className="font-mono text-xs mb-4" style={{ color: "#0ea5e9" }}>
            JOIN 2,847 TRAVELERS
          </p>
          <h2
            className="font-display font-black text-4xl leading-tight mb-6"
            style={{ color: "#e2e8f0" }}
          >
            Every great journey
            <br />
            starts with a
            <br />
            <span style={{ color: "#0ea5e9" }}>single match.</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>
            Verified profiles. Smart compatibility. Emergency SOS. Match&Map
            with me is the safest way to find your next adventure companion.
          </p>
        </div>

        <div className="relative z-10">
          <div
            className="p-4 rounded-xl"
            style={{
              background: "rgba(14,165,233,0.06)",
              border: "1px solid rgba(14,165,233,0.15)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&auto=format"
                alt="Sofia"
                className="rounded-full object-cover"
                style={{ width: 36, height: 36 }}
                loading="lazy"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&auto=format"
                }}
              />
              <div>
                <p
                  className="font-display font-semibold text-sm"
                  style={{ color: "#e2e8f0" }}
                >
                  Sofia Andersen
                </p>
                <p className="font-mono text-xs" style={{ color: "#475569" }}>
                  Copenhagen · 9 trips
                </p>
              </div>
              <span className="ml-auto badge badge-cyan">94% match</span>
            </div>
            <p className="text-xs" style={{ color: "#64748b" }}>
              "Traveling to Kyoto in November. Looking for a photographer with
              cultural curiosity."
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-10 sm:py-12">
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo header */}
          <div className="lg:hidden mb-6 flex justify-center">
            <button onClick={() => onNav("landing")}>
              <Logo size={42} showText={true} textSize="md" />
            </button>
          </div>

          <div className="mb-8">
            <h1
              className="font-display font-bold text-3xl mb-2"
              style={{ color: "#e2e8f0" }}
            >
              {isLogin ? "Welcome back." : "Create your account."}
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              {isLogin
                ? "Sign in to find your travel companions."
                : "Join Match&Map with me and start matching with verified travelers."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label
                  className="block font-display font-medium text-sm mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
            )}

            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                className="block font-display font-medium text-sm mb-2"
                style={{ color: "#94a3b8" }}
              >
                Password{" "}
                {!isLogin && (
                  <span className="text-xs font-normal text-slate-400">
                    (min. 6 characters)
                  </span>
                )}
              </label>
              <input
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label
                  className="block font-display font-medium text-sm mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div
                className="px-4 py-3 rounded-lg font-mono text-xs"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                }}
              >
                {error}
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true)
                    setError("")
                    setSuccess("")
                    setResetStage("email")
                  }}
                  className="font-display text-sm"
                  style={{ color: "#0ea5e9" }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            {!isLogin && (
              <p className="text-xs text-center mt-2" style={{ color: "#475569" }}>
                By creating an account, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm" style={{ color: "#64748b" }}>
              {isLogin
                ? "New to Match&Map with me? "
                : "Already have an account? "}
            </span>
            <button
              onClick={() => {
                setError("")
                onNav(isLogin ? "register" : "login")
              }}
              className="font-display font-semibold text-sm"
              style={{ color: "#0ea5e9" }}
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>

          {/* JWT info badge */}
          <div
            className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(34,197,94,0.05)",
              border: "1px solid rgba(34,197,94,0.15)",
            }}
          >
            <span style={{ color: "#4ade80", fontSize: 16 }}>🔒</span>
            <p className="font-mono text-xs" style={{ color: "#475569" }}>
              Secured with JWT authentication · End-to-end encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
