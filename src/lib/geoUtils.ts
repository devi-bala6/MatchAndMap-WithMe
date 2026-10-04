/**
 * Real Indian Geographic Coordinates & Google Maps Link Generators
 * Provides exact latitude, longitude, and elevation for accurate GPS navigation.
 */

export interface GeoLocation {
  lat: number
  lng: number
  state: string
  elevation: string
}

export const INDIAN_COORDS_MAP: Record<string, GeoLocation> = {
  // Andhra Pradesh & Telangana
  visakhapatnam: { lat: 17.6868, lng: 83.2185, state: "Andhra Pradesh", elevation: "45m" },
  vizag: { lat: 17.6868, lng: 83.2185, state: "Andhra Pradesh", elevation: "45m" },
  araku: { lat: 18.3273, lng: 82.8775, state: "Andhra Pradesh", elevation: "911m" },
  tirupati: { lat: 13.6288, lng: 79.4192, state: "Andhra Pradesh", elevation: "153m" },
  vijayawada: { lat: 16.5062, lng: 80.648, state: "Andhra Pradesh", elevation: "25m" },
  guntur: { lat: 16.3067, lng: 80.4365, state: "Andhra Pradesh", elevation: "33m" },
  hyderabad: { lat: 17.385, lng: 78.4867, state: "Telangana", elevation: "542m" },
  warangal: { lat: 17.9689, lng: 79.5941, state: "Telangana", elevation: "270m" },

  // Uttar Pradesh & Delhi NCR
  agra: { lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh", elevation: "171m" },
  "taj mahal": { lat: 27.1751, lng: 78.0421, state: "Uttar Pradesh", elevation: "171m" },
  varanasi: { lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh", elevation: "81m" },
  lucknow: { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh", elevation: "128m" },
  ayodhya: { lat: 26.7922, lng: 82.1998, state: "Uttar Pradesh", elevation: "102m" },
  delhi: { lat: 28.6139, lng: 77.209, state: "Delhi", elevation: "216m" },
  "new delhi": { lat: 28.6139, lng: 77.209, state: "Delhi", elevation: "216m" },
  noida: { lat: 28.5355, lng: 77.391, state: "Uttar Pradesh", elevation: "200m" },
  gurgaon: { lat: 28.4595, lng: 77.0266, state: "Haryana", elevation: "219m" },

  // Himachal Pradesh & Uttarakhand
  manali: { lat: 32.2432, lng: 77.1892, state: "Himachal Pradesh", elevation: "2,050m" },
  shimla: { lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh", elevation: "2,276m" },
  kasol: { lat: 32.01, lng: 77.315, state: "Himachal Pradesh", elevation: "1,580m" },
  dharamshala: { lat: 32.219, lng: 76.3234, state: "Himachal Pradesh", elevation: "1,457m" },
  spiti: { lat: 32.2461, lng: 78.0349, state: "Himachal Pradesh", elevation: "3,800m" },
  rishikesh: { lat: 30.0869, lng: 78.2676, state: "Uttarakhand", elevation: "372m" },
  haridwar: { lat: 29.9457, lng: 78.1642, state: "Uttarakhand", elevation: "314m" },
  kedarnath: { lat: 30.7346, lng: 79.0669, state: "Uttarakhand", elevation: "3,583m" },
  badrinath: { lat: 30.7433, lng: 79.4938, state: "Uttarakhand", elevation: "3,300m" },
  nainital: { lat: 29.3803, lng: 79.4636, state: "Uttarakhand", elevation: "2,084m" },
  mussoorie: { lat: 30.4598, lng: 78.0644, state: "Uttarakhand", elevation: "2,005m" },
  auli: { lat: 30.5298, lng: 79.5702, state: "Uttarakhand", elevation: "2,800m" },

  // Goa & Maharashtra
  goa: { lat: 15.2993, lng: 74.124, state: "Goa", elevation: "15m" },
  "panaji": { lat: 15.4909, lng: 73.8278, state: "Goa", elevation: "7m" },
  mumbai: { lat: 19.076, lng: 72.8777, state: "Maharashtra", elevation: "14m" },
  pune: { lat: 18.5204, lng: 73.8567, state: "Maharashtra", elevation: "560m" },
  lonavala: { lat: 18.7557, lng: 73.4091, state: "Maharashtra", elevation: "624m" },
  mahabaleshwar: { lat: 17.9237, lng: 73.6586, state: "Maharashtra", elevation: "1,353m" },
  alibaug: { lat: 18.6414, lng: 72.8722, state: "Maharashtra", elevation: "10m" },

  // Kerala & Tamil Nadu
  munnar: { lat: 10.0889, lng: 77.0595, state: "Kerala", elevation: "1,532m" },
  kochi: { lat: 9.9312, lng: 76.2673, state: "Kerala", elevation: "10m" },
  alleppey: { lat: 9.4981, lng: 76.3388, state: "Kerala", elevation: "1m" },
  alappuzha: { lat: 9.4981, lng: 76.3388, state: "Kerala", elevation: "1m" },
  wayanad: { lat: 11.6854, lng: 76.132, state: "Kerala", elevation: "700m" },
  varkala: { lat: 8.7379, lng: 76.7163, state: "Kerala", elevation: "19m" },
  chennai: { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu", elevation: "12m" },
  ooty: { lat: 11.4102, lng: 76.695, state: "Tamil Nadu", elevation: "2,240m" },
  kodaikanal: { lat: 10.2381, lng: 77.4892, state: "Tamil Nadu", elevation: "2,133m" },
  madurai: { lat: 9.9252, lng: 78.1198, state: "Tamil Nadu", elevation: "101m" },
  rameswaram: { lat: 9.2876, lng: 79.3129, state: "Tamil Nadu", elevation: "10m" },
  pondicherry: { lat: 11.9416, lng: 79.8083, state: "Puducherry", elevation: "3m" },
  puducherry: { lat: 11.9416, lng: 79.8083, state: "Puducherry", elevation: "3m" },

  // Karnataka
  bengaluru: { lat: 12.9716, lng: 77.5946, state: "Karnataka", elevation: "920m" },
  bangalore: { lat: 12.9716, lng: 77.5946, state: "Karnataka", elevation: "920m" },
  mysuru: { lat: 12.2958, lng: 76.6394, state: "Karnataka", elevation: "763m" },
  mysore: { lat: 12.2958, lng: 76.6394, state: "Karnataka", elevation: "763m" },
  coorg: { lat: 12.3375, lng: 75.8069, state: "Karnataka", elevation: "1,061m" },
  chikmagalur: { lat: 13.3161, lng: 75.772, state: "Karnataka", elevation: "1,090m" },
  hampi: { lat: 15.335, lng: 76.46, state: "Karnataka", elevation: "467m" },
  gokarna: { lat: 14.5479, lng: 74.3188, state: "Karnataka", elevation: "10m" },

  // Rajasthan & Gujarat
  jaipur: { lat: 26.9124, lng: 75.7873, state: "Rajasthan", elevation: "431m" },
  udaipur: { lat: 24.5854, lng: 73.7125, state: "Rajasthan", elevation: "598m" },
  jodhpur: { lat: 26.2389, lng: 73.0243, state: "Rajasthan", elevation: "231m" },
  jaisalmer: { lat: 26.9157, lng: 70.9083, state: "Rajasthan", elevation: "225m" },
  pushkar: { lat: 26.4897, lng: 74.5511, state: "Rajasthan", elevation: "510m" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, state: "Gujarat", elevation: "53m" },
  kutch: { lat: 23.7337, lng: 69.8597, state: "Gujarat", elevation: "15m" },

  // East & North-East & Kashmir
  kolkata: { lat: 22.5726, lng: 88.3639, state: "West Bengal", elevation: "9m" },
  darjeeling: { lat: 27.041, lng: 88.2663, state: "West Bengal", elevation: "2,042m" },
  puri: { lat: 19.8135, lng: 85.8312, state: "Odisha", elevation: "0m" },
  bhubaneswar: { lat: 20.2961, lng: 85.8245, state: "Odisha", elevation: "45m" },
  srinagar: { lat: 34.0837, lng: 74.7973, state: "Jammu and Kashmir", elevation: "1,585m" },
  gulmarg: { lat: 34.0484, lng: 74.3805, state: "Jammu and Kashmir", elevation: "2,650m" },
  ladakh: { lat: 34.1526, lng: 77.5771, state: "Ladakh", elevation: "3,500m" },
  leh: { lat: 34.1526, lng: 77.5771, state: "Ladakh", elevation: "3,500m" },
  gangtok: { lat: 27.3389, lng: 88.6065, state: "Sikkim", elevation: "1,650m" },
  shillong: { lat: 25.5788, lng: 91.8933, state: "Meghalaya", elevation: "1,525m" },
  amritsar: { lat: 31.634, lng: 74.8723, state: "Punjab", elevation: "234m" },
}

export function getCoordsForDestination(
  destination: string,
  state = "",
): GeoLocation {
  const norm = (destination || "").toLowerCase().trim()
  for (const [key, val] of Object.entries(INDIAN_COORDS_MAP)) {
    if (norm.includes(key) || key.includes(norm)) {
      return val
    }
  }

  // State fallbacks
  const normState = (state || "").toLowerCase().trim()
  if (normState.includes("andhra")) return { lat: 16.5062, lng: 80.648, state: "Andhra Pradesh", elevation: "25m" }
  if (normState.includes("telangana")) return { lat: 17.385, lng: 78.4867, state: "Telangana", elevation: "542m" }
  if (normState.includes("kerala")) return { lat: 9.9312, lng: 76.2673, state: "Kerala", elevation: "10m" }
  if (normState.includes("tamil")) return { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu", elevation: "12m" }
  if (normState.includes("karnataka")) return { lat: 12.9716, lng: 77.5946, state: "Karnataka", elevation: "920m" }
  if (normState.includes("uttar")) return { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh", elevation: "128m" }
  if (normState.includes("rajasthan")) return { lat: 26.9124, lng: 75.7873, state: "Rajasthan", elevation: "431m" }
  if (normState.includes("himachal")) return { lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh", elevation: "2,200m" }
  if (normState.includes("uttarakhand")) return { lat: 30.0869, lng: 78.2676, state: "Uttarakhand", elevation: "400m" }
  if (normState.includes("delhi")) return { lat: 28.6139, lng: 77.209, state: "Delhi", elevation: "216m" }
  if (normState.includes("maharashtra")) return { lat: 19.076, lng: 72.8777, state: "Maharashtra", elevation: "14m" }
  if (normState.includes("goa")) return { lat: 15.2993, lng: 74.124, state: "Goa", elevation: "15m" }

  return { lat: 20.5937, lng: 78.9629, state: state || "India", elevation: "200m" } // Center of India fallback
}

export function getGoogleMapsEmbedUrl({
  lat,
  lng,
  query,
  mapType = "m",
  zoom = 15,
}: {
  lat?: number
  lng?: number
  query?: string
  mapType?: "m" | "k"
  zoom?: number
}): string {
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    return `https://maps.google.com/maps?q=${lat},${lng}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`
  }
  const cleanQuery = encodeURIComponent(query || "India")
  return `https://maps.google.com/maps?q=${cleanQuery}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`
}

export function getGoogleMapsDirectionsUrl({
  lat,
  lng,
  query,
  destinationCity = "",
  stateName = "India",
  travelMode = "driving",
}: {
  lat?: number
  lng?: number
  query?: string
  destinationCity?: string
  stateName?: string
  travelMode?: "driving" | "transit" | "walking"
}): string {
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${travelMode}`
  }
  const fullSearch = `${query || ""}, ${destinationCity}, ${stateName}, India`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullSearch)}&travelmode=${travelMode}`
}
