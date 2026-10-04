import crypto from 'node:crypto'

export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString().padStart(6, '0')
}

export function resolveOtpValue(useDemoOtp = false) {
  if (useDemoOtp) {
    return String(process.env.DEMO_RESET_OTP || '123456').trim().padStart(6, '0').slice(-6)
  }
  return generateOtp()
}

export function createOtpRecord(otp, expiresAt) {
  const normalizedOtp = String(otp).trim()
  return {
    otp: normalizedOtp,
    expiresAt,
    createdAt: Date.now(),
    hash: crypto.createHash('sha256').update(normalizedOtp).digest('hex'),
  }
}

export function isOtpValid(providedOtp, record) {
  if (!record || !record.otp) return false

  const expected = Buffer.from(String(record.otp).trim())
  const actual = Buffer.from(String(providedOtp).trim())

  if (expected.length !== actual.length) return false
  return crypto.timingSafeEqual(expected, actual)
}
