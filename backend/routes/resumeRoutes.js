const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Resume } = require("../models");
const auth = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// In-memory store for pending requests { token: { name, email, requestedAt, approved } }
const pendingRequests = new Map();

// Gmail transporter — explicit SMTP settings for production compatibility
const getTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  return transporter;
};

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// Verify Gmail on startup
const verifyGmail = async () => {
  try {
    const t = getTransporter();
    await t.verify();
    console.log("✅ Gmail SMTP connected successfully");
  } catch (err) {
    console.error("❌ Gmail SMTP failed:", err.message);
    console.error("   GMAIL_USER:", process.env.GMAIL_USER);
    console.error("   HAS_PASSWORD:", !!process.env.GMAIL_APP_PASSWORD);
    console.error("   PASSWORD_LEN:", process.env.GMAIL_APP_PASSWORD?.length);
  }
};
verifyGmail();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ── POST /api/resume/request ─────────────────────────────────────────────────
// User requests resume — sends approval email to Shashank
router.post("/request", async (req, res) => {
  try {
    const { name, email, reason } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "Name and email are required" });

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    pendingRequests.set(token, {
      name,
      email,
      reason: reason || "Not specified",
      requestedAt: new Date().toISOString(),
      approved: false,
      expiresAt,
    });

    // Send approval email to Shashank
    const approveUrl = `${BACKEND_URL}/api/resume/approve/${token}`;
    const rejectUrl = `${BACKEND_URL}/api/resume/reject/${token}`;

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Portfolio Bot" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `📄 Resume Download Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a192f; color: #ccd6f6; padding: 32px; border-radius: 12px;">
          <h2 style="color: #64ffda; margin-bottom: 4px;">Resume Download Request</h2>
          <p style="color: #8892b0; margin-top: 0;">Someone wants to download your resume</p>
          <hr style="border-color: #233554; margin: 24px 0;" />
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8892b0; font-size: 14px;">👤 Name</td><td style="padding: 8px 0; color: #ccd6f6; font-weight: bold;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #8892b0; font-size: 14px;">📧 Email</td><td style="padding: 8px 0; color: #64ffda;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #8892b0; font-size: 14px;">💼 Reason</td><td style="padding: 8px 0; color: #ccd6f6;">${reason || "Not specified"}</td></tr>
            <tr><td style="padding: 8px 0; color: #8892b0; font-size: 14px;">🕐 Time</td><td style="padding: 8px 0; color: #ccd6f6;">${new Date().toLocaleString()}</td></tr>
          </table>
          <hr style="border-color: #233554; margin: 24px 0;" />
          <p style="color: #8892b0; font-size: 14px;">Do you want to allow this person to download your resume?</p>
          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <a href="${approveUrl}" style="display: inline-block; padding: 12px 32px; background: #64ffda; color: #0a192f; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
              ✅ Approve Download
            </a>
            <a href="${rejectUrl}" style="display: inline-block; padding: 12px 32px; background: transparent; color: #ff6b6b; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; border: 1px solid #ff6b6b;">
              ❌ Reject
            </a>
          </div>
          <p style="color: #8892b0; font-size: 12px; margin-top: 24px;">This link expires in 24 hours.</p>
        </div>
      `,
    });

    res.json({
      message: "Request sent! You will be notified once approved.",
      token,
    });
  } catch (err) {
    console.error("Resume request error FULL:", {
      message: err.message,
      code: err.code,
      response: err.response,
      GMAIL_USER: process.env.GMAIL_USER,
      HAS_PASSWORD: !!process.env.GMAIL_APP_PASSWORD,
      PASSWORD_LENGTH: process.env.GMAIL_APP_PASSWORD?.length,
    });
    res.status(500).json({
      error: "Failed to send request. Please try emailing directly.",
      detail: err.message,
      code: err.code,
    });
  }
});

// ── GET /api/resume/approve/:token ───────────────────────────────────────────
// Shashank clicks Approve in his email
router.get("/approve/:token", async (req, res) => {
  const request = pendingRequests.get(req.params.token);

  if (!request)
    return res.send(
      htmlPage(
        "❌ Invalid or Expired",
        "This approval link is invalid or has already been used.",
        "#ff6b6b",
      ),
    );
  if (Date.now() > request.expiresAt) {
    pendingRequests.delete(req.params.token);
    return res.send(
      htmlPage(
        "⏰ Link Expired",
        "This approval link has expired (24h limit).",
        "#ffa116",
      ),
    );
  }

  request.approved = true;

  // Send download link email to the requester
  try {
    const downloadUrl = `${FRONTEND_URL}/resume/download/${req.params.token}`;
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Shashank Ganapati Naik" <${process.env.GMAIL_USER}>`,
      to: request.email,
      subject: `✅ Your Resume Download is Approved — Shashank Naik`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a192f; color: #ccd6f6; padding: 32px; border-radius: 12px;">
          <h2 style="color: #64ffda;">Resume Access Approved! 🎉</h2>
          <p style="color: #8892b0;">Hi ${request.name},</p>
          <p style="color: #ccd6f6;">Shashank has approved your request to download his resume. Click the button below to download it now.</p>
          <div style="margin: 28px 0;">
            <a href="${downloadUrl}" style="display: inline-block; padding: 14px 36px; background: #64ffda; color: #0a192f; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              📄 Download Resume
            </a>
          </div>
          <p style="color: #8892b0; font-size: 13px;">This link expires in 24 hours.</p>
          <hr style="border-color: #233554; margin: 24px 0;" />
          <p style="color: #8892b0; font-size: 13px;">Feel free to reach out: <a href="mailto:shashankng626@gmail.com" style="color: #64ffda;">shashankng626@gmail.com</a></p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send approval email:", err.message);
  }

  res.send(
    htmlPage(
      "✅ Approved!",
      `Resume access granted to <strong>${request.name}</strong> (${request.email}). A download link has been sent to their email.`,
      "#64ffda",
    ),
  );
});

