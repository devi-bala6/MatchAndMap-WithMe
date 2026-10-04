import { Router } from "express"
import { z } from "zod"
import { createConnection, createMessage, createReview, listBuddies, listConnections, listMessages, listNotifications, listReviews, markNotificationRead, updateConnection } from "../controllers/socialController.js"
import { validate } from "../middleware/validate.js"

const router = Router()
const bodySchema = z.object({ body: z.record(z.any()).optional().default({}), params: z.record(z.any()).optional().default({}), query: z.record(z.any()).optional().default({}) })
router.get("/buddies", listBuddies)
router.get("/connections", listConnections)
router.post("/connections", validate(bodySchema), createConnection)
router.patch("/connections/:id", validate(bodySchema), updateConnection)
router.put("/connections/:id", validate(bodySchema), updateConnection)
router.get("/chat/rooms/:roomId/messages", listMessages)
router.post("/chat/rooms/:roomId/messages", validate(bodySchema), createMessage)
router.get("/reviews", listReviews)
router.post("/reviews", validate(bodySchema), createReview)
router.get("/notifications", listNotifications)
router.patch("/notifications/:id/read", markNotificationRead)
export default router
