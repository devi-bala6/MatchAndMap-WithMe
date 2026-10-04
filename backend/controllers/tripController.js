import { JoinRequest, Notification, Trip, User } from "../models/index.js"
import { isDbConnected, localTrips, localNotifications } from "../models/localStore.js"

function formatTrip(tripDoc) {
  if (!tripDoc) return null
  const obj = typeof tripDoc.toObject === "function" ? tripDoc.toObject() : { ...tripDoc }
  const ownerObj = typeof obj.owner === "object" && obj.owner !== null ? obj.owner : null
  const ownerId = (ownerObj?._id || ownerObj?.id || obj.owner || "").toString()
  const ownerName = ownerObj?.name || obj.ownerName || obj.userName || "Traveler"
  const ownerAvatar = ownerObj?.avatar || obj.userAvatar || ""

  return {
    ...obj,
    _id: obj._id?.toString() || obj.id,
    id: obj._id?.toString() || obj.id,
    owner: ownerId,
    userId: ownerId,
    userName: ownerName,
    ownerName,
    userAvatar: ownerAvatar,
    requestedUsersDetails: (obj.requestedUsers || []).map((u) => {
      if (typeof u === "object" && u !== null) {
        return {
          id: (u._id || u.id || "").toString(),
          _id: (u._id || u.id || "").toString(),
          name: u.name || "Traveler",
          avatar: u.avatar || "",
          email: u.email || "",
          city: u.city || "",
          state: u.state || "",
        }
      }
      return { id: u.toString(), _id: u.toString(), name: "Traveler", avatar: "" }
    }),
    requestedUsers: (obj.requestedUsers || []).map((u) =>
      typeof u === "object" && u !== null ? (u._id || u.id || "").toString() : u.toString()
    ),
    approvedUsersDetails: (obj.approvedUsers || []).map((u) => {
      if (typeof u === "object" && u !== null) {
        return {
          id: (u._id || u.id || "").toString(),
          _id: (u._id || u.id || "").toString(),
          name: u.name || "Traveler",
          avatar: u.avatar || "",
          email: u.email || "",
          city: u.city || "",
          state: u.state || "",
        }
      }
      return { id: u.toString(), _id: u.toString(), name: "Traveler", avatar: "" }
    }),
    approvedUsers: (obj.approvedUsers || []).map((u) =>
      typeof u === "object" && u !== null ? (u._id || u.id || "").toString() : u.toString()
    ),
  }
}

export async function listTrips(req, res) {
  try {
    if (isDbConnected()) {
      const filter = {}
      if (req.query.status) filter.status = req.query.status
      if (req.query.search) {
        filter.$or = [
          { destination: new RegExp(req.query.search, "i") },
          { state: new RegExp(req.query.search, "i") },
          { description: new RegExp(req.query.search, "i") },
        ]
      }
      const rawTrips = await Trip.find(filter)
        .populate("owner", "name avatar email")
        .populate("requestedUsers", "name avatar email city state")
        .populate("approvedUsers", "name avatar email city state")
        .sort({ createdAt: -1 })
      return res.json(rawTrips.map(formatTrip))
    }
    return res.json(localTrips.map(formatTrip))
  } catch (error) {
    console.error("listTrips error:", error)
    return res.json(localTrips.map(formatTrip))
  }
}

