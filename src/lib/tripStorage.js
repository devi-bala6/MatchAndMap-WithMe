export const TRIPS_STORAGE_KEY = "travel-companion-trips"

function toDateTime(value) {
  if (!value) return Number.MAX_SAFE_INTEGER
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? Number.MAX_SAFE_INTEGER
    : parsed.getTime()
}

export function sortTripsByDate(trips) {
  if (!Array.isArray(trips)) return []
  return [...trips].sort(
    (a, b) => toDateTime(a.startDate) - toDateTime(b.startDate),
  )
}

export function readTrips() {
  if (typeof window === "undefined") return []

  try {
    const saved = window.localStorage.getItem(TRIPS_STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeTrips(trips) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(
    TRIPS_STORAGE_KEY,
    JSON.stringify(Array.isArray(trips) ? trips : []),
  )
}

export function getNextTrip(trips) {
  if (!Array.isArray(trips) || trips.length === 0) return null
  const upcomingTrips = sortTripsByDate(
    trips.filter(
      (trip) => toDateTime(trip.startDate) >= Date.now() - 24 * 60 * 60 * 1000,
    ),
  )

  return upcomingTrips[0] ?? sortTripsByDate(trips)[0] ?? null
}
