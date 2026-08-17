const { port: PORT, corsOrigins } = require('./config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '1mb' }));

// Rate limit auth endpoints to mitigate brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/', (req, res) => {
  res.send('Cab Booking API is running');
});

// Bookings API
app.use('/api/bookings', require('./routes/bookings'));
// Drivers API
app.use('/api/drivers', require('./routes/drivers'));
// Vehicles API
app.use('/api/vehicles', require('./routes/vehicles'));
// Invoices API
app.use('/api/invoices', require('./routes/invoices'));
// Auth API
app.use('/api/auth', authLimiter, require('./routes/auth'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
