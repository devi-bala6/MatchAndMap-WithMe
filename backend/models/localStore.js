import mongoose from "mongoose"

// Clean in-memory store for registered users and real data only
export const localUsers = new Map()
export const localMessages = []
export const localTrips = []
export const localConnections = []
export const localReviews = []
export const localNotifications = []

// Pre-seed default administrator
localUsers.set("admin@matchandmap.in", {
  _id: "admin_master_001",
  name: "System Administrator",
  email: "admin@matchandmap.in",
  role: "admin",
  status: "active",
  verified: true,
  createdAt: new Date(),
  interests: ["Administration", "Security", "Travel Safety"],
  hobbies: ["Platform Moderation"],
  languages: ["English", "Hindi"],
  budget: "mid-range",
  travelStyle: "Admin",
  tripsCount: 0,
  rating: 5.0,
  reviewCount: 0,
  ecoScore: 100,
  phone: "+91 9876543210",
  beneficiary: { name: "Platform Ops", relation: "HQ", phone: "+91 9876543210", email: "support@matchandmap.in", address: "HQ" }
})
localUsers.set("admin@matchandmap.com", {
  _id: "admin_master_002",
  name: "System Administrator",
  email: "admin@matchandmap.com",
  role: "admin",
  status: "active",
  verified: true,
  createdAt: new Date(),
  interests: ["Administration", "Security", "Travel Safety"],
  hobbies: ["Platform Moderation"],
  languages: ["English", "Hindi"],
  budget: "mid-range",
  travelStyle: "Admin",
  tripsCount: 0,
  rating: 5.0,
  reviewCount: 0,
  ecoScore: 100,
  phone: "+91 9876543210",
  beneficiary: { name: "Platform Ops", relation: "HQ", phone: "+91 9876543210", email: "support@matchandmap.in", address: "HQ" }
})

export function isDbConnected() {
  return mongoose.connection.readyState === 1
}

export function getLocalUserByEmail(email) {
  if (!email) return null
  return localUsers.get(email.toLowerCase().trim()) || null
}

export function getLocalUserById(id) {
  if (!id) return null
  for (const user of localUsers.values()) {
    if (user._id === id || user._id?.toString() === id) return user
  }
  return null
}

export function saveLocalUser(userData) {
  const normalizedEmail = userData.email.toLowerCase().trim()
  const user = {
    _id: userData._id || `user_${Date.now()}`,
    role: userData.role || "user",
    status: userData.status || "active",
    verified: Boolean(userData.verified !== false),
    createdAt: new Date(),
    interests: userData.interests || ["Travel", "Photography"],
    hobbies: userData.hobbies || ["Exploring"],
    languages: userData.languages || ["English", "Hindi"],
    budget: userData.budget || "mid-range",
    travelStyle: userData.travelStyle || "Adventure",
    tripsCount: 0,
    rating: 5.0,
    reviewCount: 0,
    ecoScore: 85,
    beneficiary: userData.beneficiary || { name: "", relation: "", phone: "", email: "", address: "" },
    phone: userData.phone || "",
    ...userData,
    email: normalizedEmail,
  }
  localUsers.set(normalizedEmail, user)
  return user
}