export async function getTrip(req, res) {
  try {
    if (isDbConnected()) {
      const trip = await Trip.findById(req.params.id)
        .populate("owner", "name avatar email")
        .populate("requestedUsers", "name avatar email city state")
        .populate("approvedUsers", "name avatar email city state")
      if (!trip) return res.status(404).json({ message: "Trip not found" })
      return res.json(formatTrip(trip))
    }
    const trip = localTrips.find((t) => t._id === req.params.id || t.id === req.params.id)
    if (!trip) return res.status(404).json({ message: "Trip not found" })
    return res.json(formatTrip(trip))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function createTrip(req, res) {
  try {
    const ownerId = req.user._id?.toString() || req.user.id || "u1"
    if (isDbConnected()) {
      const trip = await Trip.create({
        ...req.body,
        owner: req.user._id,
        status: req.body.status || "open",
        requestedUsers: [],
        approvedUsers: [],
      })
      await trip.populate("owner", "name avatar email")
      return res.status(201).json(formatTrip(trip))
    }

    const newTrip = {
      _id: `t_${Date.now()}`,
      id: `t_${Date.now()}`,
      ...req.body,
      owner: ownerId,
      userId: ownerId,
      ownerName: req.user.name || "Traveler",
      userName: req.user.name || "Traveler",
      userAvatar: req.user.avatar || "",
      status: "open",
      requestedUsers: [],
      approvedUsers: [],
      createdAt: new Date().toISOString(),
    }
    localTrips.unshift(newTrip)
    return res.status(201).json(formatTrip(newTrip))
  } catch (error) {
    console.error("createTrip error:", error)
    return res.status(500).json({ message: error.message || "Failed to create trip" })
  }
}

export async function updateTrip(req, res) {
  try {
    if (isDbConnected()) {
      const trip = await Trip.findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        req.body,
        { returnDocument: "after", runValidators: true }
      )
        .populate("owner", "name avatar email")
        .populate("requestedUsers", "name avatar email city state")
        .populate("approvedUsers", "name avatar email city state")
      if (!trip) return res.status(404).json({ message: "Trip not found or not owned by you" })
      return res.json(formatTrip(trip))
    }
    const idx = localTrips.findIndex((t) => t._id === req.params.id || t.id === req.params.id)
    if (idx >= 0) {
      localTrips[idx] = { ...localTrips[idx], ...req.body }
      return res.json(formatTrip(localTrips[idx]))
    }
    return res.status(404).json({ message: "Trip not found" })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function deleteTrip(req, res) {
  try {
    if (isDbConnected()) {
      const trip = await Trip.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
      if (!trip) return res.status(404).json({ message: "Trip not found or not owned by you" })
      return res.status(204).end()
    }
    const idx = localTrips.findIndex((t) => t._id === req.params.id || t.id === req.params.id)
    if (idx >= 0) {
      localTrips.splice(idx, 1)
      return res.status(204).end()
    }
    return res.status(404).json({ message: "Trip not found" })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function requestToJoin(req, res) {
  try {
    const userId = req.user._id?.toString() || req.user.id || "u1"
    const userName = req.user.name || "Traveler"

    if (isDbConnected()) {
      const trip = await Trip.findById(req.params.id)
      if (!trip) return res.status(404).json({ message: "Trip not found" })

      const request = await JoinRequest.findOneAndUpdate(
        { trip: trip._id, requester: req.user._id },
        { trip: trip._id, requester: req.user._id, status: "pending" },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      )

      await Trip.findByIdAndUpdate(trip._id, { $addToSet: { requestedUsers: req.user._id } })

      // Create notification for the trip host
      const hostId = trip.owner.toString()
      if (hostId !== userId) {
        await Notification.create({
          recipient: trip.owner,
          type: "trip_join_request",
          title: "Trip Join Request",
          message: `${userName} requested to join your trip to ${trip.destination}.`,
          data: {
            tripId: trip._id,
            requesterId: req.user._id,
            requesterName: userName,
          },
        })
      }

      return res.status(201).json(request)
    }

    const trip = localTrips.find((t) => t._id === req.params.id || t.id === req.params.id)
    if (!trip) return res.status(404).json({ message: "Trip not found" })
    trip.requestedUsers = trip.requestedUsers || []
    if (!trip.requestedUsers.includes(userId)) trip.requestedUsers.push(userId)

    localNotifications.unshift({
      _id: `notif_${Date.now()}`,
      id: `notif_${Date.now()}`,
      recipient: trip.owner,
      type: "trip_join_request",
      title: "Trip Join Request",
      message: `${userName} requested to join your trip to ${trip.destination}.`,
      createdAt: new Date().toISOString(),
    })

    return res.status(201).json({ status: "pending", trip: req.params.id, requester: userId })
  } catch (error) {
    console.error("requestToJoin error:", error)
    return res.status(500).json({ message: error.message })
  }
}

export async function approveUser(req, res) {
  try {
    const tripId = req.params.id
    const targetUserId = req.params.userId
    const hostName = req.user.name || "Trip Host"

    if (isDbConnected()) {
      const trip = await Trip.findOne({ _id: tripId, owner: req.user._id })
      if (!trip) return res.status(404).json({ message: "Trip not found or not owned by you" })

      await Trip.findByIdAndUpdate(tripId, {
        $addToSet: { approvedUsers: targetUserId },
        $pull: { requestedUsers: targetUserId },
      })
      await JoinRequest.findOneAndUpdate(
        { trip: tripId, requester: targetUserId },
        { status: "approved" }
      )

      await Notification.create({
        recipient: targetUserId,
        type: "trip_join_approved",
        title: "Trip Request Approved 🎉",
        message: `Your request to join the trip to ${trip.destination} was approved by ${hostName}!`,
        data: { tripId: trip._id },
      })

      const updated = await Trip.findById(tripId)
        .populate("owner", "name avatar email")
        .populate("requestedUsers", "name avatar email city state")
        .populate("approvedUsers", "name avatar email city state")
      return res.json(formatTrip(updated))
    }

    const trip = localTrips.find((t) => t._id === tripId || t.id === tripId)
    if (!trip) return res.status(404).json({ message: "Trip not found" })
    trip.requestedUsers = (trip.requestedUsers || []).filter((id) => id !== targetUserId)
    trip.approvedUsers = [...(trip.approvedUsers || []), targetUserId]
    return res.json(formatTrip(trip))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function rejectUser(req, res) {
  try {
    const tripId = req.params.id
    const targetUserId = req.params.userId

    if (isDbConnected()) {
      const trip = await Trip.findOne({ _id: tripId, owner: req.user._id })
      if (!trip) return res.status(404).json({ message: "Trip not found or not owned by you" })

      await Trip.findByIdAndUpdate(tripId, {
        $pull: { requestedUsers: targetUserId },
      })
      await JoinRequest.findOneAndUpdate(
        { trip: tripId, requester: targetUserId },
        { status: "rejected" }
      )

      const updated = await Trip.findById(tripId)
        .populate("owner", "name avatar email")
        .populate("requestedUsers", "name avatar email city state")
        .populate("approvedUsers", "name avatar email city state")
      return res.json(formatTrip(updated))
    }

    const trip = localTrips.find((t) => t._id === tripId || t.id === tripId)
    if (!trip) return res.status(404).json({ message: "Trip not found" })
    trip.requestedUsers = (trip.requestedUsers || []).filter((id) => id !== targetUserId)
    return res.json(formatTrip(trip))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function listJoinRequests(req, res) {
  try {
    if (isDbConnected()) {
      const trip = await Trip.findOne({ _id: req.params.id, owner: req.user._id })
      if (!trip) return res.status(404).json({ message: "Trip not found" })
      return res.json(await JoinRequest.find({ trip: trip._id }).populate("requester", "name avatar email city state"))
    }
    return res.json([])
  } catch (error) {
    return res.json([])
  }
}

export async function updateJoinRequest(req, res) {
  try {
    const status = req.body.status || "approved"
    if (isDbConnected()) {
      const request = await JoinRequest.findById(req.params.requestId).populate("trip")
      if (!request || request.trip.owner.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: "Join request not found" })
      }
      request.status = status
      await request.save()

      if (status === "approved") {
        await Trip.findByIdAndUpdate(request.trip._id, {
          $addToSet: { approvedUsers: request.requester },
          $pull: { requestedUsers: request.requester },
        })

        await Notification.create({
          recipient: request.requester,
          type: "trip_join_approved",
          title: "Trip Request Approved 🎉",
          message: `Your request to join the trip to ${request.trip.destination} has been approved by ${req.user.name}!`,
          data: { tripId: request.trip._id },
        })
      } else if (status === "rejected") {
        await Trip.findByIdAndUpdate(request.trip._id, {
          $pull: { requestedUsers: request.requester },
        })
      }
      return res.json(request)
    }
    return res.json({ ok: true, status })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
