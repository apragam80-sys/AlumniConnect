const express = require('express');
const router = express.Router();
const Alumni = require('../models/Alumni');

// GET /api/match?skills=X,Y,Z - Returns ranked mentor matches based on Jaccard Similarity
router.get('/', async (req, res) => {
  try {
    const skillsQuery = req.query.skills || '';
    
    // Parse query skills: split by comma, trim, lowercase, filter out empty values
    const querySkills = skillsQuery
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    // Fetch all alumni
    const alumni = await Alumni.find({});

    if (querySkills.length === 0) {
      // If no search skills provided, return all alumni with 0% match percentage
      const result = alumni.map(al => {
        const alumniObj = al.toObject();
        alumniObj.matchPercentage = 0;
        alumniObj.matchedSkills = [];
        return alumniObj;
      });
      return res.json(result);
    }

    const querySet = new Set(querySkills);

    const ranked = alumni.map(al => {
      const alumniObj = al.toObject();
      const alSkills = al.skills || [];
      
      // Create a set of lowercase skills for case-insensitive matching
      const alSet = new Set(alSkills.map(s => s.trim().toLowerCase()).filter(Boolean));

      if (alSet.size === 0) {
        alumniObj.matchPercentage = 0;
        alumniObj.matchedSkills = [];
        return alumniObj;
      }

      // Intersection (common skills)
      const intersection = new Set([...querySet].filter(x => alSet.has(x)));
      
      // Union (all unique skills between query and alumnus)
      const union = new Set([...querySet, ...alSet]);

      // Jaccard similarity score
      const jaccard = union.size === 0 ? 0 : (intersection.size / union.size);
      
      // Match percentage
      alumniObj.matchPercentage = Math.round(jaccard * 100);

      // Find original casing of matched skills from the alumnus's skills list
      alumniObj.matchedSkills = alSkills.filter(s => querySet.has(s.trim().toLowerCase()));

      return alumniObj;
    });

    // Sort descending by matchPercentage
    ranked.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate mentor matches: ' + error.message });
  }
});

module.exports = router;
