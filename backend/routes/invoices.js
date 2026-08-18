const express = require('express');
const path = require('path');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');
const { schemas, validate } = require('../validation');
const supabase = require('../supabase');

// GET all invoices
router.get('/', authenticateToken, async (req, res) => {
  const { data, error } = await supabase.from('invoices').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE invoice (vendor-only)
router.post('/', authenticateToken, requireRole('vendor'), validate(schemas.invoice), async (req, res) => {
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

// Upload an attachment for an invoice (vendor-only).
// The file is stored in the `invoices` Supabase Storage bucket using the
// service-role client (bypasses storage policies), and the resulting public
// URL is persisted on the invoice row.
router.post(
  '/:id/attachment',
  authenticateToken,
  requireRole('vendor'),
  express.raw({ type: 'application/octet-stream', limit: '10mb' }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const ext = path.extname(req.query.filename || '') || '.bin';
      const objectName = `${id}${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('invoices')
        .upload(objectName, req.body, {
          contentType: req.headers['content-type'] || 'application/octet-stream',
          upsert: true,
        });
      if (uploadErr) return res.status(500).json({ error: uploadErr.message });

      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(objectName);
      const { data: updated, error: upErr } = await supabase
        .from('invoices')
        .update({ fileUrl: urlData.publicUrl })
        .eq('id', id)
        .select('*');
      if (upErr) return res.status(500).json({ error: upErr.message });
      if (!updated.length) return res.status(404).json({ error: 'Invoice not found' });
      res.json(updated[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
