export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(error, _req, res, _next) {
  console.error(error)
  if (error.name === "MongoServerSelectionError" || error.name === "MongoNetworkError") {
    return res.status(503).json({ message: "Database is temporarily unavailable. Check the MongoDB Atlas network access settings." })
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed", errors: Object.values(error.errors).map((item) => item.message) })
  }
  if (error.code === 11000) return res.status(409).json({ message: "A record with that value already exists" })
  res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
}
