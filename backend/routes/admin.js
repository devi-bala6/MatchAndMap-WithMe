import { Router } from "express"
import { listReports, listUsers, summary, updateReport, updateUserStatus, updateVerification } from "../controllers/adminController.js"

const router = Router()
router.get("/summary", summary)
router.get("/users", listUsers)
router.patch("/users/:id/status", updateUserStatus)
router.patch("/users/:id/verify", updateVerification)
router.get("/reports", listReports)
router.patch("/reports/:id", updateReport)
export default router
