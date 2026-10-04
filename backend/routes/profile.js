import { Router } from "express"
import { updateBeneficiary, updatePassword, updatePreferences, updateProfile, verifyAadhaar } from "../controllers/profileController.js"

const router = Router()
router.patch("/", updateProfile)
router.patch("/password", updatePassword)
router.patch("/beneficiary", updateBeneficiary)
router.patch("/preferences", updatePreferences)
router.post("/verify-aadhaar", verifyAadhaar)
export default router
