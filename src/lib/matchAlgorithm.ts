import type { MatchProfile, User } from "../types"

/**
 * Calculates a dynamic compatibility match score between 0 and 100
 * based on mutual interests, budget, travel style, languages, and hobbies.
 */
export function calculateCompatibility(currentUser: User, candidate: User): {
  compatibility: number
  sharedInterests: string[]
  sharedHobbies: string[]
  sharedLanguages: string[]
} {
  const currInterests = Array.isArray(currentUser.interests)
    ? currentUser.interests
    : []
  const candInterests = Array.isArray(candidate.interests)
    ? candidate.interests
    : []
  const sharedInterests = candInterests.filter((i) =>
    currInterests.some((ci) => ci.toLowerCase() === i.toLowerCase()),
  )

  const currHobbies = Array.isArray(currentUser.hobbies)
    ? currentUser.hobbies
    : []
  const candHobbies = Array.isArray(candidate.hobbies) ? candidate.hobbies : []
  const sharedHobbies = candHobbies.filter((h) =>
    currHobbies.some((ch) => ch.toLowerCase() === h.toLowerCase()),
  )

  const currLanguages = Array.isArray(currentUser.languages)
    ? currentUser.languages
    : []
  const candLanguages = Array.isArray(candidate.languages)
    ? candidate.languages
    : []
  const sharedLanguages = candLanguages.filter((l) =>
    currLanguages.some((cl) => cl.toLowerCase() === l.toLowerCase()),
  )

  let score = 50 // baseline

  // 1. Interests Overlap (up to 25 pts)
  if (currInterests.length > 0) {
    const interestRatio =
      sharedInterests.length / Math.max(1, Math.min(currInterests.length, 5))
    score += Math.min(25, Math.round(interestRatio * 25))
  } else {
    score += 15
  }

  // 2. Budget match (up to 12 pts)
  if (candidate.budget && currentUser.budget) {
    if (candidate.budget === currentUser.budget) {
      score += 12
    } else if (
      (candidate.budget === "mid-range" &&
        (currentUser.budget === "budget" || currentUser.budget === "luxury")) ||
      (currentUser.budget === "mid-range" &&
        (candidate.budget === "budget" || candidate.budget === "luxury"))
    ) {
      score += 6
    }
  } else {
    score += 8
  }

  // 3. Travel Style (up to 12 pts)
  if (candidate.travelStyle && currentUser.travelStyle) {
    if (
      candidate.travelStyle.toLowerCase() ===
      currentUser.travelStyle.toLowerCase()
    ) {
      score += 12
    } else {
      score += 5
    }
  } else {
    score += 8
  }

  // 4. Languages (up to 6 pts)
  if (sharedLanguages.length > 0) {
    score += Math.min(6, sharedLanguages.length * 3)
  }

  // 5. Hobbies (up to 5 pts)
  if (sharedHobbies.length > 0) {
    score += Math.min(5, sharedHobbies.length * 2)
  }

  const compatibility = Math.min(99, Math.max(55, score))

  return {
    compatibility,
    sharedInterests: sharedInterests.length
      ? sharedInterests
      : ["Culture", "Travel"],
    sharedHobbies: sharedHobbies.length ? sharedHobbies : ["Exploring"],
    sharedLanguages,
  }
}

/**
 * Computes dynamic match profiles for all available registered accounts.
 */
export function getDynamicMatchProfiles(
  currentUser: User,
  candidateUsers: User[],
): MatchProfile[] {
  const currentId = currentUser.id || "u1"

  return candidateUsers
    .filter((u) => u.id !== currentId && u.role !== "admin")
    .map((user) => {
      const matchDetails = calculateCompatibility(currentUser, user)
      return {
        user,
        compatibility: matchDetails.compatibility,
        sharedInterests: matchDetails.sharedInterests,
        sharedHobbies: matchDetails.sharedHobbies,
      }
    })
    .sort((a, b) => b.compatibility - a.compatibility)
}
