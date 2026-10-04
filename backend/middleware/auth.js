import jwt from "jsonwebtoken"
import { User } from "../models/index.js"
import { isDbConnected, getLocalUserById } from "../models/localStore.js"

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : null
    if (!token) return res.status(401).json({ message: "Authentication required" })

    const payload = jwt.verify(token, process.env.JWT_SECRET || "6dk0wZDutnQIEJnS")
    
    if (isDbConnected()) {
      const user = await User.findById(payload.sub).select("-passwordHash")
      if (!user || user.status !== "active") {
        return res.status(401).json({ message: "Invalid session" })
      }
      req.user = user
      return next()
    }

    const localUser = getLocalUserById(payload.sub)
    if (!localUser || localUser.status !== "active") {
      return res.status(401).json({ message: "Invalid session" })
    }
    req.user = localUser
    next()
  } catch {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" })
  next()
}
