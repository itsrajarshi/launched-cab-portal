"use client";

import { useState } from "react";
import { useDrivers, useVehicles } from "@/lib/hooks";

export default function AssignForm({
  onAssign,
  onClose,
}: {
  onAssign: (driver: string, vehicleType: string, vehicleNumber: string) => void;
  onClose: () => void;
}) {
  const { data: drivers = [] } = useDrivers();
  const { data: vehicles = [] } = useVehicles();
  const [driver, setDriver] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAssign(driver, vehicleType, vehicleNumber);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium">
          Driver
          <select
            className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-700"
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
            required
          >
            <option value="">Select</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium">
          Vehicle
          <select
            className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:text-white dark:border-gray-700"
            value={vehicleNumber}
            onChange={(e) => {
              const v = vehicles.find((v) => v.plate === e.target.value);
              setVehicleNumber(e.target.value);
              setVehicleType(v ? v.type : "");
            }}
            required
          >
            <option value="">Select</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.plate}>
                {v.type} - {v.plate}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Assign & Confirm
      </button>
      <button
        type="button"
        className="ml-2 px-4 py-2 rounded border"
        onClick={onClose}
      >
        Cancel
      </button>
    </form>
  );
}