// ── GET /api/resume/reject/:token ────────────────────────────────────────────
router.get("/reject/:token", async (req, res) => {
  const request = pendingRequests.get(req.params.token);
  if (!request)
    return res.send(
      htmlPage(
        "Already handled",
        "This request was already processed.",
        "#8892b0",
      ),
    );
  pendingRequests.delete(req.params.token);
  res.send(
    htmlPage(
      "❌ Rejected",
      `Resume request from ${request.name} has been rejected.`,
      "#ff6b6b",
    ),
  );
});

// ── GET /api/resume/status/:token ────────────────────────────────────────────
// Frontend polls this to check if approved
router.get("/status/:token", (req, res) => {
  const request = pendingRequests.get(req.params.token);
  if (!request) return res.json({ status: "expired" });
  if (Date.now() > request.expiresAt) return res.json({ status: "expired" });
  if (request.approved) return res.json({ status: "approved" });
  return res.json({ status: "pending" });
});

// ── GET /api/resume/download/:token ─────────────────────────────────────────
// Actual file download — only works if approved
router.get("/download/:token", async (req, res) => {
  const request = pendingRequests.get(req.params.token);
  if (!request || !request.approved || Date.now() > request.expiresAt) {
    return res.status(403).send("Access denied or link expired.");
  }

  try {
    const resume = await Resume.findOne({ active: true }).sort({
      uploadedAt: -1,
    });
    if (!resume) return res.status(404).send("Resume not found.");

    // Clean up after download
    pendingRequests.delete(req.params.token);

    res.set("Content-Type", resume.contentType);
    res.set(
      "Content-Disposition",
      `attachment; filename="${resume.originalName}"`,
    );
    res.send(resume.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/resume (admin direct download) ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const resume = await Resume.findOne({ active: true }).sort({
      uploadedAt: -1,
    });
    if (!resume) return res.status(404).json({ error: "No resume found" });
    res.set("Content-Type", resume.contentType);
    res.set(
      "Content-Disposition",
      `attachment; filename="${resume.originalName}"`,
    );
    res.send(resume.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/resume (admin upload) ─────────────────────────────────────────
router.post("/", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    await Resume.updateMany({}, { active: false });
    const resume = await Resume.create({
      filename: req.file.fieldname,
      originalName: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      active: true,
    });
    res
      .status(201)
      .json({ message: "Resume uploaded successfully", id: resume._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: simple HTML response page
function htmlPage(title, message, color) {
  return `<!DOCTYPE html>
<html><head><title>${title}</title>
<style>body{font-family:Arial,sans-serif;background:#0a192f;color:#ccd6f6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.box{text-align:center;padding:48px;background:#112240;border-radius:12px;border:1px solid #233554;max-width:480px;}
h1{color:${color};font-size:2rem;margin-bottom:16px;}
p{color:#8892b0;line-height:1.6;}
a{color:#64ffda;}</style></head>
<body><div class="box"><h1>${title}</h1><p>${message}</p>
<br/><a href="${FRONTEND_URL}">← Back to Portfolio</a></div></body></html>`;
}

module.exports = router;
