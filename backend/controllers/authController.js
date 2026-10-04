import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import { User } from "../models/index.js"
import { createOtpRecord, generateOtp, isOtpValid, normalizeEmail, resolveOtpValue } from "../src/passwordReset.js"

const otpStore = new Map()

function tokenFor(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

function publicUser(user) {
  const value = user.toObject ? user.toObject() : { ...user }
  delete value.passwordHash
  const id = (value._id || value.id || "").toString()
  return {
    ...value,
    id,
    _id: id,
  }
}

function getOtpEntry(email) {
  const normalizedEmail = normalizeEmail(email)
  const entry = otpStore.get(normalizedEmail)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    otpStore.delete(normalizedEmail)
    return null
  }
  return entry
}

async function sendResetOtpEmail(email, otp) {
  const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST
  const smtpPort = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587)
  const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_FROM || "no-reply@matchandmap.local"

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: "Match&Map with me password reset code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
          <h2 style="margin-bottom: 12px;">Password reset request</h2>
          <p style="margin-bottom: 20px;">Use the code below to verify your identity and reset your password.</p>
          <div style="display: inline-block; padding: 16px 22px; border-radius: 12px; background: #0f172a; color: #f8fafc; font-size: 28px; letter-spacing: 6px; font-weight: 700;">${otp}</div>
          <p style="margin-top: 20px; color: #475569;">This code expires in 10 minutes.</p>
        </div>
      `,
    })

    return {
      message: "A reset code has been sent to your email.",
    }
  }

  console.warn("SMTP not configured. Password reset OTP is being logged locally for development testing.")
  console.log(`[Password Reset] OTP for ${email}: ${otp}`)
  return {
    message: "SMTP is not configured, so the OTP was logged locally instead of being emailed. Add SMTP credentials to send real emails.",
    debugOtp: otp,
  }
}

import { isDbConnected, getLocalUserByEmail, saveLocalUser } from "../models/localStore.js"

export async function register(req, res) {
  try {
    const { name, email, password } = req.body
    const normalizedEmail = normalizeEmail(email)

    if (isDbConnected()) {
      const existing = await User.findOne({ email: normalizedEmail })
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" })
      }
      const passwordHash = await bcrypt.hash(password, 12)
      const user = await User.create({ name, email: normalizedEmail, passwordHash })
      return res.status(201).json({ token: tokenFor(user), user: publicUser(user) })
    }

    // Fallback store
    const existing = getLocalUserByEmail(normalizedEmail)
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = saveLocalUser({ name, email: normalizedEmail, passwordHash })
    return res.status(201).json({ token: tokenFor(user), user: publicUser(user) })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ message: error.message || "Unable to register account" })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const normalizedEmail = normalizeEmail(email)

    if (isDbConnected()) {
      const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash")
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: "Invalid email or password" })
      }
      if (user.status !== "active") return res.status(403).json({ message: "Account is not active" })
      return res.json({ token: tokenFor(user), user: publicUser(user) })
    }

    // Fallback store
    const user = getLocalUserByEmail(normalizedEmail)
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }
    // Allow demo passwords or bcrypt compare
    const isDemoMatch = (normalizedEmail === "aryan.mehta@email.com" && password === "password") ||
                        (normalizedEmail === "admin@matchandmap.in" && password === "AdminDemo123!")
    const isPasswordMatch = isDemoMatch || (user.passwordHash && (await bcrypt.compare(password, user.passwordHash).catch(() => false)))

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }
    if (user.status !== "active") return res.status(403).json({ message: "Account is not active" })
    return res.json({ token: tokenFor(user), user: publicUser(user) })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ message: error.message || "Unable to login" })
  }
}

export async function requestPasswordReset(req, res) {
  const email = normalizeEmail(req.body.email)
  const user = await User.findOne({ email })

  if (!user) {
    return res.status(200).json({ message: "If an account exists for this email, a reset code has been sent." })
  }

  const useDemoOtp = !(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  const otp = useDemoOtp ? resolveOtpValue(true) : generateOtp()
  const expiresAt = Date.now() + 10 * 60 * 1000
  const record = createOtpRecord(otp, expiresAt)
  otpStore.set(email, record)

  const result = await sendResetOtpEmail(email, otp)
  return res.status(200).json(result)
}

export async function verifyPasswordResetOtp(req, res) {
  const email = normalizeEmail(req.body.email)
  const record = getOtpEntry(email)

  if (!record) {
    return res.status(401).json({ message: "Reset code expired or invalid. Please request a new one." })
  }

  if (!isOtpValid(req.body.otp, record)) {
    return res.status(401).json({ message: "Invalid reset code. Please check the code and try again." })
  }

  otpStore.set(email, { ...record, verified: true })
  return res.status(200).json({ message: "Reset code verified successfully." })
}

export async function resetPassword(req, res) {
  const email = normalizeEmail(req.body.email)
  const { otp, password } = req.body
  const record = getOtpEntry(email)

  if (!record || !record.verified) {
    return res.status(401).json({ message: "Please verify your OTP before resetting the password." })
  }

  if (!isOtpValid(otp, record)) {
    return res.status(401).json({ message: "Invalid reset code." })
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(404).json({ message: "Account not found." })
  }

  user.passwordHash = await bcrypt.hash(password, 12)
  await user.save()
  otpStore.delete(email)

  return res.status(200).json({ message: "Password reset successfully. You can sign in with your new password." })
}

export function me(req, res) {
  res.json({ user: publicUser(req.user) })
}
