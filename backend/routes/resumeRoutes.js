const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const crypto = require("crypto");
const { Resume, ResumeRequest } = require("../models");
const auth = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ── Email sender — tries multiple methods ─────────────────────────────────────
let gmailTransporter = null;

const sendEmail = async ({ to, subject, html }) => {
  const errors = [];
  const provider = (process.env.EMAIL_PROVIDER || "auto").toLowerCase();

  const tryResend = async () => {
    if (!process.env.RESEND_API_KEY) return false;

    // Safety Sandbox Check:
    // If we don't have a verified custom domain, we are in sandbox/testing mode.
    // In sandbox mode, Resend ONLY allows sending to the registered account email.
    // If we try sending to a different recipient, it will fail immediately with 403 validation error.
    const isSandbox = !process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL.includes("onboarding@resend.dev");
    const allowedSandboxRecipient = process.env.GMAIL_USER || process.env.ADMIN_EMAIL;
    if (isSandbox && allowedSandboxRecipient && to.toLowerCase() !== allowedSandboxRecipient.toLowerCase()) {
      const skipMsg = `Recipient ${to} not allowed in Resend sandbox mode (can only send to ${allowedSandboxRecipient}). Skipping Resend.`;
      console.log(`ℹ️ ${skipMsg}`);
      errors.push("Resend: " + skipMsg);
      return false;
    }

    try {
      const fromAddress = process.env.RESEND_FROM_EMAIL
        ? `Shashank Portfolio <${process.env.RESEND_FROM_EMAIL}>`
        : "Shashank Portfolio <onboarding@resend.dev>";

      const res = await axios.post(
        "https://api.resend.com/emails",
        { from: fromAddress, to: [to], subject, html },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );
      console.log("✅ Email sent via Resend. ID:", res.data?.id);
      return true;
    } catch (err) {
      const msg = JSON.stringify(err.response?.data || err.message);
      console.error("❌ Resend failed:", msg);
      errors.push("Resend: " + msg);
      return false;
    }
  };

  const tryGmail = async () => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return false;
    try {
      if (!gmailTransporter) {
        const nodemailer = require("nodemailer");
        gmailTransporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000,
          socketTimeout: 10000,
          debug: true,
          logger: true,
        });
      }
      await gmailTransporter.sendMail({
        from: `"Shashank Portfolio" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log("✅ Email sent via Gmail SMTP to:", to);
      return true;
    } catch (err) {
      console.error("❌ Gmail SMTP failed:", err.message);
      errors.push("Gmail: " + err.message);
      return false;
    }
  };

  // Determine priority/execution order
  if (provider === "gmail" || provider === "smtp") {
    if (await tryGmail()) return;
    if (await tryResend()) return;
  } else if (provider === "resend") {
    if (await tryResend()) return;
    if (await tryGmail()) return;
  } else {
    // "auto" (default): try Resend first, fallback to Gmail
    if (await tryResend()) return;
    if (await tryGmail()) return;
  }

  throw new Error("All email methods failed: " + errors.join(" | "));
};

// ── POST /api/resume/request ──────────────────────────────────────────────────
router.post("/request", async (req, res) => {
  try {
    const { name, email, reason } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "Name and email required" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Persist in MongoDB — survives server restarts
    await ResumeRequest.create({
      token,
      name,
      email,
      reason: reason || "Not specified",
      expiresAt,
    });

    // Determine the frontend URL dynamically (defaulting to FRONTEND_URL env if not available)
    let currentFrontendUrl = FRONTEND_URL.replace(/\/$/, "");
    if (req.headers.origin) {
      currentFrontendUrl = req.headers.origin.replace(/\/$/, "");
    } else if (req.headers.referer) {
      try {
        const refUrl = new URL(req.headers.referer);
        currentFrontendUrl = refUrl.origin.replace(/\/$/, "");
      } catch (e) {}
    }

    // Links in the email point to the FRONTEND (React app) — works from any device/phone
    const approveUrl = `${currentFrontendUrl}/resume/approve/${token}`;
    const rejectUrl  = `${currentFrontendUrl}/resume/reject/${token}`;

    await sendEmail({
      to: process.env.GMAIL_USER || process.env.ADMIN_EMAIL,
      subject: `📄 Resume Request from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a192f;color:#ccd6f6;padding:32px;border-radius:12px;">
          <h2 style="color:#64ffda;">Resume Download Request</h2>
          <table style="width:100%;margin:16px 0;">
            <tr><td style="color:#8892b0;padding:6px 0;">👤 Name</td><td style="color:#ccd6f6;font-weight:bold;">${name}</td></tr>
            <tr><td style="color:#8892b0;padding:6px 0;">📧 Email</td><td style="color:#64ffda;">${email}</td></tr>
            <tr><td style="color:#8892b0;padding:6px 0;">💼 Reason</td><td style="color:#ccd6f6;">${reason || "Not specified"}</td></tr>
            <tr><td style="color:#8892b0;padding:6px 0;">🕐 Time</td><td style="color:#ccd6f6;">${new Date().toLocaleString()}</td></tr>
          </table>
          <hr style="border-color:#233554;margin:20px 0;"/>
          <p style="color:#8892b0;">After approving, a download link will be sent to <strong style="color:#64ffda;">${email}</strong></p>
          <div style="margin:24px 0;">
            <a href="${approveUrl}" style="display:inline-block;padding:14px 32px;background:#64ffda;color:#0a192f;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;margin-right:12px;">✅ Approve</a>
            <a href="${rejectUrl}"  style="display:inline-block;padding:14px 28px;color:#ff6b6b;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;border:1px solid #ff6b6b;">❌ Reject</a>
          </div>
          <p style="color:#8892b0;font-size:12px;">Expires in 24 hours.</p>
        </div>`,
    });

    res.json({ message: "Request sent!", token });
  } catch (err) {
    console.error("Resume request error:", err.message);
    res.status(500).json({ error: "Failed to send request.", detail: err.message });
  }
});

// ── GET /api/resume/approve/:token ────────────────────────────────────────────
router.get("/approve/:token", async (req, res) => {
  try {
    const request = await ResumeRequest.findOne({ token: req.params.token });

    if (!request) {
      return res.status(404).json({ error: "Link is invalid or expired." });
    }

    if (Date.now() > request.expiresAt.getTime()) {
      await ResumeRequest.deleteOne({ token: req.params.token });
      return res.status(410).json({ error: "This approval link expired after 24 hours." });
    }

    if (request.approved) {
      return res.status(200).json({ alreadyApproved: true, message: `This request from ${request.name} was already approved.` });
    }

    // Mark approved
    request.approved = true;
    await request.save();

    // Use BACKEND_URL env var (set in Render dashboard) as the authoritative source.
    // Fallback: reconstruct from request headers (trust proxy must be enabled).
    let currentBackendUrl = BACKEND_URL.replace(/\/$/, "");
    if (!currentBackendUrl || currentBackendUrl.includes("localhost")) {
      // Running locally or BACKEND_URL not set in production — use request headers
      const host = req.get("host");
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      currentBackendUrl = `${protocol}://${host}`;
    }
    const downloadUrl = `${currentBackendUrl}/api/resume/download/${req.params.token}`;

    // Send download link to the user
    let emailSent = false;
    let emailError = "";
    try {
      await sendEmail({
        to: request.email,
        subject: `✅ Your Resume Download is Ready — Shashank Naik`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a192f;color:#ccd6f6;padding:32px;border-radius:12px;border:1px solid #233554;">
          <div style="text-align:center;margin-bottom:20px;">
            <span style="font-size:48px;">✅</span>
          </div>
          <h2 style="color:#64ffda;text-align:center;">Resume Access Approved!</h2>
          <p style="color:#ccd6f6;">Hi <strong>${request.name}</strong>,</p>
          <p style="color:#8892b0;line-height:1.6;">
            Shashank has approved your resume download request.
            Click the button below to download directly.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${downloadUrl}"
               style="display:inline-block;padding:16px 40px;background:#64ffda;color:#0a192f;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
              📄 Download Resume Now
            </a>
          </div>
          <div style="background:#112240;border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="color:#8892b0;font-size:13px;margin:0 0 8px;">⚠️ Expires in 24 hours. If button doesn't work, use this link:</p>
            <p style="color:#64ffda;font-size:12px;word-break:break-all;margin:0;">${downloadUrl}</p>
          </div>
          <hr style="border-color:#233554;margin:20px 0;"/>
          <p style="color:#8892b0;font-size:13px;text-align:center;">
            Contact: <a href="mailto:shashankng626@gmail.com" style="color:#64ffda;">shashankng626@gmail.com</a>
            | <a href="https://www.linkedin.com/in/shashank-naik-6b449428a" style="color:#64ffda;">LinkedIn</a>
          </p>
        </div>`,
      });
      emailSent = true;
      console.log("✅ Approval email sent to:", request.email);
    } catch (err) {
      emailError = err.message;
      console.error("❌ Could not send email to user:", err.message);
    }

    // Return JSON — the React frontend page displays the result
    return res.json({
      success: true,
      name: request.name,
      email: request.email,
      emailSent,
      emailError: emailSent ? null : emailError,
      downloadUrl: emailSent ? null : downloadUrl,
    });
  } catch (err) {
    console.error("Approve error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ── GET /api/resume/reject/:token ─────────────────────────────────────────────
router.get("/reject/:token", async (req, res) => {
  try {
    const request = await ResumeRequest.findOne({ token: req.params.token });
    if (!request) {
      return res.status(404).json({ error: "Already handled or not found." });
    }
    await ResumeRequest.deleteOne({ token: req.params.token });
    // Return JSON — React frontend displays the result
    return res.json({ success: true, rejected: true, name: request.name, email: request.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/resume/status/:token ─────────────────────────────────────────────
router.get("/status/:token", async (req, res) => {
  try {
    const request = await ResumeRequest.findOne({ token: req.params.token });
    if (!request) return res.json({ status: "expired" });
    if (Date.now() > request.expiresAt.getTime()) return res.json({ status: "expired" });
    if (request.approved) return res.json({ status: "approved" });
    return res.json({ status: "pending" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const DEFAULT_RESUME_CONTENT = `================================================================================
SHASHANK GANAPATI NAIK
Full Stack Developer | AI & Machine Learning Enthusiast
Email: shashankng626@gmail.com | Phone: +91 94838 46226
LinkedIn: https://www.linkedin.com/in/shashank-naik-6b449428a
GitHub: https://github.com/ShashankGanapatiNaik
LeetCode: https://leetcode.com/u/shashanknaik6226/
================================================================================

SUMMARY
Motivated Computer Science and Engineering student with strong skills in full-stack development, 
data structures, and machine learning. Experienced in building scalable web applications using 
React.js, Node.js, and MongoDB. Passionate about developing AI-powered solutions.

EDUCATION
- Bachelor of Technology (B.Tech) – Computer Science and Engineering
  Reva University, Bangalore (2023 – Present) | CGPA: 9.41 / 10
- Pre-University Course (PUC) – Science
  Government PU College Idagunji, Uttara Kannada (2021 – 2023) | 90.47%

TECHNICAL SKILLS
- Programming Languages: Java, JavaScript, Python, C
- Frontend: React.js, HTML5, CSS3, Tailwind CSS
- Backend & DB: Node.js, Express.js, FastAPI, REST APIs, MongoDB, MySQL
- AI & Data: Machine Learning, Deep Learning, NLP, PySpark, OpenCV
- Developer Tools: Git, GitHub, JWT Auth, Docker

PROJECTS
1. AI Interview Behavior Analyzer (React, Node, FastAPI, Python, DeepFace, OpenCV)
   - Real-time behavioral insights and facial emotion analysis for interview candidates.
2. Energy Consumption Forecasting (PySpark, Machine Learning, Python, Big Data)
   - Processed millions of smart meter data points to forecast electricity usage.
3. Food Delivery Web Application (React, Node, MongoDB, Express, Stripe, JWT)
   - Full-stack online ordering system with real-time order processing.
4. Movie Recommendation System (Python, Machine Learning, Streamlit, Scikit-learn)
   - Content-based filtering recommendation engine deployed on Streamlit.
================================================================================`;

// ── GET /api/resume/download/:token & /api/resume/download ────────────────────
router.get(["/download/:token", "/download"], async (req, res) => {
  try {
    const token = req.params.token;
    if (token) {
      const request = await ResumeRequest.findOne({ token });
      if (request && !request.approved && Date.now() <= request.expiresAt.getTime()) {
        request.approved = true;
        await request.save().catch(() => {});
      }
    }

    const resume = await Resume.findOne({ active: true }).sort({ uploadedAt: -1 });
    if (resume && resume.data) {
      res.set("Content-Type", resume.contentType || "application/pdf");
      res.set("Content-Disposition", `attachment; filename="${resume.originalName || "Shashank_Ganapati_Naik_Resume.pdf"}"`);
      return res.send(resume.data);
    }

    // Fallback: Default Resume content if no PDF uploaded in admin yet
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.set("Content-Disposition", 'attachment; filename="Shashank_Ganapati_Naik_Resume.txt"');
    return res.send(DEFAULT_RESUME_CONTENT);
  } catch (err) {
    res.status(500).send(htmlPage("Download Error", err.message, "#ff6b6b"));
  }
});

// ── GET /api/resume ───────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const resume = await Resume.findOne({ active: true }).sort({ uploadedAt: -1 });
    if (resume && resume.data) {
      res.set("Content-Type", resume.contentType || "application/pdf");
      res.set("Content-Disposition", `attachment; filename="${resume.originalName || "Shashank_Ganapati_Naik_Resume.pdf"}"`);
      return res.send(resume.data);
    }
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.set("Content-Disposition", 'attachment; filename="Shashank_Ganapati_Naik_Resume.txt"');
    return res.send(DEFAULT_RESUME_CONTENT);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/resume (admin upload) ──────────────────────────────────────────
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
    res.status(201).json({ message: "Resume uploaded!", id: resume._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function htmlPage(title, message, color) {
  return `<!DOCTYPE html><html><head><title>${title}</title>
  <style>body{font-family:Arial,sans-serif;background:#0a192f;color:#ccd6f6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
  .box{text-align:center;padding:48px;background:#112240;border-radius:12px;border:1px solid #233554;max-width:480px;width:90%;}
  h1{color:${color};}p{color:#8892b0;line-height:1.6;}a{color:#64ffda;text-decoration:none;}</style></head>
  <body><div class="box"><h1>${title}</h1><p>${message}</p><br/>
  <a href="${FRONTEND_URL}">← Back to Portfolio</a></div></body></html>`;
}

module.exports = router;
