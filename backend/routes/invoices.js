const express = require('express');
const path = require('path');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');
const { schemas, validate } = require('../validation');
const supabase = require('../supabase');

// GET invoices — a vendor sees the invoices it raised; a company sees the
// invoices raised against its own bookings.
router.get('/', authenticateToken, async (req, res) => {
  let query = supabase.from('invoices').select('*').order('created_at', { ascending: false });
  query = req.user.role === 'vendor' ? query.eq('vendor_id', req.user.id) : query.eq('user_id', req.user.id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE invoice (vendor-only). Ownership columns are set explicitly
// rather than passed through from the body: vendor_id from the token, and
// user_id looked up from the linked booking (if any) so the company that
// raised the trip can see the resulting invoice.
router.post('/', authenticateToken, requireRole('vendor'), validate(schemas.invoice), async (req, res) => {
  const b = req.body;
  let ownerUserId = null;

  if (b.bookingId) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('user_id, vendor_id')
      .eq('id', b.bookingId)
      .single();
    if (booking) {
      if (booking.vendor_id && booking.vendor_id !== req.user.id) {
        return res.status(403).json({ error: 'You are not the vendor assigned to this booking' });
      }
      ownerUserId = booking.user_id;
    }
  }

  const row = {
    booking_id: b.bookingId || null,
    invoiceNumber: b.invoiceNumber,
    company: b.company,
    amount: b.amount,
    status: b.status || 'pending',
    date: b.date,
    month: b.month,
    fileUrl: b.fileUrl,
    vendor_id: req.user.id,
    user_id: ownerUserId,
  };
  const { data, error } = await supabase.from('invoices').insert([row]).select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// UPDATE invoice (vendor-only, own invoices only).
router.put('/:id', authenticateToken, requireRole('vendor'), validate(schemas.invoiceUpdate), async (req, res) => {
  const { data, error } = await supabase
    .from('invoices')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('vendor_id', req.user.id)
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// DELETE invoice (vendor-only, own invoices only).
router.delete('/:id', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', req.params.id)
    .eq('vendor_id', req.user.id)
    .select('id');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// Upload an attachment for an invoice (vendor-only, own invoices only).
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

      const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(objectName);
      const { data: updated, error: upErr } = await supabase
        .from('invoices')
        .update({ fileUrl: urlData.publicUrl })
        .eq('id', id)
        .eq('vendor_id', req.user.id)
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
