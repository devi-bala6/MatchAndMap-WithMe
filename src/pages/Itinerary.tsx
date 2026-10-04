import React, { useState, useEffect } from "react"
import type {
  ItineraryDay,
  ItineraryActivity,
  Itinerary,
  Trip,
  User,
} from "../types"
import PlaceImage from "../components/PlaceImage"
import {
  Calendar,
  MapPin,
  Leaf,
  DollarSign,
  Printer,
  Compass,
  Sparkles,
  Search,
  PlusCircle,
  Plane,
  ExternalLink,
  Navigation,
  Clock,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
  Utensils,
  Coffee,
  Fish,
} from "lucide-react"
import { readTrips } from "../lib/tripStorage"
import { apiRequest } from "../lib/api"
import { getCoordsForDestination } from "../lib/geoUtils"
import GoogleMapsModal from "../components/GoogleMapsModal"

interface NearbyGem {
  id: string
  name: string
  type: string
  distance: string
  timeToDetour: string
  description: string
  cost: number
  bestTime: string
  lat: number
  lng: number
}

interface FoodRecommendation {
  id: string
  name: string
  specialty: string
  diet: "Pure Vegetarian" | "Coastal Seafood & Non-Veg" | "Traditional Thali" | "Heritage Street Food" | "Cafe & Bakery"
  locationDesc: string
  priceRange: string
  timing: string
  lat: number
  lng: number
  landmarkQuery: string
}

const DESTINATION_INTELLIGENCE: Record<
  string,
  {
    state: string
    ecoScore: number
    days: {
      title: string
      location: string
      activities: {
        name: string
        type: "sightseeing" | "nature" | "cultural" | "adventure" | "food"
        time: string
        duration: string
        cost: number
        notes: string
        lat: number
        lng: number
      }[]
      foodSpots: FoodRecommendation[]
      nearbyGems: NearbyGem[]
      stay: string
      transport: string
      ecoTip: string
    }[]
  }
