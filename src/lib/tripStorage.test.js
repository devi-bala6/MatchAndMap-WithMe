import test from "node:test"

import assert from "node:assert/strict"

import { getNextTrip, sortTripsByDate } from "./tripStorage.js"

test("sorts trips so same-day and next-day trips stay visible first", () => {
  const today = new Date()

  const todayIso = today.toISOString().slice(0, 10)

  const tomorrowIso = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const olderIso = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const trips = [
    {
      id: "old",

      destination: "Old trip",

      startDate: olderIso,

      endDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),

      status: "open",

      budgetAmount: 12000,

      maxCompanions: 2,

      approvedUsers: [],

      requestedUsers: [],

      interests: [],

      ecoFriendly: false,

      carbonKg: 0,

      transport: "Train",

      state: "Himachal",

      image: "",

      userId: "u1",

      userName: "Test",

      userAvatar: "",

      duration: 2,

      budget: "mid-range",

      description: "Old trip",

      companions: 0,
    },

    {
      id: "today",

      destination: "Today trip",

      startDate: todayIso,

      endDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),

      status: "open",

      budgetAmount: 16000,

      maxCompanions: 2,

      approvedUsers: [],

      requestedUsers: [],

      interests: [],

      ecoFriendly: false,

      carbonKg: 0,

      transport: "Train",

      state: "Himachal",

      image: "",

      userId: "u1",

      userName: "Test",

      userAvatar: "",

      duration: 2,

      budget: "mid-range",

      description: "Today trip",

      companions: 0,
    },

    {
      id: "tomorrow",

      destination: "Tomorrow trip",

      startDate: tomorrowIso,

      endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),

      status: "open",

      budgetAmount: 17000,

      maxCompanions: 2,

      approvedUsers: [],

      requestedUsers: [],

      interests: [],

      ecoFriendly: false,

      carbonKg: 0,

      transport: "Train",

      state: "Himachal",

      image: "",

      userId: "u1",

      userName: "Test",

      userAvatar: "",

      duration: 2,

      budget: "mid-range",

      description: "Tomorrow trip",

      companions: 0,
    },
  ]

  const ordered = sortTripsByDate(trips)

  assert.equal(ordered[0].id, "old")

  assert.equal(ordered[1].id, "today")

  assert.equal(ordered[2].id, "tomorrow")

  assert.equal(getNextTrip(trips).id, "today")
})
