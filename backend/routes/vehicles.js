const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');
const supabase = require('../supabase');

// Fleet management is vendor-only.
router.use(authenticateToken, requireRole('vendor'));

// GET all vehicles
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('vehicles').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE vehicle
router.post('/', async (req, res) => {
  // Map camelCase fields from frontend to snake_case for DB
  const vehicle = {
    type: req.body.type,
    plate: req.body.plate,
    model: req.body.model,
    availability: req.body.availability,
    condition: req.body.condition,
    insurance: req.body.insurance,
  };
  const { data, error } = await supabase.from('vehicles').insert([vehicle]).select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// UPDATE vehicle
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase.from('vehicles').update(req.body).eq('id', req.params.id).select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('vehicles').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