> = {
  visakhapatnam: {
    state: "Andhra Pradesh",
    ecoScore: 92,
    days: [
      {
        title: "Coastal Heritage & Naval History Circuit",
        location: "RK Beach & Central Coast, Visakhapatnam",
        stay: "Solar-Powered Beach Eco-Homestay, Rushikonda",
        transport: "Electric Coastal Auto / Walkable Promenade",
        ecoTip: "Support local coastal fishermen cooperative stalls and avoid single-use plastics along the beach.",
        activities: [
          {
            name: "INS Kursura Submarine Museum",
            type: "cultural",
            time: "08:30 AM",
            duration: "2.5 hrs",
            cost: 150,
            notes: "Real decommissioned submarine museum with retired naval officer guided walkthrough.",
            lat: 17.7167,
            lng: 83.3333,
          },
          {
            name: "Kailasagiri Hilltop Park",
            type: "sightseeing",
            time: "02:00 PM",
            duration: "2 hrs",
            cost: 120,
            notes: "Panoramic 360-degree hilltop overlooking Bay of Bengal and city coastline.",
            lat: 17.7475,
            lng: 83.3444,
          },
          {
            name: "Tenneti Beach Park & Sea Arch",
            type: "nature",
            time: "05:00 PM",
            duration: "2 hrs",
            cost: 50,
            notes: "Natural coastal rock formations, shipwreck viewpoint, and evening sea breeze.",
            lat: 17.7612,
            lng: 83.3645,
          },
        ],
        foodSpots: [
          {
            id: "food_vizag_1",
            name: "Sea Inn (Raju Gaari Dhaba)",
            specialty: "Fresh Andhra Prawns Fry, Vanjaram Fish Curry & Ghee Biryani",
            diet: "Coastal Seafood & Non-Veg",
            locationDesc: "Rushikonda Beach Road, Visakhapatnam",
            priceRange: "₹250 - ₹450 per person",
            timing: "12:00 PM - 10:30 PM",
            lat: 17.7836,
            lng: 83.3821,
            landmarkQuery: "Sea Inn Raju Gaari Dhaba Rushikonda Visakhapatnam",
          },
          {
            id: "food_vizag_2",
            name: "Sai Ram Parlour",
            specialty: "Ghee Pongal, MLA Pesarattu, Onion Upma Dosa & Filter Coffee",
            diet: "Pure Vegetarian",
            locationDesc: "Diamond Park, Dwaraka Nagar, Visakhapatnam",
            priceRange: "₹80 - ₹180 per person",
            timing: "06:30 AM - 10:30 PM",
            lat: 17.7214,
            lng: 83.3082,
            landmarkQuery: "Sai Ram Parlour Diamond Park Visakhapatnam",
          },
          {
            id: "food_vizag_3",
            name: "Hotel Daspalla (Heritage Andhra Bhojanam)",
            specialty: "Traditional Full Andhra Thali with Gongura Pachadi on Banana Leaf",
            diet: "Traditional Thali",
            locationDesc: "Surya Bagh, Jagadamba Junction, Visakhapatnam",
            priceRange: "₹220 - ₹400 per person",
            timing: "12:30 PM - 03:30 PM, 07:00 PM - 10:30 PM",
            lat: 17.7122,
            lng: 83.3025,
            landmarkQuery: "Hotel Daspalla Surya Bagh Visakhapatnam",
          },
        ],
        nearbyGems: [
          {
            id: "gem_vizag_1",
            name: "Rushikonda Blue Flag Beach & Surfing Point",
            type: "Water Adventure",
            distance: "3.5 km off main route",
            timeToDetour: "10 min drive",
            description: "Certified eco-friendly Blue Flag beach with kayaking and windsurfing.",
            cost: 200,
            bestTime: "Early Morning or Sunset",
            lat: 17.7816,
            lng: 83.3854,
          },
          {
            id: "gem_vizag_2",
            name: "Thotlakonda Ancient Buddhist Monastery",
            type: "Archaeological Heritage",
            distance: "6.2 km from Kailasagiri",
            timeToDetour: "15 min drive",
            description: "2,000-year-old hilltop Buddhist monastic ruins with stupas and stone viharas.",
            cost: 50,
            bestTime: "3:30 PM - 5:00 PM",
            lat: 17.8242,
            lng: 83.4144,
          },
          {
            id: "gem_vizag_3",
            name: "Ross Hill Multi-Faith Harbor Overlook",
            type: "Scenic Viewpoint",
            distance: "4.0 km from RK Beach",
            timeToDetour: "12 min drive",
            description: "Three adjacent hills hosting a historic Church, Mosque, and Temple overlooking the port.",
            cost: 0,
            bestTime: "Sunset",
            lat: 17.6931,
            lng: 83.2986,
          },
        ],
      },
      {
        title: "Araku Valley & Borra Caves Expedition",
        location: "Araku Highlands & Ananthagiri Hills, Andhra Pradesh",
        stay: "Bamboo Cottage Tribal Homestay, Araku",
        transport: "Vistadome Mountain Rail / Shared Eco-Jeep",
        ecoTip: "Buy organic Araku Coffee directly from tribal cooperatives (Girijan Cooperative Corporation).",
        activities: [
          {
            name: "Borra Caves Stalactite Caverns",
            type: "adventure",
            time: "09:00 AM",
            duration: "3 hrs",
            cost: 200,
            notes: "Deepest karst cave formation in India with natural million-year-old rock formations.",
            lat: 18.2811,
            lng: 83.0392,
          },
          {
            name: "Araku Tribal Museum & Coffee Plantations",
            type: "cultural",
            time: "02:30 PM",
            duration: "2.5 hrs",
            cost: 150,
            notes: "Organic shade-grown coffee tasting and indigenous Dhimsa dance cultural showcase.",
            lat: 18.3273,
            lng: 82.8775,
          },
          {
            name: "Chaparai Waterfalls & Pine Grove",
            type: "nature",
            time: "05:00 PM",
            duration: "1.5 hrs",
            cost: 40,
            notes: "Smooth natural rock water cascades framed by towering pine woods.",
            lat: 18.2917,
            lng: 82.7844,
          },
        ],
        foodSpots: [
          {
            id: "food_araku_1",
            name: "Araku Native Bamboo Chicken Stalls",
            specialty: "Wood-fire roasted country chicken cooked in green bamboo stems without oil",
            diet: "Coastal Seafood & Non-Veg",
            locationDesc: "Ghat Road & Tribal Market, Araku Valley",
            priceRange: "₹150 - ₹300 per portion",
            timing: "11:00 AM - 07:00 PM",
            lat: 18.3255,
            lng: 82.8722,
            landmarkQuery: "Bamboo Chicken Araku Valley",
          },
          {
            id: "food_araku_2",
            name: "Vasundhara Tribal Kitchen",
            specialty: "Millet Rotis, Country Dal, Gongura Rice & Sweet Jaggery Sweetmeats",
            diet: "Traditional Thali",
            locationDesc: "Near Padmapuram Gardens, Araku Town",
            priceRange: "₹120 - ₹220 per person",
            timing: "12:00 PM - 09:30 PM",
            lat: 18.3341,
            lng: 82.8698,
            landmarkQuery: "Padmapuram Gardens Araku Valley",
          },
        ],
        nearbyGems: [
          {
            id: "gem_araku_1",
            name: "Katiki Waterfalls Secret Jungle Trail",
            type: "Hidden Waterfall",
            distance: "4.8 km from Borra Caves",
            timeToDetour: "20 min jeep trek",
            description: "50-meter secluded cascade nestled inside Goyapani forest gorge.",
            cost: 100,
            bestTime: "11:00 AM - 1:00 PM",
            lat: 18.2589,
            lng: 83.0125,
          },
          {
            id: "gem_araku_2",
            name: "Padmapuram Botanical Hanging Huts",
            type: "Nature Sanctuary",
            distance: "2.0 km from Araku Town",
            timeToDetour: "5 min drive",
            description: "World War II era botanical garden featuring treetop wooden huts and rare medicinal plants.",
            cost: 60,
            bestTime: "Morning",
            lat: 18.3392,
            lng: 82.8689,
          },
        ],
      },
    ],
  },
  tirupati: {
    state: "Andhra Pradesh",
    ecoScore: 94,
    days: [
      {
        title: "Tirumala Sanctum & Sacred Geology Circuit",
        location: "Tirumala Hills, Andhra Pradesh",
        stay: "TTD Eco Guesthouse / Vedic Ashrama Stay",
        transport: "Electric APSRTC Ghat Buses / Foot Alipiri Pathway",
        ecoTip: "Tirumala is a 100% plastic-free sacred zone. Carry cloth bags and utilize temple water filters.",
        activities: [
          {
            name: "Sri Venkateswara Swamy Temple",
            type: "cultural",
            time: "07:30 AM",
            duration: "3.5 hrs",
            cost: 300,
            notes: "Ancient sacred temple dedicated to Lord Balaji with Laddu Prasadam.",
            lat: 13.6833,
            lng: 79.35,
          },
          {
            name: "Silathoranam (Natural Rock Arch)",
            type: "nature",
            time: "02:00 PM",
            duration: "1.5 hrs",
            cost: 0,
            notes: "Pre-Cambrian natural geological rock arch dating back 2.5 billion years.",
            lat: 13.6789,
            lng: 79.3456,
          },
          {
            name: "Srivari Pada & Chakra Theertham",
            type: "sightseeing",
            time: "04:30 PM",
            duration: "2 hrs",
            cost: 0,
            notes: "High hill viewpoint with sacred water spring and panoramic forested valleys.",
            lat: 13.6942,
            lng: 79.3389,
          },
        ],
        foodSpots: [
          {
            id: "food_tpt_1",
            name: "Hotel Bhimas Deluxe",
            specialty: "Ghee Roast Masala Dosa, Cashew Upma & Piping Hot Filter Kaapi",
            diet: "Pure Vegetarian",
            locationDesc: "Railway Station Road, Tirupati",
            priceRange: "₹100 - ₹220 per person",
            timing: "06:30 AM - 10:30 PM",
            lat: 13.6288,
            lng: 79.4192,
            landmarkQuery: "Hotel Bhimas Deluxe Tirupati",
          },
          {
            id: "food_tpt_2",
            name: "Sri Lakshmi Gayatri Bhavan",
            specialty: "Unlimited Traditional Andhra Leaf Meal with Ghee, Podi & Sambar",
            diet: "Traditional Thali",
            locationDesc: "Tirumala Bypass Road, Tirupati",
            priceRange: "₹140 - ₹250 per person",
            timing: "11:30 AM - 04:00 PM, 07:00 PM - 10:30 PM",
            lat: 13.6355,
            lng: 79.4255,
            landmarkQuery: "Lakshmi Gayatri Bhavan Tirupati",
          },
          {
            id: "food_tpt_3",
            name: "Maurya Restaurant",
            specialty: "Authentic Rayalaseema Ragi Sangati & Veg Pulao",
            diet: "Pure Vegetarian",
            locationDesc: "TP Area, Tirupati",
            priceRange: "₹150 - ₹300 per person",
            timing: "12:00 PM - 10:30 PM",
            lat: 13.6305,
            lng: 79.415,
            landmarkQuery: "Hotel Maurya Tirupati",
          },
        ],
        nearbyGems: [
          {
            id: "gem_tpt_1",
            name: "Papavinasam Sacred Reservoir & Waterfalls",
            type: "Holy Stream",
            distance: "4.2 km from Tirumala Main Temple",
            timeToDetour: "12 min drive",
            description: "Serene holy spring amidst dense Seshachalam Biosphere Reserve.",
            cost: 0,
            bestTime: "11:00 AM - 1:00 PM",
            lat: 13.7123,
            lng: 79.3312,
          },
          {
            id: "gem_tpt_2",
            name: "Sri Kapila Theertham Mountain Waterfall Temple",
            type: "Ancient Cave Temple",
            distance: "Foot of Hills (Alipiri)",
            timeToDetour: "At base gate",
            description: "10th-century Chola-built Shiva temple with a mountain waterfall feeding the sacred pool.",
            cost: 20,
            bestTime: "Early Morning or 5:00 PM",
            lat: 13.6528,
            lng: 79.4219,
          },
          {
            id: "gem_tpt_3",
            name: "Chandragiri Historic Fort & Palace Museum",
            type: "Royal Citadel",
            distance: "14 km from Tirupati City",
            timeToDetour: "25 min drive",
            description: "11th-century Vijayanagara royal stronghold with acoustic light & sound show.",
            cost: 80,
            bestTime: "4:00 PM - 7:00 PM",
            lat: 13.5833,
            lng: 79.3167,
          },
        ],
      },
    ],
  },
  "taj mahal": {
    state: "Uttar Pradesh",
    ecoScore: 88,
    days: [
      {
        title: "Mughal Architecture & Yamuna River Heritage",
        location: "Agra, Uttar Pradesh",
        stay: "Solar-Powered Heritage Haveli, Taj East Gate",
        transport: "Battery Electric Golf Carts / Cycle Rickshaws",
        ecoTip: "The 500m radius around the Taj Mahal is an EV-only Eco-Sensitive Taj Trapezium Zone.",
        activities: [
          {
            name: "Taj Mahal",
            type: "sightseeing",
            time: "06:00 AM",
            duration: "3 hrs",
            cost: 250,
            notes: "UNESCO World Heritage white marble monument illuminated by early morning sunrise.",
            lat: 27.1751,
            lng: 78.0421,
          },
          {
            name: "Agra Fort",
            type: "cultural",
            time: "01:30 PM",
            duration: "2.5 hrs",
            cost: 100,
            notes: "Vast red sandstone fortress containing Jahangiri Mahal, Diwan-i-Khas, and royal quarters.",
            lat: 27.1795,
            lng: 78.0211,
          },
          {
            name: "Mehtab Bagh",
            type: "nature",
            time: "05:30 PM",
            duration: "2 hrs",
            cost: 50,
            notes: "Charbagh garden complex on the opposite bank of Yamuna offering reflection sunset views.",
            lat: 27.1801,
            lng: 78.0425,
          },
        ],
        foodSpots: [
          {
            id: "food_agra_1",
            name: "Panchi Petha Store (Original)",
            specialty: "Authentic Angoori Petha, Kesar Petha & Spicy Agra Dalmoth",
            diet: "Heritage Street Food",
            locationDesc: "Hari Parwat Crossing, Agra",
            priceRange: "₹80 - ₹200 per pack",
            timing: "09:00 AM - 10:30 PM",
            lat: 27.1955,
            lng: 78.0062,
            landmarkQuery: "Panchi Petha Hari Parvat Agra",
          },
          {
            id: "food_agra_2",
            name: "Dasaprakash Heritage Pure Veg",
            specialty: "North & South Indian Thalis, Paneer Butter Masala & Kulfi Falooda",
            diet: "Pure Vegetarian",
            locationDesc: "Sadar Bazaar, Agra Cantt",
            priceRange: "₹200 - ₹450 per person",
            timing: "11:00 AM - 11:00 PM",
            lat: 27.1611,
            lng: 78.0125,
            landmarkQuery: "Dasaprakash Sadar Bazaar Agra",
          },
          {
            id: "food_agra_3",
            name: "Shankar Ji Sweets & Bedai",
            specialty: "Crispy Urad Dal Bedai Poori with Spicy Aloo Sabzi & Hot Jalebis",
            diet: "Heritage Street Food",
            locationDesc: "Kinari Bazaar, Agra",
            priceRange: "₹60 - ₹120 per person",
            timing: "06:30 AM - 01:00 PM",
            lat: 27.1845,
            lng: 78.0189,
            landmarkQuery: "Shankar Ji Sweets Kinari Bazaar Agra",
          },
        ],
        nearbyGems: [
          {
            id: "gem_agra_1",
            name: "Itmad-ud-Daulah (Baby Taj Jewel Box)",
            type: "Marble Mausoleum",
            distance: "3.8 km from Agra Fort",
            timeToDetour: "10 min drive",
            description: "Delicate Pietra Dura marble inlay work that served as architectural blueprint for Taj Mahal.",
            cost: 80,
            bestTime: "Morning",
            lat: 27.1928,
            lng: 78.0311,
          },
          {
            id: "gem_agra_2",
            name: "Sheroes Hangout Empowering Cafe",
            type: "Social Impact Dining",
            distance: "1.2 km from Taj Gate",
            timeToDetour: "5 min walk",
            description: "Community cafe run entirely by acid attack survivors serving delicious organic local meals.",
            cost: 200,
            bestTime: "Lunch or Evening Tea",
            lat: 27.1654,
            lng: 78.0489,
          },
          {
            id: "gem_agra_3",
            name: "Fatehpur Sikri Imperial Deserted Capital",
            type: "UNESCO Citadel",
            distance: "36 km detour on expressway",
            timeToDetour: "45 min drive",
            description: "Akbar's 16th-century ghost city with the towering 54-meter Buland Darwaza.",
            cost: 150,
            bestTime: "Afternoon",
            lat: 27.0944,
            lng: 77.6675,
          },
        ],
      },
    ],
  },
}

