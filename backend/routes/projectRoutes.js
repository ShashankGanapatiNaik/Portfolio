const express = require('express');
const router = express.Router();
const { Project } = require('../models');
const auth = require('../middleware/authMiddleware');

// In-memory cache
const projectsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function clearProjectsCache() {
  projectsCache.clear();
}

// GET all projects (public)
router.get('/', async (req, res) => {
  try {
    const { tech } = req.query;
    const cacheKey = tech ? tech.toLowerCase() : 'all';
    const cached = projectsCache.get(cacheKey);

    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return res.json(cached.data);
    }

    let query = {};
    if (tech && tech !== 'all') {
      query.techStack = { $regex: tech, $options: 'i' };
    }
    const projects = await Project.find(query).sort({ featured: -1, order: 1, createdAt: -1 });

    projectsCache.set(cacheKey, { data: projects, ts: Date.now() });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single project (public)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create project (admin)
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    clearProjectsCache();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update project (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    clearProjectsCache();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE project (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    clearProjectsCache();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

