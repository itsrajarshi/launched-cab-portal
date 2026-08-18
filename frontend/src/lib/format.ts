import type { Booking } from "./types";
import { saveAs } from "file-saver";

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
}

export function safeTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const t = new Date(dateStr).getTime();
  return isNaN(t) ? 0 : t;
}

export function escapeCsv(value: unknown): string {
  const s = value === undefined || value === null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportBookingsCsv(bookings: Booking[]): void {
  const headers = [
    "ID",
    "Guest",
    "Date",
    "Pickup",
    "Drop",
    "Category",
    "Status",
    "Driver",
    "Vehicle Type",
    "Vehicle Number",
    "Location",
    "Contact",
    "Company",
    "Total Amount",
  ];
  const rows = bookings.map((b) => [
    b.id,
    b.guest,
    b.date,
    b.pickup,
    b.drop,
    b.category,
    b.status,
    b.driver,
    b.vehicleType,
    b.vehicleNumber,
    b.location,
    b.contact,
    b.company,
    b.totalAmount,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
}