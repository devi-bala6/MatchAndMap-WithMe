import nodemailer from "nodemailer"
import { Report, SosEvent, User } from "../models/index.js"
import { isDbConnected } from "../models/localStore.js"

async function dispatchEmergencyEmail({ userName, beneficiaryEmail, beneficiaryName, latitude, longitude, mapsUrl, note }) {
  const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST
  const smtpPort = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587)
  const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_FROM || "sos@matchandmap.in"

  if (smtpHost && smtpUser && smtpPass && beneficiaryEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })

      await transporter.sendMail({
        from: fromEmail,
        to: beneficiaryEmail,
        subject: `🚨 CRITICAL EMERGENCY SOS: ${userName} needs immediate assistance!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 20px; border: 2px solid #ef4444; border-radius: 12px; background: #fff;">
            <h1 style="color: #dc2626; margin-bottom: 8px;">🚨 EMERGENCY SOS ALERT</h1>
            <p style="font-size: 16px; margin-bottom: 16px;">Hello <strong>${beneficiaryName || "Emergency Contact"}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.5;"><strong>${userName}</strong> has triggered an active Emergency SOS alert via the Match & Map Safety Network.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #991b1b;">Live GPS Coordinates</h3>
              <p style="font-family: monospace; font-size: 16px; font-weight: bold; margin: 6px 0;">Latitude: ${latitude}°</p>
              <p style="font-family: monospace; font-size: 16px; font-weight: bold; margin: 6px 0;">Longitude: ${longitude}°</p>
              ${note ? `<p style="margin-top: 8px; font-size: 14px; color: #7f1d1d;"><strong>Note:</strong> ${note}</p>` : ""}
            </div>

            <p style="margin: 24px 0;">
              <a href="${mapsUrl}" target="_blank" style="display: inline-block; background: #dc2626; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                📍 Open Live Location on Google Maps
              </a>
            </p>
            <p style="font-size: 12px; color: #64748b;">Direct link: <a href="${mapsUrl}">${mapsUrl}</a></p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px;">Timestamp: ${new Date().toUTCString()}</p>
          </div>
        `,
      })
      console.log(`[Emergency SOS] Email dispatched successfully to ${beneficiaryEmail}`)
    } catch (e) {
      console.warn("[Emergency SOS] Failed to send emergency email:", e.message)
    }
  } else {
    console.log(`[Emergency SOS] Alert logged for ${userName}: Lat ${latitude}, Lng ${longitude} | Maps: ${mapsUrl}`)
  }
}

export async function listSos(req, res) {
  try {
    if (isDbConnected()) {
      const events = await SosEvent.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20)
      return res.json(events)
    }
    return res.json([])
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function createSos(req, res) {
  try {
    const lat = req.body.latitude || 32.2461
    const lng = req.body.longitude || 78.0349
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
    const userName = req.user.name || "Match & Map Traveler"
    const beneficiary = req.user.beneficiary || req.body.beneficiary

    let event
    if (isDbConnected()) {
      event = await SosEvent.create({ ...req.body, user: req.user._id, latitude: lat, longitude: lng, status: "active" })
    } else {
      event = { _id: `sos-${Date.now()}`, ...req.body, user: req.user._id, latitude: lat, longitude: lng, status: "active", createdAt: new Date() }
    }

    dispatchEmergencyEmail({
      userName,
      beneficiaryEmail: beneficiary?.email,
      beneficiaryName: beneficiary?.name,
      latitude: lat,
      longitude: lng,
      mapsUrl,
      note: req.body.note || req.body.trigger,
    })

    return res.status(201).json({ ...event.toObject ? event.toObject() : event, mapsUrl })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function cancelSos(req, res) {
  try {
    if (isDbConnected()) {
      const event = await SosEvent.findOneAndUpdate({ _id: req.params.id, user: req.user._id, status: "active" }, { status: "cancelled" }, { returnDocument: "after" })
      if (!event) return res.status(404).json({ message: "Active SOS not found" })
      return res.json(event)
    }
    return res.json({ _id: req.params.id, status: "cancelled" })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export async function createReport(req, res) {
  try {
    if (isDbConnected()) {
      const report = await Report.create({ ...req.body, reporter: req.user._id })
      return res.status(201).json(report)
    }
    return res.status(201).json({ _id: `rep-${Date.now()}`, ...req.body })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
