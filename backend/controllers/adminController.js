import { Report, Trip, User } from "../models/index.js"

export async function summary(_req, res) {
  const [activeUsers, trips, riskAlerts] = await Promise.all([
    User.countDocuments({ status: "active" }),
    Trip.countDocuments(),
    Report.countDocuments({ status: "open" }),
  ])
  res.json({ activeUsers, trips, matches: 0, riskAlerts })
}

export async function listUsers(_req, res) {
  res.json(await User.find().select("-passwordHash").sort({ createdAt: -1 }))
}

export async function updateUserStatus(req, res) {
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: "after" }).select("-passwordHash")
  if (!user) return res.status(404).json({ message: "User not found" })
  res.json(user)
}

export async function updateVerification(req, res) {
  const user = await User.findByIdAndUpdate(req.params.id, { verified: req.body.verified }, { returnDocument: "after" }).select("-passwordHash")
  if (!user) return res.status(404).json({ message: "User not found" })
  res.json(user)
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })
    return res.json({ ok: true, message: "User deleted successfully" })
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete user" })
  }
}

export async function listReports(_req, res) {
  res.json(await Report.find().populate("reporter", "name email").sort({ createdAt: -1 }))
}

export async function updateReport(req, res) {
  const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: "after" })
  if (!report) return res.status(404).json({ message: "Report not found" })
  res.json(report)
}
