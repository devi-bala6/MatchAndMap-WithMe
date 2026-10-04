import test from 'node:test'
import assert from 'node:assert/strict'

import { generateOtp, normalizeEmail, createOtpRecord, resolveOtpValue } from './passwordReset.js'

test('generateOtp returns a 6-digit numeric code', () => {
  const otp = generateOtp()
  assert.equal(typeof otp, 'string')
  assert.match(otp, /^\d{6}$/)
})

test('normalizeEmail trims and lowercases email addresses', () => {
  assert.equal(normalizeEmail('  USER@Example.com  '), 'user@example.com')
})

test('resolveOtpValue returns the demo OTP when demo mode is enabled', () => {
  const original = process.env.DEMO_RESET_OTP
  process.env.DEMO_RESET_OTP = '123456'
  assert.equal(resolveOtpValue(true), '123456')
  if (original === undefined) delete process.env.DEMO_RESET_OTP
  else process.env.DEMO_RESET_OTP = original
})

test('createOtpRecord stores expiry and hashed otp', () => {
  const record = createOtpRecord('123456', Date.now() + 300000)
  assert.equal(record.otp, '123456')
  assert.ok(record.expiresAt > Date.now())
  assert.ok(record.hash)
  assert.notEqual(record.hash, '123456')
})
