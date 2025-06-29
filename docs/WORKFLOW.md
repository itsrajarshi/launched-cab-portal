# Workflow Overview

## Many-to-Many Relation
Companies ↔ Vendors (multiple associations on both ends).

### 1. Company Dashboard Booking Flow
- Guest/trip details submitted → booking request sent to associated vendors via RabbitMQ.
- Booking status is always persisted in the backend and reflected in real time on all dashboards.

### 2. Vendor Booking Actions
- Accept: Assign driver + vehicle → confirm → added to Upcoming Bookings.
- Reject: Shown in Cancelled Bookings for both vendor & company.
- Open Market: Booking shown to associated vendors for 30 min → then visible to all associated vendors of the company → first accept wins.
- All vendor actions (Accept, Start Trip, End Trip, Reject, Place in Open Market) are performed outside the bookings table, with a dropdown to select booking and visually distinct action buttons.

### 3. Trip Status Updates
- Start Trip: Status = “ongoing” on all dashboards.
- End Trip: Status = “completed” on all dashboards.
- Status changes are persisted and never lost on refresh or tab change.

### 4. Vendor Dashboard Features
- Live Booking Notifications
- Bookings Management (All Bookings Table, Filters, Export)
- Driver Management
- Vehicle Management
- Invoice & Billing
- Custom Info Tables
- Manual Bookings
- Open Market Feature
- Modern, glassmorphic UI with accessibility and dark mode

### 5. Access Control
- Based on region & availability.
- Notifications: Real time when eligible to accept open market bookings.
- Role-based navigation and dashboard views.

---

See main README for tech stack, UI/UX, and deliverables.
