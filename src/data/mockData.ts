import type {
  User,
  Trip,
  ChatRoom,
  ChatMessage,
  WeatherData,
  MatchProfile,
  Review,
  Itinerary,
  Recommendation,
} from "../types"

export const currentUser: User = {
  id: "",
  name: "",
  email: "",
  age: 25,
  gender: "Other",
  nationality: "Indian",
  state: "",
  city: "",
  bio: "",
  interests: [],
  hobbies: [],
  languages: ["English", "Hindi"],
  budget: "mid-range",
  travelStyle: "Adventure",
  tripsCount: 0,
  rating: 5.0,
  reviewCount: 0,
  verified: false,
  joinedDate: "2026",
  role: "user",
  phone: "",
  ecoScore: 80,
  beneficiary: {
    name: "",
    relation: "",
    phone: "",
    email: "",
    address: "",
  },
}

export const adminUser: User = {
  ...currentUser,
  name: "Administrator",
  email: "admin@matchandmap.in",
  role: "admin",
  verified: true,
}

// Zero fake users
export const allUsers: User[] = []

// Zero fake trips
export const myTrips: Trip[] = []
export const browseTrips: Trip[] = []
export const mockTrips: Trip[] = []

// Zero fake social or activity records
export const chatRooms: ChatRoom[] = []
export const chatMessages: ChatMessage[] = []
export const reviews: Review[] = []
export const matchProfiles: MatchProfile[] = []
export const recentActivity: any[] = []

export const itineraryData: Itinerary = {
  id: "itin_default",
  tripId: "",
  destination: "Your Next Destination",
  state: "India",
  startDate: new Date().toISOString().split("T")[0],
  totalDays: 5,
  totalBudget: 15000,
  ecoScore: 85,
  days: [],
}

export const recommendationsData: Recommendation[] = [
  {
    id: "rec1",
    type: "destination",
    title: "Kedarnath & Badrinath Dham, Uttarakhand",
    subtitle: "Char Dham Yatra · Himalayan Pilgrimage · Mandakini Valley",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/1280px-Kedarnath_Temple_in_Rainy_season.jpg",
    tags: ["Spiritual", "Devotional", "Trekking", "Mountains"],
    matchReason: "Top spiritual destination for sacred Himalayan journeys",
    rating: 4.9,
    ecoFriendly: true,
    budgetRange: "₹18,000 - ₹28,000",
    state: "Uttarakhand",
  },
  {
    id: "rec2",
    type: "destination",
    title: "Varanasi Ghats & Kashi Vishwanath, Uttar Pradesh",
    subtitle: "Ganga Aarti · Sacred Ghats · Dashashwamedh & Manikarnika",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Dasaswamedh_ghat-varanasi_india-andres_larin.jpg/1280px-Dasaswamedh_ghat-varanasi_india-andres_larin.jpg",
    tags: ["Spiritual", "Devotional", "Culture", "History"],
    matchReason: "Oldest living city known for sacred ghats & Ganga Aarti",
    rating: 4.9,
    ecoFriendly: true,
    budgetRange: "₹10,000 - ₹18,000",
    state: "Uttar Pradesh",
  },
  {
    id: "rec3",
    type: "destination",
    title: "Harmandir Sahib (Golden Temple), Punjab",
    subtitle: "Sacred Amrit Sarovar · 24/7 Community Langar Seva",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Hamandir_Sahib_%28Golden_Temple%29.jpg/1280px-Hamandir_Sahib_%28Golden_Temple%29.jpg",
    tags: ["Spiritual", "Devotional", "Culture", "Heritage"],
    matchReason: "Serene spiritual haven and sacred Amrit Sarovar",
    rating: 5.0,
    ecoFriendly: true,
    budgetRange: "₹8,000 - ₹14,000",
    state: "Punjab",
  },
  {
    id: "rec4",
    type: "destination",
    title: "Ujjain Mahakaleshwar, Madhya Pradesh",
    subtitle: "Jyotirlinga Darshan · Sacred Shipra River · Bhasma Aarti",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Mahakal_Temple_Ujjain.JPG/1280px-Mahakal_Temple_Ujjain.JPG",
    tags: ["Spiritual", "Devotional", "History", "Culture"],
    matchReason: "Sacred Jyotirlinga and spiritual energy along Shipra River",
    rating: 4.9,
    ecoFriendly: true,
    budgetRange: "₹9,000 - ₹15,000",
    state: "Madhya Pradesh",
  },
  {
    id: "rec5",
    type: "destination",
    title: "Tirupati Balaji & Rameswaram, South India",
    subtitle: "Venkateswara Temple · Ramanathaswamy Corridors · Dhanushkodi",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=360&fit=crop&auto=format",
    tags: ["Spiritual", "Devotional", "Architecture", "Heritage"],
    matchReason:
      "Magnificent Dravidian temple architecture and oceanfront sanctums",
    rating: 4.9,
    ecoFriendly: true,
    budgetRange: "₹14,000 - ₹24,000",
    state: "Tamil Nadu",
  },
]

