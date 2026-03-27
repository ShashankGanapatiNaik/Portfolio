const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const crypto = require('crypto');
const { Resume } = require('../models');
const auth = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const pendingRequests = new Map();
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Email sender — tries multiple methods ─────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const errors = [];

  // Method 1: Resend with verified domain
  if (process.env.RESEND_API_KEY) {
    try {
      const fromAddress = process.env.RESEND_FROM_EMAIL
        ? `Shashank Portfolio <${process.env.RESEND_FROM_EMAIL}>`
        : 'Shashank Portfolio <onboarding@resend.dev>';

      const res = await axios.post(
        'https://api.resend.com/emails',
        { from: fromAddress, to: [to], subject, html },
        {
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      console.log('✅ Email sent via Resend. ID:', res.data?.id);
      return;
    } catch (err) {
      const msg = JSON.stringify(err.response?.data || err.message);
      console.error('❌ Resend failed:', msg);
      errors.push('Resend: ' + msg);
    }
  }

  // Method 2: Gmail SMTP via nodemailer
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
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
      });
      await transporter.sendMail({
        from: `"Shashank Portfolio" <${process.env.GMAIL_USER}>`,
        to, subject, html,
      });
      console.log('✅ Email sent via Gmail SMTP to:', to);
      return;
    } catch (err) {
      console.error('❌ Gmail SMTP failed:', err.message);
      errors.push('Gmail: ' + err.message);
    }
  }

  throw new Error('All email methods failed: ' + errors.join(' | '));
};

// ── POST /api/resume/request ──────────────────────────────────────────────────
router.post('/request', async (req, res) => {
  try {
    const { name, email, reason } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    pendingRequests.set(token, {
      name, email,
      reason: reason || 'Not specified',
      requestedAt: new Date().toISOString(),
      approved: false,
      expiresAt,
    });

    const approveUrl = `${BACKEND_URL}/api/resume/approve/${token}`;
    const rejectUrl = `${BACKEND_URL}/api/resume/reject/${token}`;
    const downloadUrl = `${BACKEND_URL}/api/resume/download/${token}`;

    await sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      subject: `📄 Resume Request from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a192f;color:#ccd6f6;padding:32px;border-radius:12px;">
          <h2 style="color:#64ffda;">Resume Download Request</h2>
          <table style="width:100%;margin:16px 0;">
            <tr><td style="color:#8892b0;padding:6px 0;">👤 Name</td><td style="color:#ccd6f6;font-weight:bold;">${name}</td></tr>
            <tr><td style="color:#8892b0;padding:6px 0;">📧 Email</td><td style="color:#64ffda;">${email}</td></tr>
            <tr><td style="color:#8892b0;padding:6px 0;">💼 Reason</td><td style="color:#ccd6f6;">${reason || 'Not specified'}</td></tr>
            <tr><td style="color:#8892b0;padding:6px 0;">🕐 Time</td><td style="color:#ccd6f6;">${new Date().toLocaleString()}</td></tr>
          </table>
          <hr style="border-color:#233554;margin:20px 0;"/>
          <p style="color:#8892b0;">After approving, a download link will be sent to <strong style="color:#64ffda;">${email}</strong></p>
          <div style="margin:24px 0;">
            <a href="${approveUrl}" style="display:inline-block;padding:14px 32px;background:#64ffda;color:#0a192f;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;margin-right:12px;">✅ Approve</a>
            <a href="${rejectUrl}" style="display:inline-block;padding:14px 28px;color:#ff6b6b;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;border:1px solid #ff6b6b;">❌ Reject</a>
          </div>
          <p style="color:#8892b0;font-size:12px;">Expires in 24 hours.</p>
        </div>`,
    });

    res.json({ message: 'Request sent!', token });
  } catch (err) {
    console.error('Resume request error:', err.message);
    res.status(500).json({ error: 'Failed to send request.', detail: err.message });
  }
});

