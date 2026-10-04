import mongoose from "mongoose"

const { Schema, model } = mongoose
const ref = { type: Schema.Types.ObjectId, ref: "User", required: true }

const beneficiarySchema = new Schema({
  name: String,
  relation: String,
  phone: String,
  email: String,
  address: String,
}, { _id: false })

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  age: Number,
  gender: String,
  nationality: String,
  state: String,
  city: String,
  bio: String,
  interests: [String],
  hobbies: [String],
  languages: [String],
  budget: { type: String, enum: ["budget", "mid-range", "luxury"] },
  travelStyle: String,
  phone: String,
  avatar: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["active", "suspended", "deleted"], default: "active" },
  verified: { type: Boolean, default: false },
  beneficiary: beneficiarySchema,
  preferences: { locationSharing: Boolean, emergencyAlerts: Boolean, shareWithBeneficiary: Boolean },
  ecoScore: { type: Number, default: 0 },
}, { timestamps: true })

const tripSchema = new Schema({
  owner: ref,
  title: String,
  destination: { type: String, required: true },
  state: String,
  image: String,
  startDate: Date,
  endDate: Date,
  duration: Number,
  budget: { type: String, enum: ["budget", "mid-range", "luxury"] },
  budgetAmount: Number,
  interests: [String],
  description: String,
  status: { type: String, enum: ["open", "full", "completed", "cancelled"], default: "open" },
  requestedUsers: [ref],
  approvedUsers: [ref],
  maxCompanions: { type: Number, default: 1 },
  ecoFriendly: Boolean,
  carbonKg: Number,
  transport: String,
  ecoPlaces: [String],
}, { timestamps: true })

const joinRequestSchema = new Schema({
  trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
  requester: ref,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true })
joinRequestSchema.index({ trip: 1, requester: 1 }, { unique: true })

const connectionSchema = new Schema({
  from: ref,
  toUserId: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected", "blocked"], default: "pending" },
}, { timestamps: true })
connectionSchema.index({ from: 1, toUserId: 1 }, { unique: true })

const messageSchema = new Schema({
  roomId: { type: String, required: true, index: true },
  sender: ref,
  senderName: String,
  senderAvatar: String,
  content: { type: String, required: true, trim: true, maxlength: 5000 },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true })

const reviewSchema = new Schema({
  fromUser: ref,
  toUserId: { type: String, required: true },
  toUserName: String,
  trip: { type: Schema.Types.ObjectId, ref: "Trip" },
  tripDestination: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  ecoRating: { type: Number, min: 1, max: 5, required: true },
  tags: [String],
  comment: { type: String, required: true, maxlength: 2000 },
}, { timestamps: true })

const itinerarySchema = new Schema({
  owner: ref,
  trip: { type: Schema.Types.ObjectId, ref: "Trip" },
  destination: String,
  state: String,
  startDate: Date,
  totalDays: Number,
  totalBudget: Number,
  days: [{ day: Number, date: Date, title: String, location: String, activities: [Schema.Types.Mixed], accommodation: String, transport: String, meals: [String], budget: Number, ecoTip: String }],
  ecoScore: Number,
}, { timestamps: true })

const notificationSchema = new Schema({
  recipient: ref,
  type: String,
  title: String,
  message: String,
  readAt: Date,
  data: Schema.Types.Mixed,
}, { timestamps: true })

const sosSchema = new Schema({
  user: ref,
  type: { type: String, required: true },
  status: { type: String, enum: ["active", "cancelled", "resolved"], default: "active" },
  latitude: Number,
  longitude: Number,
  note: String,
}, { timestamps: true })

const reportSchema = new Schema({
  reporter: ref,
  targetType: String,
  targetId: String,
  reason: String,
  status: { type: String, enum: ["open", "dismissed", "actioned"], default: "open" },
}, { timestamps: true })

export const User = model("User", userSchema)
export const Trip = model("Trip", tripSchema)
export const JoinRequest = model("JoinRequest", joinRequestSchema)
export const Connection = model("Connection", connectionSchema)
export const Message = model("Message", messageSchema)
export const Review = model("Review", reviewSchema)
export const Itinerary = model("Itinerary", itinerarySchema)
export const Notification = model("Notification", notificationSchema)
export const SosEvent = model("SosEvent", sosSchema)
export const Report = model("Report", reportSchema)
