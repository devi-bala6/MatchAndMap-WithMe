import { Connection, Message, Notification, Review, User } from "../models/index.js"
import { isDbConnected, localUsers, localMessages, localConnections, localReviews, localNotifications } from "../models/localStore.js"

export async function listBuddies(req, res) {
  try {
    const currentUserId = req.user._id?.toString() || req.user.id || "u1"
    let allUsers = []

    if (isDbConnected()) {
      allUsers = await User.find({ status: { $ne: "banned" } }).select("-passwordHash")
    } else {
      allUsers = Array.from(localUsers.values()).map((u) => {
        const copy = { ...u }
        delete copy.passwordHash
        return copy
      })
    }

    const currentUserId = (req.user._id || req.user.id || req.user.sub || "").toString()
    const currentUserEmail = (req.user.email || "").toLowerCase().trim()

    const currentUser =
      allUsers.find((u) => {
        const uId = (u._id || u.id || "").toString()
        const uEmail = (u.email || "").toLowerCase().trim()
        return (currentUserId && uId === currentUserId) || (currentUserEmail && uEmail === currentUserEmail)
      }) || req.user

    const otherUsers = allUsers.filter((u) => {
      const uId = (u._id || u.id || "").toString()
      const uEmail = (u.email || "").toLowerCase().trim()
      if (currentUserId && uId === currentUserId) return false
      if (currentUserEmail && uEmail === currentUserEmail) return false
      return u.role !== "admin"
    })

    const matches = otherUsers.map((user) => {
      const userInterests = Array.isArray(user.interests) ? user.interests : []
      const currInterests = Array.isArray(currentUser.interests) ? currentUser.interests : []
      const sharedInterests = userInterests.filter((i) =>
        currInterests.some((ci) => ci.toLowerCase() === i.toLowerCase())
      )

      const userHobbies = Array.isArray(user.hobbies) ? user.hobbies : []
      const currHobbies = Array.isArray(currentUser.hobbies) ? currentUser.hobbies : []
      const sharedHobbies = userHobbies.filter((h) =>
        currHobbies.some((ch) => ch.toLowerCase() === h.toLowerCase())
      )

      const userLanguages = Array.isArray(user.languages) ? user.languages : []
      const currLanguages = Array.isArray(currentUser.languages) ? currentUser.languages : []
      const sharedLanguages = userLanguages.filter((l) =>
        currLanguages.some((cl) => cl.toLowerCase() === l.toLowerCase())
      )

      let score = 30
      const matchReasons = []

      // 1. Travel Style (0-25 pts)
      const userStyle = (user.travelStyle || "").toLowerCase()
      const currStyle = (currentUser.travelStyle || "").toLowerCase()
      if (userStyle && currStyle) {
        if (userStyle === currStyle) {
          score += 24
          matchReasons.push(`Both prefer ${user.travelStyle} travel style`)
        } else if (
          (userStyle.includes("adventur") && currStyle.includes("nature")) ||
          (userStyle.includes("spirit") && currStyle.includes("cultur")) ||
          (userStyle.includes("relax") && currStyle.includes("beach"))
        ) {
          score += 16
          matchReasons.push(`Complementary ${user.travelStyle} & ${currentUser.travelStyle} styles`)
        } else {
          score += 8
        }
      } else {
        score += 12
      }

      // 2. Budget Alignment (0-20 pts)
      const userBudget = (user.budget || "").toLowerCase()
      const currBudget = (currentUser.budget || "").toLowerCase()
      if (userBudget && currBudget) {
        if (userBudget === currBudget) {
          score += 20
          matchReasons.push(`Matched ${user.budget} budget preference`)
        } else if (
          (userBudget === "mid-range" && (currBudget === "budget" || currBudget === "luxury")) ||
          (currBudget === "mid-range" && (userBudget === "budget" || userBudget === "luxury"))
        ) {
          score += 10
        } else {
          score += 4
        }
      } else {
        score += 10
      }

      // 3. Shared Interests & Hobbies (0-25 pts)
      const totalShared = sharedInterests.length + sharedHobbies.length
      if (totalShared > 0) {
        const interestPoints = Math.min(25, totalShared * 7)
        score += interestPoints
        if (sharedInterests.length > 0) {
          matchReasons.push(`Shared interests in ${sharedInterests.slice(0, 2).join(", ")}`)
        }
      } else {
        score += 6
      }

      // 4. Language Synergy (0-15 pts)
      if (sharedLanguages.length > 0) {
        score += Math.min(15, sharedLanguages.length * 6)
        matchReasons.push(`Fluent in ${sharedLanguages.join(", ")}`)
      } else {
        score += 4
      }

      // 5. Geographic Proximity / State match (0-15 pts)
      const userState = (user.state || "").trim().toLowerCase()
      const currState = (currentUser.state || "").trim().toLowerCase()
      if (userState && currState && userState === currState) {
        score += 12
        matchReasons.push(`Both based in ${user.state}`)
      } else if (user.city && currentUser.city && user.city.toLowerCase() === currentUser.city.toLowerCase()) {
        score += 15
        matchReasons.push(`Both in ${user.city}`)
      }

      // Pseudo-random deterministic entropy based on user ID pair to ensure organic variation
      const pairHash = ((user._id?.toString() || user.id || "a") + (currentUser._id?.toString() || currentUserId || "b"))
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const variance = (pairHash % 11) - 5 // -5 to +5 variance
      score += variance

      const compatibility = Math.min(98, Math.max(52, score))

      return {
        user: {
          id: user._id?.toString() || user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || "",
          age: user.age || 25,
          gender: user.gender || "Traveler",
          nationality: user.nationality || "Indian",
          state: user.state || "",
          city: user.city || "",
          bio: user.bio || "Exploring India and connecting with like-minded travelers.",
          interests: userInterests.length ? userInterests : ["Photography", "Nature", "Culture"],
          hobbies: userHobbies.length ? userHobbies : ["Exploring", "Music"],
          languages: userLanguages.length ? userLanguages : ["English", "Hindi"],
          budget: user.budget || "mid-range",
          travelStyle: user.travelStyle || "Adventure",
          tripsCount: user.tripsCount || 1,
          rating: user.rating || 4.8,
          reviewCount: user.reviewCount || 3,
          verified: Boolean(user.verified !== false),
          joinedDate: user.joinedDate || "2026",
          role: user.role || "user",
          ecoScore: user.ecoScore || 85,
          beneficiary: user.beneficiary || { name: "", relation: "", phone: "", email: "", address: "" },
          phone: user.phone || "",
        },
        compatibility,
        sharedInterests: sharedInterests.length ? sharedInterests : ["Culture", "Travel"],
        sharedHobbies: sharedHobbies.length ? sharedHobbies : ["Photography"],
        matchReasons: matchReasons.length ? matchReasons : ["Common regional interest in exploring Indian circuits"],
      }
    })

    matches.sort((a, b) => b.compatibility - a.compatibility)
    return res.json(matches)
  } catch (error) {
    console.error("listBuddies error:", error)
    return res.status(500).json({ message: error.message || "Failed to list buddies" })
  }
}

