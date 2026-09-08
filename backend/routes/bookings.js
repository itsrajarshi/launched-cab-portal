const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');
const { schemas, validate } = require('../validation');
const supabase = require('../supabase');
const { publishBookingRequest } = require('../rabbitmq');

// GET bookings — scoped by role, not global. A company sees only the
// bookings it created; a vendor sees the requests it can still act on
// (unassigned pending/open-market) plus whatever is already assigned to it.
router.get('/', authenticateToken, async (req, res) => {
  let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
  query =
    req.user.role === 'company'
      ? query.eq('user_id', req.user.id)
      : query.or(`vendor_id.eq.${req.user.id},status.eq.pending,status.eq.open_market`);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE booking. Companies raise a request (status always starts
// 'pending'); vendors may also create one directly as an offline/manual
// booking, which starts 'upcoming' in their own queue with no company
// owner. Either way, ownership columns are set from the verified token,
// never from the request body.
router.post('/', authenticateToken, requireRole('company', 'vendor'), validate(schemas.booking), async (req, res) => {
  const body = { ...req.body };
  delete body.status;
  delete body.user_id;
  delete body.vendor_id;

  if (req.user.role === 'vendor') {
    body.user_id = null;
    body.vendor_id = req.user.id;
    body.source = 'manual';
    body.status = 'upcoming';
  } else {
    body.user_id = req.user.id;
    body.vendor_id = null;
    body.status = 'pending';
  }

  const { data, error } = await supabase.from('bookings').insert([body]).select('*');
  if (error) return res.status(500).json({ error: error.message });
  const booking = data[0];

  if (req.user.role === 'company') {
    const message = {
      type: 'NEW_BOOKING_REQUEST',
      bookingId: booking.id,
      company: booking.company,
      guest: booking.guest,
      trip: {
        date: booking.date,
        pickup: booking.pickup,
        drop: booking.drop,
        category: booking.category,
      },
      contact: booking.contact,
      createdAt: new Date().toISOString(),
      info: `New booking from ${booking.company} for guest ${booking.guest} (${booking.category}) on ${booking.date}`,
    };
    try {
      await publishBookingRequest(message);
    } catch (e) {
      console.error('RabbitMQ publish error:', e);
    }
  }

  res.status(201).json(booking);
});

// UPDATE booking (company-only, and only the company that created it).
// `schemas.bookingUpdate` allowlists exactly which fields a company may
// change — status, assignment and ownership columns are stripped out
// before validation ever sees them.
router.put('/:id', authenticateToken, requireRole('company'), validate(schemas.bookingUpdate), async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// DELETE booking (company-only, own bookings only).
router.delete('/:id', authenticateToken, requireRole('company'), async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// Place a still-unassigned booking in the open market. The `.eq('status',
// 'pending')` guard is both the state-machine check and the concurrency
// guard: the WHERE clause is evaluated by Postgres as one atomic statement,
// so if two vendors race, only the one whose UPDATE still matches a row
// wins — the other gets zero rows back and a 409.
router.post('/:id/open-market', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'open_market', open_market_placed_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('status', 'pending')
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(409).json({ error: 'Booking is no longer pending' });
  res.json(data[0]);
});

// Accept a booking — either a fresh 'pending' request (the direct
// "Accept & Assign" flow) or one already placed on the open market. Both
// have the same effect: assign this vendor, driver and vehicle, and move
// to 'upcoming'. Same optimistic-concurrency guard as above.
router.post('/:id/accept-open-market', authenticateToken, requireRole('vendor'), validate(schemas.acceptOpenMarket), async (req, res) => {
  const { driver, vehicleType, vehicleNumber } = req.body;
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'upcoming',
      vendor_id: req.user.id,
      accepted_by_vendor: req.user.email,
      driver: driver || null,
      vehicle_type: vehicleType || null,
      vehicle_number: vehicleNumber || null,
      open_market_accepted_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .in('status', ['pending', 'open_market'])
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(409).json({ error: 'Booking has already been accepted by another vendor' });
  res.json(data[0]);
});

// Start trip — only the assigned vendor, only from 'upcoming'.
router.post('/:id/starttrip', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'ongoing', trip_started_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('vendor_id', req.user.id)
    .eq('status', 'upcoming')
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(409).json({ error: 'Trip cannot be started from its current state' });
  res.json(data[0]);
});

// End trip — only the assigned vendor, only from 'ongoing'. Completing the
// booking and creating its invoice both happen here, in one request, so
// there is exactly one point of failure instead of the client having to
// orchestrate two separate calls (the booking used to complete even when
// the follow-up invoice call silently failed, so the trip vanished from
// billing with nothing left to show it). If the invoice insert fails after
// the booking was already marked completed, the booking is rolled back to
// 'ongoing' — a plain UPDATE by primary key, safe to run because this
// handler already established that this vendor owns this booking above —
// so the vendor can just retry ending the trip rather than the completion
// silently standing with no invoice behind it.
router.post('/:id/endtrip', authenticateToken, requireRole('vendor'), validate(schemas.endTrip), async (req, res) => {
  const { amount, km } = req.body;

  const { data: completedRows, error: completeErr } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
      trip_ended_at: new Date().toISOString(),
      total_amount: amount,
      total_km: km ?? null,
    })
    .eq('id', req.params.id)
    .eq('vendor_id', req.user.id)
    .eq('status', 'ongoing')
    .select('*');
  if (completeErr) return res.status(500).json({ error: completeErr.message });
  if (!completedRows.length) {
    return res.status(409).json({ error: 'Trip cannot be ended from its current state' });
  }
  const booking = completedRows[0];

  const { data: invoiceRows, error: invoiceErr } = await supabase
    .from('invoices')
    .insert([
      {
        booking_id: booking.id,
        invoiceNumber: `INV-${booking.id}`,
        company: booking.company,
        amount,
        status: 'received',
        date: booking.date,
        month: typeof booking.date === 'string' ? booking.date.slice(0, 7) : null,
        vendor_id: req.user.id,
        user_id: booking.user_id,
      },
    ])
    .select('*');

  if (invoiceErr) {
    await supabase.from('bookings').update({ status: 'ongoing' }).eq('id', booking.id).eq('vendor_id', req.user.id);
    return res.status(500).json({ error: `Trip ended but invoicing failed: ${invoiceErr.message}` });
  }

  res.json({ booking, invoice: invoiceRows[0] });
});

// Reject/cancel — any vendor may reject a still-unassigned booking; only
// the assigned vendor may cancel one already accepted.
router.post('/:id/reject', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_by: req.user.email, cancelled_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .in('status', ['pending', 'open_market', 'upcoming'])
    .or(`vendor_id.is.null,vendor_id.eq.${req.user.id}`)
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(409).json({ error: 'Booking cannot be rejected from its current state' });
  res.json(data[0]);
});

// GET open market bookings eligible for the vendor (vendor-only).
router.get('/open-market/eligible', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase.from('bookings').select('*').eq('status', 'open_market');
  if (error) return res.status(500).json({ error: error.message });
  const now = new Date();
  // Open-market bookings are visible to all vendors for a 30-minute SLA
  // window, first-come-first-served. A company->vendor association model is a
  // future enhancement; once present, post-window visibility can be scoped to
  // the company's associated vendors.
  const eligible = data.filter((b) => {
    const placedAt = b.open_market_placed_at ? new Date(b.open_market_placed_at) : null;
    if (!placedAt) return false;
    return now.getTime() - placedAt.getTime() < 30 * 60 * 1000;
  });
  res.json(eligible);
});

module.exports = router;
