"use client";
import { useState } from "react";
import { createBooking } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface ManualBooking {
  guest: string;
  date: string;
  pickup: string;
  drop: string;
  category: string;
  contact: string;
  notes?: string;
}

export default function ManualBookingPage() {
  const { user } = useAuth();
  if (user?.role !== "vendor") {
    return <div className="max-w-xl mx-auto mt-16 text-center text-red-500 text-lg font-semibold">Not authorized. Only vendors can add manual bookings.</div>;
  }

  const [form, setForm] = useState<Partial<ManualBooking>>({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: { [k: string]: string } = {};
    if (!form.guest) errs.guest = "Guest name required";
    if (!form.date) errs.date = "Date required";
    if (!form.pickup) errs.pickup = "Pickup required";
    if (!form.drop) errs.drop = "Drop required";
    if (!form.category) errs.category = "Category required";
    if (!form.contact) errs.contact = "Contact required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setError(Object.values(errs).join(", "));
      return;
    }
    setLoading(true);
    try {
      await createBooking({ ...form, source: "manual", status: "upcoming" });
      setSuccess(true);
      setForm({});
    } catch (err: any) {
      setError("Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Manual Booking</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input className="w-full border rounded px-3 py-2" placeholder="Guest Name" value={form.guest || ""} onChange={e => setForm(f => ({ ...f, guest: e.target.value }))} />
        <input className="w-full border rounded px-3 py-2" placeholder="Date" type="date" value={form.date || ""} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <input className="w-full border rounded px-3 py-2" placeholder="Pickup Location" value={form.pickup || ""} onChange={e => setForm(f => ({ ...f, pickup: e.target.value }))} />
        <input className="w-full border rounded px-3 py-2" placeholder="Drop Location" value={form.drop || ""} onChange={e => setForm(f => ({ ...f, drop: e.target.value }))} />
        <label className="block text-sm font-medium mb-1" htmlFor="category">Car Category</label>
        <select id="category" className="w-full border rounded px-3 py-2" value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          <option value="">Select Car Category</option>
          <option>Sedan</option>
          <option>Hatchback</option>
          <option>SUV</option>
          <option>Luxury</option>
        </select>
        <input className="w-full border rounded px-3 py-2" placeholder="Contact Number" value={form.contact || ""} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
        <textarea className="w-full border rounded px-3 py-2" placeholder="Notes (optional)" value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>{loading ? "Submitting..." : "Confirm & Add to Upcoming"}</button>
        {success && <div className="text-green-600">Booking added to Upcoming!</div>}
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
