/**
 * Destination Intelligence & Cultural Travel Guide
 * Provides curated attractions, local cuisine highlights, and eco-travel tips.
 */

export interface DestinationInfo {
  attractions: string[]
  famousFoods: string[]
  bestSeason: string
  weatherAdvice: string
  ecoTip: string
  dailyBudgetEstimate: {
    stay: number
    food: number
    localTravel: number
  }
}

const DESTINATION_DATA: Record<string, DestinationInfo> = {
  manali: {
    attractions: ["Solang Valley", "Hadimba Temple", "Rohtang Pass", "Old Manali Cafes", "Jogini Waterfall"],
    famousFoods: ["Siddu with Ghee", "Himachali Dham", "Trout Fish", "Aktori", "Kullu Trout"],
    bestSeason: "October to June (Snow: Dec-Feb)",
    weatherAdvice: "Chilly evenings even in summer. Carry heavy woolens in winter.",
    ecoTip: "Avoid single-use plastic bottles; use refill stations at Old Manali cafes.",
    dailyBudgetEstimate: { stay: 1200, food: 600, localTravel: 400 },
  },
  ladakh: {
    attractions: ["Pangong Tso", "Nubra Valley", "Khardung La", "Thiksey Monastery", "Magnetic Hill"],
    famousFoods: ["Thukpa", "Tigmo with Stew", "Butter Tea (Gur Gur)", "Skyu", "Apricot Jam"],
    bestSeason: "May to September",
    weatherAdvice: "High altitude. Rest 24-48 hours in Leh for acclimatization before high passes.",
    ecoTip: "Support local Ladakhi homestays and never litter near high-altitude lakes.",
    dailyBudgetEstimate: { stay: 1500, food: 700, localTravel: 1200 },
  },
  leh: {
    attractions: ["Leh Palace", "Shanti Stupa", "Hall of Fame", "Sindhu Ghat", "Spituk Gompa"],
    famousFoods: ["Momos", "Chhurpi Soup", "Khambir Bread", "Sea Buckthorn Juice"],
    bestSeason: "May to September",
    weatherAdvice: "High UV radiation. Carry SPF 50+ sunscreen and stay hydrated.",
    ecoTip: "Drink boiled or filtered water in reusable thermos flasks.",
    dailyBudgetEstimate: { stay: 1400, food: 650, localTravel: 1000 },
  },
  spiti: {
    attractions: ["Key Monastery", "Chandratal Lake", "Kaza Market", "Hikkim Post Office", "Kibber Village"],
    famousFoods: ["Spiti Seabuckthorn Tea", "Tibetan Bread", "Barley Porridge (Tsampa)", "Thenthuk"],
    bestSeason: "June to October",
    weatherAdvice: "Remote high-altitude terrain. Carry offline maps and emergency cash.",
    ecoTip: "Conserve scarce water and respect Buddhist monastery heritage.",
    dailyBudgetEstimate: { stay: 1000, food: 500, localTravel: 800 },
  },
  rishikesh: {
    attractions: ["Triveni Ghat Aarti", "Laxman Jhula", "Neer Garh Waterfall", "Beatles Ashram", "Shivpuri Rafting"],
    famousFoods: ["Aloo Puri", "Ayurvedic Herbal Thali", "Lassi", "Garhwali Kafuli"],
    bestSeason: "September to April",
    weatherAdvice: "Pleasant winters. Peak monsoon (July-Aug) rafting is closed.",
    ecoTip: "Keep the holy Ganga clean; avoid throwing plastic or non-biodegradable offerings.",
    dailyBudgetEstimate: { stay: 800, food: 450, localTravel: 300 },
  },
  goa: {
    attractions: ["Palolem Beach", "Fort Aguada", "Dudhsagar Waterfalls", "Fontainhas Latin Quarter", "Anjuna Flea Market"],
    famousFoods: ["Goan Fish Curry Thali", "Prawn Balchão", "Bebinca", "Poi Bread", "Sol Kadhi"],
    bestSeason: "November to March",
    weatherAdvice: "Warm and tropical. Light cottons and beachwear recommended.",
    ecoTip: "Rent electric scooters for local commute and join beach cleanup drives.",
    dailyBudgetEstimate: { stay: 1500, food: 800, localTravel: 500 },
  },
  munnar: {
    attractions: ["Eravikulam National Park", "Mattupetty Dam", "Top Station", "Tea Gardens", "Attukad Waterfalls"],
    famousFoods: ["Kerala Appam with Stew", "Puttu & Kadala Curry", "Malabar Parotta", "Karimeen Pollichathu"],
    bestSeason: "September to May",
    weatherAdvice: "Misty and cool year-round. Carry light jackets and rain umbrellas.",
    ecoTip: "Buy authentic organic tea directly from local farm cooperatives.",
    dailyBudgetEstimate: { stay: 1200, food: 500, localTravel: 400 },
  },
  ooty: {
    attractions: ["Nilgiri Mountain Toy Train", "Botanical Gardens", "Doddabetta Peak", "Pykara Lake", "Tea Museum"],
    famousFoods: ["Nilgiri Green Tea", "Homemade Chocolates", "South Indian Banana Leaf Meals", "Varkey"],
    bestSeason: "October to June",
    weatherAdvice: "Cool climate. Evenings can get quite chilly.",
    ecoTip: "Take the heritage Toy Train instead of cabs to reduce road emissions.",
    dailyBudgetEstimate: { stay: 1100, food: 450, localTravel: 350 },
  },
  jaipur: {
    attractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Nahargarh Sunset Point", "Jantar Mantar"],
    famousFoods: ["Dal Baati Churma", "Pyaaz Kachori", "Ghevar", "Laal Maas", "Ker Sangri"],
    bestSeason: "October to March",
    weatherAdvice: "Hot in summers (>40°C). Perfect pleasant weather during winter months.",
    ecoTip: "Support local Rajasthani blue pottery and textile artisans directly in old bazaars.",
    dailyBudgetEstimate: { stay: 1200, food: 600, localTravel: 400 },
  },
  varanasi: {
    attractions: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Assi Ghat Morning Aarti", "Sarnath", "Manikarnika Ghat"],
    famousFoods: ["Banarasi Paan", "Kachori Jalebi", "Malaiyo (Winter Special)", "Tamatar Chaat", "Lassi in Kulhad"],
    bestSeason: "October to March",
    weatherAdvice: "Crowded narrow alleys. Walking and eco e-rickshaws are the fastest transport.",
    ecoTip: "Drink tea and lassi exclusively in biodegradable terracotta kulhads.",
    dailyBudgetEstimate: { stay: 900, food: 400, localTravel: 250 },
  },
  agra: {
    attractions: ["Taj Mahal", "Agra Fort", "Mehtab Bagh", "Fatehpur Sikri", "Itmad-ud-Daulah"],
    famousFoods: ["Agra Petha (Angoori & Kesar)", "Bedmi Puri", "Mughlai Biryani", "Jalebi"],
    bestSeason: "October to March",
    weatherAdvice: "Taj Mahal is closed on Fridays. Visit at sunrise for best light and low crowds.",
    ecoTip: "Use battery-operated golf carts and e-rickshaws in the Taj heritage buffer zone.",
    dailyBudgetEstimate: { stay: 1000, food: 500, localTravel: 350 },
  },
  coorg: {
    attractions: ["Abbey Falls", "Raja's Seat", "Dubare Elephant Camp", "Talakaveri", "Nagarhole National Park"],
    famousFoods: ["Pandi Curry (Pork/Mushroom)", "Akki Roti", "Bamboo Shoot Curry", "Coorg Filter Coffee"],
    bestSeason: "October to April",
    weatherAdvice: "Lush greenery with pleasant weather. Heavy rainfall during monsoon.",
    ecoTip: "Stay in organic coffee estate homestays for an authentic local experience.",
    dailyBudgetEstimate: { stay: 1400, food: 600, localTravel: 500 },
  },
  hampi: {
    attractions: ["Virupaksha Temple", "Vijaya Vittala Stone Chariot", "Matanga Hill Sunrise", "Coracle Ride at Tungabhadra", "Anjaneya Hill"],
    famousFoods: ["South Indian Unlimited Thali", "Banana Flower Curry", "Filter Coffee", "Crispy Masala Dosa"],
    bestSeason: "November to February",
    weatherAdvice: "Sunny and warm during day. Rent a bicycle or moped to explore ruins early morning.",
    ecoTip: "Do not climb or deface UNESCO monument stones; practice strict zero-waste travel.",
    dailyBudgetEstimate: { stay: 900, food: 450, localTravel: 300 },
  },
  gokarna: {
    attractions: ["Om Beach", "Kudle Beach", "Half Moon Beach Trek", "Mahabaleshwar Temple", "Paradise Beach"],
    famousFoods: ["Seafood Thali", "Nutella Banana Pancakes", "Kokum Juice", "Neer Dosa"],
    bestSeason: "October to March",
    weatherAdvice: "Warm coastal breeze. Pack light clothing and good trekking sandals.",
    ecoTip: "Pack all trash back with you during the Five Beach cliff trail trek.",
    dailyBudgetEstimate: { stay: 1000, food: 500, localTravel: 300 },
  },
  darjeeling: {
    attractions: ["Tiger Hill Sunrise", "Batasia Loop", "Himalayan Mountaineering Institute", "Happy Valley Tea Estate", "Peace Pagoda"],
    famousFoods: ["Steamed Momos", "Thukpa", "Darjeeling First Flush Tea", "Shaphalay", "Churpee"],
    bestSeason: "March to May & October to December",
    weatherAdvice: "Clear views of Mt. Kanchenjunga on crisp winter mornings. Carry thermals.",
    ecoTip: "Purchase single-estate Darjeeling tea with GI tag to support small local growers.",
    dailyBudgetEstimate: { stay: 1200, food: 550, localTravel: 400 },
  },
}

