import express from "express"
import cors from "cors"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const app = express()
const PORT = process.env.PORT || 3001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, "data", "store.json")

app.use(cors())
app.use(express.json())

async function readStore() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    const initialData = {
      trips: [],
      recommendations: [],
      profile: {},
      messages: [],
      reviews: [],
      connectionRequests: [],
      summary: { activeUsers: 0, trips: 0, matches: 0, riskAlerts: 0 },
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2))
    return initialData
  }
}

async function saveStore(store) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2))
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "travel-companion-matcher",
    time: new Date().toISOString(),
  })
})

app.get("/api/trips", async (_req, res) => {
  const store = await readStore()
  res.json(store.trips)
})

app.post("/api/trips", async (req, res) => {
  const store = await readStore()
  const payload = req.body || {}
  const newTrip = {
    id: payload.id || `trip-${Date.now()}`,
    destination: payload.destination || "New Travel Spot",
    title: payload.title || "Custom Expedition",
    date: payload.date || new Date().toISOString().slice(0, 10),
    budget: payload.budget || 500,
    travelers: payload.travelers || 1,
    vibe: payload.vibe || "Discovery",
  }

  store.trips.push(newTrip)
  await saveStore(store)
  res.status(201).json(newTrip)
})

app.get("/api/recommendations", async (_req, res) => {
  const store = await readStore()
  res.json(store.recommendations)
})

app.get("/api/profile", async (_req, res) => {
  const store = await readStore()
  res.json(store.profile)
})

app.get("/api/connection-requests", async (_req, res) => {
  const store = await readStore()
  res.json(store.connectionRequests || [])
})

app.get("/api/reviews", async (_req, res) => {
  const store = await readStore()
  res.json(store.reviews || [])
})

app.post("/api/reviews", async (req, res) => {
  const store = await readStore()
  const payload = req.body || {}
  store.reviews = store.reviews || []
  const review = {
    ...payload,
    id: payload.id || `review-${Date.now()}`,
    date: payload.date || "Sep 2026",
  }
  store.reviews.unshift(review)
  await saveStore(store)
  res.status(201).json(review)
})

app.post("/api/connection-requests", async (req, res) => {
  const store = await readStore()
  const payload = req.body || {}
  store.connectionRequests = store.connectionRequests || []

  const alreadyExists = store.connectionRequests.some(
    (request) =>
      request.fromUserId === (payload.fromUserId || "u1") &&
      request.toUserId === payload.toUserId,
  )

  if (alreadyExists) {
    return res.status(200).json({ saved: true, duplicate: true })
  }

  const request = {
    id: payload.id || `connection-${Date.now()}`,
    fromUserId: payload.fromUserId || "u1",
    toUserId: payload.toUserId || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  store.connectionRequests.push(request)
  await saveStore(store)
  res.status(201).json(request)
})

app.get("/api/messages", async (req, res) => {
  const store = await readStore()
  const roomId = req.query.roomId
  const messages = roomId
    ? store.messages.filter((message) => message.roomId === roomId)
    : store.messages
  res.json(messages)
})

app.post("/api/messages", async (req, res) => {
  const store = await readStore()
  const payload = req.body || {}
  const newMessage = {
    id: payload.id || `chat-${Date.now()}`,
    roomId: payload.roomId || "default",
    senderId: payload.senderId || "u1",
    senderName: payload.senderName || "You",
    senderAvatar: payload.senderAvatar || "",
    content: payload.content || "",
    timestamp: payload.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }

  store.messages.push(newMessage)
  await saveStore(store)
  res.status(201).json(newMessage)
})

app.get("/api/admin/summary", async (_req, res) => {
  const store = await readStore()
  res.json(store.summary)
})

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})
