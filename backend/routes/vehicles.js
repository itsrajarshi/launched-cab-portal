const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');
const { schemas, validate } = require('../validation');
const supabase = require('../supabase');

// Fleet management is vendor-only.
router.use(authenticateToken, requireRole('vendor'));

// GET vehicles — this vendor's fleet only.
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('vehicles').select('*').eq('vendor_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE vehicle
router.post('/', validate(schemas.vehicle), async (req, res) => {
  const vehicle = {
    vendor_id: req.user.id,
    type: req.body.type,
    plate: req.body.plate,
    model: req.body.model,
    availability: req.body.availability,
    condition: req.body.condition,
    insurance: req.body.insurance,
  };
  const { data, error } = await supabase.from('vehicles').insert([vehicle]).select('*');
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'A vehicle with this plate already exists' });
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data[0]);
});

// UPDATE vehicle (own fleet only).
router.put('/:id', validate(schemas.vehicleUpdate), async (req, res) => {
  const { data, error } = await supabase
    .from('vehicles')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('vendor_id', req.user.id)
    .select('*');
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'A vehicle with this plate already exists' });
    return res.status(500).json({ error: error.message });
  }
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// DELETE vehicle (own fleet only).
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', req.params.id)
    .eq('vendor_id', req.user.id)
    .select('id');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
