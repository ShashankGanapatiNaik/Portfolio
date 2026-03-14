const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Profile } = require("../models");
const auth = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

// GET profile (public)
router.get("/", async (req, res) => {
  try {
    const profile = await Profile.findOne().select("-profileImage");
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET profile photo (public)
router.get("/photo", async (req, res) => {
  try {
    const profile = await Profile.findOne().select("profileImage");
    if (!profile?.profileImage?.data) {
      return res.status(404).json({ error: "No profile photo found" });
    }
    res.set("Content-Type", profile.profileImage.contentType);
    res.set("Cache-Control", "public, max-age=86400"); // cache 24h
    res.send(profile.profileImage.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST update profile (admin)
router.post("/", auth, async (req, res) => {
  try {
    const existing = await Profile.findOne();
    let profile;
    if (existing) {
      profile = await Profile.findByIdAndUpdate(existing._id, req.body, {
        new: true,
      });
    } else {
      profile = await Profile.create(req.body);
    }
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST upload profile photo (admin)
router.post("/photo", auth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const existing = await Profile.findOne();
    const photoData = {
      profileImage: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    };

    if (existing) {
      await Profile.findByIdAndUpdate(existing._id, photoData);
    } else {
      await Profile.create(photoData);
    }

    res.json({ message: "Profile photo uploaded successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