function generateDynamicItinerary(
  destinationName: string,
  stateName = "India",
  daysCount = 4,
  totalBudget = 16000,
): Itinerary {
  const norm = destinationName.toLowerCase().trim()

  for (const [key, val] of Object.entries(DESTINATION_INTELLIGENCE)) {
    if (norm.includes(key) || key.includes(norm)) {
      const days: ItineraryDay[] = val.days.map((d, idx) => ({
        day: idx + 1,
        date: `Day ${idx + 1}`,
        title: d.title,
        location: d.location,
        activities: d.activities.map((a, aIdx) => ({
          id: `act_${idx}_${aIdx}`,
          time: a.time,
          name: a.name,
          type: a.type,
          duration: a.duration,
          cost: a.cost,
          notes: a.notes,
          eco: true,
        })),
        accommodation: d.stay,
        transport: d.transport,
        meals: ["Regional Breakfast", "Local Traditional Thali", "Eco-Homestay Dinner"],
        budget: Math.round(totalBudget / Math.max(1, val.days.length)),
        ecoTip: d.ecoTip,
      }))

      return {
        id: `itin_${Date.now()}`,
        tripId: "",
        destination: destinationName,
        state: val.state,
        startDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        totalDays: days.length,
        totalBudget,
        ecoScore: val.ecoScore,
        days,
      }
    }
  }

  // Adaptive generator for other destinations
  const geo = getCoordsForDestination(destinationName, stateName)
  const days: ItineraryDay[] = []
  const dailyBudget = Math.round(totalBudget / Math.max(1, daysCount))

  const adaptiveThemes = [
    { title: "Arrival & Historic City Trail", loc: "Old Quarter & Riverfront" },
    { title: "Sacred Shrines & Heritage Wonders", loc: "Historic Complex & Sanctuary" },
    { title: "Nature Reserve & Adventure Treks", loc: "High Ridge & Waterfall Trail" },
    { title: "Local Craft Bazaars & Sunset Vista", loc: "Artisan Village & Viewpoint" },
  ]

  for (let i = 1; i <= Math.min(daysCount, 5); i++) {
    const theme = adaptiveThemes[(i - 1) % adaptiveThemes.length]
    days.push({
      day: i,
      date: `Day ${i}`,
      title: `${destinationName}: ${theme.title}`,
      location: `${destinationName} (${theme.loc})`,
      activities: [
        {
          id: `act_${i}_1`,
          time: "08:30 AM",
          name: `${destinationName} Morning Heritage Walk`,
          type: "sightseeing",
          duration: "2.5 hrs",
          cost: Math.round(dailyBudget * 0.12),
          eco: true,
          notes: "Walkable route guided by local eco-historians and community stewards.",
        },
        {
          id: `act_${i}_2`,
          time: "01:30 PM",
          name: `${destinationName} Artisan Guild & Culinary Thali`,
          type: "cultural",
          duration: "2 hrs",
          cost: Math.round(dailyBudget * 0.18),
          eco: true,
          notes: "Locally prepared authentic dishes supporting village cooperatives.",
        },
        {
          id: `act_${i}_3`,
          time: "05:00 PM",
          name: `${destinationName} Sunset Viewpoint & Photo Trail`,
          type: "nature",
          duration: "2 hrs",
          cost: Math.round(dailyBudget * 0.1),
          eco: true,
          notes: "Scenic panoramic vista with shared EV or walking access.",
        },
      ],
      accommodation: "Verified Eco Homestay / Certified Heritage Stay",
      transport: "Shared Electric Transport & Walking Circuits",
      meals: ["Fresh Local Breakfast", "Traditional Thali", "Homestay Supper"],
      budget: Math.round(dailyBudget * 0.6),
      ecoTip: "Carry reusable water flasks, support family-owned diners, and respect regional heritage sanctuaries.",
    })
  }

  return {
    id: `itin_${Date.now()}`,
    tripId: "",
    destination: destinationName,
    state: stateName,
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    totalDays: days.length,
    totalBudget,
    ecoScore: 89,
    days,
  }
}

