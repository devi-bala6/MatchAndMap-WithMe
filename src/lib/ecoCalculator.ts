// ==============================================================================
// MATCH & MAP - ECO IMPACT & CARBON FOOTPRINT ENGINE
// Calculates estimated CO2 emissions, Eco-Score (0-100), and green certification
// ==============================================================================

export type TransportMode = "Train" | "Electric Vehicle" | "Bus" | "Shared Car" | "Flight" | "Bicycle / Walking"

export type AccommodationType = "Certified Eco-Homestay" | "Camp / Tents" | "Budget Guesthouse" | "Standard Hotel" | "Luxury Resort"

// CO2 emission factor in kg CO2 per passenger-kilometer
export const TRANSPORT_FACTORS: Record<TransportMode, number> = {
  "Bicycle / Walking": 0.0,
  Train: 0.035, // Average Indian Railways Electric
  "Electric Vehicle": 0.05,
  Bus: 0.08,
  "Shared Car": 0.12,
  Flight: 0.255, // Domestic economy short-haul
}

// CO2 emission in kg per room/night
export const ACCOMMODATION_FACTORS: Record<AccommodationType, number> = {
  "Certified Eco-Homestay": 4.5,
  "Camp / Tents": 2.0,
  "Budget Guesthouse": 12.0,
  "Standard Hotel": 22.0,
  "Luxury Resort": 38.5,
}

export interface FootprintCalculationInput {
  distanceKm: number
  transportMode: TransportMode
  nights: number
  accommodationType: AccommodationType
  travelersCount?: number
  isEcoActivity?: boolean
}

export interface FootprintResult {
  transportKg: number
  accommodationKg: number
  totalCarbonKg: number
  perTravelerKg: number
  baselineComparisonKg: number
  savedKg: number
  savedPercentage: number
  ecoRating: "A+" | "A" | "B" | "C" | "D"
  badge: string
  offsetCostInr: number
}

/**
 * Calculates carbon emissions for a given itinerary
 */
export function calculateTripFootprint(
  input: FootprintCalculationInput,
): FootprintResult {
  const travelers = Math.max(1, input.travelersCount || 1)
  const transportFactor = TRANSPORT_FACTORS[input.transportMode] ?? 0.08
  const accomFactor = ACCOMMODATION_FACTORS[input.accommodationType] ?? 15.0

  const transportKg = +(input.distanceKm * transportFactor).toFixed(1)
  const accommodationKg = +(input.nights * accomFactor).toFixed(1)
  const totalCarbonKg = +(transportKg + accommodationKg).toFixed(1)
  const perTravelerKg = +(totalCarbonKg / travelers).toFixed(1)

  // Baseline comparison (Flight + Luxury Resort)
  const baselineTransportKg = input.distanceKm * TRANSPORT_FACTORS["Flight"]
  const baselineAccomKg = input.nights * ACCOMMODATION_FACTORS["Luxury Resort"]
  const baselineComparisonKg = +(baselineTransportKg + baselineAccomKg).toFixed(
    1,
  )

  const savedKg = Math.max(
    0,
    +(baselineComparisonKg - totalCarbonKg).toFixed(1),
  )
  const savedPercentage =
    baselineComparisonKg > 0
      ? Math.min(95, Math.round((savedKg / baselineComparisonKg) * 100))
      : 50

  let ecoRating: FootprintResult["ecoRating"] = "B"
  let badge = "🌱 Conscious Explorer"

  if (perTravelerKg < 40) {
    ecoRating = "A+"
    badge = "🌿 Zero-Carbon Champion"
  } else if (perTravelerKg < 80) {
    ecoRating = "A"
    badge = "🚆 Green Voyager"
  } else if (perTravelerKg < 150) {
    ecoRating = "B"
    badge = "🌱 Conscious Explorer"
  } else if (perTravelerKg < 250) {
    ecoRating = "C"
    badge = "🌏 Standard Explorer"
  } else {
    ecoRating = "D"
    badge = "⚠️ High Impact Traveler"
  }

  // Cost to offset through verified Indian reforestation projects (~₹450 per 1,000 kg / 1 Ton CO2)
  const offsetCostInr = Math.max(25, Math.round((totalCarbonKg / 1000) * 450))

  return {
    transportKg,
    accommodationKg,
    totalCarbonKg,
    perTravelerKg,
    baselineComparisonKg,
    savedKg,
    savedPercentage,
    ecoRating,
    badge,
    offsetCostInr,
  }
}

/**
 * Simplified trip score calculator for UI widgets
 */
export function calculateTripEcoScore(options: {
  distanceKm: number
  transportMode: "train" | "bus" | "carpool" | "flight"
  durationNights: number
  accommodationType: "homestay" | "camp" | "hotel" | "resort"
  carbonOffset?: boolean
}) {
  const modeMap: Record<string, TransportMode> = {
    train: "Train",
    bus: "Bus",
    carpool: "Shared Car",
    flight: "Flight",
  }
  const accomMap: Record<string, AccommodationType> = {
    homestay: "Certified Eco-Homestay",
    camp: "Camp / Tents",
    hotel: "Standard Hotel",
    resort: "Luxury Resort",
  }

  const result = calculateTripFootprint({
    distanceKm: options.distanceKm,
    transportMode: modeMap[options.transportMode] || "Train",
    nights: options.durationNights,
    accommodationType:
      accomMap[options.accommodationType] || "Certified Eco-Homestay",
  })

  let ecoScore = Math.max(
    20,
    Math.min(
      100,
      Math.round(result.savedPercentage + (options.carbonOffset ? 10 : 0)),
    ),
  )

  return {
    ecoScore,
    totalCo2Kg: result.totalCarbonKg,
    co2SavedKg: result.savedKg,
    savingsVsBaselinePercent: result.savedPercentage,
    badge: result.badge,
    rating: result.ecoRating,
  }
}

export function getEcoTier(score: number): { label: string color: string } {
  if (score >= 85) return { label: "Zero-Carbon Leader", color: "#10b981" }
  if (score >= 70) return { label: "Green Voyager", color: "#22c55e" }
  if (score >= 50) return { label: "Conscious Explorer", color: "#0ea5e9" }
  return { label: "Standard Traveler", color: "#f59e0b" }
}