export const recommendations: Recommendation[] = recommendationsData

function makeTrendingPlace(
  id: string,
  title: string,
  state: string,
  subtitle: string,
  imageId: string,
  tags: string[],
  budgetRange: string,
  ecoFriendly = true,
): Recommendation {
  return {
    id,
    type: "destination",
    title,
    subtitle,
    image: `https://images.unsplash.com/${imageId}?w=600&h=360&fit=crop&auto=format`,
    tags,
    matchReason: `Explore ${title} for ${tags.slice(0, 2).join(" and ").toLowerCase()}`,
    rating: 4.8,
    ecoFriendly,
    budgetRange,
    state,
  }
}

export const trendingPlacesByHashtag: Record<string, Recommendation[]> = {
  "#SpendInIndia": [
    makeTrendingPlace(
      "more-pushkar",
      "Pushkar",
      "Rajasthan",
      "Sacred lake, lively bazaars, and desert sunsets",
      "photo-1599661046289-e31897846e41",
      ["Culture", "Budget"],
      "₹8,000 - ₹14,000",
      false,
    ),
    makeTrendingPlace(
      "more-orchha",
      "Orchha",
      "Madhya Pradesh",
      "Riverside cenotaphs and Bundela-era palaces",
      "photo-1473448912268-2022ce9509d8",
      ["History", "Architecture"],
      "₹7,000 - ₹13,000",
    ),
  ],
  "#DiscoverIndia": [
    makeTrendingPlace(
      "more-gangtok",
      "Gangtok",
      "Sikkim",
      "Monasteries, mountain viewpoints, and local markets",
      "photo-1506905925346-21bda4d32df4",
      ["Mountains", "Culture"],
      "₹14,000 - ₹22,000",
    ),
    makeTrendingPlace(
      "more-tawang",
      "Tawang",
      "Arunachal Pradesh",
      "High-altitude lakes and the Tawang Monastery",
      "photo-1626621341517-bbf3d9990a23",
      ["Mountains", "Monasteries"],
      "₹18,000 - ₹28,000",
    ),
  ],
  "#EcoTravel": [
    makeTrendingPlace(
      "more-mawlynnong",
      "Mawlynnong",
      "Meghalaya",
      "Living root bridges and community-led village walks",
      "photo-1589308078059-be1415eab4c3",
      ["Nature", "Community"],
      "₹12,000 - ₹19,000",
    ),
    makeTrendingPlace(
      "more-munnar",
      "Munnar",
      "Kerala",
      "Tea gardens, forest trails, and low-impact stays",
      "photo-1602216056096-3b40cc0c9944",
      ["Nature", "Tea Estates"],
      "₹13,000 - ₹21,000",
    ),
  ],
  "#TrainJourneyIndia": [
    makeTrendingPlace(
      "more-darjeeling",
      "Darjeeling",
      "West Bengal",
      "Ride the Himalayan Railway through tea country",
      "photo-1464822759023-fed622ff2c3b",
      ["Rail Journey", "Mountains"],
      "₹11,000 - ₹18,000",
    ),
    makeTrendingPlace(
      "more-ooty",
      "Ooty",
      "Tamil Nadu",
      "Nilgiri Mountain Railway, gardens, and hill walks",
      "photo-1500530855697-b586d89ba3ee",
      ["Rail Journey", "Hills"],
      "₹10,000 - ₹17,000",
    ),
  ],
  "#HimalayanTrekker": [
    makeTrendingPlace(
      "more-manali",
      "Solang & Manali Valley",
      "Himachal Pradesh",
      "High-altitude passes, cedar forests, and Himalayan trails",
      "photo-1626621341517-bbf3d9990a23",
      ["Trekking", "Himalayas", "Adventure"],
      "₹12,000 - ₹19,000",
    ),
    makeTrendingPlace(
      "more-rishikesh",
      "Rishikesh & Valley of Flowers",
      "Uttarakhand",
      "White water rapids, alpine meadows, and Himalayan foothills",
      "photo-1506905925346-21bda4d32df4",
      ["Trekking", "Spiritual", "Nature"],
      "₹9,000 - ₹16,000",
    ),
  ],
  "#SouthIndiaCircuit": [
    makeTrendingPlace(
      "more-vizag",
      "Visakhapatnam & Araku Valley",
      "Andhra Pradesh",
      "Scenic coastal ghats, Borra Caves, and coffee plantations",
      "photo-1589308078059-be1415eab4c3",
      ["Coastal", "Hills", "Caves"],
      "₹10,000 - ₹17,000",
    ),
    makeTrendingPlace(
      "more-hampi",
      "Hampi & Tungabhadra",
      "Karnataka",
      "UNESCO boulder landscapes and Vijayanagara architectural ruins",
      "photo-1582510003544-4d00b7f74220",
      ["Heritage", "History", "Architecture"],
      "₹8,000 - ₹14,000",
    ),
  ],
  "#IncredibleIndia": [
    makeTrendingPlace(
      "more-varanasi",
      "Varanasi Ghats & Sarnath",
      "Uttar Pradesh",
      "Sacred Ganga aarti, silk weavers, and ancient spiritual heritage",
      "photo-1548013146-72479768bada",
      ["Spiritual", "Culture", "Heritage"],
      "₹8,000 - ₹15,000",
    ),
    makeTrendingPlace(
      "more-jaipur",
      "Jaipur & Amber Fort",
      "Rajasthan",
      "Royal palaces, observatory astronomy, and vibrant bazaars",
      "photo-1477587458883-47145ed94245",
      ["Heritage", "Royal", "Culture"],
      "₹11,000 - ₹18,000",
    ),
  ],
  "#OffbeatIndia": [
    makeTrendingPlace(
      "more-gokarna",
      "Gokarna & Om Beach",
      "Karnataka",
      "Pristine cliffside beaches, coastal hiking, and serene temple town",
      "photo-1507525428034-b723cf961d3e",
      ["Beaches", "Peaceful", "Offbeat"],
      "₹7,000 - ₹13,000",
    ),
    makeTrendingPlace(
      "more-ziro",
      "Ziro Valley",
      "Arunachal Pradesh",
      "Paddy fields, Apatani cultural heritage, and pine hills",
      "photo-1473448912268-2022ce9509d8",
      ["Culture", "Nature", "Offbeat"],
      "₹15,000 - ₹24,000",
    ),
  ],
}

export const weatherData: WeatherData = {
  city: "New Delhi",
  state: "Delhi",
  temp: 28,
  feels_like: 29,
  condition: "Clear",
  humidity: 55,
  wind: 12,
  visibility: 10,
  uv: 5,
  aqi: 95,
  forecast: [
    { day: "Today", high: 30, low: 22, condition: "Sunny", icon: "☀️" },
    { day: "Tomorrow", high: 29, low: 21, condition: "Clear", icon: "☀️" },
    { day: "Day 3", high: 28, low: 20, condition: "Partly Cloudy", icon: "⛅" },
  ],
}

export const adminStats = {
  totalUsers: 0,
  activeTrips: 0,
  matchesMade: 0,
  sosTriggers: 0,
  newUsersThisWeek: 0,
  verifiedUsers: 0,
  pendingVerification: 0,
  reportedUsers: 0,
  states: 0,
  languages: 0,
}