export async function listConnections(req, res) {
  try {
    const userId = (req.user._id || req.user.id || "u1").toString()
    if (isDbConnected()) {
      const dbConnections = await Connection.find({
        $or: [
          { from: req.user._id },
          { toUserId: userId },
          { toUserId: req.user._id.toString() },
        ],
      }).populate("from", "name avatar email state city")
      return res.json(dbConnections)
    }
    const filtered = (localConnections || []).filter(
      (c) => c.from === userId || c.toUserId === userId || c.from?._id === userId
    )
    const enriched = filtered.map((c) => {
      const fromId = typeof c.from === "object" ? c.from._id : c.from
      let fromUser = null
      for (const u of localUsers.values()) {
        if ((u._id?.toString() || u.id) === fromId) {
          fromUser = u
          break
        }
      }
      return {
        ...c,
        from: fromUser
          ? {
              _id: fromUser._id?.toString() || fromUser.id,
              name: fromUser.name,
              avatar: fromUser.avatar || "",
              email: fromUser.email,
              state: fromUser.state || "",
              city: fromUser.city || "",
            }
          : c.from,
      }
    })
    return res.json(enriched)
  } catch (error) {
    return res.json(localConnections || [])
  }
}

export async function createConnection(req, res) {
  try {
    const userId = (req.user._id || req.user.id || "u1").toString()
    const userName = req.user.name || "Traveler"
    const targetUserId = req.body.toUserId?.toString()
    if (!targetUserId || targetUserId === userId) {
      return res.status(400).json({ message: "Invalid target user for connection" })
    }

    if (isDbConnected()) {
      const connection = await Connection.findOneAndUpdate(
        { from: req.user._id, toUserId: targetUserId },
        { from: req.user._id, toUserId: targetUserId, status: "pending" },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      ).populate("from", "name avatar email")

      // Create instant notification for target user
      await Notification.create({
        recipient: targetUserId,
        type: "connection_request",
        title: "New Buddy Request",
        message: `${userName} sent you a travel companion connection request.`,
        data: {
          connectionId: connection._id,
          fromUserId: req.user._id,
          fromUserName: userName,
        },
      })

      return res.status(201).json(connection)
    }

    const existingIdx = localConnections.findIndex(
      (c) => (c.from === userId || c.from?._id === userId) && c.toUserId === targetUserId
    )
    if (existingIdx >= 0) {
      localConnections[existingIdx].status = "pending"
      return res.status(200).json(localConnections[existingIdx])
    }

    const newConnection = {
      _id: `conn_${Date.now()}`,
      id: `conn_${Date.now()}`,
      from: {
        _id: userId,
        name: userName,
        avatar: req.user.avatar || "",
        email: req.user.email || "",
      },
      toUserId: targetUserId,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    localConnections.push(newConnection)

    localNotifications.unshift({
      _id: `notif_${Date.now()}`,
      id: `notif_${Date.now()}`,
      recipient: targetUserId,
      type: "connection_request",
      title: "New Buddy Request",
      message: `${userName} sent you a travel companion connection request.`,
      createdAt: new Date().toISOString(),
    })

    return res.status(201).json(newConnection)
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create connection" })
  }
}

export async function updateConnection(req, res) {
  try {
    const userId = (req.user._id || req.user.id || "u1").toString()
    const userName = req.user.name || "Traveler"
    const connId = req.params.id
    const newStatus = req.body.status || "accepted"

    if (isDbConnected()) {
      const connection = await Connection.findOneAndUpdate(
        {
          $or: [
            { _id: connId },
            { from: connId, toUserId: userId },
            { from: req.user._id, toUserId: connId },
          ],
        },
        { status: newStatus },
        { returnDocument: "after", runValidators: true }
      ).populate("from", "name avatar email")

      if (!connection) return res.status(404).json({ message: "Connection not found" })

      // If accepted, notify the original requester
      if (newStatus === "accepted") {
        const senderId = connection.from?._id || connection.from
        if (senderId && senderId.toString() !== userId) {
          await Notification.create({
            recipient: senderId,
            type: "connection_accepted",
            title: "Connection Accepted! 🎉",
            message: `${userName} accepted your travel companion request. You can now chat!`,
            data: { connectionId: connection._id },
          })
        }
      }

      return res.json(connection)
    }

    const idx = localConnections.findIndex(
      (c) =>
        c._id === connId ||
        ((c.from === connId || c.from?._id === connId) && c.toUserId === userId) ||
        ((c.from === userId || c.from?._id === userId) && c.toUserId === connId)
    )
    if (idx >= 0) {
      localConnections[idx].status = newStatus
      return res.json(localConnections[idx])
    }
    return res.status(404).json({ message: "Connection not found" })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function listMessages(req, res) {
  try {
    if (isDbConnected()) {
      return res.json(await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 }))
    }
    const filtered = localMessages.filter((m) => m.roomId === req.params.roomId)
    return res.json(filtered)
  } catch (error) {
    const filtered = localMessages.filter((m) => m.roomId === req.params.roomId)
    return res.json(filtered)
  }
}

export async function createMessage(req, res) {
  try {
    const content = (req.body.content || "").trim()
    if (!content) return res.status(400).json({ message: "Message content cannot be empty" })

    const senderId = req.user._id?.toString() || req.user.id || "u1"
    const senderName = req.user.name || "Traveler"
    const senderAvatar = req.user.avatar || ""
    const timestamp = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    if (isDbConnected()) {
      const message = await Message.create({
        roomId: req.params.roomId,
        sender: req.user._id,
        senderName,
        senderAvatar,
        content,
      })
      return res.status(201).json(message)
    }

    const newMsg = {
      _id: `msg_${Date.now()}`,
      id: `msg_${Date.now()}`,
      roomId: req.params.roomId,
      sender: senderId,
      senderId,
      senderName,
      senderAvatar,
      content,
      timestamp,
      createdAt: new Date().toISOString(),
    }
    localMessages.push(newMsg)
    return res.status(201).json(newMsg)
  } catch (error) {
    console.error("createMessage error:", error)
    return res.status(500).json({ message: error.message || "Unable to save message" })
  }
}

export async function listReviews(req, res) {
  try {
    if (isDbConnected()) {
      const currentUserId = req.user?._id?.toString() || req.user?.id
      const filter = {}
      if (req.query.type === "given" && req.user?._id) {
        filter.fromUser = req.user._id
      } else if (req.query.type === "received" && currentUserId) {
        filter.$or = [{ toUserId: currentUserId }, { toUserId: req.user._id }]
      }
      return res.json(
        await Review.find(filter).populate("fromUser", "name avatar email").sort({ createdAt: -1 })
      )
    }
    return res.json(localReviews)
  } catch (error) {
    return res.json(localReviews)
  }
}

export async function createReview(req, res) {
  try {
    const targetUserId = req.body.toUserId?.toString() || ""
    const targetUserName = req.body.toUserName || "Travel Companion"
    const tripDestination = req.body.tripDestination || "Recent Trip"

    if (isDbConnected()) {
      const review = await Review.create({
        ...req.body,
        fromUser: req.user._id,
        toUserId: targetUserId,
        toUserName: targetUserName,
        tripDestination,
      })
      await review.populate("fromUser", "name avatar email")

      // If target user exists, update their rating average
      if (targetUserId) {
        const userReviews = await Review.find({ toUserId: targetUserId })
        if (userReviews.length > 0) {
          const avg = userReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / userReviews.length
          await User.findByIdAndUpdate(targetUserId, {
            rating: Number(avg.toFixed(1)),
            reviewCount: userReviews.length,
          })
        }

        // Notify reviewed user
        await Notification.create({
          recipient: targetUserId,
          type: "new_review",
          title: "New Review Received ⭐",
          message: `${req.user.name || "A traveler"} wrote you a ${req.body.rating || 5}-star review!`,
          data: { reviewId: review._id },
        })
      }

      return res.status(201).json(review)
    }

    const newReview = {
      _id: `rev_${Date.now()}`,
      id: `rev_${Date.now()}`,
      ...req.body,
      fromUser: req.user._id || req.user.id,
      fromUserName: req.user.name || "Traveler",
      fromUserAvatar: req.user.avatar || "",
      toUserId: targetUserId,
      toUserName: targetUserName,
      tripDestination,
      createdAt: new Date().toISOString(),
    }
    localReviews.unshift(newReview)
    return res.status(201).json(newReview)
  } catch (error) {
    console.error("createReview error:", error)
    return res.status(500).json({ message: error.message || "Failed to create review" })
  }
}

export async function listNotifications(req, res) {
  try {
    const currentUserId = req.user._id?.toString() || req.user.id
    if (isDbConnected()) {
      return res.json(
        await Notification.find({
          $or: [
            { recipient: req.user._id },
            { recipient: currentUserId },
          ],
        }).sort({ createdAt: -1 })
      )
    }
    const filtered = localNotifications.filter(
      (n) => n.recipient === currentUserId || n.recipient === req.user._id
    )
    return res.json(filtered)
  } catch (error) {
    return res.json(localNotifications)
  }
}

export async function markNotificationRead(req, res) {
  try {
    const currentUserId = req.user._id?.toString() || req.user.id
    if (isDbConnected()) {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          $or: [{ recipient: req.user._id }, { recipient: currentUserId }],
        },
        { readAt: new Date() },
        { returnDocument: "after" }
      )
      if (!notification) return res.status(404).json({ message: "Notification not found" })
      return res.json(notification)
    }
    const n = localNotifications.find(
      (item) => item._id === req.params.id || item.id === req.params.id
    )
    if (n) n.readAt = new Date().toISOString()
    return res.json(n || { ok: true })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
