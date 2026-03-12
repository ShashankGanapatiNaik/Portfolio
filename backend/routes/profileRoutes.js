const express = require('express');
const router = express.Router();
const { Profile } = require('../models');
const auth = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const profile = await Profile.findOne();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const existing = await Profile.findOne();
    let profile;
    if (existing) {
      profile = await Profile.findByIdAndUpdate(existing._id, req.body, { new: true });
    } else {
      profile = await Profile.create(req.body);
    }
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
