const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');
const { schemas, validate } = require('../validation');
const supabase = require('../supabase');

// Fleet management is vendor-only.
router.use(authenticateToken, requireRole('vendor'));

// GET drivers — this vendor's fleet only.
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('drivers').select('*').eq('vendor_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE driver
router.post('/', validate(schemas.driver), async (req, res) => {
  // Map camelCase fields from frontend to snake_case for DB
  const driver = {
    vendor_id: req.user.id,
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

// UPDATE driver (own fleet only). Previously this sent the request body
// straight to `.update()` — but the client sends camelCase
// (`vehicleType`) while the columns are snake_case (`vehicle_type`), so
// updates against a real database would fail on an unrecognised column.
// This mirrors the same mapping already used on create.
router.put('/:id', validate(schemas.driverUpdate), async (req, res) => {
  const b = req.body;
  const updateFields = {};
  if (b.name !== undefined) updateFields.name = b.name;
  if (b.dateOfJoining !== undefined) updateFields.date_of_joining = b.dateOfJoining;
  if (b.vehicleType !== undefined) updateFields.vehicle_type = b.vehicleType;
  if (b.vehicleNumber !== undefined) updateFields.vehicle_number = b.vehicleNumber;
  if (b.pan !== undefined) updateFields.pan = b.pan;
  if (b.aadhar !== undefined) updateFields.aadhar = b.aadhar;
  if (b.license !== undefined) updateFields.license = b.license;
  if (b.contact !== undefined) updateFields.contact = b.contact;
  if (b.email !== undefined) updateFields.email = b.email;
  if (b.address !== undefined) updateFields.address = b.address;
  if (b.salary !== undefined) updateFields.salary = b.salary;
  if (b.department !== undefined) updateFields.department = b.department;
  if (b.accountNumber !== undefined) updateFields.account_number = b.accountNumber;
  if (b.ifscCode !== undefined) updateFields.ifsc_code = b.ifscCode;

  const { data, error } = await supabase
    .from('drivers')
    .update(updateFields)
    .eq('id', req.params.id)
    .eq('vendor_id', req.user.id)
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// DELETE driver (own fleet only).
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('drivers')
    .delete()
    .eq('id', req.params.id)
    .eq('vendor_id', req.user.id)
    .select('id');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