// ── GET /api/resume/approve/:token ────────────────────────────────────────────
router.get('/approve/:token', async (req, res) => {
  const request = pendingRequests.get(req.params.token);
  if (!request) return res.send(htmlPage('❌ Invalid', 'Link is invalid or expired. Ask user to submit a new request.', '#ff6b6b'));
  if (Date.now() > request.expiresAt) {
    pendingRequests.delete(req.params.token);
    return res.send(htmlPage('⏰ Expired', 'This link expired after 24 hours.', '#ffa116'));
  }

  request.approved = true;
  const downloadUrl = `${BACKEND_URL}/api/resume/download/${req.params.token}`;

  // Try sending email to user
  let emailSent = false;
  let emailError = '';
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
            Click the button below to download directly — no need to visit the portfolio.
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
    console.log('✅ Approval email sent to:', request.email);
  } catch (err) {
    emailError = err.message;
    console.error('❌ Could not send email to user:', err.message);
  }

  // Always show the download link on the approve page so Shashank can manually share if email failed
  res.send(`<!DOCTYPE html>
<html><head><title>✅ Approved</title>
<style>
  body{font-family:Arial,sans-serif;background:#0a192f;color:#ccd6f6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}
  .box{background:#112240;border:1px solid #233554;border-radius:12px;padding:40px;max-width:540px;width:100%;text-align:center;}
  h1{color:#64ffda;margin-bottom:8px;}
  .info{background:#0a192f;border-radius:8px;padding:16px;margin:16px 0;text-align:left;}
  .info p{margin:6px 0;color:#8892b0;font-size:14px;}
  .info strong{color:#ccd6f6;}
  .download-btn{display:inline-block;padding:14px 36px;background:#64ffda;color:#0a192f;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;margin:20px 0;}
  .link-box{background:#0a192f;border:1px solid #64ffda33;border-radius:8px;padding:12px;margin:16px 0;word-break:break-all;font-size:12px;color:#64ffda;text-align:left;}
  .status{padding:10px 16px;border-radius:6px;margin:12px 0;font-size:13px;}
  .success{background:rgba(100,255,218,0.1);border:1px solid rgba(100,255,218,0.3);color:#64ffda;}
  .warning{background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);color:#ff6b6b;}
  a.back{color:#64ffda;font-size:13px;}
</style></head>
<body><div class="box">
  <h1>✅ Resume Approved!</h1>
  <div class="info">
    <p>👤 <strong>${request.name}</strong></p>
    <p>📧 <strong>${request.email}</strong></p>
  </div>

  ${emailSent
    ? `<div class="status success">📧 Download link sent to ${request.email}</div>`
    : `<div class="status warning">⚠️ Email failed (${emailError})<br/>Share the link below manually:</div>`
  }

  <p style="color:#8892b0;font-size:14px;margin:16px 0 8px;">Download link for ${request.name}:</p>
  <div class="link-box">${downloadUrl}</div>

  <a href="${downloadUrl}" class="download-btn">📄 Download Resume</a>

  <br/><br/>
  <a href="${FRONTEND_URL}" class="back">← Back to Portfolio</a>
</div></body></html>`);
});

// ── GET /api/resume/reject/:token ─────────────────────────────────────────────
router.get('/reject/:token', async (req, res) => {
  const request = pendingRequests.get(req.params.token);
  if (!request) return res.send(htmlPage('Already handled', 'Already processed.', '#8892b0'));
  pendingRequests.delete(req.params.token);
  res.send(htmlPage('❌ Rejected', `Request from ${request.name} rejected.`, '#ff6b6b'));
});

// ── GET /api/resume/status/:token ─────────────────────────────────────────────
router.get('/status/:token', (req, res) => {
  const request = pendingRequests.get(req.params.token);
  if (!request) return res.json({ status: 'expired' });
  if (Date.now() > request.expiresAt) return res.json({ status: 'expired' });
  if (request.approved) return res.json({ status: 'approved' });
  return res.json({ status: 'pending' });
});

// ── GET /api/resume/download/:token ──────────────────────────────────────────
router.get('/download/:token', async (req, res) => {
  const request = pendingRequests.get(req.params.token);
  if (!request || !request.approved || Date.now() > request.expiresAt) {
    return res.status(403).send('Access denied or link expired.');
  }
  try {
    const resume = await Resume.findOne({ active: true }).sort({ uploadedAt: -1 });
    if (!resume) return res.status(404).send('Resume not found.');
    res.set('Content-Type', resume.contentType);
    res.set('Content-Disposition', `attachment; filename="${resume.originalName}"`);
    res.send(resume.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/resume ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const resume = await Resume.findOne({ active: true }).sort({ uploadedAt: -1 });
    if (!resume) return res.status(404).json({ error: 'No resume found' });
    res.set('Content-Type', resume.contentType);
    res.set('Content-Disposition', `attachment; filename="${resume.originalName}"`);
    res.send(resume.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/resume (admin upload) ──────────────────────────────────────────
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    await Resume.updateMany({}, { active: false });
    const resume = await Resume.create({
      filename: req.file.fieldname,
      originalName: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      active: true,
    });
    res.status(201).json({ message: 'Resume uploaded!', id: resume._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function htmlPage(title, message, color) {
  return `<!DOCTYPE html><html><head><title>${title}</title>
  <style>body{font-family:Arial,sans-serif;background:#0a192f;color:#ccd6f6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
  .box{text-align:center;padding:48px;background:#112240;border-radius:12px;border:1px solid #233554;max-width:480px;width:90%;}
  h1{color:${color};}p{color:#8892b0;line-height:1.6;}a{color:#64ffda;}</style></head>
  <body><div class="box"><h1>${title}</h1><p>${message}</p><br/>
  <a href="${FRONTEND_URL}">← Back to Portfolio</a></div></body></html>`;
}

module.exports = router;