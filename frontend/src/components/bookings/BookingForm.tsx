"use client";

import { useState } from "react";
import type { Booking } from "@/lib/types";

export default function BookingForm({
  onClose,
  onSubmit,
  initial,
}: {
  onClose: () => void;
  onSubmit: (data: Partial<Booking>) => void;
  initial?: Partial<Booking>;
}) {
  const [form, setForm] = useState<Partial<Booking>>(initial || {});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  function validate() {
    const errs: { [k: string]: string } = {};
    if (!form.guest) errs.guest = "Guest name required";
    if (!form.date) errs.date = "Date required";
    if (!form.pickup) errs.pickup = "Pickup required";
    if (!form.drop) errs.drop = "Drop required";
    if (!form.category) errs.category = "Category required";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit(form);
      onClose();
    }
  }

  const inputClass =
    "w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white dark:border-gray-700";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <input
          className={inputClass}
          placeholder="Guest Name"
          value={form.guest || ""}
          onChange={(e) => setForm((f) => ({ ...f, guest: e.target.value }))}
        />
        {errors.guest && <div className="text-red-500 text-sm">{errors.guest}</div>}
      </div>
      <div>
        <input
          className={inputClass}
          placeholder="Date"
          type="date"
          value={form.date || ""}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        {errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
      </div>
      <div>
        <input
          className={inputClass}
          placeholder="Pickup Location"
          value={form.pickup || ""}
          onChange={(e) => setForm((f) => ({ ...f, pickup: e.target.value }))}
        />
        {errors.pickup && <div className="text-red-500 text-sm">{errors.pickup}</div>}
      </div>
      <div>
        <input
          className={inputClass}
          placeholder="Drop Location"
          value={form.drop || ""}
          onChange={(e) => setForm((f) => ({ ...f, drop: e.target.value }))}
        />
        {errors.drop && <div className="text-red-500 text-sm">{errors.drop}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium">
          Car Category
          <select
            className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-700"
            value={form.category || ""}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">Select</option>
            <option>Sedan</option>
            <option>Hatchback</option>
            <option>SUV</option>
            <option>Luxury</option>
          </select>
        </label>
        {errors.category && <div className="text-red-500 text-sm">{errors.category}</div>}
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}