import { useState, useEffect, useMemo } from "react"
import type { User, Trip } from "../types"
import Avatar from "../components/Avatar"
import { apiRequest } from "../lib/api"

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"users" | "trips">("users")
  const [usersList, setUsersList] = useState<User[]>([])
  const [tripsList, setTripsList] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "admin" | "traveler" | "verified" | "banned">("all")
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ type, message })
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr))
    }, 4000)
  }

  async function loadData() {
    setLoading(true)
    try {
      const [users, liveTrips] = await Promise.all([
        apiRequest<User[]>("/admin/users").catch(() => []),
        apiRequest<Trip[]>("/trips").catch(() => []),
      ])
      if (Array.isArray(users)) {
        setUsersList(users)
      }
      if (Array.isArray(liveTrips)) {
        setTripsList(liveTrips)
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to load admin data", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Action: Toggle Verify
  async function handleVerifyUser(userId: string, currentVerified: boolean) {
    try {
      await apiRequest(`/admin/users/${userId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ verified: !currentVerified }),
      })
      setUsersList((prev) =>
        prev.map((u) =>
          (u.id || u._id) === userId ? { ...u, verified: !currentVerified } : u
        )
      )
      showToast(!currentVerified ? "User marked as Verified ✓" : "User verification revoked")
    } catch {
      showToast("Failed to update user verification", "error")
    }
  }

  // Action: Toggle Ban/Active
  async function handleToggleBanUser(userId: string, currentStatus?: string) {
    const nextStatus = currentStatus === "banned" ? "active" : "banned"
    try {
      await apiRequest(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      })
      setUsersList((prev) =>
        prev.map((u) =>
          (u.id || u._id) === userId ? { ...u, status: nextStatus } : u
        )
      )
      showToast(nextStatus === "banned" ? "User account has been banned" : "User account restored to active")
    } catch {
      showToast("Failed to update user status", "error")
    }
  }

  // Action: Permanently Delete User
  async function handleDeleteUser(userId: string, userName: string) {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete user "${userName}"? This will erase their profile and account permanently.`
      )
    ) {
      return
    }
    try {
      await apiRequest(`/admin/users/${userId}`, { method: "DELETE" })
      setUsersList((prev) => prev.filter((u) => (u.id || u._id) !== userId))
      showToast(`User "${userName}" was permanently deleted.`)
    } catch {
      showToast("Failed to delete user account", "error")
    }
  }

  // Action: Delete Trip
  async function handleDeleteTrip(tripId: string, destination: string) {
    if (
      !window.confirm(
        `Are you sure you want to remove the trip to "${destination}"? This action cannot be undone.`
      )
    ) {
      return
    }
    try {
      await apiRequest(`/trips/${tripId}`, { method: "DELETE" })
      setTripsList((prev) => prev.filter((t) => (t.id || t._id) !== tripId))
      showToast(`Trip to "${destination}" deleted successfully.`)
    } catch {
      showToast("Failed to delete trip", "error")
    }
  }

  // Filtered Users (Search + Filter Pill)
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q) ||
        u.state?.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (userRoleFilter === "admin") return u.role === "admin"
      if (userRoleFilter === "traveler") return u.role !== "admin"
      if (userRoleFilter === "verified") return !!u.verified
      if (userRoleFilter === "banned") return u.status === "banned"

      return true
    })
  }, [usersList, searchQuery, userRoleFilter])

  // Filtered Trips (Search)
  const filteredTrips = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return tripsList.filter((t) => {
      if (!q) return true
      return (
        t.destination?.toLowerCase().includes(q) ||
        t.state?.toLowerCase().includes(q) ||
        t.userName?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      )
    })
  }, [tripsList, searchQuery])

  // CSV Exports
  function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleExportUsers() {
    const headers = ["Name", "Email", "Role", "Verified", "Status", "City", "State", "Trips Count"]
    const rows = filteredUsers.map((u) => [
      u.name,
      u.email,
      u.role || "traveler",
      u.verified ? "Yes" : "No",
      u.status || "active",
      u.city || "",
      u.state || "",
      u.tripsCount || 0,
    ])
    exportCsv(`registered-users-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  function handleExportTrips() {
    const headers = ["Destination", "State", "Host", "Start Date", "End Date", "Budget", "Spots", "Status"]
    const rows = filteredTrips.map((t) => [
      t.destination,
      t.state,
      t.userName || "Traveler",
      t.startDate,
      t.endDate,
      t.budgetAmount ? `₹${t.budgetAmount}` : t.budget,
      `${t.approvedUsers?.length || 0}/${t.maxCompanions || 4}`,
      t.status,
    ])
    exportCsv(`published-trips-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  // Real KPIs strictly from live database lists
  const totalUsersCount = usersList.length
  const totalAdminsCount = usersList.filter((u) => u.role === "admin").length
  const totalVerifiedCount = usersList.filter((u) => u.verified).length
  const totalTripsCount = tripsList.length

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all shadow-sm ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 mb-3">
              <span>🛡️</span>
              <span>ADMIN CONTROL PANEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Platform Administration
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Live moderation of registered user profiles, security verification, and travel listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh database records"
            >
              <span className={loading ? "animate-spin" : ""}>🔄</span>
              <span>{loading ? "Refreshing..." : "Refresh Data"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Users</span>
            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-base">👥</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
            {totalUsersCount}
          </div>
          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">Live database records</div>
        </div>

        {/* Verified Travelers */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Verified Users</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-base">✓</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">
            {totalVerifiedCount}
          </div>
          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">ID / Aadhaar verified</div>
        </div>

        {/* Platform Admins */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Admins</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-base">🛡️</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-display">
            {totalAdminsCount}
          </div>
          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">Platform administrators</div>
        </div>

        {/* Published Trips */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Published Trips</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-base">✈️</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-display">
            {totalTripsCount}
          </div>
          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">Active itineraries</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => {
            setActiveTab("users")
            setSearchQuery("")
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "users"
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>👤 User Moderation</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === "users"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {usersList.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("trips")
            setSearchQuery("")
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "trips"
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>✈️ Trip Moderation</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === "trips"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {tripsList.length}
          </span>
        </button>
      </div>

      {/* USERS TAB CONTENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, city, or state..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Roles & Status</option>
                <option value="admin">Admins Only</option>
                <option value="traveler">Travelers Only</option>
                <option value="verified">Verified Only</option>
                <option value="banned">Banned Only</option>
              </select>

              <button
                onClick={handleExportUsers}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="animate-spin text-lg">🔄</span>
                          <span>Loading registered users from database...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-600 dark:text-slate-400">No users found</p>
                          <p className="text-xs mt-1">Try clearing your search query or role filter.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userId = (user.id || user._id) as string
                    const isAdmin = user.role === "admin"
                    const isBanned = user.status === "banned"

                    return (
                      <tr
                        key={userId}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* User Profile */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name || "User"} size={36} />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {user.city && user.state
                                  ? `${user.city}, ${user.state}`
                                  : user.city || user.state || "India"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {user.email}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              🛡️ Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              ✈️ Traveler
                            </span>
                          )}
                        </td>

                        {/* Verification */}
                        <td className="px-5 py-4">
                          {user.verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              ⏳ Pending
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {isBanned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              🚫 Banned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle verify */}
                            <button
                              type="button"
                              onClick={() => handleVerifyUser(userId, !!user.verified)}
                              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                user.verified
                                  ? "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  : "border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100"
                              }`}
                              title={user.verified ? "Revoke Verification" : "Approve Verification"}
                            >
                              {user.verified ? "Unverify" : "Verify"}
                            </button>

                            {/* Toggle ban */}
                            <button
                              type="button"
                              onClick={() => handleToggleBanUser(userId, user.status)}
                              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                isBanned
                                  ? "border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100"
                                  : "border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100"
                              }`}
                              title={isBanned ? "Unban User" : "Ban User"}
                            >
                              {isBanned ? "Unban" : "Ban"}
                            </button>

                            {/* Delete User */}
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(userId, user.name)}
                              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                              title="Permanently Delete User"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRIPS TAB CONTENT */}
      {activeTab === "trips" && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trips by destination, state, or host..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTrips}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          {/* Trips Table */}
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Companions
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="animate-spin text-lg">🔄</span>
                          <span>Loading published trips from database...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-600 dark:text-slate-400">No trips found</p>
                          <p className="text-xs mt-1">No trips currently match your search criteria.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip) => {
                    const tripId = (trip.id || trip._id) as string
                    const hostName = trip.userName || "Traveler"

                    return (
                      <tr
                        key={tripId}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Destination */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {trip.destination}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {trip.state}
                          </p>
                        </td>

                        {/* Host */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={hostName} size={28} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {hostName}
                            </span>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-5 py-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                          {trip.startDate
                            ? new Date(trip.startDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "TBD"}{" "}
                          —{" "}
                          {trip.endDate
                            ? new Date(trip.endDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "TBD"}
                        </td>

                        {/* Budget */}
                        <td className="px-5 py-4 text-sm font-bold font-mono text-sky-600 dark:text-sky-400">
                          {trip.budgetAmount ? `₹${trip.budgetAmount.toLocaleString()}` : trip.budget}
                        </td>

                        {/* Companions */}
                        <td className="px-5 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">
                          {trip.approvedUsers?.length || 0} / {trip.maxCompanions || 4}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              trip.status === "open"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : trip.status === "full"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {trip.status || "open"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteTrip(tripId, trip.destination)}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                            title="Delete Trip"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
