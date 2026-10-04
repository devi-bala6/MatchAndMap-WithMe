import { useState, useEffect } from "react"
import { adminStats, recentActivity } from "../data/mockData"
import type { User, Trip } from "../types"
import Avatar from "../components/Avatar"
import { apiRequest } from "../lib/api"
import { readTrips } from "../lib/tripStorage"

const activityIcons: Record<string, string> = {
  new_user: "👤",
  sos: "⚡",
  match: "⬡",
  trip_created: "✈",
  report: "🚨",
}

const activityColors: Record<string, string> = {
  new_user: "#0ea5e9",
  sos: "#ef4444",
  match: "#22c55e",
  trip_created: "#a855f7",
  report: "#f59e0b",
}

export default function Admin() {
  const [tab, setTab] = useState<"overview" | "users" | "trips" | "reports">(
    "overview",
  )
  const [userFilter, setUserFilter] = useState("")
  const [usersList, setUsersList] = useState<User[]>([])
  const [adminTrips, setAdminTrips] = useState<Trip[]>(() => readTrips())

  useEffect(() => {
    async function loadData() {
      try {
        const [matches, liveTrips] = await Promise.all([
          apiRequest<any[]>("/buddies").catch(() => []),
          apiRequest<Trip[]>("/trips").catch(() => []),
        ])
        if (Array.isArray(matches) && matches.length > 0) {
          const registered = matches.map((m: any) => m.user).filter(Boolean)
          setUsersList(registered)
        }
        if (Array.isArray(liveTrips) && liveTrips.length > 0) {
          setAdminTrips(liveTrips)
        }
      } catch {}
    }
    loadData()
  }, [])

  const filteredUsers = usersList.filter(
    (u) =>
      !userFilter ||
      u.name.toLowerCase().includes(userFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(userFilter.toLowerCase()),
  )

  function exportCsv(
    filename: string,
    headers: string[],
    rows: (string | number)[][],
  ) {
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n")
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  function exportTripsReport() {
    const headers = [
      "Destination",
      "State",
      "Start Date",
      "End Date",
      "Budget",
      "Status",
      "Companions",
    ]
    const rows = adminTrips.map((trip) => [
      trip.destination,
      trip.state,
      trip.startDate,
      trip.endDate,
      trip.budget,
      trip.status,
      `${trip.approvedUsers?.length || 0}/${trip.maxCompanions}`,
    ])
    exportCsv(
      `travel-trips-report-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    )
  }

  function exportUsersReport() {
    const headers = [
      "User",
      "Email",
      "Nationality",
      "Budget",
      "Trips",
      "Rating",
      "Status",
    ]
    const rows = usersList.map((user) => [
      user.name,
      user.email,
      user.nationality,
      user.budget,
      String(user.tripsCount),
      String(user.rating),
      user.verified ? "Verified" : "Pending",
    ])
    exportCsv(
      `travel-users-report-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    )
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "trips", label: "Trips" },
    { id: "reports", label: "Reports" },
  ] as const

  const statCards = [
    {
      label: "Total Users",
      value: adminStats.totalUsers.toLocaleString(),
      icon: "👥",
      color: "#0ea5e9",
      sub: `+${adminStats.newUsersThisWeek} this week`,
    },
    {
      label: "Active Trips",
      value: adminStats.activeTrips.toLocaleString(),
      icon: "✈",
      color: "#22c55e",
      sub: "Across Indian states",
    },
    {
      label: "Matches Made",
      value: adminStats.matchesMade.toLocaleString(),
      icon: "⬡",
      color: "#a855f7",
      sub: "Total all time",
    },
    {
      label: "SOS Triggers",
      value: adminStats.sosTriggers,
      icon: "⚡",
      color: "#ef4444",
      sub: "Last 30 days",
    },
    {
      label: "Verified Users",
      value: adminStats.verifiedUsers.toLocaleString(),
      icon: "✓",
      color: "#22c55e",
      sub: `${adminStats.pendingVerification} pending`,
    },
    {
      label: "States",
      value: adminStats.states,
      icon: "🗺️",
      color: "#f59e0b",
      sub: `${adminStats.languages} languages`,
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div
        className="mb-8 rounded-3xl p-5 md:p-7"
        style={{
          background:
            "linear-gradient(135deg, rgba(125, 211, 252, 0.22), rgba(192, 132, 252, 0.18), rgba(15, 23, 42, 0.95))",
          border: "1px solid rgba(147, 197, 253, 0.38)",
          boxShadow:
            "0 18px 45px rgba(14, 165, 233, 0.14), 0 10px 24px rgba(168, 85, 247, 0.1)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p
              className="font-display font-extrabold text-sm uppercase mb-3"
              style={{ color: "#e0f2fe" }}
            >
              Admin Control Panel
            </p>
            <h2
              className="font-display font-black text-3xl md:text-5xl leading-none"
              style={{
                color: "#f8fafc",
                textShadow: "0 8px 30px rgba(125, 211, 252, 0.35)",
                letterSpacing: "-0.04em",
              }}
            >
              Platform Management
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase"
              style={{
                background: "rgba(34,197,94,0.18)",
                color: "#dcfce7",
                border: "1px solid rgba(134, 239, 172, 0.38)",
                boxShadow: "0 0 0 1px rgba(34,197,94,0.08)",
              }}
            >
              Match&Map with me
            </span>
          </div>
        </div>

        <div
          className="mt-5 flex items-center gap-2 text-sm font-mono"
          style={{ color: "#e2e8f0" }}
        >
          <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Tab nav */}
      <div
        className="mb-8 p-1 rounded-2xl"
        style={{
          background: "rgba(15, 23, 42, 0.9)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all"
              style={
                tab === t.id
                  ? {
                      color: "#f8fafc",
                      background:
                        "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))",
                      border: "1px solid rgba(125, 211, 252, 0.4)",
                      boxShadow: "0 8px 20px rgba(14, 165, 233, 0.16)",
                    }
                  : {
                      color: "#cbd5e1",
                      background: "transparent",
                      border: "1px solid transparent",
                    }
              }
            >
              <span className="inline-flex items-center gap-2">
                {t.label}
                {t.id === "reports" && (
                  <span
                    className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full font-mono text-[10px] font-bold"
                    style={{
                      background: "rgba(239, 68, 68, 0.18)",
                      color: "#fecaca",
                      border: "1px solid rgba(248, 113, 113, 0.35)",
                    }}
                  >
                    {adminStats.reportedUsers}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {statCards.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-mono text-xs"
                    style={{ color: "#475569" }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="flex items-center justify-center text-base"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: `${s.color}1a`,
                      color: s.color,
                    }}
                  >
                    {s.icon}
                  </span>
                </div>
                <div
                  className="font-display font-black text-3xl mb-1"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
                <div className="font-mono text-xs" style={{ color: "#475569" }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Recent activity */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "#0d1525", border: "1px solid #1a2845" }}
            >
              <p
                className="font-mono text-xs mb-5"
                style={{ color: "#a855f7" }}
              >
                RECENT ACTIVITY
              </p>
              <div className="flex flex-col gap-3">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${activityColors[item.type]}15`,
                        color: activityColors[item.type],
                      }}
                    >
                      {activityIcons[item.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className="font-display font-semibold text-sm"
                          style={{ color: "#e2e8f0" }}
                        >
                          {item.type === "new_user" && `New user: ${item.user}`}
                          {item.type === "sos" && `SOS: ${item.user}`}
                          {item.type === "match" && `Match: ${item.user}`}
                          {item.type === "trip_created" &&
                            `Trip by ${item.user}`}
                          {item.type === "report" && `Report filed`}
                        </p>
                        <span
                          className="font-mono text-xs flex-shrink-0 ml-3"
                          style={{ color: "#334155" }}
                        >
                          {item.time}
                        </span>
                      </div>
                      <p
                        className="font-mono text-xs"
                        style={{ color: "#475569" }}
                      >
                        {item.type === "new_user" && item.state}
                        {item.type === "sos" && `📍 ${item.location}`}
                        {(item.type === "match" ||
                          item.type === "trip_created") &&
                          `📍 ${item.destination}`}
                        {item.type === "report" && `Against: ${item.target}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform health */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "#0d1525", border: "1px solid #1a2845" }}
            >
              <p
                className="font-mono text-xs mb-5"
                style={{ color: "#22c55e" }}
              >
                PLATFORM HEALTH
              </p>
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: "User Verification Rate",
                    value: Math.round(
                      (adminStats.verifiedUsers / adminStats.totalUsers) * 100,
                    ),
                    color: "#22c55e",
                  },
                  { label: "Active Match Rate", value: 78, color: "#0ea5e9" },
                  {
                    label: "SOS Response Time",
                    value: 95,
                    color: "#a855f7",
                    suffix: "% < 2 min",
                  },
                  { label: "Platform Uptime", value: 99, color: "#f59e0b" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between mb-1.5">
                      <span
                        className="font-mono text-xs"
                        style={{ color: "#64748b" }}
                      >
                        {m.label}
                      </span>
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: m.color }}
                      >
                        {m.suffix ?? `${m.value}%`}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full"
                      style={{ background: "#1a2845" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${m.value}%`, background: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 pt-4"
                style={{ borderTop: "1px solid #1a2845" }}
              >
                <p
                  className="font-mono text-xs mb-3"
                  style={{ color: "#475569" }}
                >
                  PENDING ACTIONS
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      label: `${adminStats.pendingVerification} users pending ID verification`,
                      color: "#f59e0b",
                    },
                    {
                      label: `${adminStats.reportedUsers} user reports to review`,
                      color: "#ef4444",
                    },
                    {
                      label: "7 SOS incidents from last 30 days",
                      color: "#ef4444",
                    },
                  ].map((a) => (
                    <div
                      key={a.label}
                      className="flex items-center gap-2 text-xs"
                      style={{ color: a.color }}
                    >
                      <span>⚠</span> {a.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* USERS TAB */}
      {tab === "users" && (
        <div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <input
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Search users by name or email..."
              />
            </div>
            <button
              onClick={exportUsersReport}
              className="btn-primary text-sm px-5"
            >
              Export CSV
            </button>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid #1a2845" }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#0d1525",
                    borderBottom: "1px solid #1a2845",
                  }}
                >
                  {[
                    "User",
                    "Email",
                    "Nationality",
                    "Budget",
                    "Trips",
                    "Rating",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-4 font-mono text-xs"
                      style={{ color: "#475569", fontWeight: 600 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: "1px solid rgba(148,163,184,0.18)",
                      background:
                        i % 2 === 0
                          ? "rgba(8, 13, 26, 0.62)"
                          : "rgba(15, 23, 42, 0.76)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size={34} />
                        <div>
                          <p
                            className="font-display text-sm"
                            style={{
                              color: "#f8fafc",
                              fontWeight: 800,
                              letterSpacing: "0.02em",
                              textShadow: "0 2px 10px rgba(2, 6, 23, 0.9)",
                            }}
                          >
                            {u.name}
                          </p>
                          <p
                            className="font-mono text-xs"
                            style={{
                              color: "#dbeafe",
                              textShadow: "0 2px 8px rgba(2, 6, 23, 0.75)",
                            }}
                          >
                            {u.age} · {u.gender}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-5 py-4 font-mono text-xs"
                      style={{
                        color: "#e2e8f0",
                        fontWeight: 600,
                        textShadow: "0 2px 10px rgba(2, 6, 23, 0.75)",
                      }}
                    >
                      {u.email}
                    </td>
                    <td
                      className="px-5 py-4 font-mono text-xs"
                      style={{
                        color: "#f8fafc",
                        fontWeight: 700,
                        textShadow: "0 2px 10px rgba(2, 6, 23, 0.8)",
                      }}
                    >
                      {u.nationality}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${
                          u.budget === "luxury"
                            ? "badge-amber"
                            : u.budget === "mid-range"
                              ? "badge-cyan"
                              : "badge-green"
                        }`}
                      >
                        {u.budget}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 font-mono text-sm font-bold"
                      style={{ color: "#0ea5e9" }}
                    >
                      {u.tripsCount}
                    </td>
                    <td
                      className="px-5 py-4 font-mono text-sm"
                      style={{ color: "#f59e0b" }}
                    >
                      ★ {u.rating}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${
                          u.verified ? "badge-green" : "badge-amber"
                        }`}
                      >
                        {u.verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {!u.verified && (
                          <button
                            className="px-2 py-1 rounded font-mono text-xs"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              color: "#4ade80",
                              border: "1px solid rgba(34,197,94,0.2)",
                            }}
                          >
                            Verify
                          </button>
                        )}
                        <button
                          className="px-2 py-1 rounded font-mono text-xs"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          Ban
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRIPS TAB */}
      {tab === "trips" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-sm" style={{ color: "#64748b" }}>
              {adminTrips.length} active trips across the platform
            </p>
            <button
              onClick={exportTripsReport}
              className="btn-primary text-sm px-5"
            >
              Export Report
            </button>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid #1a2845" }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#0d1525",
                    borderBottom: "1px solid #1a2845",
                  }}
                >
                  {[
                    "Destination",
                    "Host",
                    "Dates",
                    "Budget",
                    "Spots",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-4 font-mono text-xs"
                      style={{ color: "#475569", fontWeight: 600 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminTrips.map((trip, i) => {
                  const hostName = trip.userName || "Traveler"
                  return (
                    <tr
                      key={trip.id}
                      style={{
                        borderBottom: "1px solid rgba(148,163,184,0.18)",
                        background:
                          i % 2 === 0
                            ? "rgba(8, 13, 26, 0.62)"
                            : "rgba(15, 23, 42, 0.76)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <td className="px-5 py-4">
                        <p
                          className="font-display text-sm"
                          style={{
                            color: "#f8fafc",
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                            textShadow: "0 2px 10px rgba(2, 6, 23, 0.9)",
                          }}
                        >
                          {trip.destination}
                        </p>
                        <p
                          className="font-mono text-xs"
                          style={{
                            color: "#dbeafe",
                            textShadow: "0 2px 8px rgba(2, 6, 23, 0.75)",
                          }}
                        >
                          {trip.state}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={hostName} size={24} />
                          <span
                            className="font-display text-sm"
                            style={{ color: "#94a3b8" }}
                          >
                            {hostName}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-5 py-4 font-mono text-xs"
                        style={{ color: "#64748b" }}
                      >
                        {new Date(trip.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        —{" "}
                        {new Date(trip.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td
                        className="px-5 py-4 font-mono text-sm font-bold"
                        style={{ color: "#0ea5e9" }}
                      >
                        ₹{trip.budgetAmount.toLocaleString()}
                      </td>
                      <td
                        className="px-5 py-4 font-mono text-sm"
                        style={{ color: "#94a3b8" }}
                      >
                        {trip.approvedUsers.length}/{trip.maxCompanions}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`badge ${
                            trip.status === "open"
                              ? "badge-green"
                              : "badge-gray"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          className="px-2 py-1 rounded font-mono text-xs"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {tab === "reports" && (
        <div>
          <div
            className="p-5 rounded-2xl mb-6 flex items-start gap-4 shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(127, 29, 29, 0.55), rgba(69, 10, 10, 0.44), rgba(15, 23, 42, 0.8))",
              border: "1px solid rgba(248, 113, 113, 0.42)",
              boxShadow:
                "0 0 0 1px rgba(248, 113, 113, 0.08), 0 16px 32px rgba(2,6,23,0.32)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl font-black text-xl"
              style={{
                width: 44,
                height: 44,
                background: "rgba(254, 202, 202, 0.12)",
                color: "#fecaca",
                border: "1px solid rgba(254, 202, 202, 0.22)",
              }}
            >
              ⚠️
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span
                  className="inline-flex items-center justify-center rounded-full font-mono text-xs font-black"
                  style={{
                    minWidth: 30,
                    height: 30,
                    background: "rgba(248, 113, 113, 0.16)",
                    color: "#ffe4e6",
                    border: "1px solid rgba(248, 113, 113, 0.4)",
                  }}
                >
                  {adminStats.reportedUsers}
                </span>
                <p
                  className="font-display font-black text-lg"
                  style={{ color: "#fff1f2" }}
                >
                  pending user reports require review
                </p>
              </div>
              <p className="text-sm" style={{ color: "#fecdd3" }}>
                Review each report carefully before taking action. Permanent
                bans require two admin confirmations.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                reporter: "Anonymous",
                target: "User #8834",
                reason: "Shared false identity documents",
                severity: "High",
                time: "2 hr ago",
              },
              {
                reporter: "Kenji Tanaka",
                target: "User #4421",
                reason: "Harassment via private messages",
                severity: "High",
                time: "5 hr ago",
              },
              {
                reporter: "Sofia Andersen",
                target: "User #7792",
                reason: "No-show on confirmed trip",
                severity: "Medium",
                time: "Yesterday",
              },
              {
                reporter: "Anonymous",
                target: "User #3345",
                reason: "Inappropriate profile content",
                severity: "Low",
                time: "2 days ago",
              },
            ].map((report, i) => (
              <div
                key={i}
                className="p-5 rounded-xl flex items-start gap-4"
                style={{ background: "#0d1525", border: "1px solid #1a2845" }}
              >
                <span
                  className="flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background:
                      report.severity === "High"
                        ? "rgba(239,68,68,0.15)"
                        : report.severity === "Medium"
                          ? "rgba(245,158,11,0.15)"
                          : "rgba(100,116,139,0.15)",
                    color:
                      report.severity === "High"
                        ? "#f87171"
                        : report.severity === "Medium"
                          ? "#fbbf24"
                          : "#64748b",
                  }}
                >
                  🚨
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p
                      className="font-display font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      Report against {report.target}
                    </p>
                    <span
                      className="badge"
                      style={
                        report.severity === "High"
                          ? {
                              background: "rgba(239,68,68,0.15)",
                              color: "#f87171",
                            }
                          : report.severity === "Medium"
                            ? {
                                background: "rgba(245,158,11,0.15)",
                                color: "#fbbf24",
                              }
                            : {
                                background: "rgba(100,116,139,0.15)",
                                color: "#94a3b8",
                              }
                      }
                    >
                      {report.severity}
                    </span>
                    <span
                      className="font-mono text-xs ml-auto"
                      style={{ color: "#334155" }}
                    >
                      {report.time}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: "#94a3b8" }}>
                    {report.reason}
                  </p>
                  <p className="font-mono text-xs" style={{ color: "#475569" }}>
                    Reported by: {report.reporter}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="px-3 py-1.5 rounded-lg font-mono text-xs font-semibold"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: "#4ade80",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    Dismiss
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg font-mono text-xs font-semibold"
                    style={{
                      background: "rgba(245,158,11,0.1)",
                      color: "#fbbf24",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}
                  >
                    Warn
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg font-mono text-xs font-semibold"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#f87171",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    Ban
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
