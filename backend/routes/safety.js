import { Router } from "express"
import { listSos, createReport, createSos, cancelSos } from "../controllers/safetyController.js"

const router = Router()
router.get("/sos", listSos)
router.post("/sos", createSos)
router.post("/sos/:id/cancel", cancelSos)
router.post("/reports", createReport)
export default router