export function getDestinationIntelligence(destination: string, state?: string): DestinationInfo {
  const key = (destination || "").toLowerCase().trim()
  
  // Exact lookup
  if (DESTINATION_DATA[key]) {
    return DESTINATION_DATA[key]
  }

  // Partial match
  for (const [k, v] of Object.entries(DESTINATION_DATA)) {
    if (key.includes(k) || k.includes(key)) {
      return v
    }
  }

  // Intelligent dynamic fallback for any destination in India
  const isHilly =
    /mountain|trek|pass|hill|valley|peak|ghat|snow|himalaya|altitude/i.test(
      `${destination} ${state || ""}`,
    )
  const isBeach =
    /beach|coast|sea|ocean|island|port|lake|water/i.test(
      `${destination} ${state || ""}`,
    )

  return {
    attractions: [
      `Historic ${destination} Old Town & Heritage Walk`,
      `Scenic Viewpoint & Sunset Panorama`,
      `Local Artisans Craft Market`,
      `Nature Trail & Eco Forest Sanctuary`,
      `Central Cultural Square & Landmark`,
    ],
    famousFoods: [
      `Traditional Regional ${state || "Indian"} Thali`,
      `Locally Harvested Seasonal Delicacies`,
      `Fresh Street Food & Spiced Chaat`,
      `Artisanal Sweets & Specialty Tea`,
    ],
    bestSeason: isHilly
      ? "March to June & September to November"
      : isBeach
        ? "October to March"
        : "October to March",
    weatherAdvice: isHilly
      ? "Cool mountain breeze. Carry light-to-medium warm layers and sturdy shoes."
      : "Pleasant climate. Wear breathable fabrics and carry hydration essentials.",
    ecoTip: "Support local mom-and-pop eateries, carry a reusable water bottle, and follow Leave No Trace.",
    dailyBudgetEstimate: {
      stay: 1100,
      food: 500,
      localTravel: 350,
    },
  }
}
