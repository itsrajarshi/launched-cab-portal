"use client";

import { ReactNode } from "react";
import EmptyState from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

const thClass =
  "px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
const tdClass = "px-3 py-2 border dark:border-gray-700 dark:text-gray-100";

export default function BookingsTable({
  variant,
  bookings,
  loading,
  actions,
}: {
  variant: "vendor" | "company";
  bookings: Booking[];
  loading: boolean;
  actions?: (booking: Booking) => ReactNode;
}) {
  const colSpan = variant === "company" ? 11 : 9;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
        <thead>
          <tr>
            <th className={thClass}>Guest</th>
            <th className={thClass}>Date</th>
            <th className={thClass}>Pickup</th>
            <th className={thClass}>Drop</th>
            <th className={thClass}>Category</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Driver</th>
            <th className={thClass}>Vehicle</th>
            {variant === "company" && <th className={thClass}>Company</th>}
            {variant === "company" && <th className={thClass}>Total Amount</th>}
            <th className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <EmptyState message="Loading..." colSpan={colSpan} />
          ) : bookings.length === 0 ? (
            <EmptyState message="No bookings found." colSpan={colSpan} />
          ) : (
            bookings.map((booking) => (
              <tr key={booking.id} className="border-b dark:border-gray-700">
                <td className={tdClass}>{booking.guest}</td>
                <td className={tdClass}>{formatDate(booking.date)}</td>
                <td className={tdClass}>{booking.pickup}</td>
                <td className={tdClass}>{booking.drop}</td>
                <td className={tdClass}>{booking.category}</td>
                <td className={tdClass}>
                  <StatusBadge status={booking.status} />
                </td>
                <td className={tdClass}>{booking.driver || "Not assigned"}</td>
                <td className={tdClass}>
                  {booking.vehicleType} - {booking.vehicleNumber}
                </td>
                {variant === "company" && <td className={tdClass}>{booking.company}</td>}
                {variant === "company" && (
                  <td className={tdClass}>₹{booking.totalAmount || "-"}</td>
                )}
                <td className={tdClass}>{actions?.(booking)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}