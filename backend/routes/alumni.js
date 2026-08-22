const express = require('express');
const router = express.Router();
const Alumni = require('../models/Alumni');

// Helper to clean/parse skills array
const parseSkills = (skillsInput) => {
  if (!skillsInput) return [];
  if (Array.isArray(skillsInput)) {
    return skillsInput.map(s => s.trim()).filter(Boolean);
  }
  if (typeof skillsInput === 'string') {
    return skillsInput.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// GET /api/alumni - Get all alumni
router.get('/', async (req, res) => {
  try {
    const alumni = await Alumni.find({}).sort({ createdAt: -1 });
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alumni profiles: ' + error.message });
  }
});

// POST /api/alumni - Register a new alumnus profile
router.post('/', async (req, res) => {
  try {
    const { name, email, graduationYear, major, currentRole, company, location, linkedIn, bio, skills } = req.body;

    // Validate required fields
    if (!name || !email || !graduationYear || !major || !currentRole || !company || !location) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Check if email already exists
    const existing = await Alumni.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'A profile with this email already exists. Please edit that profile instead.' });
    }

    const cleanedSkills = parseSkills(skills);

    const newAlumni = new Alumni({
      name,
      email,
      graduationYear,
      major,
      currentRole,
      company,
      location,
      linkedIn,
      bio,
      skills: cleanedSkills
    });

    const saved = await newAlumni.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register profile: ' + error.message });
  }
});

// PUT /api/alumni/:id - Update profile by ID
router.put('/:id', async (req, res) => {
  try {
    const { name, email, graduationYear, major, currentRole, company, location, linkedIn, bio, skills } = req.body;

    // Validate required fields
    if (!name || !email || !graduationYear || !major || !currentRole || !company || !location) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Check email uniqueness if email is changing
    const existingEmail = await Alumni.findOne({ email: email.toLowerCase().trim(), _id: { $ne: req.params.id } });
    if (existingEmail) {
      return res.status(400).json({ error: 'Another profile is already using this email.' });
    }

    const cleanedSkills = parseSkills(skills);

    const updated = await Alumni.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        graduationYear,
        major,
        currentRole,
        company,
        location,
        linkedIn,
        bio,
        skills: cleanedSkills
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Alumnus profile not found.' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile: ' + error.message });
  }
});

module.exports = router;
