export const DESTINATION_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=700&fit=crop&auto=format"

const curatedPlaceImages = {
  // 1. Meghalaya (Living root bridge in Cherrapunji, Dawki crystal clear river)
  meghalaya:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Dawki_River%2C_Meghalaya%2C_India.jpg/1280px-Dawki_River%2C_Meghalaya%2C_India.jpg",
  shillong:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Dawki_River%2C_Meghalaya%2C_India.jpg/1280px-Dawki_River%2C_Meghalaya%2C_India.jpg",
  cherrapunji:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Dawki_River%2C_Meghalaya%2C_India.jpg/1280px-Dawki_River%2C_Meghalaya%2C_India.jpg",
  dawki:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Dawki_River%2C_Meghalaya%2C_India.jpg/1280px-Dawki_River%2C_Meghalaya%2C_India.jpg",
  mawlynnong:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Dawki_River%2C_Meghalaya%2C_India.jpg/1280px-Dawki_River%2C_Meghalaya%2C_India.jpg",

  // 2. Leh-Ladakh (Pangong Tso lake, high-altitude arid cold desert mountains)
  "leh-ladakh":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=700&fit=crop&auto=format",
  ladakh:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=700&fit=crop&auto=format",
  leh: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=700&fit=crop&auto=format",
  pangong:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=700&fit=crop&auto=format",
  "nubra valley":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=700&fit=crop&auto=format",

  // 3. Rajasthan Circuit (Sandstone palace/fort like Amer Fort, Mehrangarh, or Hawa Mahal)
  "rajasthan circuit":
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=700&fit=crop&auto=format",
  rajasthan:
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=700&fit=crop&auto=format",
  jaipur:
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=700&fit=crop&auto=format",
  jodhpur:
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=700&fit=crop&auto=format",
  jaisalmer:
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=700&fit=crop&auto=format",
  udaipur:
    "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=1200&h=700&fit=crop&auto=format",

  // 4. Jim Corbett + Rishikesh (Lakshman Jhula suspension bridge over Ganges & Ramganga river valley)
  "jim corbett + rishikesh":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Trayambakeshwar_Temple_VK.jpg/1280px-Trayambakeshwar_Temple_VK.jpg",
  "jim corbett":
    "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&h=700&fit=crop&auto=format",
  rishikesh:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Trayambakeshwar_Temple_VK.jpg/1280px-Trayambakeshwar_Temple_VK.jpg",
  haridwar:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Trayambakeshwar_Temple_VK.jpg/1280px-Trayambakeshwar_Temple_VK.jpg",

  // 5. Goa (Tropical sandy beach with palm trees and ocean shore)
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&h=700&fit=crop&auto=format",
  "north goa":
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&h=700&fit=crop&auto=format",
  "south goa":
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&h=700&fit=crop&auto=format",

  // 6. Valley of Flowers (Vibrant alpine meadow filled with wildflowers against misty Himalayan peaks)
  "valley of flowers":
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&h=700&fit=crop&auto=format",

  // 7. Kedarnath & Badrinath Dham (The historic stone Kedarnath Temple against snow-capped Himalayan peaks)
  "kedarnath & badrinath dham":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/1280px-Kedarnath_Temple_in_Rainy_season.jpg",
  kedarnath:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/1280px-Kedarnath_Temple_in_Rainy_season.jpg",
  badrinath:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/1280px-Kedarnath_Temple_in_Rainy_season.jpg",
  tungnath:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=700&fit=crop&auto=format",
  chopta:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=700&fit=crop&auto=format",

  // 8. Varanasi Ghats & Ayodhya (Stepped river ghats along the Ganges with wooden boats and evening Aarti)
  "varanasi ghats & ayodhya":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Dasaswamedh_ghat-varanasi_india-andres_larin.jpg/1280px-Dasaswamedh_ghat-varanasi_india-andres_larin.jpg",
  varanasi:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Dasaswamedh_ghat-varanasi_india-andres_larin.jpg/1280px-Dasaswamedh_ghat-varanasi_india-andres_larin.jpg",
  ayodhya:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Dasaswamedh_ghat-varanasi_india-andres_larin.jpg/1280px-Dasaswamedh_ghat-varanasi_india-andres_larin.jpg",
  kashi:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Dasaswamedh_ghat-varanasi_india-andres_larin.jpg/1280px-Dasaswamedh_ghat-varanasi_india-andres_larin.jpg",

  // 9. Golden Temple & Amritsar (The illuminated Harmandir Sahib reflecting on the sacred Amrit Sarovar)
  "golden temple & amritsar":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Hamandir_Sahib_%28Golden_Temple%29.jpg/1280px-Hamandir_Sahib_%28Golden_Temple%29.jpg",
  "golden temple":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Hamandir_Sahib_%28Golden_Temple%29.jpg/1280px-Hamandir_Sahib_%28Golden_Temple%29.jpg",
  amritsar:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Hamandir_Sahib_%28Golden_Temple%29.jpg/1280px-Hamandir_Sahib_%28Golden_Temple%29.jpg",

  // 10. Tirupati Balaji & Rameswaram (Towering South Indian Dravidian gopuram temple architecture)
  "tirupati balaji & rameswaram":
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=700&fit=crop&auto=format",
  tirupati:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=700&fit=crop&auto=format",
  rameswaram:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=700&fit=crop&auto=format",
  rameshwaram:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=700&fit=crop&auto=format",

  // 11. Vrindavan & Mathura Braj Yatra (Yamuna river ghats, Prem Mandir, or traditional Krishna temples)
  "vrindavan & mathura braj yatra":
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&h=700&fit=crop&auto=format",
  vrindavan:
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&h=700&fit=crop&auto=format",
  mathura:
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&h=700&fit=crop&auto=format",

  // 12. Kashmir Valley (Dal Lake shikaras or snow-dusted pine valley slopes in Gulmarg/Pahalgam)
  "kashmir valley":
    "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&h=700&fit=crop&auto=format",
  kashmir:
    "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&h=700&fit=crop&auto=format",
  srinagar:
    "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&h=700&fit=crop&auto=format",
  gulmarg:
    "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&h=700&fit=crop&auto=format",
  pahalgam:
    "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&h=700&fit=crop&auto=format",

  // 13. Pushkar & Ajmer (Pushkar holy lake ghats with white pavilions or desert camel landscape)
  "pushkar & ajmer":
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&h=700&fit=crop&auto=format",
  pushkar:
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&h=700&fit=crop&auto=format",
  ajmer:
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&h=700&fit=crop&auto=format",

  // 14. Hampi Heritage Circuit (Iconic stone chariot at Vijaya Vittala temple or giant boulder landscape)
  "hampi heritage circuit":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/1280px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg",
  hampi:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/1280px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg",

  // 15. Ranthambhore Wildlife Loop (Bengal tiger in dry deciduous forest inside Ranthambore reserve)
  "ranthambhore wildlife loop":
    "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&h=700&fit=crop&auto=format",
  ranthambhore:
    "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&h=700&fit=crop&auto=format",
  ranthambore:
    "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&h=700&fit=crop&auto=format",

  // 16. Kodaikanal Hills (Mist-covered Western Ghats hills, Pillar Rocks, or pine forests)
  "kodaikanal hills":
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=700&fit=crop&auto=format",
  kodaikanal:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=700&fit=crop&auto=format",

  // 17. Andaman Islands (Radhanagar Beach, turquoise coral water, and white sands)
  "andaman islands":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=700&fit=crop&auto=format",
  andaman:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=700&fit=crop&auto=format",
  havelock:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=700&fit=crop&auto=format",
  radhanagar:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=700&fit=crop&auto=format",

  // 18. Ujjain Mahakal Yatra (Mahakaleshwar temple complex or Ram Ghat along Shipra River)
  "ujjain mahakal yatra":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Mahakal_Temple_Ujjain.JPG/1280px-Mahakal_Temple_Ujjain.JPG",
  ujjain:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Mahakal_Temple_Ujjain.JPG/1280px-Mahakal_Temple_Ujjain.JPG",
  mahakaleshwar:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Mahakal_Temple_Ujjain.JPG/1280px-Mahakal_Temple_Ujjain.JPG",
  mahakal:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Mahakal_Temple_Ujjain.JPG/1280px-Mahakal_Temple_Ujjain.JPG",

  // 19. Visakhapatnam (Rishikonda beach where Eastern Ghats hills meet Bay of Bengal coastline)
  visakhapatnam:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Aerial_photograph_of_Yarada_beach%2C_Visakhapatnam.jpg/1280px-Aerial_photograph_of_Yarada_beach%2C_Visakhapatnam.jpg",
  vishakapatnam:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Aerial_photograph_of_Yarada_beach%2C_Visakhapatnam.jpg/1280px-Aerial_photograph_of_Yarada_beach%2C_Visakhapatnam.jpg",
  vizag:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Aerial_photograph_of_Yarada_beach%2C_Visakhapatnam.jpg/1280px-Aerial_photograph_of_Yarada_beach%2C_Visakhapatnam.jpg",
  rishikonda:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Aerial_photograph_of_Yarada_beach%2C_Visakhapatnam.jpg/1280px-Aerial_photograph_of_Yarada_beach%2C_Visakhapatnam.jpg",

  // Additional Popular Locations
  "spiti valley":
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=700&fit=crop&auto=format",
  spiti:
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=700&fit=crop&auto=format",
  "kerala backwaters":
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=700&fit=crop&auto=format",
  kerala:
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=700&fit=crop&auto=format",
  alleppey:
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=700&fit=crop&auto=format",
  munnar:
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&h=700&fit=crop&auto=format",
  manali:
    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&h=700&fit=crop&auto=format",
  gokarna:
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=700&fit=crop&auto=format",
  coorg:
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&h=700&fit=crop&auto=format",
  mysore:
    "https://images.unsplash.com/photo-1600100397608-f010f443b762?w=1200&h=700&fit=crop&auto=format",
  darjeeling:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=700&fit=crop&auto=format",
  "puri jagannath":
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=700&fit=crop&auto=format",
}

export function getPlaceName(destination) {
  if (!destination) return ""
  return destination.split(/[,&(]/)[0].trim()
}

export function getCuratedDestinationImage(destination) {
  if (!destination) return null
  const clean = destination.toLowerCase().trim()
  const placeName = getPlaceName(destination).toLowerCase().trim()

  // 1. Exact match on full destination or placeName
  if (curatedPlaceImages[clean]) return curatedPlaceImages[clean]
  if (curatedPlaceImages[placeName]) return curatedPlaceImages[placeName]

  // 2. Keyword substring search in dictionary
  for (const [key, url] of Object.entries(curatedPlaceImages)) {
    if (clean.includes(key) || key.includes(clean)) {
      return url
    }
  }

  return null
}

export function getDestinationImage(
  destination,
  state = "",
  fallback = DESTINATION_IMAGE_FALLBACK,
) {
  if (!destination) return fallback
  const curated = getCuratedDestinationImage(destination)
  if (curated) return curated
  if (fallback && fallback !== DESTINATION_IMAGE_FALLBACK) return fallback
  return DESTINATION_IMAGE_FALLBACK
}
