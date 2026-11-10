import dns from "node:dns"
import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"])
} catch (e) {
  // Ignore if dns override not supported in current environment
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, "../.env") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { connectDatabase } from "../config/db.js"
import { User } from "../models/index.js"
import authRoutes from "../routes/auth.js"
import profileRoutes from "../routes/profile.js"
import tripRoutes from "../routes/trips.js"
import socialRoutes from "../routes/social.js"
import safetyRoutes from "../routes/safety.js"
import adminRoutes from "../routes/admin.js"
import { requireAuth, requireAdmin } from "../middleware/auth.js"
import { errorHandler, notFound } from "../middleware/errors.js"

const app = express()
const port = Number(process.env.PORT || 5000)

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all local dev origins and requests with no origin
      callback(null, true)
    },
    credentials: true,
  })
)
app.use(express.json({ limit: "2mb" }))
app.use(morgan("dev"))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 600 }))

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "travel-companion-backend",
    message: "Backend is running",
    health: "/api/health",
  })
})

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "travel-companion-backend", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
})
app.use("/api/auth", authRoutes)
app.use("/api", requireAuth)
app.use("/api/profile", profileRoutes)
app.use("/api/trips", tripRoutes)
app.use("/api", socialRoutes)
app.use("/api", safetyRoutes)
app.use("/api/admin", requireAdmin, adminRoutes)
app.use(notFound)
app.use(errorHandler)

async function seedAdminIfMissing() {
  try {
    if (mongoose.connection.readyState === 1) {
      const existingAdmin = await User.findOne({ email: "admin@matchandmap.in" })
      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash("AdminDemo123!", 10)
        await User.create({
          name: "System Administrator",
          email: "admin@matchandmap.in",
          passwordHash,
          role: "admin",
          status: "active",
          verified: true,
          travelStyle: "Admin",
          budget: "mid-range",
          interests: ["Platform Moderation", "Travel Safety", "Security"],
          ecoScore: 100,
          beneficiary: {
            name: "Platform Support",
            relation: "HQ",
            phone: "+91 9876543210",
            email: "support@matchandmap.in",
            address: "HQ"
          }
        })
        console.log("✓ Default admin account (admin@matchandmap.in) seeded in MongoDB")
      }
    }
  } catch (err) {
    console.warn("Notice during admin check:", err.message)
  }
}

async function start() {
  try {
    await connectDatabase()
    await seedAdminIfMissing()
  } catch (error) {
    console.warn(`Database initialization notice: ${error.message}`)
  }

  app.listen(port, () => console.log(`Backend running at http://localhost:${port}`))
}

start()
