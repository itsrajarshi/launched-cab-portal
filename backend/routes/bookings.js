const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');
const { schemas, validate } = require('../validation');
const supabase = require('../supabase');
const { publishBookingRequest } = require('../rabbitmq');

// GET all bookings
router.get('/', authenticateToken, async (req, res) => {
  const { data, error } = await supabase.from('bookings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE booking (company-only)
router.post('/', authenticateToken, requireRole('company'), validate(schemas.booking), async (req, res) => {
  const { data, error } = await supabase.from('bookings').insert([req.body]).select('*');
  if (error) return res.status(500).json({ error: error.message });
  // Attractive message format for vendors
  const booking = data[0];
  const message = {
    type: 'NEW_BOOKING_REQUEST',
    bookingId: booking.id,
    company: booking.company,
    guest: booking.guest,
    trip: {
      date: booking.date,
      pickup: booking.pickup,
      drop: booking.drop,
      category: booking.category
    },
    contact: booking.contact,
    createdAt: new Date().toISOString(),
    // Add related vendors here if available, e.g. booking.relatedVendors
    info: `New booking from ${booking.company} for guest ${booking.guest} (${booking.category}) on ${booking.date}`
  };
  try {
    await publishBookingRequest(message);
  } catch (e) {
    console.error('RabbitMQ publish error:', e);
  }
  res.status(201).json(booking);
});

// UPDATE booking (company-only)
router.put('/:id', authenticateToken, requireRole('company'), async (req, res) => {
  // Map camelCase fields from frontend to snake_case for DB
  const updateFields = {};
  if (req.body.driver) updateFields.driver = req.body.driver;
  if (req.body.vehicleType) updateFields.vehicle_type = req.body.vehicleType;
  if (req.body.vehicleNumber) updateFields.vehicle_number = req.body.vehicleNumber;
  // Allow updating other fields as before
  for (const key of Object.keys(req.body)) {
    if (!(key in updateFields)) updateFields[key] = req.body[key];
  }
  const { data, error } = await supabase.from('bookings').update(updateFields).eq('id', req.params.id).select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// DELETE booking (company-only)
router.delete('/:id', authenticateToken, requireRole('company'), async (req, res) => {
  const { error } = await supabase.from('bookings').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// Place booking in open market (vendor-only)
router.post('/:id/open-market', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'open_market', open_market_placed_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// Accept open market booking (with driver/vehicle assignment) — vendor-only
router.post('/:id/accept-open-market', authenticateToken, requireRole('vendor'), validate(schemas.acceptOpenMarket), async (req, res) => {
  const { vendorId, driver, vehicleType, vehicleNumber } = req.body;
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'upcoming',
      accepted_by_vendor: vendorId,
      driver: driver || null,
      vehicle_type: vehicleType || null,
      vehicle_number: vehicleNumber || null,
      open_market_accepted_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// Start trip (vendor-only) — persists only the status transition and timestamp.
router.post('/:id/starttrip', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'ongoing', trip_started_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// End trip (vendor-only)
router.post('/:id/endtrip', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'completed', trip_ended_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*');
  console.log('[DEBUG] /endtrip update result:', data, error); // Debug log
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// Vendor reject/cancel booking (vendor-only)
router.post('/:id/reject', authenticateToken, requireRole('vendor'), async (req, res) => {
  const { user } = req;
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_by: user?.email || 'vendor', cancelled_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Not found' });
  res.json(data[0]);
});

// GET open market bookings eligible for the vendor (vendor-only)
router.get('/open-market/eligible', authenticateToken, requireRole('vendor'), async (req, res) => {
  const user = req.user;
  // Fetch all open market bookings
  const { data, error } = await supabase.from('bookings').select('*').eq('status', 'open_market');
  if (error) return res.status(500).json({ error: error.message });
  const now = new Date();
  // TODO: Replace with real association logic
  // For demo: assume booking.associatedVendors is an array of vendor emails
  const eligible = data.filter(b => {
    const placedAt = b.open_market_placed_at ? new Date(b.open_market_placed_at) : null;
    if (!placedAt) return false;
    const within30 = (now.getTime() - placedAt.getTime()) < 30 * 60 * 1000;
    if (within30 && b.associatedVendors && b.associatedVendors.includes(user.email)) return true;
    // After 30 min, open to all vendors associated with the company
    if (!within30 && b.companyAssociatedVendors && b.companyAssociatedVendors.includes(user.email)) return true;
    return false;
  });
  res.json(eligible);
});

module.exports = router;
