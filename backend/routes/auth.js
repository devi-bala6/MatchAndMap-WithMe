import { Router } from "express"
import { z } from "zod"
import { login, me, register, requestPasswordReset, resetPassword, verifyPasswordResetOtp } from "../controllers/authController.js"
import { requireAuth } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"

const router = Router()
const credentials = z.object({ body: z.object({ name: z.string().min(1).optional(), email: z.string().email(), password: z.string().min(6, "Password must be at least 6 characters") }), params: z.object({}), query: z.object({}) })
const emailRequestSchema = z.object({ body: z.object({ email: z.string().email() }), params: z.object({}), query: z.object({}) })
const otpRequestSchema = z.object({ body: z.object({ email: z.string().email(), otp: z.string().min(6).max(6) }), params: z.object({}), query: z.object({}) })
const resetRequestSchema = z.object({ body: z.object({ email: z.string().email(), otp: z.string().min(6).max(6), password: z.string().min(6, "Password must be at least 6 characters") }), params: z.object({}), query: z.object({}) })

router.post("/register", validate(credentials), register)
router.post("/login", validate(credentials), login)
router.post("/forgot-password", validate(emailRequestSchema), requestPasswordReset)
router.post("/verify-otp", validate(otpRequestSchema), verifyPasswordResetOtp)
router.post("/reset-password", validate(resetRequestSchema), resetPassword)
router.get("/me", requireAuth, me)
export default router
