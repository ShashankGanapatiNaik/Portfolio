const mongoose = require('mongoose');

// ─── Project Model ───────────────────────────────────────────────────────────
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  githubLink: { type: String },
  liveDemo: { type: String },
  images: [{ type: String }],
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Skills Model ────────────────────────────────────────────────────────────
const skillSchema = new mongoose.Schema({
  category: { type: String, required: true },
  skills: [{ name: String, icon: String, level: { type: Number, min: 0, max: 100 } }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Resume Model ────────────────────────────────────────────────────────────
const resumeSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  data: { type: Buffer, required: true },
  contentType: { type: String, default: 'application/pdf' },
  uploadedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

// ─── Contact Model ───────────────────────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  replied: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Profile Model ───────────────────────────────────────────────────────────
const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  email: { type: String, required: true },
  linkedin: { type: String },
  github: { type: String },
  leetcode: { type: String },
  bio: { type: String },
  careerGoals: { type: String },
  education: [{
    degree: String,
    institution: String,
    period: String,
    grade: String,
    description: String,
  }],
  interests: [String],
  profileImage: { type: String },
}, { timestamps: true });

// ─── Admin Model ─────────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = {
  Project: mongoose.model('Project', projectSchema),
  Skill: mongoose.model('Skill', skillSchema),
  Resume: mongoose.model('Resume', resumeSchema),
  Contact: mongoose.model('Contact', contactSchema),
  Profile: mongoose.model('Profile', profileSchema),
  Admin: mongoose.model('Admin', adminSchema),
};
