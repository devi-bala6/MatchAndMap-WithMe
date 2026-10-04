export type View = "landing" | "login" | "register" | "dashboard" | "my-trips" | "browse-trips" | "map" | "buddies" | "chat" | "profile" | "sos" | "weather" | "reviews" | "itinerary" | "recommendations" | "admin"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  age: number
  gender: string
  nationality: string
  state: string
  city: string
  bio: string
  interests: string[]
  hobbies: string[]
  languages: string[]
  budget: "budget" | "mid-range" | "luxury"
  travelStyle: string
  tripsCount: number
  rating: number
  reviewCount: number
  verified: boolean
  aadhaarVerified?: boolean
  aadhaarMasked?: string
  joinedDate: string
  role: "user" | "admin"
  beneficiary: Beneficiary
  phone: string
  ecoScore: number
}

export interface Beneficiary {
  name: string
  relation: string
  phone: string
  email: string
  address: string
}

export interface Trip {
  id: string
  userId: string
  userName: string
  userAvatar: string
  destination: string
  state: string
  image: string
  startDate: string
  endDate: string
  duration: number
  budget: "budget" | "mid-range" | "luxury"
  budgetAmount: number
  interests: string[]
  description: string
  status: "open" | "full" | "completed" | "cancelled"
  requestedUsers: string[]
  approvedUsers: string[]
  companions: number
  maxCompanions: number
  ecoFriendly: boolean
  carbonKg: number
  transport: string
  ecoPlaces?: string[]
}

export interface Review {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserAvatar: string
  toUserId: string
  toUserName: string
  tripId: string
  tripDestination: string
  rating: number
  ecoRating: number
  tags: string[]
  comment: string
  date: string
}

export interface ItineraryDay {
  day: number
  date: string
  title: string
  location: string
  activities: ItineraryActivity[]
  accommodation: string
  transport: string
  meals: string[]
  budget: number
  ecoTip: string
}

export interface ItineraryActivity {
  id: string
  time: string
  name: string
  type: "sightseeing" | "adventure" | "food" | "cultural" | "nature" | "rest"
  duration: string
  cost: number
  eco: boolean
  notes: string
}

export interface Itinerary {
  id: string
  tripId: string
  destination: string
  state: string
  startDate: string
  totalDays: number
  totalBudget: number
  days: ItineraryDay[]
  ecoScore: number
}

export interface Recommendation {
  id: string
  type: "destination" | "companion" | "activity"
  title: string
  subtitle: string
  image: string
  tags: string[]
  matchReason: string
  rating: number
  ecoFriendly: boolean
  budgetRange: string
  state: string
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
}

export interface ChatRoom {
  id: string
  name: string
  tripId?: string
  participants: string[]
  lastMessage: string
  lastTime: string
  unread: number
  avatar?: string
  destination?: string
}

export interface WeatherData {
  city: string
  state: string
  temp: number
  feels_like: number
  condition: string
  humidity: number
  wind: number
  visibility: number
  uv: number
  aqi: number
  forecast: ForecastDay[]
}

export interface ForecastDay {
  day: string
  high: number
  low: number
  condition: string
  icon: string
}

export interface MatchProfile {
  user: User
  compatibility: number
  sharedInterests: string[]
  sharedHobbies: string[]
  tripId?: string
  destination?: string
  dates?: string
}
