# Cab Booking Backend API

## How to Run

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   node index.js
   ```

The API will run on http://localhost:4000

## Endpoints
- `GET /api/bookings` – List bookings
- `POST /api/bookings` – Create booking
- `PUT /api/bookings/:id` – Update booking
- `DELETE /api/bookings/:id` – Delete booking

(Similar endpoints for `/api/drivers`, `/api/vehicles`, `/api/invoices`)
