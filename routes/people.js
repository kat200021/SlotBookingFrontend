const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/people
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('availability') 
    .select('id, person_name');

  if (error) {
    console.error('Error fetching people:', error.message);
    return res.status(500).json({ error: error.message });
  }

  const formatted = data.map((person) => ({
    id: person.id,
    name: person.person_name,
  }));

  res.json(formatted);
});

module.exports = router;
