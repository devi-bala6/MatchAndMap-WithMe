import { Router } from "express"
import { z } from "zod"
import {
  approveUser,
  createTrip,
  deleteTrip,
  getTrip,
  listJoinRequests,
  listTrips,
  rejectUser,
  requestToJoin,
  updateJoinRequest,
  updateTrip,
} from "../controllers/tripController.js"
import { requireAuth } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"

const router = Router()
const idSchema = z.object({
  body: z.record(z.any()).optional().default({}),
  params: z.object({ id: z.string().min(1) }),
  query: z.record(z.any()).optional().default({}),
})

router.get("/", listTrips)
router.post("/", requireAuth, createTrip)
router.get("/:id", validate(idSchema), getTrip)
router.patch("/:id", requireAuth, validate(idSchema), updateTrip)
router.put("/:id", requireAuth, validate(idSchema), updateTrip)
router.delete("/:id", requireAuth, validate(idSchema), deleteTrip)
router.post("/:id/join-requests", requireAuth, validate(idSchema), requestToJoin)
router.get("/:id/join-requests", requireAuth, validate(idSchema), listJoinRequests)
router.patch("/:id/join-requests/:requestId", requireAuth, updateJoinRequest)
router.put("/:id/join-requests/:requestId", requireAuth, updateJoinRequest)
router.put("/:id/approve-user/:userId", requireAuth, approveUser)
router.put("/:id/reject-user/:userId", requireAuth, rejectUser)

export default router
