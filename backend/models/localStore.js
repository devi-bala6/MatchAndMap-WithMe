import mongoose from "mongoose"

// Clean in-memory store for registered users and real data only
export const localUsers = new Map()
export const localMessages = []
export const localTrips = []
export const localConnections = []
export const localReviews = []
export const localNotifications = []

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
