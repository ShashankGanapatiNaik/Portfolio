const mongoose = require("mongoose");

// ─── Project Model ───────────────────────────────────────────────────────────
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    techStack: [{ type: String }],
    githubLink: { type: String },
    liveDemo: { type: String },
    images: [{ type: String }],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ─── Skills Model ────────────────────────────────────────────────────────────
const skillSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    skills: [
      { name: String, icon: String, level: { type: Number, min: 0, max: 100 } },
    ],
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ─── Resume Model ────────────────────────────────────────────────────────────
const resumeSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  data: { type: Buffer, required: true },
  contentType: { type: String, default: "application/pdf" },
  uploadedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

// ─── Contact Model ───────────────────────────────────────────────────────────
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    replied: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ─── Profile Model ───────────────────────────────────────────────────────────
const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    email: { type: String, required: true },
    linkedin: { type: String },
    github: { type: String },
    leetcode: { type: String },
    bio: { type: String },
    careerGoals: { type: String },
    education: [
      {
        degree: String,
        institution: String,
        period: String,
        grade: String,
        description: String,
      },
    ],
    interests: [String],
    profileImage: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true },
);

// ─── Admin Model ─────────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

// ─── Resume Request Model ─────────────────────────────────────────────────────
// Persists approval tokens in DB so they survive server restarts
const resumeRequestSchema = new mongoose.Schema({
  token:       { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  reason:      { type: String, default: "Not specified" },
  approved:    { type: Boolean, default: false },
  expiresAt:   { type: Date, required: true },
  requestedAt: { type: Date, default: Date.now },
});
// Auto-delete expired documents from MongoDB
resumeRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = {
  Project:       mongoose.model("Project", projectSchema),
  Skill:         mongoose.model("Skill", skillSchema),
  Resume:        mongoose.model("Resume", resumeSchema),
  Contact:       mongoose.model("Contact", contactSchema),
  Profile:       mongoose.model("Profile", profileSchema),
  Admin:         mongoose.model("Admin", adminSchema),
  ResumeRequest: mongoose.model("ResumeRequest", resumeRequestSchema),
};
