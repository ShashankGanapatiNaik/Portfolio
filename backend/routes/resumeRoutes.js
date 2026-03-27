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

  // Send download link to YOUR OWN email so you can forward to user
  let emailSent = false;
  let emailError = '';
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      subject: `🔗 Resume Link for ${request.name} (${request.email})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a192f;color:#ccd6f6;padding:32px;border-radius:12px;border:1px solid #233554;">
          <div style="text-align:center;margin-bottom:20px;">
            <span style="font-size:48px;">✅</span>
          </div>
          <h2 style="color:#64ffda;text-align:center;">Resume Download Link</h2>
          <p style="color:#ccd6f6;">You approved a resume request. Forward this link to the requester:</p>
          <table style="width:100%;margin:12px 0;background:#0a192f;border-radius:8px;padding:12px;">
            <tr><td style="color:#8892b0;padding:4px 0;font-size:14px;">👤 Name</td><td style="color:#ccd6f6;font-weight:bold;">${request.name}</td></tr>
            <tr><td style="color:#8892b0;padding:4px 0;font-size:14px;">📧 Email</td><td style="color:#64ffda;">${request.email}</td></tr>
            <tr><td style="color:#8892b0;padding:4px 0;font-size:14px;">💼 Reason</td><td style="color:#ccd6f6;">${request.reason}</td></tr>
          </table>
          <p style="color:#8892b0;font-size:13px;">Forward the button below to <strong style="color:#64ffda;">${request.email}</strong></p>
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

  res.send(`<!DOCTYPE html>
<html><head><title>✅ Approved</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Arial,sans-serif;background:#0a192f;color:#ccd6f6;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}
  .box{background:#112240;border:1px solid #233554;border-radius:16px;padding:36px;max-width:580px;width:100%;}
  .header{text-align:center;margin-bottom:28px;}
  .icon{width:64px;height:64px;border-radius:50%;background:rgba(100,255,218,0.15);border:2px solid #64ffda;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px;}
  h1{color:#64ffda;font-size:1.6rem;margin-bottom:4px;}
  .subtitle{color:#8892b0;font-size:14px;}
  .section{background:#0a192f;border:1px solid #233554;border-radius:10px;padding:16px;margin-bottom:16px;}
  .section-title{color:#64ffda;font-size:11px;font-family:monospace;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;}
  .row{display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;border-bottom:1px solid #233554;}
  .row:last-child{border-bottom:none;}
  .label{color:#8892b0;font-size:13px;min-width:80px;}
  .value{color:#ccd6f6;font-size:13px;text-align:right;word-break:break-all;}
  .value.accent{color:#64ffda;}
  .email-status{border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:13px;display:flex;align-items:center;gap:8px;}
  .email-ok{background:rgba(100,255,218,0.08);border:1px solid rgba(100,255,218,0.25);color:#64ffda;}
  .email-fail{background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.25);color:#ff8a8a;}
  .link-section{background:#0a192f;border:1px solid rgba(100,255,218,0.2);border-radius:10px;padding:16px;margin-bottom:20px;}
  .link-label{color:#64ffda;font-size:11px;font-family:monospace;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;}
  .link-url{color:#a8b2d8;font-size:12px;word-break:break-all;line-height:1.5;font-family:monospace;}
  .copy-hint{color:#8892b0;font-size:11px;margin-top:6px;}
  .download-btn{display:block;width:100%;padding:14px;background:#64ffda;color:#0a192f;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;text-align:center;margin-bottom:12px;}
  .back-link{display:block;text-align:center;color:#8892b0;font-size:13px;text-decoration:none;margin-top:8px;}
  .back-link:hover{color:#64ffda;}
  .divider{border:none;border-top:1px solid #233554;margin:20px 0;}
</style></head>
<body><div class="box">

  <div class="header">
    <div class="icon">✅</div>
    <h1>Resume Approved!</h1>
    <p class="subtitle">Request approved — download link ready</p>
  </div>

  <!-- Requester Details -->
  <div class="section">
    <div class="section-title">📋 Request Details</div>
    <div class="row">
      <span class="label">👤 Name</span>
      <span class="value">${request.name}</span>
    </div>
    <div class="row">
      <span class="label">📧 Email</span>
      <span class="value accent">${request.email}</span>
    </div>
    <div class="row">
      <span class="label">💼 Reason</span>
      <span class="value">${request.reason}</span>
    </div>
    <div class="row">
      <span class="label">🕐 Requested</span>
      <span class="value">${request.requestedAt}</span>
    </div>
  </div>

  <!-- Email Status -->
  ${emailSent
    ? `<div class="status success">📧 Download link sent to YOUR Gmail — forward it to ${request.email}</div>`
    : `<div class="status warning">⚠️ Email failed — copy the link below and send manually to ${request.email}</div>`
  }

  <!-- Resume Download Link -->
  <div class="link-section">
    <div class="link-label">🔗 Resume Download Link</div>
    <div class="link-url">${downloadUrl}</div>
    <div class="copy-hint">⏰ This link expires in 24 hours &nbsp;|&nbsp; Share this with ${request.name} if email failed</div>
  </div>

  <!-- Message to send manually -->
  <div class="section">
    <div class="section-title">💬 Message to share with ${request.name}</div>
    <div style="background:#112240;border-radius:8px;padding:14px;font-size:13px;color:#a8b2d8;line-height:1.8;font-family:monospace;white-space:pre-wrap;margin-bottom:10px;" id="shareMsg">Hi ${request.name},

Shashank has approved your resume download request!

📄 Download Link:
${downloadUrl}

⚠️ This link expires in 24 hours.

Feel free to reach out:
✉️  shashankng626@gmail.com
🔗  linkedin.com/in/shashank-naik-6b449428a</div>
    <button onclick="navigator.clipboard.writeText(document.getElementById('shareMsg').innerText).then(()=>{this.textContent='✅ Copied!';setTimeout(()=>this.textContent='📋 Copy Message',2000)})"
      style="width:100%;padding:10px;background:rgba(100,255,218,0.08);border:1px solid rgba(100,255,218,0.3);border-radius:6px;color:#64ffda;font-size:13px;cursor:pointer;margin-bottom:6px;">
      📋 Copy Message
    </button>
    <button onclick="navigator.clipboard.writeText('${downloadUrl}').then(()=>{this.textContent='✅ Link Copied!';setTimeout(()=>this.textContent='🔗 Copy Link Only',2000)})"
      style="width:100%;padding:10px;background:transparent;border:1px solid #233554;border-radius:6px;color:#8892b0;font-size:13px;cursor:pointer;">
      🔗 Copy Link Only
    </button>
  </div>

  <!-- Download Button -->
  <a href="${downloadUrl}" class="download-btn">📄 Download Resume Now</a>

  <hr class="divider"/>
  <a href="${FRONTEND_URL}" class="back-link">← Back to Portfolio</a>

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