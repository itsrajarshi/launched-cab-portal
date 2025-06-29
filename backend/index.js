require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Server running on port", PORT);
});
