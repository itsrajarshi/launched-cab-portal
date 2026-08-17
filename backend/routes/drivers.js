const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');
const supabase = require('../supabase');

// Fleet management is vendor-only.
router.use(authenticateToken, requireRole('vendor'));

// GET all drivers
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('drivers').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE driver
router.post('/', async (req, res) => {
  // Map camelCase fields from frontend to snake_case for DB
  const driver = {
    name: req.body.name,
    date_of_joining: req.body.dateOfJoining,
    vehicle_type: req.body.vehicleType,
    vehicle_number: req.body.vehicleNumber,
    pan: req.body.pan,
    aadhar: req.body.aadhar,
    license: req.body.license,
    contact: req.body.contact,
    email: req.body.email,
    address: req.body.address,
    salary: req.body.salary,
    department: req.body.department,
    account_number: req.body.accountNumber,
    ifsc_code: req.body.ifscCode,
  };
  const { data, error } = await supabase.from('drivers').insert([driver]).select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// UPDATE driver
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase.from('drivers').update(req.body).eq('id', req.params.id).select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// DELETE driver
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('drivers').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
