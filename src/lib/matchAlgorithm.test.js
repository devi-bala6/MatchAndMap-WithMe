import test from "node:test"
import assert from "node:assert/strict"
import {
  calculateCompatibility,
  getDynamicMatchProfiles,
} from "./matchAlgorithm.ts"

test("calculates high compatibility for users with matching interests and travel style", () => {
  const userA = {
    id: "user-a",
    name: "Rohit",
    email: "rohit@test.com",
    age: 26,
    gender: "Male",
    nationality: "Indian",
    state: "Maharashtra",
    city: "Mumbai",
    bio: "Loves high-altitude adventures and trekking.",
    interests: ["Trekking", "Photography", "Nature"],
    hobbies: ["Rock Climbing", "Journaling"],
    languages: ["English", "Hindi"],
    budget: "mid-range",
    travelStyle: "Adventure",
    tripsCount: 5,
    rating: 4.9,
    reviewCount: 4,
    verified: true,
    joinedDate: "2026",
    role: "user",
    beneficiary: { name: "", relation: "", phone: "", email: "", address: "" },
    phone: "",
    ecoScore: 90,
  }

  const userB = {
    id: "user-b",
    name: "Sneha",
    email: "sneha@test.com",
    age: 25,
    gender: "Female",
    nationality: "Indian",
    state: "Karnataka",
    city: "Bengaluru",
    bio: "Photographer and trek enthusiast.",
    interests: ["Trekking", "Photography", "Monasteries"],
    hobbies: ["Rock Climbing", "Cooking"],
    languages: ["English", "Hindi", "Kannada"],
    budget: "mid-range",
    travelStyle: "Adventure",
    tripsCount: 7,
    rating: 4.8,
    reviewCount: 6,
    verified: true,
    joinedDate: "2026",
    role: "user",
    beneficiary: { name: "", relation: "", phone: "", email: "", address: "" },
    phone: "",
    ecoScore: 92,
  }

  const result = calculateCompatibility(userA, userB)
  assert.ok(
    result.compatibility >= 85,
    `Expected compatibility >= 85, got ${result.compatibility}`,
  )
  assert.ok(result.sharedInterests.includes("Trekking"))
  assert.ok(result.sharedInterests.includes("Photography"))
  assert.ok(result.sharedHobbies.includes("Rock Climbing"))
})

test("filters out self and admin from dynamic match profiles", () => {
  const userA = {
    id: "u1",
    name: "User One",
    interests: ["Culture"],
    budget: "budget",
    travelStyle: "Cultural",
    role: "user",
  }
  const userB = {
    id: "u2",
    name: "User Two",
    interests: ["Culture"],
    budget: "budget",
    travelStyle: "Cultural",
    role: "user",
  }
  const admin = {
    id: "u0",
    name: "Admin",
    interests: [],
    role: "admin",
  }

  const profiles = getDynamicMatchProfiles(userA, [userA, userB, admin])
  assert.equal(profiles.length, 1)
  assert.equal(profiles[0].user.id, "u2")
})
