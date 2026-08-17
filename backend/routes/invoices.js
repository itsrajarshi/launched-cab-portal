const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');
const supabase = require('../supabase');

// GET all invoices
router.get('/', authenticateToken, async (req, res) => {
  const { data, error } = await supabase.from('invoices').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE invoice (vendor-only)
router.post('/', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase.from('invoices').insert([req.body]).select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// UPDATE invoice (vendor-only)
router.put('/:id', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase.from('invoices').update(req.body).eq('id', req.params.id).select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// DELETE invoice (vendor-only)
router.delete('/:id', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { error } = await supabase.from('invoices').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
