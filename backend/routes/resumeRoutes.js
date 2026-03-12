// resumeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Resume } = require('../models');
const auth = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET download resume (public)
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

// POST upload resume (admin)
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
    res.status(201).json({ message: 'Resume uploaded successfully', id: resume._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
