import test from "node:test"
import assert from "node:assert/strict"
import {
  DESTINATION_IMAGE_FALLBACK,
  getCuratedDestinationImage,
  getDestinationImage,
} from "./destinationImage.js"

test("returns accurate curated images for real-world destinations", () => {
  const kedarnath = getCuratedDestinationImage("Kedarnath & Badrinath Dham")
  const varanasi = getCuratedDestinationImage("Varanasi Ghats & Ayodhya")
  const goldenTemple = getCuratedDestinationImage("Golden Temple & Amritsar")
  const hampi = getCuratedDestinationImage("Hampi Heritage Circuit")
  const vizag = getCuratedDestinationImage("Visakhapatnam")
  const meghalaya = getCuratedDestinationImage("Meghalaya")
  const ujjain = getCuratedDestinationImage("Ujjain Mahakal Yatra")

  assert.ok(kedarnath && kedarnath.includes("Kedarnath_Temple"))
  assert.ok(varanasi && varanasi.includes("Dasaswamedh_ghat"))
  assert.ok(goldenTemple && goldenTemple.includes("Hamandir_Sahib"))
  assert.ok(hampi && hampi.includes("Virupaksha_Temple"))
  assert.ok(vizag && vizag.includes("Visakhapatnam"))
  assert.ok(meghalaya && meghalaya.includes("Dawki_River"))
  assert.ok(ujjain && ujjain.includes("Mahakal_Temple_Ujjain"))
})

test("falls back to provided fallback or standard scenic image when unknown", () => {
  const fallbackUrl = "https://example.com/custom-fallback.jpg"
  assert.equal(
    getDestinationImage("Unknown Mystery Place", "", fallbackUrl),
    fallbackUrl,
  )
  assert.equal(
    getDestinationImage("Unknown Mystery Place"),
    DESTINATION_IMAGE_FALLBACK,
  )
})

test("uses distinct curated photos for different places without network lookup", () => {
  const spitiImage = getCuratedDestinationImage("Spiti Valley")
  const vizagImage = getCuratedDestinationImage("Visakhapatnam")
  const kedarnathImage = getCuratedDestinationImage("Kedarnath")

  assert.ok(spitiImage)
  assert.ok(vizagImage)
  assert.ok(kedarnathImage)
  assert.notEqual(spitiImage, vizagImage)
  assert.notEqual(vizagImage, kedarnathImage)
})
