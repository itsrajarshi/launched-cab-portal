// Shared domain types for the Cab Booking Portal.

export type Role = "company" | "vendor";

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: Role;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type BookingStatus =
  | "pending"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "open_market";

// Booking as consumed by the UI (camelCase, snake_case from the API mapped).
// Core fields are always present (empty string when unset) — matches the
// mapper output and how the UI treats them.
export interface Booking {
  id: string;
  guest: string;
  date: string;
  pickup: string;
  drop: string;
  category: string;
  status: BookingStatus;
  driver: string;
  vehicleType: string;
  vehicleNumber: string;
  location: string;
  contact: string;
  company: string;
  referenceName?: string;
  invoiceNumber?: string;
  opKm?: string;
  totalKm?: string;
  pickupTime?: string;
  dropTime?: string;
  tollParking?: string;
  totalAmount?: string;
  fuelOffice?: string;
  fuelCash?: string;
  roadTax?: string;
  expenses?: string;
  advOffice?: string;
  locationLink?: string;
  night?: string;
  assocVendor?: string;
  accepted_by_vendor?: string;
  open_market_placed_at?: string;
  open_market_accepted_at?: string;
  created_at?: string;
}

// Raw booking row from the API (snake_case). Mapped to `Booking` via mapBookingFields.
export interface BookingDTO {
  id: string;
  guest?: string | null;
  date?: string | null;
  pickup?: string | null;
  drop?: string | null;
  category?: string | null;
  status?: string | null;
  driver?: string | null;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
  location?: string | null;
  contact?: string | null;
  company?: string | null;
  reference_name?: string | null;
  invoice_number?: string | null;
  op_km?: string | null;
  total_km?: string | null;
  pickup_time?: string | null;
  drop_time?: string | null;
  toll_parking?: string | null;
  total_amount?: string | null;
  fuel_office?: string | null;
  fuel_cash?: string | null;
  road_tax?: string | null;
  expenses?: string | null;
  adv_office?: string | null;
  location_link?: string | null;
  night?: string | null;
  assoc_vendor?: string | null;
  accepted_by_vendor?: string | null;
  open_market_placed_at?: string | null;
  open_market_accepted_at?: string | null;
  created_at?: string | null;
}

// Payload for creating/updating bookings (camelCase inputs, mapped server-side).
export interface BookingInput {
  guest: string;
  date: string;
  pickup: string;
  drop: string;
  category: string;
  contact?: string;
  company?: string;
  status?: string;
  source?: string;
  notes?: string;
  driver?: string;
  vehicle_type?: string;
  vehicle_number?: string;
}

export interface Driver {
  id: string;
  name: string;
  dateOfJoining: string;
  vehicleType: string;
  vehicleNumber: string;
  pan: string;
  aadhar: string;
  license: string;
  contact: string;
  email: string;
  address: string;
  salary: string;
  department: string;
  accountNumber: string;
  ifscCode: string;
}

export interface DriverDTO {
  id: string;
  name?: string | null;
  date_of_joining?: string | null;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
  pan?: string | null;
  aadhar?: string | null;
  license?: string | null;
  contact?: string | null;
  email?: string | null;
  address?: string | null;
  salary?: string | null;
  department?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
}

export interface DriverInput {
  name: string;
  dateOfJoining?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  pan?: string;
  aadhar?: string;
  license?: string;
  contact?: string;
  email?: string;
  address?: string;
  salary?: string;
  department?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface Vehicle {
  id: string;
  type: string;
  plate: string;
  model: string;
  availability: string;
  condition: string;
  insurance: string;
}

export interface VehicleInput {
  type: string;
  plate: string;
  model: string;
  availability?: string;
  condition?: string;
  insurance?: string;
}

export type InvoiceStatus = "pending" | "received";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  company: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  month: string;
  fileUrl?: string;
}

export interface InvoiceInput {
  invoiceNumber: string;
  company: string;
  amount: number;
  status?: InvoiceStatus;
  date?: string;
  month?: string;
  bookingId?: string;
}