export default function Itinerary({ user }: { user?: User | null }) {
  const [userTrips, setUserTrips] = useState<Trip[]>([])
  const [selectedDest, setSelectedDest] = useState<string>("Visakhapatnam")
  const [selectedState, setSelectedState] = useState<string>("Andhra Pradesh")
  const [selectedDuration, setSelectedDuration] = useState<number>(3)
  const [selectedBudget, setSelectedBudget] = useState<number>(14000)
  const [customSearch, setCustomSearch] = useState("")
  const [activeDay, setActiveDay] = useState(0)
  const [selectedGemsDay, setSelectedGemsDay] = useState<number | null>(null)
  const [addedGems, setAddedGems] = useState<string[]>([])

  useEffect(() => {
    async function loadTrips() {
      try {
        const liveTrips = await apiRequest<Trip[]>("/trips").catch(() => [])
        if (Array.isArray(liveTrips) && liveTrips.length > 0) {
          setUserTrips(liveTrips)
          setSelectedDest(liveTrips[0].destination)
          setSelectedState(liveTrips[0].state || "India")
          setSelectedDuration(liveTrips[0].duration || 3)
          setSelectedBudget(liveTrips[0].budgetAmount || 15000)
          return
        }
      } catch {}
      const local = readTrips()
      setUserTrips(local)
      if (local.length > 0) {
        setSelectedDest(local[0].destination)
        setSelectedState(local[0].state || "India")
        setSelectedDuration(local[0].duration || 3)
        setSelectedBudget(local[0].budgetAmount || 15000)
      }
    }
    loadTrips()
  }, [])

  function selectTrip(trip: Trip) {
    setSelectedDest(trip.destination)
    setSelectedState(trip.state || "India")
    setSelectedDuration(trip.duration || 3)
    setSelectedBudget(trip.budgetAmount || 15000)
    setActiveDay(0)
  }

  function handleCustomSearch(e: React.FormEvent) {
    e.preventDefault()
    if (customSearch.trim()) {
      setSelectedDest(customSearch.trim())
      setSelectedState("India")
      setSelectedDuration(3)
      setSelectedBudget(16000)
      setActiveDay(0)
      setCustomSearch("")
    }
  }

  const itin = generateDynamicItinerary(
    selectedDest,
    selectedState,
    selectedDuration,
    selectedBudget,
  )

  const days = itin.days || []
  const safeActiveDay = Math.min(activeDay, Math.max(0, days.length - 1))
  const day = days[safeActiveDay]

  // Find intelligence records for this destination
  const normKey = selectedDest.toLowerCase().trim()
  const matchingIntel = Object.entries(DESTINATION_INTELLIGENCE).find(
    ([k]) => normKey.includes(k) || k.includes(normKey),
  )
  const activeDayIntel = matchingIntel ? matchingIntel[1].days[safeActiveDay] : null

  const foodSpots: FoodRecommendation[] = activeDayIntel?.foodSpots || [
    {
      id: "food_generic_1",
      name: `${selectedDest} Traditional Bhojanam & Thali House`,
      specialty: "Authentic Regional Veg Thali with Seasonal Curries & Sweets",
      diet: "Traditional Thali",
      locationDesc: `Main Heritage Bazaar, ${selectedDest}`,
      priceRange: "₹150 - ₹280 per person",
      timing: "11:30 AM - 04:00 PM, 07:00 PM - 10:30 PM",
      lat: getCoordsForDestination(selectedDest).lat + 0.003,
      lng: getCoordsForDestination(selectedDest).lng + 0.002,
      landmarkQuery: `Thali restaurant ${selectedDest}`,
    },
    {
      id: "food_generic_2",
      name: `${selectedDest} Heritage Chai & Snack Corner`,
      specialty: "Special Masala Chai, Fresh Hot Samosas & Local Sweetmeats",
      diet: "Heritage Street Food",
      locationDesc: `Clock Tower / Main Market, ${selectedDest}`,
      priceRange: "₹40 - ₹100 per person",
      timing: "06:00 AM - 10:00 PM",
      lat: getCoordsForDestination(selectedDest).lat - 0.004,
      lng: getCoordsForDestination(selectedDest).lng + 0.005,
      landmarkQuery: `Tea stall market ${selectedDest}`,
    },
  ]

  const nearbyGems: NearbyGem[] = activeDayIntel?.nearbyGems || [
    {
      id: `gem_generic_1`,
      name: `${selectedDest} Traditional Tea & Spice Market`,
      type: "Artisan & Food Gem",
      distance: "1.8 km from city center",
      timeToDetour: "5 min walk",
      description: "Historic organic bazaar featuring heritage snacks, handicrafts, and regional spices.",
      cost: 100,
      bestTime: "Evening",
      lat: getCoordsForDestination(selectedDest).lat + 0.005,
      lng: getCoordsForDestination(selectedDest).lng + 0.005,
    },
    {
      id: `gem_generic_2`,
      name: `${selectedDest} Scenic Ridge Viewpoint`,
      type: "Panoramic Lookout",
      distance: "4.2 km off highway",
      timeToDetour: "12 min drive",
      description: "Quiet hillside sanctuary offering stunning morning light and fresh mountain air.",
      cost: 0,
      bestTime: "Sunrise or Sunset",
      lat: getCoordsForDestination(selectedDest).lat - 0.008,
      lng: getCoordsForDestination(selectedDest).lng + 0.01,
    },
  ]

  const handleAddGem = (gem: NearbyGem) => {
    if (day && !addedGems.includes(gem.id)) {
      day.activities.push({
        id: `gem_act_${Date.now()}`,
        time: "03:30 PM",
        name: `✨ ${gem.name} (On-The-Way Detour)`,
        type: "adventure",
        duration: "1.5 hrs",
        cost: gem.cost,
        notes: gem.description,
        eco: true,
      })
      setAddedGems((prev) => [...prev, gem.id])
    }
  }

  const totalCalculatedBudget = days.reduce(
    (s, d) => s + d.activities.reduce((sa, a) => sa + a.cost, 0) + d.budget,
    0,
  )

  const [activeMapPlace, setActiveMapPlace] = useState<{
    placeName: string
    destinationCity: string
    stateName?: string
    lat?: number
    lng?: number
    address?: string
    category?: string
    timing?: string
    specialty?: string
  } | null>(null)

  // Helper for generating pinpoint accurate Google Maps Direction links
  const getDirectionsUrl = (lat: number | undefined, lng: number | undefined, name: string) => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    }
    const cleanQuery = `${name}, ${selectedDest}, ${selectedState}, India`
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cleanQuery)}`
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            Live Itinerary, Dining & Navigation Intelligence
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-100">
            {selectedDest} Blueprint
          </h2>
          <p className="text-xs sm:text-sm mt-1 text-slate-400">
            Authentic landmark stops, verified local food options, turn-by-turn directions, and on-the-way hidden gems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Search Form */}
          <form onSubmit={handleCustomSearch} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="text"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                placeholder="Search any destination..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs transition-all"
            >
              Plan
            </button>
          </form>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-display font-medium text-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            Export Plan
          </button>
        </div>
      </div>

      {/* Your Created Real Trips Selector */}
      {userTrips.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              Plan Itinerary for Your Real Trips ({userTrips.length})
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {userTrips.map((trip) => {
              const isSelected =
                selectedDest.toLowerCase() === trip.destination.toLowerCase()
              return (
                <button
                  key={trip.id || trip._id}
                  onClick={() => selectTrip(trip)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-display font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20"
                      : "bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span>📍 {trip.destination}</span>
                  <span className="font-mono text-[10px] opacity-75">
                    ({trip.duration || 3}d)
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Plan Header Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-cyan">{itin.state}</span>
            <span className="badge badge-green">🌿 Eco Score: {itin.ecoScore}/100</span>
          </div>
          <h3 className="font-display font-black text-2xl text-white">
            {itin.destination} {itin.totalDays}-Day Comprehensive Blueprint
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Daily landmark stops, verified culinary food recommendations, and on-the-way detours.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-[11px] text-slate-400">ESTIMATED BUDGET</p>
            <p className="font-display font-black text-2xl text-cyan-400">
              ₹{totalCalculatedBudget.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Day By Day View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Days Navigator */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">
            Days Itinerary ({days.length})
          </h4>
          <div className="space-y-2.5">
            {days.map((d, index) => {
              const isCurrent = safeActiveDay === index
              const totalDayCost =
                d.activities.reduce((s, a) => s + a.cost, 0) + d.budget
              return (
                <button
                  key={d.day}
                  onClick={() => setActiveDay(index)}
                  className={`text-left w-full p-4 rounded-2xl transition-all border ${
                    isCurrent
                      ? "bg-cyan-500/15 border-cyan-500/40 shadow-lg shadow-cyan-950/20"
                      : "bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      DAY {d.day}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      ₹{totalDayCost.toLocaleString()}
                    </span>
                  </div>
                  <p className="font-display font-bold text-sm text-slate-100 truncate mb-1">
                    {d.title}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400 truncate">
                    📍 {d.location}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right 2-Cols: Day Details, Stops, Food & Gems */}
        {day && (
          <div className="lg:col-span-2 space-y-6">
            {/* Day Title Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    DAY {day.day} SCHEDULE
                  </span>
                  <h3 className="font-display font-black text-xl text-white mt-0.5">
                    {day.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-slate-400">Day Budget</span>
                  <p className="font-display font-bold text-base text-slate-200">
                    ₹{day.budget.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Eco tip */}
              {day.ecoTip && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-300">
                  <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{day.ecoTip}</span>
                </div>
              )}

              {/* Nearby Gems & Detours Banner Trigger */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-cyan-950/40 border border-purple-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-purple-200">
                      On-The-Way & Nearby Gems Available!
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Discover {nearbyGems.length} authentic hidden spots near today's route with real GPS directions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGemsDay(day.day)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/40 flex-shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Explore Gems
                </button>
              </div>
            </div>

            {/* Activities / Detailed Landmark Stops */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Planned Landmark Stops & Real Route Navigation
              </h4>
              <div className="space-y-3">
                {day.activities.map((act, idx) => {
                  const intelAct = activeDayIntel?.activities[idx]
                  const lat = intelAct?.lat || getCoordsForDestination(selectedDest).lat
                  const lng = intelAct?.lng || getCoordsForDestination(selectedDest).lng
                  const directionsUrl = getDirectionsUrl(lat, lng, act.name)

                  return (
                    <div
                      key={act.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-display font-bold text-sm text-slate-100 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            {act.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-bold">
                              {act.type}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              ⏱ {act.duration} · {act.time}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="font-mono text-xs font-bold text-cyan-400 block">
                            ₹{act.cost}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Est. Entry/Ticket
                          </span>
                        </div>
                      </div>

                      {act.notes && (
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                          {act.notes}
                        </p>
                      )}

                      {/* Real Direction & Map Actions */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Accurate Pin: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setActiveMapPlace({
                                placeName: act.name,
                                destinationCity: selectedDest,
                                stateName: selectedState,
                                lat,
                                lng,
                                category: act.type,
                                timing: `${act.time} (${act.duration})`,
                                specialty: act.notes,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all"
                          >
                            <Compass className="w-3 h-3" />
                            Preview on Google Maps
                          </button>
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-semibold transition-all"
                          >
                            <Navigation className="w-3 h-3" />
                            Directions <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* FOOD & DINING RECOMMENDATIONS SECTION */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Local Food Options & Famous Eateries ({foodSpots.length})
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  Curated Regional Specialties
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {foodSpots.map((spot) => {
                  const foodDirectionsUrl = getDirectionsUrl(spot.lat, spot.lng, spot.name)

                  return (
                    <div
                      key={spot.id}
                      className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 space-y-3 hover:border-amber-500/50 transition-all shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-display font-bold text-sm text-white">
                              {spot.name}
                            </h5>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                spot.diet.includes("Vegetarian")
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : spot.diet.includes("Seafood")
                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {spot.diet}
                            </span>
                          </div>
                          <p className="text-xs text-amber-200/90 font-medium mt-1">
                            ⭐ Must-Try: {spot.specialty}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 mt-1.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-cyan-400" />
                              {spot.locationDesc}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {spot.timing}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="font-mono text-xs font-bold text-amber-400 block">
                            {spot.priceRange}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Avg. Cost
                          </span>
                        </div>
                      </div>

                      {/* Direction to Food Spot */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          🍴 Verified Authentic Flavor
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setActiveMapPlace({
                                placeName: spot.name,
                                destinationCity: selectedDest,
                                stateName: selectedState,
                                lat: spot.lat,
                                lng: spot.lng,
                                address: spot.locationDesc,
                                category: spot.diet,
                                timing: spot.timing,
                                specialty: spot.specialty,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all"
                          >
                            <Compass className="w-3 h-3" />
                            View Food on Google Maps
                          </button>
                          <a
                            href={foodDirectionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-semibold transition-all"
                          >
                            <Navigation className="w-3 h-3" />
                            Food Directions <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recommended Stays and Transit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                  RECOMMENDED STAY
                </span>
                <p className="font-display font-semibold text-sm text-slate-200">
                  {day.accommodation}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                  LOCAL TRANSPORT
                </span>
                <p className="font-display font-semibold text-sm text-slate-200">
                  {day.transport}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Nearby Places / On-The-Way Detour Modal */}
      {selectedGemsDay !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setSelectedGemsDay(null)}
        >
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    On-The-Way & Nearby Gems (Day {selectedGemsDay})
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Authentic regional detours around {selectedDest}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGemsDay(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {nearbyGems.map((gem) => {
                const isAdded = addedGems.includes(gem.id)
                const gemDirectionsUrl = getDirectionsUrl(gem.lat, gem.lng, gem.name)

                return (
                  <div
                    key={gem.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-base text-white">
                            {gem.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            {gem.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                          <span className="flex items-center gap-1 text-cyan-300">
                            <MapPin className="w-3.5 h-3.5" />
                            {gem.distance}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-300">
                            <Clock className="w-3.5 h-3.5" />
                            {gem.timeToDetour}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          {gem.cost > 0 ? `₹${gem.cost}` : "Free Entry"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      {gem.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setActiveMapPlace({
                              placeName: gem.name,
                              destinationCity: selectedDest,
                              stateName: selectedState,
                              lat: gem.lat,
                              lng: gem.lng,
                              category: gem.type,
                              specialty: gem.description,
                              timing: gem.bestTime,
                            })
                          }
                          className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-purple-500/40"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          Preview on Google Maps
                        </button>
                        <a
                          href={gemDirectionsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Directions <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <button
                        onClick={() => handleAddGem(gem)}
                        disabled={isAdded}
                        className={`px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition-all ${
                          isAdded
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/30"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Added to Today's Itinerary
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            Add Stop to Itinerary
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* In-App Interactive Google Maps Modal */}
      {activeMapPlace && (
        <GoogleMapsModal
          isOpen={true}
          onClose={() => setActiveMapPlace(null)}
          placeName={activeMapPlace.placeName}
          destinationCity={activeMapPlace.destinationCity}
          stateName={activeMapPlace.stateName || selectedState}
          lat={activeMapPlace.lat}
          lng={activeMapPlace.lng}
          address={activeMapPlace.address}
          category={activeMapPlace.category}
          timing={activeMapPlace.timing}
          specialty={activeMapPlace.specialty}
        />
      )}
    </div>
  )
}
