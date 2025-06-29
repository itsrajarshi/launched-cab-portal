# Corporate Cab Booking Platform

## Structure
- `frontend/` – Next.js (TypeScript) + TailwindCSS
- `backend/` – Node.js (Express) API
- `database/` – PostgreSQL/Supabase schema
- `rabbitmq/` – RabbitMQ config
- `docs/` – Documentation

## Features
- Company & Vendor Dashboards with modern, role-based UI
- Real-time booking and notifications via RabbitMQ
- JWT Auth + Role-based Access
- Booking, Trip, Driver, Vehicle, Invoice Management
- Open Market fallback for unassigned bookings
- Glassmorphic, premium UI with dark mode and accessibility
- Persistent booking status and workflow actions for vendors/companies
- Modern navigation, export, and reporting tools

---

See `docs/` for workflow and architecture details.
Updated booking after assign: {id: '6f09076b-ba88-48f6-aa22-f151fe5f3f81', user_id: null, details: null, created_at: '2025-06-25T14:47:50.660461+00:00', category: 'Sedan', …}
C:\Users\Raj\capstone\frontend\src\app\dashboard\bookings\page.tsx:253 Bookings after assign fetch: [{…}]