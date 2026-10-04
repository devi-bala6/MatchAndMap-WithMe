import dns from "node:dns"
import mongoose from "mongoose"

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"])
} catch (e) {
  // Ignore if dns override not supported in current environment
}

export async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI not provided. Running in local fallback mode.")
    return false
  }

  mongoose.connection.on("connected", () => console.log("MongoDB connected successfully to Atlas"))
  mongoose.connection.on("error", (error) => console.warn("MongoDB warning:", error.message))

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    })
    return true
  } catch (error) {
    console.warn(`MongoDB could not connect (${error.message}). Running with local in-memory fallback.`)
    return false
  }
}

