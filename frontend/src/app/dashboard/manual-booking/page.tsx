"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/Card";
import { createBooking } from "@/lib/api";
import { toast } from "sonner";

interface ManualBooking {
  guest: string;
  date: string;
  pickup: string;
  drop: string;
  category: string;
  contact: string;
  notes?: string;
}

const inputClass =
  "w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700";

export default function ManualBookingPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<Partial<ManualBooking>>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);

  if (user?.role !== "vendor") {
    return <div className="max-w-xl mx-auto mt-16 text-center text-red-500 text-lg font-semibold">Not authorized. Only vendors can add manual bookings.</div>;
  }

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
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await createBooking({ ...form, source: "manual", status: "upcoming" });
      toast.success("Booking added to Upcoming");
      setForm({});
      setErrors({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200">
            ✍️
          </span>
          <div>
            <h1 className="text-2xl font-bold">Manual Booking</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add a booking directly to the upcoming queue
            </p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input className={inputClass} placeholder="Guest Name" value={form.guest || ""} onChange={(e) => setForm((f) => ({ ...f, guest: e.target.value }))} />
            {errors.guest && <div className="text-red-500 text-sm mt-1">{errors.guest}</div>}
          </div>
          <div>
            <input className={inputClass} placeholder="Date" type="date" value={form.date || ""} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            {errors.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
          </div>
          <div>
            <input className={inputClass} placeholder="Pickup Location" value={form.pickup || ""} onChange={(e) => setForm((f) => ({ ...f, pickup: e.target.value }))} />
            {errors.pickup && <div className="text-red-500 text-sm mt-1">{errors.pickup}</div>}
          </div>
          <div>
            <input className={inputClass} placeholder="Drop Location" value={form.drop || ""} onChange={(e) => setForm((f) => ({ ...f, drop: e.target.value }))} />
            {errors.drop && <div className="text-red-500 text-sm mt-1">{errors.drop}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="category">Car Category</label>
            <select id="category" className={inputClass} value={form.category || ""} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="">Select Car Category</option>
              <option>Sedan</option>
              <option>Hatchback</option>
              <option>SUV</option>
              <option>Luxury</option>
            </select>
            {errors.category && <div className="text-red-500 text-sm mt-1">{errors.category}</div>}
          </div>
          <div>
            <input className={inputClass} placeholder="Contact Number" value={form.contact || ""} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
            {errors.contact && <div className="text-red-500 text-sm mt-1">{errors.contact}</div>}
          </div>
          <textarea className={inputClass} placeholder="Notes (optional)" value={form.notes || ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full" disabled={loading}>
            {loading ? "Submitting..." : "Confirm & Add to Upcoming"}
          </button>
        </form>
      </Card>
    </div>
  );
}